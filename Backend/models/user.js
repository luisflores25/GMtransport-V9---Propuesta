'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UsuarioSchema = Schema({
    _id: String,
    empresa: String,
    usuario: String,
    password: String
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
// articles --> guarda documentos de este tipo y con estructura dentro de la coleccion
