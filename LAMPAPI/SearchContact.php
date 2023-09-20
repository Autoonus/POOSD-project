<?php
	$inData = getRequestInfo();

	$search = $inData["Search"];
	$UserID = $inData["UserID"];
	$searchResults = "";
	$count = 0;

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) {

		returnWithError( $conn->connect_error );

	} else {

		$stmt = $conn->prepare("SELECT * FROM Contacts WHERE (FirstName LIKE ? OR LastName LIKE ?) AND UserID=?");
		$search = "%" . $search . "%";
		$stmt->bind_param("ssi", $search, $search, $UserID);
		$stmt->execute();
		
		$result = $stmt->get_result();
		
		while($row = $result->fetch_assoc()) {
			if( $count > 0 )
			{
				$contacts  .= ",";
			}
			$count++;
			$contacts .= '{"FirstName" : "' . $row["FirstName"] . '", "LastName" : "' . $row["LastName"].'", "PhoneNumber" : "' . $row["Phone"] . '", "EmailAddress" : "' . $row["Email"] . '", "UserID" : "' . $row["UserID"] . '", "ID" : "' . $row["ID"] . '"}';
		}
		
		if($count == 0) {
			returnWithError( "No Contacts Found" );
		} else {
			returnWithInfo( $contacts );
		}
		
		$stmt->close();
		$conn->close();
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
		$retValue = '{"ID":0,"FirstName":"","LastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $searchResults )
	{
		$retValue = '{"results":[' . $searchResults . '],"error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>