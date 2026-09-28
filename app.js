/* LUMÉA — Interactive Core Logic & Palette Analysis Engine */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize state
  const state = {
    activeView: 'home',
    sampledColors: {
      skin: { hex: '#D6A88E', rgb: [214, 168, 142], sampled: false },
      hair: { hex: '#4A3428', rgb: [74, 52, 40], sampled: false },
      eyes: { hex: '#5B6B5C', rgb: [91, 107, 92], sampled: false }
    },
    activeSampleTab: 'skin',
    userPalette: null,
    checkerColor: '#C85A32'
  };

  // Seasonal Palette Database
  const seasonalDB = {
    SPRING: {
      name: 'SPRING',
      tagline: 'Warm, Light & Clear',
      traits: ['WARM', 'LIGHT', 'CLEAR'],
      heroSwatches: ['#E8A589', '#F4A261', '#E9C46A', '#2A9D8F', '#E76F51', '#F7D6C8', '#81B29A'],
      clothing: [
        { name: 'Warm Coral', hex: '#E07A5F' },
        { name: 'Peach Blossom', hex: '#F4A261' },
        { name: 'Golden Wheat', hex: '#E9C46A' },
        { name: 'Soft Ivory', hex: '#F7F4EA' },
        { name: 'Warm Teal', hex: '#2A9D8F' }
      ],
      makeup: [
        { name: 'Peach Glow', hex: '#E8A589' },
        { name: 'Coral Nude', hex: '#D48375' },
        { name: 'Warm Honey', hex: '#DDB892' },
        { name: 'Terracotta Lip', hex: '#C85A32' }
      ],
      accessories: ['Yellow Gold', 'Warm Bronze', 'Rose Gold'],
      avoid: ['Charcoal Black', 'Icy Platinum', 'Neon Fuchsia']
    },
    SUMMER: {
      name: 'SUMMER',
      tagline: 'Cool, Light & Soft',
      traits: ['COOL', 'LIGHT', 'SOFT'],
      heroSwatches: ['#D8A49B', '#B8A3BA', '#8E9AAF', '#CBC0D3', '#EFD3D7', '#6B7B8C', '#9A8C98'],
      clothing: [
        { name: 'Dusty Rose', hex: '#D8A49B' },
        { name: 'Soft Lavender', hex: '#B8A3BA' },
        { name: 'Slate Blue', hex: '#8E9AAF' },
        { name: 'Sage Green', hex: '#9A9E8F' },
        { name: 'Powder Pink', hex: '#EFD3D7' }
      ],
      makeup: [
        { name: 'Muted Rose', hex: '#C28CAE' },
        { name: 'Cool Mauve', hex: '#A3798E' },
        { name: 'Soft Berry', hex: '#8C5A6B' },
        { name: 'Nude Pink', hex: '#DDA7A5' }
      ],
      accessories: ['Polished Silver', 'White Gold', 'Platinum'],
      avoid: ['Golden Mustard', 'Bright Orange', 'Warm Rust']
    },
    AUTUMN: {
      name: 'AUTUMN',
      tagline: 'Warm, Deep & Soft',
      traits: ['WARM', 'DEEP', 'SOFT'],
      heroSwatches: ['#C85A32', '#828A5D', '#B35629', '#4A3525', '#DBA159', '#656D4A', '#A8634B'],
      clothing: [
        { name: 'Terracotta', hex: '#C85A32' },
        { name: 'Olive Leaf', hex: '#828A5D' },
        { name: 'Burnt Amber', hex: '#B35629' },
        { name: 'Mustard Gold', hex: '#DBA159' },
        { name: 'Warm Espresso', hex: '#4A3525' }
      ],
      makeup: [
        { name: 'Spiced Brick', hex: '#9E472A' },
        { name: 'Warm Bronze', hex: '#8C5A38' },
        { name: 'Caramel Nude', hex: '#BA7C59' },
        { name: 'Deep Ochre', hex: '#B87333' }
      ],
      accessories: ['Antique Brass', 'Copper', 'Yellow Gold'],
      avoid: ['Icy Blue', 'Electric Magenta', 'Stark Pure White']
    },
    WINTER: {
      name: 'WINTER',
      tagline: 'Cool, Deep & Clear',
      traits: ['COOL', 'DEEP', 'CLEAR'],
      heroSwatches: ['#1D3557', '#9B5DE5', '#E63946', '#2A2421', '#0077B6', '#D80032', '#457B9D'],
      clothing: [
        { name: 'Deep Emerald', hex: '#1B4332' },
        { name: 'Royal Sapphire', hex: '#1D3557' },
        { name: 'True Ruby', hex: '#E63946' },
        { name: 'Obsidian Black', hex: '#1A1817' },
        { name: 'Icy Platinum', hex: '#E2ECE9' }
      ],
      makeup: [
        { name: 'Deep Plum', hex: '#581845' },
        { name: 'True Crimson', hex: '#900C3F' },
        { name: 'Berry Wine', hex: '#6B1B38' },
        { name: 'Cool Ruby', hex: '#C70039' }
      ],
      accessories: ['High-Shine Platinum', 'Sterling Silver', 'White Gold'],
      avoid: ['Warm Peach', 'Beige Mustard', 'Dusty Terracotta']
    }
  };

  // --- SPA VIEW NAVIGATION ---
  const navLinks = document.querySelectorAll('.nav-link, .spa-route');
  const viewSections = document.querySelectorAll('.view-section');

  function navigateTo(viewId) {
    state.activeView = viewId;
    viewSections.forEach(section => {
      section.classList.remove('active-view');
      if (section.id === `view-${viewId}`) {
        section.classList.add('active-view');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.view === viewId) {
        link.classList.add('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Handle view-specific initialization
    if (viewId === 'my-palette') {
      renderMyPaletteView();
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = link.dataset.view;
      if (targetView) {
        navigateTo(targetView);
      }
    });
  });

  // Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });
  }

  // --- HERO COLOR WHEEL SVG GENERATOR ---
  function initColorWheel() {
    const wheelContainer = document.getElementById('heroColorWheel');
    if (!wheelContainer) return;

    const colors = [
      '#C85A32', '#E8A589', '#F4A261', '#E9C46A', '#DBA159', '#828A5D',
      '#656D4A', '#3A6B68', '#243746', '#4A3525', '#9E472A', '#D48375',
      '#B8A3BA', '#8E9AAF', '#A3B19B', '#F4EBDD'
    ];

    const totalSlices = colors.length;
    const radius = 160;
    const center = 170;
    let pathsSvg = '';

    for (let i = 0; i < totalSlices; i++) {
      const startAngle = (i * 360) / totalSlices;
      const endAngle = ((i + 1) * 360) / totalSlices;

      const x1 = center + radius * Math.cos((Math.PI * startAngle) / 180);
      const y1 = center + radius * Math.sin((Math.PI * startAngle) / 180);
      const x2 = center + radius * Math.cos((Math.PI * endAngle) / 180);
      const y2 = center + radius * Math.sin((Math.PI * endAngle) / 180);

      const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
      pathsSvg += `<path d="${d}" fill="${colors[i]}" stroke="#FBF8F3" stroke-width="1.5" />`;
    }

    wheelContainer.innerHTML = `
      <svg class="color-wheel-svg" viewBox="0 0 340 340">
        <g>${pathsSvg}</g>
        <circle cx="${center}" cy="${center}" r="35" fill="#FBF8F3" stroke="#E6DFC5" stroke-width="2" />
        <circle cx="${center}" cy="${center}" r="12" fill="#C5A059" />
      </svg>
    `;
  }
  initColorWheel();

  // --- INTERACTIVE CONSULTATION SAMPLER ENGINE ---
  const canvas = document.getElementById('photoCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const loupe = document.getElementById('loupeCursor');
  const fileInput = document.getElementById('photoFileInput');
  const dropzone = document.getElementById('uploadDropzone');

  let currentLoadedImage = new Image();

  // Preset Models for Quick Test Drive
  const presets = {
    warm: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    cool: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    autumn: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80'
  };

  function loadImageToCanvas(src) {
    currentLoadedImage.crossOrigin = 'Anonymous';
    currentLoadedImage.src = src;
    currentLoadedImage.onload = () => {
      canvas.width = currentLoadedImage.width;
      canvas.height = currentLoadedImage.height;
      ctx.drawImage(currentLoadedImage, 0, 0);
      
      // Update Loupe background image
      if (loupe) {
        loupe.style.backgroundImage = `url(${src})`;
        loupe.style.backgroundSize = `${canvas.clientWidth * 2.5}px ${canvas.clientHeight * 2.5}px`;
      }
    };
  }

  // Load default preset initially
  if (canvas) {
    loadImageToCanvas(presets.warm);
  }

  // Preset button selection
  document.querySelectorAll('.preset-thumb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-thumb-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const presetKey = btn.dataset.preset;
      if (presets[presetKey]) {
        loadImageToCanvas(presets[presetKey]);
      }
    });
  });

  // File upload handling
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          loadImageToCanvas(event.target.result);
          document.getElementById('step-1-pane').classList.remove('active');
          document.getElementById('step-2-pane').classList.add('active');
          document.getElementById('prog-step-1').classList.remove('active');
          document.getElementById('prog-step-1').classList.add('completed');
          document.getElementById('prog-step-2').classList.add('active');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Dropzone click trigger
  if (dropzone) {
    dropzone.addEventListener('click', () => fileInput && fileInput.click());
  }

  // Direct "CONTINUE TO SAMPLING" button
  const continueBtn = document.getElementById('btnToSampling');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      document.getElementById('step-1-pane').classList.remove('active');
      document.getElementById('step-2-pane').classList.add('active');
      document.getElementById('prog-step-1').classList.remove('active');
      document.getElementById('prog-step-1').classList.add('completed');
      document.getElementById('prog-step-2').classList.add('active');
    });
  }

  // Tab switching for sampling (SKIN / HAIR / EYES)
  document.querySelectorAll('.sample-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.sample-tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.activeSampleTab = tab.dataset.mode;
    });
  });

  // Canvas Mouse Move & Loupe Magnifier
  if (canvas && loupe) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      loupe.style.display = 'block';
      loupe.style.left = `${x - 40}px`;
      loupe.style.top = `${y - 40}px`;

      const zoom = 2.5;
      const bgX = -x * zoom + 40;
      const bgY = -y * zoom + 40;
      loupe.style.backgroundPosition = `${bgX}px ${bgY}px`;
    });

    canvas.addEventListener('mouseleave', () => {
      loupe.style.display = 'none';
    });

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const canvasX = Math.floor((e.clientX - rect.left) * scaleX);
      const canvasY = Math.floor((e.clientY - rect.top) * scaleY);

      const pixelData = ctx.getImageData(canvasX, canvasY, 1, 1).data;
      const r = pixelData[0];
      const g = pixelData[1];
      const b = pixelData[2];

      const hex = rgbToHex(r, g, b);

      // Save sample
      const mode = state.activeSampleTab;
      state.sampledColors[mode] = { hex, rgb: [r, g, b], sampled: true };

      // Update UI
      const swatchEl = document.getElementById(`swatch-${mode}`);
      const hexEl = document.getElementById(`hex-${mode}`);
      const statusEl = document.getElementById(`status-${mode}`);

      if (swatchEl) swatchEl.style.backgroundColor = hex;
      if (hexEl) hexEl.textContent = hex.toUpperCase();
      if (statusEl) statusEl.innerHTML = '✓';

      // Auto-advance tab
      if (mode === 'skin') {
        switchSampleTab('hair');
      } else if (mode === 'hair') {
        switchSampleTab('eyes');
      }

      checkSamplingCompletion();
    });
  }

  function switchSampleTab(mode) {
    state.activeSampleTab = mode;
    document.querySelectorAll('.sample-tab-btn').forEach(t => {
      t.classList.remove('active');
      if (t.dataset.mode === mode) t.classList.add('active');
    });
  }

  function checkSamplingCompletion() {
    const btnAnalyze = document.getElementById('btnAnalyzeColors');
    const allSampled = state.sampledColors.skin.sampled &&
                       state.sampledColors.hair.sampled &&
                       state.sampledColors.eyes.sampled;
    if (btnAnalyze) {
      btnAnalyze.disabled = !allSampled;
      if (allSampled) {
        btnAnalyze.classList.remove('btn-outline');
        btnAnalyze.classList.add('btn-gold');
      }
    }
  }

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // --- ANALYSIS ALGORITHM & TRANSITION ---
  const btnAnalyze = document.getElementById('btnAnalyzeColors');
  const loaderOverlay = document.getElementById('analysisLoader');
  const loaderText = document.getElementById('loaderStatusText');

  if (btnAnalyze) {
    btnAnalyze.addEventListener('click', () => {
      if (!loaderOverlay) return;

      loaderOverlay.classList.add('active');

      const messages = [
        'Reading your colors...',
        'Comparing warmth, depth, and clarity...',
        'Creating your Luméa palette...'
      ];

      let msgIndex = 0;
      loaderText.textContent = messages[0];

      const interval = setInterval(() => {
        msgIndex++;
        if (msgIndex < messages.length) {
          loaderText.textContent = messages[msgIndex];
        } else {
          clearInterval(interval);
          loaderOverlay.classList.remove('active');

          // Run Rule-Based Seasonal Classification
          const detectedSeason = classifySeasonalPalette(state.sampledColors);
          state.userPalette = seasonalDB[detectedSeason];

          // Save to localStorage
          try {
            localStorage.setItem('lumea_palette', JSON.stringify(state.userPalette));
          } catch (e) {
            console.warn('LocalStorage unavailable', e);
          }

          // Show Step 3 Result View
          renderConsultationResult(state.userPalette);
          document.getElementById('step-2-pane').classList.remove('active');
          document.getElementById('step-3-pane').classList.add('active');
          document.getElementById('prog-step-2').classList.remove('active');
          document.getElementById('prog-step-2').classList.add('completed');
          document.getElementById('prog-step-3').classList.add('active');
        }
      }, 1200);
    });
  }

  function classifySeasonalPalette(samples) {
    const skinR = samples.skin.rgb[0];
    const skinG = samples.skin.rgb[1];
    const skinB = samples.skin.rgb[2];

    const hairR = samples.hair.rgb[0];
    const hairG = samples.hair.rgb[1];
    const hairB = samples.hair.rgb[2];

    // Warmth score (R/B ratio in skin and hair)
    const warmthScore = (skinR - skinB) + (hairR - hairB);

    // Lightness score (Average R, G, B)
    const lightness = (skinR + skinG + skinB + hairR + hairG + hairB) / 6;

    if (warmthScore > 50) {
      // Warm Undertone -> Spring or Autumn
      return lightness > 130 ? 'SPRING' : 'AUTUMN';
    } else {
      // Cool Undertone -> Summer or Winter
      return lightness > 130 ? 'SUMMER' : 'WINTER';
    }
  }

  function renderConsultationResult(palette) {
    const nameEl = document.getElementById('resSeasonName');
    const taglineEl = document.getElementById('resSeasonTagline');
    const traitsEl = document.getElementById('resTraitsPills');
    const heroSwatchesEl = document.getElementById('resHeroSwatches');
    const clothingEl = document.getElementById('resClothingSwatches');
    const makeupEl = document.getElementById('resMakeupSwatches');
    const metalsEl = document.getElementById('resAccessoryMetals');
    const avoidEl = document.getElementById('resAvoidText');

    if (nameEl) nameEl.textContent = palette.name;
    if (taglineEl) taglineEl.textContent = palette.tagline;

    if (traitsEl) {
      traitsEl.innerHTML = palette.traits.map(t => `<span class="trait-pill">${t}</span>`).join('');
    }

    if (heroSwatchesEl) {
      heroSwatchesEl.innerHTML = palette.heroSwatches.map(hex => `
        <div class="result-swatch-item" style="background-color: ${hex}">
          <span>${hex}</span>
        </div>
      `).join('');
    }

    if (clothingEl) {
      clothingEl.innerHTML = palette.clothing.map(item => `
        <div class="cat-swatch-item">
          <div class="cat-swatch-color" style="background-color: ${item.hex}"></div>
          <span>${item.name}</span>
        </div>
      `).join('');
    }

    if (makeupEl) {
      makeupEl.innerHTML = palette.makeup.map(item => `
        <div class="cat-swatch-item">
          <div class="cat-swatch-color" style="background-color: ${item.hex}"></div>
          <span>${item.name}</span>
        </div>
      `).join('');
    }

    if (metalsEl) {
      metalsEl.innerHTML = palette.accessories.map(item => `
        <div class="cat-swatch-item">
          <span style="color: var(--color-gold-dark)">✦</span>
          <span>${item}</span>
        </div>
      `).join('');
    }

    if (avoidEl) {
      avoidEl.textContent = `Colors to explore in softer accent doses: ${palette.avoid.join(', ')}.`;
    }
  }

  // --- MY PALETTE VIEW RENDERER ---
  function renderMyPaletteView() {
    let saved = state.userPalette;
    if (!saved) {
      try {
        const stored = localStorage.getItem('lumea_palette');
        if (stored) saved = JSON.parse(stored);
      } catch (e) {}
    }

    if (!saved) {
      saved = seasonalDB.SPRING; // Default fallback
    }

    const container = document.getElementById('myPaletteContent');
    if (!container) return;

    container.innerHTML = `
      <div class="result-header-banner">
        <span class="section-label">Your Personal Consultation Result</span>
        <h2 class="result-season-name">${saved.name}</h2>
        <p class="section-desc" style="margin: 0 auto 1rem;">${saved.tagline}</p>
        <div class="result-traits-pills">
          ${saved.traits.map(t => `<span class="trait-pill">${t}</span>`).join('')}
        </div>
      </div>

      <div class="result-swatches-hero">
        ${saved.heroSwatches.map(hex => `
          <div class="result-swatch-item" style="background-color: ${hex}">
            <span>${hex}</span>
          </div>
        `).join('')}
      </div>

      <div class="categories-grid">
        <div class="category-card">
          <h4>Your Clothing Colors</h4>
          <div class="category-swatch-list">
            ${saved.clothing.map(c => `
              <div class="cat-swatch-item">
                <div class="cat-swatch-color" style="background-color: ${c.hex}"></div>
                <span>${c.name}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="category-card">
          <h4>Your Makeup Shades</h4>
          <div class="category-swatch-list">
            ${saved.makeup.map(m => `
              <div class="cat-swatch-item">
                <div class="cat-swatch-color" style="background-color: ${m.hex}"></div>
                <span>${m.name}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="category-card">
          <h4>Recommended Metals</h4>
          <div class="category-swatch-list">
            ${saved.accessories.map(a => `
              <div class="cat-swatch-item">
                <span style="color: var(--color-gold-dark)">✦</span>
                <span>${a}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 2rem;">
        <button class="btn btn-gold spa-route" data-view="what-suits-me">CHECK ANOTHER COLOR</button>
      </div>
    `;

    // Re-bind SPA route links inside dynamic HTML
    container.querySelectorAll('.spa-route').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.dataset.view);
      });
    });
  }

  // --- COLOR CHECKERS (FASHION & MAKEUP) ---
  const colorPicker = document.getElementById('checkerColorPicker');
  const hexInput = document.getElementById('checkerHexInput');
  const btnCheckColor = document.getElementById('btnCheckColor');
  const resultCard = document.getElementById('checkerResultCard');

  if (colorPicker && hexInput) {
    colorPicker.addEventListener('input', (e) => {
      hexInput.value = e.target.value.toUpperCase();
      state.checkerColor = e.target.value;
    });

    hexInput.addEventListener('input', (e) => {
      if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
        colorPicker.value = e.target.value;
        state.checkerColor = e.target.value;
      }
    });
  }

  // Preset Swatch Chip clicks
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const hex = chip.dataset.hex;
      if (colorPicker) colorPicker.value = hex;
      if (hexInput) hexInput.value = hex.toUpperCase();
      state.checkerColor = hex;
    });
  });

  if (btnCheckColor) {
    btnCheckColor.addEventListener('click', () => {
      evaluateColorHarmony(state.checkerColor);
    });
  }

  function evaluateColorHarmony(pickedHex) {
    const palette = state.userPalette || seasonalDB.SPRING;
    const pickedRgb = hexToRgb(pickedHex);

    // Calculate minimum Euclidean color distance to user's palette
    let minDistance = 999;
    let closestColor = palette.clothing[0];

    palette.clothing.concat(palette.makeup).forEach(item => {
      const targetRgb = hexToRgb(item.hex);
      const dist = Math.sqrt(
        Math.pow(pickedRgb.r - targetRgb.r, 2) +
        Math.pow(pickedRgb.g - targetRgb.g, 2) +
        Math.pow(pickedRgb.b - targetRgb.b, 2)
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestColor = item;
      }
    });

    if (!resultCard) return;

    resultCard.classList.add('active');

    const statusBadge = document.getElementById('checkStatusBadge');
    const msgTitle = document.getElementById('checkMsgTitle');
    const msgBody = document.getElementById('checkMsgBody');
    const altsContainer = document.getElementById('checkAlternativesRow');

    if (minDistance < 85) {
      // Harmonious match
      statusBadge.className = 'result-status-badge status-harmonious';
      statusBadge.textContent = 'Harmonious Match';
      msgTitle.textContent = 'This color suits your natural palette.';
      msgBody.textContent = `The tone ${pickedHex} shares undertone characteristics with your ${palette.name} palette, creating a gentle and radiant harmony with your skin.`;
      altsContainer.style.display = 'none';
    } else {
      // Less harmonious
      statusBadge.className = 'result-status-badge status-less-harmonious';
      statusBadge.textContent = 'Exploration Note';
      msgTitle.textContent = 'This color may feel less harmonious with your palette.';
      msgBody.textContent = `This hue creates strong contrast against your undertone. If you wish to bring more natural light to your complexion, try these alternatives from your palette:`;
      altsContainer.style.display = 'flex';

      altsContainer.innerHTML = palette.clothing.slice(0, 4).map(item => `
        <div class="alt-swatch-chip">
          <div style="width: 16px; height: 16px; border-radius: 50%; background-color: ${item.hex}"></div>
          <span>${item.name}</span>
        </div>
      `).join('');
    }
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  // --- BOOKING MODAL HANDLERS ---
  const bookingModal = document.getElementById('bookingModal');
  const closeBooking = document.getElementById('closeBookingModal');
  const btnOpenBooking = document.querySelectorAll('.open-booking-modal');

  btnOpenBooking.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (bookingModal) bookingModal.classList.add('active');
    });
  });

  if (closeBooking) {
    closeBooking.addEventListener('click', () => {
      bookingModal.classList.remove('active');
    });
  }

  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) {
        bookingModal.classList.remove('active');
      }
    });
  }

  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you! Your Luméa consultation booking request has been received. We will contact you shortly to confirm your session.');
      bookingModal.classList.remove('active');
    });
  }
});
