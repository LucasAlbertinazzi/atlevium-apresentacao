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
