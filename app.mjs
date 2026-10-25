import { calculateStandings, emptyStandings, clampSlide, ecosystem, demoSports, createAppDemo, transitionApp, effectivePrivacy, organizationPrivacy, ageAtCutoff } from './model.mjs';

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

function resetScoreExample() {
  $('#score-form').reset();
  renderStandings(emptyStandings());
  $('#demo-state').textContent = 'Antes da partida';
  $('#feedback').textContent = 'Exemplo reiniciado. Partida pendente; nenhum resultado confirmado.';
}

$('#score-form').addEventListener('submit', event => {
  event.preventDefault();
  const home = $('#home-score').value;
  const away = $('#away-score').value;
  try {
    if (home.trim() === '' || away.trim() === '') throw new RangeError('Preencha os dois placares.');
    const rows = calculateStandings(Number(home), Number(away));
    renderStandings(rows);
    appState = transitionApp(appState, { type: 'result', home: Number(home), away: Number(away) });
    renderApp();
    $('#demo-state').textContent = 'Resultado confirmado';
    $('#feedback').textContent = `Exemplo atualizado: Aurora ${Number(home)} × ${Number(away)} Horizonte. ${Number(home) === Number(away) ? 'Equipes empatadas nos critérios do exemplo.' : `${rows[0].name} lidera a classificação.`} Corrigir o placar substitui o resultado anterior.`;
  } catch (error) {
    $('#feedback').textContent = error.message;
  }
});

$('#reset').addEventListener('click', () => {
  resetScoreExample();
  appState = { ...appState, result: null };
  renderApp();
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

// As strings de template abaixo vêm apenas de constantes e estados validados.
// Dados digitados pelo visitante nunca são interpolados como HTML.
let appState = createAppDemo();
const roleNames = { atleta: 'Atleta', tecnico: 'Técnico', gestor: 'Gestor' };
const viewNames = { inicio: 'Seu próximo movimento', agenda: 'Agenda esportiva', explorar: 'Explore seu esporte', perfil: 'Minha identidade', competicoes: 'Competições', inscricoes: 'Inscrições e matrículas', elenco: 'Área da equipe', chamada: 'Chamada da turma', reservas: 'Reserve seu espaço', notificacoes: 'Central de avisos', servicos: 'Serviços do ecossistema', privacidade: 'Minha privacidade', seguranca: 'Segurança da conta' };
const registrationNames = { disponivel: 'Inscrições abertas', pendente: 'Aguardando aprovação', aprovada: 'Matrícula aprovada' };

function viewButton(view, text, detail = '') {
  return `<button type="button" class="app-link-row" data-view="${view}"><span><strong>${text}</strong>${detail ? `<small>${detail}</small>` : ''}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>`;
}

function actionButton(action, text, value = '', secondary = false) {
  return `<button type="button" class="${secondary ? 'app-secondary' : 'app-primary'}" data-demo-action="${action}"${value ? ` data-value="${value}"` : ''}>${text}</button>`;
}

function sportPicker() {
  return `<label class="app-select-label">Modalidade<select id="app-sport">${demoSports.map(sport => `<option value="${sport.id}"${appState.sport === sport.id ? ' selected' : ''}>${sport.name}</option>`).join('')}</select></label>`;
}

function registrationCard() {
  const { registration, role } = appState;
  const action = registration === 'disponivel' && role === 'atleta' ? actionButton('register', 'Solicitar matrícula')
    : registration === 'pendente' && role === 'gestor' ? actionButton('approve', 'Aprovar matrícula de Ana') : '';
  const guidance = registration === 'disponivel' ? 'Ana pode solicitar uma vaga no perfil Atleta.' : registration === 'pendente' ? 'Troque para Gestor para conferir e aprovar a solicitação.' : 'Ana já aparece na chamada. Troque para Técnico para registrar a presença.';
  return `<div class="app-card"><span class="app-tag">${registrationNames[registration]}</span><h4>Escola de Futsal</h4><p>Turma adulta · Terças e quintas · 18h00</p><details class="app-service"><summary>Critério de idade e data de corte</summary><p>18 a 59 anos em 31/12/2026. Considera-se a idade nessa data, não a idade no dia da inscrição. Ana tem ${ageAtCutoff('2000-05-03', '2026-12-31')} anos no corte e atende ao critério deste exemplo.</p><small>Data de corte explícita · Dados fictícios</small></details><div class="app-person"><span class="app-avatar">AN</span><div><strong>Ana Nunes</strong><small>Participante fictícia</small></div></div><p>${guidance}</p>${action}${registration === 'aprovada' ? `<p class="app-inline-state">${appState.attendance ? 'Presença de Ana registrada pelo técnico.' : 'Matrícula confirmada. Presença ainda não registrada.'}</p>` : ''}</div>`;
}

function matchCard() {
  const sport = demoSports.find(item => item.id === appState.sport);
  return `<div class="app-match"><div class="app-match-meta"><span>${sport.name}</span><span>${sport.category}</span></div><h4>${sport.event}</h4><p>${sport.time}<br>${sport.place}</p>${viewButton('competicoes', 'Acompanhar competição', sport.competition)}</div>`;
}

function homeView() {
  const greeting = appState.role === 'atleta' ? 'Olá, Ana.' : appState.role === 'tecnico' ? 'Olá, técnico.' : 'Olá, gestor.';
  const task = appState.role === 'atleta' ? viewButton('inscricoes', 'Minha matrícula', registrationNames[appState.registration])
    : appState.role === 'gestor' ? viewButton('inscricoes', 'Conferir inscrições', appState.registration === 'pendente' ? 'Ana aguarda sua aprovação' : 'Nenhuma solicitação pendente')
      : viewButton('chamada', 'Fazer chamada', appState.registration === 'aprovada' ? 'Ana está na lista da turma' : 'A matrícula de Ana ainda não foi aprovada');
  return `<p class="app-greeting">${greeting}</p><h3 tabindex="-1" id="app-view-title">Seu próximo movimento</h3>${matchCard()}<h4 class="app-subtitle">Sua rotina, sem atalhos difíceis</h4>${appState.role !== 'atleta' ? viewButton('elenco', 'Gerenciar Equipe Aurora', 'Acesso direto: elenco, documentos e histórico') : ''}${task}${viewButton('reservas', 'Quadras e horários', 'Consulte disponibilidade e impedimentos')}${viewButton('perfil', 'Carteirinha e vínculo', 'Sua identificação esportiva')}`;
}

function agendaView() {
  const sport = demoSports.find(item => item.id === appState.sport);
  return `${sportPicker()}<div class="app-date"><span>OUT</span><strong>${appState.sport === 'futsal' ? '24' : appState.sport === 'volei' ? '25' : '26'}</strong><p>Agenda ilustrativa<br>Outubro de 2026</p></div>${matchCard()}<div class="app-agenda-item"><span class="app-timeline-dot"></span><div><strong>Treino · Escola de Futsal</strong><p>27 out · 18h00 · Quadra do Parque</p><small>${registrationNames[appState.registration]}</small></div></div>${appState.reservation ? `<div class="app-agenda-item"><span class="app-timeline-dot"></span><div><strong>Sua reserva</strong><p>28 out · ${appState.reservation} · Quadra do Parque</p></div></div>` : ''}${viewButton('reservas', 'Encontrar um horário', 'Reservas disponíveis na prévia')}`;
}

function competitionsView() {
  const sport = demoSports.find(item => item.id === appState.sport);
  let result = appState.result && sport.id === 'futsal' ? `${appState.result.home} × ${appState.result.away}` : sport.score;
  let standings = '';
  if (sport.id === 'futsal') {
    const rows = appState.result ? calculateStandings(appState.result.home, appState.result.away) : emptyStandings();
    standings = `<h4 class="app-subtitle">Classificação do exemplo</h4><table class="app-table"><caption>${appState.result ? 'Resultado confirmado na apresentação' : 'Aguardando confirmação na seção Resultados'}</caption><thead><tr><th>Equipe</th><th>PTS</th><th>J</th><th>SG</th></tr></thead><tbody>${rows.map(row => `<tr><th scope="row">${row.name}</th><td>${row.points}</td><td>${row.played}</td><td>${row.difference}</td></tr>`).join('')}</tbody></table>`;
    if (!appState.result) result = 'A confirmar';
  }
  return `${sportPicker()}<div class="app-card"><span class="app-tag">${sport.type}</span><h4>${sport.competition}</h4><p>${sport.category} · ${sport.format}</p><div class="app-scoreboard"><strong>${sport.event}</strong><span>${result}</span></div><p>${sport.detail}</p></div>${standings}<p class="app-footnote">Futsal: resultado conectado à seção Resultados desta página. Vôlei e atletismo: exemplos fixos, sem motor esportivo implementado.</p>`;
}

function attendanceView() {
  return `<div class="app-card"><span class="app-tag">Futsal · Turma adulta</span><h4>Chamada de 27 de outubro</h4><p>Marque a presença da participante após a matrícula aprovada.</p></div><div class="app-attendance-row"><span class="app-avatar">AN</span><div><strong>Ana Nunes</strong><small>${appState.registration === 'aprovada' ? appState.attendance ? 'Presente nesta aula' : 'Presença não registrada' : 'Matrícula ainda não aprovada'}</small></div></div>${appState.registration === 'aprovada' ? actionButton('attendance', appState.attendance ? 'Desmarcar presença de Ana' : 'Marcar presença de Ana') : `<p class="app-inline-state">Primeiro solicite a matrícula como Atleta e aprove como Gestor.</p>`}<p class="app-footnote">Exemplo compartilhado entre perfis nesta página. A aplicação real exigirá autorização e auditoria no servidor.</p>`;
}

function rosterView() {
  const tabs = [['visao', 'Visão geral'], ['elenco', 'Elenco'], ['documentos', 'Documentos'], ['historico', 'Histórico']];
  const header = `<div class="app-card"><span class="app-tag">Futsal · Adulto feminino</span><h4>Equipe Aurora</h4><p>Elenco, documentos e decisões no mesmo contexto.</p></div><div class="app-team-tabs" role="group" aria-label="Seções da equipe">${tabs.map(([id, label]) => `<button type="button" data-team-tab="${id}" aria-pressed="${appState.teamTab === id}">${label}</button>`).join('')}</div>`;
  const content = {
    visao: `<h4 class="app-subtitle">Próximas ações</h4><p>${appState.registration === 'pendente' ? 'Ana aguarda aprovação do gestor.' : appState.registration === 'aprovada' ? 'Ana está aprovada. Confira a frequência da turma.' : 'Ana ainda não solicitou matrícula.'}</p>${viewButton('inscricoes', 'Conferir matrícula', registrationNames[appState.registration])}${viewButton('chamada', 'Fazer chamada', 'Acesso direto à turma')}`,
    elenco: `${[['LP', 'Lia Prado', 'Goleira · Vínculo ativo'], ['BC', 'Bia Costa', 'Ala · Vínculo ativo'], ['AN', 'Ana Nunes', registrationNames[appState.registration]]].map(([initials, name, status]) => `<div class="app-attendance-row"><span class="app-avatar">${initials}</span><div><strong>${name}</strong><small>${status}</small></div></div>`).join('')}${viewButton('inscricoes', 'Ver matrícula de Ana', 'Conferência e aprovação')}${viewButton('chamada', 'Abrir chamada da turma', appState.attendance ? 'Presença de Ana registrada' : 'Acompanhar frequência')}`,
    documentos: `<div class="app-empty"><h4>Nenhum documento emitido</h4><p>No produto, esta área reunirá ficha coletiva e credenciais. Esta prévia não emite documentos válidos.</p></div><details class="app-service"><summary>Ver requisitos de documentação</summary><p>Vínculos aprovados, autorização do responsável quando aplicável e acesso restrito. Documentos exigidos serão definidos por finalidade e regulamento.</p></details>`,
    historico: appState.history.length ? `<ol class="app-history">${appState.history.map(item => `<li><strong>Etapa ${item.sequence}</strong><p>${item.message}</p></li>`).join('')}</ol>` : `<div class="app-empty"><h4>A jornada ainda não começou</h4><p>Solicite a matrícula como Atleta, aprove como Gestor e registre presença como Técnico. As etapas aparecerão aqui.</p></div>`,
  };
  return header + content[appState.teamTab] + '<p class="app-footnote">Exemplo local. Histórico não equivale a uma auditoria do servidor.</p>';
}

function reservationsView() {
  return `<div class="app-card"><span class="app-tag">28 de outubro · Reservas abertas</span><h4>Quadra do Parque</h4><p>19h00 indisponível: treino programado. ${appState.reservation ? `Sua reserva: ${appState.reservation}.` : '18h00 e 20h00 disponíveis.'}</p></div><h4 class="app-subtitle">Disponibilidade antes de confirmar</h4><div class="app-slots">${['18h00', '19h00', '20h00'].map(time => `<button type="button" data-demo-action="reserve" data-value="${time}"${time === '19h00' || appState.role !== 'atleta' || appState.reservation ? ' disabled' : ''} aria-pressed="${appState.reservation === time}"><strong>${time}</strong><small>${time === '19h00' ? 'Indisponível · treino' : appState.reservation === time ? 'Sua reserva' : appState.reservation ? 'Cancele para trocar' : 'Disponível'}</small></button>`).join('')}</div>${appState.reservation ? `<p class="app-inline-state">Reserva confirmada: 28 out, ${appState.reservation}. Confira também na Agenda.</p>${appState.role === 'atleta' ? actionButton('cancelReservation', 'Cancelar minha reserva', '', true) : ''}` : `<p class="app-footnote">${appState.role === 'atleta' ? 'Escolha diretamente um horário disponível.' : 'Consulta de ocupação. Para reservar no exemplo, use Atleta.'}</p>`}<div class="app-card app-closed-resource"><span class="app-tag">Reservas encerradas</span><h4>Campo da Colina</h4><p>Período encerrado em 23/10. Próxima abertura do exemplo: 30/10 às 09h00. A restrição aparece antes de qualquer solicitação.</p></div><p class="app-footnote">Datas e espaços fictícios. Nenhum local real está sendo reservado.</p>`;
}

function profileView() {
  const isAthlete = appState.role === 'atleta';
  return `<div class="app-identity"><span class="app-avatar large">${isAthlete ? 'AN' : appState.role === 'tecnico' ? 'TC' : 'GT'}</span><span>IDENTIDADE ESPORTIVA · EXEMPLO</span><h4>${isAthlete ? 'Ana Nunes' : roleNames[appState.role]}</h4><p>Instituto Aurora<br>${roleNames[appState.role]} · Futsal</p><div class="app-card-id">AT-DEMO-001</div><small>Identificador ilustrativo · Sem validade documental</small></div><h4 class="app-subtitle">Seu vínculo</h4><p class="app-inline-state">${isAthlete ? registrationNames[appState.registration] : 'Perfil de demonstração selecionado'}</p>${isAthlete ? viewButton('privacidade', 'Minha privacidade', 'Veja o efeito real de cada preferência no exemplo') : ''}${viewButton('seguranca', 'Segurança da conta', 'Proteções previstas para o produto')}${viewButton('notificacoes', 'Avisos da organização', appState.readNotices ? 'Avisos lidos nesta prévia' : 'Confira seus próximos passos')}<p class="app-footnote">Desenvolvido pela Nevuma Tech</p>`;
}

function privacyView() {
  const effective = effectivePrivacy(appState.privacy);
  const fields = [['profile', 'Perfil público'], ['surname', 'Sobrenome'], ['age', 'Idade'], ['image', 'Imagem de perfil']];
  return `<p class="app-footnote">Ajustes apenas nesta prévia, sem conta real. A preferência herdada mostra seu efeito final.</p>${fields.map(([key, label]) => `<div class="app-privacy-field"><label for="privacy-${key}">${label}</label><select id="privacy-${key}" data-privacy-field="${key}"${appState.role !== 'atleta' ? ' disabled' : ''}>${[['inherit', 'Herdar da organização'], ['show', 'Mostrar'], ['hide', 'Ocultar']].map(([value, text]) => `<option value="${value}"${appState.privacy[key] === value ? ' selected' : ''}>${text}</option>`).join('')}</select><small>${appState.privacy[key] === 'inherit' ? `Herdado da organização: ${organizationPrivacy[key] ? 'visível' : 'oculto'}` : `Escolha pessoal: ${effective[key] ? 'visível' : 'oculto'}`}</small></div>`).join('')}<div class="app-public-preview"><h4>O que o público veria</h4>${effective.profile ? `<p>${effective.image ? 'Imagem: avatar ilustrativo AN.' : 'Imagem oculta.'}</p><strong>${effective.surname ? 'Ana Nunes' : 'Ana N.'}</strong><p>${effective.age ? '26 anos · Dado fictício' : 'Idade oculta.'}</p>` : '<p>Perfil não publicado. Mesmo campos marcados como visíveis ficam fora do portal enquanto o perfil estiver oculto.</p>'}</div><p class="app-footnote">No produto, menores, finalidade e políticas da organização terão validações adicionais no servidor.</p>`;
}

function securityView() {
  return `<span class="app-tag">Requisito do produto · Planejado</span><p>Esta prévia não tem autenticação. Nenhuma proteção abaixo pode ser ativada por aqui.</p>${[
    ['Autenticação em duas etapas', 'Segundo fator, recuperação segura e confirmação para ações sensíveis.'],
    ['Sessões e histórico', 'Reconhecer dispositivos, consultar acessos e revogar sessões com confirmação.'],
    ['Acesso por organização', 'O servidor valida vínculo e permissão em cada operação; trocar perfil aqui é só uma simulação.'],
    ['Continuidade em campo', 'Consulta offline planejada. Escrita offline só após validar conflitos, revogação e reconciliação.'],
  ].map(([title, text]) => `<details class="app-service"><summary>${title}</summary><p>${text}</p></details>`).join('')}`;
}

function noticesView() {
  return `<div class="app-notice"><span class="app-tag">Matrícula</span><h4>${registrationNames[appState.registration]}</h4><p>${appState.registration === 'aprovada' ? 'O gestor aprovou a matrícula de Ana. A turma já pode registrar sua presença.' : appState.registration === 'pendente' ? 'Sua solicitação foi enviada na prévia. O perfil Gestor pode aprová-la.' : 'A Escola de Futsal está recebendo matrículas no exemplo.'}</p>${viewButton('inscricoes', 'Ver matrícula')}</div><div class="app-notice"><h4>Próximo encontro</h4><p>Treino de futsal · 27 out, às 18h00. Horário fictício para demonstração.</p>${viewButton('agenda', 'Ver agenda')}</div>${appState.readNotices ? '<p class="app-inline-state">Avisos marcados como lidos.</p>' : actionButton('readNotices', 'Marcar avisos como lidos')}<p class="app-footnote">Não são notificações push. Nenhuma mensagem externa é enviada.</p>`;
}

function servicesView() {
  return `<p class="app-footnote">Módulos planejados; estas opções descrevem o escopo e não enviam solicitações reais.</p>${[
    ['Bolsas e projetos', 'Candidatura, documentação, pareceres e prestação de contas.'],
    ['Financeiro', 'Taxas, mensalidades e conciliação, após integração homologada.'],
    ['Documentos e registros', 'Pendências, prazos, transferências e liberações autorizadas.'],
    ['Logística e materiais', 'Viagens, passageiros, patrimônio e empréstimos.'],
    ['IA assistiva', 'Apoio à redação e conferência com revisão humana.'],
  ].map(([title, description]) => `<details class="app-service"><summary>${title}</summary><p>${description}</p><small>Planejado · Não disponível no produto</small></details>`).join('')}`;
}

function exploreView() {
  return `${sportPicker()}${viewButton('competicoes', 'Jogos e campeonatos', 'Modalidades, resultados e classificações')}${viewButton('inscricoes', 'Turmas e inscrições', 'Matrículas e acompanhamento')}${viewButton('reservas', 'Locais e reservas', 'Escolha um horário sem conflito')}${appState.role !== 'atleta' ? viewButton('elenco', 'Equipe e elenco', 'Vínculos e situação das atletas') + viewButton('chamada', 'Turmas e chamada', 'Frequência e participantes') : ''}${viewButton('servicos', 'Outros serviços', 'Incentivos, financeiro e operação')}${viewButton('notificacoes', 'Notícias e avisos', 'Comunicação da organização')}`;
}

const appRenderers = { inicio: homeView, agenda: agendaView, competicoes: competitionsView, inscricoes: registrationCard, elenco: rosterView, chamada: attendanceView, reservas: reservationsView, perfil: profileView, notificacoes: noticesView, servicos: servicesView, explorar: exploreView, privacidade: privacyView, seguranca: securityView };

function renderApp() {
  const content = $('#app-content');
  const title = appState.view === 'inicio' ? '' : `<div class="app-page-heading"><button class="app-back" type="button" data-view="inicio" aria-label="Voltar ao início"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button><h3 tabindex="-1" id="app-view-title">${viewNames[appState.view]}</h3></div>`;
  content.innerHTML = `${title}${appRenderers[appState.view]()}<p class="app-local-note">PRÉVIA LOCAL · ${roleNames[appState.role].toUpperCase()}</p>`;
  document.querySelectorAll('[data-role]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.role === appState.role)));
  document.querySelectorAll('.app-nav [data-view]').forEach(button => {
    if (button.dataset.view === appState.view) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  $('#notice-dot').hidden = appState.readNotices;
  const stories = {
    atleta: ['Menos caminhos. Mais participação.', 'Solicite uma matrícula, acompanhe a aprovação, encontre uma quadra e confira os jogos no mesmo lugar.', [['inscricoes', 'Solicitar e acompanhar matrícula'], ['reservas', 'Reservar um horário'], ['competicoes', 'Explorar jogos e modalidades']]],
    tecnico: ['Da equipe ao treino, tudo à mão.', 'Confira o elenco, veja quem já foi aprovado e registre a presença de Ana na turma. A jornada continua de onde o gestor parou.', [['elenco', 'Conferir equipe e elenco'], ['chamada', 'Fazer a chamada da turma'], ['competicoes', 'Acompanhar competições']]],
    gestor: ['O que precisa de você, à vista.', 'Encontre a inscrição pendente, confira o contexto e aprove a matrícula. O atleta e o técnico veem a mudança nesta prévia.', [['inscricoes', 'Conferir inscrições'], ['reservas', 'Consultar ocupação da quadra'], ['servicos', 'Conhecer a operação institucional']]],
  };
  const [heading, description, tasks] = stories[appState.role];
  $('#role-story').innerHTML = `<h3>${heading}</h3><p>${description}</p><div class="app-tasks">${tasks.map(([view, label], index) => `<button type="button" data-story-view="${view}"><span>0${index + 1}</span>${label}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12h14m-6-6 6 6-6 6"/></svg></button>`).join('')}</div>`;
  $('#journey-request').classList.toggle('completed', appState.registration !== 'disponivel');
  $('#journey-approval').classList.toggle('completed', appState.registration === 'aprovada');
  $('#journey-attendance').classList.toggle('completed', appState.attendance);
}

function dispatchApp(action, focus = false) {
  try {
    appState = transitionApp(appState, action);
    renderApp();
    if (['role', 'reset'].includes(action.type)) $('#app-content').scrollTop = 0;
    const messages = { register: 'Matrícula solicitada. Troque para Gestor para aprovar.', approve: 'Matrícula aprovada. Troque para Técnico para registrar a presença.', attendance: appState.attendance ? 'Presença de Ana registrada.' : 'Presença de Ana desmarcada.', reserve: 'Reserva confirmada. O horário aparece na Agenda.', cancelReservation: 'Reserva cancelada. O horário está disponível novamente.', readNotices: 'Avisos marcados como lidos.', reset: 'Prévia reiniciada. Todos os registros fictícios foram restaurados.' };
    $('#app-announcement').textContent = messages[action.type] || `${roleNames[appState.role]} · ${viewNames[appState.view]}.`;
    $('#app-phone-feedback').textContent = $('#app-announcement').textContent;
    if (focus) {
      $('#app-content').scrollTop = 0;
      $('#app-view-title')?.focus({ preventScroll: true });
    }
  } catch (error) {
    $('#app-announcement').textContent = error.message;
    $('#app-phone-feedback').textContent = error.message;
  }
}

$('#app-demo').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.teamTab) {
    dispatchApp({ type: 'teamTab', value: button.dataset.teamTab });
    $('#app-content').querySelector(`[data-team-tab="${appState.teamTab}"]`)?.focus({ preventScroll: true });
  }
  if (button.dataset.view) dispatchApp({ type: 'view', value: button.dataset.view }, true);
  if (button.dataset.demoAction) {
    const actionName = button.dataset.demoAction;
    dispatchApp({ type: actionName, value: button.dataset.value });
    ($('#app-content').querySelector(`[data-demo-action="${actionName}"]`) || $('#app-view-title'))?.focus({ preventScroll: true });
  }
});
$('#app-demo').addEventListener('change', event => {
  if (event.target.dataset.privacyField) {
    const field = event.target.dataset.privacyField;
    dispatchApp({ type: 'privacy', field, value: event.target.value });
    $(`#privacy-${field}`)?.focus({ preventScroll: true });
  }
  if (event.target.id === 'app-sport') {
    dispatchApp({ type: 'sport', value: event.target.value });
    $('#app-sport')?.focus({ preventScroll: true });
  }
});
document.querySelector('.role-picker').addEventListener('click', event => {
  const button = event.target.closest('[data-role]');
  if (button) dispatchApp({ type: 'role', value: button.dataset.role });
});
$('#role-story').addEventListener('click', event => {
  const button = event.target.closest('[data-story-view]');
  if (button) dispatchApp({ type: 'view', value: button.dataset.storyView }, true);
});
$('#app-reset').addEventListener('click', () => {
  resetScoreExample();
  dispatchApp({ type: 'reset' });
});

function renderModule(id) {
  const module = ecosystem.find(item => item.id === id);
  document.querySelectorAll('[data-module]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.module === id)));
  $('#module-detail').innerHTML = `<p class="mini-label">${module.label.toUpperCase()} · ESCOPO PLANEJADO</p><h3>${module.title}</h3><p>${module.description}</p><div class="module-rows">${module.modules.map(([title, description]) => `<div><h4>${title}</h4><p>${description}</p></div>`).join('')}</div><p class="module-improvement">${module.improvement}</p><button type="button" class="outline small" id="module-app-action">${module.action}</button>`;
  $('#module-app-action').addEventListener('click', () => {
    const role = module.route === 'chamada' ? 'tecnico' : module.route === 'inscricoes' ? 'gestor' : 'atleta';
    dispatchApp({ type: 'role', value: role });
    dispatchApp({ type: 'view', value: module.route });
    $('#app').scrollIntoView({ block: 'start' });
    $('#app-view-title')?.focus({ preventScroll: true });
  });
}
document.querySelector('.module-rail').addEventListener('click', event => {
  const button = event.target.closest('[data-module]');
  if (button) renderModule(button.dataset.module);
});
renderModule('competicoes');
renderApp();

document.querySelector('.improvement-strip').addEventListener('click', event => {
  const button = event.target.closest('[data-preview-improvement]');
  if (!button) return;
  const routes = { team: ['tecnico', 'elenco'], reservation: ['atleta', 'reservas'], privacy: ['atleta', 'privacidade'] };
  const [role, view] = routes[button.dataset.previewImprovement];
  dispatchApp({ type: 'role', value: role });
  dispatchApp({ type: 'view', value: view });
  $('#app').scrollIntoView({ block: 'start' });
  $('#app-view-title')?.focus({ preventScroll: true });
});
