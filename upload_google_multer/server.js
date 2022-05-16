const express = require('express');
const { Storage } = require("@google-cloud/storage");
const multer = require('multer');
require("dotenv").config();
var path = require('path');

const storage = new Storage({
  projectId: process.env.GCLOUD_ID_PROJECT,
  credentials: {
    client_email: process.env.GCLOUD_EMAIL,
    private_key: process.env.GCLOUD_PRIVATE_KEY
  }
})
const bucket = storage.bucket(process.env.GCS_BUCKET)

//////////// EXPRESS//////////////////
const app = express(); // Expresss Raiz 



app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded





var storagem = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './tmp')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
})

var upload = multer({ storage: storagem })

////////////rutas /////////////



app.post('/uploadfile-gcs', upload.single('myFile'),  (req, res, next) => {
  const file = req.file
  console.log('file:', file);
  
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }

  bucket.upload(file.path, async function (err, file) {
    if (err) res.send(err);

    if (file) {
      res.send(`https://storage.googleapis.com/${process.env.GCS_BUCKET}/${file.metadata.name}`)

    }
  });
 

})

const getPublicUrl = (filename) => {
  return `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${filename}`
}

app.listen(4500, () => {
  console.log('Server multer Ok : 4500');
  
});