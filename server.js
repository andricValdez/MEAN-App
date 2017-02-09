
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
	jwt = require("jsonwebtoken");

var http = require("http");
var https = require("https");


var superSecret = "ilovechilechilechilechile";


//********************** Basic Routes ********************************************************** 
// app.get('/', function(req, res){
// 	res.sendFile(path.join(__dirname + '/index.html'));
// });

// app.get('/myFisrtRouter', function(req, res){
// 	res.send("<h1>Congrats! This is your furst Route!</h1>");
// });

//********************** express.Router() ****************************************************** 
// adminRouter.get("/", function(req, res){
// 	res.send("Hello, I am the Dashboard")
// });

// adminRouter.get("/users", function(req, res){
// 	res.send("I show all the users!")
// });

// adminRouter.get("/post", function(req, res){
// 	res.send("I show all the posts!")
// });

// app.use("/admin", adminRouter)

//********************** route Middleware using express.Routing() ******************************* 
// adminRouter.use(function(req, res, next){ //amdminRouter.use define una middleware
// 	//log each request to the console
// 	console.log(req.method, req.url);

// 	//Haz todas las cosas que quieras y después ve a la ruta
// 	next();
// })

// adminRouter.get("/", function(req, res){
// 	res.sendFile(path.join(__dirname + '/index.html'));
// });

// adminRouter.get("/users", function(req, res){
// 	res.send("I am the users")
// });

// app.use("/admin", adminRouter)
 
//********************** structuring Routes **************************************************** 
//podemos tener nuestra app limpia y organizada porque podemos mover cada definición de ruta 
//dentro de su archivo y entrar a esos archivos cuando hacemos uso de app.use
//Ejemplo:
//app.use('/', basicRoutes);
//app.use('/admin', adminRoutes);
//app.use('/api', apiRoutes);

//********************** Rutas con parámetros **************************************************
// adminRouter.get("/users/:name", function(req, res){
// 	res.send("<h1 style='text-align:center'>Hello " + req.params.name +"!</h1>");
// });

// app.use("/admin", adminRouter);

//********************** Rutas Middlewares para parámetros (.param())***************************
// //.parm() ejecuta un middleware para que corra para cierto parámetro de una ruta 
// //Es importante poner el middleware antes de la RUTA!!
// adminRouter.param('name', function(req, res, next, name){
// 	//Hacer cosas: validar nombre, blah, blah, ...
// 	console.log("Haciendo validación sobre " + name);
// 	//Una vez hecha la validación guardar el nuevo item en req
// 	req.name = name
// 	//Ve a la siguiente cosa
// 	next();
// });

// adminRouter.get("/users/:name", function(req, res){
// 	res.send("Hello "+req.name + "!")
// })

// app.use("/admin", adminRouter);

//********************** Login Routes (app.route())**********************************************
// //Nos permite definir multiples acciones en una simple login route
// //Una ruta GET para mostrar el formulario de login y una ruta POST para procesar el formulario login
// //Estas son declaradas directamente a nuestro objeto principal "app" en server.js, pero tambien se
// //pueden declarar directamente en el objeto adminRouter
// app.route("/login")
// 	//Show the form
// 	.get(function(req, res){
// 		res.send("This is the login form");
// 	})

// 	//Process the form
// 	.post(function(req, res){
// 		console.log("Processing");
// 		res.send("Processing the login form");
// 	});
 
//************************** Build a RESTFull API **********************************************

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
// app.set('views/pages', path.join(__dirname, 'views/pages'));


mongoose.connect("mongodb://localhost/API_DB");
//mongoose.connect("mongodb://AndricV:pantech41@jello.modulusmongo.net:27017/Q2ipyvop");


// Usar body parser para tomar la información de las peticiones POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// //Configurar la app para manejar las peticiones CORS
// app.use(function(req, res, next) {
// 	res.setHeader('Access-Control-Allow-Origin', '*');
// 	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
// 	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
// 	next();
// });

//Check to make sure a user with that username exists
//Check to make sure that the user has the correct password (by comparing their password to
//the hashed one saved in the database) • Create a token if all is well
apiRouter.post("/authenticate", function(req, res){
	//Encontrar al usuario
	//Seleccionar explicitamente el nombre  la contraseña
	User.findOne({
		email: req.body.email
	}).select("email password").exec(function(err, user){
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
			var validPassword = user.comparePassword(req.body.password);

			if (!validPassword) {
				res.json({
					success: false,
					message: "Fallo de autenticación. Contraseña Incorrecta"
				})
			}else{
			//Si el usuario y contraseña es correcto, crear token
				var token = jwt.sign({email: user.email}, superSecret); // 1440 = 24 hrs
			
				//Retornar info incluido el token en json  
				res.json({
					success: true,
					message: "Disfruta tu token!",
					token: token,
					email: user.email
				})
			}
		}
	})

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







