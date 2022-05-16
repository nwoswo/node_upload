const express = require('express');
const fileUpload = require('express-fileupload');
const StorageSingletonClass = require("./util/storage_singleton")
const { uploadImage,isValid } = require("./util/google_util")


//Configuramos Cliente Google Storage
// const storage = getstorage();
// const bucket = storage.bucket("nwo-bucket1")



//////////// EXPRESS//////////////////
const app = express(); // Expresss Raiz 

app.use(express.json({extended: false}));
// app.use(express.urlencoded()); //Parse URL-encoded bodies

app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 },
  // abortOnLimit: true
}));

app.post('/upload',async (req, res, next) => {

  let file = req.files.myFile
  
  file = await uploadImage(file)

  // console.log('imageUrl: ',imageUrl);
  delete file.data;
 
  res.send({
    status: true,
    message: 'Files are uploaded',
    data: file
  });
 

})


app.delete('/upload/:id',async (req, res, next) => {

  let id = req.params.id

  const bucket = StorageSingletonClass.getInstance().getStorage();
  


  let rpta = await bucket.file(id).delete();
  res.json(rpta)

  console.log(`gs://${bucket.name}/${id} deleted`);
  

})

app.post('/upload-multiple', async (req, res, next) => {

  const extensionesValidas = ['png','jpg','jpeg','gif'];

  console.log(req.files);
  
    if(req.files){
      
      if(!isValid(req.files)){
        console.log('error');
        
        let err = new Error(`La extensión  no es permitida `);
        // res.json(err)
        return next(err);
      }

        
     
    }

  
 
  console.log('no error continua');
  let promises = [];
  req.files.myFile.forEach((file, index) => {

    
    promises.push(uploadImage(file))
    
  });

  let files = await Promise.all(promises);

  // console.log('files: ',files);
  

  files = files.map(item => { delete item.data; return item});


  res.send({
    status: true,
    message: 'Files are uploaded',
    data: files
  });


})


app.listen(4500, () => {
  console.log('Server express-fileupload Ok PORT 4500');

});