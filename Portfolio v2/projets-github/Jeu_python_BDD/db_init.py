import copy
import json
from pathlib import Path

try:
    from pymongo import MongoClient
except ImportError:
    MongoClient = None


DATA_FILE = Path(__file__).with_name("local_database.json")

heroes = [
    {"nom": "Guerrier", "ATK": 15, "DEF": 10, "PV": 100},
    {"nom": "Mage", "ATK": 20, "DEF": 5, "PV": 80},
    {"nom": "Archer", "ATK": 18, "DEF": 7, "PV": 90},
    {"nom": "Voleur", "ATK": 22, "DEF": 8, "PV": 85},
    {"nom": "Paladin", "ATK": 14, "DEF": 12, "PV": 110},
    {"nom": "Sorcier", "ATK": 25, "DEF": 3, "PV": 70},
    {"nom": "Chevalier", "ATK": 17, "DEF": 15, "PV": 120},
    {"nom": "Moine", "ATK": 19, "DEF": 9, "PV": 95},
    {"nom": "Berserker", "ATK": 23, "DEF": 6, "PV": 105},
    {"nom": "Chasseur", "ATK": 16, "DEF": 11, "PV": 100},
]

monstres = [
    {"nom": "Sentinelle", "ATK": 10, "DEF": 5, "PV": 50},
    {"nom": "Brute", "ATK": 20, "DEF": 8, "PV": 120},
    {"nom": "Dragon", "ATK": 35, "DEF": 20, "PV": 300},
    {"nom": "Revenant", "ATK": 12, "DEF": 6, "PV": 70},
    {"nom": "Colosse", "ATK": 25, "DEF": 15, "PV": 200},
    {"nom": "Spectre", "ATK": 18, "DEF": 10, "PV": 100},
    {"nom": "Golem", "ATK": 30, "DEF": 25, "PV": 250},
    {"nom": "Vampire", "ATK": 22, "DEF": 12, "PV": 150},
    {"nom": "Lycan", "ATK": 28, "DEF": 18, "PV": 180},
    {"nom": "Squelette", "ATK": 15, "DEF": 7, "PV": 90},
]


class LocalCursor(list):
    def sort(self, field, direction=1):
        reverse = direction < 0
        return LocalCursor(sorted(self, key=lambda doc: doc.get(field, 0), reverse=reverse))

    def limit(self, amount):
        return LocalCursor(self[:amount])


class LocalCollection:
    def __init__(self, store, name):
        self.store = store
        self.name = name
        self.store.data.setdefault(name, [])

    def _matches(self, document, query):
        return all(document.get(key) == value for key, value in (query or {}).items())

    def count_documents(self, query=None):
        return len([doc for doc in self.store.data[self.name] if self._matches(doc, query)])

    def insert_many(self, documents):
        self.store.data[self.name].extend(copy.deepcopy(list(documents)))
        self.store.save()

    def insert_one(self, document):
        self.store.data[self.name].append(copy.deepcopy(document))
        self.store.save()

    def find(self, query=None, projection=None):
        documents = [
            copy.deepcopy(doc)
            for doc in self.store.data[self.name]
            if self._matches(doc, query)
        ]

        if projection:
            excluded = {key for key, value in projection.items() if value == 0}
            for document in documents:
                for key in excluded:
                    document.pop(key, None)

        return LocalCursor(documents)


class LocalStore:
    def __init__(self, path):
        self.path = path
        self.data = self.load()

    def load(self):
        if not self.path.exists():
            return {}

        try:
            return json.loads(self.path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return {}

    def save(self):
        self.path.write_text(
            json.dumps(self.data, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    def collection(self, name):
        return LocalCollection(self, name)


def creer_collections():
    if MongoClient is not None:
        try:
            client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=500)
            client.admin.command("ping")
            db = client["Database"]
            return db["heroes"], db["monstre"], db["scores"], "MongoDB"
        except Exception:
            pass

    store = LocalStore(DATA_FILE)
    return (
        store.collection("heroes"),
        store.collection("monstre"),
        store.collection("scores"),
        "JSON local",
    )


collection_heroes, collection_monstres, collection_scores, BACKEND = creer_collections()


def initialiser_db():
    if collection_heroes.count_documents({}) == 0:
        collection_heroes.insert_many(heroes)

    if collection_monstres.count_documents({}) == 0:
        collection_monstres.insert_many(monstres)

    print(f"Stockage utilise : {BACKEND}")
