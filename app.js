document.addEventListener('DOMContentLoaded', () => {
    init3DEffects();
    initCart();
    initMobileMenu();
    initContactForm();
    initParticlesCursor();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (toggle) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            toggle.querySelectorAll('span').forEach(s => s.classList.toggle('active'));
        });
    }
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('active'));
    });
}

function init3DEffects() {
    document.querySelectorAll('.card-3d').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const rotateX = ((e.clientY - rect.top) - rect.height / 2) / 10;
            const rotateY = (rect.width / 2 - (e.clientX - rect.left)) / 10;
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateX(0deg) rotateY(0deg)';
        });
    });
}

// Cart Logic
let cart = JSON.parse(localStorage.getItem('br_cart')) || [];
function initCart() {
    updateCartBadge();
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            addToCart({
                id: e.target.dataset.id,
                name: e.target.dataset.name,
                price: e.target.dataset.price,
                img: e.target.dataset.img
            });
        }
    });
}
function addToCart(product) {
    cart.push(product);
    localStorage.setItem('br_cart', JSON.stringify(cart));
    updateCartBadge();
    const btn = document.querySelector(`.add-to-cart[data-id="${product.id}"]`);
    if (btn) {
        const orig = btn.innerText;
        btn.innerText = 'Added!'; btn.style.background = '#4CAF50';
        setTimeout(() => { btn.innerText = orig; btn.style.background = 'var(--primary)'; }, 1500);
        const sparrow = document.createElement('div');
        sparrow.className = 'flying-sparrow';
        sparrow.innerHTML = '<i class="fas fa-dove"></i>';
        document.body.appendChild(sparrow);
        const bRect = btn.getBoundingClientRect();
        const cartBtn = document.querySelector('.cart-btn');
        const cRect = cartBtn.getBoundingClientRect();
        sparrow.style.left = `${bRect.left + bRect.width / 2}px`;
        sparrow.style.top = `${bRect.top}px`;
        requestAnimationFrame(() => {
            sparrow.style.left = `${cRect.left + cRect.width / 2}px`;
            sparrow.style.top = `${cRect.top + cRect.height / 2}px`;
            sparrow.style.transform = 'scale(0.5) rotate(-45deg)';
            sparrow.style.opacity = '0';
        });
        setTimeout(() => {
            cartBtn.classList.add('cart-pulse');
            setTimeout(() => cartBtn.classList.remove('cart-pulse'), 500);
            sparrow.remove();
        }, 2500);
    }
}
function updateCartBadge() {
    document.querySelectorAll('.cart-count').forEach(b => b.innerText = cart.length);
}

// Contact Form
function initContactForm() {
    const form = document.querySelector('.contact-form form');
    const btn = document.querySelector('.submit-btn');
    if (btn && form) {
        btn.addEventListener('click', () => {
            let empty = false;
            form.querySelectorAll('input, textarea').forEach(i => { if (!i.value.trim()) empty = true; });
            if (empty) { alert('Please fill in all fields.'); return; }
            const orig = btn.innerText;
            btn.innerText = 'Sending...'; btn.disabled = true;
            setTimeout(() => {
                btn.innerText = 'Message Sent!'; btn.style.background = '#4CAF50';
                form.reset();
                setTimeout(() => { btn.innerText = orig; btn.style.background = 'var(--primary)'; btn.disabled = false; }, 2000);
            }, 1500);
        });
    }
}

// ============================================================
// YOUTUBE-STYLE PARTICLE CURSOR (Pure Vanilla Canvas)
// ============================================================
function initParticlesCursor() {
    // Create full-screen canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        pointer-events: none;
        z-index: 99999;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Resize canvas
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let isHovering = false;

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('a, button, .card-3d, .social-icon, .mobile-toggle')) {
            isHovering = true;
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('a, button, .card-3d, .social-icon, .mobile-toggle')) {
            isHovering = false;
        }
    });

    // Particle class
    class Particle {
        constructor(x, y) {
            this.x = x + (Math.random() - 0.5) * 8;
            this.y = y + (Math.random() - 0.5) * 8;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 1.5;
            this.speedY = (Math.random() - 0.5) * 1.5 - 0.5;
            this.life = 1.0; // opacity
            this.decay = Math.random() * 0.02 + 0.015;
            // Emerald, Cyan, White palette
            const colors = [
                `rgba(0,255,136,`,   // Emerald
                `rgba(0,236,255,`,   // Cyan
                `rgba(0,255,200,`,   // Aqua
                `rgba(100,255,200,`, // Light Emerald
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life -= this.decay;
            this.size *= 0.97;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(this.life, 0);
            ctx.fillStyle = `${this.color}${this.life})`;
            ctx.shadowColor = `${this.color}1)`;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(this.size, 0.1), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Cursor glow core
    class CursorCore {
        constructor() {
            this.x = mouse.x;
            this.y = mouse.y;
            this.targetX = mouse.x;
            this.targetY = mouse.y;
            this.size = 8;
        }
        update() {
            this.targetX = mouse.x;
            this.targetY = mouse.y;
            this.x += (this.targetX - this.x) * 0.25;
            this.y += (this.targetY - this.y) * 0.25;
        }
        draw() {
            const s = isHovering ? 14 : 8;
            // Outer glow ring
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = isHovering ? '#00ecff' : '#00ff88';
            ctx.shadowColor = isHovering ? '#00ecff' : '#00ff88';
            ctx.shadowBlur = 20;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, s + 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // Inner dot (follows with lerp)
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.fillStyle = isHovering ? '#00ecff' : '#00ff88';
            ctx.shadowColor = isHovering ? '#00ecff' : '#00ff88';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    const particles = [];
    const core = new CursorCore();
    let frameCount = 0;

    function animate() {
        // Clear canvas transparently so website is visible beneath
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Spawn particles every 2 frames
        if (frameCount % 2 === 0) {
            const count = isHovering ? 4 : 2;
            for (let i = 0; i < count; i++) {
                particles.push(new Particle(mouse.x, mouse.y));
            }
        }

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].life <= 0) particles.splice(i, 1);
        }

        // Draw cursor core last (on top)
        core.update();
        core.draw();

        frameCount++;
        requestAnimationFrame(animate);
    }

    // Click burst
    document.addEventListener('click', (e) => {
        for (let i = 0; i < 20; i++) {
            const p = new Particle(e.clientX, e.clientY);
            p.speedX = (Math.random() - 0.5) * 6;
            p.speedY = (Math.random() - 0.5) * 6;
            p.size = Math.random() * 5 + 2;
            p.decay = 0.025;
            particles.push(p);
        }
    });

    animate();
}
