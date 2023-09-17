const urlBase = 'http://the-otter.com/LAMPAPI';
const extension = 'php';

let ID = 0;
let FirstName = "";
let LastName = "";

function doLogin() {
	let Login = document.getElementById("Login").value;
	let Password = document.getElementById("Password").value;

	document.getElementById("loginResult").innerHTML = "Request Sent...";

	login(Login, Password);
}

function login(Login, Password) {
	ID = 0;
	FirstName = "";
	LastName = "";
	
	let tmp = {Login:Login, Password:Password};
	let jsonPayload = JSON.stringify(tmp);
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
		
				if( jsonObject.ID < 1 ) 
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}

				FirstName = jsonObject.FirstName;
				LastName = jsonObject.LastName;
				ID = jsonObject.ID;

				setLoginCookie();

				window.location.href = "contacts.html";
			}
		};
		xhr.send(jsonPayload);
	}

	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function setLoginCookie() {
	const d = new Date();
	const minutesTillExpiration = 20;
	d.setTime(d.getTime() + (minutesTillExpiration*60*1000));

	let expires = "; expires="+ d.toUTCString();
	var data = {};
	data.FirstName = FirstName;
	data.LastName = LastName;
	data.ID = ID;

	document.cookie = "object=" + JSON.stringify(data) + expires;
}

function getCookie(cname) {
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for(let i = 0; i <ca.length; i++) {
	  let c = ca[i];
	  while (c.charAt(0) == ' ') {
		c = c.substring(1);
	  }
	  if (c.indexOf(name) == 0) {
		return c.substring(name.length, c.length);
	  }
	}
	return "";
  }

function readLoginCookie() {
	if (document.cookie.length != 0) {
		let jsonString = getCookie("object");
		var obj = JSON.parse(jsonString);
		FirstName = obj.FirstName;
		LastName = obj.LastName;
		ID = parseInt(obj.ID);
	} else {
		FirstName = "";
		LastName = "";
		ID = 0;
	}
}

function register() {
	if (document.getElementById("registerButton").className == "DisabledButton") {
		document.getElementById("registerResult").innerHTML = "Please Meet Username and Password Criteria";
		return;
	}
	
	let Login = document.getElementById("newUser").value;
	let Password = document.getElementById("newPassword").value;
	let FirstName = document.getElementById("FirstName").value;
	let LastName = document.getElementById("LastName").value;
	
	document.getElementById("registerResult").innerHTML = "Attempting registration...";

	let tmp = {Login:Login, Password:Password, FirstName:FirstName, LastName:LastName};
	let jsonPayload = JSON.stringify(tmp);
	
	let url = urlBase + '/Register.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	
	try	{
		xhr.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let jsonObject = JSON.parse( xhr.responseText );

				if (jsonObject.error != '') {
					document.getElementById("registerResult").innerHTML = "Issue registering...";
				} else {
					document.getElementById("registerResult").innerHTML = "Registration successful!";
					login(Login, Password);
				}

			}
		};
		xhr.send(jsonPayload);
	}

	catch(err) {
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function isAvailable(Login, userAvailable) {
	return new Promise((resolve, reject) => {
		let tmp = {Login:Login};
		let jsonPayload = JSON.stringify(tmp);
		
		let url = urlBase + '/CheckUsernameAvailability.' + extension;

		let xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
		
		try	{
			xhr.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					let jsonObject = JSON.parse( xhr.responseText );

					if (jsonObject.error == '') {
						resolve(true);
					} else {
						resolve(false);
					}

				}
			};
			xhr.send(jsonPayload);
		}

		catch(err) {
			console.log("Error occurred")
			reject(undefined);
		}
	});
}

function searchContact(){
	return new Promise((resolve, reject) => {
		let search = document.getElementById("searchColorButton").value;
		
		// gets rid of white space and makes the search into an array
		// search = search.split(/(\s+)/).filter( e => e.trim().length > 0);

		// if(search.length == 1){
		// 	let tmp = {FirstName:search[0]};
		// }
		// else if(search.length > 1){
		// 	let tmp = {FirstName:search[0], LastName:search[1]};
		// }

		let tmp  = {Search:search};
		let jsonPayload = JSON.stringify(tmp);
		
		let url = urlBase + '/SearchContact.' + extension;

		let xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

		try
		{
			xhr.onreadystatechange = function() 
			{
				if (this.readyState == 4 && this.status == 200) 
				{
					let jsonObject = JSON.parse( xhr.responseText );
					
					
				}
			};
			xhr.send(jsonPayload);
		}

		catch(err)
		{
			reject(undefined);
		}
	});
}

function showLogin() {
	document.getElementById("loginOption").className = "Selected";
	document.getElementById("registerOption").className = "Unselected";
	document.getElementById("registerDiv").style.display = "none";
	document.getElementById("loginDiv").style.display = "block";
}

function showRegister() {
	document.getElementById("loginOption").className = "Unselected";
	document.getElementById("registerOption").className = "Selected";
	document.getElementById("registerDiv").style.display = "block";
	document.getElementById("loginDiv").style.display = "none";
}

function showHeader() {
	document.getElementById("welcomeHeader").innerHTML = "Welcome, " + FirstName + " " + LastName;
}

function disable(btn) {
	btn.className = "DisabledButton";
}

function enable(btn) {
	btn.className = "Button";
}

function setup() {
	showLogin();
	disable(document.getElementById("registerButton"));
}
