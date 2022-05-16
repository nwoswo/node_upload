const express = require('express');
const fileUpload = require('express-fileupload');




//////////// EXPRESS//////////////////
const app = express(); // Expresss Raiz 

app.use(express.json());
// app.use(express.urlencoded()); //Parse URL-encoded bodies

// NO es muy necesario usar el temp por que cuando movemos usamos el mv que ya viene dentro del file
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 },
  abortOnLimit: true
}));



app.post('/upload', async (req, res) => {
  
  let file = req.files.myFile;
  console.log(file);
  
  let uploadPath = __dirname + '/uploads/' + file.name;

  file.mv(uploadPath, function (err) {
    if (err)
      return res.status(500).send(err);

    res.send({
      status: true,
      message: 'File is uploaded',
      data: {
        name: file.name,
        mimetype: file.mimetype,
        size: file.size
      }
    });
  });
  
});

app.post('/upload-multiple', async (req, res) => {

  let files = req.files.myFile;
  let data = [];

  console.log(files);
  
  files.forEach( (file,index) => {

    let uploadPath = __dirname + '/uploads/' + file.name;

    file.mv(uploadPath);

    data.push({
          name: file.name,
          mimetype: file.mimetype,
          size: file.size
      });
      
    
  });

  res.send({
    status: true,
    message: 'Files are uploaded',
    data: data
  });

});



app.listen(4500, () => {
  console.log('Server express-fileupload Ok PORT 4500');

});