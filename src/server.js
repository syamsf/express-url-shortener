const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const httpErrors = require('http-errors')
const expressMongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const colors = require('colors')
const connectDB = require('./config/db')

// Load .env config
dotenv.config({path: path.resolve(__dirname, './config/config.env')})

// Connect to DB
connectDB()

// Route files
const shortenerRoute = require('./routes/Shortener')

// Initialize express
const app = express()

// Body parser
app.use(express.json())

// Cookie parser
app.use(cookieParser())

// Development logging middleware
if (process.env.NODE_ENV === 'development')
  app.use(morgan('dev'))

// Sanitize data
app.use(expressMongoSanitize())

// Prevent XSS
app.use(xss())

// Mount routers
app.use('/', shortenerRoute)

// Initialize server
const PORT = process.env.PORT || 3000;
const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
)

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red)
})
