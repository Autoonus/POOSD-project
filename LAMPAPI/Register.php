
<?php

	$inData = getRequestInfo();
	
	//input data to register
	$FirstName = $inData["FirstName"];
	$LastName = $inData["LastName"];
  $Login = $inData["Login"];					
	$Password = $inData["Password"];
	

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		//check if the login has been used before
		$stmt = $conn->prepare("SELECT * FROM Users WHERE Login = BINARY ?");	
		$stmt->bind_param("s", $Login);
		$stmt->execute();
		$result = $stmt->get_result();
    $stmt->close();

		if($row = $result->fetch_assoc()){
			//This runs when a result is successfully fetched (I.E. Username taken)
			$conn->close();
			returnWithError("Username already taken.");
		}
		else {
			//Runs if username not taken
			//creates the login if login was not taken
      $query = "INSERT INTO Users (FirstName,LastName,Login,Password) VALUES (?, ?, ?, ?)";
      $stmt = $conn->prepare($query);
			$stmt->bind_param("ssss", $FirstName, $LastName, $Login, $Password);
			$stmt->execute();
      
			$id = $conn->insert_id;
			$stmt->close();
      $conn->close();

			returnWithInfo($FirstName, $LastName, $id);
			
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
