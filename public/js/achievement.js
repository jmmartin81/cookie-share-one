$(document).ready(function () {
	var $itemTemplate = Handlebars.compile($('#achievement-template-item').html())
	var $inputTemplate = Handlebars.compile($('#achievement-template-input').html())

	var $tableContainer = $('#achievementTableContainer')
	var $table = Handlebars.compile($('#achievement-template-table').html())
	$tableContainer.append($table)
	var achievements = []

	function loadForm() {
		if ($('#learnerAchievements').val()) {
			achievements = []
			var array = JSON.parse($('#learnerAchievements').val())
			_.each(array, (achievement) => {
				achievements.push(achievement)
			})
			updateForm()
		}
	}

	function updateForm() {
		$('#learnerAchievements').val(JSON.stringify(achievements))
	}

	function addItem(id, achievement) {
		var itemHtml = $itemTemplate({ id: id, achievement: achievement.title, displayWeekly: achievement.displayWeekly, displayTotal: achievement.displayTotal })
		$('#achievementContainer').append(itemHtml)

		$('#deleteAchievement' + id).click(function (e) {
			e.preventDefault()
			$(`#achievementContainer tr[id="achievementItem${id}"]`).remove()
			achievements = achievements.reduce((acc, sch, idx) => {
				if (idx !== id) acc.push(sch)
				return acc
			}, [])
			updateForm()
			$.notify('Save the account in order for changes to reflect.', 'info')
		})
	}

	function loadAchievements() {
		_.each(achievements, (achievement, i) => addItem(i, achievement))
	}

	$('#achievementContainer').sortable({
		group: 'simple_with_animation',
		axis: 'y',
		cursor: 'move',
		opacity: .5,
		stop: () => {
			achievements = achievements.reduce((acc, sch, idx, originArr) => {
				acc[idx] = originArr[parseInt($(`#achievementContainer tr:eq(${idx})`).attr('id').slice(-1))]
				return acc
			}, [])
			updateForm(achievements)
		}
	})

	$('#addNewAchievement').click(function (e) {
		e.preventDefault()
		$('#addNewAchievement').hide()
		$('#achievementContainer').append($inputTemplate)

		// populate <select> HTML with options
		const populateSelectWithSource = (source, selectId, optionFunction) => {
			var result = ''
			for (var i = 0; i < source.length; i++) {
				result += optionFunction
					? optionFunction(source[i])
					: '<option value="' + source[i] + '">' + source[i] + '</option>'
			}
			$(`#${selectId}`).append(result)
		}

		const populateSelect = (sourceId, selectId, optionFunction) => {
			const options = JSON.parse($(`#${sourceId}`).val())
			populateSelectWithSource(options, selectId, optionFunction)
		}

		populateSelectWithSource(['YES'], 'displayWeeklySelection')
		populateSelectWithSource(['YES'], 'displayTotalSelection')
		populateSelect('availableAchievements', 'availableAchievementsSelection', achievement => '<option value="' + achievement.service + '#' + achievement.title + '">' + achievement.title + '</option>')

		$('#saveAchievement').click(function (e) {
			e.preventDefault()
			const service = $('#availableAchievementsSelection').val().split('#')[0]
			const title = $('#availableAchievementsSelection').val().split('#')[1]
			const displayWeekly = $('#displayWeeklySelection').val()
			const displayTotal = $('#displayTotalSelection').val()
			achievements.push({ service, title, displayWeekly, displayTotal })
			addItem(achievements.length - 1, achievements[achievements.length - 1])
			updateForm()
			$('#achievementInput').remove()
			$('#addNewAchievement').show()
			$.notify('Save the account in order for changes to reflect.', 'info')
		})

		$('#discardAchievement').click(function (e) {
			e.preventDefault()
			$('#achievementInput').remove()
			$('#addNewAchievement').show()
		})

	})

	loadForm()
	loadAchievements()

})
