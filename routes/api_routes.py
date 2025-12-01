from flask import Blueprint, jsonify
from models.sales_model import SalesModel
from models.category_model import CategoryModel
from models.product_model import ProductModel

api_bp = Blueprint('api', __name__)

@api_bp.route('/menu-categories')
def get_menu_categories():
    try:
        categories = CategoryModel.get_all_categories()
        # Clean up data for frontend (convert ObjectId to string if needed)
        clean_cats = []
        for c in categories:
            name = c.get('name') or c.get('categoryName') or "Unknown"
            clean_cats.append({"name": name})
            
        if not clean_cats:
             clean_cats = [{"name": "Loading..."}]
        
        return jsonify(clean_cats)
    except Exception as e:
        print(f"Error fetching categories: {e}")
        return jsonify([]), 500
    
@api_bp.route('/debug-product')
def debug_product():
    from database import db
    from bson.json_util import dumps
    # Get one product to see all its fields (including images)
    product = db.products.find_one()
    return dumps(product)

@api_bp.route('/best-sellers')
def get_best_sellers():
    try:
        raw_data = SalesModel.get_best_sellers()
        # Format for frontend
        formatted_results = [{"name": item['_id'], "orders": item['count']} for item in raw_data]
        return jsonify(formatted_results)
    except Exception as e:
        print(f"Error fetching best sellers: {e}")
        return jsonify({"error": "Could not fetch data."}), 500

@api_bp.route('/full-menu')
def get_full_menu():
    """
    Combines Categories and Products to create a grouped menu.
    """
    try:
        # 1. Fetch all Categories and map ID -> Name
        categories_list = CategoryModel.get_all_categories()
        category_map = {}
        
        for cat in categories_list:
            # Handle if the name field is 'name' or 'categoryName'
            cat_name = cat.get('name') or cat.get('categoryName') or "Uncategorized"
            cat_id = str(cat['_id']) # Convert ObjectId to string for matching
            category_map[cat_id] = cat_name

        # 2. Fetch all Products
        products = ProductModel.get_all_products()

        # 3. Group Products by Category Name
        grouped_menu = {}

        for p in products:
            # Get the category ID from the product
            cat_ref = p.get('category')
            cat_id = str(cat_ref) if cat_ref else "unknown"
            
            # Find the name (e.g., "Burgers"), default to "Others" if not found
            category_name = category_map.get(cat_id, "Others")

            if category_name not in grouped_menu:
                grouped_menu[category_name] = []
            
            grouped_menu[category_name].append({
                "name": p.get('productName', 'Unknown'),
                "price": p.get('price', 0)
            })

        return jsonify(grouped_menu)
    
    

    except Exception as e:
        print(f"Error fetching full menu: {e}")
        return jsonify({}), 500
    
    