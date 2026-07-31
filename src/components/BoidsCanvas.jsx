import { useEffect, useRef } from 'react';

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(v) {
        this.x += v.x;
        this.y += v.y;
    }
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
    }
    mult(n) {
        this.x *= n;
        this.y *= n;
    }
    div(n) {
        this.x /= n;
        this.y /= n;
    }
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        const m = this.mag();
        if (m !== 0) this.div(m);
    }
    limit(max) {
        if (this.mag() > max) {
            this.normalize();
            this.mult(max);
        }
    }
    heading() {
        return Math.atan2(this.y, this.x);
    }
    static sub(v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }
    static dist(v1, v2) {
        const dx = v1.x - v2.x;
        const dy = v1.y - v2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class Boid {
    constructor(x, y) {
        this.position = new Vector(x, y);
        this.velocity = new Vector((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
        this.acceleration = new Vector(0, 0);
        this.r = 4.5;
        this.maxForce = 0.05;
        this.maxSpeed = 2.5;
        this.flapSpeed = 0.8 + Math.random() * 0.6;
        this.flapOffset = Math.random() * Math.PI * 2;
    }

    applyForce(force) {
        this.acceleration.add(force);
    }

    flock(boids) {
        const sep = this.separate(boids);
        const ali = this.align(boids);
        const coh = this.cohesion(boids);
        sep.mult(1.5);
        ali.mult(1.0);
        coh.mult(1.0);
        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
    }

    update() {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        this.borders();
    }

    draw(ctx) {
        const theta = this.velocity.heading() + Math.PI / 2;
        const flap = Math.sin(performance.now() * 0.005 * this.flapSpeed + this.flapOffset);

        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(theta);

        ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        ctx.beginPath();
        ctx.moveTo(0, -this.r * 1.5);
        ctx.quadraticCurveTo(-this.r * 1.5, -this.r * 0.5, -this.r * 3.5, flap * this.r * 2.5);
        ctx.quadraticCurveTo(-this.r * 1.5, this.r * 0.5, 0, this.r * 2);
        ctx.quadraticCurveTo(this.r * 1.5, this.r * 0.5, this.r * 3.5, flap * this.r * 2.5);
        ctx.quadraticCurveTo(this.r * 1.5, -this.r * 0.5, 0, -this.r * 1.5);
        ctx.closePath();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.8)';
        ctx.stroke();

        ctx.restore();
    }

    borders() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (this.position.x < -this.r) this.position.x = w + this.r;
        if (this.position.y < -this.r) this.position.y = h + this.r;
        if (this.position.x > w + this.r) this.position.x = -this.r;
        if (this.position.y > h + this.r) this.position.y = -this.r;
    }

    separate(boids) {
        const desiredseparation = 25.0;
        const steer = new Vector(0, 0);
        let count = 0;
        for (const other of boids) {
            const d = Vector.dist(this.position, other.position);
            if (d > 0 && d < desiredseparation) {
                const diff = Vector.sub(this.position, other.position);
                diff.normalize();
                diff.div(d);
                steer.add(diff);
                count++;
            }
        }
        if (count > 0) {
            steer.div(count);
        }
        if (steer.mag() > 0) {
            steer.normalize();
            steer.mult(this.maxSpeed);
            steer.sub(this.velocity);
            steer.limit(this.maxForce);
        }
        return steer;
    }

    align(boids) {
        const neighbordist = 50;
        const sum = new Vector(0, 0);
        let count = 0;
        for (const other of boids) {
            const d = Vector.dist(this.position, other.position);
            if (d > 0 && d < neighbordist) {
                sum.add(other.velocity);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            sum.normalize();
            sum.mult(this.maxSpeed);
            const steer = Vector.sub(sum, this.velocity);
            steer.limit(this.maxForce);
            return steer;
        }
        return new Vector(0, 0);
    }

    cohesion(boids) {
        const neighbordist = 50;
        const sum = new Vector(0, 0);
        let count = 0;
        for (const other of boids) {
            const d = Vector.dist(this.position, other.position);
            if (d > 0 && d < neighbordist) {
                sum.add(other.position);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            return this.seek(sum);
        }
        return new Vector(0, 0);
    }

    seek(target) {
        const desired = Vector.sub(target, this.position);
        desired.normalize();
        desired.mult(this.maxSpeed);
        const steer = Vector.sub(desired, this.velocity);
        steer.limit(this.maxForce);
        return steer;
    }
}

function getTheme() {
    return document.documentElement.dataset.theme || 'dark';
}

export default function BoidsCanvas() {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const flockRef = useRef([]);
    const mouseRef = useRef(new Vector(0, 0));
    const isMouseDownRef = useRef(false);
    const rafRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const setup = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = window.innerWidth;
            const h = window.innerHeight;
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                ctxRef.current = ctx;
            }
            flockRef.current = [];
            const boidCount = Math.min(Math.floor(w / 15), 10);
            for (let i = 0; i < boidCount; i++) {
                flockRef.current.push(new Boid(Math.random() * w, Math.random() * h));
            }
        };

        setup();

        const onResize = () => setup();
        const onMouseMove = (e) => {
            mouseRef.current = new Vector(e.clientX, e.clientY);
        };
        const onMouseDown = () => (isMouseDownRef.current = true);
        const onMouseUp = () => (isMouseDownRef.current = false);

        window.addEventListener('resize', onResize);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);

        const loop = () => {
            const ctx = ctxRef.current;
            if (!ctx) {
                rafRef.current = requestAnimationFrame(loop);
                return;
            }

            const isLight = getTheme() === 'light';
            const w = window.innerWidth;
            const h = window.innerHeight;
            ctx.clearRect(0, 0, w, h);

            if (isLight) {
                const sun = { x: w - 110, y: 110, r: 80 };
                const sunRepelRadius = sun.r + 140;

                for (const boid of flockRef.current) {
                    boid.flock(flockRef.current);

                    const d = Vector.dist(boid.position, mouseRef.current);
                    if (isMouseDownRef.current) {
                        if (d > 0) {
                            const attractForce = boid.seek(mouseRef.current);
                            attractForce.mult(1.5);
                            boid.applyForce(attractForce);
                        }
                    } else if (d < 100) {
                        const repulse = Vector.sub(boid.position, mouseRef.current);
                        repulse.normalize();
                        repulse.mult(boid.maxSpeed * 1.5);
                        const steer = Vector.sub(repulse, boid.velocity);
                        steer.limit(boid.maxForce * 2);
                        boid.applyForce(steer);
                    }

                    const sunDx = boid.position.x - sun.x;
                    const sunDy = boid.position.y - sun.y;
                    const sunDist = Math.sqrt(sunDx * sunDx + sunDy * sunDy);
                    if (sunDist < sunRepelRadius && sunDist > 0) {
                        const strength = 1 - sunDist / sunRepelRadius;
                        const sunRepulse = new Vector(sunDx / sunDist, sunDy / sunDist);
                        sunRepulse.mult(boid.maxSpeed * (2 + 3 * strength));
                        const sunSteer = Vector.sub(sunRepulse, boid.velocity);
                        sunSteer.limit(boid.maxForce * (4 + 6 * strength));
                        boid.applyForce(sunSteer);
                    }

                    boid.update();

                    const afterDx = boid.position.x - sun.x;
                    const afterDy = boid.position.y - sun.y;
                    const afterDist = Math.sqrt(afterDx * afterDx + afterDy * afterDy);
                    const keepOutR = sun.r + 80;
                    if (afterDist < keepOutR && afterDist > 0) {
                        const ratio = keepOutR / afterDist;
                        boid.position.x = sun.x + afterDx * ratio;
                        boid.position.y = sun.y + afterDy * ratio;
                        const outward = new Vector(afterDx / afterDist, afterDy / afterDist);
                        outward.mult(boid.maxSpeed * 1.5);
                        boid.velocity = outward;
                    }

                    boid.draw(ctx);
                }
            }

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    return <canvas id="boids-canvas" ref={canvasRef} />;
}
