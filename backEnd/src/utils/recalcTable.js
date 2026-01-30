export function recalcSeason(season) {
 season.players.forEach(p => {
  p.auto = { mp:0, w:0, d:0, l:0, gf:0, ga:0 };
 });

 season.matches.forEach(m => {
  const A = season.players.find(p => p.name === m.a);
  const B = season.players.find(p => p.name === m.b);

  A.auto.mp++;
  B.auto.mp++;

  A.auto.gf += m.ga;
  A.auto.ga += m.gb;
  B.auto.gf += m.gb;
  B.auto.ga += m.ga;

  if(m.ga > m.gb){
   A.auto.w++;
   B.auto.l++;
  } else if(m.ga < m.gb){
   B.auto.w++;
   A.auto.l++;
  } else {
   A.auto.d++;
   B.auto.d++;
  }
 });

 season.players.forEach(p => {
  const mw = p.manual.w || 0;
  const md = p.manual.d || 0;
  const ml = p.manual.l || 0;

  p.w = mw + p.auto.w;
  p.d = md + p.auto.d;
  p.l = ml + p.auto.l;
  p.mp = p.w + p.d + p.l;

  p.gf = mw + p.auto.gf;
  p.ga = ml + p.auto.ga;
  p.pts = p.w * 3 + p.d;
 });
}
