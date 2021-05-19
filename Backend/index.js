'use restrict'
const session = require('express-session');
var mongoose = require('mongoose');
var app = require('./app');
var port = 3900;
const connectRedis = require('connect-redis');
var config = require('./config.json');//se carga config.json
var validator = require('validator');

//se declara el cliente de redis
var Redis = require("ioredis");

app.set('trust proxy', 1); // enable this if you run behind a proxy (e.g. nginx)
const RedisStore = connectRedis(session)

mongoose.set("useFindAndModify", false);//Desactiva metodos antiguos
mongoose.Promise = global.Promise;//Evita falla en la conexion a la bd
mongoose.connect('mongodb://localhost:27017/PruebaDB', { useNewUrlParser: true, useUnifiedTopology: true})
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


//crea WebSocket
const WebSocket = require('ws');
const  bodyParser  = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 6060;
const wss = new WebSocket.Server({ port: 6060 });
console.log((new Date()) + " Server is listening on port " + PORT);

	app.use(session({
		store: new RedisStore({ client: rediscli }),
		secret: config.secret,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: false, // if true only transmit cookie over https
			httpOnly: false, // if true prevent client side JS from reading the cookie 
			maxAge:  100 * 50 * 10 // session max age in miliseconds // 15 min
		}
	}))

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
						console.log("punsubscribe to=" + sClienteId + " channel.");
						if (err) {
							console.log(err);
						}
					});
					sockets = sockets.filter(s => s !== socket);
				}
				else {
					console.log('Conexion=' + sClienteId);
					socket.sClienteId = sClienteId;
					sockets.push(socket);
					rediscli.psubscribe([sClienteId], (err, count) => {
						console.log("psubscribe to=" + sClienteId + " channels.");
						console.log('Connected to redis session successfully');
						if (err) {
							console.log(err);
						}
					});
					// When a socket closes, or disconnects, remove it from the array.
					socket.on('close', function () {
						rediscli.punsubscribe([sClienteId], (err, count) => {
							console.log("punsubscribe to=" + count + " channels.");
							if (err) {
								return console.log(err);
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
