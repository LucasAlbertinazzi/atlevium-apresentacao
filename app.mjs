import { calculateStandings, emptyStandings, clampSlide } from './model.mjs';

const $ = selector => document.querySelector(selector);
const theme = $('#theme');
theme.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  theme.setAttribute('aria-pressed', String(dark));
  theme.textContent = dark ? 'Tema claro' : 'Tema escuro';
});

function renderStandings(rows) {
  const body = $('#standings');
  body.replaceChildren(...rows.map(row => {
    const tr = document.createElement('tr');
    [row.name, row.points, row.played, row.wins, row.difference].forEach((value, index) => {
      const cell = document.createElement(index ? 'td' : 'th');
      if (!index) cell.scope = 'row';
      cell.textContent = String(value);
      tr.append(cell);
    });
    return tr;
  }));
}

$('#score-form').addEventListener('submit', event => {
  event.preventDefault();
  const home = $('#home-score').value;
  const away = $('#away-score').value;
  try {
    if (home.trim() === '' || away.trim() === '') throw new RangeError('Preencha os dois placares.');
    const rows = calculateStandings(Number(home), Number(away));
    renderStandings(rows);
    $('#demo-state').textContent = 'Resultado confirmado';
    $('#feedback').textContent = `Exemplo atualizado: Aurora ${Number(home)} × ${Number(away)} Horizonte. ${Number(home) === Number(away) ? 'Equipes empatadas nos critérios do exemplo.' : `${rows[0].name} lidera a classificação.`} Corrigir o placar substitui o resultado anterior.`;
  } catch (error) {
    $('#feedback').textContent = error.message;
  }
});

$('#reset').addEventListener('click', () => {
  $('#score-form').reset();
  renderStandings(emptyStandings());
  $('#demo-state').textContent = 'Antes da partida';
  $('#feedback').textContent = 'Exemplo reiniciado. Partida pendente; nenhum resultado confirmado.';
});

const slides = [...document.querySelectorAll('.slide')];
const controls = $('#presentation-controls');
const present = $('#present');
let presenting = false;
let current = 0;

function updateControls() {
  $('#slide-count').textContent = `${current + 1} / ${slides.length}`;
  $('#previous').disabled = current === 0;
  $('#next').disabled = current === slides.length - 1;
}

function goToSlide(index) {
  current = clampSlide(index, slides.length);
  updateControls();
  slides[current].scrollIntoView({ block: 'start' });
}

function setPresentation(enabled) {
  presenting = enabled;
  document.body.classList.toggle('presenting', enabled);
  controls.hidden = !enabled;
  present.setAttribute('aria-pressed', String(enabled));
  present.textContent = enabled ? 'Sair da apresentação' : 'Modo apresentação';
  if (enabled) {
    current = slides.reduce((best, slide, index) => Math.abs(slide.getBoundingClientRect().top) < Math.abs(slides[best].getBoundingClientRect().top) ? index : best, 0);
    goToSlide(current);
    $('#next').focus({ preventScroll: true });
  } else {
    present.focus({ preventScroll: true });
  }
}

present.addEventListener('click', () => setPresentation(!presenting));
$('#exit').addEventListener('click', () => setPresentation(false));
$('#previous').addEventListener('click', () => goToSlide(current - 1));
$('#next').addEventListener('click', () => goToSlide(current + 1));
document.addEventListener('keydown', event => {
  if (!presenting) return;
  if (event.key === 'Escape') { setPresentation(false); return; }
  if (event.target.closest('input, textarea, select, summary, [contenteditable="true"]')) return;
  if (['ArrowRight', 'PageDown', 'ArrowLeft', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    goToSlide(current + (['ArrowRight', 'PageDown'].includes(event.key) ? 1 : -1));
  }
});

// A navegação manual também mantém o contador da apresentação coerente.
const observer = new IntersectionObserver(entries => {
  if (!presenting) return;
  const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible) {
    current = slides.indexOf(visible.target);
    updateControls();
  }
}, { rootMargin: '-10% 0px -50% 0px', threshold: [0, 0.2, 0.5] });
slides.forEach(slide => observer.observe(slide));
