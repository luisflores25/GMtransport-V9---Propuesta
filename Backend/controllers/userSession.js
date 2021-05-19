/*const session = require('express-session');
const connectRedis = require('connect-redis');
const RedisStore = connectRedis(session);
const redisClient = require('../models/cacheCli');
const config= require('../config.json');

new session({
    store: new RedisStore({ client: redisClient }),
    secret: config.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // if true only transmit cookie over https
        httpOnly: false, // if true prevent client side JS from reading the cookie 
        maxAge:  600 * 10 * 10 // session max age in miliseconds // 15 min
    }
})

redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err);
});
redisClient.on('connect', function (err) {
    console.log('Connected to redis successfully');
});*/

var controllerUserSessions = {
    login: (req, res)=> {
        console.log(req)
        const sessiona = req.session;
        const { usuario , empresa} = req.body
        sessiona.usuario = usuario;
        sessiona.empresa = empresa;
        // add username and password validation logic here if you want.If user is authenticated send the response as success
        
        return res.status(200).send({
            status: 'success',
            usuario: sessiona.usuario,
            empresa: sessiona.empresa,
            
        });
    },
    auth: (req, res)=> {
        const sess = req.session;
        if (sess.usuario) {
            if (sess.usuario) {
                return res.status(200).send({
                    status: 'success',
                    usuario: sess.usuario});
            }
        } else {
            return res.status(404).send({
                status: 'unsuccessfull'
            });
        }
    },
    logout: (req, res)=> {
        req.session.destroy(err => {
            if (err) {
                return res.status(402).send({ 
                    status: 'error' });
            }
            return res.status(200).send({
                status: 'success'
            });
        });
    }
}
module.exports = controllerUserSessions;