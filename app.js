(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = $('.site-header');
  const progress = $('#scroll-progress');
  const heroSection = $('.hero');
  const heroArt = $('.hero-art');
  const heroCopy = $('.hero-copy');
  const heroWordmark = $('.hero-wordmark');
  const menuButton = $('#menu-toggle');
  const mobileMenu = $('#mobile-menu');
  const essenceHeading = $('#essencia h2');
  const scrollWords = $$('#essencia h2 .scroll-word');
  const chapterSections = $$('[data-chapter][id]');
  const chapterLinks = $$('#chapter-nav a');
  const chapterLabel = $('#chapter-label');
  const clamp = value => Math.min(1, Math.max(0, value));
  let activeChapter = null;
  document.documentElement.classList.add('js-scroll');

  function setMenu(open) {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.classList.toggle('open', open);
    mobileMenu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  }

  if (menuButton && mobileMenu) {
    setMenu(false);
    menuButton.addEventListener('click', () => {
      setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', mobileMenu).forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuButton.focus();
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 760) setMenu(false);
    }, { passive: true });
  }

  let scrollScheduled = false;
  let updateRitualOnScroll = null;
  function updateScroll() {
    scrollScheduled = false;
    const y = Math.max(0, window.scrollY);
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = available > 0 ? Math.min(1, y / available) : 0;
    if (header) header.classList.toggle('scrolled', y > 24);
    if (progress) {
      progress.style.transform = `scaleX(${fraction})`;
      progress.setAttribute('aria-valuenow', String(Math.round(fraction * 100)));
    }
    const viewportHeight = window.innerHeight;
    const heroBox = heroSection?.getBoundingClientRect();
    if (heroBox && (motionPreference.matches || (heroBox.bottom > 0 && heroBox.top < viewportHeight))) {
      const heroDistance = motionPreference.matches ? 0 : Math.max(0, -heroBox.top);
      const heroOpen = clamp(heroDistance / Math.max(1, heroBox.height * 0.7));
      if (heroArt) {
        heroArt.style.setProperty('--hero-open', String(heroOpen));
        heroArt.style.setProperty('--hero-drift', `${heroDistance * 0.085}px`);
      }
      if (heroCopy) heroCopy.style.setProperty('--copy-drift', `${heroDistance * -0.065}px`);
      if (heroWordmark) {
        heroWordmark.style.translate = motionPreference.matches ? 'none' : `0 ${heroDistance * -0.055}px`;
      }
    }
    if (scrollWords.length && essenceHeading) {
      const headingBox = essenceHeading.getBoundingClientRect();
      const wordProgress = motionPreference.matches ? 1 : clamp((viewportHeight * 0.88 - headingBox.top) / Math.max(headingBox.height, viewportHeight * 0.5));
      scrollWords.forEach((word, index) => word.classList.toggle('lit', wordProgress >= (index + 1) / scrollWords.length));
    }
    if (chapterSections.length) {
      const readingLine = viewportHeight * 0.36;
      let current = chapterSections[0];
      chapterSections.forEach(section => {
        if (section.getBoundingClientRect().top <= readingLine) current = section;
      });
      if (activeChapter !== current) {
        activeChapter = current;
        let selectedLink = null;
        chapterLinks.forEach(link => {
          const selected = link.hash === `#${current.id}`;
          link.classList.toggle('active', selected);
          if (selected) {
            link.setAttribute('aria-current', 'location');
            selectedLink = link;
          } else link.removeAttribute('aria-current');
        });
        if (chapterLabel) chapterLabel.textContent = current.dataset.chapterLabel || current.dataset.label || current.dataset.chapter || selectedLink?.textContent.trim() || current.id;
      }
    }
    if (updateRitualOnScroll) updateRitualOnScroll();
  }
  function scheduleScroll() {
    if (!scrollScheduled) {
      scrollScheduled = true;
      window.requestAnimationFrame(updateScroll);
    }
  }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  updateScroll();

  const revealElements = $$('.reveal');
  if ('IntersectionObserver' in window && !motionPreference.matches) {
    document.documentElement.classList.add('js-reveal');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    revealElements.forEach(element => revealObserver.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add('visible'));
  }
  motionPreference.addEventListener?.('change', event => {
    if (event.matches) {
      revealElements.forEach(element => element.classList.add('visible'));
      if (heroWordmark) heroWordmark.style.translate = 'none';
    }
    updateScroll();
  });

  const filters = $$('[data-filter]');
  const dishes = $$('[data-category]');
  let menuInitialized = false;
  function filterMenu(filter) {
    filters.forEach(button => {
      const selected = button.dataset.filter === filter;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    dishes.forEach(card => {
      const categories = (card.dataset.category || '').split(/\s+/);
      card.hidden = filter !== 'todos' && !categories.includes(filter);
      if (!card.hidden && menuInitialized) card.classList.add('visible');
    });
    const visibleCount = dishes.filter(card => !card.hidden).length;
    const count = $('#menu-count');
    if (count) count.textContent = `${visibleCount} ${visibleCount === 1 ? 'sugestão' : 'sugestões'}`;
    menuInitialized = true;
    scheduleScroll();
  }
  filters.forEach(button => button.addEventListener('click', () => filterMenu(button.dataset.filter)));
  if (filters.length) filterMenu(filters.find(button => button.classList.contains('active'))?.dataset.filter || 'todos');

  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    document.body.classList.add('dialog-open');
  }
  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    document.body.classList.remove('dialog-open');
  }
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) {
        closeDialog(dialog);
      }
    });
    dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
    $$('[data-close-dialog]', dialog).forEach(button => button.addEventListener('click', () => closeDialog(dialog)));
  });

  const photoDialog = $('#photo-dialog');
  const dialogImage = $('#dialog-image');
  const dialogCaption = $('#dialog-caption');
  const photoCounter = $('#photo-counter');
  const photoPrevious = $('#photo-prev');
  const photoNext = $('#photo-next');
  const photoButtons = $$('[data-photo]').filter(button => button.dataset.photo);
  let photoIndex = 0;
  if (photoCounter) {
    photoCounter.setAttribute('aria-live', 'polite');
    photoCounter.setAttribute('aria-atomic', 'true');
  }
  if (photoPrevious) photoPrevious.disabled = photoButtons.length < 2;
  if (photoNext) photoNext.disabled = photoButtons.length < 2;
  function showPhoto(index) {
    if (!dialogImage || !photoButtons.length) return;
    photoIndex = (index + photoButtons.length) % photoButtons.length;
    const button = photoButtons[photoIndex];
    const caption = button.dataset.caption || $('img', button)?.alt || 'Um momento no Zephýr';
    dialogImage.src = button.dataset.photo;
    dialogImage.alt = caption;
    if (dialogCaption) dialogCaption.textContent = caption;
    if (photoCounter) photoCounter.textContent = `${photoIndex + 1} / ${photoButtons.length}`;
  }
  photoButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      if (!photoDialog || !dialogImage) return;
      showPhoto(index);
      openDialog(photoDialog);
    });
  });
  photoPrevious?.addEventListener('click', () => showPhoto(photoIndex - 1));
  photoNext?.addEventListener('click', () => showPhoto(photoIndex + 1));
  document.addEventListener('keydown', event => {
    if (!photoDialog?.open || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(photoIndex + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  $('#close-dialog')?.addEventListener('click', () => closeDialog(photoDialog));

  const galleryGrid = $('#gallery-grid');
  const galleryToggle = $('#gallery-toggle');
  const galleryExtras = $$('[data-gallery-extra]', galleryGrid || document);
  if (galleryToggle && galleryExtras.length) {
    function expandGallery(expanded) {
      galleryExtras.forEach(photo => { photo.hidden = !expanded; });
      galleryToggle.setAttribute('aria-expanded', String(expanded));
      galleryToggle.textContent = expanded ? 'Mostrar menos' : `Ver as ${$$('[data-photo]', galleryGrid || document).length} fotos`;
      scheduleScroll();
    }
    if (galleryGrid) galleryToggle.setAttribute('aria-controls', 'gallery-grid');
    expandGallery(false);
    galleryToggle.addEventListener('click', () => {
      const expanded = galleryToggle.getAttribute('aria-expanded') !== 'true';
      expandGallery(expanded);
      if (!expanded && galleryGrid && galleryToggle.getBoundingClientRect().top < 0) {
        galleryGrid.scrollIntoView({ behavior: motionPreference.matches ? 'instant' : 'smooth', block: 'start' });
      }
    });
  }

  const coffeeDialog = $('#coffee-dialog');
  const quizOptions = $('#quiz-options');
  const quizResult = $('#quiz-result');
  const quizReset = $('#quiz-reset');
  const recommendations = {
    intenso: {
      title: 'Seu momento pede um espresso.',
      description: 'Curto, marcante e cheio de presença. Comece por um espresso e converse com a equipe sobre o café do dia.',
      label: 'INTENSO · QUENTE'
    },
    equilibrado: {
      title: 'Vá de café filtrado.',
      description: 'Um preparo para apreciar com calma. Peça à equipe um café de perfil equilibrado e descubra as notas de cada xícara.',
      label: 'EQUILIBRADO · FEITO COM CALMA'
    },
    leve: {
      title: 'Descubra a delicadeza dos filtrados.',
      description: 'Que tal explorar um café mais suave? Pergunte pelos grãos e métodos disponíveis e encontre a sua combinação.',
      label: 'SUAVE · AROMÁTICO'
    },
    gelado: {
      title: 'Espresso aerado gelado, por favor.',
      description: 'Uma pausa refrescante com a personalidade do café. Confira essa e outras bebidas geladas no cardápio.',
      label: 'REFRESCANTE · GELADO'
    }
  };
  function resetQuiz() {
    if (quizOptions) quizOptions.hidden = false;
    if (quizResult) {
      quizResult.hidden = true;
      quizResult.replaceChildren();
    }
    if (quizReset) quizReset.hidden = true;
    $$('[data-taste]').forEach(button => button.setAttribute('aria-pressed', 'false'));
  }
  $$('[data-open-quiz]').forEach(button => button.addEventListener('click', () => {
    resetQuiz();
    openDialog(coffeeDialog);
  }));
  $$('[data-taste]').forEach(button => button.addEventListener('click', () => {
    const recommendation = recommendations[button.dataset.taste];
    if (!recommendation || !quizResult) return;
    $$('[data-taste]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    const label = document.createElement('p');
    label.className = 'eyebrow';
    label.textContent = recommendation.label;
    const heading = document.createElement('h3');
    heading.textContent = recommendation.title;
    const description = document.createElement('p');
    description.textContent = recommendation.description;
    const link = document.createElement('a');
    link.className = 'button button-dark';
    link.href = 'https://zephyrcafe.saipos.com/zephr-cafe/table/dsqdqsm';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Explorar o cardápio ↗';
    quizResult.replaceChildren(label, heading, description, link);
    quizResult.hidden = false;
    quizResult.tabIndex = -1;
    if (quizOptions) quizOptions.hidden = true;
    if (quizReset) quizReset.hidden = false;
    quizResult.focus({ preventScroll: true });
  }));
  quizReset?.addEventListener('click', () => {
    resetQuiz();
    $('[data-taste]', quizOptions || document)?.focus();
  });
  $('#close-quiz')?.addEventListener('click', () => closeDialog(coffeeDialog));
  $$('[data-close-quiz]').forEach(button => button.addEventListener('click', () => closeDialog(coffeeDialog)));

  const ritualSteps = $$('.ritual-step');
  const ritualVisual = $('.ritual-visual');
  const ritualImage = ritualVisual?.matches('img') ? ritualVisual : ritualVisual && $('img', ritualVisual);
  const ritualCaption = $('#ritual-visual-caption');
  const ritualCurrent = $('#ritual-current');
  const ritualProgress = $('#ritual-progress');
  let currentStep = null;
  let ritualSwapTimer = null;
  function selectRitual(step) {
    if (!step || currentStep === step) return;
    const initial = currentStep === null;
    currentStep = step;
    if (ritualSwapTimer) window.clearTimeout(ritualSwapTimer);
    ritualSteps.forEach(item => item.classList.toggle('active', item === step));
    if (ritualCurrent) ritualCurrent.textContent = String(Number(step.dataset.step || 0) + 1).padStart(2, '0');
    const swap = () => {
      ritualSwapTimer = null;
      if (ritualImage) {
        if (step.dataset.image && ritualImage.getAttribute('src') !== step.dataset.image) ritualImage.src = step.dataset.image;
        ritualImage.alt = step.dataset.caption || '';
        ritualImage.style.objectPosition = step.dataset.position || '50% 50%';
        ritualImage.style.opacity = '';
      }
      if (ritualCaption) ritualCaption.textContent = step.dataset.caption || '';
      ritualVisual?.classList.remove('is-changing');
    };
    if (initial || motionPreference.matches || !ritualImage || ritualImage.getAttribute('src') === step.dataset.image) swap();
    else {
      ritualVisual?.classList.add('is-changing');
      ritualImage.style.opacity = '0';
      ritualSwapTimer = window.setTimeout(swap, 180);
    }
  }
  if (ritualSteps.length) {
    const ritualSection = $('#ritual');
    const ritualSticky = $('.ritual-sticky');
    updateRitualOnScroll = () => {
      const viewportHeight = window.innerHeight;
      const headerBottom = Math.max(0, header?.getBoundingClientRect().bottom || 0);
      const sectionBox = ritualSection?.getBoundingClientRect();
      if (sectionBox && (sectionBox.bottom <= headerBottom || sectionBox.top >= viewportHeight)) return;
      const mobile = window.matchMedia('(max-width: 760px)').matches;
      const photoBottom = mobile && ritualSticky ? ritualSticky.getBoundingClientRect().bottom : 0;
      const readableTop = Math.max(headerBottom, mobile ? Math.min(viewportHeight * 0.75, photoBottom) : 0);
      // On small screens the photo covers the top 42svh. Follow the copy in
      // the remaining area so the selected moment matches what can be read.
      const readingLine = readableTop + (viewportHeight - readableTop) * 0.44;
      let closest = ritualSteps[0];
      let shortestDistance = Infinity;
      for (const step of ritualSteps) {
        const box = step.getBoundingClientRect();
        const distance = readingLine < box.top ? box.top - readingLine : readingLine > box.bottom ? readingLine - box.bottom : 0;
        if (distance < shortestDistance) {
          closest = step;
          shortestDistance = distance;
        }
      }
      selectRitual(closest);
      if (ritualProgress) {
        const first = ritualSteps[0].getBoundingClientRect();
        const last = ritualSteps[ritualSteps.length - 1].getBoundingClientRect();
        const stageProgress = clamp((readingLine - first.top) / Math.max(1, last.bottom - first.top));
        ritualProgress.style.transform = `scaleX(${stageProgress})`;
        ritualProgress.setAttribute('aria-valuenow', String(Math.round(stageProgress * 100)));
      }
    };
  }
  selectRitual(ritualSteps[0]);
  updateRitualOnScroll?.();

  const copyAddress = $('#copy-address');
  const copyFeedback = $('#copy-feedback');
  let copyFeedbackTimer = null;
  if (copyFeedback) copyFeedback.setAttribute('aria-live', 'polite');
  function copyWithSelection(text) {
    const focused = document.activeElement;
    const field = document.createElement('textarea');
    field.value = text;
    field.readOnly = true;
    field.setAttribute('aria-hidden', 'true');
    field.style.cssText = 'position:fixed;left:-10000px;top:0;opacity:0;';
    document.body.append(field);
    let copied = false;
    try {
      field.select();
      field.setSelectionRange(0, text.length);
      copied = typeof document.execCommand === 'function' && document.execCommand('copy');
    } finally {
      field.remove();
      focused?.focus?.({ preventScroll: true });
    }
    return copied;
  }
  copyAddress?.addEventListener('click', async () => {
    const address = copyAddress.dataset.address;
    if (!address) return;
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(address);
        copied = true;
      }
    } catch { /* The selection fallback also works when clipboard access is unavailable. */ }
    if (!copied) {
      try { copied = copyWithSelection(address); } catch { copied = false; }
    }
    copyAddress.classList.toggle('copied', copied);
    if (copyFeedback) copyFeedback.textContent = copied ? 'Endereço copiado. Até já!' : 'Selecione o endereço acima para copiar.';
    if (copyFeedbackTimer) window.clearTimeout(copyFeedbackTimer);
    copyFeedbackTimer = window.setTimeout(() => {
      copyAddress.classList.remove('copied');
      if (copyFeedback) copyFeedback.textContent = '';
    }, 6000);
  });

  const openStatus = $('#open-status');
  function updateOpenStatus() {
    if (!openStatus) return;
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date());
    const local = Object.fromEntries(parts.map(part => [part.type, part.value]));
    const hour = Number(local.hour);
    const isSunday = local.weekday === 'Sun';
    const isOpen = !isSunday && hour >= 8 && hour < 19;
    openStatus.textContent = isOpen ? 'Aberto agora · até as 19h' : 'Fechado agora · seg a sáb, 8h–19h';
    openStatus.classList.toggle('is-open', isOpen);
    openStatus.classList.toggle('is-closed', !isOpen);
  }
  updateOpenStatus();
  window.setInterval(updateOpenStatus, 60000);
  if ($('#year')) $('#year').textContent = String(new Date().getFullYear());
})();
