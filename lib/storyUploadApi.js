require('dotenv').config()
// Require AWS SDK for Node.js
const AWS = require('aws-sdk')

// Config AWS to use our region
AWS.config.update({region: 'us-east-1'})

// Create S3 service object
const s3 = new AWS.S3({apiVersion: '2006-03-01'})

module.exports = function (file) {
// Creating a promise to be run
  return new Promise((resolve, reject) => {
    // Building an object with parameters for S3 upload
    // Included: 'Bucket' name, 'Key' (file name), 'Body' (file data)
    // and 'ACL' (access control lists) to control access, in this case, publically
    const uploadParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: Date.now() + '_' + file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    }

    // call S3 to retrieve upload file to specified bucket (use the upload method to upload to S3 using paramas)
    s3.upload(uploadParams, function (err, data) {
      if (err) {
        reject(err)
      } else if (data) {
        resolve(data)
      }
    })
  })
}
