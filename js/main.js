import { verbs } from '../data/verbs.js';
import { objects, TILE, W, H, walkable, drawWorld, region } from './world.js';
import { drawPlayer } from './player.js';
import { load, save, clear } from './save.js';
import { showBook } from './dictionary.js';
import { runChallenge } from './challenges.js';

const state = load();
state.found ??= {};
state.done ??= {};
state.mastery ??= {};
state.position ??= { x: 7, y: 7 };
state.coins ??= 0;
state.cooldowns ??= {}; // Lagrer feilbesvarte oppgaver og hvilke andre verb som er forsøkt.

const $ = id => document.getElementById(id);
const canvas = $('game');
const ctx = canvas.getContext('2d');
const modal = $('modal');
const player = { x: state.position.x, y: state.position.y };
const keys = new Set();
let modalOpen = false;
let near = null;
let prev = 0;
let lastSave = 0;
let lastArea = '';

// --------------------------------------------------
// FEM ANDRE VERBOPPGAVER MELLOM TO FORSØK
// --------------------------------------------------
const REQUIRED_OTHER_VERBS = 5;
const taskKey = (id, type) => `${id}:${type}`;

function remainingLock(id, type) {
    const lock = state.cooldowns[taskKey(id, type)];
    if (!lock) return 0;
    const distinct = new Set((lock.otherVerbs || []).map(String));
    return Math.max(0, REQUIRED_OTHER_VERBS - distinct.size);
}

function registerAnswer(id, type, correct) {
    const currentId = String(id);
    // Ett besvart spørsmål teller for alle andre aktive sperrer.
    // Samme verb teller aldri mer enn én gang for en gitt sperre.
    for (const [key, lock] of Object.entries(state.cooldowns)) {
        if (key === taskKey(id, type)) continue;
        const lockedVerbId = key.split(':')[0];
        if (lockedVerbId === currentId) continue;
        lock.otherVerbs ??= [];
        if (!lock.otherVerbs.map(String).includes(currentId)) {
            lock.otherVerbs.push(currentId);
        }
        if (new Set(lock.otherVerbs.map(String)).size >= REQUIRED_OTHER_VERBS) {
            delete state.cooldowns[key];
        }
    }
    const key = taskKey(id, type);
    if (correct) {
        delete state.cooldowns[key];
    } else {
        // Feil på nytt starter en ny sperre på fem andre verb.
        state.cooldowns[key] = { otherVerbs: [] };
    }
    persist();
}

function lockMessage(remaining, returnToBook = null) {
    openModal(`
        <h2>⏳ Prøv igjen litt senere</h2>
        <p>Du må svare på <b>${remaining} andre verboppgaver</b> før du kan prøve denne igjen.</p>
        <p class="muted">Både riktige og feil svar teller, men hvert annet verb teller bare én gang.</p>
        <button class="primary" id="backFromLock">${returnToBook ? 'Tilbake til ordboken' : 'Tilbake til eventyret'}</button>
    `);
    $('backFromLock').onclick = () => {
        if (returnToBook) returnToBook.refresh();
        else closeModal();
    };
}

// --------------------------------------------------
// JOYSTICK OG MODALER
// --------------------------------------------------
const joystick = $('joystick');
const joystickKnob = $('joystickKnob');
let joystickX = 0;
let joystickY = 0;
let joystickPointer = null;

function resetJoystick() {
    joystickPointer = null;
    joystickX = 0;
    joystickY = 0;
    if (joystickKnob) joystickKnob.style.transform = 'translate(-50%, -50%)';
}

function updateJoystick(e) {
    if (!joystick || !joystickKnob) return;
    const rect = joystick.getBoundingClientRect();
    const dx = e.clientX - rect.left - rect.width / 2;
    const dy = e.clientY - rect.top - rect.height / 2;
    const maxDistance = rect.width * 0.28;
    const distance = Math.hypot(dx, dy);
    const scale = distance > maxDistance ? maxDistance / distance : 1;
    const x = dx * scale;
    const y = dy * scale;
    joystickX = x / maxDistance;
    joystickY = y / maxDistance;
    if (Math.hypot(joystickX, joystickY) < 0.15) {
        joystickX = 0;
        joystickY = 0;
    }
    joystickKnob.style.transform =
        `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
}

if (joystick) {
    joystick.addEventListener('pointerdown', e => {
        if (modalOpen || joystickPointer !== null) return;
        e.preventDefault();
        joystickPointer = e.pointerId;
        joystick.setPointerCapture(e.pointerId);
        updateJoystick(e);
    });
    joystick.addEventListener('pointermove', e => {
        if (e.pointerId !== joystickPointer) return;
        e.preventDefault();
        updateJoystick(e);
    });
    const endJoystick = e => {
        if (e.pointerId === joystickPointer) resetJoystick();
    };
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) {
        joystick.addEventListener(ev, endJoystick);
    }
    joystick.addEventListener('contextmenu', e => e.preventDefault());
}

function openModal(html) {
    modalOpen = true;
    keys.clear();
    resetJoystick();
    modal.classList.remove('hidden');
    $('modalContent').innerHTML = html;
}
function closeModal() {
    modalOpen = false;
    modal.classList.add('hidden');
    $('modalContent').innerHTML = '';
}
$('closeModal').onclick = closeModal;
modal.onclick = e => { if (e.target === modal) closeModal(); };

// --------------------------------------------------
// OMRÅDEOVERSIKT
// --------------------------------------------------
const areas = [
    { name: 'Landsbyen', icon: '🏡' },
    { name: 'Den ville skogen', icon: '🌲' },
    { name: 'Elvedalen', icon: '🌊' },
    { name: 'Steinruinene', icon: '🪨' },
    { name: 'Den magiske lysningen', icon: '✨' }
];
const areaObjects = new Map(areas.map(a => [a.name, []]));
for (const obj of objects) {
    const name = region(obj.x + 0.5, obj.y + 0.5);
    if (!areaObjects.has(name)) areaObjects.set(name, []);
    areaObjects.get(name).push(obj);
}
function updateAreas() {
    const container = $('areaOverview');
    if (!container) return;
    const currentArea = region(player.x, player.y);
    let total = 0;
    let done = 0;
    let html = '';
    for (const area of areas) {
        const missions = areaObjects.get(area.name) || [];
        const completed = missions.filter(o => Boolean(state.done[o.id])).length;
        total += missions.length;
        done += completed;
        const finished = missions.length > 0 && completed === missions.length;
        html += `<div class="areaRow ${area.name === currentArea ? 'current' : ''}">
            <span>${area.icon} ${area.name}</span>
            <span class="areaCount ${finished ? 'complete' : ''}">${completed}/${missions.length}${finished ? ' ✓' : ''}</span>
        </div>`;
    }
    container.innerHTML = html + `<div class="areaTotal"><span>Totalt</span><span>${done}/${total}</span></div>`;
}

function updateHUD() {
    const foundCount = verbs.filter(v => Boolean(state.found[v.id])).length;
    const doneCount = objects.filter(o => Boolean(state.done[o.id])).length;
    const starCount = Object.values(state.mastery).reduce((s, n) => s + Number(n || 0), 0);
    $('coins').textContent = `🪙 ${state.coins}`;
    $('found').textContent = `📖 ${foundCount}/${verbs.length}`;
    $('stars').textContent = `⭐ ${starCount}`;
    $('location').textContent = region(player.x, player.y);
    if (foundCount < 3) {
        $('questText').textContent = `Oppdag ${3 - foundCount} nye verb for å bli ordsamler.`;
    } else if (foundCount < 20) {
        $('questText').textContent = `Bra! Finn ${20 - foundCount} nye verb til.`;
    } else if (foundCount < verbs.length) {
        $('questText').textContent = `Samle alle verbene! ${verbs.length - foundCount} gjenstår.`;
    } else {
        $('questText').textContent = 'Alle verb oppdaget! Få fem stjerner på hvert ord.';
    }
    $('objective').textContent = `${foundCount} oppdaget · ${doneCount} utfordringer fullført`;
    $('questProgress').style.width = `${100 * foundCount / verbs.length}%`;
    updateAreas();
}
function persist() {
    state.position = {
        x: Math.round(player.x * 100) / 100,
        y: Math.round(player.y * 100) / 100
    };
    save(state);
}

// --------------------------------------------------
// UTFORDRINGER I VERDEN
// --------------------------------------------------
function interact() {
    if (modalOpen || !near) return;
    const p = near;
    if (state.done[p.id]) {
        openModal(`<h2>✅ Allerede fullført</h2>
            <p>Du har løst denne utfordringen. Øv videre i ordboken!</p>
            <button class="primary" id="okay">Tilbake</button>`);
        $('okay').onclick = closeModal;
        return;
    }
    const remaining = remainingLock(p.id, p.type);
    if (remaining) {
        lockMessage(remaining);
        return;
    }
    const v = verbs[p.id];
    if (!v) return;
    runChallenge(openModal, closeModal, v, p.type, ok => {
        registerAnswer(v.id, p.type, ok);
        if (ok) {
            state.done[p.id] = true;
            state.found[p.id] = true;
            state.mastery[p.id] = Math.min(5, (state.mastery[p.id] || 0) + 1);
            state.coins += 10 + (p.type === 'portal' ? 15 : 0);
        } else {
            state.coins += 1;
        }
        persist();
        updateHUD();
    });
}
$('actionBtn').onclick = interact;

// --------------------------------------------------
// ORDBOK – BEHOLD FILTER OG VALGT VERB
// --------------------------------------------------
$('bookBtn').onclick = () => {
    let book = null;
    book = showBook(openModal, state, v => {
        const types = ['chest', 'crystal', 'rune', 'bell', 'portal'];
        const level = Math.min(4, Number(state.mastery[v.id] || 0));
        const type = types[level];
        const remaining = remainingLock(v.id, type);
        if (remaining) {
            lockMessage(remaining, book);
            return;
        }
        runChallenge(openModal, closeModal, v, type, ok => {
            registerAnswer(v.id, type, ok);
            if (ok) {
                state.mastery[v.id] = Math.min(5, Number(state.mastery[v.id] || 0) + 1);
                state.coins += 5;
            }
            persist();
            updateHUD();
            // challenges.js lukker modalen før callbacken.
            // Åpne ordboken med samme filter og samme valgte ord.
            if (book) book.refresh();
        });
    }, remainingLock);
};

$('resetBtn').onclick = () => {
    if (confirm('Slette all fremgang på denne enheten og starte på nytt?')) {
        clear();
        location.reload();
    }
};

// --------------------------------------------------
// TASTATUR OG BEVEGELSE
// --------------------------------------------------
const directions = {
    arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down',
    arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right'
};
window.addEventListener('keydown', e => {
    if (modalOpen) {
        if (e.key === 'Escape') closeModal();
        return;
    }
    const k = e.key.toLowerCase();
    const dir = directions[k];
    if (dir) { e.preventDefault(); keys.add(dir); }
    if (k === ' ' || k === 'enter') { e.preventDefault(); interact(); }
    if (k === 'b') $('bookBtn').click();
});
window.addEventListener('keyup', e => {
    const dir = directions[e.key.toLowerCase()];
    if (dir) keys.delete(dir);
});
window.addEventListener('blur', () => { keys.clear(); resetJoystick(); });

function loop(now) {
    const dt = Math.min(0.045, (now - prev) / 1000 || 0);
    prev = now;
    let moving = false;
    if (!modalOpen) {
        let dx = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0) + joystickX;
        let dy = (keys.has('down') ? 1 : 0) - (keys.has('up') ? 1 : 0) + joystickY;
        if (dx || dy) {
            const magnitude = Math.hypot(dx, dy);
            const strength = Math.min(1, magnitude);
            dx = dx / magnitude * strength;
            dy = dy / magnitude * strength;
            const speed = 4.2 * dt;
            const x = player.x + dx * speed;
            const y = player.y + dy * speed;
            const radius = 0.22;
            if (walkable(x - radius, player.y - radius) &&
                walkable(x + radius, player.y + radius)) player.x = x;
            if (walkable(player.x - radius, y - radius) &&
                walkable(player.x + radius, y + radius)) player.y = y;
            moving = true;
        }
    }
    const cam = {
        x: Math.max(0, Math.min(W * TILE - canvas.width, player.x * TILE - canvas.width / 2)),
        y: Math.max(0, Math.min(H * TILE - canvas.height, player.y * TILE - canvas.height / 2))
    };
    drawWorld(ctx, cam, now, state.done);
    drawPlayer(ctx, player.x, player.y, cam, now, moving);
    near = null;
    let best = 1.7;
    for (const o of objects) {
        const distance = Math.hypot(player.x - o.x - 0.5, player.y - o.y - 0.5);
        if (distance < best) { best = distance; near = o; }
    }
    const names = {
        chest: 'skattekiste', crystal: 'krystall', rune: 'runestein',
        bell: 'lytteklokke', portal: 'portal'
    };
    $('nearby').textContent = near
        ? (state.done[near.id] ? '✓ Fullført' :
            remainingLock(near.id, near.type)
                ? `⏳ ${remainingLock(near.id, near.type)} andre oppgaver igjen`
                : '✨ Ny utfordring') + ': ' + (names[near.type] || 'oppgave') + ' · trykk Undersøk'
        : 'Utforsk kartet og finn lysende gjenstander';
    $('actionBtn').disabled = !near || modalOpen;
    $('actionBtn').style.opacity = near && !modalOpen ? '1' : '.55';
    const currentArea = region(player.x, player.y);
    if (currentArea !== lastArea) {
        lastArea = currentArea;
        $('location').textContent = currentArea;
        updateAreas();
    }
    if (now - lastSave > 3000) { lastSave = now; persist(); }
    requestAnimationFrame(loop);
}
updateHUD();
requestAnimationFrame(loop);
