from pymongo import MongoClient
from bson import ObjectId
import random
import json
from datetime import datetime, timedelta

# Kết nối MongoDB
client = MongoClient("mongodb://localhost:27017")
db = client["killigraphy"]
users_collection = db["users"]

# Lấy danh sách user từ MongoDB
users_cursor = users_collection.find({}, {"_id": 1, "followers": 1})
users = list(users_cursor)

if not users:
    raise ValueError("❌ Không có user nào trong MongoDB")

user_ids = [str(u["_id"]) for u in users]

caption_templates = [
    "Just finished a {} session at {}!",
    "Loving the vibe here in {} 🌇",
    "Trying out some new {} techniques 🎨",
    "Spent the day working on {} ☕",
    "Here's what {} looks like from above 🚁",
    "Guess where I took this? Hint: {} 🌍",
    "Late-night thoughts about {}.",
    "Anyone else obsessed with {} lately?",
    "If you love {}, you’ll love this!"
]

topics = ["yoga", "JavaScript", "sketching", "React", "UX design", "street photography", "coffee", "travel", "AI"]
places = ["Bali", "New York", "Hanoi", "Tokyo", "Berlin", "Da Nang", "London", "Seoul"]
tags_by_topic = {
    "yoga": ["fitness", "health", "balance"],
    "JavaScript": ["code", "devlife", "frontend"],
    "sketching": ["art", "drawing", "creativity"],
    "React": ["reactjs", "webdev", "hooks"],
    "UX design": ["design", "uiux", "user"],
    "street photography": ["photo", "streetlife", "city"],
    "coffee": ["coffee", "cafevibes", "latteart"],
    "travel": ["wanderlust", "explore", "journey"],
    "AI": ["ai", "machinelearning", "futuretech"]
}

image_urls = [f"https://picsum.photos/seed/{ObjectId()}/800/600" for _ in range(30)]
posts = []

for _ in range(150):
    creator = random.choice(users)
    creator_id = str(creator["_id"])
    topic = random.choice(topics)
    place = random.choice(places)
    caption = random.choice(caption_templates).format(topic, place)

    tags = random.sample(tags_by_topic[topic], 2)
    created = datetime.utcnow() - timedelta(days=random.randint(1, 60))
    updated = created + timedelta(days=random.randint(0, 3))

    followers = creator.get("followers", [])
    follower_ids = [str(f) for f in followers]
    like_ids = random.sample(follower_ids, min(3, len(follower_ids)))
    like_ids += random.sample([uid for uid in user_ids if uid != creator_id], k=2)

    post = {
        "_id": { "$oid": str(ObjectId()) },
        "creator": { "$oid": creator_id },
        "caption": caption,
        "tags": tags,
        "imageURL": random.choice(image_urls),
        "imageId": str(ObjectId()),
        "location": random.choice(places),
        "likes": [{ "$oid": uid } for uid in set(like_ids)],
        "createdAt": { "$date": created.isoformat() + "Z" },
        "updatedAt": { "$date": updated.isoformat() + "Z" },
        "__v": 0
    }

    posts.append(post)

# Xuất ra file JSON
with open("default_posts.json", "w", encoding="utf-8") as f:
    json.dump(posts, f, indent=4, ensure_ascii=False)

print("✅ Created default_posts.json with", len(posts), "posts")
