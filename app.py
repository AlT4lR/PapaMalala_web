from flask import Flask, jsonify, render_template
from pymongo import MongoClient
from bson.json_util import dumps

app = Flask(__name__)

# --- IMPORTANT: DATABASE CONNECTION ---
# Replace the connection string with your own from MongoDB Atlas
MONGO_URI="mongodb+srv://callixjeira_db_user:qAoGcHxjOOgEzTaK@clnigr.k2yn3ks.mongodb.net/"
client = MongoClient(MONGO_URI)
db = client.pizzeria # The database we created is named 'pizzeria'

@app.route('/')
def home():
    """Renders the main HTML page, which is a 1:1 of your sketch."""
    return render_template('index.html')

@app.route('/api/menu-categories')
def get_menu_categories():
    """
    Provides the main product categories for the sidebar menu.
    In a full app, this might also come from a database.
    """
    categories = [
        {"name": "Pizza Bundles", "url": "#"},
        {"name": "Classic Pizzas", "url": "#"},
        {"name": "Pizza Burgers", "url": "#"},
        {"name": "Takoyaki", "url": "#"},
        {"name": "Milk Tea & Drinks", "url": "#"},
    ]
    return jsonify(categories)

@app.route('/api/best-sellers')
def get_best_sellers():
    """
    This is the core feature. It connects to MongoDB, aggregates order data,
    and returns the top 3 most-ordered items.
    """
    try:
        # Define the MongoDB Aggregation Pipeline
        pipeline = [
            # 1. Deconstruct the 'items' array into separate documents
            { "$unwind": "$items" },
            
            # 2. Group documents by the item name and count them
            { "$group": {
                "_id": "$items",
                "count": { "$sum": 1 }
            }},
            
            # 3. Sort by the count in descending order (most popular first)
            { "$sort": { "count": -1 } },
            
            # 4. Limit the result to the top 3 items
            { "$limit": 3 }
        ]
        
        # Execute the aggregation on the 'orders' collection
        best_sellers = list(db.orders.aggregate(pipeline))
        
        # The result looks like: [{'_id': 'Pepperoni', 'count': 4}, ...]
        # We'll reformat it for easier use in the frontend
        formatted_results = [{"name": item['_id'], "orders": item['count']} for item in best_sellers]

        return jsonify(formatted_results)

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Could not connect to database or fetch data."}), 500

if __name__ == '__main__':
    app.run(debug=True)