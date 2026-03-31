document.addEventListener('DOMContentLoaded', () => {
    // 1. Smooth Scroll for internal links (overrides default CSS behavior for finer control)
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 2. Button Bounce/Scale up on Hover
    // Selecting both the hero CTA and the contact form submit button
    const buttons = document.querySelectorAll('.cta-button, .submit-button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            // Apply scale up with a slight bounce effect using a cubic-bezier easing
            button.style.transform = 'scale(1.08) translateY(-3px)';
            button.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
        
        button.addEventListener('mouseleave', () => {
            // Reset transform to let CSS handle the default state
            button.style.transform = '';
        });
    });

    // 3. Subtle Fade-In Animation for Sections on Scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Triggers when 15% of the section is visible
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                // If you want the animation to happen only once, uncomment the line below:
                // observer.unobserve(entry.target);
            } else {
                // Remove class when out of view to re-trigger animation on next scroll
                entry.target.classList.remove('is-visible');
            }
        });
    }, observerOptions);

    // Apply the fade-in utility class and start observing
    const sectionsToFade = document.querySelectorAll('section, .hero-content');
    sectionsToFade.forEach(section => {
        section.classList.add('fade-in-section');
        sectionObserver.observe(section);
    });

    // 5. Dealt Cards Logic & 3D Tilt
    const cards = document.querySelectorAll('.project-card');
    const portfolioSection = document.querySelector('.portfolio');
    
    // Dealing Animation
    if (cards.length > 0 && portfolioSection) {
        const dealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Portfolio is in view -> deal the cards!
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.remove('stacked');
                            
                            // Slight random rotation for organic physical look
                            const randomRot = (Math.random() * 6 - 3).toFixed(2); // -3deg to 3deg
                            card.style.transform = `rotate(${randomRot}deg)`;
                            
                            // Set CSS variable so the idle float animation inherits this exact original rotation relative baseline
                            card.style.setProperty('--idle-rot', `${randomRot}deg`);
                            card.classList.add('idle-float');
                            card.style.animationDelay = `${Math.random() * 2}s`; // Organic desynchronized float
                            
                        }, index * 200 + 300); // 200ms per card staggered deal, with a 300ms initial wait buffer
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        dealObserver.observe(portfolioSection);

        // 3D Tilt on Hover & Modal Expansion
        const modal = document.getElementById('projectModal');
        const modalBody = document.getElementById('modalBody');
        const modalClose = document.getElementById('modalClose');
        const modalOverlay = document.getElementById('modalOverlay');

        function openModal(card) {
            // Clone the card and strip interactive classes for a clean modal presentation
            const content = card.cloneNode(true);
            content.className = '';
            content.style = '';
            
            // Remove the fallback overlay from the modal
            const fallback = content.querySelector('.project-image-fallback');
            if (fallback) fallback.remove();

            // Populate modal
            modalBody.innerHTML = '';
            modalBody.appendChild(content);
            
            // Display modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Lock background scrolling
        }

        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            // Wait for fade out CSS transition to finish before destroying DOM nodes
            setTimeout(() => modalBody.innerHTML = '', 400); 
        }

        // Apply interactive listeners to each card
        cards.forEach(card => {
            // Mouse Movement for 3D Tilt Parallax
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Calculate tilt limits against center pivot
                const tiltX = (y / rect.height) * -12; 
                const tiltY = (x / rect.width) * 12;
                
                // Extract idle base rotate to blend effects cleanly on exit
                card.style.animationPlayState = 'paused';
                card.style.transition = 'transform 0.1s ease-out';
                card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.04)`;
            });
            
            // Revert back on Leave
            card.addEventListener('mouseleave', () => {
                const baseRot = card.style.getPropertyValue('--idle-rot') || '0deg';
                card.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.6s ease';
                card.style.transform = `translateY(0) rotate(${baseRot})`;
                card.style.animationPlayState = 'running';
            });

            // Expand to View Modal Project Level
            card.addEventListener('click', () => openModal(card));
        });

        // Modal triggers
        if (modalClose) modalClose.addEventListener('click', closeModal);
        if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
        
        // Escape accessibility handling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }
});

// 4. Full-page Loader Removal
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        // Small delay to ensure the beautiful animation is seen smoothly
        setTimeout(() => {
            loader.classList.add('loader-hidden');
            // Optional: Remove from DOM after transition completes (0.8s)
            setTimeout(() => {
                loader.style.display = 'none';
            }, 800);
        }, 400); // 400ms delay before fade out begins
    }
});

// 5. Theme Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    const rootEl = document.documentElement; // using standard <html> element

    // Load saved value
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'cyberpunk') {
        rootEl.setAttribute('data-theme', 'cyberpunk');
        updateToggleText(true);
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isCyber = rootEl.getAttribute('data-theme') === 'cyberpunk';
            if (isCyber) {
                rootEl.removeAttribute('data-theme');
                localStorage.setItem('portfolio-theme', 'light');
                updateToggleText(false);
            } else {
                rootEl.setAttribute('data-theme', 'cyberpunk');
                localStorage.setItem('portfolio-theme', 'cyberpunk');
                updateToggleText(true);
            }
        });
    }

    function updateToggleText(isCyber) {
        if (!toggleBtn) return;
        const label = toggleBtn.querySelector('.cyber-label');
        if (isCyber) {
            label.textContent = "LIGHT";
            toggleBtn.style.color = "var(--accent-primary-hover)";
        } else {
            label.textContent = "CYBER";
            toggleBtn.style.color = "var(--text-main)";
        }
    }
});
