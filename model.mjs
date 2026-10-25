// Modelo exclusivo da apresentação. A regra oficial do produto ficará no backend.
export function calculateStandings(homeScore, awayScore) {
  for (const score of [homeScore, awayScore]) {
    if (!Number.isInteger(score) || score < 0 || score > 99) {
      throw new RangeError('Informe placares inteiros entre 0 e 99.');
    }
  }
  const rows = [
    { name: 'Aurora', points: homeScore > awayScore ? 3 : homeScore === awayScore ? 1 : 0, played: 1, wins: Number(homeScore > awayScore), difference: homeScore - awayScore, goals: homeScore },
    { name: 'Horizonte', points: awayScore > homeScore ? 3 : homeScore === awayScore ? 1 : 0, played: 1, wins: Number(awayScore > homeScore), difference: awayScore - homeScore, goals: awayScore },
  ];
  return rows.sort((a, b) => b.points - a.points || b.wins - a.wins || b.difference - a.difference || b.goals - a.goals || a.name.localeCompare(b.name, 'pt-BR'));
}

export function emptyStandings() {
  return ['Aurora', 'Horizonte'].map(name => ({ name, points: 0, played: 0, wins: 0, difference: 0, goals: 0 }));
}

export function clampSlide(index, count) {
  return Math.max(0, Math.min(count - 1, index));
}

// Catálogo editorial do produto planejado; não é uma lista de integrações prontas.
export const ecosystem = [
  { id: 'gestao', label: 'Gestão', title: 'Uma base organizada para todo o ecossistema.', description: 'Instituições, pessoas e decisões conectadas, com cada organização no controle da sua operação.', modules: [
    ['Pessoas e identidade esportiva', 'Atletas, responsáveis, técnicos, árbitros, histórico e carteirinha digital.'],
    ['Entidades e vínculos', 'Clubes, ligas, federações, unidades e equipes com responsabilidades definidas.'],
    ['Documentos e aprovações', 'Pendências, validade, conferência e trilha de decisões em um fluxo rastreável.'],
    ['Permissões e inteligência de gestão', 'Acesso por função, auditoria, indicadores, relatórios e exportações.'],
  ], improvement: 'Proposta de melhoria: uma fila de trabalho por responsável, com pendência, motivo e próximo passo claros.', route: 'inscricoes', action: 'Experimentar uma aprovação' },
  { id: 'competicoes', label: 'Competições', title: 'Competições que respeitam cada modalidade.', description: 'Do torneio local aos jogos multiesportivos. Regras específicas, da inscrição à premiação.', modules: [
    ['Modalidades, categorias e paradesporto', 'Coletivos, individuais e equipes; placares, sets, tempos, marcas e classes próprias.'],
    ['Tabelas, fases e sorteios', 'Grupos, pontos corridos, eliminatórias, ida e volta, restrições e avanço entre fases.'],
    ['Súmulas, arbitragem e disciplina', 'Escala de árbitros, cronômetro, eventos de jogo, ocorrências, julgamentos e suspensões.'],
    ['Resultados e conquistas', 'Classificação, artilharia, rankings, recordes, medalhas, credenciais e regulamentos.'],
  ], improvement: 'Proposta de melhoria: prévia do sorteio e explicação dos desempates antes da publicação, com correções auditadas.', route: 'competicoes', action: 'Explorar competições no app' },
  { id: 'formacao', label: 'Formação', title: 'O desenvolvimento começa antes do campeonato.', description: 'Escolas esportivas e projetos com acompanhamento contínuo de alunos, equipes e responsáveis.', modules: [
    ['Turmas, escolinhas e matrículas', 'Categorias, vagas, fila de espera, horários e rematrículas.'],
    ['Treinos, presença e evolução', 'Planejamento de aulas, chamada, frequência e acompanhamento esportivo.'],
    ['Responsáveis e ocorrências', 'Comunicados direcionados e registros educacionais com acesso restrito.'],
  ], improvement: 'Proposta de melhoria: chamada rápida no celular e acompanhamento de faltas sem perder o contexto da turma.', route: 'chamada', action: 'Fazer uma chamada de exemplo' },
  { id: 'estrutura', label: 'Estrutura', title: 'Espaços e recursos no ritmo do esporte.', description: 'Uma agenda compartilhada para a infraestrutura e os bastidores da operação.', modules: [
    ['Locais e reservas', 'Quadras, campos, ginásios, disponibilidade, manutenção e bloqueios de agenda.'],
    ['Almoxarifado e patrimônio', 'Materiais, uniformes, empréstimos, devoluções e movimentações.'],
    ['Logística e viagens', 'Transporte, passageiros, veículos, hospedagem, alimentação e custos previstos.'],
  ], improvement: 'Proposta de melhoria: identificar choque entre reserva, treino e partida antes de confirmar o horário.', route: 'reservas', action: 'Experimentar uma reserva' },
  { id: 'incentivos', label: 'Incentivos', title: 'Recursos acompanhados da solicitação à prestação de contas.', description: 'Planejamento institucional para organizações públicas e privadas, com processos próprios.', modules: [
    ['Bolsas e projetos de incentivo', 'Editais, candidaturas, documentos, pareceres, acompanhamento e prestação de contas.'],
    ['ICMS Esportivo e conselhos', 'Organização de evidências e dossiês para cenários aplicáveis, com validação especializada.'],
    ['Cobranças e financeiro', 'Inscrições, mensalidades, conciliação e relatórios; pagamentos dependem de provedor homologado.'],
  ], improvement: 'Proposta de melhoria: checklist por etapa, prazo e responsável, com evidência ligada ao processo de origem.', route: 'servicos', action: 'Conhecer os serviços planejados' },
  { id: 'comunidade', label: 'Comunidade', title: 'O esporte continua fora das quatro linhas.', description: 'Um ponto de encontro para quem organiza, pratica e acompanha.', modules: [
    ['Portal e comunicação', 'Calendário, notícias, notificações, inscrições e transmissões incorporadas.'],
    ['Trajetória e movimentação de atletas', 'Histórico, conquistas, registros, transferências e liberações autorizadas.'],
    ['Aplicativo e assistência inteligente', 'Jornadas por perfil e IA assistiva com revisão humana, sem decisões automáticas sensíveis.'],
  ], improvement: 'Proposta de melhoria: agenda pessoal e avisos com ação direta, do comunicado ao serviço que precisa de atenção.', route: 'notificacoes', action: 'Ver a central de avisos' },
];

export const demoSports = [
  { id: 'futsal', name: 'Futsal', type: 'Coletivo · Gols', competition: 'Copa Aurora', category: 'Adulto feminino', event: 'Aurora × Horizonte', time: '24 out · 19h30', place: 'Ginásio Central', score: '2 × 1', detail: 'Pontos, vitórias, saldo e gols. A súmula reúne gols, cartões e ocorrências.', format: 'Grupos + eliminatórias' },
  { id: 'volei', name: 'Vôlei', type: 'Coletivo · Sets', competition: 'Liga das Quadras', category: 'Adulto misto', event: 'Leste × Oeste', time: '25 out · 10h00', place: 'Arena do Parque', score: '3 × 1 sets', detail: 'Parciais ilustrativas: 25–18, 23–25, 25–20, 25–21. Motor por sets planejado; este resultado é fixo.', format: 'Pontos corridos' },
  { id: 'atletismo', name: 'Atletismo', type: 'Individual · Tempo', competition: 'Festival da Pista', category: '100 m · Adulto', event: 'Final dos 100 metros', time: '26 out · 09h00', place: 'Pista Municipal', score: '12,84 s', detail: 'Tempo ilustrativo de Ana. Séries, marcas, vento e critérios técnicos exigirão motor e homologação próprios.', format: 'Séries e final' },
];

export function createAppDemo() {
  return { role: 'atleta', view: 'inicio', sport: 'futsal', registration: 'disponivel', attendance: false, reservation: null, readNotices: false, result: null, teamTab: 'elenco', history: [], privacy: { profile: 'inherit', surname: 'inherit', age: 'inherit', image: 'inherit' } };
}

const demoViews = ['inicio', 'agenda', 'explorar', 'perfil', 'competicoes', 'inscricoes', 'elenco', 'chamada', 'reservas', 'notificacoes', 'servicos', 'privacidade', 'seguranca'];

export const organizationPrivacy = Object.freeze({ profile: false, surname: false, age: false, image: false });

export function effectivePrivacy(preferences) {
  return Object.fromEntries(Object.keys(organizationPrivacy).map(key => [key, preferences[key] === 'inherit' ? organizationPrivacy[key] : preferences[key] === 'show']));
}

export function ageAtCutoff(birthDate, cutoffDate) {
  function parse(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Data inválida.');
    const date = new Date(`${value}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error('Data inválida.');
    return date;
  }
  const birth = parse(birthDate), cutoff = parse(cutoffDate);
  if (birth > cutoff) throw new Error('Nascimento posterior à data de corte.');
  return cutoff.getUTCFullYear() - birth.getUTCFullYear() - Number(cutoff.getUTCMonth() < birth.getUTCMonth() || (cutoff.getUTCMonth() === birth.getUTCMonth() && cutoff.getUTCDate() < birth.getUTCDate()));
}

function recordHistory(state, patch, message) {
  return { ...state, ...patch, history: [...state.history, { sequence: state.history.length + 1, message }] };
}

export function transitionApp(state, action) {
  switch (action.type) {
    case 'reset': return createAppDemo();
    case 'role':
      if (!['atleta', 'tecnico', 'gestor'].includes(action.value)) throw new Error('Perfil inválido.');
      return { ...state, role: action.value, view: 'inicio' };
    case 'view':
      if (!demoViews.includes(action.value)) throw new Error('Tela inválida.');
      if (['chamada', 'elenco'].includes(action.value) && state.role === 'atleta') throw new Error('Troque para Técnico ou Gestor para acessar a turma e o elenco.');
      return { ...state, view: action.value };
    case 'sport':
      if (!demoSports.some(sport => sport.id === action.value)) throw new Error('Modalidade inválida.');
      return { ...state, sport: action.value };
    case 'teamTab':
      if (state.role === 'atleta') throw new Error('Use Técnico ou Gestor para consultar a área da equipe.');
      if (!['visao', 'elenco', 'documentos', 'historico'].includes(action.value)) throw new Error('Aba inválida.');
      return { ...state, teamTab: action.value };
    case 'privacy':
      if (state.role !== 'atleta') throw new Error('Use o perfil Atleta para simular a própria privacidade.');
      if (!Object.hasOwn(organizationPrivacy, action.field) || !['inherit', 'show', 'hide'].includes(action.value)) throw new Error('Preferência inválida.');
      return { ...state, privacy: { ...state.privacy, [action.field]: action.value } };
    case 'register':
      if (state.role !== 'atleta') throw new Error('Use o perfil Atleta para solicitar a inscrição.');
      if (state.registration !== 'disponivel') throw new Error('Já existe uma solicitação neste exemplo.');
      return recordHistory(state, { registration: 'pendente' }, 'Atleta solicitou matrícula na Escola de Futsal.');
    case 'approve':
      if (state.role !== 'gestor') throw new Error('A aprovação é demonstrada no perfil Gestor.');
      if (state.registration !== 'pendente') throw new Error('Não há inscrição pendente para aprovar.');
      return recordHistory(state, { registration: 'aprovada' }, 'Gestor aprovou a matrícula de Ana.');
    case 'attendance':
      if (state.role === 'atleta') throw new Error('A chamada exige Técnico ou Gestor neste exemplo.');
      if (state.registration !== 'aprovada') throw new Error('A inscrição de Ana precisa estar aprovada antes da chamada.');
      return recordHistory(state, { attendance: !state.attendance }, state.attendance ? 'Técnico/gestor desmarcou a presença de Ana.' : 'Técnico/gestor registrou a presença de Ana.');
    case 'reserve':
      if (state.role !== 'atleta') throw new Error('Use o perfil Atleta para reservar neste exemplo.');
      if (!['18h00', '19h00', '20h00'].includes(action.value)) throw new Error('Horário inválido.');
      if (action.value === '19h00') throw new Error('19h00 está ocupado por um treino. Escolha 18h00 ou 20h00.');
      if (state.reservation) throw new Error('Você já tem uma reserva neste exemplo. Cancele para escolher outra.');
      return { ...state, reservation: action.value };
    case 'cancelReservation':
      if (state.role !== 'atleta') throw new Error('Use o perfil Atleta para cancelar a própria reserva.');
      return { ...state, reservation: null };
    case 'readNotices': return { ...state, readNotices: true };
    case 'result':
      calculateStandings(action.home, action.away);
      return { ...state, result: { home: action.home, away: action.away } };
    default: throw new Error('Ação não disponível na prévia.');
  }
}
