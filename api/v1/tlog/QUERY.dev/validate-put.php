<?php

require 'mapping.php';

function validate_put($body = null) { 
	$errs = array();
	try {
		array_push($errs, to_error(400, "PUT method not allowed for this endpoint"));
		return $errs;
	} catch (Exception $e) {
		array_push($errs, to_error(500, "Error during [".__FUNCTION__."] - ".$e->getMessage()));
	}
	
	return $errs;
}