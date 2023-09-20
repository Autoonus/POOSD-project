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

				searchContact();
			}
		};
		xhr.send(jsonPayload);
	}

	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function doLogout() {
	//remove all stored variable values
	ID = 0;
	FirstName = "";
	LastName = "";

	//remove cookie
	document.cookie = "object= null; expires= expires=Thu, 01 Jan 1970 00:00:00 UTC;";

	//move window to index.html (login page / front page)
	window.location.href = "index.html";
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
	//If they hold a login cookie, parse cookie and store data
	if (document.cookie.length != 0) {
		let jsonString = getCookie("object");
		var obj = JSON.parse(jsonString);
		FirstName = obj.FirstName;
		LastName = obj.LastName;
		ID = parseInt(obj.ID);
	//Else, log them out and push from the page.
	} else { 
		doLogout();
	}
}

function checkValidSession() {
	if (document.cookie.length == 0) {
		doLogout();
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
		let Search = document.getElementById("searchText").value;

		let temp  = {Search:Search, UserID: ID};
		let jsonPayload = JSON.stringify(temp);
		
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
					let table = document.getElementById("contactTable");
					console.log(jsonObject);

					table.innerHTML = "";

					let header = table.createTHead();
					let headRow = header.insertRow(0);

					let headCell1 = headRow.insertCell(0);
					let headCell2 = headRow.insertCell(1);
					let headCell3 = headRow.insertCell(2);
					let headCell4 = headRow.insertCell(3);
					let headCell5 = headRow.insertCell(4);

					headCell1.innerHTML = "First Name";
					headCell2.innerHTML = "Last Name";
					headCell3.innerHTML = "Phone Number";
					headCell4.innerHTML = "Email Address";
					headCell5.innerHTML = "Edit / Delete";

					for(let i = 0; i < jsonObject.results.length; ++i){
						let row = table.insertRow();
						let cell1 = row.insertCell(0);
						let cell2 = row.insertCell(1);
						let cell3 = row.insertCell(2);
						let cell4 = row.insertCell(3);
						let cell5 = row.insertCell(4);

						cell1.innerHTML = jsonObject.results[i].FirstName;
						cell2.innerHTML = jsonObject.results[i].LastName;
						cell3.innerHTML = jsonObject.results[i].PhoneNumber;
						cell4.innerHTML = jsonObject.results[i].EmailAddress;
						cell5.innerHTML = generateButtonText(jsonObject.results[i].ID, i + 1);
					}

					resolve(true);
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

function generateButtonText(contactID, rowNum) {
	editButton = "<button class='Selected' id='editButton" + rowNum.toString() + "'type='button' class='buttons' onclick='editContact(" + rowNum.toString() + ");'>Edit</button> ";
	delButton = "<button class='Selected' id='delButton" + rowNum.toString() + "' type='button' class='buttons' onclick='deleteContact(" + contactID.toString() + ");'>Delete</button> ";
	saveButton = "<button style='display: none;' class='Selected' id='saveButton" + rowNum.toString() + "' type='button' class='buttons' onclick='saveContact(" + rowNum.toString() + ");'>Save</button> ";
	cancelButton = "<button style='display: none;' class='Selected' id='cancelButton" + rowNum.toString() + "' type='button' class='buttons' onclick='cancelEdit(" + rowNum.toString() + ");'>Cancel</button>";
	return editButton + delButton + saveButton + cancelButton;
}

function editContact(rowNum) {
	let edit = document.getElementById("editButton" + rowNum.toString());
	let del = document.getElementById("delButton" + rowNum.toString());
	let save = document.getElementById("saveButton" + rowNum.toString());
	let cancel = document.getElementById("cancelButton" + rowNum.toString());

	edit.style.display = "none";
	del.style.display = "none";
	save.style.display = "block";
	cancel.style.display = "block";

	let table = document.getElementById("contactTable");
	let row = table.rows[rowNum];
	
	let FirstNameCell = row.cells[0];
	let LastNameCell = row.cells[1];
	let PhoneCell = row.cells[2];
	let EmailCell = row.cells[3];

	let FirstName = FirstNameCell.innerText;
	let LastName = LastNameCell.innerText;
	let Phone = PhoneCell.innerText;
	let Email = EmailCell.innerText;

	FirstNameCell.innerHTML = "<input type='text' id='FirstName" + rowNum.toString() + "' value='" + FirstName + "'>";
	LastNameCell.innerHTML = "<input type='text' id='LastName" + rowNum.toString() + "' value='" + LastName + "'>";
	PhoneCell.innerHTML = "<input type='text' id='Phone" + rowNum.toString() + "' value='" + Phone + "'>";
	EmailCell.innerHTML = "<input type='text' id='Email" + rowNum.toString() + "' value='" + Email + "'>";
	
}

function deleteContact(contactID) {
	let tmp = {ID: contactID};
	let jsonPayload = JSON.stringify(tmp);
	
	let url = urlBase + '/DeleteContact.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) {
				searchContact();
			}
		};
		xhr.send(jsonPayload);
	}

	catch(err) {
		document.getElementById("loginResult").innerHTML = err.message;
	}
}

function showAdd(){
	addDiv = document.getElementById("addContactDiv");
	contactDiv = document.getElementById("contactTableDiv");
	addButton = document.getElementById("addContactButton");
	searchButton = document.getElementById("searchContactButton");
	contactsButton = document.getElementById("contactsButton");
	searchLabel = document.getElementById("searchLabel");
	searchText = document.getElementById("searchText");

	if(addDiv.className == "Hidden"){
		addDiv.className = "Showing";
		contactDiv.className = "Hidden";
		addButton.className = "Selected";
		searchButton.style.display = "none";
		contactsButton.className = "Unselected";
		searchLabel.style.display = "none";
		searchText.style.display = "none";
	}
}

function showContacts(){
	addDiv = document.getElementById("addContactDiv");
	contactDiv = document.getElementById("contactTableDiv");
	addButton = document.getElementById("addContactButton");
	searchButton = document.getElementById("searchContactButton");
	contactsButton = document.getElementById("contactsButton");
	searchLabel = document.getElementById("searchLabel");
	searchText = document.getElementById("searchText");

	if(contactDiv.className == "Hidden"){
		addDiv.className = "Hidden";
		contactDiv.className = "Showing";
		addButton.className = "Unselected";
		searchButton.style.display = "inline-block";
		contactsButton.className = "Selected";
		searchLabel.style.display = "inline-block";
		searchText.style.display = "inline-block";
	}
}

function addContact(){
	let firstName = document.getElementById("addFirstName").value;
	let lastName = document.getElementById("addLastName").value;
	let phone = document.getElementById("addPhoneNumber").value;
	let email = document.getElementById("addEmail").value;

	let temp = {FirstName: firstName, LastName: lastName, Phone: phone, Email: email, UserID: ID};

	let jsonPayload = JSON.stringify(temp);
	let url = urlBase + '/AddContact.' + extension;

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
				
				document.getElementById("addFirstName").value = "";
				document.getElementById("addLastName").value = "";
				document.getElementById("addPhoneNumber").value = "";
				document.getElementById("addEmail").value = "";
				showAdd();

			}
		};
		xhr.send(jsonPayload);
	}

	catch(err)
	{
		console.log("Search Error");
	}
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
	document.getElementById("welcomeHeader").innerHTML = "Welcome, " + FirstName + " " + LastName + "!";
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
