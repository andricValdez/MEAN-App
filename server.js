
//Importar librerías/módulos/Dependencias
var express = require('express'),
	app = express(),
	path = require('path');
	adminRouter = express.Router(),
	apiRouter = express.Router(),
	mongoose = require("mongoose"),          //Para trabajar con la base de datos
	bodyParser = require ("body-parser"),
	morgan = require("morgan"),              //Usado para ver peticiones
	port = process.env.PORT || 8080,         //Establecer el puerto de nuestra aplicación
	User = require("./models/User"),         //Modelo del usuario
	Session = require("./models/Session"),   //Modelo de sesion
	jwt = require("jsonwebtoken");

var http = require("http");
var https = require("https");


var superSecret = "ilovechilechilechilechile";

 
//************************** Build a RESTFull API **********************************************

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
// app.set('views/pages', path.join(__dirname, 'views/pages'));


mongoose.connect("mongodb://localhost/MEAN_APP");
//mongoose.connect("mongodb://AndricV:pantech41@jello.modulusmongo.net:27017/Q2ipyvop");


// Usar body parser para tomar la información de las peticiones POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Metodo Delete con endpoints Session --> para cerrar sesion (cambiar edo de active de 'yes' a 'no')

apiRouter.post("/authenticate_token", function(req, res){
	decipher_token (req.body.token)
	//Hace un query a la BD
});



/*
	*************    Middlewares
*/

//amdminRouter.use define una middleware 
adminRouter.use(function(req, res, next){ 
	//log each request to the console
	console.log(req.method, req.url);
	next();
})

app.use(function(req, res, next) {
	console.log('Somebody just came to our app!');
	console.log("req: ",req.path);
	next();
});

//validar tokens una ves iniciada la sesión
//No se puede validar token: al iniciar sesión, al crear usuario, al cerrar sesión
apiRouter.use(function(req, res, next){ 
	//esto se puede cambiar por una variable que se esté pasando en cada peticion para saber si el usuario sigue con sesion abierta y saber si se va a evaluar el token
	//Qué va a paar cuando se quier validar el token con metodos como DELTE o GET... (que no viajen en el body)
	if (req.url=='/users' || req.url == "/still_LogIn" || req.path == '/api/session' || req.url == '/session') {
		next();

	}else if (req.body.oauth_Token && req.body.token) {
		//validar oauth_Token y token
		console.log("oauth_Token: ",req.body.oauth_Token)
		var options = {
			    hostname: "graph.facebook.com",
			    method: 'GET',
			    port: 443,
			    path: '/me?access_token='+req.body.oauth_Token+'',
		 	}; 
  		var reqFB = https.get(options, function(resFB) {
    		resFB.setEncoding('utf8');
	    	resFB.on('data', function(result) {
	    		var obj = JSON.parse(result) 
	    		
	    		if (obj.id) {
	    			//token valido
	    			next();
	    		}else{
	    			//token no valido
	    			res.json({message:"fail"})
	    		}
     		})
	    	});
	    reqFB.on('error', function(e) {
	      console.log('ERROR: ' + e.message);

	    });

	}else if(req.body.token && !req.body.oauth_Token){
		//validar token
		var decoded = jwt.decode(req.body.token);
		console.log("Token: ",req.body.token)
		if (decoded != null) {
			Session.findOne({_id: decoded._id}).select("active token user_id").exec(function(err, session){
				if (err) {
					//token invalido
					res.json({message:"fail"})
				}
				if (session.token == req.body.token) {
					//token valido
					next();
				}else{
					//token invalido
					res.json({message:"fail"})
				}

			});
		}else{
			//token invalido
			res.json({message:"fail"})
		}

	}else{
		next();
	}
	

})

//Cargar todas las peticiones en la consola
app.use(morgan("dev"));



/*
	*************    Rutas de la API
*/

apiRouter.route("/test")
	.post(function(req, res){
		console.log(req.body.token)
		res.json({message:"success"})
	})

app.get("/", function(req, res){
	res.sendfile('views/index.html', {});
});


//*** Obtener una instancia de las rutas de express
apiRouter.get("/", function(req, res){
	res.json({msj:"Welcome to our API"})
})

apiRouter.route("/still_LogIn")
	.post(function(req, res){
		var token = req.body.token
		var decoded = jwt.decode(token);

		if (decoded != null) {
			Session.findOne({_id: decoded._id}).select("active token user_id").exec(function(err, session){
				//Qué pasa si ya no existe la seision... va maracar error (corregir!)
				User.findOne({_id: session.user_id}).select("email username").exec(function(errU, user){ 
					if (err)
						res.send(err);

					if (errU)
						res.send(err);

					if (session.active == 'yes' && session.token == token) {
						res.json({
							success: true,
							token: session.token,
							username: user.username
						})
					}
				})
			})
		}else{
			res.json({message:'fail'})
		}

	})


apiRouter.route("/session")
	.post(function(req, res){
		console.log(req.body.type)
		console.log(req.body.oauth_Token)

		if (req.body.type == "logInFb") {
			//Crear usuario
			oauth_Token = req.body.oauth_Token 
			type = req.body.type;
			password = null

			var options = {
			    hostname: "graph.facebook.com",
			    method: 'GET',
			    port: 443,
			    path: '/me?fields=email,name',
			    headers: { 
			      'Authorization': 'OAuth ' + oauth_Token
			   },
	 		 }; 
	  		var reqFB = https.get(options, function(resFB) {
	    		resFB.setEncoding('utf8');
		    	resFB.on('data', function(result) {
		    		var obj = JSON.parse(result)
		    		req.body.email = obj.email
		    		req.body.username = obj.name
		    		console.log(obj.email, obj.name)
		    		//Almacenar en BD 
		    		saveUsers(req, res)  
		     	})
	 	    });
		    reqFB.on('error', function(e) {
		      console.log('ERROR: ' + e.message);

		    });
		}else if (req.body.type == "logInLocal") {

			User.findOne({email: req.body.email}).select("email password username").exec(function(errU, user){ 
				//Cindcion aqui cuando no encuentra usuario... retornar res
				Session.findOne({user_id: user._id}).select("active token").exec(function(errS, session){
					//Tiene la sesión activa? : 
					//No... crear
					if(!session){
						//Inicio sesión local?
						if (req.body.type == 'logInLocal') {
							saveSession(req, res, user, errU)

						//Inicio sesión con FB?
						}else if(req.body.type == 'logInFb'){
							//Autenticar oauth_tkoen, crear token local y guardar sesion
						}
					//Sí... enviar datos a cliente
					}else if(session){
						if (session.active == 'yes') {
							//Sesion activada 
							console.log("sesion activa")
							res.json({
								success: true,
								message: "Disfruta tu token!.. Sesion creada :)",
								token: session.token,
								username: user.username
							})
						}else{
							//Crea sesion y guarda
							saveSession(req, res, user, errU)
						}
					};
				});
			});
		}
	})

	//Cierre de sesión - cambiar campo active de 'yes' a 'no'
	.delete(function(req, res){
		var token = req.query.token
		var decoded = jwt.decode(token);
		Session.findOne({_id: decoded._id}).select("active token").exec(function(errS, session){
			if (session.active == 'yes') {
				session.active = 'no';
				session.save();
				res.json({
					active: session.active,
					token: session.token
				})
			}
		})
	})

	.get(function(req, res){
		Session.find(function(err, sessions){
			if (err)
				res.send(err);

			res.json(sessions)
		})
	})


apiRouter.route("/usersFB")
	
	.post(function(req, res, next){
		oauth_Token = req.body.oauth_Token 
		type = req.body.type;
		password = null

		var options = {
		    hostname: "graph.facebook.com",
		    method: 'GET',
		    port: 443,
		    path: '/me?fields=email',
		    headers: { 
		      'Authorization': 'OAuth ' + oauth_Token
		   },
 		 }; 
  		var reqFB = https.get(options, function(resFB) {
    		resFB.setEncoding('utf8');
	    	resFB.on('data', function(result) {
	    		var obj = JSON.parse(result)
	    		//Almacenar en BD 
	    		saveUsers(null, obj.email, password, type, oauth_Token, res)     
	     	})
 	    });
	    reqFB.on('error', function(e) {
	      console.log('ERROR: ' + e.message);

	    });
	});

apiRouter.route("/users")
	
	//Crear un usuario
	.post(function(req, res){
		username = req.body.username;
		email = req.body.email;
		password = req.body.password;
		type = req.body.type;
		oauth_Token = null;

		// saveUsers(username, email, password, type, oauth_Token, res)
		saveUsers(req, res)

	})
 
	//Tomar a todos los usuatios
	.get(function(req, res){

		User.find(function(err, users){
			if (err)
				res.send(err);
			res.json({records:users})
		});
	})


//*** Modificar un solo usuario por su Id:
apiRouter.route("/users/:user_id")

	//Obtener usuario con cierto id
	.get(function(req, res){
		User.findById(req.params.user_id, function(err, user){
			if (err)
				res.send(err)

			res.json(user);
		});
	})

	//Actulizar usuario con cierto id
	.put(function(req, res){

		//Usar el modelo del usuario para encontrar al usuario que queremos
		User.findById(req.params.user_id, function(err, user){
			if (err) 
				res.send(err);

			//Actualizar la info del usuario solo si hay algo nuevo
			if (req.body.email) 
				user.email = req.body.email;
			if (req.body.password)
				user.password = req.body.password;

			//Guardar el usuario
			user.save(function(err){
				if (err)
					res.send(err);

				res.json({message:"Usuario actualizado"});
			})
		})
	})

	//eliminar a un usuario con cierto id
	.delete(function(req, res){
		User.remove({_id: req.params.user_id}, function(err, user){
			if(err)
				return res.send(err)

			res.json({mesagge:"Usiario eliminado"})
		});
	})

//Todas las rutas van a estar prefijadas con "api"
app.use("/api", apiRouter);

//*** Inicializar servidor
app.listen(port);
console.log("Servidor escuchando en puerto 8080!");



/* 
	Funciones 
*/

//function saveUsers(username, email, password, type, oauth_Token, res){
function saveUsers(req, res){
	//Crear una nueva instancia del modelo del usuario
	var user = new User();

	//Establecer la info del usuario (que viene en la petición)
	user.username = req.body.username;
	user.email = req.body.email;
	user.password = req.body.password;
	user.type = req.body.type;

	if (req.body.type == "logInLocal") {
		user.oauth_Token = null;
	}
	if (req.body.type == "logInFb") {
		user.password = null;
	}

	//Gurdar al usuario y checar errores
	user.save(function(err){
		if(err){
			//Duplicar entrada
			//console.log(err)
			if(err.code = 11000)
				return res.json({success:false, message:"A user with that email already exist"});
			else
				return res.send(err);
		};

		// User.find(function(err, users){
		// 	if (err)
		// 		res.send(err);
		// 	res.json(user)

		// });

		if (err)
			res.send(err);

		if (req.body.type == "logInLocal") {
			console.log(user)
			saveSession(req, res, user, err)
			// saveSession(req, res, user)
		}else if (req.body.type == "logInFb") {
			console.log(user)
			saveSession(req, res, user, err)
		}

		// res.json(user)

	});
};

// function saveSession(req, res, user, err){
function saveSession(req, res, user, err){
	type = req.body.type

	if(err)
		throw err;

	//No se encontró un usuario con ese email
	if(!user){
		res.json({
			success: false,
			message: "Fallo de autenticación. El usuario no se encontró"
		})
	}else if(user){
	//Checar si la contraseña coincide
		if (type == 'logInFb') {
			validPassword = true;
		}else{
			var validPassword = user.comparePassword(req.body.password);
		}

		if (!validPassword) {
			res.json({
				success: false,
				message: "Fallo de autenticación. Contraseña Incorrecta"
			})
		}else{
		//Si el usuario y contraseña es correcto, crear token y crear sesión
			var session = new Session();

			session.token = '';
			session.type = req.body.type;
			session.user_id = user._id
			session.active = 'yes'

			//Crear doc de sesison en BD
			session.save(function(err, response){
				console.log("Reponse:",response)
				if(err){

					//Duplicar entrada
					if(err.code = 11000)
						return res.json({success:false, message:"That session already exist"});
					else
						return res.send(err);
				};

				//Crear token y actuaizar la BD
				var token = jwt.sign({_id: response._id}, superSecret); // 1440 = 24 hrs
				// Session.findById(decoded._id, function(err, session){
				// 	session.token = token;
				// 	session.save(function(err, response){
				// 		console.log(response)
				// 	})
				// })
				response.token = token
				session.save()

				//Retornar info incluido el token en json  
				res.json({
					success: true,
					message: "Disfruta tu token!.. Sesion creada :)",
					token: token,
					username: user.username
				})
			});

			
		}
	}

}

function decipher_token(token){
	console.log("token: ",token)
	var decoded = jwt.decode(token);
	return decoded;
}






