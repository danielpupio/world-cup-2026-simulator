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
const defaultThirdOrder = [];
const defaultKnockoutWinners = Object.fromEntries(knockoutMatches.map((match) => [match.matchId, ""]));

function reorderArray(list, fromIndex, toIndex) {
  const next = [...list];
  const [movedItem] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, movedItem);
  return next;
}

function Card({ children, className = "" }) {
  return <div className={`rounded-[28px] border border-white/10 bg-slate-950/55 shadow-2xl shadow-black/25 backdrop-blur-xl ${className}`}>{children}</div>;
}

function Button({ children, active = false, onClick, disabled = false }) {
  const base = "min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed";
  const activeClass = "bg-white text-slate-950 shadow-lg shadow-cyan-950/20";
  const inactiveClass = "border border-white/12 bg-white/8 text-slate-200 hover:border-cyan-200/40 hover:bg-white/14 disabled:border-white/5 disabled:bg-white/5 disabled:text-slate-500";
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
  if (!team) return { title: "Escolha uma seleção para ver o caminho.", status: "condicional", path: [] };
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
  const [activeGroup, setActiveGroup] = useState("A");
  const [groupOrders, setGroupOrders] = useState(defaultGroupOrders);
  const [thirdOrder, setThirdOrder] = useState(defaultThirdOrder);
  const [scores, setScores] = useState(defaultScores);
  const [winners, setWinners] = useState(defaultKnockoutWinners);
  const [selectedTeam, setSelectedTeam] = useState("");
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
    setActiveGroup("A");
    setGroupOrders(defaultGroupOrders);
    setThirdOrder(defaultThirdOrder);
    setScores(defaultScores);
    setWinners(defaultKnockoutWinners);
    setSelectedTeam("");
    setSearch("");
    setTimezoneView("brasilia");
  }

  function getVisibleTime(match) {
    return computedTime(match, timezoneView);
  }

  const selectedThirdTeams = qualified.bestThirds.map((team) => `${flagTeam(team.team)} (${team.group})`);
  const directQualifiedPreview = [...qualified.firsts, ...qualified.seconds].slice(0, 8);
  const completedWinners = Object.values(winners).filter(Boolean).length;
  const visibleCalendar = calendar.slice(0, 18);

  return (
    <div className="stadium-shell min-h-screen overflow-x-hidden text-slate-100">
      <div className="mx-auto flex w-full max-w-[1500px] min-w-0 flex-col gap-5 px-3 py-3 sm:gap-6 sm:px-5 sm:py-4 lg:px-6">
        <header className="sticky top-2 z-30 rounded-[26px] sm:top-4 sm:rounded-[32px] border border-white/10 bg-slate-950/65 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <img className="wc-logo-img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAIAAAC2BqGFAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAeKADAAQAAAABAAAAeAAAAAAI4lXuAABAAElEQVR4AXSdB4AcxbGwZ3Znc7wcdJJOEQUkIURGCCGRk7ExBmOMA47gZ2NwwsY4YBvH5/TABhvMw+FhMjLRgAAJhBJKp5xPF3T5bm/z7oT/q569k4z9j1a70zPV3VXV1VXV1TVzumVZuq7btl0qFTXHMXx+wzA0TSsWC1z0eDz+QEDXdNMsm6apabo/4OeibdkAAObz+X0+n+M4Ct7hVgB4Xac14Dnx+wMCbwNf1DTHr9p3NK1QKDiO7fV6AaCdclm1r2vBQFDhYxWLJceF9xmOrdoHPa9B+3RXKpUsy9R0HXiPRzfLVqlc0nXN5/fTpgN6pSJg0AKGtE93tmN7dEEPfOiuXC5xPSDVj6EHLdTg+hg5OgCKnJIiH3ipDuaQ4ziaat+FL0Kj7hF8gB9vH+q8Xg94erhKuxxUc7TKuXsFtvKBy5W7sIcyQI57RaeKuiU/7rmUOeSCLt/SompTWqdMbXVZQVeuuTXUlQrwWGvSPQio7jgdw0Ra55Aa7ikA9CaH6o6LVJJbqgEFLGQq4PET1YR8HccBqaXQHSOnQqnqoNKZdAGY+rjdqw74kktyzq86kd5V4x5IMAQ7uecc159bX10QjN1iBSFpRB3IkbSqiny71fmWm24/Ho/crfzTNMZUUSH3FTwtCPmVokJqvDsI5p4MDNJsAyN1VYcuPC2o9qQ7WxMABI37nLgHd128KY51J/3JXRc9HUFT8LbtAlCbPmlrrEj/FfSkc+BV++DjAigMj8Nf0aO6UwMu2FY6oEU9l8txgTmFDqAmMj825f1cpFEmKZVlTnkNUFRTRqjy+/30Xq6oFDWngEcFlcfgDRnFUrEI6hX4f2vfsq1yqUyzas4K/L+0r+BRbmAYCKABXBWHitCBV1NYdAi1RAWhInSmvEzh8e6gBYpgHwoEGEFPwbtTXtArlf4dXnV3vMZTKgJyNO298EJ/GZa6KkvaR6VoAs9BOy48ozQm0Qi3DJCMAt3LiZQZEDXmxw+yAgBM3a/AS1GG/F/h5ZoIDw3+B3jqI2E2ImZz2+1PiVoFHmZRiwPsBRNN5wrnXHEbdIucc1Sqq/qVKwq/MWAXWfnmLvW5zjnf44cLQVFaU7cE++OOcfh/aV+J7BgvpA1pWrU/jr+0QZtYCbc1BpwTKBFUkHGZiWrmKtqkqPiODFbgsQmirRS8o3m8lYnp8gJgyjTkokUVsQnSvlxw2xf2ohnGZq4L7xbHACrVhQIOrlJB/iteKK6NV3fvj3fnIszd8e4A4Px4eFq0GGWFz7+TD/u4NQ7P/AZfd3rRlMvHf2n/OHaNA7jwoCyTEQIsvALFcaYAsxKExCuwHdgnXgRTQNlR6lP0eryw2x0hFIjP8IGsgrc9Xq+CF69D5qzHEwwGQdG0TCY1/Qn8WPt0DXkCr+vcFZXlMYJBunOsMa8m4PfjN1CRMSrmC6ZIvwfqPV7d8HpwEXSvzFDquu1Ld+IViAA5jkVf9EcdqINGbgGAADHfmdRUpHg8OQLv97vkg9574OFDQODRqA4N8n2s/WIRnrrwcBWNdVz7SKQmWIqMuEdFaKQA8U7FnEjJva/ORMzfc6nSBNXHAeV8rKBOpTB+Zbw5dQJhIiJev9fq0oq6FpgMUgppPy3vP9jx9oa2NVv27tzf2TeUyuWytuYJh0L1ycgJ0yYtOfXEs0+eNbW1KRwKFFD3Ip6o6sNeW7e9zZVOuXhc1/+OP8QKvaDxr4hVSlxVUl9phKaYKP8GSQvutbHfcbbJBb2QF9XBKZQC+i9zQfXNQAkWHGpuIxduczCCa/8OzxXVoNTgxC1yolTHf4ZHLoaGR/35Vz3Db1mJK8PN5/kMPZvNvvDq2gefeG3Vhu1OOTdtcvPsmTOaahPVsUCytn5gYPhw19G2/d279h2yy6XFpy347PWXXXH+GdFoqGxp+a7XvKln7KrlVuyCeCzM3HKxhZU2plVQkwOsmBwuy8bJAWH3rgtwPDlUUJpPahyDd1AJokmAl/bHyKdMR8dURyaTUdW8as7q+AzKTCsV4fUCV1ERMgXF7FKkrfEpzwQBnhZDMmeZMpWFzLiKyOfzdA8eTFI6Ykbh1oCTzHHdgwpCUWxu2zd0+LHTJx3o7QlPXv5r3c4/v3LTD+97YuPaTfUT6s8/e9HceScOlwP9WWs4nQta2TtuWHLS/Jm0BtcOtXe98PqGB59YuXXT9oXzp9/5pRsuX77I1ozOlV+sb8xs6V1YN+3aGdMm6BgRQ7yOfD7HLBEFoVSKS46LHlhBDoeLHioCqXLJ/88qRcErdsnCx1VBaDDoHVcpbvvC82yF0ejiIHOOasfcO3fJVMBfcUQVs2RCd6uGwCzAiq4CX2ZKoGq5yMCgnZln9MRBl9IxMuL1BP3SPmRYrDBlRRdwpWLN+rYVT/7iO59ItG/bk/aeYprWL54++OTrvXUNyXu+9gla+NWzbX05PV+gF9ujOUYkERjc/exvv3TySXPpEabA8VKx9PiK1775s4eOtA+8f2n9N284UTeLUWvjxDlT7vmL+YHrvrZw/gyagtEs+cbQQ20qVQ56YwtayOegyWMrRkwXzpmsMNUKUMkZ/cqC2fVWlZzBDewZ7Y+7d8fDQzgyKPIFBLImLSKryv+lyDShRSoAAJjLIIpclBaVMaEo9hqHtFzmIlIgS15dw301lc4Zh4cAGWrDh2QJa0plXyDQ3dXz8Ztv/d2tRp3ffPxvbx/oKjzT3rq3M3zJRYt+/+OvdnT3f+Ab/ztaxFiIxfb6fJZZaolp1yyddeMHL25urKMp15a67O7p6f/Sd+977LFXZk4uXjW1Y/6U8EVXntxfNL76x9if7v15siphlgrKHxfjyQFDwRZyGIGiIke5v15GAmwhRxgKfxX5wIM2M8GFh17IUfAGUwRNIPAq5AD58EomrvKvgaeiwQ/sFlJong+qVKw2Z5TGlBFVlXrih7sVABdeXRF490BIRMhEPXGBWsfDyxXmsOrYNrOHNj92+89WLJlXmjmp4bkV23/3ZrDTnjIwqH/yoxfee8/tYP/RW38y0HnQ9gQ9sdpQwBe2Rj556YIv3nRNY1MDLXPQIORlMlkGOxIJNzbW/f3335naUvvj3z7+QGZa676BZFPnZe+bd/K04dtu/eKPv/K+mhMucnuHEBc9wVWwFZLdNjHKnI8fruk6Hp4WLG6PK3dx+4R1ctCWIh+zJkUxfqK+OfPeeeedLhTdqIlYWWi6tQQLt47S8QpL6RTyaFrHyaIbVV9CNqp+BV51KpVdLBRa0OD1+e1SZmj3411vfueJvzy8Yrvn99+YYY0M3/lQ76r2plzBufaqcx76728hp0yIi845+cYrFy89eUqNUXQy/X/84ec/cf37orGoIsFli1CCWjtypOOHv/7L6+9s3Xug48oLzkJM33xnb082bhbTyxdEFsypuev+rc1Dj9bamx1vwJ+YonnxZzB6Fc3jNujiL+MHee6aXghQJk7IUUJDUQ3SOBMFXrFZSRctypgJfxQ81eU2i3uMu2Kx+MucMGUQeoAkCuURleJqd2YQB60fbwxdeKXUKjpa4Cs6XZS6C0/H0CDG0LEH978wuPUhe2Tn4HD5O08FGma2/vW7U199fudVvyhkS4HZM5rffOI3dbU1VBEUjzv27j0wc+Y0lyPHXZZTIAv5/PIbv9drNKMiY4b5y1su+vm9D73yxuZk3HzyttCyi2Zc/72uQmf7Vy/LViVDRt0ptQs+k5x8DnWpCE9pwbXV6Acxhpic4NgSHH9cgpRyAA83sEMVchS7hPzj4dVy4ZhOlyAoDWiVZS5nHC5tMgBSqBQZLfceZTk57hjnhfBFbguAW13qHIOXhUhhcM+hl24eWP218vDuV/fWfO7xptf2J688twlzueKtwWwp5PU437v1o4rL0gdtjh8Um5sbKcqNfzu4HgyFTps7qZTLp0fTR/ozd/7htf/6xAeS1ZGRjPHPtSnH9Fy+uP7ptuovPjlhzeG42b+x5/WbO974VinT4/GFxltV5LhduOi75FT6qxB7HApcqVxUjBkvuni63BhHVrS5QDsOI+NeHVf/bhFPiBMqi/XT0eEYSxHV98ITHVaLc3fkqaBEQzN8AccuD2//0/DWP3is4a2d4d+8nnj7YIDVXyCSWTA9ms5kNhy08RvOv+CUKy48hygzGmYcv/ETwxDVWSFs/OpxJye0NhXf6rQxQZa5cdfIqm1N11561v3/+9K77XY2XZ43NeiLejZ2xT71F+uSOcFbzk1PMx8/dHR97Sm3JaZezFR/DzmILQfNQw5shF7X+EM+FhhhOgav+HM8vCClzCO/oi29Mg6sYmVSUKQmB9fgLKykJkVUAecu78SRKJvUo4jFlLCYeEL6e+C5i2mmafwWS/M6+Z7ulV8efvdn6Wz+J6/U3vhI3duHwhqcLOarEqHGhmTfUPnIcMAb9F13yZmr1mwolWV9RPX3HNlszrX777k+XmxpqikXsnYpbxWyPqfw53+sPnneCeFE4MDR0nDG29SQSEZ9mlVwvMYL22PXP1T7p/W1xXRX3+qv9q27x6MVLVsil7R2PDkwAXK4AkKK3DI+HBcIZLpKhrGHgbAIRgEAfIVdruNbLgu7FIcNhLQi6i55SrrHsXdPFMBxc8Y9ZW6oE7c6kMfYo2ajxxfO96zvf+f7eu7wps7oD56P7zrq1xgCK4+mr5leqk3akWiwwwyNZK2m5thjr20bTOXeWnLWe3p3iyjTcDjIEI53Nw7m9hsJ+oZ7DgerGh2zpFnF3r7Sjr0dC05oaWsbzBasmnAwVmcOsROTttklSpWNn7ycXLPfd+elo55dD+WH9tad+V1fpMVd+v0LLWo2u31VJAB5hkA1vejaVZXjyMiJIl+wUpgJAEE3tDsH44Mx5KCJfIFFSZFxwz7gVhM94UMfxFNwyxm3fCGv4LGXQeAFQMFTZDyxlvlC0WP4Cx0v9a26Tct3/nlDzaf/WrOrL6AZtpbOBKPpD3zFvvmeaDSS99iaPxLVvEbvcPHFtQcj0TgGE6P9L3irwrP/fPuO79+3fec+MHEPF4ZzKvQPDCTjkVuvP8+bHyhmRiyzrBXTVfHgnOmTypZthOO6VfD7iyd8ONGyGO8yoxWzRIhXH4je+HDNmweqrL63j776OXt0N2izooEcpBDyYYJbRKIowh/mMeTDBBYsYj+xw4p8JHcMHn6wJnKEXYEgkLTGIWs5xJ4bWFKgwZ4iB44PRZxAzlV8Q4pMHCC5cjy81Fe+PbddsjXdGNr5t/53vmuV8nc/n7z7+XjO8mh2yTBT53zQ/sp98RtuioU97MLJJkGiroEBKms+1H8uPcJWoWumx/lIm79/+InfPv3u5pH4x+586BO33rP6nU3cddk9Ojra19cPkQsXzv/l92997r6vzG4MWKnhmrjv3DNOikVC4Vgsngxb8Ltgzp5YXP7BQPOlVZFJmpNLaZ5ybzbwhUer/7Kh1pPv6Hzti5mudxzdDzk0LuQzikQJlLIW8j1ekQLLggUUOZj/inrxQyji28EtxS5NmKVWJFIflUIBAZcWVeuIvXtFeEmLOJsCQEGFYxSkALjwam7QAbOF6q4W8hrBkV1/SW39Va6of+Op5D93RDSfreWzvkDpprt8F77Pb5U95aKsQYnDDQ9m6mfOnTKpYehgSXes/lQW2+gnkqkOl9d/eewf9/z5zfiEWbsOtDc0Ttg2qn/q+39bMGnFLTdeUVcV9vkDkydNxJUGQ+CXLjnz5f9rve7TdyyYOz0aDkSCgVmtVTUNNd179mZNa93ueDzq8SX1+qWB0fr08KaM7YRYod79QtVA1vjisoGeVV9rWPzjcPOZQq4t6xJFviBCGRUAXkK+kj/O6dPlH/OQcKF8jWEOx2ErwExPOCzuM0IOs0Ti1boe6WBeIPMUWXjLBAiGYDUqhUlVUSmGwXRgEtEsDbDXq+DzluPNHXw6te032YL+pUdj/9wZ1fyOlks3txa/8FPfeZf68jniVjTGKsNb1qy+zm5vPHnB4qk4qLqFUHWt27g1PTpK4y7Gb6xa+/XfPGsHaw/u3ZXPjB7Ys2sfLNPDW4ajN37ttwSKZkyfOs5lquAbVFfF7v3x7VdfumR4JAVWV5w33RuP93b150smEsgX9Ju2Hp4RqT0vaYQLWimnGfrv3oz/5OWEbo72vfMtc7gNQlAhaEi4wQGnUKBgJeSHQkqlCMMYAJgDiwhQED6jO6VRRFCABgCz6bZQWRpxQ0bNnY8yApWiiIncG78gN1xgV4IqVVR13Qhl2l/tW/9TnPTbH0+u3hfRPCUtOzr3NKf+/OodPeENW1hLit4xLQdzYIX9Rw7scjL566+YHwp77EJ+xoTqyRObQfHw4SM7dux4c9WaT3/r3lTZ29/d7pgFu1zUrLJZzPd1H+nt7gyH/fV1tSAwjglchtoMZsDvY+d5aHgkEvRee/l8LWcdOdhR9AcMg7CGw/+JVcVk2NQT/qrFyUCyrBWymk9/eE38lyurvNZo96qvF0f2sY3qtnyMXtfKubzi3tguLRwZxwFgl1lyX7gn7IJpHgaNg4mPG8LBPQnfiTProYikU8Ktg73q/jG3jyIf6GQYgcFfNlnvbbxHs8vf/kf8jb1hHY2RTS84reBfmOzN+LcciBzsDhAWZQaiswIh25c0drf3DO3dMe/kE66/4iRtZPiq8xZUJWMg1thYX1dXt3nb7v3tffmRPqswahUzVilnl/NWOa9ZpUJ2xO/VwyEJvYIzCMBiVrlYYrabSeogbeNoT/+iBbVTT2jJHu3YdXiwHPJrhgR+LzsrddM1qY9emZveXGC7puaM2MSpeQRC9+n3r449/E7UWzo6sP77upX1Gj4hn/iRu9/qq7hxqAVZTagMEG4TQoJRwi683gq7iJSKWwdjqQ6DPCr+LA4gu8iyVFGeObdgIj4G9QFwlx5oQ2oSgqAIvHjLykuBJCRUM1MD63/os4fuWxVbsTWqG6aTGT3lPM+1X4zPnlz0GzpadHjIOzKKQkebO/jYo/nI7l7PwPbXrHzpO1+6eNas+paG2r7+wWwGjmVB5voPXT59YpVN61bRLOXNYpaPVeKTK2VHqyJsbHtc/hLszWWznOdy+Wwul06ne3v7oXrxGU1ElAf2bdgxYhhVoXLBSkat6VNKhbIdjpSuuTzzgYvy8WDRNzUQrCk7hRwr5Z++GHl1T8KT3jG89ZdwTtikUm0gFo+a9RTkI4lCvV9t8lFW/jIqFNYKtGy0S1wQdkkYT4XsZcPx2OFqgEp57IbrLSv5R3q4WTlVYAIkoRlP/6bf6pk9L++M3/dmDA/CyY1WTyxc9EnNnzAuOs9qiImD4QvboZAMykhae3lVZNhK7iyGh3oOtr+zYmJr1YM/u9a2zb6+vpwIZS41OhoK+D93/aVaLmXLsrMEu+VjokBKWiFTl4wQ+2ZI4K+rEPMswdXR29ffPzh04ZLaRDKQOrChu71jc683lCDJylw8f9Trsw4f8W7dHmAAC+lyS7Oz/ELz43eYEyeParlMWTPufCZyYDCSO/LCyIEVBA+gUGhVeqNyrmj/F9YJYyowY4xzgYRfnEl6BocYQzlEuzN0XEFdoP6ZCCK3SnK5y4xkghyDd41nIFToerXQ8UL7SPi7/4jCRy2TaZ1ZPOfa+MYdwWde8hLFXHqqiVrK5W2JWDn2yjW+9bsi1RMiu4a9nSl/z+bnhnZtOmvJCaefXNvNhO8fEKHOZPsHBq++bMmcGU3ImmPD6zJ6iQU9Hy2fmdRUjXUWGVaSzNik06NDg0PDwyP7Dxw5c2F49sxQ4eju3h1v7jhithcCbI9ddNbo7BmlfEHfsDmUSJbwKmqbzNmzS00Ty8k6+5JPlauqsppZ6k/57no25HgCqZ1/cLKHcQZgC3LK9gKMghtoBUrYOmh12YWyhX2oCOGmhOcqmzUoFLlCFBt3D8uIRkYbMCNoUXSNyjXhCuqPAle4jtIQ3TQGLw6j7L95ndLAyI4H8HPuXhHqHfFo5UJNff5DX/a1TLXbuzxzZhaZO6u3shTS2rt97UdZtGi9w0wyzfB700Zw04DP0Ao7Xrwv29V+yim182fHDx48PDAwmM1lR9NpNODXP/chQ7ccIuulgp3POZmMk00n4/6qRASewmZ249LpDD7GwOAQ7N64afuMlvSZi/zlVO/RLS/0dfW9sb9crooQwy8VrVQ6AB3BoNneoXe165GYnahBguxC2QrVOstuLPq1NJZrzR7/g6v9fntoePvviVUwiYU7tvjLcAOuCfHKv1bsEtuGUIqpU+zCIaYIgAsvMHfddRfuoTrE4eOGqxlgI8zlHEecu+Imu16kWtSoK+JUeg3/8I779aG1j60PPvA6az/LZ43e+C0r2eg7fMDfNWhYJbPsGDv2Gxb7ULqn/aivb8DTPQi11NbLRWu4N3flLE8hlx44tLNm0rwpM2oIsuze388A4yEgs9NaJwyOjPZ0dU2eUD/vhMkXLz3l09dfcvvnPjxlYiNDIpjZFrH/bCY9ODzy0sr1J04vXndVq5XL9O9YeWTPvs6O/GNdnnJN0IjFe/o9A71OfWNp/x5nz25fc2MpEIIbDlkMaDRsXqTG9Dhm5w4JE285rC+b560xOjzhSb7EDHoRbqhdizGGjEeoWXKw+SnsQhCFn7LoqjjdsBF4HRuiXBDRISK26qACltGjS/4Gc4QmkEDGChXtZmlyjqan3/zgrsG1Xx5Om5f8xNs94sXNWHZN/pzrPH/9e9wq6RddlPcHvf94JZisMo4OSdIZnVviRItDhO7KD+UGtx29d0nujClGb386XNO64H23hOtrt24deGdjqrqqOhaPMlU3b9l+0oL51VUJtJpYdpxWVvn0Xijs2bM3HOFfaO27u55/+bWvfnbhR66dYw6NoDG6DhxoPzC4psf5Q2fy1Mvjuw/WsKY488Q0vty2faH5s/MnL8yaJizGC8IKOFaZ/TzbzFsr/xTpOJDQjPAFJ5Uf/gweVXPDknv9wRj8ghsMP1bpPezC9GGZGXMA4CtKAG8CxSLwyguUAnvounjxcrjs51umC8LNHhcHZdS5WlByIldYQKrMncyBRyMB62fPBboHuFOon5hbfLXnxecDnUc9VXXexiaMr3X1xTlSAP6yIslok+7iw+9AkctyU/OFfXY0+NdthTOn6Mnq+PDA4a1P/3bB+29eMC/mWOk17w6ovThxlViv9/X3sdB18UReWKohFfUNde++2/bIitU9Q/lHfrT46vdNKfT1d7776nBPV+eRVKFov9Kpx6qcBQthfjEeKU+YaI70OUsXW9VVkvXHvEX4LBuMHJCCE0y8Bedne9uNkjf46hbPyt3BC0/sLXS/Fpj2ftdBZvnnhXr3wH9S7IFzFcQUcyAR4a9sxiDcSDqqAw5SDz4xIIBRYXyCqKLLcsXxSqNqDHRvYWhH4fAjR0ZDtz9ikcqo59OX3lQMVWv/fD1J2mTAa82dU8QjikaJWFnhgNY7BL9kxc9B5zK91Ew8cDA7L1GaPSnIemx0sHegfV/tpNkTW0MsUtr2jDIrmQtUwIvCHImDIeZPrCAaGd2y7/DRl19b/+APl1x3zQm5nsE9b6zo7+rs6cliujcdNVYcTtTNTubLRl11ecGCHJ5xrMqMxtiZtcsStJCsMDBhwex+cHD8Mauc1foPGZoR7Br1fvSCRHH4YKDxPEeWMJJkzb9xdsG7cXbBQJd7fMM6WkVGhb0IyPe//330ADfYBEJ7o7aZFFwR70/t+yoji4aVSUFD4j6qffFiyUrv/VPM3/+zFc7qLaZmFltn5xZfA7+1+np9ZNCZ1FCYNh1RFnnxGFpDfSE14jvaRyxbtD1DJh/WaYYnkyr19hQvmOrUNiTIBk319w0f7WxsnTFxgj0yam7fPQRdsBsrzwGL3e9cVlxmzp9+ee0nrp1722dPKAyktr78NFweTRMzIzVdv39bYDQRC9TEpkwptU4tiEduoR5ZZInGcLnsKBaDJIwW0baY704kYXXvNspOuKvfPnVudHZTpqDV6aGpfoO0W/JsdXbNcZHhYGW1ofxtmAu7cC5cHYKdg5m4KPDzP2xluRPEVRdK+PhypVBKcsZ/wlT5Tk+u7Wg6/NhbJRxn3S6cuDyfLrL1V2hu6ZnYPBCtSmetTMl0sllvd5fx1mpWZmaApRbbCeK/qBFnDHzeWGNs/VDg2U1FkGqaVBsMB/sO7X73pRdJ4lh+urFp+5Y31+3EtUilUiPqwMHA3xhJpXCid+3taKl3vnPzTDvvbHr5nx0HDtIrdIZ82spD3oPlULg+nisHB5lMZWRFI2dAlDILLAuFy7INOXAKZXN0NJ/OF9KZQnqURXzBCmZb5mWImyMT979U8Meayn1vkucP4cKFyoF8Ci+kpOb62OWxa25Z3TeYjsBQgYFS8A7mjhNEm4sMkWh3Kop5rFhLx0SnB6zhDclk4M8vaf2DSGYxXjd86uyzzp5+IQUcmyWXMDU8prf/qXUP9vQ7W3ZHq5LWBcuy2aJn54EI4X9R/woDlEwwGcomgw9uLSydMzTvpEmNE0rpTHn/pnVVTS2zzp79/S/MWfbxFxDepafPcZemUk/EgVxFq6Or8+4vLQhG/dteXb9v61bcoGTcw0K0vaf8XLvfWxdummrpzmgpW8oVSdb2ZgfxZDRMdEOL6GiEetdGfd7Uadcvus4fI4iNp277ImwPmY8M/GX/hmHb27hqa76tJz4z0a3nD1r+ueRTgjmYjLOLIsYH8wMnj2cXeIpTiMElKeUbd9whvSk+Yqwwv3JDJTXBa9pChyAgnNM0M4Upgo3WcWs7/s+Ixr96f39Xf1Ezc4uWeT93yT0/eyT/yjv2O1t863fob26wWyMnR7yFHs8Gvzc0NOhs2hkbGTFc9tIywiJfylaQtNA/UC6OZBfPCCZqEtk0K8NCd3tX68xZ02fFhoatvz+9Y19nl+HVqxNRmQ9YQssaGs584OIJy5fUDBxJrXz8SXRdIu6rTgaK2fIfNhq7rGi4OdE8NT9h0mg4Zg4OeNetSvZ2+/yhQmdnAKfVHyxnss7bK6N3vO+2oebdG/ve6rL2H/UdPlze540ay6Ze8uL6lYXhCOvQZHXs0jPj+UzWqCKXqpIWi0IAEZZgWDaYA6fR3a6C5ZbLLvGmleVTWr0iWtgbpTCQXg6ZDVwQ90CVKkXOWbKUMwcNbXhHd2TTnjSGNxwvTZzu7esvvr5lz7t7D6/fdWj9zkNrdx7asKfD78R3bEKhpAdGiTqURnNFMFOO65gCUfbelwgF6qPPHAq+8W4fXdc1JgJBX3poYMPrazXLc/uN0xpaot19ma6eQbwVBp7xHhoaDfhLF56V0JzI2pdXj46ksDXVST97xOsPOavYDGiIGWGDbd9cwUrnrb1tsdwoHCnu2MLKbWjfjsLRvuKh7QWfNhgIeTa0v7W9Z3Nb75Ytne9u7dq0tns1k6OuJedx8gRRV6zuy9g1paGtdjkl7oTimOKPcEeEBnYJh8SVGLsgl9yDK/KQE3dAHavCVYaF+CknjAwE4Y8RYAWAkXEBlMPoHe1si8QiL74yXM7TWLlpbjEQC8MCH2pFk/QtejXEPS1edeZVMxpO8oaCHlKZPZ6BTOqep/98NDXEWol0f/SGIMN/Ej9qwqmRwm/fTs+Z1N04oTqRCAwNF3a9u3nBmSdNmBK96X0TfvS7He09A39dsQpSi6XycH/qB187K9ZY27m9a/fmd1myJaKIlaf7aP7POwNOMhJMhEhtHB6AQCTXnx6injU46Jwy+cQvX31NKGj4o05u2BOM56c2zXx0Fc+BwUF2gjCJuuknmKqHqkqR6lI65ew7nH53b3ZhzaiTPRSsOwnOuNxAcl12ybxXXFb8xN5WkkOxhB6/qHW1w6J0cUV+DWgf9//EOUBduGPEYHCiSk5puC2Q8L+yvosGtLLVPJtllUioVS7giYr+xNkolTxWaefefY+ufsMfVNk5pdKt11x/3enLfrTir5FQSEZe/J+K6fCGfKG68Jb20mPvZG5a7kvEgz5/JjU0+u7bWy5uOftTVzbc99iBnt4R8QipaNqN9YEbrpyu2aENr7+FMxKPh32GJz1SWLHdOVQORiaz5vaC0tBwzOuUWdadcPIIq768WfrO1R8+vHPwpTVv+yIB23S8oeIt11SzHZHJEBxGQmT7KidxOpJS9apJpfQW7KX+yrresz5gZAc2h+sXwgiRXhYmLMZJTZKJL84xvHLZheiKQoYycQUFAEeEpbZUA0Iki2BxBaKyNqC+8AJ1TrqFPLSkmZleJ3e4q9ywbT96ww5GzVg9NjWE45ZLZ8gVoz2pUCyzVNrT0/nYmleNWAS2lgv5s+efFPUHxdLLmkWssJv87U43fyJUShb/vKN8WsvwjNYYQoeU7NzUtnj5/CmTI1cuqX/kH/16gIs2Dtp1l06un1Q/1DWyZ/MmMnR8XjxUc/+As+JIxFcfNmCi9GI3NA7XNssDUQ5GEZnJEhHXnlv79tPr35BZ55S1bOGacy8u2NZwJiPLFUjy2PFg2dB9hL6jdQWdnULN88bm4Ts+UFMc2e0aN8Uu0atIF40rERQm06kSM9kDk05BQeW7sGlNij0zTIJS3ED3MSmoRpF6VCMoxTAQrSZLCgAsdXZgj6Fldx7Ks1XEWCYbTSPs9Bwdyhc6H/zm+zN5tegUBnoWTK/71VMPBKpl6UwvWa/uC/jYRFYLBMRCEAQtunNdEDYXgtXhgUz50W3mLdFMMMBS1jsyMHhwX/f8RXUfuaj+L/9Moc6o5o9YH71iluYN79n8ZiY1GI5IwlEubz2zP5zxh6PJMKiypPYZpURNnp0ZOehOVtuyuVc7xefZGWye4ORzwcEDvs1tB2+74huHR9o1NB/IeLSWWMvWd7bnzHIiVgpEzEJO39me7015wqX2XLrXF657L7tYfPgDcBV+wi4soatSYKaINluk7jTnHmgI2WOHYoK6KXIuWAo7OHCqUgfDPu+mvRlxRzU73ojv7rBhduuvbz1p+gIWP9K0FdDK4YefHW0bPBqoiaK66QD5ohlWd2aukINfShdJlhsjLbwWa+IhnJ8IvNxePHdibmaDjqOGpt+z/eD8BbVnzg7MaDH2dEtS8ML5yflz6p28uX/bdlYDMoE9zoHhwNqhoL8pjNQTs0ZdhJNFghjM3BLJHhxecg3ziGAokps2ZzBehf/vJOv8v3zqt6u3zY6E3KQRrIzGLsOmI+9WT/bbuoUSL2QjqTS8zp05IVdOd/gijcISdXCi2KIGsjL5pSsopV/3jG8JfkhBZQS7jGY0uMBKDP/JhZD74lBLIg8OYzl9GEWz/WBeGvM44Zpynt1kj1EIpV/atNI2DXmobjSuhao8sUA4GVViQlVZetHIGXPn33z5B/EWYU5/auSFjWvYpZVxroyy7k8E8+nSM/vNW2J5PBwcp56OnkK2HIvqy+f79xzO0tDFp1UbEf/oYLrj4EHcoKBfT0b9f9weMAN+9hJhbdnyxsLp2sZMqWyHvOGLFl4RZt+BlbZpT6qbhH8aTLJBhcXT4nV5c05h9fZVsluP+hSi0ZOeRF2EccfI+aIsW1CpetvB4tktlpU94vWeztQHXxjpsgsF63rQrk9MC0RppB0JdvKRqBy5ZTqKxjWjsv1SeSwpj4ojVilmVKpx8MyBh2ey7FxvIeAc6C6JHBoo21I+Z+dQcqaRDLUWh6KhOjsw3c70xky8ENMSVx5MRaKRaWtKfdOFs072kMFWNk+eO7cqELrvnyvCobA7nUCd9YYR86/r9S3vzdWFeNjAkx0ZGRoYbW7QF8/x3ves6TGcZSfFGJi+7r70yBBTgnSvvUP+zQQIm0MkMmD8ZKrV5QhA50qFmy+59bwpy/cc2YvksyKtjtaYIAv6aonB8Adjntr6hkCV44tInlPmoC/QmCtLKzxl7njDgErAaVeHJJ+b6XY8pnyxstpwGcgmCaKJskVjIOiy/6cYTVG0OYxmUPAtOHPHR85kqskFOMMPh/sDAPPTLufM/EDacnpH1Pg72kCHN+4pjIxaX7jklvPPPNfUCnhy7MxaJaLMztd+f/+BgV6cG2nPtAOG/28vPv/t3/9ai8e01OiPb/7ytKYWie74JUjiHvRvhP2FEf+q7uC109PIAc7TQN9QQ1V89kR2Mu2qiD1rcgiF29N+xDZL0apoJOx7frPXDrIw8mN/4F0kntENwjV6qWBNSkz+7TP3/nHlQ7ik2dH8M3c+5nFYkYukYeaQoXOmnnvjR/4rR5qPLH41K6OFYvpDr/7u1Z2viFtqlGQl5xiHuvPEbkrZPjAcQ1XOFL+OXRJKx2gZY6FmuAtuBgF/mdsMCzEbijJQ4l+T8cUCX1wO2dEhXSHVb5mZVCEwiiUXrW1nR53ykBm3a953+dL79n43X8phBnEqS1bx8unXXHfWsu88+jCPq0EUZDHFfOGgVpcMBYJ5cisjIRIIsNzKCRHkKxiyixELbBgon9eY82gm6o21YqkUqYtp9VGztd6oYWFSLvZ0dAFfn/D1ZT1bcM1rMdc69gCxtU2GAIawM0I+ZTGU9DdMrw76AqG83xcyUNxEPNg6gUeM8tWnfeSXjx5998BRiXghs44zr7Xusxd/5Pk3XzOqmYum7iVq5u8f1Qol9iz7y8UC+1V0DbvU/h8PuQjDkHcVrxeNIcZQtl2YGOKcGCxmGQtuiEFRj2vBC07EukjISWwK9APAwUm5mLbLhZGsr0CgEaxMOz/kLfmNRNw7khnpHulhbw/FR5slu9iFgdaNQHCUBYBr73iCBQ8IYRRVAhjbsfhD+aLsP8vo+iHV9a3JLx1NGdv6jVPqiuy1FbK5crEUDtgtSXtKA7hYiEBmZJh0smjEeK7NW8LqK3GWGSlN6t58XitruWIePSLBdzVzGVEcfVS/MBosGf2SUy7YR3oHR9JpeAAc4364x1PMh1J7qrWZuUA8L4zWnHQBV9DxOiOkPEg6FbXhNBZeHXBQCZKYRmGW+OSS3iv+MYyGPBgMB5lxrg6RohJVAKijVAxVxCEHVmVWFDO5sKkCs9Q0ce6HDTsuQYt8lr5AXkSlaDm5Qvnmyz649LSz2JHAg8QDndTU/OVf/zdxcJm0Fjsa5aWLTv3mxz4NYvli8cm3VnUODbpKjdw3LeTflgotqMqiTPE62eLyOFZTzJxYLTSaxRLbsWTFFC3PWgY0ylNi8igOXTNL5rVOed/yD3psD6M6d8rsVW1v4O3ZrEY1bevBtq9f9ZVPLLuRjpSesepiLabVjgAp2VLekVXw+FAwRn4g4IvgImE49Tx7wkUn4uE5M8JRjKeokDF2SUv8c5ku7JKbMunhLz+y4OYcJqLOucAMIOVJpoC4zyx1xpaYyr/2GAEy5NjYyBcJ4qIhZKY6JvuzXnHcTTuTlWe8FApMorKZt1e9s/6B//ur1x9iouKiDGUzOwf6/Ige80Tk2qmNJebUNbPeO3HGzFNnzrn27rvQUS6OWMX2lK8/65lI1ippiuQv21Z93KlPGixyy/RQyJOLRGy+q+AzIrwPRUiDXKNk3XfznflSpmugG5MW88WYNxKMFiMR+PnTv/7H6pc5oXeAzWL5Wzd8Q71bBesis1bc/DKxPjSpU8775PUFIp3yFCV6hllNrifxaDQUPgbsEqkqqRejqPUHHBhfjqBQkCEYotL9BT0OepUf4OSHsipyMnZFhlB2fJBMjILYEiQXBUQybrTcGwgTXtSMUkGcEyYHkyYaSBzc2bF6+3YtHgGWSAoCIF4N6FLRdnjQ++k3Vn7jp/doft+1F1z8+euuhzY0LChwH/nKa/6jeaNVZw3tsCOOqqqJ6bEg7CGIiBkzq0Oedf2ILdIp4kk1vohxhA3f5371jS09251c6e/f/LPPS9KQ+JcybSP61lSbrBvFajjFXCnvFOIBn+wIuPEDy4kE0GJoRnZtDbMgpsid8/CaKSJFxYwx5ginYA2MGj+krFgnCgKJJloEEAcOMmXuuh6iIM6KUj2IKDxSACgeRptAqY4mlpxyDlrj4+3pKm5ate/nS36TK2Rk9YkK9ugxJ/71zT8z6v3kSADjMcCb2S04S1WCCWofU0vENaIvaiYJAbKKVV3y7fV258jUx0nLkyxj6ZYX24inQLGcYlOrrJX2DXtkI1KaFeKEC1gPjydSHa7S4uQSsLcAD8Cchjnk6dJgUPpWVcDzmVXP3v3ZT6UyJ9EECydc0upE+K9PPS5UEHIoeVEkUpES81YFPiV85RLB8It68MjiD5oUP8GDRS1FVAV2CAYZaEnYi4oQf1llY7KnBafIkOTiuH/NFHAXnWQNkGWJJ0AtUBUmo5i8wsDb7/71hNpq7Lwezmp5WvOnnMFMXSrSGPb6yTNiKJ1cT6Sc55lZqScLGUSbdsBEpqRirgiamGkOEQnbSluhBWfNrm+pSzaGWOKec25Lc1O1NxwIl6ylFy/JjQx2buuAVKklrapwjFKcdhbJl8aJ2nBdXBvxIaVpNR6qfUcL+AJ/Xf3ky+tW4pPY7IL3hRwyTC2tbySjhcOwysqzHMCYOQTQPPjfeDU26xSDCzjL6Fj4hs9G6B/byJYmXHbZxQkZpePGkH4VWUKaOsalaewCv+MQusfPEAYNHpIVGZI7QqDMc2S2q7MbgdGCWS3JboBHqzOD8agjGQbItPAvPGE03xstpXmCSDQgM1dMv7BbGhG+4FuxNa/6A28c5G9+6ZJ1vf7d/xQjqXvCHsenbTfKxQySb/hrFs2acPtNU//rwc3IjWKiakTpiMJIsGj69KC8BIt9k3LKayR0r6SIKpzhnByCu6/G3z3UB39hKxMP1aN1JTV/lRS5lme1IRJNOIv4n2UjKGo3SkmLjLHwQbXlsk6Kxx1Ciy5bsfwCNb4Hg+RSRIG4sAIgU0bMI26RPxy3yBIwTLYocirVWrFZwlEXLj3jw5efLxOFIWZH3q93Fzp+9dwfs5aEF1xp48dfl/Ylc2y/ZY4I50Q8hNGEetg5NdEKZPuokfVoJXPuzES55PnGjzdpRKVkRD1iGgo5bzwGrFbs+GPA+/yvTm2ojXT15YRHjD5yJAEOdKkn1x43wl6nYBT7jNyehN3gCTcXPQFlhWVogdVJBp3ZMO1zN3wCtx5lIstFyyn0G7/+06O7D7Yz2e2SKCIajvgsH/6tXuUPhoVdSimzWQ2nJVyhIhbiTivnQtYfmigQzCCclOwvbuANKkYTpSOJWOKQBRIumXTuu5OUSkH7ILUEL2we6/MUI347l8O4Qbc47tXJ6J23fvF3L7Wnc9IBnGIj5cPnXvKxZSO/eOHBsD8kvAYjIY9vUw87WhNvQhGGiLIWGrWGmtqFc+ZQmfckOOaAbQdPbNQHejrx5q++bPm8GRMffOq1Oz/7wU1tuy9aegbNfP6u3/QNZrKD7SfVm7WRCArJ8VTZDts1oUQ8Ln6mZZi9AZvXBuh+9Hgx7S/t8cZnpkUildpDgNgA+9pV/5VvOLy7fzuvWxFx9zitrTPuit90/Re+DXFOicc+pO3qiOPVSkYgybqH3XjEEbZiXDgxCzzXJUtw5BJ+IqY4SdTlMRjXoYanlQO1Bjoyxkp5wxVGgv/ubepwDpe8gYhjJAy9qyZi92eooeye48TCgaFU8ZlVO8UJATm2lkvlpnhwRkvUzmZytOtKOuqMXVs8BNgpayV0PUTTk/HW1u2fT6cf/eHd8uRuYU+h/YES2Rjl9FuHssS+tu87/Imrl5MlOjSamzljajZfemPVOzwrR1XDzHyHZ7zDcdoJTPqkHplF2ujabdv3d3UzYgwh1k9OYC0zyEcEulTGiHJB+Q7whM2+lftfPjLc7r7PBq16sOrwtdF5rhhhXZR51yYkyVUoGsk6YcWYlqjwR/FKCB87FIRwz3WoDSQcJkC5mzOJ2LpLcEneYNaM7dmQ4CRrSjSEaRuROm/2wKQqa3c3/qEMAZMNdcYPM4umhSQCG2wBF9OXnnFBQ1Mz7jnX6aVnpP83Kx4czI2IG18gYabkSxhaPWERf3tX+9JPfTaMC8gHu1XM4dqcNd1/6UlBfPB9e/flc9nP3XDVLd/+5fBw5rLlZ3zmY1ev2npgZGSU5I5PPJpq7x8Q2vzfp2+YkMYoYa9kpSFF0bZQDGc9hTkTZ35q+Q08PyKogqymzZ4862/v4BpjNEVy0fZmyGNjKmSaUdkNcDqTk6SQlkKxZkTB9R0YJPJMaAFBVtIjrzyieNyOIP61eKtKolVvgqUaJUFHia8oUCXQwjims+uoEp+omVoYeH1aFW8YYTHGtgt8EYUFmPj5rGRgOUgSSLTNVDq9d/teMjlxgYg+fOTiDw2NDP9kxe+C5B0T7MX118tadYrMMRmZvDnaH2YhIz0aEh4hTipbSsyyYvndtn0nLzhx3aZdt3/2QwtmT2fJYBHSF5faRj1n0OwMHgxVsqvy+1w8FC9pUpw1ds7tOy6+jU2vtzatYSHOPatQml03rWyThsgejAAzJrmAqUXUMMANr5/9EhTctGrJ2IzVz4BFx9glPcoBf8TBUDINDnBPnasy1LghDliDmhZkUA441BSpxIirZbt73fUQDY+RnDBv3yZzRm1RojL8I2qp1ILh0XOZNFyhVxGWQpHl/9tb1v70/36mRdWCJZub0NRSHU4SB0Hb0TmQrGY1HsDlgX4SeX1Fb9gsd8edomwMOl4dgQnYuM5+qP35n577wxMryd295/dPTJ/UNJQpDB3t00irIqBYLJG+BYfloFHFbJdPMmZykf9CDg5D2Bt94MU/PvX2k6R3iGeZK5952mn5PMkLaVw0IGFFwigYTYbcxUpLfJ30Uqe1qmiyYds0G9QIcUizEKEC+i63KLJHzF1OyOdQRfgvHovsgvPjqgiQYdmGBw2guwdz/BYXLiPDFgoZNRNP3O5EWqtK0YCZKZNzKu+S6R9IFfNDD9zxgTThHEUcqPAg/G+fekWrTbKxQy9ltqZ4pJB8fxl68Z35xf7AATGVgh+SQHYsdxlDkY4d3U71Gblbr9QPDYXLxVHbHo7OiKCSCqVDWsJrtPoWtBRRHt1Djo4AKnbSkPBU/bhfMvDwRdZBMIDXmJaC0ZBWHQvKKlwrhYu7D+2/7fTb22cRaBZGkz3TWjtp2z8Pk6pAojnJVKA6qcaqDeZL/pZ4/RTS2MaNITly9IJLhjOKVFfeTcoDFbzmQK3IK8ZwHB+Rgwp2LqPG79A1VziUaredRMMUf2JyyGyfXl3ccpTlLhtCnly++Jmvfffc09jKUkQyczzak8/vX3t0h5Fg4aAaQK0QJlXxAZ9OzMYfDUUkS4uAn2zWIQ+2k/GhL+C18B2XxNZWvt216ITwOSfFm3hNTbm0sd2Khuy5zY7hD3R2j3R1Dr+zgzCmvPsACuRQkiytQQ64qPfERHmOFQfA8JE8aKDHuC0KSSqQ6/KDB3+xdM1ZUa3WYbUNnR6eUti4ct1GliWKOonknNiQ91j5ZPMCAw9KVETlkKakkvQmzfFffuSQCcQhjHVICav4yzgq7j0y9KmIkydA7haXasMFIMzhMUKxppMKB3afNrm0pTOMNtLRYrhjPQNPPrpCakln/Le16rJ+QkDcZLQnF/BPS6VPXv6Ri05fRssMbU28+r9+9U0miqBJbyXd6mc6C8elb9uZFc3WBUsHDpUbW9gDSaZTmV//Iz25MfTgrbXh6vrdHYf3HDg0NeGfmivuLeKEucQKc0UhC8HSyMq33v7aZz/7yWuuoQjEtMmtD7zysJowwgs8knzUfGHb89rhiDaMl0JFSV7V4nEVNZN1Bk2dOpF9V7up9QyCU6zDx9lV2bJiGS3uv+TDiMgq3cA3WoiDXiqxDniF1wEEcMRuOAn6ZA8GoMoWlzyyJZ4DRSZh4wlLdm7/25mTMg+ti4osoj0KowsXzL3qwqWoOcDAE5nuHOj9341/Ja9zzDboxGqeW/nyLx/5H0lA8OjpbOZAuosImBBGJRaTZdAVTnEYdvmMmmxzXbC6rmrxOSdEjHzG9PXlSt6Up6q5sbq+Ycn59UNHDvKI12Izve9IWEZXSSQUIq7SJiwKBf7nySdfXbuOJ9lFVRVL9979fTcPWHUiMeWWuqaPf/iWUD5iZxwdA182mKAPPf58d3cfT+ijj2tj5oKmnOlJJiaczJYejbtRT7Z+iGzBLjQwjKZ5BJdm4dU4u+iUcVJiK+io0Rf+iKDxrZAQglVRscG9KySYjdPPaAs0TvCPzqwt7OwNObovHo396udfbguszpUyMisxFx77IxOWO/cW7n/tYW8EvS+eE3zoHO3Z1rdLy5IRIPyvJFeK2ZE+uSZujzBdOymem1bt1FaH5pw8v7Z5gp3qfHsXHAi19zttHd6lrfFJc6cuOGXPge0b5yRLswZzuzJhVqTSrFAwdqCGDO/OziMV1jvZVDntlWx41R1CZ5a/c82t6dz8LV09vN1aK4gjMHtq8u7bJ9102w/YdAaT0ycWYkbeW392uHoSwQ/xKKBQsBR2CYukUGlQiqp1vjl3NRqKjt1+yash/EE1hoWxogbjhtuBInetpSvaVMMjRtIDNU3J1sWF/Y+fPz2382gQfiWraouB9P9t+bNEmRW3CgRYyuWWaKu2y7Em4S2VtXKeKCMLCBZMrP2FEy7CUkUxmsiv6AwYrSe95csmZpsbwtV11VPnTUGtlBz/X1amtEAEM/vwi71Ll8/Hws9dfM7w0f0+I/v+iaPtu305jCuDSRdCpfoItbJZLbTTeCiDVyUbeMUcawJRDqVSIljzy8c27u4ckEdr4YZlTWmqvufDrbx6Aby4sGwG7wsptc64kOQImRYqfE97rLBFEyiNwZYV/HH9azIIXE2AXHORkWc/F7UBaRL7p01UM3x0B8cdIIpAiqKRKSDeIgdUtC56/7q2J8+cnHl4Q3wUn93LSwF0u8jeWIVMEvV5u+XFpy78xpduZ0tVS7ATYl6waMnDLzwmECLCiq3KFRRxhqYs+RjCaeJgV7SkpjZ4q6tCc06dF/blPGbhydXZtbs1PRFlLj/2av8X3u08ZW6qJmHNP/OU3Rs2TDHTlzaMPNldLY6jJImIlCk2qW9hvDop6rlC/sZl10xvaWVZIYJYsqY2TfJoHX6PRUQOKBszTQRctLcP8z2ttjy7NlN06utOWAaWQj7VFLvoSpwKkWzhv+KNYhexQtmQEokW3Y3NQ5ZVNVm2cZk68JTOFEtliKggKCJ8StlLUQyM0zTjjGDN7Li1b8mU7HNthPxlLxCfX00hIZTITiFTrptaN31yMxlbOu6Ip/zsypdhNDs1Ilw0JELHfx4ADThpLwpaBYO08+tHzplUDkUiE6c318RLxeGebYfS3/xD2gnXGqE421j5ofwXfrTxme/UxaP+hjpffubkVGb/4uZsfz715hDP+ajG+Rr7hRPSDYcZ+PYDP7nlqk/MqpnGRdkWKpkBIuXlonx43YXYbGa0LPCkjuVcckLaU85Uz7oiWt0CPEzhvkicwvw4duGuyGxw2ejaRpefNCMvKaAgKsJ1dd+TEja2BJeUMOVxj/vXkWhs1jk3bH3qa5fPSr28G20ja/pUPst2LQiCSb6UZ/RXvPDynd+6W4vwMglTa8hqpFbGwrIucEOj0AVszmcPBGT/QyLj+nmNqQtby/5wMBoPpYdTm9YM9o7oP3g+0DVAbo3mLQ5TxxPyrmsb+eQPs1+9DMETe1xfHyWwc/6EDMGjVX0RUR4V1qrRZCxFyHW2cnYM7rv5t7crtSUCrXVZT/z67+x0FdOZoixYZLWWz6p9WsupixXPbR0dyPgWnHEDO8e4z8gqTK4EJP6NXbjP8BMFe4xdIu9qCc6PnIIYfXCVjxorVVQ35J66y0zxEYfjiR8Ya7bMPX/jc431nsGTmyLber3eTOC2c29LZ9PgwcRigXzujHMfeeF5LVlFaEDzVs8JNwAAK0ZJREFUmnqSiSTuiChL0aTCAtAiIia+oK6fXFv85ILSxAQqLTJxcnVdQ3UoXmOEwqN24m8X1/rQmF5MqKvr2EkoEJWuNXr85ghbt+VcKhz01ifSJ04xP5AavXdLcO+oLHFdehQZ9CuxcV4voFezShL1ReajddTf1df39RvO3nGgx03sREhPaK0/2sOCxT5n0oiZH4k0n1PTMge3jng2M99dPCuuSMNCguKQnMsFOeCee93lp7y42b0h946DG7/onvAOnHzfjpHDbxbSR+k4nx7Mjgz29w51HCGFJb+nP/in7a0TGmovPHOBxISVKDG5Orq7n1+9juihXOB/U4bXu1Qiq67ICSd0ZyAsDzvp3o+fWJgS5RU0uCLelkm1gUjEF456AhFvIObx8UYgEkskuiLqhYGxCpqZtsqEtjNmPlvKjA4PpgcGMuwuRvzaxh7fMwdY1CnCFT7u0KILvI05ndAKxOIEDPjtvkDM7736wqXxSFgC4tTweLP58lOvbtLN3Ofn762NOrFEYsb0iYmqqlAC3VVlhGoCsabk1At88RZ2jY/nlSudIkT/eogKBg2mw3/wl+WBW7wOSWTu3fWPzte/3X6krz+t50p6Jq+N5PTBjJ4pGaOE3kxP22D1CK8qxJoreyJzAuklWi25XpxjQHDm4DK98RF7or4rCMngi9qWNZhgKJZAySLA7olS6ugidxTHqBC74tpPOWGQ+QaCb+mI7rjyr1WgV/QwRk1NKAIS9E0eGK82EDuu+uU+Xl0g3Bg3Z8UHSbOO+a2aqM2+cIL3Bvgcn8duqbZbp89uvfS+WP0sGkBemQeuSoFeNyWMExSIUubYOhUBgN2ue4c7gjqGRFmYqCebUUYDe1489PJXhkrxbzzfuLs9hTkQPSwUK5aJtYQdYwPrsk6+K0wUTrklGCFxcbeugoC2Yhm9yQJZZYRiceGQ5DEzDeQf0PJP9AV+St/wqJUvEuCR68Iija3q+mSMyQwOaCQxbjJAkk0I/ZzzkUQDztkxFFNvkxvAXrCOK11BUGHiFgolqSCDpO7JmJCarwilP0GHSBeX7PMXxu9cuj8cr5tx5R+DVVOFXW6sQ637WMjIknuM0UKwhFOVDZVURBW4Er8C0ZKdF6F05Mi6Q8/fnCqF71676M3tg1qOR2Rd5YrEkIlWjiVjtbyQKxgIBwPyGiP5kK8cikZ4jo2L/kgYt9lLlsfzK9e9uW47+UjCOVrh9SiG8bGrln7oyuWN9TXsVajH/YXDwu5jhyIQEjVt/6HO/37g74+/+DZ+qBBtWidMaXz90V/SO5MSQuAl5kExVDFaNmTJ8+S5GT7InKR7r9+86/5HX9y7v4N1Km0qXGTMiDx98url1cnkUIqH7TK8qC/FJ53ffaBdGXh3ugjT4KAeabjuFM9ti7aEqydOuvi+YKxRDQ45YDJH1IKcsZdNcZCROjyqxw/i7Xraaknpril50ZJouJ62p7tfve1Hb81/antEN4cEIzXa5KzxMMPtn77mw++/oKGuCi4xG+CUmrw0+R8OaL3127+695F/8PZoWBLz63/5zZ1XXrzkP4D+/y/ByBu+8L2/PfM6rxOF0XOmN29+8Y/qzQ3//zr/dqe3b/C6z3/3jbVtvK/FRZhRn9RYvfO1hyNEdMcORo1I3se+9MNH6Y633ciYqPnFD09tOpFvnj94/SmpCZf9LVY/k+mKjIpXppbgbAWIYsiLYmBcKoJDA1DuyrKrU0Q6mIiWE248yR+tnhDo0rKDSo3K+CAnNYnQsw/98K6v3DRj2iTevcUrnBgYJVDU+88Hodsvf+bacJy8Ywksfuyai+GygDLPEbaxgPgYmcd+5TYAChSd8tEPXCg4CCJgxE2RYQUjX64EHas8dqaqq85su6G+5sd3fIYFt8ixC0By2unz4PIYmPzSBXuvX7zpah+pVZV2lOWgD/KXikNNwd5Q/dxAYhI+mIKXlYdr+6UoeysUhcnHPZVV+dtX6pmAsTefo0BiNZP9NbNPmbjZ4MFX8HJnWrl015c+tfTsRaLiRZNIc3y7N8dI41fpxOPK7JPBF7eVU+bNEAgUl8gJRsuzZt3mjq6ekkl+GtuBMgDERSdNaHj/ZcvGITlBCagmx2h3Z5hcEuXOuzseffplGmGGyStM5M3g3kQssmzJaeMhSUBbmhti8dhQSiY0zIPhly07Q9qQY7xlcRbOWHTihUsWPf/KWnFSK+MiaUANCWd2QyFQvygUCqKRUAbjigGNgccNmbxjxl3oiaZz2x7/5orbDyzgoHJkwpktiTWTq8oHBgxCkfQRTUQuv2CxqiKwVDl4uGPl6vUj6XxqNDOcSo9mciOj2aDP84dffDMej4Gu2/7B9q5iLi8Y+4wJTfXuRZqQTm3r1u/dt2F9G/pXxFUMEds0hYsuPecDV5yP5ALsIkaSSuVUDZJqREZL2vF4QOBL37+/QFoxZotrEOg48arYztf+d0JzAyJPmStYjlg4ODQyipDQeF1d1TlnLHSbkm+3JzhBA17vFz/+/hdfW8cWlyx53XuWPrchXxMz4hPlHZ8urziBEA5pwT1UCWpUmFShMr5klAcuRZ3LARgJI5GmU6ti/nkN+QN9MTHBltk6AZxrZXao5oB7+NHn7/7h/RoZfxw0yMc0Fy6anSDdS5lWBagdbO8Wb0weTvc21lfLReEpP/wxqcJoJistoOgpyz18Qr2+OiEngI0dvHNH/D8huHKRm2O3yQD1xmJhHu9WaR6qjiQeKLOvSkAyq3lhTxx/W3wMvNLy2SfPbmqsRfW47UA45DMq1IDM8xYvOvOUOW9v2IGDJPiqAThzciGYaPInpgHm8opa7jNboHMsJUwNQiXwD5y7ZMQpIbJFBUkJU+9iY00ZqJrujTYvmjDwTFtUaDPNudMnopSVha1Qv2PfETYG8RsrZcTGlNeT3f/IU0Mj/PGUAkacLN631m8DV3BPRKK1VQk1VLhgsmJMZ3PDo5kxY1NpBh2ciMkjVq7IgBjneZwwJcuKve4dMSmMDiJHp+6KsMJ7qYJGlfdPSDuAwSf8Qp7fiIQpC6cd+/LzEUw8SOEzcsMj/fv2Hzr9tIVK7Ij9+W658X1vr2ujM2lOthCt+Q3pQN0yxxdHb6Ai4Cy6jqRcYERriTGUP7QjsxkdrbBxR5Eu5KiIEmcydNIsIYZQ/bx6/+MBo4pNfNi0cO50ua+aACSXze091CHO7LHKEhncuOPAxq/+fKxJfuVhda6TtFJfFY3HsDxoYnqXQBnvLMhkcwIjMiOYyOHwDAajK2IlJcWIXL6y6a4ugAUfsYcCzUOYhpdnucT1pOBSppJMMllijPCV0ZH2eVAmGY+yBYLLlaiKLj1rIY3QEj2zzt697/C37vn9y4/9DxygZUTqsvPPnj1z8q79HZJQaemTqwuN0VKg8fQKdYJ25Z+gLaiog+t88MaJuyvSjqWEua4STfNQAC6tpN54vNEJZ5RyD8WNXH8pzu71wrnYMUW02ibv7ulv7+6rTFV12e2H6aepdwC6ncq39Ao7LPQGSyG2il1whGhwKCWiqp4skuoKEM5UkfIrnVUw5zyn/kiP9O9+BFrO+McsxjQ98cDdbBBwzjCSaMvbu5ipU1snkuZLO0KvSL+ejIUYQOLRp585t3VisztBpWdd37x9/xtvbVmzbsu5i0+lLkOAZ/XpD196212/dXw8M6G3hEc1XjowYRGb4GS/UVe2PiXBQ/xF4BFzKEAhuxbYTQkTeZGVjHqYixtgQ1EE1sv4EbomMMmLSnUiyoBWVcVOmD4ZKlx24JzvO3iE3Tw6EXrlOMYUVRy7ILxTtyxzYlMdqglRqQDoem//EH9kRAsemxYKtqI6KmDqJ8/STlqq9MKvnLolZb1PXjAbZtGbHGO/LNYgkwtj9VCPbD6IJrx46enwgxeqVcAd5+0NW8n8e/jxl5aec6pUUUuP6646/+d/eKy7d4hGxSWQPuQBd+aEZIyTaDueEqbewUhFSQlT8Wix7IKxjLMc0qjMQhl2F0V1W0sfWZOxoulSkO366RMbWMjBaKmmsG7bfQB0FWFjFEubQpK0JutfyWCUPW3VF6M1uaWRvoQEaUOYBKNlIo9dkYt8dB1RUoAUBZZzfETO1Fwd686FULddGJfLclspFrCFI3j6HFCOQTp8+MgbvB7Z6wklosvPOUXkRh0wAQW9oW0fod1/vLrm0OFOqtAdAE2N9R+96nzyVWi1O8fzk5lcXxuV1Pgp9ik94w6nWwYZpddsiUcDylXXGDIDeICdMhEPVjPwRzzaYirbu6M3n2QfUDMLC2bxhkk8R6h1B8Np232QKrQpxFfmPAtaiYQxorwbCBMfDfrzJYvUObEmujapuR4UxKd2D8fu7htwuSz4yEXFVI8ej0aJYKAExgD5M0yibdV9IQQWcHDiAlD3nQ1bR0ezLFQDfpmyzFF5aSJxAFjs82EV125s+8nvHz3Y3ksjJ8+ZMmvGFHdC0wLgO/ceOoB35NWH+oafeP6Nr97yUVerENu78ZqL733k6Uze7BoN8Cbk0c51iRlXkDCF9WM8wEH4qba43IC1rLRBDPeOAWceMAPgtUsg0HJG/Etqks7izQ3sKef6dg2QZA619snzZ0EnYwBaQPKiyl372xENFIyE6JQXTgb2+y8550uf+hDTM8rTmqEgb3f94a8e/vl9j2KwceCaG2tBwiWAHsuGt6d3QHoFzTGWCSs9LH39LAbGGQG78sSVxmHUpNbJkOCKogF1/9Xv/c87+OPstIqXJo6a8BhxJiPKMOg3g6LjFa5EXXLZS887jbeu4hepcYIoY9+B9rpoQNLMLPNPf//Hpz9yBbEU6AWLWTNar7zg7L89/nLaDu4fCM0daDPJ1BY3R3rBtAv2MFpcFwIYwiLRwMShZLNDHQiFwhNrJGEtqYEdQeV5jXzv5lTW3DNANonD08BzZ7Yybi6PyCjr7R043NnDsFADiRZyadi0L1pyyrlnn8IwMHf5x1upO7p7XUnkvLaa91TRSMVRLfGejb5B4myoJneMVXCdXAFvNBKSIcEvljGUIalItBJqgMGcx9zkgC7ZQjGwh+ICqbfhIg/wSB49KSl7QLo5dQAQZO1ANHTBuWfwPiwhBwIkz9u89ILF5551MmuuwaGRgaERxgBPxh1Zhuqm6y597NnXCBZt7gpckmovpztD1bx+EFYJBrBboVJJCYOlisOVRHRUBA8mig5hCpAURo8SHGHPRt6Topf6NrcP+fvS4m/W1SRYE6sgqjTs130HDnUMDowwhNyV0ZMJwpeNHedVzgij2zHMOnjkqNBv29XxaDIWlT9ILQf3nWwuf+tN13z8mkt58l1SjlW0FuElaNvUUKNeGSBg/IcjBVimNJUMK1EGXBeXSdKTrMLhtdxS8wvWM/bcgL1yjR8pCZqwft6c6dOmtPBmN3VJvoBB8hOJWFUyPnXyBPQnmCPLCoCkb3PRgtlnnzbvzVVbth31Z7J9xYG2RONsxRB5SgqNQQe4OfATLqOQXdbLLqbbr+pDKBk/FFaeUnagNLRn+9GQjbVzyjNaJyTivOYW9kk9hvrwkW6eL2loqquvrW6oTfJdX1s1oaFm7qypvDjUZSRd4iN39g6KC0hSWZx3cchL1I/15TgL58+CR+6VMcYJPki9qGDOlCs5OprZfbBDrR6Fy1RQE7ZSDzbxkucwbzdQClBVkqruZHWBZF4o7HGtzl98CsqEN2O5t/jGnWWAXXgRHHFVRBxcE0f7zOlPfuiSN9/efHDA2zXsbexeq534IcHbbZQTRYSQIgMrXfMrCsttFCESYKXOueJ6f0j0SOf2fLpvU2eViIBpzp81Fbst2Zvq4EGp8889fdk5p0rQ2Q2TqkZADlkeV8HRaPi5f77b2zMgalF3eDXSgcMdc2dNwyMWXDgQr7HXkQmKgpPgyy+6VUHIWi6dzt710wd27j4ky0t1AMdgAyfMoIpSiPy9CYWFXFZU07z8c8+5xYkQH/QtO3uR+0c43NawmSteeP21VeuaJ/AXzmoa66praxK1VcnamirCeDLepERkTVbkc2ZP2bm9fcfRwIn92wu5lNcXEW/1uCdUmJO0Ke+IEPXo8IZzWTKIOR57KktSwlRWJPoXLox2rh9M2Xv62GgAU+ekudNgn6hFdQAAe6GWSxJUU6QIGYpHcIhGeAXfqrff/dY99+Nnyn1dRyq/8K1f/eiOz8ybNU1ilTzfwM6ILC7ACv9CQvUSNmWtIWfqSpG/q3Lor0+9snX7ft6r7woL3bEwadu5j+nJkCidY7DbwJtLZYiEuQohOlXjqUR5jN2muWDe1IXzTqAjyBe5pVHb/t8nXnrjtXViSDmwaD6D+TF/zvS/3fcDtm5BlbbC4dBH33/BHZt/t6Hd9/7RzuzAvqqJp0AbbEGH0Az615VUpVLEXxK77OICuyvoqAvSK/0i4H1b9g8EBrO45cI93CSZUGPOFlfgPnRiu2RXRLGSu+gyXqcMwbzh/OkX33zw0RezmHX5s2ZMdhbixrbdB9930x1zZrQmovLgDeYIjkpqk8mAYfmEufxX/JapK0PLpheBPQmnwD+lALyew0eHLv34NyBBrD7P+skWtRc/UqI/gtw4VcJfKbjfUCuBreDjz/4Tl6gqEeMPiaDQ4Mu2PQc18gIRMlUVxmaK1pp1O15/a8PFy8/kRWc0gE4nNvKLPzy5paMnlc7V9G7RJp0CkjQ+xk7VkyqqK468X176Fo0h/g1YKnVOPAsF6jFzvXbmUNtREv1w95Bo/aFHXzjr1AXJRCX+gEEjWWoole4fGO7pH+It2919Qz19AzzCPpzKjGYLQyPpEhEMNIakp0LeGL3y2LzWtvOgPCnk6gZ5n5HaBAQG80aJDcGKGHCFc9LRFSh57OSHMKmYyj7eks6fzVEPl5ObIc3zdlFycWjK5ay4nUIiUVORWsUCmvEba97dtWbtVmwfzaKZIZxMpaG0pKMopqmxUWNI9T8/8cL5S05lTYAqo42JLdGPXLXs1/f/rWPE3zKwRSa5vM9ErB8oU3Tj0ahT188j6R4CZG3DAQri7rlvQKYrjyfXzx/lGN7cIdFRIcHvf2PNlktvuO2Cc04ld6y9q/dId19v/zBRN/FDUR0VBMUJlw99QrC8I0qpXFmeIP/0g9/mIfXN0o2mRl/3QKkq7p87GbfS+//6OvPgusrrgL9775Peon1fLFuyJdvygpcYY2xjjAGzGkhoQ00I4Q+G0IRASzsZmjJpOt0y7dBOEko6aUomQ1KazCRDKBA2m6XGsesNbCzLkm1ZkmVrs7YnvUVvube/c773nmSguZine797vvOdc77zne9827n7O2JEOblpQ/Hw5fgHJwn2BlNigHdeV7GkwXnjYKR3MHXrlrL3jkeb6p22puCbByJ331h9pCs6FYmvaPOPJ/Ba7K7e6Y2ri452x6RAz6ut9IeCBX0X4wR5rCwlaKc3OEE8szQLarMO585p814ymibumuzvoSckk1YH3MCB3AcK3zt86pb7n2xqqG5palzc3Mj2q8+tWuwPFH00kFo/1pmOjfv8JeSTZiWiwqOWUQUXKSJYfRaNlj5H2GKcLPZXMjhO9NLh4Yn0x5fk3KiWzdqOv/v8xW4mRVUComLQImL1Z+2awGH1hUDUbPcdZWvail98e/L4qejalcG/+FLNI/88TNTX555asO/YBLsVvvEHDdv/+NSjdxavbgvvOTSz/1jq6UdrKirD8eng4U6+coUU3GXNgacfqPigI7GmtWhkYvyJL5TtPTJ99+aiR++p+UbafeGp6k2PxVobi7+wJTwy6V4ccycmnW/urtr9HYKYcSzD+8HjDcyT3v+XkytXV3zvyebTZ8b+5NnRG2+s+fLO0Nhk5uv/MrDhqpKH7qjq6Zt+7uXJKIMhOEAGiAtOMFHS+GUGtfNMf2dXrygTEI4VCvNFJ9/h8/4HZ4bjY93Mu9GYjL4Cj20QrcLoGXkSSsqMPjBYZlcYj1zoPCeok+MdJcH0Fz+XCDoMCrQAKYPjhgE5c+Dna3ksvcu0IXJlO32wJFNSnyqq0/mmjLuuLXDPtcGhwcnKkMRNuve68IoFPs7NEXNveaP3h9uCj+0qPt8/zvr/0gaOb8YOHL+MjRq+nCjNjBw8PqYBzEThIjPJMz0TDcHooZMTi2r9o5dn0tF0fYU9OTr21L3O8a6Z/qHE0jq3sy9VW+Kd7J5cUkPU+2hmlh233qolHHiPRGfidmnwdyemT56+/Dc/G50YS912deAn/z1cHuBknn3z+sKRwbGb1oU5BCITrQG3pj1Z3pwOV2T4SiCsyYEEiaFEoONCGdkG+dJIQTya4Xsut6xiqns6OX6KGOIsihrpISmRJx/CIe61JqndlJqTS3VetFuqUFqs1bjlKc/+wVPlv7ttdfLZd8IHzrGrXuFsN1yXClS4gVI3UOYGOc9LZNcg1Ygae9ODzulfOwQcWVaX6TwbXd/ivHIw1rTQ3tKSGLwYLwv7khV2T+9UWdA6NxT7uDdhsZUrGP/lvlgk7hSVWrPRmY6zmQ2LnZ+LNcMWe5vbA2d6o9evLAj6fW11CJFRr1sbiP70bbu8yNdWNc2Wv9ZqzmFOLCoPnxvy7rue05CR5Qu9rku+B66z7NnJBSV8D8iz/G6RnSCqmh9qk3yyIUVQwVQ0VReMrmstPNpDSE58Bru4zmu7lZDF4qVnUlZixk1EiPnoJSLO7GVaeaGb4NCXu/u61IObZpjvDbc+VNn+eZGY9EC0AmkSSA9JZh/UJmfHLBKkQeWLKgNmXOBQ7drWu/49cu63G449+8PGvl8eKX7u3YJpYvkU+gLVyUJmexIF0/2FE912Ks4H1iw6I3ZISc8pJdpNFZlF5TG/5ycA4wPbvLc+dBvLUgHbrQy7R7uiL+5JXb/WHp6yCkN+YhUuq3WPlxaMTsmELadvX3hfTwyBxm993JtsLPU9+2qyd5SP3PjOD6U4kfDi+7N7O6zSsG/NAibvnV98kNze7u49mYhEndP9qfpwalWL7/y4v2fQfeY3yT/aIqcygwH/oZOR6RkOCNsT47GHr/ftPR63C2T96advuaXoH+fGg77JfvvA90N6yhrt5iu1nj/kOkHXCSVZKSF+8uqF6T+/Jb5xsRto2ll/zRPBquXMjzF6hGmkp/JlKM/qBAZahwFierQP5BcFhymxGJy5JU4xy9W6JUw+lMXM0fTI8JF/Tfa9fKLP+4fXAh+el9CapGcvbs0/rJcRslZlQ4W3usnrvuT1jVp1lTabQgs4VSiTgpJXlknFAmLlaZjMvGDoFU9S+kzkq6ur3KrbgOFiSotjPgKJg8ghDGnK4kgATjozGbyiwdGh5e8FTDsMwCTMA0sDwMj0DsFoigrcSILYVE5NsTsTz9SU+voum9lwNFEolMsopfwySIVG96FtqUe2xSprG8vWPFa94vMMI5Es52LFH5fIU7KLymwJIzeeDIlk/ixBa50gd0YM1AeGhgx4CGysivbtmfzoexOj/c/tCf78YAG72OhsIED/549ykqNRLDrswTMDGnH1zXsBl8v8JYc2IxKkrZGq6cKldvdaFTm8vMu45SV8qIbDL0kK16JzCAWpFmFusvjFwEoCP/wTvFSY/JFHrmxJBoaqNekCCpSkmuzcpLy6cvdbd8zevCIZbr61csOfFpQuJPyh2UGHuPD08SCQLLDYA3aFgRxLbbyO7NowWM1IBmjRcfSJqT9UjyYhI0icC/xAIps4sYmLwwf/aXZgz2+PO999PTQ+gz/Ee6UPusw/JT/7oM6cJBgmMSgWUc+QunoEceLzONSWvlb+lTPupKMQfhW3cKxXbPbJr17LdwCef6nfCsk5yysvyUeWuRozr9Mc48w4QQ7yC0AmSUbI0swyftJipM/TwsgCXm5N8wKM9ynvmtbMt3dF2xaWFK/+WvXqL8nRG0ZUyIuRFNJjB53OXxqTi3CNfM3AG5QSjR7NxxfhBayJoDUnZxYRLF4OgS4MgE4Vev5wbcMN/zjR8bN7Aj9aUhf7q5eCHRf4DqsXLvSVBt3ysFcRcssC6eKCdJGTKrCJyUYwev9bfbXjcaYuhW9sX9XKqbLWOA5hciI4eLAyflk+kSoqlOU+K2EYF8FIHn3DmZpw8Mu7loyeGXz+FYQlOVRavM1eeJpZYNFbtZYpq6ghUbdpzF+cTCd8U11FE51lOuOEvfK1VEZ3LOSbLwQTCDHOiaYLp5P2ZMI/HrMmotZUwo4xEnTt+65NPbkzXt3YXnnNt0L1G4gshi9M14/0UEzoYPiPDBGdkSfCNOc26PmQL8TJjDUXdxCldMlYlkfxr2XhSX1uBRBNJ4v0dF7t+kditStW7f/OD78y8lGfU1Wcrir2lQRcZgjIjOOYyhSkvNK0FYymgqP9HWsXXvp1Z/2RAQlhRcDH0WOVBBdr2hqrW+YuWDvVu7d44HBINMc0DhUaRUmxqlsyw8Co2vNuu3nRmuXVl5O+7WsL3/+Qc+dikY0NEVjJo5n1L/rL5HvT1pmm7TPEX5kZKhw5XDzZLUGlBdT1bl85c9uS4YrqBVUNzSF7psDCYM/6bfo0FuN9iZQ3FbdGIk4yY29qc4uadiy8/q+tYE2awH7ikehZehnVibgQlBFxTpwqQF4Y4fIXFeaeepGDSghegpXKUXSMDpnBwhFcGMYToFHAhZzi0qUEAivNTvWMHX3Gcaf94XqvsNoO1fpDNcESfisJck3MGb7oFS4qGT6zr+v1p6eHz71yqvyFo6UJGEG1+YxPTbr11ljj+gzu+OiHgc5XiyJD7OulpnM2QwWNTCrC1p1b6+7b1b5j6+qgzXzrQV+46t3/Hf2vNy68fjgeIWa1DLZUHZRn6R5TvrKm5PK7ouXthOrzBo8F+t4JzU7iCMurmrL017dFtzZPlS2+YcUdf19c0xKbmWKwaHtJQqCnY2OzM8Op2JAbH7ZmR5LTg/7azdXrHqMxquKKIhvfQcUl84gELEObkYyZmxNxqRfHI4mir4gYAtF45lPgC9NjHBRWDkHHVJHkJEQu/Wj25KJsZqR6cEsYDRImQCaTbGdWFs21JBwAeGFuSCdgmXikpHhkqGfv3yX6Xv94MPj9vUTjZnVdbaLn1q9KLr01UbPMl4o4Z94Mnt3HajTBqIzYRNIIekGF9dWbA3eu9ZUEM6UNLbGJkcjYyETMeeuk8/x71ii7bowLJMbC8nFMLpRp3TG75OaEHXJHOu2zbwTHuiXCIYTB6s7VmSduSiyscsLtDy657nFYVMHJKoSwr0tOyo60ZonHLFsW+B4hiihf/1ATMbdRJtsZqpMGpzJT9AmvQ50ccURoJpRBYZABENBCjy538ojxJpW3QHDDWxKz8DQcMwTXeT6wkBE6eGsuIEUEKBvzJ543dvIXkyd/FJ2e+M8DwZ/sc6aieGn00ATfS7dsSrfdlC5r9iZ7nFMvFw6cYO5UTgobeUv4tmS6LJS6f5v93a81X+zu+dtfpV45EYwRG0ZNB+VK4biOBVbT+tTy2xNli9LjfdbZt/0DhwtdTuPi2yXdxmrv8Vt8u9ZEA2WtlRv+rLR5u7GE0PZp9sHJpeyLoRBbSgc5n30jLvRU+zZIIEEAxPDKlYXnDyD/3/5oagZFpWdUTedQSda/NhOsSNO0EWY4jabLqX5xkLVNMXGGZsiSnS6JqQkyBx9j4+dHjj3rjvzPmUvuv+31v3aCL4BiSfACrUBxpmVzaulOr6TeGz5RcOoVZ6hbeMh5NeIvc8p477edwQuTu39clJHtTaYmMG3cuAtWe6vuzpS3pSf6rXPv+C4c8qeY3VVbwY6+3Vvsh69P1lcFC5ruoo8JFlUhC/FiTUMUL5Yog7oKrJNwiJiGriaC/XzoukSXNsMLpCmay5JVHl4+sqlxZGRLmA5HdCHFwCPoeb0Pgp9/Aa5NDaU0qmpealoWTussl4dic7fZjPOz8UoQcpS5mc8URwfebe98/pn6s/dt8f3Hu/Z7naIMs3G7683A+QOZ5g1u2w7vhm+mL3fbp9+0L3awgqa6zwfpo+5rh9ITk/IpZglnJbaYfUJu0zqv/Q6vaplvrMc6/GP/wDFbRSz9a6Ht3r7JefhG31XNtr9ic3jpg6G6q6XRisJdcQn9op5XJApcFlL+mFuRiV488u/KHCIvXpJo/hhYCbMk+XNtR+yCmg5pKypIlBcA80hm3gKSh1fwrKkR7DnLk8/+GW2NhQoJZjI5dfY3s72/mp0ZOtRT+MI+3/udnKORERuTGxzDrWnLLNnmq1/pmxmz+/bb/R/a8XFxFRbU0TN7IwQVtOgRfS0breatmVCpN9jh6/nAN3qGoF46de4StM67ZY39lRuc9S22U9ISbPliactOju9hc4U8PBmZdvy97GArsI142soPDP4+eBV5FuBKeJEMKUhHOrf8EDw/Msy1KQAwEaYbFZOi+1mBR9yylKnwmBQeaT7qpQh81qRk4SWWCQTL6rYZ4rMETtiZ2ZF4/2vxvleT0wMdA/ZLh+03T3iXxnKawxC2wqtf6S5cZwWLrLG+zNApe6RXTnvXtvoaV7gcPpudti6csIY7rAQL8aJCIr5Ftb5dV/vv2eC1NXiFZW1Fi+8NNu6Q+WI3xQ4N2IE2KOQm27l94kiEMSn4Y/nOTTOgR/M7Q9ST5XrtDHHScoG61YQCzgU1wDMeEUEjYqEOY0TBuHeYYt17Bx3UATKVTY5Kmbh3rOTLJ7k4QuEy+0dG2VCvKg88rQKkyJ3Got5gDl4rBgDgeWvgTT3x3Uk2E6XjY5G+PYmLb2emTjP9vb/LeuMj79B5a3yKMTfEiREvLPHKFvjKGug8ZUELjYxcsiYvWelpmht80BSIdGNtXu7cts7a2m7VVISskhWBxp1li25wCmVrA4M0tBf3FOvA2iR6Q72oIMS2Gj0Td031Jsc+/Ao8zpoZ8uXhDTvwQhb41a0TorIGHvwImnQeKVR0nS/VibxVgtyADhp4RlMxA1AgNaNVlxdovgLIp5v7pKpMfWTh1R8XeJwF+RaX+EkAXIlf6i8LT2AV3CgiJo8cjfS9nRk7hOgvjWWOnLf3d9lHe329o6x6IlC2KmTYXCWDd5laEjvDCsmiSt/Vrc72Vc7Vrb6GCr8/VOtUbyxdtDNQdRWrZOKWeXLMAqWBEhEQLQ/xyNKaLL3n2QGfCkj0w8Dn2TECNfAoJZou/Kq4EBheAPUjAlX8/Cr6LH4eySj7H0Te4oZRc+Q1CdySIJe8V1BDKI+SollMx5F/RNNZjzAXAPPgqersTol5+KUAZCbZmVdn/spfUNRwrVO1MRMfnR07XjR6YElr571bRycjiZ5hu2PAOnnB7RpwL0VwVN2mCrd9gX9lk29Fg7e43qrggFi41l+5xq7cWFhxlROsCjKHh5Mqe2JFD2AEehCcIY/GTArpXEpAbgAsccKy3OXpN2Bz8OQ17KvERDoMEuEXvcz6dYJBpJFFrwg5nwUoWEwNY0mghmzUOYnUHquOwDPXp92CDBF5FHgU1syNqJXHOiN3+DC2CBUwhPII6Z+Cx90W/JQ1B6+b1eSRKmCVn3WbxER8ojs5/rE3c8aNXXATI8Sf5cQuXkhFiaylWv5yK9Rkla0MVK4JVSx1AqWybMlHxFju0WOTBj+EQTyiJt1YAGjjgpE8eRAMGO4sWYRfpT9PnoGHYLJn2dEGkQegON6KyuhGZODBQJVhryhUBAZmKogMYqSyQyOZjzadGxmwShSMfOePKefBG39ZooqRCPY8vBopDgPKSAlxCn5tktQotIqNpg/IwdOEmSZEwmQHHv5JQd85II3EoTQWGU1HL/qSw270AqRb4WZfsIEmEC6pRi2Qb3JWVnLliAMcSiRVUSA1uTpEzk9jwg7ySqWxaWTEu0eDkK/QA/t6UR4nJGAH9qEfMdF35tnP+9dz8DpjAc1GXNAvOya0TzK+AwKU07LZi3zmjhRzZxqRJEqS1ItUjVwk5cCl/cCSyfqZvwafQMwhFECDkBswyHMe5dwDiGU+G0Ww/CUF5Sv9/nVmixKbYeFFHGlwSstjilEaoiFPLFi2NEnJkap4hXpT3DyiDYnmPexI7zV3mQxCrdJvCsm/VmxSmklRAnJla5LBPRfdQKV3BU1C0jzuf/+jFi+I81xl4XXgTvons2sS5OUrSQHyuefBaxrKAgBaJmXoxSNvuAxm88uj8pxN08c5+CuLk/Ss6EAiI+dPsJ97a4rjV4ZuInC5/YRwNGmO+U8BcCZALhjItzLaCI4HRgeHF/YMAHhpVbR6GggACi+eEPjFqgDPzk/t2XnLvzl42ej1GfD0AQLvyKEEslMQj5Rp8MOPbimV9Tdek4hBoHShh/L4qoLCG3p4hEPgeYQwygfesAMZvAU/2RU/I35BANl4wMAAz3OefeAB4FJ4sUL6pPCyywt4OXSi+IV+gVf82EDFL8cJSRH88l7xKwo14dlqzdYHmbmk9vhPL6nBnKryBhXShKw+GHCBNXhyb5FRDnEWXp5VAQV/DqFREFPAfAx5XVf88+BN5lx2eQE27Yj01oBriVp8jhzlLkfQvNKz2a9I4SGHX2/nla6qmiXBYLuiAAOu8HPyUwKRP2RqzDzxLtAUqpFS0DPkAkYqhnTdfMiUv4xQSBRF0OlpgMkAANUojYrZE93+zVvTzZpqB17cc9Obi3+NXuix0Rx+gVfvBa0Ev3g7soSmSz86HQg9PAp5Mo0p69b4B0CixpRKZyv0KDbJLke1oQd42oHA84hHlIWHHSFItgKbVkLniQcNVTl2xHmQMbqOsMCPCgMv9OeCewEAvAhL2TetStjXPQQAk0Poz8H/Hz4X08Aul2tPAAAAAElFTkSuQmCC" alt="Copa Games Simulator" />
              <div>
                <div className="text-sm font-semibold text-cyan-100">World Cup 2026 Simulator</div>
                <div className="text-xs text-slate-400">Grupos, melhores terceiros e caminho até a final</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-100">Simulação limpa</span>
              <Button active={mode === "manual"} onClick={() => setMode("manual")}>Ranking manual</Button>
              <Button active={mode === "scores"} onClick={() => setMode("scores")}>Placar jogo a jogo</Button>
              <Button onClick={resetAll}>Resetar</Button>
            </div>
          </div>
        </header>

        <section className="grid min-h-[520px] min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
          <div className="relative min-w-0 overflow-hidden rounded-[28px] sm:rounded-[36px] border border-white/10 bg-slate-950/45 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_18%,rgba(34,211,238,0.18),transparent_28%),linear-gradient(90deg,rgba(2,6,23,0.86),rgba(6,78,59,0.35),rgba(2,6,23,0.72))]" />
            <div className="relative grid min-h-[520px] min-w-0 grid-cols-1 gap-5 p-4 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] lg:p-6 xl:p-7">
              <aside className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Live Simulator</p>
                  <h1 className="mt-3 text-4xl font-black leading-tight text-white sm:text-5xl">Copa do Mundo 2026</h1>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">Comece pelo Grupo A, mova seleções, escolha os terceiros classificados e acompanhe como a chave se forma.</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-3xl border border-white/10 bg-white/10 p-3 text-center backdrop-blur"><div className="text-2xl font-black">12</div><div className="text-[11px] uppercase text-slate-400">grupos</div></div>
                  <div className="rounded-3xl border border-white/10 bg-white/10 p-3 text-center backdrop-blur"><div className="text-2xl font-black">32</div><div className="text-[11px] uppercase text-slate-400">classificados</div></div>
                  <div className="rounded-3xl border border-white/10 bg-white/10 p-3 text-center backdrop-blur"><div className="text-2xl font-black">104</div><div className="text-[11px] uppercase text-slate-400">jogos</div></div>
                </div>
                <Card className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-white">Matriz FIFA</div>
                      <div className="mt-1 text-xs text-slate-400">{thirdOrder.length}/8 terceiros selecionados</div>
                    </div>
                    <div className="rounded-full bg-cyan-300/15 px-3 py-1 text-xs font-bold text-cyan-100">{getFifaMatrixKey(thirdOrder) || "—"}</div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${(thirdOrder.length / 8) * 100}%` }} />
                  </div>
                </Card>
              </aside>

              <Card className="min-w-0 self-end overflow-hidden p-4 sm:p-5 lg:p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Primeira fase</div>
                    <h2 className="mt-2 text-2xl font-black text-white">Grupo {activeGroup}</h2>
                    <p className="mt-1 text-sm text-slate-400">{mode === "manual" ? "Arraste para ordenar a classificação inicial." : "Preencha placares para calcular a tabela."}</p>
                  </div>
                  <div className="flex min-w-0 flex-wrap gap-2">{groupLetters.map((group) => <Button key={group} active={activeGroup === group} onClick={() => setActiveGroup(group)}>{group}</Button>)}</div>
                </div>

                {mode === "manual" ? (
                  <div className="mt-5 grid grid-cols-1 gap-3">
                    {groupOrders[activeGroup].map((team, index) => (
                      <div key={team} data-group-drag-group={activeGroup} data-group-drag-index={index} onPointerDown={(event) => handleGroupPointerDown(event, activeGroup, index)} onPointerMove={handleGroupPointerMove} onPointerUp={() => setDraggedGroupItem(null)} onPointerCancel={() => setDraggedGroupItem(null)} className={`touch-none cursor-grab rounded-[24px] border p-4 transition active:cursor-grabbing ${index < 2 ? "border-emerald-300/30 bg-emerald-300/12" : index === 2 ? "border-amber-300/35 bg-amber-300/12" : "border-white/10 bg-white/7"} ${draggedGroupItem?.group === activeGroup && draggedGroupItem?.index === index ? "scale-[0.99] opacity-60 ring-2 ring-cyan-200/50" : ""}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-xs font-black text-slate-300">{index + 1}</div>
                            <div>
                              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{index + 1}º lugar · Grupo {activeGroup}</div>
                              <div className="mt-1 text-lg font-black text-white">{flagTeam(team)}</div>
                            </div>
                          </div>
                          <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 sm:block">Arraste</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 grid grid-cols-1 gap-3">
                    {activeMatches.map((match) => (
                      <div key={match.matchId} className="rounded-[24px] border border-white/10 bg-white/7 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Jogo {match.matchId} · Rodada {match.round} · {formatDate(match.localDate)}</div>
                            <div className="mt-1 text-lg font-black text-white">{flagTeam(match.homeTeam)} x {flagTeam(match.awayTeam)}</div>
                          </div>
                          <div className="grid w-full grid-cols-[minmax(0,1fr)_56px_auto_56px_minmax(0,1fr)] items-center gap-2 text-slate-200 md:w-auto">
                            <span className="min-w-0 truncate text-right text-sm">{flagTeam(match.homeTeam)}</span>
                            <input className="h-11 w-14 rounded-2xl border border-white/10 bg-slate-950/50 text-center text-white outline-none ring-cyan-300/40 focus:ring-2" type="number" min="0" value={scores[match.matchId].home} onChange={(event) => updateScore(match.matchId, "home", event.target.value)} />
                            <span>x</span>
                            <input className="h-11 w-14 rounded-2xl border border-white/10 bg-slate-950/50 text-center text-white outline-none ring-cyan-300/40 focus:ring-2" type="number" min="0" value={scores[match.matchId].away} onChange={(event) => updateScore(match.matchId, "away", event.target.value)} />
                            <span className="min-w-0 truncate text-sm">{flagTeam(match.awayTeam)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>

          <aside className="grid min-w-0 grid-cols-1 gap-5 xl:gap-6">
            <Card className="min-w-0 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Tabela ao vivo</div>
                  <h2 className="mt-2 text-2xl font-black text-white">Grupo {activeGroup}</h2>
                </div>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-300">{mode === "manual" ? "Manual" : "Placares"}</span>
              </div>
              <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-white/8 text-[11px] uppercase tracking-[0.12em] text-slate-400"><tr><th className="px-3 py-3 text-left">#</th><th className="px-3 py-3 text-left">Seleção</th><th className="px-3 py-3 text-center">Pts</th><th className="px-3 py-3 text-center">SG</th></tr></thead>
                  <tbody>{standings[activeGroup].map((row, index) => <tr key={row.team} className={index < 2 ? "bg-emerald-300/10" : index === 2 ? "bg-amber-300/10" : "bg-white/[0.03]"}><td className="border-t border-white/10 px-3 py-3 font-bold text-slate-300">{index + 1}</td><td className="border-t border-white/10 px-3 py-3 font-bold text-white">{flagTeam(row.team)}</td><td className="border-t border-white/10 px-3 py-3 text-center text-slate-300">{mode === "manual" ? "—" : row.points}</td><td className="border-t border-white/10 px-3 py-3 text-center text-slate-300">{mode === "manual" ? "—" : row.goalDifference}</td></tr>)}</tbody>
                </table>
              </div>
            </Card>

            <Card className="min-w-0 p-4 sm:p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Caminho da seleção</div>
              <select value={selectedTeam} onChange={(event) => setSelectedTeam(event.target.value)} className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-sm text-white outline-none ring-cyan-300/40 focus:ring-2"><option value="">Selecione uma seleção</option>{allTeams.map((team) => <option key={team} value={team}>{flagTeam(team)}</option>)}</select>
              <div className={`mt-4 rounded-[22px] border p-4 text-sm ${teamPath.status === "eliminado" ? "border-rose-300/25 bg-rose-300/12 text-rose-100" : teamPath.status === "condicional" ? "border-amber-300/25 bg-amber-300/12 text-amber-100" : "border-emerald-300/25 bg-emerald-300/12 text-emerald-100"}`}>{teamPath.title}</div>
              <div className="mt-4 max-h-72 space-y-3 overflow-auto pr-1">{teamPath.path.filter(Boolean).map((match) => <div key={match.matchId} className="rounded-2xl border border-white/10 bg-white/7 p-3"><div className="text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-200">{match.stage || "Fase de grupos"} · Jogo {match.matchId}</div><div className="mt-2 font-bold text-white">{match.homeSeed || match.awaySeed ? `Simulado: ${matchName(match, standings, thirdOrder, winners)}` : `${flagTeam(match.homeTeam)} x ${flagTeam(match.awayTeam)}`}</div><div className="mt-2 text-xs leading-5 text-slate-400">{formatDate(match.localDate)} · {match.city}, {flagCountry(match.country)}<br />Local: {match.localTime || "A definir"} · Brasília: {computedTime(match, "brasilia")} · Paris: {computedTime(match, "paris")}</div></div>)}</div>
            </Card>
          </aside>
        </section>

        <section className="grid min-w-0 grid-cols-1 gap-5 2xl:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
          <Card className="min-w-0 p-4 sm:p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Melhores terceiros</div>
            <h2 className="mt-2 text-2xl font-black text-white">Matriz FIFA</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Selecione exatamente 8 grupos cujos terceiros avançam. A matriz oficial define automaticamente os 32-avos.</p>
            <div className="mt-4 rounded-[22px] border border-white/10 bg-white/7 p-3 text-xs leading-5 text-slate-300">{matrixStatus}<br />Grupos classificados: {getFifaMatrixKey(thirdOrder) || "—"} · {thirdOrder.length}/8 selecionados</div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-2">{groupLetters.map((group) => { const third = standings[group][2]; const selected = thirdOrder.includes(group); const disabled = !selected && thirdOrder.length >= 8; return <button key={group} type="button" disabled={disabled} onClick={() => toggleThirdQualifiedGroup(group)} className={`min-h-[86px] rounded-[22px] border p-3 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-45 ${selected ? "border-emerald-300/45 bg-emerald-300/16 text-emerald-50" : "border-white/10 bg-white/7 text-slate-200 hover:border-cyan-200/35 hover:bg-white/12"}`}><div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">3º Grupo {group}</div><div className="mt-2 font-black">{flagTeam(third.team)}</div>{selected && <div className="mt-1 text-xs font-bold text-emerald-200">Classificado</div>}</button>; })}</div>
          </Card>

          <Card className="min-w-0 p-4 sm:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div><div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Mata-mata</div><h2 className="mt-2 text-2xl font-black text-white">Simular vencedores</h2><p className="mt-1 text-sm text-slate-400">Clique no vencedor. As fases seguintes são alimentadas automaticamente.</p></div>
              <div className="flex items-center gap-2"><span className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs text-slate-300">{completedWinners}/32 definidos</span><Button onClick={() => setWinners(defaultKnockoutWinners)}>Limpar</Button></div>
            </div>
            <div className="mt-5 space-y-5">
              {knockoutStageOrder.map((stage) => {
                const stageMatches = knockoutMatches.filter((match) => match.stage === stage);
                if (stageMatches.length === 0) return null;
                return (
                  <section key={stage} className="rounded-[26px] border border-white/10 bg-white/[0.05] p-4 sm:p-5">
                    <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <div className="text-xl font-black text-white">{stage}</div>
                        <div className="text-xs text-slate-400">{stageMatches.length} jogo(s)</div>
                      </div>
                      <div className="text-xs text-slate-500">Datas e horários em local, Brasília e Paris</div>
                    </div>
                    <div className={`mt-4 grid grid-cols-1 gap-3 ${stageMatches.length > 4 ? "lg:grid-cols-2 2xl:grid-cols-4" : "lg:grid-cols-2"}`}>
                      {stageMatches.map((match) => {
                        const entrants = resolveEntrants(match, standings, thirdOrder, winners);
                        const ready = entrants.every((entrant) => entrant && !entrant.startsWith("Vencedor Jogo") && !entrant.startsWith("Perdedor Jogo") && entrant !== "Vencedor" && entrant !== "Matriz FIFA indisponível");
                        return (
                          <div key={match.matchId} className="rounded-[22px] border border-white/10 bg-slate-950/35 p-4">
                            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-cyan-200">Jogo {match.matchId}</div>
                              <div className="break-words text-[11px] text-slate-500 sm:text-right">{slotLabel(match)}</div>
                            </div>
                            <div className="mt-2 break-words text-base font-black text-white">{matchName(match, standings, thirdOrder, winners)}</div>
                            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs leading-5 text-slate-400">
                              <div>{formatDate(match.localDate)} · {match.city}, {flagCountry(match.country)}</div>
                              <div>Local: {match.localTime || "A definir"}</div>
                              <div>Brasília: {computedTime(match, "brasilia")} · Paris: {computedTime(match, "paris")}</div>
                            </div>
                            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                              {entrants.map((entrant) => {
                                const isSelected = winners[match.matchId] === entrant;
                                const isPlaceholder = entrant.startsWith("Vencedor Jogo") || entrant.startsWith("Perdedor Jogo") || entrant === "Vencedor" || entrant === "Matriz FIFA indisponível";
                                const disabled = !ready || isPlaceholder;
                                return <button key={entrant} type="button" disabled={disabled} onClick={() => setWinner(match.matchId, entrant)} className={`min-h-11 rounded-2xl border px-3 py-2 text-left text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-45 ${isSelected ? "border-emerald-300/60 bg-emerald-300/18 text-emerald-50" : "border-white/10 bg-white/7 text-slate-200 hover:border-cyan-200/35"}`}><div className="flex items-center justify-between gap-2"><span className="min-w-0 break-words">{formatTeamLabel(entrant)}</span>{isSelected && <span className="text-emerald-200">✓</span>}</div></button>;
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </Card>
        </section>

        <section className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
          <Card className="min-w-0 p-4 sm:p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Resumo</div>
            <h2 className="mt-2 text-2xl font-black text-white">Classificados simulados</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300"><div><b className="text-white">Diretos:</b> {directQualifiedPreview.map((team) => `${flagTeam(team.team)} (${team.group})`).join(", ")}</div><div><b className="text-white">Terceiros:</b> {selectedThirdTeams.length ? selectedThirdTeams.join(", ") : "Nenhum selecionado"}</div><div><b className="text-white">Chave:</b> {getFifaMatrixKey(thirdOrder) || "—"}</div></div>
          </Card>

          <Card className="min-w-0 p-4 sm:p-5">
            <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="min-w-0"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Calendário</div><h2 className="mt-2 text-2xl font-black text-white">Jogos e horários</h2></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar seleção ou cidade" className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-300/40" /><select value={timezoneView} onChange={(event) => setTimezoneView(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-300/40"><option value="local">Horário local</option><option value="brasilia">Brasília</option><option value="paris">Paris</option></select></div></div>
            <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2">{visibleCalendar.map((match) => <div key={match.matchId} className={`rounded-[22px] border p-4 ${pathIds.has(match.matchId) ? "border-cyan-200/45 bg-cyan-300/12" : "border-white/10 bg-white/7"}`}><div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-200">{match.stage || "Fase de grupos"} · Jogo {match.matchId}</div><div className="mt-2 break-words font-black text-white">{matchName(match, standings, thirdOrder, winners)}</div><div className="mt-2 text-xs leading-5 text-slate-400">{formatDate(match.localDate)} · {match.city}, {flagCountry(match.country)}<br />Local: {match.localTime || "A definir"} · Brasília: {computedTime(match, "brasilia")} · Paris: {computedTime(match, "paris")}</div></div><div className="w-fit shrink-0 rounded-2xl bg-white/10 px-3 py-2 text-sm font-black text-white">{getVisibleTime(match)}</div></div></div>)}</div>
            {calendar.length > visibleCalendar.length && <div className="mt-4 text-center text-xs text-slate-500">Mostrando {visibleCalendar.length} de {calendar.length} jogos. Use a busca para filtrar.</div>}
          </Card>
        </section>

        <div className="rounded-[28px] border border-amber-200/20 bg-amber-300/10 p-5 text-sm leading-6 text-amber-50 backdrop-blur"><b>Notas:</b> os terceiros classificados são selecionados por grupo. A ordem entre eles não define os confrontos. O app usa apenas o conjunto de grupos classificados e aplica a matriz FIFA para alocar cada terceiro nos 32-avos.</div>
        <div className="sr-only">{testResults.join(" ")}</div>
      </div>
    </div>
  );
}
