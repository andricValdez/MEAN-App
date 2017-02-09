
//The Angular routing module provides us with the $routeProvider service which is how 
//we will configure the routes. Routes are defined on the $routeProvider object using .when().

//In Angular, the $location service parses the URL in the address bar and makes changes to your
//application and vice versa.

//We will use the $locationProvider service provided by Angular to set the HTML5 Mode of our app to true. 
//This will ensure that our app uses the HTML5 History API (used by all the modern browsers)


//****************

//Inyectar ngRoute para toas nuestras routing necesarias
var routes = angular.module("routerRoutes", ["ngRoute"])

//Configurar nuestras rutas
routes.config(function($routeProvider, $locationProvider){
	$routeProvider.

	//Ruta para el home page
	when('/home', {
		templateURL  : "views/pages/home.html",
		controller   : 'homeController',
		controllerAS : 'home'
	}).

	//Ruta para el about page
	when('/about', {
		templateURL  : 'views/pages/about.html',
		controller   : 'aboutController',
		controllerAS : 'about'
	}).

	//Ruta oara contact page
	when('/contact', {
		templateURL  : 'views/pages/contact.html',
		controller   : 'contactController',
		controllerAS : 'contact'
	})

	// set our app up to have pretty URLS
	$locationProvider.html5Mode(true);
});

