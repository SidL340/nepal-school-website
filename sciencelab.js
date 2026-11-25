(() => {
  'use strict';

  // ── 1. Audio Synthesis & Bilingual Speech Narration Engine ────────────────
  let voiceLang = 'en'; // 'en', 'ne', or 'off'
  let sfxEnabled = true;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx && AudioCtx) audioCtx = new AudioCtx();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playTone(freq, type, duration, gainVal = 0.15) {
    if (!sfxEnabled) return;
    initAudio();
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function playBubbleSound() {
    if (!sfxEnabled) return;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => playTone(300 + Math.random() * 450, 'sine', 0.08, 0.1), i * 50);
    }
  }

  function playClink() {
    playTone(1800, 'triangle', 0.18, 0.2);
  }

  function playPourSound() {
    if (!sfxEnabled) return;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => playTone(220 + Math.random() * 200, 'sine', 0.1, 0.08), i * 60);
    }
  }

  function playHissSound() {
    playTone(600, 'sawtooth', 0.35, 0.1);
  }

  function playFlameSound() {
    playTone(120, 'sawtooth', 0.45, 0.18);
  }

  function playSuccess() {
    playTone(523.25, 'sine', 0.14, 0.18);
    setTimeout(() => playTone(659.25, 'sine', 0.14, 0.18), 110);
    setTimeout(() => playTone(783.99, 'sine', 0.3, 0.2), 220);
  }

  function playHeartbeatSound() {
    if (!sfxEnabled) return;
    initAudio();
    if (!audioCtx) return;
    try {
      const osc1 = audioCtx.createOscillator();
      const g1 = audioCtx.createGain();
      osc1.frequency.setValueAtTime(65, audioCtx.currentTime);
      g1.gain.setValueAtTime(0.3, audioCtx.currentTime);
      g1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc1.connect(g1);
      g1.connect(audioCtx.destination);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.12);

      setTimeout(() => {
        if (!audioCtx) return;
        const osc2 = audioCtx.createOscillator();
        const g2 = audioCtx.createGain();
        osc2.frequency.setValueAtTime(95, audioCtx.currentTime);
        g2.gain.setValueAtTime(0.25, audioCtx.currentTime);
        g2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc2.connect(g2);
        g2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.1);
      }, 140);
    } catch(e) {}
  }

  // Bilingual Speech Synthesis
  function speakText(enText, neText) {
    if (voiceLang === 'off') return;
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const textToSpeak = voiceLang === 'ne' ? neText : enText;
      const langCode = voiceLang === 'ne' ? 'ne-NP' : 'en-US';

      const u = new SpeechSynthesisUtterance(textToSpeak);
      u.lang = langCode;
      u.rate = voiceLang === 'ne' ? 0.9 : 0.95;
      u.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length) {
        if (voiceLang === 'ne') {
          const neVoice = voices.find(v => v.lang.startsWith('ne') || v.lang.startsWith('hi'));
          if (neVoice) u.voice = neVoice;
        } else {
          const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google')));
          if (enVoice) u.voice = enVoice;
        }
      }
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  // Header Buttons
  const voiceBtn = document.getElementById('voice-toggle-btn');
  voiceBtn.addEventListener('click', () => {
    if (voiceLang === 'en') {
      voiceLang = 'ne';
      voiceBtn.textContent = '🔊 आवाज: नेपाली (ne)';
      voiceBtn.classList.add('active');
      speakText('नेपाली आवाज सक्रिय भयो।', 'नेपाली आवाज सक्रिय भयो।');
    } else if (voiceLang === 'ne') {
      voiceLang = 'off';
      voiceBtn.textContent = '🔇 Voice: OFF';
      voiceBtn.classList.remove('active');
      window.speechSynthesis.cancel();
    } else {
      voiceLang = 'en';
      voiceBtn.textContent = '🔊 Voice: English (en)';
      voiceBtn.classList.add('active');
      speakText('English narration activated.', 'English narration activated.');
    }
  });

  const sfxBtn = document.getElementById('audio-sfx-btn');
  sfxBtn.addEventListener('click', () => {
    sfxEnabled = !sfxEnabled;
    sfxBtn.textContent = sfxEnabled ? '🎵 SFX: ON' : '🔇 SFX: OFF';
    sfxBtn.classList.toggle('active', sfxEnabled);
    if (sfxEnabled) playClink();
  });

  // ── 2. Three.js Full Lab Room & Assistant Setup ────────────────────────────
  const container = document.getElementById('canvas-container');
  const canvas = document.getElementById('three-canvas');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060f24);
  scene.fog = new THREE.FogExp2(0x060f24, 0.022);

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 3.4, 7.8);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 + 0.02;
  controls.minDistance = 2.0;
  controls.maxDistance = 14;
  controls.target.set(0, 1.25, 0);

  // Resize handler ensures SINGLE FRAME perfection
  function onWindowResize() {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onWindowResize);

  document.getElementById('cam-reset-btn').addEventListener('click', () => {
    controls.reset();
    camera.position.set(0, 3.4, 7.8);
    controls.target.set(0, 1.25, 0);
  });

  // Bright Laboratory Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const overheadLight = new THREE.DirectionalLight(0xffffff, 1.2);
  overheadLight.position.set(2, 8, 4);
  overheadLight.castShadow = true;
  scene.add(overheadLight);

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.5);
  rimLight.position.set(-6, 4, -4);
  scene.add(rimLight);

  // Bench Spotlight highlighting active apparatus
  const benchSpot = new THREE.SpotLight(0x38bdf8, 1.5, 12, Math.PI / 4, 0.4);
  benchSpot.position.set(0, 6, 2);
  benchSpot.target.position.set(0, 1.0, 0);
  scene.add(benchSpot);
  scene.add(benchSpot.target);

  // Procedural Textures
  function createTileTexture() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(4, 4, 120, 120);
    ctx.fillRect(132, 132, 120, 120);
    ctx.fillStyle = '#0b1329';
    ctx.fillRect(132, 4, 120, 120);
    ctx.fillRect(4, 132, 120, 120);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  }

  function createPeriodicTableTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 500, 244);
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('PERIODIC TABLE OF ELEMENTS / आवर्त तालिका', 40, 36);
    const cols = ['#ef4444', '#f97316', '#eab308', '#10b981', '#06b6d4', '#6366f1', '#a855f7'];
    for (let r = 0; r < 5; r++) {
      for (let col = 0; col < 14; col++) {
        ctx.fillStyle = cols[(r + col) % cols.length];
        ctx.fillRect(40 + col * 31, 55 + r * 35, 27, 28);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(['H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','K','Ca','Fe','Cu','Zn'][ (r * 5 + col) % 22 ], 46 + col * 31, 74 + r * 35);
      }
    }
    return new THREE.CanvasTexture(c);
  }

  function createBlackboardTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, 500, 244);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 20px "Noto Sans Devanagari", sans-serif';
    ctx.fillText('श्री नेपाल माध्यमिक विद्यालय · विज्ञान प्रयोगशाला', 45, 45);
    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.fillText('• CaCO₃ + 2HCl ➔ CaCl₂ + H₂O + CO₂↑', 45, 90);
    ctx.fillText('• 2NH₄Cl + Ca(OH)₂ ➔ CaCl₂ + 2H₂O + 2NH₃↑', 45, 125);
    ctx.fillText("• Ohm\'s Law: V = I × R  |  Archimedes: U = V·d·g", 45, 160);
    ctx.fillText('• Blood Group: Antigen-Antibody Agglutination', 45, 195);
    return new THREE.CanvasTexture(c);
  }

  // 3D Laboratory Room Geometry
  const roomGroup = new THREE.Group();

  // Floor
  const floorGeo = new THREE.PlaneGeometry(24, 20);
  const floorMat = new THREE.MeshStandardMaterial({ map: createTileTexture(), roughness: 0.4, metalness: 0.1 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  roomGroup.add(floor);

  // Back Wall
  const wallGeo = new THREE.PlaneGeometry(24, 10);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
  const backWall = new THREE.Mesh(wallGeo, wallMat);
  backWall.position.set(0, 5, -7);
  roomGroup.add(backWall);

  // Blackboard
  const boardGeo = new THREE.PlaneGeometry(5.5, 2.7);
  const boardMat = new THREE.MeshBasicMaterial({ map: createBlackboardTexture() });
  const blackboard = new THREE.Mesh(boardGeo, boardMat);
  blackboard.position.set(-2.5, 4.2, -6.9);
  roomGroup.add(blackboard);

  // Periodic Table Chart
  const ptGeo = new THREE.PlaneGeometry(4.2, 2.3);
  const ptMat = new THREE.MeshBasicMaterial({ map: createPeriodicTableTexture() });
  const ptChart = new THREE.Mesh(ptGeo, ptMat);
  ptChart.position.set(3.5, 4.2, -6.9);
  roomGroup.add(ptChart);

  // Laboratory Workbench Table (High contrast slate top with beveled edges)
  const tableTopGeo = new THREE.BoxGeometry(11.5, 0.25, 4.6);
  const tableTopMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.4 });
  const tableTop = new THREE.Mesh(tableTopGeo, tableTopMat);
  tableTop.position.set(0, 0.85, 0);
  tableTop.receiveShadow = true;
  tableTop.castShadow = true;
  roomGroup.add(tableTop);

  // Workbench Cabinets
  const cabinetGeo = new THREE.BoxGeometry(11.0, 0.85, 4.2);
  const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
  const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
  cabinet.position.set(0, 0.425, 0);
  cabinet.receiveShadow = true;
  roomGroup.add(cabinet);

  // Stainless Steel Sink with Chrome Tap at edge
  const sinkGeo = new THREE.BoxGeometry(1.3, 0.4, 1.3);
  const sinkMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.8 });
  const sink = new THREE.Mesh(sinkGeo, sinkMat);
  sink.position.set(4.8, 0.75, 0.6);
  roomGroup.add(sink);

  const faucetGeo = new THREE.TorusGeometry(0.25, 0.04, 12, 24, Math.PI);
  const faucetMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
  const faucet = new THREE.Mesh(faucetGeo, faucetMat);
  faucet.rotation.z = Math.PI / 2;
  faucet.position.set(4.8, 1.25, 0.6);
  roomGroup.add(faucet);

  // Reagent Rack behind bench with bottles
  const shelfGeo = new THREE.BoxGeometry(8.0, 0.08, 0.4);
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 });
  const shelf = new THREE.Mesh(shelfGeo, shelfMat);
  shelf.position.set(0, 1.3, -1.8);
  roomGroup.add(shelf);

  const bottleColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0x06b6d4];
  for (let i = 0; i < 6; i++) {
    const bGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 12);
    const bMat = new THREE.MeshStandardMaterial({ color: bottleColors[i], roughness: 0.2, transparent: true, opacity: 0.85 });
    const bMesh = new THREE.Mesh(bGeo, bMat);
    bMesh.position.set(-2.5 + i * 1.0, 1.5, -1.8);
    roomGroup.add(bMesh);
  }

  // 3D Avatar Assistant "Dr. Vigyan / विज्ञान साथी" at corner of bench
  const avatarGroup = new THREE.Group();
  avatarGroup.position.set(-4.5, 0, 0.6);

  // Body / Lab Coat
  const coatGeo = new THREE.CylinderGeometry(0.35, 0.5, 1.6, 16);
  const coatMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
  const coat = new THREE.Mesh(coatGeo, coatMat);
  coat.position.y = 1.6;
  avatarGroup.add(coat);

  // Tie & Collar
  const tieGeo = new THREE.BoxGeometry(0.1, 0.45, 0.05);
  const tieMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
  const tie = new THREE.Mesh(tieGeo, tieMat);
  tie.position.set(0, 2.1, 0.36);
  avatarGroup.add(tie);

  // Head
  const headGeo = new THREE.SphereGeometry(0.28, 20, 20);
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.8 });
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.y = 2.65;
  avatarGroup.add(headMesh);

  // Hair
  const hairGeo = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.y = 2.75;
  avatarGroup.add(hair);

  // Safety Goggles
  const goggleGeo = new THREE.BoxGeometry(0.38, 0.12, 0.12);
  const goggleMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7, metalness: 0.3 });
  const goggle = new THREE.Mesh(goggleGeo, goggleMat);
  goggle.position.set(0, 2.68, 0.25);
  avatarGroup.add(goggle);

  roomGroup.add(avatarGroup);
  scene.add(roomGroup);

  // Dynamic Apparatus Group (cleared & rebuilt per experiment)
  const labGroup = new THREE.Group();
  labGroup.position.set(0, 0.98, 0); // Sits cleanly on the bench top!
  scene.add(labGroup);

  // Subtle Idle Animation
  let clock = new THREE.Clock();
  let avatarTime = 0;
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    avatarTime += delta;
    if (avatarGroup) {
      avatarGroup.position.y = Math.sin(avatarTime * 1.5) * 0.02;
      headMesh.rotation.y = Math.sin(avatarTime * 0.8) * 0.12;
    }
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // Glass Material Helper
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.42,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.85,
    ior: 1.5
  });

  // ── 3. DOM References & Common UI Helpers ──────────────────────────────────
  const stepNumEl = document.getElementById('current-step-num');
  const stepTextEl = document.getElementById('current-step-text');
  const obsEn = document.getElementById('obs-en');
  const obsNe = document.getElementById('obs-ne');
  const assistantSpeech = document.getElementById('assistant-speech');
  const repeatVoiceBtn = document.getElementById('repeat-voice-btn');
  const actionsGrid = document.getElementById('action-buttons-container');
  const slidersWrap = document.getElementById('dynamic-sliders-wrap');
  const formulaBox = document.getElementById('dynamic-formula-box');
  const rackList = document.getElementById('equipment-items-list');
  const rackCountTag = document.getElementById('rack-count-tag');
  const rackSearch = document.getElementById('rack-search-input');
  const expSelect = document.getElementById('experiment-select');

  let currentStepEn = '';
  let currentStepNe = '';

  function setStep(num, en, ne) {
    stepNumEl.textContent = num;
    stepTextEl.textContent = `${en} (${ne})`;
    currentStepEn = en;
    currentStepNe = ne;
    assistantSpeech.textContent = en;
    speakText(en, ne);
  }

  function setObservation(en, ne) {
    obsEn.textContent = en;
    obsNe.textContent = ne ? `(${ne})` : '';
  }

  repeatVoiceBtn.addEventListener('click', () => {
    if (currentStepEn) speakText(currentStepEn, currentStepNe);
  });

  // Equipment Rack Renderer
  function renderRack(items, activeStage, onSelect) {
    function update(q = '') {
      const query = q.toLowerCase().trim();
      const filtered = items.filter(it => it.en.toLowerCase().includes(query) || it.ne.toLowerCase().includes(query));
      rackCountTag.textContent = `${filtered.length} items`;

      rackList.innerHTML = filtered.map(item => {
        const isDone = item.stage < activeStage;
        const isCurrent = item.stage === activeStage;
        const isLocked = item.stage > activeStage;

        const badgeClass = isDone ? 'badge-bench' : isCurrent ? 'badge-pick' : 'badge-locked';
        const badgeText = isDone ? '✓ On Bench' : isCurrent ? `👉 ${item.stage + 1}. Pick` : `🔒 Step ${item.stage + 1}`;

        return `
          <div class="eq-card ${isDone ? 'on-bench' : isCurrent ? 'current-step-card' : 'locked-card'}" data-stage="${item.stage}">
            <div class="eq-card-left">
              <span class="eq-icon">${item.icon}</span>
              <div class="eq-names">
                <h5>${item.en}</h5>
                <p>${item.ne}</p>
              </div>
            </div>
            <span class="eq-badge ${badgeClass}">${badgeText}</span>
          </div>
        `;
      }).join('');

      rackList.querySelectorAll('.eq-card').forEach(card => {
        card.addEventListener('click', () => {
          const stg = parseInt(card.dataset.stage);
          const sel = items.find(it => it.stage === stg);
          if (sel && onSelect) onSelect(sel, stg);
        });
      });
    }

    if (rackSearch) {
      rackSearch.value = '';
      rackSearch.oninput = (e) => update(e.target.value);
    }
    update();
    return update;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── EXPERIMENT 1: Carbon Dioxide Gas Preparation (CO2) ─────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  function setupCO2Experiment() {
    labGroup.clear();
    const g = new THREE.Group();

    // Bench ghost placement marker
    const ghostMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.35 });
    const ghostRing = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.4, 24), ghostMat);
    ghostRing.rotation.x = -Math.PI / 2;
    ghostRing.position.set(-1.0, 0.01, 0);
    g.add(ghostRing);

    // 1. Woulfe's Bottle
    const bottleGroup = new THREE.Group();
    bottleGroup.position.set(-1.0, 0, 0);
    bottleGroup.visible = false;

    const bottleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 1.5, 24), glassMaterial);
    bottleBody.position.y = 0.75;
    bottleGroup.add(bottleBody);

    const neck1 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.4, 16), glassMaterial);
    neck1.position.set(-0.35, 1.6, 0);
    bottleGroup.add(neck1);

    const neck2 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.4, 16), glassMaterial);
    neck2.position.set(0.35, 1.6, 0);
    bottleGroup.add(neck2);

    // Marble chips (CaCO3) inside bottle
    const chipsGroup = new THREE.Group();
    chipsGroup.visible = false;
    for (let i = 0; i < 18; i++) {
      const chip = new THREE.Mesh(new THREE.DodecahedronGeometry(0.09), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 }));
      chip.position.set((Math.random() - 0.5) * 0.7, 0.15 + Math.random() * 0.25, (Math.random() - 0.5) * 0.7);
      chipsGroup.add(chip);
    }
    bottleGroup.add(chipsGroup);

    // Acid liquid layer & bubbles
    const acidMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.45 });
    const acidMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.72, 0.6, 20), acidMat);
    acidMesh.position.y = 0.35;
    acidMesh.visible = false;
    bottleGroup.add(acidMesh);

    const bubblesGroup = new THREE.Group();
    bubblesGroup.visible = false;
    for (let i = 0; i < 16; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }));
      b.position.set((Math.random() - 0.5) * 0.6, 0.15 + Math.random() * 0.45, (Math.random() - 0.5) * 0.6);
      bubblesGroup.add(b);
    }
    bottleGroup.add(bubblesGroup);
    g.add(bottleGroup);

    // 2. Thistle Funnel
    const funnelGroup = new THREE.Group();
    funnelGroup.position.set(-1.35, 0, 0);
    funnelGroup.visible = false;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.3), glassMaterial);
    stem.position.y = 1.35;
    funnelGroup.add(stem);
    const cup = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.45, 16), glassMaterial);
    cup.position.y = 2.45;
    cup.rotation.x = Math.PI;
    funnelGroup.add(cup);
    g.add(funnelGroup);

    // 3. Delivery Tube
    const co2Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.65, 1.7, 0),
      new THREE.Vector3(-0.65, 2.4, 0),
      new THREE.Vector3(0.5, 2.4, 0),
      new THREE.Vector3(1.3, 2.4, 0),
      new THREE.Vector3(1.3, 0.6, 0)
    ]);
    const co2DeliveryTube = new THREE.Mesh(new THREE.TubeGeometry(co2Curve, 32, 0.035, 12, false), glassMaterial);
    co2DeliveryTube.visible = false;
    g.add(co2DeliveryTube);

    // 4. Upright Gas Jar
    const jarGroup = new THREE.Group();
    jarGroup.position.set(1.3, 0, 0);
    jarGroup.visible = false;
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.9, 24), glassMaterial);
    jar.position.y = 0.95;
    jarGroup.add(jar);

    const gasCloudMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, transparent: true, opacity: 0 });
    const gasCloud = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 1.8, 16), gasCloudMat);
    gasCloud.position.y = 0.95;
    jarGroup.add(gasCloud);
    g.add(jarGroup);

    // 5. Burning Match / Splinter Test
    const matchGroup = new THREE.Group();
    matchGroup.position.set(1.3, 2.1, 0);
    matchGroup.visible = false;
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
    stick.position.y = 0.35;
    matchGroup.add(stick);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 12), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    flame.position.y = 0.75;
    matchGroup.add(flame);
    g.add(matchGroup);

    // 6. Lime Water Test Tube
    const limeGroup = new THREE.Group();
    limeGroup.position.set(2.4, 0, 0);
    limeGroup.visible = false;
    const ltStand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6), new THREE.MeshStandardMaterial({ color: 0x475569 }));
    ltStand.position.y = 0.8;
    limeGroup.add(ltStand);
    const limeTube = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.2, 16), glassMaterial);
    limeTube.position.set(0.3, 0.7, 0);
    limeGroup.add(limeTube);
    const limeLiquid = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.7, 16), new THREE.MeshStandardMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.35 }));
    limeLiquid.position.set(0.3, 0.5, 0);
    limeGroup.add(limeLiquid);
    g.add(limeGroup);

    labGroup.add(g);

    // Stoichiometry State & Sliders
    let caco3Mass = 10;
    let hclMolarity = 2.0;

    function updateCO2Calc() {
      const moles = caco3Mass / 100.09;
      const co2VolML = (moles * 22400).toFixed(0);
      const hclVolNeeded = ((moles * 2) / hclMolarity * 1000).toFixed(1);

      slidersWrap.innerHTML = `
        <div class="calc-slider-group">
          <div class="slider-label-row">
            <span>CaCO₃ Marble Chips Mass:</span>
            <span class="val">${caco3Mass} g</span>
          </div>
          <input type="range" class="custom-range" id="caco3-range" min="2" max="25" value="${caco3Mass}" />
        </div>
        <div class="calc-slider-group">
          <div class="slider-label-row">
            <span>Dilute HCl Concentration:</span>
            <span class="val">${hclMolarity} M</span>
          </div>
          <input type="range" class="custom-range" id="hcl-range" min="0.5" max="4.0" step="0.5" value="${hclMolarity}" />
        </div>
      `;

      formulaBox.innerHTML = `
        <div class="formula-title">Reaction Stoichiometry · रासायनिक समीकरण</div>
        <div class="formula-math">CaCO₃ + 2HCl ➔ CaCl₂ + H₂O + CO₂↑</div>
        <div class="formula-result">
          <span>CO₂ Gas Yield:</span>
          <span>${co2VolML} mL (NTP)</span>
        </div>
        <div class="formula-result" style="color:#38bdf8;">
          <span>HCl Volume Required:</span>
          <span>${hclVolNeeded} mL</span>
        </div>
      `;

      document.getElementById('caco3-range').oninput = (e) => {
        caco3Mass = parseInt(e.target.value);
        updateCO2Calc();
      };
      document.getElementById('hcl-range').oninput = (e) => {
        hclMolarity = parseFloat(e.target.value);
        updateCO2Calc();
      };
    }
    updateCO2Calc();

    // Equipment items list for Rack
    const eqItems = [
      { stage: 0, id: 'bottle', icon: '⚗️', en: "Woulfe's Two-Neck Bottle", ne: "उल्फको दुई मुखे बोतल", descNe: "बोतल बेन्चमा राख्नुहोस्" },
      { stage: 1, id: 'funnel', icon: '🧪', en: 'Thistle Funnel', ne: 'थिसल फनेल', descNe: 'फनेल बोतलको एउटा मुखमा जोड्नुहोस्' },
      { stage: 2, id: 'dtube', icon: '🔄', en: 'Delivery Tube', ne: 'डेलिभरी नली', descNe: 'डेलिभरी नली अर्को मुखमा जोड्नुहोस्' },
      { stage: 3, id: 'jar', icon: '🫙', en: 'Upright Gas Jar', ne: 'सुल्टो ग्यास जार', descNe: 'सुल्टो ग्यास जार डेलिभरी नलीमुनि राख्नुहोस्' },
      { stage: 4, id: 'chips', icon: '🪨', en: 'Calcium Carbonate (CaCO₃)', ne: 'मार्बलका टुक्राहरू (CaCO₃)', descNe: 'बोतलमा मार्बलका टुक्रा हाल्नुहोस्' },
      { stage: 5, id: 'acid', icon: '💧', en: 'Dilute HCl Acid', ne: 'पातलो हाइड्रोक्लोरिक अम्ल', descNe: 'फनेलबाट अम्ल खन्याउनुहोस्' },
      { stage: 6, id: 'match', icon: '🔥', en: 'Burning Splinter', ne: 'बलिरहेको काठको सिन्का', descNe: 'जारको मुखमा बलिरहेको सिन्का लैजानुहोस्' },
      { stage: 7, id: 'limewater', icon: '🥛', en: 'Lime Water Test Tube', ne: 'चुनपानी भएको टेस्ट ट्युब', descNe: 'चुनपानी दूधजस्तो सेतो बन्ने परीक्षण' }
    ];

    let currentStage = 0;
    let updateRackFn = null;

    function executeStage(stg) {
      if (stg === 0) {
        bottleGroup.visible = true;
        ghostRing.visible = false;
        playClink();
        currentStage = 1;
        setStep('2', 'Woulfe\'s bottle placed! Pick "Thistle Funnel" from the rack to insert into the first neck.', 'उल्फको बोतल राखियो! अब पहिलो मुखमा थिसल फनेल जोड्नुहोस्।');
        setObservation('Woulfe\'s bottle placed on bench.', 'बोतल तयार भयो।');
      } else if (stg === 1) {
        funnelGroup.visible = true;
        playClink();
        currentStage = 2;
        setStep('3', 'Thistle funnel inserted! Pick "Delivery Tube" from the rack to connect the gas exit.', 'थिसल फनेल जोडियो! अब दोस्रो मुखमा डेलिभरी नली जोड्नुहोस्।');
        setObservation('Thistle funnel dips to the bottom.', 'फनेल तलसम्म पुगेको छ।');
      } else if (stg === 2) {
        co2DeliveryTube.visible = true;
        playClink();
        currentStage = 3;
        setStep('4', 'Delivery tube connected! Pick "Upright Gas Jar" to collect CO₂ by upward displacement of air.', 'डेलिभरी नली जोडियो! अब सुल्टो ग्यास जार मिलाउनुहोस्।');
        setObservation('Upward displacement of air (CO₂ vapor density = 22, heavier than air).', 'हावालाई माथितिर विस्थापित गर्छ।');
      } else if (stg === 3) {
        jarGroup.visible = true;
        playClink();
        currentStage = 4;
        setStep('5', 'Gas jar placed! Pick "Calcium Carbonate (CaCO₃)" marble chips to load solid reactants.', 'जार राखियो! अब मार्बलका टुक्रा बोतलमा हाल्नुहोस्।');
        setObservation('Apparatus assembled. Ready for reactants.', 'उपकरण तयार भयो।');
      } else if (stg === 4) {
        chipsGroup.visible = true;
        playClink();
        currentStage = 5;
        setStep('6', 'Marble chips loaded! Pick "Dilute HCl Acid" to pour through the thistle funnel.', 'मार्बलका टुक्रा हालियो! अब फनेलबाट पातलो HCl अम्ल खन्याउनुहोस्।');
        setObservation('CaCO₃ ready at bottom of Woulfe\'s bottle.', 'मार्बलका टुक्रा बोतलमा तयार।');
      } else if (stg === 5) {
        acidMesh.visible = true;
        bubblesGroup.visible = true;
        playPourSound();
        playBubbleSound();
        gasCloudMat.opacity = 0.55;
        currentStage = 6;
        setStep('7', 'Effervescence! CO₂ gas is evolving rapidly. Pick "Burning Splinter" to test the gas in the jar.', 'रसायनिक प्रतिक्रिया सुरु भयो! अब "बलिरहेको सिन्का" लगेर परीक्षण गर्नुहोस्।');
        setObservation('CaCO₃ + 2HCl ➔ CaCl₂ + H₂O + CO₂↑ (Brisk Effervescence)', 'तीव्र गतिमा CO₂ ग्यास बनिरहेको छ।');
      } else if (stg === 6) {
        matchGroup.visible = true;
        playHissSound();
        setTimeout(() => {
          flame.visible = false; // Extinguished!
          playSuccess();
          currentStage = 7;
          setStep('8', 'The flame was instantly extinguished! CO₂ does not support combustion. Finally, test with "Lime Water".', 'सिन्का तुरुन्तै निभ्यो! CO₂ ले बल्न मद्दत गर्दैन। अब "चुनपानी" मा पठाएर परीक्षण गर्नुहोस्।');
          setObservation('Flame Extinguished: CO₂ is non-combustible and a non-supporter of combustion.', 'सिन्का निभ्यो - CO₂ ले बल्न दिँदैन।');
          updateActionButtons();
          if (updateRackFn) updateRackFn();
        }, 500);
      } else if (stg === 7) {
        limeGroup.visible = true;
        playBubbleSound();
        setTimeout(() => {
          limeLiquid.material.color.setHex(0xffffff);
          limeLiquid.material.opacity = 0.95; // Milky white!
          playSuccess();
          currentStage = 8;
          setStep('Done!', 'Lime water turned MILKY WHITE due to CaCO₃ precipitate formation! Practical 100% complete!', 'चुनपानी दूधजस्तो सेतो भयो! CO₂ ग्यास बन्ने विधि १००% प्रमाणित भयो!');
          setObservation('Ca(OH)₂ + CO₂ ➔ CaCO₃↓ (Milky White) + H₂O', 'चुनपानी दूधजस्तो सेतो भयो - CO₂ प्रमाणित।');
          updateActionButtons();
          if (updateRackFn) updateRackFn();
        }, 600);
      }

      updateActionButtons();
      if (updateRackFn) updateRackFn();
    }

    function updateActionButtons() {
      const cur = eqItems[currentStage] || { en: 'Experiment Complete!', ne: 'प्रयोग सम्पन्न भयो!' };
      actionsGrid.innerHTML = `
        <button class="lab-action-btn" id="btn-co2-next" ${currentStage >= 8 ? 'disabled' : ''}>
          <span>👉 Step ${currentStage + 1}: ${cur.en}</span>
          <span class="sub">${cur.ne}</span>
        </button>
        <button class="lab-action-btn btn-reset" id="btn-co2-reset">
          <span>🔄 Clean Bench</span>
          <span class="sub">खाली बेन्च</span>
        </button>
      `;

      const bNext = document.getElementById('btn-co2-next');
      if (bNext && currentStage < 8) {
        bNext.onclick = () => executeStage(currentStage);
      }
      document.getElementById('btn-co2-reset').onclick = () => setupCO2Experiment();
    }

    updateRackFn = renderRack(eqItems, currentStage, (item, stg) => {
      if (stg === currentStage) executeStage(stg);
      else if (stg < currentStage) setObservation(`${item.en} is already assembled.`, `${item.ne} पहिले नै राखिएको छ।`);
    });

    setStep('1', 'Pick "Woulfe\'s Two-Neck Bottle" from the equipment rack to place on your workbench.', 'उपकरण र्याकबाट उल्फको दुई मुखे बोतल छनोट गरी बेन्चमा राख्नुहोस्।');
    setObservation('Clean bench ready. Select apparatus from rack.', 'प्रयोगशाला बेन्च तयार।');
    updateActionButtons();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── EXPERIMENT 2: Ammonia Gas Preparation (NH3) ───────────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  function setupNH3Experiment() {
    labGroup.clear();
    const g = new THREE.Group();

    // 1. Stand & Clamp
    const standGroup = new THREE.Group();
    standGroup.position.set(-1.4, 0, 0);
    standGroup.visible = false;
    const sBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.6), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 }));
    sBase.position.y = 0.05;
    standGroup.add(sBase);
    const sPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.8), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 }));
    sPole.position.y = 1.4;
    standGroup.add(sPole);
    const sClamp = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 0.06), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 }));
    sClamp.position.set(0.4, 1.8, 0);
    standGroup.add(sClamp);
    g.add(standGroup);

    // 2. Hard Glass Tube slanted downwards
    const tubeGroup = new THREE.Group();
    tubeGroup.position.set(-0.8, 1.8, 0);
    tubeGroup.rotation.z = 0.22; // Slanted downwards!
    tubeGroup.visible = false;
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.8, 20), glassMaterial);
    tubeGroup.add(tube);
    const mix = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.8, 16), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 }));
    mix.position.y = -0.4;
    mix.visible = false;
    tubeGroup.add(mix);
    g.add(tubeGroup);

    // 3. Bunsen Burner
    const burnerGroup = new THREE.Group();
    burnerGroup.position.set(-0.8, 0, 0);
    burnerGroup.visible = false;
    const bBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.15), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 }));
    bBase.position.y = 0.075;
    burnerGroup.add(bBase);
    const bPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
    bPipe.position.y = 0.45;
    burnerGroup.add(bPipe);
    const bFlame = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 16), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    bFlame.position.y = 0.95;
    bFlame.visible = false;
    burnerGroup.add(bFlame);
    g.add(burnerGroup);

    // 4. Inverted Gas Jar
    const jarGroup = new THREE.Group();
    jarGroup.position.set(1.4, 1.3, 0);
    jarGroup.visible = false;
    const invJar = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.8, 24), glassMaterial);
    invJar.rotation.x = Math.PI; // Inverted!
    jarGroup.add(invJar);
    const nh3Cloud = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.7, 16), new THREE.MeshStandardMaterial({ color: 0xf8fafc, transparent: true, opacity: 0 }));
    jarGroup.add(nh3Cloud);
    g.add(jarGroup);

    // 5. Delivery Tube
    const nh3Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.7, 1.8, 0),
      new THREE.Vector3(0.3, 2.3, 0),
      new THREE.Vector3(1.4, 2.3, 0),
      new THREE.Vector3(1.4, 1.8, 0)
    ]);
    const nh3DeliveryTube = new THREE.Mesh(new THREE.TubeGeometry(nh3Curve, 32, 0.035, 12, false), glassMaterial);
    nh3DeliveryTube.visible = false;
    g.add(nh3DeliveryTube);

    // 6. Red Litmus Paper
    const litmus = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.02), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    litmus.position.set(1.4, 0.2, 0);
    litmus.visible = false;
    g.add(litmus);

    // 7. Conc. HCl Glass Rod
    const rodGroup = new THREE.Group();
    rodGroup.position.set(1.4, 0.2, 0);
    rodGroup.visible = false;
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8), glassMaterial);
    rodGroup.add(rod);
    const fumes = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }));
    fumes.position.y = 0.45;
    rodGroup.add(fumes);
    g.add(rodGroup);

    labGroup.add(g);

    // Stoichiometry
    let nh4Mass = 10;
    let caohMass = 5;

    function updateNH3Calc() {
      const moles = nh4Mass / 53.49;
      const volML = (moles * 22400).toFixed(0);

      slidersWrap.innerHTML = `
        <div class="calc-slider-group">
          <div class="slider-label-row">
            <span>Ammonium Chloride (NH₄Cl) Mass:</span>
            <span class="val">${nh4Mass} g</span>
          </div>
          <input type="range" class="custom-range" id="nh4-range" min="4" max="20" value="${nh4Mass}" />
        </div>
        <div class="calc-slider-group">
          <div class="slider-label-row">
            <span>Slaked Lime Ca(OH)₂ (2:1 Ratio):</span>
            <span class="val">${caohMass} g</span>
          </div>
          <input type="range" class="custom-range" id="caoh-range" min="2" max="10" value="${caohMass}" />
        </div>
      `;

      formulaBox.innerHTML = `
        <div class="formula-title">Ammonia Stoichiometry · एमोनिया गणना</div>
        <div class="formula-math">2NH₄Cl + Ca(OH)₂ ─(Heat)─➔ CaCl₂ + 2H₂O + 2NH₃↑</div>
        <div class="formula-result">
          <span>Theoretical NH₃ Gas Volume:</span>
          <span>${volML} mL (at NTP)</span>
        </div>
      `;

      document.getElementById('nh4-range').oninput = (e) => {
        nh4Mass = parseInt(e.target.value);
        caohMass = Math.round(nh4Mass / 2);
        updateNH3Calc();
      };
      document.getElementById('caoh-range').oninput = (e) => {
        caohMass = parseInt(e.target.value);
        nh4Mass = caohMass * 2;
        updateNH3Calc();
      };
    }
    updateNH3Calc();

    const eqItems = [
      { stage: 0, id: 'stand', icon: '🏗️', en: 'Retort Stand with Clamp', ne: 'रिटोर्ट स्ट्यान्ड र क्ल्याम्प', descNe: 'स्ट्यान्ड बेन्चमा राख्नुहोस्' },
      { stage: 1, id: 'tube', icon: '🧪', en: 'Hard Glass Test Tube', ne: 'कडा काँचको टेस्ट ट्युब', descNe: 'टेस्ट ट्युबलाई तलतिर ढल्काएर जोड्नुहोस्' },
      { stage: 2, id: 'mix', icon: '🧂', en: 'Solid NH₄Cl + Ca(OH)₂ (2:1)', ne: 'ठोस मिश्रण (नौसादर र चुन)', descNe: 'ठोस मिश्रण नलीमा हाल्नुहोस्' },
      { stage: 3, id: 'dtube', icon: '🔄', en: 'Delivery Tube', ne: 'डेलिभरी नली', descNe: 'डेलिभरी नली जोड्नुहोस्' },
      { stage: 4, id: 'jar', icon: '🫙', en: 'Inverted Gas Jar', ne: 'उल्टो ग्यास जार', descNe: 'उल्टो ग्यास जार मिलाउनुहोस्' },
      { stage: 5, id: 'burner', icon: '🔥', en: 'Bunsen Burner', ne: 'बुन्सेन बर्नर', descNe: 'बर्नर राखी बाल्नुहोस्' },
      { stage: 6, id: 'litmus', icon: '🟥', en: 'Moist Red Litmus Paper', ne: 'भिजेको रातो लिटमस', descNe: 'रातो लिटमस नीलो हुने परीक्षण' },
      { stage: 7, id: 'rod', icon: '🧪', en: 'Conc. HCl Glass Rod', ne: 'HCl भिजेको काँचको डन्डी', descNe: 'बाक्लो सेतो धुवाँ परीक्षण' }
    ];

    let currentStage = 0;
    let updateRackFn = null;

    function executeStage(stg) {
      if (stg === 0) {
        standGroup.visible = true;
        playClink();
        currentStage = 1;
        setStep('2', 'Stand placed! Pick "Hard Glass Test Tube" to clamp slanted downwards.', 'स्ट्यान्ड राखियो! अब टेस्ट ट्युब तलतिर ढल्काएर क्ल्याम्पमा जोड्नुहोस्।');
        setObservation('Slanted tube prevents condensed water from cracking hot glass.', 'पानीको बाफले ट्युब नफुटोस् भनेर ढल्काइन्छ।');
      } else if (stg === 1) {
        tubeGroup.visible = true;
        playClink();
        currentStage = 2;
        setStep('3', 'Test tube clamped! Pick "Solid NH₄Cl + Ca(OH)₂ (2:1)" mixture to load solid reactants.', 'टेस्ट ट्युब जोडियो! अब नौसादर र चुनको ठोस मिश्रण हाल्नुहोस्।');
        setObservation('Ready for 2:1 reactant mixture.', 'ठोस मिश्रण हाल्न तयार।');
      } else if (stg === 2) {
        mix.visible = true;
        playClink();
        currentStage = 3;
        setStep('4', 'Mixture loaded! Pick "Delivery Tube" to connect the exit path.', 'मिश्रण हालियो! अब डेलिभरी नली जोड्नुहोस्।');
        setObservation('2NH₄Cl + Ca(OH)₂ prepared in 2:1 ratio by weight.', 'ठोस मिश्रण तयार।');
      } else if (stg === 3) {
        nh3DeliveryTube.visible = true;
        playClink();
        currentStage = 4;
        setStep('5', 'Delivery tube connected! Pick "Inverted Gas Jar" to collect NH₃ by downward displacement of air.', 'डेलिभरी नली जोडियो! अब एमोनिया संकलन गर्न उल्टो ग्यास जार मिलाउनुहोस्।');
        setObservation('Ammonia is lighter than air (V.D. = 8.5), collected in inverted jar.', 'एमोनिया हावाभन्दा हलुङ्गो हुन्छ।');
      } else if (stg === 4) {
        jarGroup.visible = true;
        playClink();
        currentStage = 5;
        setStep('6', 'Jar in place! Pick "Bunsen Burner" and place it under the test tube to heat.', 'उपकरण तयार भयो! अब बुन्सेन बर्नर राखी बाल्नुहोस्।');
        setObservation('Apparatus assembled. Ready to heat.', 'सम्पूर्ण उपकरण तयार।');
      } else if (stg === 5) {
        burnerGroup.visible = true;
        bFlame.visible = true;
        playFlameSound();
        nh3Cloud.material.opacity = 0.5;
        currentStage = 6;
        setStep('7', 'Heating! Ammonia gas is filling the jar. Pick "Moist Red Litmus Paper" to test.', 'तताइँदैछ! एमोनिया ग्यास बन्दैछ। अब "भिजेको रातो लिटमस" छनोट गर्नुहोस्।');
        setObservation('2NH₄Cl + Ca(OH)₂ ─(Heat)─➔ CaCl₂ + 2H₂O + 2NH₃↑', 'एमोनिया ग्यास उत्पादन भइरहेको छ।');
      } else if (stg === 6) {
        litmus.visible = true;
        playClink();
        setTimeout(() => {
          litmus.material.color.setHex(0x3b82f6); // Turns blue!
          playSuccess();
          currentStage = 7;
          setStep('8', 'Red litmus turned BLUE! Ammonia is basic. Finally, test with "Conc. HCl Glass Rod".', 'रातो लिटमस नीलो भयो! एमोनिया क्षार हो। अब HCl मा भिजेको काँचको डन्डी छनोट गर्नुहोस्।');
          setObservation('Litmus: Red ➔ Blue (Alkaline Gas Confirmed)', 'रातो लिटमस नीलो बन्यो - एमोनिया क्षार हो।');
          updateActionButtons();
          if (updateRackFn) updateRackFn();
        }, 500);
      } else if (stg === 7) {
        rodGroup.visible = true;
        playHissSound();
        playSuccess();
        currentStage = 8;
        setStep('Done!', 'Dense white fumes of Ammonium Chloride (NH₄Cl) formed! NH₃ + HCl ➔ NH₄Cl↑. Practical 100% complete!', 'बाक्लो सेतो धुवाँ (NH₄Cl) बन्यो! एमोनिया ग्यास बन्ने विधि १००% प्रमाणित!');
        setObservation('Dense white fumes of NH₄Cl confirmed Ammonia.', 'कन्सन्ट्रेटेड HCl र NH₃ मिलेर बाक्लो सेतो धुवाँ बन्यो।');
        updateActionButtons();
        if (updateRackFn) updateRackFn();
      }

      updateActionButtons();
      if (updateRackFn) updateRackFn();
    }

    function updateActionButtons() {
      const cur = eqItems[currentStage] || { en: 'Experiment Complete!', ne: 'प्रयोग सम्पन्न भयो!' };
      actionsGrid.innerHTML = `
        <button class="lab-action-btn" id="btn-nh3-next" ${currentStage >= 8 ? 'disabled' : ''}>
          <span>👉 Step ${currentStage + 1}: ${cur.en}</span>
          <span class="sub">${cur.ne}</span>
        </button>
        <button class="lab-action-btn btn-reset" id="btn-nh3-reset">
          <span>🔄 Clean Bench</span>
          <span class="sub">खाली बेन्च</span>
        </button>
      `;

      const bNext = document.getElementById('btn-nh3-next');
      if (bNext && currentStage < 8) {
        bNext.onclick = () => executeStage(currentStage);
      }
      document.getElementById('btn-nh3-reset').onclick = () => setupNH3Experiment();
    }

    updateRackFn = renderRack(eqItems, currentStage, (item, stg) => {
      if (stg === currentStage) executeStage(stg);
      else if (stg < currentStage) setObservation(`${item.en} is already assembled.`, `${item.ne} पहिले नै राखिएको छ।`);
    });

    setStep('1', 'Pick "Retort Stand with Clamp" from the equipment rack.', 'उपकरण र्याकबाट रिटोर्ट स्ट्यान्ड र क्ल्याम्प छनोट गरी बेन्चमा राख्नुहोस्।');
    setObservation('Clean bench ready for NH₃ preparation.', 'एमोनिया बनाउने बेन्च तयार।');
    updateActionButtons();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── EXPERIMENT 3: Acid-Base Neutralization Titration (HCl + NaOH) ──────────
  // ════════════════════════════════════════════════════════════════════════════
  function setupTitrationExperiment() {
    labGroup.clear();
    const g = new THREE.Group();

    // Stand & Burette Clamp
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.2), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 }));
    stand.position.set(-0.6, 1.6, 0);
    g.add(stand);

    // 50mL Graduated Burette
    const burette = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 20), glassMaterial);
    burette.position.set(-0.1, 1.9, 0);
    g.add(burette);

    const naohLiquid = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 2.0, 16), new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.5 }));
    naohLiquid.position.set(-0.1, 1.9, 0);
    g.add(naohLiquid);

    // Conical Flask
    const flask = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.8, 20), glassMaterial);
    flask.position.set(-0.1, 0.4, 0);
    g.add(flask);

    const flaskLiquidMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
    const flaskLiquid = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.4, 16), flaskLiquidMat);
    flaskLiquid.position.set(-0.1, 0.2, 0);
    g.add(flaskLiquid);

    labGroup.add(g);

    let naohTitrantVol = 0.0;
    let hclVol = 25.0;
    let hclMolarity = 0.1;
    let naohMolarity = 0.1;

    function updateTitrationCalc() {
      const isNeutral = naohTitrantVol >= 25.0;
      if (isNeutral) {
        flaskLiquidMat.color.setHex(0xf472b6); // Permanent pale pink endpoint!
        flaskLiquidMat.opacity = 0.85;
      } else {
        flaskLiquidMat.color.setHex(0xffffff);
        flaskLiquidMat.opacity = 0.4;
      }

      slidersWrap.innerHTML = `
        <div class="calc-slider-group">
          <div class="slider-label-row">
            <span>Burette Stopcock Dispense:</span>
            <span class="val">${naohTitrantVol.toFixed(1)} mL NaOH</span>
          </div>
          <input type="range" class="custom-range" id="titrant-range" min="0" max="30" step="0.5" value="${naohTitrantVol}" />
        </div>
      `;

      formulaBox.innerHTML = `
        <div class="formula-title">Titration Equation · उदासीनीकरण</div>
        <div class="formula-math">HCl + NaOH ➔ NaCl + H₂O</div>
        <div class="formula-math">M₁V₁ (Acid) = M₂V₂ (Base)</div>
        <div class="formula-result">
          <span>Current pH Status:</span>
          <span>${isNeutral ? 'Neutralized (pH 7.0) ✓' : 'Acidic (pH < 7.0)'}</span>
        </div>
      `;

      document.getElementById('titrant-range').oninput = (e) => {
        naohTitrantVol = parseFloat(e.target.value);
        playPourSound();
        updateTitrationCalc();
      };
    }
    updateTitrationCalc();

    const eqItems = [
      { stage: 0, id: 'stand', icon: '🏗️', en: 'Titration Stand & Clamp', ne: 'स्ट्यान्ड र क्ल्याम्प', descNe: 'स्ट्यान्ड बेन्चमा मिलाउनुहोस्' },
      { stage: 1, id: 'burette', icon: '📏', en: '50 mL Graduated Burette', ne: '५० एमएल ब्युरेट', descNe: 'ब्युरेटमा ०.१ M NaOH भर्नुहोस्' },
      { stage: 2, id: 'flask', icon: '⚗️', en: '250 mL Conical Flask', ne: 'कोनिकल फ्लास्क', descNe: 'फ्लास्कमा २५ mL HCl राख्नुहोस्' },
      { stage: 3, id: 'indicator', icon: '💧', en: 'Phenolphthalein Indicator', ne: 'फेनोल्फथेलिन सूचक', descNe: '२ थोपा सूचक हाल्नुहोस्' },
      { stage: 4, id: 'titrate', icon: '🎯', en: 'Titrate to Pale Pink Endpoint', ne: 'हल्का गुलाबी रङ नआएसम्म टाइट्रेसन', descNe: 'अन्तिम बिन्दु पत्ता लगाउनुहोस्' }
    ];

    let currentStage = 0;
    renderRack(eqItems, currentStage, (item, stg) => {
      playClink();
      setObservation(`${item.en} ready for titration.`, `${item.ne} तयार।`);
    });

    setStep('1', 'Fill burette with 0.1M NaOH standard solution and add 2 drops phenolphthalein to HCl in conical flask.', 'ब्युरेटमा ०.१ M NaOH भर्नुहोस् र फ्लास्कमा फेनोल्फथेलिन सूचक हाल्नुहोस्।');
    setObservation('Indicator added: Solution is colorless in acid.', 'अम्लीय घोलमा फेनोल्फथेलिन रङहीन रहन्छ।');

    actionsGrid.innerHTML = `
      <button class="lab-action-btn" id="btn-titrate-drop">
        <span>💧 Dispense 1 mL NaOH from Burette</span>
        <span class="sub">ब्युरेटबाट १ mL NaOH खन्याउनुहोस्</span>
      </button>
      <button class="lab-action-btn btn-reset" id="btn-titrate-reset">
        <span>🔄 Reset Burette</span>
        <span class="sub">सुरुबाट</span>
      </button>
    `;

    document.getElementById('btn-titrate-drop').onclick = () => {
      naohTitrantVol = Math.min(30, naohTitrantVol + 1.0);
      playPourSound();
      updateTitrationCalc();
      if (naohTitrantVol >= 25.0) {
        playSuccess();
        setStep('Endpoint Reached!', 'Permanent pale pink color obtained! Neutralization complete at 25.0 mL NaOH. M₁V₁ = M₂V₂ verified!', 'स्थायी हल्का गुलाबी रङ आयो! उदासीनीकरण सम्पन्न भयो!');
        setObservation('Endpoint: HCl + NaOH ➔ NaCl + H₂O (Neutralized pH 7.0)', 'उदासीनीकरण सम्पन्न।');
      } else {
        setObservation(`Titrating: ${naohTitrantVol.toFixed(1)} mL dispensed. Swirling flask...`, `खन्याइँदैछ: ${naohTitrantVol.toFixed(1)} mL पुग्यो।`);
      }
    };
    document.getElementById('btn-titrate-reset').onclick = () => setupTitrationExperiment();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── EXPERIMENT 4: Verification of Ohm\'s Law (V = I * R) ───────────────────
  // ════════════════════════════════════════════════════════════════════════════
  function setupOhmsExperiment() {
    labGroup.clear();
    const g = new THREE.Group();

    // Battery Bank
    const battery = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.8), new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.5 }));
    battery.position.set(-2.0, 0.3, 0);
    g.add(battery);

    // Analog Voltmeter
    const voltMeter = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.4, 20), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 }));
    voltMeter.rotation.x = Math.PI / 4;
    voltMeter.position.set(0, 0.4, -0.6);
    g.add(voltMeter);

    // Analog Ammeter
    const ampMeter = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.4, 20), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 }));
    ampMeter.rotation.x = Math.PI / 4;
    ampMeter.position.set(1.4, 0.4, -0.6);
    g.add(ampMeter);

    // Rheostat
    const rheostat = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.6, 16), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 }));
    rheostat.rotation.z = Math.PI / 2;
    rheostat.position.set(0.2, 0.3, 0.6);
    g.add(rheostat);

    labGroup.add(g);

    let voltage = 6.0;
    const resistance = 10.0; // 10 Ohms

    function updateOhmsCalc() {
      const current = voltage / resistance;

      slidersWrap.innerHTML = `
        <div class="calc-slider-group">
          <div class="slider-label-row">
            <span>Rheostat Potential Difference (V):</span>
            <span class="val">${voltage.toFixed(1)} V</span>
          </div>
          <input type="range" class="custom-range" id="volt-range" min="1.0" max="12.0" step="0.5" value="${voltage}" />
        </div>
      `;

      formulaBox.innerHTML = `
        <div class="formula-title">Ohm\'s Law · ओमको नियम</div>
        <div class="formula-math">V = I × R  ⟹  I = V / R</div>
        <div class="formula-result">
          <span>Circuit Current (I):</span>
          <span>${current.toFixed(2)} A</span>
        </div>
        <div class="formula-result" style="color:#38bdf8;">
          <span>Fixed Resistor (R):</span>
          <span>${resistance.toFixed(1)} Ω</span>
        </div>
      `;

      document.getElementById('volt-range').oninput = (e) => {
        voltage = parseFloat(e.target.value);
        playTone(300 + voltage * 50, 'sine', 0.08, 0.1);
        updateOhmsCalc();
      };
    }
    updateOhmsCalc();

    const eqItems = [
      { stage: 0, id: 'batt', icon: '🔋', en: 'DC Battery Bank (12V)', ne: 'ब्याट्री', descNe: 'पावर सप्लाई जोड्नुहोस्' },
      { stage: 1, id: 'rheo', icon: '🎚️', en: 'Sliding Rheostat', ne: 'रियोस्ट्याट', descNe: 'करेन्ट नियन्त्रक' },
      { stage: 2, id: 'res', icon: '⚡', en: 'Constantan Resistor Wire', ne: 'प्रतिरोधक तार', descNe: '१० ओम प्रतिरोधक' },
      { stage: 3, id: 'volt', icon: '📟', en: 'Analog Voltmeter (Parallel)', ne: 'भोल्टमिटर (समानान्तर)', descNe: 'भोल्टेज नाप्नुहोस्' },
      { stage: 4, id: 'amm', icon: '🧭', en: 'Analog Ammeter (Series)', ne: 'एमिमिटर (श्रेणीबद्ध)', descNe: 'करेन्ट नाप्नुहोस्' }
    ];

    renderRack(eqItems, 4, (item) => {
      playClink();
      setObservation(`Circuit element: ${item.en}`, `${item.ne} परिपथमा जडान छ।`);
    });

    setStep('1', 'Slide the rheostat to vary voltage and observe proportional current change. V ∝ I is verified!', 'रियोस्ट्याट चलाएर भोल्टेज बदल्नुहोस् र करेन्ट नाप्नुहोस्।');
    setObservation('V = I × R. The slope of V vs I gives constant Resistance (10 Ω).', 'भोल्टेज बढाउँदा करेन्ट पनि समानुपातिक रूपमा बढ्छ।');

    actionsGrid.innerHTML = `
      <button class="lab-action-btn" id="btn-ohms-step">
        <span>⚡ Step Voltage (+2V)</span>
        <span class="sub">भोल्टेज बढाउनुहोस्</span>
      </button>
      <button class="lab-action-btn btn-reset" id="btn-ohms-reset">
        <span>🔄 Reset Circuit</span>
        <span class="sub">सुरुबाट</span>
      </button>
    `;

    document.getElementById('btn-ohms-step').onclick = () => {
      voltage = voltage >= 12.0 ? 2.0 : voltage + 2.0;
      playTone(400 + voltage * 40, 'triangle', 0.12, 0.15);
      updateOhmsCalc();
      setObservation(`Voltage set to ${voltage.toFixed(1)}V. Current = ${(voltage / resistance).toFixed(2)}A`, `भोल्टेज ${voltage}V मा करेन्ट ${(voltage/resistance).toFixed(2)}A भयो।`);
    };
    document.getElementById('btn-ohms-reset').onclick = () => setupOhmsExperiment();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── EXPERIMENT 5: Archimedes\' Principle & Upthrust ─────────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  function setupArchimedesExperiment() {
    labGroup.clear();
    const g = new THREE.Group();

    // Retort Stand with Spring Balance
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.2), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 }));
    stand.position.set(-0.8, 1.6, 0);
    g.add(stand);

    const balance = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6 }));
    balance.position.set(-0.4, 2.1, 0);
    g.add(balance);

    // Eureka Can with Spout
    const eureka = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.4, 24), glassMaterial);
    eureka.position.set(-0.4, 0.7, 0);
    g.add(eureka);

    const waterInCan = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 1.1, 20), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 }));
    waterInCan.position.set(-0.4, 0.6, 0);
    g.add(waterInCan);

    // Measuring Cylinder
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.9, 16), glassMaterial);
    cyl.position.set(0.6, 0.45, 0);
    g.add(cyl);

    const displacedWater = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 }));
    displacedWater.position.set(0.6, 0.28, 0);
    g.add(displacedWater);

    // Solid Brass Cylinder
    const solid = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.6, 16), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 }));
    solid.position.set(-0.4, 1.4, 0);
    g.add(solid);

    labGroup.add(g);

    let immersionPct = 0; // 0 to 100%
    const weightAir = 3.5; // N
    const maxDisplaced = 1.0; // N

    function updateArchimedesCalc() {
      const upthrust = (immersionPct / 100) * maxDisplaced;
      const weightWater = weightAir - upthrust;
      const displacedML = ((immersionPct / 100) * 100).toFixed(0);

      solid.position.y = 1.4 - (immersionPct / 100) * 0.7;

      slidersWrap.innerHTML = `
        <div class="calc-slider-group">
          <div class="slider-label-row">
            <span>Immersion in Eureka Can:</span>
            <span class="val">${immersionPct}%</span>
          </div>
          <input type="range" class="custom-range" id="immersion-range" min="0" max="100" value="${immersionPct}" />
        </div>
      `;

      formulaBox.innerHTML = `
        <div class="formula-title">Archimedes\' Principle · आर्किमिडिजको सिद्धान्त</div>
        <div class="formula-math">Upthrust (U) = Weight in Air (W₁) - Weight in Liquid (W₂)</div>
        <div class="formula-result">
          <span>Apparent Weight (W₂):</span>
          <span>${weightWater.toFixed(2)} N</span>
        </div>
        <div class="formula-result" style="color:#38bdf8;">
          <span>Upthrust (U):</span>
          <span>${upthrust.toFixed(2)} N</span>
        </div>
        <div class="formula-result" style="color:#f59e0b;">
          <span>Displaced Liquid Volume:</span>
          <span>${displacedML} mL (Weight = ${upthrust.toFixed(2)} N)</span>
        </div>
      `;

      document.getElementById('immersion-range').oninput = (e) => {
        immersionPct = parseInt(e.target.value);
        if (immersionPct > 0) playBubbleSound();
        updateArchimedesCalc();
      };
    }
    updateArchimedesCalc();

    const eqItems = [
      { stage: 0, id: 'stand', icon: '🏗️', en: 'Retort Stand', ne: 'स्ट्यान्ड', descNe: 'स्ट्यान्ड' },
      { stage: 1, id: 'balance', icon: '⚖️', en: 'Newton Spring Balance', ne: 'स्प्रिङ ब्यालेन्स', descNe: 'कमानी तराजु' },
      { stage: 2, id: 'eureka', icon: '🫙', en: 'Eureka Overflow Can', ne: 'युरेका क्यान', descNe: 'पानी भरिएको क्यान' },
      { stage: 3, id: 'solid', icon: '🔩', en: 'Solid Brass Cylinder (3.5N)', ne: 'ठोस वस्तु', descNe: 'पित्तलको बेलना' },
      { stage: 4, id: 'measuring', icon: '🧪', en: 'Displaced Water Beaker', ne: 'नाप्ने भाँडो', descNe: 'विस्थापित पानी' }
    ];

    renderRack(eqItems, 4, (item) => {
      playClink();
      setObservation(`${item.en} ready on bench.`, `${item.ne} बेन्चमा तयार।`);
    });

    setStep('1', 'Lower the solid into the Eureka can. Loss in weight exactly equals weight of displaced water!', 'ठोस वस्तुलाई युरेका क्यानमा डुबाउनुहोस् र विस्थापित पानीको तौल नाप्नुहोस्।');
    setObservation('Archimedes verified: U = W₁ - W₂ = Displaced Water Weight.', 'उर्ध्वचाप = विस्थापित तरलको तौल प्रमाणित भयो।');

    actionsGrid.innerHTML = `
      <button class="lab-action-btn" id="btn-arch-submerge">
        <span>💧 Submerge Solid Fully (100%)</span>
        <span class="sub">पूरै डुबाउनुहोस्</span>
      </button>
      <button class="lab-action-btn btn-reset" id="btn-arch-reset">
        <span>🔄 Lift Out of Water</span>
        <span class="sub">पानीबाट बाहिर</span>
      </button>
    `;

    document.getElementById('btn-arch-submerge').onclick = () => {
      immersionPct = 100;
      playBubbleSound();
      playSuccess();
      updateArchimedesCalc();
      setStep('Fully Submerged!', 'Solid is 100% submerged! W₁ = 3.5N, W₂ = 2.5N. Upthrust = 1.0N = Weight of 100mL displaced water!', 'पूरै डुब्यो! उर्ध्वचाप = १.० N = विस्थापित पानीको तौल।');
    };
    document.getElementById('btn-arch-reset').onclick = () => {
      immersionPct = 0;
      playClink();
      updateArchimedesCalc();
      setStep('1', 'Solid lifted in air. Weight W₁ = 3.5 N.', 'वस्तु हावामा छ, तौल ३.५ N छ।');
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── EXPERIMENT 6: Triangular Prism Light Dispersion (VIBGYOR) ─────────────
  // ════════════════════════════════════════════════════════════════════════════
  function setupPrismExperiment() {
    labGroup.clear();
    const g = new THREE.Group();

    // Triangular Glass Prism
    const prism = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.4, 3), glassMaterial);
    prism.position.set(0, 0.8, 0);
    prism.rotation.y = Math.PI / 6;
    g.add(prism);

    // Ray Box
    const rayBox = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 1.2), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 }));
    rayBox.position.set(-2.4, 0.4, 0);
    g.add(rayBox);

    // Incoming White Light Beam
    const incidentBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.0), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    incidentBeam.rotation.z = Math.PI / 2;
    incidentBeam.position.set(-1.2, 0.8, 0);
    g.add(incidentBeam);

    // 7 Dispersed Color Rays (VIBGYOR)
    const rainbowColors = [0x7c3aed, 0x4f46e5, 0x0284c7, 0x16a34a, 0xeab308, 0xea580c, 0xdc2626];
    const rayGroup = new THREE.Group();
    rainbowColors.forEach((col, idx) => {
      const angle = (idx - 3) * 0.055;
      const ray = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 2.4), new THREE.MeshBasicMaterial({ color: col }));
      ray.position.set(1.1, 0.8 + angle * 0.4, angle * 1.5);
      ray.rotation.z = Math.PI / 2 - angle;
      rayGroup.add(ray);
    });
    g.add(rayGroup);

    // Screen
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.8, 2.4), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 }));
    screen.position.set(2.4, 0.9, 0);
    g.add(screen);

    labGroup.add(g);

    slidersWrap.innerHTML = `
      <div class="calc-slider-group">
        <div class="slider-label-row">
          <span>Prism Angle of Incidence (i):</span>
          <span class="val">48° (Minimum Deviation)</span>
        </div>
        <input type="range" class="custom-range" min="30" max="65" value="48" disabled />
      </div>
    `;

    formulaBox.innerHTML = `
      <div class="formula-title">Refraction & Dispersion · वर्ण विच्छेदन</div>
      <div class="formula-math">Snell\'s Law: μ = sin[(A + Dₘ)/2] / sin(A/2)</div>
      <div class="formula-math">VIBGYOR: Violet (max deviation) ➔ Red (min deviation)</div>
      <div class="formula-result">
        <span>Flint Glass Refractive Index (μ):</span>
        <span>1.52 (Red) to 1.54 (Violet)</span>
      </div>
    `;

    const eqItems = [
      { stage: 0, id: 'raybox', icon: '🔦', en: 'Ray Box White Light', ne: 'किरण बाकस', descNe: 'सेतो प्रकाशको स्रोत' },
      { stage: 1, id: 'prism', icon: '🔺', en: 'Triangular Flint Glass Prism', ne: 'काँचको प्रिज्म', descNe: 'त्रिकोणीय प्रिज्म' },
      { stage: 2, id: 'screen', icon: '📺', en: 'White Projection Screen', ne: 'प्रक्षेपण पर्दा', descNe: 'सप्तरङ्गी पर्दा' }
    ];

    renderRack(eqItems, 2, (item) => {
      playClink();
      setObservation(`${item.en} active in optical path.`, `${item.ne} अप्टिकल बेन्चमा मिलाइयो।`);
    });

    setStep('1', 'White light enters triangular glass prism and disperses into 7 colors (VIBGYOR).', 'सेतो प्रकाश प्रिज्मबाट जाँदा सात रङमा विभक्त हुन्छ (VIBGYOR)।');
    setObservation('Violet ray bends the most (shortest wavelength), Red bends least (longest wavelength).', 'बैजनी रङ सबैभन्दा बढी र रातो रङ सबैभन्दा कम बाङ्गिन्छ।');

    actionsGrid.innerHTML = `
      <button class="lab-action-btn" id="btn-prism-toggle">
        <span>🌈 Toggle Spectrum Highlights</span>
        <span class="sub">सप्तरङ्गी रङहरू अवलोकन</span>
      </button>
      <button class="lab-action-btn btn-reset" id="btn-prism-reset">
        <span>🔄 Reset Optical Bench</span>
        <span class="sub">सुरुबाट</span>
      </button>
    `;

    document.getElementById('btn-prism-toggle').onclick = () => {
      playSuccess();
      setStep('VIBGYOR Dispersed!', 'Violet, Indigo, Blue, Green, Yellow, Orange, Red projected clearly on screen!', 'बैजनी, गाढा नीलो, नीलो, हरियो, पहेंलो, सुन्तला, र रातो रङहरू पर्दामा देखिए!');
    };
    document.getElementById('btn-prism-reset').onclick = () => setupPrismExperiment();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── EXPERIMENT 7: Compound Optical Microscope & Cell Explorer ─────────────
  // ════════════════════════════════════════════════════════════════════════════
  function setupMicroscopeExperiment() {
    labGroup.clear();
    const g = new THREE.Group();

    // Display Circular Eyepiece Viewfinder Overlay
    const eyepieceOverlay = document.getElementById('microscope-eyepiece-overlay');
    if (eyepieceOverlay) eyepieceOverlay.style.display = 'flex';

    // 3D Compound Microscope on Bench
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.4), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 }));
    base.position.y = 0.1;
    g.add(base);

    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.2), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 }));
    pillar.position.set(0, 1.2, -0.4);
    g.add(pillar);

    const stage = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 1.1), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 }));
    stage.position.set(0, 1.1, 0.15);
    g.add(stage);

    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.02, 0.25), glassMaterial);
    slide.position.set(0, 1.15, 0.15);
    g.add(slide);

    const coverslip = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.022, 0.25), new THREE.MeshStandardMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.7 }));
    coverslip.position.set(0, 1.152, 0.15);
    g.add(coverslip);

    const bodyTube = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.3), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6 }));
    bodyTube.position.set(0, 2.0, 0.15);
    g.add(bodyTube);

    // Objective lenses
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const obj = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.35), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 }));
      obj.position.set(Math.cos(angle) * 0.15, 1.28, 0.15 + Math.sin(angle) * 0.15);
      g.add(obj);
    }

    const ocular = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.35), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 }));
    ocular.position.set(0, 2.7, 0.15);
    g.add(ocular);

    const mirror = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95 }));
    mirror.rotation.x = Math.PI / 4;
    mirror.position.set(0, 0.55, 0.15);
    g.add(mirror);

    labGroup.add(g);

    // ── 2D Eyepiece Cell Canvas Renderer ──
    const cellCanvas = document.getElementById('cell-canvas');
    const focusKnob = document.getElementById('focus-knob-slider');
    const focusBadge = document.getElementById('eyepiece-focus-badge');
    const calloutTitle = document.getElementById('callout-title');
    const calloutDesc = document.getElementById('callout-desc');

    let currentSpecimen = 'plant'; // 'plant', 'animal', 'stomata'
    let focusVal = 15; // 0 to 100 (50 is sharp focus)

    function drawCellEyepiece() {
      if (!cellCanvas) return;
      const ctx = cellCanvas.getContext('2d');
      const w = cellCanvas.width;
      const h = cellCanvas.height;

      ctx.clearRect(0, 0, w, h);

      // Focus blur effect
      const distFromSharp = Math.abs(focusVal - 50);
      const blurPx = (distFromSharp / 50) * 8;
      cellCanvas.style.filter = `blur(${blurPx.toFixed(1)}px)`;

      if (distFromSharp <= 8) {
        focusBadge.textContent = 'FOCUS CRISP ✓';
        focusBadge.className = 'focus-badge focused';
      } else {
        focusBadge.textContent = 'Blurry: Turn Knob';
        focusBadge.className = 'focus-badge';
      }

      if (currentSpecimen === 'plant') {
        // Onion Epidermal Cells (Interlocking Hexagonal Bricks)
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(0, 0, w, h);

        const rows = 3, cols = 3;
        const cw = w / cols, ch = h / rows;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = c * cw, y = r * ch;
            // Cellulose Wall
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 5;
            ctx.strokeRect(x + 4, y + 4, cw - 8, ch - 8);

            // Vacuole
            ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
            ctx.beginPath();
            ctx.ellipse(x + cw / 2 - 4, y + ch / 2, cw * 0.32, ch * 0.28, 0, 0, Math.PI * 2);
            ctx.fill();

            // Nucleus
            ctx.fillStyle = '#818cf8';
            ctx.beginPath();
            ctx.arc(x + cw * 0.78, y + ch * 0.7, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#312e81';
            ctx.beginPath();
            ctx.arc(x + cw * 0.78, y + ch * 0.7, 3.5, 0, Math.PI * 2);
            ctx.fill();

            // Chloroplasts
            ctx.fillStyle = '#16a34a';
            for (let k = 0; k < 5; k++) {
              ctx.beginPath();
              ctx.arc(x + 14 + k * 10, y + 14 + (k % 2) * 14, 3.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      } else if (currentSpecimen === 'animal') {
        // Human Cheek Squamous Epithelial Cells
        ctx.fillStyle = '#3b0764';
        ctx.fillRect(0, 0, w, h);

        const cells = [
          { x: w * 0.48, y: h * 0.5, r: 65 },
          { x: w * 0.18, y: h * 0.25, r: 42 },
          { x: w * 0.82, y: h * 0.75, r: 45 }
        ];

        cells.forEach(c => {
          ctx.fillStyle = 'rgba(244, 114, 182, 0.35)';
          ctx.strokeStyle = '#f472b6';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(c.x, c.y, c.r, c.r * 0.88, Math.PI / 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Prominent Central Nucleus
          ctx.fillStyle = '#818cf8';
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.r * 0.32, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#312e81';
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.r * 0.12, 0, Math.PI * 2);
          ctx.fill();

          // Centrosome
          ctx.fillStyle = '#facc15';
          ctx.fillRect(c.x + c.r * 0.35, c.y - c.r * 0.35, 6, 3);
          ctx.fillRect(c.x + c.r * 0.35 + 1.5, c.y - c.r * 0.35 - 2, 3, 6);
        });
      } else {
        // Stomata with Bean-shaped Guard Cells
        ctx.fillStyle = '#042f2e';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2, cy = h / 2;
        // Epidermal boundary
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, w - 40, h - 40);

        // Left Guard Cell
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(cx - 24, cy, 26, 60, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#86efac';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Right Guard Cell
        ctx.beginPath();
        ctx.ellipse(cx + 24, cy, 26, 60, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Stomatal Aperture Pore
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 10, 36, 0, 0, Math.PI * 2);
        ctx.fill();

        // Guard cell chloroplasts
        ctx.fillStyle = '#4ade80';
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.arc(cx - 26, cy + i * 16, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + 26, cy + i * 16, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    focusKnob.oninput = (e) => {
      focusVal = parseInt(e.target.value);
      drawCellEyepiece();
      if (Math.abs(focusVal - 50) <= 8) {
        playClink();
        setObservation('Specimen in sharp focus! Click on any organelle inside the eyepiece.', 'सूक्ष्मदर्शक यन्त्र स्पष्ट फोकस भयो!');
      }
    };

    // Specimen Pills Handler
    document.querySelectorAll('.spec-pill').forEach(pill => {
      pill.onclick = () => {
        document.querySelectorAll('.spec-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentSpecimen = pill.dataset.spec;
        playClink();
        drawCellEyepiece();
        if (currentSpecimen === 'plant') {
          calloutTitle.textContent = 'Plant Cell (Onion Peel) / वनस्पति कोष';
          calloutDesc.textContent = 'Rigid cellulose cell wall, large central vacuole, peripheral nucleus, chloroplasts.';
          speakText('Onion plant cell selected. Observe thick cell wall and central vacuole.', 'प्याजको वनस्पति कोष छनोट गरियो।');
        } else if (currentSpecimen === 'animal') {
          calloutTitle.textContent = 'Animal Cell (Cheek Epithelium) / जनावर कोष';
          calloutDesc.textContent = 'Flexible cell membrane, central prominent nucleus, centrosome, dense cytoplasm.';
          speakText('Human cheek animal cell selected. Observe prominent central nucleus.', 'मानव गालाको जनावर कोष छनोट गरियो।');
        } else {
          calloutTitle.textContent = 'Leaf Stomata (Guard Cells) / स्टोमाटा';
          calloutDesc.textContent = 'Pair of bean-shaped guard cells controlling transpiration pore opening and closing.';
          speakText('Leaf stomata selected. Observe kidney shaped guard cells.', 'पातको स्टोमाटा छनोट गरियो।');
        }
      };
    });

    // Clicking inside eyepiece inspects organelles
    cellCanvas.onclick = (e) => {
      const rect = cellCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      playTone(800, 'triangle', 0.1, 0.2);

      if (currentSpecimen === 'plant') {
        calloutTitle.textContent = 'Plant Organelle: Cellulose Wall & Vacuole';
        calloutDesc.textContent = 'Cell Wall provides turgidity & protection. Central vacuole maintains hydrostatic pressure.';
      } else if (currentSpecimen === 'animal') {
        calloutTitle.textContent = 'Animal Organelle: Nucleus & Centrosome';
        calloutDesc.textContent = 'Nucleus carries genetic DNA chromosomes. Centrosome aids cell division.';
      } else {
        calloutTitle.textContent = 'Stomata: Guard Cell & Stomatal Pore';
        calloutDesc.textContent = 'Turgid guard cells open pore for gas exchange (CO₂ intake, O₂ release, transpiration).';
      }
    };

    drawCellEyepiece();

    slidersWrap.innerHTML = `
      <div class="calc-slider-group">
        <div class="slider-label-row">
          <span>Objective Magnification:</span>
          <span class="val">40x (Total 400x)</span>
        </div>
        <div style="display:flex;gap:0.3rem;margin-top:0.3rem;">
          <button class="hud-btn" id="btn-mag-10">10x (100x)</button>
          <button class="hud-btn active" id="btn-mag-40">40x (400x)</button>
          <button class="hud-btn" id="btn-mag-100">100x (1000x)</button>
        </div>
      </div>
    `;

    document.getElementById('btn-mag-10').onclick = () => { playClink(); setObservation('10x Low Power Objective selected.', '१०x पावर लेन्स'); };
    document.getElementById('btn-mag-40').onclick = () => { playClink(); setObservation('40x High Power Objective selected.', '४०x पावर लेन्स'); };
    document.getElementById('btn-mag-100').onclick = () => { playClink(); setObservation('100x Oil Immersion Objective selected.', '१००x तेल लेन्स'); };

    formulaBox.innerHTML = `
      <div class="formula-title">Microscope Optics · सूक्ष्मदर्शक क्षमता</div>
      <div class="formula-math">Total Magnification = Eyepiece (10x) × Objective (40x) = 400x</div>
      <div class="formula-result">
        <span>Field of View:</span>
        <span>450 µm (Microns)</span>
      </div>
    `;

    const eqItems = [
      { stage: 0, id: 'base', icon: '🔬', en: 'Compound Microscope', ne: 'संयुक्त सूक्ष्मदर्शक', descNe: 'स्टेज र लेन्स मिलाउनुहोस्' },
      { stage: 1, id: 'slide', icon: '🪟', en: 'Prepared Glass Slide', ne: 'काँचको स्लाइड', descNe: 'नमूना स्लाइड राख्नुहोस्' },
      { stage: 2, id: 'focus', icon: '🎛️', en: 'Coarse & Fine Focus Knob', ne: 'फोकस घुमाउने नब', descNe: 'स्पष्ट नभएसम्म घुमाउनुहोस्' }
    ];

    renderRack(eqItems, 2, (item) => {
      playClink();
      setObservation(`${item.en} on workbench.`, `${item.ne} तयार।`);
    });

    setStep('1', 'Turn the Focus Knob slider in the eyepiece overlay to achieve crisp focus (50) and tap organelles!', 'आइपिस विन्डोमा फोकस नब ५० मा सारेर स्पष्ट चित्र हेर्नुहोस् र अंगहरू छुनुहोस्!');
    setObservation('Turn focus slider until blurry image becomes crisp.', 'फोकस मिलाउनुहोस्।');

    actionsGrid.innerHTML = `
      <button class="lab-action-btn" id="btn-auto-focus">
        <span>🎯 Auto-Focus Specimen (Sharp 50)</span>
        <span class="sub">आफै स्पष्ट फोकस मिलाउनुहोस्</span>
      </button>
      <button class="lab-action-btn btn-reset" id="btn-micro-reset">
        <span>🔄 Next Specimen</span>
        <span class="sub">अर्को कोष हेर्नुहोस्</span>
      </button>
    `;

    document.getElementById('btn-auto-focus').onclick = () => {
      focusKnob.value = 50;
      focusVal = 50;
      playClink();
      playSuccess();
      drawCellEyepiece();
      setStep('Focused!', 'Specimen is 100% sharply focused! Tap any organelle inside the eyepiece to inspect its function.', 'कोष १००% स्पष्ट भयो! आइपिसभित्र छोएर विस्तृत जानकारी पढ्नुहोस्।');
    };
    document.getElementById('btn-micro-reset').onclick = () => {
      const nextSpec = currentSpecimen === 'plant' ? 'animal' : currentSpecimen === 'animal' ? 'stomata' : 'plant';
      const btn = document.querySelector(`.spec-pill[data-spec="${nextSpec}"]`);
      if (btn) btn.click();
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── EXPERIMENT 8: 3D Beating Human Heart & Circulation ────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  function setupHeartExperiment() {
    labGroup.clear();
    const g = new THREE.Group();
    g.position.set(0, 0.4, 0);

    // Heart Muscle Body
    const heartGroup = new THREE.Group();
    const vent = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.6, 24), new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 }));
    vent.rotation.x = Math.PI;
    vent.position.y = 0.8;
    heartGroup.add(vent);

    const leftAtrium = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 }));
    leftAtrium.position.set(0.45, 1.7, 0);
    heartGroup.add(leftAtrium);

    const rightAtrium = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5 }));
    rightAtrium.position.set(-0.45, 1.7, 0);
    heartGroup.add(rightAtrium);

    // Major Blood Vessels
    // Aorta (Red)
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.2, 1.8, 0),
      new THREE.Vector3(0.2, 2.4, 0),
      new THREE.Vector3(-0.3, 2.6, 0),
      new THREE.Vector3(-0.6, 2.2, 0)
    ]);
    const aorta = new THREE.Mesh(new THREE.TubeGeometry(aortaCurve, 20, 0.16, 12, false), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
    heartGroup.add(aorta);

    // Vena Cava (Blue)
    const venaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.55, 2.4, 0),
      new THREE.Vector3(-0.55, 1.6, 0),
      new THREE.Vector3(-0.55, 0.8, 0)
    ]);
    const venaCava = new THREE.Mesh(new THREE.TubeGeometry(venaCurve, 16, 0.14, 12, false), new THREE.MeshStandardMaterial({ color: 0x2563eb }));
    heartGroup.add(venaCava);

    g.add(heartGroup);
    labGroup.add(g);

    let bpm = 72;
    let strokeVol = 70; // mL
    let heartInterval = null;

    function beat() {
      playHeartbeatSound();
      // Systole contraction & Diastole expansion
      heartGroup.scale.set(1.12, 1.12, 1.12);
      setTimeout(() => {
        heartGroup.scale.set(0.96, 0.96, 0.96);
        setTimeout(() => heartGroup.scale.set(1.0, 1.0, 1.0), 120);
      }, 140);
    }

    function startHeartbeatLoop() {
      if (heartInterval) clearInterval(heartInterval);
      const ms = (60 / bpm) * 1000;
      heartInterval = setInterval(beat, ms);
    }
    startHeartbeatLoop();

    function updateHeartCalc() {
      const cardiacOutput = ((bpm * strokeVol) / 1000).toFixed(2);

      slidersWrap.innerHTML = `
        <div class="calc-slider-group">
          <div class="slider-label-row">
            <span>Heart Rate (BPM):</span>
            <span class="val">${bpm} Beats/min</span>
          </div>
          <input type="range" class="custom-range" id="bpm-range" min="45" max="150" value="${bpm}" />
        </div>
        <div class="calc-slider-group">
          <div class="slider-label-row">
            <span>Stroke Volume (SV):</span>
            <span class="val">${strokeVol} mL/beat</span>
          </div>
          <input type="range" class="custom-range" id="sv-range" min="40" max="100" value="${strokeVol}" />
        </div>
      `;

      formulaBox.innerHTML = `
        <div class="formula-title">Cardiac Physiology · मुटुको कार्य</div>
        <div class="formula-math">Cardiac Output (CO) = Heart Rate (HR) × Stroke Volume (SV)</div>
        <div class="formula-result">
          <span>Total Cardiac Output:</span>
          <span>${cardiacOutput} Liters / minute</span>
        </div>
      `;

      document.getElementById('bpm-range').oninput = (e) => {
        bpm = parseInt(e.target.value);
        startHeartbeatLoop();
        updateHeartCalc();
      };
      document.getElementById('sv-range').oninput = (e) => {
        strokeVol = parseInt(e.target.value);
        updateHeartCalc();
      };
    }
    updateHeartCalc();

    const eqItems = [
      { stage: 0, id: 'heart', icon: '❤️', en: '4-Chambered Human Heart', ne: '४ कोठे मानव मुटु', descNe: 'मुटुको संरचना' },
      { stage: 1, id: 'aorta', icon: '🔴', en: 'Systemic Aorta (Oxygenated)', ne: 'महाधमनी (अक्सिजनयुक्त)', descNe: 'शरीरभरि रगत पठाउने' },
      { stage: 2, id: 'vena', icon: '🔵', en: 'Vena Cava (Deoxygenated)', ne: 'महाशिरा (अक्सिजनविहीन)', descNe: 'रगत मुटुमा ल्याउने' }
    ];

    renderRack(eqItems, 2, (item) => {
      playClink();
      setObservation(`Anatomy: ${item.en}`, `${item.ne} मुटुको भाग।`);
    });

    setStep('1', 'Observe authentic lub-dub heartbeat sound and adjust Heart Rate BPM slider to see live cardiac output!', 'मुटुको धड्कन सुन्नुहोस् र मुटुको दर (BPM) सारेर रक्तसञ्चार हेर्नुहोस्!');
    setObservation('Normal Resting Heart Rate: 72 BPM | Cardiac Output: ~5.04 L/min.', 'सामान्य अवस्थामा मुटु प्रतिमिनेट ७२ पटक धड्किन्छ।');

    actionsGrid.innerHTML = `
      <button class="lab-action-btn" id="btn-exercise-pulse">
        <span>🏃 Simulate Physical Exercise (120 BPM)</span>
        <span class="sub">व्यायाम गर्दाको मुटुको गति</span>
      </button>
      <button class="lab-action-btn btn-reset" id="btn-heart-reset">
        <span>🧘 Resting State (72 BPM)</span>
        <span class="sub">आरामको अवस्था</span>
      </button>
    `;

    document.getElementById('btn-exercise-pulse').onclick = () => {
      bpm = 120;
      strokeVol = 85;
      startHeartbeatLoop();
      updateHeartCalc();
      setStep('High Cardiac Output!', 'During exercise, heart pumps up to 10.2 Liters/min to supply oxygen to skeletal muscles!', 'व्यायाम गर्दा मुटुले १० लिटरभन्दा बढी रगत पम्प गर्छ!');
    };
    document.getElementById('btn-heart-reset').onclick = () => {
      bpm = 72;
      strokeVol = 70;
      startHeartbeatLoop();
      updateHeartCalc();
      setStep('Resting State', 'Resting cardiac output normal (~5.0 L/min).', 'सामान्य विश्राम अवस्था।');
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── EXPERIMENT 9: 3D Human Digestive System & Food Bolus Journey ──────────
  // ════════════════════════════════════════════════════════════════════════════
  function setupDigestiveExperiment() {
    labGroup.clear();
    const g = new THREE.Group();
    g.position.set(0, 0.2, 0);

    // Mouth
    const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), new THREE.MeshStandardMaterial({ color: 0xfbbf24 }));
    mouth.position.set(0, 2.6, 0);
    g.add(mouth);

    // Esophagus
    const eso = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1), new THREE.MeshStandardMaterial({ color: 0xf472b6 }));
    eso.position.set(0, 1.9, 0);
    g.add(eso);

    // Stomach (J-shaped)
    const stomach = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.18, 12, 24, Math.PI), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    stomach.rotation.z = -Math.PI / 3;
    stomach.position.set(-0.25, 1.2, 0);
    g.add(stomach);

    // Liver & Gallbladder
    const liver = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.7, 16), new THREE.MeshStandardMaterial({ color: 0x7f1d1d }));
    liver.rotation.z = Math.PI / 4;
    liver.position.set(0.5, 1.3, 0);
    g.add(liver);

    // Small Intestine (Coiled)
    const si = new THREE.Mesh(new THREE.TorusKnotGeometry(0.42, 0.1, 48, 8), new THREE.MeshStandardMaterial({ color: 0xfb923c }));
    si.position.set(0, 0.55, 0);
    g.add(si);

    // Food Bolus Particle
    const bolus = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x15803d }));
    bolus.position.set(0, 2.6, 0);
    g.add(bolus);

    labGroup.add(g);

    let bolusStage = 0; // 0=Mouth, 1=Esophagus, 2=Stomach, 3=Small Intestine
    const bolusCoords = [
      { y: 2.6, en: 'Mouth: Salivary Amylase digests starch into maltose.', ne: 'मुख: र्‍यालको एमाइलेजले स्टार्च पचाउँछ।' },
      { y: 1.9, en: 'Esophagus: Peristaltic wave contractions push food down.', ne: 'ग्रसनली: पेरिस्टाल्सिस चालले खाना तल धकेल्छ।' },
      { y: 1.2, en: 'Stomach: Gastric juice (HCl + Pepsin) digests proteins into peptones.', ne: 'आमाशय: हाइड्रोक्लोरिक अम्ल र पेप्सिनले प्रोटिन पचाउँछ।' },
      { y: 0.55, en: 'Small Intestine: Bile emulsifies fats; villi absorb nutrients into blood.', ne: 'सानो आन्द्रा: पित्तले चिल्लो पदार्थ पचाउँछ र भिल्लाईले सोस्छ।' }
    ];

    slidersWrap.innerHTML = `
      <div class="calc-slider-group">
        <div class="slider-label-row">
          <span>Digestive Journey Tracker:</span>
          <span class="val" id="bolus-pos-tag">Mouth Cavity</span>
        </div>
      </div>
    `;

    formulaBox.innerHTML = `
      <div class="formula-title">Human Digestive Physiology · पाचन प्रणाली</div>
      <div class="formula-math">Starch ──(Amylase)──➔ Maltose</div>
      <div class="formula-math">Protein ──(Pepsin/HCl)──➔ Peptones ──(Trypsin)──➔ Amino Acids</div>
      <div class="formula-math">Fats ──(Bile/Lipase)──➔ Fatty Acids + Glycerol</div>
    `;

    const eqItems = [
      { stage: 0, id: 'mouth', icon: '👄', en: 'Mouth & Salivary Glands', ne: 'मुख र र्‍याल ग्रन्थी', descNe: 'एमाइलेज इन्जाइम' },
      { stage: 1, id: 'eso', icon: '〰️', en: 'Esophagus (Peristalsis)', ne: 'ग्रसनली', descNe: 'खाना नली' },
      { stage: 2, id: 'stomach', icon: '🫄', en: 'Stomach (HCl & Pepsin)', ne: 'आमाशय (पेट)', descNe: 'प्रोटिन पाचन' },
      { stage: 3, id: 'intestine', icon: '➰', en: 'Small Intestine & Villi', ne: 'सानो आन्द्रा', descNe: 'पोषकतत्व शोषण' }
    ];

    renderRack(eqItems, 3, (item) => {
      playClink();
      setObservation(`Organ: ${item.en}`, `${item.ne}`);
    });

    setStep('1', 'Click "Advance Food Bolus" to trace food journey and chemical enzyme digestion from mouth to intestines!', 'खानाको डल्लो अगाडि बढाएर मुखदेखि आन्द्रासम्मको पाचन प्रक्रिया हेर्नुहोस्!');
    setObservation('Digestive System initialized. Ready to swallow bolus.', 'पाचन प्रणाली तयार।');

    actionsGrid.innerHTML = `
      <button class="lab-action-btn" id="btn-bolus-step">
        <span>🍔 Swallow & Advance Food Bolus</span>
        <span class="sub">खानालाई अगाडि पठाउनुहोस्</span>
      </button>
      <button class="lab-action-btn btn-reset" id="btn-bolus-reset">
        <span>🔄 Restart Journey</span>
        <span class="sub">सुरुबाट</span>
      </button>
    `;

    document.getElementById('btn-bolus-step').onclick = () => {
      bolusStage = (bolusStage + 1) % bolusCoords.length;
      const target = bolusCoords[bolusStage];
      bolus.position.y = target.y;
      playPourSound();
      playSuccess();
      setStep(`Stage ${bolusStage + 1}`, target.en, target.ne);
      setObservation(target.en, target.ne);
      document.getElementById('bolus-pos-tag').textContent = ['Mouth', 'Esophagus', 'Stomach', 'Small Intestine'][bolusStage];
    };
    document.getElementById('btn-bolus-reset').onclick = () => setupDigestiveExperiment();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── EXPERIMENT 10: ABO & Rh Blood Group Testing Lab ───────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  function setupBloodTestExperiment() {
    labGroup.clear();
    const g = new THREE.Group();

    // White Porcelain 3-Well Cavity Plate
    const plate = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.16, 1.5), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15, metalness: 0.1 }));
    plate.position.set(0, 0.08, 0);
    g.add(plate);

    // 3 Cavity Wells: Well A, Well B, Well Rh
    const wellMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
    const wellPositions = [-1.0, 0, 1.0];

    const wellMeshes = wellPositions.map((x) => {
      const well = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 24), wellMat);
      well.position.set(x, 0.15, 0);
      g.add(well);
      return well;
    });

    // 3 Liquid Mixtures in the wells (Red blood + Antiserum)
    const liquidMatA = new THREE.MeshStandardMaterial({ color: 0x991b1b, transparent: true, opacity: 0 });
    const liquidA = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.06, 20), liquidMatA);
    liquidA.position.set(-1.0, 0.18, 0);
    g.add(liquidA);

    const liquidMatB = new THREE.MeshStandardMaterial({ color: 0x991b1b, transparent: true, opacity: 0 });
    const liquidB = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.06, 20), liquidMatB);
    liquidB.position.set(0, 0.18, 0);
    g.add(liquidB);

    const liquidMatRh = new THREE.MeshStandardMaterial({ color: 0x991b1b, transparent: true, opacity: 0 });
    const liquidRh = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.06, 20), liquidMatRh);
    liquidRh.position.set(1.0, 0.18, 0);
    g.add(liquidRh);

    // Agglutination Clumping Particle Groups
    function createClumpGroup(x) {
      const grp = new THREE.Group();
      grp.position.set(x, 0.22, 0);
      grp.visible = false;
      for (let i = 0; i < 28; i++) {
        const p = new THREE.Mesh(new THREE.DodecahedronGeometry(0.045), new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.9 }));
        p.position.set((Math.random() - 0.5) * 0.6, 0, (Math.random() - 0.5) * 0.6);
        grp.add(p);
      }
      g.add(grp);
      return grp;
    }

    const clumpsA = createClumpGroup(-1.0);
    const clumpsB = createClumpGroup(0);
    const clumpsRh = createClumpGroup(1.0);

    // 3 Antiserum Dropper Bottles behind plate
    // Anti-A (Blue)
    const botA = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.5), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
    botA.position.set(-1.0, 0.35, -1.0);
    g.add(botA);

    // Anti-B (Yellow)
    const botB = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.5), new THREE.MeshStandardMaterial({ color: 0xeab308 }));
    botB.position.set(0, 0.35, -1.0);
    g.add(botB);

    // Anti-D/Rh (Clear/White)
    const botRh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.5), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
    botRh.position.set(1.0, 0.35, -1.0);
    g.add(botRh);

    labGroup.add(g);

    // Patient blood profile state
    let patientBlood = 'B+'; // Options: A+, A-, B+, B-, AB+, AB-, O+, O-

    function updateBloodCalc() {
      const hasAntigenA = patientBlood.includes('A');
      const hasAntigenB = patientBlood.includes('B');
      const hasRh = patientBlood.includes('+');

      slidersWrap.innerHTML = `
        <div class="calc-slider-group">
          <div class="slider-label-row">
            <span>Select Patient Blood Type:</span>
            <span class="val">${patientBlood}</span>
          </div>
          <select class="exp-dropdown" id="patient-blood-select" style="width:100%;margin-top:4px;">
            <option value="A+" ${patientBlood === 'A+' ? 'selected' : ''}>Blood Group A+ (Positive)</option>
            <option value="A-" ${patientBlood === 'A-' ? 'selected' : ''}>Blood Group A- (Negative)</option>
            <option value="B+" ${patientBlood === 'B+' ? 'selected' : ''}>Blood Group B+ (Positive)</option>
            <option value="B-" ${patientBlood === 'B-' ? 'selected' : ''}>Blood Group B- (Negative)</option>
            <option value="AB+" ${patientBlood === 'AB+' ? 'selected' : ''}>Blood Group AB+ (Universal Recipient)</option>
            <option value="AB-" ${patientBlood === 'AB-' ? 'selected' : ''}>Blood Group AB- (Negative)</option>
            <option value="O+" ${patientBlood === 'O+' ? 'selected' : ''}>Blood Group O+ (Positive)</option>
            <option value="O-" ${patientBlood === 'O-' ? 'selected' : ''}>Blood Group O- (Universal Donor)</option>
          </select>
        </div>
      `;

      formulaBox.innerHTML = `
        <div class="formula-title">Agglutination Matrix · रगत समूह पहिचान</div>
        <div class="formula-math">Well A (Anti-A): ${hasAntigenA ? 'CLUMPING (Agglutination) 🔴' : 'Smooth (No Clumping) ⚪'}</div>
        <div class="formula-math">Well B (Anti-B): ${hasAntigenB ? 'CLUMPING (Agglutination) 🔴' : 'Smooth (No Clumping) ⚪'}</div>
        <div class="formula-math">Well Rh (Anti-D): ${hasRh ? 'CLUMPING (Rh Positive) 🔴' : 'Smooth (Rh Negative) ⚪'}</div>
        <div class="formula-result">
          <span>Diagnosis:</span>
          <span>Blood Group ${patientBlood}</span>
        </div>
      `;

      document.getElementById('patient-blood-select').onchange = (e) => {
        patientBlood = e.target.value;
        playClink();
        updateBloodCalc();
        setupBloodTestExperiment();
      };
    }
    updateBloodCalc();

    const eqItems = [
      { stage: 0, id: 'plate', icon: '🧫', en: '3-Well Porcelain Cavity Plate', ne: '३ खाल्टे सेतो प्लेट', descNe: 'Well A, B, Rh भएको प्लेट' },
      { stage: 1, id: 'blood', icon: '🩸', en: 'Dispense Patient Blood Drops', ne: 'रगतका ३ थोपा खन्याउनुहोस्', descNe: 'प्रत्येक खाल्टोमा १-१ थोपा' },
      { stage: 2, id: 'antiA', icon: '🔵', en: 'Add Anti-A Antiserum (Blue)', ne: 'एन्टी-ए (नीलो) हाल्नुहोस्', descNe: 'Well A मा १ थोपा' },
      { stage: 3, id: 'antiB', icon: '🟡', en: 'Add Anti-B Antiserum (Yellow)', ne: 'एन्टी-बी (पहेंलो) हाल्नुहोस्', descNe: 'Well B मा १ थोपा' },
      { stage: 4, id: 'antiD', icon: '⚪', en: 'Add Anti-D Antiserum (Clear)', ne: 'एन्टी-डी (सेतो) हाल्नुहोस्', descNe: 'Well Rh मा १ थोपा' },
      { stage: 5, id: 'mix', icon: '🥢', en: 'Mix with 3 Separate Toothpicks', ne: '३ फरक सिन्काले घोल्नुहोस्', descNe: '३० सेकेन्डसम्म घोल्ने' },
      { stage: 6, id: 'read', icon: '🔬', en: 'Observe Agglutination Clumping', ne: 'रक्त कण जमेको हेर्नुहोस्', descNe: 'रगत समूह निदान' }
    ];

    let currentStage = 0;
    let updateRackFn = null;

    function executeStage(stg) {
      if (stg === 0) {
        playClink();
        currentStage = 1;
        setStep('2', 'Plate ready! Pick "Dispense Patient Blood Drops" to place 1 drop of blood in Well A, B, and Rh.', '३ खाल्टे प्लेट तयार भयो! अब प्रत्येक खाल्टोमा १-१ थोपा रगत हाल्नुहोस्।');
        setObservation('Well A, Well B, and Well Rh cavities ready.', 'रगत हाल्न खाल्डो तयार।');
      } else if (stg === 1) {
        liquidMatA.opacity = 0.85;
        liquidMatB.opacity = 0.85;
        liquidMatRh.opacity = 0.85;
        playPourSound();
        currentStage = 2;
        setStep('3', 'Blood dispensed! Pick "Add Anti-A Antiserum (Blue)" to drop into Well A.', 'रगत हालियो! अब पहिलो खाल्टो (Well A) मा १ थोपा नीलो एन्टी-ए हाल्नुहोस्।');
        setObservation('Blood sample added to all 3 cavities.', 'तीनै खाल्टोमा रगत तयार।');
      } else if (stg === 2) {
        liquidMatA.color.setHex(0x7f1d1d);
        playPourSound();
        currentStage = 3;
        setStep('4', 'Anti-A added! Pick "Add Anti-B Antiserum (Yellow)" to drop into Well B.', 'एन्टी-ए हालियो! अब दोस्रो खाल्टो (Well B) मा १ थोपा पहेंलो एन्टी-बी हाल्नुहोस्।');
        setObservation('Well A: Blood + Anti-A antibodies.', 'Well A मा एन्टी-ए मिसाइयो।');
      } else if (stg === 3) {
        liquidMatB.color.setHex(0x7f1d1d);
        playPourSound();
        currentStage = 4;
        setStep('5', 'Anti-B added! Pick "Add Anti-D Antiserum (Clear)" to drop into Well Rh.', 'एन्टी-बी हालियो! अब तेस्रो खाल्टो (Well Rh) मा १ थोपा एन्टी-डी हाल्नुहोस्।');
        setObservation('Well B: Blood + Anti-B antibodies.', 'Well B मा एन्टी-बी मिसाइयो।');
      } else if (stg === 4) {
        liquidMatRh.color.setHex(0x7f1d1d);
        playPourSound();
        currentStage = 5;
        setStep('6', 'All antisera added! Pick "Mix with 3 Separate Toothpicks" to mix each well without cross-contamination.', 'तीनै सिरम हालियो! अब ३ छुट्टाछुट्टै सिन्का प्रयोग गरेर घोल्नुहोस्।');
        setObservation('Never cross-contaminate toothpicks between wells!', 'एउटा खाल्टोको सिन्का अर्कोमा मिसाउनुहुँदैन।');
      } else if (stg === 5) {
        playTone(600, 'triangle', 0.15, 0.2);
        currentStage = 6;
        setStep('7', 'Wells mixed! Pick "Observe Agglutination Clumping" to diagnose patient blood group.', 'राम्रोसँग घोलियो! अब रक्तकण जमेको (Agglutination) हेरेर समूह पत्ता लगाउनुहोस्।');
        setObservation('Agitation complete. Observing antigen-antibody reaction.', 'प्रतिक्रिया हेर्न तयार।');
      } else if (stg === 6) {
        const hasA = patientBlood.includes('A');
        const hasB = patientBlood.includes('B');
        const hasRh = patientBlood.includes('+');

        if (hasA) clumpsA.visible = true;
        if (hasB) clumpsB.visible = true;
        if (hasRh) clumpsRh.visible = true;

        playSuccess();
        currentStage = 7;
        setStep('Diagnosis Complete!', `Patient Blood Group is: ${patientBlood}! Reaction: ${hasA?'A Clumped, ':''}${hasB?'B Clumped, ':''}${hasRh?'Rh Positive Clumped':''}. Practical 100% complete!`, `बिरामीको रगत समूह ${patientBlood} हो! परीक्षण १००% सफल भयो!`);
        setObservation(`Confirmed Group: ${patientBlood}. Ready for donor compatibility review.`, `रगत समूह ${patientBlood} प्रमाणित भयो।`);
        updateActionButtons();
        if (updateRackFn) updateRackFn();
      }

      updateActionButtons();
      if (updateRackFn) updateRackFn();
    }

    function updateActionButtons() {
      const cur = eqItems[currentStage] || { en: 'Diagnosis Complete!', ne: 'परीक्षण सम्पन्न भयो!' };
      actionsGrid.innerHTML = `
        <button class="lab-action-btn" id="btn-blood-next" ${currentStage >= 7 ? 'disabled' : ''}>
          <span>👉 Step ${currentStage + 1}: ${cur.en}</span>
          <span class="sub">${cur.ne}</span>
        </button>
        <button class="lab-action-btn btn-reset" id="btn-blood-reset">
          <span>🔄 New Patient Sample</span>
          <span class="sub">नयाँ बिरामीको नमुना</span>
        </button>
      `;

      const bNext = document.getElementById('btn-blood-next');
      if (bNext && currentStage < 7) {
        bNext.onclick = () => executeStage(currentStage);
      }
      document.getElementById('btn-blood-reset').onclick = () => setupBloodTestExperiment();
    }

    updateRackFn = renderRack(eqItems, currentStage, (item, stg) => {
      if (stg === currentStage) executeStage(stg);
      else if (stg < currentStage) setObservation(`${item.en} is already completed.`, `${item.ne} पहिले नै सम्पन्न भयो।`);
    });

    setStep('1', 'Pick "3-Well Porcelain Cavity Plate" from the rack to place on your workbench.', 'उपकरण र्याकबाट ३ खाल्टे प्लेट छनोट गरी बेन्चमा राख्नुहोस्।');
    setObservation('Clean workbench ready for ABO & Rh Blood Grouping.', 'रगत समूह परीक्षण बेन्च तयार।');
    updateActionButtons();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── 5. Experiment Loader & Filter Controller ──────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  function loadExperiment(id) {
    // Eyepiece overlay visible ONLY for microscope
    const eyepiece = document.getElementById('microscope-eyepiece-overlay');
    if (eyepiece) eyepiece.style.display = (id === 'microscope') ? 'flex' : 'none';

    updateTheoryDrawer(id);

    if (id === 'co2_prep') setupCO2Experiment();
    else if (id === 'nh3_prep') setupNH3Experiment();
    else if (id === 'titration') setupTitrationExperiment();
    else if (id === 'ohms_law') setupOhmsExperiment();
    else if (id === 'archimedes') setupArchimedesExperiment();
    else if (id === 'prism') setupPrismExperiment();
    else if (id === 'microscope') setupMicroscopeExperiment();
    else if (id === 'human_heart') setupHeartExperiment();
    else if (id === 'digestive_system') setupDigestiveExperiment();
    else if (id === 'blood_testing') setupBloodTestExperiment();
  }

  expSelect.addEventListener('change', (e) => {
    loadExperiment(e.target.value);
  });

  // Category Filter Pills
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const f = pill.dataset.filter;
      if (f === 'chem') expSelect.value = 'co2_prep';
      else if (f === 'phys') expSelect.value = 'ohms_law';
      else if (f === 'bio') expSelect.value = 'microscope';
      else if (f === 'class10') expSelect.value = 'co2_prep';
      else if (f === 'class9') expSelect.value = 'archimedes';
      else if (f === 'class8') expSelect.value = 'titration';
      loadExperiment(expSelect.value);
    });
  });

  // ── 6. Fullscreen & Theory Drawer ─────────────────────────────────────────
  const smartboardBtn = document.getElementById('smartboard-btn');
  smartboardBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      smartboardBtn.textContent = '⛶ Exit Fullscreen';
    } else {
      document.exitFullscreen().catch(() => {});
      smartboardBtn.textContent = '⛶ Fullscreen';
    }
  });

  const theoryDrawer = document.getElementById('theory-drawer');
  document.getElementById('open-theory-btn').addEventListener('click', () => {
    theoryDrawer.classList.add('open');
  });
  document.getElementById('drawer-close-btn').addEventListener('click', () => {
    theoryDrawer.classList.remove('open');
  });

  function updateTheoryDrawer(expId) {
    const titleEl = document.getElementById('drawer-exp-title');
    const contentEl = document.getElementById('drawer-content');

    const theories = {
      co2_prep: {
        title: 'Carbon Dioxide Gas (CO₂) · कार्बन डाइअक्साइड',
        html: `
          <div class="viva-qna">
            <strong>Principle / सिद्धान्त:</strong>
            <p>CaCO₃ + 2HCl ➔ CaCl₂ + H₂O + CO₂↑</p>
          </div>
          <div class="viva-qna">
            <strong>Q1. Why is CO₂ collected by upward displacement of air?</strong>
            <p>CO₂ has a vapor density of 22, making it 1.5 times heavier than air (air V.D. ≈ 14.4). Hence it settles down, displacing air upwards.</p>
          </div>
          <div class="viva-qna">
            <strong>Q2. Why does lime water turn milky?</strong>
            <p>Formation of insoluble Calcium Carbonate precipitate: Ca(OH)₂ + CO₂ ➔ CaCO₃↓ + H₂O.</p>
          </div>
        `
      },
      nh3_prep: {
        title: 'Ammonia Gas (NH₃) · एमोनिया ग्यास',
        html: `
          <div class="viva-qna">
            <strong>Principle / सिद्धान्त:</strong>
            <p>2NH₄Cl + Ca(OH)₂ ─(Heat)─➔ CaCl₂ + 2H₂O + 2NH₃↑</p>
          </div>
          <div class="viva-qna">
            <strong>Q1. Why is the hard glass tube slanted downwards?</strong>
            <p>During the reaction, water vapor condenses near the mouth. If slanted upwards, condensed water droplets would flow back onto the red-hot glass, causing it to crack.</p>
          </div>
          <div class="viva-qna">
            <strong>Q2. How is Ammonia tested with HCl?</strong>
            <p>A glass rod dipped in concentrated HCl produces dense white fumes of Ammonium Chloride: NH₃ + HCl ➔ NH₄Cl↑.</p>
          </div>
        `
      },
      microscope: {
        title: 'Compound Microscope & Cell Biology · कोष जीवविज्ञान',
        html: `
          <div class="viva-qna">
            <strong>Magnification Formula:</strong>
            <p>Total Magnification = Ocular Lens Power (10x) × Objective Lens Power (10x / 40x / 100x).</p>
          </div>
          <div class="viva-qna">
            <strong>Plant Cell vs Animal Cell Differences:</strong>
            <p>• Plant Cell: Rigid cellulose cell wall, large central vacuole, chloroplasts.<br/>• Animal Cell: Flexible plasma membrane, small temporary vacuoles, prominent centrosome.</p>
          </div>
        `
      },
      blood_testing: {
        title: 'ABO & Rh Blood Group Testing · रगत समूह पहिचान',
        html: `
          <div class="viva-qna">
            <strong>Agglutination Principle:</strong>
            <p>When RBC surface antigens meet their corresponding antibody (Antigen A + Anti-A, or Antigen B + Anti-B), clumping (agglutination) occurs.</p>
          </div>
          <div class="viva-qna">
            <strong>Universal Donor & Recipient:</strong>
            <p>• O- is Universal Donor (no A, B, or Rh antigens on RBC).<br/>• AB+ is Universal Recipient (no plasma antibodies against A, B, or Rh).</p>
          </div>
        `
      }
    };

    const currentTheory = theories[expId] || theories['co2_prep'];
    titleEl.textContent = currentTheory.title;
    contentEl.innerHTML = currentTheory.html;
  }

  // ── 7. Initial Boot ───────────────────────────────────────────────────────
  loadExperiment('co2_prep');

})();
