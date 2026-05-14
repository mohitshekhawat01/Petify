// Lightweight cursor script for pages that don't load main.js
(function () {
    function initCursor() {
        let cursor = document.getElementById('custom-cursor');
        let ring   = document.getElementById('cursor-ring');

        if (!cursor) {
            cursor = document.createElement('div');
            cursor.id = 'custom-cursor';
            document.body.appendChild(cursor);
        }
        if (!ring) {
            ring = document.createElement('div');
            ring.id = 'cursor-ring';
            document.body.appendChild(ring);
        }

        let mouseX = 0, mouseY = 0;
        let ringX  = 0, ringY  = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top  = mouseY + 'px';
        });

        // Smooth ring follow
        function animateRing() {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            ring.style.left = ringX + 'px';
            ring.style.top  = ringY + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Hover effect on interactive elements
        document.querySelectorAll('a, button, input, textarea, select, [onclick]').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCursor);
    } else {
        initCursor();
    }
})();
