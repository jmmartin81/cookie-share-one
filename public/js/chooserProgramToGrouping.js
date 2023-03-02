
var ChooserProgramToGrouping = function (triggerElement, programs, successCallback) {
	var modalClone = $('<div>').append($('#chooser_program_to_grouping_dialog').clone()).html();
	var $modal = $(modalClone);
	$modal.attr('id', 'id_for_' + parseInt(Math.random() * 10000));

	$('body').append($modal);

	var $input = $modal.find('#programName');

	var $submitBtn = $modal.find('#chooseProgramToGroupingBtn');

	var selectedProgram = null;

	var $clearInputButton = $('.clearInputButton', $modal);
	
	function setup (programs) {

		_.forEach(programs, function (program) {
				$input.append($('<option>', {
					value: program._id,
					text: program.name
				}));
			});
		
		$(triggerElement).click(function (event) {
			$modal.modal({
				backdrop: 'static',
			});
		});

		$input.on('change', function() {
			$submitBtn.prop('disabled', this.value ? false : true);
			selectedProgram = _.find(programs, ['_id', this.value]);
		});

		$submitBtn.click(function () {
			successCallback(selectedProgram);
			$clearInputButton.click();
			$modal.modal('hide');
		});

		$modal.on('show.bs.modal', function (event) {
			$clearInputButton.click();
			$submitBtn.prop('disabled', true);
		});
		
	}

	setup(programs);
};


function bindChooserProgramToGrouping (propertyName, programs) {
	
	var $el = $('.form-group.' + propertyName);
	
	var $btn = $el.find('.btn.addProgramBtn');

	var template = $('#programEntryTemplate').html();

	new ChooserProgramToGrouping($btn, programs, function (data) {
			var $newEntry = $(template);
			$newEntry.find('input[name="fieldname"]').val(data._id).attr('name', propertyName).data('type', 'program');
			$newEntry.find('span.name').html(data.name);
			$newEntry.find('type').html('program');
			$el.find('ol.courseGroupingList').append($newEntry);
			$newEntry.find('.form-control').effect('highlight', {}, 3000);
	});
}

$(function () {
	$('.courseGroupingList').on('click', 'button.program.delete', function (event) {
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