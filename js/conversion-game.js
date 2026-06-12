// Number to words conversion
const numberWords = [
    'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
    'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciseis', 'diecisiete', 'dieciocho', 'diecinueve'
];

const tensWords = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const hundredsWords = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

function toWords(value) {
    if (value < 20) return numberWords[value];
    if (value < 100) {
        const tens = Math.floor(value / 10);
        const ones = value % 10;
        return ones ? `${tensWords[tens]} y ${numberWords[ones]}` : tensWords[tens];
    }
    if (value === 100) return 'cien';
    if (value < 1000) {
        const hundreds = Math.floor(value / 100);
        const rest = value % 100;
        return rest ? `${hundredsWords[hundreds]} ${toWords(rest)}` : hundredsWords[hundreds];
    }
    if (value === 10000) return 'diez mil';
    const thousands = Math.floor(value / 1000);
    const rest = value % 1000;
    const prefix = thousands === 1 ? 'mil' : `${toWords(thousands)} mil`;
    return rest ? `${prefix} ${toWords(rest)}` : prefix;
}

// Shared utilities
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function normalizeText(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, ' ');
}

// Music and sound paths
const musicPaths = {
    easy: 'sonidos (4to)/Void_Explorer.ogg',
    hard: 'sonidos (4to)/Congratulations,_you_beat_the_Tutorial.ogg',
    symphony: 'sonidos (4to)/Won\'t_you_hear_my_Symphony_.mp3',
    findYourFlame: 'sonidos (4to)/Find-your-Flame.mp3',
    inescapable: 'sonidos (4to)/AudioInescapable.ogg',
    practice: 'sonidos (4to)/Conviction_(feat._SPIRIT_GARDEN_).ogg',
    failure: 'sonidos (4to)/Subspace-Sequence.mp3'
};

const cadencePaths = {
    lv1: 'sonidos (4to)/Cad_lv1.wav',
    lv2: 'sonidos (4to)/Cad_lv2.wav',
    lv3: 'sonidos (4to)/Cad_lv3.wav',
    lv4: 'sonidos (4to)/Cad_lv4.wav'
};

const soundEffectPaths = {
    success: 'sonidos (4to)/Bell_Player_Contact_Sound.wav',
    error: 'sonidos (4to)/Baby_Alarm.ogg'
};

function chooseHardTrack() {
    if (state.activeHardTrack) return state.activeHardTrack;
    state.activeHardTrack = Math.random() < 0.5 ? 'symphony' : 'hard';
    return state.activeHardTrack;
}

function isExtremeFlameCandidate() {
    if (typeof state.difficulty === 'string') {
        return state.difficulty === 'extremo' && (state.passiveDifficulty >= 9.5 || state.lives === 1);
    }
    return state.difficulty > 0.7 && (state.difficulty >= 0.99 || state.lives === 1);
}

function activateFindYourFlame() {
    if (state.findYourFlameActive) return;
    state.findYourFlameActive = true;
    state.findYourFlamePhase = null;
    document.body.classList.add('flame-epic');
}

function clearFindYourFlameEffects() {
    document.body.classList.remove('flame-epic', 'flame-epic-purple', 'flame-epic-gold');
    state.findYourFlameActive = false;
    state.findYourFlamePhase = null;
}

function updateFindYourFlamePhase(audio) {
    if (!audio || !state.findYourFlameActive) return;
    if (audio.currentTime >= 53 && state.findYourFlamePhase !== 'gold') {
        state.findYourFlamePhase = 'gold';
        document.body.classList.add('flame-epic-gold');
        document.body.classList.remove('flame-epic-purple');
    } else if (audio.currentTime >= 31 && state.findYourFlamePhase !== 'purple') {
        state.findYourFlamePhase = 'purple';
        document.body.classList.add('flame-epic-purple');
    }
}

function shouldPlayFindYourFlame() {
    return state.findYourFlameActive || isExtremeFlameCandidate();
}

const difficultyLevels = {
    casual: 0.28,
    normal: 0.56,
    extremo: 0.86
};

function highlightDifficultyButtons() {
    if (!dom.difficultyBtns || !dom.difficultyBtns.length) return;
    dom.difficultyBtns.forEach((button) => {
        button.classList.toggle('active', button.dataset.difficulty === state.selectedDifficulty);
    });
}

function setDifficulty(level) {
    if (!difficultyLevels[level]) return;
    state.selectedDifficulty = level;
    state.difficulty = difficultyLevels[level];
    if (level === 'extremo') {
        activateFindYourFlame();
    } else if (state.findYourFlameActive && !isExtremeFlameCandidate()) {
        clearFindYourFlameEffects();
    }
    dom.feedbackLine.textContent = `Dificultad: ${level.toUpperCase()}.`;
    renderDifficultyStatus();
    highlightDifficultyButtons();
    if (typeof updateHud === 'function') updateHud();
    if (typeof updateMusic === 'function') updateMusic();
}

function initializeDifficultyControls() {
    if (!dom.difficultyBtns || !dom.difficultyBtns.length) return;
    dom.difficultyBtns.forEach((button) => {
        button.addEventListener('click', () => {
            const level = button.dataset.difficulty;
            setDifficulty(level);
            dom.difficultyModal.classList.add('hidden');
            state.difficultyConfirmed = true;
            if (state.tempMode) {
                startMode(state.tempMode);
            }
        });
    });
    if (!state.selectedDifficulty) {
        state.selectedDifficulty = 'casual';
    }
    setDifficulty(state.selectedDifficulty);
}

// DOM references
const dom = {
    avatarPresence: document.getElementById('avatar-presence'),
    selectedAvatarIcon: document.getElementById('selected-avatar-icon'),
    selectedAvatarLabel: document.getElementById('selected-avatar-label'),
    selectedPlayerName: document.getElementById('selected-player-name'),
    modeButtons: document.querySelectorAll('.mode-card'),
    gameModeBtn: document.getElementById('game-mode-btn'),
    gameLockText: document.getElementById('game-lock-text'),
    modeLabel: document.getElementById('mode-label'),
    gameTitle: document.getElementById('game-title'),
    shieldsContainer: document.getElementById('shields-container'),
    timerCount: document.getElementById('timer-count'),
    scoreCount: document.getElementById('score-count'),
    stage: document.getElementById('exercise-stage'),
    responsePanel: document.getElementById('response-panel'),
    restartBtn: document.getElementById('restart-btn'),
    exitGameBtn: document.getElementById('exit-game-btn'),
    feedbackLine: document.getElementById('feedback-line'),
    learningModal: document.getElementById('learning-modal'),
    difficultyModal: document.getElementById('difficulty-modal'),
    difficultyBtns: document.querySelectorAll('.difficulty-btn'),
    closeLearningModalBtn: document.getElementById('close-learning-modal')
};

// Game state
const state = {
    mode: null,
    current: null,
    lives: 3,
    errors: 0,
    score: 0,
    streak: 0,
    correctCount: 0,
    difficulty: 0.42,
    selectedMaldiciones: [],
    activeCurse: null,
    curseTimer: 0,
    secondsLeft: 300,
    timer: null,
    audio: {},
    activeTrack: null,
    cadenceTrack: null,
    activeHardTrack: null,
    findYourFlameActive: false,
    findYourFlamePhase: null,
    failed: false,
    tutorialShown: false,
    tempMode: null,
    difficultyConfirmed: false
};

function applyMaldicion(maldicion) {
    if (!maldicion) return;
    if (maldicion === 'numeros-mas-complejos') {
        state.difficulty = clamp(state.difficulty + 0.5, 0.22, 1.2);
    }
    if (maldicion === 'bomba-de-tiempo') {
        state.secondsLeft = Math.min(state.secondsLeft, 20);
    }
}

function getDifficultyTier() {
    if (state.difficulty > 0.7) return 'EXTREMO';
    if (state.difficulty > 0.45) return 'NORMAL';
    return 'CASUAL';
}

function getDifficultyDescription() {
    if (state.difficulty > 0.7) return 'Convierte números más grandes y responde rápido.';
    if (state.difficulty > 0.45) return 'Más números y menos tiempo para pensar.';
    return 'Escribe con calma y repasa números pequeños.';
}

function renderDifficultyStatus() {
    const badge = document.getElementById('difficulty-badge');
    const banner = document.getElementById('status-banner');
    if (badge) {
        const tier = getDifficultyTier();
        badge.textContent = tier;
        badge.className = `status-badge ${tier.toLowerCase()}`;
    }
    if (banner) {
        banner.textContent = state.activeCurse ? `Maldición activa: ${state.activeCurse.title}` : getDifficultyDescription();
    }
}

function getAvailableCurses() {
    return [
        { id: 'memoriza', title: 'Memoriza', desc: 'El campo se bloquea después de un momento.' },
        { id: 'bomba-de-tiempo', title: 'Bomba de tiempo', desc: 'Menos tiempo para escribir cada respuesta.' },
        { id: 'confusion', title: 'Confusión', desc: 'Los números pueden verse diferentes en la pantalla.' }
    ];
}

function maybeAssignCurse() {
    if (state.mode !== 'juego' || state.activeCurse || state.correctCount === 0) return;
    if (state.correctCount % 6 !== 0) return;
    const curses = getAvailableCurses();
    const choice = curses[randomInt(0, curses.length - 1)];
    state.activeCurse = choice;
    state.selectedMaldiciones = [choice.id];
    dom.feedbackLine.textContent = `Nueva maldición: ${choice.title}. ${choice.desc}`;
}

function setupSwipeControls() {
    const container = dom.stage;
    if (!container) return;
    let startX = null;
    let startY = null;
    container.addEventListener('touchstart', (event) => {
        if (!event.touches || !event.touches.length) return;
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
    });
    container.addEventListener('touchend', (event) => {
        if (startX === null || !event.changedTouches || !event.changedTouches.length) return;
        const endX = event.changedTouches[0].clientX;
        const dx = endX - startX;
        if (Math.abs(dx) > 50) {
            document.querySelector('#conversion-input')?.focus();
        }
        startX = null;
        startY = null;
    });
    container.addEventListener('mousedown', (event) => {
        startX = event.clientX;
        startY = event.clientY;
    });
    container.addEventListener('mouseup', (event) => {
        if (startX === null) return;
        const dx = event.clientX - startX;
        if (Math.abs(dx) > 50) {
            document.querySelector('#conversion-input')?.focus();
        }
        startX = null;
        startY = null;
    });
}

// Storage key for conversion game scores
const STORAGE_KEY = 'conversionGameScore';

function getStoredScore() {
    return Number(localStorage.getItem(STORAGE_KEY) || 0);
}

function setStoredScore(score) {
    localStorage.setItem(STORAGE_KEY, String(Math.max(getStoredScore(), score)));
}

function updateGameLock() {
    const unlocked = getStoredScore() >= 25;
    dom.gameModeBtn.classList.toggle('locked', !unlocked);
    dom.gameLockText.textContent = unlocked ? 'Desbloqueado: modo infinito.' : 'Bloqueado: necesitas 25 puntos en prueba.';
}

function renderAvatarPresence() {
    dom.avatarPresence.innerHTML = Object.entries(enemies).map(([key, enemy], index) => `
        <img
            class="presence-avatar presence-${index % 5}"
            src="${enemy.animation || enemy.icon}"
            alt=""
            data-enemy="${key}"
        >
    `).join('');
}

function setupPlayer() {
    const identity = sessionStorage.getItem('grade4Identity') || 'Visitante';
    const enemyKey = sessionStorage.getItem('grade4Enemy') || 'baby';
    const enemy = enemies[enemyKey] || enemies.baby;
    dom.selectedPlayerName.textContent = identity;
    dom.selectedAvatarLabel.textContent = enemy.label;
    dom.selectedAvatarIcon.src = enemy.icon;
    dom.selectedAvatarIcon.alt = enemy.label;
}

function playTrack(trackName) {
    if (state.activeTrack === trackName) return;
    if (state.findYourFlameActive && trackName !== 'findYourFlame') {
        clearFindYourFlameEffects();
    }
    Object.values(state.audio).forEach((audio) => audio.pause());
    if (!state.audio[trackName]) {
        state.audio[trackName] = new Audio(musicPaths[trackName]);
        state.audio[trackName].volume = trackName === 'findYourFlame' ? 0.22 : 0.15;
        state.audio[trackName].loop = trackName !== 'findYourFlame';
        if (trackName === 'findYourFlame') {
            state.audio[trackName].addEventListener('timeupdate', () => updateFindYourFlamePhase(state.audio[trackName]));
            state.audio[trackName].addEventListener('ended', () => {
                if (isExtremeFlameCandidate()) {
                    state.audio[trackName].currentTime = 0;
                    state.audio[trackName].play().catch(() => {});
                } else {
                    clearFindYourFlameEffects();
                    state.activeTrack = null;
                    updateMusic();
                }
            });
        }
    }
    state.activeTrack = trackName;
    if (trackName === 'findYourFlame') activateFindYourFlame();
    state.audio[trackName].play().catch(() => {});
}

function playSoundEffect(effectName) {
    const audio = new Audio(soundEffectPaths[effectName]);
    audio.volume = 0.3;
    audio.play().catch(() => {});
}

function playCadenceTrack(level) {
    if (state.cadenceTrack === level) return;
    if (state.audio[`cadence-${state.cadenceTrack}`]) {
        state.audio[`cadence-${state.cadenceTrack}`].pause();
    }
    const trackPath = cadencePaths[level];
    if (!state.audio[`cadence-${level}`]) {
        state.audio[`cadence-${level}`] = new Audio(trackPath);
        state.audio[`cadence-${level}`].loop = true;
        state.audio[`cadence-${level}`].volume = 0.08;
    }
    state.cadenceTrack = level;
    state.audio[`cadence-${level}`].play().catch(() => {});
}

function updateMusic() {
    if (state.failed) {
        playTrack('failure');
        return;
    }
    if (state.mode === 'aprendizaje') {
        playTrack('practice');
        return;
    }
    if (shouldPlayFindYourFlame()) {
        playTrack('findYourFlame');
    } else if (state.correctCount >= 50 && state.difficulty > 0.78) {
        playTrack('inescapable');
    } else {
        playTrack(state.difficulty > 0.68 ? chooseHardTrack() : 'easy');
    }
    if (state.mode !== 'aprendizaje') {
        if (state.secondsLeft >= 240) {
            playCadenceTrack('lv1');
        } else if (state.secondsLeft >= 180) {
            playCadenceTrack('lv2');
        } else if (state.secondsLeft >= 60) {
            playCadenceTrack('lv3');
        } else {
            playCadenceTrack('lv4');
        }
    }
}

function updateShields() {
    dom.shieldsContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const shield = document.createElement('img');
        shield.src = 'img (4to)/Shield.png';
        shield.className = 'shield-icon';
        shield.alt = 'escudo';
        if (i >= state.lives) {
            shield.classList.add('hidden');
        }
        dom.shieldsContainer.appendChild(shield);
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function updateHud() {
    updateShields();
    dom.timerCount.textContent = formatTime(state.secondsLeft);
    dom.scoreCount.textContent = state.score;
    dom.modeLabel.textContent = state.mode ? state.mode.toUpperCase() : 'Elige un modo';
    renderDifficultyStatus();
}

function startTimer() {
    clearInterval(state.timer);
    let tickCounter = 0;
    state.timer = setInterval(() => {
        try {
            state.secondsLeft -= 1;
            updateHud();
            tickCounter += 1;
            if (tickCounter % 5 === 0) updateMusic();
            if (state.secondsLeft <= 0) {
                triggerFailure();
            }
        } catch (e) {
            console.error('Timer error', e);
            clearInterval(state.timer);
        }
    }, 1000);
}

function chooseChallengingValue(minVal, maxVal) {
    let value = randomInt(minVal, maxVal);
    for (let i = 0; i < 12; i += 1) {
        const isTooRound = value % 100 === 0 || value % 1000 === 0 || value % 10 === 0;
        if (state.difficulty > 0.8 && (value < 1000 || isTooRound)) {
            value = randomInt(minVal, maxVal);
            continue;
        }
        if (state.difficulty > 0.72 && value % 1000 === 0) {
            value = randomInt(minVal, maxVal);
            continue;
        }
        break;
    }
    if (value < minVal) value = minVal;
    if (value > maxVal) value = maxVal;
    return value;
}

function buildConversionExercise() {
    const minVal = state.difficulty > 0.7 ? 1000 : 1;
    const maxVal = state.difficulty > 0.75 ? 10000 : 5000;
    const value = chooseChallengingValue(minVal, maxVal);
    const useWords = Math.random() > (state.difficulty > 0.8 ? 0.4 : 0.5);

    if (useWords) {
        return {
            type: 'conversion',
            prompt: `Escribe en numerales: ${toWords(value)}`,
            placeholder: 'Escribe el numero',
            answer: String(value),
            answerFormat: 'digits'
        };
    }
    return {
        type: 'conversion',
        prompt: `Escribe en palabras: ${value}`,
        placeholder: 'Escribe en palabras',
        answer: normalizeText(toWords(value)),
        answerFormat: 'words'
    };
}

function renderExercise() {
    maybeAssignCurse();
    const exercise = buildConversionExercise();
    state.current = exercise;
    
    dom.stage.innerHTML = `
        <div class="conversion-box">
            <p>${exercise.prompt}</p>
        </div>
        <div class="difficulty-panel">
            <span id="difficulty-badge" class="status-badge"></span>
            <span id="status-banner" class="status-banner"></span>
        </div>
        <div class="swipe-hint">Escribe tu respuesta o usa el teclado. Arrastra para centrar el campo.</div>
    `;
    
    renderResponseControls('conversion', exercise);
}

function renderResponseControls(type, payload = {}) {
    dom.responsePanel.innerHTML = '';
    if (type === 'conversion') {
        dom.responsePanel.innerHTML = `
            <div class="conversion-input-row">
                <input id="conversion-input" type="text" placeholder="${payload.placeholder}" autocomplete="off">
                <button id="conversion-submit" class="action-btn continue-btn" type="button">Verificar</button>
            </div>
        `;
        dom.responsePanel.querySelector('#conversion-submit').addEventListener('click', () => {
            const value = document.querySelector('#conversion-input').value;
            submitConversion(value);
        });
        
        // Enter key support
        document.querySelector('#conversion-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const value = document.querySelector('#conversion-input').value;
                submitConversion(value);
            }
        });
        const selected = state.selectedMaldiciones || [];
        if (selected.includes('memoriza')) {
            setTimeout(() => {
                const input = document.querySelector('#conversion-input');
                if (input) { input.value = ''; input.disabled = true; input.placeholder = '...'; }
            }, 8000);
        }
    }
}

function submitConversion(value) {
    if (!state.current || state.current.type !== 'conversion') return;
    const trimmed = normalizeText(value);
    const expected = state.current.answerFormat === 'words' ? state.current.answer : normalizeText(state.current.answer);
    const isCorrect = trimmed === expected;
    // bomba-de-tiempo: if active, reset timer on correct
    const selected = state.selectedMaldiciones || [];
    if (isCorrect && selected.includes('bomba-de-tiempo')) state.secondsLeft = 20;
    answer(isCorrect ? 'correcto' : 'incorrecto');
}

function showCompletionOverlay() {
    const existing = document.querySelector('.celebration-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';
    overlay.innerHTML = `
        <div class="celebration-card">
            <h2>¡Excelente trabajo!</h2>
            <p class="stats">Tu puntaje: <strong>${state.score}</strong> &nbsp;|&nbsp; Errores: <strong>${state.errors || 0}</strong></p>
            <p class="congrats">¡Muy bien hecho! Sigue practicando para mejorar aún más.</p>
            <div class="celebration-actions">
                <button id="celebration-close" class="action-btn">Cerrar</button>
                <button id="celebration-restart" class="action-btn">Jugar de nuevo</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    launchConfetti(100);

    const closeBtn = document.getElementById('celebration-close');
    const restartBtn = document.getElementById('celebration-restart');

    function removeOverlay() {
        overlay.remove();
    }

    if (closeBtn) closeBtn.addEventListener('click', removeOverlay);
    if (restartBtn) restartBtn.addEventListener('click', () => {
        removeOverlay();
        startMode(state.mode || 'juego');
    });
}

function launchConfetti(amount = 60) {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    for (let i = 0; i < amount; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        const size = Math.random() * 10 + 6;
        el.style.width = `${size}px`;
        el.style.height = `${size * 0.6}px`;
        el.style.background = `hsl(${Math.floor(Math.random() * 360)},70%,60%)`;
        el.style.left = `${Math.random() * 100}%`;
        el.style.top = `-10%`;
        el.style.transform = `rotate(${Math.random() * 360}deg)`;
        el.style.opacity = `${0.9 - Math.random() * 0.4}`;
        container.appendChild(el);
        setTimeout(() => el.remove(), 5500 + Math.random() * 2000);
    }
    setTimeout(() => container.remove(), 8000);
}

function showLightConfetti() {
    try {
        const container = document.createElement('div');
        container.className = 'confetti-container light';
        document.body.appendChild(container);
        for (let i = 0; i < 8; i++) {
            const el = document.createElement('div');
            el.className = 'confetti-piece';
            const size = Math.random() * 8 + 4;
            el.style.width = `${size}px`;
            el.style.height = `${size * 0.6}px`;
            el.style.background = `hsl(${Math.floor(Math.random() * 360)},70%,65%)`;
            el.style.left = `${50 + (Math.random() - 0.5) * 20}%`;
            el.style.top = `${40 + (Math.random() - 0.5) * 10}%`;
            el.style.transform = `rotate(${Math.random() * 360}deg)`;
            container.appendChild(el);
            setTimeout(() => el.remove(), 1600 + Math.random() * 800);
        }
        setTimeout(() => container.remove(), 2600);
    } catch (e) { console.error('light confetti failed', e); }
}

function loseLife(message) {
    state.lives -= 1;
    state.streak = 0;
    state.difficulty = clamp(state.difficulty - 0.08, 0.22, 0.9);
    if (state.lives <= 0) {
        triggerFailure();
        return;
    }
    dom.feedbackLine.textContent = message;
    updateHud();
    updateMusic();
    renderExercise();
}

function triggerFailure() {
    state.failed = true;
    clearInterval(state.timer);
    playTrack('failure');
    dom.feedbackLine.textContent = 'Fallido. No puedes rendirte! íbamos excelente! sigue luchando contra el VACIO!';
    dom.stage.innerHTML = `
        <div class="failure-box">
            <h2>FALLIDO</h2>
            <p>No puedes rendirte! íbamos excelente! sigue luchando contra el <strong style="color:purple">VACIO</strong>!</p>
        </div>
    `;
    dom.responsePanel.innerHTML = '';
}

function answer(symbol) {
    if (!state.current || !state.mode || state.failed) return;
    
    const isCorrect = symbol === 'correcto';
    
    if (isCorrect) {
        playSoundEffect('success');
        try {
            showLightConfetti();
        } catch (e) { console.error('confetti error', e); }
        state.score += state.mode === 'aprendizaje' ? 1 : 3;
        state.streak += 1;
        state.correctCount += 1;
        state.difficulty = clamp(state.difficulty + (state.streak >= 3 ? 0.06 : 0.025), 0.22, 0.92);
        dom.feedbackLine.textContent = 'Correcto. Tu avatar mantiene la ruta estable.';
        if (state.mode === 'prueba') setStoredScore(state.score);
        if (state.mode === 'juego' && state.correctCount % 10 === 0) state.lives = clamp(state.lives + 1, 1, 3);
    } else {
        playSoundEffect('error');
        state.errors = (state.errors || 0) + 1;
        loseLife('Casi. Mira bien y responde otra vez.');
        updateGameLock();
        updateHud();
        updateMusic();
        return;
    }

    if (state.mode === 'prueba') setStoredScore(state.score);
    if (state.correctCount >= 25 && state.mode === 'prueba') {
        showCompletionOverlay();
    } else {
        renderExercise();
    }
    updateGameLock();
    updateHud();
    updateMusic();
}

function startMode(mode) {
    if (mode === 'juego' && getStoredScore() < 25) {
        dom.feedbackLine.textContent = 'Juego sigue bloqueado. Consigue 25 puntos en prueba.';
        return;
    }
    if (mode !== 'aprendizaje' && !state.difficultyConfirmed) {
        state.tempMode = mode;
        dom.difficultyModal.classList.remove('hidden');
        return;
    }
    state.mode = mode;
    state.difficultyConfirmed = mode !== 'aprendizaje';
    state.lives = 3;
    state.score = 0;
    state.streak = 0;
    state.correctCount = 0;
    state.difficulty = state.selectedDifficulty ? difficultyLevels[state.selectedDifficulty] : (mode === 'juego' ? 0.76 : 0.42);
    state.secondsLeft = mode === 'juego' ? 600 : 300;
    state.failed = false;
    state.errors = 0;
    dom.restartBtn.disabled = false;
    dom.exitGameBtn.disabled = false;
    document.querySelectorAll('.mode-card').forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
    
    if (mode === 'aprendizaje' && !state.tutorialShown) {
        state.tutorialShown = true;
        dom.learningModal.classList.remove('hidden');
        return;
    }
    
    updateHud();
    updateMusic();
    startTimer();
    renderExercise();
}

// Event listeners
if (dom.closeLearningModalBtn) {
    dom.closeLearningModalBtn.addEventListener('click', () => {
        dom.learningModal.classList.add('hidden');
        updateHud();
        updateMusic();
        startTimer();
        renderExercise();
    });
}

dom.modeButtons.forEach((button) => {
    button.addEventListener('click', () => startMode(button.dataset.mode));
});

dom.restartBtn.addEventListener('click', () => {
    if (dom.restartBtn.disabled) return;
    startMode(state.mode);
});

dom.exitGameBtn.addEventListener('click', () => {
    if (dom.exitGameBtn.disabled) return;
    window.location.href = 'index.html';
});

// Initialize
renderAvatarPresence();
setupPlayer();
initializeDifficultyControls();
updateGameLock();
updateHud();
setupSwipeControls();
