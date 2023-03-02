$(function () {
	const $modal = $('#change_phoneNumber_dialog');
	const $newPhoneNumberEl = $('#newPhoneNumber');
	const $formattedPhoneNumberEl = $('#formattedPhoneNumber');
	const learnerId = $('#learnerId').val();
	const currentPhone = $('#currentPhone').val();
	const $changePhoneNumberBtnEl = $('#changePhoneNumberBtn');
	$(document).on('click', '#changePhoneNumber', function (event) {
		event.preventDefault()
		$modal.modal({
			backdrop: 'static',
		});
	});

	$(document).on('keyup','#newPhoneNumber', function(e) {
		console.log(e.keyCode);
		const userInput = $(this).val();
		let isValid = false;
		if (userInput) {
			const asYouTypeHelper = new libphonenumber.AsYouType('US').input(userInput);
			isValid = validatePhoneNumber(userInput)
			$formattedPhoneNumberEl.html(`▶︎ ${asYouTypeHelper} ${isValid ? '✅ ' :  '🛑'}`);
		} else {
			$formattedPhoneNumberEl.html('');
		}
		
		if (!isValid) 
			$changePhoneNumberBtnEl.addClass('disabled'); 
		else 
			$changePhoneNumberBtnEl.removeClass('disabled'); 
		
	})
	
	$modal.on('show.bs.modal', function (event) {
		$('#newPhoneNumber').val('');
		$modal.find('#alertSection').remove();
		$newPhoneNumberEl.focus();
		$formattedPhoneNumberEl.html('');
	});

	$modal.find('#changePhoneNumberBtn').click(function () {
		
		if (!validateFields()) {
			return;
		};
		
		const parsedPhoneNumber = libphonenumber.parsePhoneNumber($newPhoneNumberEl.val(), 'US');
		$modal.find('#alertSection').remove();
		
		//const $celledToken = `Bearer ${locals.jwt}`;
		
		const $celledToken = `Bearer ${localStorage.getItem('celled-lms-jwt')}`;
		// prevent user from double clicking
		$changePhoneNumberBtnEl.addClass('disabled').text('Changing...');
		$.ajax({
			url: `${window.$global.LEARNER_API_ENDPOINT}/function/services-learner-api/learner/${learnerId}/changePhoneNumber`,
			method: 'POST',
			data: {
				learnerId: learnerId,
				newPhoneNumber: parsedPhoneNumber.number
 			},
			 headers: {
				Authorization: $celledToken,
				'x-source': 'lms.learner'
			},
			success: function (response) {
				location.reload();
			},
			error: function (response, statusText) {
				$changePhoneNumberBtnEl.removeClass('disabled').text('Change Phone');
				var errorMessage = 'There was an error trying to change the learner\'s phone number';
				try {
					if (response && response.responseText) {
						const errorObject = JSON.parse(response.responseText);
						if (errorObject && errorObject.message) 
							errorMessage = errorObject.message
					}
				} catch (err) {

				} finally {
					var $template = $($('#alertSectionTemplate').html());
					$template.find('#errorList').append('<li>' + errorMessage + '</li>');
					
					$modal.find('#alertContainer').append($template);
					$template.show();
				}
				
			},
		})
	});
	
	
	function validateFields () {
		let newPhoneNumberVal = $newPhoneNumberEl.val();

		// new libphonenumber.AsYouType('US').input('213-373-4253');
		var errorFound = false;
		if (_.isEmpty(newPhoneNumberVal)) {
			$newPhoneNumberEl.notify('Phone number cannot be empty', {
				className: 'error',
				autoHide: false,
			});
			errorFound = true;
		} else {
			if (!validatePhoneNumber(newPhoneNumberVal)){
				$newPhoneNumberEl.notify('Invalid Phone Number format', {
					className: 'error',
					autoHide: false,
				});
				errorFound = true;
	
			}
		}
		
		return !errorFound;
	}

	/**
	 * Validates that phoneNumber is a valid E.164-formatted phone number
	 * @param {string} phoneNumber 
	 * @returns true if valid, false otherwise
	 */
	function validatePhoneNumber(phoneNumber) {
		// we check twice, in the 1st case we assume no country and that the user entered a valid E.164-formatted phone.
		// in the 2nd case we 'help' the library by defaulting to US
		return libphonenumber.isValidPhoneNumber(phoneNumber) || libphonenumber.isValidPhoneNumber(phoneNumber, 'US');
	}
});
