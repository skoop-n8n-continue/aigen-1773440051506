/**
 * Quality Roots — Deal Blast Template
 * GSAP Animation Engine
 * Canvas: 1920 × 1080
 */

gsap.registerPlugin(SplitText, CustomEase, DrawSVGPlugin, MotionPathPlugin);

// ═══════════════════════════════════════════════════════
// DESIGN DECISION: One product at a time — maximum drama
// ═══════════════════════════════════════════════════════
const PRODUCTS_PER_CYCLE = 1;

// Custom eases
CustomEase.create('impactOut',   'M0,0 C0.05,0 0.1,1 0.3,1 0.7,1 0.9,1 1,1');
CustomEase.create('crispSlide',  'M0,0 C0.4,0 0.2,1 0.6,1 0.8,1 1,1 1,1');
CustomEase.create('priceBlast',  'M0,0 C0,0 0.1,1.4 0.5,1.1 0.75,0.95 1,1 1,1');

// ═══════════════════════════════════════════════════════
// PRODUCT DATA
// ═══════════════════════════════════════════════════════
let PRODUCTS = [];
let currentBatch = 0;
let masterTl = null;

// ═══════════════════════════════════════════════════════
// BACKGROUND CANVAS — Atmospheric floating particles
// ═══════════════════════════════════════════════════════
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  canvas.width  = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');

  // Ambient particles
  const dots = [];
  for (let i = 0; i < 120; i++) {
    dots.push({
      x:     Math.random() * 1920,
      y:     Math.random() * 1080,
      size:  0.8 + Math.random() * 2.5,
      speed: 0.15 + Math.random() * 0.4,
      alpha: 0.05 + Math.random() * 0.2,
      color: Math.random() > 0.4 ? '#7dc244' : (Math.random() > 0.5 ? '#3a6b20' : '#f5c842'),
      drift: (Math.random() - 0.5) * 0.3,
    });
  }

  // Slow-moving light streak
  let streakX = -300;

  function drawBgFrame() {
    ctx.clearRect(0, 0, 1920, 1080);

    // Subtle sweeping light streak
    const grad = ctx.createLinearGradient(streakX - 150, 0, streakX + 150, 0);
    grad.addColorStop(0, 'rgba(125,194,68,0)');
    grad.addColorStop(0.5, 'rgba(125,194,68,0.015)');
    grad.addColorStop(1, 'rgba(125,194,68,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(streakX - 150, 0, 300, 1080);
    streakX += 0.6;
    if (streakX > 2200) streakX = -300;

    // Floating particles
    dots.forEach(d => {
      ctx.globalAlpha = d.alpha;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fill();
      d.y -= d.speed;
      d.x += d.drift;
      if (d.y < -5) { d.y = 1085; d.x = Math.random() * 1920; }
      if (d.x < 0)  d.x = 1920;
      if (d.x > 1920) d.x = 0;
    });
    ctx.globalAlpha = 1;

    requestAnimationFrame(drawBgFrame);
  }
  drawBgFrame();
}

// ═══════════════════════════════════════════════════════
// BURST PARTICLE SYSTEM
// ═══════════════════════════════════════════════════════
class BurstParticles {
  constructor() {
    this.canvas = document.getElementById('particle-canvas');
    this.canvas.width  = 1920;
    this.canvas.height = 1080;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this._animate();
  }

  burst(x, y, count, colors) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 14;
      this.particles.push({
        x, y,
        vx:    Math.cos(angle) * speed,
        vy:    Math.sin(angle) * speed,
        life:  1,
        decay: 0.018 + Math.random() * 0.025,
        size:  2 + Math.random() * 9,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot:   Math.random() * Math.PI * 2,
        rotV:  (Math.random() - 0.5) * 0.3,
        square: Math.random() > 0.5,
      });
    }
  }

  _animate() {
    const ctx = this.ctx;
    const draw = () => {
      ctx.clearRect(0, 0, 1920, 1080);
      this.particles = this.particles.filter(p => p.life > 0);
      this.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life * p.life; // eased fade
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.square) {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.97;
        p.life -= p.decay;
        p.rot  += p.rotV;
      });
      requestAnimationFrame(draw);
    };
    draw();
  }
}

// ═══════════════════════════════════════════════════════
// WATERMARK
// ═══════════════════════════════════════════════════════
function buildWatermark() {
  const wrap = document.getElementById('bg-watermark-wrap');
  const words = ['QUALITY ROOTS', 'DEALS', 'QUALITY ROOTS', 'SAVE BIG', 'QUALITY ROOTS', 'DEALS'];
  let html = '';
  for (let r = 0; r < 12; r++) {
    words.forEach(w => {
      html += `<span class="watermark-word">${w}</span>`;
    });
  }
  wrap.innerHTML = html;
}

// ═══════════════════════════════════════════════════════
// TICKER BAR
// ═══════════════════════════════════════════════════════
function buildTicker() {
  const track = document.getElementById('ticker-track');

  // Core messages — repeated twice for seamless loop
  const core = [
    'QUALITY ROOTS', 'DEAL BLAST', 'SAVE BIG TODAY',
    'QUALITY ROOTS', 'BEST DEALS', 'SHOP NOW',
    'QUALITY ROOTS', 'DEAL BLAST', '50% OFF DEALS',
    'QUALITY ROOTS', 'SHOP TODAY', 'SAVE BIG',
  ];

  // Duplicate for seamless loop: animate 50% left = shows identical copy
  const msgs = [...core, ...core];

  track.innerHTML = msgs.map(m => `
    <span class="ticker-item">
      <span class="ticker-dot"></span>
      <span class="ticker-text">${m}</span>
    </span>
  `).join('');

  // Seamless scroll: animate exactly -50% so end = new start
  gsap.to(track, {
    x:        '-50%',
    duration: 24,
    ease:     'none',
    repeat:   -1,
  });
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
function formatPrice(val) {
  const n = parseFloat(val);
  return '$' + n.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)$/, '$10');
}

function getSavings(original, discounted) {
  const o = parseFloat(original);
  const d = parseFloat(discounted);
  const diff    = (o - d).toFixed(2);
  const percent = Math.round((1 - d / o) * 100);
  return { diff, percent };
}

function getStrainClass(strainType) {
  if (!strainType) return 'hybrid';
  const s = strainType.toLowerCase();
  if (s.includes('indica')) return 'indica';
  if (s.includes('sativa')) return 'sativa';
  return 'hybrid';
}

function getCategory(product) {
  // Simplify category name for display
  const cat = (product.category || 'Cannabis').toUpperCase();
  if (cat.includes('FLOWER')) return 'FLOWER';
  if (cat.includes('GUMM'))   return 'GUMMIES';
  if (cat.includes('VAPE') || cat.includes('CART')) return 'VAPES';
  if (cat.includes('EDIB'))   return 'EDIBLES';
  if (cat.includes('CONC'))   return 'CONCENTRATES';
  return cat.split(' ').slice(0,2).join(' ');
}

function getThcLabel(product) {
  const val  = product.lab_thc_value  || product.lab_thca_value  || 0;
  const unit = product.lab_thc_unit   || product.lab_thca_unit   || '%';
  if (val === 0) return '';
  return `${parseFloat(val).toFixed(1)}${unit} THC`;
}

// Truncate product name for display — prevents overflow
function truncateName(name, maxLen = 55) {
  if (!name || name.length <= maxLen) return name;
  // Try to break at word boundary
  const cut = name.lastIndexOf(' ', maxLen);
  return name.substring(0, cut > 0 ? cut : maxLen) + '…';
}

// ═══════════════════════════════════════════════════════
// RENDER BATCH — Populates DOM for one product
// ═══════════════════════════════════════════════════════
function getBatch(index) {
  if (PRODUCTS.length === 0) return [{ name: 'Product', price: '20', discounted_price: 10, brand: 'Brand', category: 'Gummies', image_url: '', strain_type: 'Hybrid', lab_thc_value: 0, lab_thc_unit: '%' }];
  const i = index % PRODUCTS.length;
  return [PRODUCTS[i]];
}

function renderBatch(products) {
  const container = document.getElementById('products-container');
  container.innerHTML = '';

  const product = products[0];

  const original   = parseFloat(product.price)           || 0;
  const discounted = parseFloat(product.discounted_price) || 0;
  const { diff: savingsAmt, percent: savingsPct } = getSavings(original, discounted);

  const strainClass = getStrainClass(product.strain_type || product.strain);
  const category    = getCategory(product);
  const thcLabel    = getThcLabel(product);
  const displayName = truncateName(product.online_title || product.name || 'Unknown Product');

  // Font size scaling based on name length
  let headlineFontSize = '88px';
  if (displayName.length > 35) headlineFontSize = '72px';
  if (displayName.length > 45) headlineFontSize = '60px';

  const slide = document.createElement('div');
  slide.className = 'product-slide';
  slide.innerHTML = `
    <!-- LEFT: Product visual -->
    <div class="product-left">
      <div class="product-glow-ring"></div>
      <img class="product-img"
           src="${product.image_url}"
           alt="${product.name}"
           crossorigin="anonymous">
      <div class="category-pill">${category}</div>
    </div>

    <!-- BLADE DIVIDER -->
    <div class="product-divider-blade"></div>

    <!-- RIGHT: Product info -->
    <div class="product-right">

      <!-- Animated scan line -->
      <div class="scan-line" style="top:0; opacity:0;"></div>

      <!-- Brand eyebrow -->
      <div class="brand-eyebrow">
        <div class="brand-eyebrow-diamond"></div>
        <span class="brand-name">${product.brand || 'Quality Roots'}</span>
      </div>

      <!-- Product name (SplitText target) -->
      <h1 class="product-headline" style="font-size: ${headlineFontSize};">${displayName}</h1>

      <!-- Strain + THC -->
      <div class="strain-thc-row">
        <span class="strain-badge ${strainClass}">${product.strain_type || product.strain || 'Hybrid'}</span>
        ${thcLabel ? `<span class="thc-stat"><strong>${thcLabel}</strong></span>` : ''}
      </div>

      <!-- Divider -->
      <div class="info-divider"></div>

      <!-- Deal Section -->
      <div class="deal-section">

        <!-- Burst graphic behind NOW price (decorative) -->
        <img class="deal-burst-img"
          src="https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/n8n-continue%2Faigen-1773440051506%2Fassets%2Fqr-deal-burst-1773440922193.png"
          alt="" aria-hidden="true">

        <!-- WAS price + strikethrough -->
        <div class="was-row">
          <span class="was-label">WAS</span>
          <div class="was-price-wrap">
            <span class="was-price">${formatPrice(original)}</span>
            <svg class="strike-svg" viewBox="0 0 300 50" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <line class="strike-line" x1="0" y1="25" x2="300" y2="25"/>
            </svg>
          </div>
        </div>

        <!-- NOW price -->
        <div class="now-row">
          <span class="now-label">NOW</span>
          <span class="now-price">${formatPrice(discounted)}</span>
        </div>

        <!-- Savings badge -->
        <div class="savings-badge">
          <span class="badge-icon">↓</span>
          SAVE ${savingsPct}% — YOU SAVE ${formatPrice(savingsAmt)}
        </div>

      </div>
    </div>
  `;

  container.appendChild(slide);
}

// ═══════════════════════════════════════════════════════
// CYCLE ANIMATION — The main choreography
// ═══════════════════════════════════════════════════════
let bursts; // BurstParticles instance

function animateCycle(batchIndex) {
  const batch   = getBatch(batchIndex);
  renderBatch(batch);

  const slide         = document.querySelector('.product-slide');
  const productLeft   = slide.querySelector('.product-left');
  const productRight  = slide.querySelector('.product-right');
  const blade         = slide.querySelector('.product-divider-blade');
  const glowRing      = slide.querySelector('.product-glow-ring');
  const productImg    = slide.querySelector('.product-img');
  const categoryPill  = slide.querySelector('.category-pill');
  const brandEyebrow  = slide.querySelector('.brand-eyebrow');
  const brandName     = slide.querySelector('.brand-name');
  const headline      = slide.querySelector('.product-headline');
  const strainRow     = slide.querySelector('.strain-thc-row');
  const strainBadge   = slide.querySelector('.strain-badge');
  const thcStat       = slide.querySelector('.thc-stat');
  const dividerLine   = slide.querySelector('.info-divider');
  const wasLabel      = slide.querySelector('.was-label');
  const wasPriceWrap  = slide.querySelector('.was-price-wrap');
  const wasPrice      = slide.querySelector('.was-price');
  const strikeLine    = slide.querySelector('.strike-line');
  const nowLabel      = slide.querySelector('.now-label');
  const nowPrice      = slide.querySelector('.now-price');
  const savingsBadge  = slide.querySelector('.savings-badge');
  const scanLine      = slide.querySelector('.scan-line');
  const flash         = document.getElementById('flash-overlay');

  // ── SplitText for product headline ──
  const splitHeadline = new SplitText(headline, { type: 'chars,words,lines' });
  const chars = splitHeadline.chars;

  // ── INITIAL STATES ──
  gsap.set(productLeft,  { x: -120, autoAlpha: 0 });
  gsap.set(productRight, { x: 100,  autoAlpha: 0 });
  gsap.set(blade,        { scaleY: 0, transformOrigin: 'top center', autoAlpha: 0 });
  gsap.set(glowRing,     { scale: 0.4, autoAlpha: 0 });
  gsap.set(productImg,   { scale: 0.75, autoAlpha: 0, y: 40 });
  gsap.set(categoryPill, { y: 30, autoAlpha: 0 });
  gsap.set(brandEyebrow, { x: 40, autoAlpha: 0 });
  gsap.set(chars,        { y: 50, autoAlpha: 0, rotationX: -60, transformOrigin: 'bottom' });
  gsap.set(strainBadge,  { x: -20, autoAlpha: 0 });
  gsap.set(thcStat,      { x: -20, autoAlpha: 0 });
  gsap.set(dividerLine,  { scaleX: 0, autoAlpha: 0, transformOrigin: 'left' });
  gsap.set(wasLabel,     { x: -30, autoAlpha: 0 });
  gsap.set(wasPriceWrap, { x: -30, autoAlpha: 0 });
  gsap.set(strikeLine,   { drawSVG: '0% 0%' });
  gsap.set(nowLabel,     { x: -50, autoAlpha: 0 });
  gsap.set(nowPrice,     { scale: 0, autoAlpha: 0, transformOrigin: 'left center' });
  gsap.set(savingsBadge, { scale: 0, autoAlpha: 0, transformOrigin: 'left center', y: 20 });
  gsap.set(scanLine,     { y: 0, opacity: 0 });

  // ═══════════════════════════════════════════════════
  // MASTER TIMELINE
  // ═══════════════════════════════════════════════════
  const tl = gsap.timeline({
    onComplete: () => {
      splitHeadline.revert();
      animateCycle(batchIndex + 1);
    }
  });

  // ────────────────────────────────────────────────
  // ACT 1: ENTRANCE  (0s – 3.5s)
  // ────────────────────────────────────────────────

  // 0.0 — Panels crash in
  tl.to(productLeft, {
    duration: 0.55, x: 0, autoAlpha: 1, ease: 'power3.out'
  }, 0)
  .to(productRight, {
    duration: 0.55, x: 0, autoAlpha: 1, ease: 'power3.out'
  }, 0.08)

  // 0.15 — Blade reveals top-to-bottom
  .to(blade, {
    duration: 0.5, scaleY: 1, autoAlpha: 1, transformOrigin: 'top center', ease: 'power4.out'
  }, 0.15)

  // 0.3 — Glow ring expands
  .to(glowRing, {
    duration: 0.7, scale: 1, autoAlpha: 1, ease: 'back.out(1.6)'
  }, 0.3)

  // 0.45 — Product image launches in
  .to(productImg, {
    duration: 0.65, scale: 1, y: 0, autoAlpha: 1, ease: 'back.out(1.4)'
  }, 0.45)

  // 0.5 — Particle burst at product center
  .call(() => {
    bursts.burst(400, 480, 50, ['#7dc244', '#9cd95a', '#f5c842', '#ffffff']);
  }, null, 0.5)

  // 0.55 — Flash punch
  .to(flash, { duration: 0.08, opacity: 0.12, ease: 'power4.out' }, 0.55)
  .to(flash, { duration: 0.25, opacity: 0,    ease: 'power2.out' }, 0.63)

  // 0.8 — Category pill drops
  .to(categoryPill, {
    duration: 0.4, y: 0, autoAlpha: 1, ease: 'back.out(2.2)'
  }, 0.8)

  // 1.0 — Brand eyebrow slides in
  .to(brandEyebrow, {
    duration: 0.35, x: 0, autoAlpha: 1, ease: 'power3.out'
  }, 1.0)

  // 1.1 — Product name chars cascade in
  .to(chars, {
    duration: 0.5,
    y: 0,
    rotationX: 0,
    autoAlpha: 1,
    stagger: { amount: 0.55, from: 'start' },
    ease: 'power3.out',
  }, 1.1)

  // 1.85 — Strain + THC
  .to(strainBadge, {
    duration: 0.35, x: 0, autoAlpha: 1, ease: 'power2.out'
  }, 1.85)
  .to(thcStat, {
    duration: 0.35, x: 0, autoAlpha: 1, ease: 'power2.out'
  }, 1.98)

  // 2.1 — Divider sweeps left to right
  .to(dividerLine, {
    duration: 0.5, scaleX: 1, autoAlpha: 1, ease: 'power3.out'
  }, 2.1)

  // 2.4 — WAS label + price slides in
  .to(wasLabel, {
    duration: 0.3, x: 0, autoAlpha: 1, ease: 'power3.out'
  }, 2.4)
  .to(wasPriceWrap, {
    duration: 0.3, x: 0, autoAlpha: 1, ease: 'power3.out'
  }, 2.5)

  // 2.75 — Strike-through draws
  .to(strikeLine, {
    duration: 0.38, drawSVG: '0% 100%', ease: 'power2.in'
  }, 2.75)

  // 3.0 — Impact flash for NOW price
  .to(flash, { duration: 0.06, opacity: 0.18, ease: 'power4.out' }, 3.05)
  .to(flash, { duration: 0.3,  opacity: 0,    ease: 'power2.out' }, 3.11)

  // 3.05 — NOW label
  .to(nowLabel, {
    duration: 0.35, x: 0, autoAlpha: 1, ease: 'power3.out'
  }, 3.05)

  // 3.05 — NOW price EXPLODES in
  .to(nowPrice, {
    duration: 0.55, scale: 1, autoAlpha: 1, ease: 'priceBlast'
  }, 3.05)

  // 3.2 — Second particle burst at deal
  .call(() => {
    bursts.burst(1360, 790, 40, ['#7dc244', '#f5c842', '#9cd95a']);
    bursts.burst(1360, 790, 15, ['#ffffff', '#7dc244']);
  }, null, 3.2)

  // 3.5 — Savings badge bounce
  .to(savingsBadge, {
    duration: 0.55, scale: 1, y: 0, autoAlpha: 1, ease: 'back.out(2.8)'
  }, 3.5)

  // ────────────────────────────────────────────────
  // ACT 2: LIVING MOMENT  (3.8s – 7.0s)
  // ────────────────────────────────────────────────

  // Scan line sweep
  .to(scanLine, {
    duration: 0.1, opacity: 0.6, ease: 'power2.out'
  }, 3.8)
  .to(scanLine, {
    duration: 2.0, y: 1080, ease: 'power1.in'
  }, 3.8)
  .to(scanLine, {
    duration: 0.15, opacity: 0
  }, 5.65)

  // Product floats
  .to(productImg, {
    duration: 1.8, y: -22, ease: 'sine.inOut', yoyo: true, repeat: 2
  }, 3.8)

  // Glow ring breathes
  .to(glowRing, {
    duration: 1.4, scale: 1.18, ease: 'sine.inOut', yoyo: true, repeat: 2
  }, 3.8)

  // NOW price subtle breathe
  .to(nowPrice, {
    duration: 1.1, scale: 1.04, textShadow: '0 0 80px rgba(125,194,68,0.9), 0 0 140px rgba(125,194,68,0.5)',
    ease: 'sine.inOut', yoyo: true, repeat: 2
  }, 3.8)

  // Savings badge subtle wobble
  .to(savingsBadge, {
    duration: 0.6, y: -5, ease: 'sine.inOut', yoyo: true, repeat: 4
  }, 4.1)

  // Blade shimmer pulse
  .to(blade, {
    duration: 1.2, opacity: 0.4, ease: 'sine.inOut', yoyo: true, repeat: 2
  }, 4.0)

  // ────────────────────────────────────────────────
  // ACT 3: EXIT  (7.0s – 8.0s)
  // ────────────────────────────────────────────────

  // Slide everything out
  .to([nowPrice, savingsBadge], {
    duration: 0.35, scale: 0.9, autoAlpha: 0, ease: 'power3.in'
  }, 7.0)

  .to([wasLabel, wasPriceWrap, nowLabel, dividerLine], {
    duration: 0.3, autoAlpha: 0, ease: 'power2.in'
  }, 7.05)

  .to([strainBadge, thcStat], {
    duration: 0.25, autoAlpha: 0, ease: 'power2.in'
  }, 7.1)

  .to(chars, {
    duration: 0.25, y: -30, autoAlpha: 0,
    stagger: { amount: 0.2, from: 'end' },
    ease: 'power2.in'
  }, 7.1)

  .to(brandEyebrow, {
    duration: 0.3, x: 40, autoAlpha: 0, ease: 'power2.in'
  }, 7.15)

  .to(categoryPill, {
    duration: 0.25, y: -20, autoAlpha: 0, ease: 'power2.in'
  }, 7.2)

  .to([productImg, glowRing], {
    duration: 0.35, scale: 0.88, y: -30, autoAlpha: 0, ease: 'power3.in'
  }, 7.25)

  .to(blade, {
    duration: 0.3, scaleY: 0, transformOrigin: 'bottom center', autoAlpha: 0, ease: 'power3.in'
  }, 7.3)

  .to(productLeft, {
    duration: 0.45, x: -100, autoAlpha: 0, ease: 'power3.in'
  }, 7.35)
  .to(productRight, {
    duration: 0.45, x: 120, autoAlpha: 0, ease: 'power3.in'
  }, 7.38)

  // Brief dark pause before next product
  .add(() => {}, 8.0);

  return tl;
}

// ═══════════════════════════════════════════════════════
// INTRO SEQUENCE — Brand identity reveal before products
// ═══════════════════════════════════════════════════════
function playIntro(onComplete) {
  const uiLayer   = document.getElementById('ui-layer');
  const badge     = document.getElementById('brand-badge');
  const dealLabel = document.getElementById('deal-label');

  gsap.set([badge, dealLabel], { autoAlpha: 0 });

  const intro = gsap.timeline({ onComplete });

  intro
    .to(badge, { duration: 0.6, autoAlpha: 1, ease: 'power2.out' }, 0.3)
    .fromTo(badge,
      { x: -40 },
      { duration: 0.6, x: 0, ease: 'power3.out' },
      0.3
    )
    .to(dealLabel, { duration: 0.5, autoAlpha: 1, ease: 'power2.out' }, 0.5)
    .fromTo(dealLabel,
      { x: 40 },
      { duration: 0.5, x: 0, ease: 'power3.out' },
      0.5
    )
    // Settle — hold for brief beat
    .add(() => {}, 1.2);
}

// ═══════════════════════════════════════════════════════
// LOAD + START
// ═══════════════════════════════════════════════════════
async function loadProducts() {
  try {
    const response = await fetch('./products.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('products.json not found');
    const data = await response.json();
    PRODUCTS = data.products || data || [];
    if (!Array.isArray(PRODUCTS)) PRODUCTS = [PRODUCTS];
  } catch (err) {
    console.warn('[DealBlast] products.json unavailable, using fallback.', err);
    PRODUCTS = [
      { name: 'Sample Gummy 25mg', brand: 'Quality Roots', category: 'Gummies', price: '20', discounted_price: 10, image_url: '', strain_type: 'Hybrid', lab_thc_value: 10, lab_thc_unit: 'mg' }
    ];
  }
  startShow();
}

function startShow() {
  // Init background systems
  initBackgroundCanvas();
  buildWatermark();
  buildTicker();

  // Init burst particles
  bursts = new BurstParticles();

  // Play brand intro, then start product cycling
  playIntro(() => {
    animateCycle(0);
  });
}

window.addEventListener('DOMContentLoaded', loadProducts);
