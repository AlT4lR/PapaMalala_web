import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("No MONGO_URI found in .env file")

client = MongoClient(MONGO_URI)

# UPDATED: Pointing to the 'test' database shown in your screenshot
db = client.test