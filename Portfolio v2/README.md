# Portfolio — Mathieu Morin

Site personnel d'une seule page, écrit à la main en HTML, CSS et JavaScript.
Aucun framework, aucune étape de compilation : on ouvre le dossier, ça marche.

## Organisation du dossier

```
Portfolio/
├── index.html      la page : HOME, ABOUT, WORK, CONTACT
├── style.css       toutes les feuilles de style, thème clair et sombre
├── script.js       thème, menu, fil d'Ariane, filtres, formulaire
├── assets/
│   └── CV.pdf      le CV, lié depuis le bouton du hero et la fiche contact
└── README.md
```

Chaque fichier a une responsabilité claire :

- `index.html` contient la structure et le contenu visible de la page.
- `style.css` contient la présentation, organisée par zone de la page puis par
  responsive.
- `script.js` contient les comportements : thème, navigation, animations, menu
  mobile, filtres et formulaire de contact.
- `assets/` contient les fichiers utilisés par la page, comme le CV.

Le petit script placé dans le `<body>` de `index.html` est volontaire : il applique
le thème sauvegardé avant l'affichage pour éviter un flash en mode clair. La logique
complète du bouton reste dans `script.js`.

## Voir le site en local

Un double-clic sur `index.html` suffit. Pour être au plus près des conditions
réelles (chemins relatifs, polices) :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Mettre en ligne sur GitHub Pages

`Settings` → `Pages` → `Source: Deploy from a branch` → branche `main`, dossier `/ (root)`.
Le site est publié quelques minutes plus tard. Rien à configurer d'autre : tout est statique.

## Modifier le site plus tard

Les repères sont signalés par des commentaires `<!-- À personnaliser -->` dans `index.html`.

Pour savoir où intervenir :

- **Texte, liens, projets et parcours** : `index.html`, dans la section concernée.
- **Couleurs, polices et espacements** : `style.css`, en commençant par `:root`
  et `.mode-sombre`.
- **Interactions** : `script.js`, avec une fonction `initialiser...` par comportement.
- **CV ou document** : `assets/`, puis le lien correspondant dans `index.html`.

- **ABOUT** — les trois paragraphes de présentation, les pastilles `.facts`,
  les lignes du terminal et les six cartes de compétences.
- **Parcours** — dates, intitulés et établissements de la frise.
- **WORK** — les six projets : titre, description, étiquettes, état
  (`ok` = terminé, `wip` = en cours) et lien vers le dépôt. Chaque carte porte
  un `data-cat` (`infra`, `script`, `web`) qui alimente les filtres : pour
  ajouter une catégorie, ajouter un bouton `.filter` avec le `data-filter`
  correspondant.
- **Hero** — la ligne « En ce moment » et sa date, à rafraîchir de temps en temps.

## Détails d'implémentation

- **Thème** — le choix est retenu dans `localStorage`. À la première visite, le
  réglage du système fait foi. Un petit script en tête de `<body>` applique le
  thème avant le rendu pour éviter le clignotement blanc.
- **Fil d'Ariane** — `@mathieu-morin-dev/…` suit la section lue, via un
  `IntersectionObserver`.
- **Formulaire de contact** — il n'y a pas de serveur : après validation, le
  message est préparé dans le client mail de la personne (`mailto:`). Pour un
  envoi direct, remplacer la fonction `initialiserContact` dans `script.js` par
  un service type Formspree et un attribut `action` sur le formulaire.
- **Accessibilité** — lien d'évitement, focus visible, `aria-*` sur les boutons,
  et les animations se coupent si le système demande à les réduire.

## Dépendances externes

Chargées depuis un CDN, aucune installation :

- [Syne](https://fonts.google.com/specimen/Syne) et
  [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) via Google Fonts
- [Font Awesome 6.5.2](https://fontawesome.com/) pour les icônes
