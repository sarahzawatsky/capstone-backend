const mongoose = require('mongoose')
require('./user')

const storyUploadSchema = mongoose.Schema({
  // event: {
  //   type: String,
  //   required: true
  // },
  chapter: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectID,
    ref: 'User',
    required: true
  },
  narrative: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

const StoryUpload = mongoose.model('StoryUpload', storyUploadSchema)

module.exports = StoryUpload
