import copy
import random
import time

from db_init import (
    collection_heroes,
    collection_monstres,
    collection_scores,
    initialiser_db,
)
from utils import (
    afficher_top_scores,
    charger_heroes_db,
    charger_monstres_db,
    intro,
    lire_top_scores,
    menu_principal_affichage,
    save_score,
)


def nom_personnage(personnage):
    return next(iter(personnage))


def stats_personnage(personnage):
    return personnage[nom_personnage(personnage)]


def ask_pseudo():
    while True:
        username = input("Veuillez choisir votre pseudo pour cette partie : ").strip()
        pseudo_valide = username.replace("_", "").isalnum()

        if 2 <= len(username) <= 12 and pseudo_valide:
            return username

        print("Pseudo incorrect : lettres, chiffres ou underscore, entre 2 et 12 caracteres.")


# PARTIE EQUIPE

def afficher_perso(heroes):
    print("\n=== HEROS DISPONIBLES ===")

    for index, hero in enumerate(heroes, start=1):
        nom = nom_personnage(hero)
        stats = stats_personnage(hero)
        print(f"{index}. {nom} - ATK {stats['ATK']} / DEF {stats['DEF']} / PV {stats['PV']}")


def afficher_team(team):
    print("\nVotre equipe est composee de :")

    for hero in team:
        nom = nom_personnage(hero)
        stats = stats_personnage(hero)
        print(f"- {nom} (ATK {stats['ATK']}, DEF {stats['DEF']}, PV {stats['PV']})")


def converti_equipe_objet(choix, heroes):
    noms_vers_heroes = {nom_personnage(hero).lower(): hero for hero in heroes}
    team = []

    for nom in choix:
        hero = noms_vers_heroes.get(nom.lower())
        if hero and hero not in team:
            team.append(copy.deepcopy(hero))

    return team


def changement(choix, heroes):
    modif = input("Ecris VALIDER pour valider l'equipe, ou CHANGER pour la changer : ").strip().upper()

    if modif == "VALIDER":
        return choix
    if modif == "CHANGER":
        return create_team(heroes)

    return changement(choix, heroes)


def create_team(heroes):
    while True:
        afficher_perso(heroes)
        choix = input("\nChoisissez 3 personnages avec leurs noms separes par un espace : ").split()
        team = converti_equipe_objet(choix, heroes)

        if len(team) != 3:
            print("Selection invalide : il faut exactement 3 heros valides et differents.")
            continue

        afficher_team(team)
        return changement(team, heroes)


# PARTIE COMBAT

def attaque(team):
    stats_attaquant = []

    for hero in team:
        stats = stats_personnage(hero)
        if stats["PV"] > 0:
            stats_attaquant.append(stats["ATK"])

    return stats_attaquant


def defense(perso_defendant, stats_attaquant):
    stats_defendeur = stats_personnage(perso_defendant)
    points_attaque = sum(stats_attaquant)
    pv_defendeur = stats_defendeur["PV"]

    pv_defendeur -= points_attaque * (1 - stats_defendeur["DEF"] / 100)
    stats_defendeur["PV"] = max(pv_defendeur, 0)

    return stats_defendeur["PV"]


def choix_monstre(monstres):
    return copy.deepcopy(random.choice(monstres))


def appliquer_potion(team, monstre, monstre_nom):
    print("\nVous avez le choix entre 3 potions")
    choix_potion = input(
        "1 - Potion de soin : +20 PV pour l'equipe\n"
        "2 - Potion de degat : +10 ATK pour l'equipe\n"
        "3 - Potion mystere\n"
        "Votre choix : "
    ).strip()

    if choix_potion == "1":
        for hero in team:
            stats_personnage(hero)["PV"] += 20
        print("Potion de soin utilisee : +20 PV pour toute l'equipe")
    elif choix_potion == "2":
        for hero in team:
            stats_personnage(hero)["ATK"] += 10
        print("Potion de degat utilisee : +10 ATK pour toute l'equipe")
    elif choix_potion == "3":
        monstre[monstre_nom]["PV"] += 1000
        print("Potion mystere : le monstre gagne 1000 PV")
    else:
        print("Choix invalide : aucune potion utilisee")


def deroulement_partie(team, monstre, monstre_nom):
    nb_tour = 0
    tour_joueur = True

    while True:
        if tour_joueur:
            print("\n--- Tour de l'equipe ---")
            pv_monstre = defense(monstre, attaque(team))

            if pv_monstre <= 0:
                print(f"\n{monstre_nom} est vaincu. Vous avez gagne.")
                return True

            print(f"{monstre_nom} a {int(pv_monstre)} PV restants")
            nb_tour += 1
            tour_joueur = False
            time.sleep(0.35)
            continue

        print("\n--- Tour du monstre ---")
        atk_monstre = monstre[monstre_nom]["ATK"]
        print(f"{monstre_nom} attaque avec {atk_monstre} ATK")

        for hero in team:
            hero_nom = nom_personnage(hero)
            if stats_personnage(hero)["PV"] <= 0:
                continue

            pv_hero = defense(hero, [atk_monstre])
            if pv_hero <= 0:
                print(f"{hero_nom} est KO")
            else:
                print(f"{hero_nom} a {int(pv_hero)} PV restants")

        nb_tour += 1

        if nb_tour % 3 == 0:
            print(f"Vous avez atteint {nb_tour} tours.")
            appliquer_potion(team, monstre, monstre_nom)

        if all(stats_personnage(hero)["PV"] <= 0 for hero in team):
            print("\nL'equipe est KO, vous avez perdu.")
            return False

        tour_joueur = True
        time.sleep(0.35)


def combat(team, monstres):
    print("------------ Le combat commence ------------")

    compteur_win = 0
    while True:
        monstre = choix_monstre(monstres)
        monstre_nom = nom_personnage(monstre)
        print(f"\nUn adversaire apparait : {monstre_nom} (PV : {monstre[monstre_nom]['PV']})")

        victoire = deroulement_partie(team, monstre, monstre_nom)
        if victoire:
            compteur_win += 1
            print(f"Vagues survecues : {compteur_win}")
        else:
            break

    return compteur_win


def lancer_jeu():
    heroes = charger_heroes_db(collection_heroes)
    monstres = charger_monstres_db(collection_monstres)

    if len(heroes) < 3 or not monstres:
        print("Base de donnees incomplete : impossible de lancer la partie.")
        return

    pseudo = ask_pseudo()
    print(f"\nBonne chance, {pseudo}.\n")

    team = create_team(heroes)
    score = combat(team, monstres)

    print(f"\nPartie terminee. Score de {pseudo} : {score} vagues")
    save_score(collection_scores, pseudo, score)
    afficher_top_scores(lire_top_scores(collection_scores))


def afficher_classement():
    afficher_top_scores(lire_top_scores(collection_scores))


def menu_principal():
    initialiser_db()
    intro()

    while True:
        menu_principal_affichage()
        choix = input("Choix : ").strip()

        if choix == "1":
            lancer_jeu()
        elif choix == "2":
            afficher_classement()
        elif choix == "3":
            print("A bientot.")
            break
        else:
            print("Choix invalide.")
