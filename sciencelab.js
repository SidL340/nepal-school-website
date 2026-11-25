(() => {
  'use strict';

  // ── 1. Audio Synthesis & Bilingual Speech Narration Engine ────────────────
  let voiceLang = 'ne'; // PRIMARY: Nepali voice narration // 'en', 'ne', or 'off'
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

  // ── Realistic Human Character Voice Engine (Dr. Vigyan) ───────────────────
  let currentAudioPlayer = null;
  let isCharacterSpeaking = false;

  function stopAllSpeech() {
    isCharacterSpeaking = false;
    if (currentAudioPlayer) {
      currentAudioPlayer.pause();
      currentAudioPlayer = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  function cleanSpokenText(raw) {
    if (!raw) return '';
    return raw
      .replace(/CaCO₃/g, 'क्याल्सियम कार्बोनेट')
      .replace(/2HCl/g, 'हाइड्रोक्लोरिक एसिड')
      .replace(/HCl/g, 'हाइड्रोक्लोरिक एसिड')
      .replace(/NH₄Cl/g, 'अमोनियम क्लोराइड')
      .replace(/Ca\(OH\)₂/g, 'स्लेक्ड लाइम')
      .replace(/CO₂/g, 'कार्बन डाइअक्साइड')
      .replace(/NH₃/g, 'एमोनिया')
      .replace(/NaOH/g, 'सोडियम हाइड्रोक्साइड')
      .replace(/V\s*=\s*I\s*×\s*R/g, 'भी बराबर आई गुणन आर')
      .replace(/➔|⟹|↑|↓/g, ' ')
      .replace(/[*#_~`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function speakText(enText, neText) {
    if (voiceLang === 'off') return;
    stopAllSpeech();

    const textToSpeak = voiceLang === 'ne' ? (neText || enText) : (enText || neText);
    const cleaned = cleanSpokenText(textToSpeak);
    if (!cleaned) return;

    isCharacterSpeaking = true;
    const langCode = voiceLang === 'ne' ? 'ne' : 'en';

    // Tier 1: Authentic Human Character Voice via Neural TTS stream
    const encoded = encodeURIComponent(cleaned.substring(0, 180));
    const humanTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encoded}`;

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.src = humanTtsUrl;
    currentAudioPlayer = audio;

    let hasPlayedAudio = false;

    audio.onplay = () => {
      hasPlayedAudio = true;
      isCharacterSpeaking = true;
    };

    audio.onended = () => {
      isCharacterSpeaking = false;
      currentAudioPlayer = null;
    };

    audio.onerror = () => {
      // Tier 2: Neural Browser Speech Synthesis Fallback
      fallbackBrowserSpeech(cleaned, voiceLang);
    };

    audio.play().catch(() => {
      fallbackBrowserSpeech(cleaned, voiceLang);
    });
  }

  function fallbackBrowserSpeech(text, lang) {
    if (!('speechSynthesis' in window)) {
      isCharacterSpeaking = false;
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'ne' ? 'ne-NP' : 'en-US';
      u.rate = lang === 'ne' ? 0.90 : 0.95;
      u.pitch = 1.05; // Slightly warmer, friendly teacher pitch

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length) {
        if (lang === 'ne') {
          // Prioritize high-quality human Neural / Natural Devanagari voices
          const bestNe = voices.find(v => 
            v.lang.startsWith('ne') || 
            (v.lang.startsWith('hi') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural') || v.name.includes('Swara') || v.name.includes('Madhur')))
          ) || voices.find(v => v.lang.startsWith('hi') || v.lang.startsWith('mr'));
          if (bestNe) u.voice = bestNe;
        } else {
          // Friendly English Character voice
          const bestEn = voices.find(v => 
            v.lang.startsWith('en') && 
            (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online') || v.name.includes('Google') || v.name.includes('Guy') || v.name.includes('Aria'))
          );
          if (bestEn) u.voice = bestEn;
        }
      }

      u.onstart = () => { isCharacterSpeaking = true; };
      u.onend = () => { isCharacterSpeaking = false; };
      u.onerror = () => { isCharacterSpeaking = false; };

      window.speechSynthesis.speak(u);
    } catch(e) {
      isCharacterSpeaking = false;
    }
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

  // Header Buttons
  const voiceBtn = document.getElementById('voice-toggle-btn');
  voiceBtn.textContent = '🔊 आवाज: नेपाली (ne)';
  voiceBtn.classList.add('active');

  voiceBtn.addEventListener('click', () => {
    if (voiceLang === 'ne') {
      voiceLang = 'en';
      voiceBtn.textContent = '🔊 Voice: English (en)';
      voiceBtn.classList.add('active');
      speakText('English narration activated.', 'English narration activated.');
    } else if (voiceLang === 'en') {
      voiceLang = 'off';
      voiceBtn.textContent = '🔇 Voice: OFF';
      voiceBtn.classList.remove('active');
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } else {
      voiceLang = 'ne';
      voiceBtn.textContent = '🔊 आवाज: नेपाली (ne)';
      voiceBtn.classList.add('active');
      speakText('नेपाली आवाज सक्रिय भयो।', 'नेपाली आवाज सक्रिय भयो।');
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

  // Wall Mounted Reagent Rack on Back Wall (realistic amber bottles with labels)
  const shelfGeo = new THREE.BoxGeometry(8.5, 0.1, 0.45);
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.3 });
  const shelf = new THREE.Mesh(shelfGeo, shelfMat);
  shelf.position.set(0, 2.2, -5.5); // Placed securely against back wall!
  roomGroup.add(shelf);

  const bottleTints = [0x78350f, 0x92400e, 0x1e3a8a, 0x065f46, 0x78350f, 0x1e293b, 0x92400e];
  for (let i = 0; i < 7; i++) {
    const bGroup = new THREE.Group();
    bGroup.position.set(-3.2 + i * 1.05, 2.5, -5.5);

    // Amber reagent bottle
    const bMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.45, 16),
      new THREE.MeshStandardMaterial({ color: bottleTints[i], roughness: 0.25, metalness: 0.2 })
    );
    bGroup.add(bMesh);

    // Black screw cap
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.12, 14),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
    );
    cap.position.y = 0.28;
    bGroup.add(cap);

    // White paper label on front
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(0.14, 0.2),
      new THREE.MeshBasicMaterial({ color: 0xf8fafc })
    );
    label.position.set(0, 0, 0.125);
    bGroup.add(label);

    roomGroup.add(bGroup);
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

  // Animated Talking Mouth Mesh (moves when speaking!)
  const mouthGeo = new THREE.BoxGeometry(0.12, 0.04, 0.06);
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0x7f1d1d });
  const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
  mouthMesh.position.set(0, 2.52, 0.26);
  avatarGroup.add(mouthMesh);

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
      if (typeof isCharacterSpeaking !== 'undefined' && isCharacterSpeaking) {
        // Real character talking animation
        headMesh.rotation.y = Math.sin(avatarTime * 3.5) * 0.15;
        headMesh.rotation.x = Math.sin(avatarTime * 7.0) * 0.06;
        if (typeof mouthMesh !== 'undefined') {
          mouthMesh.scale.y = 1.0 + Math.abs(Math.sin(avatarTime * 14.0)) * 2.2;
          mouthMesh.scale.x = 1.0 + Math.sin(avatarTime * 9.0) * 0.3;
        }
      } else {
        // Natural resting idle
        headMesh.rotation.y = Math.sin(avatarTime * 0.8) * 0.08;
        headMesh.rotation.x = 0;
        if (typeof mouthMesh !== 'undefined') {
          mouthMesh.scale.set(1.0, 1.0, 1.0);
        }
      }
    }
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // ── Authentic Laboratory Borosilicate Glass Material (Solid, Shiny, Never Ghostly!) ──
  function createGlassMarkings() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 256, 256);

    // White graduation lines and measurement ticks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 3;
    for (let y = 60; y <= 210; y += 30) {
      ctx.beginPath();
      ctx.moveTo(85, y);
      ctx.lineTo(135, y);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`${(230 - y) * 2}mL`, 140, y + 4);
    }
    // Pyrex / Borosilicate 3.3 logo
    ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('PYREX 250mL', 80, 42);

    const tex = new THREE.CanvasTexture(c);
    return tex;
  }

  // Primary Glass: Substantial, glossy, reflective borosilicate glass
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdbeafe,            // Crisp light-blue tint of genuine borosilicate glass
    transparent: true,
    opacity: 0.74,              // Solid tangible presence (never faint ghost!)
    roughness: 0.06,            // Ultra-smooth polished glass
    metalness: 0.12,            // Distinct specular highlights
    clearcoat: 1.0,             // Glossy outer surface
    clearcoatRoughness: 0.06,
    reflectivity: 0.92,
    depthWrite: true,           // Renders solid depth buffer
    side: THREE.DoubleSide
  });

  const markedGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdbeafe,
    map: createGlassMarkings(),
    transparent: true,
    opacity: 0.78,
    roughness: 0.06,
    metalness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    depthWrite: true,
    side: THREE.DoubleSide
  });

  // Solid glass rim / lip material for top edges of beakers and necks
  const glassRimMaterial = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.1,
    metalness: 0.25,
    transparent: true,
    opacity: 0.92
  });

  // Rubber stopper material for joints and necks
  const rubberStopperMaterial = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.7,
    metalness: 0.1
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
    stepTextEl.textContent = voiceLang === 'ne' ? `${ne} · ${en}` : `${en} (${ne})`;
    currentStepEn = en;
    currentStepNe = ne;
    assistantSpeech.textContent = voiceLang === 'ne' ? ne : en;
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

    // 1. Real 3D Woulfe's Bottle (Solid Borosilicate Glass, Thick Base, Rims & Stoppers)
    const bottleGroup = new THREE.Group();
    bottleGroup.position.set(-1.0, 0, 0);
    bottleGroup.visible = false;

    // Heavy thickened glass base disk
    const baseDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.1, 24), glassRimMaterial);
    baseDisk.position.y = 0.05;
    bottleGroup.add(baseDisk);

    // Bottle body with graduation markings
    const bottleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.82, 1.45, 24), markedGlassMaterial);
    bottleBody.position.y = 0.8;
    bottleGroup.add(bottleBody);

    // Curved shoulder
    const shoulder = new THREE.Mesh(new THREE.ConeGeometry(0.74, 0.35, 24, 1, true), glassMaterial);
    shoulder.rotation.x = Math.PI;
    shoulder.position.y = 1.65;
    bottleGroup.add(shoulder);

    // Two Ground-Glass Necks with Rims & Perforated Stoppers
    [-0.35, 0.35].forEach((nx, idx) => {
      // Glass neck
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.45, 18), glassMaterial);
      neck.position.set(nx, 1.9, 0);
      bottleGroup.add(neck);

      // Rolled glass lip rim on top
      const lip = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.035, 12, 24), glassRimMaterial);
      lip.rotation.x = Math.PI / 2;
      lip.position.set(nx, 2.12, 0);
      bottleGroup.add(lip);

      // Dark rubber stopper with central tubing hole
      const stopper = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.22, 16), rubberStopperMaterial);
      stopper.position.set(nx, 2.0, 0);
      bottleGroup.add(stopper);
    });

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

    // 4. Heavy Upright Gas Jar (Solid Base & Ground Mouth Rim)
    const jarGroup = new THREE.Group();
    jarGroup.position.set(1.3, 0, 0);
    jarGroup.visible = false;

    // Heavy hexagonal / circular glass base foot
    const jarFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.1, 24), glassRimMaterial);
    jarFoot.position.y = 0.05;
    jarGroup.add(jarFoot);

    // Cylinder body
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.85, 24), glassMaterial);
    jar.position.y = 1.0;
    jarGroup.add(jar);

    // Ground glass mouth rim
    const jarRim = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.04, 12, 24), glassRimMaterial);
    jarRim.rotation.x = Math.PI / 2;
    jarRim.position.y = 1.93;
    jarGroup.add(jarRim);

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
    const tubeRim = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.03, 12, 20), glassRimMaterial);
    tubeRim.rotation.x = Math.PI / 2;
    tubeRim.position.y = 0.9;
    tubeGroup.add(tubeRim);

    const tubeStopper = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.25, 16), rubberStopperMaterial);
    tubeStopper.position.y = 0.85;
    tubeGroup.add(tubeStopper);
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

    // 1. Heavy Base Retort Stand with Clamp
    const standGroup = new THREE.Group();
    standGroup.position.set(-0.6, 0, 0);
    standGroup.visible = false;

    const sBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.7), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.2 }));
    sBase.position.y = 0.06;
    standGroup.add(sBase);

    const sRod = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 3.2), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.15 }));
    sRod.position.y = 1.6;
    standGroup.add(sRod);

    const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 }));
    clamp.position.set(0.35, 2.1, 0);
    standGroup.add(clamp);
    g.add(standGroup);

    // 2. 50 mL Graduated Glass Burette
    const buretteGroup = new THREE.Group();
    buretteGroup.position.set(0, 0, 0);
    buretteGroup.visible = false;

    const buretteTube = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 2.5, 24), glassMaterial);
    buretteTube.position.y = 2.0;
    buretteGroup.add(buretteTube);

    // Stopcock tap
    const stopcock = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.06), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    stopcock.position.y = 0.85;
    buretteGroup.add(stopcock);

    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.2, 16), glassMaterial);
    tip.position.y = 0.75;
    tip.rotation.x = Math.PI;
    buretteGroup.add(tip);

    // Liquid inside burette (Standard 0.1M NaOH)
    const buretteLiquidMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.55 });
    const buretteLiquid = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 2.0, 16), buretteLiquidMat);
    buretteLiquid.position.y = 2.0;
    buretteGroup.add(buretteLiquid);
    g.add(buretteGroup);

    // 3. 250 mL Conical Flask with 25mL HCl
    const flaskGroup = new THREE.Group();
    flaskGroup.position.set(0, 0, 0);
    flaskGroup.visible = false;

    const flaskBody = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.85, 24), glassMaterial);
    flaskBody.position.y = 0.45;
    flaskGroup.add(flaskBody);

    const flaskNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.35, 16), glassMaterial);
    flaskNeck.position.y = 0.95;
    flaskGroup.add(flaskNeck);

    const flaskLiquidMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
    const flaskLiquid = new THREE.Mesh(new THREE.ConeGeometry(0.56, 0.45, 20), flaskLiquidMat);
    flaskLiquid.position.y = 0.24;
    flaskGroup.add(flaskLiquid);
    g.add(flaskGroup);

    // 4. Indicator Dropper Bottle
    const indicatorBot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.45, 16), new THREE.MeshStandardMaterial({ color: 0xec4899 }));
    indicatorBot.position.set(1.4, 0.25, 0);
    indicatorBot.visible = false;
    g.add(indicatorBot);

    labGroup.add(g);

    let naohTitrantVol = 0.0;
    let currentStage = 0;
    let updateRackFn = null;

    function updateTitrationCalc() {
      const isNeutral = naohTitrantVol >= 25.0;
      if (isNeutral) {
        flaskLiquidMat.color.setHex(0xf472b6); // Permanent pale pink endpoint!
        flaskLiquidMat.opacity = 0.88;
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
          <input type="range" class="custom-range" id="titrant-range" min="0" max="30" step="0.5" value="${naohTitrantVol}" ${currentStage < 4 ? 'disabled' : ''} />
        </div>
      `;

      formulaBox.innerHTML = `
        <div class="formula-title">Neutralization Stoichiometry · उदासीनीकरण</div>
        <div class="formula-math">HCl + NaOH ➔ NaCl + H₂O</div>
        <div class="formula-math">M₁V₁ (Acid) = M₂V₂ (Base) ⟹ (0.1M)(25mL) = (0.1M)(V₂)</div>
        <div class="formula-result">
          <span>Current Status:</span>
          <span>${isNeutral ? 'Neutralized Pale Pink (pH 7.0) ✓' : naohTitrantVol > 0 ? 'Acidic: Titrating...' : 'Ready for Titration'}</span>
        </div>
      `;

      const tRange = document.getElementById('titrant-range');
      if (tRange) {
        tRange.oninput = (e) => {
          naohTitrantVol = parseFloat(e.target.value);
          playPourSound();
          updateTitrationCalc();
          if (naohTitrantVol >= 25.0) {
            playSuccess();
            setStep('Endpoint Reached!', 'Permanent pale pink color obtained! Neutralization complete at exactly 25.0 mL NaOH. M₁V₁ = M₂V₂ verified!', 'स्थायी हल्का गुलाबी रङ आयो! उदासीनीकरण १००% सफल भयो!');
            setObservation('End point: 25.0 mL NaOH neutralized 25.0 mL HCl.', 'उदासीनीकरण सम्पन्न।');
          }
        };
      }
    }
    updateTitrationCalc();

    const eqItems = [
      { stage: 0, id: 'stand', icon: '🏗️', en: 'Retort Stand with Burette Clamp', ne: 'रिटोर्ट स्ट्यान्ड र क्ल्याम्प', descNe: 'स्ट्यान्ड बेन्चमा राख्नुहोस्' },
      { stage: 1, id: 'flask', icon: '⚗️', en: '250 mL Conical Flask with 25mL HCl', ne: 'कोनिकल फ्लास्कमा २५ mL HCl', descNe: 'फ्लास्क बेन्चमा मिलाउनुहोस्' },
      { stage: 2, id: 'indicator', icon: '💧', en: 'Phenolphthalein Indicator (2 drops)', ne: 'फेनोल्फथेलिन सूचक हाल्नुहोस्', descNe: 'अम्लमा रङहीन रहने' },
      { stage: 3, id: 'burette', icon: '📏', en: '50 mL Burette with 0.1M NaOH', ne: '५० एमएल ब्युरेटमा ०.१ M NaOH', descNe: 'ब्युरेट क्ल्याम्पमा जोड्नुहोस्' },
      { stage: 4, id: 'titrate', icon: '🎯', en: 'Open Stopcock to Titrate', ne: 'ब्युरेटबाट थोपाथोपा खन्याउनुहोस्', descNe: 'गुलाबी रङ आउने अन्तिम बिन्दु' }
    ];

    function executeStage(stg) {
      if (stg === 0) {
        standGroup.visible = true;
        playClink();
        currentStage = 1;
        setStep('2', 'Stand placed! Pick "250 mL Conical Flask with 25mL HCl" from the rack.', 'स्ट्यान्ड राखियो! अब २५ mL HCl भएको कोनिकल फ्लास्क बेन्चमा राख्नुहोस्।');
        setObservation('Retort stand with burette clamp ready.', 'स्ट्यान्ड तयार।');
      } else if (stg === 1) {
        flaskGroup.visible = true;
        playClink();
        currentStage = 2;
        setStep('3', 'Flask placed! Pick "Phenolphthalein Indicator" from rack to add 2 drops into the acid.', 'फ्लास्क राखियो! अब २ थोपा फेनोल्फथेलिन सूचक अम्लमा हाल्नुहोस्।');
        setObservation('HCl in flask: Solution remains clear/colorless in acid.', 'अम्लमा फेनोल्फथेलिन रङहीन रहन्छ।');
      } else if (stg === 2) {
        indicatorBot.visible = true;
        playPourSound();
        currentStage = 3;
        setStep('4', 'Indicator added! Pick "50 mL Burette with 0.1M NaOH" from the rack to clamp above the flask.', 'सूचक हालियो! अब ०.१ M NaOH भरिएको ५० एमएल ब्युरेट क्ल्याम्पमा जोड्नुहोस्।');
        setObservation('Indicator ready. Clamping graduated burette.', 'ब्युरेट जोड्न तयार।');
      } else if (stg === 3) {
        buretteGroup.visible = true;
        playClink();
        currentStage = 4;
        updateTitrationCalc();
        setStep('5', 'Apparatus assembled! Open stopcock to dispense NaOH dropwise until pale pink endpoint.', 'उपकरण तयार भयो! अब ब्युरेटको नब खोलेर हल्का गुलाबी रङ नआएसम्म टाइट्रेसन गर्नुहोस्।');
        setObservation('Burette clamped at 0.00 mL mark. Ready to titrate.', 'टाइट्रेसन सुरु गर्न तयार।');
      } else if (stg === 4) {
        naohTitrantVol = 25.0;
        playPourSound();
        playSuccess();
        updateTitrationCalc();
        currentStage = 5;
        setStep('Done!', 'Permanent pale pink endpoint reached at 25.0 mL! Neutralization reaction complete! Practical 100% complete!', 'स्थायी हल्का गुलाबी रङ आयो! उदासीनीकरण १००% सम्पन्न भयो!');
        setObservation('Endpoint reached: V₁ = 25.0 mL HCl, V₂ = 25.0 mL NaOH. M₁V₁ = M₂V₂ verified.', 'उदासीनीकरण १००% प्रमाणित।');
      }

      updateActionButtons();
      if (updateRackFn) updateRackFn();
    }

    function updateActionButtons() {
      const cur = eqItems[currentStage] || { en: 'Titration Complete!', ne: 'प्रयोग सम्पन्न!' };
      actionsGrid.innerHTML = `
        <button class="lab-action-btn" id="btn-titrate-next" ${currentStage >= 5 ? 'disabled' : ''}>
          <span>👉 Step ${currentStage + 1}: ${cur.en}</span>
          <span class="sub">${cur.ne}</span>
        </button>
        <button class="lab-action-btn btn-reset" id="btn-titrate-clean">
          <span>🔄 Clean Bench</span>
          <span class="sub">खाली बेन्चबाट सुरु</span>
        </button>
      `;

      const bNext = document.getElementById('btn-titrate-next');
      if (bNext && currentStage < 5) {
        bNext.onclick = () => executeStage(currentStage);
      }
      document.getElementById('btn-titrate-clean').onclick = () => setupTitrationExperiment();
    }

    updateRackFn = renderRack(eqItems, currentStage, (item, stg) => {
      if (stg === currentStage) executeStage(stg);
      else if (stg < currentStage) setObservation(`${item.en} is already assembled.`, `${item.ne} राखिसकियो।`);
    });

    setStep('1', 'Pick "Retort Stand with Burette Clamp" from the rack to place on your workbench.', 'उपकरण र्याकबाट स्ट्यान्ड र क्ल्याम्प छनोट गरी बेन्चमा राख्नुहोस्।');
    setObservation('Clean laboratory bench ready for Acid-Base Titration.', 'टाइट्रेसन बेन्च तयार।');
    updateActionButtons();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── EXPERIMENT 4: Verification of Ohm's Law (V = I * R) ───────────────────
  // ════════════════════════════════════════════════════════════════════════════
    function setupOhmsExperiment() {
    labGroup.clear();
    const g = new THREE.Group();

    // 1. DC Battery Power Supply
    const battGroup = new THREE.Group();
    battGroup.position.set(-2.0, 0, 0);
    battGroup.visible = false;

    const battery = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.65, 0.8), new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.6, roughness: 0.3 }));
    battery.position.y = 0.325;
    battGroup.add(battery);

    const termPos = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    termPos.position.set(-0.35, 0.7, 0);
    battGroup.add(termPos);

    const termNeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    termNeg.position.set(0.35, 0.7, 0);
    battGroup.add(termNeg);
    g.add(battGroup);

    // 2. Constantan Resistor Wire on Wooden Board
    const resGroup = new THREE.Group();
    resGroup.position.set(0, 0, 0);
    resGroup.visible = false;

    const resBoard = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 0.6), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }));
    resBoard.position.y = 0.05;
    resGroup.add(resBoard);

    const resWire = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.1), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 }));
    resWire.rotation.z = Math.PI / 2;
    resWire.position.y = 0.12;
    resGroup.add(resWire);
    g.add(resGroup);

    // 3. Sliding Rheostat
    const rheoGroup = new THREE.Group();
    rheoGroup.position.set(0.2, 0, 0.9);
    rheoGroup.visible = false;

    const rheoTube = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.6, 20), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 }));
    rheoTube.rotation.z = Math.PI / 2;
    rheoTube.position.y = 0.28;
    rheoGroup.add(rheoTube);

    const sliderKnob = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.18, 0.2), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 }));
    sliderKnob.position.set(0, 0.44, 0);
    rheoGroup.add(sliderKnob);
    g.add(rheoGroup);

    // 4. Analog Voltmeter (Parallel)
    const voltMeter = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.4, 20), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 }));
    voltMeter.rotation.x = Math.PI / 4;
    voltMeter.position.set(0, 0.4, -0.7);
    voltMeter.visible = false;
    g.add(voltMeter);

    // 5. Analog Ammeter (Series)
    const ampMeter = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.4, 20), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 }));
    ampMeter.rotation.x = Math.PI / 4;
    ampMeter.position.set(1.5, 0.4, -0.7);
    ampMeter.visible = false;
    g.add(ampMeter);

    labGroup.add(g);

    let voltage = 6.0;
    const resistance = 10.0;
    let currentStage = 0;
    let updateRackFn = null;

    function updateOhmsCalc() {
      const current = voltage / resistance;

      slidersWrap.innerHTML = `
        <div class="calc-slider-group">
          <div class="slider-label-row">
            <span>Rheostat Potential Difference (V):</span>
            <span class="val">${voltage.toFixed(1)} V</span>
          </div>
          <input type="range" class="custom-range" id="volt-range" min="1.0" max="12.0" step="0.5" value="${voltage}" ${currentStage < 4 ? 'disabled' : ''} />
        </div>
      `;

      formulaBox.innerHTML = `
        <div class="formula-title">Ohm's Law · ओमको नियम</div>
        <div class="formula-math">V = I × R  ⟹  I = V / R (Slope = R)</div>
        <div class="formula-result">
          <span>Circuit Current (I):</span>
          <span>${current.toFixed(2)} A</span>
        </div>
        <div class="formula-result" style="color:#38bdf8;">
          <span>Fixed Resistor (R):</span>
          <span>${resistance.toFixed(1)} Ω</span>
        </div>
      `;

      const vRange = document.getElementById('volt-range');
      if (vRange) {
        vRange.oninput = (e) => {
          voltage = parseFloat(e.target.value);
          playTone(300 + voltage * 50, 'sine', 0.08, 0.1);
          updateOhmsCalc();
        };
      }
    }
    updateOhmsCalc();

    const eqItems = [
      { stage: 0, id: 'batt', icon: '🔋', en: 'DC Battery Bank (12V)', ne: '१२ भोल्ट ब्याट्री', descNe: 'पावर सप्लाई बेन्चमा राख्नुहोस्' },
      { stage: 1, id: 'res', icon: '⚡', en: 'Constantan Resistor Wire (10Ω)', ne: '१० ओम प्रतिरोधक तार', descNe: 'प्रतिरोधक बोर्ड मिलाउनुहोस्' },
      { stage: 2, id: 'rheo', icon: '🎚️', en: 'Sliding Rheostat (Variable R)', ne: 'रियोस्ट्याट (करेन्ट नियन्त्रक)', descNe: 'श्रेणीक्रममा जोड्नुहोस्' },
      { stage: 3, id: 'amm', icon: '🧭', en: 'Analog Ammeter (Series)', ne: 'एमिमिटर (श्रेणीक्रम)', descNe: 'करेन्ट नाप्ने मिटर' },
      { stage: 4, id: 'volt', icon: '📟', en: 'Analog Voltmeter (Parallel)', ne: 'भोल्टमिटर (समानान्तर)', descNe: 'भोल्टेज नाप्ने मिटर' }
    ];

    function executeStage(stg) {
      if (stg === 0) {
        battGroup.visible = true;
        playClink();
        currentStage = 1;
        setStep('2', 'Battery placed! Pick "Constantan Resistor Wire (10Ω)" from the rack to place on bench.', 'ब्याट्री राखियो! अब १० ओम प्रतिरोधक तार बेन्चमा राख्नुहोस्।');
        setObservation('DC Power source connected (12V max).', 'पावर सप्लाई तयार।');
      } else if (stg === 1) {
        resGroup.visible = true;
        playClink();
        currentStage = 2;
        setStep('3', 'Resistor placed! Pick "Sliding Rheostat" from rack to regulate circuit voltage and current.', 'प्रतिरोधक राखियो! अब रियोस्ट्याट जोड्नुहोस्।');
        setObservation('Standard Constantan resistance wire (R = 10 Ω) ready.', 'प्रतिरोधक तयार।');
      } else if (stg === 2) {
        rheoGroup.visible = true;
        playClink();
        currentStage = 3;
        setStep('4', 'Rheostat connected! Pick "Analog Ammeter" from rack to connect in series.', 'रियोस्ट्याट जोडियो! अब श्रेणीक्रममा एमिमिटर जोड्नुहोस्।');
        setObservation('Variable rheostat ready to control current.', 'रियोस्ट्याट तयार।');
      } else if (stg === 3) {
        ampMeter.visible = true;
        playClink();
        currentStage = 4;
        setStep('5', 'Ammeter connected! Pick "Analog Voltmeter" from rack to connect in parallel across resistor.', 'एमिमिटर जोडियो! अब प्रतिरोधकको समानान्तरमा भोल्टमिटर जोड्नुहोस्।');
        setObservation('Ammeter in series measures total circuit current (Amperes).', 'एमिमिटर जडान भयो।');
      } else if (stg === 4) {
        voltMeter.visible = true;
        playClink();
        playSuccess();
        currentStage = 5;
        updateOhmsCalc();
        setStep('Circuit Complete!', 'Circuit is active! Adjust the Rheostat slider to vary voltage and observe proportional current. V = I × R verified!', 'परिपथ पूरा भयो! भोल्टेज बढाउँदा करेन्ट पनि समानुपातिक रूपमा बढेको हेर्नुहोस्।');
        setObservation('Ohm\'s Law Verified: Ratio V/I = constant Resistance (10 Ω).', 'ओमको नियम १००% प्रमाणित।');
      }

      updateActionButtons();
      if (updateRackFn) updateRackFn();
    }

    function updateActionButtons() {
      const cur = eqItems[currentStage] || { en: 'Ohm\'s Law Verified!', ne: 'प्रयोग सम्पन्न!' };
      actionsGrid.innerHTML = `
        <button class="lab-action-btn" id="btn-ohms-next" ${currentStage >= 5 ? 'disabled' : ''}>
          <span>👉 Step ${currentStage + 1}: ${cur.en}</span>
          <span class="sub">${cur.ne}</span>
        </button>
        <button class="lab-action-btn btn-reset" id="btn-ohms-clean">
          <span>🔄 Clean Bench</span>
          <span class="sub">खाली बेन्चबाट सुरु</span>
        </button>
      `;

      const bNext = document.getElementById('btn-ohms-next');
      if (bNext && currentStage < 5) {
        bNext.onclick = () => executeStage(currentStage);
      }
      document.getElementById('btn-ohms-clean').onclick = () => setupOhmsExperiment();
    }

    updateRackFn = renderRack(eqItems, currentStage, (item, stg) => {
      if (stg === currentStage) executeStage(stg);
      else if (stg < currentStage) setObservation(`${item.en} is already assembled.`, `${item.ne} राखिसकियो।`);
    });

    setStep('1', 'Pick "DC Battery Bank (12V)" from the rack to place on your workbench.', 'उपकरण र्याकबाट १२ भोल्ट ब्याट्री छनोट गरी बेन्चमा राख्नुहोस्।');
    setObservation('Clean laboratory bench ready for Ohm\'s Law verification.', 'ओमको नियम परीक्षण बेन्च तयार।');
    updateActionButtons();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── EXPERIMENT 5: Archimedes' Principle & Upthrust ─────────────────────────
  // ════════════════════════════════════════════════════════════════════════════
    function setupArchimedesExperiment() {
    labGroup.clear();
    const g = new THREE.Group();

    // 1. Heavy Retort Stand with Spring Balance
    const standGroup = new THREE.Group();
    standGroup.position.set(-0.8, 0, 0);
    standGroup.visible = false;

    const sBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.8), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85 }));
    sBase.position.y = 0.06;
    standGroup.add(sBase);

    const standRod = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 3.2), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 }));
    standRod.position.y = 1.6;
    standGroup.add(standRod);

    const balance = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6 }));
    balance.position.set(0.4, 2.1, 0);
    standGroup.add(balance);
    g.add(standGroup);

    // 2. Eureka Overflow Can filled to Spout
    const eurekaGroup = new THREE.Group();
    eurekaGroup.position.set(-0.4, 0, 0);
    eurekaGroup.visible = false;

    const eurekaCan = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.4, 24), glassMaterial);
    eurekaCan.position.y = 0.7;
    eurekaGroup.add(eurekaCan);

    // Spout
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4), glassMaterial);
    spout.rotation.z = Math.PI / 4;
    spout.position.set(0.55, 1.1, 0);
    eurekaGroup.add(spout);

    const waterInCan = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 1.0, 20), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 }));
    waterInCan.position.y = 0.55;
    eurekaGroup.add(waterInCan);
    g.add(eurekaGroup);

    // 3. Measuring Cylinder under spout
    const cylGroup = new THREE.Group();
    cylGroup.position.set(0.65, 0, 0);
    cylGroup.visible = false;

    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.95, 16), glassMaterial);
    cyl.position.y = 0.475;
    cylGroup.add(cyl);

    const displacedWater = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 }));
    displacedWater.position.y = 0.28;
    cylGroup.add(displacedWater);
    g.add(cylGroup);

    // 4. Solid Brass Cylinder
    const solid = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.6, 16), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 }));
    solid.position.set(-0.4, 1.4, 0);
    solid.visible = false;
    g.add(solid);

    labGroup.add(g);

    let immersionPct = 0;
    const weightAir = 3.5;
    const maxDisplaced = 1.0;
    let currentStage = 0;
    let updateRackFn = null;

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
          <input type="range" class="custom-range" id="immersion-range" min="0" max="100" value="${immersionPct}" ${currentStage < 3 ? 'disabled' : ''} />
        </div>
      `;

      formulaBox.innerHTML = `
        <div class="formula-title">Archimedes' Principle · आर्किमिडिजको सिद्धान्त</div>
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
          <span>Displaced Liquid:</span>
          <span>${displacedML} mL (Weight = ${upthrust.toFixed(2)} N)</span>
        </div>
      `;

      const imRange = document.getElementById('immersion-range');
      if (imRange) {
        imRange.oninput = (e) => {
          immersionPct = parseInt(e.target.value);
          if (immersionPct > 0) playBubbleSound();
          updateArchimedesCalc();
        };
      }
    }
    updateArchimedesCalc();

    const eqItems = [
      { stage: 0, id: 'stand', icon: '🏗️', en: 'Retort Stand with Spring Balance', ne: 'स्ट्यान्ड र स्प्रिङ ब्यालेन्स', descNe: 'स्ट्यान्ड बेन्चमा राख्नुहोस्' },
      { stage: 1, id: 'eureka', icon: '🫙', en: 'Eureka Can Filled to Spout', ne: 'टुटी भएको युरेका क्यान', descNe: 'पानी भरिएको क्यान राख्नुहोस्' },
      { stage: 2, id: 'measuring', icon: '🧪', en: 'Displaced Liquid Measuring Beaker', ne: 'नाप्ने भाँडो (सिलिन्डर)', descNe: 'टुटीमुनि भाँडो राख्नुहोस्' },
      { stage: 3, id: 'solid', icon: '🔩', en: 'Solid Brass Cylinder (Weight in Air = 3.5N)', ne: 'पित्तलको ठोस वस्तु (तौल ३.५N)', descNe: 'ब्यालेन्समा झुन्ड्याउनुहोस्' },
      { stage: 4, id: 'submerge', icon: '💧', en: 'Submerge Solid into Water', ne: 'वस्तुलाई पानीमा डुबाउनुहोस्', descNe: 'उर्ध्वचाप प्रमाणित गर्ने' }
    ];

    function executeStage(stg) {
      if (stg === 0) {
        standGroup.visible = true;
        playClink();
        currentStage = 1;
        setStep('2', 'Stand placed! Pick "Eureka Can Filled to Spout" from rack to position on bench.', 'स्ट्यान्ड राखियो! अब पानी भरिएको युरेका क्यान बेन्चमा मिलाउनुहोस्।');
        setObservation('Newton spring balance mounted on stand.', 'स्प्रिङ ब्यालेन्स तयार।');
      } else if (stg === 1) {
        eurekaGroup.visible = true;
        playClink();
        currentStage = 2;
        setStep('3', 'Eureka can placed! Pick "Displaced Liquid Measuring Beaker" to place under the spout.', 'युरेका क्यान राखियो! अब टुटीमुनि नाप्ने भाँडो राख्नुहोस्।');
        setObservation('Eureka can water level exactly at the spout overflow lip.', 'पानी टुटीसम्म भरिएको छ।');
      } else if (stg === 2) {
        cylGroup.visible = true;
        playClink();
        currentStage = 3;
        setStep('4', 'Beaker positioned! Pick "Solid Brass Cylinder" from rack to suspend in air (W₁ = 3.5 N).', 'भाँडो राखियो! अब पित्तलको ठोस वस्तु झुन्ड्याउनुहोस् (हावामा तौल = ३.५ N)।');
        setObservation('Measuring cylinder ready to collect displaced liquid.', 'नाप्ने भाँडो तयार।');
      } else if (stg === 3) {
        solid.visible = true;
        playClink();
        currentStage = 4;
        updateArchimedesCalc();
        setStep('5', 'Solid suspended in air! Submerge into Eureka can: loss of weight will equal displaced water!', 'वस्तु हावामा झुन्ड्याइयो! अब यसलाई युरेका क्यानमा डुबाएर उर्ध्वचाप नाप्नुहोस्।');
        setObservation('Solid in air: W₁ = 3.5 N. Ready to lower into water.', 'हावामा तौल ३.५ N छ।');
      } else if (stg === 4) {
        immersionPct = 100;
        playBubbleSound();
        playSuccess();
        updateArchimedesCalc();
        currentStage = 5;
        setStep('Done!', 'Fully submerged! W₁ = 3.5N, W₂ = 2.5N. Upthrust = 1.0N = Weight of 100mL displaced water! Practical 100% complete!', 'वस्तु पूरै डुब्यो! उर्ध्वचाप = १.० N = विस्थापित पानीको तौल। आर्किमिडिजको सिद्धान्त १००% प्रमाणित!');
        setObservation('Archimedes Verified: Upthrust = Loss of Weight = Displaced Liquid Weight.', 'आर्किमिडिजको सिद्धान्त प्रमाणित भयो।');
      }

      updateActionButtons();
      if (updateRackFn) updateRackFn();
    }

    function updateActionButtons() {
      const cur = eqItems[currentStage] || { en: 'Archimedes Verified!', ne: 'प्रयोग सम्पन्न!' };
      actionsGrid.innerHTML = `
        <button class="lab-action-btn" id="btn-arch-next" ${currentStage >= 5 ? 'disabled' : ''}>
          <span>👉 Step ${currentStage + 1}: ${cur.en}</span>
          <span class="sub">${cur.ne}</span>
        </button>
        <button class="lab-action-btn btn-reset" id="btn-arch-clean">
          <span>🔄 Clean Bench</span>
          <span class="sub">खाली बेन्चबाट सुरु</span>
        </button>
      `;

      const bNext = document.getElementById('btn-arch-next');
      if (bNext && currentStage < 5) {
        bNext.onclick = () => executeStage(currentStage);
      }
      document.getElementById('btn-arch-clean').onclick = () => setupArchimedesExperiment();
    }

    updateRackFn = renderRack(eqItems, currentStage, (item, stg) => {
      if (stg === currentStage) executeStage(stg);
      else if (stg < currentStage) setObservation(`${item.en} is already assembled.`, `${item.ne} राखिसकियो।`);
    });

    setStep('1', 'Pick "Retort Stand with Spring Balance" from the rack to place on your workbench.', 'उपकरण र्याकबाट स्ट्यान्ड र स्प्रिङ ब्यालेन्स छनोट गरी बेन्चमा राख्नुहोस्।');
    setObservation('Clean laboratory bench ready for Archimedes\' Principle verification.', 'आर्किमिडिजको सिद्धान्त परीक्षण बेन्च तयार।');
    updateActionButtons();
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

    // Eyepiece overlay container
    const eyepieceOverlay = document.getElementById('microscope-eyepiece-overlay');

    // ── 3D Detailed Compound Microscope Apparatus ──────────────────────────
    // 1. Heavy Cast-Iron Horseshoe Base & Limb
    const scopeGroup = new THREE.Group();
    scopeGroup.visible = false; // Starts hidden until student picks from rack!

    // Cast-iron U-shaped base
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.85 });
    const uBase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 1.6), baseMat);
    uBase.position.y = 0.11;
    scopeGroup.add(uBase);

    // Pillar & Curved Arm
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.8), pillarMat);
    pillar.position.set(0, 1.0, -0.45);
    scopeGroup.add(pillar);

    // Curved limb/arm
    const armCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.4, -0.45),
      new THREE.Vector3(0, 2.2, -0.45),
      new THREE.Vector3(0, 2.4, 0.0),
      new THREE.Vector3(0, 2.3, 0.15)
    ]);
    const armMesh = new THREE.Mesh(new THREE.TubeGeometry(armCurve, 20, 0.14, 16, false), baseMat);
    scopeGroup.add(armMesh);

    // Coarse & Fine Focus Brass Knobs on sides of arm
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.25 });
    const coarseLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.12, 24), brassMat);
    coarseLeft.rotation.z = Math.PI / 2;
    coarseLeft.position.set(-0.32, 1.9, -0.35);
    scopeGroup.add(coarseLeft);

    const coarseRight = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.12, 24), brassMat);
    coarseRight.rotation.z = Math.PI / 2;
    coarseRight.position.set(0.32, 1.9, -0.35);
    scopeGroup.add(coarseRight);

    const fineLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.18, 20), brassMat);
    fineLeft.rotation.z = Math.PI / 2;
    fineLeft.position.set(-0.35, 1.9, -0.35);
    scopeGroup.add(fineLeft);

    const fineRight = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.18, 20), brassMat);
    fineRight.rotation.z = Math.PI / 2;
    fineRight.position.set(0.35, 1.9, -0.35);
    scopeGroup.add(fineRight);

    // Mechanical Stage (Black anodized aluminum with aperture hole)
    const stage = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 1.2), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 }));
    stage.position.set(0, 1.15, 0.15);
    scopeGroup.add(stage);

    // Mechanical Stage X/Y Caliper Knobs
    const caliperKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2), brassMat);
    caliperKnob.position.set(0.65, 1.05, 0.35);
    scopeGroup.add(caliperKnob);

    // 2. Glass Specimen Slide & Spring Clips (Hidden until Step 2)
    const slideGroup = new THREE.Group();
    slideGroup.position.set(0, 1.20, 0.15);
    slideGroup.visible = false;

    // Glass slide
    const slideMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.02, 0.28), glassMaterial);
    slideGroup.add(slideMesh);

    // Specimen square with coverslip
    const coverslip = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.024, 0.26), new THREE.MeshStandardMaterial({ color: 0xec4899, transparent: true, opacity: 0.75 }));
    coverslip.position.set(0, 0.005, 0);
    slideGroup.add(coverslip);

    // Chrome stage spring clips
    const clipMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const clipL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.04), clipMat);
    clipL.position.set(-0.34, 0.015, -0.05);
    clipL.rotation.y = 0.3;
    slideGroup.add(clipL);

    const clipR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.04), clipMat);
    clipR.position.set(0.34, 0.015, -0.05);
    clipR.rotation.y = -0.3;
    slideGroup.add(clipR);
    scopeGroup.add(slideGroup);

    // 3. Sub-stage Illuminating Mirror & Light Beam (Hidden until Step 3)
    const mirrorGroup = new THREE.Group();
    mirrorGroup.position.set(0, 0.55, 0.15);
    mirrorGroup.visible = false;

    const mirrorFrame = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.04), pillarMat);
    mirrorFrame.rotation.x = Math.PI / 4;
    mirrorGroup.add(mirrorFrame);

    const mirrorGlass = new THREE.Mesh(new THREE.CircleGeometry(0.23, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.98, roughness: 0.05 }));
    mirrorGlass.rotation.x = -Math.PI / 4;
    mirrorGlass.position.z = 0.025;
    mirrorGroup.add(mirrorGlass);

    // Light cone shining through slide
    const lightConeGeo = new THREE.ConeGeometry(0.35, 0.7, 16, 1, true);
    const lightConeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28, side: THREE.DoubleSide });
    const lightCone = new THREE.Mesh(lightConeGeo, lightConeMat);
    lightCone.position.set(0, 0.38, 0);
    mirrorGroup.add(lightCone);
    scopeGroup.add(mirrorGroup);

    // 4. Rotating Objective Turret Nosepiece (Hidden until Step 4)
    const turretGroup = new THREE.Group();
    turretGroup.position.set(0, 1.45, 0.15);
    turretGroup.visible = false;

    const nosepiece = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.15, 20), baseMat);
    turretGroup.add(nosepiece);

    // 3 Objective Lenses: 10x (Yellow band), 40x (Blue band), 100x (White band)
    const objData = [
      { colorBand: 0xeab308, h: 0.32, label: '10x' },
      { colorBand: 0x0284c7, h: 0.42, label: '40x' },
      { colorBand: 0xf8fafc, h: 0.48, label: '100x' }
    ];
    objData.forEach((obj, idx) => {
      const angle = (idx / 3) * Math.PI * 2;
      const lensGroup = new THREE.Group();
      lensGroup.position.set(Math.cos(angle) * 0.15, -obj.h / 2, Math.sin(angle) * 0.15);

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, obj.h, 16), brassMat);
      lensGroup.add(barrel);

      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.05, 16), new THREE.MeshBasicMaterial({ color: obj.colorBand }));
      band.position.y = -obj.h * 0.15;
      lensGroup.add(band);
      turretGroup.add(lensGroup);
    });
    scopeGroup.add(turretGroup);

    // Monocular Body Tube & 10x Eyepiece
    const bodyTube = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.1), baseMat);
    bodyTube.position.set(0, 2.05, 0.15);
    scopeGroup.add(bodyTube);

    const ocular = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.35), baseMat);
    ocular.position.set(0, 2.65, 0.15);
    scopeGroup.add(ocular);

    g.add(scopeGroup);
    labGroup.add(g);

    // ── 2D Histological Cell Explorer Engine (Real Slide Panning & Focus) ────
    const cellCanvas = document.getElementById('cell-canvas');
    const focusKnob = document.getElementById('focus-knob-slider');
    const focusBadge = document.getElementById('eyepiece-focus-badge');
    const stageCoordsTag = document.getElementById('stage-coords-tag');
    const calloutTitle = document.getElementById('callout-title');
    const calloutDesc = document.getElementById('callout-desc');

    let currentSpecimen = 'plant'; // 'plant', 'animal', 'stomata'
    let focusVal = 15;             // 0-100 (50 is crisp focus)
    let stageX = 0;                // Mechanical stage X coordinate (microns)
    let stageY = 0;                // Mechanical stage Y coordinate (microns)

    // Pre-generate authentic random positions for cheek cells
    const cheekCells = [];
    for (let i = 0; i < 30; i++) {
      cheekCells.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 800,
        rx: 48 + Math.random() * 28,
        ry: 40 + Math.random() * 22,
        rot: Math.random() * Math.PI * 2,
        nucOffX: (Math.random() - 0.5) * 8,
        nucOffY: (Math.random() - 0.5) * 8
      });
    }

    // Pre-generate stomata complex coordinates
    const stomataSites = [];
    for (let r = -3; r <= 3; r++) {
      for (let c = -3; c <= 3; c++) {
        stomataSites.push({
          x: c * 130 + (r % 2) * 45,
          y: r * 130,
          rot: Math.sin(r * 2 + c) * 0.4
        });
      }
    }

    function updateCoordsBadge() {
      if (stageCoordsTag) {
        stageCoordsTag.textContent = `X: ${stageX >= 0 ? '+' : ''}${Math.round(stageX)} µm, Y: ${stageY >= 0 ? '+' : ''}${Math.round(stageY)} µm`;
      }
    }

    function drawCellEyepiece() {
      if (!cellCanvas) return;
      const ctx = cellCanvas.getContext('2d');
      const w = cellCanvas.width;
      const h = cellCanvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Optical focal blur
      const distFromSharp = Math.abs(focusVal - 50);
      const blurPx = (distFromSharp / 50) * 8.5;
      cellCanvas.style.filter = `blur(${blurPx.toFixed(1)}px)`;

      if (distFromSharp <= 6) {
        focusBadge.textContent = 'FOCUS CRISP ✓';
        focusBadge.className = 'focus-badge focused';
      } else {
        focusBadge.textContent = 'Blurry: Turn Wheel';
        focusBadge.className = 'focus-badge';
      }

      ctx.save();
      // Translate canvas context according to mechanical stage calipers
      ctx.translate(cx - stageX, cy - stageY);

      if (currentSpecimen === 'plant') {
        // ── 🌿 Authentic Plant Cell (Onion Epidermal Peel - Iodine Stained) ──
        // Translucent golden-amber background
        ctx.fillStyle = '#fef9c3';
        ctx.fillRect(stageX - cx - 50, stageY - cy - 50, w + 100, h + 100);

        const cellW = 120;
        const cellH = 55;
        const startCol = Math.floor((stageX - cx - 150) / cellW);
        const endCol = Math.ceil((stageX + cx + 150) / cellW);
        const startRow = Math.floor((stageY - cy - 150) / cellH);
        const endRow = Math.ceil((stageY + cy + 150) / cellH);

        for (let r = startRow; r <= endRow; r++) {
          const rowOffsetX = (Math.abs(r) % 2) * (cellW / 2);
          for (let c = startCol; c <= endCol; c++) {
            const bx = c * cellW + rowOffsetX;
            const by = r * cellH;

            // Translucent cytoplasm wash
            ctx.fillStyle = 'rgba(234, 179, 8, 0.12)';
            ctx.fillRect(bx + 4, by + 4, cellW - 8, cellH - 8);

            // Double Cellulose Cell Wall (outer & inner boundary)
            ctx.strokeStyle = '#15803d'; // Outer cellulose layer
            ctx.lineWidth = 4;
            ctx.strokeRect(bx + 2, by + 2, cellW - 4, cellH - 4);

            ctx.strokeStyle = '#86efac'; // Inner plasma membrane line
            ctx.lineWidth = 1.5;
            ctx.strokeRect(bx + 5, by + 5, cellW - 10, cellH - 10);

            // Middle Lamella junction dots
            ctx.fillStyle = '#14532d';
            ctx.beginPath();
            ctx.arc(bx, by, 3, 0, Math.PI * 2);
            ctx.fill();

            // Large Central Vacuole
            ctx.fillStyle = 'rgba(186, 230, 253, 0.38)';
            ctx.beginPath();
            ctx.ellipse(bx + cellW / 2 - 4, by + cellH / 2, cellW * 0.34, cellH * 0.30, 0, 0, Math.PI * 2);
            ctx.fill();

            // Cytoplasmic transvacuolar strands
            ctx.strokeStyle = 'rgba(202, 138, 4, 0.35)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(bx + cellW * 0.8, by + cellH * 0.7);
            ctx.lineTo(bx + 18, by + cellH * 0.3);
            ctx.stroke();

            // Stained Peripheral Nucleus with Nucleolus
            const nucX = bx + cellW * 0.78;
            const nucY = by + cellH * 0.68;
            ctx.fillStyle = '#7c3aed';
            ctx.beginPath();
            ctx.arc(nucX, nucY, 8.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#312e81';
            ctx.beginPath();
            ctx.arc(nucX, nucY, 3.2, 0, Math.PI * 2);
            ctx.fill();

            // Chloroplast granules
            ctx.fillStyle = '#16a34a';
            for (let k = 0; k < 6; k++) {
              ctx.beginPath();
              ctx.arc(bx + 16 + k * 12, by + 12 + (k % 2) * 14, 3.2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

      } else if (currentSpecimen === 'animal') {
        // ── 🧬 Authentic Animal Cheek Cells (Methylene Blue Stained) ─────────
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(stageX - cx - 50, stageY - cy - 50, w + 100, h + 100);

        // Render scattered overlapping squamous epithelial cells
        cheekCells.forEach(cell => {
          ctx.save();
          ctx.translate(cell.x, cell.y);
          ctx.rotate(cell.rot);

          // Translucent squamous cytoplasm
          ctx.fillStyle = 'rgba(147, 197, 253, 0.32)';
          ctx.beginPath();
          ctx.ellipse(0, 0, cell.rx, cell.ry, 0, 0, Math.PI * 2);
          ctx.fill();

          // Folded/crinkled edge outlines (natural appearance of cheek scraping)
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2.2;
          ctx.stroke();

          // Margin folds
          ctx.strokeStyle = 'rgba(29, 78, 216, 0.4)';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(-cell.rx * 0.6, 0, cell.ry * 0.4, 0, Math.PI);
          ctx.stroke();

          // Prominent deep violet-blue central nucleus
          ctx.fillStyle = '#3730a3';
          ctx.beginPath();
          ctx.arc(cell.nucOffX, cell.nucOffY, 11, 0, Math.PI * 2);
          ctx.fill();

          // Nucleolus
          ctx.fillStyle = '#1e1b4b';
          ctx.beginPath();
          ctx.arc(cell.nucOffX, cell.nucOffY, 4, 0, Math.PI * 2);
          ctx.fill();

          // Cytoplasmic speckles / oral microflora dots
          ctx.fillStyle = '#64748b';
          for (let s = 0; s < 12; s++) {
            ctx.beginPath();
            ctx.arc((Math.sin(s * 3) * cell.rx * 0.7), (Math.cos(s * 4) * cell.ry * 0.7), 1.2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        });

      } else {
        // ── 🍃 Leaf Stomata Epidermal Peel (Guard Cells & Apertures) ────────
        ctx.fillStyle = '#ecfdf5';
        ctx.fillRect(stageX - cx - 50, stageY - cy - 50, w + 100, h + 100);

        // Epidermal wavy puzzle cells background
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.lineWidth = 2;
        for (let i = -3; i <= 3; i++) {
          for (let j = -3; j <= 3; j++) {
            ctx.strokeRect(i * 120 + 10, j * 120 + 10, 100, 100);
          }
        }

        // Multiple stomatal complexes distributed across the field
        stomataSites.forEach(site => {
          ctx.save();
          ctx.translate(site.x, site.y);
          ctx.rotate(site.rot);

          // Left Kidney Guard Cell
          ctx.fillStyle = '#15803d';
          ctx.beginPath();
          ctx.ellipse(-18, 0, 18, 48, -0.15, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#86efac';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Right Kidney Guard Cell
          ctx.beginPath();
          ctx.ellipse(18, 0, 18, 48, 0.15, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Thickened inner cuticular wall lining the pore
          ctx.strokeStyle = '#047857';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.ellipse(0, 0, 8, 28, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Stomatal Aperture (dark opening)
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.ellipse(0, 0, 7, 26, 0, 0, Math.PI * 2);
          ctx.fill();

          // Chloroplast granules inside guard cells
          ctx.fillStyle = '#4ade80';
          for (let g = -3; g <= 3; g++) {
            ctx.beginPath();
            ctx.arc(-18, g * 11, 3.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(18, g * 11, 3.2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Guard cell nuclei
          ctx.fillStyle = '#1e3a8a';
          ctx.beginPath();
          ctx.arc(-22, 0, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(22, 0, 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        });
      }

      ctx.restore();
      updateCoordsBadge();
    }

    // ── Mouse & Touch Dragging on Eyepiece to Slide Stage ───────────────────
    let isDraggingSlide = false;
    let startDragX = 0, startDragY = 0;

    cellCanvas.addEventListener('pointerdown', (e) => {
      isDraggingSlide = true;
      startDragX = e.clientX;
      startDragY = e.clientY;
      cellCanvas.setPointerCapture(e.pointerId);
    });

    cellCanvas.addEventListener('pointermove', (e) => {
      if (!isDraggingSlide) return;
      const dx = e.clientX - startDragX;
      const dy = e.clientY - startDragY;
      startDragX = e.clientX;
      startDragY = e.clientY;

      stageX -= dx * 0.85;
      stageY -= dy * 0.85;
      drawCellEyepiece();
    });

    const stopDrag = () => { isDraggingSlide = false; };
    cellCanvas.addEventListener('pointerup', stopDrag);
    cellCanvas.addEventListener('pointercancel', stopDrag);

    // D-Pad Stage Buttons
    const stepMicrons = 35;
    const btnUp = document.getElementById('btn-stage-up');
    const btnDown = document.getElementById('btn-stage-down');
    const btnLeft = document.getElementById('btn-stage-left');
    const btnRight = document.getElementById('btn-stage-right');

    if (btnUp) btnUp.onclick = () => { stageY -= stepMicrons; playClink(); drawCellEyepiece(); };
    if (btnDown) btnDown.onclick = () => { stageY += stepMicrons; playClink(); drawCellEyepiece(); };
    if (btnLeft) btnLeft.onclick = () => { stageX -= stepMicrons; playClink(); drawCellEyepiece(); };
    if (btnRight) btnRight.onclick = () => { stageX += stepMicrons; playClink(); drawCellEyepiece(); };

    // Focal Wheel Controls
    if (focusKnob) {
      focusKnob.oninput = (e) => {
        focusVal = parseInt(e.target.value);
        drawCellEyepiece();
        if (Math.abs(focusVal - 50) <= 6) {
          playClink();
          setObservation('Specimen in sharp focus! Slide the stage or tap organelles.', 'सूक्ष्मदर्शक यन्त्र स्पष्ट फोकस भयो!');
        }
      };
    }

    const btnCoarseMinus = document.getElementById('btn-coarse-minus');
    const btnCoarsePlus = document.getElementById('btn-coarse-plus');
    const btnFineFocus = document.getElementById('btn-fine-focus');

    if (btnCoarseMinus) btnCoarseMinus.onclick = () => {
      focusVal = Math.max(0, focusVal - 12);
      if (focusKnob) focusKnob.value = focusVal;
      playTone(250, 'sine', 0.05, 0.1);
      drawCellEyepiece();
    };
    if (btnCoarsePlus) btnCoarsePlus.onclick = () => {
      focusVal = Math.min(100, focusVal + 12);
      if (focusKnob) focusKnob.value = focusVal;
      playTone(320, 'sine', 0.05, 0.1);
      drawCellEyepiece();
    };
    if (btnFineFocus) btnFineFocus.onclick = () => {
      focusVal = 50;
      if (focusKnob) focusKnob.value = 50;
      playClink();
      playSuccess();
      drawCellEyepiece();
      setStep('Focused!', 'Specimen is 100% sharply focused! Drag on the lens or use stage calipers to explore cells.', 'कोष १००% स्पष्ट भयो! स्लाइड सारेर अरु कोषहरू हेर्नुहोस्।');
    };

    // Specimen Pills Handler
    document.querySelectorAll('.spec-pill').forEach(pill => {
      pill.onclick = () => {
        document.querySelectorAll('.spec-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentSpecimen = pill.dataset.spec;
        stageX = 0;
        stageY = 0;
        playClink();
        drawCellEyepiece();
        if (currentSpecimen === 'plant') {
          calloutTitle.textContent = 'Plant Cell (Onion Epidermal Peel)';
          calloutDesc.textContent = 'Hexagonal cellulose wall, large central vacuole, peripheral nucleus, chloroplasts.';
          speakText('Onion plant cell selected. Observe thick cell wall and central vacuole.', 'प्याजको वनस्पति कोष छनोट गरियो।');
        } else if (currentSpecimen === 'animal') {
          calloutTitle.textContent = 'Animal Cell (Cheek Squamous Epithelium)';
          calloutDesc.textContent = 'Flexible plasma membrane, dark central nucleus, centrosome, dense cytoplasm.';
          speakText('Human cheek animal cell selected. Observe prominent central nucleus.', 'मानव गालाको जनावर कोष छनोट गरियो।');
        } else {
          calloutTitle.textContent = 'Leaf Stomata (Guard Cells & Pore)';
          calloutDesc.textContent = 'Pair of kidney-shaped guard cells regulating transpiration and gas exchange.';
          speakText('Leaf stomata selected. Observe kidney shaped guard cells.', 'पातको स्टोमाटा छनोट गरियो।');
        }
      };
    });

    // Clicking inside eyepiece inspects organelles
    cellCanvas.addEventListener('click', (e) => {
      if (isDraggingSlide) return;
      playTone(850, 'triangle', 0.09, 0.2);
      if (currentSpecimen === 'plant') {
        calloutTitle.textContent = 'Plant Organelle: Cellulose Wall & Vacuole';
        calloutDesc.textContent = 'Rigid cellulose cell wall gives plant turgidity. Central vacuole maintains cellular hydrostatic pressure.';
      } else if (currentSpecimen === 'animal') {
        calloutTitle.textContent = 'Animal Organelle: Nucleus & Centrosome';
        calloutDesc.textContent = 'Prominent nucleus holds genetic chromosomes DNA. Centrosome assists spindle formation during cell division.';
      } else {
        calloutTitle.textContent = 'Stomata: Guard Cell & Stomatal Aperture';
        calloutDesc.textContent = 'Turgid guard cells open the stomatal aperture for photosynthetic CO₂ intake and O₂/water vapor release.';
      }
    });

    // ── Progressive Assembly Workflow from Clean Bench ───────────────────────
    let currentStage = 0;
    let updateRackFn = null;

    const eqItems = [
      { stage: 0, id: 'microscope', icon: '🔬', en: 'Compound Microscope', ne: 'संयुक्त सूक्ष्मदर्शक यन्त्र', descNe: 'सूक्ष्मदर्शक बेन्चमा राख्नुहोस्' },
      { stage: 1, id: 'slide', icon: '🪟', en: 'Prepared Glass Specimen Slide', ne: 'तयार पारिएको काँचको स्लाइड', descNe: 'स्लाइड स्टेजमा राखी क्लिप लगाउनुहोस्' },
      { stage: 2, id: 'mirror', icon: '🪞', en: 'Sub-stage Illuminating Mirror', ne: 'तलको प्रकाश ऐना मिलाउनुहोस्', descNe: 'प्रकाश परावर्तन गरी उज्यालो पार्ने' },
      { stage: 3, id: 'turret', icon: '🔄', en: 'Rotate Turret (40x High Power)', ne: '४०x पावर लेन्स घुमाउनुहोस्', descNe: '४०x पावर लेन्स सिधा पार्ने' },
      { stage: 4, id: 'focus', icon: '🎛️', en: 'Coarse & Fine Focal Wheel', ne: 'फोकस घुमाउने ह्विल (नब)', descNe: 'चित्र स्पष्ट नभएसम्म घुमाउने' },
      { stage: 5, id: 'calipers', icon: '↔️', en: 'Slide Stage Calipers (X-Y)', ne: 'स्लाइड सारेर अरु कोष हेर्नुहोस्', descNe: 'स्लाइडलाई चारैतिर सार्ने' }
    ];

    function executeStage(stg) {
      if (stg === 0) {
        scopeGroup.visible = true;
        playClink();
        currentStage = 1;
        setStep('2', 'Microscope placed! Pick "Prepared Glass Specimen Slide" from rack to mount on the mechanical stage.', 'सूक्ष्मदर्शक राखियो! अब र्याकबाट काँचको स्लाइड छनोट गरी स्टेजमा क्लिप लगाउनुहोस्।');
        setObservation('Compound microscope placed on bench. Ready for slide.', 'सूक्ष्मदर्शक बेन्चमा तयार।');
      } else if (stg === 1) {
        slideGroup.visible = true;
        playClink();
        currentStage = 2;
        setStep('3', 'Slide mounted! Pick "Sub-stage Illuminating Mirror" from rack to reflect light through condenser.', 'स्लाइड स्टेजमा जोडियो! अब तलको ऐना मिलाएर प्रकाश पठाउनुहोस्।');
        setObservation('Glass slide secured under mechanical stage clips.', 'स्लाइड क्लिपले बाँधियो।');
      } else if (stg === 2) {
        mirrorGroup.visible = true;
        playClink();
        currentStage = 3;
        setStep('4', 'Mirror adjusted! Pick "Rotate Turret (40x High Power)" to click objective lens into position.', 'प्रकाश मिलाइयो! अब ४०x पावरको अब्जेक्टिभ लेन्स घुमाएर मिलाउनुहोस्।');
        setObservation('Illuminating light beam shining through condenser aperture.', 'प्रकाश पर्याप्त मात्रामा पुग्यो।');
      } else if (stg === 3) {
        turretGroup.visible = true;
        playClink();
        currentStage = 4;
        if (eyepieceOverlay) eyepieceOverlay.style.display = 'flex';
        drawCellEyepiece();
        setStep('5', 'Eyepiece open! Turn the Focal Wheel (or click "Sharp") to bring blurry cells into crisp focus.', 'आइपिस खुल्यो! अब धमिलो चित्रलाई फोकस ह्विल घुमाएर स्पष्ट पार्नुहोस्।');
        setObservation('Objective lens aligned: 10x Eyepiece × 40x Objective = 400x.', '४००x म्याग्निफिकेसन तयार।');
      } else if (stg === 4) {
        focusVal = 50;
        if (focusKnob) focusKnob.value = 50;
        playClink();
        playSuccess();
        drawCellEyepiece();
        currentStage = 5;
        setStep('6', 'Image is crystal clear! Drag directly on the lens or use Stage Calipers (◀ ▲ ▼ ▶) to slide across tissue!', 'चित्र स्पष्ट भयो! अब लेन्समा तानेर वा क्यालिपर्स बटन थिचेर अरु कोषहरू अवलोकन गर्नुहोस्!');
        setObservation('Focus crisp (blur = 0px). Ready to navigate across tissue slide.', 'चित्र स्पष्ट भयो। स्लाइड सार्न सकिन्छ।');
      } else if (stg === 5) {
        stageX += 70;
        playClink();
        drawCellEyepiece();
        currentStage = 6;
        setStep('Done!', 'Tissue exploration active! Drag lens or turn calipers to inspect cells anywhere across the slide. Practical 100% complete!', 'स्लाइड सार्ने अभ्यास सफल भयो! सम्पूर्ण कोषहरू अवलोकन गर्नुहोस्।');
        setObservation('Exploring neighboring cells across continuous tissue grid.', 'स्लाइड सारेर धेरै कोषहरू अवलोकन गरियो।');
      }

      updateActionButtons();
      if (updateRackFn) updateRackFn();
    }

    function updateActionButtons() {
      const cur = eqItems[currentStage] || { en: 'Microscopy Complete!', ne: 'सूक्ष्मदर्शक प्रयोग सम्पन्न!' };
      actionsGrid.innerHTML = `
        <button class="lab-action-btn" id="btn-micro-next" ${currentStage >= 6 ? 'disabled' : ''}>
          <span>👉 Step ${currentStage + 1}: ${cur.en}</span>
          <span class="sub">${cur.ne}</span>
        </button>
        <button class="lab-action-btn btn-reset" id="btn-micro-clean">
          <span>🔄 Clean Bench</span>
          <span class="sub">खाली बेन्चबाट सुरु</span>
        </button>
      `;

      const bNext = document.getElementById('btn-micro-next');
      if (bNext && currentStage < 6) {
        bNext.onclick = () => executeStage(currentStage);
      }
      document.getElementById('btn-micro-clean').onclick = () => setupMicroscopeExperiment();
    }

    updateRackFn = renderRack(eqItems, currentStage, (item, stg) => {
      if (stg === currentStage) executeStage(stg);
      else if (stg < currentStage) setObservation(`${item.en} is already assembled on bench.`, `${item.ne} बेन्चमा राखिसकियो।`);
    });

    slidersWrap.innerHTML = `
      <div class="calc-slider-group">
        <div class="slider-label-row">
          <span>Active Objective Lens:</span>
          <span class="val">40x High Power</span>
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
      <div class="formula-title">Optical Resolution & Magnification · म्याग्निफिकेसन</div>
      <div class="formula-math">Total Power = 10x (Eyepiece) × 40x (Objective) = 400x</div>
      <div class="formula-math">Calibrated Scale: 1 Division = 2.5 µm (Microns)</div>
      <div class="formula-result">
        <span>Current Field of View:</span>
        <span>450 µm diameter</span>
      </div>
    `;

    setStep('1', 'Pick "Compound Microscope" from the equipment rack to place on your workbench.', 'उपकरण र्याकबाट संयुक्त सूक्ष्मदर्शक यन्त्र छनोट गरी बेन्चमा राख्नुहोस्।');
    setObservation('Clean laboratory bench ready. Pick microscope from rack.', 'प्रयोगशाला बेन्च तयार। सूक्ष्मदर्शक यन्त्र छनोट गर्नुहोस्।');
    updateActionButtons();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── EXPERIMENT 8: 3D Beating Human Heart & Circulation ────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  function setupHeartExperiment() {
    labGroup.clear();
    const g = new THREE.Group();
    g.position.set(0, 0.45, 0);

    // Anatomical 3D Human Heart Group
    const heartGroup = new THREE.Group();

    // 1. Realistic Myocardium Texture (muscle fiber striations + coronary vessels)
    function createMyocardiumTexture() {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 512;
      const ctx = c.getContext('2d');
      // Deep reddish-brown muscular base
      ctx.fillStyle = '#831843';
      ctx.fillRect(0, 0, 512, 512);

      // Muscle fiber striations
      ctx.strokeStyle = 'rgba(157, 23, 77, 0.45)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 512; i += 6) {
        ctx.beginPath();
        ctx.moveTo(0, i + Math.sin(i * 0.05) * 8);
        ctx.bezierCurveTo(150, i + 15, 350, i - 15, 512, i);
        ctx.stroke();
      }

      // Branching Coronary Arteries (Bright Red)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(256, 120);
      ctx.bezierCurveTo(270, 200, 230, 320, 260, 480);
      ctx.stroke();

      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(250, 220);
      ctx.bezierCurveTo(210, 250, 180, 290, 160, 380);
      ctx.moveTo(255, 310);
      ctx.bezierCurveTo(290, 340, 320, 380, 340, 440);
      ctx.stroke();

      // Branching Cardiac Veins (Royal Blue)
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(270, 140);
      ctx.bezierCurveTo(290, 210, 260, 310, 280, 470);
      ctx.stroke();

      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(275, 240);
      ctx.bezierCurveTo(320, 270, 350, 320, 360, 410);
      ctx.stroke();

      // Pericardial fat deposits (golden yellow patches)
      ctx.fillStyle = 'rgba(253, 224, 71, 0.35)';
      for (let p = 0; p < 18; p++) {
        ctx.beginPath();
        ctx.arc(180 + (p * 17) % 180, 140 + (p * 23) % 120, 12 + (p % 8), 0, Math.PI * 2);
        ctx.fill();
      }

      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    }

    const muscleMat = new THREE.MeshStandardMaterial({
      map: createMyocardiumTexture(),
      roughness: 0.35,
      metalness: 0.15,
      bumpScale: 0.05
    });

    // 2. Anatomical Ventricles (Left & Right sculpted myocardium)
    const leftVentricle = new THREE.Mesh(new THREE.SphereGeometry(0.78, 24, 24), muscleMat);
    leftVentricle.scale.set(0.9, 1.35, 0.85);
    leftVentricle.rotation.z = -0.22;
    leftVentricle.position.set(0.18, 0.75, 0);
    heartGroup.add(leftVentricle);

    const rightVentricle = new THREE.Mesh(new THREE.SphereGeometry(0.68, 24, 24), muscleMat);
    rightVentricle.scale.set(0.85, 1.25, 0.8);
    rightVentricle.rotation.z = 0.25;
    rightVentricle.position.set(-0.35, 0.72, 0.1);
    heartGroup.add(rightVentricle);

    // Heart Apex (pointed bottom of left ventricle)
    const apexGeo = new THREE.ConeGeometry(0.35, 0.6, 20);
    const apex = new THREE.Mesh(apexGeo, muscleMat);
    apex.rotation.x = Math.PI;
    apex.rotation.z = -0.2;
    apex.position.set(0.08, 0.05, 0);
    heartGroup.add(apex);

    // 3. Atria (Left & Right Auricles)
    const rightAtrium = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 20), new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4 }));
    rightAtrium.position.set(-0.55, 1.75, -0.05);
    heartGroup.add(rightAtrium);

    const leftAtrium = new THREE.Mesh(new THREE.SphereGeometry(0.52, 20, 20), new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 }));
    leftAtrium.position.set(0.5, 1.75, -0.1);
    heartGroup.add(leftAtrium);

    // 4. Ascending Aorta & Curving Aortic Arch (Red, with 3 Branch Arteries)
    const aortaMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25, metalness: 0.2 });
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, 1.5, 0.1),
      new THREE.Vector3(0.12, 2.2, 0.05),
      new THREE.Vector3(-0.05, 2.65, 0.0),
      new THREE.Vector3(-0.45, 2.55, -0.2),
      new THREE.Vector3(-0.55, 1.8, -0.3)
    ]);
    const aorta = new THREE.Mesh(new THREE.TubeGeometry(aortaCurve, 28, 0.19, 16, false), aortaMat);
    heartGroup.add(aorta);

    // 3 Branch Arteries from Arch: Brachiocephalic, Left Common Carotid, Left Subclavian
    const branchOffsets = [-0.18, 0.0, 0.18];
    branchOffsets.forEach((bx, idx) => {
      const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.45, 12), aortaMat);
      branch.position.set(bx, 2.82, -0.05);
      branch.rotation.z = (idx - 1) * 0.15;
      heartGroup.add(branch);
    });

    // 5. Pulmonary Trunk & Arteries (Blue bifurcation to left/right lungs)
    const pulmMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3, metalness: 0.2 });
    const pulmTrunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 1.45, 0.25),
      new THREE.Vector3(-0.12, 2.05, 0.2),
      new THREE.Vector3(-0.18, 2.35, 0.0)
    ]);
    const pulmTrunk = new THREE.Mesh(new THREE.TubeGeometry(pulmTrunkCurve, 20, 0.17, 16, false), pulmMat);
    heartGroup.add(pulmTrunk);

    // Left & Right pulmonary branch branches
    const pulmLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.65, 12), pulmMat);
    pulmLeft.rotation.z = Math.PI / 2.8;
    pulmLeft.position.set(0.25, 2.28, -0.1);
    heartGroup.add(pulmLeft);

    const pulmRight = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.65, 12), pulmMat);
    pulmRight.rotation.z = -Math.PI / 2.8;
    pulmRight.position.set(-0.55, 2.28, -0.1);
    heartGroup.add(pulmRight);

    // 6. Superior & Inferior Vena Cava (Blue veins entering right atrium)
    const venaMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.35 });
    const supVena = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.9, 16), venaMat);
    supVena.position.set(-0.65, 2.3, -0.2);
    heartGroup.add(supVena);

    const infVena = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 16), venaMat);
    infVena.position.set(-0.62, 0.8, -0.2);
    heartGroup.add(infVena);

    // 7. Pulmonary Veins (4 red veins entering left atrium)
    for (let pv = 0; pv < 4; pv++) {
      const pVein = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12), aortaMat);
      pVein.rotation.z = Math.PI / 2;
      pVein.position.set(0.72, 1.65 + (pv % 2) * 0.22, -0.25 + Math.floor(pv / 2) * 0.25);
      heartGroup.add(pVein);
    }

    // 8. Animated Circulatory Blood Flow Particles (Oxygenated & Deoxygenated)
    const bloodParticles = new THREE.Group();
    for (let bp = 0; bp < 35; bp++) {
      const isOxy = bp % 2 === 0;
      const pMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        new THREE.MeshBasicMaterial({ color: isOxy ? 0xef4444 : 0x38bdf8 })
      );
      pMesh.position.set((Math.random() - 0.5) * 1.2, 0.4 + Math.random() * 2.2, (Math.random() - 0.5) * 0.8);
      bloodParticles.add(pMesh);
    }
    heartGroup.add(bloodParticles);

    g.add(heartGroup);
    labGroup.add(g);

    let bpm = 72;
    let strokeVol = 70; // mL
    let heartInterval = null;

    // Dual-stage Anatomical Heartbeat Contraction (Atrial Systole ➔ Ventricular Systole)
    function beat() {
      playHeartbeatSound();
      // 1. Atria contract
      rightAtrium.scale.set(0.85, 0.85, 0.85);
      leftAtrium.scale.set(0.85, 0.85, 0.85);

      setTimeout(() => {
        // 2. Ventricles contract forcefully (Ventricular Systole)
        rightAtrium.scale.set(1.0, 1.0, 1.0);
        leftAtrium.scale.set(1.0, 1.0, 1.0);

        leftVentricle.scale.set(0.82, 1.2, 0.78);
        rightVentricle.scale.set(0.78, 1.15, 0.74);
        apex.scale.set(0.85, 0.85, 0.85);

        // Aorta expands with blood surge
        aorta.scale.set(1.12, 1.0, 1.12);

        setTimeout(() => {
          // 3. Complete Diastolic relaxation
          leftVentricle.scale.set(0.9, 1.35, 0.85);
          rightVentricle.scale.set(0.85, 1.25, 0.8);
          apex.scale.set(1.0, 1.0, 1.0);
          aorta.scale.set(1.0, 1.0, 1.0);
        }, 160);
      }, 130);
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
        <div class="formula-title">Cardiac Physiology & Double Circulation · दोहोरो रक्तसञ्चार</div>
        <div class="formula-math">Cardiac Output (CO) = Heart Rate (HR) × Stroke Volume (SV)</div>
        <div class="formula-math">Pulmonary Circuit: Right Ventricle ➔ Lungs ➔ Left Atrium</div>
        <div class="formula-math">Systemic Circuit: Left Ventricle ➔ Body ➔ Right Atrium</div>
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
      { stage: 0, id: 'vent', icon: '❤️', en: 'Muscular Left & Right Ventricles', ne: 'बायाँ र दायाँ भेन्ट्रिकल', descNe: 'रगत पम्प गर्ने मुख्य भाग' },
      { stage: 1, id: 'aorta', icon: '🔴', en: 'Ascending Aorta & 3 Branch Trunks', ne: 'महाधमनी र ३ मुख्य शाखाहरू', descNe: 'शरीरभरि अक्सिजनयुक्त रगत पठाउने' },
      { stage: 2, id: 'pulm', icon: '🔵', en: 'Pulmonary Trunk & Vena Cava', ne: 'पल्मोनरी धमनी र महाशिरा', descNe: 'फोक्सो र मुटुबीच रगत लैजाने' }
    ];

    renderRack(eqItems, 2, (item) => {
      playClink();
      setObservation(`Anatomy: ${item.en}`, `${item.ne} मुटुको संरचना।`);
    });

    setStep('1', 'Observe authentic 3D heart anatomy with coronary arteries, aortic arch branches, and lub-dub heartbeat!', 'वास्तविक मुटुको ३D संरचना, कोरोनरी रक्तनली र धड्कन अवलोकन गर्नुहोस्!');
    setObservation('Normal Resting Heart Rate: 72 BPM | Cardiac Output: ~5.04 Liters/min.', 'सामान्य अवस्थामा मुटु प्रतिमिनेट ७२ पटक धड्किन्छ।');

    actionsGrid.innerHTML = `
      <button class="lab-action-btn" id="btn-exercise-pulse">
        <span>🏃 Simulate Physical Exercise (120 BPM)</span>
        <span class="sub">व्यायाम गर्दाको मुटुको गति र रक्तसञ्चार</span>
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
      setStep('High Cardiac Output!', 'During exercise, cardiac output surges to 10.2 L/min to oxygenate working muscles!', 'व्यायाम गर्दा मुटुले प्रतिमिनेट १० लिटरभन्दा बढी रगत पम्प गर्छ!');
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
    g.position.set(0, 0.1, 0);

    // Human Digestive Anatomy Group
    const digestiveGroup = new THREE.Group();

    // 1. Semi-transparent Torso Silhouette for anatomical context
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.12,
      wireframe: true
    });
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.2, 3.6, 20), torsoMat);
    torso.position.y = 1.6;
    digestiveGroup.add(torso);

    // 2. Oral Cavity & Tongue & Salivary Glands
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.6 });
    const oralCavity = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), mouthMat);
    oralCavity.position.set(0, 3.1, 0.15);
    digestiveGroup.add(oralCavity);

    // Salivary Glands (Parotid, Submandibular)
    const salivaryMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.7 });
    const parotid = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), salivaryMat);
    parotid.position.set(0.35, 3.05, 0.1);
    digestiveGroup.add(parotid);

    // 3. Pharynx and Muscular Tubular Esophagus
    const esoMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 });
    const esoCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2.95, 0.15),
      new THREE.Vector3(0, 2.45, 0.05),
      new THREE.Vector3(0, 1.95, 0.0),
      new THREE.Vector3(-0.08, 1.65, 0.05)
    ]);
    const esophagus = new THREE.Mesh(new THREE.TubeGeometry(esoCurve, 20, 0.075, 14, false), esoMat);
    digestiveGroup.add(esophagus);

    // 4. Anatomical J-Shaped Stomach (Greater & Lesser Curvature, Fundus, Pylorus)
    const stomachMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.45, metalness: 0.1 });
    const stomachCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, 1.65, 0.05), // Cardiac notch
      new THREE.Vector3(-0.45, 1.55, 0.15), // Fundus
      new THREE.Vector3(-0.55, 1.25, 0.1),  // Greater curvature body
      new THREE.Vector3(-0.25, 1.05, 0.08), // Antrum
      new THREE.Vector3(0.05, 1.12, 0.05)   // Pyloric sphincter
    ]);
    const stomach = new THREE.Mesh(new THREE.TubeGeometry(stomachCurve, 24, 0.22, 16, false), stomachMat);
    digestiveGroup.add(stomach);

    // 5. Dual-lobed Liver & Gallbladder
    const liverMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.5 });
    const rightLobe = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.8, 16), liverMat);
    rightLobe.rotation.z = Math.PI / 3;
    rightLobe.rotation.y = 0.3;
    rightLobe.position.set(0.48, 1.5, 0.08);
    digestiveGroup.add(rightLobe);

    const leftLobe = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.55, 16), liverMat);
    leftLobe.rotation.z = -Math.PI / 4;
    leftLobe.position.set(0.08, 1.6, 0.12);
    digestiveGroup.add(leftLobe);

    // Emerald Green Gallbladder tucked under liver
    const gallMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.3 });
    const gallbladder = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), gallMat);
    gallbladder.scale.set(0.8, 1.4, 0.8);
    gallbladder.position.set(0.38, 1.28, 0.22);
    digestiveGroup.add(gallbladder);

    // 6. Lobulated Pancreas in Duodenal C-Loop
    const pancMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.7 });
    const pancreas = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.14, 0.14), pancMat);
    pancreas.position.set(-0.05, 1.05, -0.05);
    pancreas.rotation.z = -0.15;
    digestiveGroup.add(pancreas);

    // 7. C-Shaped Duodenum
    const duodMat = new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.5 });
    const duodCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, 1.12, 0.05),
      new THREE.Vector3(0.35, 1.05, 0.05),
      new THREE.Vector3(0.32, 0.85, 0.05),
      new THREE.Vector3(0.0, 0.82, 0.05)
    ]);
    const duodenum = new THREE.Mesh(new THREE.TubeGeometry(duodCurve, 16, 0.11, 12, false), duodMat);
    digestiveGroup.add(duodenum);

    // 8. Coiled Small Intestine (Jejunum & Ileum mesentery loops)
    const smallIntestineGroup = new THREE.Group();
    const siMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.6 });
    for (let si = 0; si < 8; si++) {
      const loop = new THREE.Mesh(new THREE.TorusGeometry(0.24 + (si % 3) * 0.06, 0.075, 12, 20), siMat);
      loop.position.set((si % 3 - 1) * 0.22, 0.55 + Math.floor(si / 3) * 0.16, 0.08 + (si % 2) * 0.06);
      loop.rotation.x = Math.PI / 2 + (si * 0.3);
      smallIntestineGroup.add(loop);
    }
    digestiveGroup.add(smallIntestineGroup);

    // 9. Complete Large Intestine (Colon with Haustra pouches)
    const colonMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.65 });
    // Cecum & Appendix
    const cecum = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.35, 14), colonMat);
    cecum.position.set(0.65, 0.35, 0.1);
    digestiveGroup.add(cecum);

    const appendix = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.22), new THREE.MeshStandardMaterial({ color: 0x78350f }));
    appendix.position.set(0.72, 0.18, 0.1);
    appendix.rotation.z = -0.4;
    digestiveGroup.add(appendix);

    // Ascending Colon
    const ascColon = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.75, 14), colonMat);
    ascColon.position.set(0.65, 0.85, 0.1);
    digestiveGroup.add(ascColon);

    // Transverse Colon
    const transColon = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.25, 14), colonMat);
    transColon.rotation.z = Math.PI / 2;
    transColon.position.set(0, 1.25, 0.15);
    digestiveGroup.add(transColon);

    // Descending Colon & Sigmoid & Rectum
    const descColon = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.85, 14), colonMat);
    descColon.position.set(-0.65, 0.8, 0.1);
    digestiveGroup.add(descColon);

    const sigmoidCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.65, 0.35, 0.1),
      new THREE.Vector3(-0.4, 0.15, 0.05),
      new THREE.Vector3(0.0, 0.08, -0.05),
      new THREE.Vector3(0.0, -0.2, -0.05) // Rectum
    ]);
    const sigmoid = new THREE.Mesh(new THREE.TubeGeometry(sigmoidCurve, 18, 0.15, 14, false), colonMat);
    digestiveGroup.add(sigmoid);

    // 10. Glowing Animated Food Bolus & Chyme Particle
    const bolusMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x22c55e, roughness: 0.2 });
    const bolus = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), bolusMat);
    bolus.position.set(0, 3.1, 0.15);
    digestiveGroup.add(bolus);

    g.add(digestiveGroup);
    labGroup.add(g);

    let bolusStage = 0;
    const bolusTrajectory = [
      { pos: [0, 3.1, 0.15], organ: 'Mouth Cavity / मुख', en: 'Mouth: Teeth masticate food, Salivary Amylase digests starch into maltose.', ne: 'मुख: दाँतले चपाउने र र्‍यालको एमाइलेजले स्टार्चलाई माल्टोजमा परिणत गर्छ।' },
      { pos: [0, 2.2, 0.08], organ: 'Esophagus / ग्रसनली', en: 'Esophagus: Peristaltic involuntary muscular contractions propel bolus downward.', ne: 'ग्रसनली: पेरिस्टाल्सिस मांसपेशी खुम्चिने चालले खाना आमाशयतिर लैजान्छ।' },
      { pos: [-0.4, 1.35, 0.12], organ: 'Stomach / आमाशय', en: 'Stomach: Gastric juice (HCl + Pepsin) digests proteins into peptones; churns food into chyme.', ne: 'आमाशय: हाइड्रोक्लोरिक एसिड र पेप्सिनले प्रोटिनलाई पेप्टोनमा बदल्छ।' },
      { pos: [0.18, 0.95, 0.05], organ: 'Duodenum & Liver / कलेजो र पित्त', en: 'Duodenum: Bile from gallbladder emulsifies lipids; Pancreatic enzymes break down nutrients.', ne: 'डुओडेनम: पित्तले चिल्लो पदार्थ टुक्र्याउँछ र प्यान्क्रियाजको रस मिसिन्छ।' },
      { pos: [0.0, 0.55, 0.12], organ: 'Small Intestine / सानो आन्द्रा', en: 'Small Intestine: Millions of microvilli absorb digested amino acids, glucose, and fatty acids into blood.', ne: 'सानो आन्द्रा: भिल्लाईमार्फत पोषक तत्वहरू रगतमा सोसिन्छन्।' },
      { pos: [0.65, 0.65, 0.1], organ: 'Large Intestine / ठूलो आन्द्रा', en: 'Large Intestine (Colon): Absorbs water & mineral salts; compacts undigested waste into feces.', ne: 'ठूलो आन्द्रा: पानी र खनिज सोसेर नपचेको फोहोरलाई दिसामा परिणत गर्छ।' }
    ];

    slidersWrap.innerHTML = `
      <div class="calc-slider-group">
        <div class="slider-label-row">
          <span>Active Digestive Station:</span>
          <span class="val" id="bolus-pos-tag">Mouth Cavity</span>
        </div>
      </div>
    `;

    formulaBox.innerHTML = `
      <div class="formula-title">Biochemical Enzyme Digestion · पाचन इन्जाइमहरू</div>
      <div class="formula-math">Starch ──(Salivary Amylase)──➔ Maltose</div>
      <div class="formula-math">Protein ──(Stomach Pepsin / HCl)──➔ Peptones ──(Trypsin)──➔ Amino Acids</div>
      <div class="formula-math">Lipids ──(Liver Bile Salt Emulsion)──➔ Fatty Acids + Glycerol</div>
      <div class="formula-result">
        <span>Absorption Site:</span>
        <span>Small Intestine Villi (90% Nutrient Uptake)</span>
      </div>
    `;

    const eqItems = [
      { stage: 0, id: 'mouth', icon: '👄', en: 'Oral Cavity & Salivary Glands', ne: 'मुख र र्‍याल ग्रन्थी', descNe: 'एमाइलेजले स्टार्च पाचन' },
      { stage: 1, id: 'stomach', icon: '🫄', en: 'J-Shaped Stomach (HCl & Pepsin)', ne: 'आमाशय (पेट)', descNe: 'प्रोटिन पाचन' },
      { stage: 2, id: 'liver', icon: '🫀', en: 'Liver, Gallbladder & Pancreas', ne: 'कलेजो, पित्तथैली र प्यान्क्रियाज', descNe: 'पित्तरस र इन्जाइम' },
      { stage: 3, id: 'intestine', icon: '➰', en: 'Small & Large Intestine Villi', ne: 'सानो र ठूलो आन्द्रा', descNe: 'पोषक तत्व शोषण' }
    ];

    renderRack(eqItems, 3, (item) => {
      playClink();
      setObservation(`Anatomy: ${item.en}`, `${item.ne} पाचन प्रणाली।`);
    });

    setStep('1', 'Observe authentic 3D human digestive tract and click "Advance Food Bolus" to trace chemical digestion!', 'मानव पाचन प्रणालीको वास्तविक ३D संरचना हेर्नुहोस् र खानाको डल्लो अगाडि बढाउनुहोस्!');
    setObservation('Digestive Anatomy: Mouth, Esophagus, Stomach, Liver, Duodenum, Small & Large Intestine.', 'पाचन प्रणालीका सम्पूर्ण अंगहरू तयार।');

    actionsGrid.innerHTML = `
      <button class="lab-action-btn" id="btn-bolus-step">
        <span>🍔 Swallow & Advance Food Bolus</span>
        <span class="sub">खानालाई अर्को पाचन अंगमा पठाउनुहोस्</span>
      </button>
      <button class="lab-action-btn btn-reset" id="btn-bolus-reset">
        <span>🔄 Restart Digestive Journey</span>
        <span class="sub">सुरुबाट</span>
      </button>
    `;

    document.getElementById('btn-bolus-step').onclick = () => {
      bolusStage = (bolusStage + 1) % bolusTrajectory.length;
      const target = bolusTrajectory[bolusStage];
      bolus.position.set(target.pos[0], target.pos[1], target.pos[2]);
      playPourSound();
      playSuccess();
      setStep(`Stage ${bolusStage + 1}: ${target.organ}`, target.en, target.ne);
      setObservation(target.en, target.ne);
      const tag = document.getElementById('bolus-pos-tag');
      if (tag) tag.textContent = target.organ;
    };
    document.getElementById('btn-bolus-reset').onclick = () => setupDigestiveExperiment();
  }

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
