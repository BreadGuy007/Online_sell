// Dev mode ON/OFF
var devmode = false;
var inventory = null;
var bigcommerce = null;
var pct = null;
const env = "prod";

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

function CSVToArray( strData, strDelimiter ){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
                ){

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push( [] );

            }

            var strMatchedValue;

            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                    );

            } else {

                // We found a non-quoted value.
                strMatchedValue = arrMatches[ 3 ];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return( arrData );
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

var dyn_variant_button_1 = new DynForm(
	{
		'maxFields'			: 50,
		'prepend'			: true,
		'fieldWrapper'		: '#add-variant-1',
		'addButton'			: '#add-variant-btn-1',
		'removeSelector'	: '.del-variant-btn-1',
		'beforeRemoveCallback'	: function(node) {
			$.each($('[data-product-variants]'), function() {
				var e = this;
				// Parse variant tuples
				var variants = $(e).attr('data-product-variants');
				variants = variants ? variants.unescapeSpecialXMLChars() : null;
				variants = JSON.parse((variants || {}));
				// Delete all nodes that have a variant-1 tuple matching the deleted (node)
				if( variants["1"] !== undefined && $(node).find('input').val() !== undefined &&
					variants["1"].toUpperCase() === $(node).find('input').val().toUpperCase() ) {
					$(e).remove();
				}
			});
		},
		'afterRemoveCallback'	: function() {
			if( this.size() < 1 ) $('#variant-generate').trigger('click');
		},
		'insertHTML'		: '<div class="row add-field-container">'+
							  '<input class="variant-option-1" type="text" placeholder="Variant Option" onchange="simple_validation(this)" required data-mapping-id="variant-options-1" data-flag="true" data-valid=""/>'+
							  '<div class="del-field-btn del-variant-btn-1"><i class="fa fa-trash" aria-hidden="true"></i></div></div>'
	}
);

var dyn_variant_button_2 = new DynForm(
	{
		'maxFields'			: 50,
		'prepend'			: true,
		'fieldWrapper'		: '#add-variant-2',
		'addButton'			: '#add-variant-btn-2',
		'removeSelector'	: '.del-variant-btn-2',
		'beforeRemoveCallback'	: function(node) {
			$.each($('[data-product-variants]'), function() {
				var e = this;
				// Parse variant tuples
				var variants = $(e).attr('data-product-variants');
				variants = variants ? variants.unescapeSpecialXMLChars() : null;
				variants = JSON.parse((variants || {}));
				// Delete all nodes that have a variant-1 tuple matching the deleted (node)
				if( variants["2"] !== undefined && $(node).find('input').val() !== undefined &&
					variants["2"].toUpperCase() === $(node).find('input').val().toUpperCase() ) {
					$(e).remove();
				}
			});
		},
		'afterRemoveCallback'	: function() {
			if( this.size() < 1 ) $('#variant-generate').trigger('click');
		},
		'insertHTML'		: '<div class="row add-field-container">'+
							  '<input class="variant-option-2" type="text" placeholder="Variant Option" onchange="simple_validation(this)" required data-mapping-id="variant-options-2" data-flag="true" data-valid=""/>'+
							  '<div class="del-field-btn del-variant-btn-2"><i class="fa fa-trash" aria-hidden="true"></i></div></div>'
	}
);

var dyn_variant_button_3 = new DynForm(
	{
		'maxFields'			: 20,
		'prepend'			: true,
		'fieldWrapper'		: '#add-variant-3',
		'addButton'			: '#add-variant-btn-3',
		'removeSelector'	: '.del-variant-btn-3',
		'beforeRemoveCallback'	: function(node) {
			$.each($('[data-product-variants]'), function() {
				var e = this;
				// Parse variant tuples
				var variants = $(e).attr('data-product-variants');
				variants = variants ? variants.unescapeSpecialXMLChars() : null;
				variants = JSON.parse((variants || {}));
				// Delete all nodes that have a variant-1 tuple matching the deleted (node)
				if( variants["3"] !== undefined && $(node).find('input').val() !== undefined &&
					variants["3"].toUpperCase() === $(node).find('input').val().toUpperCase() ) {
					$(e).remove();
				}
			});
		},
		'afterRemoveCallback'	: function() {
			if( this.size() < 1 ) $('#variant-generate').trigger('click');
		},
		'insertHTML'		: '<div class="row add-field-container">'+
							  '<input class="variant-option-3" type="text" placeholder="Variant Option" onchange="simple_validation(this)" required data-mapping-id="variant-options-3" data-flag="true" data-valid=""/>'+
							  '<div class="del-field-btn del-variant-btn-3"><i class="fa fa-trash" aria-hidden="true"></i></div></div>'
	}
);

function init(
	callback
) {
	populate_inventory_instances(
		'#database .sub-settings',
		'#inventory-instance',
		new InventoryInterface(),
		function() {
			productSetupFormEvents();

			family_name_events();
			variant_matrix_events();

			config_submit();
			bind_submit_events();

			callback();
	});
}

function start() {
	populate_departments(
		 '#form-department'
		,populate_variant_sizing_lookup(
			populate_product_brands(
				 '#form-product-brand'
				,inventory
				,populate_variant_sizing_lookup(
					populate_product_brands(
						 '#form-product-brand'
						,inventory
						,populate_product_brands(
							 '#form-product-consignment-brand'
							,inventory
							,populate_purchase_tax_rules(
								 '#form-finance-purchase-tax'
								,inventory
								,populate_sale_tax_rules(
									 '#form-finance-sale-tax'
									,inventory
									,populate_product_inventory_account(
										 '#form-finance-inventory-account'
										,inventory
										,populate_product_cogs_account(
											 '#form-finance-cogs-account'
											,inventory
											,populate_product_expense_account(
												 '#form-finance-expense-account'
												,inventory
												,populate_product_revenue_account(
													 '#form-finance-revenue-account'
													,inventory
													,populate_product_expense_account(
														 '#form-finance-expense-account'
														,inventory
													)
												)
											)
										)
									)
								)
							)
						)
					)
				)
			)
		)
	)
	;
}

function productSetupFormEvents() {
	$('[data-tag][data-tag="true"]').on('change', function() {
		var before = $(this).attr('data-before');
		var after = $(this).attr('data-after');

		if(!before)
			$(this).attr('data-before', $(this).val());
		else
			$(this).attr('data-before', after);

		$(this).attr('data-after', $(this).val());
	});

	$('#product-tag-field').tagit({
		allowDuplicates: false,
		placeholderText: "New Tag",
		allowSpaces: true,
		tagLimit: 30,
		singleField: true,
		singleFieldNode: $('#product-tags')
	});
	$('[data-tag][data-tag="true"]').on('focusin', function() {
		try{$('#product-tag-field').tagit('removeTagByLabel', $(this).val());}catch(e) {}
	});
	$('[data-tag][data-tag="true"]').on('focusout', function() {
		$('#product-tag-field').tagit('createTag', $(this).val());
	});

	$('[data-tag][data-tag="true"]').on('change', function() {
		try{$('#product-tag-field').tagit('removeTagByLabel', $(this).attr('data-before'));}catch(e) {}
		$('#product-tag-field').tagit('createTag', $(this).attr('data-after'));
	});

	// Configure initial InventoryInterface
	$(document).on( 'change', '#inventory-instance', function() {
		var self = this;
		setup_inventory_interface($(self).val() || $(self).attr('data-default'));

		$.each($('#product-form input[type!="button"]'), function() {
			if( self !== this )
				$(this).trigger('change').trigger('change');
		});
		$.each($('#product-form select'), function() {
			if( self !== this )
				$(this).val('').trigger('change');
		});

		reset_form();
		populate_defaults();
	});


	/* CHANGE EVENTS */
	$(document).on( 'change', '#form-department', function() {
		var self = this;
		populate_product_categories(
			 '#form-category'
			,$('#form-department option:selected').val()
			,inventory
			,function() {
				$('#form-category').trigger('change');
				validate_select(self);
			}
		);
	});

	$(document).on( 'change', '#form-category', function() {
		var self = this;
		var category = $('#form-category option:selected').val();
		var category_val = $('#form-category option:selected').text();

		$('#form-product-brand').trigger('change');
		$('#form-product-consignment-brand').trigger('change');

		if ( !category ) {
			// Deactive and reset form fields on invalid category
			$('*[id*="form-tier"]').html('').trigger('change').append($(no_option)).attr( 'disabled', true );
			$('*[id*="form-variant"]').html('').trigger('change').append($(no_option)).attr( 'disabled', true );
			$('*[id*="form-pricing"]').html('').trigger('change').attr( 'disabled', true );
			$('*[id*="form-detail"]').html('').trigger('change').attr( 'disabled', true );
			$('*[id*="form-misc-business-stream"]').html('').trigger('change').append($(no_option)).attr( 'disabled', true );

			// Trigger Tier 1 change events manually since it is disabled
			$('#form-tier-1').attr('disabled', false).trigger('change').attr('disabled', true);

			set_form_defaults();
			validate_select(self);
		} else {
			// Activate form fields on valid category
			$('*[id*="form-tier"]').attr( 'disabled', false );
			$('*[id*="form-pricing"]').attr( 'disabled', false );
			$('*[id*="form-misc"]').attr( 'disabled', false );
			$('*[id*="form-detail"]').attr( 'disabled', false );
			$('*[id*="form-variant"]').attr( 'disabled', false );
			$('*[id*="form-misc"]').html('').attr( 'disabled', false );

			populate_business_streams('#form-misc-business-stream');

			// Deactivate Tier 1 since it will be hard set
			$('*[id="form-tier-1"]').attr( 'disabled', true );

			populate_product_tier1(
				 '#form-tier-1'
				,category_val
				,function() {
					var parsed_category = parse_product_category(category_val);

					generate_sku();

					populate_product_variant ( '#form-variant-1', null, 'variant-1', set_form_defaults);
					populate_product_variant ( '#form-variant-2', null, 'variant-2', set_form_defaults);
					populate_product_variant ( '#form-variant-3', null, 'variant-3', set_form_defaults);

					populate_product_tier('#form-tier-2', parsed_category, $('#form-tier-1 option:selected').text(), 'tier-2');
					populate_product_tier('#form-tier-3', parsed_category, $('#form-tier-1 option:selected').text(), 'tier-3');
					populate_product_tier('#form-tier-4', parsed_category, $('#form-tier-1 option:selected').text(), 'tier-4');
					populate_product_tier('#form-tier-5', parsed_category, $('#form-tier-1 option:selected').text(), 'tier-5');

					$('*[id*="form-tier"]').trigger('change');
					$('*[id*="form-pricing"]').trigger('change');
					$('*[id*="form-misc"]').trigger('change');
					$('*[id*="form-detail"]').trigger('change');
					$('*[id*="form-variant"]').trigger('change');
					$('*[id*="form-misc"]').trigger('change');

					// Trigger Tier 1 change events manually since it is disabled
					$('#form-tier-1').attr('disabled', false).trigger('change').attr('disabled', true);

					set_form_defaults();
					validate_select(self);
				}
			);
		}
	});
	$(document).on( 'change', '#form-bigcommerce-integration', function() {

		var selectElement = document.getElementById('form-bigcommerce-integration-stores');

		selectElement.innerHTML = "";
		if ($(this).is(':checked')) {
			// If checked, show the stores dropdown
			$('#showBCStores').show();
			$.ajax({
				url: BigcommerceInterface.prototype._instance_mapping_uri,
				dataType: "json",
				async: false,
				cache: false,
				success: function(data) {
					// Get the select element
					var selectElement = $('#form-bigcommerce-integration-stores');

					// Loop through the store names and add options to the select element
					$.each(data.contents, function(storeName) {
						let name = data.contents[storeName]['brand'];
						selectElement.append($('<option>', {
							value: storeName,
							text: name
						}));
					});
				}
			});
		} else {
			// If unchecked, hide the stores dropdown
			$('#showBCStores').hide();
		}

	});

	$(document).on( 'change', '#form-product-brand', function() {
		var brand_id = $(this).val();

		// Reset AA Code
		$('*[id*="form-brand"]').val('').trigger('focusout');

		if ( !brand_id ) {

			$('*[id*="form-brand"]').html('').attr( 'disabled', true );
		} else {
			$('*[id*="form-brand"]').attr( 'disabled', false );
		}

		set_form_defaults();
		validate_select(this);
	});

	$(document).on( 'change', '#form-product-consignment-brand', function() {
		var brand_id = $(this).val();

		// Reset AA Code
		$('*[id*="form-brand"]').val('').trigger('focusout');

		if ( !brand_id ) {

			$('*[id*="form-brand"]').html('').attr( 'disabled', true );
		} else {
			$('*[id*="form-brand"]').attr( 'disabled', false );
		}

		set_form_defaults();
		validate_select(this);
	});

	$(document).on( 'change', '#form-product-brand', function() {
		var val = $(this).val() || "";
		var brandsel = '#form-product-consignment-brand';
		var selector = brandsel + ', [for="form-product-consignment-brand"]';

		$(selector).toggleClass('disabled', !(val.toUpperCase() === "CONSIGNMENT"));
		$(brandsel).prop('required', val.toUpperCase() === "CONSIGNMENT");

		if( val.toUpperCase() !== "CONSIGNMENT" ) {
			$(brandsel).removeAttr('required').removeAttr('data-valid').removeAttr('data-tag').trigger('focusin').val('').trigger('focusout');
		} else {
			$(brandsel).attr('required', true).attr('data-valid','').attr('data-tag', true);
		}
	});

	$(document).on( 'change', '*[id*="form-variant"]', function() {
		var lhs = this;

		$('*[id*="form-variant"]').each(function() {
			var rhs = this;

			if ( $(lhs).val() && lhs != rhs && $(lhs).val() == $(rhs).val() )
				$(rhs).val('');
		});

		var regex = /(\d)$/g;
		var match = $(lhs).attr('id').match(regex);

		if( match.length )	{
			var txt = $(lhs).val() ? ' Add '+$(lhs).find('option:selected').text() : '';
			var flag = txt ? false : true;

			$('#add-variant-txt-'+match[0]).text(txt);
			$('#add-variant-'+match[0]).toggleClass('disabled', flag );

			if( !txt ) {
				$('.del-variant-btn-'+match[0]).trigger('click');
			}
		}

		validate_select(this);

	});

	// Click EVENT to add an additional variant option
	$(document).on( 'click', '#add-variant-btn-1', function(e) {
		e.preventDefault();
		dyn_variant_button_1.addField();
	});

	$(document).on( 'click', '#add-variant-btn-2', function(e) {
		e.preventDefault();
		dyn_variant_button_2.addField();
	});

	$(document).on( 'click', '#add-variant-btn-3', function(e) {
		e.preventDefault();
		dyn_variant_button_3.addField();
	});

	// Tab EVENT to add an additional variant option
	$(document).on( 'keydown', '.variant-option-1:last', function(e) {
		var keyCode = e.keyCode || e.which;
		if (keyCode == 9) {
			$('#add-variant-btn-1').trigger('click');
		}
	});
	$(document).on( 'keydown', '.variant-option-2:last', function(e) {
		var keyCode = e.keyCode || e.which;
		if (keyCode == 9) {
			$('#add-variant-btn-2').trigger('click');
		}
	});
	$(document).on( 'keydown', '.variant-option-3:last', function(e) {
		var keyCode = e.keyCode || e.which;
		if (keyCode == 9) {
			$('#add-variant-btn-3').trigger('click');
		}
	});


	$(document).on( 'change', '#form-product-brand', function() {
		try {
			var brand = $(this).find('option:selected').text();
			if(brand_aa_lookup[brand]) {
				$('#form-brand-aa-code').val(brand_aa_lookup[brand]);
				$('#form-brand-aa-code').trigger('focusout');
			}
			validate_select(this);
		} catch(err) {}

	});

	$(document).on( 'change', '#form-product-consignment-brand', function() {
		try {
			var brand = $(this).find('option:selected').text();
			if(brand_aa_lookup[brand]) {
				$('#form-brand-aa-code').val(brand_aa_lookup[brand]);
				$('#form-brand-aa-code').trigger('focusout');
			}
			validate_select(this);
		} catch(err) {}

	});

	$(document).on( 'focusout', '#form-brand-aa-code', function() {
		var regex = /^[^\s]{1}[\S\w\s]{0,78}[^\s]{1}$|^[^\s]{1}$/;
		var matches = $(this).val().match(regex);

		if( !$(this).val() ) {
			toggleValid(this, null);
		} else if ( matches && matches.length ) {
			toggleValid(this, true);
		} else {
			toggleValid(this, false);
		}

		generate_sku();
	});

	$(document).on( 'focusout', '#form-misc-season', function() {
		var regex = /(\d{2})/g;
		var matches = $(this).val().match(regex);

		var year_part = !matches ?
							null :
							matches.length > 1 ?
								matches[1] :
								matches[0];

		var year_now = new Date().getFullYear();
		var year_then = new Date('01/01/'+year_part).getFullYear();

		// Year entered is valid to within 10 years of the current date
		if( year_then && year_then <= year_now + 10 && year_then >= year_now - 10 ) {
			toggleValid(this, true);
		} else if ($(this).val() === undefined || $(this).val() == '' ) {
			toggleValid(this, null);
		} else {
			toggleValid(this, false);
		}

		generate_sku();
	});

	$(document).on( 'change',	'#form-pricing-retail', function() {
		simple_validation(this);
		// Update any and all Product Variant default prices if not overwritten
		var val = $(this).val();
		$.each($('[data-variant-id="price"]'), function() {
			$(this).attr('placeholder', val);
			$(this).attr('data-default', val);
		});
	});

	$(document).on( 'change',	'#form-sel-country-of-origin-code', function() {
		validate_select(this);
		$('#form-misc-country-of-origin').val($('#form-sel-country-of-origin-code option:selected').text());
	});

	$(document).on( 'change',	'#form-pricing-wholesale', function() {
		simple_validation(this);
	});
	
	$(document).on( 'change',	'#form-product-weight', function() {
		simple_validation(this);
	});


	/* Validation events */
	$(document).on( 'change', 	'#form-finance-costing-method', function() { validate_select(this); });
	$(document).on( 'change', 	'#form-finance-purchase-tax', function() { validate_select(this); });
	$(document).on( 'change', 	'#form-finance-sale-tax', function() { validate_select(this); });
	$(document).on( 'change', 	'#form-misc-business-stream', function() { validate_select(this); });

	/* SKU generation events */
	$(document).on( 'change', 	'#form-tier-2', function() { validate_select(this); generate_sku(); });
	$(document).on( 'focusout', '#form-misc-sort-priority', generate_sku);

	$(document).on( 'change', '#form-pricing-retail', function() {
		$('*[class*="variant-price"]').attr('placeholder', $(this).val());
	});

	$(document).on( 'click', '#fill-placeholder-barcodes', fill_placeholder_barcodes);

	$(document).on( 'paste', '[data-variant-id="sku"]', function(e) {
		// prevent data from being pasted
		e.preventDefault();
		// capture clipboard data
		var data = e.originalEvent.clipboardData.getData('text')
		// parse data by TAB delimiter
		var data = CSVToArray(data, "\t");

		// result array
		var skus = [];

		// parase data array delimited by TAB and append valid 1st column SKU to results
		// NOTE: SKU will assumed to be in the 1st column per row
		if( data && data.length > 0 ) {
			$.each(data, function(i, row) {
				if( row && row.length > 0 && row[0] && row[0] !== undefined ) {
					skus.push(row[0].trim().substring(0,255));
				};
			});
		}

		// Overwrite variants from 1 -> n for each valid SKU
		$.each(skus, function(i, sku) {
			$('[data-variant-id="sku"]:eq('+i+')').val(sku).blur().trigger('focusout');
		});
	});

};

function setup_inventory_interface(instance) {
	inventory = new InventoryInterface(instance);

	if(instance === "Playbill Pty Ltd")
		$('#form-misc-default-location').attr('data-default','PPL | WH | Main Warehouse | Shed');
	else if(instance === "Playbill NZ")
		$('#form-misc-default-location').attr('data-default','NMS | ST | Mt Smart Stadium | Office');
}

function family_name_events() {
	$(document).on( 'focusout', '#form-family-name', function() {
		var id = this;
		var name = $(this).val().trim();

		$.each($('[data-variant-id="suffix"]'), function() {
			var key = $(this).attr('data-variant-key');
			var meta = $('[data-variant-key="'+key+'"][data-variant-id="name"]');

			$(meta).attr('value', $.trim(name + ' ' + $(this).text()) );
		});

		if( name !== undefined && name ) {
			inventory.checkProductName (
				name,
				function(xhr) {
					toggleValid('#form-family-name', null);
					$('#form-family-name').toggleClass("loading", true);
				},
				function(data) {

					if( data && !jQuery.isEmptyObject(data) && data.name ) {
						toggleValid('#form-family-name', true);
						generate_sku();
					} else {
						toggleValid('#form-family-name', false);
					}
				},
				function(xhr, textStatus, textErrorThrown) {
					toggleValid('#form-family-name', false);
				},
				function(xhr) {
					$('#form-family-name').toggleClass("loading", false);
				}
			);
		}
	});
}

/**
 *	RESET FORM
 *
 */
function reset_form() {
	$('#product-form').trigger('reset');
	$('#product-tag-field').tagit("removeAll");
	start();
}

/**
 *	GENERATE VARIANT MATRIX
 *
 *	Generates all the combinations of {Variant 1} x {Variant 2} x {Variant 3}
 *	The table created contains the below columns:
 *		- Variant Key, i.e. {Variant 1} / {Variant 2} / {Variant 3}
 *		- EAN-13 Barcode or SKU entry field [REQURIED]
 *		- Price Override per SKU [OPTIONAL]
 */
function variant_matrix_events() {
	$(document).on('click', '#variant-generate', function(e) {
		matrix = {};
		matrix_lookup = {};

		var row_html = '<div class="row table-row" {0} data-variant-key="{1}" data-mapping-id="products" data-tag="false">{2}</div>';

		var key_html = '<div class="table-cell">'+
							'<i data-variant-id="name-icon" data-variant-key="{0}" class="fa fa-font variant-key" aria-hidden="true"></i>'+
							'<i></i>'+
							'<i data-variant-id="barcode-icon" data-variant-key="{0}" class="fa fa-barcode variant-key" aria-hidden="true"></i>'+
							'<p data-variant-id="suffix" data-variant-key="{0}" class="variant-key-text">{1}</p>'+
					   '</div>';
		var sku_html = '<div class="table-cell">'+
							'<input data-variant-id="sku" data-variant-key="{0}" class="variant-sku" {1} type="text" placeholder="Enter Barcode/SKU" required '+
								'data-mapping-id="product-sku" data-tag="false" data-valid=""/>'+
					   '</div>';
		var price_html = '<div class="table-cell">'+
							'<label class="table-cell-label" for="variant-price">Price (Optional)</label>'+
							'<input data-variant-id="price" data-variant-key="{0}" name="variant-price" class="variant-price" data-valid="" type="number" '+
								'placeholder="'+($('#form-pricing-retail').val() || "0.00")+'" data-mapping-id="product-price" data-tag="false" data-valid="" data-default="'+($('#form-pricing-retail').val() || "0.00")+'"/>'+
						 '</div>';

		var meta_html = '<div class="disabled" data-variant-id="name"  data-variant-key="{0}" data-mapping-id="product-name" data-tag="false" data-valid="" value="{1}"/>'+
						'<div class="disabled" data-variant-id="status"  data-variant-key="{0}" data-mapping-id="product-status" data-tag="false" data-valid="" value="{2}"/>'+
						'<div class="disabled" data-variant-id="barcode"  data-variant-key="{0}" data-mapping-id="product-barcode" data-tag="false" data-valid=""/>'+
						'<div class="disabled" data-variant-id="uom"  data-variant-key="{0}" data-mapping-id="product-uom" data-tag="false" data-valid="" value="{3}"/>'

		var thead = '';
		var tbody_start = '<div class="row table-body">';
		var tbody = '';
		var tbody_end = '</div>';
		var tfoot = '';

		var tabindex = 1;

		var variant_arr = [];
		var variants = {};
		var variants_sorted_keys = [];

		// Regex to get variant iteration, i.e. some-text-1, some-text-2
		var regex = /(\d)$/g;

		// Map all the variants and they values
		$.each($('[data-mapping-id*="variant-options"]'), function() {
			var match = $(this).attr('data-mapping-id').match(regex);
			var itr = match && match.length ? match[0] : null;

			// Check that the variant is iterated correctly
			if( itr ) {
				if(!variants[itr])
					variants[itr] = [];

				variants[itr].push( $(this).val().trim() );

				if($.inArray(itr, variants_sorted_keys) == -1)
					variants_sorted_keys.push(itr);
			}
		});

		// Sort the variant keys so that they build a matrix in the natural ordering
		// This is in case they are selected out of order initially
		variants_sorted_keys.sort();

		// Add all the variant groups to a variant array for computing
		$.each(variants_sorted_keys, function(idx, val) {
			var obj = {};
			obj[val] = variants[+val];
			variant_arr.push(obj);
		});

		var matrix = [];
		compute_matrix(variant_arr, 0, variant_arr.length, [], matrix);

		// For each computed matrix entry
		$.each(matrix, function(idx, arr) {
			var variant_tuple = {};
			var variant_key = '';
			$.each(arr, function(idx, arr) {
				// For each variant as { "opt-id":"opt-val", ... }
				$.each(arr, function(key, val) {
					variant_tuple[key] = val;
					// Create a variant key as a unique name string, i.e. "{product_name} {variant_key}"
					// e.g. "Iconic T-Shirt Red / S"
					if(variant_key)
						variant_key += ' / ';
					variant_key += val;
				});
			});

			// Compile product composite name
			var product_name = $.trim($('#form-family-name').val().trim()+' '+variant_key);
			var variant_keys_attr = 'data-product-variants="'+JSON.stringify( variant_tuple ).escapeSpecialXMLChars()+'"';;

			tbody += String.format(row_html, variant_keys_attr, MD5(variant_key),
				String.format(key_html, MD5(variant_key), variant_key)+
				String.format(sku_html, MD5(variant_key), ('tabindex="'+tabindex+'"' || ""))+
				String.format(price_html, MD5(variant_key)) +
				String.format(meta_html, MD5(variant_key), product_name, "Active", get_variant_order_index())
			 );

			 tabindex = tabindex ? ++tabindex : tabindex;
		});

		// Build the Variant Matrix
		//  - Overwrites any existing matrix (includes clearing it)
		$('#variant-table').html(
			thead +
			tbody_start + tbody + tbody_end +
			tfoot
		);

		// Create the SKU events to validate the SKU against Dear
		if( !jQuery.isEmptyObject(matrix) ) {
			$(document).on( 'focusout', '[data-variant-id="sku"]', function() {
				var e = this;
				var b = $('[data-variant-key="'+$(e).attr('data-variant-key')+'"][data-variant-id="barcode"]');
				var bi = $('[data-variant-key="'+$(e).attr('data-variant-key')+'"][data-variant-id="barcode-icon"]');
				var n = $('[data-variant-key="'+$(e).attr('data-variant-key')+'"][data-variant-id="name"]');
				var ni = $('[data-variant-key="'+$(e).attr('data-variant-key')+'"][data-variant-id="name-icon"]');

				var sku = $(e).val().trim();
				var name = $(n).attr('value');

				if( name ) {
					// Validate Product Variant Name
					inventory.checkProductVariantName (
						name,
						function(xhr) {
							toggleValid(e, null);
							toggleValid(ni, null);
							toggleValid(bi, null);
							toggleValid(b, null);
							$(b).val('');
							$(e).toggleClass("loading", true);
						},
						function(data) {
							if( data && !jQuery.isEmptyObject(data) && data.name ) {
								toggleValid(ni, true);

								/* ----- */
								// Validate SKU if Product Variant Name was valid
								if( sku ) {
									inventory.checkProductSKU (
										sku,
										function(xhr) {
										},
										function(data) {
											if( data && !jQuery.isEmptyObject(data) && data.sku ) {
												toggleValid(e, true);
												toggleValid(bi, true);
												toggleValid(b, true);
												$(b).val(sku);
											} else {
												toggleValid(e, false);
												toggleValid(bi, false);
												toggleValid(b, false);
											}
										},
										function(xhr, textStatus, textErrorThrown) {
											toggleValid(e, false);
											toggleValid(bi, false);
											toggleValid(b, false);
											$(e).toggleClass("loading", false);
										},
										function(xhr) {
											$(e).toggleClass("loading", false);
										}
									);
								} else {
									$(e).toggleClass("loading", false);
								}
								/* ----- */

							} else {
								toggleValid(e, false);
								toggleValid(ni, false);
							}
						},
						function(xhr, textStatus, textErrorThrown) {
							toggleValid(e, false);
							toggleValid(ni, false);
							toggleValid(bi, false);
							toggleValid(b, false);
							$(e).toggleClass("loading", false);
						},
						function(xhr) {
						}
					);
				} else {
					toggleValid(e, null);
					toggleValid(bi, null);
					toggleValid(ni, null);
					toggleValid(b, null);
					$(b).val('');
				}
			});
		}

		return false;
	});
}


function compute_matrix(variants, i, n, keys, matrix) {
	var varr = [];
	for ( var prop in variants[i] )
		varr.push(prop);
	// Variant iteration id
	var v = varr[0];
	$.each(variants[i], function(idx, arr) {
		$.each(arr, function(key, val) {

			// Clone the @KEYS array to retain current state
			var tmp = JSON.parse(JSON.stringify( keys ));
			var obj = {};
			obj[v] = val;
			// Add new variant key to check deeper
			tmp.push(obj);

			if( i + 1 == n ) {
				// Add the full key list to the matrix if the last iteration
				matrix.push(tmp);
			} else {
				// Compute the next iteration using the temp key array
				compute_matrix(variants, i + 1, n, tmp, matrix);
			}
		})
	});
}

function get_variant_order_index(
	category,
	variant
) {
	if( !category || !variant || !variant_sizing_lookup )
		return "Each";

	return "Each";
}

/**
 * Fill Placeholder Barcodes
 */
function fill_placeholder_barcodes() {
	var url = '/api/v1/tools/product-setup/nextPlaceholderBarcode/'
	var params = {
		'prefix' : 'placeholder'
	};

	$.each($('[data-variant-id="sku"]'), function() {
		if(!$(this).val()) {
			var e = this;
			$.ajax({
				"url": 			url,
				data: 			params,
				method: 		'GET',
				dataType:		'json',
				contentType: 	'application/json; charset=utf-8',
				cache:			false,
				global: 		false,
				async:			true,
				beforeSend: function(xhr) {
					$(e).val('Generating..');
					$(e).toggleClass('loading', true);
				},
				success: function(data) {
					if( data && !jQuery.isEmptyObject(data) && data.barcode ) {
						$(e).val(data.barcode);
						$(e).trigger('focusout');
					} else {
						$(e).val('');
					}
				},
				error: function(xhr, textStatus, textErrorThrown) {
					$(e).val('');
				},
				complete: function(xhr) {
					$(e).toggleClass('loading', false);
				}
			})
		}
	});

	return false;
}

/**
 * Commit Placeholder Barcodes
 */
function commit_placeholder_barcodes() {
	var url = '/api/v1/tools/product-setup/nextPlaceholderBarcode/'
	var params = {
		'prefix' : 'placeholder'
	};

	$.each($('[data-variant-id="sku"]'), function() {
		if(!$(this).val()) {
			var e = this;
			$.ajax({
				"url": 			url,
				data: 			params,
				method: 		'GET',
				dataType:		'json',
				contentType: 	'application/json; charset=utf-8',
				cache:			false,
				global: 		false,
				async:			true,
				beforeSend: function(xhr) {
					$(e).val('Generating..');
					$(e).toggleClass('loading', true);
				},
				success: function(data) {
					if( data && !jQuery.isEmptyObject(data) && data.barcode ) {
						$(e).val(data.barcode);
						$(e).trigger('focusout');
					} else {
						$(e).val('');
					}
				},
				error: function(xhr, textStatus, textErrorThrown) {
					$(e).val('');
				},
				complete: function(xhr) {
					$(e).toggleClass('loading', false);
				}
			})
		}
	});

	return false;
}

/* SKU Generation function */
function generate_sku () {
	var sku = inventory.generateBaseSKU (
		$('#form-category').val(),
		$('#form-product-brand').val(),
		$('#form-product-brand').val(),
		$('#form-family-name').val(),
		$('#form-tier-1').val(),
		$('#form-tier-2').val(),
		$('#form-misc-season').val(),
		$('#form-misc-sort-priority').val()
	);

	if( sku !== undefined && sku ) {
		inventory.nextProductCodeSequence(
			sku,
			function(xhr) {
				$('#form-family-code').val(sku);
				toggleValid('#form-family-code', null);
				$('#form-family-code').toggleClass("loading", true);
			},
			function(data) {
				if( data && !jQuery.isEmptyObject(data) && data.sku ) {
					$('#form-family-code').val(data.sku);
					toggleValid('#form-family-code', true);
				} else {
					$('#form-family-code').val('Error Calculating SKU');
					toggleValid('#form-family-code', false);
				}
			},
			function(xhr, textStatus, textErrorThrown) {
				toggleValid('#form-family-code', false);
			},
			function(xhr) {
				$('#form-family-code').toggleClass("loading", false);
			}
		);
	}
};


/**
 *	Form SUBMIT methods
 *
 *	 - Implementing Lobibox plugin
 */
function config_submit() {
	//Overriding default options
	Lobibox.base.DEFAULTS.iconSource = 'fontAwesome';

	//Overriding default options
	Lobibox.base.OPTIONS = $.extend({}, Lobibox.base.OPTIONS, {
		icons: {
			fontAwesome: {
				confirm: 'fa fa-question-circle',
				success: 'fa fa-check-circle',
				error: 'fa fa-times-circle',
				warning: 'fa fa-exclamation-circle',
				info: 'fa fa-info-circle'
			}
		}
	});
}

function bind_submit_events() {
	$(document).on ('click', '#submit-form', function() {
		Lobibox.confirm({
			title: "Submit Product Family",
			msg: "Are you sure all the details are correct for this Product Family?",
			callback: function($this, answer, ev) {
				switch( answer ) {

					case "yes":
						if(valid_form()) submit_form();
						//submit_form();
						break;
					default:
				}
			}
		});

		$('.lobibox-confirm').resize();

		return false;
	});
}

function valid_form() {
	var incomplete = [];

	// Match any incomplete or invalid fields
	$.each($('[required][data-valid]:not([data-valid="true"]):not(.disabled):not([disabled])'), function() {
		incomplete.push(this);
	});
	$.each($(':not([required])[data-valid="false"]'), function() {
		incomplete.push(this);
	});

	// Create notifications for any incomplete fields
	if( incomplete.length > 0 ) {
		var msg = '<ul>';

		$.each(incomplete, function() {
			var req = $(this).attr('required');

			msg+= '<li>' + ($(this).attr('data-name') || $(this).attr('name') || $(this).attr('id') || '?Unknown Field?') +
						   ': This field is '+ (req ? 'required' : 'invalid' ) +' and must contain a valid value to submit.'+
				  '</li>';

		});

		msg += '</ul>';

		// Notify the user of a couple of invalid fields at a time
		Lobibox.notify( 'error', {
			title: 'Invalid or Missing Fields',
			msg: msg,
			positon: 'bottom right',
			icon: false,
			sound: false
		});

		$('html, body').animate({
			scrollTop: ($(incomplete[0]).offset().top - $(incomplete[0]).outerHeight(true))
		});

		return false;
	}

	return true;
}

function submit_form() {
	Lobibox.progress({
		title: 'Submitting Product Form',
		label: 'Processing products...',
		progressTpl : '<div class="progress lobibox-progress-outer">\n\
            <div class="progress-bar progress-bar-danger progress-bar-striped lobibox-progress-element" data-role="progress-text" role="progressbar"></div>\n\
            </div>',
		onShow: function($this) {
			var lb = $this;
			var progress = 1;
			var erralert = false;
			$this.setProgress(progress);

			// Collates the form data into @MAP and @TAG JSON objects
			map_form_data(function(map, tags) {
				if( map && !jQuery.isEmptyObject(map) ) {
					console.log(map.bigcommerce_integration);
					// Assign tags
					map.tags = tags.join(",");

					console.log(map.tags);

					var products = map.products;
					var bcProducts = map.products;
					var errs = [];
					var successes = [];
					var isBigCommerceIntegrationEnabled = map.bigcommerce_integration;
					var bigCommerceStore = map.bigcommerce_stores;

					// Update progress bar
					progress += 10;
					$this.label = 'Preparing individual product data';
					$this.setProgress(progress);

					// Append all the Product Family fields to each Product
					$.each(products, function(index, entry) {
						// Only append fields that don't already exists (i.e. DO NOT OVERWRITE!)
						$.each(map, function(key, val) {
							if( !map.products[index][key] )
								map.products[index][key] = val;
						});
					});

					// Clone the Products to an expendable list
					products = $.extend({}, map.products);
					//console.log(products);
					console.log("Product Data:");
					console.log({ products });
					// Update progress bar
					progress += 10;
					$this.setProgress(progress);
					var increment = (100 - progress) / (Object.keys(map.products).length + 1);

					$.each(bcProducts, function(key, val) {
						var prodData = val;
						delete prodData.products;
					});



					if( products && !jQuery.isEmptyObject(products) ) {
						// Attempt to POST each Product before POSTing the Product Family
						$.each(map.products, function(key, val) {
							// Update progress bar
							progress += increment;
							$this.setProgress(progress);

							// Cease processing, error occured
							if( !jQuery.isEmptyObject(errs) )
								return;

							// POST each Product
							inventory.postProduct(
								val,
								null,
								function(data) {
									var prodid = null;

									// If Product creation was successful then extract ID
									if(data && data.Products && data.Products.length > 0) {
										if( map.products[key] ) {
											prodid = map.products[key]["product-id"] = data.Products[0]["ID"];
											successes.push(prodid);
										}
									}

									// Remove the Product from the processing list once complete
									delete products[key];
									// All products have been POSTed to the Inventory system
									if( jQuery.isEmptyObject(products) ) {
										// Update progress bar
										progress += increment;
										$this.setProgress(progress);
										console.log("Posting Family");
										console.log(map);
										// Once all the products are in the Inventory system
										// POST the Product Family to encapsulate them all
										inventory.postProductFamily(
											map,
											null,
											function(data) {
												if (isBigCommerceIntegrationEnabled) {
													// POST Product to BigCommerce
													console.log("POSTING Product data to BC..");
													pct = new PCTInterface(env);
													// delete prodData.products;
													data = {
														"product" : bcProducts,
														"destination" : "bigcommerce",
														"source": "dear",
														"instance": bigCommerceStore
													}

													pct.postProduct(
														data,
														function(data) {

														},
														function(data) {
															console.log('success');
															console.log(data);
														},
														function(err) {
															console.log('error');
															console.error(err)
														},
														function(data) {
															console.log('success');
														}
													);
													console.log("POSTED Product data to BC..");
												}
												console.log(data);
												$('#product-tag-field').tagit("removeAll");
												lobibox_alert_success('Complete', 'All Products and Product Family have been created.');
											},
											function(err) {
												console.log(err);
												if( err && !jQuery.isEmptyObject(err) && err["contents"] && err["contents"].length > 0) {
													for(var i = 0; i < err.contents.length; ++i)
														errs.push(err.contents[i]);
												}
											},
											function(xhr) {
												// Complete the progress bar
												progress = 100;
												$this.setProgress(progress);
												$this.destroy();
												if( !jQuery.isEmptyObject(errs) && !erralert ) {
													erralert = true;
													var errlist = [];
													$.each(errs, function(i, e) {
														errlist.push(e);
													});
													undo_product_posts(
														successes,
														function() {
															errlist.slice(0).unshift(
																{
																	'INFO' : 	'Automatically rolled-back created Products;</br>'+
																				'In Dear, navigate to Inventory => Products => More => Delete Deprecated Products'
																}
															);
															lobibox_alert('Failed to create Products', errlist, lobibox_alert_error);
														},
														function() {
															errlist.slice(0).unshift(
																{
																	'INFO' : 	'Automatic Product rollback FAILED;</br>'+
																				'In Dear, manually navigate to Inventory and \'Deprecate\''
																}
															);
															lobibox_alert('Failed to create Products', errlist, lobibox_alert_error);
														}
													);

												}
											}
										);
									} else if( !prodid ) {
										// Complete the progress bar
										progress = 100;
										$this.setProgress(progress);
										$this.destroy();
										var errlist = [];
										$.each(errs, function(i, e) {
											errlist.push(e);
										});
										// Deactivate any sucessful product creations as cleanup
										undo_product_posts(
											successes,
											function() {
												errlist.slice(0).unshift(
													{

														'INFO' : 	'Unable to assign Product IDs to Product Family object</br>'+
																	'Automatically rolled-back created Products;</br>'+
																	'In Dear, navigate to Inventory => Products => More => Delete Deprecated Products'
													}
												);
												lobibox_alert('Failed to create Products', errlist, lobibox_alert_error);
											},
											function() {
												errlist.slice(0).unshift(
													{
														'INFO' : 	'Automatic Product rollback FAILED;</br>'+
																	'In Dear, manually navigate to Inventory and \'Deprecate\''
													}
												);
												lobibox_alert('Failed to create Products', errlist, lobibox_alert_error);
											}
										);
									}
								},
								function(err) {
									if( err && !jQuery.isEmptyObject(err) && err["contents"] && err["contents"].length > 0) {
										for(var i = 0; i < err.contents.length; ++i)
											errs.push(err.contents[i]);
									}

								},
								function(xhr) {
									if( !jQuery.isEmptyObject(errs) && !erralert ) {
										erralert = true;
										// Complete the progress bar
										progress = 100;
										$this.setProgress(progress);
										$this.destroy();
										var errlist = [];
										$.each(errs, function(i, e) {
											errlist.push(e);
										});
										// Deactivate any sucessful product creations as cleanup
										undo_product_posts(
											successes,
											function() {
												errlist.slice(0).unshift(
													{
														'INFO' : 	'Automatically rolled-back created Products;</br>'+
																	'In Dear, navigate to Inventory => Products => More => Delete Deprecated Products'
													}
												);
												lobibox_alert('Failed to create Products', errlist, lobibox_alert_error);
											},
											function() {
												errlist.slice(0).unshift(
													{
														'INFO' : 	'Automatic Product rollback FAILED;</br>'+
																	'In Dear, manually navigate to Inventory and \'Deprecate\''
													}
												);
												lobibox_alert('Failed to create Products', errlist, lobibox_alert_error);
											}
										);
									}
								}
							);



						});
					} else {
						// Complete the progress bar
						progress = 100;
						$this.setProgress(progress);
						$this.destroy();
						lobibox_alert_success('Complete', 'No Products to upload.');
					}
				}
			});
		}
	});

	$('.lobibox-progress').resize();
}

function undo_product_posts(
	ids,
	success_callback,
	error_callback
) {
	console.log(ids);
	if( ids === undefined || !$.isArray(ids)) {
		error_callback;
		return;
	}

	if( ids.length == 0 ) {
		success_callback();
	}

	$.each(ids, function(index, val) {
		inventory.deactivateProduct(
			val,
			null,
			success_callback,
			error_callback,
			null
		);
	});
}

/**
 *	Form MAPPING methods
 *
 */
function map_form_data(callback) {
	var map = {}
	var tags = [];

	var stock_type = "stock";

	// Loop through all elements tagged with data-mapping-id
	// to compile a mapping list
	$.each($('[data-mapping-id!=""][data-mapping-id]'), function() {
		var e = this;
		var val = ($(e).val() !== undefined && $(e).val() ? $(e).val() : null) || $(e).attr('value') || $(e).attr('data-default');
		var field = $(e).attr('data-mapping-id');
		
		var isCheckbox = $(e).attr('type') == 'checkbox';
		
		if(isCheckbox) {
            val = $(e).is(":checked") ? true : false;
        }

		// Map the value 1:1 or 1:n
		if(!map[field]) {
			map[field] = val;
		} else {
			if( !$.isArray(map[field]) ) {
				var old = map[field];
				map[field] = [];
				map[field].push(old);
			}

			map[field].push(val);
		}
	});

	// Add any elements with a data-tag to a Tag array
	tags = $('#product-tag-field').tagit('assignedTags');

	var group = "products";
	var products = [];

	// First instance creation
	if(!map[group])
		map[group] = {};

	// Group all product variants into a mapping group
	$.each($('[data-mapping-id="'+group+'"]'), function() {
		var product = {};
		var key = $(this).attr('data-variant-key');
		var variants = [];

		// Check key validity
		if( key && key !== undefined) {
			// First instance creation
			if(!map[group][key])
				map[group][key] = {};

			// Convert the JSON stored data mapping string to a JSON object
			var variants_tuple = $(this).attr('data-product-variants');
			variants_tuple = variants_tuple ? variants_tuple.unescapeSpecialXMLChars() : null;
			variants_tuple = JSON.parse((variants_tuple || {}));

			// Loop through all variant options stored in product wrapper
			$.each(variants_tuple, function(variant, val) {
				variant = 'product-variant-'+variant;
				map[group][key][variant] = val;
			})

			// Append all the product components
			$.each($('[data-mapping-id!="products"][data-variant-key="'+key+'"]'), function() {
				var e = this;

				var isDatepicker = $(e).data !== undefined && Object.prototype.toString.call($(e).data('datepicker')) === '[object Object]';
				var isCheckbox = $(e).attr('type') == 'checkbox';

				var field = $(e).attr('data-mapping-id');
				var val = $(e).attr('data-default');

				if( isDatepicker ) {
					var dates = $(e).data('datepicker').selectedDates;
					if( Object.prototype.toString.call(dates) === '[object Array]' ) {
						dates = Array.from(dates);
						if( dates.length > 0 ) {
							$.each(dates, function(i, el) {
								if( Object.prototype.toString.call(el) === '[object Date]' ) {
									dates[i] = el.getFullYear() + "-" + ("00"+(el.getMonth() + 1)).substr(-2,2) + "-" + ("00"+el.getDate()).substr(-2,2);
								}
							});
							val = dates[0];
						}
					}
				} else if(isCheckbox) {
				    console.log('checked');
				    val = ($(e).val() !== undefined ? $(e).is(":checked") : null) || $(e).attr('data-default');
				    console.log(val);
				} else {
					val = ($(e).val() !== undefined && $(e).val() ? $(e).val() : null) || $(e).attr('value') || $(e).attr('data-default');
				}

				// Convert to numeric
				val = $.isNumeric(val) ? Number(val) : val;

				// Check the value validity
				if( val && val !== undefined && field && field !== undefined) {
					if(!map[group][key][field]) {
						map[group][key][field] = val;
					} else {
						if( !$.isArray(map[group][key][field]) ) {
							var old = map[group][key][field];
							map[group][key][field] = [];
							map[group][key][field].push(old);
						}

						map[group][key][field].push(val);
					}
				}
			});
		}
	});

	// Returns the data to the callback
	if(isFunction(callback)) callback(map,tags);
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

function set_form_defaults() {
	$.each($('[id*="form"]'), function() {
		set_default(
			this,
			$(this).attr('data-mapping-id'),
			$('#form-department').val(),
			$('#form-product-brand').val(),
			$('#form-tier-1').val()
		);

	});
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


function hscode_validation ( id ) {
	if ( id !== undefined ) {
		if ( $(id).val() > '' && $(id).val().length >= 6 ) {
			toggleValid(id, true);
		} else {
			toggleValid(id, false);
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