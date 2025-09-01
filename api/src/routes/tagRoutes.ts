import { Router } from 'express'

const router = Router()

// Tag-specific routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all tags' })
})

router.post('/', (req, res) => {
  res.status(201).json({ message: 'Tag created' })
})

router.get('/:id', (req, res) => {
  res.json({ message: `Get tag ${req.params.id}` })
})

router.put('/:id', (req, res) => {
  res.json({ message: `Update tag ${req.params.id}` })
})

router.delete('/:id', (req, res) => {
  res.json({ message: `Delete tag ${req.params.id}` })
})

export default router