from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from models.auth import Auth
import os
from dotenv import load_dotenv
import random

load_dotenv()

app = Flask(__name__)
CORS(app)
auth = Auth(app)

# Simple chatbot responses
CHATBOT_RESPONSES = {
    'greetings': [
        "Hello! How can I help you today?",
        "Hi there! What can I do for you?",
        "Greetings! How may I assist you?",
    ],
    'farewell': [
        "Goodbye! Have a great day!",
        "See you later! Take care!",
        "Bye! Come back soon!",
    ],
    'thanks': [
        "You're welcome!",
        "Happy to help!",
        "My pleasure!",
    ],
    'help': [
        "I can help you with basic conversations. Try asking me about:\n- Greetings\n- Weather\n- Time\n- Basic math",
        "Need assistance? I can chat about various topics or help with simple calculations!",
    ],
    'default': [
        "I'm not sure I understand. Could you rephrase that?",
        "I'm still learning. Could you try asking in a different way?",
        "I'm not sure about that. Try asking something else!",
    ]
}


def get_bot_response(message):
    message = message.lower()

    # Check for greetings
    if any(word in message for word in ['hello', 'hi', 'hey', 'greetings']):
        return random.choice(CHATBOT_RESPONSES['greetings'])

    # Check for farewell
    if any(word in message for word in ['bye', 'goodbye', 'see you']):
        return random.choice(CHATBOT_RESPONSES['farewell'])

    # Check for thanks
    if any(word in message for word in ['thanks', 'thank you', 'appreciate']):
        return random.choice(CHATBOT_RESPONSES['thanks'])

    # Check for help
    if any(word in message for word in ['help', 'assist', 'support']):
        return random.choice(CHATBOT_RESPONSES['help'])

    # Handle basic math operations
    if any(op in message for op in ['add', 'plus', 'subtract', 'minus', 'multiply', 'divide']):
        try:
            # Extract numbers from the message
            numbers = [float(s) for s in message.split() if s.replace('.', '').isdigit()]
            if len(numbers) >= 2:
                if 'add' in message or 'plus' in message:
                    return f"The result is {numbers[0] + numbers[1]}"
                elif 'subtract' in message or 'minus' in message:
                    return f"The result is {numbers[0] - numbers[1]}"
                elif 'multiply' in message:
                    return f"The result is {numbers[0] * numbers[1]}"
                elif 'divide' in message and numbers[1] != 0:
                    return f"The result is {numbers[0] / numbers[1]}"
        except:
            return "I couldn't perform that calculation. Please try again with valid numbers."

    # Default response
    return random.choice(CHATBOT_RESPONSES['default'])


@app.route('/')
def index():
    return render_template('auth.html')


@app.route('/chat')
@auth.token_required
def chat(current_user):
    return render_template('chat.html', user=current_user)


@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')

        if not all([name, email, password]):
            return jsonify({
                'status': 'error',
                'message': 'All fields are required'
            }), 400

        success, message = auth.register_user(name, email, password)

        return jsonify({
            'status': 'success' if success else 'error',
            'message': message
        }), 200 if success else 400

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email', '').strip()
        password = data.get('password', '')

        if not all([email, password]):
            return jsonify({
                'status': 'error',
                'message': 'Email and password are required'
            }), 400

        success, result = auth.login_user(email, password)

        if success:
            return jsonify({
                'status': 'success',
                'token': result
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': result
            }), 401

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/api/send_message', methods=['POST'])
@auth.token_required
def send_message(current_user):
    try:
        data = request.get_json()
        message = data.get('message', '').strip()

        if not message:
            return jsonify({
                'status': 'error',
                'message': 'Message cannot be empty'
            }), 400

        response = get_bot_response(message)

        return jsonify({
            'status': 'success',
            'response': response
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


if __name__ == '__main__':
    app.run(debug=True)
