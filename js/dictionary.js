import { verbs } from '../data/verbs.js';
import { speak } from './audio.js';

export function showBook(openModal, state, practice, lockStatus = () => 0) {
    let filter = 'all';
    let selectedId = null;
    const $ = id => document.getElementById(id);
    const stars = v => Math.max(0, Math.min(5, Number(state.mastery[v.id] || 0)));
    const found = v => Boolean(state.found[v.id]);
    const matches = v => filter === 'all' ||
        (filter === 'found' && found(v)) ||
        (filter === 'practice' && found(v) && stars(v) < 5) ||
        (filter === 'mastered' && found(v) && stars(v) === 5);

    function render() {
        const discovered = verbs.filter(found);
        const mastered = discovered.filter(v => stars(v) === 5);
        const visible = verbs.filter(matches);
        if (selectedId !== null && !visible.some(v => v.id === selectedId)) {
            selectedId = null;
        }
        const tabs = [
            ['all', 'Alle'], ['found', 'Oppdaget'],
            ['practice', 'Må øves'], ['mastered', 'Mestret']
        ];
        openModal(`
            <h2>📖 Den magiske ordboken</h2>
            <div class="bookStats">Oppdaget <b>${discovered.length}/${verbs.length}</b>
                · Mestret <b>${mastered.length}/${verbs.length}</b>
                · Stjerner <b>${discovered.reduce((s, v) => s + stars(v), 0)}/${verbs.length * 5}</b>
            </div>
            <div class="bookTabs">${tabs.map(([id, label]) =>
                `<button data-filter="${id}" class="${filter === id ? 'active' : ''}">${label}</button>`
            ).join('')}</div>
            <div class="bookGrid">${visible.map(v => `
                <button class="wordCard ${found(v) ? '' : 'locked'}" data-word="${v.id}"
                    style="${selectedId === v.id ? 'outline:2px solid #315bd9' : ''}">
                    <b>${found(v) ? v.word : '🔒 ???'}</b>
                    <small>${found(v) ? '★'.repeat(stars(v)) + '☆'.repeat(5 - stars(v)) : 'Uoppdaget'}</small>
                </button>`).join('') || '<p class="muted">Ingen verb i denne kategorien ennå.</p>'}</div>
            <div id="detail"></div>
        `);
        document.querySelectorAll('[data-filter]').forEach(b => {
            b.onclick = () => { filter = b.dataset.filter; selectedId = null; render(); };
        });
        document.querySelectorAll('[data-word]').forEach(b => {
            b.onclick = () => {
                const v = verbs.find(w => String(w.id) === b.dataset.word);
                if (!v || !found(v)) return;
                selectedId = v.id;
                render();
            };
        });
        if (selectedId !== null) renderDetail();
    }

    function renderDetail() {
        const v = verbs.find(w => w.id === selectedId);
        if (!v || !found(v) || !$('detail')) return;
        const level = stars(v);
        const types = ['chest', 'crystal', 'rune', 'bell', 'portal'];
        const nextType = types[Math.min(4, level)];
        const remaining = lockStatus(v.id, nextType);
        $('detail').innerHTML = `
            <div class="wordDetail">
                <h3>${['can','could','will','would','must','should','might'].includes(v.word) ? '' : 'to '}${v.word} · ${v.no}</h3>
                <p>He / she / it: <b>${v.third}</b> · ${'⭐'.repeat(level)}${'☆'.repeat(5 - level)}</p>
                <p><b>${v.sentence || ''}</b></p>
                ${remaining ? `<p class="muted">⏳ Denne øvelsen er sperret. Gjennomfør ${remaining} andre verboppgaver først.</p>` : ''}
                <div class="row">
                    <button class="secondary" id="wordAudio">🔊 Ord</button>
                    <button class="secondary" id="sentenceAudio">🔊 Setning</button>
                    <button class="secondary" id="slowAudio">🐢 Sakte</button>
                    <button class="primary" id="wordPractice" ${level >= 5 ? 'disabled' : ''}>
                        ${level >= 5 ? '🏆 Mestret' : remaining ? `⏳ ${remaining} oppgaver igjen` : 'Øv på ordet'}
                    </button>
                </div>
            </div>`;
        $('wordAudio').onclick = () => speak(v.word);
        $('sentenceAudio').onclick = () => speak(v.sentence || v.word);
        $('slowAudio').onclick = () => speak(v.sentence || v.word, true);
        $('wordPractice').onclick = () => {
            if (level >= 5) return;
            practice(v);
        };
    }

    render();
    return { refresh: render, getFilter: () => filter, getSelectedId: () => selectedId };
}
