
import { verbs, ruleNames } from '../data/verbs.js';
import { speak } from './audio.js';

const shuffle = a => [...a].sort(() => Math.random() - .5);

const clean = s => s.toLowerCase()
    .trim()
    .replace(/[.!?]/g, '')
    .replace(/\s+/g, ' ');

const cleanBase = s => clean(s)
    .replace(/^to\s+/, '')
    .trim();

function choices(correct, others) {
    return shuffle([
        correct,
        ...shuffle(others.filter(x => x !== correct)).slice(0, 3)
    ]);
}

export function challengeFor(v, type) {
    const others = verbs.filter(x => x.id !== v.id);

    let question, answers, correct;
    let mode = 'choice';
    let say = null;

    if (type === 'chest') {
        question = `Hva betyr «${v.word}»?`;
        correct = v.no;
        answers = choices(correct, others.map(x => x.no));
    }

    if (type === 'crystal') {
        question = `She ___ . (${v.word})`;
        correct = v.third;
        answers = choices(correct, [
            v.word,
            v.word + 's',
            v.word + 'es',
            v.word.slice(0, -1) + 'ies',
            v.third + 's'
        ]);
    }

    if (type === 'rune') {
        question = `Skriv «${v.no}» på engelsk`;
        correct = v.word;
        mode = 'write';
    }

    if (type === 'bell') {
        question = '🔊 Lytt til ordet. Hva betyr det?';
        correct = v.no;
        answers = choices(correct, others.map(x => x.no));
        say = v.word;
    }

    if (type === 'portal') {
        const good = Math.random() > .5;
        let subject = 'She';
        let verb = good
            ? v.third
            : v.word === v.third
                ? v.word + 's'
                : v.word;

        let sent = `${subject} ${verb} every day.`;

        if (v.rule === 5) {
            sent = `She ${good ? v.word : v.word + 's'} go home.`;
        }

        if (v.word === 'be') {
            sent = `She ${good ? 'is' : 'be'} happy.`;
        }

        question = `Er setningen riktig?\n${sent}`;
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

    function render() {
        openModal(`
            <h2>${{
                chest: '🎁 Finn ordet',
                crystal: '💎 Grammatikk',
                rune: '🪨 Staveprøve',
                bell: '🔔 Lytteprøve',
                portal: '🌀 Feildetektiven'
            }[type]}</h2>

            <p class="muted">
                ${type === 'rune'
                    ? 'Skriv grunnformen (med eller uten «to»).'
                    : 'Velg ett svar. Ingen tidspress.'}
            </p>

            <div class="question">
                ${task.question.replace(/\n/g, '<br>')}
            </div>

            ${task.say
                ? '<button id="listen" class="secondary">🔊 Spill av igjen</button>'
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
                        <button id="submitText" class="primary">
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
                            >${a}</button>
                        `).join('')}
                    </div>
                  `}

            <div class="feedback" id="feedback"></div>

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
            const input = document.getElementById('answerText');

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
                .forEach(b => {
                    b.onclick = () =>
                        judge(task.answers[+b.dataset.choice], b);
                });
        }
    }

    function judge(value, button) {
        if (answered) return;

        // Skriveoppgaver: godta grunnform med eller uten "to".
        const ok = task.mode === 'write'
            ? cleanBase(value) === cleanBase(task.correct)
            : clean(value) === clean(task.correct);

        answered = true;

        document.querySelectorAll('.choice').forEach(b => {
            b.disabled = true;

            if (clean(b.textContent) === clean(task.correct)) {
                b.classList.add('good');
            } else if (b === button) {
                b.classList.add('bad');
            }
        });

        const input = document.getElementById('answerText');
        if (input) input.disabled = true;

        const submit = document.getElementById('submitText');
        if (submit) submit.disabled = true;

        document.getElementById('feedback').innerHTML = ok
            ? '🥳 Riktig! Ny kunnskap til ordboken.'
            : `🙂 Godt forsøk. Riktig svar: <b>${task.correct}</b>`;

        const next = document.getElementById('nextChallenge');

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
