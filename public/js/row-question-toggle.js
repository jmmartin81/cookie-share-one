function bindToggleQuestionstate($table, selector, enableQuestionUrl){
	$table.find(selector).change(function(){
		var $this = $(this);
		var dataValue = $this.val();
		var $status = $this.prop('checked') ? true: false;

		changeQuestionState();

		function changeQuestionState(){

			// :customQuestionId/enabled-or-disable
			$('#console-event').html('Toggle: ' + $status + "<--->"+dataValue)

			var data = {
				questionId: dataValue,
				status: $status
			};

			$.ajax({
				method: 'POST',
				url: enableQuestionUrl + dataValue,
				data:data,
				success: function (data) {
					$.notify(_.capitalize('custom question') + ' updated', 'success');
				},
				error: function (data, statusText) {
					var message = 'There was an error trying to update the global question';
					if (_.isObject(data) && data.responseJSON) {
						message = data.responseJSON.message;
					}
					$.notify(message || '', 'error');
				}
				
			});

		}


		return false;

	});
}



