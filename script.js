document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initWindows();
  initQuiz();
  initRng();
});

function initClock() {
  const clockEl = document.getElementById('live-clock');
  if (!clockEl) return;
  function updateClock() {
    clockEl.textContent = new Date().toLocaleTimeString();
  }
  updateClock();
  setInterval(updateClock, 1000);
}

let topZ = 10;

function initWindows() {
  const windows = document.querySelectorAll('.window');

  windows.forEach((win) => {
    win.addEventListener('mousedown', () => focusWindow(win));
    makeDraggable(win);
  });

  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeWindow(document.getElementById(btn.dataset.close));
    });
  });

  document.querySelectorAll('[data-minimize]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeWindow(document.getElementById(btn.dataset.minimize));
    });
  });

  document.querySelectorAll('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openWindow(document.getElementById(btn.dataset.open));
    });
  });

  const legacyOpen = document.getElementById('welcomeopen');
  if (legacyOpen && !legacyOpen.hasAttribute('data-open')) {
    legacyOpen.addEventListener('click', () => openWindow(document.getElementById('welcome')));
  }
  const legacyClose = document.getElementById('welcomeclose');
  if (legacyClose && !legacyClose.hasAttribute('data-close')) {
    legacyClose.addEventListener('click', () => closeWindow(document.getElementById('welcome')));
  }
}

function focusWindow(win) {
  if (!win) return;
  topZ += 1;
  win.style.zIndex = String(topZ);
}

function closeWindow(element) {
  if (!element) return;
  element.style.display = 'none';
}

function openWindow(element) {
  if (!element) return;
  element.style.display = 'flex';
  focusWindow(element);
}

function makeDraggable(element) {
  if (!element) return;
  const handle = document.getElementById(element.id + 'header') || element.querySelector('.window-header') || element;
  handle.style.cursor = 'move';

  let startX = 0, startY = 0, offsetX = 0, offsetY = 0;

  handle.addEventListener('mousedown', startDragging);
  handle.addEventListener('touchstart', startDragging, { passive: false });

  function startDragging(e) {
    if (e.target.closest && e.target.closest('.win-btn')) return;

    const point = e.touches ? e.touches[0] : e;
    if (e.cancelable !== false) e.preventDefault?.();

    const rect = element.getBoundingClientRect();
    const parentRect = element.offsetParent ? element.offsetParent.getBoundingClientRect() : { left: 0, top: 0 };
    element.style.transform = 'none';
    element.style.left = rect.left - parentRect.left + 'px';
    element.style.top = rect.top - parentRect.top + 'px';
    element.style.margin = '0';

    startX = point.clientX;
    startY = point.clientY;
    offsetX = rect.left - parentRect.left;
    offsetY = rect.top - parentRect.top;

    focusWindow(element);

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', stopDragging);
  }

  function onDrag(e) {
    const point = e.touches ? e.touches[0] : e;
    if (e.cancelable !== false) e.preventDefault?.();
    const dx = point.clientX - startX;
    const dy = point.clientY - startY;
    element.style.left = offsetX + dx + 'px';
    element.style.top = offsetY + dy + 'px';
  }

  function stopDragging() {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDragging);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', stopDragging);
  }
}

const QUIZ = [
  {
    q: "What is Deadpool's real name?",
    options: ["Wade Wilson", "Slade Wilson", "Wade Watts", "Peter Pool"],
    answer: 0,
    quip: "Correct! Slade is Deathstroke. We totally didn't steal from him. Okay, we did.",
  },
  {
    q: "What is Wade's favorite food?",
    options: ["Tacos", "Sushi", "Chimichangas", "Cable's patience"],
    answer: 2,
    quip: "Chimichangas! Deep-fried justice. Tacos are a close second.",
  },
  {
    q: "Who does Deadpool's healing factor come from (in the comics)?",
    options: ["Hulk", "Wolverine", "Captain America", "Blind Al's cooking"],
    answer: 1,
    quip: "Yep — Weapon X leftovers. Me and Logan are basically healing-factor brothers. He hates that.",
  },
  {
    q: "Who plays Wade in the movies?",
    options: ["Hugh Jackman", "Ryan Gosling", "Ryan Reynolds", "Ryan Reynolds' abs"],
    answer: 2,
    quip: "Ryan Reynolds. He was born for this. I mean, I was born for this. He just rents the face.",
  },
  {
    q: "What colors are my suit? (Get this wrong and we're done.)",
    options: ["Green & Yellow", "Red & Black", "Blue & Gold", "Beige & Beige"],
    answer: 1,
    quip: "Red & Black — so bad guys can't see me bleed. Fashion AND function!",
  },
  {
    q: "Where did Deadpool first appear?",
    options: ["X-Men #1", "New Mutants #98", "Amazing Fantasy #15", "A Taco Bell napkin"],
    answer: 1,
    quip: "New Mutants #98 (1991). Rob Liefeld gave me all the pouches. ALL of them.",
  },
];

let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;

function initQuiz() {
  const qEl = document.getElementById('quiz-question');
  const optsEl = document.getElementById('quiz-options');
  const progEl = document.getElementById('quiz-progress');
  const scoreEl = document.getElementById('quiz-score');
  const fbEl = document.getElementById('quiz-feedback');
  const nextBtn = document.getElementById('quiz-next');
  const restartBtn = document.getElementById('quiz-restart');
  const barFill = document.getElementById('quiz-bar-fill');
  if (!qEl || !optsEl) return;

  function render() {
    quizAnswered = false;
    const total = QUIZ.length;
    if (quizIndex >= total) return renderFinal();
    const item = QUIZ[quizIndex];
    qEl.textContent = item.q;
    progEl.textContent = `Question ${quizIndex + 1}/${total}`;
    scoreEl.textContent = `Score: ${quizScore} `;
    barFill.style.width = `${(quizIndex / total) * 100}%`;
    fbEl.textContent = '';
    nextBtn.disabled = true;
    optsEl.innerHTML = '';
    item.options.forEach((opt, i) => {
      const b = document.createElement('button');
      b.className = 'quiz-opt';
      b.textContent = opt;
      b.addEventListener('click', () => answer(i, b));
      optsEl.appendChild(b);
    });
  }

  function answer(i, btn) {
    if (quizAnswered) return;
    quizAnswered = true;
    const item = QUIZ[quizIndex];
    const buttons = [...optsEl.children];
    buttons.forEach((b) => { b.disabled = true; b.classList.add('dim'); });
    if (i === item.answer) {
      quizScore++;
      btn.classList.remove('dim');
      btn.classList.add('correct');
      fbEl.textContent = item.quip;
    } else {
      btn.classList.remove('dim');
      btn.classList.add('wrong');
      buttons[item.answer].classList.remove('dim');
      buttons[item.answer].classList.add('correct');
      fbEl.textContent = ` Nope! ${item.quip}`;
    }
    scoreEl.textContent = `Score: ${quizScore} `;
    nextBtn.disabled = false;
  }

  function renderFinal() {
    const total = QUIZ.length;
    barFill.style.width = '100%';
    progEl.textContent = 'Finished!';
    let title, msg;
    if (quizScore === total) {
      title = 'Perfect score!';
      msg = 'HUGE Deadpool fan?';
    } else if (quizScore >= 4) {
      title = ` ${quizScore}/${total} — Well that's fine`;
      msg = 'Mid';
    } else if (quizScore >= 2) {
      title = ` ${quizScore}/${total} - A bit disappointing isn't it?`;
      msg = 'Are you kidding me?';
    } else {
      title = ` ${quizScore}/${total} — Trash`;
      msg = 'Hit restart and redeem yourself, beautiful.';
    }
    qEl.textContent = title;
    optsEl.innerHTML = '';
    fbEl.textContent = msg;
    scoreEl.textContent = `Score: ${quizScore} `;
    nextBtn.disabled = true;
  }

  nextBtn.addEventListener('click', () => {
    if (quizIndex < QUIZ.length) quizIndex++;
    render();
  });
  restartBtn.addEventListener('click', () => {
    quizIndex = 0; quizScore = 0;
    render();
  });

  render();
}

let rngRolls = 0;
let rngSpinning = false;
let lastRoll = '';

function rng6() {
  const buf = new Uint32Array(1);
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(buf);
    return String(buf[0] % 1000000).padStart(6, '0');
  }
  return String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
}

function analyzeNumber(s) {
  const badges = [];
  const digits = s.split('').map(Number);
  const n = parseInt(s, 10);

  const allSame = digits.every((d) => d === digits[0]);
  const isPalindrome = s === [...s].reverse().join('');
  const uniq = new Set(digits).size;

  let asc = true, desc = true;
  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== digits[i - 1] + 1) asc = false;
    if (digits[i] !== digits[i - 1] - 1) desc = false;
  }
  const hasTriple = /(\d)\1\1/.test(s);
  const hasPair2 = (s.match(/(\d)\1/g) || []).length >= 2;

  if (allSame) badges.push({ label: ' ULTRA RARE: all same!', cp: 1000 });
  else if (isPalindrome) badges.push({ label: ' Palindrome!', cp: 300 });
  if (asc || desc) badges.push({ label: asc ? ' Straight ascending!' : ' Straight descending!', cp: 500 });
  if (hasTriple) badges.push({ label: ' Trips (3 of a kind)!', cp: 150 });
  if (hasPair2) badges.push({ label: ' Double pairs!', cp: 120 });
  if (uniq === 2) badges.push({ label: ' Only 2 unique digits', cp: 100 });
  if (s.includes('666')) badges.push({ label: ' 666 — edgy!', cp: 66 });
  if (s.includes('69')) badges.push({ label: ' 69 — nice.', cp: 69 });
  if (s.includes('13')) badges.push({ label: ' 13 — unlucky-ish', cp: 13 });
  if (s.includes('007')) badges.push({ label: ' 007 — Bond, Wade Bond', cp: 70 });
  if (s.includes('420')) badges.push({ label: ' 420 — hehe', cp: 42 });
  if (s === '000000' || s === '999999') badges.push({ label: ' VOID / MAX — touch grass', cp: 400 });
  if (isPrime(n)) badges.push({ label: ' Prime number!', cp: 80 });

  const sum = digits.reduce((a, b) => a + b, 0);
  if (sum === 21) badges.push({ label: ' Digit sum = 21 (blackjack!)', cp: 21 });

  if (badges.length === 0) {
    if (uniq === 6) badges.push({ label: ' All digits unique ', cp: 25 });
    else badges.push({ label: ' Mid ', cp: 10 });
  }
  const total = 10 + badges.reduce((a, b) => a + b.cp, 0);
  return { badges, total };
}

function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
  return true;
}

const RNG_QUIPS = {
  god: ["STOP. Screenshot that. That's museum-grade luck.", "Did Domino touch your mouse?! UNREAL.", "Okay, show-off. Even *I* am impressed."],
  good: ["Ooh, spicy digits! Mama likes.", "Not bad, beautiful. Chimichanga-worthy.", "Cable just raised one eyebrow. Huge win."],
  mid: ["Mid. Gloriously, aggressively mid. Love that for you.", "The RNG gods said 'meh'. Same.", "Roll again. I believe in you-ish."],
};

function initRng() {
  const reelsEl = document.getElementById('rng-reels');
  const spinBtn = document.getElementById('rng-spin');
  const copyBtn = document.getElementById('rng-copy');
  const epEl = document.getElementById('rng-ep');
  const rollsEl = document.getElementById('rng-rolls');
  const commentEl = document.getElementById('rng-comment');
  const badgesEl = document.getElementById('rng-badges');
  const historyEl = document.getElementById('rng-history');
  if (!reelsEl || !spinBtn) return;

  const reels = [...reelsEl.children];

  spinBtn.addEventListener('click', () => {
    if (rngSpinning) return;
    rngSpinning = true;
    spinBtn.disabled = true;
    epEl.textContent = '??? CP';
    badgesEl.innerHTML = '';
    commentEl.textContent = 'Rolling...';
    reels.forEach((r) => { r.classList.remove('locked'); r.classList.add('spinning'); });

    const target = rng6();
    lastRoll = target;
    const scrambleTimers = reels.map((reel) =>
      setInterval(() => { reel.textContent = String(Math.floor(Math.random() * 10)); }, 60)
    );

    target.split('').forEach((digit, i) => {
      setTimeout(() => {
        clearInterval(scrambleTimers[i]);
        reels[i].classList.remove('spinning');
        reels[i].classList.add('locked');
        reels[i].textContent = digit;
        if (i === target.length - 1) finishRoll(target);
      }, 400 + i * 350);
    });
  });

  function finishRoll(s) {
    const { badges, total } = analyzeNumber(s);
    rngRolls++;
    rollsEl.textContent = `Rolls: ${rngRolls}`;

    let shown = 0;
    const step = Math.max(1, Math.floor(total / 30));
    epEl.textContent = '0 CP';
    const t = setInterval(() => {
      shown += step;
      if (shown >= total) { shown = total; clearInterval(t); }
      epEl.textContent = `${shown} CP`;
    }, 30);

    badgesEl.innerHTML = '';
    badges.forEach((b, i) => {
      setTimeout(() => {
        const span = document.createElement('span');
        span.className = 'badge ' + (b.cp >= 300 ? 'epic' : b.cp >= 100 ? 'gold' : '');
        span.textContent = `${b.label} +${b.cp}`;
        badgesEl.appendChild(span);
      }, i * 250);
    });

    const tier = total >= 400 ? 'god' : total >= 120 ? 'good' : 'mid';
    const pool = RNG_QUIPS[tier];
    commentEl.textContent = `“${s}” — ${pool[Math.floor(Math.random() * pool.length)]} (${total} Points!)`;

    const li = document.createElement('li');
    li.textContent = `#${rngRolls} → ${s} · ${total} CP · ${badges.map((b) => b.label).join(' | ')}`;
    historyEl.prepend(li);
    while (historyEl.children.length > 20) historyEl.lastChild.remove();

    rngSpinning = false;
    spinBtn.disabled = false;
  }

  copyBtn.addEventListener('click', async () => {
    if (!lastRoll) { commentEl.textContent = 'Spin first, then brag. Rules are rules.'; return; }
    try {
      await navigator.clipboard.writeText(lastRoll);
      commentEl.textContent = `Copied “${lastRoll}”! Go flex on Discord, you degenerate.`;
    } catch {
      commentEl.textContent = `Clipboard said no. Your number is ${lastRoll} — memorize it, nerd.`;
    }
  });
}
