const API_URL = "https://restcountries.com/v3.1/all?fields=name,translations,flags,region,capital,population,cca2";
const NUMBER_OF_CHOICES = 3;

const regionTabs = document.querySelector(".region-tabs");
const regionLabel = document.querySelector("#regionLabel");
const flagContainer = document.querySelector("#flagContainer");
const nextQuestionButton = document.querySelector("#nextQuestion");
const answerForm = document.querySelector("#answerForm");
const choicesFieldset = document.querySelector("#choices");
const submitAnswerButton = document.querySelector("#submitAnswer");
const resultMessage = document.querySelector("#resultMessage");
const scoreValue = document.querySelector("#scoreValue");

const regionNames = {
  ALL: "Toutes les regions",
  Americas: "Amerique",
  Europe: "Europe",
  Asia: "Asie",
  Africa: "Afrique",
  Oceania: "Oceanie",
};

const fallbackCountries = [
  { name: "France", code: "FR", region: "Europe", flagPattern: { layout: "vertical", colors: ["#002654", "#ffffff", "#ce1126"] } },
  { name: "Allemagne", code: "DE", region: "Europe", flagPattern: { layout: "horizontal", colors: ["#000000", "#dd0000", "#ffce00"] } },
  { name: "Italie", code: "IT", region: "Europe", flagPattern: { layout: "vertical", colors: ["#009246", "#ffffff", "#ce2b37"] } },
  { name: "Japon", code: "JP", region: "Asia", flagPattern: { layout: "circle", background: "#ffffff", circle: "#bc002d" } },
  { name: "Coree du Sud", code: "KR", region: "Asia", flagPattern: { layout: "circle", background: "#ffffff", circle: "#cd2e3a", secondCircle: "#0047a0" } },
  { name: "Inde", code: "IN", region: "Asia", flagPattern: { layout: "horizontal", colors: ["#ff9933", "#ffffff", "#138808"], symbol: "#000080" } },
  { name: "Canada", code: "CA", region: "Americas", flagPattern: { layout: "vertical", colors: ["#ff0000", "#ffffff", "#ff0000"] } },
  { name: "Bresil", code: "BR", region: "Americas", flagPattern: { layout: "diamond", background: "#009b3a", diamond: "#ffdf00", circle: "#002776" } },
  { name: "Mexique", code: "MX", region: "Americas", flagPattern: { layout: "vertical", colors: ["#006847", "#ffffff", "#ce1126"], symbol: "#8c6b2f" } },
  { name: "Maroc", code: "MA", region: "Africa", flagPattern: { layout: "solid", background: "#c1272d", symbol: "#006233" } },
  { name: "Afrique du Sud", code: "ZA", region: "Africa", flagPattern: { layout: "horizontal", colors: ["#de3831", "#ffffff", "#002395", "#007a4d"] } },
  { name: "Kenya", code: "KE", region: "Africa", flagPattern: { layout: "horizontal", colors: ["#000000", "#bb0000", "#006600"], symbol: "#ffffff" } },
  { name: "Australie", code: "AU", region: "Oceania", flagPattern: { layout: "solid", background: "#012169", symbol: "#ffffff" } },
  { name: "Nouvelle-Zelande", code: "NZ", region: "Oceania", flagPattern: { layout: "solid", background: "#00247d", symbol: "#cc142b" } },
  { name: "Fidji", code: "FJ", region: "Oceania", flagPattern: { layout: "solid", background: "#68bfe5", symbol: "#ffffff" } },
];

let selectedRegion = "ALL";
let countriesCache = [];
let currentAnswer = null;
let score = 0;
let totalAnswers = 0;

async function fetchCountries() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("API indisponible");

    const data = await response.json();
    const countries = data
      .filter((country) => country?.name?.common && country?.region)
      .map((country) => ({
        name: country?.translations?.fra?.common || country.name.common,
        flag: country.flags?.svg || country.flags?.png || "",
        code: country.cca2 || "",
        region: country.region,
      }));

    return countries.length >= NUMBER_OF_CHOICES ? countries : fallbackCountries;
  } catch {
    return fallbackCountries;
  }
}

function getCountryPool() {
  return selectedRegion === "ALL"
    ? countriesCache
    : countriesCache.filter((country) => country.region === selectedRegion);
}

function getRandomCountry(countries) {
  return countries[Math.floor(Math.random() * countries.length)];
}

function getChoices(countries, correctCountry) {
  const choices = [correctCountry];

  while (choices.length < NUMBER_OF_CHOICES) {
    const candidate = getRandomCountry(countries);
    const alreadySelected = choices.some((country) => country.name === candidate.name);

    if (!alreadySelected) choices.push(candidate);
  }

  return choices.sort(() => Math.random() - 0.5);
}

function setResult(message, type = "") {
  resultMessage.textContent = message;
  resultMessage.className = `result-message ${type}`.trim();
}

function svgToDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const localFlagSvgsByCode = {
  FR: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540">
      <rect width="300" height="540" fill="#002654"/>
      <rect x="300" width="300" height="540" fill="#ffffff"/>
      <rect x="600" width="300" height="540" fill="#ce1126"/>
      <rect width="900" height="540" fill="none" stroke="#111827" stroke-opacity=".12" stroke-width="8"/>
    </svg>
  `,
  DE: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540">
      <rect width="900" height="180" fill="#000000"/>
      <rect y="180" width="900" height="180" fill="#dd0000"/>
      <rect y="360" width="900" height="180" fill="#ffce00"/>
      <rect width="900" height="540" fill="none" stroke="#111827" stroke-opacity=".12" stroke-width="8"/>
    </svg>
  `,
  IT: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540">
      <rect width="300" height="540" fill="#009246"/>
      <rect x="300" width="300" height="540" fill="#ffffff"/>
      <rect x="600" width="300" height="540" fill="#ce2b37"/>
      <rect width="900" height="540" fill="none" stroke="#111827" stroke-opacity=".12" stroke-width="8"/>
    </svg>
  `,
  JP: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540">
      <rect width="900" height="540" fill="#ffffff"/>
      <circle cx="450" cy="270" r="104" fill="#bc002d"/>
      <rect width="900" height="540" fill="none" stroke="#111827" stroke-opacity=".12" stroke-width="8"/>
    </svg>
  `,
  KR: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540">
      <rect width="900" height="540" fill="#ffffff"/>
      <g transform="rotate(-34 450 270)">
        <path d="M450 178a92 92 0 0 1 0 184 46 46 0 0 1 0-92 46 46 0 0 0 0-92Z" fill="#0047a0"/>
        <path d="M450 178a92 92 0 0 0 0 184 46 46 0 0 0 0-92 46 46 0 0 1 0-92Z" fill="#cd2e3a"/>
      </g>
      <g fill="#111111">
        <rect x="236" y="132" width="118" height="18" transform="rotate(-34 295 141)"/>
        <rect x="236" y="164" width="118" height="18" transform="rotate(-34 295 173)"/>
        <rect x="236" y="196" width="118" height="18" transform="rotate(-34 295 205)"/>
        <rect x="546" y="326" width="118" height="18" transform="rotate(-34 605 335)"/>
        <rect x="546" y="358" width="118" height="18" transform="rotate(-34 605 367)"/>
        <rect x="546" y="390" width="118" height="18" transform="rotate(-34 605 399)"/>
        <rect x="548" y="132" width="118" height="18" transform="rotate(34 607 141)"/>
        <rect x="548" y="196" width="118" height="18" transform="rotate(34 607 205)"/>
        <rect x="238" y="326" width="118" height="18" transform="rotate(34 297 335)"/>
        <rect x="238" y="390" width="118" height="18" transform="rotate(34 297 399)"/>
      </g>
      <rect width="900" height="540" fill="none" stroke="#111827" stroke-opacity=".12" stroke-width="8"/>
    </svg>
  `,
  IN: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540">
      <rect width="900" height="180" fill="#ff9933"/>
      <rect y="180" width="900" height="180" fill="#ffffff"/>
      <rect y="360" width="900" height="180" fill="#138808"/>
      <circle cx="450" cy="270" r="58" fill="none" stroke="#000080" stroke-width="9"/>
      <g stroke="#000080" stroke-width="3">
        <line x1="450" y1="212" x2="450" y2="328"/>
        <line x1="392" y1="270" x2="508" y2="270"/>
        <line x1="409" y1="229" x2="491" y2="311"/>
        <line x1="491" y1="229" x2="409" y2="311"/>
        <line x1="428" y1="216" x2="472" y2="324"/>
        <line x1="472" y1="216" x2="428" y2="324"/>
      </g>
      <circle cx="450" cy="270" r="8" fill="#000080"/>
      <rect width="900" height="540" fill="none" stroke="#111827" stroke-opacity=".12" stroke-width="8"/>
    </svg>
  `,
  CA: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540">
      <rect width="225" height="540" fill="#d52b1e"/>
      <rect x="225" width="450" height="540" fill="#ffffff"/>
      <rect x="675" width="225" height="540" fill="#d52b1e"/>
      <path d="M450 102 478 190 548 154 516 232 590 252 514 288 548 374 474 326 450 438 426 326 352 374 386 288 310 252 384 232 352 154 422 190Z" fill="#d52b1e"/>
      <rect width="900" height="540" fill="none" stroke="#111827" stroke-opacity=".12" stroke-width="8"/>
    </svg>
  `,
  BR: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540">
      <rect width="900" height="540" fill="#009b3a"/>
      <path d="M450 72 810 270 450 468 90 270Z" fill="#ffdf00"/>
      <circle cx="450" cy="270" r="112" fill="#002776"/>
      <path d="M338 248c70 20 142 24 224 4" fill="none" stroke="#ffffff" stroke-width="18"/>
      <rect width="900" height="540" fill="none" stroke="#111827" stroke-opacity=".12" stroke-width="8"/>
    </svg>
  `,
  MX: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540">
      <rect width="300" height="540" fill="#006847"/>
      <rect x="300" width="300" height="540" fill="#ffffff"/>
      <rect x="600" width="300" height="540" fill="#ce1126"/>
      <g transform="translate(450 270)">
        <circle r="34" fill="#c9a227"/>
        <path d="M-40 12c22 44 58 44 80 0" fill="none" stroke="#2f7d32" stroke-width="12" stroke-linecap="round"/>
        <path d="M-8 -36c34 18 36 54 0 74" fill="none" stroke="#7a4d1d" stroke-width="11" stroke-linecap="round"/>
      </g>
      <rect width="900" height="540" fill="none" stroke="#111827" stroke-opacity=".12" stroke-width="8"/>
    </svg>
  `,
  MA: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540">
      <rect width="900" height="540" fill="#c1272d"/>
      <path d="M450 150 486 258 600 258 508 326 544 434 450 368 356 434 392 326 300 258 414 258Z" fill="none" stroke="#006233" stroke-width="18" stroke-linejoin="round"/>
      <rect width="900" height="540" fill="none" stroke="#111827" stroke-opacity=".12" stroke-width="8"/>
    </svg>
  `,
  ZA: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540">
      <rect width="900" height="270" fill="#de3831"/>
      <rect y="270" width="900" height="270" fill="#002395"/>
      <path d="M0 0 408 270 0 540Z" fill="#ffffff"/>
      <path d="M0 54 328 270 0 486Z" fill="#ffb612"/>
      <path d="M0 0 450 270 0 540Z" fill="#007a4d"/>
      <path d="M0 90 272 270 0 450Z" fill="#000000"/>
      <path d="M450 220H900v100H450L0 540v-90l300-180L0 90V0Z" fill="#ffffff"/>
      <path d="M450 240H900v60H450L0 510v-60l300-180L0 90V30Z" fill="#007a4d"/>
      <rect width="900" height="540" fill="none" stroke="#111827" stroke-opacity=".12" stroke-width="8"/>
    </svg>
  `,
  KE: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540">
      <rect width="900" height="540" fill="#006600"/>
      <rect width="900" height="165" fill="#000000"/>
      <rect y="188" width="900" height="164" fill="#bb0000"/>
      <rect y="165" width="900" height="23" fill="#ffffff"/>
      <rect y="352" width="900" height="23" fill="#ffffff"/>
      <ellipse cx="450" cy="270" rx="52" ry="105" fill="#8b1e16" stroke="#ffffff" stroke-width="10"/>
      <path d="M450 168c26 44 26 160 0 204-26-44-26-160 0-204Z" fill="#111111"/>
      <path d="M332 166 568 374M568 166 332 374" stroke="#ffffff" stroke-width="9" stroke-linecap="round"/>
      <rect width="900" height="540" fill="none" stroke="#111827" stroke-opacity=".12" stroke-width="8"/>
    </svg>
  `,
  AU: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540">
      <rect width="900" height="540" fill="#012169"/>
      <rect width="390" height="240" fill="#012169"/>
      <path d="M0 0 390 240M390 0 0 240" stroke="#ffffff" stroke-width="48"/>
      <path d="M0 0 390 240M390 0 0 240" stroke="#c8102e" stroke-width="24"/>
      <path d="M195 0v240M0 120h390" stroke="#ffffff" stroke-width="78"/>
      <path d="M195 0v240M0 120h390" stroke="#c8102e" stroke-width="42"/>
      <g fill="#ffffff">
        <path d="M605 84 622 132h51l-41 30 16 48-43-29-42 29 16-48-41-30h51Z"/>
        <path d="M700 252 713 290h40l-32 23 12 38-33-23-33 23 12-38-32-23h40Z"/>
        <path d="M550 322 563 360h40l-32 23 12 38-33-23-33 23 12-38-32-23h40Z"/>
        <path d="M758 92 768 122h32l-26 19 10 30-26-18-26 18 10-30-26-19h32Z"/>
      </g>
      <rect width="900" height="540" fill="none" stroke="#111827" stroke-opacity=".12" stroke-width="8"/>
    </svg>
  `,
  NZ: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540">
      <rect width="900" height="540" fill="#00247d"/>
      <rect width="390" height="240" fill="#012169"/>
      <path d="M0 0 390 240M390 0 0 240" stroke="#ffffff" stroke-width="48"/>
      <path d="M0 0 390 240M390 0 0 240" stroke="#c8102e" stroke-width="24"/>
      <path d="M195 0v240M0 120h390" stroke="#ffffff" stroke-width="78"/>
      <path d="M195 0v240M0 120h390" stroke="#c8102e" stroke-width="42"/>
      <g fill="#cc142b" stroke="#ffffff" stroke-width="9">
        <path d="M620 112 634 154h44l-36 26 14 42-36-26-36 26 14-42-36-26h44Z"/>
        <path d="M740 222 752 258h38l-31 23 12 36-31-22-31 22 12-36-31-23h38Z"/>
        <path d="M610 338 622 374h38l-31 23 12 36-31-22-31 22 12-36-31-23h38Z"/>
        <path d="M760 374 770 404h32l-26 19 10 30-26-19-26 19 10-30-26-19h32Z"/>
      </g>
      <rect width="900" height="540" fill="none" stroke="#111827" stroke-opacity=".12" stroke-width="8"/>
    </svg>
  `,
  FJ: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540">
      <rect width="900" height="540" fill="#68bfe5"/>
      <rect width="390" height="240" fill="#012169"/>
      <path d="M0 0 390 240M390 0 0 240" stroke="#ffffff" stroke-width="48"/>
      <path d="M0 0 390 240M390 0 0 240" stroke="#c8102e" stroke-width="24"/>
      <path d="M195 0v240M0 120h390" stroke="#ffffff" stroke-width="78"/>
      <path d="M195 0v240M0 120h390" stroke="#c8102e" stroke-width="42"/>
      <path d="M590 150h170v200c0 65-85 96-85 96s-85-31-85-96Z" fill="#ffffff" stroke="#d1d5db" stroke-width="8"/>
      <path d="M590 216h170M675 150v296" stroke="#c8102e" stroke-width="24"/>
      <rect width="900" height="540" fill="none" stroke="#111827" stroke-opacity=".12" stroke-width="8"/>
    </svg>
  `,
};

function makeStripeSvg(pattern) {
  const colors = pattern.colors || ["#dce3eb", "#ffffff", "#2563eb"];
  const isVertical = pattern.layout === "vertical";
  const size = isVertical ? 900 / colors.length : 540 / colors.length;
  const stripes = colors.map((color, index) => {
    const x = isVertical ? index * size : 0;
    const y = isVertical ? 0 : index * size;
    const width = isVertical ? size : 900;
    const height = isVertical ? 540 : size;
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${color}"/>`;
  }).join("");
  const symbol = pattern.symbol ? `<circle cx="450" cy="270" r="34" fill="${pattern.symbol}"/>` : "";
  return `${stripes}${symbol}`;
}

function makeLocalFlag(country) {
  const localSvg = localFlagSvgsByCode[country.code];

  if (localSvg) {
    return svgToDataUri(localSvg);
  }

  const pattern = country.flagPattern || {};
  let content = "";

  if (pattern.layout === "vertical" || pattern.layout === "horizontal") {
    content = makeStripeSvg(pattern);
  } else if (pattern.layout === "circle") {
    const secondCircle = pattern.secondCircle
      ? `<path d="M450 190a80 80 0 0 1 0 160a80 80 0 0 0 0-160Z" fill="${pattern.secondCircle}"/>`
      : "";
    content = `
      <rect width="900" height="540" fill="${pattern.background || "#ffffff"}"/>
      <circle cx="450" cy="270" r="94" fill="${pattern.circle || "#2563eb"}"/>
      ${secondCircle}
    `;
  } else if (pattern.layout === "diamond") {
    content = `
      <rect width="900" height="540" fill="${pattern.background || "#009b3a"}"/>
      <path d="M450 70 810 270 450 470 90 270Z" fill="${pattern.diamond || "#ffdf00"}"/>
      <circle cx="450" cy="270" r="92" fill="${pattern.circle || "#002776"}"/>
    `;
  } else {
    content = `
      <rect width="900" height="540" fill="${pattern.background || "#2563eb"}"/>
      <circle cx="450" cy="270" r="58" fill="${pattern.symbol || "#ffffff"}" opacity="0.95"/>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540" role="img" aria-label="Drapeau ${country.name}">
      ${content}
      <rect x="0" y="0" width="900" height="540" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="8"/>
    </svg>
  `;
  return svgToDataUri(svg);
}

function getFlagSources(country) {
  const sources = [];

  if (country.flag) {
    sources.push(country.flag);
  }

  if (country.code) {
    sources.push(`https://flagcdn.com/w640/${country.code.toLowerCase()}.png`);
  }

  if (country.flagPattern || country.code) {
    sources.push(makeLocalFlag(country));
  }

  return [...new Set(sources)];
}

function renderFlag(country) {
  flagContainer.replaceChildren();

  const image = document.createElement("img");
  const sources = getFlagSources(country);
  let sourceIndex = 0;
  let fallbackTimer = null;

  if (sources.length === 0) {
    flagContainer.textContent = `Drapeau indisponible pour ${country.name}.`;
    return;
  }

  image.alt = `Drapeau de ${country.name}`;
  image.loading = "eager";
  image.decoding = "async";

  const loadSource = () => {
    window.clearTimeout(fallbackTimer);
    image.src = sources[sourceIndex];

    if (sourceIndex < sources.length - 1 && image.src.startsWith("http")) {
      fallbackTimer = window.setTimeout(() => {
        sourceIndex += 1;
        loadSource();
      }, 1800);
    }
  };

  image.onload = () => window.clearTimeout(fallbackTimer);
  image.onerror = () => {
    window.clearTimeout(fallbackTimer);
    sourceIndex += 1;

    if (sourceIndex < sources.length) {
      loadSource();
      return;
    }

    flagContainer.textContent = `Drapeau indisponible pour ${country.name}.`;
  };

  loadSource();
  flagContainer.append(image);
}

function renderChoices(choices) {
  choicesFieldset.replaceChildren();

  choices.forEach((country, index) => {
    const id = `country-${index}`;
    const label = document.createElement("label");
    label.className = "choice";
    label.setAttribute("for", id);

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "country";
    input.id = id;
    input.value = country.name;

    const text = document.createElement("span");
    text.textContent = country.name;

    label.append(input, text);
    choicesFieldset.append(label);
  });
}

function updateScore() {
  scoreValue.textContent = `${score} / ${totalAnswers}`;
}

async function startQuestion() {
  setResult("");
  flagContainer.textContent = "Chargement du drapeau...";
  choicesFieldset.disabled = true;
  submitAnswerButton.disabled = true;

  if (countriesCache.length === 0) {
    countriesCache = await fetchCountries();
  }

  const pool = getCountryPool();

  if (pool.length < NUMBER_OF_CHOICES) {
    flagContainer.textContent = "Pas assez de pays dans cette region.";
    return;
  }

  currentAnswer = getRandomCountry(pool);
  renderFlag(currentAnswer);
  renderChoices(getChoices(pool, currentAnswer));
  choicesFieldset.disabled = false;
  submitAnswerButton.disabled = false;
}

function updateRegion(region) {
  selectedRegion = region;
  regionLabel.textContent = regionNames[region];

  regionTabs.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.region === region);
  });

  startQuestion();
}

regionTabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-region]");
  if (!button) return;
  updateRegion(button.dataset.region);
});

nextQuestionButton.addEventListener("click", startQuestion);

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedChoice = choicesFieldset.querySelector("input[name='country']:checked");

  if (!selectedChoice || !currentAnswer) {
    setResult("Selectionne une reponse avant de valider.", "error");
    return;
  }

  totalAnswers += 1;

  if (selectedChoice.value === currentAnswer.name) {
    score += 1;
    setResult("Bonne reponse.", "success");
  } else {
    setResult(`Mauvaise reponse : c'etait ${currentAnswer.name}.`, "error");
  }

  updateScore();
  choicesFieldset.disabled = true;
  submitAnswerButton.disabled = true;
});

updateScore();
startQuestion();
