$(document).ready(() => {
	// The visible button 😎
	const $uploadCourseBtn = $('#uploadCourseBtn');
	// The actual worker 💪
	const $fileChooserInput = $('#fileChooserInput');
	// the form
	const $uploadCourseForm = $('#uploadCourseForm');

	// the table with the list of courses
	const $courseListEl = $('#courseList');
	const $notificationsEl = $(Handlebars.compile($('#courseUploadStatusContainerTemplate').html())());
	$notificationsEl.addClass('hidden');
	const $dismissBtnEl = $notificationsEl.find('button.dismiss');
	$dismissBtnEl.on('click', function(e) { 
		$notificationsEl.addClass('dismissed'); 
	});
	$notificationsEl.on('click', function(e) { 
		if ($notificationsEl.hasClass('dismissed')) {
			$notificationsEl.removeClass('dismissed'); 
		}
	});

	$courseListEl.before($notificationsEl);
	 
	const $courseUploadStatusTemplate = Handlebars.compile($('#courseUploadStatusTemplate').html());

	$uploadCourseBtn.on('click', function() { 
		$fileChooserInput.val('');
		$fileChooserInput.click(); return false; 
	});

	$fileChooserInput.on('change', function() {
		const selectedFiles = this.files;
		handleFiles(selectedFiles);

	});

	/**
	 * 
	 * @param {[Files]} files 
	 */
	function handleFiles(files) {
		if (files.length > 1) {
			alert('Only one zip file is allowed');
			return;
		} 

		// the zip file
		// const zipFile = files[0];
		const UPLOAD_EVENT_ID = 0;
		$uploadCourseForm.ajaxSubmit({
			clearForm: true,
			success: function (data, statusText, xhr) {
				if (_.size(data.validationErrors) > 0) {
					let validationMsg = '';
					data.validationErrors.forEach(validation => { validationMsg += `\n${validation}` });
					alert(validationMsg);
				} else {
					console.log('Successfully uploaded the file');
				}
				$uploadCourseBtn.prop('disabled', false);
				clearNotification(UPLOAD_EVENT_ID);
			},
			error: function (response, statusText) {
				alert('Error happened!\n ' + JSON.stringify(response, null, 2));
				$uploadCourseBtn.prop('disabled', false);
				clearNotification(UPLOAD_EVENT_ID);
			},
			uploadProgress: function (event, position, total, percent) {
				updateNotifications({ isUploadingZip: true, uploadedLessons: position, totalLessons: total, progress: percent, courseId: UPLOAD_EVENT_ID });
			},

		});
	}


	/**
	 * 
	 */
	const $containerEl = $('.container.mainbg');
	$containerEl.on('dragenter', function (e) {
		e.preventDefault();
	});

	$containerEl.on('dragover', function (e) {
		e.preventDefault();
	});

	$containerEl.on('dragdrop', function (e) {
		e.preventDefault();
		const dragOpResult = e.dataTransfer;
		const files = dragOpResult.files;

		handleFiles(files)
	});

	// /////////////////////////////////////////////////////
	// E V E N T   S O U R C I N G   -   SSE
	// /////////////////////////////////////////////////////
	function updateNotifications(data) {
		$notificationsEl.removeClass('hidden');
		// if there's already a container then remove it first. We will recreate it with Handlebars 
		let notificationEl = $notificationsEl.find(`[data-courseId="${data.courseId}"]`);
		if (notificationEl) {
			notificationEl.remove();
		}
		data.progress = Math.round((data.uploadedLessons / data.totalLessons) * 100);
		if (isNaN(data.progress)) {
			data.progress = '0'
		}
		// the updated / new container with the new data
		notificationEl = $($courseUploadStatusTemplate(data));
		$notificationsEl.append(notificationEl);

	}

	function clearNotification(eventId) {
		$notificationsEl.find(`[data-courseId="${eventId}"]`).remove();
		
	}

	const courseEventsSource = new EventSource('/dashboard/courses/sse');
	
	courseEventsSource.addEventListener('onCourseUploadProgress', function(event) {
		try {
			console.log(event.data);
			const dataJson = JSON.parse(event.data);
			updateNotifications(dataJson);
		} catch (error) {
			 console.error(`error while processing server-side notifications`, error);
		}
	});

	courseEventsSource.addEventListener('ping', function(event) {
		try {
			console.log(event.data);
		} catch (error) {
			 console.error(`error while processing server-side notifications`, error);
		}
	});

	courseEventsSource.onerror = (err) => {
		console.error(`Error reading events from the server`, err);
	}

});
