
import { verbs } from '../data/verbs.js';

// -----------------------------------------------
// HJELPEFUNKSJONER
// -----------------------------------------------

function shuffle(items) {
    const a = [...items];

    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
}

function clean(value) {
    return String(value ?? '')
        .toLowerCase()
        .trim()
        .replace(/[.!?]/g, '')
        .replace(/\s+/g, ' ');
}

function cleanBase(value) {
    return clean(value)
        .replace(/^to\s+/, '')
        .trim();
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function choices(correct, alternatives, count = 4) {
    const used = new Set([clean(correct)]);

    const wrong = shuffle(alternatives).filter(value => {
        const key = clean(value);

        if (!key || used.has(key)) return false;

        used.add(key);
        return true;
    });

    return shuffle([
        correct,
        ...wrong.slice(0, count - 1)
    ]);
}

// -----------------------------------------------
// GRAMMATIKK
// -----------------------------------------------

const modals = new Set([
    'can', 'could', 'will', 'would',
    'must', 'should', 'might'
]);

const grammarTemplates = {
    be: 'She ___ happy today.',
    have: 'She ___ a new book.',
    do: 'He ___ his homework.',
    go: 'She ___ to school.',
    want: 'She ___ a new bike.',
    study: 'He ___ English at school.',
    watch: 'She ___ TV after dinner.',
    carry: 'He ___ his school bag.',
    cry: 'The baby ___ when she is tired.',
    try: 'She ___ again.',
    play: 'He ___ football after school.',
    enjoy: 'She ___ reading books.',
    teach: 'He ___ English at school.',
    learn: 'She ___ new words.',
    understand: 'She ___ the question.',
    remember: 'He ___ his homework.',
    forget: 'She ___ her keys.',
    believe: 'He ___ his friend.',
    agree: 'She ___ with her teacher.',
    prefer: 'He ___ chocolate ice cream.',
    explain: 'She ___ the rules.',
    choose: 'He ___ a blue shirt.',
    throw: 'She ___ the ball.',
    catch: 'He ___ the ball.',
    push: 'She ___ the door open.',
    pull: 'He ___ the rope.',
    wash: 'She ___ her hands.',
    brush: 'He ___ his teeth.',
    finish: 'She ___ her homework.',
    fix: 'He ___ his bike.',
    mix: 'She ___ the colours.',
    kiss: 'He ___ his mum goodbye.',
    miss: 'She ___ her friend.',
    wish: 'He ___ for a new bike.',
    search: 'She ___ for her keys.',
    reach: 'He ___ the top of the hill.',
    cross: 'She ___ the road carefully.',
    rush: 'He ___ to catch the bus.',
    hurry: 'She ___ to school.',
    worry: 'He ___ about the test.',
    reply: 'She ___ to the message.',
    copy: 'He ___ the word.',
    tidy: 'She ___ her room.',
    dry: 'He ___ his hands.',
    fly: 'The bird ___ over the trees.',
    buy: 'She ___ some fruit.',
    pay: 'He ___ for the food.',
    make: 'She ___ a cake.',
    bake: 'He ___ bread.',
    cook: 'She ___ dinner.',
    eat: 'He ___ breakfast.',
    drink: 'She ___ water.',
    sleep: 'He ___ in his bed.',
    swim: 'She ___ in the pool.',
    run: 'He ___ in the park.',
    walk: 'She ___ to school.',
    jump: 'He ___ over the puddle.',
    dance: 'She ___ at the party.',
    sing: 'He ___ a song.',
    read: 'She ___ a book.',
    write: 'He ___ a letter.',
    look: 'She ___ at the sky.',
    listen: 'He ___ to music.',
    hear: 'She ___ a strange noise.',
    see: 'He ___ a bird.',
    know: 'She ___ the answer.',
    think: 'He ___ about his family.',
    say: 'She ___ hello.',
    tell: 'He ___ a story.',
    ask: 'She ___ a question.',
    answer: 'He ___ the question.',
    call: 'She ___ her grandmother.',
    help: 'He ___ his sister.',
    love: 'She ___ her family.',
    like: 'He ___ his new school.',
    need: 'She ___ some water.',
    use: 'He ___ his computer.',
    work: 'She ___ in a shop.',
    live: 'He ___ in Norway.',
    stay: 'She ___ at home.',
    visit: 'He ___ his grandparents.',
    travel: 'She ___ by train.',
    meet: 'He ___ his friends.',
    find: 'She ___ her shoes.',
    findout: 'He ___ the answer.',
    get: 'She ___ a present.',
    give: 'He ___ his friend a gift.',
    take: 'She ___ her bag.',
    bring: 'He ___ his lunch.',
    keep: 'She ___ her room tidy.',
    put: 'He ___ the book on the table.',
    let: 'She ___ her friend play.',
    leave: 'He ___ home at eight.',
    show: 'She ___ her drawing.',
    wait: 'He ___ for the bus.',
    hold: 'She ___ the baby.',
    fall: 'The leaf ___ from the tree.',
    grow: 'The flower ___ in the garden.',
    sell: 'He ___ old toys.',
    spend: 'She ___ time with her friends.',
    wear: 'He ___ a red jacket.',
    drive: 'She ___ to work.',
    build: 'He ___ a house.',
    break: 'She ___ the glass.',
    begin: 'The lesson ___ at nine.',
    become: 'He ___ very excited.',
    move: 'She ___ the chair.',
    change: 'He ___ his clothes.',
    turn: 'She ___ left at the corner.',
    start: 'He ___ the game.',
    stop: 'She ___ at the red light.',
    continue: 'He ___ reading.',
    follow: 'She ___ her friend.',
    lead: 'He ___ the team.',
    join: 'She ___ the game.',
    save: 'He ___ his money.',
    hope: 'She ___ for good weather.',
    guess: 'He ___ the answer.',
    check: 'She ___ her bag.',
    count: 'He ___ to ten.',
    laugh: 'She ___ at the joke.',
    shout: 'He ___ for help.',
    whisper: 'She ___ to her friend.',
    dream: 'He ___ about flying.',
    pick: 'She ___ a flower.',
    shake: 'He ___ the bottle.',
    hide: 'She ___ behind a tree.',
    order: 'He ___ a pizza.',
    train: 'She ___ every week.',
    serve: 'He ___ dinner.',
    fit: 'The shoe ___ perfectly.',
    burn: 'The fire ___ brightly.',
    afford: 'She ___ a new bike.',
    cost: 'The ticket ___ ten pounds.',
    mean: 'The word ___ something special.',
    happen: 'Something exciting ___ today.',
    include: 'The box ___ three books.',
    receive: 'She ___ a letter.',
    reduce: 'He ___ the speed.',
    divide: 'She ___ the cake into pieces.',
    remain: 'The door ___ open.',
    rescue: 'He ___ the lost dog.',
    sink: 'The boat ___ in the water.',
    flood: 'The river ___ the road.',
    sail: 'The ship ___ across the sea.',
    ring: 'The bell ___ at noon.',
    spot: 'She ___ a dolphin.',
    warn: 'He ___ his friends.',
    invent: 'She ___ a new machine.',
    name: 'He ___ his new puppy.',
    prefer: 'She ___ tea.',
    compete: 'He ___ in a race.',
    attract: 'The flowers ___ bees.',
    charge: 'She ___ her phone.',
    race: 'He ___ against his friends.',
    launch: 'The company ___ a new product.',
    design: 'She ___ a dress.',
    draw: 'He ___ a picture.',
    paint: 'She ___ a wall.',
    deliver: 'He ___ the package.',
    polish: 'She ___ her shoes.',
    entertain: 'He ___ the children.',
    produce: 'The factory ___ toys.',
    share: 'She ___ her lunch.',
    protect: 'He ___ his little sister.',
    improve: 'She ___ every day.',
    prepare: 'He ___ dinner.',
    discover: 'She ___ a secret.',
    promise: 'He ___ to help.',
    destroy: 'The storm ___ the house.',
    crash: 'The car ___ into the wall.',
    relax: 'She ___ after school.',
    smile: 'He ___ at his friend.',
    touch: 'She ___ the wall.',
    pass: 'He ___ the ball.',
    spray: 'She ___ water on the plant.',
    pray: 'He ___ before dinner.',
    bury: 'The dog ___ a bone.',
    marry: 'She ___ her best friend.',
    dress: 'He ___ before breakfast.',
    sit: 'She ___ on a chair.',
    stand: 'He ___ by the window.',
    open: 'She ___ the door.',
    close: 'He ___ the window.',
    clean: 'She ___ her room.',
    climb: 'He ___ a tree.',
    talk: 'She ___ to her friend.',
    touch: 'He ___ the table.'
};

const modalTemplates = {
    can: 'She ___ swim very fast.',
    could: 'He ___ help us today.',
    will: 'She ___ visit her friend.',
    would: 'He ___ like some water.',
    must: 'She ___ finish her homework.',
    should: 'He ___ drink more water.',
    might: 'It ___ rain tomorrow.'
};

function grammarSentence(v) {
    const word = cleanBase(v.word);

    if (modals.has(word)) {
        return modalTemplates[word];
    }

    return grammarTemplates[word] ||
        `She ___ ${word === 'be' ? 'happy' : 'every day'}.`;
}

function grammarOptions(v) {
    const word = cleanBase(v.word);
    const correct = v.third;

    if (word === 'be') {
        return shuffle(['am', 'is', 'are', 'be']);
    }

    if (word === 'have') {
        return shuffle(['have', 'has', 'haves', 'having']);
    }

    if (word === 'do') {
        return shuffle(['do', 'does', 'dos', 'doing']);
    }

    if (modals.has(word)) {
        return choices(correct, [
            word + 's',
            word + 'es',
            word + 'ed',
            word + 'ing'
        ]);
    }

    const alternatives = [
        word,
        word + 's',
        word + 'es',
        word.endsWith('y')
            ? word.slice(0, -1) + 'ies'
            : word + 'ies',
        word + 'ed',
        word.endsWith('e')
            ? word + 'd'
            : word + 'ing',
        word + 'ing'
    ];

    return choices(correct, alternatives);
}

// -----------------------------------------------
// LYTTING
// -----------------------------------------------

let speechSession = 0;
let speechTimer = null;

function stopSpeech() {
    speechSession++;

    if (speechTimer !== null) {
        clearTimeout(speechTimer);
        speechTimer = null;
    }

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function listeningSentence(v) {
    const word = cleanBase(v.word);

    if (v.sentence && !v.sentence.includes('___')) {
        return v.sentence;
    }

    if (modals.has(word)) {
        return modalTemplates[word]
            .replace('___', word);
    }

    const template = grammarTemplates[word];

    if (template) {
        return template.replace('___', v.third);
    }

    return `I want to learn the word ${word}.`;
}

function speakListening(v) {
    if (!('speechSynthesis' in window)) return;

    stopSpeech();

    const session = speechSession;
    const word = cleanBase(v.word);
    const sentence = listeningSentence(v);

    const voices = window.speechSynthesis.getVoices();

    const voice =
        voices.find(x => x.lang.toLowerCase() === 'en-gb') ||
        voices.find(x => x.lang.toLowerCase().startsWith('en'));

    function utterance(text, rate) {
        const u = new SpeechSynthesisUtterance(text);

        u.lang = voice?.lang || 'en-GB';
        u.voice = voice || null;
        u.rate = rate;
        u.pitch = 1;
        u.volume = 1;

        return u;
    }

    const first = utterance(sentence, 0.70);
    const second = utterance(word, 0.65);

    first.onend = () => {
        if (session !== speechSession) return;

        speechTimer = setTimeout(() => {
            speechTimer = null;

            if (session !== speechSession) return;

            window.speechSynthesis.speak(second);
        }, 650);
    };

    window.speechSynthesis.speak(first);
}

// -----------------------------------------------
// FEILDETEKTIVEN
// -----------------------------------------------

function wrongForm(v) {
    const word = cleanBase(v.word);

    if (word === 'be') return 'be';
    if (word === 'have') return 'have';
    if (word === 'do') return 'do';

    if (modals.has(word)) {
        return word + 's';
    }

    if (clean(word) !== clean(v.third)) {
        return word;
    }

    return word + 's';
}

function detectiveSentence(v, good) {
    const template = grammarSentence(v);

    const form = good ? v.third : wrongForm(v);

    return template.replace('___', form);
}

// -----------------------------------------------
// OPPGAVEGENERATOR
// -----------------------------------------------

export function challengeFor(v, type) {
    const others = verbs.filter(x => x.id !== v.id);

    let question = '';
    let answers = [];
    let correct = '';
    let mode = 'choice';
    let say = null;
    let instruction = '';

    if (type === 'chest') {
        question = `Hva betyr «${v.word}»?`;
        correct = v.no;

        answers = choices(
            correct,
            others.map(x => x.no)
        );
    }

    if (type === 'crystal') {
        question = grammarSentence(v);
        correct = v.third;

        answers = grammarOptions(v);

        instruction =
            `Velg riktig form av «${v.word}» i presens.`;
    }

    if (type === 'rune') {
        question = `Skriv «${v.no}» på engelsk`;
        correct = v.word;
        mode = 'write';

        instruction =
            'Skriv grunnformen, med eller uten «to».';
    }

    if (type === 'bell') {
        question = 'Hva betyr ordet du hører?';
        correct = v.no;

        answers = choices(
            correct,
            others.map(x => x.no)
        );

        say = v;

        instruction =
            'Lytt til setningen og ordet.';
    }

    if (type === 'portal') {
        const good = Math.random() >= 0.5;

        question = detectiveSentence(v, good);
        correct = good ? 'Riktig' : 'Feil';
        answers = ['Riktig', 'Feil'];

        instruction = 'Er setningen riktig?';
    }

    return {
        question,
        answers,
        correct,
        mode,
        say,
        type,
        instruction
    };
}

// -----------------------------------------------
// VIS OPPGAVE
// -----------------------------------------------

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
        openModal(`
            <h2>${titles[type] || 'Engelskoppgave'}</h2>

            ${task.instruction ? `
                <p style="
                    text-align:center;
                    color:#64748b;
                    font-size:14px;
                    margin:12px 0 8px;
                ">
                    ${escapeHtml(task.instruction)}
                </p>
            ` : ''}

            <div class="question" style="
                font-size:22px;
                line-height:1.45;
                padding:24px 16px;
                text-align:center;
            ">
                ${escapeHtml(task.question)}
            </div>

            ${task.say ? `
                <p style="text-align:center;">
                    <button
                        id="listen"
                        class="secondary"
                        type="button"
                    >
                        🔊 Spill av igjen
                    </button>
                </p>
            ` : ''}

            ${task.mode === 'write' ? `
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
                        type="button"
                    >
                        Sjekk svar
                    </button>
                </p>
            ` : `
                <div class="choices">
                    ${task.answers.map((answer, index) => `
                        <button
                            class="choice"
                            data-choice="${index}"
                            type="button"
                        >
                            ${escapeHtml(answer)}
                        </button>
                    `).join('')}
                </div>
            `}

            <div
                id="feedback"
                class="feedback"
                aria-live="polite"
            ></div>

            <div class="rowBtns">
                <button
                    id="nextChallenge"
                    class="primary"
                    type="button"
                    style="display:none"
                >
                    Fortsett eventyret →
                </button>
            </div>
        `);

        if (task.say) {
            const listen = document.getElementById('listen');

            listen.onclick = () => speakListening(task.say);

            // Safari kan kreve et aktivt trykk
            // på lydknappen første gang.
            setTimeout(() => {
                if (!answered) speakListening(task.say);
            }, 300);
        }

        if (task.mode === 'write') {
            const input = document.getElementById('answerText');

            document.getElementById('submitText').onclick =
                () => judge(input.value);

            input.onkeydown = e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    judge(input.value);
                }
            };

            input.focus();
        } else {
            document.querySelectorAll('[data-choice]')
                .forEach(button => {
                    button.onclick = () => {
                        const index = Number(
                            button.dataset.choice
                        );

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

        if (task.say) stopSpeech();

        document.querySelectorAll('.choice')
            .forEach(b => {
                b.disabled = true;

                const index = Number(b.dataset.choice);

                if (
                    clean(task.answers[index]) ===
                    clean(task.correct)
                ) {
                    b.classList.add('good');
                } else if (b === button) {
                    b.classList.add('bad');
                }
            });

        const input = document.getElementById('answerText');
        if (input) input.disabled = true;

        const submit = document.getElementById('submitText');
        if (submit) submit.disabled = true;

        const feedback = document.getElementById('feedback');

        if (ok) {
            feedback.textContent = '🥳 Riktig! Bra jobbet!';
            feedback.style.color = '#16835d';
        } else {
            feedback.textContent =
                `🙂 Riktig svar: ${task.correct}`;
            feedback.style.color = '#b45309';
        }

        const next = document.getElementById('nextChallenge');

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
