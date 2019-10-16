const express = require('express')
const passport = require('passport')

const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

const StoryUpload = require('../models/story_upload')

const storyUploadApi = require('../../lib/storyUploadApi')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// INDEX
router.get('/stories', (req, res, next) => {
  StoryUpload.find()
    .then(storyUploads => {
      return storyUploads.map(storyUpload => storyUpload.toObject())
    })
    .then(storyUploads => res.status(200).json({ storyUploads: storyUploads }))
    .catch(next)
})

// SHOW
router.get('/stories/:id', (req, res, next) => {
  StoryUpload.findById(req.params.id)
    .then(handle404)
    .then(storyUpload => res.status(200).json({ storyUpload: storyUpload.toObject() }))
    .catch(next)
})

// CREATE
router.post('/stories', requireToken, upload.single('file'), (req, res, next) => {
  req.file.owner = req.user.id
  storyUploadApi(req.file)
    .then(s3Response => {
      const storyUploadParams = {
        url: s3Response.Location,
        owner: req.user.id,
        chapter: req.body.chapter,
        narrative: req.body.narrative
      }
      return StoryUpload.create(storyUploadParams)
    })
    .then(mongooseResponse =>
      res.status(201).json({ storyUpload: mongooseResponse.toObject() }))
    .catch(next)
})

// UPDATE
router.patch('/stories/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.storyUpload.owner

  StoryUpload.findById(req.params.id)
    .then(handle404)
    .then(storyUpload => {
      requireOwnership(req, storyUpload)

      return storyUpload.updateOne(req.body.storyUpload)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// DESTROY
router.delete('/stories/:id', requireToken, (req, res, next) => {
  StoryUpload.findById(req.params.id)
    .then(handle404)
    .then(storyUpload => {
      requireOwnership(req, storyUpload)
      storyUpload.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
