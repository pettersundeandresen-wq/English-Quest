
import { verbs } from '../data/verbs.js';
import { speak } from './audio.js';

export function showBook(openModal, state, practice) {
    let filter = 'all';
    let selectedId = null;

    const filters = [
        ['all', 'Alle'],
        ['found', 'Oppdaget'],
        ['practice', 'Må øves'],
        ['mastered', 'Mestret']
    ];

    const $ = id => document.getElementById(id);

    function isFound(v) {
        return Boolean(state.found[v.id]);
    }

    function stars(v) {
        return Math.max(
            0,
            Math.min(5, state.mastery[v.id] || 0)
        );
    }

    function matchesFilter(v) {
        if (filter === 'all') return true;

        if (filter === 'found') {
            return isFound(v);
        }

        if (filter === 'practice') {
            return isFound(v) && stars(v) < 5;
        }

        if (filter === 'mastered') {
            return isFound(v) && stars(v) === 5;
        }

        return false;
    }

    function render() {
        const found = verbs.filter(isFound);

        const mastered = found.filter(
            v => stars(v) === 5
        );

        const list = verbs.filter(matchesFilter);

        const starCount = found.reduce(
            (sum, v) => sum + stars(v),
            0
        );

        // Dersom et verb ikke lenger passer filteret,
        // behold filteret, men lukk verbdetaljene.
        if (
            selectedId !== null &&
            !list.some(v => v.id === selectedId)
        ) {
            selectedId = null;
        }

        const tabs = filters.map(([id, label]) => `
            <button
                data-filter="${id}"
                class="${filter === id ? 'active' : ''}"
            >
                ${label}
            </button>
        `).join('');

        const cards = list.map(v => {
            const foundWord = isFound(v);
            const selected = selectedId === v.id;

            return `
                <button
                    class="wordCard
                        ${foundWord ? '' : 'locked'}
                        ${selected ? 'selected' : ''}"
                    data-word="${v.id}"
                    style="${selected
                        ? 'outline:2px solid #315bd9;'
                        : ''}"
                >
                    <b>
                        ${foundWord ? v.word : '🔒 ???'}
                    </b>

                    <small>
                        ${foundWord
                            ? '★'.repeat(stars(v)) +
                              '☆'.repeat(5 - stars(v))
                            : 'Uoppdaget'}
                    </small>
                </button>
            `;
        }).join('');

        openModal(`
            <h2>📖 Den magiske ordboken</h2>

            <div class="bookStats">
                Oppdaget <b>${found.length}/${verbs.length}</b>
                · Mestret <b>${mastered.length}/${verbs.length}</b>
                · Stjerner <b>${starCount}/${verbs.length * 5}</b>
            </div>

            <div class="bookTabs">
                ${tabs}
            </div>

            <div class="bookGrid">
                ${cards || `
                    <p class="muted">
                        Ingen verb i denne kategorien ennå.
                    </p>
                `}
            </div>

            <div id="detail"></div>
        `);

        // Filterknapper.
        document.querySelectorAll('[data-filter]')
            .forEach(button => {
                button.onclick = () => {
                    filter = button.dataset.filter;
                    selectedId = null;
                    render();
                };
            });

        // Verbkort.
        document.querySelectorAll('[data-word]')
            .forEach(button => {
                button.onclick = () => {
                    const id = Number(button.dataset.word);

                    const v = verbs.find(
                        word => word.id === id
                    );

                    if (!v || !isFound(v)) return;

                    selectedId = v.id;
                    renderDetail();
                };
            });

        if (selectedId !== null) {
            renderDetail();
        }
    }

    function renderDetail() {
        const v = verbs.find(
            word => word.id === selectedId
        );

        const container = $('detail');

        if (!container || !v || !isFound(v)) return;

        const level = stars(v);

        container.innerHTML = `
            <div class="wordDetail">
                <h3>to ${v.word} · ${v.no}</h3>

                <p>
                    He / she / it:
                    <b>${v.third}</b>
                    · ${'⭐'.repeat(level)}
                    ${'☆'.repeat(5 - level)}
                </p>

                <p>
                    <b>${v.sentence || ''}</b>
                </p>

                <div class="row">
                    <button
                        class="secondary"
                        id="wordAudio"
                    >
                        🔊 Ord
                    </button>

                    <button
                        class="secondary"
                        id="sentenceAudio"
                    >
                        🔊 Setning
                    </button>

                    <button
                        class="secondary"
                        id="slowAudio"
                    >
                        🐢 Sakte
                    </button>

                    <button
                        class="primary"
                        id="wordPractice"
                    >
                        Øv på ordet
                    </button>
                </div>
            </div>
        `;

        $('wordAudio').onclick = () => speak(v.word);

        $('sentenceAudio').onclick = () => {
            speak(v.sentence || v.word);
        };

        $('slowAudio').onclick = () => {
            speak(v.sentence || v.word, true);
        };

        $('wordPractice').onclick = () => {
            practice(v);
        };
    }

    function refresh() {
        // Samme filter og valgt verb beholdes.
        // Mestring og stjerner leses på nytt fra state.
        render();
    }

    render();

    return {
        refresh,
        getFilter: () => filter,
        getSelectedId: () => selectedId
    };
}
