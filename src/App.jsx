import React, { useMemo, useState } from "react";

const groups = {
  A: ["México", "África do Sul", "República da Coreia", "República Tcheca"],
  B: ["Canadá", "Bósnia e Herzegovina", "Catar", "Suíça"],
  C: ["Brasil", "Marrocos", "Haiti", "Escócia"],
  D: ["Estados Unidos", "Paraguai", "Austrália", "Turquia"],
  E: ["Alemanha", "Curaçau", "Costa do Marfim", "Equador"],
  F: ["Holanda", "Japão", "Suécia", "Tunísia"],
  G: ["Bélgica", "Egito", "Irã", "Nova Zelândia"],
  H: ["Espanha", "Cabo Verde", "Arábia Saudita", "Uruguai"],
  I: ["França", "Senegal", "Iraque", "Noruega"],
  J: ["Áustria", "Jordânia", "Argentina", "Argélia"],
  K: ["Portugal", "República Democrática do Congo", "Uzbequistão", "Colômbia"],
  L: ["Inglaterra", "Croácia", "Gana", "Panamá"]
};

const flags = {
  "México": "🇲🇽", "África do Sul": "🇿🇦", "República da Coreia": "🇰🇷", "República Tcheca": "🇨🇿",
  "Canadá": "🇨🇦", "Bósnia e Herzegovina": "🇧🇦", "Catar": "🇶🇦", "Suíça": "🇨🇭",
  "Brasil": "🇧🇷", "Marrocos": "🇲🇦", "Haiti": "🇭🇹", "Escócia": "🏴",
  "Estados Unidos": "🇺🇸", "Paraguai": "🇵🇾", "Austrália": "🇦🇺", "Turquia": "🇹🇷",
  "Alemanha": "🇩🇪", "Curaçau": "🇨🇼", "Costa do Marfim": "🇨🇮", "Equador": "🇪🇨",
  "Holanda": "🇳🇱", "Japão": "🇯🇵", "Suécia": "🇸🇪", "Tunísia": "🇹🇳",
  "Bélgica": "🇧🇪", "Egito": "🇪🇬", "Irã": "🇮🇷", "Nova Zelândia": "🇳🇿",
  "Espanha": "🇪🇸", "Cabo Verde": "🇨🇻", "Arábia Saudita": "🇸🇦", "Uruguai": "🇺🇾",
  "França": "🇫🇷", "Senegal": "🇸🇳", "Iraque": "🇮🇶", "Noruega": "🇳🇴",
  "Áustria": "🇦🇹", "Jordânia": "🇯🇴", "Argentina": "🇦🇷", "Argélia": "🇩🇿",
  "Portugal": "🇵🇹", "República Democrática do Congo": "🇨🇩", "Uzbequistão": "🇺🇿", "Colômbia": "🇨🇴",
  "Inglaterra": "🏴", "Croácia": "🇭🇷", "Gana": "🇬🇭", "Panamá": "🇵🇦"
};

const groupLetters = Object.keys(groups);
const allTeams = Object.values(groups).flat();
const defaultOrders = Object.fromEntries(Object.entries(groups).map(([g, teams]) => [g, [...teams]]));
const defaultThirdGroups = ["A", "B", "C", "D", "E", "F", "G", "H"];

const knockoutMatches = [
  { id: 73, stage: "32-avos", a: "2A", b: "2B", city: "Los Angeles", date: "2026-06-28", next: 90 },
  { id: 74, stage: "32-avos", a: "1E", b: "3A/B/C/D/F", city: "Boston", date: "2026-06-29", next: 89 },
  { id: 75, stage: "32-avos", a: "1F", b: "2C", city: "Monterrey", date: "2026-06-29", next: 90 },
  { id: 76, stage: "32-avos", a: "1C", b: "2F", city: "Houston", date: "2026-06-29", next: 91 },
  { id: 77, stage: "32-avos", a: "1I", b: "3C/D/F/G/H", city: "Nova York/Nova Jersey", date: "2026-06-30", next: 89 },
  { id: 78, stage: "32-avos", a: "2E", b: "2I", city: "Dallas", date: "2026-06-30", next: 91 },
  { id: 79, stage: "32-avos", a: "1A", b: "3C/E/F/H/I", city: "Cidade do México", date: "2026-06-30", next: 92 },
  { id: 80, stage: "32-avos", a: "1L", b: "3E/H/I/J/K", city: "Atlanta", date: "2026-07-01", next: 92 },
  { id: 81, stage: "32-avos", a: "1D", b: "3B/E/F/I/J", city: "Santa Clara", date: "2026-07-01", next: 94 },
  { id: 82, stage: "32-avos", a: "1G", b: "3A/E/H/I/J", city: "Seattle", date: "2026-07-01", next: 94 },
  { id: 83, stage: "32-avos", a: "2K", b: "2L", city: "Toronto", date: "2026-07-02", next: 93 },
  { id: 84, stage: "32-avos", a: "1H", b: "2J", city: "Los Angeles", date: "2026-07-02", next: 93 },
  { id: 85, stage: "32-avos", a: "1B", b: "3E/F/G/I/J", city: "Vancouver", date: "2026-07-02", next: 96 },
  { id: 86, stage: "32-avos", a: "1J", b: "2H", city: "Miami", date: "2026-07-03", next: 95 },
  { id: 87, stage: "32-avos", a: "1K", b: "3D/E/I/J/L", city: "Kansas City", date: "2026-07-03", next: 96 },
  { id: 88, stage: "32-avos", a: "2D", b: "2G", city: "Dallas", date: "2026-07-03", next: 95 },
  { id: 89, stage: "Oitavas", city: "Filadélfia", date: "2026-07-04", sources: [74, 77], next: 97 },
  { id: 90, stage: "Oitavas", city: "Houston", date: "2026-07-04", sources: [73, 75], next: 97 },
  { id: 91, stage: "Oitavas", city: "Nova York/Nova Jersey", date: "2026-07-05", sources: [76, 78], next: 99 },
  { id: 92, stage: "Oitavas", city: "Cidade do México", date: "2026-07-05", sources: [79, 80], next: 99 },
  { id: 93, stage: "Oitavas", city: "Dallas", date: "2026-07-06", sources: [83, 84], next: 98 },
  { id: 94, stage: "Oitavas", city: "Seattle", date: "2026-07-06", sources: [81, 82], next: 98 },
  { id: 95, stage: "Oitavas", city: "Atlanta", date: "2026-07-07", sources: [86, 88], next: 100 },
  { id: 96, stage: "Oitavas", city: "Vancouver", date: "2026-07-07", sources: [85, 87], next: 100 },
  { id: 97, stage: "Quartas", city: "Boston", date: "2026-07-09", sources: [89, 90], next: 101 },
  { id: 98, stage: "Quartas", city: "Los Angeles", date: "2026-07-10", sources: [93, 94], next: 101 },
  { id: 99, stage: "Quartas", city: "Miami", date: "2026-07-12", sources: [91, 92], next: 102 },
  { id: 100, stage: "Quartas", city: "Kansas City", date: "2026-07-12", sources: [95, 96], next: 102 },
  { id: 101, stage: "Semifinal", city: "Dallas", date: "2026-07-14", sources: [97, 98], next: 104 },
  { id: 102, stage: "Semifinal", city: "Atlanta", date: "2026-07-15", sources: [99, 100], next: 104 },
  { id: 103, stage: "Terceiro lugar", city: "Miami", date: "2026-07-18", sources: ["L101", "L102"] },
  { id: 104, stage: "Final", city: "Nova York/Nova Jersey", date: "2026-07-19", sources: [101, 102] }
];

const thirdSlots = ["1A", "1B", "1D", "1E", "1G", "1I", "1K", "1L"];
const fallbackMatrix = {
  ABCDEFGH: ["3H", "3G", "3B", "3C", "3A", "3F", "3D", "3E"],
  CDEFGHIJ: ["3C", "3G", "3J", "3D", "3H", "3F", "3E", "3I"],
  DEFGHIJK: ["3E", "3G", "3J", "3D", "3H", "3F", "3I", "3K"],
  EFGHIJKL: ["3E", "3J", "3I", "3F", "3H", "3G", "3L", "3K"]
};

function f(team) { return flags[team] ? `${flags[team]} ${team}` : team; }
function formatDate(date) { return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`)); }
function seedTeam(seed, orders, thirdGroups) {
  if (!seed) return "A definir";
  const direct = seed.match(/^([12])([A-L])$/);
  if (direct) return orders[direct[2]][Number(direct[1]) - 1];
  if (seed.startsWith("3")) return "Matriz FIFA";
  return seed;
}
function thirdAllocation(orders, thirdGroups) {
  const key = [...thirdGroups].sort().join("");
  const row = fallbackMatrix[key];
  const allocation = {};
  if (!row || thirdGroups.length !== 8) return allocation;
  thirdSlots.forEach((slot, index) => {
    const g = row[index].replace("3", "");
    const thirdTeam = orders[g][2];
    const match = knockoutMatches.find((m) => m.a === slot && m.b?.startsWith("3"));
    if (match) allocation[match.id] = `${thirdTeam} (3º ${g})`;
  });
  return allocation;
}
function entrants(match, orders, thirds, winners) {
  if (match.a || match.b) {
    const allocation = thirdAllocation(orders, thirds);
    const a = seedTeam(match.a, orders, thirds);
    const b = match.b?.startsWith("3") ? allocation[match.id] || "Matriz FIFA indisponível" : seedTeam(match.b, orders, thirds);
    return [a, b];
  }
  return match.sources.map((source) => {
    if (typeof source === "string" && source.startsWith("L")) {
      const origin = Number(source.slice(1));
      const originMatch = knockoutMatches.find((m) => m.id === origin);
      const e = entrants(originMatch, orders, thirds, winners);
      return winners[origin] ? e.find((x) => x !== winners[origin]) || `Perdedor Jogo ${origin}` : `Perdedor Jogo ${origin}`;
    }
    return winners[source] || `Vencedor Jogo ${source}`;
  });
}
function Card({ children, className = "" }) { return <div className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>; }
function Button({ children, active, ...props }) { return <button {...props} className={`rounded-2xl px-4 py-2 text-sm font-medium ${active ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>{children}</button>; }

export default function WorldCup2026Simulator() {
  const [orders, setOrders] = useState(defaultOrders);
  const [activeGroup, setActiveGroup] = useState("C");
  const [thirdGroups, setThirdGroups] = useState(defaultThirdGroups);
  const [winners, setWinners] = useState({});
  const [selectedTeam, setSelectedTeam] = useState("Brasil");

  const qualified = useMemo(() => ({
    firsts: groupLetters.map((g) => ({ group: g, team: orders[g][0] })),
    seconds: groupLetters.map((g) => ({ group: g, team: orders[g][1] })),
    thirds: thirdGroups.map((g) => ({ group: g, team: orders[g][2] }))
  }), [orders, thirdGroups]);

  function moveTeam(index, direction) {
    const target = index + direction;
    if (target < 0 || target > 3) return;
    setOrders((current) => {
      const next = [...current[activeGroup]];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...current, [activeGroup]: next };
    });
    setWinners({});
  }
  function toggleThird(group) {
    setThirdGroups((current) => {
      if (current.includes(group)) return current.filter((g) => g !== group);
      if (current.length >= 8) return current;
      return [...current, group].sort();
    });
    setWinners({});
  }
  function setWinner(id, winner) {
    setWinners((current) => ({ ...current, [id]: winner }));
  }

  const teamGroup = groupLetters.find((g) => orders[g].includes(selectedTeam));
  const position = orders[teamGroup].indexOf(selectedTeam) + 1;

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-emerald-700">🏆 Copa do Mundo FIFA 26</div>
          <h1 className="mt-2 text-3xl font-bold">Simulador de grupos e mata-mata</h1>
          <p className="mt-2 text-slate-600">Protótipo React/Vite publicado via GitHub Pages.</p>
        </header>

        <section className="grid gap-6 xl:grid-cols-5">
          <Card className="xl:col-span-3 p-5">
            <div className="font-semibold">🎮 Ranking manual da primeira fase</div>
            <div className="mt-4 flex flex-wrap gap-2">{groupLetters.map((g) => <Button key={g} active={activeGroup === g} onClick={() => setActiveGroup(g)}>Grupo {g}</Button>)}</div>
            <div className="mt-5 space-y-3">
              {orders[activeGroup].map((team, index) => <div key={team} className={`rounded-2xl border p-4 ${index < 2 ? "border-emerald-200 bg-emerald-50" : index === 2 ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div><div className="text-xs uppercase text-slate-500">{index + 1}º lugar · Grupo {activeGroup}</div><div className="font-semibold">{f(team)}</div></div>
                  <div className="flex gap-2"><Button onClick={() => moveTeam(index, -1)}>↑</Button><Button onClick={() => moveTeam(index, 1)}>↓</Button></div>
                </div>
              </div>)}
            </div>
          </Card>

          <Card className="xl:col-span-2 p-5">
            <div className="font-semibold">📊 Classificação — Grupo {activeGroup}</div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200"><table className="w-full text-sm"><tbody>{orders[activeGroup].map((team, i) => <tr key={team} className={i < 2 ? "bg-emerald-50" : i === 2 ? "bg-amber-50" : "bg-white"}><td className="border-t px-3 py-2">{i + 1}</td><td className="border-t px-3 py-2 font-medium">{f(team)}</td></tr>)}</tbody></table></div>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <Card className="p-5">
            <div className="font-semibold">🥉 Terceiros classificados</div>
            <p className="mt-1 text-sm text-slate-600">Selecione 8 grupos. O app usa a chave da matriz FIFA quando houver fallback local disponível.</p>
            <div className="mt-3 rounded-2xl bg-slate-100 p-3 text-xs text-slate-600">Chave: {[...thirdGroups].sort().join("")} · {thirdGroups.length}/8</div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{groupLetters.map((g) => {
              const selected = thirdGroups.includes(g); const disabled = !selected && thirdGroups.length >= 8;
              return <button key={g} disabled={disabled} onClick={() => toggleThird(g)} className={`rounded-2xl border p-3 text-left text-sm disabled:bg-slate-100 ${selected ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100" : "border-slate-200 bg-white"}`}><div className="text-xs uppercase text-slate-500">3º Grupo {g}</div><div className="font-semibold">{f(orders[g][2])}</div>{selected && <div className="text-xs text-emerald-700">Classificado ✓</div>}</button>;
            })}</div>
          </Card>

          <Card className="xl:col-span-2 p-5">
            <div className="font-semibold">🌎 Caminho da seleção</div>
            <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="mt-4 w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm">{allTeams.map((t) => <option key={t} value={t}>{f(t)}</option>)}</select>
            <div className={`mt-4 rounded-2xl p-4 text-sm ${position === 4 ? "bg-rose-50 text-rose-800" : position === 3 ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-800"}`}>{f(selectedTeam)} em {position}º do Grupo {teamGroup}</div>
          </Card>
        </section>

        <Card className="p-5">
          <div className="font-semibold">🏁 Simular vencedores do mata-mata</div>
          <div className="mt-5 space-y-6">{["32-avos", "Oitavas", "Quartas", "Semifinal", "Terceiro lugar", "Final"].map((stage) => {
            const stageMatches = knockoutMatches.filter((m) => m.stage === stage);
            return <div key={stage} className="rounded-3xl border border-slate-200 bg-slate-50 p-4"><div className="border-b border-slate-200 pb-3"><div className="text-lg font-bold">{stage}</div><div className="text-sm text-slate-500">{stageMatches.length} jogo(s)</div></div><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{stageMatches.map((m) => {
              const e = entrants(m, orders, thirdGroups, winners); const ready = e.every((x) => x && !x.startsWith("Vencedor") && !x.startsWith("Perdedor") && x !== "Matriz FIFA indisponível");
              return <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex justify-between text-xs"><span className="font-semibold uppercase text-emerald-700">{m.stage}</span><span>Jogo {m.id}</span></div><div className="mt-2 text-xs text-slate-500">Slot oficial: {m.a ? `${m.a} x ${m.b}` : (m.sources || []).map((s) => typeof s === "string" ? s : `Vencedor ${s}`).join(" x ")}</div><div className="mt-1 font-semibold">{e.map((x) => x.includes("(3º") ? `${f(x.split(" (3º")[0])} ${x.match(/\(3º [A-L]\)/)?.[0] || ""}` : f(x)).join(" x ")}</div><div className="mt-2 text-sm text-slate-600">📅 {formatDate(m.date)} · 📍 {m.city}</div><div className="mt-3 grid gap-2 sm:grid-cols-2">{e.map((x) => <button key={x} disabled={!ready || x.startsWith("Vencedor") || x.startsWith("Perdedor") || x === "Matriz FIFA indisponível"} onClick={() => setWinner(m.id, x)} className={`rounded-2xl border px-3 py-3 text-left text-sm font-medium disabled:bg-slate-100 ${winners[m.id] === x ? "border-emerald-500 bg-emerald-100 ring-2 ring-emerald-200" : "border-slate-200 bg-white hover:bg-emerald-50"}`}>{x.includes("(3º") ? `${f(x.split(" (3º")[0])} ${x.match(/\(3º [A-L]\)/)?.[0] || ""}` : f(x)} {winners[m.id] === x ? "✓" : ""}</button>)}</div></div>;
            })}</div></div>;
          })}</div>
        </Card>

        <section className="grid gap-6 xl:grid-cols-3">
          <Card className="p-5"><div className="font-semibold">✅ Classificados simulados</div><div className="mt-4 space-y-3 text-sm"><div><b>1º:</b> {qualified.firsts.map((x) => `${f(x.team)} (${x.group})`).join(", ")}</div><div><b>2º:</b> {qualified.seconds.map((x) => `${f(x.team)} (${x.group})`).join(", ")}</div><div><b>Terceiros:</b> {qualified.thirds.map((x) => `${f(x.team)} (${x.group})`).join(", ")}</div></div></Card>
          <Card className="xl:col-span-2 p-5"><div className="font-semibold">🧪 Status</div><ul className="mt-3 list-disc pl-5 text-sm text-slate-600"><li>Build Vite/React pronto para GitHub Pages.</li><li>A matriz FIFA completa ainda deve ser embutida localmente antes de uso definitivo.</li><li>Fallback local atual cobre algumas combinações comuns.</li></ul></Card>
        </section>
      </div>
    </div>
  );
}
