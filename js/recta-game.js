// Recta Game - Secuencias Numéricas con Sistema de Dificultad
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

const musicPaths = {
    easy: 'sonidos (4to)/Void_Explorer.ogg',
    hard: 'sonidos (4to)/Congratulations,_you_beat_the_Tutorial.ogg',
    symphony: 'sonidos (4to)/Won\'t_you_hear_my_Symphony_.mp3',
    findYourFlame: 'sonidos (4to)/Find-your-Flame.mp3',
    inescapable: 'sonidos (4to)/AudioInescapable.ogg',
    tutorial: 'sonidos (4to)/Subspace-Sequence.mp3',
    failure: 'sonidos (4to)/Subspace-Sequence.mp3',
    menuNostalgic: 'sonidos (4to)/Menu_Nostalgic.ogg'
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
    return state.difficulty > 0.7 && (state.passiveDifficulty >= 9.5 || state.lives === 1);
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
    livesCount: document.getElementById('lives-count'),
    timerCount: document.getElementById('timer-count'),
    scoreCount: document.getElementById('score-count'),
    streakCount: document.getElementById('streak-count'),
    nextIntermissionCount: document.getElementById('next-intermission-count'),
    stage: document.getElementById('exercise-stage'),
    responsePanel: document.getElementById('response-panel'),
    restartBtn: document.getElementById('restart-btn'),
    exitGameBtn: document.getElementById('exit-game-btn'),
    musicResetBtn: document.getElementById('music-reset-btn'),
    feedbackLine: document.getElementById('feedback-line'),
    effectTag: document.getElementById('effect-tag'),
    learningModal: document.getElementById('learning-modal'),
    tutorialContent: document.getElementById('tutorial-content'),
    tutorialInteraction: document.getElementById('tutorial-interaction'),
    closeLearningModalBtn: document.getElementById('close-learning-modal'),
    tutorialBackBtn: document.getElementById('tutorial-back-btn'),
    openTutorialBtn: document.getElementById('open-tutorial-btn'),
    difficultyModal: document.getElementById('difficulty-modal'),
    difficultyBtns: document.querySelectorAll('.difficulty-btn'),
    intermissionPanel: document.getElementById('intermission-panel'),
    intermissionOptions: document.getElementById('intermission-options'),
    intermissionShop: document.getElementById('shop-items'),
    intermissionContinueBtn: document.getElementById('intermission-continue'),
    intermissionRerollBtn: document.getElementById('intermission-reroll'),
    enemyToggle: document.getElementById('enemy-toggle')
};

const state = {
    mode: null,
    difficulty: null,
    current: null,
    lives: 3,
    errors: 0,
    score: 0,
    streak: 0,
    correctCount: 0,
    passiveDifficulty: 5,
    secondsLeft: 300,
    timer: null,
    audio: {},
    activeTrack: null,
    cadenceTrack: null,
    activeHardTrack: null,
    findYourFlameActive: false,
    findYourFlamePhase: null,
    failed: false,
    isTutorialActive: false,
    tutorialStep: 0,
    tutorialCompleted: false,
    tutorialLastDemoCorrect: false,
    activeMaldicion: null,
    selectedMaldiciones: [],
    selectedEnemy: null,
    enemyHorde: false,
    intermissionCategory: null,
    debugIntermission: false,
    debugKeyBuffer: '',
    exercisesUntilIntermission: 7,
    intermissionFrequency: 7,
    intermissionCount: 0,
    exercisesInSession: 0
};

const tutorialSlides = [
    {
        title: 'Bienvenido a Aprendizaje',
        text: 'Esta guía te muestra cómo ver el patrón, calcular el paso y encontrar el número que falta. Aquí no se trata de memorizar; se trata de entender la lógica.',
        notes: ['Escucharás Subspace Sequence mientras aprendes.', 'Cada paso se ilumina para que veas el patrón.']
    },
    {
        title: 'Descubre el paso',
        text: 'Observa cómo cada número crece con la misma diferencia. Ese valor fijo es el paso.',
        type: 'sequence',
        sequence: [4, 7, 10, 13, 16, 19],
        step: 3
    },
    {
        title: 'Encuentra el número faltante',
        text: 'Usa el paso para completar la serie. Mira los colores y el patrón antes de elegir.',
        type: 'demo',
        sequence: [5, 10, 15, 20, 25, 30],
        missingIndex: 4,
        answer: '25',
        prompt: '¿Qué número falta en la serie?'
    },
    {
        title: 'Ejercicio doble',
        text: 'En modo extremo podrás ver dos blancos. Primero X, luego Y. Cada uno sigue el mismo paso.',
        type: 'demo-double',
        sequence: [10, 20, 30, 40, 50, 60],
        missingIndices: [2, 4],
        answer: { x: '30', y: '50' },
        prompt: 'Escribe los valores de X y Y para completar la serie.'
    },
    {
        title: 'Maldiciones y enemigos',
        text: 'Después de cada intermisión puedes activar desafíos o atajos. Lee las descripciones: velocidad, racha o una vida extra.',
        notes: ['Las maldiciones aumentan la dificultad del siguiente bloque.', 'Activar enemigos hace las preguntas un poco más complejas.']
    },
    {
        title: 'Listo para jugar',
        text: 'Ahora conoces la lógica. Usa el centro para practicar y el panel derecho para ver tu progreso. Si necesitas repasar, vuelve a Aprendizaje.',
        final: true
    }
];

const STORAGE_KEY = 'rectaGameScore';
function getStoredScore() { return Number(localStorage.getItem(STORAGE_KEY) || 0); }
function setStoredScore(score) { localStorage.setItem(STORAGE_KEY, String(Math.max(getStoredScore(), score))); }

function updateGameLock() {
    const unlocked = getStoredScore() >= 15;
    dom.gameModeBtn.classList.toggle('locked', !unlocked);
    dom.gameLockText.textContent = unlocked ? 'Desbloqueado' : 'Bloqueado';
}

function renderAvatarPresence() {
    dom.avatarPresence.innerHTML = Object.entries(enemies).map(([key, enemy], index) => `
        <img class="presence-avatar presence-${index % 5}" src="${enemy.animation || enemy.icon}" alt="" data-enemy="${key}">
    `).join('');
}

function renderTutorialStep() {
    const step = tutorialSlides[state.tutorialStep];
    const isFinal = step.final === true;
    const notes = (step.notes || []).map(note => `<li>${note}</li>`).join('');
    dom.tutorialContent.innerHTML = `
        <div class="tutorial-step">
            <h2>${step.title}</h2>
            <p>${step.text}</p>
            ${notes ? `<ul style="color:#b8aeb1;line-height:1.6;margin:0 0 10px 1rem;">${notes}</ul>` : ''}
        </div>
    `;
    dom.tutorialInteraction.innerHTML = '';

    if (step.type === 'sequence') {
        const sequence = step.sequence.map((value, index) => `<span class="step-unit">${value}</span>`).join('');
        dom.tutorialInteraction.innerHTML = `
            <div class="step-grid">${sequence}</div>
            <p style="color:#fff;">Paso: <strong>+${step.step}</strong></p>
        `;
    } else if (step.type === 'demo') {
        dom.tutorialInteraction.innerHTML = `
            <div class="step-grid">${step.sequence.map((value, index) => index === step.missingIndex ? '<span class="step-unit highlight-number">?</span>' : `<span class="step-unit">${value}</span>`).join('')}</div>
            <div class="tutorial-input-row">
                <label style="color:#fff;">${step.prompt}</label>
                <input id="tutorial-answer" type="text" placeholder="Número" autocomplete="off">
            </div>
            <p id="tutorial-feedback" style="color:#ffb6bf;min-height:22px;margin:0;"></p>
        `;
    } else if (step.type === 'demo-double') {
        dom.tutorialInteraction.innerHTML = `
            <div class="step-grid">${step.sequence.map((value, index) => step.missingIndices.includes(index) ? `<span class="step-unit highlight-number">${index === step.missingIndices[0] ? 'X' : 'Y'}</span>` : `<span class="step-unit">${value}</span>`).join('')}</div>
            <div id="tutorial-double-choices" style="margin-top:12px;"></div>
            <p id="tutorial-feedback" style="color:#ffb6bf;min-height:22px;margin:0;"></p>
        `;
        // prepare a small exercise object for the tutorial and render sequential choices inside the tutorial interaction
        const tutExercise = {
            type: 'recta',
            sequence: step.sequence,
            missingIndices: step.missingIndices,
            step: step.step || (step.sequence[1] - step.sequence[0]),
            answer: Array.isArray(step.answer) ? step.answer : (step.answer && typeof step.answer === 'object' ? [step.answer.x, step.answer.y] : [])
        };
        const container = document.getElementById('tutorial-double-choices');
        // reset tutorial last demo state
        state.tutorialLastDemoCorrect = false;
        renderDoubleChoice(tutExercise, (ok) => {
            state.tutorialLastDemoCorrect = Boolean(ok);
            const fb = document.getElementById('tutorial-feedback');
            if (fb) fb.textContent = ok ? '¡Perfecto! X y Y siguen el mismo paso.' : 'Casi. Revisa cómo avanza la secuencia y vuelve a intentarlo.';
        }, container);
    }

    dom.closeLearningModalBtn.textContent = isFinal ? 'Finalizar tutorial' : (step.type && step.type.startsWith('demo') ? 'Verificar' : 'Siguiente');
    dom.tutorialBackBtn.disabled = state.tutorialStep === 0;
}

function validateTutorialAnswer() {
    const step = tutorialSlides[state.tutorialStep];
    
    // demo step: requires text input validation
    if (step.type === 'demo') {
        const answerInput = document.getElementById('tutorial-answer');
        if (!answerInput) return false;
        if (answerInput.value.trim() === step.answer) {
            const fb = document.getElementById('tutorial-feedback');
            if (fb) fb.textContent = '¡Correcto! Ahora sigue con el siguiente paso.';
            return true;
        }
        const fb = document.getElementById('tutorial-feedback');
        if (fb) fb.textContent = 'No es correcto todavía. Revisa el paso y prueba de nuevo.';
        return false;
    }
    
    // demo-double: sequential multiple-choice validation
    if (step.type === 'demo-double') {
        // tutorialLastDemoCorrect is set by renderDoubleChoice callback
        if (state.tutorialLastDemoCorrect === true) {
            return true; // correct, allow advancement
        }
        // If false or not set, show guidance
        const fb = document.getElementById('tutorial-feedback');
        if (fb) {
            if (state.tutorialLastDemoCorrect === false) {
                fb.textContent = 'Casi. Revisa cómo avanza la secuencia y vuelve a intentarlo.';
            } else {
                fb.textContent = 'Por favor, completa la selección de X y Y.';
            }
        }
        return false; // cannot advance yet
    }
    
    // All other step types (no validation needed)
    return true;
}

function advanceTutorial() {
    state.tutorialStep += 1;
    renderTutorialStep();
}

function finishTutorial() {
    state.isTutorialActive = false;
    state.tutorialCompleted = true;
    dom.learningModal.classList.add('hidden');
    updateHud();
    updateMusic();
    startTimer();
    renderExercise();
}

function renderEffectStatus() {
    let text = 'Sin maldición activa';
    if (state.activeMaldicion) {
        text = `Maldición: ${state.activeMaldicion.replace(/-/g, ' ')}`;
    }
    if (state.selectedEnemy) {
        const customEnemyLabel = { cadencia: 'Cadencia', campana: 'Campana' }[state.selectedEnemy];
        const enemyLabel = customEnemyLabel || (enemies[state.selectedEnemy] ? enemies[state.selectedEnemy].label : state.selectedEnemy);
        if (text !== 'Sin maldición activa') {
            text += ` + Enemigo: ${enemyLabel}`;
        } else {
            text = `Enemigo: ${enemyLabel}`;
        }
    } else if (state.enemyHorde) {
        text = state.activeMaldicion ? `${text} + Enemigos` : 'Enemigos activos';
    }
    dom.effectTag.textContent = text;
    dom.effectTag.classList.toggle('active', Boolean(state.activeMaldicion || state.selectedEnemy || state.enemyHorde));
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
    if (maldicion === 'doble-racha') {
        dom.feedbackLine.textContent = 'Maldición de racha activa: tus combos dan más fuerza.';
    }
    renderEffectStatus();
}

function setupPlayer() {
    const identity = sessionStorage.getItem('grade4Identity') || 'Visitante';
    const enemyKey = sessionStorage.getItem('grade4Enemy') || 'baby';
    const enemy = enemies[enemyKey] || enemies.baby;
    dom.selectedPlayerName.textContent = identity;
    dom.selectedAvatarLabel.textContent = enemy.label;
    dom.selectedAvatarIcon.src = enemy.icon;
}

function playTrack(trackName) {
    if (state.activeTrack === trackName) return;
    if (state.findYourFlameActive && trackName !== 'findYourFlame') {
        clearFindYourFlameEffects();
    }
    Object.values(state.audio).forEach(a => a.pause());
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
    if (state.audio[`cadence-${state.cadenceTrack}`]) state.audio[`cadence-${state.cadenceTrack}`].pause();
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
    if (state.failed) { playTrack('failure'); return; }
    if (state.isTutorialActive) { playTrack('tutorial'); return; }
    const interActive = dom.intermissionPanel && !dom.intermissionPanel.classList.contains('hidden');
    if (interActive) { playTrack('menuNostalgic'); return; }
    if (state.mode === 'aprendizaje') { playTrack('easy'); return; }
    const difficulty = state.passiveDifficulty;
    if (shouldPlayFindYourFlame()) {
        playTrack('findYourFlame');
    } else if (state.correctCount >= 50 && difficulty >= 9.5) playTrack('inescapable');
    else if (difficulty >= 9.5) playTrack('inescapable');
    else playTrack(difficulty > 7.5 ? chooseHardTrack() : 'easy');
    if (state.mode !== 'aprendizaje') {
        if (state.secondsLeft >= 240) playCadenceTrack('lv1');
        else if (state.secondsLeft >= 180) playCadenceTrack('lv2');
        else if (state.secondsLeft >= 60) playCadenceTrack('lv3');
        else playCadenceTrack('lv4');
    }
}

function getOptionCount() {
    // Determine number of multiple-choice alternatives based on passive difficulty
    // Low difficulty -> 3, normal -> 4, high -> 5
    const diff = state.passiveDifficulty;
    if (diff <= 3.0) return 3;
    if (diff <= 7.0) return 4;
    return 5;
}

function generateOptionsFor(correct, step) {
    const desired = getOptionCount();
    const set = new Set([correct]);
    const cap = (state.difficulty === 'extremo' || state.passiveDifficulty >= 9.5) ? 50000 : 10000;
    const maxVariation = state.passiveDifficulty > 7.5
        ? Math.max(1, Math.floor(Math.abs(step) * randomInt(1, 4)))
        : Math.max(1, Math.floor(Math.abs(step) * randomInt(2, 6)));
    let attempts = 0;
    while (set.size < desired && attempts < 80) {
        const sign = Math.random() > 0.5 ? 1 : -1;
        const variation = Math.floor(maxVariation * (0.5 + Math.random() * 1.8)) * sign;
        let candidate = correct + variation;
        if (Math.random() < 0.18) candidate = correct + (randomInt(1, 6) * step) * (Math.random() > 0.5 ? 1 : -1);
        candidate = clamp(candidate, 0, cap);
        if (candidate !== correct) set.add(candidate);
        attempts += 1;
    }
    const arr = Array.from(set).slice(0, desired);
    // shuffle
    return arr.sort(() => Math.random() - 0.5);
}

function renderDoubleChoice(exercise, onComplete, containerEl) {
    const container = containerEl || (function(){ dom.responsePanel.innerHTML = ''; const c = document.createElement('div'); c.className = 'double-choice-container'; dom.responsePanel.appendChild(c); return c; })();

    const answers = Array.isArray(exercise.answer) ? exercise.answer : (exercise.answer && typeof exercise.answer === 'object' ? exercise.answer : []);
    // answers may be array [x,y,...]
    let stage = 0;

    function renderStage() {
        container.innerHTML = '';
        const target = answers[stage];
        const opts = generateOptionsFor(Number(target), exercise.step);
        const prompt = document.createElement('div');
        prompt.className = 'double-stage-prompt';
        prompt.innerHTML = `<p style="color:#fff;">Selecciona el valor para <strong>${String.fromCharCode(88 + stage)}</strong></p>`;
        container.appendChild(prompt);
        const row = document.createElement('div');
        row.className = 'options-row';
        opts.forEach((val) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'action-btn continue-btn';
            btn.dataset.value = String(val);
            btn.textContent = String(val);
            btn.addEventListener('click', () => {
                const chosen = Number(btn.dataset.value);
                if (chosen === Number(target)) {
                    stage += 1;
                    if (stage >= answers.length) {
                        // all correct
                        if (typeof onComplete === 'function') onComplete(true);
                        return;
                    }
                    renderStage();
                } else {
                    if (typeof onComplete === 'function') onComplete(false);
                }
            });
            row.appendChild(btn);
        });
        container.appendChild(row);
    }

    renderStage();
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function updateHud() {
    const lifeIcons = Array.from({ length: clamp(state.lives, 0, 5) }, () => '<span class="life-icon">♥</span>').join('');
    dom.livesCount.innerHTML = lifeIcons || '<span class="life-icon empty">0</span>';
    dom.timerCount.textContent = formatTime(state.secondsLeft);
    dom.scoreCount.textContent = state.score;
    dom.streakCount.textContent = state.streak;
    dom.nextIntermissionCount.textContent = state.exercisesUntilIntermission;
    dom.modeLabel.textContent = state.mode ? state.mode.toUpperCase() : 'Elige un modo';
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
                const selected = state.selectedMaldiciones || [];
                if (selected.includes('bomba-de-tiempo')) {
                    // bomba de tiempo behavior: play bell, distortion, lose a life and advance
                    playSoundEffect('success');
                    document.body.classList.add('distortion');
                    setTimeout(() => document.body.classList.remove('distortion'), 4000);
                    loseLife('Bomba: se acabó el tiempo, pierdes una vida.');
                    // reset for next exercise
                    state.secondsLeft = 20;
                    renderExercise();
                    return;
                }
                triggerFailure();
            }
        } catch (e) { console.error('Timer error', e); clearInterval(state.timer); }
    }, 1000);
}

function getPassiveDifficultyRange() {
    // Passive difficulty always stays in the 1.0 - 10.0 range
    // Difficulty selection (casual/normal/extremo) sets starting behavior
    let minDiff = 1.0, maxDiff = 10.0;
    if (state.difficulty === 'casual') maxDiff = 6.0;
    if (state.difficulty === 'normal') { minDiff = 2.5; maxDiff = 8.0; }
    if (state.difficulty === 'extremo') { minDiff = 5.5; maxDiff = 10.0; }
    // If 'numeros-mas-complejos' curse selected, allow higher max (up to 15)
    const selected = state.selectedMaldiciones || [];
    if (selected.includes('numeros-mas-complejos')) {
        maxDiff = Math.max(maxDiff, 15.0);
    }
    return { minDiff, maxDiff };
}

// Simple music control: play a named track from musicPaths

function randomStep() {
    const diff = state.passiveDifficulty;
    // Casual: small, readable steps
    if (diff <= 5) {
        return [2,3,5,7,10,12,15][randomInt(0,6)];
    }
    // Normal: include irregular and non-round steps often
    if (diff > 5 && diff <= 7.5) {
        // 60% chance irregular (non-round), 40% round-ish
        if (Math.random() < 0.6) return randomInt(3, 97); // odd/irregular steps
        return [10,12,15,20,25,30,40][randomInt(0,6)];
    }
    // Dificil: 2-3 digit steps and larger jumps
    if (diff > 7.5 && diff <= 10) {
        return randomInt(25, 520);
    }
    // Extremo: very large or tricky steps (scale with diff)
    // scale up to larger steps when passiveDifficulty approaches 10
    const maxStep = Math.floor(100 + (diff - 7.5) * 1000);
    let step = randomInt(100, Math.max(500, Math.min(maxStep, 5000)));
    // If a major maldición permits decimals, occasionally return decimal steps
    const selected = state.selectedMaldiciones || [];
    if (selected.includes('numeros-numeros') && Math.random() < 0.45) {
        // make a decimal step (e.g., 2.5, 3.2) by dividing
        step = Math.round((step / 10)) / 10;
    }
    return step;
}

function shouldRenderDoubleQuestion() {
    if (state.difficulty !== 'extremo') return false;
    const maxChance = 1/3;
    const currentChance = Math.min(maxChance, 1/8 + (state.passiveDifficulty - 7.5) * 0.02);
    const selected = state.selectedMaldiciones || [];
    if (selected.includes('numeros-numeros')) {
        if (state.difficulty === 'extremo' || state.passiveDifficulty >= 10) return true;
        return Math.random() < Math.min(0.75, currentChance + 0.25);
    }
    return Math.random() < currentChance;
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
    const diff = state.passiveDifficulty !== undefined ? state.passiveDifficulty : (typeof state.difficulty === 'number' ? state.difficulty : 5);
    const length = diff > 7.5 ? 7 : 6;
    let maxVal = 10000;
    if (diff <= 5) maxVal = 2000;
    else if (diff > 7.5) maxVal = 50000;
    const maxStart = Math.max(0, maxVal - step * (length - 1));
    let start = randomInt(0, maxStart);
    if (diff <= 5 && Math.random() < 0.55) {
        start = randomInt(1, Math.min(maxStart, 400));
    }
    if (diff > 5 && diff <= 7.5 && Math.random() < 0.55) {
        start = Math.max(1, start - (start % randomInt(3, 9)) + randomInt(1, 9));
    }
    if (diff > 7.5 && Math.random() < 0.7) {
        start = randomInt(Math.max(0, Math.floor(maxStart * 0.3)), maxStart);
        if (start % 10 === 0) start += randomInt(1, 9);
    }

    const sequence = Array.from({ length }, (_, i) => start + i * step);
    let missingIndices = [];
    let correct = null;
    let options = [];

    if (shouldRenderDoubleQuestion()) {
        const idx1 = randomInt(1, length - 3);
        const idx2 = idx1 + 1;
        missingIndices = [idx1, idx2];
        correct = missingIndices.map(i => sequence[i]);
    } else {
        const missingIndex = randomInt(1, length - 2);
        missingIndices = [missingIndex];
        correct = sequence[missingIndex];
        const cap = diff > 7.5 ? 50000 : 10000;
        const desired = getOptionCount();
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

function renderExercise() {
    const exercise = buildRectaExercise();
    state.current = exercise;
    const sequenceHTML = exercise.sequence.map((value, index) => {
        if (exercise.missingIndices.includes(index)) {
            if (exercise.missingIndices.length > 1 && exercise.missingIndices[0] === index) {
                return '<span class="sequence-item missing" data-position="x">x</span>';
            } else if (exercise.missingIndices.length > 1) {
                return '<span class="sequence-item missing" data-position="y">y</span>';
            }
            return '<span class="sequence-item missing">?</span>';
        }
        return `<span class="sequence-item">${value}</span>`;
    }).join('<span class="sequence-separator">,</span>');
    
    // If confusion maldición active, hide explicit step info
    const selected = state.selectedMaldiciones || [];
    const note = selected.includes('confusion') ? 'Incremento: ???' : exercise.note;
    const customEnemyLabel = { cadencia: 'Cadencia', campana: 'Campana' }[state.selectedEnemy];
    const enemyNote = state.selectedEnemy ? ` Enemigo activo: ${customEnemyLabel || (enemies[state.selectedEnemy] ? enemies[state.selectedEnemy].label : state.selectedEnemy)}.` : '';
    dom.stage.innerHTML = `
        <div class="sequence-box">
            <div class="sequence-row">${sequenceHTML}</div>
        </div>
        <p>${note}${enemyNote}</p>
    `;
    if (state.selectedEnemy === 'cadencia') {
        state.secondsLeft = Math.max(0, state.secondsLeft - 4);
        dom.feedbackLine.textContent = 'Cadencia: los segundos se evaporan antes del siguiente ejercicio.';
    }
    if (state.selectedEnemy === 'campana') {
        dom.feedbackLine.textContent = 'Campana: si fallas, el timbre distorsiona tu enfoque y pierdes tiempo.';
    }
    
    if (exercise.missingIndices.length > 1) {
        renderResponseControls('recta-double', exercise);
    } else {
        renderResponseControls('recta', exercise.options);
    }
}

function renderResponseControls(type, payload = []) {
    dom.responsePanel.innerHTML = '';
    if (type === 'recta') {
        // Ensure we have the desired number of options
        const desired = getOptionCount();
        let options = Array.isArray(payload) && payload.length ? payload.slice(0, desired) : [];
        if (options.length < desired) {
            const correct = Number(state.current && state.current.answer ? state.current.answer : 0);
            options = generateOptionsFor(correct, state.current ? state.current.step : 1);
        }
        dom.responsePanel.innerHTML = `<div class="options-row">${options.map((value) => `<button type="button" class="action-btn continue-btn" data-answer="${value}">${value}</button>`).join('')}</div>`;
        dom.responsePanel.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => answer(button.dataset.answer)));
            // If 'memoriza' curse is active, hide numbers after 10 seconds
            const selected = state.selectedMaldiciones || [];
            if (selected.includes('memoriza')) {
                setTimeout(() => {
                    dom.responsePanel.querySelectorAll('button').forEach((b) => { b.textContent = '•'; b.dataset.hidden = 'true'; });
                }, 10000);
            }
    } else if (type === 'recta-double') {
        // Sequential multiple-choice for each unknown (X, Y, ...)
        renderDoubleChoice(payload, (allCorrect) => {
            if (allCorrect) answer('correcto');
            else answer('incorrecto');
        });
        
    }
}

// submitDouble removed - replaced by sequential multiple-choice flow via renderDoubleChoice

function showCompletionOverlay() {
    const existing = document.querySelector('.celebration-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';
    overlay.innerHTML = `
        <div class="celebration-card">
            <h2>¡Excelente trabajo!</h2>
            <p class="stats">Puntaje: <strong>${state.score}</strong> | Errores: <strong>${state.errors || 0}</strong></p>
            <p class="congrats">¡Muy bien hecho!</p>
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
    const removeOverlay = () => overlay.remove();
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
    const { minDiff, maxDiff } = getPassiveDifficultyRange();
    state.passiveDifficulty = clamp(state.passiveDifficulty - 0.12, minDiff, maxDiff);
    if (state.lives <= 0) {
        triggerFailure();
        return;
    }
    dom.feedbackLine.textContent = message;
    updateHud();
    updateMusic();
    renderExercise();
}

function handleHiddenDebugSequence(event) {
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    const key = String(event.key || '').toLowerCase();
    if (!/^[a-z]$/.test(key)) return;
    state.debugKeyBuffer += key;
    if (state.debugKeyBuffer.length > 5) {
        state.debugKeyBuffer = state.debugKeyBuffer.slice(-5);
    }
    if (state.debugKeyBuffer === 'debug') {
        state.debugIntermission = true;
        state.debugKeyBuffer = '';
        console.log('Hidden DEBUG intermission mode enabled');
    }
}

function triggerFailure() {
    state.failed = true;
    clearInterval(state.timer);
    playTrack('failure');
    dom.feedbackLine.textContent = 'Fallido. ¡Sigue luchando contra el VACIO!';
    dom.stage.innerHTML = `<div class="failure-box"><h2>FALLIDO</h2><p>¡Sigue adelante!</p></div>`;
    dom.responsePanel.innerHTML = '';
}

function gainPassiveDifficulty(amount) {
    const { minDiff, maxDiff } = getPassiveDifficultyRange();
    const streakBonus = state.streak >= 3 ? 0.01 : 0;
    state.passiveDifficulty = clamp(state.passiveDifficulty + amount + streakBonus, minDiff, maxDiff);
}

function answer(symbol) {
    if (!state.current || !state.mode || state.failed) return;
    let isCorrect = false;
    if (symbol === 'correcto') isCorrect = true;
    else if (symbol === 'incorrecto') isCorrect = false;
    else isCorrect = symbol === state.current.answer;
    
    if (isCorrect) {
        playSoundEffect('success');
        try { showLightConfetti(); } catch (e) { console.error('confetti error', e); }
        const exercisePoints = state.mode === 'aprendizaje' ? 1 : 3;
        const streakBonus = Math.floor(state.streak / 2);
        state.score += exercisePoints + streakBonus;
        if (state.activeMaldicion === 'doble-racha') {
            state.score += 1;
        }
        state.streak += 1;
        state.correctCount += 1;
        state.exercisesUntilIntermission -= 1;
        state.exercisesInSession += 1;
        if (state.enemyHorde) {
            const { minDiff, maxDiff } = getPassiveDifficultyRange();
            state.passiveDifficulty = clamp(state.passiveDifficulty + 0.01, minDiff, maxDiff);
        }
        if (state.selectedEnemy === 'cadencia') {
            state.secondsLeft = Math.max(0, state.secondsLeft - 3);
        }
        gainPassiveDifficulty(state.streak >= 3 ? 0.06 : 0.025);
        dom.feedbackLine.textContent = 'Correcto. Avanzas por el vacío.';
        
        if (state.activeMaldicion === 'velocidad') {
            state.secondsLeft = Math.max(0, state.secondsLeft - 3);
            dom.feedbackLine.textContent = 'La maldición de velocidad te presiona más.';
        }
        // bomba de tiempo: cada ejercicio reinicia el contador a 20 segundos
        const selected = state.selectedMaldiciones || [];
        if (selected.includes('bomba-de-tiempo')) {
            state.secondsLeft = 20;
        }
        
        // Gain life based on difficulty
        if (state.difficulty === 'casual' && state.exercisesInSession % 1 === 0) {
            state.lives = clamp(state.lives + 1, 1, 3);
        } else if (state.difficulty === 'normal' && state.exercisesInSession % 3 === 0) {
            state.lives = clamp(state.lives + 1, 1, 3);
        }
        
        if (state.mode === 'prueba') setStoredScore(state.score);
        if (state.debugIntermission && state.mode !== 'aprendizaje') {
            showIntermission();
            return;
        }
        if (state.exercisesUntilIntermission <= 0 && state.mode !== 'aprendizaje') {
            showIntermission();
            return;
        }
        if (state.mode === 'prueba' && state.correctCount >= 15) {
            showCompletionOverlay();
            return;
        }
        renderExercise();
    } else {
        playSoundEffect('error');
        state.errors = (state.errors || 0) + 1;
        if (state.selectedEnemy === 'campana') {
            state.secondsLeft = Math.max(0, state.secondsLeft - 4);
            loseLife('Campana distorsiona tu enfoque. Pierdes tiempo extra.');
            updateGameLock();
            return;
        }
        loseLife('Casi. Mira bien y responde otra vez.');
        updateGameLock();
        return;
    }
    if (state.mode === 'prueba') setStoredScore(state.score);
    updateGameLock();
    updateHud();
    updateMusic();
}

function showIntermission() {
    state.intermissionCount += 1;
    state.exercisesUntilIntermission = state.intermissionFrequency;
    state.activeMaldicion = null;
    state.selectedMaldiciones = [];
    state.selectedEnemy = null;
    state.enemyHorde = false;
    state.intermissionCategory = null;
    state.rerollsRemaining = typeof state.rerollsRemaining === 'number' ? state.rerollsRemaining : 3;
    state.freeRerollThisIntermission = true;

    if (state.difficulty === 'extremo') {
        state.lives = clamp(state.lives + 1, 1, 3);
    }

    if (dom.enemyToggle && dom.enemyToggle.closest('label')) {
        dom.enemyToggle.closest('label').style.display = 'none';
    }

    dom.intermissionPanel.classList.remove('hidden');
    dom.intermissionPanel.classList.add('active');
    dom.stage.classList.add('hidden');
    dom.responsePanel.classList.add('hidden');
    dom.intermissionContinueBtn.disabled = true;
    dom.intermissionRerollBtn.disabled = false;
    updateHud();
    dom.feedbackLine.textContent = 'Intermisión abierta. Elige un desafío para continuar.';

    const canMajorCurse = state.intermissionCount % 3 === 0;
    const maldiciones = [
        { id: 'numeros-mas-complejos', title: 'Números más complejos', img: 'Maldiciones img/Numeros mas complejos.png', desc: 'Aumenta la complejidad de los números y permite mayor desafío.' },
        { id: 'memoriza', title: 'Memoriza', img: 'Maldiciones img/Memoriza!.png', desc: 'Las alternativas desaparecen después de 10 segundos.' }
    ];
    if (canMajorCurse) {
        maldiciones.push({ id: 'numeros-numeros', title: 'NUMEROS, NUMEROS, NUMEROS!', img: 'Maldiciones img/Numeros, numeros NUMEROS!.png', desc: 'Maldición mayor: múltiples incógnitas y decimales en la secuencia.' });
    }

    const enemiesList = [
        { id: 'cadencia', title: 'Cadencia', img: 'Maldiciones img/Mas Musica.png', desc: 'Acelera el ritmo y aumenta la presión del tiempo.' },
        { id: 'campana', title: 'Campana', img: 'Maldiciones img/Campanazo desorientador.png', desc: 'Distorsiona tu enfoque si fallas o dudas.' }
    ];

    function updateIntermissionHeader() {
        document.getElementById('intermission-points').textContent = state.score;
        document.getElementById('intermission-streak').textContent = state.streak;
        document.getElementById('intermission-until').textContent = state.exercisesUntilIntermission;
        dom.intermissionRerollBtn.textContent = state.freeRerollThisIntermission ? 'Rerrollear (gratis)' : `Rerrollear (${state.rerollsRemaining})`;
    }

    function renderIntermissionIntro() {
        dom.intermissionOptions.innerHTML = `
            <div class="intermission-prompt">
                <p>Elige si quieres un desafío de <strong>maldición</strong> o un desafío de <strong>enemigo</strong> para el siguiente bloque.</p>
                <div class="intermission-choice-row">
                    <button type="button" class="action-btn continue-btn intermission-select-category" data-category="maldicion">Maldición</button>
                    <button type="button" class="action-btn continue-btn intermission-select-category" data-category="enemigo">Enemigo</button>
                </div>
            </div>
        `;
        dom.intermissionOptions.querySelectorAll('.intermission-select-category').forEach((button) => {
            button.addEventListener('click', () => renderCategoryOptions(button.dataset.category));
        });
    }

    function renderCategoryOptions(category) {
        state.intermissionCategory = category;
        const items = category === 'maldicion' ? maldiciones : enemiesList;
        const title = category === 'maldicion' ? 'Maldiciones disponibles' : 'Enemigos disponibles';
        const warning = category === 'maldicion' && !canMajorCurse ? '<p style="color:#f0b;margin:0 0 10px 0;">Maldición mayor solo disponible cada 3 intermisiones.</p>' : '';

        dom.intermissionOptions.innerHTML = `
            <div style="margin-bottom:14px;color:#fff;">
                <h3 style="margin:0 0 6px 0;">${title}</h3>
                ${warning}
            </div>
            <div class="intermission-option-grid">
                ${items.map((item) => `
                    <article class="intermission-card">
                        <img src="${item.img}" alt="${item.title}" onerror="this.src='Maldiciones img/Baby icono.png'">
                        <strong>${item.title}</strong>
                        <p>${item.desc}</p>
                        <button type="button" class="action-btn continue-btn select-item" data-id="${item.id}" data-type="${category}">Seleccionar</button>
                    </article>
                `).join('')}
            </div>
        `;

        dom.intermissionOptions.querySelectorAll('.select-item').forEach((button) => {
            button.addEventListener('click', (event) => {
                const id = event.currentTarget.dataset.id;
                const type = event.currentTarget.dataset.type;
                if (type === 'maldicion') {
                    state.selectedMaldiciones = [id];
                    state.selectedEnemy = null;
                } else {
                    state.selectedEnemy = id;
                    state.selectedMaldiciones = [];
                }
                showIntermissionSummary();
            });
        });
    }

    function showIntermissionSummary() {
        const mal = state.selectedMaldiciones[0] ? state.selectedMaldiciones[0].replace(/-/g, ' ') : 'Ninguna';
        const ene = state.selectedEnemy ? state.selectedEnemy.replace(/-/g, ' ') : 'Ninguno';
        dom.intermissionOptions.innerHTML = `
            <div class="intermission-summary-card">
                <p><strong>Maldición:</strong> ${mal}</p>
                <p><strong>Enemigo:</strong> ${ene}</p>
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">
                <button id="intermission-shop-btn" class="action-btn">Comprar mejoras</button>
                <button id="intermission-accept-btn" class="action-btn continue-btn">Continuar</button>
            </div>
        `;
        dom.intermissionContinueBtn.disabled = false;
        document.getElementById('intermission-shop-btn').addEventListener('click', () => openIntermissionShop());
        document.getElementById('intermission-accept-btn').addEventListener('click', () => finishIntermission());
    }

    function openIntermissionShop() {
        const upgrades = [
            { id: 'more-time', title: 'Más tiempo', price: 30, desc: 'Añade +30s por ejercicio (+5s si tienes bomba-de-tiempo).' },
            { id: 'reduce-bell', title: 'Reducir campana', price: 25, desc: 'Reduce efecto campana en 1s.' },
            { id: 'increase-grace', title: 'Período de gracia', price: 20, desc: 'Aumenta gracia campana/cadencia en 1s.' },
            { id: 'extra-life', title: 'Vida extra', price: 100, desc: 'Ganas 1 vida permanente más.' },
            { id: 'shield', title: 'Escudo', price: 60, desc: 'Escudo que evita perder 1 vida (una sola vez).' }
        ];
        dom.intermissionOptions.innerHTML = `
            <h3 style="margin-bottom:12px;color:#fff;">Mejoras disponibles (Puntos: ${state.score})</h3>
            <div class="intermission-shop-grid">
                ${upgrades.map((upgrade) => `
                    <article class="intermission-card upgrade-card">
                        <strong>${upgrade.title}</strong>
                        <p>${upgrade.desc}</p>
                        <button type="button" class="action-btn buy-upgrade" data-id="${upgrade.id}" data-price="${upgrade.price}">Comprar (${upgrade.price})</button>
                    </article>
                `).join('')}
            </div>
            <button id="intermission-shop-back" class="action-btn">Volver</button>
        `;
        dom.intermissionOptions.querySelectorAll('.buy-upgrade').forEach((button) => {
            button.addEventListener('click', (event) => {
                const id = event.currentTarget.dataset.id;
                const price = Number(event.currentTarget.dataset.price);
                if (state.score < price) {
                    dom.feedbackLine.textContent = 'No tienes suficientes puntos.';
                    return;
                }
                state.score -= price;
                state.upgrades = state.upgrades || {};
                if (id === 'more-time') state.upgrades.moreTime = (state.upgrades.moreTime || 0) + 1;
                if (id === 'reduce-bell') state.upgrades.reduceBell = (state.upgrades.reduceBell || 0) + 1;
                if (id === 'increase-grace') state.upgrades.increaseGrace = (state.upgrades.increaseGrace || 0) + 1;
                if (id === 'extra-life') state.lives = clamp(state.lives + 1, 1, 10);
                if (id === 'shield') state.upgrades.shields = (state.upgrades.shields || 0) + 1;
                dom.feedbackLine.textContent = 'Mejora comprada!';
                updateHud();
                openIntermissionShop();
            });
        });
        document.getElementById('intermission-shop-back').addEventListener('click', () => showIntermissionSummary());
    }

    function finishIntermission() {
        state.activeMaldicion = state.selectedMaldiciones[0] || null;
        state.enemyHorde = Boolean(state.selectedEnemy);
        if (state.activeMaldicion) {
            applyMaldicion(state.activeMaldicion);
            const { minDiff, maxDiff } = getPassiveDifficultyRange();
            if (state.activeMaldicion === 'numeros-mas-complejos') {
                state.passiveDifficulty = clamp(state.passiveDifficulty + 0.5, minDiff, maxDiff);
            }
            if (state.activeMaldicion === 'numeros-numeros') {
                state.passiveDifficulty = clamp(state.passiveDifficulty + 0.9, minDiff, maxDiff);
            }
        }
        if (state.enemyHorde) {
            const { minDiff, maxDiff } = getPassiveDifficultyRange();
            if (state.selectedEnemy === 'cadencia') {
                state.passiveDifficulty = clamp(state.passiveDifficulty + 0.3, minDiff, maxDiff);
                dom.feedbackLine.textContent = 'Cadencia activada: el siguiente bloque será más acelerado.';
            } else if (state.selectedEnemy === 'campana') {
                state.passiveDifficulty = clamp(state.passiveDifficulty + 0.25, minDiff, maxDiff);
                dom.feedbackLine.textContent = 'Campana activada: el siguiente bloque tiene un desafío extra.';
            }
        }
        dom.intermissionPanel.classList.add('hidden');
        dom.intermissionPanel.classList.remove('active');
        dom.stage.classList.remove('hidden');
        dom.responsePanel.classList.remove('hidden');
        dom.intermissionContinueBtn.disabled = true;
        state.intermissionCategory = null;
        renderEffectStatus();
        updateHud();
        updateMusic();
        renderExercise();
    }

    function rerollIntermissionOptions() {
        if (!state.intermissionCategory) {
            dom.feedbackLine.textContent = 'Primero elige si deseas una maldición o un enemigo.';
            return;
        }
        if (state.freeRerollThisIntermission) {
            state.freeRerollThisIntermission = false;
            dom.feedbackLine.textContent = 'Reroll gratis usado.';
        } else if (state.rerollsRemaining > 0) {
            state.rerollsRemaining -= 1;
            dom.feedbackLine.textContent = `Reroll comprado. Quedan: ${state.rerollsRemaining}`;
        } else {
            dom.feedbackLine.textContent = 'No te quedan rerolls.';
            return;
        }
        dom.intermissionContinueBtn.disabled = true;
        renderCategoryOptions(state.intermissionCategory);
        updateIntermissionHeader();
    }

    dom.intermissionContinueBtn.disabled = true;
    dom.intermissionRerollBtn.disabled = false;
    dom.intermissionContinueBtn.onclick = () => {
        if (!state.selectedMaldiciones.length && !state.selectedEnemy) {
            dom.feedbackLine.textContent = 'Selecciona una opción antes de continuar.';
            return;
        }
        finishIntermission();
    };
    dom.intermissionRerollBtn.onclick = rerollIntermissionOptions;
    renderIntermissionIntro();
    updateIntermissionHeader();
    renderEffectStatus();
    updateMusic();
}

function resetMusic() {
    Object.values(state.audio).forEach(a => { a.pause(); a.currentTime = 0; });
    state.audio = {};
    state.activeTrack = null;
    state.cadenceTrack = null;
    updateMusic();
}

function startMode(mode) {
    if (mode === 'juego' && getStoredScore() < 15) {
        dom.feedbackLine.textContent = 'Juego bloqueado. Consigue 15 puntos en prueba.';
        return;
    }
    
    if (mode !== 'aprendizaje') {
        dom.difficultyModal.classList.remove('hidden');
        state.tempMode = mode;
        return;
    }
    
    state.mode = mode;
    state.difficulty = 'normal';
    state.lives = 3;
    state.score = 0;
    state.streak = 0;
    state.correctCount = 0;
    state.passiveDifficulty = 5;
    state.secondsLeft = 300;
    state.failed = false;
    state.errors = 0;
    state.exercisesUntilIntermission = 7;
    state.exercisesInSession = 0;
    state.intermissionCount = 0;
    state.enemyHorde = false;
    state.intermissionCategory = null;
    state.isTutorialActive = true;
    state.tutorialStep = 0;
    state.activeMaldicion = null;
    state.selectedMaldiciones = [];
    state.selectedEnemy = null;
    state.rerollsRemaining = 3;
    state.upgrades = {};
    dom.restartBtn.disabled = false;
    dom.exitGameBtn.disabled = false;
    document.querySelectorAll('.mode-card').forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
    resetMusic();
    renderEffectStatus();
    dom.learningModal.classList.remove('hidden');
    renderTutorialStep();
    updateHud();
    updateMusic();
}

function startGameWithDifficulty(difficulty) {
    dom.difficultyModal.classList.add('hidden');
    const mode = state.tempMode;
    state.mode = mode;
    state.difficulty = difficulty;
    state.lives = 3;
    state.score = 0;
    state.streak = 0;
    state.correctCount = 0;
    state.failed = false;
    state.errors = 0;
    state.exercisesUntilIntermission = 7;
    state.exercisesInSession = 0;
    state.intermissionCount = 0;
    state.enemyHorde = false;
    state.intermissionCategory = null;
    state.activeMaldicion = null;
    state.selectedMaldiciones = [];
    state.selectedEnemy = null;
    state.rerollsRemaining = 3;
    state.upgrades = {};
    
    const { minDiff, maxDiff } = getPassiveDifficultyRange();
    state.passiveDifficulty = (minDiff + maxDiff) / 2;
    state.secondsLeft = 600;
    dom.restartBtn.disabled = false;
    dom.exitGameBtn.disabled = false;
    document.querySelectorAll('.mode-card').forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
    resetMusic();
    updateHud();
    updateMusic();
    startTimer();
    renderExercise();
}

if (dom.closeLearningModalBtn) {
    dom.closeLearningModalBtn.addEventListener('click', () => {
        const step = tutorialSlides[state.tutorialStep];
        // If in tutorial mode and this is a demo/interactive step, validate before advancing
        if (state.isTutorialActive && step && (step.type === 'demo' || step.type === 'demo-double')) {
            if (!validateTutorialAnswer()) {
                return; // validation failed, don't advance
            }
        }
        // Advance to next step
        if (state.isTutorialActive && state.tutorialStep < tutorialSlides.length - 1) {
            advanceTutorial();
            return;
        }
        // Finish tutorial (on last slide)
        if (state.isTutorialActive && state.tutorialStep === tutorialSlides.length - 1) {
            finishTutorial();
            return;
        }
        // Fallback: close modal (shouldn't normally happen)
        dom.learningModal.classList.add('hidden');
        updateHud();
        updateMusic();
        startTimer();
        renderExercise();
    });
}

if (dom.tutorialBackBtn) {
    dom.tutorialBackBtn.addEventListener('click', () => {
        if (state.tutorialStep > 0) {
            state.tutorialStep -= 1;
            renderTutorialStep();
        }
    });
}

if (dom.openTutorialBtn) {
    dom.openTutorialBtn.addEventListener('click', () => {
        startMode('aprendizaje');
    });
}

dom.difficultyBtns.forEach((button) => {
    button.addEventListener('click', () => {
        startGameWithDifficulty(button.dataset.difficulty);
    });
});

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

dom.musicResetBtn.addEventListener('click', resetMusic);
window.addEventListener('keydown', handleHiddenDebugSequence);

renderAvatarPresence();
setupPlayer();
updateGameLock();
updateHud();
renderEffectStatus();
