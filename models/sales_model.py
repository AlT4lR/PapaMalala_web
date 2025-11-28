from database import db

class SalesModel:
    @staticmethod
    def get_best_sellers(limit=3):
        """
        Calculates top selling items from the 'sales' collection
        using the 'itemsSold' array and summing the 'quantity'.
        """
        try:
            pipeline = [
                # 1. Deconstruct the 'itemsSold' array 
                # (Splits one order into multiple rows, one per product)
                { "$unwind": "$itemsSold" },
                
                # 2. Group by 'productName' and sum the 'quantity'
                { "$group": {
                    "_id": "$itemsSold.productName",
                    "count": { "$sum": "$itemsSold.quantity" } 
                }},
                
                # 3. Sort by total sold in descending order
                { "$sort": { "count": -1 } },
                
                # 4. Limit to top 3
                { "$limit": limit }
            ]
            
            # Execute query
            return list(db.sales.aggregate(pipeline))

        except Exception as e:
            print(f"Error in SalesModel: {e}")
            return []