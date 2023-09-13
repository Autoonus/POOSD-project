<?php

	$inData = getRequestInfo();

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

	if ($conn->connect_error) {
		returnWithError( $conn->connect_error );
	}

	else {
		$stmt = $conn->prepare("SELECT * FROM Users WHERE Login = BINARY ?");
		$stmt->bind_param("s", $inData["Login"]);
		$stmt->execute();
		$result = $stmt->get_result();

		if ( $row = $result->fetch_assoc() ) {
			returnWithError("Username not available");
		}

		else {
			returnWithoutError();
		}

		$stmt->close();
		$conn->close();
	}

	function getRequestInfo() {
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson($obj) {
		header('Content-type: application/json');
		echo $obj;
	}

	function returnWithError($err) {
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson($retValue);
	}

	function returnWithoutError() {
		$retValue = '{"error": ""}';
		sendResultInfoAsJson($retValue);
	}
?>