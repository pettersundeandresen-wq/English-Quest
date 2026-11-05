
import { verbs } from '../data/verbs.js';

// --------------------------------------------------
// HJELPEFUNKSJONER
// --------------------------------------------------

const shuffle = array => {
    const a = [...array];

    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
};

const clean = value => String(value)
    .toLowerCase()
    .trim()
    .replace(/[.!?]/g, '')
    .replace(/\s+/g, ' ');

const cleanBase = value => clean(value)
    .replace(/^to\s+/, '')
    .trim();

const unique = values => [
    ...new Set(values.filter(Boolean))
];

function choices(correct, alternatives, count = 4) {
    const wrong = unique(alternatives)
        .filter(x => clean(x) !== clean(correct));

    return shuffle([
        correct,
        ...shuffle(wrong).slice(0, count - 1)
    ]);
}

// --------------------------------------------------
// GRAMMATIKK
// --------------------------------------------------

const modalVerbs = new Set([
    'can', 'will', 'must',
    'should', 'could', 'might'
]);

function isModal(word) {
    return modalVerbs.has(word);
}

function grammarSentence(v) {
    const sentences = {
        be: 'She ___ happy today.',
        have: 'She ___ a new book.',
        do: 'He ___ his homework.',
        go: 'She ___ to school.',
        can: 'She ___ swim very fast.',
        will: 'He ___ help his friend.',
        must: 'She ___ finish her homework.',
        like: 'He ___ chocolate ice cream.',
        want: 'She ___ a new bike.',
        run: 'He ___ in the park.',
        walk: 'She ___ to school.',
        eat: 'He ___ breakfast every day.',
        drink: 'She ___ water after running.',
        sleep: 'He ___ in his own bed.',
        read: 'She ___ a book every night.',
        write: 'He ___ a letter.',
        play: 'She ___ football after school.',
        jump: 'He ___ over the puddle.',
        dance: 'She ___ at the party.',
        swim: 'He ___ in the pool.',
        sing: 'She ___ a song.',
        sit: 'He ___ on the chair.',
        stand: 'She ___ by the window.',
        look: 'He ___ at the sky.',
        help: 'She ___ her little sister.',
        love: 'He ___ his family.',
        need: 'She ___ some water.',
        work: 'He ___ in a shop.',
        cook: 'She ___ dinner at home.',
        talk: 'He ___ to his friend.',
        call: 'She ___ her grandmother.',
        open: 'He ___ the door.',
        close: 'She ___ the window.',
        start: 'He ___ the game.',
        stop: 'She ___ at the red light.',
        listen: 'He ___ to music.',
        watch: 'She ___ TV after dinner.',
        wash: 'He ___ his hands.',
        buy: 'She ___ some fruit.',
        say: 'He ___ hello.',
        give: 'She ___ her friend a gift.',
        take: 'He ___ his school bag.',
        make: 'She ___ a cake.',
        find: 'He ___ his shoes.',
        try: 'She ___ again.',
        cry: 'He ___ when he is sad.',
        fly: 'The bird ___ over the trees.',
        climb: 'She ___ a tall tree.',
        study: 'He ___ English at school.',
        stay: 'She ___ at home today.',
        enjoy: 'He ___ playing football.',
        smile: 'She ___ at her friend.',
        live: 'He ___ in Norway.',
        visit: 'She ___ her grandparents.',
        clean: 'He ___ his room.',
        fix: 'She ___ her bike.',
        mix: 'He ___ the colours.',
        kiss: 'She ___ her mum goodbye.',
        miss: 'He ___ his best friend.',
        push: 'She ___ the door open.',
        catch: 'He ___ the ball.',
        touch: 'She ___ the wall.',
        reach: 'He ___ the top of the hill.',
        search: 'She ___ for her keys.',
        finish: 'He ___ his homework.',
        brush: 'She ___ her teeth.',
        dress: 'He ___ before breakfast.',
        pass: 'She ___ the ball.',
        crash: 'The car ___ into the wall.',
        relax: 'He ___ after school.',
        copy: 'She ___ the word.',
        tidy: 'He ___ his room.',
        hurry: 'She ___ to school.',
        worry: 'He ___ about his test.',
        marry: 'She ___ her best friend.',
        carry: 'He ___ his school bag.',
        bury: 'The dog ___ a bone.',
        reply: 'She ___ to her friend.',
        dry: 'He ___ his hands.',
        pay: 'She ___ for the food.',
        pray: 'He ___ before dinner.',
        spray: 'She ___ water on the plant.',
        destroy: 'The storm ___ the old house.',
        teach: 'He ___ English at school.',
        wish: 'She ___ for a new bike.',
        might: 'It ___ rain tomorrow.',
        should: 'She ___ drink more water.',
        could: 'He ___ help us today.'
    };

    return sentences[v.word] ||
        `She ___ every day.`;
}

function grammarOptions(v) {
    const word = v.word;
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

    if (isModal(word)) {
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
        word.slice(0, -1) + 'ies',
        word + 'ed',
        word + 'ing'
    ];

    return choices(correct, alternatives);
}

// --------------------------------------------------
// LYTTING
// --------------------------------------------------

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

let speechSession = 0;

function stopSpeech() {
    speechSession++;

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function speakListening(word) {
    if (!('speechSynthesis' in window)) return;

    stopSpeech();

    const session = speechSession;

    const sentence = listeningSentences[word] ||
        `I can say ${word}.`;

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

    first.onend = () => {
        if (session !== speechSession) return;

        setTimeout(() => {
            if (session !== speechSession) return;
            window.speechSynthesis.speak(second);
        }, 650);
    };

    window.speechSynthesis.speak(first);
}

// --------------------------------------------------
// FEILDETEKTIVEN
// --------------------------------------------------

function detectiveSentence(v, good) {
    const template = grammarSentence(v);
    const correct = v.third;

    let wrong = v.word;

    if (clean(wrong) === clean(correct)) {
        wrong = v.word + 's';
    }

    return template.replace(
        '___',
        good ? correct : wrong
    );
}

// --------------------------------------------------
// OPPGAVEGENERATOR
// --------------------------------------------------

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

        say = v.word;

        instruction =
            'Lytt til setningen og ordet.';
    }

    if (type === 'portal') {
        const good = Math.random() > 0.5;

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

// --------------------------------------------------
// VIS OPPGAVE
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
        openModal(`
            <h2>${titles[type]}</h2>

            ${task.instruction
                ? `
                    <p style="
                        text-align:center;
                        color:#64748b;
                        font-size:14px;
                        margin:12px 0 8px;
                    ">
                        ${task.instruction}
                    </p>
                  `
                : ''}

            <div class="question" style="
                font-size:${type === 'portal' ? 22 : 21}px;
                line-height:1.45;
                padding:22px 16px;
            ">
                ${task.question}
            </div>

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
                () => speakListening(task.say);

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

                if (
                    clean(b.textContent) ===
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
