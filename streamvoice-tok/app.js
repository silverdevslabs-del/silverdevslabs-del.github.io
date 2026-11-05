/**
 * StreamVoice: Tok Live Chat TTS — Interactive Logic
 * Silver Devs Labs (2026)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Screenshot Mockup Switcher
    const screens = document.querySelectorAll('.mockup-screen');
    const dots = document.querySelectorAll('.mockup-dot');

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const targetId = dot.getAttribute('data-target');
            
            dots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');

            screens.forEach(s => {
                if (s.id === targetId) {
                    s.classList.remove('hidden');
                } else {
                    s.classList.add('hidden');
                }
            });
        });
    });

    // 2. Interactive Event Simulator (SmartQueue Live Preview)
    const simFeed = document.getElementById('sim-feed');
    const waveBars = document.querySelectorAll('.wave-bar');
    const audioStatusText = document.getElementById('audio-status');
    const simButtons = document.querySelectorAll('.sim-btn');

    let audioTimeout = null;

    const sampleEvents = {
        comment: {
            user: '@GamerPro99',
            text: '¡Hermosa jugada streamer! Saludos desde Chile 🎮',
            type: 'comment',
            voiceText: 'Gamer Pro 99 dice: Hermosa jugada streamer, Saludos desde Chile',
            badge: 'TTS Voz Neuronal'
        },
        gift: {
            user: '@Valeria_VIP',
            text: 'Envió un León 🦁 (Prioridad VIP en cola)',
            type: 'gift',
            voiceText: '¡Atención! Valeria VIP ha enviado un León. ¡Muchísimas gracias por el regalo!',
            badge: 'VIP Inmediato'
        },
        likes: {
            user: '@RafaStreamer y 45 más',
            text: 'Dieron 500 Me Gusta ❤️ (Anti-Spam agrupado)',
            type: 'vip',
            voiceText: '500 Me Gusta acumulados de la comunidad',
            badge: 'SmartQueue Batch'
        }
    };

    function triggerSimEvent(key) {
        const evt = sampleEvents[key];
        if (!evt) return;

        // Visual Feed Item
        const item = document.createElement('div');
        item.className = `feed-item ${evt.type}`;
        item.innerHTML = `
            <div>
                <span class="feed-user">${evt.user}</span>
                <span>${evt.text}</span>
            </div>
            <span class="feed-voice-badge">${evt.badge}</span>
        `;
        
        simFeed.appendChild(item);

        // Keep last 4 items
        if (simFeed.children.length > 4) {
            simFeed.removeChild(simFeed.children[0]);
        }

        // Animate Wave Bars
        waveBars.forEach(b => b.classList.add('animating'));
        audioStatusText.innerHTML = `🔊 Reproduciendo por <strong style="color:var(--neon-cyan)">STREAM_ACCESSIBILITY</strong>: <em>"${evt.voiceText.substring(0, 40)}..."</em>`;

        // Optional Web Speech synthesis if available
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(evt.voiceText);
            utterance.rate = 1.1;
            utterance.pitch = 1.0;
            utterance.lang = 'es-ES';
            window.speechSynthesis.speak(utterance);
        }

        if (audioTimeout) clearTimeout(audioTimeout);
        audioTimeout = setTimeout(() => {
            waveBars.forEach(b => b.classList.remove('animating'));
            audioStatusText.textContent = 'En espera de nuevos eventos del live...';
        }, 3200);
    }

    simButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            simButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const type = btn.getAttribute('data-type');
            triggerSimEvent(type);
        });
    });

    // Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '72px';
                navLinks.style.left = '0';
                navLinks.style.right = '0';
                navLinks.style.background = 'rgba(8, 9, 13, 0.98)';
                navLinks.style.padding = '24px';
                navLinks.style.borderBottom = '1px solid var(--border-glass)';
            }
        });
    }
});
