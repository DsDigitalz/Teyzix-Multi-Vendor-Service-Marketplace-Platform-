const express    = require('express')
const dotenv     = require('dotenv')
const cors       = require('cors')
const connectDB  = require('./config/db')

dotenv.config()
connectDB()

const app = express()

// Allow requests from your Vercel frontend URL
// During development this allows localhost too
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,   // set this in Render dashboard later
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth',      require('./routes/authRoutes'))
app.use('/api/providers', require('./routes/providerRoutes'))
app.use('/api/services',  require('./routes/listingRoutes'))
app.use('/api/requests',  require('./routes/requestRoutes'))
app.use('/api/reviews',   require('./routes/reviewRoutes'))
app.use('/api/admin',     require('./routes/adminRoutes'))

app.get('/', (req, res) => res.json({ message: 'Teyzix API running ✓', env: process.env.NODE_ENV }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large' })
  }
  res.status(500).json({ success: false, message: err.message || 'Server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`))