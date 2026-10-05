# Jeu Python avec base de donnees

Jeu console en Python : le joueur choisit une equipe de 3 heros, affronte des vagues d'adversaires et sauvegarde son score.

## Lancement

```bash
python game.py
```

Le jeu utilise MongoDB si un serveur local est disponible. Sinon, il bascule automatiquement sur un fichier `local_database.json`, ce qui permet de lancer la demo sans configuration.

## Fonctionnalites

- selection controlee d'une equipe de 3 heros
- combat tour par tour
- potions tous les 3 tours
- classement des meilleurs scores
- stockage MongoDB ou JSON local
