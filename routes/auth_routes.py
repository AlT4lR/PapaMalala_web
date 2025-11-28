from flask import Blueprint, jsonify, request

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    # Placeholder for future login logic
    return jsonify({"message": "Login functionality coming soon"})

@auth_bp.route('/register', methods=['POST'])
def register():
    # Placeholder for future register logic
    return jsonify({"message": "Register functionality coming soon"})