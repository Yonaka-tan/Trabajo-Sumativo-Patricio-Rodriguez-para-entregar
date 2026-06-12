const numberWords = [
    'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
    'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciseis', 'diecisiete', 'dieciocho', 'diecinueve'
];

const tensWords = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const hundredsWords = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

const sets = [
    { id: 'comparar', title: 'Tablas comparativas', hint: 'Elige si el primer numero es mayor, menor o igual.' },
    { id: 'recta', title: 'Recta numerica', hint: 'Completa la secuencia con el numero faltante.' },
    { id: 'conversion', title: 'Numeros y palabras', hint: 'Convierte entre cifras y palabras.' },
    { id: 'verificacion', title: '¿Es correcto?', hint: 'Decide si la escritura del numero es correcta.' },
    { id: 'mixto', title: 'Mixto infinito', hint: 'Numeros, rectas y conversiones pueden aparecer.' }
];

const musicPaths = {
    easy: 'Musica 3/Void_Explorer.ogg',
    hard: 'Musica 1/Congratulations,_you_beat_the_Tutorial.ogg',
    symphony: 'Musica 3/Won\'t_you_hear_my_Symphony_.mp3',
    findYourFlame: 'Musica 1/Find-your-Flame.mp3',
    inescapable: 'Musica 4/AudioInescapable.ogg',
    practice: 'Musica 1/Conviction_(feat._SPIRIT_GARDEN_).ogg',
    failure: 'Musica 3/Subspace-Sequence.mp3'
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

const dom = {
    avatarPresence: document.getElementById('avatar-presence'),
    selectedAvatarIcon: document.getElementById('selected-avatar-icon'),
    selectedAvatarLabel: document.getElementById('selected-avatar-label'),
    selectedPlayerName: document.getElementById('selected-player-name'),
    modeButtons: document.querySelectorAll('.mode-card'),
    gameModeBtn: document.getElementById('game-mode-btn'),
    gameLockText: document.getElementById('game-lock-text'),
    modeLabel: document.getElementById('mode-label'),
    setTitle: document.getElementById('set-title'),
    shieldsContainer: document.getElementById('shields-container'),
    timerCount: document.getElementById('timer-count'),
    scoreCount: document.getElementById('score-count'),
    stage: document.getElementById('exercise-stage'),
    answerRow: document.getElementById('answer-row'),
    responsePanel: document.getElementById('response-panel'),
    nextSetBtn: document.getElementById('next-set-btn'),
    mixedBtn: document.getElementById('mixed-btn'),
    feedbackLine: document.getElementById('feedback-line'),
    learningModal: document.getElementById('learning-modal'),
    difficultyModal: document.getElementById('difficulty-modal'),
    difficultyBtns: document.querySelectorAll('.difficulty-btn'),
    closeLearningModalBtn: document.getElementById('close-learning-modal')
};

const state = {
    mode: null,
    setIndex: 0,
    current: null,
    lives: 3,
    errors: 0,
    score: 0,
    streak: 0,
    completedInSet: 0,
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
    allSetsComplete: false,
    mixedHintShown: false,
    tutorialShown: false,
    tempMode: null,
    difficultyConfirmed: false
};

function getDifficultyTier() {
    if (state.difficulty > 0.7) return 'EXTREMO';
    if (state.difficulty > 0.45) return 'NORMAL';
    return 'CASUAL';
}

function getDifficultyDescription() {
    if (state.difficulty > 0.7) return 'Responde rápido y estudia números grandes.';
    if (state.difficulty > 0.45) return 'Más preguntas por set y menos tiempo.';
    return 'Avanza tranquilo con ejercicios claros.';
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
        { id: 'memoriza', title: 'Memoriza', desc: 'Algunas respuestas desaparecen luego de unos segundos.' },
        { id: 'bomba-de-tiempo', title: 'Bomba de tiempo', desc: 'El tiempo se consume más rápido al fallar.' },
        { id: 'confusion', title: 'Confusión', desc: 'Los números pueden ocultarse un instante.' }
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
            if (state.current && state.current.type === 'comparison') {
                answer(dx > 0 ? '>' : '<');
            }
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
            if (state.current && state.current.type === 'comparison') {
                answer(dx > 0 ? '>' : '<');
            }
        }
        startX = null;
        startY = null;
    });
}

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

function getStoredTestScore() {
    return Number(localStorage.getItem('numeracionTestScore') || 0);
}

function setStoredTestScore(score) {
    localStorage.setItem('numeracionTestScore', String(Math.max(getStoredTestScore(), score)));
}

function updateGameLock() {
    const unlocked = getStoredTestScore() >= 25;
    dom.gameModeBtn.classList.toggle('locked', !unlocked);
    dom.gameLockText.textContent = unlocked ? 'Desbloqueado: modo infinito y mixto.' : 'Bloqueado: necesitas 25 puntos en prueba.';
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
    } else if (state.allSetsComplete && state.difficulty > 0.78) {
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
    dom.setTitle.textContent = sets[state.setIndex].title;
    renderDifficultyStatus();
}

function startTimer() {
    clearInterval(state.timer);
    let tickCounter = 0;
    state.timer = setInterval(() => {
        try {
            state.secondsLeft -= 1;
            updateHud();
            // Throttle music updates to reduce work on main thread
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

function normalizeText(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, ' ');
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
    while (options.size < desired && attempts < 100) {
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

    let missingIndices = [];
    let correct = null;
    let options = [];

    if (state.difficulty > 0.8) {
        if (state.difficulty > 0.85 && Math.random() > 0.4) {
            const startIdx = randomInt(1, length - 3);
            missingIndices = [startIdx, startIdx + 1];
            correct = { x: sequence[startIdx], y: sequence[startIdx + 1] };
            const x = correct.x;
            const y = correct.y;
            const possibleOptions = [];
            const baseVariance = Math.max(1, Math.floor(step * (state.difficulty > 0.88 ? 0.5 : 1.5)));
            possibleOptions.push({ x, y });
            possibleOptions.push({ x: x + step, y: y + step });
            possibleOptions.push({ x: x - step, y: y - step });
            possibleOptions.push({ x: x + baseVariance, y: y + baseVariance });
            possibleOptions.push({ x: x + step, y: y });
            possibleOptions.push({ x: x, y: y + step });
            for (let opt of possibleOptions) {
                if (opt.x === x && opt.y === y) continue;
                if (opt.x < 0 || opt.y < 0 || opt.x > 10000 || opt.y > 10000) continue;
                options.push(opt);
            }
            options = options.slice(0, 3);
            options.push(correct);
            options.sort(() => Math.random() - 0.5);
        } else {
            const idx1 = randomInt(1, length - 2);
            let idx2 = randomInt(1, length - 2);
            let safety = 0;
            while (idx2 === idx1 && safety < 12) {
                idx2 = randomInt(1, length - 2);
                safety += 1;
            }
            missingIndices = [idx1, idx2].sort();
            correct = { x: sequence[missingIndices[0]], y: sequence[missingIndices[1]] };
            const x = correct.x;
            const y = correct.y;
            const possibleOptions = [];
            const baseVariance = Math.max(1, Math.floor(step * (state.difficulty > 0.85 ? 0.7 : 1.5)));
            possibleOptions.push({ x, y });
            possibleOptions.push({ x: y, y: x });
            possibleOptions.push({ x: x + step, y: y + step });
            possibleOptions.push({ x: x + baseVariance, y: y + baseVariance });
            possibleOptions.push({ x: x - step, y: y + step });
            for (let opt of possibleOptions) {
                if (opt.x === x && opt.y === y) continue;
                if (opt.x < 0 || opt.y < 0 || opt.x > 10000 || opt.y > 10000) continue;
                options.push(opt);
            }
            options = options.slice(0, 3);
            options.push(correct);
            options.sort(() => Math.random() - 0.5);
        }
    } else {
        const missingIndex = randomInt(1, length - 2);
        missingIndices = [missingIndex];
        correct = sequence[missingIndex];
        const cap = 10000;
        const desired = 4;
        options = generateRectaOptions(correct, step, cap, desired);
    }

    return {
        type: 'recta',
        sequence,
        missingIndices,
        step,
        options: missingIndices.length === 1 ? options : null,
        answer: missingIndices.length === 1 ? String(correct) : correct,
        note: missingIndices.length > 1
            ? `Incremento: +${step}. Tienes que encontrar X luego Y.`
            : `La secuencia avanza con paso de ${step}.`
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

function renderComparison(pair) {
    maybeAssignCurse();
    dom.stage.innerHTML = `
        <div class="comparison-table">
            <div><span>Numero A</span><strong>${pair.labelA || pair.a}</strong></div>
            <div class="unknown-symbol">?</div>
            <div><span>Numero B</span><strong>${pair.labelB || pair.b}</strong></div>
        </div>
        <p>${pair.note || sets[state.setIndex].hint}</p>
        <div class="difficulty-panel">
            <span id="difficulty-badge" class="status-badge"></span>
            <span id="status-banner" class="status-banner"></span>
        </div>
        <div class="swipe-hint">Arrastra horizontalmente para responder con el símbolo correcto.</div>
    `;
    renderResponseControls('comparison');
}

function renderRecta(pair) {
    const sequenceHTML = pair.sequence.map((value, index) => {
        if (pair.missingIndices.includes(index)) {
            if (pair.missingIndices.length > 1 && pair.missingIndices[0] === index) {
                return '<span class="sequence-item missing" data-position="x">x</span>';
            } else if (pair.missingIndices.length > 1) {
                return '<span class="sequence-item missing" data-position="y">y</span>';
            }
            return '<span class="sequence-item missing">x</span>';
        }
        return `<span class="sequence-item">${value}</span>`;
    }).join('<span class="sequence-separator">,</span>');
    
    dom.stage.innerHTML = `
        <div class="sequence-box">
            <div class="sequence-row">
                ${sequenceHTML}
            </div>
        </div>
        <p>${pair.note}</p>
    `;
    
    if (pair.missingIndices.length > 1) {
        renderResponseControls('recta-double', pair);
    } else {
        renderResponseControls('recta', pair.options);
    }
}

function renderConversion(pair) {
    maybeAssignCurse();
    dom.stage.innerHTML = `
        <div class="conversion-box">
            <p>${pair.prompt}</p>
        </div>
        <div class="difficulty-panel">
            <span id="difficulty-badge" class="status-badge"></span>
            <span id="status-banner" class="status-banner"></span>
        </div>
        <div class="swipe-hint">Escribe tu respuesta o usa el teclado. El modo casual es más relajado.</div>
    `;
    renderResponseControls('conversion', pair);
}

function renderVerify(pair) {
    maybeAssignCurse();
    dom.stage.innerHTML = `
        <div class="verification-box">
            <div class="verification-row"><strong>${pair.promptTop}</strong></div>
            <div class="verification-row lighter"><strong>${pair.promptBottom}</strong></div>
        </div>
        <p>${pair.note}</p>
        <div class="difficulty-panel">
            <span id="difficulty-badge" class="status-badge"></span>
            <span id="status-banner" class="status-banner"></span>
        </div>
        <div class="swipe-hint">Toca SI/NO o desliza hacia los lados para responder.</div>
    `;
    renderResponseControls('verify');
}

function renderResponseControls(type, payload = []) {
    dom.answerRow.style.display = 'none';
    dom.responsePanel.innerHTML = '';
    if (type === 'comparison') {
        dom.answerRow.style.display = 'flex';
        const selected = state.selectedMaldiciones || [];
        if (selected.includes('memoriza')) {
            setTimeout(() => {
                dom.answerRow.querySelectorAll('button').forEach((b) => { b.textContent = '•'; b.disabled = true; b.dataset.hidden = 'true'; });
            }, 8000);
        } else {
            dom.answerRow.querySelectorAll('button').forEach((b) => { b.textContent = b.dataset.answer; b.disabled = false; delete b.dataset.hidden; });
        }
        return;
    }
    if (type === 'recta') {
        dom.responsePanel.innerHTML = `<div class="options-row">${payload.map((value) => `<button type="button" class="action-btn continue-btn" data-answer="${value}">${value}</button>`).join('')}</div>`;
        dom.responsePanel.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => answer(button.dataset.answer)));
        return;
    }
    if (type === 'recta-double') {
        dom.responsePanel.innerHTML = `
            <div class="double-input-row">
                <div>
                    <label>X (primer faltante):</label>
                    <input id="double-x" type="number" placeholder="0" autocomplete="off">
                </div>
                <div>
                    <label>Y (segundo faltante):</label>
                    <input id="double-y" type="number" placeholder="0" autocomplete="off">
                </div>
                <button id="double-submit" class="action-btn continue-btn" type="button">Verificar</button>
            </div>
        `;
        dom.responsePanel.querySelector('#double-submit').addEventListener('click', () => {
            const x = parseInt(document.querySelector('#double-x').value, 10);
            const y = parseInt(document.querySelector('#double-y').value, 10);
            submitDouble(x, y);
        });
        return;
    }
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
        const selected = state.selectedMaldiciones || [];
        if (selected.includes('memoriza')) {
            setTimeout(() => {
                const input = document.querySelector('#conversion-input');
                if (input) { input.value = ''; input.disabled = true; input.placeholder = '...'; }
            }, 8000);
        }
        return;
    }
    if (type === 'verify') {
        dom.responsePanel.innerHTML = `
            <div class="options-row">
                <button type="button" class="action-btn continue-btn" data-answer="si">SI</button>
                <button type="button" class="action-btn back-btn" data-answer="no">NO</button>
            </div>
        `;
        dom.responsePanel.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => answer(button.dataset.answer)));
    }
}

function submitDouble(x, y) {
    if (!state.current || state.current.type !== 'recta' || !state.current.answer.x) return;
    const isCorrect = x === state.current.answer.x && y === state.current.answer.y;
    answer(isCorrect ? 'correcto' : 'incorrecto');
}

function submitConversion(value) {
    if (!state.current || state.current.type !== 'conversion') return;
    const trimmed = normalizeText(value);
    const expected = state.current.answerFormat === 'words' ? state.current.answer : normalizeText(state.current.answer);
    answer(trimmed === expected ? 'correcto' : 'incorrecto');
}

function renderExercise() {
    if (state.rendering) return;
    state.rendering = true;
    try {
        const setId = sets[state.setIndex] && sets[state.setIndex].id;
        let exercise;
        if (setId === 'recta') {
            exercise = buildRectaExercise();
        } else if (setId === 'conversion') {
            exercise = buildConversionExercise();
        } else if (setId === 'verificacion') {
            exercise = buildVerifyExercise();
        } else if (setId === 'mixto') {
            const randomIndex = randomInt(0, 3);
            const mixedId = sets[randomIndex].id;
            if (mixedId === 'recta') exercise = buildRectaExercise();
            else if (mixedId === 'conversion') exercise = buildConversionExercise();
            else if (mixedId === 'verificacion') exercise = buildVerifyExercise();
            else exercise = buildComparisonPair();
            exercise.type = exercise.type || (mixedId === 'comparar' ? 'comparison' : mixedId);
        } else {
            const pair = buildComparisonPair();
            exercise = { ...pair, type: 'comparison', answer: compare(pair.a, pair.b) };
        }
        state.current = exercise;

        if (exercise.type === 'recta') renderRecta(exercise);
        else if (exercise.type === 'conversion') renderConversion(exercise);
        else if (exercise.type === 'verificacion') renderVerify(exercise);
        else renderComparison(exercise);
    } catch (e) {
        console.error('renderExercise error', e);
    } finally {
        state.rendering = false;
    }
}

function completeSet() {
    if (state.setIndex >= 3) {
        state.allSetsComplete = true;
        dom.nextSetBtn.disabled = true;
        dom.mixedBtn.disabled = false;
        state.setIndex = 4;
        state.completedInSet = 0;
        state.lives = 3;
        state.secondsLeft = state.mode === 'juego' ? 600 : 300;
        dom.feedbackLine.textContent = 'Completaste todos los sets. Ahora estamos en modo mixto infinito.';
        updateHud();
        updateMusic();
        // show celebration overlay with stats
        try { showCompletionOverlay(); } catch (e) { console.error('overlay error', e); }
        renderExercise();
    } else {
        dom.nextSetBtn.disabled = state.setIndex >= 2;
        state.lives = 3;
        state.secondsLeft = state.mode === 'juego' ? 600 : 300;
        dom.feedbackLine.textContent = 'Set completo. Puedes pasar al siguiente numero.';
        updateHud();
        updateMusic();
    }
}

function showCompletionOverlay() {
    // Remove previous if any
    const existing = document.querySelector('.celebration-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';
    overlay.innerHTML = `
        <div class="celebration-card">
            <h2>Perfecto, nuevo juego desbloqueado, ¡buen trabajo!</h2>
            <p class="stats">Tu puntaje: <strong>${state.score}</strong> &nbsp;|&nbsp; Errores: <strong>${state.errors || 0}</strong></p>
            <p class="congrats">¡Muy bien hecho! Sigue practicando para mejorar aún más.</p>
            <div class="celebration-actions">
                <button id="celebration-close" class="action-btn">Cerrar</button>
                <button id="celebration-restart" class="action-btn">Jugar de nuevo</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Launch confetti
    launchConfetti(100);

    const closeBtn = document.getElementById('celebration-close');
    const restartBtn = document.getElementById('celebration-restart');

    function removeOverlay() {
        overlay.remove();
    }

    if (closeBtn) closeBtn.addEventListener('click', removeOverlay);
    if (restartBtn) restartBtn.addEventListener('click', () => {
        removeOverlay();
        // restart same mode
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
        // remove after animation
        setTimeout(() => el.remove(), 5500 + Math.random() * 2000);
    }
    // clean container
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
    dom.feedbackLine.textContent = 'Fallido. No puedes rendirte! ibamos excelente! sigue luchando contra el VACIO!';
    dom.stage.innerHTML = `
        <div class="failure-box">
            <h2>FALLIDO</h2>
            <p>No puedes rendirte! íbamos excelente! sigue luchando contra el <strong style="color:purple">VACIO</strong>!</p>
        </div>
    `;
    dom.answerRow.style.display = 'none';
    dom.responsePanel.innerHTML = '';
}

function answer(symbol) {
    if (!state.current || !state.mode || state.failed) return;
    const isCorrect = symbol === state.current.answer || (symbol === 'correcto' && state.current.type !== 'comparar');
    
    if (isCorrect) {
        playSoundEffect('success');
        try {
            // light confetti on correct answer
            showLightConfetti();
        } catch (e) { console.error('confetti error', e); }
        state.score += state.mode === 'aprendizaje' ? 1 : 3;
        state.streak += 1;
        state.completedInSet += 1;
        state.difficulty = clamp(state.difficulty + (state.streak >= 3 ? 0.06 : 0.025), 0.22, 0.92);
        dom.feedbackLine.textContent = 'Correcto. Tu avatar mantiene la ruta estable.';
        if (state.mode === 'prueba') setStoredTestScore(state.score);
        if (state.mode === 'juego' && state.completedInSet % 5 === 0) state.lives = clamp(state.lives + 1, 1, 3);
    } else {
        playSoundEffect('error');
        state.errors = (state.errors || 0) + 1;
        loseLife('Casi. Mira bien y responde otra vez.');
        updateGameLock();
        updateHud();
        updateMusic();
        return;
    }

    if (state.mode === 'prueba') setStoredTestScore(state.score);
    if (state.completedInSet >= 5 && state.setIndex < 3) {
        completeSet();
    } else {
        renderExercise();
    }
    updateGameLock();
    updateHud();
    updateMusic();
}

function startMode(mode) {
    if (mode === 'juego' && getStoredTestScore() < 25) {
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
    state.setIndex = 0;
    state.lives = 3;
    state.score = 0;
    state.streak = 0;
    state.completedInSet = 0;
    state.difficulty = state.selectedDifficulty ? difficultyLevels[state.selectedDifficulty] : (mode === 'juego' ? 0.76 : 0.42);
    state.secondsLeft = mode === 'juego' ? 600 : 300;
    state.failed = false;
    state.allSetsComplete = false;
    state.mixedHintShown = false;
    dom.nextSetBtn.disabled = true;
    dom.mixedBtn.disabled = true;
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

dom.answerRow.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => answer(button.dataset.answer));
});

dom.nextSetBtn.addEventListener('click', () => {
    if (dom.nextSetBtn.disabled) return;
    state.setIndex = clamp(state.setIndex + 1, 0, 4);
    state.completedInSet = 0;
    state.lives = 3;
    state.secondsLeft = state.mode === 'juego' ? 600 : 300;
    dom.nextSetBtn.disabled = true;
    updateHud();
    renderExercise();
});

dom.mixedBtn.addEventListener('click', () => {
    if (dom.mixedBtn.disabled) return;
    state.setIndex = 4;
    state.completedInSet = 0;
    state.lives = 3;
    state.secondsLeft = 600;
    state.difficulty = 0.84;
    state.allSetsComplete = true;
    if (!state.mixedHintShown) {
        state.mixedHintShown = true;
        dom.feedbackLine.textContent = 'Mixto puede traer sumas y decimales. Si aparecen, la explicacion sale en el ejercicio.';
    }
    updateHud();
    updateMusic();
    renderExercise();
});

renderAvatarPresence();
setupPlayer();
initializeDifficultyControls();
updateGameLock();
updateHud();
setupSwipeControls();
