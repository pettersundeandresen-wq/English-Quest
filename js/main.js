
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

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let player = {
    x: state.position.x,
    y: state.position.y
};

const keys = new Set();

let modalOpen = false;
let near = null;
let prev = 0;
let lastSave = 0;

// --------------------------------------------------
// HJELPEFUNKSJONER
// --------------------------------------------------

const $ = id => document.getElementById(id);

const modal = $('modal');

function openModal(html) {
    modalOpen = true;
    keys.clear();

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
// OMRÅDER OG OPPDRAG
// --------------------------------------------------

// Navnene må samsvare med region() i world.js.

const areas = [
    {
        name: 'Landsbyen',
        icon: '🏡'
    },
    {
        name: 'Den ville skogen',
        icon: '🌲'
    },
    {
        name: 'Elvedalen',
        icon: '🌊'
    },
    {
        name: 'Steinruinene',
        icon: '🪨'
    },
    {
        name: 'Den magiske lysningen',
        icon: '✨'
    }
];

// Finn område for hver utfordring.
// Beregnes fra koordinatene i world.js.

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

// Bruk eksisterende områdepanel i index.html.

const areaPanel = document.querySelector(
    '.sidebar .panel:nth-child(2)'
);

if (areaPanel) {
    areaPanel.innerHTML = `
        <h3>🗺️ Områder</h3>
        <div id="areaOverview"></div>
    `;
}

// Beregn fullførte oppdrag og total per område.

function getAreaStats(name) {
    const missions = areaObjects.get(name) || [];

    const total = missions.length;

    const completed = missions.filter(
        obj => state.done[obj.id] === true
    ).length;

    return {
        total,
        completed,
        remaining: total - completed
    };
}

// Oppdater områdeoversikten.

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

        const isCurrent = area.name === currentArea;

        const finished =
            stats.total > 0 &&
            stats.completed === stats.total;

        const background = isCurrent
            ? 'rgba(77, 155, 118, 0.13)'
            : 'transparent';

        const border = isCurrent
            ? '1px solid rgba(77, 155, 118, 0.35)'
            : '1px solid transparent';

        const countColor = finished
            ? '#16835d'
            : 'inherit';

        html += `
            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:8px;
                padding:7px 8px;
                margin:2px 0;
                border-radius:9px;
                background:${background};
                border:${border};
                font-size:13px;
            ">
                <span style="
                    display:flex;
                    align-items:center;
                    gap:5px;
                    min-width:0;
                ">
                    <span>${area.icon}</span>
                    <span>${area.name}</span>
                </span>

                <span style="
                    white-space:nowrap;
                    font-weight:700;
                    font-variant-numeric:tabular-nums;
                    color:${countColor};
                ">
                    ${stats.completed}/${stats.total}
                    ${finished ? '✓' : ''}
                </span>
            </div>
        `;
    }

    html += `
        <div style="
            display:flex;
            justify-content:space-between;
            border-top:1px solid rgba(100,120,120,.2);
            margin-top:9px;
            padding:10px 8px 2px;
            font-size:13px;
            font-weight:700;
        ">
            <span>Totalt</span>
            <span>${completedAll}/${totalAll}</span>
        </div>
    `;

    container.innerHTML = html;
}

// --------------------------------------------------
// OPPDATER SPILLINFORMASJON
// --------------------------------------------------

function updateHUD() {
    const count = Object.keys(state.found).length;

    $('coins').textContent = `🪙 ${state.coins}`;

    $('found').textContent =
        `📖 ${count}/${verbs.length}`;

    $('stars').textContent =
        `⭐ ${Object.values(state.mastery)
            .reduce((s, n) => s + n, 0)}`;

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
        `${count} oppdaget · ` +
        `${Object.keys(state.done).length} utfordringer fullført`;

    $('questProgress').style.width =
        (count / verbs.length * 100) + '%';

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
// UTFORDRINGER
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

                persist();
                updateHUD();
            } else {
                state.coins += 1;

                persist();
                updateHUD();
            }
        }
    );
}

$('actionBtn').onclick = interact;

// --------------------------------------------------
// ORDBOK
// --------------------------------------------------

$('bookBtn').onclick = () => {
    showBook(
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
                }
            );
        }
    );
};

// --------------------------------------------------
// NULLSTILL SPILLET
// --------------------------------------------------

$('resetBtn').onclick = () => {
    if (confirm(
        'Slette all fremgang på denne enheten ' +
        'og starte på nytt?'
    )) {
        clear();
        location.reload();
    }
};

// --------------------------------------------------
// STYRING PÅ MOBIL / IPAD
// --------------------------------------------------

for (const b of document.querySelectorAll('[data-dir]')) {
    const dir = b.dataset.dir;

    b.addEventListener('pointerdown', e => {
        e.preventDefault();
        keys.add(dir);
        b.setPointerCapture(e.pointerId);
    });

    for (const ev of [
        'pointerup',
        'pointercancel',
        'lostpointercapture'
    ]) {
        b.addEventListener(ev, () => keys.delete(dir));
    }
}

// --------------------------------------------------
// TASTATURSTYRING
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

window.addEventListener('blur', () => keys.clear());

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
            (keys.has('left') ? 1 : 0);

        let dy =
            (keys.has('down') ? 1 : 0) -
            (keys.has('up') ? 1 : 0);

        if (dx || dy) {
            const n = Math.hypot(dx, dy);

            dx /= n;
            dy /= n;

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
        near ? '1' : '.55';

    // Oppdater områdevisningen når spilleren
    // beveger seg inn i et nytt område.

    const currentArea = region(player.x, player.y);

    if (currentArea !== loop.lastArea) {
        loop.lastArea = currentArea;

        $('location').textContent = currentArea;

        updateAreas();
    }

    if (now - lastSave > 3000) {
        lastSave = now;
        persist();
    }

    requestAnimationFrame(loop);
}

// --------------------------------------------------
// START SPILLET
// --------------------------------------------------

updateHUD();
requestAnimationFrame(loop);
