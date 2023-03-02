/**
 * Created by Mario Rodriguez on 28/02/2022.
 */
$(function () {
	var name, id, $modal;
	$modal = $('#clone_account_dialog');

	$(document).on('click', '.cloneAccountButton', function (event) {
		name = $(this).data('name');
		id = $(this).data('id');
		$modal.modal({
			backdrop: 'static',
		});
	});
	
	$modal.on('show.bs.modal', function (event) {
		$('#accountName').val('');
		$modal.find('#alertSection').remove();
		$modal.find('#sourceAccountName').html(name);
		$modal.find('#sourceAccountId').html('id: ' + id);
	});

	$modal.on('shown.bs.modal', function (event) {
		$modal.find('#accountName').focus();
	});

	$modal.find('#cloneAccountBtn').click(function () {
		
		if (!validateFields()) {
			return;
		};
		
		$modal.find('#alertSection').remove();
		
		$.ajax({
			url: '/api/account/' + id + '/clone',
			method: 'POST',
			data: {
				name: $('#accountName').val(),
				pincode: $('#pincode').val(),
			},
			success: function (response) {
				window.location.href = '/dashboard/account/' + response.accountId
			},
			error: function (response, statusText) {
				var errorMessage = 'There was an error trying to clone the account';
				if (_.get(response, 'responseJSON.message')) {
					if (response.responseJSON.message.includes('pincode')) {
						errorMessage = 'The PIN code already exists. Choose another one.'
					} else {
						errorMessage = response.responseJSON.message;
					}
				}
				var $template = $($('#alertSectionTemplate').html());
				$template.find('#errorList').append('<li>' + errorMessage + '</li>');
				
				$modal.find('#alertContainer').append($template);
				$template.show();
			},
		})
	});
	
	
	function validateFields () {
		var errorFound = false;
		var $accountName = $('#accountName');
		if (_.isEmpty($accountName.val())) {
			$accountName.notify('Name cannot be empty', {
				className: 'error',
				autoHide: false,
			});
			errorFound = true;
		}
		
		return !errorFound;
	}
});
