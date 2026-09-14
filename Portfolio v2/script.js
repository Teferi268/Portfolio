const MON_MAIL = "mathieu.morinm@gmail.com";
const NOM_DU_SITE = "@mathieu-morin-dev";

// Theme
const initialiserTheme = () => {
  const themeButton = document.querySelector("#theme-btn");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    document.body.classList.toggle("mode-sombre", savedTheme === "dark");
  }

  const updateThemeButton = () => {
    const isDarkMode = document.body.classList.contains("mode-sombre");
    themeButton.setAttribute("aria-label", isDarkMode ? "Activer le mode clair" : "Activer le mode sombre");
    themeButton.setAttribute("aria-pressed", String(isDarkMode));
  };

  updateThemeButton();
  themeButton.addEventListener("click", () => {
    const isDarkMode = document.body.classList.toggle("mode-sombre");
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    updateThemeButton();
  });
};

// Navigation et fil d'Ariane
const initialiserNavigation = () => {
  const path = document.querySelector(".chemin");
  const links = document.querySelectorAll(".lien-navigation");
  const sections = document.querySelectorAll("main section[id]");

  const setPage = (pageName) => {
    path.textContent = `${NOM_DU_SITE}/${pageName}`;
    links.forEach((link) => {
      link.classList.toggle("actif", link.getAttribute("href") === `#${pageName}`);
    });
  };

  path.addEventListener("click", () => setPage("HOME"));
  links.forEach((link) => link.addEventListener("click", () => setPage(link.textContent)));

  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setPage(entry.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => spy.observe(section));
  }
};

// Apparition progressive des blocs
const initialiserApparitions = () => {
  const blocs = document.querySelectorAll(".apparition");

  if (!("IntersectionObserver" in window)) {
    blocs.forEach((bloc) => bloc.classList.add("apparue"));
    return;
  }

  const apparition = new IntersectionObserver(
    (entries, observer) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("apparue");
        observer.unobserve(entry.target);
      }
    }),
    { rootMargin: "0px 0px -10% 0px", threshold: 0 }
  );
  blocs.forEach((bloc) => apparition.observe(bloc));
};

// Menu mobile et header au defilement
const initialiserHeader = () => {
  const header = document.querySelector("header");
  const burger = document.querySelector("#burger");
  const links = document.querySelectorAll(".lien-navigation");

  const fermerMenu = () => {
    header.classList.remove("menu-ouvert");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Ouvrir le menu");
  };

  burger.addEventListener("click", () => {
    const ouvert = header.classList.toggle("menu-ouvert");
    burger.setAttribute("aria-expanded", String(ouvert));
    burger.setAttribute("aria-label", ouvert ? "Fermer le menu" : "Ouvrir le menu");
  });
  links.forEach((link) => link.addEventListener("click", fermerMenu));
  document.addEventListener("keydown", (event) => event.key === "Escape" && fermerMenu());

  const majHeader = () => header.classList.toggle("defilement", window.scrollY > 20);
  majHeader();
  window.addEventListener("scroll", majHeader, { passive: true });
};

// Filtres des projets
const initialiserFiltres = () => {
  const filtres = document.querySelectorAll(".filtre");
  const projets = document.querySelectorAll(".projet");
  const vide = document.querySelector("#empty");

  filtres.forEach((filtre) => {
    filtre.addEventListener("click", () => {
      const categorie = filtre.dataset.filter;
      let visibles = 0;

      filtres.forEach((autre) => autre.classList.toggle("actif", autre === filtre));
      projets.forEach((projet) => {
        const garde = categorie === "tous" || projet.dataset.cat === categorie;
        projet.classList.toggle("masque", !garde);
        if (garde) visibles += 1;
      });
      vide.hidden = visibles > 0;
    });
  });
};

// Formulaire de contact et copie de l'adresse e-mail
const initialiserContact = () => {
  const form = document.querySelector("#form");
  const note = document.querySelector("#form-note");
  const copyButton = document.querySelector("#copy-btn");
  const copyIcon = copyButton.querySelector("i");
  const emailValide = (valeur) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valeur);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const nom = form.nom.value.trim();
    const email = form.email.value.trim();
    const sujet = form.sujet.value.trim();
    const message = form.message.value.trim();
    const emailIncorrect = !emailValide(email);

    form.nom.setAttribute("aria-invalid", String(nom === ""));
    form.email.setAttribute("aria-invalid", String(emailIncorrect));
    form.message.setAttribute("aria-invalid", String(message === ""));

    if (nom === "" || emailIncorrect || message === "") {
      note.textContent = "Il manque le nom, un e-mail valide ou le message.";
      note.className = "note-formulaire erreur";
      return;
    }

    const objet = sujet === "" ? `Message de ${nom}` : sujet;
    const corps = `${message}\n\n--\n${nom}\n${email}`;
    note.textContent = "Votre messagerie s'ouvre avec le message pret a partir.";
    note.className = "note-formulaire ok";
    window.location.href = `mailto:${MON_MAIL}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(corps)}`;
  });

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(MON_MAIL);
      copyIcon.className = "fa-solid fa-check";
      copyButton.setAttribute("aria-label", "Adresse copiee");
      setTimeout(() => {
        copyIcon.className = "fa-regular fa-copy";
        copyButton.setAttribute("aria-label", "Copier l'adresse e-mail");
      }, 1600);
    } catch {
      copyButton.setAttribute("aria-label", "Copie impossible, selectionnez l'adresse");
    }
  });
};

initialiserTheme();
initialiserNavigation();
initialiserApparitions();
initialiserHeader();
initialiserFiltres();
initialiserContact();
document.querySelector("#year").textContent = String(new Date().getFullYear());
