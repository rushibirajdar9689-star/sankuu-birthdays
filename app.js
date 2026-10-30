/**
 * =========================================================================
 * A LITTLE WORLD FOR SANKUU 🎀 - APP LOGIC
 * Interactive magical birthday experience
 * =========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================================
       1. WEB AUDIO SYNTHESIZER & SOUND FX ENGINE
       ========================================================================= */
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Play a gentle crystal music-box tone
    function playMusicBoxNote(freq, duration = 1.2, delay = 0) {
        try {
            const ctx = getAudioContext();
            if (!ctx) return;

            const now = ctx.currentTime + delay;
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();

            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(freq, now);

            // Overtones for bell/music-box chime
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(freq * 2.02, now);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + duration);
            osc2.stop(now + duration);
        } catch (e) {
            // Audio policy fallback
        }
    }

    // Soft celebration chime / sparkle sound
    function playChimeSound() {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            playMusicBoxNote(freq, 0.8, idx * 0.08);
        });
    }

    // Gentle candle blow-out sound (soft pink noise filtered)
    function playBlowSound() {
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const bufferSize = ctx.sampleRate * 0.4;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, ctx.currentTime);
            noise.connect(filter);
            filter.connect(ctx.destination);
            noise.start();
        } catch (e) {}
    }

    /* =========================================================================
       2. BACKGROUND SPARKLES CANVAS
       ========================================================================= */
    const canvas = document.getElementById('sparklesCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const particles = [];
        const colors = ['#ffccd5', '#ffd1dc', '#fff0f5', '#f3e8ff', '#fef08a'];

        for (let i = 0; i < 45; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 3 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: Math.random() * 0.6 + 0.2,
                speedX: (Math.random() - 0.5) * 0.4,
                alpha: Math.random() * 0.7 + 0.3,
                pulse: Math.random() * 0.04 + 0.01
            });
        }

        function animateSparkles() {
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.y -= p.speedY;
                p.x += p.speedX;
                p.alpha += Math.sin(Date.now() * p.pulse * 0.1) * 0.02;

                if (p.y < -10) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }
                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;

                ctx.save();
                ctx.globalAlpha = Math.max(0.1, Math.min(0.9, p.alpha));
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                // Draw tiny cross sparkle
                if (p.size > 2.2) {
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(p.x - p.size * 2, p.y);
                    ctx.lineTo(p.x + p.size * 2, p.y);
                    ctx.moveTo(p.x, p.y - p.size * 2);
                    ctx.lineTo(p.x, p.y + p.size * 2);
                    ctx.stroke();
                }
                ctx.restore();
            });

            requestAnimationFrame(animateSparkles);
        }
        animateSparkles();
    }

    /* =========================================================================
       3. INTERACTIVE CURSOR HEARTS & TRAIL
       ========================================================================= */
    let lastTrailTime = 0;
    const heartSymbols = ['💖', '✨', '🌸', '💗', '🎀', '⭐'];

    function createCursorHeart(x, y) {
        const now = Date.now();
        if (now - lastTrailTime < 80) return; // rate limit
        lastTrailTime = now;

        const particle = document.createElement('span');
        particle.className = 'floating-particle';
        particle.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        const deltaX = (Math.random() - 0.5) * 80;
        const deltaY = -Math.random() * 90 - 30;
        const rot = (Math.random() - 0.5) * 60;

        particle.style.setProperty('--deltaX', `${deltaX}px`);
        particle.style.setProperty('--deltaY', `${deltaY}px`);
        particle.style.setProperty('--rot', `${rot}deg`);

        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 1800);
    }

    window.addEventListener('mousemove', (e) => {
        if (Math.random() < 0.35) {
            createCursorHeart(e.clientX, e.clientY);
        }
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
            createCursorHeart(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    /* =========================================================================
       4. CONFETTI & FLOATING HEARTS BURST
       ========================================================================= */
    function launchConfettiBurst(originX = window.innerWidth / 2, originY = window.innerHeight / 2, count = 40) {
        const items = ['💖', '✨', '🎀', '🌸', '🍓', '💗', '🎉', '🍰'];
        for (let i = 0; i < count; i++) {
            const el = document.createElement('span');
            el.className = 'floating-particle';
            el.textContent = items[Math.floor(Math.random() * items.length)];
            el.style.left = `${originX}px`;
            el.style.top = `${originY}px`;
            el.style.fontSize = `${Math.random() * 1.5 + 1}rem`;

            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 260 + 80;
            const deltaX = Math.cos(angle) * distance;
            const deltaY = Math.sin(angle) * distance - 80;
            const rot = (Math.random() - 0.5) * 360;

            el.style.setProperty('--deltaX', `${deltaX}px`);
            el.style.setProperty('--deltaY', `${deltaY}px`);
            el.style.setProperty('--rot', `${rot}deg`);

            document.body.appendChild(el);
            setTimeout(() => el.remove(), 2000);
        }
    }

    /* =========================================================================
       5. WELCOME SCREEN TRANSITION
       ========================================================================= */
    const welcomeScreen = document.getElementById('welcomeScreen');
    const btnOpenSurprise = document.getElementById('btnOpenSurprise');

    if (btnOpenSurprise && welcomeScreen) {
        btnOpenSurprise.addEventListener('click', (e) => {
            getAudioContext();
            playChimeSound();
            launchConfettiBurst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, 50);

            // Trigger music
            playMusic();

            welcomeScreen.classList.add('hidden');
            setTimeout(() => {
                welcomeScreen.style.display = 'none';
            }, 800);
        });
    }

    /* =========================================================================
       6. MUSIC PLAYER SYSTEM (Dual Engine)
       ========================================================================= */
    const nativeAudio = document.getElementById('nativeAudio');
    const musicToggleBtn = document.getElementById('musicToggleBtn');
    const soundWaves = document.getElementById('soundWaves');
    const musicLabel = document.getElementById('musicLabel');
    const vinylDisc = document.getElementById('vinylDisc');
    const tonearmStick = document.getElementById('tonearmStick');
    const soundVisualizer = document.getElementById('soundVisualizer');
    const btnMainPlay = document.getElementById('btnMainPlay');
    const playIcon = document.getElementById('playIcon');
    const progressFill = document.getElementById('progressFill');
    const progressScrubber = document.getElementById('progressScrubber');
    const progressTrack = document.getElementById('progressTrack');
    const currentTimeEl = document.getElementById('currentTime');
    const totalDurationEl = document.getElementById('totalDuration');
    const btnRewind = document.getElementById('btnRewind');
    const btnForward = document.getElementById('btnForward');

    let isPlaying = false;
    let synthLoopTimer = null;

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function updatePlayerUI(playing) {
        isPlaying = playing;
        if (playIcon) playIcon.textContent = playing ? '❚❚' : '▶';
        if (musicLabel) musicLabel.textContent = playing ? 'Playing 🎵' : 'Our Song';
        
        if (soundWaves) {
            soundWaves.classList.toggle('playing', playing);
        }
        if (soundVisualizer) {
            soundVisualizer.classList.toggle('playing', playing);
        }
        if (vinylDisc) {
            vinylDisc.classList.toggle('spinning', playing);
        }
        if (tonearmStick) {
            tonearmStick.classList.toggle('on-record', playing);
        }
    }

    function playMusic() {
        getAudioContext();
        if (nativeAudio) {
            const playPromise = nativeAudio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    updatePlayerUI(true);
                }).catch(() => {
                    // Fallback to synthesized melody
                    startSynthMelody();
                    updatePlayerUI(true);
                });
            }
        } else {
            startSynthMelody();
            updatePlayerUI(true);
        }
    }

    function pauseMusic() {
        if (nativeAudio) {
            nativeAudio.pause();
        }
        stopSynthMelody();
        updatePlayerUI(false);
    }

    function toggleMusic() {
        if (isPlaying) {
            pauseMusic();
        } else {
            playMusic();
        }
    }

    if (musicToggleBtn) {
        musicToggleBtn.addEventListener('click', toggleMusic);
    }
    if (btnMainPlay) {
        btnMainPlay.addEventListener('click', toggleMusic);
    }

    // Audio progress updates
    if (nativeAudio) {
        nativeAudio.addEventListener('timeupdate', () => {
            if (nativeAudio.duration) {
                const pct = (nativeAudio.currentTime / nativeAudio.duration) * 100;
                if (progressFill) progressFill.style.width = `${pct}%`;
                if (progressScrubber) progressScrubber.style.left = `${pct}%`;
                if (currentTimeEl) currentTimeEl.textContent = formatTime(nativeAudio.currentTime);
                if (totalDurationEl) totalDurationEl.textContent = formatTime(nativeAudio.duration);
            }
        });

        nativeAudio.addEventListener('loadedmetadata', () => {
            if (totalDurationEl) totalDurationEl.textContent = formatTime(nativeAudio.duration);
        });

        nativeAudio.addEventListener('ended', () => {
            updatePlayerUI(false);
        });
    }

    if (progressTrack) {
        progressTrack.addEventListener('click', (e) => {
            const rect = progressTrack.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            if (nativeAudio && nativeAudio.duration) {
                nativeAudio.currentTime = clickPos * nativeAudio.duration;
            }
        });
    }

    if (btnRewind && nativeAudio) {
        btnRewind.addEventListener('click', () => {
            nativeAudio.currentTime = Math.max(0, nativeAudio.currentTime - 5);
        });
    }
    if (btnForward && nativeAudio) {
        btnForward.addEventListener('click', () => {
            nativeAudio.currentTime = Math.min(nativeAudio.duration || 999, nativeAudio.currentTime + 5);
        });
    }

    // Synth Melody Fallback
    function startSynthMelody() {
        stopSynthMelody();
        const melody = [
            { f: 392.00, d: 0.4 }, { f: 392.00, d: 0.4 }, { f: 440.00, d: 0.8 }, { f: 392.00, d: 0.8 }, { f: 523.25, d: 0.8 }, { f: 493.88, d: 1.6 },
            { f: 392.00, d: 0.4 }, { f: 392.00, d: 0.4 }, { f: 440.00, d: 0.8 }, { f: 392.00, d: 0.8 }, { f: 587.33, d: 0.8 }, { f: 523.25, d: 1.6 },
            { f: 392.00, d: 0.4 }, { f: 392.00, d: 0.4 }, { f: 783.99, d: 0.8 }, { f: 659.25, d: 0.8 }, { f: 523.25, d: 0.8 }, { f: 493.88, d: 0.8 }, { f: 440.00, d: 1.2 },
            { f: 698.46, d: 0.4 }, { f: 698.46, d: 0.4 }, { f: 659.25, d: 0.8 }, { f: 523.25, d: 0.8 }, { f: 587.33, d: 0.8 }, { f: 523.25, d: 2.0 }
        ];

        let idx = 0;
        function playStep() {
            if (!isPlaying) return;
            const note = melody[idx];
            playMusicBoxNote(note.f, note.d + 0.4);
            idx = (idx + 1) % melody.length;
            synthLoopTimer = setTimeout(playStep, note.d * 1000);
        }
        playStep();
    }

    function stopSynthMelody() {
        if (synthLoopTimer) {
            clearTimeout(synthLoopTimer);
            synthLoopTimer = null;
        }
    }

    /* =========================================================================
       7. HERO ACTIONS (Kisses, Confetti, Love Meter)
       ========================================================================= */
    const btnSendKiss = document.getElementById('btnSendKiss');
    const btnPopConfetti = document.getElementById('btnPopConfetti');
    const btnLoveMeter = document.getElementById('btnLoveMeter');

    if (btnSendKiss) {
        btnSendKiss.addEventListener('click', (e) => {
            playMusicBoxNote(880, 0.5);
            launchConfettiBurst(e.clientX, e.clientY, 30);
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const kiss = document.createElement('span');
                    kiss.className = 'floating-particle';
                    kiss.textContent = '💋';
                    kiss.style.fontSize = `${Math.random() * 2 + 1.5}rem`;
                    kiss.style.left = `${Math.random() * window.innerWidth * 0.8 + 100}px`;
                    kiss.style.top = `${Math.random() * window.innerHeight * 0.7 + 100}px`;
                    kiss.style.setProperty('--deltaX', `${(Math.random() - 0.5) * 100}px`);
                    kiss.style.setProperty('--deltaY', `-120px`);
                    kiss.style.setProperty('--rot', `${(Math.random() - 0.5) * 40}deg`);
                    document.body.appendChild(kiss);
                    setTimeout(() => kiss.remove(), 1800);
                }, i * 150);
            }
        });
    }

    if (btnPopConfetti) {
        btnPopConfetti.addEventListener('click', (e) => {
            playChimeSound();
            launchConfettiBurst(e.clientX, e.clientY, 60);
        });
    }

    if (btnLoveMeter) {
        btnLoveMeter.addEventListener('click', (e) => {
            playMusicBoxNote(1046.50, 0.6);
            launchConfettiBurst(e.clientX, e.clientY, 25);
            btnLoveMeter.innerHTML = '<span class="btn-emoji">💖</span><span>Love: 1000000000% !!</span>';
            setTimeout(() => {
                btnLoveMeter.innerHTML = '<span class="btn-emoji">💖</span><span>Love Meter: ∞%</span>';
            }, 3000);
        });
    }

    /* =========================================================================
       8. INTERACTIVE BIRTHDAY CAKE LOGIC
       ========================================================================= */
    const btnMakeWish = document.getElementById('btnMakeWish');
    const btnRelight = document.getElementById('btnRelight');
    const wishSuccessCard = document.getElementById('wishSuccessCard');
    const flames = [
        document.getElementById('flame1'),
        document.getElementById('flame2'),
        document.getElementById('flame3')
    ];
    const smokes = [
        document.getElementById('smoke1'),
        document.getElementById('smoke2'),
        document.getElementById('smoke3')
    ];

    if (btnMakeWish) {
        btnMakeWish.addEventListener('click', (e) => {
            playBlowSound();

            // Extinguish candles
            flames.forEach(flame => {
                if (flame) flame.classList.add('extinguished');
            });
            smokes.forEach(smoke => {
                if (smoke) {
                    smoke.classList.add('active');
                    setTimeout(() => smoke.classList.remove('active'), 1500);
                }
            });

            // Burst confetti & hearts
            setTimeout(() => {
                playChimeSound();
                launchConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.45, 70);
            }, 300);

            // Show congratulatory card
            if (wishSuccessCard) {
                wishSuccessCard.style.display = 'block';
                wishSuccessCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            btnMakeWish.style.display = 'none';
            if (btnRelight) btnRelight.style.display = 'inline-flex';
        });
    }

    if (btnRelight) {
        btnRelight.addEventListener('click', () => {
            playMusicBoxNote(783.99, 0.6);
            flames.forEach(flame => {
                if (flame) flame.classList.remove('extinguished');
            });

            if (wishSuccessCard) {
                wishSuccessCard.style.display = 'none';
            }

            btnRelight.style.display = 'none';
            if (btnMakeWish) btnMakeWish.style.display = 'inline-flex';
        });
    }

    /* =========================================================================
       9. LOVE LETTER OPENING & TYPEWRITER REVEAL
       ========================================================================= */
    const btnOpenLetter = document.getElementById('btnOpenLetter');
    const envelope = document.getElementById('envelope');
    const envelopeSeal = document.getElementById('envelopeSeal');
    const unfoldedLetterModal = document.getElementById('unfoldedLetterModal');
    const btnCloseLetter = document.getElementById('btnCloseLetter');
    const letterBackdrop = document.getElementById('letterBackdrop');
    const letterModalTitle = document.getElementById('letterModalTitle');
    const letterModalDate = document.getElementById('letterModalDate');
    const letterModalBody = document.getElementById('letterModalBody');
    const letterModalClosing = document.getElementById('letterModalClosing');
    const letterModalSignature = document.getElementById('letterModalSignature');

    function openLoveLetter() {
        playChimeSound();

        if (envelope) {
            envelope.classList.add('opened');
        }

        setTimeout(() => {
            if (unfoldedLetterModal) {
                unfoldedLetterModal.style.display = 'flex';
                renderLetterContent();
            }
        }, 600);
    }

    function closeLoveLetter() {
        if (unfoldedLetterModal) {
            unfoldedLetterModal.style.display = 'none';
        }
        if (envelope) {
            envelope.classList.remove('opened');
        }
    }

    function renderLetterContent() {
        const letterData = window.POOKIE_LETTER || {
            title: "To My Prettiest Sankuu 🌸",
            subtitle: "A little piece of my heart on your special day...",
            date: "Special Day ✨",
            salutation: "My Dearest Sankruti,",
            paragraphs: [
                "From the very moment you walked into my life, everything became softer, brighter, and infinitely more beautiful.",
                "Your smile is my favorite sight in the world, and your happiness is my greatest priority.",
                "Happy Birthday, my beautiful Pookie! 🎂💗"
            ],
            closing: "Forever & Always Yours,",
            signature: "With all my love ❤️"
        };

        if (letterModalTitle) letterModalTitle.textContent = letterData.title;
        if (letterModalDate) letterModalDate.textContent = letterData.date;
        if (letterModalClosing) letterModalClosing.textContent = letterData.closing;
        if (letterModalSignature) letterModalSignature.textContent = letterData.signature;

        if (letterModalBody) {
            letterModalBody.innerHTML = '';

            if (letterData.salutation) {
                const salutationEl = document.createElement('p');
                salutationEl.innerHTML = `<strong>${letterData.salutation}</strong>`;
                salutationEl.className = 'revealed';
                letterModalBody.appendChild(salutationEl);
            }

            letterData.paragraphs.forEach((pText, idx) => {
                const pEl = document.createElement('p');
                pEl.textContent = pText;
                letterModalBody.appendChild(pEl);

                // Staggered smooth fade-in
                setTimeout(() => {
                    pEl.classList.add('revealed');
                }, (idx + 1) * 350);
            });
        }
    }

    if (btnOpenLetter) btnOpenLetter.addEventListener('click', openLoveLetter);
    if (envelopeSeal) envelopeSeal.addEventListener('click', openLoveLetter);
    if (btnCloseLetter) btnCloseLetter.addEventListener('click', closeLoveLetter);
    if (letterBackdrop) letterBackdrop.addEventListener('click', closeLoveLetter);

    /* =========================================================================
       10. PHOTO GALLERY & LIGHTBOX MODAL
       ========================================================================= */
    const photosData = [
        {
            src: 'assets/photos/photo1.jpg',
            caption: 'Where Your Magic Began 🌸',
            sub: 'My tiny, precious baby Sankuu who grew into the love of my life.'
        },
        {
            src: 'assets/photos/photo2.jpg',
            caption: 'The Smile That Stole My Heart ✨',
            sub: 'Looking effortlessly breathtaking in green with that sweet radiant smile.'
        },
        {
            src: 'assets/photos/photo3.jpg',
            caption: 'Pure Sweetness & Sparkle 🎀',
            sub: 'The cutest, most adorable human in existence. Forever my pookie!'
        },
        {
            src: 'assets/photos/photo4.jpg',
            caption: 'My Favorite Place Is With You ☀️',
            sub: 'Under the sunny sky, side by side, exactly where I belong.'
        },
        {
            src: 'assets/photos/photo5.jpg',
            caption: 'Holding Your Hand Forever 💍',
            sub: 'Fingers intertwined, promises unspoken, forever holding on to you.'
        }
    ];

    let currentLightboxIdx = 0;
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const btnLightboxClose = document.getElementById('btnLightboxClose');
    const btnLightboxPrev = document.getElementById('btnLightboxPrev');
    const btnLightboxNext = document.getElementById('btnLightboxNext');
    const lightboxBackdrop = document.getElementById('lightboxBackdrop');
    const polaroidCards = document.querySelectorAll('.polaroid-card');

    function openLightbox(idx) {
        currentLightboxIdx = (idx + photosData.length) % photosData.length;
        const photo = photosData[currentLightboxIdx];

        if (lightboxImg) {
            lightboxImg.src = photo.src;
            lightboxImg.alt = photo.caption;
        }
        if (lightboxCaption) {
            lightboxCaption.textContent = photo.caption;
        }
        if (lightboxCounter) {
            lightboxCounter.textContent = `Memory ${currentLightboxIdx + 1} of ${photosData.length}`;
        }
        if (lightboxModal) {
            lightboxModal.style.display = 'flex';
        }

        playMusicBoxNote(659.25, 0.4);
    }

    function closeLightbox() {
        if (lightboxModal) {
            lightboxModal.style.display = 'none';
        }
    }

    function nextPhoto() {
        openLightbox(currentLightboxIdx + 1);
    }

    function prevPhoto() {
        openLightbox(currentLightboxIdx - 1);
    }

    polaroidCards.forEach((card) => {
        card.addEventListener('click', () => {
            const idx = parseInt(card.getAttribute('data-index') || '0', 10);
            openLightbox(idx);
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const idx = parseInt(card.getAttribute('data-index') || '0', 10);
                openLightbox(idx);
            }
        });
    });

    if (btnLightboxClose) btnLightboxClose.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
    if (btnLightboxNext) btnLightboxNext.addEventListener('click', nextPhoto);
    if (btnLightboxPrev) btnLightboxPrev.addEventListener('click', prevPhoto);

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (!lightboxModal || lightboxModal.style.display === 'none') return;
        if (e.key === 'ArrowRight') nextPhoto();
        if (e.key === 'ArrowLeft') prevPhoto();
        if (e.key === 'Escape') closeLightbox();
    });

    // Touch swipe navigation for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    if (lightboxModal) {
        lightboxModal.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightboxModal.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchEndX - touchStartX;
            if (Math.abs(diff) > 40) {
                if (diff < 0) nextPhoto();
                else prevPhoto();
            }
        }, { passive: true });
    }

    /* =========================================================================
       11. BACK TO TOP BUTTON
       ========================================================================= */
    const btnBackToTop = document.getElementById('btnBackToTop');
    if (btnBackToTop) {
        btnBackToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            playMusicBoxNote(880, 0.5);
        });
    }

    console.log("🎀 A Little World for Sankuu is loaded with love! 💖");
});
