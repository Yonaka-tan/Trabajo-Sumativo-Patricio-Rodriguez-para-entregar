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

function compare(a, b) {
    if (a > b) return '>';
    if (a < b) return '<';
    return '=';
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
    failure: 'sonidos (4to)/Subspace-Sequence.mp3',
    intermission: 'sonidos (4to)/Subspace-Sequence.mp3'
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

function getDifficultyTier() {
    if (state.difficulty > 0.7) return 'EXTREMO';
    if (state.difficulty > 0.45) return 'NORMAL';
    return 'CASUAL';
}

function highlightDifficultyButtons() {
    if (!dom.difficultyBtns || !dom.difficultyBtns.length) return;
    dom.difficultyBtns.forEach((button) => {
        button.classList.toggle('active', button.dataset.difficulty === state.selectedDifficulty);
    });
}

function renderDifficultyStatus() {
    const badge = document.getElementById('difficulty-badge');
    const banner = document.getElementById('status-banner');
    const tier = getDifficultyTier();
    if (badge) {
        badge.textContent = tier;
        badge.className = `status-badge ${tier.toLowerCase()}`;
    }
    if (banner) {
        banner.textContent = state.mode === 'juego' ? 'Desafío mixto con progreso dinámico.' : 'Elige tu experiencia para comenzar.';
    }
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
    updateHud();
    updateMusic();
}

function initializeDifficultyControls() {
    if (!dom.difficultyBtns || !dom.difficultyBtns.length) return;
    dom.difficultyBtns.forEach((button) => {
        button.addEventListener('click', () => {
            const level = button.dataset.difficulty;
            setDifficulty(level);
            dom.difficultyModal.classList.add('hidden');
            state.difficultyConfirmed = true;
            startGame();
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
    modeLabel: document.getElementById('mode-label'),
    gameTitle: document.getElementById('game-title'),
    shieldsContainer: document.getElementById('shields-container'),
    timerCount: document.getElementById('timer-count'),
    scoreCount: document.getElementById('score-count'),
    exerciseUntilCount: document.getElementById('exercise-until-count'),
    stage: document.getElementById('exercise-stage'),
    responsePanel: document.getElementById('response-panel'),
    restartBtn: document.getElementById('restart-btn'),
    exitGameBtn: document.getElementById('exit-game-btn'),
    feedbackLine: document.getElementById('feedback-line'),
    learningModal: document.getElementById('learning-modal'),
    difficultyModal: document.getElementById('difficulty-modal'),
    difficultyBtns: document.querySelectorAll('.difficulty-btn'),
    closeLearningModalBtn: document.getElementById('close-learning-modal'),
    intermissionPanel: document.getElementById('intermission-panel'),
    intermissionOptions: document.getElementById('intermission-options'),
    intermissionRerollBtn: document.getElementById('intermission-reroll'),
    intermissionContinueBtn: document.getElementById('intermission-continue'),
    enemyToggle: document.getElementById('enemy-toggle'),
    intermissionPoints: document.getElementById('intermission-points'),
    intermissionStreak: document.getElementById('intermission-streak'),
    intermissionUntil: document.getElementById('intermission-until'),
    effectTag: document.getElementById('effect-tag')
};

// Enemy effects instance (created if enemy-effects.js is available)
let enemyEffects = null;
try {
    if (typeof createEnemyEffects === 'function') {
        const left = document.getElementById('enemy-left');
        const right = document.getElementById('enemy-right');
        enemyEffects = createEnemyEffects({
            root: document.body,
            stageLeft: left,
            stageRight: right,
            toolsHost: document.body,
            getEnemy: (key) => enemies[key]
        });
    }
} catch (e) {
    console.warn('enemyEffects init failed', e);
}

// Listen to enemy hit events emitted by enemy-effects and apply game consequences
if (typeof document !== 'undefined') {
    document.addEventListener('enemy-hit', (ev) => {
        if (state.intermissionActive) return;
        const info = ev.detail || {};
        state._lastEnemyHit = state._lastEnemyHit || {};
        const now = performance.now();
        // respect temporary immunity windows (e.g., after Mart disables mouse)
        if (state._immuneUntil && now < state._immuneUntil) return;
        const last = state._lastEnemyHit[info.enemy] || 0;
        if (now - last < 800) return; // debounce rapid hits
        state._lastEnemyHit[info.enemy] = now;

        if (info.enemy === 'telefragger') {
            if (info.altosNervios) {
                const { minDiff, maxDiff } = getPassiveDifficultyRange();
                state.passiveDifficulty = maxDiff;
            }
            loseLife('Telefragger te alcanzó.');
            updateHud();
            updateMusic();
            showAttackIndicator('telefragger');
        } else if (info.enemy === 'husk') {
            loseLife('Husk te tocó.');
            updateHud();
            updateMusic();
            showAttackIndicator('husk');
        } else if (info.enemy === 'mart') {
            state.secondsLeft = Math.max(0, state.secondsLeft - (info.timePenalty || 20));
            dom.feedbackLine.textContent = 'Mart te golpea: pierdes tiempo.';
            // disable player input / give short immunity to avoid repeated immediate hits
            state._immuneUntil = now + 3000;
            state.mouseDisabledUntil = now + 3000;
            updateHud();
            updateMusic();
            showAttackIndicator('mart');
        } else if (info.enemy === 'icbm') {
            const dmg = info.damage || 1;
            dom.feedbackLine.textContent = '¡ICBM explotó!';
            for (let i = 0; i < dmg; i += 1) {
                loseLife('ICBM te alcanzó.');
            }
            updateHud();
            updateMusic();
            showAttackIndicator('icbm');
        }
    });
}

function showAttackIndicator(enemyKey) {
    try {
        const container = document.getElementById('active-enemies');
        const enemy = enemies[enemyKey] || { label: enemyKey, icon: 'Maldiciones img/Baby icono.png' };
        if (!container) return;
        // create pill
        const id = `active-enemy-${enemyKey}-${Date.now()}`;
        const pill = document.createElement('div');
        pill.className = 'active-enemy-pill attack';
        pill.id = id;
        pill.innerHTML = `<img src="${enemy.animation || enemy.icon || 'Maldiciones img/Baby icono.png'}" alt="${enemy.label || enemyKey}"><strong style="font-size:0.9rem;color:#fff">${enemyKey}</strong>`;
        container.appendChild(pill);
        // highlight presence avatar if exists
        const presence = document.querySelector(`.avatar-presence [data-enemy="${enemyKey}"]`);
        if (presence) {
            presence.classList.add('attacking');
            setTimeout(() => presence.classList.remove('attacking'), 1200);
        }
        setTimeout(() => {
            pill.classList.remove('attack');
            try { pill.remove(); } catch (e) {}
        }, 1400);
    } catch (e) { /* ignore */ }
}

// Game state
const state = {
    mode: 'juego',
    current: null,
    lives: 3,
    errors: 0,
    score: 0,
    streak: 0,
    correctCount: 0,
    difficulty: 0.84,
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
    selectedDifficulty: 'casual',
    difficultyConfirmed: false,
    activeEnemy: null,
    debugMode: false,
    intermissionActive: false,
    intermissionSelection: { enemy: null, maldicion: null },
    intermissionNeedsEnemy: true,
    intermissionNeedsMaldicion: true
};

// Intermission / maldiciones defaults
state.passiveDifficulty = 5;
state.exercisesUntilIntermission = 7;
state.intermissionFrequency = 7;
state.intermissionCount = 0;
state.selectedMaldiciones = [];
state.selectedEnemy = null;
state.rerollsRemaining = 3;
state.freeRerollThisIntermission = true;
state.activeMaldicion = null;
state.enemyHorde = false;
state.upgrades = {};

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
    if (state.intermissionActive) {
        playTrack('intermission');
        return;
    }
    if (shouldPlayFindYourFlame()) {
        playTrack('findYourFlame');
    } else if (state.correctCount >= 100 && state.difficulty > 0.88) {
        playTrack('inescapable');
    } else {
        playTrack(state.difficulty > 0.78 ? chooseHardTrack() : 'easy');
    }
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
    if (dom.exerciseUntilCount) {
        dom.exerciseUntilCount.textContent = state.exercisesUntilIntermission;
    }
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

function randomStep() {
    if (state.difficulty > 0.8) return [100, 200, 250, 500][randomInt(0, 3)];
    if (state.difficulty > 0.6) return [20, 25, 50, 100][randomInt(0, 3)];
    return [5, 10, 20, 50][randomInt(0, 3)];
}

function buildComparisonPair() {
    const maxA = state.difficulty > 0.85 ? 12000 : state.difficulty > 0.68 ? 10000 : 8000;
    const a = randomInt(0, maxA);
    if (Math.random() < 0.04) return { a, b: a };

    let spread;
    if (state.difficulty > 0.85) {
        spread = randomInt(1, Math.max(1, Math.floor(Math.max(a, 10) * randomInt(1, 8) / 100)));
    } else if (state.difficulty > 0.68) {
        spread = randomInt(1, Math.max(1, Math.floor(Math.max(a, 10) * randomInt(8, 18) / 100)));
    } else {
        spread = Math.floor(a * randomInt(20, 80) / 100) + randomInt(12, 600);
    }

    const direction = Math.random() > 0.5 ? 1 : -1;
    let b = clamp(a + spread * direction, 0, 10000);
    if (state.difficulty > 0.85 && Math.random() < 0.5) {
        const sameLast = a % 10;
        const adjust = Math.min(spread || 1, 50);
        b = clamp(a + adjust * direction, 0, 10000);
        const remainder = ((b % 10) + 10) % 10;
        b += sameLast - remainder;
        b = clamp(b, 0, 10000);
    }
    if (b === a) {
        b = clamp(a + (direction * Math.max(1, spread)), 0, 10000);
    }
    return { a, b };
}

function generateRectaOptions(correct, step, cap, desired) {
    const options = new Set([correct]);
    let attempts = 0;
    while (options.size < desired && attempts < 80) {
        let candidate;
        const version = Math.random();
        if (version < 0.35) {
            const multiplier = randomInt(1, Math.min(5, Math.max(1, Math.floor(cap / Math.max(1, Math.abs(step)) / 50))));
            candidate = correct + multiplier * step * (Math.random() > 0.5 ? 1 : -1);
        } else if (version < 0.7) {
            const base = [10, 20, 25, 50, 75, 100, 125, 250][randomInt(0, 7)];
            candidate = correct + base * (Math.random() > 0.5 ? 1 : -1);
        } else {
            const sameLast = correct % 10;
            const delta = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90][randomInt(0, 9)];
            candidate = correct + (Math.random() > 0.5 ? delta : -delta);
            const remainder = ((candidate % 10) + 10) % 10;
            candidate += sameLast - remainder;
        }
        if (Math.abs(step) >= 10 && Math.random() < 0.25) {
            candidate += Math.round(step / 2) * (Math.random() > 0.5 ? 1 : -1);
        }
        candidate = Math.round(candidate);
        candidate = clamp(candidate, 0, cap);
        if (candidate !== correct) options.add(candidate);
        attempts += 1;
    }
    return Array.from(options).slice(0, desired).sort(() => Math.random() - 0.5);
}

function buildRectaExercise() {
    const step = randomStep();
    const diff = state.difficulty > 0.8 ? 8.5 : state.difficulty > 0.6 ? 6.5 : 4.5;
    const length = diff > 7.5 ? 7 : 6;
    const maxStart = Math.max(0, 10000 - step * (length - 1));
    let start = randomInt(0, maxStart);
    if (diff > 0.6 && Math.random() < 0.6) {
        start = Math.max(1, start - (start % randomInt(3, 9)) + randomInt(1, 9));
    }
    if (diff > 0.8 && Math.random() < 0.55) {
        start = randomInt(Math.max(0, Math.floor(maxStart * 0.25)), maxStart);
        if (start % 10 === 0) start += randomInt(1, 9);
    }
    const sequence = Array.from({ length }, (_, index) => start + index * step);
    const missingIndex = randomInt(1, length - 2);
    const correct = sequence[missingIndex];
    const cap = 10000;
    const options = generateRectaOptions(correct, step, cap, 4);
    return {
        type: 'recta',
        sequence,
        missingIndex,
        step,
        options,
        answer: String(correct),
        note: `La secuencia avanza con paso de ${step}.`
    };
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
    return clamp(value, minVal, maxVal);
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

function generateVerifyWrongValue(value) {
    const steps = [1, 2, 5, 10, 20, 50, 100];
    const base = steps[randomInt(0, Math.min(steps.length - 1, state.difficulty > 0.85 ? 6 : 4))];
    const delta = base * randomInt(1, state.difficulty > 0.85 ? 4 : 9);
    const candidate = clamp(value + (Math.random() > 0.5 ? delta : -delta), 1, 10000);
    return candidate === value ? clamp(value + (base || 1), 1, 10000) : candidate;
}

function buildVerifyExercise() {
    const minVal = state.difficulty > 0.7 ? 1000 : 1;
    const maxVal = state.difficulty > 0.75 ? 10000 : 5000;
    const value = chooseChallengingValue(minVal, maxVal);
    const correct = Math.random() < Math.min(0.55 + state.difficulty * 0.25, 0.85);
    let written = toWords(value);

    if (!correct) {
        const wrongValue = generateVerifyWrongValue(value);
        written = toWords(wrongValue);
    }

    const showNumberFirst = Math.random() > 0.4;
    return {
        type: 'verificacion',
        promptTop: showNumberFirst ? value : written,
        promptBottom: showNumberFirst ? written : value,
        answer: correct ? 'si' : 'no',
        note: showNumberFirst
            ? '¿Esta palabra representa el numero correctamente?'
            : '¿Este numero esta escrito correctamente?'
    };
}

function renderExercise() {
    const types = ['comparison', 'recta', 'conversion', 'verificacion'];
    const randomType = types[randomInt(0, types.length - 1)];
    
    let exercise;
    if (randomType === 'recta') {
        exercise = buildRectaExercise();
    } else if (randomType === 'conversion') {
        exercise = buildConversionExercise();
    } else if (randomType === 'verificacion') {
        exercise = buildVerifyExercise();
    } else {
        const pair = buildComparisonPair();
        exercise = { ...pair, type: 'comparison', answer: compare(pair.a, pair.b) };
    }
    
    state.current = exercise;

    // NIL reveal / disorganize logic
    try {
        if (enemyEffects && (state.activeEnemy === 'nil' || state.activeMaldicion === 'mas-nil' || state.activeMaldicion === 'nil-eterno')) {
            const baseProb = state.activeMaldicion === 'mas-nil' ? (1/3) : 0.2;
            const reveal = Math.random() < baseProb || state.activeMaldicion === 'nil-eterno';
            if (reveal) {
                state._nilTemp = state._nilTemp || {};
                state._nilTemp.revealed = true;
                try { enemyEffects.start('nil', { avatar: null }); } catch (e) {}
                // If multiple-choice options, add a false option or shuffle
                if (exercise.options && Array.isArray(exercise.options)) {
                    const fake = String(clamp(Number(exercise.answer) + (Math.random() > 0.5 ? randomInt(1, 50) : -randomInt(1, 50)), 0, 10000));
                    exercise.options.push(fake);
                    // shuffle
                    for (let i = exercise.options.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [exercise.options[i], exercise.options[j]] = [exercise.options[j], exercise.options[i]];
                    }
                } else {
                    // For freeform/verification, temporarily bump difficulty for this exercise
                    state._nilTemp.bumpedDifficulty = state.difficulty;
                    state.difficulty = 0.95;
                }
                // hide nil after short moment
                setTimeout(() => {
                    try { enemyEffects.reset(); } catch (e) {}
                }, 3600);
            }
        }
    } catch (e) { console.error('nil reveal failed', e); }
    
    if (exercise.type === 'comparison') {
        dom.stage.innerHTML = `
            <div class="comparison-table">
                <div><span>Numero A</span><strong>${exercise.a}</strong></div>
                <div class="unknown-symbol">?</div>
                <div><span>Numero B</span><strong>${exercise.b}</strong></div>
            </div>
            <p>¿Qué símbolo va en el medio?</p>
        `;
        renderResponseControls('comparison');
    } else if (exercise.type === 'recta') {
        const sequenceHTML = exercise.sequence.map((value, index) => {
            if (index === exercise.missingIndex) {
                return '<span class="sequence-item missing">?</span>';
            }
            return `<span class="sequence-item">${value}</span>`;
        }).join('<span class="sequence-separator">,</span>');
        
        dom.stage.innerHTML = `
            <div class="sequence-box">
                <div class="sequence-row">${sequenceHTML}</div>
            </div>
            <p>${exercise.note}</p>
        `;
        renderResponseControls('recta', exercise.options);
    } else if (exercise.type === 'conversion') {
        dom.stage.innerHTML = `
            <div class="conversion-box">
                <p>${exercise.prompt}</p>
            </div>
        `;
        renderResponseControls('conversion', exercise);
    } else if (exercise.type === 'verificacion') {
        dom.stage.innerHTML = `
            <div class="verification-box">
                <div class="verification-row"><strong>${exercise.promptTop}</strong></div>
                <div class="verification-row lighter"><strong>${exercise.promptBottom}</strong></div>
            </div>
            <p>${exercise.note}</p>
        `;
        renderResponseControls('verify');
    }
}

function renderResponseControls(type, payload) {
    dom.responsePanel.innerHTML = '';
    
    if (type === 'comparison') {
        dom.responsePanel.innerHTML = `
            <div class="answer-row">
                <button type="button" data-answer=">">&gt;</button>
                <button type="button" data-answer="=">=</button>
                <button type="button" data-answer="<">&lt;</button>
            </div>
        `;
        dom.responsePanel.querySelectorAll('button').forEach((button) => {
            button.addEventListener('click', () => answer(button.dataset.answer));
        });
    } else if (type === 'recta') {
        dom.responsePanel.innerHTML = `<div class="options-row">${payload.map((value) => `<button type="button" class="action-btn continue-btn" data-answer="${value}">${value}</button>`).join('')}</div>`;
        dom.responsePanel.querySelectorAll('button').forEach((button) => {
            button.addEventListener('click', () => answer(button.dataset.answer));
        });
    } else if (type === 'conversion') {
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
        document.querySelector('#conversion-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const value = document.querySelector('#conversion-input').value;
                submitConversion(value);
            }
        });
    } else if (type === 'verify') {
        dom.responsePanel.innerHTML = `
            <div class="options-row">
                <button type="button" class="action-btn continue-btn" data-answer="si">SI</button>
                <button type="button" class="action-btn back-btn" data-answer="no">NO</button>
            </div>
        `;
        dom.responsePanel.querySelectorAll('button').forEach((button) => {
            button.addEventListener('click', () => answer(button.dataset.answer));
        });
    }
}

function submitConversion(value) {
    if (!state.current || state.current.type !== 'conversion') return;
    const trimmed = normalizeText(value);
    if (trimmed === 'debug') {
        state.debugMode = true;
        dom.feedbackLine.textContent = 'Debug activado: intermisión forzada tras cada ejercicio.';
        return;
    }
    const expected = state.current.answerFormat === 'words' ? state.current.answer : normalizeText(state.current.answer);
    const isCorrect = trimmed === expected;
    answer(isCorrect ? 'correcto' : 'incorrecto');
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
    state.difficulty = clamp(state.difficulty - 0.06, 0.76, 0.95);
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
    dom.feedbackLine.textContent = 'Fallido. ¡Fue un buen intento! Tu puntaje: ' + state.score;
    dom.stage.innerHTML = `
        <div class="failure-box">
            <h2>FALLIDO</h2>
            <p>Puntaje final: <strong>${state.score}</strong></p>
            <p>Errores cometidos: <strong>${state.errors || 0}</strong></p>
        </div>
    `;
    dom.responsePanel.innerHTML = '';
}

function answer(symbol) {
    if (!state.current || state.failed) return;
    
    let isCorrect = false;
    if (symbol === 'correcto') {
        isCorrect = true;
    } else if (symbol === 'incorrecto') {
        isCorrect = false;
    } else {
        isCorrect = symbol === state.current.answer;
    }
    
    if (isCorrect) {
        playSoundEffect('success');
        try {
            showLightConfetti();
        } catch (e) { console.error('confetti error', e); }
        state.score += 5;
        state.streak += 1;
        state.correctCount += 1;
        state.difficulty = clamp(state.difficulty + (state.streak >= 3 ? 0.05 : 0.02), 0.76, 0.95);
        dom.feedbackLine.textContent = 'Correcto. Tu avatar mantiene la ruta estable.';
        if (state.correctCount % 10 === 0) state.lives = clamp(state.lives + 1, 1, 3);
    } else {
        playSoundEffect('error');
        state.errors = (state.errors || 0) + 1;
        const intermissionStarted = decrementExerciseCounter();
        loseLife('Casi. Mira bien y responde otra vez.');
        updateHud();
        updateMusic();
        if (intermissionStarted && !state.failed) {
            return;
        }
        return;
    }

    if (state.streak >= 10 && !state.findYourFlameActive) {
        activateFindYourFlame();
        dom.feedbackLine.textContent = '¡Find Your Flame se activa! Mantente encendido hasta la intermisión.';
    }

    const intermissionStarted = decrementExerciseCounter();
    if (intermissionStarted) {
        updateHud();
        updateMusic();
        return;
    }

    renderExercise();
    updateHud();
    updateMusic();

    // revert temporary NIL difficulty bump if present
    if (state._nilTemp && state._nilTemp.bumpedDifficulty !== undefined) {
        state.difficulty = state._nilTemp.bumpedDifficulty;
        delete state._nilTemp.bumpedDifficulty;
    }
    if (state._nilTemp && state._nilTemp.revealed) {
        delete state._nilTemp.revealed;
    }
}

function renderEffectStatus() {
    let text = 'Sin maldición activa';
    if (state.activeMaldicion) {
        text = `Maldición: ${state.activeMaldicion.replace(/-/g, ' ')}`;
    }
    if (state.activeEnemy) {
        const enemyLabel = enemies[state.activeEnemy] ? enemies[state.activeEnemy].label : state.activeEnemy;
        if (text !== 'Sin maldición activa') text += ` + Enemigo: ${enemyLabel}`;
        else text = `Enemigo: ${enemyLabel}`;
    } else if (state.enemyHorde) {
        text = state.activeMaldicion ? `${text} + Enemigos` : 'Enemigos activos';
    }
    if (dom.effectTag) {
        dom.effectTag.textContent = text;
        dom.effectTag.classList.toggle('active', Boolean(state.activeMaldicion || state.activeEnemy || state.enemyHorde));
    }
}

function decrementExerciseCounter() {
    if (typeof state.exercisesUntilIntermission !== 'number') {
        state.exercisesUntilIntermission = state.intermissionFrequency;
    }
    if (state.debugMode) {
        state.exercisesUntilIntermission = 0;
    } else {
        state.exercisesUntilIntermission = Math.max(0, state.exercisesUntilIntermission - 1);
    }
    if (state.exercisesUntilIntermission <= 0) {
        showIntermission();
        return true;
    }
    return false;
}

function getPassiveDifficultyRange() {
    // keep passive difficulty within a fair operational range
    return { minDiff: 0, maxDiff: 9.5 };
}

const enemyMaldicionMap = {
    telefragger: [
        { id: 'altos-nervios', title: 'Altos nervios', desc: 'Telefragger se teletransporta más rápido y es más agresivo.' },
        { id: 'telefrag-oscuro', title: 'Telefrag oscuro', desc: 'Su teletransporte deja una zona de daño temporal.' }
    ],
    husk: [
        { id: 'conga-letales', title: 'Conga letal', desc: 'Se rompe en múltiples husks al acercarse.' },
        { id: 'miedo-trasero', title: 'Miedo trasero', desc: 'Aumenta el rango de detección del husk.' }
    ],
    mart: [
        { id: 'mart-amenazante', title: 'Mart amenazante', desc: 'Mart persigue más rápido y penaliza más tiempo.' },
        { id: 'mart-matematico', title: 'Mart matemático', desc: 'Mart golpea con precisión tras una secuencia.' }
    ],
    icbm: [
        { id: 'misil-realista', title: 'Misil realista', desc: 'ICBM aumenta su radio de daño y explota más fuerte.' },
        { id: 'zona-impacto', title: 'Zona de impacto', desc: 'Deja un campo de peligro durante varios segundos.' }
    ],
    operator: [
        { id: 'operacion-rapida', title: 'Operación rápida', desc: 'Operator reduce el tiempo de espera para el contraataque.' },
        { id: 'tiempo-congelado', title: 'Tiempo congelado', desc: 'Reduce la ventana de movimiento seguro.' }
    ],
    nil: [
        { id: 'nil-eterno', title: 'Nil eterno', desc: 'Las revelaciones de NIL duran más y son más confusas.' },
        { id: 'desorden-mental', title: 'Desorden mental', desc: 'Las opciones se reordenan mientras responde.' }
    ],
    bell: [
        { id: 'campana-resonante', title: 'Campana resonante', desc: 'Aumenta la punición de los errores con distorsiones.' },
        { id: 'campana-perturbadora', title: 'Campana perturbadora', desc: 'La campana altera la respuesta al equivocarse.' }
    ],
    cadence: [
        { id: 'ritmo-frenetico', title: 'Ritmo frenético', desc: 'Cadencia se acelera más y presiona el tiempo.' },
        { id: 'pulso-inestable', title: 'Pulso inestable', desc: 'La música cambia de ritmo inesperadamente.' }
    ]
};

const genericMaldiciones = [
    { id: 'numeros-mas-complejos', title: 'Números más complejos', desc: 'Aumenta la complejidad de los ejercicios.' },
    { id: 'memoriza', title: 'Memoriza', desc: 'Las alternativas desaparecen después de un tiempo.' }
];

function getAvailableMaldiciones(enemyKey) {
    const available = [...genericMaldiciones];
    if (enemyKey && enemyMaldicionMap[enemyKey]) {
        available.push(...enemyMaldicionMap[enemyKey]);
    }
    return available;
}

function formatMaldicionTitle(id) {
    const allOptions = [...genericMaldiciones, ...Object.values(enemyMaldicionMap).flat()];
    return allOptions.find((item) => item.id === id)?.title || id.replace(/-/g, ' ');
}

function applyMaldicion(maldicion) {
    state.activeMaldicion = maldicion;
    if (maldicion === 'vida') {
        state.lives = clamp(state.lives + 1, 1, 3);
        dom.feedbackLine.textContent = 'Recibiste una vida extra. Úsala bien.';
    }
    if (maldicion === 'velocidad') {
        dom.feedbackLine.textContent = 'Maldición de velocidad activa: cada respuesta te exige más rápido.';
    }
    renderEffectStatus();
}

function addOrUpgradeMaldicion(id) {
    if (!id) return;
    state.selectedMaldiciones = state.selectedMaldiciones || [];
    const base = id.replace(/^mas-/, '').replace(/-eterno$/, '');
    // If exact id already present, try upgrade to mas- prefix or -eterno
    if (state.selectedMaldiciones.includes(id)) {
        // already have exact id, attempt ultimate
        const ultimate = `${base}-eterno`;
        if (!state.selectedMaldiciones.includes(ultimate)) {
            // replace existing base/mas with ultimate
            state.selectedMaldiciones = state.selectedMaldiciones.filter(x => x !== id && x !== `mas-${base}`);
            state.selectedMaldiciones.push(ultimate);
            state.activeMaldicion = ultimate;
            return;
        }
        return;
    }
    // if have base, upgrade to mas- prefix
    if (state.selectedMaldiciones.includes(base)) {
        const mas = `mas-${base}`;
        state.selectedMaldiciones = state.selectedMaldiciones.filter(x => x !== base);
        state.selectedMaldiciones.push(mas);
        state.activeMaldicion = mas;
        return;
    }
    // if have mas-base, upgrade to ultimate
    if (state.selectedMaldiciones.includes(`mas-${base}`)) {
        const ultimate = `${base}-eterno`;
        state.selectedMaldiciones = state.selectedMaldiciones.filter(x => x !== `mas-${base}`);
        state.selectedMaldiciones.push(ultimate);
        state.activeMaldicion = ultimate;
        return;
    }
    // otherwise add new
    state.selectedMaldiciones.push(id);
    state.activeMaldicion = id;
}

function showIntermission() {
    state.intermissionCount += 1;
    state.exercisesUntilIntermission = state.intermissionFrequency;
    state.secondsLeft = 300;
    clearFindYourFlameEffects();
    // preserve the current enemy and maldición state through intermissions
    state.intermissionSelection.enemy = state.activeEnemy || null;
    state.intermissionSelection.maldicion = state.activeMaldicion || null;
    state.intermissionNeedsEnemy = state.intermissionCount % 2 === 1;
    state.intermissionNeedsMaldicion = true;
    state.enemyHorde = Boolean(state.activeEnemy);
    state.intermissionActive = true;
    state.rerollsRemaining = typeof state.rerollsRemaining === 'number' ? state.rerollsRemaining : 3;
    state.freeRerollThisIntermission = true;

    if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
    }

    if (enemyEffects) {
        enemyEffects.reset();
    }

    dom.intermissionPanel && dom.intermissionPanel.classList.remove('hidden');
    dom.intermissionPanel && dom.intermissionPanel.classList.add('active');
    dom.stage && dom.stage.classList.add('hidden');
    dom.responsePanel && dom.responsePanel.classList.add('hidden');
    if (dom.intermissionContinueBtn) dom.intermissionContinueBtn.disabled = true;
    if (dom.intermissionRerollBtn) dom.intermissionRerollBtn.disabled = false;
    updateHud();
    dom.feedbackLine.textContent = 'Intermisión abierta. Elige un enemigo y una maldición para el siguiente bloque.';

    const enemiesList = Object.keys(enemies).map((key) => ({
        id: key,
        title: enemies[key].label || key,
        img: enemies[key].animation || enemies[key].icon || 'Maldiciones img/Baby icono.png',
        desc: enemies[key].description || `Invoca al enemigo ${enemies[key].label || key} durante el siguiente bloque.`
    }));
    if (!enemiesList.find((e) => e.id === 'cadence')) enemiesList.push({ id: 'cadence', title: 'Cadence', img: 'Maldiciones img/Mas Musica.png', desc: 'Acelera el ritmo y aumenta la presión del tiempo.' });
    if (!enemiesList.find((e) => e.id === 'bell')) enemiesList.push({ id: 'bell', title: 'Bell', img: 'Maldiciones img/Campanazo desorientador.png', desc: 'Distorsiona tu enfoque si fallas o dudas.' });

    const enemyDetailMap = {
        baby: 'Baby ataca en línea recta y presiona con ruido constante. Mantén la calma y responde antes de que se acerque.',
        telefragger: 'Telefragger se teletransporta alrededor del cursor y te obliga a esquivar sus apariciones. Cada golpe reduce tu salud.',
        husk: 'Husk avanza silencioso y repetido; sus contactos cuestan vidas. Responde rápido para evitar su procresión.',
        mart: 'Mart sigue tu cursor muy de cerca. Si lo tocas, pierdes segundos y tu mouse se bloquea por un momento.',
        icbm: 'ICBM marca una zona de impacto antes de explotar. Aléjate del área amarilla para evitar daño múltiple.',
        operator: 'Operator te obliga a permanecer quieto y castiga cualquier movimiento indeseado con penalizaciones de tiempo.',
        nil: 'Nil aparece de forma errática y altera tus opciones. Puede mostrar falsos indicios y confundir tus respuestas.',
        bell: 'Bell crea distorsión visual y aumenta el castigo por errores. Sus reacciones pueden escalar rápidamente.',
        cadence: 'Cadence acelera el ritmo y reduce tu margen de respuesta. Cada segundo cuenta más durante su efecto.'
    };

    const maldicionDetailMap = {
        'numeros-mas-complejos': 'Aumenta la complejidad de los ejercicios con números mayores, fracciones y operaciones adicionales.',
        memoriza: 'Las alternativas desaparecen tras unos segundos, obligándote a memorizar la respuesta antes de elegir.',
        'altos-nervios': 'Telefragger teletransporta más frecuentemente y reduce aún más tus ventanas de escape.',
        'telefrag-oscuro': 'Las teletransportaciones de Telefragger dejan zonas de daño temporal que debes evitar.',
        'conga-letales': 'Husk se rompe en varios fragmentos cuando te acercas, multiplicando el peligro en pantalla.',
        'miedo-trasero': 'Husk aumenta su rango de detección y te presiona desde direcciones menos obvias.',
        'mart-amenazante': 'Mart se mueve más rápido y te penaliza con más tiempo cada vez que te alcanza.',
        'mart-matematico': 'Mart golpea con precisión tras una secuencia correcta, demandando respuestas aún más consistentes.',
        'misil-realista': 'ICBM aumenta su radio de daño y su explosión es más difícil de esquivar.',
        'zona-impacto': 'ICBM deja un campo de peligro persistente que te obliga a moverte del área marcada.',
        'operacion-rapida': 'Operator reduce la ventana de contraataque y exige reflejos más rápidos.',
        'tiempo-congelado': 'Operator reduce tu margen seguro de movimiento, aumentando el riesgo si te mueves mucho.',
        'nil-eterno': 'Nil permanece activo por más tiempo y sus confusiones duran más que de costumbre.',
        'desorden-mental': 'Nil reordena tus opciones mientras respondes, aumentando la dificultad de elección.',
        'campana-resonante': 'Bell amplifica su punición y distorsiona tu visión con sonidos más fuertes.',
        'campana-perturbadora': 'Bell altera la respuesta al equivocarte, haciendo el siguiente paso más desafiante.',
        'ritmo-frenetico': 'Cadence aumenta aún más su velocidad y presión, hastiendo una experiencia frenética.',
        'pulso-inestable': 'Cadence cambia de ritmo inesperadamente y rompe tu patrón de respuesta.'
    };

    function updateIntermissionHeader() {
        if (dom.intermissionPoints) dom.intermissionPoints.textContent = state.score;
        if (dom.intermissionStreak) dom.intermissionStreak.textContent = state.streak;
        if (dom.intermissionUntil) dom.intermissionUntil.textContent = state.exercisesUntilIntermission;
        if (dom.intermissionRerollBtn) dom.intermissionRerollBtn.textContent = state.freeRerollThisIntermission ? 'Rerrollear (gratis)' : `Rerrollear (${state.rerollsRemaining})`;
    }

    function updateIntermissionContinueState() {
        if (!dom.intermissionContinueBtn) return;
        const readyEnemy = !state.intermissionNeedsEnemy || Boolean(state.intermissionSelection.enemy);
        const readyMaldicion = Boolean(state.intermissionSelection.maldicion);
        dom.intermissionContinueBtn.disabled = !(readyEnemy && readyMaldicion);
    }

    function getDetailText(item) {
        if (!item) return 'Pasa el mouse por encima de una opción para ver una explicación detallada.';
        return item.detail || maldicionDetailMap[item.id] || enemyDetailMap[item.id] || item.desc || 'Selecciona esta opción para ver más información.';
    }

    function escapeAttr(value) {
        return String(value || '').replace(/"/g, '&quot;');
    }

    function setIntermissionDetail(title, text) {
        if (!dom.intermissionOptions) return;
        const detail = dom.intermissionOptions.querySelector('#intermission-detail');
        if (!detail) return;
        detail.innerHTML = `
            <div class="intermission-detail-card">
                <strong>${title}</strong>
                <p>${text}</p>
            </div>
        `;
        detail.classList.add('visible');
    }

    function renderIntermissionOptions() {
        if (!dom.intermissionOptions) return;
        const enemySection = state.intermissionNeedsEnemy
            ? `
                <div class="intermission-section">
                    <h3>Elige un enemigo</h3>
                    <p>Esta intermisión debes seleccionar un enemigo para tu run.</p>
                    <div class="intermission-option-grid">
                        ${enemiesList.map((item) => `
                            <article class="intermission-card enemy-card ${state.intermissionSelection.enemy === item.id ? 'selected' : ''}">
                                <img src="${item.img}" alt="${item.title}" onerror="this.src='Maldiciones img/Baby icono.png'">
                                <strong>${item.title}</strong>
                                <p>${item.desc}</p>
                                <button type="button" class="action-btn continue-btn select-enemy" data-id="${item.id}" data-detail-title="${escapeAttr(item.title)}" data-detail-text="${escapeAttr(getDetailText(item))}">${state.intermissionSelection.enemy === item.id ? 'Seleccionado' : 'Elegir'}</button>
                            </article>
                        `).join('')}
                    </div>
                </div>
            `
            : `
                <div class="intermission-section">
                    <h3>Enemigo activo</h3>
                    <p>Tu enemigo actual en el run es <strong>${state.activeEnemy ? enemies[state.activeEnemy]?.label : 'Ninguno'}</strong>.</p>
                </div>
            `;
        const currentEnemy = state.intermissionSelection.enemy || state.activeEnemy;
        const maldicionesList = getAvailableMaldiciones(currentEnemy);
        dom.intermissionOptions.innerHTML = `
            ${enemySection}
            <div class="intermission-section">
                <h3>Elige una maldición</h3>
                <p>${currentEnemy ? `Maldiciones disponibles para ${enemies[currentEnemy]?.label || currentEnemy}.` : 'Selecciona un enemigo para ver maldiciones específicas.'}</p>
                <div class="intermission-option-grid">
                    ${maldicionesList.map((item) => `
                        <article class="intermission-card maldicion-card ${state.intermissionSelection.maldicion === item.id ? 'selected' : ''}">
                            <strong>${item.title}</strong>
                            <p>${item.desc}</p>
                            <button type="button" class="action-btn continue-btn select-maldicion" data-id="${item.id}" data-detail-title="${escapeAttr(item.title)}" data-detail-text="${escapeAttr(getDetailText(item))}">${state.intermissionSelection.maldicion === item.id ? 'Seleccionada' : 'Elegir'}</button>
                        </article>
                    `).join('')}
                </div>
            </div>
            <div id="intermission-detail" class="intermission-detail-box">
                <div class="intermission-detail-card">
                    <strong>Información del desafío</strong>
                    <p>Pasa el mouse por encima de un enemigo o una maldición para ver una descripción detallada de su efecto.</p>
                </div>
            </div>
        `;
        dom.intermissionOptions.querySelectorAll('.select-enemy, .select-maldicion').forEach((button) => {
            button.addEventListener('click', (event) => {
                const id = event.currentTarget.dataset.id;
                if (event.currentTarget.classList.contains('select-enemy')) {
                    state.intermissionSelection.enemy = id;
                } else {
                    state.intermissionSelection.maldicion = id;
                }
                renderIntermissionOptions();
                updateIntermissionContinueState();
            });
            button.addEventListener('mouseenter', (event) => {
                setIntermissionDetail(event.currentTarget.dataset.detailTitle, event.currentTarget.dataset.detailText);
            });
            button.addEventListener('focus', (event) => {
                setIntermissionDetail(event.currentTarget.dataset.detailTitle, event.currentTarget.dataset.detailText);
            });
            button.addEventListener('mouseleave', () => {
                const detail = dom.intermissionOptions.querySelector('#intermission-detail');
                if (detail) {
                    detail.classList.remove('visible');
                }
            });
            button.addEventListener('blur', () => {
                const detail = dom.intermissionOptions.querySelector('#intermission-detail');
                if (detail) {
                    detail.classList.remove('visible');
                }
            });
        });
        updateIntermissionContinueState();
    }

    updateIntermissionHeader();
    renderIntermissionOptions();
    renderEffectStatus();
    updateMusic();

    function rerollIntermissionOptions() {
        if (state.freeRerollThisIntermission) {
            state.freeRerollThisIntermission = false;
            dom.feedbackLine.textContent = 'Reroll gratis usado.';
        } else if (state.rerollsRemaining > 0) {
            state.rerollsRemaining -= 1;
            dom.feedbackLine.textContent = `Reroll usado. Quedan: ${state.rerollsRemaining}`;
        } else {
            dom.feedbackLine.textContent = 'No te quedan rerolls.';
            return;
        }
        if (state.intermissionNeedsEnemy) {
            state.intermissionSelection.enemy = null;
        }
        state.intermissionSelection.maldicion = null;
        renderIntermissionOptions();
        updateIntermissionHeader();
    }

    if (dom.intermissionContinueBtn) {
        dom.intermissionContinueBtn.onclick = () => finishIntermission();
    }
    if (dom.intermissionRerollBtn) {
        dom.intermissionRerollBtn.onclick = rerollIntermissionOptions;
    }
}

function finishIntermission() {
    if (state.intermissionNeedsEnemy && !state.intermissionSelection.enemy) {
        dom.feedbackLine.textContent = 'Debes elegir un enemigo para continuar.';
        return;
    }
    if (!state.intermissionSelection.maldicion) {
        dom.feedbackLine.textContent = 'Debes elegir una maldición para continuar.';
        return;
    }

    state.activeEnemy = state.intermissionSelection.enemy || state.activeEnemy;
    // add or upgrade maldicion instead of duplicating
    addOrUpgradeMaldicion(state.intermissionSelection.maldicion);
    state.enemyHorde = Boolean(state.activeEnemy);
    state.secondsLeft = 300;

    applyMaldicion(state.activeMaldicion);
    const { minDiff, maxDiff } = getPassiveDifficultyRange();
    if (state.activeEnemy && enemyMaldicionMap[state.activeEnemy]?.find((item) => item.id === state.activeMaldicion)) {
        state.passiveDifficulty = clamp((state.passiveDifficulty || 5) + 0.5, minDiff, maxDiff);
    } else {
        state.passiveDifficulty = clamp((state.passiveDifficulty || 5) + 0.35, minDiff, maxDiff);
    }

    if (dom.intermissionPanel) dom.intermissionPanel.classList.add('hidden');
    dom.stage && dom.stage.classList.remove('hidden');
    dom.responsePanel && dom.responsePanel.classList.remove('hidden');
    if (dom.intermissionContinueBtn) dom.intermissionContinueBtn.disabled = true;
    state.intermissionActive = false;
    renderEffectStatus();
    updateHud();
    updateMusic();
    renderExercise();
    startTimer();

    if (enemyEffects) {
        enemyEffects.reset();
        if (state.activeEnemy) {
            const mald = [state.activeMaldicion];
            enemyEffects.start(state.activeEnemy, {
                stage: document.getElementById(state.activeEnemy === 'nil' ? 'enemy-left' : 'enemy-right'),
                maldiciones: mald,
                replace: true
            });

            if (state.activeEnemy === 'operator') {
                let lastMove = performance.now();
                let avoided = false;
                const baseWindow = 5000;
                const baseStill = 200;
                const windowMs = state.activeMaldicion === 'operacion-rapida' ? 3000 : baseWindow;
                const stillThreshold = state.activeMaldicion === 'tiempo-congelado' ? 750 : baseStill;
                const timePenalty = state.activeMaldicion === 'operacion-rapida' ? 120 : 60;

                function onMove() { lastMove = performance.now(); }
                window.addEventListener('pointermove', onMove);

                const checker = setInterval(() => {
                    if (performance.now() - lastMove >= stillThreshold && !avoided) {
                        avoided = true;
                        dom.feedbackLine.textContent = 'Has quedado quieto — el Operator se retira.';
                        clearInterval(checker);
                        window.removeEventListener('pointermove', onMove);
                        try { enemyEffects.reset(); } catch (e) {}
                    }
                }, 80);

                setTimeout(() => {
                    clearInterval(checker);
                    window.removeEventListener('pointermove', onMove);
                    if (!avoided) {
                        dom.feedbackLine.textContent = 'Operator te alcanza — pierdes vida y tiempo.';
                        loseLife('Operator te golpea.');
                        state.secondsLeft = Math.max(0, state.secondsLeft - timePenalty);
                        updateHud();
                        updateMusic();
                    }
                    try { enemyEffects.reset(); } catch (e) {}
                }, windowMs);
            }
        }
    }
}

function startGame() {
    state.mode = 'juego';
    state.lives = 3;
    state.score = 0;
    state.streak = 0;
    state.correctCount = 0;
    state.difficulty = 0.84;
    state.secondsLeft = 300;
    state.failed = false;
    state.errors = 0;
    dom.restartBtn.disabled = false;
    dom.exitGameBtn.disabled = false;
    
    if (!state.tutorialShown) {
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

dom.restartBtn.addEventListener('click', () => {
    if (dom.restartBtn.disabled) return;
    startGame();
});

dom.exitGameBtn.addEventListener('click', () => {
    if (dom.exitGameBtn.disabled) return;
    clearInterval(state.timer);
    window.location.href = 'index.html';
});

// Initialize
if (dom.avatarPresence) renderAvatarPresence();
setupPlayer();
updateHud();
startGame();
