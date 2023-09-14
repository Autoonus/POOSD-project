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

				setLoginCookie(jsonObject.FirstName, jsonObject.LastName, jsonObject.ID);

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

function setLoginCookie(FirstName, LastName, ID) {
	const d = new Date();
	const minutesTillExpiration = 20;
	d.setTime(d.getTime() + (minutesTillExpiration*60*1000));

	let expires = "expires="+ d.toUTCString();
	console.log("FirstName=" + FirstName + ",LastName=" + LastName + ",ID=" + ID.toString() + ";" + expires);
	document.cookie = "FirstName=" + FirstName + ",LastName=" + LastName + ",ID=" + ID.toString() + ";" + expires;
}

function readLoginCookie() {
	let ck = document.cookie;
	let fields = data.split(",");

	FirstName = "";
	LastName = "";
	ID = 0;

	for (var i=0; i<fields.length; i++) {
		let key = fields[i].trim().split("=");
		if (key[0] == "FirstName") {
			FirstName = key[1];
		} else if (key[0] == "LastName") {
			LastName = key[1];
		} else if (key[0] == "ID") {
			ID = parseInt(key[1]);
		}
	}
}

function register() {
	if (document.getElementById("registerButton").className == "DisabledButton") {
		document.getElementById("registerResult").innerHTML = "Please Meet Username and Password Criteria";
		return;
	}

	ID = 0;
	FirstName = "";
	LastName = "";
	
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
	document.getElementById("welcomeHeader").innerHTML = "Welcome, " + FirstName + " " + LastName + " at ID = " + ID.toString();
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
