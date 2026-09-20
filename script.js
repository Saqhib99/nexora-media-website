/* ==========================================================================
   Nexora Media Premium Website JavaScript
   --------------------------------------------------------------------------
   Handles theme switching, custom cursor, loader, navigation states,
   scroll reveals, portfolio video visibility, form submission through Web3Forms,
   hover interactions, accessibility utilities, and performance-friendly effects.
   ========================================================================== */

(function () {
    "use strict";

    const CONFIG = {
        web3FormsEndpoint: "https://api.web3forms.com/submit",
        web3FormsAccessKey: "60cc9899-4534-4f25-9763-e1108e316908",
        whatsappUrl: "https://wa.me/918882722257?text=Hi%20Nexora%20Media,%20I'm%20interested%20in%20your%20services.",
        mobileCursorBreakpoint: 900,
        loaderDuration: 1500,
        navShrinkPoint: 60,
        revealRootMargin: "0px 0px -12% 0px",
        revealThreshold: 0.16,
        videoThreshold: 0.62,
        tiltStrength: 9,
        magneticStrength: 0.26
    };

    const qs = (selector, scope = document) => scope.querySelector(selector);
    const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const state = {
        cursorEnabled: false,
        activeSection: "home",
        prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        rafCursor: null,
        mouse: {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            ringX: window.innerWidth / 2,
            ringY: window.innerHeight / 2
        }
    };

    function init() {
        document.documentElement.classList.remove("no-js");
        initTheme();
        initLoader();
        initNavigation();
        initScrollProgress();
        initRevealAnimations();
        initTextReveal();
        initTiltCards();
        initMagneticButtons();
        initRippleButtons();
        initFaq();
        initPortfolioVideos();
        initContactForm();
        initFloatingActions();
        initParallax();
        initCustomCursor();
        initCurrentYear();
        initKeyboardEnhancements();
        initAnalyticsPlaceholder();
    }

    /* ----------------------------------------------------------------------
       Theme
       ---------------------------------------------------------------------- */

    function initTheme() {
        const themeToggle = qs("#theme-toggle");
        const savedTheme = localStorage.getItem("nexora-theme");
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const firstTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

        applyTheme(firstTheme, false);

        if (!themeToggle) return;

        themeToggle.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme") || "light";
            const next = current === "dark" ? "light" : "dark";
            applyTheme(next, true);
        });

        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
            const stored = localStorage.getItem("nexora-theme");
            if (!stored) {
                applyTheme(event.matches ? "dark" : "light", false);
            }
        });
    }

    function applyTheme(theme, persist) {
        const safeTheme = theme === "dark" ? "dark" : "light";
        const themeToggle = qs("#theme-toggle");

        document.documentElement.setAttribute("data-theme", safeTheme);
        document.documentElement.style.colorScheme = safeTheme;
        updateThemeLogos(safeTheme);

        if (persist) {
            localStorage.setItem("nexora-theme", safeTheme);
        }

        if (themeToggle) {
            themeToggle.setAttribute("aria-pressed", String(safeTheme === "dark"));
            themeToggle.setAttribute(
                "aria-label",
                safeTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            );
        }
    }

    function updateThemeLogos(theme) {
        qsa("img[data-logo-light][data-logo-dark]").forEach((logo) => {
            const lightLogo = logo.getAttribute("data-logo-light");
            const darkLogo = logo.getAttribute("data-logo-dark");
            const nextLogo = theme === "dark" ? darkLogo : lightLogo;

            if (nextLogo && logo.getAttribute("src") !== nextLogo) {
                logo.setAttribute("src", nextLogo);
            }
        });
    }

    /* ----------------------------------------------------------------------
       Loading Screen
       ---------------------------------------------------------------------- */

    function initLoader() {
        const loader = qs("#site-loader") || qs("#page-loader") || qs(".loader");
        if (!loader) return;

        const removeLoader = () => {
            loader.classList.add("is-hidden");
            loader.setAttribute("aria-hidden", "true");
            setTimeout(() => {
                loader.remove();
                document.body.classList.add("site-ready");
                document.body.classList.add("is-loaded");
            }, 620);
        };

        if (state.prefersReducedMotion) {
            removeLoader();
            return;
        }

        window.addEventListener("load", () => {
            setTimeout(removeLoader, CONFIG.loaderDuration);
        }, { once: true });

        setTimeout(removeLoader, CONFIG.loaderDuration + 2400);
    }

    /* ----------------------------------------------------------------------
       Navigation
       ---------------------------------------------------------------------- */

    function initNavigation() {
        const header = qs("#site-header");
        const navToggle = qs("#nav-toggle") || qs(".nav-toggle");
        const navMenu = qs("#nav-menu") || qs("#primary-navigation") || qs(".nav-panel");
        const navLinks = qsa(".nav-link");
        const sections = qsa("main section[id]");

        if (!header) return;

        const onScroll = () => {
            const scrolled = window.scrollY > CONFIG.navShrinkPoint;
            header.classList.toggle("is-scrolled", scrolled);
            header.classList.toggle("scrolled", scrolled);
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });

        if (navToggle && navMenu) {
            navToggle.addEventListener("click", () => {
                const isOpen = navToggle.getAttribute("aria-expanded") === "true";
                navToggle.setAttribute("aria-expanded", String(!isOpen));
                navMenu.classList.toggle("is-open", !isOpen);
                document.body.classList.toggle("nav-open", !isOpen);
                document.body.classList.toggle("menu-open", !isOpen);
            });

            navLinks.forEach((link) => {
                link.addEventListener("click", () => closeMobileNav(navToggle, navMenu));
            });

            document.addEventListener("keydown", (event) => {
                if (event.key === "Escape") {
                    closeMobileNav(navToggle, navMenu);
                }
            });
        }

        if ("IntersectionObserver" in window && sections.length) {
            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    state.activeSection = entry.target.id;
                    updateActiveNav(navLinks, entry.target.id);
                });
            }, {
                root: null,
                threshold: 0.42
            });

            sections.forEach((section) => sectionObserver.observe(section));
        } else {
            window.addEventListener("scroll", () => {
                const current = sections
                    .map((section) => ({
                        id: section.id,
                        top: Math.abs(section.getBoundingClientRect().top)
                    }))
                    .sort((a, b) => a.top - b.top)[0];

                if (current) updateActiveNav(navLinks, current.id);
            }, { passive: true });
        }

        qsa('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", (event) => {
                const targetId = anchor.getAttribute("href");
                if (!targetId || targetId === "#") return;

                const target = qs(targetId);
                if (!target) return;

                event.preventDefault();
                target.scrollIntoView({ behavior: state.prefersReducedMotion ? "auto" : "smooth" });
                history.pushState(null, "", targetId);
            });
        });
    }

    function closeMobileNav(toggle, menu) {
        if (!toggle || !menu) return;
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        document.body.classList.remove("menu-open");
    }

    function updateActiveNav(navLinks, sectionId) {
        navLinks.forEach((link) => {
            const isActive = link.getAttribute("href") === `#${sectionId}`;
            link.classList.toggle("is-active", isActive);
            link.classList.toggle("active", isActive);
            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    /* ----------------------------------------------------------------------
       Scroll Progress
       ---------------------------------------------------------------------- */

    function initScrollProgress() {
        const progress = qs("#scroll-progress") || qs(".scroll-progress-bar");
        if (!progress) return;

        const updateProgress = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progressValue = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
            progress.style.transform = `scaleX(${clamp(progressValue, 0, 1)})`;
        };

        updateProgress();
        window.addEventListener("scroll", updateProgress, { passive: true });
        window.addEventListener("resize", updateProgress);
    }

    /* ----------------------------------------------------------------------
       Reveal Effects
       ---------------------------------------------------------------------- */

    function initRevealAnimations() {
        const revealItems = qsa(".reveal, [data-reveal], .service-card, .work-card, .feature-card, .timeline-step, .contact-form, .contact-card, .faq-item");
        if (!revealItems.length) return;

        if (state.prefersReducedMotion || !("IntersectionObserver" in window)) {
            revealItems.forEach((item) => item.classList.add("is-visible"));
            return;
        }

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, {
            root: null,
            rootMargin: CONFIG.revealRootMargin,
            threshold: CONFIG.revealThreshold
        });

        revealItems.forEach((item, index) => {
            item.style.setProperty("--reveal-delay", `${Math.min(index * 42, 420)}ms`);
            revealObserver.observe(item);
        });
    }

    function initTextReveal() {
        const textItems = qsa("[data-text-reveal]");
        if (!textItems.length || state.prefersReducedMotion) return;

        textItems.forEach((item) => {
            const text = item.textContent.trim();
            const words = text.split(/\s+/);
            item.textContent = "";
            item.setAttribute("aria-label", text);

            words.forEach((word, index) => {
                const span = document.createElement("span");
                span.className = "word-reveal";
                span.style.setProperty("--word-index", index);
                span.textContent = `${word} `;
                item.appendChild(span);
            });
        });
    }

    /* ----------------------------------------------------------------------
       Tilt Cards
       ---------------------------------------------------------------------- */

    function initTiltCards() {
        const tiltItems = qsa("[data-tilt], [data-tilt-card], .tilt-card, .service-card, .work-card, .feature-card");
        if (!tiltItems.length || state.prefersReducedMotion) return;

        tiltItems.forEach((card) => {
            card.addEventListener("pointermove", (event) => {
                if (event.pointerType === "touch") return;

                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;
                const rotateY = (x - 0.5) * CONFIG.tiltStrength;
                const rotateX = (0.5 - y) * CONFIG.tiltStrength;
                const glowX = `${x * 100}%`;
                const glowY = `${y * 100}%`;

                card.style.setProperty("--tilt-x", `${rotateX}deg`);
                card.style.setProperty("--tilt-y", `${rotateY}deg`);
                card.style.setProperty("--glow-x", glowX);
                card.style.setProperty("--glow-y", glowY);
                card.classList.add("is-tilting");
            });

            card.addEventListener("pointerleave", () => {
                card.style.setProperty("--tilt-x", "0deg");
                card.style.setProperty("--tilt-y", "0deg");
                card.classList.remove("is-tilting");
            });
        });
    }

    /* ----------------------------------------------------------------------
       Magnetic Buttons
       ---------------------------------------------------------------------- */

    function initMagneticButtons() {
        const magneticItems = qsa(".magnetic-button, .magnetic-link");
        if (!magneticItems.length || state.prefersReducedMotion) return;

        magneticItems.forEach((item) => {
            item.addEventListener("pointermove", (event) => {
                if (event.pointerType === "touch") return;

                const rect = item.getBoundingClientRect();
                const deltaX = event.clientX - rect.left - rect.width / 2;
                const deltaY = event.clientY - rect.top - rect.height / 2;

                item.style.transform = `translate3d(${deltaX * CONFIG.magneticStrength}px, ${deltaY * CONFIG.magneticStrength}px, 0)`;
            });

            item.addEventListener("pointerleave", () => {
                item.style.transform = "";
            });
        });
    }

    /* ----------------------------------------------------------------------
       Ripple Effects
       ---------------------------------------------------------------------- */

    function initRippleButtons() {
        qsa("[data-ripple]").forEach((button) => {
            button.addEventListener("click", (event) => {
                const rect = button.getBoundingClientRect();
                const ripple = document.createElement("span");
                const size = Math.max(rect.width, rect.height);

                ripple.className = "button-ripple";
                ripple.style.width = `${size}px`;
                ripple.style.height = `${size}px`;
                ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
                ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

                button.appendChild(ripple);
                ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
            });
        });
    }

    /* ----------------------------------------------------------------------
       FAQ
       ---------------------------------------------------------------------- */

    function initFaq() {
        const faqItems = qsa(".faq-item");
        if (!faqItems.length) return;

        const closeItem = (item) => {
            const button = qs(".faq-question", item);
            const answer = qs(".faq-answer", item);
            if (!button || !answer) return;

            button.setAttribute("aria-expanded", "false");
            answer.style.maxHeight = "0px";
            item.classList.remove("is-open");
        };

        const openItem = (item) => {
            const button = qs(".faq-question", item);
            const answer = qs(".faq-answer", item);
            if (!button || !answer) return;

            item.classList.add("is-open");
            button.setAttribute("aria-expanded", "true");
            answer.style.maxHeight = `${answer.scrollHeight}px`;
        };

        faqItems.forEach((item) => {
            const button = qs(".faq-question", item);
            const answer = qs(".faq-answer", item);

            if (!button || !answer) return;
            answer.style.maxHeight = "0px";

            button.addEventListener("click", () => {
                const isOpen = button.getAttribute("aria-expanded") === "true";

                faqItems.forEach((otherItem) => {
                    if (otherItem !== item) closeItem(otherItem);
                });

                if (isOpen) {
                    closeItem(item);
                } else {
                    openItem(item);
                }
            });

            button.addEventListener("keydown", (event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                button.click();
            });
        });

        window.addEventListener("resize", () => {
            qsa(".faq-item.is-open .faq-answer").forEach((answer) => {
                answer.style.maxHeight = `${answer.scrollHeight}px`;
            });
        });
    }

    /* ----------------------------------------------------------------------
       Portfolio Videos
       ---------------------------------------------------------------------- */

    function initPortfolioVideos() {
        const videoFrames = qsa(".work-frame iframe, .video-frame iframe");
        if (!videoFrames.length) return;

        videoFrames.forEach((iframe) => {
            iframe.setAttribute("loading", "lazy");
            iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
        });

        if (!("IntersectionObserver" in window)) return;

        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const iframe = qs("iframe", entry.target);
                if (!iframe || !iframe.contentWindow) return;

                if (entry.isIntersecting) {
                    entry.target.classList.add("is-playing");
                    postYouTubeCommand(iframe, "playVideo");
                } else {
                    entry.target.classList.remove("is-playing");
                    postYouTubeCommand(iframe, "pauseVideo");
                }
            });
        }, {
            threshold: CONFIG.videoThreshold
        });

        qsa(".work-card").forEach((card) => videoObserver.observe(card));
    }

    function postYouTubeCommand(iframe, command) {
        try {
            iframe.contentWindow.postMessage(
                JSON.stringify({
                    event: "command",
                    func: command,
                    args: []
                }),
                "*"
            );
        } catch (error) {
            console.warn("Nexora Media video command was skipped:", error);
        }
    }

    /* ----------------------------------------------------------------------
       Contact Form + Web3Forms
       ---------------------------------------------------------------------- */

    function initContactForm() {
        const form = qs("#contact-form");
        if (!form) return;

        const submitButton = qs("#submit-button", form) || qs('button[type="submit"]', form);
        const status = qs("#form-status");
        const accessKeyField = qs('input[name="access_key"]', form);

        if (accessKeyField && CONFIG.web3FormsAccessKey !== "YOUR_WEB3FORMS_ACCESS_KEY") {
            accessKeyField.value = CONFIG.web3FormsAccessKey;
        }

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            clearFormErrors(form);
            const validation = validateForm(form);

            if (!validation.isValid) {
                showFormStatus(status, "Please complete all required fields correctly.", "error");
                focusFirstInvalidField(form);
                return;
            }

            if (accessKeyField && accessKeyField.value === "YOUR_WEB3FORMS_ACCESS_KEY") {
                showFormStatus(status, "Please replace YOUR_WEB3FORMS_ACCESS_KEY in index.html before testing the live form.", "error");
                focusFirstInvalidField(form);
                return;
            }

            setFormLoading(submitButton, true);
            showFormStatus(status, "Sending your inquiry...", "loading");

            try {
                const formData = new FormData(form);
                formData.append("from_name", "Nexora Media Website");
                formData.append("subject", "New Nexora Media Website Inquiry");

                const response = await fetch(CONFIG.web3FormsEndpoint, {
                    method: "POST",
                    body: formData
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Unable to send inquiry.");
                }

                form.reset();
                showFormStatus(status, "Your inquiry has been sent successfully.", "success");
                openSuccessModal();

            } catch (error) {
                console.error(error);
                showFormStatus(status, "Something went wrong. You can still contact Nexora Media by WhatsApp or email.", "error");
            } finally {
                setFormLoading(submitButton, false);
            }
        });
    }

    function validateForm(form) {
        const requiredFields = qsa("[required]", form);
        let isValid = true;

        requiredFields.forEach((field) => {
            const value = field.value.trim();
            let fieldValid = Boolean(value);

            if (field.type === "email" && value) {
                fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            }

            if (field.type === "tel" && value) {
                fieldValid = /^[0-9+\-\s()]{7,20}$/.test(value);
            }

            if (!fieldValid) {
                isValid = false;
                markFieldInvalid(field);
            }
        });

        return { isValid };
    }

    function markFieldInvalid(field) {
        field.classList.add("is-invalid");
        field.setAttribute("aria-invalid", "true");

        const fieldGroup = field.closest(".form-field") || field.closest(".form-group");
        if (!fieldGroup) return;

        fieldGroup.classList.add("has-error");

        let message = qs(".error-message", fieldGroup) || qs(".field-error", fieldGroup);
        if (!message) {
            message = document.createElement("p");
            message.className = "error-message field-error";
            fieldGroup.appendChild(message);
        }

        message.textContent = field.type === "email"
            ? "Please enter a valid email address."
            : field.type === "tel"
                ? "Please enter a valid phone number."
                : "This field is required.";
    }

    function clearFormErrors(form) {
        qsa(".is-invalid", form).forEach((field) => {
            field.classList.remove("is-invalid");
            field.removeAttribute("aria-invalid");
        });

        qsa(".form-field.has-error", form).forEach((group) => group.classList.remove("has-error"));
        qsa(".error-message", form).forEach((message) => {
            if (message.classList.contains("field-error")) {
                message.remove();
            } else {
                message.textContent = "";
            }
        });
    }

    function focusFirstInvalidField(form) {
        const invalid = qs(".is-invalid", form);
        if (invalid) invalid.focus({ preventScroll: false });
    }

    function showFormStatus(status, message, type) {
        if (!status) return;
        status.textContent = message;
        status.dataset.state = type;
    }

    function setFormLoading(button, isLoading) {
        if (!button) return;
        const form = button.closest("form");
        if (form) form.classList.toggle("is-submitting", isLoading);
        button.disabled = isLoading;
        button.classList.toggle("is-loading", isLoading);

        const label = qs(".button-label", button) || qs(".submit-text", button);
        if (label) label.textContent = isLoading ? "Sending..." : "Send Inquiry";
    }

    function openSuccessModal() {
        const modal = qs("#success-modal");
        if (!modal) return;

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");

        const closeButton = qs("[data-close-modal]", modal);
        if (closeButton) closeButton.focus();

        qsa("[data-close-modal]", modal).forEach((control) => {
            control.addEventListener("click", closeSuccessModal, { once: true });
        });

        document.addEventListener("keydown", closeModalWithEscape);
    }

    function closeSuccessModal() {
        const modal = qs("#success-modal");
        if (!modal) return;

        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        document.removeEventListener("keydown", closeModalWithEscape);
    }

    function closeModalWithEscape(event) {
        if (event.key === "Escape") closeSuccessModal();
    }

    /* ----------------------------------------------------------------------
       Floating Actions
       ---------------------------------------------------------------------- */

    function initFloatingActions() {
        const scrollTop = qs("#scroll-top");
        const floatingActions = qs(".floating-actions");

        if (scrollTop) {
            scrollTop.addEventListener("click", () => {
                window.scrollTo({
                    top: 0,
                    behavior: state.prefersReducedMotion ? "auto" : "smooth"
                });
            });
        }

        const updateFloatingState = () => {
            const shouldShow = window.scrollY > 520;
            if (floatingActions) floatingActions.classList.toggle("is-visible", shouldShow);
            if (scrollTop) scrollTop.classList.toggle("is-visible", shouldShow);
        };

        updateFloatingState();
        window.addEventListener("scroll", updateFloatingState, { passive: true });
    }

    /* ----------------------------------------------------------------------
       Parallax
       ---------------------------------------------------------------------- */

    function initParallax() {
        const parallaxItems = qsa("[data-parallax], [data-parallax-layer]");
        if (!parallaxItems.length || state.prefersReducedMotion) return;

        let ticking = false;

        const updateParallax = () => {
            const scrollY = window.scrollY;

            parallaxItems.forEach((item) => {
                const speed = parseFloat(item.dataset.parallax || item.dataset.parallaxLayer || "0.08");
                const rect = item.getBoundingClientRect();
                const offset = (rect.top + scrollY - scrollY) * speed;
                item.style.transform = `translate3d(0, ${offset * -0.18}px, 0)`;
            });

            ticking = false;
        };

        window.addEventListener("scroll", () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(updateParallax);
        }, { passive: true });
    }

    /* ----------------------------------------------------------------------
       Custom Cursor
       ---------------------------------------------------------------------- */

    function initCustomCursor() {
        const dot = qs("#cursor-dot") || qs(".cursor-dot");
        const ring = qs("#cursor-ring") || qs(".cursor-ring");

        if (!dot || !ring) return;

        const canUseCursor = window.matchMedia(`(min-width: ${CONFIG.mobileCursorBreakpoint}px)`).matches &&
            window.matchMedia("(pointer: fine)").matches &&
            !state.prefersReducedMotion;

        if (!canUseCursor) {
            dot.remove();
            ring.remove();
            document.documentElement.classList.add("native-cursor");
            return;
        }

        state.cursorEnabled = true;
        document.documentElement.classList.add("custom-cursor-active");
        document.body.classList.add("cursor-ready");

        window.addEventListener("pointermove", (event) => {
            state.mouse.x = event.clientX;
            state.mouse.y = event.clientY;

            dot.style.transform = `translate3d(${state.mouse.x}px, ${state.mouse.y}px, 0) translate(-50%, -50%)`;

            if (!state.rafCursor) {
                state.rafCursor = requestAnimationFrame(renderCursorRing);
            }
        }, { passive: true });

        document.addEventListener("pointerover", (event) => {
            const target = event.target;
            if (!(target instanceof Element)) return;

            const interactive = target.closest("a, button, input, textarea, select, .service-card, .work-card, .feature-card, .faq-question");
            ring.classList.toggle("is-interactive", Boolean(interactive));
            dot.classList.toggle("is-interactive", Boolean(interactive));
            document.body.classList.toggle("cursor-hover", Boolean(interactive));
            document.body.classList.toggle("cursor-view", Boolean(target.closest(".work-card, .hero-visual")));
        });

        document.addEventListener("pointerdown", () => {
            ring.classList.add("is-pressed");
        });

        document.addEventListener("pointerup", () => {
            ring.classList.remove("is-pressed");
        });
    }

    function renderCursorRing() {
        const ring = qs("#cursor-ring") || qs(".cursor-ring");
        if (!ring) return;

        const ease = 0.16;
        state.mouse.ringX += (state.mouse.x - state.mouse.ringX) * ease;
        state.mouse.ringY += (state.mouse.y - state.mouse.ringY) * ease;

        ring.style.transform = `translate3d(${state.mouse.ringX}px, ${state.mouse.ringY}px, 0) translate(-50%, -50%)`;

        const label = qs(".cursor-label");
        if (label) {
            label.style.transform = `translate3d(${state.mouse.ringX + 22}px, ${state.mouse.ringY + 22}px, 0)`;
        }

        state.rafCursor = requestAnimationFrame(renderCursorRing);
    }

    /* ----------------------------------------------------------------------
       Utilities
       ---------------------------------------------------------------------- */

    function initCurrentYear() {
        const year = qs("#current-year");
        if (year) year.textContent = String(new Date().getFullYear());
    }

    function initKeyboardEnhancements() {
        document.addEventListener("keydown", (event) => {
            if (event.key === "Tab") {
                document.body.classList.add("keyboard-user");
                document.body.classList.add("is-using-keyboard");
            }
        });

        document.addEventListener("pointerdown", () => {
            document.body.classList.remove("keyboard-user");
            document.body.classList.remove("is-using-keyboard");
        });
    }

    function initAnalyticsPlaceholder() {
        window.nexoraAnalyticsReady = true;
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();