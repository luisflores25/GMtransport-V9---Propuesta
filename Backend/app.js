'use strict'
const session = require('express-session');
const connectRedis = require('connect-redis');
const config= require('./config.json');

const RedisStore = connectRedis(session)
//Configure redis client
const redisClient = require('./models/cacheCli');

//cargar modulos de node para crear el servidor
var express = require('express');
var bodyParser = require('body-parser');

// Ejecutar express (http)
var app = express();


// cargar ficheros rutas
var article_routes = require("./rutas/article");
var session_routes= require("./rutas/session_routes");

//Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err);
});
redisClient.on('connect', function (err) {
    console.log('Connected to redis successfully');
});

//Configure session middleware
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: config.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // if true only transmit cookie over https
        httpOnly: false, // if true prevent client side JS from reading the cookie 
        maxAge:  600 * 10 * 10 // session max age in miliseconds // 15 min
    }
}));
//Añadir prefijos a rutas
//app.use('/api', article_routes);
app.use('/api', session_routes);


// Exportar modulo (fichero actual)
module.exports = app