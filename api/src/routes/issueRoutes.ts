import { Router } from 'express'
import { validateBody, validateQuery } from '../middlewares/validation.ts'
import {z} from 'zod'

const createIssueSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(5).max(1000),
  status: z.enum(['open', 'in_progress', 'closed']),
})

const router = Router()

// issue-specific routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all issues' })
})

router.post('/',validateBody(createIssueSchema), (req, res) => {
  res.status(201).json({ message: 'issue created' })
})

// issue completion routes
router.post('/:id/complete', (req, res) => {
  res.json({ message: `Mark issue ${req.params.id} complete` })
})

router.get('/:id/stats', (req, res) => {
  res.json({ message: `Get stats for issue ${req.params.id}` })
})

export default router