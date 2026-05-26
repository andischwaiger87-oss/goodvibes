import React, { useEffect, useRef } from 'react';

export default function AntigravityCursorEffect() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId;
        let particles = [];
        const mouse = { x: -1000, y: -1000, active: false, radius: 180 };
        const autoForce = { x: 0, y: 0, angle: 0 }; // Autopilot for mobile / idle

        // Adjust resolution
        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            
            initParticles();
        };

        // Class representing a particle (dot or heart)
        class Particle {
            constructor(x, y, isHeart = false) {
                this.x0 = x; // base position
                this.y0 = y;
                this.x = x + (Math.random() - 0.5) * 50; // current position
                this.y = y + (Math.random() - 0.5) * 50;
                this.vx = 0;
                this.vy = 0;
                
                this.isHeart = isHeart;
                this.size = isHeart ? Math.random() * 5 + 6 : Math.random() * 2 + 1.5;
                
                // Color palette based on GoodVibes CI
                const colors = [
                    'rgba(59, 130, 246, 0.45)',  // Blue-500
                    'rgba(99, 102, 241, 0.45)',  // Indigo-500
                    'rgba(168, 85, 247, 0.35)',  // Purple-500
                    'rgba(147, 197, 253, 0.5)'   // Blue-300
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.floatSpeed = Math.random() * 0.02 + 0.005;
                this.floatAngle = Math.random() * Math.PI * 2;
                this.floatRange = Math.random() * 15 + 5;
            }

            update() {
                // Physics params
                const spring = 0.03;
                const friction = 0.88;
                const repulsionStrength = 2.5;

                // 1. Gentle autonomous floating (slow circle/sine path)
                this.floatAngle += this.floatSpeed;
                const targetX = this.x0 + Math.cos(this.floatAngle) * this.floatRange;
                const targetY = this.y0 + Math.sin(this.floatAngle) * this.floatRange;

                // 2. Cursor interaction (repulsion)
                let dx = 0;
                let dy = 0;
                let dist = 99999;
                
                if (mouse.active) {
                    dx = this.x - mouse.x;
                    dy = this.y - mouse.y;
                    dist = Math.sqrt(dx * dx + dy * dy);
                } else {
                    // If idle or mobile, use autoForce (moving vortex)
                    dx = this.x - autoForce.x;
                    dy = this.y - autoForce.y;
                    dist = Math.sqrt(dx * dx + dy * dy);
                }

                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius; // 0 to 1
                    const angle = Math.atan2(dy, dx);
                    
                    // Push away
                    this.vx += Math.cos(angle) * force * repulsionStrength;
                    this.vy += Math.sin(angle) * force * repulsionStrength;
                }

                // Spring back to base floating target
                const ax = (targetX - this.x) * spring;
                const ay = (targetY - this.y) * spring;

                this.vx += ax;
                this.vy += ay;
                
                // Apply friction & speed
                this.vx *= friction;
                this.vy *= friction;
                this.x += this.vx;
                this.y += this.vy;
            }

            draw() {
                ctx.fillStyle = this.color;
                
                if (this.isHeart) {
                    // Draw a subtle heart
                    drawHeart(ctx, this.x, this.y, this.size);
                } else {
                    // Draw a regular dot
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // Draw a heart path
        const drawHeart = (c, x, y, size) => {
            c.beginPath();
            // Start at top center of the heart
            c.moveTo(x, y + size / 4);
            c.quadraticCurveTo(x, y - size / 4, x + size / 3, y - size / 4);
            c.quadraticCurveTo(x + size / 2, y - size / 4, x + size / 2, y + size / 4);
            c.quadraticCurveTo(x + size / 2, y + size / 4, x + size / 2, y + size / 4);
            c.quadraticCurveTo(x + size / 2, y - size / 4, x + size * 2/3, y - size / 4);
            c.quadraticCurveTo(x + size, y - size / 4, x + size, y + size / 4);
            c.quadraticCurveTo(x + size, y + size / 2, x + size / 2, y + size * 0.85);
            c.quadraticCurveTo(x, y + size / 2, x, y + size / 4);
            c.closePath();
            c.fill();
        };

        // Initialize particles
        const initParticles = () => {
            particles = [];
            const isMobile = window.innerWidth < 768;
            
            // Limit density on mobile to preserve resources
            const spacing = isMobile ? 85 : 55; 
            const cols = Math.floor(window.innerWidth / spacing);
            const rows = Math.floor(window.innerHeight / spacing);

            for (let i = 0; i <= cols; i++) {
                for (let j = 0; j <= rows; j++) {
                    const x = i * spacing + (Math.random() - 0.5) * 20;
                    const y = j * spacing + (Math.random() - 0.5) * 20;
                    
                    // Roughly 1 in 8 particles is a heart, others are dots
                    const isHeart = Math.random() < 0.12;
                    particles.push(new Particle(x, y, isHeart));
                }
            }
        };

        // Mouse listeners
        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.active = true;
        };

        const handleMouseLeave = () => {
            mouse.active = false;
            mouse.x = -1000;
            mouse.y = -1000;
        };

        const handleTouchMove = (e) => {
            if (e.touches.length > 0) {
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
                mouse.active = true;
            }
        };

        const handleTouchEnd = () => {
            mouse.active = false;
            mouse.x = -1000;
            mouse.y = -1000;
        };

        // Connect particles with subtle lines
        const drawConnections = () => {
            const maxDist = 90;
            ctx.lineWidth = 0.5;
            
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const p1 = particles[i];
                    const p2 = particles[j];
                    
                    // Simple bounding check
                    if (Math.abs(p1.x - p2.x) > maxDist || Math.abs(p1.y - p2.y) > maxDist) continue;
                    
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < maxDist) {
                        // Fade lines out based on distance
                        const alpha = (1 - (dist / maxDist)) * 0.08;
                        ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
        };

        // Animation Loop
        const animate = () => {
            // Check if page is hidden to save battery
            if (document.hidden) {
                animationFrameId = requestAnimationFrame(animate);
                return;
            }

            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            // Compute autocomplete autopilot position if mouse is inactive
            if (!mouse.active) {
                autoForce.angle += 0.015;
                // Path forms a smooth figure-eight loop across the screen
                const cx = window.innerWidth / 2;
                const cy = window.innerHeight / 2;
                autoForce.x = cx + Math.sin(autoForce.angle) * (window.innerWidth * 0.35);
                autoForce.y = cy + Math.sin(autoForce.angle * 2) * (window.innerHeight * 0.2);
            }

            // Draw network lines
            drawConnections();

            // Update & Draw particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        // Setup
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleTouchEnd);
        
        resizeCanvas();
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none"
            style={{ opacity: 0.85 }}
        />
    );
}
