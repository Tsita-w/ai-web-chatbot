require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const db = require('./database');

const app = express();
const PORT = process.env.PORT, 4000;

app.use(cors({ 
    origin: 'http://127.0.0.1:3000', 
    credentials: true 
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: true 
})); 
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json()); 
app.use(express.static('public'));

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
        if (err) {
            return res.status(400).send('User registration failed');
        }
        res.status(201).send('User registered');
    });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err  !user) {
            return res.status(400).send('User not found');
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).send('Invalid password');
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
        res.send({ token });
    });
});

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send('Access denied');
    }
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Invalid token');
    }
};

app.post('/chat', authMiddleware, (req, res) => {
    const { text } = req.body;
    const userId = req.user.userId;
    db.run(INSERT INTO chats (userId, text) VALUES (?, ?), [userId, text], function(err) {
        if (err) {
            return res.status(500).send('Message storage failed');
        }
        res.send('Message stored');
    });
});

app.get('/chat', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    db.all(SELECT text, timestamp FROM chats WHERE userId = ?, [userId], (err, rows) => {
        if (err) {
            return res.status(500).send('Failed to retrieve chat history');
        }
        res.send(rows);
    });
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

app.listen(PORT, () => {
    console.log(Server is running on http://localhost:${PORT});
});