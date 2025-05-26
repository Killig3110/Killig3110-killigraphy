import random
import uuid
from datetime import datetime, timedelta
import json

# Tạo ObjectId giả
def fake_object_id():
    return ''.join(random.choices('abcdef0123456789', k=24))

# Danh sách mẫu
names = ["Alex", "Jamie", "Chris", "Taylor", "Jordan", "Morgan", "Casey", "Skyler", "Riley", "Jesse"]
usernames = ["alex123", "jamie_dev", "chris_runner", "taylor.music", "jordy321", "morgan.tech", "caseyx", "skyler.code", "riley_ui", "jesse.data"]

# Bước 1: tạo danh sách userId trước
user_ids = [fake_object_id() for _ in range(100)]

users = []

for i in range(100):
    created = datetime.utcnow() - timedelta(days=random.randint(10, 365))
    updated = created + timedelta(days=random.randint(0, 30))

    user_id = user_ids[i]
    name = random.choice(names)
    username = f"{usernames[i % len(usernames)]}_{i}"

    # Chọn 2–5 người mà user này đang theo dõi
    following_ids = random.sample([uid for uid in user_ids if uid != user_id], k=random.randint(2, 5))

    user = {
        "_id": { "$oid": user_id },
        "name": name,
        "username": username,
        "accountId": str(uuid.uuid4()),
        "email": f"{username}@example.com",
        "password": "$2a$10$qygOGXGVHSUBPnOa35mneePZwRuZvpxEM67NyvQcX4/087.nE.28O",
        "imageUrl": f"https://ik.imagekit.io/killigraphy/avatars/avatar_{i}.jpg",
        "likedPosts": [],
        "followers": [],  # sẽ cập nhật sau
        "following": [{ "$oid": fid } for fid in following_ids],
        "createdAt": { "$date": created.isoformat() + "Z" },
        "updatedAt": { "$date": updated.isoformat() + "Z" },
        "__v": 0,
        "imageId": fake_object_id()
    }

    users.append(user)

# Bước 2: cập nhật followers theo danh sách following
id_to_user = {user["_id"]["$oid"]: user for user in users}

for user in users:
    for following in user["following"]:
        followed_user = id_to_user[following["$oid"]]
        if {"$oid": user["_id"]["$oid"]} not in followed_user["followers"]:
            followed_user["followers"].append({"$oid": user["_id"]["$oid"]})

# Bước 3: xuất ra file JSON
with open("default_users.json", "w") as f:
    json.dump(users, f, indent=4, ensure_ascii=False)
