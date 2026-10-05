def intro():
	print("=" * 50)
	print("       BIENVENUE DANS L'ARENE DES HEROS")
	print("=" * 50)
	print()
	print("Formez votre equipe et affrontez des vagues d'adversaires.")
	print()
	print("Regles du jeu :")
	print("- Choisissez 3 heros pour votre equipe")
	print("- Combattez tour par tour")
	print("- Une potion est proposee tous les 3 tours")
	print("- Survivez le plus longtemps possible")
	print()
	print("-" * 50)


def menu_principal_affichage():
	print("\n=== MENU PRINCIPAL ===")
	print("1. Demarrer le jeu")
	print("2. Afficher le classement")
	print("3. Quitter")


def charger_heroes_db(collection_heroes):
	heroes = []
	for doc in collection_heroes.find({}, {"_id": 0}):
		if "nom" in doc:
			heroes.append({doc["nom"]: {"ATK": doc["ATK"], "DEF": doc["DEF"], "PV": doc["PV"]}})
		else:
			for key, value in doc.items():
				if isinstance(value, dict) and {"ATK", "DEF", "PV"}.issubset(value):
					heroes.append({key: value})
					break
	return heroes


def charger_monstres_db(collection_monstres):
	monstres = []
	for doc in collection_monstres.find({}, {"_id": 0}):
		if "nom" in doc:
			monstres.append(
				{doc["nom"]: {"ATK": doc["ATK"], "DEF": doc["DEF"], "PV": doc["PV"]}}
			)
		else:
			for key, value in doc.items():
				if isinstance(value, dict) and {"ATK", "DEF", "PV"}.issubset(value):
					monstres.append({key: value})
					break
	return monstres


def save_score(collection_scores, pseudo, score):
	collection_scores.insert_one({"pseudo": pseudo, "score": score})


def lire_top_scores(collection_scores, limite=3):
	return list(collection_scores.find({}, {"_id": 0}).sort("score", -1).limit(limite))


def afficher_top_scores(scores):
	print("\n=== TOP 3 SCORES ===")
	if len(scores) == 0:
		print("Aucun score enregistre.")
		return

	for rang, score in enumerate(scores, start=1):
		print(f"{rang}. {score['pseudo']} - {score['score']} vagues")
