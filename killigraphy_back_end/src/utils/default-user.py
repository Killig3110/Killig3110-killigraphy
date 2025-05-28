import random
import uuid
from datetime import datetime, timedelta
import json

def fake_object_id():
    return ''.join(random.choices('abcdef0123456789', k=24))

names = ["Alex", "Jamie", "Chris", "Taylor", "Jordan", "Morgan", "Casey", "Skyler", "Riley", "Jesse"]
usernames = ["alex123", "jamie_dev", "chris_runner", "taylor.music", "jordy321", "morgan.tech", "caseyx", "skyler.code", "riley_ui", "jesse.data"]

user_ids = [fake_object_id() for _ in range(100)]
users = []

for i in range(100):
    created = datetime.utcnow() - timedelta(days=random.randint(10, 365))
    updated = created + timedelta(days=random.randint(0, 30))

    user_id = user_ids[i]
    name = random.choice(names)
    username = f"{usernames[i % len(usernames)]}_{i}"

    following_ids = random.sample([uid for uid in user_ids if uid != user_id], k=random.randint(2, 5))

    user = {
        "name": name,
        "username": username,
        "accountId": str(uuid.uuid4()),
        "email": f"{username}@example.com",
        "password": "$2a$10$qygOGXGVHSUBPnOa35mneePZwRuZvpxEM67NyvQcX4/087.nE.28O",
        "imageUrl": f"https://ik.imagekit.io/killigraphy/avatars/avatar_{i}.jpg",
        "likedPosts": [],
        "followers": [],
        "following": [{ "$oid": fid } for fid in following_ids],
        "createdAt": { "$date": created.isoformat() + "Z" },
        "updatedAt": { "$date": updated.isoformat() + "Z" },
        "__v": 0,
        "imageId": fake_object_id()
    }

    users.append(user)

id_to_user = {user_ids[i]: users[i] for i in range(100)}
for i in range(100):
    user = users[i]
    user_id = user_ids[i]
    for following in user["following"]:
        fid = following["$oid"]
        if {"$oid": user_id} not in id_to_user[fid]["followers"]:
            id_to_user[fid]["followers"].append({"$oid": user_id})

with open("default_users.json", "w", encoding="utf-8") as f:
    json.dump(users, f, indent=4, ensure_ascii=False)

print("✅ Created default_users.json with 100 users")
