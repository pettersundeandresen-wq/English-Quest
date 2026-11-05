
import { verbs } from '../data/verbs.js';

// --------------------------------------------------
// HJELPEFUNKSJONER
// --------------------------------------------------

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

// --------------------------------------------------
// EKSEMPELSETNINGER FOR LYTTING
// --------------------------------------------------

// Setningene bruker grunnformen når det er naturlig.
// De skal være korte og lette å forstå.

const listeningSentences = {
    be: 'I want to be happy.',
    have: 'I have a dog.',
    do: 'I do my homework.',
    go: 'We go to school.',
    can: 'I can run fast.',
    will: 'I will help you.',
    must: 'You must go home.',
    like: 'I like my friends.',
    want: 'I want a new bike.',
    run: 'I run in the park.',
    walk: 'We walk to school.',
    eat: 'I eat breakfast.',
    drink: 'I drink water.',
    sleep: 'I sleep at night.',
    read: 'I read a book.',
    write: 'I write a letter.',
    play: 'We play football.',
    jump: 'I jump very high.',
    dance: 'We dance together.',
    swim: 'I can swim.',
    sing: 'I sing a song.',
    sit: 'I sit on a chair.',
    stand: 'I stand by the door.',
    look: 'I look at the sky.',
    help: 'I help my mum.',
    love: 'I love my family.',
    need: 'I need some water.',
    work: 'I work every day.',
    cook: 'I cook dinner.',
    talk: 'We talk at school.',
    call: 'I call my friend.',
    open: 'I open the door.',
    close: 'I close the window.',
    start: 'We start the game.',
    stop: 'I stop at the red light.',
    listen: 'I listen to music.',
    watch: 'I watch TV.',
    wash: 'I wash my hands.',
    buy: 'I buy some food.',
    say: 'I say hello.',
    give: 'I give you a gift.',
    take: 'I take my bag.',
    make: 'I make a cake.',
    find: 'I find my shoes.',
    try: 'I try again.',
    cry: 'Babies sometimes cry.',
    fly: 'Birds can fly.',
    climb: 'I climb a tree.',
    study: 'You study at school.',
    stay: 'I stay at home.',
    enjoy: 'I enjoy this game.',
    smile: 'I smile at my friend.',
    live: 'I live in Norway.',
    visit: 'We visit our friends.',
    clean: 'I clean my room.',
    fix: 'I fix my bike.',
    mix: 'I mix the colours.',
    kiss: 'I kiss my mum.',
    miss: 'I miss my friend.',
    push: 'I push the door.',
    catch: 'I catch the ball.',
    touch: 'I touch the wall.',
    reach: 'I reach the top.',
    search: 'I search for my keys.',
    finish: 'I finish my homework.',
    brush: 'I brush my teeth.',
    dress: 'I dress in the morning.',
    pass: 'I pass the ball.',
    crash: 'The cars can crash.',
    relax: 'I relax after school.',
    copy: 'I copy the word.',
    tidy: 'I tidy my room.',
    hurry: 'I hurry to school.',
    worry: 'I worry about my test.',
    marry: 'They want to marry.',
    carry: 'I carry my school bag.',
    bury: 'Dogs sometimes bury bones.',
    reply: 'I reply to my friend.',
    dry: 'I dry my hands.',
    pay: 'I pay for the food.',
    pray: 'Some people pray.',
    spray: 'I spray water on the plant.',
    destroy: 'The storm can destroy houses.',
    teach: 'I teach my little sister.',
    wish: 'I wish for a new bike.',
    might: 'It might rain today.',
    should: 'You should drink water.',
    could: 'I could help you.'
};

// --------------------------------------------------
// LYDAVSPILLING
// --------------------------------------------------

let speechSession = 0;

function stopSpeech() {
    speechSession++;

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function speakListening(word) {
    if (!('speechSynthesis' in window)) {
        return false;
    }

    stopSpeech();

    const session = speechSession;
    const sentence =
        listeningSentences[word] || `I can say ${word}.`;

    // Velg engelsk stemme dersom en finnes.
    const voices = window.speechSynthesis.getVoices();

    const voice =
        voices.find(v => v.lang.toLowerCase() === 'en-gb') ||
        voices.find(v => v.lang.toLowerCase().startsWith('en'));

    function makeSpeech(text, rate) {
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.lang = voice?.lang || 'en-GB';
        utterance.voice = voice || null;
        utterance.rate = rate;
        utterance.pitch = 1;
        utterance.volume = 1;

        return utterance;
    }

    const first = makeSpeech(sentence, 0.70);

    const second = makeSpeech(word, 0.65);

    // Kort pause mellom setningen og verbet.
    first.onend = () => {
        if (session !== speechSession) return;

        setTimeout(() => {
            if (session !== speechSession) return;

            window.speechSynthesis.speak(second);
        }, 450);
    };

    window.speechSynthesis.speak(first);

    return true;
}

// --------------------------------------------------
// LAG OPPGAVE
// --------------------------------------------------

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
        question = 'Lytt til setningen og ordet. Hva betyr ordet?';
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
            : `She ${
                v.word === v.third
                    ? v.word + 's'
                    : v.word
            } every day.`;

        if ([
            'can', 'will', 'must',
            'should', 'could', 'might'
        ].includes(v.word)) {
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

// --------------------------------------------------
// VIS OG GJENNOMFØR OPPGAVE
// --------------------------------------------------

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
            const listenButton =
                document.getElementById('listen');

            listenButton.onclick = () =>
                speakListening(task.say);

            // Automatisk avspilling.
            // Safari kan kreve at barnet trykker
            // på avspillingsknappen første gang.
            setTimeout(() => {
                if (!answered) {
                    speakListening(task.say);
                }
            }, 300);
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

        // Stopp eventuell lyd når oppgaven er besvart.
        if (task.say) stopSpeech();

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

        if (input) input.disabled = true;

        const submit =
            document.getElementById('submitText');

        if (submit) submit.disabled = true;

        const feedback =
            document.getElementById('feedback');

        if (ok) {
            feedback.textContent =
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
            if (task.say) stopSpeech();

            closeModal();
            success(ok);
        };
    }

    render();
}
