/**
 * ============================================================
 * THREE.JS PORTFOLIO — Emmanuel Oluyemi
 * 3D Background Engine + UI Interactions
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ========================================================
       PRELOADER
    ======================================================== */
    const preloader = document.getElementById('preloader');
    const progFill = document.querySelector('.progress-fill');
    const loadTxt = document.querySelector('.load-percent');

    let pct = 0;
    const loadTick = setInterval(() => {
        pct += Math.random() * 18 + 2;
        if (pct >= 100) {
            pct = 100;
            clearInterval(loadTick);
            progFill.style.width = '100%';
            loadTxt.textContent = '100%';
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                    bootAnimations();
                }, 800);
            }, 400);
        }
        progFill.style.width = pct + '%';
        loadTxt.textContent = Math.floor(pct) + '%';
    }, 80);

    /* ========================================================
       THREE.JS — BACKGROUND SCENE
    ======================================================== */
    const bgCanvas = document.getElementById('bg-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas: bgCanvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 6);

    /* --- Mouse --- */
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener('mousemove', e => {
        mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.ty = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    /* --- Scroll --- */
    let scrollY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; });

    /* ---- LIGHTS ---- */
    scene.add(new THREE.AmbientLight(0x0a0a22, 4));

    const ptLight1 = new THREE.PointLight(0x00f5ff, 3, 25);
    ptLight1.position.set(6, 6, 4);
    scene.add(ptLight1);

    const ptLight2 = new THREE.PointLight(0x7b2fff, 3, 25);
    ptLight2.position.set(-6, -4, 4);
    scene.add(ptLight2);

    const ptLight3 = new THREE.PointLight(0xff006e, 2, 20);
    ptLight3.position.set(0, 6, -4);
    scene.add(ptLight3);

    /* ---- STAR PARTICLES ---- */
    const PARTICLE_COUNT = 2500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(PARTICLE_COUNT * 3);
    const pCol = new Float32Array(PARTICLE_COUNT * 3);

    const starColors = [
        new THREE.Color(0x00f5ff),
        new THREE.Color(0x7b2fff),
        new THREE.Color(0xff006e),
        new THREE.Color(0xffffff),
        new THREE.Color(0x00ff88),
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        pPos[i * 3 + 0] = (Math.random() - 0.5) * 120;
        pPos[i * 3 + 1] = (Math.random() - 0.5) * 120;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 120;
        const c = starColors[Math.floor(Math.random() * starColors.length)];
        pCol[i * 3 + 0] = c.r; pCol[i * 3 + 1] = c.g; pCol[i * 3 + 2] = c.b;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));

    const pMat = new THREE.PointsMaterial({
        size: 0.12,
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        sizeAttenuation: true,
    });

    const stars = new THREE.Points(pGeo, pMat);
    scene.add(stars);

    /* ---- MAIN CENTERPIECE — TORUS KNOT ---- */
    const tkGeo = new THREE.TorusKnotGeometry(1.6, 0.42, 220, 20, 3, 5);

    const tkMat = new THREE.MeshPhongMaterial({
        color: 0x00f5ff,
        emissive: 0x002233,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
    });

    const tkWireMat = new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        wireframe: true,
        transparent: true,
        opacity: 0.28,
    });

    const torusKnot = new THREE.Mesh(tkGeo, tkMat);
    const torusKnotWire = new THREE.Mesh(tkGeo, tkWireMat);
    [torusKnot, torusKnotWire].forEach(m => { m.position.set(3.5, 0, -1.5); scene.add(m); });

    /* ---- SECONDARY GEO: Icosahedron ---- */
    const icoMesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.4, 1),
        new THREE.MeshBasicMaterial({ color: 0x7b2fff, wireframe: true, transparent: true, opacity: 0.22 })
    );
    icoMesh.position.set(-4.5, 2.5, -2.5);
    scene.add(icoMesh);

    /* ---- Octahedron ---- */
    const octMesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.9, 0),
        new THREE.MeshPhongMaterial({ color: 0xff006e, emissive: 0x220011, wireframe: true, transparent: true, opacity: 0.45 })
    );
    octMesh.position.set(-3.2, -2.5, -0.5);
    scene.add(octMesh);

    /* ---- Orbiting rings around torus knot ---- */
    const makeRing = (radius, color, rotX, rotY) => {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(radius, 0.025, 16, 120),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35 })
        );
        ring.position.set(3.5, 0, -1.5);
        ring.rotation.x = rotX;
        ring.rotation.y = rotY;
        scene.add(ring);
        return ring;
    };

    const ring1 = makeRing(2.4, 0x00f5ff, Math.PI / 3, 0);
    const ring2 = makeRing(3.0, 0x7b2fff, 0, Math.PI / 4);
    const ring3 = makeRing(2.7, 0xff006e, Math.PI / 6, Math.PI / 3);

    /* ---- FLOATING CUBES ---- */
    const cubeColors = [0x00f5ff, 0x7b2fff, 0xff006e, 0x00ff88];
    const floaters = [];

    for (let i = 0; i < 12; i++) {
        const size = Math.random() * 0.28 + 0.08;
        const wire = Math.random() > 0.4;
        const col = cubeColors[i % cubeColors.length];

        const geo = i % 3 === 0
            ? new THREE.BoxGeometry(size, size, size)
            : i % 3 === 1
                ? new THREE.TetrahedronGeometry(size * 1.2)
                : new THREE.OctahedronGeometry(size * 0.9);

        const mat = new THREE.MeshPhongMaterial({
            color: col, emissive: col, emissiveIntensity: 0.25,
            transparent: true, opacity: wire ? 0.4 : 0.6, wireframe: wire
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
            (Math.random() - 0.5) * 14,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 8 - 2
        );

        mesh.userData = {
            rx: (Math.random() - 0.5) * 0.025,
            ry: (Math.random() - 0.5) * 0.025,
            fSpeed: Math.random() * 0.008 + 0.004,
            fOffset: Math.random() * Math.PI * 2,
            initY: mesh.position.y,
        };

        floaters.push(mesh);
        scene.add(mesh);
    }

    /* ---- DNA DOUBLE HELIX ---- */
    const helixSpheres = [];
    const helixGeo = new THREE.SphereGeometry(0.055, 8, 8);

    for (let i = 0; i < 50; i++) {
        const t = (i / 50) * Math.PI * 2 * 4;
        const y = (i / 50) * 7 - 3.5;
        const r = 0.55;

        const mat1 = new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.85 });
        const mat2 = new THREE.MeshBasicMaterial({ color: 0x7b2fff, transparent: true, opacity: 0.85 });

        const s1 = new THREE.Mesh(helixGeo, mat1);
        const s2 = new THREE.Mesh(helixGeo, mat2);

        s1.position.set(-5.5 + Math.cos(t) * r, y, Math.sin(t) * r - 1.5);
        s2.position.set(-5.5 + Math.cos(t + Math.PI) * r, y, Math.sin(t + Math.PI) * r - 1.5);

        helixSpheres.push({ mesh: s1, t, y, r, strand: 0 });
        helixSpheres.push({ mesh: s2, t, y, r, strand: 1 });

        scene.add(s1);
        scene.add(s2);
    }

    /* ---- GRID PLANE (subtle floor) ---- */
    const gridHelper = new THREE.GridHelper(40, 40, 0x00f5ff, 0x0a0a2a);
    gridHelper.position.y = -6;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.12;
    scene.add(gridHelper);

    /* ---- HERO 3D CANVAS (right panel) ---- */
    let heroScene, heroCamera, heroRenderer, heroClock;
    let heroMesh, heroWire;

    const heroCanvasEl = document.getElementById('hero-3d-canvas');
    if (heroCanvasEl) {
        heroRenderer = new THREE.WebGLRenderer({ canvas: heroCanvasEl, antialias: true, alpha: true });
        heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        heroRenderer.setClearColor(0x000000, 0);

        heroScene = new THREE.Scene();
        heroClock = new THREE.Clock();
        heroCamera = new THREE.PerspectiveCamera(60, heroCanvasEl.offsetWidth / heroCanvasEl.offsetHeight, 0.1, 100);
        heroCamera.position.set(0, 0, 4.5);

        // Dodecahedron solid
        const dGeo = new THREE.DodecahedronGeometry(1.6, 0);
        const dMat = new THREE.MeshPhongMaterial({
            color: 0x00f5ff, emissive: 0x001122,
            transparent: true, opacity: 0.18, side: THREE.DoubleSide
        });
        const dWire = new THREE.MeshBasicMaterial({
            color: 0x00f5ff, wireframe: true, transparent: true, opacity: 0.5
        });
        heroMesh = new THREE.Mesh(dGeo, dMat);
        heroWire = new THREE.Mesh(dGeo, dWire);
        heroScene.add(heroMesh);
        heroScene.add(heroWire);

        // Inner sphere
        const innerSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.7, 32, 32),
            new THREE.MeshPhongMaterial({ color: 0x7b2fff, emissive: 0x220033, transparent: true, opacity: 0.6 })
        );
        heroScene.add(innerSphere);

        // Orbiting small spheres
        const orbitSpheres = [];
        const orbitMats = [0x00f5ff, 0x7b2fff, 0xff006e, 0x00ff88];
        for (let i = 0; i < 8; i++) {
            const orb = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 12, 12),
                new THREE.MeshPhongMaterial({
                    color: orbitMats[i % 4], emissive: orbitMats[i % 4], emissiveIntensity: 0.5,
                    transparent: true, opacity: 0.9
                })
            );
            heroScene.add(orb);
            orbitSpheres.push({ mesh: orb, angle: (i / 8) * Math.PI * 2, radius: 2.2, speed: 0.5 + i * 0.07 });
        }

        // Lights for hero scene
        heroScene.add(new THREE.AmbientLight(0x0a0a33, 5));
        const hl1 = new THREE.PointLight(0x00f5ff, 4, 15);
        hl1.position.set(3, 3, 3);
        heroScene.add(hl1);
        const hl2 = new THREE.PointLight(0x7b2fff, 4, 15);
        hl2.position.set(-3, -3, 3);
        heroScene.add(hl2);

        // Hero canvas resize
        const resizeHero = () => {
            if (!heroCanvasEl.parentElement) return;
            const w = heroCanvasEl.parentElement.offsetWidth;
            const h = heroCanvasEl.parentElement.offsetHeight || 520;
            heroRenderer.setSize(w, h);
            heroCamera.aspect = w / h;
            heroCamera.updateProjectionMatrix();
        };
        resizeHero();
        window.addEventListener('resize', resizeHero);

        // Hero animate loop
        const animateHero = () => {
            requestAnimationFrame(animateHero);
            const t = heroClock.getElapsedTime();

            heroMesh.rotation.x = t * 0.28;
            heroMesh.rotation.y = t * 0.42;
            heroWire.rotation.x = t * 0.28;
            heroWire.rotation.y = t * 0.42;

            dMat.opacity = 0.15 + Math.sin(t * 1.8) * 0.07;
            dWire.opacity = 0.4 + Math.sin(t * 2.1) * 0.12;

            innerSphere.rotation.y = t * 0.6;
            innerSphere.scale.setScalar(1 + Math.sin(t * 3) * 0.05);

            orbitSpheres.forEach((orb, i) => {
                const ang = orb.angle + t * orb.speed;
                const tilt = Math.sin(t * 0.4 + i) * 0.5;
                orb.mesh.position.set(
                    Math.cos(ang) * orb.radius,
                    Math.sin(ang + tilt) * orb.radius * 0.4,
                    Math.sin(ang) * orb.radius
                );
            });

            hl1.position.x = Math.sin(t * 0.7) * 4;
            hl1.position.y = Math.cos(t * 0.5) * 4;

            heroRenderer.render(heroScene, heroCamera);
        };
        animateHero();
    }

    /* ---- MAIN ANIMATION LOOP ---- */
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Smooth mouse tracking
        mouse.x += (mouse.tx - mouse.x) * 0.055;
        mouse.y += (mouse.ty - mouse.y) * 0.055;

        // Camera parallax
        camera.position.x += (mouse.x * 0.45 - camera.position.x) * 0.045;
        camera.position.y += (mouse.y * 0.28 - camera.position.y) * 0.045;
        camera.position.z = 6 - scrollY * 0.0018;
        camera.lookAt(scene.position);

        // Stars slow drift
        stars.rotation.y = t * 0.025;
        stars.rotation.x = t * 0.008;

        // Torus knot
        torusKnot.rotation.x = t * 0.38;
        torusKnot.rotation.y = t * 0.28;
        torusKnotWire.rotation.x = t * 0.38;
        torusKnotWire.rotation.y = t * 0.28;
        tkMat.opacity = 0.1 + Math.sin(t * 1.8) * 0.05;
        tkWireMat.opacity = 0.24 + Math.sin(t * 1.4) * 0.08;

        // Rings
        ring1.rotation.z = t * 0.48;
        ring2.rotation.x = t * 0.35;
        ring3.rotation.y = t * 0.42;

        // Icosahedron
        icoMesh.rotation.x = t * 0.22;
        icoMesh.rotation.y = t * 0.35;

        // Octahedron
        octMesh.rotation.x = t * 0.55;
        octMesh.rotation.z = t * 0.32;

        // Floating objects
        floaters.forEach(f => {
            f.rotation.x += f.userData.rx;
            f.rotation.y += f.userData.ry;
            f.position.y = f.userData.initY + Math.sin(t * f.userData.fSpeed * 80 + f.userData.fOffset) * 0.6;
        });

        // DNA helix
        helixSpheres.forEach(item => {
            const ang = item.t + t * 0.55;
            if (item.strand === 0) {
                item.mesh.position.x = -5.5 + Math.cos(ang) * item.r;
                item.mesh.position.z = Math.sin(ang) * item.r - 1.5;
            } else {
                item.mesh.position.x = -5.5 + Math.cos(ang + Math.PI) * item.r;
                item.mesh.position.z = Math.sin(ang + Math.PI) * item.r - 1.5;
            }
        });

        // Moving lights
        ptLight1.position.x = Math.sin(t * 0.65) * 6;
        ptLight1.position.y = Math.cos(t * 0.48) * 5;
        ptLight2.position.x = Math.cos(t * 0.58) * 5;
        ptLight2.position.y = Math.sin(t * 0.72) * 5;

        // Color shift light1
        const hue = (t * 0.04) % 1;
        ptLight1.color.setHSL(hue, 1, 0.6);

        // Grid parallax
        gridHelper.position.z = -scrollY * 0.003;

        renderer.render(scene, camera);
    };

    animate();

    /* ---- RESIZE ---- */
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    /* ========================================================
       BOOT ANIMATIONS (after preloader)
    ======================================================== */
    function bootAnimations() {
        // Counter animation
        document.querySelectorAll('.stat-number').forEach(el => {
            const target = +el.dataset.count;
            let current = 0;
            const step = target / 60;
            const timer = setInterval(() => {
                current += step;
                if (current >= target) { current = target; clearInterval(timer); }
                el.textContent = Math.floor(current);
            }, 30);
        });

        // Typed.js
        if (typeof Typed !== 'undefined') {
            new Typed('#typing-text', {
                strings: [
                    'Backend Systems',
                    'REST APIs',
                    'Django Applications',
                    'Database Architectures',
                    'Web Scrapers',
                    'Automation Tools',
                    'Full-Stack Solutions',
                ],
                typeSpeed: 55,
                backSpeed: 35,
                loop: true,
                backDelay: 1600,
            });
        }
    }

    /* ========================================================
       NAVIGATION
    ======================================================== */
    const nav = document.getElementById('main-nav');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
        updateActiveNav();
    });

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('open');
        navLinks.classList.toggle('open');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('open');
            navLinks.classList.remove('open');
        });
    });

    function updateActiveNav() {
        const sections = document.querySelectorAll('.section');
        let current = 'home';

        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }

    /* ========================================================
       SCROLL REVEAL
    ======================================================== */
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal, .reveal-scale').forEach(el => revealObs.observe(el));

    /* ========================================================
       SKILL ORBS — Animate on scroll into view
    ======================================================== */
    const aboutSec = document.getElementById('about');
    let skillsDone = false;

    const skillObs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !skillsDone) {
            skillsDone = true;
            document.querySelectorAll('.skill-orb').forEach(orb => {
                const level = parseInt(orb.dataset.level);
                const fill  = orb.querySelector('.orb-fill');
                if (fill) {
                    const r      = 40;
                    const circ   = 2 * Math.PI * r; // ≈ 251.3
                    const offset = circ - (circ * level / 100);
                    // Initialise track circle too
                    const track  = orb.querySelector('.orb-track');
                    if (track) { track.setAttribute('r', r); }
                    fill.setAttribute('r', r);
                    fill.style.strokeDasharray  = circ;
                    fill.style.strokeDashoffset = circ;   // start hidden
                    // Trigger animation next frame
                    requestAnimationFrame(() => {
                        fill.style.strokeDashoffset = offset;
                    });
                }
            });
        }
    }, { threshold: 0.3 });

    if (aboutSec) skillObs.observe(aboutSec);

    /* ========================================================
       PORTFOLIO FILTER
    ======================================================== */
    const filterBtns = document.querySelectorAll('.f-btn');
    const portCards = document.querySelectorAll('.port-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            portCards.forEach(card => {
                const cat = card.dataset.cat;
                const show = filter === 'all' || cat === filter;
                card.style.display = show ? 'block' : 'none';
                card.style.animation = show ? 'scale-in 0.35s ease forwards' : 'none';
            });
        });
    });

    /* ========================================================
       3D CARD TILT (service cards)
    ======================================================== */
    document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rx = -(e.clientY - rect.top - cy) / 22;
            const ry = (e.clientX - rect.left - cx) / 22;
            card.style.transition = 'none';
            card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-10px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.55s cubic-bezier(0.4,0,0.2,1)';
            card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    /* ========================================================
       MOUSE GLOW CURSOR EFFECT
    ======================================================== */
    const cursor = document.createElement('div');
    cursor.id = 'cursor-glow';
    cursor.style.cssText = `
        position: fixed;
        width: 18px; height: 18px;
        border: 2px solid rgba(0,245,255,0.8);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        transform: translate(-50%, -50%);
        transition: width 0.2s, height 0.2s, opacity 0.2s;
        mix-blend-mode: screen;
    `;
    document.body.appendChild(cursor);

    const cursorTrail = document.createElement('div');
    cursorTrail.style.cssText = `
        position: fixed;
        width: 6px; height: 6px;
        background: var(--cyan, #00f5ff);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9997;
        transform: translate(-50%, -50%);
        transition: left 0.08s ease, top 0.08s ease;
        box-shadow: 0 0 8px rgba(0,245,255,0.8);
    `;
    document.body.appendChild(cursorTrail);

    let cX = 0, cY = 0;
    let tX = 0, tY = 0;

    window.addEventListener('mousemove', e => {
        tX = e.clientX; tY = e.clientY;
        cursorTrail.style.left = tX + 'px';
        cursorTrail.style.top = tY + 'px';
    });

    const tickCursor = () => {
        cX += (tX - cX) * 0.12;
        cY += (tY - cY) * 0.12;
        cursor.style.left = cX + 'px';
        cursor.style.top = cY + 'px';
        requestAnimationFrame(tickCursor);
    };
    tickCursor();

    // Expand cursor on hoverable elements
    document.querySelectorAll('a, button, [data-tilt], .port-card, .skill-orb').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '36px';
            cursor.style.height = '36px';
            cursor.style.borderColor = 'rgba(123, 47, 255, 0.8)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '18px';
            cursor.style.height = '18px';
            cursor.style.borderColor = 'rgba(0, 245, 255, 0.8)';
        });
    });

    /* ========================================================
       CONTACT FORM
    ======================================================== */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            const btn = contactForm.querySelector('.btn-send');
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check-circle"></i> Message Sent!';
            btn.style.background = 'linear-gradient(135deg, #00ff88, #00aa55)';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = orig;
                btn.style.background = '';
                btn.disabled = false;
                contactForm.reset();
            }, 3500);
        });
    }

    /* ========================================================
       PARTICLE BURST ON CLICK
    ======================================================== */
    document.addEventListener('click', e => {
        if (e.target.closest('a, button, input, textarea, select')) return;
        burst(e.clientX, e.clientY);
    });

    function burst(x, y) {
        const count = 10;
        for (let i = 0; i < count; i++) {
            const dot = document.createElement('div');
            const angle = (i / count) * Math.PI * 2;
            const dist = Math.random() * 60 + 20;
            dot.style.cssText = `
                position: fixed;
                left: ${x}px; top: ${y}px;
                width: 5px; height: 5px;
                background: ${['#00f5ff', '#7b2fff', '#ff006e'][i % 3]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transform: translate(-50%, -50%);
                transition: left 0.5s ease, top 0.5s ease, opacity 0.5s ease;
                box-shadow: 0 0 6px currentColor;
            `;
            document.body.appendChild(dot);

            requestAnimationFrame(() => {
                dot.style.left = (x + Math.cos(angle) * dist) + 'px';
                dot.style.top = (y + Math.sin(angle) * dist) + 'px';
                dot.style.opacity = '0';
            });

            setTimeout(() => dot.remove(), 600);
        }
    }

});
