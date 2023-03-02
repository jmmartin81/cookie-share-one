/**
 * Created by mamana on 4/23/16.
 */
var FileUploader = function (triggerSelector, successCallback, acceptFiles) {
	var modalClone = $('<div>').append($('#upload_file_dialog').clone()).html();
	var $modal = $(modalClone);
	$modal.attr('id', 'id_for_' + parseInt(Math.random() * 10000));
	
	if (acceptFiles) {
		$modal.find("input[type='file']").prop('accept', acceptFiles);
	}
	
	$('body').append($modal);

	var $form = $modal.find('form#upload_file_form');
	var $file = $form.find('#file_upload');
	var $buttons = $modal.find("input[type='button'], button");
	var $progresBar = $modal.find('.progress-bar');
	var $label = $modal.find('.onCompete');
	var $alertSection = $form.find('#alertSection');
	var $errorList = $alertSection.find('#errorList');

	if (!_.isFunction(successCallback)) {
		successCallback = function () {};
	}
	function setup () {
		$(triggerSelector).click(function () {
			$modal.modal({
				backdrop: 'static',
			});
			$file.trigger('click');
			return false; // Prevent buttons from submiting the form
		});

		$modal.on('hidden.bs.modal', function (event) {
			$form[0].reset();
			$progresBar.css('width', '0%');
			$progresBar.parent().hide();
			$progresBar.removeClass('progress-bar-success');
			$alertSection.hide();
			$errorList.html('');
			$label.hide();
		});
	
		$file.change(function () {
			if ($file.val() != '') {
				$('#fileUploadSubmitBtn', $modal).click();
			}

		});
		
		$('#fileUploadSubmitBtn', $modal).click(function () {

			if ($file.val() == '') {
				$file.notify('Please pick a file!');
				return false;
			}

			$buttons.prop('disabled', true);
			$progresBar.parent().show();
			$alertSection.hide();
			$errorList.html('');
			
			$form.ajaxSubmit({
				success: function (data, statusText, xhr) {
					if (_.size(data.validationErrors) > 0) {
						_.forEach(data.validationErrors, function (elem) {
							$errorList.append($('<li/>').append(elem));
						});
						$alertSection.show().alert();
						$progresBar.css('width', '0%');
					} else {
						successCallback(data.savedFiles);
						$modal.modal('hide');
					}
					$buttons.prop('disabled', false);
				},
				error: function (response, statusText) {
					alert('Error happened!\n ' + JSON.stringify(response, null, 2));
					$buttons.prop('disabled', false);
				},
				uploadProgress: function (event, position, total, percent) {
					$progresBar.css('width', percent + '%');
					if (percent == 100) {
						$progresBar.addClass('progress-bar-success');
						$label.show();
					}
				},

			});

			return false;
		})
	}


	var ret = {

	};
	setup();
	return ret;
};

function escapeSelector (s) {
	return s.replace(/(:|\.|\[|\])/g, '\\$1');
}

// acceptFiles are accepted file extensions
function bindFileUploader (propertyName, acceptFiles) {
	var $el = $('.form-group.' + escapeSelector(propertyName)),
		$uploadBtn = $el.find('.btn.upload');

	var template = $('#audiofileEntryTemplate').html();

	new FileUploader($uploadBtn, function (data) {
		var file = data[0];
		var $list = $(template); 
		$el.find('input[name=\'' + propertyName + '\']').val(file.id);
		$list.find('a').attr('href', 'https:' + file.url + '?rnd=' + Math.random()).html(file.originalname);
		$el.find('.duration').html(file.duration);
		$el.find('.form-control.filename').html('').append($list).effect('highlight', {}, 3000);
		setupAudioPlayer();
	}, acceptFiles);
}

function multipleFileUploadBinder (propertyName, acceptFiles) {
	var triggerSelector = '#' + propertyName + 'Btn';
	var destinationList = '#' + propertyName + 'List';

	var uploader = new FileUploader(triggerSelector, function (data) {
		var $template = $('#fileEntryTemplate').html();
		var $list = $(destinationList);
		_.forEach(data, function (file) {
			var $li = $($template);
			$li.attr('id', file.id);
			$li.find('.entryContent a').attr('href', 'https:' + file.url + '?rnd=' + Math.random()).html(file.originalname);
			$li.find('.input-group-addon.index').html($list.find('li.audioEntry').length + 1);
			$li.find('.duration').html(file.duration);
			$list.append($li);
			setupAudioPlayer(); // This is a global function to make the item playable
			$li.find('.entryContent').effect('highlight', {}, 3000);
		})
	}, acceptFiles);
}


$(function () {
	$('ul.sortable.files, ol.sortable.files').sortable({
		nested: false,
		handle: '.input-group-addon.index',
		placeholder: "<li class='placeholder'><div class='form-control'></div></li>",
		onDrop: function ($item, container, _super, event) {
			_super($item, container, _super, event);

			var parent = $item.parent();

			$('.input-group-addon.index', parent).each(function (idx, elem) {
				$(elem).html(idx + 1);
			});

			return true;
		},
	});
});

$(function () {
	$('.sortable.files').on('click', 'span.fileEntry.delete', function (event) {
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
	$('.input-group.file').on('click', '.delete.single', function (event) {
		if (window.confirm('Are you sure?')) {
			var $parent = $(this).parents('.input-group.file:eq(0)');

			$parent.find("input[type='hidden']").val('');
			$parent.find('.duration').html('00:00.0');
			$parent.find('.form-control.filename').html('<span class="lightText"><i class="fa fa-arrow-left"></i>&nbsp; Click to upload!</span>');
			
		}
		return false;
	});
});
