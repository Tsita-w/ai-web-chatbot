const chatMessages = [];
const suggestions = [
    "Hello!",
    "How are you?",
    "What can you do?",
    "Tell me a joke",
    "What's the weather like?",
    "Help"
];

const responses = {
    greeting: ["Hello!", "Hi there!", "Hey! How can I help you?"],
    farewell: ["Goodbye!", "See you later!", "Have a great day!"],
    help: ["I can help you with:\n- Basic conversations\n- Simple math\n- Telling jokes\n- Weather information"],
    unknown: ["I'm not sure about that.", "Could you rephrase that?", "I don't understand. Can you try asking differently?"],
    jokes: [
        "Why don't scientists trust atoms? Because they make up everything!",
        "What do you call a bear with no teeth? A gummy bear!",
        "Why did the scarecrow win an award? He was outstanding in his field!"
    ],
    weather: ["I'm sorry, I don't have access to real weather data. You might want to check a weather website or app!"],
};

function getRandomResponse(category) {
    const options = responses[category] || responses.unknown;
    return options[Math.floor(Math.random() * options.length)];
}

function processMessage(message) {
    message = message.toLowerCase().trim();

    // Check for greetings
    if (message.match(/^(hi|hello|hey|greetings)/)) {
        return getRandomResponse('greeting');
    }

    // Check for farewells
    if (message.match(/^(bye|goodbye|see you|farewell)/)) {
        return getRandomResponse('farewell');
    }

    // Check for help request
    if (message.match(/^(help|what can you do|commands)/)) {
        return getRandomResponse('help');
    }

    // Check for joke request
    if (message.includes('joke')) {
        return getRandomResponse('jokes');
    }

    // Check for weather request
    if (message.includes('weather')) {
        return getRandomResponse('weather');
    }

    // Check for math operations
    const mathMatch = message.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);
    if (mathMatch) {
        const num1 = parseFloat(mathMatch[1]);
        const operator = mathMatch[2];
        const num2 = parseFloat(mathMatch[3]);
        let result;

        switch(operator) {
            case '+': result = num1 + num2; break;
            case '-': result = num1 - num2; break;
            case '*': result = num1 * num2; break;
            case '/': result = num2 !== 0 ? num1 / num2 : "Cannot divide by zero"; break;
        }

        return `The result is: ${result}`;
    }

    return getRandomResponse('unknown');
}

function addMessage(message, isUser = true) {
    const messageObj = {
        text: message,
        isUser: isUser,
        timestamp: new Date()
    };
    chatMessages.push(messageObj);
    displayMessage(messageObj);
}

function displayMessage(message) {
    const chatBox = document.querySelector('.chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.isUser ? 'user-message' : 'bot-message'}`;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = message.isUser ? 'U' : 'B';

    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = message.text;

    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messageDiv.appendChild(time);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
    const chatBox = document.querySelector('.chat-box');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.innerHTML = '<div class="dots"><span></span><span></span><span></span></div>';
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingDiv;
}

function removeTypingIndicator(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

function handleUserInput(event) {
    event.preventDefault();
    const input = document.querySelector('.chat-input input');
    const message = input.value.trim();

    if (message) {
        addMessage(message, true);
        input.value = '';

        const typingIndicator = showTypingIndicator();

        // Simulate bot thinking time
        setTimeout(() => {
            removeTypingIndicator(typingIndicator);
            const response = processMessage(message);
            addMessage(response, false);
        }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
    }
}

function addSuggestion(text) {
    const suggestionsContainer = document.querySelector('.suggestions');
    const suggestion = document.createElement('button');
    suggestion.className = 'suggestion';
    suggestion.textContent = text;
    suggestion.onclick = () => {
        document.querySelector('.chat-input input').value = text;
        suggestion.remove();
    };
    suggestionsContainer.appendChild(suggestion);
}

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.chat-input');
    form.onsubmit = handleUserInput;

    // Add initial suggestions
    suggestions.forEach(addSuggestion);

    // Add welcome message
    setTimeout(() => {
        addMessage("Hello! I'm your AI chatbot. How can I help you today?", false);
    }, 500);
});
