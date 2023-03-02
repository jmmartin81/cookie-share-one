$(document).ready(function () {

	var $itemTemplate = Handlebars.compile($('#schedule-template-item').html());
	var $inputTemplate = Handlebars.compile($('#schedule-template-input').html());

	var $tableContainer = $('#scheduleTableContainer');
	var $table = Handlebars.compile($('#schedule-template-table').html());
	$tableContainer.append($table);
	var schedules = [];

	const loadForm = () => {
		if ($('#schedule').val()) {
			schedules = [];
			var array = JSON.parse($('#schedule').val());
			_.each(array, (schedule) => {
				schedules.push({ ...schedule, internalId: uuidv4() });
			});
			updateForm();
		}
	}

	const updateForm = () =>
		$('#schedule').val(JSON.stringify(schedules.map(sch => {
			const { internalId, ...rest } = sch
			return rest
		})))

	const enabledDisabledActionTools = isDisabled => _.each(schedules, schedule => {
		$(`#editSchedule${schedule.internalId}`).attr('disabled', isDisabled)
		$(`#deleteSchedule${schedule.internalId}`).attr('disabled', isDisabled)
	})

	const addItem = (id, schedule, isNew) => {
		var itemHtml = $itemTemplate({ id: id, questionnaire: schedule.questionnaire.name, displayOnApp: schedule.displayOnApp, executionValue: schedule.executionValue, executionPolicy: schedule.executionPolicy, repeatPolicy: schedule.repeatPolicy });
		if (isNew) {
			$('#scheduleContainer').append(itemHtml)
		} else {
			$(`#scheduleContainer tr[id="scheduleInput"]`).replaceWith(itemHtml)
		}

		$('#deleteSchedule' + id).click(function (e) {
			e.preventDefault();
			$(`#scheduleContainer tr[id="scheduleItem${id}"]`).remove()
			$('#schedule').val(JSON.stringify(schedules.map(sch => {
				const { internalId, ...rest } = sch
				if (internalId !== id) return rest
				return null
			}).filter(sch => sch !== null)))
			schedules = schedules.filter(sch => sch.internalId !== id)
			$.notify('Save the account in order for changes to reflect.', 'info');
		});

		$('#editSchedule' + id).click(function (e) {
			e.preventDefault();
			enabledDisabledActionTools(true)
			editSchedule(e, id)
		});
	}

	const loadSchedules = () => _.each(schedules, schedule => addItem(schedule.internalId, schedule, true))

	const reloadViews = (policy) => {
		switch (policy) {
			case 'at-sign-up':
				$('#valueInput').prop('disabled', true);
				$('#valueInput').attr('data-provide', 'datepicker');
				$('#valueInput').datepicker();
				$('#displayOnAppSelection').prop('disabled', true);
				$('#repeatPolicySelection').prop('selectedIndex', 0);
				$('#repeatPolicySelection').prop('disabled', true);
				$('#repeatPolicySelection').prop('selectedIndex', 0);
				break;
			case 'on-specific-date':
				$('#displayOnAppSelection').prop('disabled', false);
				$('#valueInput').prop('disabled', false);
				$('#valueInput').attr('data-provide', 'datepicker');
				$('#valueInput').datepicker();
				$('#repeatPolicySelection').prop('disabled', false);
				break;
			case 'on-session-launch':
				$('#displayOnAppSelection').prop('disabled', false);
				$('#valueInput').val('');
				$('#valueInput').prop('disabled', true);
				$('#repeatPolicySelection').prop('disabled', true);
				$('#repeatPolicySelection').prop('selectedIndex', 0);
				break;
			case 'n/a':
				$('#repeatPolicySelection').prop('selectedIndex', 0);
				$('#repeatPolicySelection').prop('disabled', true);
				$('#repeatPolicySelection').prop('selectedIndex', 0);
				break;
			case 'on-milestone-x-days-since-signup':
				$('#valueInput').prop('disabled', false);
				$('#valueInput').attr('data-provide', 'datepicker');
				$('#valueInput').datepicker();
				$('#repeatPolicySelection').prop('selectedIndex', 0);
				$('#repeatPolicySelection').prop('disabled', true);
				$('#repeatPolicySelection').prop('selectedIndex', 0);
				break;
			default:
				$('#valueInput').prop('disabled', false);
				$('#repeatPolicySelection').prop('disabled', true);
				$('#repeatPolicySelection').prop('selectedIndex', 0);
				$('#valueInput').removeAttr('data-provide');
				$('#valueInput').datepicker('destroy');
				break;
		}
	};

	// populate <select> HTML with options
	const populateSelectWithSource = (source, selectId, optionFunction) => {
		var result = '';
		for (var i = 0; i < source.length; i++) {
			if (source[i] !== 'n/a') {
				result += optionFunction
					? optionFunction(source[i])
					: '<option value="' + source[i] + '">' + source[i] + '</option>';
			}
		}
		$(`#${selectId}`).append(result);
	}

	const populateSelect = (sourceId, selectId, optionFunction) => {
		const options = JSON.parse($(`#${sourceId}`).val());
		populateSelectWithSource(options, selectId, optionFunction);
	}

	const executionPolicyUIFilters = () => {
		const policy = $('#executionPolicySelection').val();
		reloadViews(policy);
	}

	const displayOnAppUIFilters = () => {
		const isDisplay = $('#displayOnAppSelection').val()
		const isDisabled = isDisplay === 'YES'
		isDisplay === 'YES'
			? $('#executionPolicySelection').append('<option selected value="n/a">n/a</option>')
			: $('#executionPolicySelection option[value="n/a"]').remove()
		$('#executionPolicySelection').prop('disabled', isDisabled)
		// $('#repeatPolicySelection').prop('disabled', isDisabled)
		$('#valueInput').prop('disabled', isDisabled)
		executionPolicyUIFilters()
	}

	const fillSelects = () => {
		reloadViews(''); // show default UI first
		populateSelectWithSource(['NO', 'YES'], 'displayOnAppSelection');
		populateSelect('executionPolicies', 'executionPolicySelection');
		populateSelect('repeatPolicies', 'repeatPolicySelection');
		populateSelect('availableQuestionnaires', 'questionnairesSelection', questionnaire => '<option value="' + questionnaire._id + '#' + questionnaire.name + '">' + questionnaire.name + '</option>');
	}

	const addListeners = (savedInternalId, savedQuestionnaire) => {
		$('#saveSchedule').click(e => {
			e.preventDefault();
			if ($('#executionPolicySelection').val() === 'at-sign-up' && (schedules.findIndex(sch => sch.executionPolicy === 'at-sign-up') !== -1)) return $.notify('Only one questionnaire can be scheduled with the execution policy at-sign-up at the same time.', 'warn')
			const questionnaire = $('#questionnairesSelection').val();
			const questionnaireId = questionnaire.split('#')[0];
			const questionnaireName = questionnaire.split('#')[1];
			const scheduledFor = $('#valueInput').val();
			const displayOnApp = $('#displayOnAppSelection').val();
			const executionPolicy = $('#executionPolicySelection').val();
			const repeatPolicy = $('#repeatPolicySelection').val();
			const newQuestionnaire = { questionnaire: { _id: questionnaireId, name: questionnaireName }, displayOnApp: displayOnApp, executionValue: scheduledFor, executionPolicy: executionPolicy, repeatPolicy: repeatPolicy, internalId: savedQuestionnaire ? savedQuestionnaire.internalId : uuidv4() }
			if (savedQuestionnaire) {
				schedules = schedules.reduce((acc, sch, idx) => {
					if (sch.internalId === savedInternalId) {
						acc[idx] = newQuestionnaire
						return acc
					} else {
						acc[idx] = sch
						return acc
					}
				}, [])
				addItem(savedInternalId, newQuestionnaire, false);
			} else {
				schedules.push(newQuestionnaire);
				addItem(newQuestionnaire.internalId, newQuestionnaire, true);
			}
			updateForm();
			$('#scheduleInput').remove();
			$('#addNewSchedule').show();
			enabledDisabledActionTools(false)
			$.notify('Save the account in order for changes to reflect.', 'info');
		});

		$('#discardSchedule').click(function (e) {
			e.preventDefault();
			if (savedQuestionnaire) {
				addItem(savedInternalId, savedQuestionnaire, false)
			} else {
				$('#scheduleInput').remove();
			}
			$('#addNewSchedule').show();
			enabledDisabledActionTools(false)
		});

		$('#executionPolicySelection').change(() => executionPolicyUIFilters())

		$('#displayOnAppSelection').change(() => displayOnAppUIFilters())
	}

	const editSchedule = (e, id) => {
		e.preventDefault();
		$('#addNewSchedule').hide();
		const questionnaireName = $(`#scheduleItem${id}`).find('td').eq(0).html()
		const questionnaireId = JSON.parse($('#schedule').val()).filter(q => q.questionnaire.name === questionnaireName)[0].questionnaire._id
		const displayOnApp = $(`#scheduleItem${id}`).find('td').eq(1).html()
		const executionPolicy = $(`#scheduleItem${id}`).find('td').eq(2).html()
		const scheduledFor = $(`#scheduleItem${id}`).find('td').eq(3).html()
		const repeatPolicy = $(`#scheduleItem${id}`).find('td').eq(4).html()
		$(`#scheduleContainer tr[id="scheduleItem${id}"]`).replaceWith($inputTemplate)
		fillSelects()
		addListeners(id, { questionnaire: { _id: questionnaireId, name: questionnaireName }, displayOnApp, executionValue: scheduledFor, executionPolicy, repeatPolicy, internalId: id })
		$(`#questionnairesSelection`).val(`${JSON.parse($('#schedule').val()).filter(q => q.questionnaire.name === questionnaireName)[0].questionnaire._id}#${questionnaireName}`)
		$('#displayOnAppSelection').val(displayOnApp);
		$('#executionPolicySelection').val(executionPolicy);
		$('#valueInput').val(scheduledFor)
		$('#repeatPolicySelection').val(repeatPolicy);
		executionPolicyUIFilters()
		displayOnAppUIFilters()
	}

	function newSchedule(e) {
		e.preventDefault();
		$('#addNewSchedule').hide();
		$('#scheduleContainer').append($inputTemplate);
		enabledDisabledActionTools(true)
		fillSelects()
		addListeners()
	}


	//Listeners ------------------------------------------

	$('#addNewSchedule').click(e => {
		e.preventDefault();
		newSchedule(e, false)
	});

	$('#scheduleContainer').sortable({
		group: 'simple_with_animation',
		axis: 'y',
		cursor: 'move',
		opacity: .5,
		stop: () => {
			schedules = schedules.reduce((acc, sch, idx, originArr) => {
				const currentTr = $(`#scheduleContainer tr:eq(${idx})`).attr('id').split('scheduleItem')[1]
				acc[idx] = originArr.find(schedule => schedule.internalId === currentTr)
				return acc
			}, [])
			updateForm(schedules)
		}
	})


	loadForm();
	loadSchedules();
});
