'use strict'

//cargar modulos de node para crear el servidor
var express = require('express');
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Ejecutar express (http)
var app = express();

const createTestUser = require('./_helpers/create-test-user');
createTestUser();

// cargar ficheros rutas
var article_routes = require("./rutas/article");

//Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

//CORS Acceso cruzado entre dominios
//permite las llamadas/peticiones al api desde cualquier front-end

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, x-access-token, Origin, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

//Añadir prefijos a rutas
app.use('/api', article_routes);


// Esportar modulo (fichero actual)
module.exports = app