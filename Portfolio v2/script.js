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
  const submitButton = form.querySelector('button[type="submit"]');
  const copyButton = document.querySelector("#copy-btn");
  const copyIcon = copyButton.querySelector("i");
  const emailValide = (valeur) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valeur);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const champs = form.elements;
    const nomChamp = champs.namedItem("nom");
    const emailChamp = champs.namedItem("email");
    const sujetChamp = champs.namedItem("sujet");
    const messageChamp = champs.namedItem("message");
    const honeypotChamp = champs.namedItem("_honey");
    const nom = nomChamp.value.trim();
    const email = emailChamp.value.trim();
    const sujet = sujetChamp.value.trim();
    const message = messageChamp.value.trim();
    const honeypot = honeypotChamp.value.trim();
    const emailIncorrect = !emailValide(email);

    nomChamp.setAttribute("aria-invalid", String(nom === ""));
    emailChamp.setAttribute("aria-invalid", String(emailIncorrect));
    messageChamp.setAttribute("aria-invalid", String(message === ""));

    if (nom === "" || emailIncorrect || message === "") {
      note.textContent = "Il manque le nom, un e-mail valide ou le message.";
      note.className = "note-formulaire erreur";
      return;
    }

    if (honeypot !== "") {
      note.textContent = "Message envoye. Merci pour votre contact.";
      note.className = "note-formulaire ok";
      form.reset();
      return;
    }

    if (!window.fetch || window.location.protocol === "file:") {
      note.textContent = "Ouverture de la page d'envoi securisee...";
      note.className = "note-formulaire";
      HTMLFormElement.prototype.submit.call(form);
      return;
    }

    const objet = sujet === "" ? `Message de ${nom}` : sujet;
    const endpoint = form.dataset.endpoint;

    submitButton.disabled = true;
    submitButton.textContent = "ENVOI...";
    note.textContent = "Envoi du message en cours...";
    note.className = "note-formulaire";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          nom,
          email,
          sujet: objet,
          message,
          _replyto: email,
          _subject: `Portfolio - ${objet}`,
          _template: "table",
          _captcha: "false",
        }),
      });
      const data = await response.json().catch(() => ({}));
      const serviceError = data.success === false || data.success === "false" || data.ok === false || data.error;

      if (!response.ok || serviceError) {
        throw new Error(data.message || data.error || "Envoi impossible");
      }

      form.reset();
      note.textContent = "Message envoye. Je vous repondrai rapidement.";
      note.className = "note-formulaire ok";
    } catch (error) {
      const message = error.message.toLowerCase();
      note.textContent = message.includes("activat")
        ? "Formulaire a activer : cliquez sur le mail de confirmation FormSubmit, puis renvoyez le message."
        : "L'envoi automatique a echoue. Vous pouvez me contacter directement par e-mail.";
      note.className = "note-formulaire erreur";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "ENVOYER";
    }
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
