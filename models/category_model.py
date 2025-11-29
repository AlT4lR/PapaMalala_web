from database import db

class CategoryModel:
    @staticmethod
    def get_all_categories():
        """
        Fetches all categories from the 'categories' collection.
        We include the _id so we can link products to their category names.
        """
        return list(db.categories.find({}))