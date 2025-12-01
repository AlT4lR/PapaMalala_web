from database import db

class ProductModel:
    @staticmethod
    def get_all_products():
        """
        Fetches all active products from the database.
        Includes image fields now.
        """
        return list(db.products.find({}, {
            "productName": 1, 
            "price": 1, 
            "category": 1, 
            "image": 1,      # Added: Get image filename
            "imageUrl": 1,   # Added: Fallback field name
            "_id": 0
        }))