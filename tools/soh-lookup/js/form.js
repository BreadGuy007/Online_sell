// Dev mode ON/OFF
var devmode = false;

var proxy = '/SimplePHPProxy.php';

var playbill_connector = null;
var submit_lock = false;

String.prototype.escapeSpecialChars = String.prototype.escapeSpecialChars || function() {
    return this
    	.replace(/[\\]/g, '\\\\')
		.replace(/[\"]/g, '\\\"')
		.replace(/[\/]/g, '\\/')
		.replace(/[\b]/g, '\\b')
		.replace(/[\f]/g, '\\f')
		.replace(/[\n]/g, '\\n')
		.replace(/[\r]/g, '\\r')
		.replace(/[\t]/g, '\\t');
};

String.prototype.escapeSpecialXMLChars = String.prototype.escapeSpecialXMLChars || function() {
    return this
    	.replace(/[\"]/g, '&quot;')
		.replace(/[\']/g, '&apos;')
		.replace(/[<]/g, '&lt;')
		.replace(/[>]/g, '&gt;')
};

String.prototype.unescapeSpecialXMLChars = String.prototype.unescapeSpecialXMLChars || function() {
    return this
    	.replace(/&quot;/g, '"')
		.replace(/&apos;/g, '\'')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
};

function isFunction(functionToCheck) {
	var getType = {};
 	return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

// Formats a string by replacing placeholders represented as {0}, {1}, {n} with specified text
// Similar to sprintf() in other languages
String.format = String.format || function() {
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    var theString = arguments[0];
    
    // start with the second argument (i = 1)
    for (var i = 1; i < arguments.length; i++) {
        // "gm" = RegEx options for Global search (more than one instance)
        // and for Multiline search
        var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
        theString = theString.replace(regEx, arguments[i]);
    }
    
    return theString;
};

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

var matrix = {};
var product_soh_counter = {};

var Quagga = window.Quagga;
var BarcodeReader = null;

function init(
	callback
) {
	var domain = window.location.host.split( '.' );
	var subdomain = domain[0];

	playbill_connector = new PlaybillInterface(subdomain);

	form_event_setup();
	callback();
}

function form_event_setup() {
	$('#form-search-criteria').on('keydown', function(event) {
		var key = event.keyCode || e.which;
	
		if( key == 9 )
			$('#form-submit').trigger('click');
	});

	$('#form-submit').on('click', function() {
		var query = $('#form-search-criteria').val();
		
		if(playbill_connector && query && !submit_lock) { 
			query_product_soh(
				[query,query,query],
				0,
				function(xhr) { 
					submit_lock = true;
					$('#form-search-result').html('');
					$('#product-results').toggleClass("disabled", true);
					toggleValid('#form-search-criteria', null);
					$('#form-search-criteria').toggleClass("loading", true);
					// Reset global soh counter
					product_soh_counter = {};
				},
				function(data, is_streaming = false, stream_instance = 1) { 		
					if( data != null ) {
						
						if(!is_streaming) {
							toggleValid('#form-search-criteria', true);
						}
						
						toggleErrorDescriptor('form-search-criteria');

						populate_soh_table(query, data, is_streaming, stream_instance);
					
						$('#product-results').toggleClass("disabled", false);
					} else {
						toggleValid('#form-search-criteria', false);
						toggleErrorDescriptor('form-search-criteria', "Could not locate '"+query+"'" );
					}
				},
				function(xhr, textStatus, textErrorThrown) {
					toggleValid('#form-search-criteria', false);
					toggleErrorDescriptor('form-search-criteria',textStatus+": "+textErrorThrown);
					
					$('#form-search-criteria').toggleClass("loading", false);
					$('#form-search-criteria').select();
		
					if(xhr.status != 200) {
						toggleValid('#form-search-criteria', false);
						toggleErrorDescriptor('form-search-criteria', xhr.status+": "+xhr.statusText);
					}				
					submit_lock = false;
				},
				function(xhr, textStatus, is_streaming = false, stream_instance = 1) { 
					if(!is_streaming) {
						$('#form-search-criteria').toggleClass("loading", false);
						$('#form-search-criteria').select();
					}
		
					if(xhr.status != 200) {
						toggleValid('#form-search-criteria', false);
						toggleErrorDescriptor('form-search-criteria', xhr.status+": "+xhr.statusText);
					}
					
					if(!is_streaming) {		
						submit_lock = false;
					}
				},
				true // stream results
			);
		} else {
			toggleValid('#form-search-criteria', null);
			toggleErrorDescriptor('form-search-criteria');
		}
		
		return false;
	});
	
	BarcodeReader = {
		_scanner: null,
		init: function() {
			this.attachListeners();
		},
		decode: function(src) {
			Quagga.decodeSingle({
				decoder: {
					readers: [
						 'ean_reader'
						,'ean_8_reader'
						,'upc_reader'
						,'code_128_reader'
					] // List of active readers
				},
				locate: true, // try to locate the barcode in the image
				src: src
			}, function(result) {
				// Reset barcode reader
				document.getElementById('form-search-barcode-file').value = "";
				
				// Process barcode file for matching code
				try{
					if(result && result !== undefined && result.codeResult) {
						$('#form-search-criteria').val(result.codeResult.code);
						$('#form-submit').click();
					} else {
						$('#form-search-criteria').val('');
						toggleValid('#form-search-criteria', false);
						toggleErrorDescriptor('form-search-criteria', 'Unable to read barcode');
					}
				} catch(err) {
					$('#form-search-criteria').val('');
					toggleValid('#form-search-criteria', false);
					toggleErrorDescriptor('form-search-criteria', 'Unable to read barcode');
				}
			});
		},
		attachListeners: function() {
			var self = this,
				button = document.querySelector('#form-search-barcode-init'),
				fileInput = document.querySelector('#form-search-barcode-file');

			button.addEventListener("click", function onClick(e) {
				e.preventDefault();
				document.querySelector('#form-search-barcode-file').click();
			});

			fileInput.addEventListener("change", function onChange(e) {
				e.preventDefault();
				if (e.target.files && e.target.files.length) {
					self.decode(URL.createObjectURL(e.target.files[0]));
				}
			});
		}
	};
	BarcodeReader.init();
	
}

function query_product_soh(
	criteria_array, 
	index, 
	before_callback,
	success_callback,
	error_callback,
	complete_callback,
	stream_results = false
) { 
	// Attempt to find match for valid search criteria iteration
	if( criteria_array[index] != null ) {
		// Create search variable array
		var search = [null,null,null]; 
		// Allocate chosen variable for search by recursive index
		search[index] = criteria_array[index];

		switch(index) {
			case 0:
				//console.log("Searching for matching SKU ["+search[index]+"]");
				break;
			case 1:
				//console.log("Searching for matching BARCODE ["+search[index]+"]");
				break;
			case 2:
				// Replace spaces with commas to prepare for query
				search[index] = search[index] && search[index] !== undefined ? search[index].replace(/ +/g, ",") : null;
				//console.log("Searching for matching NAME ["+search[index]+"]");
				break;
		}
		
		
		playbill_connector.lookupProductSOH(
			search[0],
			search[2],
			search[1],
			null,
			null,
			null,
			function(xhr) {
				// Only trigger on first event
				if(index == 0)	before_callback(xhr);
				
			},
			function(data, is_streaming = false, stream_instance = 1) {
				if( data && !jQuery.isEmptyObject(data) ) {
					// Something was found in this iteration so proceed to success callback
					success_callback(data, is_streaming, stream_instance);
					// Set index to the end of the array to trigger complete condition
					index = criteria_array.length;
				} else {
					// Try next iteration
					query_product_soh(
						criteria_array, 
						index+1, 
						before_callback,
						success_callback,
						error_callback,
						complete_callback,
						stream_results
					);
				}
			},
			function(xhr, textStatus, textErrorThrown) {
				// Throw error regardless of iteration
				error_callback(xhr, textStatus, textErrorThrown);
			},
			function(xhr, textStatus, is_streaming = false, stream_instance = 1) {
				// Only trigger on last iteration
				if( criteria_array[index+1] == null ) {
					complete_callback(xhr, textStatus, is_streaming, stream_instance)
				}
			},
			stream_results
		);
	} else {
		// Return null result if no matches were found after all iterations
		success_callback(null);
	}
}

function generate_barcode_image_link(barcode) { 
	var src = "http://barcode.tec-it.com/barcode.ashx?translate-esc=off&data={0}&code={1}&unit=Fit&dpi=360&imagetype=png&rotation=0&color=000000&bgcolor=FFFFFF&qunit=Mm&quiet=1";
	var code = "Code128";
		
	if(barcode) { 
		// UPC-A
		if( $.isNumeric(barcode) && barcode.length == 12 ) {
			code = "UPCA";
		} 
		// EAN-13
		else if ( $.isNumeric(barcode) && barcode.length == 13 ) {
			code = "EAN13";
		}
	
		src = String.format(src, barcode, code);
		
		return src;
	}
	
	return '';
}

function populate_soh_table(query, data, is_streaming = false, stream_instance = 1) { 
	var matched_query = false;
	
	// Validate @stream_instance
	stream_instance = stream_instance != null && stream_instance !== undefined && typeof stream_instance == 'number' ? stream_instance : 1;
	 
	var tbl_body =  stream_instance == 1 ? document.createElement("tbody") : null;

	// Populate table
	if( tbl_body != null ) {
		$('#product-results').find('tbody').replaceWith(tbl_body);
	} else {
		tbl_body = $('#product-results').find('tbody')[0];
	}

	$.each(data, function(index, product) {
		var product_id = product.product_id;
		var barcodes = product.barcodes;	
		var mapping_id = product.mapping_id;
		var dear_product_id = product.dear_product_id;
		var dear_instance = product.dear_instance;
		
		var sku = product["sku"];
		var country_code = product["country_code"] ? product["country_code"].toUpperCase() : "";
		var family_sku = product["hierarchy_code"];
		var name = product["name"];
		
		var location = product["location"] !== undefined && product["location"] != null ? product["location"] : "";
		var oh_hand = product["on_hand"] !== undefined && product["on_hand"] != null ? product["on_hand"]*1.0 : 0;
		var allocated = product["allocated"] !== undefined && product["allocated"] != null ? product["allocated"]*1.0 : 0;
		var available = product["available"] !== undefined && product["available"] != null ? product["available"]*1.0 : 0;
		var on_order = product["on_order"] !== undefined && product["on_order"] != null ? product["on_order"]*1.0 : 0;

		// Update #search-result when matched product found
		if( !matched_query && (sku == query || name.indexOf(query) !== -1) ) {
			matched_query = true;
			$('#form-search-result').html('Matched: <i><b>'+name+'</b></i>'); 
		}
		
		var exists = $('#'+product_id).length !== 0;

		var cell_locations_div_id = product_id+"-locations-div";

		// Create row and cells if not exists
		if( !exists ) {
			// Create row
			var tbl_row = tbl_body.insertRow();
		
			tbl_row.id = product_id;

			// Create cells
			var cell_sku =  tbl_row.insertCell();
			var cell_product =  tbl_row.insertCell();
			var cell_family_sku =  tbl_row.insertCell();
			var cell_barcodes =  tbl_row.insertCell();
			var cell_country = tbl_row.insertCell();
			var cell_locations =  tbl_row.insertCell();
		
			// Set cell IDs
			cell_sku.id = product_id+'-sku';
			cell_product.id = product_id+'-product';
			cell_family_sku.id = product_id+'-family_sku';
			cell_barcodes.id = product_id+'-barcodes';
			cell_country.id = product_id+'-country';
			cell_locations.id = product_id+'-locations';
		
			// Set 'data-label' for responsive table styling
			cell_sku.setAttribute('data-label', 'SKU');
			cell_product.setAttribute('data-label', 'Product');
			cell_family_sku.setAttribute('data-label', 'Family SKU');
			cell_barcodes.setAttribute('data-label', 'Barcode(s)');
			cell_country.setAttribute('data-label', 'Country');
			cell_locations.setAttribute('data-label', 'Stock Locations');
		
			// Set cell classes
			cell_sku.className = 'responsive-table-cell-align-left';
			cell_product.className = 'responsive-table-cell-align-left';
			cell_family_sku.className = 'responsive-table-cell-align-left';
			cell_barcodes.className = 'responsive-table-cell-align-left';
			cell_country.className = 'responsive-table-cell-align-center';

			// Set cell values
			cell_sku.appendChild(document.createTextNode(sku));
			cell_family_sku.appendChild(document.createTextNode(family_sku));
			cell_country.appendChild(document.createTextNode(country_code));

			// ** PRODUCT cell special case **
			var cell_product_link = document.createElement('a');
		
			cell_product_link.appendChild(document.createTextNode(name));
			cell_product_link.title = name;
			cell_product_link.href = product["dear_product_link"];
			cell_product_link.target = "_blank";
		
			cell_product.appendChild(cell_product_link);
			
			// ** BARCODES cell special case **
		
			if(barcodes && !jQuery.isEmptyObject(barcodes)) {
				$.each(barcodes, function(index, barcode) { 
					if( !matched_query && barcode == query ) {
						matched_query = true;
						$('#form-search-result').html('Matched: <i><b>'+name+'</b></i>'); 
					}
					var cell_barcode = '<div class="row">'+barcode+'</div>';
					$('#'+product_id+'-barcodes').append(cell_barcode);
				});
			} else {
				cell_barcodes.appendChild(document.createTextNode(sku));
			}
			
			// ** LOCATIONS cell special case **
			var cell_locations_div = document.createElement('div');
		
			cell_locations_div.id = cell_locations_div_id;
		
			cell_locations.appendChild(cell_locations_div);
			
			// Create responsive cell buffer row
			var cell_soh_location_0 = '<div class="row responsive-table-cell-buffer">&nbsp;</div>';
			// Append buffer row
			$('#'+cell_locations_div_id).append(cell_soh_location_0);
			
			product_soh_counter[product_id] = {};
			product_soh_counter[product_id]["total"] = 0.0;
			product_soh_counter[product_id]["instances"] = 0;
		}
		
		// Only report positive records
		if( available > 0 ) {
			product_soh_counter[product_id]["total"] += available;
			
			var i = product_soh_counter[product_id]["instances"];
			
			try {
				var location_regex = /([^|]+)/g;
				var location_short_name = "";
				var match = location.match(location_regex);

				if( match.length )	{
					var location_type = match[1] ? match[1] : "";
					var location_name = match[2] ? match[2] : "";
					var location_outlet = match[3] ? match[3] : ""
			
					location_short_name = location_name;
					location_short_name = (location_short_name ? location_short_name.trim() + " | "  : "") + location_type;
					location_short_name = (location_short_name ? location_short_name.trim() + " | "  : "") + location_outlet;
					location_short_name = location_short_name.trim();
				}
			} catch(err) { 
				location_short_name = "";
			} 
			
			// Default if no short name can be derived
			if( !location_short_name ) 
				location_short_name = location;

			var cell_soh_location = 
				'<div class="row" id="'+product_id+'-location-'+i+'" data-label="'+location+'">'+
					'<div class="pseudo-row-location-name">'+location_short_name+'</div>'+
					'<div class="pseudo-row-location-qty">'+available+'</div>'+
				'</div>'
			;
			
			// Catch for double-up on async requests
			if( !$('#'+cell_locations_div_id).find('[data-label="'+location+'"]').length ) {
				// Divider if more than 1 location
				if(i > 0) {
					$('#'+cell_locations_div_id).append('<div class="pseudo-row-divider">&nbsp;</div>');
				}

				// Append SOH location cell
				$('#'+cell_locations_div_id).append(cell_soh_location);
				
			}
			
			// Delete any existing N/A location rows
			if( $('#'+product_id+'-location-NA').length !== 0 ) {
				$("#"+product_id+"-location-NA").detach();
			}
			
			// Increment positive record counter
			++product_soh_counter[product_id]["instances"];						
		}

		// Append N/A stock on hand row if no stock found
		if( product_soh_counter[product_id]["instances"] === 0 ) {
			if( $('#'+product_id+'-location-NA').length === 0 ) {
				var cell_soh_location = 
					'<div class="row" id="'+product_id+'-location-NA" data-label="NA">'+
						'<div class="pseudo-row-location-qty-na">Not Available</div>'+
					'</div>'
				;
		
				// Append SOH location cell
				$('#'+cell_locations_div_id).append(cell_soh_location);
			}
		}
	});
	
	
}

function lookup_availability(
	 dear_product_id
	,dear_instance
	,before_send_callback
	,success_callback
	,error_callback
	,complete_callback
) {	
	if(playbill_connector) {
		playbill_connector.lookupProductSOH(
			 dear_product_id
			,dear_instance
			,null
			,null
			,before_send_callback
			,success_callback
			,error_callback
			,complete_callback
		);
	} else { 
		error_callback();
	}
}

/**
 * Utility Methods
 *
 */
 
function lobibox_alert(title, msg, callback) {
	if( !msg )
		return;
	
	var list = '<ul>';	

	if( $.isArray(msg) ) {
		for(var i = 0; i < msg.length; ++i) {
			if( !jQuery.isEmptyObject(msg[i]) ) {
			   $.each(msg[i], function(key,val) {
				   list += '<li>'+ key +': '+ val +'</li>';
			   });
			} else {
				list += '<li>'+ msg[i] +'</li>';
			}
		
		};		
	} else if( !jQuery.isEmptyObject(msg) ) {
		$.each(msg, function(key,val) {
			list += '<li>'+ key +': '+ val +'</li>';
		})
	} else {
		console.log('normal');
		list += '<li>'+ msg +'</li>';
	}

	list += '</ul>';
	msg = list;
	
	callback(title, msg);
}
 
function lobibox_alert_error(title, msg) {
	Lobibox.alert('error', {
		title: title,
		msg: msg
	})

	$('.lobibox-error').resize();
}

function lobibox_alert_success(title, msg) {
	Lobibox.alert('success', {
		title: title,
		msg: msg
	});
	
	$('.lobibox-success').resize();
}

function validate_select ( id ) {
	if( $(id).is("select") && $(id).attr('required') !== undefined ) {
		if( $(id).val() && $(id).val() !== undefined && $(id).find('option [value="'+$(id).val()+'"]') ) {
			toggleValid(id, true);
		} else if ( $(id).val() !== '' && $(id).val() !== undefined && $(id).val() !== null ) {
			toggleValid(id, false);
		} else {
			toggleValid(id, null);
		}
	}
}

function simple_validation ( id ) {
	if ( id !== undefined ) {
		if ( $(id).val() > '' ) {
			toggleValid(id, true);
		} else {
			toggleValid(id, false);
		}
	
	}
}

function toggleValid( id, state ) {
	if( state === true ) {
		$(id).attr('data-valid', "true");
	} else if ( state === false ) {
		$(id).attr('data-valid', "false");
	} else {
		$(id).attr('data-valid', "");
	}
}

function toggleAPIError( id, state ) {
	if( state === true ) {
		$(id).attr('data-api-error', "true");
	} else {
		$(id).attr('data-api-error', "false");
	}
}

function toggleErrorDescriptor( id, msg = null) {
	var obj = '#error-'+id;
	var state = $('#'+id).attr('data-valid') !== "" ? $('#'+id).attr('data-valid') === "true" : true;

	if(!state) { 
		Lobibox.notify( 'error', {
			title: 'Error',
			msg: msg,
			positon: 'bottom right',
			icon: false,
			sound: false
		});
	}

	//$(obj).toggleClass('disabled', state);
	//$(obj).html($(obj).find('i')[0].outerHTML + msg);
}