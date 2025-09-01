import express from 'express'
import authRoutes from './routes/authRoutes.ts'
import issueRoutes from './routes/issueRoutes.ts'
import userRoutes from './routes/userRoutes.ts'
import tagRoutes from './routes/tagRoutes.ts'

const app = express()

// Health check endpoint (direct on app)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Issue Tracker API',
  })
})

// Mount routers with base paths
app.use('/api/auth', authRoutes)    // All auth routes prefixed with /api/auth
app.use('/api/users', userRoutes)   // All user routes prefixed with /api/users  
app.use('/api/issues', issueRoutes) // All Issue routes prefixed with /api/issues
app.use('/api/tags', tagRoutes)     // All tag routes prefixed with /api/tags

export { app }
export default app