

//Cuando el documento esté listo, ejecuta:

$(document).ready(function(){

	// $("#SignUp").hide();
	var type = ' ';

	$("#submitUsers").click(function(){
		var email  = $("#email").val();
		var password = $("#password").val();
		type = 'myApp'
		console.log(type)

		if (email == "" || password == "") {
			//alert("Debes llenar todos los campos")
			$("#emptyFields").show();
		}else{
 
			$.post("/api/users",{
				email: email,
				password: password,
			}, function(data, status){
				console.log(data,status)
				if (data.success != false) {
					alert("Usuario creado correctamente");
					updateUserTable(data);
				}else{
					alert("Ya existe un usuario con ese email o contraseña");
				}
			})
		}
	});
 
	$("#getUsers").click(function(){	
		console.log("getUsers")
		$.get("/api/users", function(data, status){
			//console.log(data,status)
			if (status == "success") {
				updateUserTable(data);
				
			};
		})
	});


 // 	$("#createAccount").click(function(){	
	// 	$("#SignUp").show();
	// 	$("#createAccount").hide();

	// });


	// $("#signInToSystem").click(function(){
	// 	var username = $("#userName2").val();
	// 	var password = $("#password2").val();

	// 	$.post("/api/authenticate",{
	// 		username: username,
	// 		password: password

	// 	},function(data, status){
	// 		console.log(data)
	// 		if (data.success == true) {
	// 			alert("Bienvenid@ "+ data.name)
	// 		}else{
	// 			alert("Error! Usuario o Contraseña incorrecta")
	// 		}

	// 	})
	
	// })

	$("#deleteUser").click(function(){	
		console.log("getUsers")
		console.log($("input[type='checkbox', checked='true']"))

		$.get("/api/users/", function(data, status){
			//console.log(data,status)
			if (status == "success") {
				updateUserTable(data);
				
			};
		})
	});

	
});



function updateUserTable (data){
	$("#tableContent").html("<thead><tr> \
									<th>email</th> \
									<th>Id</th> \
									<th>Select</th> \
		    					 </tr></thead>");
	if (data.length == 0 ) {
		$("#noContentTable").text("No hay usuario para mostrar");
	}else{
		$("#noContentTable").text("");
		$("#deleteUser").show();
		for (var i = data.length - 1; i >= 0; i--) {
			$("#tableContent").append("<tr><td>"+data[i].email+"</td> \
										  <td>"+data[i]._id+"</td> \
										  <div class='checkbox'> \
										  	<td><input type='checkbox'></td> \
										  	</tr> \
										  </div>");
		};
	}
}

function myMap() {
  var mapCanvas = document.getElementById("map");
  var mapOptions = {
    center: new google.maps.LatLng(19.334155, -99.173457), 
    zoom: 50
  }
  var map = new google.maps.Map(mapCanvas, mapOptions);
}



