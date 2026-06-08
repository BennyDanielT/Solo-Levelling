"""
merge_duplicate_users.py - run inside the FastAPI Docker container
Usage: python /app/merge_duplicate_users.py
"""
import asyncio
from collections import defaultdict
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URL = "mongodb://admin:solo-leveling-2024@mongodb:27017/solo_levelling?authSource=admin"
DB_NAME = "solo_levelling"

async def main():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    users_col = db["users"]
    goals_col = db["goals"]

    all_users = await users_col.find({}).to_list(length=1000)
    print(f"Total users: {len(all_users)}")

    by_email = defaultdict(list)
    for u in all_users:
        by_email[u["email"].lower().strip()].append(u)

    duplicates = {e: docs for e, docs in by_email.items() if len(docs) > 1}
    print(f"Duplicate emails: {list(duplicates.keys())}")

    if not duplicates:
        print("No duplicates - nothing to do.")
        # Still show all users + their goal counts for verification
        for u in all_users:
            uid = str(u["_id"])
            count = await goals_col.count_documents({"userId": uid})
            print(f"  User {u['email']} (_id={uid}) has {count} goals")
        client.close()
        return

    for email, docs in duplicates.items():
        docs_sorted = sorted(docs, key=lambda d: d["_id"].generation_time)
        canonical = docs_sorted[0]
        cid = str(canonical["_id"])
        print(f"\nEmail: {email}")
        print(f"  Canonical _id: {cid} (created {canonical['_id'].generation_time})")
        for dup in docs_sorted[1:]:
            did = str(dup["_id"])
            print(f"  Duplicate _id: {did} (created {dup['_id'].generation_time})")
            r = await goals_col.update_many({"userId": did}, {"$set": {"userId": cid}})
            print(f"    Re-assigned {r.modified_count} goals -> canonical user")
            await users_col.delete_one({"_id": dup["_id"]})
            print(f"    Deleted duplicate user doc")

    # Final verification
    remaining = await users_col.find({}).to_list(length=1000)
    print(f"\nFinal user count: {len(remaining)}")
    for u in remaining:
        uid = str(u["_id"])
        count = await goals_col.count_documents({"userId": uid})
        print(f"  {u['email']} (_id={uid}) => {count} goals")

    print("Migration complete.")
    client.close()

asyncio.run(main())
