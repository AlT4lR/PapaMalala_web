# 🍕 Papa Jes's Pizzahouse (PapaMalala)

A modern, dynamic web application built for **Papa Jes's Pizzahouse**. This system serves a responsive digital menu, tracks best-selling items in real-time, and manages product images via the cloud using intelligent filename matching.

## 👤 Author

**AlT4lR**  
[GitHub Profile](https://github.com/AlT4lR)

## 🚀 Features

*   **Dynamic Menu System:** Automatically groups products by category (Pizza, Burgers, etc.) fetched from MongoDB.
*   **Real-time Best Sellers:** Calculates top 3 selling items based on actual sales data using MongoDB Aggregation pipelines.
*   **Smart Image Matching:** Automatically links products to their images hosted on **ImageKit.io** by converting product names (e.g., "Double Cheese/Hawaiian" → `double-cheese-hawaiian.jpg`).
*   **Responsive Design:** Mobile-first UI with a slide-out sidebar for mobile and a fixed sidebar for desktop.
*   **Modern UI/UX:** Built with Tailwind CSS, featuring smooth entrance animations, hover effects, and a custom "Bouncing Pizza" loading screen.

## 🛠️ Tech Stack

*   **Backend:** Python 3, Flask, Gunicorn
*   **Database:** MongoDB Atlas (pymongo)
*   **Frontend:** HTML5 (Jinja2 Templates), Vanilla JavaScript
*   **Styling:** Tailwind CSS (via Node.js/PostCSS)
*   **Asset Management:** ImageKit.io

## 🧩 Key Functions & Logic

### Backend Logic
*   **`SalesModel.get_best_sellers()`**: Utilizes a MongoDB aggregation pipeline to unwind the `itemsSold` array, group by product name, sum the quantities, and sort descending to find the top 3 items.
*   **Auto-Match Image Logic (`api_routes.py`)**: A Python Regex function that sanitizes database product names (lowercasing, replacing spaces/slashes with hyphens) to dynamically generate image URLs without storing them in the database.
*   **Category Grouping**: Fetches separate collections for `Categories` and `Products`, maps IDs to Names, and structures the JSON response to group items under their respective headers (e.g., "2 In 1 Pizza", "Fried Noodles").

### Frontend Logic (`script.js`)
*   **`loadMainMenu()` & `loadBestSellers()`**: Asynchronous functions using the Fetch API to retrieve data and dynamically inject HTML cards into the DOM.
*   **`IntersectionObserver`**: Monitors when menu items enter or leave the viewport to trigger fade-in and slide-up animations (scroll-triggered effects).
*   **`finishLoading()`**: Controls the global loading screen state, ensuring the "Bouncing Pizza" animation plays until the data is fully ready.

## Lr API Reference

### Internal APIs (Flask Endpoints)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | **`/api/full-menu`** | Returns a grouped JSON object of all products categorized by type, with dynamically generated image URLs. |
| `GET` | **`/api/best-sellers`** | Returns a JSON array of the top 3 best-selling items based on sales history. |
| `GET` | **`/api/menu-categories`** | Returns a simple list of all available menu categories. |
| `GET` | **`/api/debug-product`** | (Dev) Dumps raw JSON for a single product to inspect database field names. |

### External Services
*   **MongoDB Atlas:** Used for storing `products`, `categories`, and `sales` collections.
*   **ImageKit.io:** Serves optimized images. The system uses URL parameters (e.g., `?tr=w-400`) to request resized versions of images on the fly for faster loading.

## 📂 Project Structure

```
├── app.py                  # Application entry point
├── database.py             # MongoDB connection logic
├── models/                 # Database models
│   ├── category_model.py
│   ├── product_model.py
│   └── sales_model.py
├── routes/                 # API and Page routes
│   ├── api_routes.py       # JSON endpoints for menu & sales
│   ├── main_routes.py      # HTML rendering
│   └── auth_routes.py      # Login/Register placeholders
├── static/
│   ├── css/                # Compiled Tailwind CSS
│   ├── js/                 # Frontend logic (Animations, Fetch API)
│   └── images/             # Local static assets (Logos, backgrounds)
├── templates/              # HTML Templates
└── .env                    # Environment variables (Ignored by Git)
```

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/AlT4lR/PapaMalala_web.git
cd PapaMalala_web
```

### 2. Backend Setup (Python)
Create a virtual environment and install dependencies.
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate

# Install libraries
pip install -r requirements.txt
```

### 3. Frontend Setup (Tailwind CSS)
Install Node.js dependencies to compile the CSS.
```bash
npm install
```
To watch for CSS changes during development:
```bash
npx tailwindcss -i ./static/src/input.css -o ./static/css/output.css --watch
```

### 4. Environment Configuration
Create a `.env` file in the root directory and add your credentials:
```env
# Server Config
PORT=5001
JWT_SECRET="your_secret_key"

# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

### 5. Run the Application
```bash
python app.py
```
Visit `http://127.0.0.1:5001` in your browser.

## ☁️ Deployment (Render.com)

1.  Link your GitHub repository to Render.
2.  Set the **Build Command**: `pip install -r requirements.txt`
3.  Set the **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT`
4.  Add the **Environment Variables** (from step 4) in the Render Dashboard.

## 📝 License

Distributed under the MIT License.
