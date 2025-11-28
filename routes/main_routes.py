from flask import Blueprint, render_template

# Define the blueprint
main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def home():
    """Renders the main HTML page."""
    return render_template('index.html')