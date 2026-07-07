/**
 * EMMANUEL OLUYEMI — PORTFOLIO ENGINE
 * 3D Ambient Canvas (Three.js) + UI Interactions
 * Clean, Creative, and Senior Design Engineering Pattern
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ========================================================
       1. PRELOADER STATE
    ======================================================== */
    const preloader = document.getElementById('preloader');
    const fill = document.querySelector('.preloader-fill');
    const text = document.querySelector('.preloader-text');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            fill.style.width = '100%';
            text.textContent = 'Ready';
            setTimeout(() => {
                preloader.classList.add('hidden');
                initScrollReveals();
            }, 300);
        } else {
            fill.style.width = `${Math.floor(progress)}%`;
            text.textContent = `Loading... ${Math.floor(progress)}%`;
        }
    }, 45);


    /* ========================================================
       2. THREE.JS — ORGANIC REFRACTIVE BLOB ENGINE
    ======================================================== */
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        let renderer, scene, camera, mesh, light1, light2, ambientLight;
        let clock = new THREE.Clock();
        
        // Mouse interaction targets
        let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        let scrollY = 0;
        let isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        function initThree() {
            // Scene Setup
            scene = new THREE.Scene();

            // Camera Setup
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
            camera.position.z = 8;

            // Renderer Setup
            renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(window.innerWidth, window.innerHeight);

            // Lighting Setup - Organic warm colors that fit light/dark themes
            ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.2 : 0.85);
            scene.add(ambientLight);

            light1 = new THREE.DirectionalLight(0xd25d38, isDark ? 2.5 : 1.5); // Rust accent color
            light1.position.set(5, 5, 2);
            scene.add(light1);

            light2 = new THREE.DirectionalLight(0x2f4858, isDark ? 2.0 : 0.8); // Deep Slate blue
            light2.position.set(-5, -5, 2);
            scene.add(light2);

            // Create geometry (Detailed Icosahedron for smooth vertex morphing)
            const geometry = new THREE.IcosahedronGeometry(2.0, 32);

            // Store original positions for math displacement
            const positionAttribute = geometry.attributes.position;
            const originalPositions = [];
            for (let i = 0; i < positionAttribute.count; i++) {
                originalPositions.push(new THREE.Vector3(
                    positionAttribute.getX(i),
                    positionAttribute.getY(i),
                    positionAttribute.getZ(i)
                ));
            }
            geometry.userData = { originalPositions };

            // Material - Clay / Pearl-like shader material simulation with physical material
            const material = new THREE.MeshPhysicalMaterial({
                color: isDark ? 0x18181b : 0xfcfbfa,
                roughness: 0.2,
                metalness: isDark ? 0.8 : 0.1,
                clearcoat: 0.8,
                clearcoatRoughness: 0.1,
                transmission: isDark ? 0.3 : 0.8, // Frosty glass refraction feel
                ior: 1.5,
                thickness: 1.5,
                side: THREE.DoubleSide
            });

            mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);

            // Event Listeners
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('scroll', onScroll);
            window.addEventListener('resize', onResize);

            animate();
        }

        function onMouseMove(event) {
            // Normalise mouse position
            mouse.targetX = (event.clientX / window.innerWidth) - 0.5;
            mouse.targetY = (event.clientY / window.innerHeight) - 0.5;
        }

        function onScroll() {
            scrollY = window.scrollY;
        }

        function onResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        // Custom mathematical noise function for organic vertex displacement
        // Combined sine waves simulate a 3D simplex-like wave system
        function morphGeometry(time) {
            const original = mesh.geometry.userData.originalPositions;
            const positionAttribute = mesh.geometry.attributes.position;
            const scrollFactor = scrollY * 0.0015;

            for (let i = 0; i < positionAttribute.count; i++) {
                const vertex = original[i].clone();

                // Compute noise-like wave displacements based on vertex position & time
                const waveX = Math.sin(vertex.x * 2.0 + time * 1.5 + scrollFactor) * 0.15;
                const waveY = Math.cos(vertex.y * 2.2 + time * 1.8 - scrollFactor) * 0.15;
                const waveZ = Math.sin(vertex.z * 1.8 + time * 1.2 + mouse.x * 2.0) * 0.15;

                // Push vertices outward along normal
                const displacement = waveX + waveY + waveZ;
                vertex.addScaledVector(vertex.clone().normalize(), displacement);

                // Update position
                positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
            }

            positionAttribute.needsUpdate = true;
            mesh.geometry.computeVertexNormals();
        }

        function animate() {
            requestAnimationFrame(animate);

            const elapsed = clock.getElapsedTime();

            // Smooth interpolation for mouse movements
            mouse.x += (mouse.targetX - mouse.x) * 0.08;
            mouse.y += (mouse.targetY - mouse.y) * 0.08;

            // Slow mesh rotation & orbit
            mesh.rotation.y = elapsed * 0.12 + mouse.x * 0.5;
            mesh.rotation.x = elapsed * 0.08 - mouse.y * 0.5;

            // Morph geometry
            morphGeometry(elapsed);

            // React mesh position and scale to scroll
            const scrollRatio = scrollY / (document.body.scrollHeight - window.innerHeight || 1);
            mesh.position.y = -scrollRatio * 3.5;
            mesh.position.x = Math.sin(elapsed * 0.25) * 0.5 + (mouse.x * 0.8);
            
            // Render
            renderer.render(scene, camera);
        }

        // Re-theme Three.js mesh & lighting on toggle
        window.updateThreeTheme = function(darkState) {
            isDark = darkState;
            if (!mesh) return;

            // Adjust lights strength and ambient properties
            ambientLight.intensity = isDark ? 0.3 : 0.85;
            light1.intensity = isDark ? 2.5 : 1.5;
            light2.intensity = isDark ? 2.0 : 0.8;

            // Interpolate materials properties
            mesh.material.color.setHex(isDark ? 0x18181b : 0xfcfbfa);
            mesh.material.metalness = isDark ? 0.8 : 0.1;
            mesh.material.transmission = isDark ? 0.3 : 0.8;
            mesh.material.needsUpdate = true;
        };

        initThree();
    }


    /* ========================================================
       3. TYPEWRITER / BURST TEXT
    ======================================================= */
    const typingSpan = document.getElementById('typing-text');
    if (typingSpan) {
        const roles = [
            'scalable backends.',
            'clean REST APIs.',
            'secure Django apps.',
            'efficient SQL code.',
            'automation scripts.'
        ];
        
        let roleIdx = 0;
        let charIdx = 0;
        let isDeleting = false;
        let typingSpeed = 70;

        function typeEffect() {
            const currentRole = roles[roleIdx];
            
            if (isDeleting) {
                charIdx--;
                typingSpeed = 35;
            } else {
                charIdx++;
                typingSpeed = 75;
            }

            typingSpan.textContent = currentRole.substring(0, charIdx);

            if (!isDeleting && charIdx === currentRole.length) {
                isDeleting = true;
                typingSpeed = 1600; // Pause at end of role
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                roleIdx = (roleIdx + 1) % roles.length;
                typingSpeed = 400; // Pause before typing next
            }

            setTimeout(typeEffect, typingSpeed);
        }
        
        setTimeout(typeEffect, 800);
    }


    /* ========================================================
       4. SCROLL INTERSECTION OBSERVERS (REVEALS)
    ======================================================== */
    function initScrollReveals() {
        const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Animate skill bars specifically if they enter view
                    if (entry.target.id === 'about') {
                        animateSkillBars();
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    }

    function animateSkillBars() {
        const skillFills = document.querySelectorAll('.skill-bar-fill');
        skillFills.forEach(fill => {
            const width = fill.getAttribute('data-width');
            fill.style.width = `${width}%`;
        });
    }

    // Scroll active link detection
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 160)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });

        // Add scroll class to navbar
        const navbar = document.getElementById('navbar');
        if (pageYOffset > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });


    /* ========================================================
       5. LIGHT / DARK MODE TOGGLE DRIVE
    ======================================================== */
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        // Initial setup from default state
        let currentTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        themeBtn.addEventListener('click', () => {
            let nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', nextTheme);
            localStorage.setItem('theme', nextTheme);
            
            // Push theme change to Three.js environment
            if (window.updateThreeTheme) {
                window.updateThreeTheme(nextTheme === 'dark');
            }
        });

        // Push early state to Three.js
        setTimeout(() => {
            if (window.updateThreeTheme) {
                window.updateThreeTheme(currentTheme === 'dark');
            }
        }, 500);
    }


    /* ========================================================
       6. CUSTOM CURSOR MOTION
    ======================================================== */
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    
    if (cursor && follower) {
        let mouseX = 0, mouseY = 0;
        let followX = 0, followY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = `${mouseX}px`;
            cursor.style.top = `${mouseY}px`;
        });

        function animateFollower() {
            followX += (mouseX - followX) * 0.12;
            followY += (mouseY - followY) * 0.12;
            follower.style.left = `${followX}px`;
            follower.style.top = `${followY}px`;
            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        // Detect hover over clickable elements
        const hoverables = document.querySelectorAll('a, button, [role="tab"], .project-card, .contact-card');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }


    /* ========================================================
       7. CLICK PARTICLE BURSTS (Dust/Sand Spray)
    ======================================================== */
    document.addEventListener('click', (e) => {
        // Exclude inputs, textarea or buttons
        if (e.target.closest('input, textarea, button, a')) return;

        createClickBurst(e.clientX, e.clientY);
    });

    function createClickBurst(x, y) {
        const particleCount = 8;
        const container = document.body;
        const color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const angle = (i / particleCount) * Math.PI * 2 + (Math.random() * 0.4);
            const speed = Math.random() * 45 + 15;
            
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 4px;
                height: 4px;
                background-color: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 10005;
                opacity: 0.75;
                transition: transform 0.6s var(--ease-out-expo), opacity 0.6s var(--ease-out-expo);
            `;
            container.appendChild(particle);

            // Let them shoot outwards next frame
            requestAnimationFrame(() => {
                const moveX = Math.cos(angle) * speed;
                const moveY = Math.sin(angle) * speed;
                particle.style.transform = `translate(${moveX}px, ${moveY}px) scale(0.2)`;
                particle.style.opacity = '0';
            });

            // Cleanup
            setTimeout(() => {
                particle.remove();
            }, 600);
        }
    }


    /* ========================================================
       8. PROJECT FILTER LOGIC
    ======================================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const cardCat = card.getAttribute('data-category');
                
                // Set scale out or in smoothly
                if (filterValue === 'all' || cardCat === filterValue) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.92)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 400);
                }
            });
        });
    });


    /* ========================================================
       9. MOBILE NAV MENU DRIVE
    ======================================================== */
    const burger = document.getElementById('nav-burger');
    const mobileMenu = document.getElementById('nav-mobile');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (burger && mobileMenu) {
        burger.addEventListener('click', () => {
            const isOpen = burger.classList.toggle('open');
            burger.setAttribute('aria-expanded', isOpen);
            mobileMenu.classList.toggle('open', isOpen);
            mobileMenu.setAttribute('aria-hidden', !isOpen);
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('open');
                burger.setAttribute('aria-expanded', 'false');
                mobileMenu.classList.remove('open');
                mobileMenu.setAttribute('aria-hidden', 'true');
            });
        });
    }


    /* ========================================================
       10. COUNTER ANIMATION FOR STATS
    ======================================================== */
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            updateCounter();
        });
    }

    // Trigger counter animation when hero section is visible
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counterObserver.observe(heroSection);
    }


    /* ========================================================
       11. CONTACT FORM HANDLING
    ======================================================== */
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success');

    if (form && successMsg) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Trigger simple loading feedback on button
            const submitBtn = form.querySelector('.btn-submit');
            const submitBtnText = submitBtn.querySelector('.btn-text');
            const origText = submitBtnText.textContent;
            
            submitBtnText.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Simulate form submission to backend
            setTimeout(() => {
                form.reset();
                submitBtnText.textContent = origText;
                submitBtn.disabled = false;
                
                successMsg.removeAttribute('hidden');
                
                setTimeout(() => {
                    successMsg.setAttribute('hidden', 'true');
                }, 5000);
            }, 1200);
        });
    }

    // Update footer year dynamically
    const footerYear = document.getElementById('footer-year');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

});
