// Petify AI Chatbot Widget — Pawsy 🐾
(function () {
    const API_BASE = 'http://localhost:5000/api';
    let chatHistory = [];
    let isOpen = false;
    let isTyping = false;

    // ── Styles ────────────────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

        #pawsy-wrap * { box-sizing: border-box; font-family: 'Inter', sans-serif; }

        /* Bubble */
        #pawsy-bubble {
            position: fixed; bottom: 28px; right: 28px; z-index: 9998;
            width: 60px; height: 60px; border-radius: 50%;
            background: linear-gradient(145deg, #3d1f08, #c9973a);
            border: none; cursor: pointer;
            box-shadow: 0 4px 24px rgba(74,40,16,0.40), 0 0 0 0 rgba(201,151,58,0.4);
            display: flex; align-items: center; justify-content: center;
            font-size: 26px; transition: transform 0.3s, box-shadow 0.3s;
            animation: pawsyBounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1);
        }
        #pawsy-bubble:hover {
            transform: scale(1.1);
            box-shadow: 0 8px 32px rgba(74,40,16,0.50), 0 0 0 8px rgba(201,151,58,0.12);
        }
        #pawsy-bubble .p-badge {
            position: absolute; top: -3px; right: -3px;
            width: 18px; height: 18px; background: #e53935;
            border-radius: 50%; border: 2px solid #fff;
            font-size: 10px; color: #fff; font-weight: 700;
            display: flex; align-items: center; justify-content: center;
            animation: pawsyPop 0.4s ease;
        }
        @keyframes pawsyBounceIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes pawsyPop { from{transform:scale(0)} to{transform:scale(1)} }

        /* Panel */
        #pawsy-panel {
            position: fixed; bottom: 100px; right: 28px; z-index: 9999;
            width: 370px; max-height: 580px;
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 24px 64px rgba(20,10,4,0.20), 0 2px 8px rgba(74,40,16,0.08);
            border: 1px solid rgba(201,151,58,0.15);
            display: flex; flex-direction: column; overflow: hidden;
            transform: scale(0.88) translateY(24px); opacity: 0; pointer-events: none;
            transition: transform 0.4s cubic-bezier(0.34,1.4,0.64,1), opacity 0.28s ease;
            transform-origin: bottom right;
        }
        #pawsy-panel.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }

        /* Header */
        #pawsy-hdr {
            background: linear-gradient(135deg, #2b1106 0%, #5a2510 55%, #c9973a 100%);
            padding: 14px 16px; display: flex; align-items: center; gap: 12px;
            flex-shrink: 0;
        }
        .p-hdr-avatar {
            width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
            background: rgba(255,255,255,0.12);
            border: 2px solid rgba(255,255,255,0.22);
            display: flex; align-items: center; justify-content: center;
            font-size: 20px;
        }
        .p-hdr-info { flex: 1; min-width: 0; }
        .p-hdr-name { color: #fff; font-size: 14px; font-weight: 600; letter-spacing: 0.15px; }
        .p-hdr-sub  { color: rgba(255,255,255,0.65); font-size: 11px; margin-top: 2px; display: flex; align-items: center; gap: 5px; }
        .p-online   { width: 7px; height: 7px; background: #4caf50; border-radius: 50%; flex-shrink: 0; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(76,175,80,0.5)} 50%{box-shadow:0 0 0 4px rgba(76,175,80,0)} }
        #pawsy-close-btn {
            width: 32px; height: 32px; border-radius: 50%; border: none;
            background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.8);
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            font-size: 15px; flex-shrink: 0; transition: background 0.2s, color 0.2s;
        }
        #pawsy-close-btn:hover { background: rgba(255,255,255,0.22); color: #fff; }

        /* Messages */
        #pawsy-msgs {
            flex: 1; overflow-y: auto; padding: 18px 16px 8px;
            display: flex; flex-direction: column; gap: 4px;
            background: #faf8f5;
            scrollbar-width: thin; scrollbar-color: rgba(201,151,58,0.25) transparent;
        }
        #pawsy-msgs::-webkit-scrollbar { width: 4px; }
        #pawsy-msgs::-webkit-scrollbar-thumb { background: rgba(201,151,58,0.25); border-radius: 4px; }

        .p-msg-row { display: flex; align-items: flex-end; gap: 8px; margin-bottom: 8px; }
        .p-msg-row.user { flex-direction: row-reverse; }

        .p-avatar {
            width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
            background: linear-gradient(135deg,#3d1f08,#c9973a);
            display: flex; align-items: center; justify-content: center;
            font-size: 14px; box-shadow: 0 2px 6px rgba(74,40,16,0.2);
        }
        .p-avatar.user-av {
            background: linear-gradient(135deg,#6b3b12,#a06520);
        }

        .p-bubble {
            max-width: 75%; padding: 10px 14px; border-radius: 18px;
            font-size: 13.5px; line-height: 1.55; word-break: break-word;
            position: relative;
        }
        .p-msg-row.bot  .p-bubble {
            background: #fff; color: #2a1205;
            border-bottom-left-radius: 5px;
            box-shadow: 0 1px 4px rgba(74,40,16,0.08);
            border: 1px solid rgba(201,151,58,0.1);
        }
        .p-msg-row.user .p-bubble {
            background: linear-gradient(135deg,#3d1f08,#7a3b10);
            color: #fff; border-bottom-right-radius: 5px;
        }
        .p-time { font-size: 10px; color: rgba(74,40,16,0.35); margin-top: 4px; padding: 0 2px; }
        .p-msg-row.user .p-time { text-align: right; }

        /* Welcome card */
        .p-welcome {
            background: linear-gradient(135deg,rgba(201,151,58,0.1),rgba(74,40,16,0.05));
            border: 1px solid rgba(201,151,58,0.18); border-radius: 14px;
            padding: 16px; margin-bottom: 12px; text-align: center;
        }
        .p-welcome .p-w-icon { font-size: 32px; margin-bottom: 8px; }
        .p-welcome h4 { color: #3d1f08; font-size: 14px; font-weight: 600; margin: 0 0 4px; }
        .p-welcome p  { color: rgba(74,40,16,0.6); font-size: 12px; line-height: 1.5; margin: 0; }

        /* Typing dots */
        .p-typing {
            display: flex; align-items: center; gap: 5px;
            padding: 12px 16px; background: #fff;
            border-radius: 18px; border-bottom-left-radius: 5px;
            border: 1px solid rgba(201,151,58,0.1);
            box-shadow: 0 1px 4px rgba(74,40,16,0.08);
            width: fit-content;
        }
        .p-typing span {
            width: 7px; height: 7px; border-radius: 50%; background: #c9973a;
            animation: pawsyDot 1.2s ease-in-out infinite;
        }
        .p-typing span:nth-child(2) { animation-delay: 0.2s; }
        .p-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pawsyDot { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-5px);opacity:1} }

        /* Quick chips */
        #pawsy-chips {
            display: flex; flex-wrap: wrap; gap: 6px;
            padding: 8px 16px 4px; background: #faf8f5; flex-shrink: 0;
        }
        .p-chip {
            padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 500;
            border: 1.5px solid rgba(201,151,58,0.3); background: #fff;
            color: #5a2510; cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .p-chip:hover { background: rgba(201,151,58,0.1); border-color: #c9973a; color: #3d1f08; }

        /* Divider */
        .p-divider { height: 1px; background: rgba(201,151,58,0.12); margin: 0; flex-shrink: 0; }

        /* Footer / Input */
        #pawsy-ftr {
            padding: 12px 14px; background: #fff; display: flex;
            align-items: flex-end; gap: 10px; flex-shrink: 0;
        }
        #pawsy-inp {
            flex: 1; border: 1.5px solid rgba(201,151,58,0.25); border-radius: 14px;
            padding: 10px 14px; font-size: 13.5px; color: #2a1205; background: #faf8f5;
            outline: none; resize: none; max-height: 90px; line-height: 1.45;
            transition: border-color 0.2s, background 0.2s;
            font-family: 'Inter', sans-serif;
        }
        #pawsy-inp:focus { border-color: #c9973a; background: #fff; }
        #pawsy-inp::placeholder { color: rgba(74,40,16,0.38); }
        #pawsy-send {
            width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
            background: linear-gradient(135deg,#3d1f08,#c9973a);
            border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: transform 0.2s, opacity 0.2s; box-shadow: 0 2px 8px rgba(74,40,16,0.25);
        }
        #pawsy-send:hover:not(:disabled) { transform: scale(1.06); }
        #pawsy-send:disabled { opacity: 0.45; cursor: not-allowed; }
        #pawsy-send svg { width: 18px; height: 18px; fill: #fff; }

        @media(max-width:440px){
            #pawsy-panel{width:calc(100vw - 20px);right:10px;}
            #pawsy-bubble{right:14px;bottom:14px;}
        }
    `;
    document.head.appendChild(style);

    // ── HTML ──────────────────────────────────────────────────────
    const wrap = document.createElement('div');
    wrap.id = 'pawsy-wrap';
    wrap.innerHTML = `
        <button id="pawsy-bubble" onclick="window.pawsyToggle()" title="Chat with Pawsy">
            <span id="pawsy-icon">🐾</span>
            <span class="p-badge" id="pawsy-badge">1</span>
        </button>

        <div id="pawsy-panel">
            <div id="pawsy-hdr">
                <div class="p-hdr-avatar">🐾</div>
                <div class="p-hdr-info">
                    <div class="p-hdr-name">Pawsy — Petify Assistant</div>
                    <div class="p-hdr-sub"><span class="p-online"></span> Online · Replies instantly</div>
                </div>
                <button id="pawsy-close-btn" onclick="window.pawsyToggle()">✕</button>
            </div>

            <div id="pawsy-msgs"></div>

            <div id="pawsy-chips">
                <button class="p-chip" onclick="window.pawsyChip('Dog products')">🐶 Dog products</button>
                <button class="p-chip" onclick="window.pawsyChip('Cat products')">🐱 Cat products</button>
                <button class="p-chip" onclick="window.pawsyChip('Delivery info')">🚚 Delivery</button>
                <button class="p-chip" onclick="window.pawsyChip('Return policy')">↩️ Returns</button>
            </div>

            <div class="p-divider"></div>

            <div id="pawsy-ftr">
                <textarea id="pawsy-inp" placeholder="Type in English, Hindi, or Hinglish..." rows="1"></textarea>
                <button id="pawsy-send" onclick="window.pawsySend()">
                    <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(wrap);

    // ── Refs ──────────────────────────────────────────────────────
    const panel  = document.getElementById('pawsy-panel');
    const msgs   = document.getElementById('pawsy-msgs');
    const inp    = document.getElementById('pawsy-inp');
    const send   = document.getElementById('pawsy-send');
    const badge  = document.getElementById('pawsy-badge');
    const icon   = document.getElementById('pawsy-icon');
    const chips  = document.getElementById('pawsy-chips');

    inp.addEventListener('input', () => {
        inp.style.height = 'auto';
        inp.style.height = Math.min(inp.scrollHeight, 90) + 'px';
    });
    inp.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window.pawsySend(); }
    });

    // ── Toggle ────────────────────────────────────────────────────
    window.pawsyToggle = function () {
        isOpen = !isOpen;
        panel.classList.toggle('open', isOpen);
        icon.textContent = isOpen ? '✕' : '🐾';
        badge.style.display = 'none';
        if (isOpen) {
            if (msgs.children.length === 0) showWelcome();
            setTimeout(() => inp.focus(), 350);
            scrollDown();
        }
    };

    function showWelcome() {
        const el = document.createElement('div');
        el.className = 'p-welcome';
        el.innerHTML = `
            <div class="p-w-icon">🐾</div>
            <h4>Hi! I'm Pawsy</h4>
            <p>Your official Petify assistant.<br>Ask me anything in <strong>English, Hindi, or Hinglish!</strong></p>`;
        msgs.appendChild(el);
        addBotMsg("Woof! 👋 Hi there! How can I help your furry friend today?");
    }

    // ── Chips ─────────────────────────────────────────────────────
    window.pawsyChip = function (text) {
        chips.style.display = 'none';
        inp.value = text;
        window.pawsySend();
    };

    // ── Send ──────────────────────────────────────────────────────
    window.pawsySend = async function () {
        const text = inp.value.trim();
        if (!text || isTyping) return;
        inp.value = ''; inp.style.height = 'auto';
        chips.style.display = 'none';

        addUserMsg(text);
        chatHistory.push({ role: 'user', text });
        showTyping();
        send.disabled = true; isTyping = true;

        try {
            const res  = await fetch(`${API_BASE}/chatbot/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history: chatHistory.slice(-12) }),
            });
            const data = await res.json();
            hideTyping();
            const reply = data.reply || data.error || 'Oops, kuch gadbad ho gayi! Please try again.';
            addBotMsg(reply);
            chatHistory.push({ role: 'bot', text: reply });
        } catch {
            hideTyping();
            addBotMsg('Connection issue hai 😕 Please try again.');
        } finally {
            isTyping = false; send.disabled = false; inp.focus();
        }
    };

    // ── Message helpers ───────────────────────────────────────────
    function addUserMsg(text) {
        const row = document.createElement('div');
        row.className = 'p-msg-row user';
        row.innerHTML = `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: flex-end;">
                <div class="p-bubble">${esc(text)}</div>
                <div class="p-time">${now()}</div>
            </div>
            <div class="p-avatar user-av">👤</div>`;
        msgs.appendChild(row); scrollDown();
    }

    function addBotMsg(text) {
        const row = document.createElement('div');
        row.className = 'p-msg-row bot';
        const html = esc(text)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
        row.innerHTML = `
            <div class="p-avatar">🐾</div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: flex-start;">
                <div class="p-bubble">${html}</div>
                <div class="p-time">${now()}</div>
            </div>`;
        msgs.appendChild(row); scrollDown();
    }

    let typingRow = null;
    function showTyping() {
        typingRow = document.createElement('div');
        typingRow.className = 'p-msg-row bot';
        typingRow.innerHTML = `<div class="p-avatar">🐾</div><div class="p-typing"><span></span><span></span><span></span></div>`;
        msgs.appendChild(typingRow); scrollDown();
    }
    function hideTyping() { if (typingRow) { typingRow.remove(); typingRow = null; } }

    function scrollDown() { setTimeout(() => msgs.scrollTop = msgs.scrollHeight, 60); }
    function now() { return new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}); }
    function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
})();
