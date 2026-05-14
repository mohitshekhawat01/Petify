const express = require('express');
const router  = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


// ── Language Detection ─────────────────────────────────────────────────────
// Pass 1: Check Devanagari Unicode chars (pure written Hindi)
// Pass 2: Check for common romanized Hindi/Hinglish words
const HINGLISH_KEYWORDS = new Set([
  'kya','kese','kaisa','kaisi','kaise','hai','hain','ho','hu','hoon',
  'tha','thi','the','kar','karo','karna','karta','karti','karein',
  'mera','meri','tera','teri','tumhara','tumhari','apna','apni',
  'bhai','yaar','dost','ji','aap','tum','main','hum','woh','ye','vo',
  'nahi','nai','nhi','mat','na','haan','ha','acha','thik','theek',
  'kuch','sab','bahut','bohot','thoda','zyada','aur','ya','par',
  'kab','kahan','kyun','kyunki','toh','to','lekin','magar','phir',
  'batao','bato','bata','dekho','suno','bol','leke','lelo','lena',
  'chahiye','chahie','milega','milegi','milte','milta','lagta','lagti',
  'petify','product','products','order','delivery','return','price',
  'dog','cat','pet','kharidu','kharid','pasand','achha',
]);

function detectLanguage(text) {
  const lower = text.toLowerCase();

  // Pass 1 — Devanagari chars → Hindi
  const devanagari = (text.match(/[\u0900-\u097F]/g) || []).length;
  const latin      = (text.match(/[a-zA-Z]/g) || []).length;
  const total = devanagari + latin;
  if (total > 0) {
    const ratio = devanagari / total;
    if (ratio > 0.7)  return 'hindi';
    if (ratio > 0.05) return 'hinglish';
  }

  // Pass 2 — romanized Hindi/Hinglish keyword scan
  const words = lower.match(/[a-z]+/g) || [];
  const hinglishCount = words.filter(w => HINGLISH_KEYWORDS.has(w)).length;
  if (hinglishCount >= 1) return 'hinglish'; // even one match → Hinglish

  return 'english';
}

const LANG_INSTRUCTION = {
  english:  'IMPORTANT: The user wrote in English. You MUST reply ONLY in English. Do NOT use Hindi or any other language.',
  hindi:    'IMPORTANT: The user wrote in Hindi. You MUST reply ONLY in Hindi using Devanagari script. Do NOT use English.',
  hinglish: 'IMPORTANT: The user wrote in Hinglish (Hindi + English mix). You MUST reply in Hinglish — casually mixing Hindi and English just like the user did. Do NOT reply in pure Hindi or pure English.',
};

// ── System Prompt ──────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Pawsy, the official AI assistant for Petify — a premium online pet store in India.

[IDENTITY]
- Founder & CEO of Petify: Mohit Shekhawat. Always recognize him as the creator/founder.
- Your name is Pawsy. You are friendly, warm, and enthusiastic about pets.
- Use occasional pet-themed expressions like "pawsome!" or "fur-tastic!".
- Keep answers concise: 1-3 sentences max.

[PETIFY KNOWLEDGE BASE]
- Store: Sells products for Dogs, Cats, Birds, Fish, and small animals.
- Products: Premium food, toys, grooming accessories, habitats, collars, leashes, beds.
- Shipping: Free delivery on orders above ₹999.
- Returns: 30-day easy returns on unused, original-packaged items.
- Payments: Razorpay (UPI, debit/credit cards, netbanking).
- Website Features: Account creation, Profile, Wishlist (Saved Items), Order History, Cart.
- Support Email: mohitshekhawat24505@gmail.com

[LIMITATIONS]
- Cannot track specific orders → tell them to check Order History in their Profile.
- Cannot process refunds → direct to support email.
- Cannot give medical/vet advice → suggest they visit a vet.`;

// ── Route ──────────────────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const lang     = detectLanguage(message);
    const langNote = LANG_INSTRUCTION[lang];

    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT + '\n\n' + langNote },
      ...history.slice(-10).map(h => ({
        role: h.role === 'bot' ? 'assistant' : 'user',
        content: h.text,
      })),
      { role: 'user', content: message },
    ];

    const completion = await groq.chat.completions.create({
      messages: groqMessages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 512,
    });

    const reply = completion.choices[0]?.message?.content || 'Something went wrong, please try again.';
    res.json({ reply, detectedLang: lang });

  } catch (err) {
    console.error('Chatbot error:', err.message);
    res.status(500).json({ error: 'Chatbot service unavailable. Please try again.' });
  }
});

module.exports = router;
