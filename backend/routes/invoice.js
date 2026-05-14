const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, optionalProtect } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

const generateInvoicePDF = (order, doc) => {
  // Brand Header
  doc.rect(0, 0, 600, 80).fill('#4a2810');
  doc.fillColor('#c9973a').font('Helvetica-Bold').fontSize(26).text(' PETIFY', 40, 25);
  doc.fillColor('#fdf9f3').fontSize(12).text('Luxury Pet Boutique', 40, 55);

  doc.fillColor('#c9973a').fontSize(20).text('INVOICE', 400, 25, { align: 'right' });
  doc.fillColor('#fdf9f3').fontSize(10).text(`Order #${order._id}`, 400, 50, { align: 'right' });
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 65, { align: 'right' });

  // Reset colors
  doc.fillColor('#000000');

  // Addresses
  doc.fontSize(12).font('Helvetica-Bold').text('BILL TO', 40, 110);
  doc.font('Helvetica').fontSize(10);
  doc.text(order.address.fullName, 40, 125);
  doc.text(order.address.email, 40, 140);
  doc.text(order.address.phone, 40, 155);
  doc.text(`${order.address.line1}, ${order.address.city}, ${order.address.state} ${order.address.pincode}`, 40, 170);

  doc.fontSize(12).font('Helvetica-Bold').text('ORDER DETAILS', 300, 110);
  doc.font('Helvetica').fontSize(10);
  doc.text(`Status: ${order.status.toUpperCase()}`, 300, 125);
  doc.text(`Payment: ${order.payment.status.toUpperCase()}`, 300, 140);
  if (order.payment.razorpayPaymentId) {
    doc.text(`Txn ID: ${order.payment.razorpayPaymentId}`, 300, 155);
  }

  // Items Table Header
  const tableTop = 230;
  doc.rect(40, tableTop, 520, 25).fill('#4a2810');
  doc.fillColor('#c9973a').font('Helvetica-Bold').fontSize(10);
  doc.text('ITEM', 50, tableTop + 8);
  doc.text('QTY', 350, tableTop + 8);
  doc.text('PRICE', 420, tableTop + 8);
  doc.text('TOTAL', 500, tableTop + 8);

  // Items
  let y = tableTop + 30;
  doc.fillColor('#000000').font('Helvetica');
  
  let subtotal = 0;
  
  order.items.forEach((item, i) => {
    // zebra coloring could go here
    doc.text(`${item.emoji || ''} ${item.name}`, 50, y);
    doc.text(item.qty.toString(), 350, y);
    doc.text(`Rs ${item.price}`, 420, y);
    const lineTotal = item.qty * item.price;
    subtotal += lineTotal;
    doc.text(`Rs ${lineTotal}`, 500, y);
    y += 25;
  });

  // Totals
  doc.moveTo(40, y).lineTo(560, y).stroke();
  y += 15;
  
  doc.font('Helvetica-Bold');
  const delivery = subtotal > 999 ? 0 : 99;
  const gst = subtotal * 0.18;
  const grandTotal = subtotal + delivery + gst;

  doc.text('Subtotal:', 400, y);
  doc.text(`Rs ${subtotal.toFixed(2)}`, 500, y);
  y += 20;
  
  doc.text('Delivery:', 400, y);
  doc.text(delivery === 0 ? 'FREE' : `Rs ${delivery}`, 500, y);
  y += 20;

  doc.text('GST (18%):', 400, y);
  doc.text(`Rs ${gst.toFixed(2)}`, 500, y);
  y += 20;

  doc.rect(380, y, 180, 25).fill('#4a2810');
  doc.fillColor('#c9973a').font('Helvetica-Bold');
  doc.text('GRAND TOTAL:', 390, y + 8);
  doc.text(`Rs ${Math.round(grandTotal)}`, 500, y + 8);

  // Footer
  doc.fillColor('#c9973a');
  doc.moveTo(40, 700).lineTo(560, 700).stroke();
  doc.text('Thank you for shopping with Petify! ', 40, 715, { align: 'center' });
};

// @route   GET /api/invoice/download/:orderId
// @desc    Download PDF invoice
// @access  Public (Guest or Logged In)
router.get('/download/:orderId', optionalProtect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('user');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Restrict access if the order belongs to a registered user and the request is not from that user
    if (order.user && (!req.user || order.user._id.toString() !== req.user._id.toString())) {
      return res.status(401).json({ message: 'Unauthorized access to invoice' });
    }

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-disposition', `attachment; filename=Invoice-${order._id}.pdf`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    generateInvoicePDF(order, doc);
    doc.end();

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/invoice/email/:orderId
// @desc    Email PDF invoice
// @access  Public (Guest or Logged In)
router.post('/email/:orderId', optionalProtect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('user');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Restrict access if the order belongs to a registered user and the request is not from that user
    if (order.user && (!req.user || order.user._id.toString() !== req.user._id.toString())) {
      return res.status(401).json({ message: 'Unauthorized access to invoice email' });
    }

    const doc = new PDFDocument({ margin: 40 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"Petify" <${process.env.EMAIL_USER}>`,
        to: order.address.email,
        subject: `Your Petify Order Confirmation #${order._id}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #4a2810; padding: 20px; text-align: center;">
              <h1 style="color: #c9973a; margin: 0;">PETIFY</h1>
              <p style="color: #fdf9f3; margin: 5px 0 0;">Luxury Pet Boutique</p>
            </div>
            <div style="padding: 20px; background-color: #fdf9f3;">
              <h2 style="color: #4a2810;">Order Confirmed!</h2>
              <p>Hi ${order.address.fullName},</p>
              <p>Thank you for your order! We'll start preparing it right away. Attached is your official invoice.</p>
              <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Order ID:</strong> #${order._id}</p>
                <p><strong>Total:</strong> Rs ${order.total}</p>
                <p><strong>Expected Delivery:</strong> 3-5 Business Days</p>
              </div>
            </div>
            <div style="background-color: #4a2810; padding: 15px; text-align: center;">
              <p style="color: #c9973a; margin: 0;">🐾🐾🐾</p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `Invoice-${order._id}.pdf`,
            content: pdfData,
          },
        ],
      };

      try {
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Email sent successfully' });
      } catch (err) {
        console.error("Email Sending Error:", err.message || err);
        res.status(500).json({ message: 'Error sending email', error: err.message });
      }
    });

    generateInvoicePDF(order, doc);
    doc.end();

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
