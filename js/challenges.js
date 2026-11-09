import { verbs } from '../data/verbs.js';

// One natural context for every verb. The subject is normally She.
// A few contexts use It or He where that sounds more natural.
const contexts = {
  be:'She ___ happy today.',have:'She ___ a new book.',do:'She ___ her homework.',go:'She ___ to school.',
  can:'She ___ swim fast.',will:'She ___ help her friend.',must:'She ___ go home.',
  like:'She ___ chocolate.',want:'She ___ a new bike.',run:'She ___ in the park.',
  walk:'She ___ to school.',eat:'She ___ breakfast.',drink:'She ___ water.',sleep:'She ___ at night.',
  read:'She ___ a book.',write:'She ___ a letter.',play:'She ___ football.',jump:'She ___ over a puddle.',
  dance:'She ___ at the party.',swim:'She ___ in the pool.',sing:'She ___ a song.',sit:'She ___ on a chair.',
  stand:'She ___ by the door.',look:'She ___ at the sky.',help:'She ___ her sister.',love:'She ___ her family.',
  need:'She ___ some water.',work:'She ___ in a shop.',cook:'She ___ dinner.',talk:'She ___ to a friend.',
  call:'She ___ her grandmother.',open:'She ___ the door.',close:'She ___ the window.',start:'She ___ the game.',
  stop:'She ___ at the red light.',listen:'She ___ to music.',watch:'She ___ TV.',wash:'She ___ her hands.',
  buy:'She ___ some fruit.',say:'She ___ hello.',give:'She ___ her friend a gift.',take:'She ___ her bag.',
  make:'She ___ a cake.',find:'She ___ her shoes.',try:'She ___ again.',cry:'She ___ when she is sad.',
  fly:'The bird ___ over the trees.',climb:'She ___ a tall tree.',study:'She ___ English at school.',
  stay:'She ___ at home.',enjoy:'She ___ the game.',smile:'She ___ at her friend.',live:'She ___ in Norway.',
  visit:'She ___ her grandparents.',clean:'She ___ her room.',fix:'She ___ her bike.',mix:'She ___ the colours.',
  kiss:'She ___ her mum goodbye.',miss:'She ___ her friend.',push:'She ___ the door open.',
  catch:'She ___ the ball.',touch:'She ___ the wall.',reach:'She ___ the top.',search:'She ___ for her keys.',
  finish:'She ___ her homework.',brush:'She ___ her teeth.',dress:'She ___ before breakfast.',
  pass:'She ___ the ball.',crash:'The car ___ into the wall.',relax:'She ___ after school.',
  copy:'She ___ the word.',tidy:'She ___ her room.',hurry:'She ___ to school.',worry:'She ___ about her test.',
  marry:'She ___ her partner.',carry:'She ___ her school bag.',bury:'The dog ___ a bone.',
  reply:'She ___ to her friend.',dry:'She ___ her hands.',pay:'She ___ for the food.',
  pray:'She ___ before dinner.',spray:'She ___ water on the plant.',destroy:'The storm ___ houses.',
  teach:'She ___ English.',wish:'She ___ for a bike.',might:'It ___ rain tomorrow.',
  should:'She ___ drink water.',could:'She ___ help us.',
  think:'She ___ about her family.',know:'She ___ the answer.',see:'She ___ a bird.',
  use:'She ___ her computer.',happen:'It ___ every year.',keep:'She ___ her old toys.',
  move:'She ___ the chair.',change:'She ___ her clothes.',mean:'It ___ the same thing.',
  send:'She ___ a letter.',hit:'She ___ the ball.',sink:'The boat ___ in the water.',
  rescue:'She ___ the lost dog.',sail:'She ___ across the lake.',warn:'She ___ her friends.',
  receive:'She ___ a letter.',include:'The box ___ a toy.',cross:'She ___ the road.',
  fill:'She ___ a glass with water.',flood:'The river ___ the road.',ring:'The bell ___ at noon.',
  cost:'It ___ ten pounds.',travel:'She ___ by train.',expect:'She ___ a visitor.',
  offer:'She ___ to help.',win:'She ___ the game.',lose:'She ___ her keys.',
  break:'She ___ the stick.',build:'She ___ a small house.',meet:'She ___ her friends.',
  become:'She ___ very tired.',draw:'She ___ a cat.',paint:'She ___ a picture.',
  get:'She ___ a present.',ask:'She ___ a question.',answer:'She ___ the question.',
  feel:'She ___ happy.',bring:'She ___ her lunch.',begin:'She ___ the lesson.',
  share:'She ___ her toys.',decide:'She ___ what to do.',turn:'She ___ left.',
  would:'She ___ like some water.',rush:'She ___ to catch the bus.',
  learn:'She ___ a new word.',tell:'She ___ a story.',put:'She ___ the book on the table.',
  hear:'She ___ a noise.',understand:'She ___ the question.',leave:'She ___ home early.',
  remember:'She ___ the answer.',forget:'She ___ her bag.',show:'She ___ her drawing.',
  wait:'She ___ for the bus.',hold:'She ___ a baby.',fall:'She ___ on the ice.',
  choose:'She ___ a blue dress.',let:'She ___ her friend play.',believe:'She ___ the story.',
  wear:'She ___ a red coat.',drive:'She ___ to work.',grow:'The flower ___ in spring.',
  sell:'She ___ old books.',spend:'She ___ money on food.',agree:'She ___ with her friend.',
  pick:'She ___ a flower.',pull:'She ___ the door.',throw:'She ___ the ball.',
  shake:'She ___ the bottle.',hide:'She ___ behind a tree.',follow:'She ___ her friend.',
  lead:'She ___ the team.',join:'She ___ the game.',save:'She ___ her money.',
  hope:'She ___ for good weather.',guess:'She ___ the answer.',explain:'She ___ the rules.',
  check:'She ___ her bag.',count:'She ___ to ten.',laugh:'She ___ at the joke.',
  shout:'She ___ for help.',whisper:'She ___ a secret.',dream:'She ___ about flying.',
  continue:'She ___ the game.',prefer:'She ___ tea.',order:'She ___ a pizza.',
  train:'She ___ after school.',serve:'She ___ dinner.',fit:'The jacket ___ her well.',
  burn:'The fire ___ brightly.',bake:'She ___ a cake.',afford:'She ___ a new bike.'
};

const modalWords = new Set(['can','will','must','might','should','could','would']);
const normalize = value => String(value ?? '').toLocaleLowerCase('en').trim()
  .replace(/[.!?]/g,'').replace(/\s+/g,' ');
const normalizeBase = value => normalize(value).replace(/^to\s+/,'');

function shuffle(input) {
  const a = [...input];
  for (let i=a.length-1;i>0;i--) {
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function options(correct, distractors, count=4) {
  const seen = new Set([normalize(correct)]);
  const distinct=[];
  for (const candidate of shuffle(distractors)) {
    const key=normalize(candidate);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    distinct.push(candidate);
    if (distinct.length>=count-1) break;
  }
  return shuffle([correct,...distinct]);
}
function grammarOptions(v) {
  const w=v.word;
  if (w==='be') return shuffle(['am','is','are','be']);
  if (w==='have') return shuffle(['have','has','haves','having']);
  if (w==='do') return shuffle(['do','does','dos','doing']);
  if (modalWords.has(w)) return options(w,[w+'s',w+'es',w+'ed',w+'ing']);
  const ing=w.endsWith('ie')?w.slice(0,-2)+'ying':w.endsWith('e')&&!w.endsWith('ee')?w.slice(0,-1)+'ing':w+'ing';
  const past=w.endsWith('e')?w+'d':w+'ed';
  return options(v.third,[w,w+'s',w+'es',w.endsWith('y')?w.slice(0,-1)+'ies':w+'ies',past,ing]);
}
function detective(v, good) {
  const right=v.third;
  const wrong=grammarOptions(v).find(x=>normalize(x)!==normalize(right)) || v.word+'s';
  return (contexts[v.word] || 'She ___ every day.').replace('___',good?right:wrong);
}

// English voice: a short sentence, a pause, then the infinitive without "to".
let audioToken=0;
function stopListening() {
  audioToken++;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
function playListening(v) {
  if (!('speechSynthesis' in window)) return false;
  stopListening();
  const token=audioToken;
  const voices=window.speechSynthesis.getVoices();
  const voice=voices.find(x=>x.lang.toLowerCase()==='en-gb') ||
    voices.find(x=>x.lang.toLowerCase().startsWith('en'));
  const utter=(text,rate)=>{
    const u=new SpeechSynthesisUtterance(text);
    u.lang=voice?.lang || 'en-GB';
    if (voice) u.voice=voice;
    u.rate=rate;u.pitch=1;u.volume=1;
    return u;
  };
  const sentence=v.sentence || `I want to ${v.word}.`;
  const first=utter(sentence,0.70);
  const second=utter(v.word,0.65);
  first.onend=()=>setTimeout(()=>{
    if (token===audioToken) window.speechSynthesis.speak(second);
  },650);
  window.speechSynthesis.speak(first);
  return true;
}

export function challengeFor(v,type) {
  const others=verbs.filter(x=>x.id!==v.id);
  if (type==='chest') return {
    type,mode:'choice',question:`Hva betyr «${v.word}»?`,
    correct:v.no,answers:options(v.no,others.map(x=>x.no)),instruction:''
  };
  if (type==='crystal') return {
    type,mode:'choice',question:contexts[v.word] || 'She ___ every day.',
    correct:v.third,answers:grammarOptions(v),
    instruction:`Velg riktig form av «${v.word}» i presens.`
  };
  if (type==='rune') return {
    type,mode:'write',question:`Skriv «${v.no}» på engelsk`,
    correct:v.word,answers:[],instruction:'Skriv grunnformen, med eller uten «to».'
  };
  if (type==='bell') return {
    type,mode:'choice',question:'Hva betyr ordet du hører?',
    correct:v.no,answers:options(v.no,others.map(x=>x.no)),
    instruction:'Lytt til setningen og ordet.',say:v.word
  };
  if (type==='portal') {
    const good=Math.random()<0.5;
    return {type,mode:'choice',question:detective(v,good),
      correct:good?'Riktig':'Feil',answers:['Riktig','Feil'],
      instruction:'Er setningen riktig?'};
  }
  throw new Error(`Ukjent oppgavetype: ${type}`);
}

const headings={chest:'🎁 Finn ordet',crystal:'💎 Grammatikk',rune:'🪨 Staveprøve',bell:'🔔 Lytteprøve',portal:'🌀 Feildetektiven'};
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
export function runChallenge(openModal,closeModal,v,type,success) {
  const task=challengeFor(v,type);
  let answered=false;
  const q=escapeHtml(task.question);
  openModal(`
    <h2>${headings[type]}</h2>
    ${task.instruction?`<p class="muted" style="text-align:center">${escapeHtml(task.instruction)}</p>`:''}
    <div class="question" style="font-size:22px;line-height:1.45;padding:22px 16px">${q}</div>
    ${task.say?'<button id="listen" class="secondary">🔊 Spill av igjen</button>':''}
    ${task.mode==='write'?`<input id="answerText" class="inputAnswer" placeholder="Skriv ordet her" autocomplete="off" autocapitalize="off" spellcheck="false"><p><button id="submitText" class="primary">Sjekk svar</button></p>`:
    `<div class="choices">${task.answers.map((a,i)=>`<button class="choice" data-choice="${i}">${escapeHtml(a)}</button>`).join('')}</div>`}
    <div class="feedback" id="feedback" aria-live="polite"></div>
    <div class="rowBtns"><button id="nextChallenge" class="primary" style="display:none">Fortsett eventyret →</button></div>
  `);
  if (task.say) {
    document.getElementById('listen').onclick=()=>playListening(v);
    // Automatic playback can be blocked by Safari; the button remains available.
    setTimeout(()=>{if(!answered && document.getElementById('listen')) playListening(v);},300);
  }
  if (task.mode==='write') {
    const input=document.getElementById('answerText');
    document.getElementById('submitText').onclick=()=>judge(input.value);
    input.addEventListener('keydown',e=>{if(e.key==='Enter') judge(input.value);});
    input.focus();
  } else {
    document.querySelectorAll('[data-choice]').forEach(button=>{
      button.onclick=()=>judge(task.answers[Number(button.dataset.choice)],button);
    });
  }
  function judge(value,button) {
    if (answered) return;
    const ok=task.mode==='write'?
      normalizeBase(value)===normalizeBase(task.correct):
      normalize(value)===normalize(task.correct);
    answered=true;
    if (task.say) stopListening();
    document.querySelectorAll('[data-choice]').forEach(b=>{
      b.disabled=true;
      if(normalize(task.answers[Number(b.dataset.choice)])===normalize(task.correct)) b.classList.add('good');
      else if(b===button) b.classList.add('bad');
    });
    const input=document.getElementById('answerText');if(input)input.disabled=true;
    const submit=document.getElementById('submitText');if(submit)submit.disabled=true;
    const feedback=document.getElementById('feedback');
    feedback.textContent=ok?'🥳 Riktig! Bra jobbet!':`🙂 Riktig svar: ${task.correct}`;
    feedback.style.color=ok?'#16835d':'#b45309';
    const next=document.getElementById('nextChallenge');
    next.style.display='';
    next.textContent=ok?'Samle belønningen →':'Prøv senere →';
    next.onclick=()=>{if(task.say)stopListening();closeModal();success(ok);};
  }
}
