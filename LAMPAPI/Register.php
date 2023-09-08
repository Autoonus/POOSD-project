
<?php

	$inData = getRequestInfo();
	
	//input data to register
	$Login = $inData["Login"];					
	$Password = $inData["Password"];
	$FirstName = $inData["FirstName"];
	$LastName = $inData["LastName"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		//check if the login has been used before
		$stmt = $conn->prepare("SELECT * FROM Users WHERE Login=?");	
		$stmt->bind_param("s", $Login);
		$stmt->execute();
		$result = $stmt->get_result();
		// $check = $result->num_rows;
		$check = mysqli_num_rows($result);
		print($check);
		$stmt->close();

		if($check > 0){
			//creates the login if login was not taken
			$stmt = $conn->prepare("INSERT into Users (FirstName,LastName,Login,Password) VALUES (?,?,?,?)");
			$stmt->bind_param("ssss", $FirstName, $LastName, $Login, $Password);
			$stmt->execute();
			$id->$conn->insert_id;
			$stmt->close();
			$conn->close();

			http_response_code(200);
			returnWithInfo($FirstName, $LastName, $id);
		}
		else
		{
			//errors out if taken
			$conn->close();
			http_response_code(300);
			returnWithError("Username already taken.");
		}
	}
	
	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $FirstName, $LastName, $id )
	{
		$retValue = '{"id":' . $id . ',"firstName":"' . $FirstName . '","lastName":"' . $LastName . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
