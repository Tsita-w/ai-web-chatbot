from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
import os
from dotenv import load_dotenv

load_dotenv()

class Auth:
    def __init__(self, app):
        self.app = app
        self.secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
        self.users = {}  # In production, use a proper database

    def register_user(self, name, email, password):
        if email in self.users:
            return False, "User already exists"
        
        if len(password) < 6:
            return False, "Password must be at least 6 characters long"
        
        hashed_password = generate_password_hash(password, method='sha256')
        self.users[email] = {
            'name': name,
            'password': hashed_password,
            'created_at': datetime.datetime.utcnow()
        }
        return True, "User registered successfully"

    def login_user(self, email, password):
        if email not in self.users:
            return False, "User not found"
        
        user = self.users[email]
        if check_password_hash(user['password'], password):
            token = jwt.encode({
                'user': email,
                'name': user['name'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, self.secret_key)
            return True, token
        return False, "Invalid password"

    def token_required(self, f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(" ")[1]
            
            if not token:
                return jsonify({'status': 'error', 'message': 'Token is missing'}), 401
            
            try:
                data = jwt.decode(token, self.secret_key, algorithms=["HS256"])
                current_user = {
                    'email': data['user'],
                    'name': data['name']
                }
            except jwt.ExpiredSignatureError:
                return jsonify({'status': 'error', 'message': 'Token has expired'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'status': 'error', 'message': 'Invalid token'}), 401
            
            return f(current_user, *args, **kwargs)
        return decorated

    def validate_token(self, token):
        if not token:
            return False, None
            
        try:
            data = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            return True, {
                'email': data['user'],
                'name': data['name']
            }
        except jwt.ExpiredSignatureError:
            return False, "Token has expired"
        except jwt.InvalidTokenError:
            return False, "Invalid token"
