
import { verbs } from '../data/verbs.js';
import {
    objects, TILE, W, H,
    walkable, drawWorld, region
} from './world.js';
import { drawPlayer } from './player.js';
import { load, save, clear } from './save.js';
import { showBook } from './dictionary.js';
import { runChallenge } from './challenges.js';

// --------------------------------------------------
// SPILLSTATUS
// --------------------------------------------------

const state = load();

state.found ??= {};
state.done ??= {};
state.mastery ??= {};
state.position ??= { x: 7, y: 7 };
state.coins ??= 0;

const $ = id => document.getElementById(id);

const canvas = $('game');
const ctx = canvas.getContext('2d');
const modal = $('modal');

const player = {
    x: state.position.x,
    y: state.position.y
};

const keys = new Set();

let modalOpen = false;
let near = null;
let prev = 0;
let lastSave = 0;
let lastArea = '';

// --------------------------------------------------
// JOYSTICK
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

    if (joystickKnob) {
        joystickKnob.style.transform =
            'translate(-50%, -50%)';
    }
}

function updateJoystick(e) {
    if (!joystick || !joystickKnob) return;

    const rect = joystick.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    const maxDistance = rect.width * 0.28;
    const distance = Math.hypot(dx, dy);

    const scale = distance > maxDistance
        ? maxDistance / distance
        : 1;

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

    function endJoystick(e) {
        if (e.pointerId !== joystickPointer) return;
        resetJoystick();
    }

    joystick.addEventListener('pointerup', endJoystick);
    joystick.addEventListener('pointercancel', endJoystick);
    joystick.addEventListener('lostpointercapture', endJoystick);

    joystick.addEventListener('contextmenu', e => {
        e.preventDefault();
    });
}

// --------------------------------------------------
// MODALER
// --------------------------------------------------

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

modal.onclick = e => {
    if (e.target === modal) closeModal();
};

// --------------------------------------------------
// OMRÅDER
// --------------------------------------------------

const areas = [
    { name: 'Landsbyen', icon: '🏡' },
    { name: 'Den ville skogen', icon: '🌲' },
    { name: 'Elvedalen', icon: '🌊' },
    { name: 'Steinruinene', icon: '🪨' },
    { name: 'Den magiske lysningen', icon: '✨' }
];

const areaObjects = new Map();

for (const area of areas) {
    areaObjects.set(area.name, []);
}

for (const obj of objects) {
    const name = region(obj.x + 0.5, obj.y + 0.5);

    if (!areaObjects.has(name)) {
        areaObjects.set(name, []);
    }

    areaObjects.get(name).push(obj);
}

function getAreaStats(name) {
    const missions = areaObjects.get(name) || [];

    return {
        total: missions.length,
        completed: missions.filter(
            obj => Boolean(state.done[obj.id])
        ).length
    };
}

function updateAreas() {
    const container = $('areaOverview');
    if (!container) return;

    const currentArea = region(player.x, player.y);

    let html = '';
    let totalAll = 0;
    let completedAll = 0;

    for (const area of areas) {
        const stats = getAreaStats(area.name);

        totalAll += stats.total;
        completedAll += stats.completed;

        const current = area.name === currentArea;

        const finished =
            stats.total > 0 &&
            stats.completed === stats.total;

        html += `
            <div class="areaRow ${current ? 'current' : ''}">
                <span>${area.icon} ${area.name}</span>

                <span class="areaCount ${finished ? 'complete' : ''}">
                    ${stats.completed}/${stats.total}
                    ${finished ? '✓' : ''}
                </span>
            </div>
        `;
    }

    html += `
        <div class="areaTotal">
            <span>Totalt</span>
            <span>${completedAll}/${totalAll}</span>
        </div>
    `;

    container.innerHTML = html;
}

// --------------------------------------------------
// HUD
// --------------------------------------------------

function updateHUD() {
    const count = verbs.filter(
        v => Boolean(state.found[v.id])
    ).length;

    const doneCount = objects.filter(
        obj => Boolean(state.done[obj.id])
    ).length;

    const stars = Object.values(state.mastery)
        .reduce((sum, n) => sum + Number(n || 0), 0);

    $('coins').textContent = `🪙 ${state.coins}`;
    $('found').textContent = `📖 ${count}/${verbs.length}`;
    $('stars').textContent = `⭐ ${stars}`;

    $('location').textContent =
        region(player.x, player.y);

    if (count < 3) {
        $('questText').textContent =
            `Oppdag ${3 - count} nye verb for å bli ordsamler.`;
    } else if (count < 20) {
        $('questText').textContent =
            `Bra! Finn ${20 - count} nye verb til.`;
    } else if (count < verbs.length) {
        $('questText').textContent =
            `Samle alle verbene! ${verbs.length - count} gjenstår.`;
    } else {
        $('questText').textContent =
            'Alle verb oppdaget! Få fem stjerner på hvert ord.';
    }

    $('objective').textContent =
        `${count} oppdaget · ${doneCount} utfordringer fullført`;

    $('questProgress').style.width =
        `${count / verbs.length * 100}%`;

    updateAreas();
}

// --------------------------------------------------
// LAGRING
// --------------------------------------------------

function persist() {
    state.position = {
        x: Math.round(player.x * 100) / 100,
        y: Math.round(player.y * 100) / 100
    };

    save(state);
}

// --------------------------------------------------
// UTFORDRINGER I SPILLVERDENEN
// --------------------------------------------------

function interact() {
    if (modalOpen || !near) return;

    const p = near;

    if (state.done[p.id]) {
        openModal(`
            <h2>✅ Allerede fullført</h2>
            <p>
                Du har løst denne utfordringen.
                Se i ordboken for å øve mer!
            </p>
            <button class="primary" id="okay">
                Tilbake
            </button>
        `);

        $('okay').onclick = closeModal;
        return;
    }

    const v = verbs[p.id];

    runChallenge(
        openModal,
        closeModal,
        v,
        p.type,
        ok => {
            if (ok) {
                state.done[p.id] = true;
                state.found[p.id] = true;

                state.mastery[p.id] = Math.min(
                    5,
                    (state.mastery[p.id] || 0) + 1
                );

                state.coins +=
                    10 + (p.type === 'portal' ? 15 : 0);
            } else {
                state.coins += 1;
            }

            persist();
            updateHUD();
        }
    );
}

$('actionBtn').onclick = interact;

// --------------------------------------------------
// ORDBOK MED BEVART NAVIGASJON
// --------------------------------------------------

$('bookBtn').onclick = () => {
    let book = null;

    book = showBook(
        openModal,
        state,
        v => {
            const types = [
                'chest',
                'crystal',
                'rune',
                'bell',
                'portal'
            ];

            const level = Math.min(
                4,
                state.mastery[v.id] || 0
            );

            runChallenge(
                openModal,
                closeModal,
                v,
                types[level],
                ok => {
                    if (ok) {
                        state.mastery[v.id] = Math.min(
                            5,
                            (state.mastery[v.id] || 0) + 1
                        );

                        state.coins += 5;

                        persist();
                        updateHUD();
                    }

                    // VIKTIG:
                    // challenges.js har nå lukket modalen.
                    // Åpne samme ordbokinstans igjen.
                    // Dermed beholdes filter og valgt verb.

                    if (book) {
                        book.refresh();
                    }
                }
            );
        }
    );
};

// --------------------------------------------------
// NULLSTILLING
// --------------------------------------------------

$('resetBtn').onclick = () => {
    if (confirm(
        'Slette all fremgang på denne enheten og starte på nytt?'
    )) {
        clear();
        location.reload();
    }
};

// --------------------------------------------------
// TASTATUR
// --------------------------------------------------

const directions = {
    arrowup: 'up',
    w: 'up',
    arrowdown: 'down',
    s: 'down',
    arrowleft: 'left',
    a: 'left',
    arrowright: 'right',
    d: 'right'
};

window.addEventListener('keydown', e => {
    if (modalOpen) {
        if (e.key === 'Escape') closeModal();
        return;
    }

    const k = e.key.toLowerCase();
    const d = directions[k];

    if (d) {
        e.preventDefault();
        keys.add(d);
    }

    if (k === ' ' || k === 'enter') {
        e.preventDefault();
        interact();
    }

    if (k === 'b') {
        $('bookBtn').click();
    }
});

window.addEventListener('keyup', e => {
    const d = directions[e.key.toLowerCase()];
    if (d) keys.delete(d);
});

window.addEventListener('blur', () => {
    keys.clear();
    resetJoystick();
});

// --------------------------------------------------
// HOVEDLØKKE
// --------------------------------------------------

function loop(now) {
    const dt = Math.min(
        0.045,
        (now - prev) / 1000 || 0
    );

    prev = now;

    let moving = false;

    if (!modalOpen) {
        let dx =
            (keys.has('right') ? 1 : 0) -
            (keys.has('left') ? 1 : 0) +
            joystickX;

        let dy =
            (keys.has('down') ? 1 : 0) -
            (keys.has('up') ? 1 : 0) +
            joystickY;

        if (dx || dy) {
            const magnitude = Math.hypot(dx, dy);
            const strength = Math.min(1, magnitude);

            dx = dx / magnitude * strength;
            dy = dy / magnitude * strength;

            const speed = 4.2 * dt;

            const x = player.x + dx * speed;
            const y = player.y + dy * speed;

            const radius = 0.22;

            if (
                walkable(x - radius, player.y - radius) &&
                walkable(x + radius, player.y + radius)
            ) {
                player.x = x;
            }

            if (
                walkable(player.x - radius, y - radius) &&
                walkable(player.x + radius, y + radius)
            ) {
                player.y = y;
            }

            moving = true;
        }
    }

    // Kamera følger avataren.
    const cam = {
        x: Math.max(
            0,
            Math.min(
                W * TILE - canvas.width,
                player.x * TILE - canvas.width / 2
            )
        ),
        y: Math.max(
            0,
            Math.min(
                H * TILE - canvas.height,
                player.y * TILE - canvas.height / 2
            )
        )
    };

    drawWorld(ctx, cam, now, state.done);

    drawPlayer(
        ctx,
        player.x,
        player.y,
        cam,
        now,
        moving
    );

    // Finn nærmeste utfordring.
    near = null;

    let best = 1.7;

    for (const o of objects) {
        const d = Math.hypot(
            player.x - o.x - 0.5,
            player.y - o.y - 0.5
        );

        if (d < best) {
            best = d;
            near = o;
        }
    }

    const names = {
        chest: 'skattekiste',
        crystal: 'krystall',
        rune: 'runestein',
        bell: 'lytteklokke',
        portal: 'portal'
    };

    $('nearby').textContent = near
        ? (
            state.done[near.id]
                ? '✓ Fullført'
                : '✨ Ny utfordring'
          ) + ': ' + names[near.type] + ' · trykk Undersøk'
        : 'Utforsk kartet og finn lysende gjenstander';

    $('actionBtn').disabled = !near || modalOpen;

    $('actionBtn').style.opacity =
        near && !modalOpen ? '1' : '.55';

    // Oppdater markering av område.
    const currentArea = region(player.x, player.y);

    if (currentArea !== lastArea) {
        lastArea = currentArea;

        $('location').textContent = currentArea;
        updateAreas();
    }

    // Lagre posisjonen regelmessig.
    if (now - lastSave > 3000) {
        lastSave = now;
        persist();
    }

    requestAnimationFrame(loop);
}

// --------------------------------------------------
// START
// --------------------------------------------------

updateHUD();
requestAnimationFrame(loop);
