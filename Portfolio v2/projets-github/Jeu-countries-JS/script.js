const url = "https://restcountries.com/v3.1/all?fields=name,translations,flags,region,capital,population,cca2";
// Recuperation du bouton et de la zone pour le drapeau
const button = document.querySelector(".select_country");
const flag_container = document.querySelector(".show_flag");
const quizz = document.querySelector(".game");
const nb_proposition = 3; // Nombre de proposition pour le choix du pays
let selectedRegion = "ALL";

let countriesCache = [];

const navbar = document.querySelector(".navbar");

navbar.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-region]");
  if (!link) return;

  event.preventDefault();
  selectedRegion = link.dataset.region;
});

// Recuperation de l'API
async function fetchCountries() {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erreur API");
  const data = await res.json();

  return data
    .filter(c => c?.name?.common && (c?.flags?.svg || c?.flags?.png) && c?.region).map(c => ({
      name: c?.translations?.fra?.common || c.name.common,
      flag: c.flags.svg || c.flags.png,
      region: c.region,
      code: c.cca2,
      capital: c.capital?.[0] || "Inconnue",
      population: c.population || 0
    }));
}

function getChoices(countries, correctCountry, count) {
    const choices = [correctCountry];

    while (choices.length < count) {
        const candidate = getRandomCountry(countries);
        const alreadyInChoices = choices.some((c) => c.name === candidate.name);

        if (!alreadyInChoices) {
            choices.push(candidate);
        }
    }

    return choices.sort(() => Math.random() - 0.5);
}

function getRandomCountry(countries) {
    const index = Math.floor(Math.random()*countries.length);
    return countries[index];
}
async function showRandomFlag() {
    try{
        if (countriesCache.length === 0){
            countriesCache = await fetchCountries();
        }

        const pool = selectedRegion === "ALL"
            ? countriesCache
            : countriesCache.filter((c) => c.region === selectedRegion);

        
        if (pool.length < nb_proposition) {
            throw new Error("Pas assez de pays dans cette région");
        }

        const country = getRandomCountry(pool);
        flag_container.innerHTML =`
            <img src="${country.flag}" alt="Drapeau de ${country.name}" width="400px" max-height ="300px" max-width ="400px">
            
        `;
        const choices = getChoices(pool, country, nb_proposition);
        let quizBox = document.querySelector(".quizz");
        if (!quizBox) {
        quizz.insertAdjacentHTML("beforeend", `
            <div class="quizz">
            <p>Propositions</p>
            <div class="choix_pays"></div>
            <input class="submitBtn" type="button" value="Ma reponse...">
            <p class="resultat"></p>
            </div>
        `);
        quizBox = document.querySelector(".quizz");
        }

        const choixPays = quizBox.querySelector(".choix_pays");
        choixPays.innerHTML = choices.map(c => `
        <p><input name="bouton_pays" type="radio" value="${c.name}"> ${c.name}</p>
        `).join("");

        quizBox.dataset.answer = country.name;
        const result = quizBox.querySelector(".resultat");
        result.textContent = "";
    } catch (error) {
        console.error(error);
        flag_container.innerHTML = `<p>Impossible de charger les pays.</p>`;
    }
}

function verify_answer() {
    const quizBox = document.querySelector(".quizz");
    if (!quizBox) return;

    const selected = quizBox.querySelector('input[name="bouton_pays"]:checked');

    const bonneReponse = quizBox.dataset.answer;

    if (!selected) {
        quizBox.querySelector(".resultat").textContent = "Sélectionnez une réponse.";
        return;
    }

    if (selected.value === bonneReponse) {
        flag_container.innerHTML = `<p class = "blink" color = "green">BRAVO !!</p>`
    } else {
        flag_container.innerHTML = `<p class = "blink" color = "red">PERDU</p>`
    }
}

quizz.addEventListener("click", (event) => {
    if (event.target.classList.contains("submitBtn")) {
        verify_answer();
    }
});

button.addEventListener("click", showRandomFlag);
