const express = require('express')
const router = express.Router()
const {
  openShortenUrl,
  createShortenUrl,
  createRandomCustomAliasUrl,
  deleteCustomAliasUrl
} = require('../controllers/Shortener')

router.get('/', (req, res, next) => {
  return res.status(200).json({
    success: true
  })
})
router.get('/:custom_alias', openShortenUrl)
router.post('/custom-alias', createShortenUrl)
router.post('/custom-alias/random', createRandomCustomAliasUrl)
router.delete('/:custom_alias', deleteCustomAliasUrl)

module.exports = router