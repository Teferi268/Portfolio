const MON_MAIL = "mathieu.morinm@gmail.com";
const NOM_DU_SITE = "@mathieu-morin-dev";

const nasProject = {
  images: {
    infrastructure: "public/projects/nas/nas-truenas.png",
    services: "public/projects/nas/services-homelab.svg",
    remoteAccess: "public/projects/nas/tailscale-acces-distant.png",
    monitoring: "assets/truenas-dashboard.png",
  },
  fallbacks: {
    monitoring: "assets/truenas-dashboard.png",
  },
};

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
  const categorieActive = { valeur: "tous" };

  const actualiserProjets = () => {
    let visibles = 0;

    projets.forEach((projet) => {
      const garde = categorieActive.valeur === "tous" || projet.dataset.cat === categorieActive.valeur;
      projet.classList.toggle("masque", !garde);
      if (garde) visibles += 1;
    });

    if (vide) vide.hidden = visibles > 0;
  };

  filtres.forEach((filtre) => {
    filtre.addEventListener("click", () => {
      categorieActive.valeur = filtre.dataset.filter;
      filtres.forEach((autre) => autre.classList.toggle("actif", autre === filtre));
      actualiserProjets();
    });
  });

  actualiserProjets();
};

const initialiserDetailsProjets = () => {
  document.querySelectorAll(".projet").forEach((projet) => {
    const bouton = projet.querySelector("[data-details-toggle]");
    if (!bouton) return;

    const sections = projet.querySelectorAll(
      ".nas-details, .hungry-shot-section, .hungry-shot-grid, .hungry-shot-links"
    );
    sections.forEach((section) => {
      section.hidden = true;
    });

    bouton.addEventListener("click", () => {
      const ouvert = bouton.getAttribute("aria-expanded") === "true";
      bouton.setAttribute("aria-expanded", String(!ouvert));
      projet.classList.toggle("details-open", !ouvert);
      bouton.innerHTML = ouvert
        ? '<i class="fa-solid fa-arrow-down" aria-hidden="true"></i> En apprendre plus'
        : '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i> Réduire les détails';
      sections.forEach((section) => {
        section.hidden = ouvert;
      });
    });
  });
};

// Section NAS : onglets internes et chargement d'images sans apercu casse
const chargerImageNas = (bloc, chemins) => {
  const [source, ...suivants] = chemins.filter(Boolean);

  if (!source) {
    bloc.classList.add("image-manquante");
    return;
  }

  const image = new Image();
  const titre = bloc.closest(".nas-carte-realisation")?.querySelector("h5")?.textContent?.trim();
  image.loading = "lazy";
  image.decoding = "async";
  image.alt = titre ? `Capture ${titre}` : "Capture du projet NAS TrueNAS";

  image.addEventListener("load", () => {
    bloc.replaceChildren(image);
    bloc.classList.add("image-chargee");
    bloc.classList.remove("image-manquante");
  });

  image.addEventListener("error", () => chargerImageNas(bloc, suivants));
  image.src = source;
};

const initialiserNasProject = () => {
  const projet = document.querySelector(".nas-projet");

  if (!projet) return;

  const tabs = Array.from(projet.querySelectorAll("[data-nas-tab]"));
  const panels = Array.from(projet.querySelectorAll("[data-nas-panel]"));

  const afficherOnglet = (nom, avecFocus = false) => {
    tabs.forEach((tab) => {
      const actif = tab.dataset.nasTab === nom;
      tab.classList.toggle("actif", actif);
      tab.setAttribute("aria-selected", String(actif));
      tab.tabIndex = actif ? 0 : -1;

      if (actif && avecFocus) {
        tab.focus();
      }
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.nasPanel !== nom;
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => afficherOnglet(tab.dataset.nasTab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;

      event.preventDefault();
      let prochainIndex = index;

      if (event.key === "ArrowRight") prochainIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") prochainIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") prochainIndex = 0;
      if (event.key === "End") prochainIndex = tabs.length - 1;

      afficherOnglet(tabs[prochainIndex].dataset.nasTab, true);
    });
  });

  projet.querySelectorAll(".nas-media[data-nas-image]").forEach((bloc) => {
    const cleImage = bloc.dataset.nasImage;
    chargerImageNas(bloc, [nasProject.images[cleImage], nasProject.fallbacks[cleImage]]);
  });
};

// Copie de l'adresse e-mail
const initialiserContact = () => {
  const copyButton = document.querySelector("#copy-btn");
  const copyIcon = copyButton.querySelector("i");

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
initialiserDetailsProjets();
initialiserNasProject();
initialiserContact();
document.querySelector("#year").textContent = String(new Date().getFullYear());
