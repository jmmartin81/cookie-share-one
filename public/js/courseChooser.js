
var CourseChooser = function (triggerElement, courses, successCallback) {
	var modalClone = $('<div>').append($('#course_chooser_dialog').clone()).html();
	var $modal = $(modalClone);
	$modal.attr('id', 'id_for_' + parseInt(Math.random() * 10000));

	$('body').append($modal);

	var $input = $modal.find('#courseName');
	var $typeAheadContainer = $modal.find('.input-group.typeaheadContainer');

	var $submitBtn = $modal.find('#chooseCourseBtn');

	var selectedCourse = null;
	var $clearInputButton = $('.clearInputButton', $modal);
	
	function setup (courses) {

		_.forEach(courses, function (course) {
	
				$input.append($('<option>', {
					value: course._id,
					text: course.name
				}));
				
			});
		
		$(triggerElement).click(function (event) {
			$modal.modal({
				backdrop: 'static',
			});
		});

		$input.on('change', function() {
			$submitBtn.prop('disabled', this.value ? false : true);
			selectedCourse = _.find(courses, ['_id', this.value]);
		});

		$submitBtn.click(function () {
			successCallback(selectedCourse);
			$clearInputButton.click();
			$modal.modal('hide');
		});

		$modal.on('show.bs.modal', function (event) {
			$clearInputButton.click();
			$submitBtn.prop('disabled', true);
		});
		
	}

	setup(courses);
};


function bindCourseChooser (propertyName, courses) {
	
	var $el = $('.form-group.' + propertyName);
	
	if(propertyName=='copy') 
	var $btn = $el.find('.btn.copyLessonsBtn');
	else {
		var $btn = $el.find('.btn.addCourseBtn');
		var template = $('#courseEntryTemplate').html();
	}

	new CourseChooser($btn, courses, function (data) {
		
		if(propertyName=='copy'){
			
			var checkboxes = $('input[name=lessonsCheckbox]:checked');
			
			var lessonIds = $.map(checkboxes, function(checkbox) {
				return checkbox.value
			});
			
			$.ajax({
				url: '/dashboard/course/' + data._id + '/copy-lessons',
				method: 'POST',
				data: {
					lessons: lessonIds
				},
				success: function (response) {
					console.log('Successfully copied the lesson(s) to the course.')
				},
				error: function (response, statusText) {
					console.log('error');
					var errorMessage = 'There was an error trying to clone the course';
					if (_.get(response, 'responseJSON.message')) {
						errorMessage = response.responseJSON.message;
					}
				}
			})
		}
		else {
			var $newEntry = $(template);
			$newEntry.find('input[name="fieldname"]').val(data._id).attr('name', propertyName);
			$newEntry.find('span.name').html(data.name);
			$newEntry.find('code.id').html(data._id);
			$el.find('ol.courses').append($newEntry);
			$newEntry.find('.form-control').effect('highlight', {}, 3000);
		}
	});
}

$(function () {
	$('.courses').on('click', 'button.courseEntry.delete', function (event) {
		if (window.confirm('Are you sure?')) {
			var $li = $(this).parents('li:eq(0)');
			var parent = $li.parents('.sortable.files:eq(0)');
			$li.remove();

			$('.input-group-addon.index', parent).each(function (idx, elem) {
				$(elem).html(idx + 1);
			});
		}
		return false;
	});
});


