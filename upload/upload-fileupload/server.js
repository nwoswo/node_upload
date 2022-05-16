const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const morgan = require('morgan');
const path = require('path');
const { Storage } = require("@google-cloud/storage")
const ModelImagen = require('./model_imagen');

require("dotenv").config();

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

// https://en.wikipedia.org/wiki/File_size
app.use(fileUpload({
  createParentPath:true, 
  limits: { fileSize: 2 * 1024* 1024 },
  abortOnLimit: true
}));


// app.use(fileUpload({
//   useTempFiles: true,
//   tempFileDir: '/tmp/'
// }));



const getPublicUrl = (filename) => {
  return `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${filename}`
}

////////////rutas /////////////

app.post('/uploadfile-gcs', (req, res, next) => {
  const file = req.files.myFile
  console.log('file:', file);

  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }

  bucket.upload(file.tempFilePath, async function (err, file) {
    if (err) res.send(err);

    if (file) {
      res.send(`https://storage.googleapis.com/${process.env.GCS_BUCKET}/${file.metadata.name}`)

    }
  });

})
app.post('/uploadmultiple-gcs', async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded'
      });
    } else {
      
      let promises = [];
      console.log('req.files_:', req.files);


      //loop all files
      req.files.myFiles.forEach((image, index) => {


        
        const file = bucket.file(image.name)

        const promise = new Promise((resolve, reject) => {
          const stream = file.createWriteStream();

          stream.on('error', (err) => {
            image.cloudStorageError = err
            reject(err)
          });

          stream.on('finish', async () => {
            try {
              image.cloudStorageObject = image.name
              await file.makePublic()
              image.cloudStoragePublicUrl = getPublicUrl(image.name)

              
              resolve(image);
            } catch (error) {
              reject(error)
            }
          });

          
          stream.end(image.data);
        })

        promises.push(promise)

      

      })

      Promise.all(promises)
        .then( files => {
          console.log('_:',files);
          
          files = files.map(item => {delete item.data; return item});
         

          res.send({
            status: true,
            message: 'Files are uploaded',
            data: files
          });
        })
       
     
    }
  } catch (err) {
    console.log(err);

    res.status(500).send(err.message);
  }
});

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

app.post('/uploadbd/:id', (req, res) => {

  let data = {
    producto_nombre: req.body.nombre
  }

  let modelImagen = new ModelImagen(data);

  console.log(req.files.imagen);
  

  modelImagen.imagen.data = req.files.imagen.data;
  modelImagen.imagen.contentType = req.files.imagen.mimetype;
  
  modelImagen.save( (err, rpta ) => {

    if(err){
      res.json({ err: err })
    }

    res.json({
      result: true
    })
  } )

})

app.post('/uploadfiletemp', async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded'
      });
    } else {

      let targetFile = req.files.myFile;

      targetFile.mv(path.join(__dirname, 'uploads', targetFile.name), (err) => {
        if (err)
          return res.status(500).send(err);
        res.send('File uploaded!');
      });

     
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/uploadfile', async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded'
      });
    } else {
      
      let imagen = req.files.myFile;

      //Use the mv() method to place the file in upload directory (i.e. "uploads")
      imagen.mv('./uploads/' + imagen.name);

      //send response
      res.send({
        status: true,
        message: 'File is uploaded',
        data: {
          name: imagen.name,
          mimetype: imagen.mimetype,
          size: imagen.size
        }
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/uploadmultiple', async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded'
      });
    } else {
      let data = [];
      console.log('req.files_:', req.files);
      
      //loop all files
      req.files.myFiles.forEach( (image,index) =>{

        let photo = image;

        //move photo to uploads directory
        photo.mv('./uploads/' + photo.name);

        //push file details
        data.push({
          name: photo.name,
          mimetype: photo.mimetype,
          size: photo.size
        });

      } )

      res.send({
        status: true,
        message: 'Files are uploaded',
        data: data
      });
    }
  } catch (err) {
    console.log(err);
    
    res.status(500).send(err);
  }
});





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
  console.log('Server express-fileupload Ok PORT 4500');
  
});