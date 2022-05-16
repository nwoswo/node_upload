const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var modelImagen = new Schema({
  producto_nombre: {
    type: String
  },
  
  imagen : {
    data: Buffer,
    contentType: String
  }
})

const model = mongoose.model('ModelImagen', modelImagen);

module.exports = model;


