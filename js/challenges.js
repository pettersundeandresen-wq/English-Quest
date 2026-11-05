
import { verbs } from '../data/verbs.js';
import { speak } from './audio.js';

const shuffle = a => [...a].sort(() => Math.random() - 0.5);

const clean = s => String(s)
    .toLowerCase()
    .trim()
    .replace(/[.!?]/g, '')
    .replace(/\s+/g, ' ');

const cleanBase = s => clean(s)
    .replace(/^to\s+/, '')
    .trim();

function choices(correct, others) {
    const unique = [...new Set(
        others.filter(x => x !== correct)
    )];

    return shuffle([
        correct,
        ...shuffle(unique).slice(0, 3)
    ]);
}

export function challengeFor(v, type) {
    const others = verbs.filter(x => x.id !== v.id);

    let question = '';
    let answers = [];
    let correct = '';
    let mode = 'choice';
    let say = null;

    if (type === 'chest') {
        question = `Hva betyr «${v.word}»?`;
        correct = v.no;
        answers = choices(
            correct,
            others.map(x => x.no)
        );
    }

    if (type === 'crystal') {
        question = `She ___ . (${v.word})`;
        correct = v.third;

        answers = choices(correct, [
            v.word,
            v.word + 's',
            v.word + 'es',
            v.word.slice(0, -1) + 'ies',
            v.third + 's',
            ...others.map(x => x.third)
        ]);
    }

    if (type === 'rune') {
        question = `Skriv «${v.no}» på engelsk`;
        correct = v.word;
        mode = 'write';
    }

    if (type === 'bell') {
        question = 'Lytt til ordet. Hva betyr det?';
        correct = v.no;
        answers = choices(
            correct,
            others.map(x => x.no)
        );
        say = v.word;
    }

    if (type === 'portal') {
        const good = Math.random() > 0.5;

        let sentence = good
            ? `She ${v.third} every day.`
            : `She ${v.word === v.third
                ? v.word + 's'
                : v.word} every day.`;

        if (['can', 'will', 'must', 'should', 'could', 'might'].includes(v.word)) {
            sentence = `She ${
                good ? v.word : v.word + 's'
            } go home.`;
        }

        if (v.word === 'be') {
            sentence = `She ${
                good ? 'is' : 'be'
            } happy today.`;
        }

        if (v.word === 'have') {
            sentence = `She ${
                good ? 'has' : 'have'
            } a new book.`;
        }

        question = sentence;
        correct = good ? 'Riktig' : 'Feil';
        answers = ['Riktig', 'Feil'];
    }

    return {
        question,
        answers,
        correct,
        mode,
        say,
        type
    };
}

export function runChallenge(
    openModal,
    closeModal,
    v,
    type,
    success
) {
    const task = challengeFor(v, type);
    let answered = false;

    const titles = {
        chest: '🎁 Finn ordet',
        crystal: '💎 Grammatikk',
        rune: '🪨 Staveprøve',
        bell: '🔔 Lytteprøve',
        portal: '🌀 Feildetektiven'
    };

    function render() {
        const questionHtml = type === 'portal'
            ? `
                <div style="
                    text-align:center;
                    margin:12px 0 8px;
                    font-size:15px;
                    font-weight:500;
                    color:#64748b;
                ">
                    Er setningen riktig?
                </div>

                <div class="question" style="
                    font-size:22px;
                    font-weight:700;
                    line-height:1.45;
                    text-align:center;
                    padding:24px 16px;
                    margin-bottom:16px;
                ">
                    ${task.question}
                </div>
              `
            : `
                <div class="question">
                    ${task.question}
                </div>
              `;

        openModal(`
            <h2>${titles[type]}</h2>

            ${questionHtml}

            ${task.say
                ? `
                    <button
                        id="listen"
                        class="secondary"
                    >
                        🔊 Spill av igjen
                    </button>
                  `
                : ''}

            ${task.mode === 'write'
                ? `
                    <input
                        id="answerText"
                        class="inputAnswer"
                        placeholder="Skriv ordet her"
                        autocomplete="off"
                        autocapitalize="off"
                        spellcheck="false"
                    >

                    <p>
                        <button
                            id="submitText"
                            class="primary"
                        >
                            Sjekk svar
                        </button>
                    </p>
                  `
                : `
                    <div class="choices">
                        ${task.answers.map((a, i) => `
                            <button
                                class="choice"
                                data-choice="${i}"
                            >
                                ${a}
                            </button>
                        `).join('')}
                    </div>
                  `}

            <div
                class="feedback"
                id="feedback"
            ></div>

            <div class="rowBtns">
                <button
                    id="nextChallenge"
                    class="primary"
                    style="display:none"
                >
                    Fortsett eventyret →
                </button>
            </div>
        `);

        if (task.say) {
            document.getElementById('listen').onclick =
                () => speak(task.say);

            setTimeout(() => speak(task.say), 300);
        }

        if (task.mode === 'write') {
            const input =
                document.getElementById('answerText');

            document.getElementById('submitText').onclick =
                () => judge(input.value);

            input.onkeydown = e => {
                if (e.key === 'Enter') {
                    judge(input.value);
                }
            };

            input.focus();
        } else {
            document.querySelectorAll('[data-choice]')
                .forEach(button => {
                    button.onclick = () => {
                        const index =
                            Number(button.dataset.choice);

                        judge(task.answers[index], button);
                    };
                });
        }
    }

    function judge(value, button) {
        if (answered) return;

        const ok = task.mode === 'write'
            ? cleanBase(value) === cleanBase(task.correct)
            : clean(value) === clean(task.correct);

        answered = true;

        document.querySelectorAll('.choice')
            .forEach(b => {
                b.disabled = true;

                if (
                    clean(b.textContent) ===
                    clean(task.correct)
                ) {
                    b.classList.add('good');
                } else if (b === button) {
                    b.classList.add('bad');
                }
            });

        const input =
            document.getElementById('answerText');

        if (input) {
            input.disabled = true;
        }

        const submit =
            document.getElementById('submitText');

        if (submit) {
            submit.disabled = true;
        }

        const feedback =
            document.getElementById('feedback');

        if (ok) {
            feedback.innerHTML =
                '🥳 Riktig! Bra jobbet!';
            feedback.style.color = '#16835d';
        } else {
            feedback.textContent =
                `🙂 Riktig svar: ${task.correct}`;
            feedback.style.color = '#b45309';
        }

        const next =
            document.getElementById('nextChallenge');

        next.style.display = '';

        next.textContent = ok
            ? 'Samle belønningen →'
            : 'Prøv senere →';

        next.onclick = () => {
            closeModal();
            success(ok);
        };
    }

    render();
}
