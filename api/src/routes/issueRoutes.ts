import { Router } from 'express'

const router = Router()

// issue-specific routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all issues' })
})

router.post('/', (req, res) => {
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