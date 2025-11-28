from database import db

class CategoryModel:
    @staticmethod
    def get_all_categories():
        """
        Fetches all categories from the 'categories' collection.
        """
        # Fetching all documents. 
        # {'_id': 0} excludes the ID from the result to make it cleaner JSON
        return list(db.categories.find({}, {'_id': 0}))