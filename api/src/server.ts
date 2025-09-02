import express from 'express'
import authRoutes from './routes/authRoutes.ts'
import issueRoutes from './routes/issueRoutes.ts'
import userRoutes from './routes/userRoutes.ts'
import tagRoutes from './routes/tagRoutes.ts'

import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import { isTest } from '../env.ts'

const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  morgan('dev', {
    skip: () => isTest(),
  })
)

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Issue Tracker API',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/tags', tagRoutes)

export { app }
export default app