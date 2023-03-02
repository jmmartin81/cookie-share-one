function bindRowDeleteButton ($table, deleteUrl, elementType, goToUrl) {
	$table.find('tr td.actions .btn-delete').each(function (index) {
		var $this = $(this);
		var $row = $this.parents('tr');
		var name = $row.find('a.name').text();
		bindDeleteButton($this, deleteUrl, elementType, name, $row, goToUrl);
	});
}

function bindLearnerDeleteButton($button, deleteUrl, elementType, goToUrl) {
	if ($button.hasClass('btn-delete')) bindDeleteButton($button, deleteUrl, elementType, undefined, undefined, goToUrl);
}

function bindDeleteButton($button, deleteUrl, elementType, elementName, $elementToRemove, goToUrl) {
	$button.click(function (event) {
		var $this = $(this);
		var elementId = $this.data('id');
		var phone = $this.data('phone');
		var deleteMessage = buildDeleteMessage(elementType, elementName);		
		
		if (window.confirm(deleteMessage)) {
			innerDelete();
		}

		function innerDelete () {
			if (elementId.charAt(0) === '"') {
				elementId = elementId.replace(/"/g, '');
			}
			$.ajax({
				method: 'DELETE',
				url: deleteUrl + elementId,
				success: function (data, statusText) {
					console.log(data);
					$.notify(_.capitalize(elementType) + ' deleted', 'success');
					// hack: Only display an alert when deleting learners
					// TODO: 💀💀 Get rid of this ASAP
					// WARNING: ⚠️ Only read this code once. Reading it more than once may lead
					// to brain damage
					if (elementType === 'learner') {
						alert(`\t\t\tOperation Summary:\n
							courseAttendances: ${data.response.courseAttendances ? data.response.courseAttendances : ''}
							usageTracks: ${data.response.usageTracks ? data.response.usageTracks : ''}
							callTracks: ${data.response.callTracks ? data.response.callTracks : ''}
							Messages: ${data.response.messages ? data.response.messages : ''}`);
					}
					// winInfo();
					if (typeof $elementToRemove !== 'undefined') $elementToRemove.remove();
					if (typeof goToUrl !== 'undefined') window.location.replace(goToUrl);
				},
				error: function (data, statusText) {
					var message = 'There was an error trying to delete the ' + elementType;
					if (_.isObject(data) && data.responseJSON) {
						message = data.responseJSON.message;
					}
					$.notify(message || '', 'error');
				},
			});
		}

		function buildDeleteMessage (elementType, name) {
			var deleteMessage = 'Are you sure you want to delete the ' + elementType + ':\nID ' + elementType + ': ' + elementId + '\nPhone Number: ' + phone;
			if (typeof name !== 'undefined') deleteMessage += ' with name: "' + name + '"';
			deleteMessage += '?';
			
			return deleteMessage;
		}

		return false;
	});
}
