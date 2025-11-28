from flask import Flask
from dotenv import load_dotenv

# Import Blueprints
from routes.main_routes import main_bp
from routes.api_routes import api_bp
from routes.auth_routes import auth_bp

# Load Env
load_dotenv()

app = Flask(__name__)

# Register Blueprints
# url_prefix adds a starting path to all routes in that file
app.register_blueprint(main_bp)                     # Routes: /
app.register_blueprint(api_bp, url_prefix='/api')   # Routes: /api/menu-categories, etc.
app.register_blueprint(auth_bp, url_prefix='/auth') # Routes: /auth/login

if __name__ == '__main__':
    app.run(debug=True)