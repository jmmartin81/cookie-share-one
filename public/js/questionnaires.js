$(document).ready(function () {
	var $itemContainer = $('#questionnaireItemContainer');
	var $selectContainer = $('#questionnaireSelectContainer');
	var $scheduleContainer = $('#questionnaireLearnerScheduleContainer');

	var $selectTemplate = Handlebars.compile($('#questionnaire-template-select').html());
	var $itemTemplate = Handlebars.compile($('#questionnaire-template-item').html());
	var $emptyTemplate = Handlebars.compile($('#questionnaire-template-empty').html());

	var $scheduleTemplate = Handlebars.compile($('#questionnaire-schedule-template-table').html());
	var $scheduleNewItemTemplate = Handlebars.compile($('#questionnaire-schedule-template-new-item').html());
	var $scheduleItemTemplate = Handlebars.compile($('#questionnaire-schedule-template-item').html());

	$scheduleContainer.append($scheduleTemplate);

	/**
	* This logic responds to request to schedule a new questionnaire
	* for a given learner.
	*/
	$('#btnScheduleNewQuestionnaire').click(function () {
		loadAllQuestionnairesForSelection();

		$('#questionnaireScheduleTableItems').append($scheduleNewItemTemplate);
		$('#btnScheduleNewQuestionnaire').hide();

		$('#btnMoveForm').click(function () {
			const value = $('#allQuestionnairesSelection').val();
			if (value.length > 0) {
				updateLearnerScheduledQuestionnaires(value);
			}
		});
	});

	/**
	* Load ALL possible questionnaires that this learner can take.
	* This currently spreads freely across accounts.
	* i.e. questionnaires are not account specific.
	*/
	function loadAllQuestionnairesForSelection() {
		$('#newItemRow').remove();
		$.ajax({
			url: `/dashboard/questionnaires`,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success: function (questionnaires) {
				if (questionnaires.length > 0) {
					questionnaires.forEach(item => {
						let questionnaireOption = `<option value="${item._id}">${item.name}</option>`;
						$('#allQuestionnairesSelection').append(questionnaireOption);
					});
				} else {
					alert('No questionnaires are available to schedule.');
					$('#newItemRow').remove();
				}
			},
			error: function (response, statusText) {
				alert('No questionnaires are available to schedule.');
				$('#newItemRow').remove();
			},
		});
	}

	/**
	* Schedule a new questionnaire for this learner
	* @param {String} newQuestionnaireId
	*/
	function updateLearnerScheduledQuestionnaires(newQuestionnaireId) {
		var learnerId = $('#learnerId').val();
		if (!learnerId) return;
		$.ajax({
			url: `/api/learner/${learnerId}/scheduleFlow/assessment:${newQuestionnaireId}`,
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			success: function (response) {
				window.location.reload(true);
			},
			error: function (response, statusText) {
				alert('Unable to move the learner to this questionnaire.');
			},
		});
	}

	/**
	* Load questionnaires that are scheduled for this learner,
	* at the learner level.
	*/
	function loadScheduledQuestionnaires() {
		var learnerId = $('#learnerId').val();
		if (!learnerId) return;
		$.ajax({
			url: '/dashboard/questionnaires/' + learnerId + '/scheduled',
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success: function (questionnaires) {
				if (questionnaires.length > 0) {
					$('#questionnaireScheduleTableItems').empty();
					questionnaires.forEach(item => {
						var itemHtml = $scheduleItemTemplate(item);
						$('#questionnaireScheduleTableItems').append(itemHtml);
					});
				}
			}
		});
	}

	/**
	* Get learner responses for a specific questionnaire.
	* @param {String} learnerId
	* @param {String} questionnaireId
	*/
	function updateItems(learnerId, questionnaireId) {
		$itemContainer.empty();
		$.ajax({
			url: `/dashboard/questionnaires/${learnerId}/questionnaire/${questionnaireId}`,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success: function (formSubmission) {
				let messages = formSubmission.messages || [];
				if (messages.length > 0) {
					messages.forEach(msg => {
						var itemHtml = $itemTemplate(msg);
						$itemContainer.append(itemHtml);
					});
				} else {
					$itemContainer.append($emptyTemplate());
				}
			},
			error: function (response, statusText) {
				$itemContainer.empty();
				$itemContainer.append($emptyTemplate());
			},
		});
	}

	/**
	* Load questionnaires that this learner has taken
	*/
	function loadQuestionnaires() {
		var learnerId = $('#learnerId').val();
		$selectContainer.empty();
		$selectContainer.append($selectTemplate());
		$.ajax({
			url: '/dashboard/questionnaires/' + learnerId,
			method: 'GET',
			dataType: 'json',
			contentType: 'application/json',
			success: function (questionnaires) {
				if (questionnaires.length > 0) {
					const timezone = $('#userTimezone').val()
					const abbr = moment.tz(timezone).zoneAbbr().match(/^[+/-]/) ? 'GMT' : moment.tz(timezone).zoneAbbr()
					questionnaires.forEach(formSubmission => {
						// questionnaireOption += '<option value="' + questionnaires[i]._id + '">' + questionnaires[i].name + " (" + moment(questionnaires[i].answerDate).format("MMM Do YYYY") +")</option>"; 
						let questionnaireOption = `<option value="${formSubmission._id}">${formSubmission.name} - Created: ${moment(formSubmission.createdAt).tz(timezone).format(`ddd MMM Do YYYY hh:mm:ss a [${abbr}]ZZ`)}</option>`;
						$('#questionnairesSelection').append(questionnaireOption);
					});
					$('#questionnairesSelection').change(function () {
						updateItems(learnerId, $(this).val());
					});
					if (questionnaires.length > 0) {
						updateItems(learnerId, questionnaires[0]._id);
					}
				} else {
					$selectContainer.empty();
					$selectContainer.append($emptyTemplate());
				}
			},
			error: function (response, statusText) {
				$('#questionnairesSelection').empty();
			},
		});
	}

	loadScheduledQuestionnaires();
	loadQuestionnaires();
});
