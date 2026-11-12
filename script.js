document.addEventListener("DOMContentLoaded", () => {
  const WHATSAPP_NUMBER = "5584988248094";

  // Dynamic footer year
  const yearEl = document.getElementById("currentYear");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Mobile menu drawer
  const menuToggle = document.getElementById("menuToggle");
  const mobileDrawer = document.getElementById("mobileDrawer");

  if (menuToggle && mobileDrawer) {
    const toggleMenu = (forceClose = false) => {
      const isOpen = !mobileDrawer.hidden;
      const nextOpen = forceClose ? false : !isOpen;
      mobileDrawer.hidden = !nextOpen;
      menuToggle.setAttribute("aria-expanded", String(nextOpen));
      menuToggle.setAttribute("aria-label", nextOpen ? "Fechar menu" : "Abrir menu");
    };

    menuToggle.addEventListener("click", () => toggleMenu());

    mobileDrawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => toggleMenu(true));
    });
  }

  // Scroll reveal animations
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Active navigation link on scroll
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-desktop a");

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach((link) => {
              link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
            });
          }
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    sections.forEach((sec) => navObserver.observe(sec));
  }

  // Apple-style 60fps Parallax Engine (lerp + requestAnimationFrame)
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReducedMotion) {
    const heroSection = document.querySelector(".hero");
    const heroBg = document.querySelector(".hero-bg-pattern");
    const heroContent = document.querySelector(".hero-content");
    const portraitFrame = document.querySelector(".portrait-frame");
    const portraitAccent = document.querySelector(".portrait-accent");
    const portraitImg = document.querySelector(".portrait-img");
    const portraitBadge = document.querySelector(".portrait-badge");
    const essenceSection = document.querySelector(".section-burgundy");
    const floatCards = document.querySelectorAll(".about-card, .contact-form-card");
    const areaCards = document.querySelectorAll(".area-card");

    let currentY = window.scrollY;
    let targetY = window.scrollY;
    let rafId = null;

    const lerp = (start, end, factor) => start + (end - start) * factor;
    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

    const getViewportProgress = (el) => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      return clamp((vh - rect.top) / (vh + rect.height), 0, 1);
    };

    const renderParallax = () => {
      currentY = lerp(currentY, targetY, 0.1);
      const isDesktop = window.innerWidth > 900;

      // Hero multi-layer parallax + cinematic zoom
      if (heroSection) {
        const heroH = heroSection.offsetHeight || 700;
        const progress = clamp(currentY / heroH, 0, 1.2);

        if (heroBg) {
          heroBg.style.transform = `translate3d(0, ${currentY * 0.22}px, 0)`;
        }
        if (heroContent && isDesktop) {
          heroContent.style.transform = `translate3d(0, ${currentY * 0.12}px, 0)`;
          heroContent.style.opacity = String(clamp(1 - progress * 0.45, 0.45, 1));
        } else if (heroContent) {
          heroContent.style.transform = "";
          heroContent.style.opacity = "";
        }
        if (portraitFrame && isDesktop) {
          portraitFrame.style.transform = `translate3d(0, ${currentY * -0.06}px, 0)`;
        } else if (portraitFrame) {
          portraitFrame.style.transform = "";
        }
        if (portraitAccent) {
          portraitAccent.style.transform = `translate3d(${progress * 10}px, ${currentY * -0.09}px, 0)`;
        }
        if (portraitImg) {
          const scale = 1 + progress * 0.09;
          portraitImg.style.transform = `scale(${scale.toFixed(4)})`;
        }
        if (portraitBadge) {
          portraitBadge.style.transform = `translate3d(0, ${currentY * -0.04}px, 0)`;
        }
      }

      // Essence dark section background glow parallax
      if (essenceSection) {
        const p = getViewportProgress(essenceSection);
        const offset = (p - 0.5) * 90;
        essenceSection.style.setProperty("--essence-parallax", `${offset.toFixed(1)}px`);
      }

      // Floating cards subtle depth on desktop
      if (isDesktop) {
        floatCards.forEach((card) => {
          const p = getViewportProgress(card);
          const offset = (p - 0.5) * -28;
          card.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
        });

        areaCards.forEach((card, idx) => {
          const p = getViewportProgress(card);
          const direction = idx === 1 ? -1 : 1;
          const offset = (p - 0.5) * 20 * direction;
          card.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
        });
      } else {
        floatCards.forEach((card) => { card.style.transform = ""; });
        areaCards.forEach((card) => { card.style.transform = ""; });
      }

      if (Math.abs(targetY - currentY) > 0.25) {
        rafId = requestAnimationFrame(renderParallax);
      } else {
        rafId = null;
      }
    };

    const scheduleParallax = () => {
      targetY = window.scrollY;
      if (!rafId) {
        rafId = requestAnimationFrame(renderParallax);
      }
    };

    window.addEventListener("scroll", scheduleParallax, { passive: true });
    window.addEventListener("resize", scheduleParallax, { passive: true });
    renderParallax();
  }

  // Contact form -> opens WhatsApp with pre-filled structured message
  const contactForm = document.getElementById("contactForm");
  const formFeedback = document.getElementById("formFeedback");

  if (contactForm && formFeedback) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const nome = contactForm.nome.value.trim();
      const mensagem = contactForm.mensagem.value.trim();

      if (!nome || !mensagem) {
        formFeedback.textContent = "Por favor, preencha seu nome e o resumo do caso.";
        return;
      }

      const text = [
        `Olá, Dra. Beatriz! Vim pelo site, me chamo ${nome} e gostaria de atendimento.`,
        ``,
        mensagem,
      ].join("\n");

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank", "noopener,noreferrer");

      formFeedback.textContent = "Abrindo o WhatsApp com sua mensagem pronta para envio.";
      contactForm.reset();
    });
  }
});
