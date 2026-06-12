const enemyEffectAssets = {
    sounds: {
        menu: 'Musica 4/Menu nostalgic.mp3',
        telefraggerTeleport: 'sonidos (4to)/Teleport.mp3',
        telefraggerAmbush: 'sonidos (4to)/Telefragger_Ambush.ogg',
        operatorSpawn: 'sonidos (4to)/Operator_Spawn.ogg',
        operatorTicking: 'sonidos (4to)/Operator_Ticking.ogg',
        icbmStrike: 'sonidos (4to)/ICBMStrike.mp3',
        martLoop: 'sonidos (4to)/MartLoop.mp3',
        huskOhNo: 'sonidos (4to)/Husk_-_OhNoHusk_v2.ogg',
        tallerHuskLoop: 'sonidos (4to)/TallerHuskLoop.ogg',
        nilSpawn: 'sonidos (4to)/Nil spawn.mp3',
        cadenceSpawn: 'sonidos (4to)/Cadence_Spawn_Alarm.ogg',
        cad1: 'sonidos (4to)/Cad_lv1.wav',
        cad2: 'sonidos (4to)/Cad_lv2.wav',
        cad3: 'sonidos (4to)/Cad_lv3.wav',
        cad4: 'sonidos (4to)/Cad_lv4.wav',
        bell1: 'sonidos (4to)/Bell_Player_Contact_Sound.wav',
        bell2: 'sonidos (4to)/Bell_Player_Contact_2.ogg',
        bell3: 'sonidos (4to)/Bell_Player_Contact_3.ogg',
        bellDeath: 'sonidos (4to)/Player_Bell_Death.ogg'
    },
    images: {
        icbm: 'img (4to)/ICBM.png',
        icbmMarker: 'img (4to)/ICBM_Marker.png',
        icbmExplosion: 'img (4to)/icbm explosion.gif',
        mart: 'img (4to)/Mart animation.gif',
        husk: 'img (4to)/Husk.png',
        huskJumpscare: 'img (4to)/husk jumpscare.png',
        nil: 'img (4to)/NIL.png'
    }
};

function createEnemyEffects(config) {
    const root = config.root || document.body;
    const stageLeft = config.stageLeft;
    const stageRight = config.stageRight;
    const getEnemy = config.getEnemy;
    const audio = {};
    const timeouts = [];
    const intervals = [];
    const floating = [];
    const contextTimeouts = {};
    const contextIntervals = {};
    const contextFloating = {};
    let currentContext = null;
    const activeEnemies = new Set();
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let activeEnemy = null;
    let activeStage = null;
    let activeAvatar = null;
    let rafId = null;
    let nilLastSound = 0;
    let bellReactivations = 0;
    let martSlide = false;

    function sound(name, options = {}) {
        if (!audio[name]) {
            audio[name] = new Audio(enemyEffectAssets.sounds[name]);
            audio[name].loop = Boolean(options.loop);
        }
        audio[name].loop = Boolean(options.loop);
        audio[name].volume = options.volume ?? 0.42;
        audio[name].pause();
        audio[name].currentTime = 0;
        audio[name].play().catch(() => {});
        return audio[name];
    }

    function stopSound(name) {
        if (!audio[name]) return;
        audio[name].pause();
        audio[name].currentTime = 0;
    }

    function stopAllSounds() {
        Object.entries(audio).forEach(([name, item]) => {
            if (name === 'menu') return;
            item.pause();
            item.currentTime = 0;
            item.loop = false;
        });
    }

    function later(callback, delay) {
        const timeout = setTimeout(callback, delay);
        timeouts.push(timeout);
        if (currentContext) {
            contextTimeouts[currentContext] = contextTimeouts[currentContext] || [];
            contextTimeouts[currentContext].push(timeout);
        }
        return timeout;
    }

    function repeat(callback, delay) {
        const interval = setInterval(callback, delay);
        intervals.push(interval);
        if (currentContext) {
            contextIntervals[currentContext] = contextIntervals[currentContext] || [];
            contextIntervals[currentContext].push(interval);
        }
        return interval;
    }

    function track(element, state) {
        floating.push({ element, ...state });
        if (currentContext) {
            contextFloating[currentContext] = contextFloating[currentContext] || [];
            contextFloating[currentContext].push({ element, ...state });
        }
        return element;
    }

    function ensureLoop() {
        if (rafId) return;
        const tick = () => {
            floating.forEach((item) => item.update(item));
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
    }

    function clearFloating() {
        floating.splice(0).forEach((item) => item.element.remove());
        Object.values(contextFloating).forEach(arr => arr.forEach((item) => { try { item.element.remove(); } catch(e){} }));
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    function clearTimers() {
        timeouts.splice(0).forEach(clearTimeout);
        intervals.splice(0).forEach(clearInterval);
        Object.values(contextTimeouts).forEach(arr => arr.forEach(clearTimeout));
        Object.values(contextIntervals).forEach(arr => arr.forEach(clearInterval));
    }

    function clearClasses() {
        document.body.classList.remove('operator-sway-active', 'bell-distort', 'moriste-page');
        root.classList.remove('enemy-effect-telefragger', 'enemy-effect-operator', 'enemy-effect-icbm', 'enemy-effect-nil');
        if (stageLeft) stageLeft.classList.remove('telefrag-side', 'icbm-zone', 'nil-zone');
        if (stageRight) stageRight.classList.remove('telefrag-side', 'icbm-zone', 'nil-zone');
        if (activeAvatar) activeAvatar.classList.remove('operator-pendulum', 'nil-fade-avatar');
    }

    function reset() {
        clearTimers();
        clearFloating();
        stopAllSounds();
        clearClasses();
        document.querySelectorAll('.enemy-extra-control, .icbm-fall, .icbm-boom').forEach((node) => node.remove());
        if (stageLeft) {
            stageLeft.innerHTML = '';
            stageLeft.classList.remove('visible');
        }
        if (stageRight) {
            stageRight.innerHTML = '';
            stageRight.classList.remove('visible');
        }
        activeStage = null;
        activeAvatar = null;
        nilLastSound = 0;
    }

    function resetContext(ctx) {
        if (!ctx) return reset();
        (contextTimeouts[ctx] || []).forEach(clearTimeout);
        (contextIntervals[ctx] || []).forEach(clearInterval);
        (contextFloating[ctx] || []).forEach((item) => { try { item.element.remove(); } catch (e) {} });
        contextTimeouts[ctx] = [];
        contextIntervals[ctx] = [];
        contextFloating[ctx] = [];
        activeEnemies.delete(ctx);
    }

    function emit(name, data) {
        try {
            document.dispatchEvent(new CustomEvent('enemy-' + name, { detail: data }));
        } catch (e) { console.error('emit failed', e); }
    }

    function playMenuMusic() {
        if (!audio.menu) {
            audio.menu = new Audio(enemyEffectAssets.sounds.menu);
            audio.menu.loop = true;
            audio.menu.volume = 0.28;
        }
        audio.menu.play().catch(() => {});
    }

    function bindMusicUnlock() {
        const unlock = () => playMenuMusic();
        document.addEventListener('pointerdown', unlock);
        document.addEventListener('keydown', unlock);
        playMenuMusic();
    }

    function getOtherStage(stage) {
        if (!stageLeft || !stageRight) return stage;
        return stage === stageLeft ? stageRight : stageLeft;
    }

    function moveStageTo(stage) {
        if (!activeAvatar || !stage) return;
        const previous = activeAvatar.parentElement;
        if (previous) previous.classList.remove('visible', 'telefrag-side');
        stage.innerHTML = '';
        stage.appendChild(activeAvatar);
        stage.classList.add('visible', 'telefrag-side');
        activeStage = stage;
    }

    function telefragJump() {
        sound('telefraggerAmbush', { volume: 0.9 });
        moveStageTo(getOtherStage(activeStage));
    }

    function startTelefragger() {
        // improved telefragger: teleports with warning, then slowly tracks mouse; collides emit hits
        if (!activeStage) return;
        root.classList.add('enemy-effect-telefragger');
        activeStage.classList.add('telefrag-side');
        const ctx = currentContext || ('telefragger_' + Math.random().toString(36).slice(2,8));

        function spawnTelefraggerInstance(opts = {}) {
            const el = document.createElement('img');
            el.src = 'img (4to)/telefragger animation.gif';
            el.alt = '';
            el.className = 'telefragger-flyer';
            el.style.position = 'fixed';
            // spawn relative to mouse movement/direction
            const dx = (Math.random() > 0.5 ? 1 : -1) * (150 + Math.random() * 300);
            const dy = (Math.random() > 0.5 ? 1 : -1) * (60 + Math.random() * 160);
            const spawnX = clamp(mouse.x + dx, 20, window.innerWidth - 20);
            const spawnY = clamp(mouse.y + dy, 20, window.innerHeight - 20);
            el.style.left = `${spawnX}px`;
            el.style.top = `${spawnY}px`;
            el.style.width = '80px';
            document.body.appendChild(el);
            const fastBurst = opts.maldiciones && opts.maldiciones.includes('teleports-mortales');
            const followDuration = fastBurst ? 2000 : 4000;
            // if altos nervios curse: make attack set passive difficulty to max via event
            const altosNervios = opts.maldiciones && opts.maldiciones.includes('altos-nervios');
            track(el, {
                x: spawnX,
                y: spawnY,
                created: performance.now(),
                update(item) {
                    const age = performance.now() - item.created;
                    const easing = age < followDuration ? (fastBurst ? 0.06 : 0.03) : 0.004;
                    item.x += (mouse.x - item.x) * easing;
                    item.y += (mouse.y - item.y) * easing;
                    item.element.style.transform = `translate(${item.x - 40}px, ${item.y - 40}px)`;
                    // collision detection
                    const dist = Math.hypot(item.x - mouse.x, item.y - mouse.y);
                    if (dist < 34) {
                        emit('hit', { enemy: 'telefragger', damage: 1, fatal: false, altosNervios });
                        try { item.element.remove(); } catch (e) {}
                    }
                }
            });
            // remove after 20-30s
            later(() => { try { el.remove(); } catch(e){} }, 20000 + Math.random() * 10000);
        }

        function scheduleTeleportCycle(opts = {}) {
            const delay = 7000 + Math.random() * 2000;
            const warnBefore = 1000 + Math.random() * 500;
            later(() => sound('telefraggerTeleport', { volume: 0.55 }), delay - warnBefore);
            later(() => {
                sound('telefraggerAmbush', { volume: 0.9 });
                spawnTelefraggerInstance(opts);
                scheduleTeleportCycle(opts);
            }, delay);
        }

        // if options were passed via start caller, use them
        // fallback: schedule at least one cycle
        scheduleTeleportCycle({ maldiciones: (typeof activeEnemy === 'string' ? [] : []) });
    }

    function startOperator() {
        root.classList.add('enemy-effect-operator');
        document.body.classList.add('operator-sway-active');
        if (activeAvatar) activeAvatar.classList.add('operator-pendulum');
        sound('operatorSpawn', { volume: 0.58 });
        sound('operatorTicking', { loop: true, volume: 0.38 });
        later(() => {
            stopSound('operatorTicking');
            if (activeAvatar) activeAvatar.classList.remove('operator-pendulum');
            document.body.classList.remove('operator-sway-active');
        }, 5000);
    }

    function startIcbm() {
        if (!activeStage || !activeAvatar) return;
        root.classList.add('enemy-effect-icbm');
        activeStage.classList.add('icbm-zone');
        activeAvatar.src = enemyEffectAssets.images.icbmMarker;
        activeAvatar.classList.add('icbm-marker-avatar');
        sound('icbmStrike', { volume: 0.58 });
        later(() => {
            const markerRect = activeAvatar.getBoundingClientRect();
            const targetX = markerRect.left + markerRect.width / 2;
            const targetY = markerRect.top + markerRect.height / 2;
            const missile = document.createElement('img');
            missile.src = enemyEffectAssets.images.icbm;
            missile.alt = '';
            missile.className = 'icbm-fall';
            missile.style.left = `${targetX}px`;
            missile.style.top = `${-Math.max(220, markerRect.height * 2)}px`;
            missile.style.width = `${Math.max(82, Math.min(150, markerRect.width * 0.75))}px`;
            document.body.appendChild(missile);

            requestAnimationFrame(() => {
                missile.style.top = `${targetY - markerRect.height * 0.62}px`;
            });

            later(() => {
                const boom = document.createElement('img');
                boom.src = enemyEffectAssets.images.icbmExplosion;
                boom.alt = '';
                boom.className = 'icbm-boom';
                boom.style.left = `${targetX}px`;
                boom.style.top = `${targetY}px`;
                activeAvatar.src = enemyEffectAssets.images.icbm;
                activeAvatar.classList.remove('icbm-marker-avatar');
                activeAvatar.classList.add('icbm-landed-avatar');
                document.body.appendChild(boom);
                // emit an ICBM hit (2 life damage)
                emit('hit', { enemy: 'icbm', damage: 2 });
                missile.remove();
                later(() => boom.remove(), 1700);
            }, 420);
        }, 4000);
    }

    function addMartControl() {
        const host = config.toolsHost || root;
        martSlide = false;
        const label = document.createElement('label');
        label.className = 'enemy-extra-control mart-slide-toggle';
        label.innerHTML = '<input type="checkbox"> <span>Mart deslizador</span>';
        const input = label.querySelector('input');
        input.addEventListener('change', () => {
            martSlide = input.checked;
        });
        host.appendChild(label);
    }

    function startMart() {
        addMartControl();
        sound('martLoop', { loop: true, volume: 0.28 });
        const mart = document.createElement('img');
        mart.src = enemyEffectAssets.images.mart;
        mart.alt = '';
        mart.className = 'mart-follower';
        mart.style.opacity = '1';
        mart.style.display = 'block';
        mart.style.zIndex = '2147483647';
        mart.style.mixBlendMode = 'normal';
        mart.style.pointerEvents = 'none';
        document.body.appendChild(mart);
        track(mart, {
            x: mouse.x,
            y: mouse.y,
            vx: 0,
            vy: 0,
            update(item) {
                const dx = mouse.x - item.x;
                const dy = mouse.y - item.y;
                if (martSlide) {
                    item.vx = item.vx * 0.94 + dx * 0.006;
                    item.vy = item.vy * 0.94 + dy * 0.006;
                    item.x += item.vx;
                    item.y += item.vy;
                } else {
                    const distance = Math.hypot(dx, dy);
                    const easing = Math.min(0.08, Math.max(0.006, distance / 7000));
                    item.x += dx * easing;
                    item.y += dy * easing;
                }
                item.element.style.transform = `translate(${item.x - 74}px, ${item.y - 74}px)`;
                // collision check with cursor
                const dist = Math.hypot(item.x - mouse.x, item.y - mouse.y);
                if (dist < 46) {
                    // emit mart hit (time penalty + mouse disable)
                    emit('hit', { enemy: 'mart', damage: 0, timePenalty: 20 });
                    try { item.element.remove(); } catch (e) {}
                }
            }
        });
        ensureLoop();
    }

    function startHusk(options = {}) {
        sound('huskOhNo', { volume: 0.55 });
        sound('tallerHuskLoop', { loop: true, volume: 0.34 });
        const baseCount = options.count || (options.maldiciones && options.maldiciones.includes('conga') ? 3 : 1);
        const delayMs = options.maldiciones && options.maldiciones.includes('proximidad') ? 1000 : (options.maldiciones && options.maldiciones.includes('lejania') ? 4000 : 2000);
        const chain = [{ get x() { return mouse.x; }, get y() { return mouse.y; } }];
        for (let i = 0; i < baseCount; i += 1) {
            const husk = document.createElement('img');
            husk.src = enemyEffectAssets.images.huskJumpscare;
            husk.alt = '';
            husk.className = 'husk-shadow';
            document.body.appendChild(husk);
            const leader = chain[i];
            const state = track(husk, {
                x: mouse.x,
                y: mouse.y,
                samples: [],
                life: performance.now(),
                update(item) {
                    item.samples.push({ x: leader.x, y: leader.y, at: performance.now() });
                    while (item.samples.length > 60 && performance.now() - item.samples[0].at > delayMs + 500) {
                        item.samples.shift();
                    }
                    const delayed = item.samples.find((sample) => performance.now() - sample.at >= delayMs) || item.samples[0];
                    if (!delayed) return;
                    item.x = delayed.x;
                    item.y = delayed.y;
                    item.element.style.transform = `translate(${item.x - 34}px, ${item.y - 46}px)`;
                    // collision detection
                    const dx = item.x - mouse.x;
                    const dy = item.y - mouse.y;
                    if (Math.hypot(dx, dy) < (options.maldiciones && options.maldiciones.includes('miedo') ? 64 : 36)) {
                        emit('hit', { enemy: 'husk', damage: 1 });
                        item.element.remove();
                    }
                }
            });
            chain.push(state);
        }
        ensureLoop();
    }

    function startNil() {
        root.classList.add('enemy-effect-nil');
        if (activeStage) activeStage.classList.add('nil-zone');
        if (activeAvatar) activeAvatar.classList.add('nil-fade-avatar');
        sound('nilSpawn', { volume: 0.52 });
        track(activeAvatar || document.body, {
            update() {
                if (!activeAvatar) return;
                const rect = activeAvatar.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const distance = Math.hypot(mouse.x - cx, mouse.y - cy);
                const maxDistance = Math.min(window.innerWidth, window.innerHeight) * 0.5;
                const opacity = Math.max(0, 1 - distance / maxDistance);
                activeAvatar.style.opacity = opacity.toFixed(3);
                if (opacity > 0.72 && performance.now() - nilLastSound > 4000) {
                    nilLastSound = performance.now();
                    sound('nilSpawn', { volume: 0.48 });
                }
            }
        });
        ensureLoop();
    }

    function startCadence() {
        sound('cadenceSpawn', { volume: 0.54 });
        if (activeStage && !activeStage.querySelector('.cadence-instrument-cluster')) {
            const instrumentCluster = document.createElement('div');
            instrumentCluster.className = 'cadence-instrument-cluster';
            instrumentCluster.innerHTML = `
                <span class="cadence-instrument-bar"></span>
                <span class="cadence-instrument-bar"></span>
                <span class="cadence-instrument-bar"></span>
            `;
            activeStage.appendChild(instrumentCluster);
        }
        const levels = ['cad1', 'cad2', 'cad3', 'cad4'];
        levels.forEach((level, index) => {
            later(() => sound(level, { loop: index === 3, volume: 0.58 }), index * 10000);
            if (index < 3) later(() => stopSound(level), (index + 1) * 10000);
        });
    }

    function triggerBellReact() {
        if (activeEnemy !== 'bell') return;
        bellReactivations += 1;
        document.body.classList.remove('bell-distort');
        document.body.offsetHeight;
        document.body.classList.add('bell-distort');
        later(() => document.body.classList.remove('bell-distort'), 900);
        if (bellReactivations === 1) sound('bell1', { volume: 0.52 });
        if (bellReactivations === 2) sound('bell2', { volume: 0.52 });
        if (bellReactivations === 3) sound('bell3', { volume: 0.52 });
        if (bellReactivations >= 4) {
            sound('bellDeath', { volume: 0.64 });
            document.body.className = 'moriste-page';
            document.body.innerHTML = '<main class="death-screen"><h1>moriste</h1><p>quieres reintentar?</p><button type="button" onclick="location.reload()">Reintentar</button></main>';
        }
    }

    function startBell() {
        bellReactivations = 0;
        sound('bell1', { volume: 0.52 });
        if (activeAvatar) {
            activeAvatar.addEventListener('pointerenter', triggerBellReact, { once: true });
        }
    }

    function start(enemyKey, options = {}) {
        // if options.replace is explicitly false, keep other enemies running; otherwise reset everything
        if (options.replace !== false) reset();
        currentContext = enemyKey;
        activeEnemies.add(enemyKey);
        activeEnemy = enemyKey;
        activeStage = options.stage || (getEnemy(enemyKey)?.side === 'left' ? stageLeft : stageRight);
        const enemyMeta = getEnemy(enemyKey) || {};
        if (activeStage && options.replace !== false) {
            activeStage.innerHTML = '';
        }
        if (activeStage && !options.avatar) {
            const existingAvatar = activeStage.querySelector('img');
            if (!existingAvatar) {
                const stageAvatar = document.createElement('img');
                stageAvatar.src = enemyMeta.animation || enemyMeta.icon || '';
                stageAvatar.alt = enemyMeta.label || enemyKey;
                stageAvatar.className = 'enemy-avatar';
                activeStage.appendChild(stageAvatar);
            }
        }
        activeAvatar = options.avatar || activeStage?.querySelector('img') || null;
        if (activeStage) {
            activeStage.classList.add('visible');
        }
        const starters = {
            telefragger: startTelefragger,
            operator: startOperator,
            icbm: startIcbm,
            mart: startMart,
            husk: startHusk,
            nil: startNil,
            cadence: startCadence,
            bell: startBell
        };
        try {
            if (starters[enemyKey]) starters[enemyKey](options);
        } finally {
            currentContext = null;
        }
    }

    window.addEventListener('pointermove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    return {
        start,
        reset,
        playMenuMusic,
        bindMusicUnlock,
        triggerBellReact
    };
}
