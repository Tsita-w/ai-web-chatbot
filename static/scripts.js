// Handle sign-up form submission
document.getElementById('signUpForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const firstName = document.getElementById('signUpFirstName').value;
    const lastName = document.getElementById('signUpLastName').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;

    fetch('http://localhost:5000/api/signup', {  // Update with your Flask server URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstName, lastName, email, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Sign Up Response:', data); // Debugging line
        if (data.message === 'User registered successfully') {
            alert('Registration successful! Redirecting to chatbot...');
            showChat(); // Redirect to chatbot
        } else {
            alert(data.message);
            window.location.href = 'signup.html';
        }
    })
    .catch(error => {
        console.error('Error during sign up:', error);
        alert('An error occurred during sign-up. Please try again.');
        window.location.href = 'signup.html';
    });
});

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    fetch('http://localhost:5000/api/login', {  // Update with your Flask server URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Login Response:', data); // Debugging line
        if (data.message === 'Login successful') {
            sessionStorage.setItem('user_id', data.user_id);  // Store the user_id for session management
            alert('Login successful! Redirecting to chatbot...');
            showChat(); // Redirect to chatbot
        } else {
            alert(data.message);
            window.location.href = 'login.html';
        }
    })
    .catch(error => {
        console.error('Error during login:', error);
        alert('An error occurred during login. Please try again.');
         window.location.href = 'login.html';
    });
});

// Function to show the chatbot interface
function showChat() {
    window.location.href = 'chat.html';  // Redirect to chat.html
}

// Show login form
document.getElementById('showLogin').addEventListener('click', function(event) {
    event.preventDefault();
    showLogin();
});

// Show sign-up form
document.getElementById('showSignUp').addEventListener('click', function(event) {
    event.preventDefault();
    showSignUp();
});

function showLogin() {
    document.getElementById('signUp').style.display = 'none';
    document.getElementById('login').style.display = 'block';
}

function showSignUp() {
    document.getElementById('signUp').style.display = 'block';
    document.getElementById('login').style.display = 'none';
}
function appendMessage(className, message) {
    const messageElement = document.createElement('div');
    messageElement.className = className + ' message';
    messageElement.textContent = message;

    // Add a fade-in animation
    messageElement.style.opacity = 0;
    messageElement.style.transition = 'opacity 0.5s';

    document.getElementById('chat-window').appendChild(messageElement);
    document.getElementById('chat-window').scrollTop = document.getElementById('chat-window').scrollHeight;

    // Trigger the fade-in effect
    setTimeout(() => {
        messageElement.style.opacity = 1;
    }, 10);
}
function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = message;
    messageDiv.setAttribute('data-aos', 'fade-up'); // Add AOS attribute
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    AOS.refresh(); // Refresh AOS to apply animations to dynamically added elements
}

