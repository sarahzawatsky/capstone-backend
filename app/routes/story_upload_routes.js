const express = require('express')
const passport = require('passport')

const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

const StoryUpload = require('../models/story_upload')

const { s3Upload, s3Delete } = require('../../lib/storyUploadApi')

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
  console.log(req.file)
  req.file.owner = req.user.id
  s3Upload(req.file)
    .then(s3Response => {
      console.log(s3Response)
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
router.patch('/stories/:id', requireToken, upload.single('file'), removeBlanks, (req, res, next) => {
  req.body.owner = req.user.id
  delete req.body.user

  if (req.file) {
    console.log('update route', req.file)
    s3Upload(req.file)
      .then(s3Response => {
        StoryUpload.findById(req.params.id)
          .then(handle404)
          .then(book => {
            requireOwnership(req, book)
            if (book.url) {
              console.log(book.url)
              s3Delete({
                Bucket: process.env.BUCKET_NAME,
                Key: book.url.split('/').pop()
              })
            }
            return book.update({
              ...req.body,
              url: s3Response.Location
            })
          })
          .then(() => res.sendStatus(204))
          .catch(next)
      })
  } else {
    console.log('no file')
    StoryUpload.findById(req.params.id)
      .then(handle404)
      .then(storyUpload => {
        requireOwnership(req, storyUpload)

        return storyUpload.updateOne(req.body.storyUpload)
      })
      .then(() => res.sendStatus(204))
      .catch(next)
  }
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
