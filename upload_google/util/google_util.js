const StorageSingletonClass = require("./storage_singleton")
const { v4: uuidv4 } = require('uuid');

const getPublicUrl = (filename) => {
  return `https://storage.googleapis.com/nwo-bucket1/${filename}`
}


const uploadImage =  (file) => {
  const storage = StorageSingletonClass.getInstance().getStorage();
  
  const bucket = storage.bucket("nwo-bucket1")
  
  const promise = new Promise((resolve, reject) => {

  const myName= getName(file)

  const blob = bucket.file(myName)
  const stream = blob.createWriteStream();

  stream
    .on('error', (err) => {
      file.cloudStorageError = err
      reject(err)
    })
    .on('finish', async () => {
      try {
        
        file.cloudStorageObject = myName
        file.cloudStoragePublicUrl = getPublicUrl(myName)

        resolve(file);
      } catch (error) {
        reject(error)
      }
    })
    .end(file.data);

  })
  return promise;
}

function getName(archivo){
    const nombreCortado = archivo.name.split('.');
    const extension = nombreCortado[ nombreCortado.length - 1 ];
    return uuidv4()+'.'+extension;
}


function isValid(files){
  let rpta = true;
  const extensionesValidas = ['png','jpg','jpeg','gif','pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pps', 'ppsx'];
  files.myFile.every((file, index) => {
    let nombreCortado = file.name.split('.');
    let extension = nombreCortado[ nombreCortado.length - 1 ];
    if ( !extensionesValidas.includes( extension ) ) {
      
      rpta =  false;
      return false;
     
    }
    return true;
  });
  

  return rpta;
}


module.exports = {
  uploadImage,
  getPublicUrl,
  isValid
};