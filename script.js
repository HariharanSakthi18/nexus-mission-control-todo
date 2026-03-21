// ============================================================
//  WEB AUDIO — SOUND ENGINE
// ============================================================
let audioCtx = null;
let soundOn = true;

function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

function playTone(freq, type, duration, vol = 0.3, delay = 0) {
    if (!soundOn) return;
    try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
    } catch (e) { }
}

function soundComplete() {
    // Triumphant sci-fi chime
    playTone(523, 'sine', 0.15, 0.25, 0);
    playTone(659, 'sine', 0.15, 0.25, 0.1);
    playTone(784, 'sine', 0.2, 0.3, 0.2);
    playTone(1046, 'sine', 0.35, 0.3, 0.35);
    // sparkle overtone
    playTone(2093, 'triangle', 0.2, 0.1, 0.35);
}

function soundAdd() {
    playTone(440, 'square', 0.08, 0.1, 0);
    playTone(660, 'square', 0.1, 0.12, 0.08);
}

function soundDelete() {
    playTone(220, 'sawtooth', 0.12, 0.2, 0);
    playTone(110, 'sawtooth', 0.1, 0.2, 0.1);
}

function soundReminder() {
    playTone(880, 'sine', 0.2, 0.25, 0);
    playTone(880, 'sine', 0.2, 0.25, 0.25);
    playTone(1100, 'sine', 0.3, 0.3, 0.5);
}

// ============================================================
//  STICK FIGURE CANVAS ANIMATOR
// ============================================================
const priorityColors = { critical: '#ff2d78', high: '#ff9500', normal: '#00f5ff' };
const POSES = ['run', 'jump', 'celebrate', 'push', 'idle', 'fight'];

function getFigureType(idx, done) {
    if (done) return 'salute';
    return POSES[idx % POSES.length];
}

class StickFigure {
    constructor(canvas, color, animType) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.color = color;
        this.animType = animType;
        this.t = Math.random() * Math.PI * 2;
        this.raf = null;
        this.loop = this.loop.bind(this);
        this.start();
    }
    start() { this.raf = requestAnimationFrame(this.loop); }
    stop() { if (this.raf) cancelAnimationFrame(this.raf); }
    loop() { this.t += 0.06; this.draw(); this.raf = requestAnimationFrame(this.loop); }

    draw() {
        const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
        ctx.clearRect(0, 0, W, H);
        ctx.strokeStyle = this.color; ctx.fillStyle = this.color;
        ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.shadowColor = this.color; ctx.shadowBlur = 8;
        const cx = W / 2, t = this.t;

        switch (this.animType) {
            case 'run': {
                const bb = Math.sin(t * 2) * 3, by = 28 + bb;
                this._circle(cx, by - 18, 7);
                this._line(cx, by - 11, cx, by + 8);
                this._line(cx, by - 5, cx - 12 * Math.cos(t), by - 5 + 12 * Math.sin(t));
                this._line(cx, by - 5, cx + 12 * Math.cos(t), by - 5 - 12 * Math.sin(t));
                this._line(cx, by + 8, cx - 12 * Math.cos(t + Math.PI), by + 8 + 14 * Math.abs(Math.sin(t + Math.PI)));
                this._line(cx, by + 8, cx + 12 * Math.cos(t + Math.PI), by + 8 + 14 * Math.abs(Math.sin(t)));
                break;
            }
            case 'jump': {
                const jh = Math.abs(Math.sin(t)) * 20, by = 58 - jh;
                this._circle(cx, by - 20, 7);
                this._line(cx, by - 13, cx, by + 6);
                const ls = Math.abs(Math.sin(t)) * 18;
                this._line(cx, by - 7, cx - 14, by - 7 - ls * .5); this._line(cx, by - 7, cx + 14, by - 7 - ls * .5);
                this._line(cx, by + 6, cx - ls, by + 6 + 16 - ls * .3); this._line(cx, by + 6, cx + ls, by + 6 + 16 - ls * .3);
                break;
            }
            case 'celebrate': {
                const by = 44;
                this._circle(cx, by - 20, 7);
                this._line(cx, by - 13, cx, by + 6);
                this._line(cx, by - 7, cx - 16, by - 7 - 14 + Math.sin(t) * 8);
                this._line(cx, by - 7, cx + 16, by - 7 - 14 - Math.sin(t) * 8);
                this._line(cx, by + 6, cx - 10, by + 22); this._line(cx, by + 6, cx + 10, by + 22);
                if (Math.sin(t * 3) > 0.8) { ctx.shadowBlur = 20; this._dot(cx - 20, by - 28, 2); this._dot(cx + 22, by - 25, 2); }
                break;
            }
            case 'push': {
                const by = 50;
                ctx.save(); ctx.translate(cx, by); ctx.rotate(0.3);
                this._circle(0, -36, 7);
                this._line(0, -29, 0, -10);
                const pe = Math.sin(t * 2) * 5;
                this._line(0, -22, 18 + pe, -22); this._line(0, -22, -12, -14);
                this._line(0, -10, -10, 6); this._line(0, -10, 10, 6);
                ctx.restore();
                const bx = cx + 24 + Math.sin(t * 2) * 3;
                ctx.strokeRect(bx, by - 14, 16, 16);
                break;
            }
            case 'fight': {
                const by = 44;
                this._circle(cx, by - 22, 7);
                this._line(cx, by - 15, cx, by + 4);
                this._line(cx, by - 9, cx - 14, by - 9 + 10);
                this._line(cx, by - 9, cx + 14 + Math.sin(t * 1.8) * 6, by - 14 + Math.sin(t * 1.8) * 10);
                this._line(cx, by + 4, cx - 10, by + 18);
                this._line(cx, by + 4, cx + 10 * Math.abs(Math.cos(t)), by + 4 - 14 * Math.abs(Math.sin(t * 1.8)));
                break;
            }
            case 'salute': {
                const by = 44;
                this._circle(cx, by - 22, 7);
                this._line(cx, by - 15, cx, by + 4);
                ctx.save(); ctx.translate(cx, by - 9); ctx.rotate(-0.9 + Math.sin(t * .8) * .15);
                this._line(0, 0, 16, 0); ctx.restore();
                this._line(cx, by - 9, cx - 14, by + 2);
                this._line(cx, by + 4, cx - 9, by + 20); this._line(cx, by + 4, cx + 9, by + 20);
                ctx.shadowBlur = 16; ctx.fillStyle = this.color;
                this._star(cx + 6, by - 34, 4, t);
                break;
            }
            default: {
                const bob = Math.sin(t) * 2, by = 44 + bob;
                this._circle(cx, by - 22, 7);
                this._line(cx, by - 15, cx, by + 4);
                const aw = Math.sin(t * .7) * 8;
                this._line(cx, by - 9, cx - 14, by - 9 + aw); this._line(cx, by - 9, cx + 14, by - 9 - aw * .5);
                this._line(cx, by + 4, cx - 9, by + 20); this._line(cx, by + 4, cx + 9, by + 20);
            }
        }
    }

    _circle(x, y, r) { this.ctx.beginPath(); this.ctx.arc(x, y, r, 0, Math.PI * 2); this.ctx.stroke(); }
    _line(x1, y1, x2, y2) { this.ctx.beginPath(); this.ctx.moveTo(x1, y1); this.ctx.lineTo(x2, y2); this.ctx.stroke(); }
    _dot(x, y, r) { this.ctx.beginPath(); this.ctx.arc(x, y, r, 0, Math.PI * 2); this.ctx.fill(); }
    _star(cx, cy, r, t) {
        const ctx = this.ctx; ctx.save(); ctx.translate(cx, cy); ctx.rotate(t);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const a = (i * Math.PI * 4 / 5) - Math.PI / 2, b = a + Math.PI * 2 / 5;
            i === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            ctx.lineTo(Math.cos(b) * r * .4, Math.sin(b) * r * .4);
        }
        ctx.closePath(); ctx.fill(); ctx.restore();
    }
}

// ============================================================
//  DUE DATE HELPERS
// ============================================================
function getDueStatus(dueStr) {
    if (!dueStr) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(dueStr + 'T00:00:00');
    const diff = Math.round((due - today) / 86400000);
    if (diff < 0) return { label: `OVERDUE ${Math.abs(diff)}d`, cls: 'overdue', diff };
    if (diff === 0) return { label: 'DUE TODAY', cls: 'today', diff };
    if (diff <= 2) return { label: `DUE IN ${diff}d`, cls: 'soon', diff };
    return { label: `DUE ${due.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`, cls: 'ok', diff };
}

// ============================================================
//  STATE
// ============================================================
let tasks = JSON.parse(localStorage.getItem('nx2_tasks') || '[]');
let filter = 'all';
let selP = 'critical';
const figures = {};
const notified = new Set(JSON.parse(localStorage.getItem('nx2_notified') || '[]'));

if (tasks.length === 0) {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 5);
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const fmt = d => d.toISOString().slice(0, 10);
    tasks = [
        { id: 's1', text: 'Secure the perimeter and neutralize all threats', done: false, priority: 'critical', due: fmt(tomorrow) },
        { id: 's2', text: 'Extract the intelligence package from sector 7', done: false, priority: 'high', due: fmt(nextWeek) },
        { id: 's3', text: 'Rendezvous with ground team at checkpoint alpha', done: true, priority: 'normal', due: fmt(yesterday) },
    ];
}

// ============================================================
//  RENDER
// ============================================================
function render() {
    const el = document.getElementById('list');

    const vis = tasks.filter(t => {
        if (filter === 'active') return !t.done;
        if (filter === 'done') return t.done;
        if (filter === 'overdue') return !t.done && getDueStatus(t.due)?.diff < 0;
        return true;
    });

    Object.values(figures).forEach(f => f.stop());
    for (const k in figures) delete figures[k];
    el.innerHTML = '';

    if (vis.length === 0) {
        el.innerHTML = `<div class="empty">NO MISSIONS FOUND — SYSTEM IDLE</div>`;
    } else {
        vis.forEach((task, i) => {
            const card = document.createElement('div');
            const ds = getDueStatus(task.due);
            const isOverdue = ds && ds.diff < 0 && !task.done;

            card.className = 'task-card' + (task.done ? ' done-card' : '') + (isOverdue ? ' overdue-card' : '');
            card.dataset.id = task.id;
            card.dataset.p = task.priority;

            const figType = getFigureType(i, task.done);
            const col = task.done ? '#00ff88' : (priorityColors[task.priority] || '#00f5ff');

            const dueBadgeHtml = ds
                ? `<div class="due-badge ${task.done ? 'done-due' : ds.cls}">⏱ ${ds.label}</div>`
                : '';

            card.innerHTML = `
        <div class="fig-wrap"><canvas id="fig_${task.id}" width="70" height="80"></canvas></div>
        <div class="cyber-check ${task.done ? 'done' : ''}" onclick="toggleTask('${task.id}')"></div>
        <div class="task-body">
          <div class="task-text">${esc(task.text)}</div>
          ${dueBadgeHtml}
        </div>
        <div class="p-badge ${task.priority}">${task.priority.toUpperCase()}</div>
        <button class="del-btn" onclick="deleteTask('${task.id}')">✕</button>
      `;

            el.appendChild(card);

            const canvas = document.getElementById(`fig_${task.id}`);
            if (canvas) figures[task.id] = new StickFigure(canvas, col, figType);
        });
    }

    // Stats
    const tot = tasks.length;
    const done = tasks.filter(t => t.done).length;
    const over = tasks.filter(t => !t.done && getDueStatus(t.due)?.diff < 0).length;
    document.getElementById('sTot').textContent = tot;
    document.getElementById('sDone').textContent = done;
    document.getElementById('sLeft').textContent = tot - done;
    document.getElementById('sOver').textContent = over;

    // Progress bar
    const pct = tot === 0 ? 0 : Math.round((done / tot) * 100);
    document.getElementById('pct').textContent = pct + '%';
    document.getElementById('progFill').style.width = pct + '%';

    // Segments
    const segs = document.getElementById('progSegs');
    segs.innerHTML = '';
    tasks.forEach(t => {
        const s = document.createElement('div');
        s.className = 'seg' + (t.done ? ' done' : '');
        segs.appendChild(s);
    });

    save();
}

function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============================================================
//  ACTIONS
// ============================================================
function addTask() {
    const inp = document.getElementById('inp');
    const due = document.getElementById('dueDate').value;
    const txt = inp.value.trim();
    if (!txt) {
        inp.style.borderColor = '#ff2d78';
        inp.style.boxShadow = '0 0 20px rgba(255,45,120,.4)';
        setTimeout(() => { inp.style.borderColor = ''; inp.style.boxShadow = ''; }, 700);
        return;
    }
    tasks.unshift({ id: Date.now() + '', text: txt, done: false, priority: selP, due: due || null });
    inp.value = '';
    soundAdd();
    render();
}

window.toggleTask = function (id) {
    const t = tasks.find(t => t.id === id);
    if (!t) return;
    t.done = !t.done;
    if (t.done) { burst(); soundComplete(); }
    render();
};

window.deleteTask = function (id) {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
        el.classList.add('removing');
        if (figures[id]) figures[id].stop();
        soundDelete();
        setTimeout(() => { tasks = tasks.filter(t => t.id !== id); render(); }, 400);
    }
};

// ============================================================
//  REMINDERS — check every minute
// ============================================================
function checkReminders() {
    tasks.forEach(t => {
        if (t.done || !t.due) return;
        const ds = getDueStatus(t.due);
        if (!ds) return;
        const key = t.id + '_' + ds.cls;
        if ((ds.cls === 'today' || ds.cls === 'soon' || ds.cls === 'overdue') && !notified.has(key)) {
            notified.add(key);
            localStorage.setItem('nx2_notified', JSON.stringify([...notified]));
            const msgs = {
                today: '⚡ DUE TODAY — Mission requires immediate action!',
                soon: `⚠ DEADLINE APPROACHING — ${ds.label}`,
                overdue: `🚨 MISSION OVERDUE — ${Math.abs(ds.diff)} day(s) past deadline!`
            };
            showToast(t.text, msgs[ds.cls]);
            soundReminder();
        }
    });
}

function showToast(title, msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<div class="toast-title">⏰ MISSION ALERT</div><div class="toast-msg"><strong>${esc(title.slice(0, 40))}${title.length > 40 ? '…' : ''}</strong><br>${msg}</div>`;
    document.body.appendChild(t);
    setTimeout(() => {
        t.classList.add('fade-out');
        setTimeout(() => t.remove(), 400);
    }, 5000);
}

// ============================================================
//  PARTICLE BURST
// ============================================================
function burst() {
    const colors = ['#00f5ff', '#ff2d78', '#a855f7', '#ffd700', '#00ff88'];
    const x = window.innerWidth / 2, y = window.innerHeight / 2;
    for (let i = 0; i < 36; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const angle = (i / 36) * Math.PI * 2;
        const dist = 80 + Math.random() * 140;
        p.style.cssText = `left:${x}px;top:${y}px;width:${4 + Math.random() * 7}px;height:${4 + Math.random() * 7}px;background:${colors[i % colors.length]};box-shadow:0 0 8px ${colors[i % colors.length]};--tx:translateX(${Math.cos(angle) * dist}px);--ty:translateY(${Math.sin(angle) * dist}px);animation-duration:${.6 + Math.random() * .6}s;`;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1300);
    }
}

// ============================================================
//  STARS
// ============================================================
(function () {
    const cont = document.getElementById('stars');
    for (let i = 0; i < 150; i++) {
        const s = document.createElement('div');
        s.className = 'star';
        const sz = Math.random() * 2 + .5;
        s.style.cssText = `width:${sz}px;height:${sz}px;top:${Math.random() * 100}%;left:${Math.random() * 100}%;animation-duration:${2 + Math.random() * 4}s;animation-delay:${Math.random() * 4}s;`;
        cont.appendChild(s);
    }
})();

// ============================================================
//  CLOCK
// ============================================================
function tick() {
    const n = new Date();
    document.getElementById('clock').textContent = n.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('hudDate').textContent = n.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}
setInterval(tick, 1000); tick();

// ============================================================
//  SOUND TOGGLE
// ============================================================
document.getElementById('soundToggle').addEventListener('click', () => {
    soundOn = !soundOn;
    document.getElementById('soundToggle').classList.toggle('on', soundOn);
    if (soundOn) soundAdd();
});

// ============================================================
//  EVENT LISTENERS
// ============================================================
document.getElementById('addBtn').addEventListener('click', addTask);
document.getElementById('inp').addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

document.querySelectorAll('.p-btn').forEach(b => {
    b.addEventListener('click', () => {
        document.querySelectorAll('.p-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active'); selP = b.dataset.p;
    });
});

document.querySelectorAll('.f-btn').forEach(b => {
    b.addEventListener('click', () => {
        document.querySelectorAll('.f-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active'); filter = b.dataset.f; render();
    });
});

function save() { localStorage.setItem('nx2_tasks', JSON.stringify(tasks)); }

// ============================================================
//  INIT
// ============================================================
render();
checkReminders();
setInterval(checkReminders, 60000);