document.addEventListener('DOMContentLoaded', () => {
  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('hidden');
      mobileToggle.setAttribute('aria-expanded', String(!isOpen));
      mobileToggle.querySelector('svg')?.classList.toggle('text-emerald');
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (!mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const accordionTriggers = document.querySelectorAll('[data-accordion-trigger]');
  accordionTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const content = trigger.parentElement?.querySelector('.faq-content');
      const icon = trigger.querySelector('svg');
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!isExpanded));
      if (content) {
        if (isExpanded) {
          content.hidden = true;
          content.classList.remove('animate-fadeIn');
        } else {
          content.hidden = false;
          content.classList.add('animate-fadeIn');
        }
      }
      if (icon) {
        icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    });
  });

  const form = document.getElementById('quoteForm');
  const status = document.getElementById('formStatus');
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const formData = new FormData(form);
      const endpoint = form.getAttribute('action');
      if (status) {
        status.textContent = 'Sending your request...';
        status.className = 'text-sm text-slate/70';
      }

      try {
        const response = await fetch(endpoint || '', {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Request failed');
        }

        const result = await response.json().catch(() => null);
        if (status) {
          status.textContent = result?.message || 'Thank you! We\'ll be in touch shortly.';
          status.className = 'text-sm font-medium text-emerald';
        }
        form.reset();
      } catch (error) {
        const fallbackMessage = buildMailtoMessage(formData);
        window.location.href = fallbackMessage;
        if (status) {
          status.textContent = 'We opened your email app so you can send the request manually.';
          status.className = 'text-sm font-medium text-sky';
        }
      }
    });
  }

  const slider = document.querySelector('[data-review-slider]');
  const track = document.querySelector('[data-review-track]');
  const dotsWrapper = document.querySelector('[data-review-dots]');
  if (slider && track && dotsWrapper) {
    const slides = Array.from(track.children);
    let currentIndex = 0;

    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Show review ${index + 1}`);
      dot.addEventListener('click', () => {
        currentIndex = index;
        updateSlider();
        resetAutoplay();
      });
      dotsWrapper.appendChild(dot);
    });

    const dots = Array.from(dotsWrapper.children);

    const updateSlider = () => {
      const offset = currentIndex * slider.clientWidth;
      track.style.transform = `translateX(-${offset}px)`;
      dots.forEach((dot, index) => {
        dot.setAttribute('aria-current', index === currentIndex ? 'true' : 'false');
      });
    };

    let autoplayId = setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlider();
    }, 6000);

    const resetAutoplay = () => {
      clearInterval(autoplayId);
      autoplayId = setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlider();
      }, 6000);
    };

    window.addEventListener('resize', () => {
      updateSlider();
    });

    updateSlider();
  }
});

function buildMailtoMessage(formData) {
  const email = 'enviroluxfl@outlook.com';
  const subject = encodeURIComponent('New Quote Request');
  const entries = [];
  formData.forEach((value, key) => {
    if (key.startsWith('_')) return;
    entries.push(`${key.replace(/_/g, ' ')}: ${value}`);
  });
  const body = encodeURIComponent(entries.join('\n'));
  return `mailto:${email}?subject=${subject}&body=${body}`;
}
