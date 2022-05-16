const express = require('express');
const mongoose = require('mongoose');
const { Storage } = require("@google-cloud/storage")
const bodyParser = require('body-parser');
var path = require('path');
const morgan = require('morgan');
const multer = require('multer');
require("dotenv").config();
const ModelImagen = require('./model_imagen');

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

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));





var storagem = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './multer-upload')
  },
  filename: function (req, file, cb) {
    
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
})

var upload = multer({ storage: storagem })

var storage2 = multer.memoryStorage();

const upload2 = multer({
  storage: storage2,
  limits: 1024 * 1024
})


////////////rutas /////////////


app.get('/imagen/:id', (req, res) => {

  ModelImagen.findById(req.params.id).exec((err, doc) => {
    if (err) {
      res.json({
        err: err,

      })
    }

    console.log('imagen', doc);

    res.set('Content-Type', doc.imagen.contentType);
    return res.send(doc.imagen.data)

  })

})


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

const sendUploadToGCS = (req, res, next) => {

  if (!req.files) {
    res.send({
      status: false,
      message: 'No file uploaded'
    });
  }

  let promises = [];
  console.log('req.files:',req.files);
  
  req.files.forEach((image, index) => {
   
    const file = bucket.file(image.originalname)

    const promise = new Promise((resolve, reject) => {
      const stream = file.createWriteStream();

      stream.on('error', (err) => {
        req.files[index].cloudStorageError = err
        reject(err)
      });

      stream.on('finish', async () => {
        try {
          req.files[index].cloudStorageObject = image.originalname
          // await file.makePublic()
          req.files[index].cloudStoragePublicUrl = getPublicUrl(image.originalname)
          resolve();
        } catch (error) {
          reject(error)
        }
      });

      stream.end(image.buffer);
    })

    promises.push(promise)
  });

  Promise.all(promises)
    .then(_ => {
      promises = [];
      next();
    })
    .catch(next);
}


//Uploading multiple files
app.post('/uploadmultiple-gcs', upload2.array('myFiles', 12),  sendUploadToGCS, (req, res, next) => {
  console.log(req.files) // you will get the uploaded files name and url here

  let array = [...req.files]
  array = array.map( item => {
    delete item.buffer;
    return item;
  } ) 
  res.status(200).json({ files: array });

})


app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
  const file = req.file
  
  if (!file) {
    res.send({
      status: false,
      message: 'No file uploaded'
    });
  }
  res.send(file)

})

//Uploading multiple files
app.post('/uploadmultiple', upload.array('myFiles', 12), (req, res, next) => {
  const files = req.files
  console.log(files);
  
  if (!files) {
    res.send({
      status: false,
      message: 'No file uploaded'
    });
  }

  res.send(files)

})




app.post('/uploadfile-bd', upload2.single('myFile'), (req, res, next) => {
 
  console.log('req.file:', req.file);
  
  if (!req.file) {
    res.send({
      status: false,
      message: 'No file uploaded'
    });
  }
  
  let data = {
    producto_nombre: req.file.originalname
  }

  let modelImagen = new ModelImagen(data);

  


  modelImagen.imagen.data = req.file.buffer;
  modelImagen.imagen.contentType = req.file.mimetype;

  modelImagen.save((err, rpta) => {

    if (err) {
      res.json({ err: err })
    }

    res.json({
      result: true
    })
  })

})





// ROUTES
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');

});





mongoose.connect('mongodb://localhost/upload', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then( ()=>{
  console.log('Mongoo Ok');
});

app.listen(4500, () => {
  console.log('Server multer Ok : 4500');
  
});