from database import db

class ProductModel:
    @staticmethod
    def get_all_products():
        """
        Fetches all active products from the database.
        We only fetch the fields we need to display.
        """
        return list(db.products.find({}, {
            "productName": 1, 
            "price": 1, 
            "category": 1, 
            "_id": 0
        }))