const CLE_API = "b6d40be140f46cfb4637d5ff5cb4deee";

const entreeVille = document.getElementById("entreeVille");
const boutonRecherche = document.getElementById("boutonRecherche");
const chargementEl = document.getElementById("chargement");
const contenuEl = document.getElementById("contenu");


async function obtenirMeteo(ville) {
    chargementEl.style.display = "block";
    contenuEl.style.display = "none";

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ville)}&units=metric&lang=fr&appid=${CLE_API}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Ville introuvable");
        const donnees = await response.json();
        afficherMeteo(donnees);
    } catch (error) {
        chargementEl.textContent = "Impossible de charger la météo.";
        console.error(error);
    }
}

function afficherMeteo(donnees) {
    const nomVille = `${donnees.name}, ${donnees.sys.country}`;
    const temperature = Math.round(donnees.main.temp);
    const description = donnees.weather[0].description;
    const humidite = donnees.main.humidity;
    const vitesseVent = Math.round(donnees.wind.speed);
    const pression = donnees.main.pressure;
    const ressenti = Math.round(donnees.main.feels_like);
    const visibilite = (donnees.visibility / 1000).toFixed(1);

    document.getElementById("nomVille").textContent = nomVille;
    document.getElementById("temperature").textContent = `${temperature}°C`;
    document.getElementById("description").textContent = description;
    document.getElementById("humidite").textContent = `${humidite}%`;
    document.getElementById("vent").textContent = `${vitesseVent} km/h`;
    document.getElementById("pression").textContent = `${pression} hPa`;
    document.getElementById("ressenti").textContent = `${ressenti}°C`;
    document.getElementById("visibilite").textContent = `${visibilite} km`;

    chargementEl.style.display = "none";
    contenuEl.style.display = "block";
}

boutonRecherche.addEventListener("click", () => {
    const ville = entreeVille.value.trim();
    if (ville) obtenirMeteo(ville);
});

entreeVille.addEventListener("keypress", (e) => {
    if (e.key === "Enter") boutonRecherche.click();
});

// Géolocalisation de l'ordi

// Au chargement, chercher la position
function initialiserdashboard() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => obtenirVilleDepuisCoords(position),
            (error) => {
                console.log("Géoloc refusée, fallback sur Paris");
                obtenirMeteo("Paris"); // Fallback
            }
        );
    } else {
        console.log("Géolocalisation non supportée");
        obtenirMeteo("Paris");
    }
}

// Transformer les coordonnées en nom de ville
async function obtenirVilleDepuisCoords(position) {
    const { latitude, longitude } = position.coords;
    
    console.log(`Coords: ${latitude}, ${longitude}`);
    
    // API OpenStreetMap Nominatim (gratuite, pas de clé)
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    
    try {
        const response = await fetch(url);
        const donnees = await response.json();
        
        // Extraire le nom de la ville
        const ville = donnees.address.city || 
                      donnees.address.town || 
                      donnees.address.village ||
                      "Paris"; // Fallback
        
        console.log(`Ville trouvée: ${ville}`);
        obtenirMeteo(ville); // Chercher la météo de cette ville
        
    } catch (err) {
        console.log("Erreur géoloc, fallback sur Paris");
        obtenirMeteo("Paris");
    }
};



//github données 

const GITHUB_USERNAME = "Teferi268"; 

async function obtenirGithubStats() {
    const url = `https://api.github.com/users/${GITHUB_USERNAME}`;
    
    try {
        const response = await fetch(url);
        const donnees = await response.json();
        
        // Vérifier si l'utilisateur existe
        if (donnees.message === "Not Found") {
            console.log("Username GitHub non trouvé");
            return;
        }
        
        afficherGithubStats(donnees);
        
    } catch (err) {
        console.log("Erreur récupération GitHub stats:", err);
    }
}

function afficherGithubStats(donnees) {
    // Récupérer les éléments HTML (on va les créer après)
    const githubNom = document.getElementById("github-nom");
    const githubAvatar = document.getElementById("github-avatar");
    const githubBio = document.getElementById("github-bio");
    const githubRepos = document.getElementById("github-repos");
    const githubFollowers = document.getElementById("github-followers");
    const githubLink = document.getElementById("github-link");
    
    // Remplir les données
    githubNom.textContent = donnees.name || donnees.login;
    githubAvatar.src = donnees.avatar_url;
    githubBio.textContent = donnees.bio || "Pas de bio";
    githubRepos.textContent = donnees.public_repos;
    githubFollowers.textContent = donnees.followers;
    githubLink.href = donnees.html_url;
}

// Appeler au chargement
document.addEventListener("DOMContentLoaded", () => {
    initialiserdashboard();
    obtenirGithubStats();   // GitHub stats
});
