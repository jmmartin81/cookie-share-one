
var ChooserCourseToGrouping = function (triggerElement, courses, successCallback) {

	var modalClone = $('<div>').append($('#chooser_course_to_grouping_dialog').clone()).html();

	var $modal = $(modalClone);

	$modal.attr('id', 'id_for_' + parseInt(Math.random() * 10000));

	$('body').append($modal);

	var $input = $modal.find('#courseName');

	var $submitBtn = $modal.find('#chooseCourseToGroupingBtn');

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


function bindChooserCourseToGrouping (propertyName, courses) {
	
	var $el = $('.form-group.' + propertyName);
	
	var $btn = $el.find('.btn.addCourseBtn');

	var template = $('#courseEntryTemplate').html();
	
	new ChooserCourseToGrouping($btn, courses, function (data) {
			var $newEntry = $(template);
			$newEntry.find('input[name="fieldname"]').val(data._id).attr('name', propertyName).data('type', 'course');;
			$newEntry.find('span.name').html(data.name);
			$newEntry.find('code.id').html(data._id);
			$newEntry.find('type').html('course');
			$el.find('ol.courseGroupingList').append($newEntry);
			$newEntry.find('.form-control').effect('highlight', {}, 3000);
	});
}

$(function () {
	$('.courseGroupingList').on('click', 'button.course.delete', function (event) {
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


