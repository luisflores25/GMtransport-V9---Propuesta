'use restrict'
var mongoose = require('mongoose');
var app = require('./app');
var port = 3900;
//se carga config.json
var config = require('./config.json');

//se declara el cliente de redis
var Redis = require("ioredis");
////
mongoose.set("useFindAndModify", false);//Desactiva metodos antiguos
mongoose.Promise = global.Promise;//Evita falla en la conexion a la bd
mongoose.connect('mongodb://localhost:27017/PruebaDB', { useNewUrlParser: true })
	.then(() => {
		console.log("Conexion a la base de datos correcta!!!");

		//crear servidor y escuchar peticiones

		app.listen(port, () => {
			console.log('Servidor corriendo en http://localhost:' + port);
		})
	});


const rediscli = new Redis(config.RedisPort, config.RedisServer,
	{ password: config.RedisPassword });

//declara el regular expression del UUID
var sPatt = /[0-9A-z]{8}/g;

//se subscribe a todos los canales
/*rediscli.psubscribe(['*'], (err, count) => {
	console.log("psubscribe=" + count + " channels.");
	if (err) {
		console.log(err);
	}
});*/

//crea WebSocket
const WebSocket = require('ws');
const { default: validator } = require('validator');
const { json } = require('body-parser');
const PORT = 6060;
const wss = new WebSocket.Server({ port: 6060 });
console.log((new Date()) + " Server is listening on port " + PORT);

let sockets = [];
wss.on('connection', function (socket) {
	// When you receive a message, send that message to every socket.
		socket.on('message', function (msg) {
			sockets.forEach(s => s.send(msg));
			var sClienteId = msg;
			console.log(sockets.length);
			if (!validator.isEmpty(sClienteId)) {
				if (sockets.length == 1) {
					// termina la conexion
					rediscli.punsubscribe([sClienteId], (err, count) => {
						console.log("punsubscribe to=" + count + " channels.");
						if (err) {
							console.log(err);
						}
					});
					sockets = sockets.filter(s => s !== socket);
				}
				else {
					/*session({
						secret: 'GMscsgmterpv9',
						// create new redis store.
						store: new redisStore({ host: config.RedisServer, port: config.RedisPort, client: sClienteId,ttl : 260}),
						saveUninitialized: false,
						resave: false
					});*/
					console.log('Conexion=' + sClienteId);
					socket.sClienteId = sClienteId;
					sockets.push(socket);
					rediscli.psubscribe([sClienteId], (err, count) => {
						console.log("psubscribe to=" + count + " channels.");
						if (err) {
							console.log(err);
						}
					});

					//socket.send(sClienteId)
					// When a socket closes, or disconnects, remove it from the array.
					socket.on('close', function () {
						rediscli.punsubscribe([sClienteId], (err, count) => {
							console.log("punsubscribe to=" + count + " channels.");
							if (err) {
								console.log(err);
							}
						});
						sockets = sockets.filter(s => s !== socket);
					});
				}
				//cuando se reciba un mensaje de redis se manda el mensaje a los WebSocket
				//que correspondan al rfc=channel
			}
		});
	
	rediscli.on('pmessage', function (subscribed, channel, message) {
		if (socket.readyState == WebSocket.OPEN && socket.sClienteId === channel) {
			console.log(subscribed + ' ' + channel + ' ' + message);
			socket.send(message);
		}
	});
});
