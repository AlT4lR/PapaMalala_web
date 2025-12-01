import os
import re
from flask import Blueprint, jsonify
from models.sales_model import SalesModel
from models.category_model import CategoryModel
from models.product_model import ProductModel

api_bp = Blueprint('api', __name__)

# --- CONFIGURATION ---
# UPDATE THIS: The folder name in your ImageKit (from your screenshot)
# If it is "papa-jess-inventory", keep it. If "papa-jess-ingredients", change it.
# Leave empty "" if you move images to the main Home folder.
FOLDER_NAME = "papa-jess-inventory" 

@api_bp.route('/menu-categories')
def get_menu_categories():
    try:
        categories = CategoryModel.get_all_categories()
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
    product = db.products.find_one()
    return dumps(product)

@api_bp.route('/best-sellers')
def get_best_sellers():
    try:
        raw_data = SalesModel.get_best_sellers()
        formatted_results = [{"name": item['_id'], "orders": item['count']} for item in raw_data]
        return jsonify(formatted_results)
    except Exception as e:
        print(f"Error fetching best sellers: {e}")
        return jsonify({"error": "Could not fetch data."}), 500

@api_bp.route('/full-menu')
def get_full_menu():
    """
    Combines Categories and Products.
    Auto-Matches images based on Product Name + ImageKit Folder.
    """
    try:
        image_kit_endpoint = os.getenv("IMAGEKIT_URL_ENDPOINT", "")

        categories_list = CategoryModel.get_all_categories()
        category_map = {}
        
        for cat in categories_list:
            cat_name = cat.get('name') or cat.get('categoryName') or "Uncategorized"
            cat_id = str(cat['_id'])
            category_map[cat_id] = cat_name

        products = ProductModel.get_all_products()
        grouped_menu = {}

        for p in products:
            cat_ref = p.get('category')
            cat_id = str(cat_ref) if cat_ref else "unknown"
            category_name = category_map.get(cat_id, "Others")

            if category_name not in grouped_menu:
                grouped_menu[category_name] = []
            
            # --- AUTO-MATCH LOGIC ---
            product_name = p.get('productName', 'Unknown')
            
            # 1. Clean the name: "Double Cheese/hawaiian" -> "double-cheese-hawaiian"
            clean_name = product_name.lower()
            clean_name = re.sub(r'[\s/]+', '-', clean_name)
            clean_name = re.sub(r'[^\w\-]', '', clean_name)
            
            # 2. Build the filename
            generated_filename = f"{clean_name}.jpg"

            # 3. Check DB override or use generated name
            raw_image = p.get('image') or p.get('imageUrl') or generated_filename
            
            # 4. Construct URL
            if raw_image.startswith("http"):
                final_image_url = raw_image
            else:
                # Handle Folder Path + Filename
                clean_path = raw_image.lstrip('/')
                
                # Insert folder if configured and not already in path
                if FOLDER_NAME and not clean_path.startswith(FOLDER_NAME):
                    clean_path = f"{FOLDER_NAME}/{clean_path}"
                
                final_image_url = f"{image_kit_endpoint}/{clean_path}?tr=w-400"

            grouped_menu[category_name].append({
                "name": product_name,
                "price": p.get('price', 0),
                "image": final_image_url
            })

        return jsonify(grouped_menu)

    except Exception as e:
        print(f"Error fetching full menu: {e}")
        return jsonify({}), 500