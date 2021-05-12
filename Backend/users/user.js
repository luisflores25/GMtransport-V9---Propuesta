'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UsuarioSchema = Schema({
    empresa: String,
    usuario: String,
    password: String,
    role: { type: String, required: true }
});

UsuarioSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.password;
    }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
// usuarios --> guarda documentos de este tipo y con estructura dentro de la coleccion
