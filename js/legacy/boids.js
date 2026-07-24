(function () {
    const canvas = document.getElementById('boids-canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function getTheme() {
        return document.documentElement.dataset.theme || 'dark';
    }

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

        draw() {
            const theta = this.velocity.heading() + Math.PI / 2;
            const flap = Math.sin(Date.now() * 0.005 * this.flapSpeed + this.flapOffset);

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
            if (this.position.x < -this.r) this.position.x = canvas.width + this.r;
            if (this.position.y < -this.r) this.position.y = canvas.height + this.r;
            if (this.position.x > canvas.width + this.r) this.position.x = -this.r;
            if (this.position.y > canvas.height + this.r) this.position.y = -this.r;
        }

        separate(boids) {
            const desiredseparation = 25.0;
            const steer = new Vector(0, 0);
            let count = 0;
            for (let i = 0; i < boids.length; i++) {
                const other = boids[i];
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
            for (let i = 0; i < boids.length; i++) {
                const other = boids[i];
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
            for (let i = 0; i < boids.length; i++) {
                const other = boids[i];
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

    const flock = [];
    const boidCount = Math.min(Math.floor(window.innerWidth / 15), 10);
    for (let i = 0; i < boidCount; i++) {
        flock.push(new Boid(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    const mouse = new Vector(0, 0);
    let isMouseDown = false;

    window.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mousedown', function () {
        isMouseDown = true;
    });
    window.addEventListener('mouseup', function () {
        isMouseDown = false;
    });

    function getSun() {
        const bg = window.__background;
        if (bg && bg.getMoon) return bg.getMoon();
        return { x: canvas.width - 110, y: 110, r: 80 };
    }

    function animateBoids() {
        const isLight = getTheme() === 'light';
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (isLight) {
            const sun = getSun();
            const sunRepelRadius = sun.r + 140;

            for (let i = 0; i < flock.length; i++) {
                const boid = flock[i];
                boid.flock(flock);

                const d = Vector.dist(boid.position, mouse);
                if (isMouseDown) {
                    if (d > 0) {
                        const attractForce = boid.seek(mouse);
                        attractForce.mult(1.5);
                        boid.applyForce(attractForce);
                    }
                } else if (d < 100) {
                    const repulse = Vector.sub(boid.position, mouse);
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

                boid.draw();
            }
        }

        requestAnimationFrame(animateBoids);
    }

    animateBoids();
})();
