const express = require('express')
const passport = require('passport')

const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

const StoryUpload = require('../models/file_upload')

const storyUploadApi = require('../../lib/storyUploadApi')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// INDEX
// GET /storyUploads
router.get('/storyUploads', (req, res, next) => {
  StoryUpload.find()
    .then(storyUploads => {
      return storyUploads.map(storyUpload => storyUpload.toObject())
    })
    .then(storyUploads => res.status(200).json({ storyUploads: storyUploads }))
    .catch(next)
})

// SHOW
// GET /storyUploads/5a7db6c74d55bc51bdf39793
router.get('/storyUploads/:id', (req, res, next) => {
  StoryUpload.findById(req.params.id)
    .then(handle404)
    .then(storyUpload => res.status(200).json({ storyUpload: storyUpload.toObject() }))
    .catch(next)
})

// CREATE
// POST /storyUploads
router.post('/storyUploads', requireToken, upload.single('upload'), (req, res, next) => {
  req.file.owner = req.user.id
  storyUploadApi(req.file)
    .then(s3Response => {
      const storyUploadParams = {
        name: s3Response.Key,
        fileType: req.file.mimetype,
        url: s3Response.Location,
        user: req.user
      }
      return StoryUpload.create(storyUploadParams)
    })
    .then(mongooseResponse =>
      res.status(201).json({ storyUpload: mongooseResponse.toObject() }))
    .catch(next)
})

// UPDATE
// PATCH /storyUploads/5a7db6c74d55bc51bdf39793
router.patch('/storyUploads/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.user

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
// DELETE /storyUploads/5a7db6c74d55bc51bdf39793
router.delete('/storyUploads/:id', requireToken, (req, res, next) => {
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
