from flask import Blueprint, jsonify
from models.sales_model import SalesModel
from models.category_model import CategoryModel

api_bp = Blueprint('api', __name__)

@api_bp.route('/menu-categories')
def get_menu_categories():
    try:
        # Fetch real categories from MongoDB
        categories = CategoryModel.get_all_categories()
        
        # If database is empty, show defaults
        if not categories:
            categories = [
                {"name": "Pizza Bundles (Default)", "url": "#"},
                {"name": "Classic Pizzas", "url": "#"}
            ]
        
        return jsonify(categories)

    except Exception as e:
        print(f"Error fetching categories: {e}")
        return jsonify([]), 500


# -------------------------------------------
# FIXED: Route was inside function by mistake
# -------------------------------------------
@api_bp.route('/debug-sales')
def debug_sales():
    from database import db
    from bson.json_util import dumps
    sale = db.sales.find_one()
    return dumps(sale)


@api_bp.route('/best-sellers')
def get_best_sellers():
    try:
        raw_data = SalesModel.get_best_sellers()

        # Format for frontend
        formatted_results = [
            {"name": item['_id'], "orders": item['count']}
            for item in raw_data
        ]
        return jsonify(formatted_results)

    except Exception as e:
        print(f"Error fetching best sellers: {e}")
        return jsonify({"error": "Could not fetch data."}), 500
