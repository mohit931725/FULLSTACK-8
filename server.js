const express = require('express')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())

const SECRET_KEY = 'mysecretkey'

// Hardcoded user for demo
const user = {
  username: 'admin',
  password: 'password123'
}

// Login route - issues JWT on valid credentials
app.post('/login', (req, res) => {
  const { username, password } = req.body

  if (username === user.username && password === user.password) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' })
    return res.json({ message: 'Login successful', token })
  }

  res.status(401).json({ error: 'Invalid username or password' })
})

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' })
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Token missing' })
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = decoded
    next()
  })
}

// Public route
app.get('/public', (req, res) => {
  res.json({ message: 'Welcome to the public route!' })
})

// Protected route
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: `Hello ${req.user.username}, welcome to the protected route!` })
})

// Start server
const PORT = 4000
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`))
