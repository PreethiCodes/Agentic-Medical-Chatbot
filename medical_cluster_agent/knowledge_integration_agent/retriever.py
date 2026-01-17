import json
import os

BASE_DIR = os.path.dirname(__file__)
INDEX_PATH = os.path.join(BASE_DIR, "medical_index", "medical_docs.json")

with open(INDEX_PATH, "r", encoding="utf-8") as f:
    MEDICAL_DOCS = json.load(f)

def retrieve(query: str, top_k: int = 3):
    q = query.lower()
    scored = []

    for doc in MEDICAL_DOCS:
        score = 0
        for word in q.split():
            if word in doc["content"].lower():
                score += 1

        if score > 0:
            scored.append((score, doc))

    scored.sort(reverse=True, key=lambda x: x[0])

    results = []
    for score, doc in scored[:top_k]:
        results.append({
            "id": doc["id"],
            "title": doc["title"],
            "content": doc["content"],
            "relevance_score": score
        })

    return results
