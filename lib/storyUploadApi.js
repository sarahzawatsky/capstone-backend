require('dotenv').config()
// Require AWS SDK for Node.js
const AWS = require('aws-sdk')

// Config SWS to use our region
AWS.config.update({
  region: 'us-east-1'
})

const s3 = new AWS.S3({
  apiVersion: '2006-03-01'
})

const s3Upload = (file) => {
  return new Promise((resolve, reject) => {
    const uploadParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: Date.now() + file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    }
    // Used the 'upload' method to upload to S3 using params
    s3.upload(uploadParams, function (err, data) {
      if (err) {
        reject(err) // reject error
      } else {
        resolve(data) // resolve with data
      }
    })
  })
}

const s3Delete = params => (
  new Promise((resolve, reject) => {
    s3.deleteObject(params, (err) => {
      if (err) {
        reject(err)
      }
      resolve('success')
    })
  })
)

module.exports = {
  s3Upload,
  s3Delete
}
