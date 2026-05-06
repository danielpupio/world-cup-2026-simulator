import React, { useEffect, useMemo, useState } from "react";

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

const teamFlags = {
  "México": "🇲🇽",
  "África do Sul": "🇿🇦",
  "República da Coreia": "🇰🇷",
  "República Tcheca": "🇨🇿",
  "Canadá": "🇨🇦",
  "Bósnia e Herzegovina": "🇧🇦",
  "Catar": "🇶🇦",
  "Suíça": "🇨🇭",
  "Brasil": "🇧🇷",
  "Marrocos": "🇲🇦",
  "Haiti": "🇭🇹",
  "Escócia": "🏴",
  "Estados Unidos": "🇺🇸",
  "Paraguai": "🇵🇾",
  "Austrália": "🇦🇺",
  "Turquia": "🇹🇷",
  "Alemanha": "🇩🇪",
  "Curaçau": "🇨🇼",
  "Costa do Marfim": "🇨🇮",
  "Equador": "🇪🇨",
  "Holanda": "🇳🇱",
  "Japão": "🇯🇵",
  "Suécia": "🇸🇪",
  "Tunísia": "🇹🇳",
  "Bélgica": "🇧🇪",
  "Egito": "🇪🇬",
  "Irã": "🇮🇷",
  "Nova Zelândia": "🇳🇿",
  "Espanha": "🇪🇸",
  "Cabo Verde": "🇨🇻",
  "Arábia Saudita": "🇸🇦",
  "Uruguai": "🇺🇾",
  "França": "🇫🇷",
  "Senegal": "🇸🇳",
  "Iraque": "🇮🇶",
  "Noruega": "🇳🇴",
  "Áustria": "🇦🇹",
  "Jordânia": "🇯🇴",
  "Argentina": "🇦🇷",
  "Argélia": "🇩🇿",
  "Portugal": "🇵🇹",
  "República Democrática do Congo": "🇨🇩",
  "Uzbequistão": "🇺🇿",
  "Colômbia": "🇨🇴",
  "Inglaterra": "🏴",
  "Croácia": "🇭🇷",
  "Gana": "🇬🇭",
  "Panamá": "🇵🇦"
};

const countryFlags = {
  EUA: "🇺🇸",
  México: "🇲🇽",
  Canadá: "🇨🇦"
};

const groupLetters = Object.keys(groups);
const allTeams = Object.values(groups).flat();

const knockoutStageOrder = ["32-avos", "Oitavas", "Quartas", "Semifinal", "Terceiro lugar", "Final"];
const fifaThirdPlaceSlots = ["1A", "1B", "1D", "1E", "1G", "1I", "1K", "1L"];

const fallbackFifaThirdPlaceMatrix = {
  EFGHIJKL: ["3E", "3J", "3I", "3F", "3H", "3G", "3L", "3K"],
  DEFGHIJK: ["3E", "3G", "3J", "3D", "3H", "3F", "3I", "3K"],
  CDEFGHIJ: ["3C", "3G", "3J", "3D", "3H", "3F", "3E", "3I"],
  ABCDEFGH: ["3H", "3G", "3B", "3C", "3A", "3F", "3D", "3E"]
};

let activeFifaThirdPlaceMatrix = fallbackFifaThirdPlaceMatrix;

function parseFifaThirdPlaceMatrixFromText(text) {
  const matrix = {};
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

  lines.forEach((line) => {
    const parts = line.split(" ").filter(Boolean);
    if (parts.length !== 17) return;
    if (!Number.isFinite(Number(parts[0]))) return;

    const groupsFromRow = parts.slice(1, 9);
    const allocation = parts.slice(9, 17);
    const groupsAreValid = groupsFromRow.every((group) => groupLetters.includes(group));
    const allocationIsValid = allocation.every((seed) => seed.length === 2 && seed.startsWith("3") && groupLetters.includes(seed[1]));
    if (!groupsAreValid || !allocationIsValid) return;

    matrix[groupsFromRow.join("")] = allocation;
  });

  return matrix;
}

function parseFifaThirdPlaceMatrixFromHtml(html) {
  const matrix = {};
  const doc = new DOMParser().parseFromString(html, "text/html");

  doc.querySelectorAll("tr").forEach((row) => {
    const cells = Array.from(row.querySelectorAll("th,td"))
      .map((cell) => (cell.textContent || "").replaceAll(String.fromCharCode(10), " ").trim())
      .filter(Boolean);

    const numberIndex = cells.findIndex((cell) => Number.isFinite(Number(cell)));
    if (numberIndex < 0) return;

    const parts = cells.slice(numberIndex);
    if (parts.length < 17) return;

    const groupsFromRow = parts.slice(1, 9);
    const allocation = parts.slice(9, 17);
    const groupsAreValid = groupsFromRow.every((group) => groupLetters.includes(group));
    const allocationIsValid = allocation.every((seed) => seed.length === 2 && seed.startsWith("3") && groupLetters.includes(seed[1]));
    if (!groupsAreValid || !allocationIsValid) return;

    matrix[groupsFromRow.join("")] = allocation;
  });

  if (Object.keys(matrix).length > 0) return matrix;

  const text = doc.body?.textContent || "";
  return parseFifaThirdPlaceMatrixFromText(text);
}

async function fetchFifaThirdPlaceMatrix() {
  const url = "https://en.wikipedia.org/w/api.php?action=parse&page=Template:2026_FIFA_World_Cup_third-place_table&prop=text&format=json&origin=*";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Não foi possível carregar a matriz FIFA.");
  const data = await response.json();
  const html = data?.parse?.text?.["*"] || "";
  const matrix = parseFifaThirdPlaceMatrixFromHtml(html);
  if (Object.keys(matrix).length < 400) throw new Error("A matriz FIFA carregada parece incompleta.");
  return matrix;
}

function flagTeam(team) {
  if (!team) return "";
  return teamFlags[team] ? `${teamFlags[team]} ${team}` : team;
}

function flagCountry(country) {
  if (!country) return "";
  return countryFlags[country] ? `${countryFlags[country]} ${country}` : country;
}

function formatTeamLabel(label) {
  if (!label) return "";
  if (label.startsWith("Vencedor Jogo") || label.startsWith("Perdedor Jogo") || label === "Vencedor" || label === "A definir" || label === "Matriz FIFA indisponível") return label;
  const thirdLabel = label.match(/^(.*) \(3º ([A-L])\)$/);
  if (thirdLabel) return `${flagTeam(thirdLabel[1])} (3º ${thirdLabel[2]})`;
  return flagTeam(label);
}

function countryForCity(city) {
  if (city === "Toronto" || city === "Vancouver") return "Canadá";
  if (["Cidade do México", "Guadalajara", "Monterrey"].includes(city)) return "México";
  return "EUA";
}

const cityUtcOffsetHours = {
  "Cidade do México": -6,
  Guadalajara: -6,
  Monterrey: -6,
  Toronto: -4,
  "Nova York/Nova Jersey": -4,
  Boston: -4,
  Filadélfia: -4,
  Atlanta: -4,
  Miami: -4,
  Houston: -5,
  Dallas: -5,
  "Kansas City": -5,
  "Los Angeles": -7,
  "Santa Clara": -7,
  Seattle: -7,
  Vancouver: -7
};

const displayUtcOffsetHours = {
  brasilia: -3,
  paris: 2
};

function computedTime(match, target = "brasilia") {
  if (!match?.localDate || !match?.localTime || match.localTime === "A definir") return "A definir";
  if (target === "local") return match.localTime;

  const sourceOffset = cityUtcOffsetHours[match.city];
  const targetOffset = displayUtcOffsetHours[target];
  if (!Number.isFinite(sourceOffset) || !Number.isFinite(targetOffset)) return "A definir";

  const [year, month, day] = match.localDate.split("-").map(Number);
  const [hour, minute] = match.localTime.split(":").map(Number);
  const utcMs = Date.UTC(year, month - 1, day, hour - sourceOffset, minute);
  const targetMs = utcMs + targetOffset * 60 * 60 * 1000;
  const targetDate = new Date(targetMs);

  const targetHour = String(targetDate.getUTCHours()).padStart(2, "0");
  const targetMinute = String(targetDate.getUTCMinutes()).padStart(2, "0");
  const localDayMs = Date.UTC(year, month - 1, day);
  const targetDayMs = Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate());
  const dayDiff = Math.round((targetDayMs - localDayMs) / 86400000);
  const suffix = dayDiff === 1 ? " +1" : dayDiff === -1 ? " -1" : "";

  return `${targetHour}:${targetMinute}${suffix}`;
}

function createGroupMatches() {
  const rows = [
    [1, "A", 1, "México", "África do Sul", "Cidade do México", "2026-06-11", "13:00"],
    [2, "A", 1, "República da Coreia", "República Tcheca", "Guadalajara", "2026-06-11", "20:00"],
    [3, "B", 1, "Canadá", "Bósnia e Herzegovina", "Toronto", "2026-06-12", "15:00"],
    [4, "D", 1, "Estados Unidos", "Paraguai", "Los Angeles", "2026-06-12", "18:00"],
    [5, "B", 1, "Catar", "Suíça", "Santa Clara", "2026-06-13", "12:00"],
    [6, "C", 1, "Brasil", "Marrocos", "Nova York/Nova Jersey", "2026-06-13", "18:00"],
    [7, "C", 1, "Haiti", "Escócia", "Boston", "2026-06-13", "21:00"],
    [8, "D", 1, "Austrália", "Turquia", "Vancouver", "2026-06-13", "21:00"],
    [9, "E", 1, "Alemanha", "Curaçau", "Houston", "2026-06-14", "12:00"],
    [10, "E", 1, "Costa do Marfim", "Equador", "Filadélfia", "2026-06-14", "19:00"],
    [11, "F", 1, "Holanda", "Japão", "Dallas", "2026-06-14", "15:00"],
    [12, "F", 1, "Suécia", "Tunísia", "Monterrey", "2026-06-14", "20:00"],
    [13, "H", 1, "Espanha", "Cabo Verde", "Atlanta", "2026-06-15", "12:00"],
    [14, "H", 1, "Arábia Saudita", "Uruguai", "Miami", "2026-06-15", "18:00"],
    [15, "G", 1, "Bélgica", "Egito", "Seattle", "2026-06-15", "12:00"],
    [16, "G", 1, "Irã", "Nova Zelândia", "Los Angeles", "2026-06-15", "18:00"],
    [17, "J", 1, "Áustria", "Jordânia", "Santa Clara", "2026-06-16", "21:00"],
    [18, "I", 1, "França", "Senegal", "Nova York/Nova Jersey", "2026-06-16", "15:00"],
    [19, "I", 1, "Iraque", "Noruega", "Boston", "2026-06-16", "18:00"],
    [20, "J", 1, "Argentina", "Argélia", "Kansas City", "2026-06-16", "20:00"],
    [21, "K", 1, "Portugal", "República Democrática do Congo", "Houston", "2026-06-17", "12:00"],
    [22, "L", 1, "Inglaterra", "Croácia", "Dallas", "2026-06-17", "15:00"],
    [23, "L", 1, "Gana", "Panamá", "Toronto", "2026-06-17", "19:00"],
    [24, "K", 1, "Uzbequistão", "Colômbia", "Cidade do México", "2026-06-17", "20:00"],
    [25, "A", 2, "República Tcheca", "África do Sul", "Atlanta", "2026-06-18", "12:00"],
    [26, "B", 2, "Suíça", "Bósnia e Herzegovina", "Los Angeles", "2026-06-18", "12:00"],
    [27, "B", 2, "Canadá", "Catar", "Vancouver", "2026-06-18", "15:00"],
    [28, "A", 2, "México", "República da Coreia", "Guadalajara", "2026-06-18", "19:00"],
    [29, "D", 2, "Turquia", "Paraguai", "Santa Clara", "2026-06-19", "20:00"],
    [30, "D", 2, "Estados Unidos", "Austrália", "Seattle", "2026-06-19", "12:00"],
    [31, "C", 2, "Escócia", "Marrocos", "Boston", "2026-06-19", "18:00"],
    [32, "C", 2, "Brasil", "Haiti", "Filadélfia", "2026-06-19", "20:30"],
    [33, "F", 2, "Tunísia", "Japão", "Monterrey", "2026-06-20", "20:00"],
    [34, "F", 2, "Holanda", "Suécia", "Houston", "2026-06-20", "12:00"],
    [35, "E", 2, "Alemanha", "Costa do Marfim", "Toronto", "2026-06-20", "16:00"],
    [36, "E", 2, "Equador", "Curaçau", "Kansas City", "2026-06-20", "19:00"],
    [37, "H", 2, "Espanha", "Arábia Saudita", "Atlanta", "2026-06-21", "12:00"],
    [38, "G", 2, "Bélgica", "Irã", "Los Angeles", "2026-06-21", "12:00"],
    [39, "H", 2, "Uruguai", "Cabo Verde", "Miami", "2026-06-21", "18:00"],
    [40, "G", 2, "Nova Zelândia", "Egito", "Vancouver", "2026-06-21", "18:00"],
    [41, "J", 2, "Argentina", "Áustria", "Dallas", "2026-06-22", "12:00"],
    [42, "I", 2, "França", "Iraque", "Filadélfia", "2026-06-22", "17:00"],
    [43, "I", 2, "Noruega", "Senegal", "Nova York/Nova Jersey", "2026-06-22", "20:00"],
    [44, "J", 2, "Jordânia", "Argélia", "Santa Clara", "2026-06-22", "20:00"],
    [45, "K", 2, "Portugal", "Uzbequistão", "Houston", "2026-06-23", "12:00"],
    [46, "L", 2, "Inglaterra", "Gana", "Boston", "2026-06-23", "16:00"],
    [47, "L", 2, "Panamá", "Croácia", "Toronto", "2026-06-23", "19:00"],
    [48, "K", 2, "Colômbia", "República Democrática do Congo", "Guadalajara", "2026-06-23", "20:00"],
    [49, "B", 3, "Suíça", "Canadá", "Vancouver", "2026-06-24", "12:00"],
    [50, "B", 3, "Bósnia e Herzegovina", "Catar", "Seattle", "2026-06-24", "12:00"],
    [51, "C", 3, "Escócia", "Brasil", "Miami", "2026-06-24", "18:00"],
    [52, "C", 3, "Marrocos", "Haiti", "Atlanta", "2026-06-24", "18:00"],
    [53, "A", 3, "República Tcheca", "México", "Cidade do México", "2026-06-24", "19:00"],
    [54, "A", 3, "África do Sul", "República da Coreia", "Monterrey", "2026-06-24", "19:00"],
    [55, "E", 3, "Equador", "Alemanha", "Nova York/Nova Jersey", "2026-06-25", "16:00"],
    [56, "E", 3, "Curaçau", "Costa do Marfim", "Filadélfia", "2026-06-25", "16:00"],
    [57, "F", 3, "Japão", "Suécia", "Dallas", "2026-06-25", "18:00"],
    [58, "F", 3, "Tunísia", "Holanda", "Kansas City", "2026-06-25", "18:00"],
    [59, "D", 3, "Turquia", "Estados Unidos", "Los Angeles", "2026-06-25", "19:00"],
    [60, "D", 3, "Paraguai", "Austrália", "Santa Clara", "2026-06-25", "19:00"],
    [61, "I", 3, "Noruega", "França", "Boston", "2026-06-26", "15:00"],
    [62, "I", 3, "Senegal", "Iraque", "Toronto", "2026-06-26", "15:00"],
    [63, "H", 3, "Cabo Verde", "Arábia Saudita", "Houston", "2026-06-26", "19:00"],
    [64, "H", 3, "Uruguai", "Espanha", "Guadalajara", "2026-06-26", "18:00"],
    [65, "G", 3, "Egito", "Irã", "Seattle", "2026-06-26", "20:00"],
    [66, "G", 3, "Nova Zelândia", "Bélgica", "Vancouver", "2026-06-26", "20:00"],
    [67, "L", 3, "Panamá", "Inglaterra", "Nova York/Nova Jersey", "2026-06-27", "17:00"],
    [68, "L", 3, "Croácia", "Gana", "Filadélfia", "2026-06-27", "17:00"],
    [69, "K", 3, "Colômbia", "Portugal", "Miami", "2026-06-27", "19:30"],
    [70, "K", 3, "República Democrática do Congo", "Uzbequistão", "Atlanta", "2026-06-27", "19:30"],
    [71, "J", 3, "Argélia", "Áustria", "Kansas City", "2026-06-27", "21:00"],
    [72, "J", 3, "Jordânia", "Argentina", "Dallas", "2026-06-27", "21:00"]
  ];

  return rows.map(([matchId, group, round, homeTeam, awayTeam, city, localDate, localTime]) => ({
    matchId,
    stage: "Fase de grupos",
    group,
    round,
    homeTeam,
    awayTeam,
    city,
    country: countryForCity(city),
    localDate,
    localTime
  }));
}

const groupMatches = createGroupMatches();

const knockoutMatches = [
  { matchId: 73, stage: "32-avos", homeSeed: "2A", awaySeed: "2B", city: "Los Angeles", country: "EUA", localDate: "2026-06-28", localTime: "A definir", nextMatchId: 90 },
  { matchId: 74, stage: "32-avos", homeSeed: "1E", awaySeed: "3A/B/C/D/F", city: "Boston", country: "EUA", localDate: "2026-06-29", localTime: "A definir", nextMatchId: 89 },
  { matchId: 75, stage: "32-avos", homeSeed: "1F", awaySeed: "2C", city: "Monterrey", country: "México", localDate: "2026-06-29", localTime: "A definir", nextMatchId: 90 },
  { matchId: 76, stage: "32-avos", homeSeed: "1C", awaySeed: "2F", city: "Houston", country: "EUA", localDate: "2026-06-29", localTime: "A definir", nextMatchId: 91 },
  { matchId: 77, stage: "32-avos", homeSeed: "1I", awaySeed: "3C/D/F/G/H", city: "Nova York/Nova Jersey", country: "EUA", localDate: "2026-06-30", localTime: "A definir", nextMatchId: 89 },
  { matchId: 78, stage: "32-avos", homeSeed: "2E", awaySeed: "2I", city: "Dallas", country: "EUA", localDate: "2026-06-30", localTime: "A definir", nextMatchId: 91 },
  { matchId: 79, stage: "32-avos", homeSeed: "1A", awaySeed: "3C/E/F/H/I", city: "Cidade do México", country: "México", localDate: "2026-06-30", localTime: "A definir", nextMatchId: 92 },
  { matchId: 80, stage: "32-avos", homeSeed: "1L", awaySeed: "3E/H/I/J/K", city: "Atlanta", country: "EUA", localDate: "2026-07-01", localTime: "A definir", nextMatchId: 92 },
  { matchId: 81, stage: "32-avos", homeSeed: "1D", awaySeed: "3B/E/F/I/J", city: "Santa Clara", country: "EUA", localDate: "2026-07-01", localTime: "A definir", nextMatchId: 94 },
  { matchId: 82, stage: "32-avos", homeSeed: "1G", awaySeed: "3A/E/H/I/J", city: "Seattle", country: "EUA", localDate: "2026-07-01", localTime: "A definir", nextMatchId: 94 },
  { matchId: 83, stage: "32-avos", homeSeed: "2K", awaySeed: "2L", city: "Toronto", country: "Canadá", localDate: "2026-07-02", localTime: "A definir", nextMatchId: 93 },
  { matchId: 84, stage: "32-avos", homeSeed: "1H", awaySeed: "2J", city: "Los Angeles", country: "EUA", localDate: "2026-07-02", localTime: "A definir", nextMatchId: 93 },
  { matchId: 85, stage: "32-avos", homeSeed: "1B", awaySeed: "3E/F/G/I/J", city: "Vancouver", country: "Canadá", localDate: "2026-07-02", localTime: "A definir", nextMatchId: 96 },
  { matchId: 86, stage: "32-avos", homeSeed: "1J", awaySeed: "2H", city: "Miami", country: "EUA", localDate: "2026-07-03", localTime: "A definir", nextMatchId: 95 },
  { matchId: 87, stage: "32-avos", homeSeed: "1K", awaySeed: "3D/E/I/J/L", city: "Kansas City", country: "EUA", localDate: "2026-07-03", localTime: "A definir", nextMatchId: 96 },
  { matchId: 88, stage: "32-avos", homeSeed: "2D", awaySeed: "2G", city: "Dallas", country: "EUA", localDate: "2026-07-03", localTime: "A definir", nextMatchId: 95 },
  { matchId: 89, stage: "Oitavas", city: "Filadélfia", country: "EUA", localDate: "2026-07-04", localTime: "A definir", nextMatchId: 97 },
  { matchId: 90, stage: "Oitavas", city: "Houston", country: "EUA", localDate: "2026-07-04", localTime: "A definir", nextMatchId: 97 },
  { matchId: 91, stage: "Oitavas", city: "Nova York/Nova Jersey", country: "EUA", localDate: "2026-07-05", localTime: "A definir", nextMatchId: 99 },
  { matchId: 92, stage: "Oitavas", city: "Cidade do México", country: "México", localDate: "2026-07-05", localTime: "A definir", nextMatchId: 99 },
  { matchId: 93, stage: "Oitavas", city: "Dallas", country: "EUA", localDate: "2026-07-06", localTime: "A definir", nextMatchId: 98 },
  { matchId: 94, stage: "Oitavas", city: "Seattle", country: "EUA", localDate: "2026-07-06", localTime: "A definir", nextMatchId: 98 },
  { matchId: 95, stage: "Oitavas", city: "Atlanta", country: "EUA", localDate: "2026-07-07", localTime: "A definir", nextMatchId: 100 },
  { matchId: 96, stage: "Oitavas", city: "Vancouver", country: "Canadá", localDate: "2026-07-07", localTime: "A definir", nextMatchId: 100 },
  { matchId: 97, stage: "Quartas", city: "Boston", country: "EUA", localDate: "2026-07-09", localTime: "A definir", nextMatchId: 101 },
  { matchId: 98, stage: "Quartas", city: "Los Angeles", country: "EUA", localDate: "2026-07-10", localTime: "A definir", nextMatchId: 101 },
  { matchId: 99, stage: "Quartas", city: "Miami", country: "EUA", localDate: "2026-07-12", localTime: "A definir", nextMatchId: 102 },
  { matchId: 100, stage: "Quartas", city: "Kansas City", country: "EUA", localDate: "2026-07-12", localTime: "A definir", nextMatchId: 102 },
  { matchId: 101, stage: "Semifinal", city: "Dallas", country: "EUA", localDate: "2026-07-14", localTime: "A definir", nextMatchId: 104, loserNextMatchId: 103 },
  { matchId: 102, stage: "Semifinal", city: "Atlanta", country: "EUA", localDate: "2026-07-15", localTime: "A definir", nextMatchId: 104, loserNextMatchId: 103 },
  { matchId: 103, stage: "Terceiro lugar", city: "Miami", country: "EUA", localDate: "2026-07-18", localTime: "A definir" },
  { matchId: 104, stage: "Final", city: "Nova York/Nova Jersey", country: "EUA", localDate: "2026-07-19", localTime: "A definir" }
];

const previousMatchSources = {
  89: [74, 77],
  90: [73, 75],
  91: [76, 78],
  92: [79, 80],
  93: [83, 84],
  94: [81, 82],
  95: [86, 88],
  96: [85, 87],
  97: [89, 90],
  98: [93, 94],
  99: [91, 92],
  100: [95, 96],
  101: [97, 98],
  102: [99, 100],
  103: ["L101", "L102"],
  104: [101, 102]
};

const defaultScores = Object.fromEntries(groupMatches.map((match) => [match.matchId, { home: "", away: "" }]));
const defaultGroupOrders = Object.fromEntries(Object.entries(groups).map(([group, teams]) => [group, [...teams]]));
const defaultThirdOrder = ["A", "B", "C", "D", "E", "F", "G", "H"];
const defaultKnockoutWinners = Object.fromEntries(knockoutMatches.map((match) => [match.matchId, ""]));

function reorderArray(list, fromIndex, toIndex) {
  const next = [...list];
  const [movedItem] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, movedItem);
  return next;
}

function Card({ children, className = "" }) {
  return <div className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

function Button({ children, active = false, onClick, disabled = false }) {
  const base = "rounded-2xl px-4 py-2 text-sm font-medium transition";
  const activeClass = "bg-slate-900 text-white hover:bg-slate-800";
  const inactiveClass = "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400";
  return (
    <button disabled={disabled} onClick={onClick} className={`${base} ${active ? activeClass : inactiveClass}`}>
      {children}
    </button>
  );
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${dateString}T12:00:00`));
}

function computeStandingsByManualOrder(groupOrders) {
  return Object.fromEntries(
    groupLetters.map((group) => [
      group,
      groupOrders[group].map((team, index) => ({
        team,
        group,
        points: 0,
        goalDifference: 0,
        goalsFor: 0,
        manualPosition: index + 1
      }))
    ])
  );
}

function computeStandingsByScores(scores) {
  const result = {};
  groupLetters.forEach((group) => {
    const table = Object.fromEntries(groups[group].map((team) => [team, { team, group, points: 0, goalDifference: 0, goalsFor: 0 }]));
    groupMatches
      .filter((match) => match.group === group)
      .forEach((match) => {
        const homeGoals = scores[match.matchId]?.home === "" ? null : Number(scores[match.matchId]?.home);
        const awayGoals = scores[match.matchId]?.away === "" ? null : Number(scores[match.matchId]?.away);
        if (!Number.isFinite(homeGoals) || !Number.isFinite(awayGoals)) return;
        table[match.homeTeam].goalsFor += homeGoals;
        table[match.awayTeam].goalsFor += awayGoals;
        table[match.homeTeam].goalDifference += homeGoals - awayGoals;
        table[match.awayTeam].goalDifference += awayGoals - homeGoals;
        if (homeGoals > awayGoals) table[match.homeTeam].points += 3;
        else if (awayGoals > homeGoals) table[match.awayTeam].points += 3;
        else {
          table[match.homeTeam].points += 1;
          table[match.awayTeam].points += 1;
        }
      });
    result[group] = Object.values(table).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.team.localeCompare(b.team);
    });
  });
  return result;
}

function makeQualifiedList(standings, thirdOrder) {
  const firsts = groupLetters.map((group) => standings[group][0]);
  const seconds = groupLetters.map((group) => standings[group][1]);
  const thirdsByGroup = Object.fromEntries(groupLetters.map((group) => [group, standings[group][2]]));
  const thirds = thirdOrder.map((group) => thirdsByGroup[group]).filter(Boolean);
  return { firsts, seconds, thirds, bestThirds: thirds.slice(0, 8) };
}

function getTeamGroup(team) {
  return groupLetters.find((group) => groups[group].includes(team));
}

function getSeedForTeam(team, standings) {
  const group = getTeamGroup(team);
  if (!group) return null;
  const position = standings[group].findIndex((row) => row.team === team) + 1;
  if (position === 1 || position === 2) return `${position}${group}`;
  if (position === 3) return `3${group}`;
  return null;
}

function buildThirdPlaceAllocation(standings, thirdOrder) {
  const bestThirds = makeQualifiedList(standings, thirdOrder).bestThirds;
  const qualifiedGroupsKey = bestThirds.map((row) => row.group).sort().join("");
  const matrixRow = activeFifaThirdPlaceMatrix[qualifiedGroupsKey];
  const allocation = {};

  knockoutMatches
    .filter((match) => match.stage === "32-avos" && match.awaySeed?.startsWith("3"))
    .forEach((match) => {
      allocation[match.matchId] = "Matriz FIFA indisponível";
    });

  if (bestThirds.length !== 8 || !matrixRow) return allocation;

  fifaThirdPlaceSlots.forEach((slot, index) => {
    const seed = matrixRow[index];
    const group = seed?.replace("3", "");
    const third = bestThirds.find((row) => row.group === group);
    const targetMatch = knockoutMatches.find((match) => match.homeSeed === slot && match.awaySeed?.startsWith("3"));

    if (targetMatch && third) {
      allocation[targetMatch.matchId] = `${third.team} (3º ${third.group})`;
    }
  });

  return allocation;
}

function getFifaMatrixKey(thirdOrder) {
  return [...thirdOrder].sort().join("");
}

function getTeamByDirectSeed(seed, standings) {
  if (!seed) return null;
  const directSeed = seed.match(/^([12])([A-L])$/);
  if (!directSeed) return seed;

  const position = Number(directSeed[1]) - 1;
  const group = directSeed[2];
  return standings[group]?.[position]?.team || seed;
}

function getTeamBySeed(seed, standings, thirdOrder, matchId = null) {
  if (!seed) return null;

  if (seed.startsWith("3")) {
    if (matchId) {
      const allocation = buildThirdPlaceAllocation(standings, thirdOrder);
      return allocation[matchId] || "Matriz FIFA indisponível";
    }
    return seed;
  }

  return getTeamByDirectSeed(seed, standings);
}

function getPreviousSources(matchId) {
  return previousMatchSources[matchId] || null;
}

function getLoserOfMatch(matchId, standings, thirdOrder, winners) {
  const originMatch = knockoutMatches.find((match) => match.matchId === matchId);
  if (!originMatch) return `Perdedor Jogo ${matchId}`;
  const entrants = resolveEntrants(originMatch, standings, thirdOrder, winners);
  const winner = winners[matchId];
  if (!winner) return `Perdedor Jogo ${matchId}`;
  return entrants.find((entrant) => entrant !== winner) || `Perdedor Jogo ${matchId}`;
}

function resolveEntrants(match, standings, thirdOrder, winners) {
  if (!match) return ["A definir", "A definir"];
  if (match.homeSeed || match.awaySeed) {
    return [
      getTeamBySeed(match.homeSeed, standings, thirdOrder, match.matchId),
      getTeamBySeed(match.awaySeed, standings, thirdOrder, match.matchId)
    ];
  }
  const sources = getPreviousSources(match.matchId);
  if (!sources) return ["Vencedor", "Vencedor"];
  return sources.map((source) => {
    if (typeof source === "string" && source.startsWith("L")) return getLoserOfMatch(Number(source.slice(1)), standings, thirdOrder, winners);
    return winners[source] || `Vencedor Jogo ${source}`;
  });
}

function slotLabel(match) {
  if (match.homeSeed || match.awaySeed) return `${match.homeSeed || ""} x ${match.awaySeed || ""}`;
  if (match.matchId === 103) return "Perdedor Jogo 101 x Perdedor Jogo 102";
  if (match.matchId === 104) return "Vencedor Jogo 101 x Vencedor Jogo 102";
  const sources = getPreviousSources(match.matchId);
  return sources ? sources.map((source) => `Vencedor Jogo ${source}`).join(" x ") : "Vencedor x Vencedor";
}

function matchName(match, standings, thirdOrder, winners) {
  if (match.homeTeam && match.awayTeam) return `${flagTeam(match.homeTeam)} x ${flagTeam(match.awayTeam)}`;
  return resolveEntrants(match, standings, thirdOrder, winners).map(formatTeamLabel).join(" x ");
}

function firstKnockoutForSeed(seed, standings, thirdOrder) {
  if (!seed) return null;

  if (seed.startsWith("3")) {
    const group = seed.slice(1);
    const allocation = buildThirdPlaceAllocation(standings, thirdOrder);
    const allocatedMatchId = Object.entries(allocation).find(([, label]) => label.endsWith(`(3º ${group})`))?.[0];
    return allocatedMatchId ? knockoutMatches.find((match) => match.matchId === Number(allocatedMatchId)) || null : null;
  }

  return knockoutMatches.find((match) => match.homeSeed === seed || match.awaySeed === seed) || null;
}

function buildTeamPath(team, standings, thirdOrder, winners) {
  const group = getTeamGroup(team);
  const position = standings[group].findIndex((row) => row.team === team) + 1;
  const groupPath = groupMatches.filter((match) => match.homeTeam === team || match.awayTeam === team);
  if (position === 4) return { title: `${flagTeam(team)} em 4º do Grupo ${group}`, status: "eliminado", path: groupPath };
  const seed = getSeedForTeam(team, standings);
  const firstMatch = firstKnockoutForSeed(seed, standings, thirdOrder);
  const path = [...groupPath];
  let currentMatch = firstMatch;
  while (currentMatch) {
    path.push(currentMatch);
    const winner = winners[currentMatch.matchId];
    if (!winner) break;
    if (winner !== team) {
      if (currentMatch.stage === "Semifinal") {
        const thirdPlace = knockoutMatches.find((match) => match.matchId === 103);
        if (thirdPlace) path.push(thirdPlace);
      }
      break;
    }
    if (!currentMatch.nextMatchId) break;
    currentMatch = knockoutMatches.find((match) => match.matchId === currentMatch.nextMatchId) || null;
  }
  return { title: `${flagTeam(team)} em ${position}º do Grupo ${group}`, status: position === 3 ? "condicional" : "classificado", path };
}

function runSelfTests() {
  const errors = [];
  const matchIds = new Set(knockoutMatches.map((match) => match.matchId));
  knockoutMatches.forEach((match) => {
    if (match.nextMatchId && !matchIds.has(match.nextMatchId)) errors.push(`Jogo ${match.matchId} aponta para nextMatchId inexistente: ${match.nextMatchId}`);
    if (match.loserNextMatchId && !matchIds.has(match.loserNextMatchId)) errors.push(`Jogo ${match.matchId} aponta para loserNextMatchId inexistente: ${match.loserNextMatchId}`);
  });
  Object.entries(previousMatchSources).forEach(([matchId, sources]) => {
    if (!matchIds.has(Number(matchId))) errors.push(`previousMatchSources contém destino inexistente: ${matchId}`);
    sources.forEach((source) => {
      const sourceId = typeof source === "string" && source.startsWith("L") ? Number(source.slice(1)) : source;
      if (!matchIds.has(sourceId)) errors.push(`Jogo ${matchId} depende de origem inexistente: ${source}`);
    });
  });
  if (groupMatches.length !== 72) errors.push(`Esperado 72 jogos de grupo, encontrado ${groupMatches.length}`);
  const opening = groupMatches.find((match) => match.matchId === 1);
  if (!opening || opening.homeTeam !== "México" || opening.awayTeam !== "África do Sul" || computedTime(opening, "brasilia") !== "16:00" || computedTime(opening, "paris") !== "21:00") {
    errors.push("Jogo de abertura deveria ser México x África do Sul às 16:00 de Brasília e 21:00 de Paris.");
  }
  const brazilOpener = groupMatches.find((match) => match.homeTeam === "Brasil" && match.awayTeam === "Marrocos");
  if (!brazilOpener || computedTime(brazilOpener, "brasilia") !== "19:00" || computedTime(brazilOpener, "paris") !== "00:00 +1") {
    errors.push("Brasil x Marrocos deveria aparecer às 19:00 de Brasília e 00:00 +1 de Paris.");
  }
  if (knockoutMatches.length !== 32) errors.push(`Esperado 32 jogos de mata-mata, encontrado ${knockoutMatches.length}`);
  return errors.length === 0 ? ["OK: estrutura de grupos e mata-mata válida"] : errors;
}

export default function WorldCup2026Simulator() {
  const [mode, setMode] = useState("manual");
  const [activeGroup, setActiveGroup] = useState("C");
  const [groupOrders, setGroupOrders] = useState(defaultGroupOrders);
  const [thirdOrder, setThirdOrder] = useState(defaultThirdOrder);
  const [scores, setScores] = useState(defaultScores);
  const [winners, setWinners] = useState(defaultKnockoutWinners);
  const [selectedTeam, setSelectedTeam] = useState("Brasil");
  const [search, setSearch] = useState("");
  const [timezoneView, setTimezoneView] = useState("brasilia");
  const [draggedGroupItem, setDraggedGroupItem] = useState(null);
  const [matrixStatus, setMatrixStatus] = useState("Carregando matriz FIFA...");
  const [matrixVersion, setMatrixVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchFifaThirdPlaceMatrix()
      .then((matrix) => {
        if (cancelled) return;
        activeFifaThirdPlaceMatrix = { ...fallbackFifaThirdPlaceMatrix, ...matrix };
        setMatrixStatus(`Matriz FIFA carregada: ${Object.keys(matrix).length} combinações.`);
        setMatrixVersion((current) => current + 1);
      })
      .catch(() => {
        if (cancelled) return;
        activeFifaThirdPlaceMatrix = fallbackFifaThirdPlaceMatrix;
        setMatrixStatus("Não foi possível carregar a matriz FIFA completa. O app não inventará confrontos: combinações sem matriz aparecerão como indisponíveis.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const standings = useMemo(() => (mode === "manual" ? computeStandingsByManualOrder(groupOrders) : computeStandingsByScores(scores)), [mode, groupOrders, scores, matrixVersion]);
  const qualified = useMemo(() => makeQualifiedList(standings, thirdOrder), [standings, thirdOrder, matrixVersion]);
  const teamPath = useMemo(() => buildTeamPath(selectedTeam, standings, thirdOrder, winners), [selectedTeam, standings, thirdOrder, winners, matrixVersion]);
  const testResults = useMemo(() => runSelfTests(), []);
  const activeMatches = groupMatches.filter((match) => match.group === activeGroup);
  const pathIds = new Set(teamPath.path.filter(Boolean).map((match) => match.matchId));
  const calendar = [...groupMatches, ...knockoutMatches].filter((match) => {
    const name = matchName(match, standings, thirdOrder, winners).toLowerCase();
    const city = (match.city || "").toLowerCase();
    const term = search.toLowerCase();
    return name.includes(term) || city.includes(term);
  });

  function reorderGroup(group, fromIndex, toIndex) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setGroupOrders((current) => ({ ...current, [group]: reorderArray(current[group], fromIndex, toIndex) }));
    setWinners(defaultKnockoutWinners);
  }

  function toggleThirdQualifiedGroup(group) {
    setThirdOrder((current) => {
      if (current.includes(group)) return current.filter((item) => item !== group);
      if (current.length >= 8) return current;
      return [...current, group].sort();
    });
    setWinners(defaultKnockoutWinners);
  }

  function handleGroupPointerDown(event, group, index) {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDraggedGroupItem({ group, index });
  }

  function handleGroupPointerMove(event) {
    if (!draggedGroupItem) return;
    const element = document.elementFromPoint(event.clientX, event.clientY);
    const target = element?.closest?.("[data-group-drag-index]");
    if (!target) return;
    const targetGroup = target.getAttribute("data-group-drag-group");
    const targetIndex = Number(target.getAttribute("data-group-drag-index"));
    if (targetGroup !== draggedGroupItem.group || !Number.isFinite(targetIndex) || targetIndex === draggedGroupItem.index) return;
    reorderGroup(draggedGroupItem.group, draggedGroupItem.index, targetIndex);
    setDraggedGroupItem({ group: draggedGroupItem.group, index: targetIndex });
  }

  function updateScore(matchId, side, value) {
    setScores((current) => ({ ...current, [matchId]: { ...current[matchId], [side]: value === "" ? "" : Math.max(0, Number(value)) } }));
    setWinners(defaultKnockoutWinners);
  }

  function clearDependentWinners(matchId, draft) {
    knockoutMatches.forEach((match) => {
      const sources = getPreviousSources(match.matchId) || [];
      if (sources.includes(matchId) || sources.includes(`L${matchId}`)) {
        draft[match.matchId] = "";
        clearDependentWinners(match.matchId, draft);
      }
    });
  }

  function setWinner(matchId, winner) {
    setWinners((current) => {
      const next = { ...current, [matchId]: winner };
      clearDependentWinners(matchId, next);
      return next;
    });
  }

  function resetAll() {
    setMode("manual");
    setActiveGroup("C");
    setGroupOrders(defaultGroupOrders);
    setThirdOrder(defaultThirdOrder);
    setScores(defaultScores);
    setWinners(defaultKnockoutWinners);
    setSelectedTeam("Brasil");
    setSearch("");
    setTimezoneView("brasilia");
  }

  function getVisibleTime(match) {
    return computedTime(match, timezoneView);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-medium text-emerald-700">🏆 Simulador Copa do Mundo FIFA 26</div>
              <h1 className="mt-2 text-3xl font-bold">Simulador de grupos, melhores terceiros e mata-mata</h1>
              <p className="mt-2 max-w-3xl text-slate-600">Ordene os grupos manualmente, escolha os melhores terceiros, simule vencedores do mata-mata e veja o caminho de qualquer seleção.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-slate-100 p-3"><div className="text-2xl font-bold">12</div><div className="text-xs text-slate-500">grupos</div></div>
              <div className="rounded-2xl bg-slate-100 p-3"><div className="text-2xl font-bold">32</div><div className="text-xs text-slate-500">classificados</div></div>
              <div className="rounded-2xl bg-slate-100 p-3"><div className="text-2xl font-bold">104</div><div className="text-xs text-slate-500">jogos</div></div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <Card className="xl:col-span-3"><div className="p-5"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><div className="font-semibold">🎮 Simular primeira fase</div><p className="mt-1 text-sm text-slate-600">Use ranking manual para definir 1º, 2º, 3º e 4º, ou use placares jogo a jogo.</p></div><div className="flex flex-wrap gap-2"><Button active={mode === "manual"} onClick={() => setMode("manual")}>Ranking manual</Button><Button active={mode === "scores"} onClick={() => setMode("scores")}>Placar jogo a jogo</Button><Button onClick={resetAll}>Resetar</Button></div></div><div className="mt-5 flex flex-wrap gap-2">{groupLetters.map((group) => <Button key={group} active={activeGroup === group} onClick={() => setActiveGroup(group)}>Grupo {group}</Button>)}</div>{mode === "manual" ? (<div className="mt-5 grid grid-cols-1 gap-3">{groupOrders[activeGroup].map((team, index) => (<div key={team} data-group-drag-group={activeGroup} data-group-drag-index={index} onPointerDown={(event) => handleGroupPointerDown(event, activeGroup, index)} onPointerMove={handleGroupPointerMove} onPointerUp={() => setDraggedGroupItem(null)} onPointerCancel={() => setDraggedGroupItem(null)} className={`touch-none cursor-grab rounded-2xl border p-4 transition active:cursor-grabbing ${index < 2 ? "border-emerald-200 bg-emerald-50" : index === 2 ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"} ${draggedGroupItem?.group === activeGroup && draggedGroupItem?.index === index ? "scale-[0.99] opacity-60 ring-2 ring-slate-400" : ""}`}><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="select-none rounded-xl bg-white/80 px-2 py-1 text-slate-500 shadow-sm">⋮⋮</div><div><div className="text-xs font-semibold uppercase text-slate-500">{index + 1}º lugar · Grupo {activeGroup}</div><div className="font-semibold">{flagTeam(team)}</div></div></div><div className="hidden text-xs text-slate-500 sm:block">Arraste para reordenar</div></div></div>))}</div>) : (<div className="mt-5 grid grid-cols-1 gap-3">{activeMatches.map((match) => (<div key={match.matchId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><div className="text-xs font-semibold uppercase text-slate-500">Jogo {match.matchId} · Rodada {match.round} · {formatDate(match.localDate)}</div><div className="font-semibold">{flagTeam(match.homeTeam)} x {flagTeam(match.awayTeam)}</div></div><div className="flex items-center gap-2"><span className="w-28 text-right text-sm">{flagTeam(match.homeTeam)}</span><input className="h-10 w-14 rounded-xl border text-center" type="number" min="0" value={scores[match.matchId].home} onChange={(event) => updateScore(match.matchId, "home", event.target.value)} /><span>x</span><input className="h-10 w-14 rounded-xl border text-center" type="number" min="0" value={scores[match.matchId].away} onChange={(event) => updateScore(match.matchId, "away", event.target.value)} /><span className="w-28 text-sm">{flagTeam(match.awayTeam)}</span></div></div></div>))}</div>)}</div></Card>

          <Card className="xl:col-span-2"><div className="p-5"><div className="font-semibold">📊 Classificação — Grupo {activeGroup}</div><div className="mt-4 overflow-hidden rounded-2xl border border-slate-200"><table className="w-full text-sm"><thead className="bg-slate-100 text-xs uppercase text-slate-500"><tr><th className="px-3 py-2 text-left">#</th><th className="px-3 py-2 text-left">Seleção</th><th className="px-3 py-2 text-center">Pts</th><th className="px-3 py-2 text-center">SG</th></tr></thead><tbody>{standings[activeGroup].map((row, index) => <tr key={row.team} className={index < 2 ? "bg-emerald-50" : index === 2 ? "bg-amber-50" : "bg-white"}><td className="border-t px-3 py-2">{index + 1}</td><td className="border-t px-3 py-2 font-medium">{flagTeam(row.team)}</td><td className="border-t px-3 py-2 text-center">{mode === "manual" ? "—" : row.points}</td><td className="border-t px-3 py-2 text-center">{mode === "manual" ? "—" : row.goalDifference}</td></tr>)}</tbody></table></div><p className="mt-3 text-xs text-slate-500">Verde: direto. Amarelo: candidato a melhor terceiro.</p></div></Card>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3"><Card><div className="p-5"><div className="font-semibold">🥉 Terceiros classificados — Matriz FIFA</div><p className="mt-1 text-sm text-slate-600">Selecione exatamente 8 grupos cujos terceiros colocados avançam. O app usa esses grupos para consultar a matriz FIFA e preencher automaticamente os confrontos dos 32-avos.</p><div className="mt-3 rounded-2xl bg-slate-100 p-3 text-xs text-slate-600">{matrixStatus}<br />Grupos classificados: {getFifaMatrixKey(thirdOrder) || "—"} · {thirdOrder.length}/8 selecionados</div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{groupLetters.map((group) => { const third = standings[group][2]; const selected = thirdOrder.includes(group); const disabled = !selected && thirdOrder.length >= 8; return <button key={group} type="button" disabled={disabled} onClick={() => toggleThirdQualifiedGroup(group)} className={`rounded-2xl border p-3 text-left text-sm transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${selected ? "border-emerald-300 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-100" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"}`}><div className="text-xs uppercase text-slate-500">3º Grupo {group}</div><div className="mt-1 font-semibold">{flagTeam(third.team)}</div>{selected && <div className="mt-1 text-xs text-emerald-700">Classificado ✓</div>}</button>; })}</div>{thirdOrder.length !== 8 && <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">Selecione 8 terceiros para ativar a alocação da matriz FIFA.</div>}</div></Card>

          <Card className="xl:col-span-2"><div className="p-5"><div className="font-semibold">🌎 Caminho da seleção</div><select value={selectedTeam} onChange={(event) => setSelectedTeam(event.target.value)} className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm">{allTeams.map((team) => <option key={team} value={team}>{flagTeam(team)}</option>)}</select><div className={`mt-4 rounded-2xl p-4 text-sm ${teamPath.status === "eliminado" ? "bg-rose-50 text-rose-800" : teamPath.status === "condicional" ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-800"}`}>{teamPath.title}</div><div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">{teamPath.path.filter(Boolean).map((match) => <div key={match.matchId} className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><div className="text-xs font-semibold uppercase text-emerald-700">{match.stage || "Fase de grupos"} · Jogo {match.matchId}</div><div className="mt-2 font-semibold">{match.homeSeed || match.awaySeed ? `Simulado: ${matchName(match, standings, thirdOrder, winners)}` : `${flagTeam(match.homeTeam)} x ${flagTeam(match.awayTeam)}`}</div>{(match.homeSeed || match.awaySeed) && <div className="text-xs text-slate-500">Slot oficial: {slotLabel(match)}</div>}<div className="mt-2 text-sm text-slate-600">📅 {formatDate(match.localDate)}</div><div className="text-sm text-slate-600">⏰ Brasília: {computedTime(match, "brasilia")}</div><div className="text-sm text-slate-600">📍 {match.city}, {flagCountry(match.country)}</div></div>)}</div></div></Card>
        </section>

        <section className="grid grid-cols-1 gap-6"><Card><div className="p-5"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><div className="font-semibold">🏁 Simular vencedores do mata-mata</div><p className="mt-1 text-sm text-slate-600">Clique no vencedor. As fases seguintes são alimentadas automaticamente.</p></div><Button onClick={() => setWinners(defaultKnockoutWinners)}>Limpar mata-mata</Button></div><div className="mt-5 space-y-6">{knockoutStageOrder.map((stage) => { const stageMatches = knockoutMatches.filter((match) => match.stage === stage); if (stageMatches.length === 0) return null; return <div key={stage} className="rounded-3xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-col gap-1 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-lg font-bold text-slate-900">{stage}</div><div className="text-sm text-slate-500">{stageMatches.length} jogo(s)</div></div><div className="text-xs text-slate-500">Escolha os vencedores desta fase para liberar a próxima</div></div><div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{stageMatches.map((match) => { const entrants = resolveEntrants(match, standings, thirdOrder, winners); const ready = entrants.every((entrant) => entrant && !entrant.startsWith("Vencedor Jogo") && !entrant.startsWith("Perdedor Jogo") && entrant !== "Vencedor" && entrant !== "Matriz FIFA indisponível"); return <div key={match.matchId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex justify-between"><div className="text-xs font-semibold uppercase text-emerald-700">{match.stage}</div><div className="text-xs text-slate-500">Jogo {match.matchId}</div></div><div className="mt-2 text-xs text-slate-500">Slot oficial: {slotLabel(match)}</div><div className="mt-1 font-semibold">{matchName(match, standings, thirdOrder, winners)}</div><div className="mt-2 text-sm text-slate-600">📅 {formatDate(match.localDate)} · 📍 {match.city}, {flagCountry(match.country)}</div><div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">{entrants.map((entrant) => { const isSelected = winners[match.matchId] === entrant; const isPlaceholder = entrant.startsWith("Vencedor Jogo") || entrant.startsWith("Perdedor Jogo") || entrant === "Vencedor" || entrant === "Matriz FIFA indisponível"; const disabled = !ready || isPlaceholder; return <button key={entrant} type="button" disabled={disabled} onClick={() => setWinner(match.matchId, entrant)} className={`rounded-2xl border px-3 py-3 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${isSelected ? "border-emerald-500 bg-emerald-100 text-emerald-900 ring-2 ring-emerald-200" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"}`}><div className="flex items-center justify-between gap-2"><span>{formatTeamLabel(entrant)}</span>{isSelected && <span className="text-emerald-700">✓</span>}</div></button>; })}</div>{!ready && <div className="mt-2 text-xs text-slate-500">Aguardando os vencedores dos jogos anteriores ou matriz FIFA disponível.</div>}</div>; })}</div></div>; })}</div></div></Card></section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3"><Card><div className="p-5"><div className="font-semibold">✅ Classificados simulados</div><div className="mt-4 space-y-3 text-sm"><div><b>1º:</b> {qualified.firsts.map((team) => `${flagTeam(team.team)} (${team.group})`).join(", ")}</div><div><b>2º:</b> {qualified.seconds.map((team) => `${flagTeam(team.team)} (${team.group})`).join(", ")}</div><div><b>Terceiros classificados:</b> {qualified.bestThirds.map((team) => `${flagTeam(team.team)} (${team.group})`).join(", ")}</div><div><b>Chave da matriz FIFA:</b> {getFifaMatrixKey(thirdOrder)}</div></div></div></Card><Card className="xl:col-span-2"><div className="p-5"><div className="font-semibold">🔎 Calendário geral</div><div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar seleção ou cidade" className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm" /><select value={timezoneView} onChange={(event) => setTimezoneView(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="local">Horário local</option><option value="brasilia">Brasília</option><option value="paris">Paris</option></select></div></div></Card></section>

        <section className="grid grid-cols-1 gap-4">{calendar.map((match) => <Card key={match.matchId} className={`overflow-hidden ${pathIds.has(match.matchId) ? "ring-2 ring-blue-200" : ""}`}><div className="grid grid-cols-1 md:grid-cols-[130px_1fr_190px]"><div className="bg-slate-100 p-5"><div className="text-xs uppercase text-slate-500">Jogo {match.matchId}</div><div className="mt-1 text-lg font-bold">{getVisibleTime(match)}</div></div><div className="p-5"><div className="text-xs font-semibold uppercase text-emerald-700">{match.stage || "Fase de grupos"}</div><div className="mt-2 text-xl font-bold">{matchName(match, standings, thirdOrder, winners)}</div>{(match.homeSeed || match.awaySeed) && <div className="text-sm text-slate-500">Slot oficial: {slotLabel(match)}</div>}<div className="mt-2 text-sm text-slate-600">📅 {formatDate(match.localDate)} · 📍 {match.city}, {flagCountry(match.country)}</div></div><div className="border-t p-5 text-sm md:border-l md:border-t-0"><div>Local: {match.localTime || "A definir"}</div><div>Brasília: {computedTime(match, "brasilia")}</div><div>Paris: {computedTime(match, "paris")}</div></div></div></Card>)}</section>

        <Card className="bg-slate-900 text-white"><div className="p-5"><div className="font-semibold">🧪 Testes internos</div><ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-200">{testResults.map((result) => <li key={result}>{result}</li>)}</ul></div></Card>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 shadow-sm"><b>Notas:</b> os terceiros classificados são selecionados por grupo. A ordem entre eles não define os confrontos. O app usa apenas o conjunto de grupos classificados, por exemplo ABCDEFGH, e aplica a matriz FIFA para alocar cada terceiro nos 32-avos. Se a matriz completa não carregar por bloqueio de rede, o painel avisa e o app mostra a matriz como indisponível, sem inventar confrontos.</div>
      </div>
    </div>
  );
}
