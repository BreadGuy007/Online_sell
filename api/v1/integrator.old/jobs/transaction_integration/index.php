<?php

require $_SERVER['DOCUMENT_ROOT'].'/include.php';
require 'dbconfig.php';
require 'validate.php';
require 'mapping.php';

define("_POST_TRANSACTION_INTEGRATION_PROC_PROD_", "integration_transaction_upsert_v4");
define("_POST_TRANSACTION_INTEGRATION_PROC_DEV_", "integration_transaction_upsert_v4");

if (PHP_SAPI == 'cli-server') {
    // To help the built-in PHP dev server, check if the request was actually for
    // something which should probably be served as a static file
    $url  = parse_url($_SERVER['REQUEST_URI']);
    $file = __DIR__ . $url['path'];
    if (is_file($file)) {
        return false;
    }
}

/**
 * Import Dependencies and Instantiate
 */

require $_SERVER['DOCUMENT_ROOT']. '/api-vendor/autoload.php';

session_start();

// Instantiate the app
$settings = require __DIR__ . '/src/settings.php';
$app = new \Slim\App($settings);

// Set up dependencies
require __DIR__ . '/src/dependencies.php';

// Register middleware
require __DIR__ . '/src/middleware.php';


require __DIR__ . '/src/APIRateLimit.php';

/**
 * Configure Middleware
 */
//$app->add(new \Slim\Extras\Middleware\HttpBasicAuth('dev-integrator', 'Zj|~YxiCqh!2'));

$app->add(function ($request, $response, $next) {

	$host 	= _HOST_URI_PROD_;
	$dbname = _HOST_DB_PROD_;
	$usr 	= _HOST_USER_PROD_;
	$pwd 	= _HOST_PASSWORD_PROD_;

    $requests = 100; // maximum number of requests
    $inmins = 60;    // in how many time (minutes)

    $APIRateLimit = new App\Utils\APIRateLimit($requests, $inmins,"mysql:host=$host;dbname=$dbname", $usr, $pwd);
    $mustbethrottled = $APIRateLimit();

    if ($mustbethrottled == false) {
        $responsen = $next($request, $response);
    } else {
        $responsen = $response->withStatus(429)
        				->withHeader('RateLimit-Limit', $requests);
    }

    return $responsen;
});

/**
 * Routes
 */
// GET route
$app->get(
    '/',
    function () {
    }
);

// POST route
$app->post(
    '/',
    function ($request, $response, $args) use ($app) {
    	// Import field mapping
    	global $_FIELD_MAPPING_;

    	try {
			// Validate input
			$errs = validate($request->getBody());
			$valid = empty($errs);

			// Return an array list of errors if invalid
			if(!$valid) {
				return 	$response->withStatus(400)
							->withHeader("Content-Type","application/json")
							->write(json_encode($errs));
			}
		
			// Convert JSON data to array
			$array = json_decode($request->getBody(), true);
			
			 // Set params
			$devmode = $request->getParam("devmode") === true || strcmp($request->getParam("devmode"), "true") == 0 ? true : false;
		
			// DB Settings
			$host 	= !$devmode ? _HOST_URI_PROD_ 		: _HOST_URI_DEV_;
			$dbname = !$devmode ? _HOST_DB_PROD_ 		: _HOST_DB_DEV_;
			$usr 	= !$devmode ? _HOST_USER_PROD_ 		: _HOST_USER_DEV_;
			$pwd 	= !$devmode ? _HOST_PASSWORD_PROD_ 	: _HOST_PASSWORD_DEV_;

			$proc 		= !$devmode ? _POST_TRANSACTION_INTEGRATION_PROC_PROD_ : _POST_TRANSACTION_INTEGRATION_PROC_DEV_;
        	$keyproc	= !$devmode ? _INTEGRATION_KEYS_PROC_PROD_ : _INTEGRATION_KEYS_PROC_DEV_;
        
			$conn = new PDO("mysql:host=$host;dbname=$dbname", $usr, $pwd);
			$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			
			$suppress_output = false;
			
			$results = array();

			foreach($array as $data) {		
				// Execute the stored procedure
				$stmt = $conn->prepare(
					"CALL $proc(".
						 ":_lhs_host".
						",:_lhs_host_instance".
						",:_lhs_uri".
						",:_lhs_type".
						",:_lhs_id".
						",:_lhs_title".
						",:_lhs_status".
						",:_rhs_host".
						",:_rhs_host_instance".
						",:_rhs_uri".
						",:_rhs_type".
						",:_rhs_id".
						",:_rhs_title".
						",:_rhs_status".
						",:_transmission_type".
						",:_broker".
						",:_broker_uri".
						",:_broker_job_id".
						",:_broker_job_instance_id".
						",:_result".
						",:_result_description".
						",:_executed_at".
						",:_integration_status".
						",:_integration_id".
						",:_suppress_output".
					");"
				);
				$stmt->bindParam(':_lhs_host', 					$data[$_FIELD_MAPPING_["_lhs_host"]], 				PDO::PARAM_STR,255); 
				$stmt->bindParam(':_lhs_host_instance',	 		$data[$_FIELD_MAPPING_["_lhs_host_instance"]], 		PDO::PARAM_STR,255); 
				$stmt->bindParam(':_lhs_uri', 					$data[$_FIELD_MAPPING_["_lhs_uri"]], 				PDO::PARAM_STR,2083); 
				$stmt->bindParam(':_lhs_type', 					$data[$_FIELD_MAPPING_["_lhs_type"]], 				PDO::PARAM_STR,50); 
				$stmt->bindParam(':_lhs_id', 					$data[$_FIELD_MAPPING_["_lhs_id"]], 				PDO::PARAM_STR,100); 
				$stmt->bindParam(':_lhs_title', 				$data[$_FIELD_MAPPING_["_lhs_title"]], 				PDO::PARAM_STR,100); 
				$stmt->bindParam(':_lhs_status', 				$data[$_FIELD_MAPPING_["_lhs_status"]],				PDO::PARAM_STR,50);
				$stmt->bindParam(':_rhs_host', 					$data[$_FIELD_MAPPING_["_rhs_host"]], 				PDO::PARAM_STR,255); 
				$stmt->bindParam(':_rhs_host_instance',	 		$data[$_FIELD_MAPPING_["_rhs_host_instance"]], 		PDO::PARAM_STR,255); 
				$stmt->bindParam(':_rhs_uri', 					$data[$_FIELD_MAPPING_["_rhs_uri"]], 				PDO::PARAM_STR,2083); 
				$stmt->bindParam(':_rhs_type', 					$data[$_FIELD_MAPPING_["_rhs_type"]], 				PDO::PARAM_STR,50); 
				$stmt->bindParam(':_rhs_id', 					$data[$_FIELD_MAPPING_["_rhs_id"]], 				PDO::PARAM_STR,100); 
				$stmt->bindParam(':_rhs_title', 				$data[$_FIELD_MAPPING_["_rhs_title"]], 				PDO::PARAM_STR,100); 
				$stmt->bindParam(':_rhs_status', 				$data[$_FIELD_MAPPING_["_rhs_status"]],				PDO::PARAM_STR,50);
				$stmt->bindParam(':_transmission_type',	 		$data[$_FIELD_MAPPING_["_transmission_type"]]		);
				$stmt->bindParam(':_broker', 					$data[$_FIELD_MAPPING_["_broker"]],					PDO::PARAM_STR,50);
				$stmt->bindParam(':_broker_uri', 				$data[$_FIELD_MAPPING_["_broker_uri"]],				PDO::PARAM_STR,255);
				$stmt->bindParam(':_broker_job_id', 			$data[$_FIELD_MAPPING_["_broker_job_id"]],			PDO::PARAM_STR,50);
				$stmt->bindParam(':_broker_job_instance_id', 	$data[$_FIELD_MAPPING_["_broker_job_instance_id"]],	PDO::PARAM_STR,50);
				$stmt->bindParam(':_result', 					$data[$_FIELD_MAPPING_["_result"]],					PDO::PARAM_INT);
				$stmt->bindParam(':_result_description', 		$data[$_FIELD_MAPPING_["_result_description"]],		PDO::PARAM_STR);
				$stmt->bindParam(':_executed_at', 				$data[$_FIELD_MAPPING_["_executed_at"]]				);
				$stmt->bindParam(':_integration_status', 		$data[$_FIELD_MAPPING_["_integration_status"]],		PDO::PARAM_STR,50);
				$stmt->bindParam(':_integration_id', 			$data[$_FIELD_MAPPING_["integration_id"]],			PDO::PARAM_STR,50);
				$stmt->bindParam(':_suppress_output', 			$suppress_output,									PDO::PARAM_BOOL); 
				$stmt->execute();
				
				// Parse record set
				while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
					array_push($results, $row);
				}
				
				$stmt->closeCursor();
			}

			// Return input body as results to confirm success
			return 	$response->withStatus(200)
						->withHeader("Content-Type","application/json")
						->write(json_encode($results));

		} catch (Exception $e) {
			return 	$response->withStatus(500)
							->withHeader("Content-Type","application/json")
							->write(json_encode(array(
						"ErrorCode"	=>	500,
						"Exception"	=>	to_utf8_encoding($e->getMessage())
					), JSON_NUMERIC_CHECK));
		}
        
    }
);

// PUT route
$app->put(
    '/',
    function () {
    }
);

/**
 * Run the Slim application
 */
$app->run();