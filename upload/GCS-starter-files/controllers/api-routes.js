// const db = require("../models")
const { format } = require('util');
const Multer = require("multer")
const { Storage } = require("@google-cloud/storage")
const uuid = require("uuid")
const uuidv1 = uuid.v1;
// env
require("dotenv").config()

const storage = new Storage({ 
  projectId: process.env.GCLOUD_ID_PROJECT,
  credentials: {
    client_email: process.env.GCLOUD_EMAIL,
    private_key: process.env.GCLOUD_PRIVATE_KEY
  }
})

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})

// const multer = Multer({ dest: './tmp/' });

const bucket = storage.bucket(process.env.GCS_BUCKET)

module.exports = function (app) {

  app.post("/api/imageUpload", multer.single("file"), (req, res)=>{

    if (!req.file) {
      res.status(400).send('No file uploaded.');
      return;
    }
    console.log('/req.file:', req.file);
    
    const newFileName = uuidv1() + "-" + req.file.originalname;
    const blob = bucket.file(newFileName);
    const blobStream = blob.createWriteStream();

    blobStream.on("error", err => {
      res.status(400).send('No file uploaded.');
      return;
    })
    blobStream.on("finish", () => {

      console.log("blob.name:",blob.name);
      

      const publicUrl = format(
        `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${blob.name}`
      );
      res.status(200).send(publicUrl);

      console.log("finish");
      
    })

    blobStream.end(req.file.buffer)

  })

  app.post("/api/imageUpload2", multer.single("file"), (req, res) => {

    if (!req.file) {
      res.status(400).send('No file uploaded.');
      return;
    }
    console.log('/req.file:', req.file);
    console.log('fileUpload:',fileUpload);
    
    
    bucket.upload('./tmp/'+req.file.filename, function (err, file) {
      if (err) throw new Error(err);

      if(file){
        console.log(file);
        
      }
    });



  })
}