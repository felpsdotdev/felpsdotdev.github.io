// Navegação ativa
const sections = document.querySelectorAll('main section');
const navLinks = document.querySelectorAll('nav ul li a');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, {
    rootMargin: '-30% 0px -50% 0px',
    threshold: 0
});

sections.forEach(section => observer.observe(section));

// Animação de digitação
const typingEl = document.getElementById('typing-text');
const spanHTML = 'Oi, eu sou <span style="color:#2563eb!important;font-size:3.6rem!important;display:inline-block!important;font-weight:800!important">Felps</span><br>desenvolvedor de software<br>fullstack';
let typingInProgress = false;

// Injetar estilo da barra do cursor
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .cursor-bar { display:inline-block; color:#fff; font-weight:400; margin-left:2px; }
    .cursor-bar.blink { animation:barBlink .7s step-end infinite; }
    @keyframes barBlink{0%,100%{opacity:1}50%{opacity:0}}
`;
document.head.appendChild(styleSheet);

// Analisar HTML
function parseSegments(html) {
    const segs = [];
    const re = /<[^>]+>/g;
    let last = 0;
    let m;
    while ((m = re.exec(html)) !== null) {
        if (m.index > last) segs.push({ type: 'text', value: html.slice(last, m.index) });
        segs.push({ type: 'tag', value: m[0] });
        last = re.lastIndex;
    }
    if (last < html.length) segs.push({ type: 'text', value: html.slice(last) });
    return segs;
}

const segments = parseSegments(spanHTML);

function buildFullDOM() {
    const div = document.createElement('div');
    for (const seg of segments) {
        if (seg.type === 'tag') {
            div.insertAdjacentHTML('beforeend', seg.value);
        } else {
            div.appendChild(document.createTextNode(seg.value));
        }
    }
    return div;
}

function buildOps() {
    const ops = [];

    for (const seg of segments) {
        if (seg.type === 'tag') {
            ops.push({
                fn: () => { typingEl.insertAdjacentHTML('beforeend', seg.value); },
                delay: 0
            });
        } else {
            for (const ch of seg.value) {
                ops.push({
                    fn: () => { typingEl.appendChild(document.createTextNode(ch)); },
                    delay: 30 + Math.random() * 20
                });
            }
        }
    }

    return ops;
}

function typeText() {
    if (typingInProgress) return;
    typingInProgress = true;

    typingEl.innerHTML = '';

    // Criar barra do cursor persistente
    const bar = document.createElement('span');
    bar.className = 'cursor-bar blink';
    bar.textContent = '|';
    typingEl.appendChild(bar);

    const ops = buildOps();
    let idx = 0;

    function next() {
        if (idx >= ops.length) {
            bar.className = 'cursor-bar';
            setTimeout(() => { bar.style.display = 'none'; }, 500);
            typingInProgress = false;
            return;
        }

        const op = ops[idx];
        typingEl.insertBefore(
            op.fn() || typingEl.lastChild,
            bar
        );

        idx++;
        setTimeout(next, op.delay);
    }

    next();
}

window.addEventListener('load', () => setTimeout(typeText, 300));
window.addEventListener('hashchange', () => {
    if (window.location.hash === '#inicio') setTimeout(typeText, 400);
});