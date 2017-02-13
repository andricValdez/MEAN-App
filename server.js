
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


mongoose.connect("mongodb://localhost/API_DB");
//mongoose.connect("mongodb://AndricV:pantech41@jello.modulusmongo.net:27017/Q2ipyvop");


// Usar body parser para tomar la información de las peticiones POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//Check to make sure a user with that username exists
//Check to make sure that the user has the correct password (by comparing their password to
//the hashed one saved in the database) • Create a token if all is well
apiRouter.post("/authenticate", function(req, res){

	User.findOne({email: req.body.email}).select("email password").exec(function(errU, user){
		// console.log(user._id); 
		Session.findOne({user_id: user._id}).select("active token").exec(function(errS, session){
			console.log(session); 
			if(!session){
				console.log('session NO created'); 
				if (req.body.type == 'logInLocal') {
					saveSession(req, res, user, errU)
				}
			}else if(session){
				console.log('session YA created'); 
				console.log(session.active)

				if (session.active == 'yes') {
					//Sesion activada
					return res.json(session);


				}else{
					saveSession(req, res, user, errU)
				}
			};
		});
	});


});

app.use(function(req, res, next) {
	console.log('Somebody just came to our app!');
	next();
});

//amdminRouter.use define una middleware
adminRouter.use(function(req, res, next){ 
	//log each request to the console
	console.log(req.method, req.url);

	//Haz todas las cosas que quieras y después ve a la ruta
	next();
})

//Cargar todas las peticiones en la consola
app.use(morgan("dev"));

//*** Rutas de la API
app.get("/", function(req, res){
	//res.send("<h1 style='text-align:center'>Welcome to the home page!</h1>");
	//res.sendfile('views/index.html', {});
	// res.sendfile('views/indexAngular.html', {});
	res.sendfile('views/index.html', {});
});


//*** Obtener una instancia de las rutas de express
apiRouter.get("/", function(req, res){
	res.json({msj:"Welcome to our API"})
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
	    		saveUsers(obj.email, password, type, oauth_Token, res)     
	     	})
 	    });
	    reqFB.on('error', function(e) {
	      console.log('ERROR: ' + e.message);

	    });
	});

apiRouter.route("/users")
	
	//Crear un usuario
	.post(function(req, res){
		
		email = req.body.email;
		password = req.body.password;
		type = req.body.type;
		oauth_Token = null;

		saveUsers(email, password, type, oauth_Token, res)

	})
 
	//Tomar a todos los usuatios
	.get(function(req, res){

		User.find(function(err, users){
			if (err)
				res.send(err);

			res.json(users);
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

function saveUsers(email, password, type, oauth_Token, res){
	//Crear una nueva instancia del modelo del usuario
	var user = new User();

	//Establecer la info del usuario (que viene en la petición)
	user.email = email;
	user.password = password;
	user.type = type;
	user.oauth_Token = oauth_Token;

	//Gurdar al usuario y checar errores
	user.save(function(err){
		if(err){
			//Duplicar entrada
			if(err.code = 11000)
				return res.json({success:false, message:"A user with that email already exist"});
			else
				return res.send(err);
		};

		User.find(function(err, users){
			if (err)
				res.send(err);

			res.json(users);
		});
	});
};

function saveSession(req, res, user, err){
	type = req.body.type

	if(err)
		throw err;

	console.log(user)
	//No se encontró un usuario con ese email
	if(!user){
		res.json({
			success: false,
			message: "Fallo de autenticación. El usuario no se encontró"
		})
	}else if(user){
	//Checar si la contraseña coincide
		var validPassword = user.comparePassword(req.body.password);

		if (!validPassword) {
			res.json({
				success: false,
				message: "Fallo de autenticación. Contraseña Incorrecta"
			})
		}else{
		//Si el usuario y contraseña es correcto, crear token y crear sesión
			var token = jwt.sign({email: user.email}, superSecret); // 1440 = 24 hrs
			var session = new Session();

			session.token = token;
			session.type = type;
			session.user_id = user._id
			session.active = 'yes'

			//Crear doc de sesison en BD
			session.save(function(err){
				if(err){
					//Duplicar entrada
					if(err.code = 11000)
						return res.json({success:false, message:"That session already exist"});
					else
						return res.send(err);
				};

				// Session.find(function(err, sessions){
				// 	if (err)
				// 		res.send(err);

				// 	res.json(sessions);
				// });

				//Retornar info incluido el token en json  
				res.json({
					success: true,
					message: "Disfruta tu token!.. Sesion creada :)",
					token: token,
					email: user.email
				})
			});

			
		}
	}

}







