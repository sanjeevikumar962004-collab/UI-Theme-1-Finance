/* ============================================================
   STACKLY – script.js
   Handles: navbar scroll effect, mobile menu toggle,
            nav-link active state, smooth CTA interactions
   ============================================================ */

(function () {
  'use strict';

  /* ---- DOM References ---- */
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks   = document.querySelectorAll('.nav-link');

  /* ============================================================
     1. NAVBAR – Scroll Glass Effect
     ============================================================ */
  function onScroll () {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ============================================================
     2. MOBILE MENU – Toggle
     ============================================================ */
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    /* Close mobile menu when a link is clicked */
    mobileMenu.querySelectorAll('.mobile-link, .mobile-btn-member').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ============================================================
     3. NAV LINKS – Active state on click
     ============================================================ */
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.forEach(function (l) { l.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  /* ============================================================
     4. BUTTON RIPPLE EFFECT – "Become a member" buttons
     ============================================================ */
  function createRipple (event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius   = diameter / 2;

    const rect = button.getBoundingClientRect();
    circle.style.width  = circle.style.height = diameter + 'px';
    circle.style.left   = (event.clientX - rect.left - radius) + 'px';
    circle.style.top    = (event.clientY - rect.top  - radius) + 'px';
    circle.classList.add('ripple');

    /* Remove any existing ripple */
    const existing = button.querySelector('.ripple');
    if (existing) existing.remove();

    button.appendChild(circle);
  }

  /* Inject ripple CSS once */
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    .btn-member { position: relative; overflow: hidden; }
    .ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.28);
      transform: scale(0);
      animation: rippleAnim 0.55s linear;
      pointer-events: none;
    }
    @keyframes rippleAnim {
      to { transform: scale(4); opacity: 0; }
    }
  `;
  document.head.appendChild(rippleStyle);

  document.querySelectorAll('.btn-member').forEach(function (btn) {
    btn.addEventListener('click', createRipple);
  });

  /* ============================================================
     5. HERO WOMAN IMAGE – subtle parallax on mouse move
     ============================================================ */
  const heroSection = document.getElementById('hero');
  const heroWoman   = document.getElementById('hero-woman');
  const heroCircle  = document.getElementById('hero-circle');
  const heroCircle2 = document.getElementById('hero-circle-2');

  if (heroSection && heroWoman && heroCircle) {
    heroSection.addEventListener('mousemove', function (e) {
      const rect = heroSection.getBoundingClientRect();
      const cx   = rect.width  / 2;
      const cy   = rect.height / 2;
      const dx   = (e.clientX - rect.left  - cx) / cx;   // -1 to 1
      const dy   = (e.clientY - rect.top   - cy) / cy;   // -1 to 1

      /* Gentle float: woman moves slightly opposite to cursor */
      heroWoman.style.transform  = `translate(${dx * -8}px, ${dy * -6}px)`;
      heroCircle.style.transform = `translate(${dx * -4}px, ${dy * -3}px)`;
      if (heroCircle2) {
        heroCircle2.style.transform = `translate(${dx * -2}px, ${dy * -1.5}px)`;
      }
    });

    heroSection.addEventListener('mouseleave', function () {
      heroWoman.style.transform  = 'translate(0, 0)';
      heroCircle.style.transform = 'translate(0, 0)';
      if (heroCircle2) {
        heroCircle2.style.transform = 'translate(0, 0)';
      }
    });
  }

  /* ============================================================
     6. INTERSECTION OBSERVER – Animate elements on enter
     ============================================================ */
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  /* Elements to animate */
  document.querySelectorAll(
    '.hero-content, .hero-visual, .hero-bottom-band'
  ).forEach(function (el) {
    observer.observe(el);
  });

  /* ============================================================
     7. BRAND HIGHLIGHT – @The Stackly click handler
     ============================================================ */
  const brandHighlight = document.getElementById('brand-highlight');
  if (brandHighlight) {
    brandHighlight.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     8. PRELOADER FADE OUT on page load
     ============================================================ */
  window.addEventListener('load', function () {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      setTimeout(function () {
        preloader.classList.add('fade-out');
        setTimeout(function () {
          if (preloader.parentNode) {
            preloader.parentNode.removeChild(preloader);
          }
        }, 600);
      }, 2000); // Let preloader animation last for 2 seconds
    }
  });

})();
