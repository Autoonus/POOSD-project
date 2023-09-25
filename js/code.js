const urlBase = 'http://the-otter.com/LAMPAPI';
const extension = 'php';
const contactMap = new Map();

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
	
	let hash = md5(Password);

	let tmp = {Login:Login, Password:hash};
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

function registerInputsOK() {
	let reqs = document.getElementById("reqs");
	let output = document.getElementById("notice");
	let strikes = 0;

	let notice = "";

	let fname = document.getElementById("FirstName").value;
	let lname = document.getElementById("LastName").value;
	let newUser = document.getElementById("newUser").value;
	let newPassword = document.getElementById("newPassword").value;

	var userAllowed = /^[0-9A-Za-z]*$/;
	var passAllowed  = /^[0-9A-Za-z!@#$%^&*]*$/;

	if (fname.length == 0) {
		strikes++;
		notice+= "First Name cannot be empty<br>";
	}

	if (lname.length == 0) {
		strikes++;
		notice+= "Last Name cannot be empty<br>";
	}

	if (newUser.length == 0) {
		strikes++;
		notice+= "Username cannot be empty<br>";
	}

	if (!(userAllowed.test(newUser))) {
		strikes++;
		notice+= "Username must contain only letters and numbers<br>";
	}

	if (newPassword.length < 7) {
		strikes++;
		notice+= "Password must be at least 7 characters<br>";
	}

	if (newPassword.length > 50) {
		strikes++;
		notice+= "Password must be at most 50 characters<br>";
	}

	if (!(passAllowed.test(newPassword))) {
		strikes++;
		notice+= "Password must contain only letters, numbers, and special characters<br>";
	}

	if (strikes == 0) {
		return true;
	} else {
		reqs.style.display = "block";
		output.innerHTML = notice;
		return false;
	}
}

function attemptRegister() {
	document.getElementById("registerResult").innerHTML = "Attempting registration...";
	let newUser = document.getElementById("newUser").value;
	isAvailable(newUser).then((available) => {
		if (!available) {
			document.getElementById("registerResult").innerHTML = "Username already taken";
		} else {
			register();
		}
	}).catch((err) => {
		console.log("Promise error")
	});
}

function register() {
	
	if (!registerInputsOK()) {
		document.getElementById("registerResult").innerHTML = "Invalid inputs...";
		return;
	}

	let Login = document.getElementById("newUser").value;
	let Password = document.getElementById("newPassword").value;
	let hash= md5(Password);
	let FirstName = document.getElementById("FirstName").value;
	let LastName = document.getElementById("LastName").value;

	let tmp = {Login:Login, Password:hash, FirstName:FirstName, LastName:LastName};
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

function isAvailable(Login) {
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

function searchContact() {
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
					let addPrompt = document.getElementById("addPrompt");

					//if there are no results, do not show the table and show a prompt to add new contacts.
					if (jsonObject.error != "") {
						table.style.display = "none";
						addPrompt.style.display = "block";

					} else {

						table.innerHTML = "";

						let header = table.createTHead();
						let headRow = header.insertRow(0);

						let headCell1 = headRow.insertCell(0);
						let headCell2 = headRow.insertCell(1);
						let headCell3 = headRow.insertCell(2);
						let headCell4 = headRow.insertCell(3);
						let headCell5 = headRow.insertCell(4);

						headCell1.outerHTML = "<th>First Name</th>";
						headCell2.outerHTML = "<th>Last Name</th>";
						headCell3.outerHTML = "<th>Phone Number</th>";
						headCell4.outerHTML = "<th>Email Address</th>";
						headCell5.outerHTML = "<th>Edit / Delete</th>";

						let tbody = table.createTBody();

						for(let i = 0; i < jsonObject.results.length; ++i){
							let row = tbody.insertRow();
							let cell1 = row.insertCell(0);
							let cell2 = row.insertCell(1);
							let cell3 = row.insertCell(2);
							let cell4 = row.insertCell(3);
							let cell5 = row.insertCell(4);

							cell1.innerHTML = jsonObject.results[i].FirstName;
							cell2.innerHTML = jsonObject.results[i].LastName;
							cell3.innerHTML = jsonObject.results[i].PhoneNumber;
							cell4.innerHTML = jsonObject.results[i].EmailAddress;
							cell5.outerHTML = "<td class='buttonTd'>" + generateButtonText(jsonObject.results[i].ID, i + 1) + "</td>";
						}

						table.style.display = "table";
						addPrompt.style.display = "none";
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
	editButton = "<button class='editButton' id='editButton" + rowNum.toString() + "' type='button' onclick='editContact(" + rowNum.toString() + ");'><ion-icon class='ionWhite' name=\"create\"></ion-icon></button> ";
	delButton = "<button class='delButton' id='delButton" + rowNum.toString() + "' type='button' onclick='presentAlert(" + contactID.toString() + ");'><ion-icon class='ionWhite' name=\"trash\"></ion-icon></button> ";
	saveButton = "<button class='saveButton' style='display: none;' id='saveButton" + rowNum.toString() + "' type='button' onclick='saveContact(" + rowNum.toString() + ", " + contactID.toString() + ");'><ion-icon class='ionWhite' name=\"checkmark-circle\"></ion-icon></button> ";
	cancelButton = "<button class='cancelButton' style='display: none;' id='cancelButton" + rowNum.toString() + "' type='button' onclick='cancelEdit(" + rowNum.toString() + ");'><ion-icon class='ionWhite' name=\"close-circle\"></ion-icon></button>";
	return editButton + delButton + saveButton + cancelButton;
}

function cancelEdit(rowNum) {
	let temp = contactMap.get(rowNum.toString());
	let data = JSON.parse(temp);

	let edit = document.getElementById("editButton" + rowNum.toString());
	let del = document.getElementById("delButton" + rowNum.toString());
	let save = document.getElementById("saveButton" + rowNum.toString());
	let cancel = document.getElementById("cancelButton" + rowNum.toString());

	edit.style.display = "inline-block";
	del.style.display = "inline-block";
	save.style.display = "none";
	cancel.style.display = "none";

	let table = document.getElementById("contactTable");
	let row = table.rows[rowNum];
	
	let FirstNameCell = row.cells[0];
	let LastNameCell = row.cells[1];
	let PhoneCell = row.cells[2];
	let EmailCell = row.cells[3];

	let FirstName = data.FirstName;
	let LastName = data.LastName;;
	let Phone = data.Phone;
	let Email = data.Email;

	FirstNameCell.innerHTML = FirstName;
	LastNameCell.innerHTML = LastName;
	PhoneCell.innerHTML = Phone;
	EmailCell.innerHTML = Email;

	contactMap.delete(rowNum.toString());
}

function editContact(rowNum) {
	let edit = document.getElementById("editButton" + rowNum.toString());
	let del = document.getElementById("delButton" + rowNum.toString());
	let save = document.getElementById("saveButton" + rowNum.toString());
	let cancel = document.getElementById("cancelButton" + rowNum.toString());

	edit.style.display = "none";
	del.style.display = "none";
	save.style.display = "inline-block";
	cancel.style.display = "inline-block";

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

	let temp  = {FirstName:FirstName, LastName:LastName, Phone:Phone, Email:Email};
	let data = JSON.stringify(temp);
	contactMap.set(rowNum.toString(), data);

	FirstNameCell.innerHTML = "<input type='text' id='FirstName" + rowNum.toString() + "' value='" + FirstName + "'>";
	LastNameCell.innerHTML = "<input type='text' id='LastName" + rowNum.toString() + "' value='" + LastName + "'>";
	PhoneCell.innerHTML = "<input type='text' id='Phone" + rowNum.toString() + "' value='" + Phone + "'>";
	EmailCell.innerHTML = "<input type='text' id='Email" + rowNum.toString() + "' value='" + Email + "'>";
}

function saveContact(rowNum, contactID) {
	let edit = document.getElementById("editButton" + rowNum.toString());
	let del = document.getElementById("delButton" + rowNum.toString());
	let save = document.getElementById("saveButton" + rowNum.toString());
	let cancel = document.getElementById("cancelButton" + rowNum.toString());

	edit.style.display = "inline-block";
	del.style.display = "inline-block";
	save.style.display = "none";
	cancel.style.display = "none";

	let table = document.getElementById("contactTable");
	let row = table.rows[rowNum];
	
	let FirstNameCell = row.cells[0];
	let LastNameCell = row.cells[1];
	let PhoneCell = row.cells[2];
	let EmailCell = row.cells[3];

	let FirstName = document.getElementById("FirstName" + rowNum.toString()).value;
	let LastName = document.getElementById("LastName" + rowNum.toString()).value;
	let Phone = document.getElementById("Phone" + rowNum.toString()).value;
	let Email = document.getElementById("Email" + rowNum.toString()).value;

	FirstNameCell.innerHTML = FirstName;
	LastNameCell.innerHTML = LastName;
	PhoneCell.innerHTML = Phone;
	EmailCell.innerHTML = Email;

	updateContact(FirstName, LastName, Phone, Email, contactID);
	contactMap.delete(rowNum.toString());
}

function updateContact(FirstName, LastName, Phone, Email, contactID) {
	let tmp = {FirstName: FirstName, LastName: LastName, Phone: Phone, Email: Email, ID: contactID};
	let jsonPayload = JSON.stringify(tmp);
	
	let url = urlBase + '/UpdateContact.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) {
				console.log("Contact " + contactID.toString() + " Updated...");
			}
		};
		xhr.send(jsonPayload);
	}

	catch(err) {
		console.log("Connection Error Occured");
	}
}

function deleteContact(contactID) {

	if (confirm("Are you sure you want to delete this contact?") == false) {
		return;
	}

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
		console.log("Connection Error Occured");
	}
}

function addContact(){
	let firstName = document.getElementById("NewFirstName").value;
	let lastName = document.getElementById("NewLastName").value;
	let phone = document.getElementById("NewPhone").value;
	let email = document.getElementById("NewEmail").value;

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
			if (this.readyState == 4 && this.status == 200) {
				let jsonObject = JSON.parse( xhr.responseText );
				if (jsonObject.error != "") {
					console.log("Server Error (AddContact)");
				} else {
					searchContact();
				}
			}
		};
		xhr.send(jsonPayload);
	}

	catch(err)
	{
		console.log("Connection Error (AddContact)");
	}
}

function showHeader() {
	document.getElementById("welcomeHeader").innerHTML = "Welcome, " + FirstName + " " + LastName + "!";
}