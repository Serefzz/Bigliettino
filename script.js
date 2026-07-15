document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.getElementById("envelope-wrapper");
    const scene = document.getElementById("scene");
    const audio = document.getElementById("bgMusic");
    const instruction = document.querySelector(".instruction");
    let isOpen = false;

    // 3D Parallax effect on mouse move
    document.addEventListener("mousemove", (e) => {
        if (isOpen) return; // Stop parallax when open
        // Invertito per far girare la busta verso il mouse
        const x = (e.pageX - window.innerWidth / 2) / 25;
        const y = -(e.pageY - window.innerHeight / 2) / 25;
        scene.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
    });

    // Voice recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;

    function openEnvelope() {
        if (isOpen) return;
        isOpen = true;
        wrapper.classList.add("open");

        // Try playing audio
        audio.volume = 0;
        audio.play().then(() => {
            // Fade in audio
            let vol = 0;
            let fadeInterval = setInterval(() => {
                if (vol < 0.5) {
                    vol += 0.05;
                    audio.volume = vol;
                } else {
                    clearInterval(fadeInterval);
                }
            }, 200);
        }).catch(err => console.log("Audio play failed:", err));

        // Hide instruction
        instruction.style.opacity = '0';
        instruction.style.transition = 'opacity 0.5s ease';
        setTimeout(() => { instruction.style.display = 'none'; }, 500);

        // Reset rotation to center the letter beautifully
        scene.style.transition = 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)';
        scene.style.transform = `rotateY(0deg) rotateX(0deg)`;

        createParticles();
    }

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'it-IT';
        recognition.continuous = true;
        recognition.interimResults = true;

        let recognitionStarted = false;
        let lastPuTime = 0;
        let hasBeenTouched = false;

        const evaluateAndOpen = () => {
            if (isOpen) return;
            // Controlla se 'pu' è stato detto negli ultimi 4 secondi
            const hasSaidPuRecently = (Date.now() - lastPuTime) <= 4000;
            
            // Una volta che la busta è stata toccata (per attivare il microfono),
            // basterà solo dire "pu" per aprirla in qualsiasi momento.
            if (hasBeenTouched && hasSaidPuRecently) {
                try { recognition.stop(); } catch(e) {}
                openEnvelope();
            }
        };

        const handleEnvelopeTouch = (e) => {
            if (isOpen) return;
            hasBeenTouched = true;
            
            // Sblocco audio per dispositivi mobili (iOS/Android bloccano l'audio se non avviato con un tocco)
            if (audio.paused) {
                audio.volume = 0;
                audio.play().then(() => {
                    audio.pause();
                }).catch(() => {});
            }
            
            // Avviamo il microfono solo la prima volta (o se si è spento da solo)
            if (!recognitionStarted) {
                try {
                    recognition.start();
                    recognitionStarted = true;
                } catch (err) { }
            }

            evaluateAndOpen();
        };

        wrapper.addEventListener("mousedown", handleEnvelopeTouch);
        wrapper.addEventListener("touchstart", handleEnvelopeTouch);

        // Il microfono potrebbe spegnersi da solo dopo un po' di silenzio.
        // Se succede, permettiamo di riavviarlo al prossimo tocco.
        recognition.onend = () => {
            recognitionStarted = false;
        };

        recognition.onresult = (event) => {
            if (isOpen) return;
            
            // Prendiamo solo l'ultima frase detta
            let transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            
            // Allow some phonetic variations of "pu"
            if (transcript.includes('pu') || transcript.includes('pù') || transcript.includes('poo') || transcript.includes('bu') || transcript.includes('tu')) {
                lastPuTime = Date.now();
                evaluateAndOpen();
            }
        };

        instruction.innerText = "Di' 'pu' e tocca la busta!";
    } else {
        // Fallback se il browser non supporta il riconoscimento vocale
        instruction.innerText = "Tocca la busta per aprirla";
        wrapper.addEventListener("click", openEnvelope);
    }

    function createParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.id = 'particles';
        document.body.appendChild(particlesContainer);

        const colors = ['#f4d03f', '#e74c3c', '#9b59b6', '#2ecc71', '#3498db'];

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = Math.random() * 8 + 4 + 'px';
            particle.style.height = particle.style.width;
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.borderRadius = '50%';

            // Start from center
            particle.style.left = '50%';
            particle.style.top = '50%';

            // Random direction
            const tx = (Math.random() - 0.5) * 500;
            const ty = (Math.random() - 0.5) * 500 - 100; // slightly upwards

            particle.style.transform = `translate(-50%, -50%)`;
            particle.style.opacity = '1';

            particlesContainer.appendChild(particle);

            // Animate
            const animation = particle.animate([
                { transform: `translate(-50%, -50%) scale(1)`, opacity: 1 },
                { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
            ], {
                duration: Math.random() * 1000 + 1000,
                easing: 'cubic-bezier(0, .9, .57, 1)'
            });

            animation.onfinish = () => particle.remove();
        }
    }

    function createBgHearts() {
        const container = document.createElement('div');
        container.id = 'bg-hearts-container';
        document.body.prepend(container);

        setInterval(() => {
            const heart = document.createElement('div');
            heart.classList.add('bg-heart');
            heart.innerText = '❤';

            const size = Math.random() * 25 + 10;
            heart.style.fontSize = `${size}px`;
            heart.style.left = `${Math.random() * 100}vw`;
            heart.style.animationDuration = `${Math.random() * 4 + 6}s`;

            container.appendChild(heart);

            setTimeout(() => {
                heart.remove();
            }, 40000);
        }, 500);
    }

    createBgHearts();
});
