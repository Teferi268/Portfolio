const GITHUB_USERNAME = "Teferi268";
const THEME_STORAGE_KEY = "weather-dashboard-theme";

const themeButton = document.querySelector("#theme");
const weatherForm = document.querySelector("#formRecherche");
const cityInput = document.querySelector("#entreeVille");
const locationButton = document.querySelector("#boutonPosition");
const weatherStatus = document.querySelector("#statutMeteo");
const githubStatus = document.querySelector("#statutGithub");

const weatherDescriptions = {
  0: "ciel degage",
  1: "principalement clair",
  2: "partiellement nuageux",
  3: "couvert",
  45: "brouillard",
  48: "brouillard givrant",
  51: "bruine faible",
  53: "bruine moderee",
  55: "bruine dense",
  61: "pluie faible",
  63: "pluie moderee",
  65: "pluie forte",
  71: "neige faible",
  73: "neige moderee",
  75: "neige forte",
  80: "averses faibles",
  81: "averses moderees",
  82: "averses fortes",
  95: "orage",
};

const demoWeather = {
  city: "Paris, FR",
  temperature: 18,
  description: "donnees de demonstration",
  humidity: 64,
  wind: 12,
  pressure: 1016,
  feelsLike: 17,
  visibility: 10,
};

const demoGithub = {
  login: GITHUB_USERNAME,
  name: "Mathieu Morin",
  bio: "Profil GitHub indisponible pour le moment.",
  public_repos: "--",
  followers: "--",
  html_url: `https://github.com/${GITHUB_USERNAME}`,
  avatar_url: `https://github.com/${GITHUB_USERNAME}.png`,
};

async function fetchJson(url, timeout = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error("Reponse reseau invalide");
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", nextTheme);
  themeButton.textContent = nextTheme === "dark" ? "Mode clair" : "Mode sombre";
  themeButton.setAttribute("aria-pressed", String(nextTheme === "dark"));
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
}

function formatNumber(value, fallback = "--") {
  return Number.isFinite(value) ? String(Math.round(value)) : fallback;
}

function afficherMeteo(data, status = "Meteo mise a jour.") {
  document.querySelector("#nomVille").textContent = data.city;
  document.querySelector("#temperature").textContent = `${formatNumber(data.temperature)}°C`;
  document.querySelector("#description").textContent = data.description;
  document.querySelector("#humidite").textContent = `${formatNumber(data.humidity)}%`;
  document.querySelector("#vent").textContent = `${formatNumber(data.wind)} km/h`;
  document.querySelector("#pression").textContent = `${formatNumber(data.pressure)} hPa`;
  document.querySelector("#ressenti").textContent = `${formatNumber(data.feelsLike)}°C`;
  document.querySelector("#visibilite").textContent = `${formatNumber(data.visibility)} km`;
  weatherStatus.textContent = status;
}

async function obtenirCoordonneesVille(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr&format=json`;
  const data = await fetchJson(url);
  const result = data.results?.[0];

  if (!result) {
    throw new Error("Ville introuvable");
  }

  return {
    latitude: result.latitude,
    longitude: result.longitude,
    label: `${result.name}${result.country_code ? `, ${result.country_code}` : ""}`,
  };
}

async function obtenirMeteoDepuisCoords(latitude, longitude, label) {
  const params = "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure";
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=${params}&timezone=auto`;
  const data = await fetchJson(url);
  const current = data.current;

  if (!current) {
    throw new Error("Meteo indisponible");
  }

  return {
    city: label,
    temperature: current.temperature_2m,
    description: weatherDescriptions[current.weather_code] || "conditions inconnues",
    humidity: current.relative_humidity_2m,
    wind: current.wind_speed_10m,
    pressure: current.surface_pressure,
    feelsLike: current.apparent_temperature,
    visibility: Number.NaN,
  };
}

async function obtenirMeteo(ville) {
  const cleanCity = ville.trim();
  if (!cleanCity) return;

  weatherStatus.textContent = "Recherche en cours...";

  try {
    const location = await obtenirCoordonneesVille(cleanCity);
    const weather = await obtenirMeteoDepuisCoords(location.latitude, location.longitude, location.label);
    afficherMeteo(weather);
  } catch (error) {
    console.error(error);
    afficherMeteo(demoWeather, "Impossible de charger la meteo. Donnees de demonstration affichees.");
  }
}

function obtenirPosition() {
  if (!navigator.geolocation) {
    weatherStatus.textContent = "Geolocalisation non supportee par ce navigateur.";
    return;
  }

  weatherStatus.textContent = "Recherche de la position...";
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const weather = await obtenirMeteoDepuisCoords(latitude, longitude, "Position actuelle");
        afficherMeteo(weather);
      } catch (error) {
        console.error(error);
        afficherMeteo(demoWeather, "Impossible de charger la meteo locale. Donnees de demonstration affichees.");
      }
    },
    () => {
      weatherStatus.textContent = "Position refusee. Recherche manuelle disponible.";
    }
  );
}

function afficherGithubStats(data, fallback = false) {
  document.querySelector("#github-nom").textContent = data.name || data.login;
  document.querySelector("#github-avatar").src = data.avatar_url;
  document.querySelector("#github-bio").textContent = data.bio || "Pas de bio renseignee.";
  document.querySelector("#github-repos").textContent = data.public_repos;
  document.querySelector("#github-followers").textContent = data.followers;
  document.querySelector("#github-link").href = data.html_url;
  githubStatus.textContent = fallback ? "Donnees GitHub de secours." : "Profil GitHub charge.";
}

async function obtenirGithubStats() {
  try {
    const data = await fetchJson(`https://api.github.com/users/${GITHUB_USERNAME}`);
    afficherGithubStats(data);
  } catch (error) {
    console.error(error);
    afficherGithubStats(demoGithub, true);
  }
}

weatherForm.addEventListener("submit", (event) => {
  event.preventDefault();
  obtenirMeteo(cityInput.value);
});

locationButton.addEventListener("click", obtenirPosition);

themeButton.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  applyTheme(currentTheme === "dark" ? "light" : "dark");
});

applyTheme(localStorage.getItem(THEME_STORAGE_KEY) || "light");
obtenirMeteo(cityInput.value);
obtenirGithubStats();
