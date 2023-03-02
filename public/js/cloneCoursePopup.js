/**
 * Created by mamana on 5/5/16.
 */
$(function () {
	var name, id, $modal;
	$modal = $('#clone_course_dialog');

	$(document).on('click', '.cloneCourseButton', function (event) {
		name = $(this).data('name');
		id = $(this).data('id');
		$modal.modal({
			backdrop: 'static',
		});
	});
	
	$modal.on('show.bs.modal', function (event) {
		$('#courseName').val('');
		$modal.find('#alertSection').remove();
		$modal.find('#sourceCourseName').html(name);
		$modal.find('#sourceCourseId').html('id: ' + id);
	});

	$modal.on('shown.bs.modal', function (event) {
		$modal.find('#courseName').focus();
	});

	$modal.find('#cloneCourseBtn').click(function () {
		
		if (!validateFields()) {
			return;
		};
		
		$modal.find('#alertSection').remove();
		
		$.ajax({
			url: '/api/course/' + id + '/clone',
			method: 'POST',
			data: {
				name: $('#courseName').val(),
				// ,suffixStr: " (" + parseInt(Math.random()*10000) + ")" //For test only
 			},
			success: function (response) {
				window.location.href = '/dashboard/course/' + response.courseId
			},
			error: function (response, statusText) {
				var errorMessage = 'There was an error trying to clone the course';
				if (_.get(response, 'responseJSON.message')) {
					errorMessage = response.responseJSON.message;
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
		var $courseName = $('#courseName');
		if (_.isEmpty($courseName.val())) {
			$courseName.notify('Name cannot be empty', {
				className: 'error',
				autoHide: false,
			});
			errorFound = true;
		}
		
		return !errorFound;
	}
});
