$(document).ready(function () {
	console.log('hereeeeee jmm');
	//We want to have access to any instance of a component by name.
	let multiSelects = {}
	const accountDropdown = new ComponentsOnJS('search-box', 'accountDropdown', {
		autoComplete: 'off',
		isMulti: true,
		confirmationButton: false,
		resetButton: true,
		selectAllButton: true,
		inputPlaceholderText: 'Select account(s)',
		confirmationButtonText: 'Confirm',
		resetButtonText: 'Reset',
		selectionListText: 'Selected accounts:',
		optionsListText: 'Select one or more accounts:',
		optionsNoMatchesText: 'No matches.',
		selectionNoMatchesText: 'No matches',
		selectionEmptyText: 'No options',
		selectAllButtonText: 'Select All',
		pillsGroupText: 'accounts selected',
		isLoading: true,
		filterByProps: [
			{
				prop: 'online',
				checkboxText: 'Show online accounts only',
				condition: option => {
					if (option.online) return true
					return false
				}
			}
		]
	})
	accountDropdown.onChange(function (selectedValues) {
		if (!accountDropdown.props.isDisabled) {
			$('#accountDropdownInput')
				.val(JSON.stringify(selectedValues.map(opt => opt.value)))
				.trigger('change')
		}
	}, 'selectedValues')

	/**
	 * Puts the new values in the component indicated by elementId
	 */

	function putNewValues(elementId, values) {
		var $el = $('#' + elementId);
		$el.empty();
		$.each(values, function (key, value) {
			$el.append($('<option></option>').attr('value', value).text(value));
		});

	}

	function putStaticNewValues(elementId, values) {
		const $el = $('#' + elementId)
		const sortValues = values => Object.entries(values).sort(function (a, b) {
			let x = a[1].name.toLowerCase();
			let y = b[1].name.toLowerCase();
			return x < y ? -1 : x > y;
		})
		const addNoFilterOpt = () => $el.append($('<option></option>').attr('value', '').text('No Filter'));
		const appendValues = () => $.each(sortValues(values), (key, value) => {
			$el.append($('<option></option>').attr('value', value[1]._id).text(value[1].name));
		})
		$el.empty();
		console.log('jmm II');
		switch (elementId) {
			case 'account':
				
				try {
					accountDropdown.props.options = values.map(opt => ({ value: opt._id, label: opt.name, online: opt.online }))
					accountDropdown.props.isLoading = false
					if (values.length === 1) {
						accountDropdown.props.selectedValues = [values[0]._id]
						accountDropdown.props.isDisabled = true
					}
				} catch (err) {
					console.warn('There has been an error fetching and/or sorting values:', err)
				}
				break;
			case 'course':
				try {
					addNoFilterOpt()
					values.sort((a, b) => {
						if (a.name > b.name) return 1
						if (a.name < b.name) return -1
						return 0
					}).forEach(value => $el.append($('<option></option>').attr('value', value._id).text(`${value.name}`)))
				} catch (err) {
					console.warn('There has been an error fetching and/or sorting values:', err)
				}
				break;

			default:
				try {
					addNoFilterOpt()
					appendValues()
				} catch (err) {
					console.warn('There has been an error fetching and/or sorting values:', err)
				}
				break;
		}

	}

	/**
	 * Loading mechanism of conditional filters
	 */
	function loadData(elementId, filterValue) {
		console.log(`loadData jmm`)
		var filter = {};
		filter.fieldName = elementId.toLowerCase();
		filter.filters = [];
		var filters = {};
		var $el = $('#' + elementId)
		var filteredBy = $el.attr('data-filteredBy').toLowerCase();
		filters[filteredBy] = filterValue;
		filter.filters.push(filters);

		// include the account param if one is selected
		let selectedAccount = accountDropdown.props.selectedValues
			? accountDropdown.props.selectedValues.map(opt => opt.value)
			: []
		filter.account = selectedAccount;

		// Example attributes selectors 
		// $('#' + elementId).attr("data-fieldName");
		// $('#' + elementId).attr("data-filteredBy");
		$.ajax({
			url: '/dashboard/learners/filters/update',
			method: 'post',
			data: JSON.stringify(filter),
			dataType: 'json',
			contentType: 'application/json',
			success: function (response) {
				putNewValues(elementId, response);
			},
			error: function (response) {
				alert('Unexpected error while using filters');
			},
		});
		// To remove
		// var newValues = { "A1": "A1", "A2": "A2", "A3": "A3" };
		// putNewValues(elementId, newValues);
	}

	/**
	 * Create new filters
	 */
	function createCustomFilter(data) {
		console.log(`createCustomFilter ${createCustomFilter}`);
		const appendInput = inputType => {
			// Compile the template defined in dynamicFilters.jade of handlebars
			var $combo = Handlebars.compile($(`#template-${inputType}-dynamic`).html());
			// Div selector filter container defined in dynamicFilters.jade
			var $dynamicFiltersFormGroup = $('#dynamicFiltersFormGroup');
			// Cnter the variables to the compiler
			var comboHtml = $combo({ id: data.fieldName, values: data.values, fieldName: data.fieldName, filteredBy: data.filteredBy });
			// Puts the new component inside the container div
			$dynamicFiltersFormGroup.append(comboHtml);
			/**
			 * Create the load events when there is a selection in the wired component.
			 */
			if (data.filteredBy) {
				var $el = $('#' + data.filteredBy);
				$el.change(function () {
					loadData(data.fieldName, $el.val());
				});
			} else {
				if (data.values.length === 1 && data.fieldType === 'text' && data.uiType === 'select') {
					$(`#${data.fieldName} option[value='']`).remove()
					$(`#${data.fieldName}`).prop('disabled', 'disabled')
				}
			}
		}
		switch (data.uiType) {
			case 'select': appendInput('combo')
				break;
			case 'multiSelect':
				$('#dynamicFiltersFormGroup').append($(`<div class='col-sm-3'><input type="hidden" name="${data.fieldName}Input" id="${data.fieldName}Input" value="[]"><label class="text-nowrap"><small>${data.fieldName}</small></label><div id=${data.fieldName} data-filteredBy=${data.filteredBy}></div></div>`))
				multiSelects[data.fieldName] = new ComponentsOnJS('search-box', data.fieldName, {
					options: data.values.map(opt => ({ value: opt, label: opt })),
					autoComplete: 'off',
					isMulti: true,
					selectionListText: 'Selection:',
					optionsListText: 'Options:',
					optionsNoMatchesText: 'No matches.',
					selectionNoMatchesText: 'No matches.',
					selectionEmptyText: 'No options.',
					pillsGroupText: ``
				})
				multiSelects[data.fieldName].onChange(function (selectedValues) {
					$(`#${data.fieldName}Input`)
						.val(JSON.stringify(selectedValues.map(opt => opt.value)))
						.trigger('change')
				}, 'selectedValues')
				if (data.filteredBy) {
					var $el = $('#' + data.filteredBy);
					$el.change(function () {
						loadData(data.fieldName, $el.val());
					});
				}
				break;
			default:
				break;
		}
	}

	/**
	 * Wipes out all the dynamic filters section
	 */
	function clearCustomFiltersInputs() {
		const $dynamicFiltersFormGroup = $('#dynamicFiltersFormGroup');
		$dynamicFiltersFormGroup.html('');
		multiSelects = {}
	}
	/**
	 * Create new combo for each entry of the initial filters
	 */
	function renderCustomFilters(fields) {
		console.log(`renderCustomFilters`);
		// wipe out the entire section and recreate
		clearCustomFiltersInputs();
		_.forEach(fields, function (field) {
			createCustomFilter(field);
		});
	}

	/**
	 * This function reads the values of the dynamic filters
	 */
	function getFilteredValues() {
		var values = {
			pageInfo: {
				pageSize: $('#pageSize'),
				// pageSize: $gPageSize,
				currentPage: 0,
			},
			account: accountDropdown.props.selectedValues
				? accountDropdown.props.selectedValues.map(opt => opt.value)
				: []
		};
		// Select all the inputs of the div static
		var $staticInputs = $('#staticFiltersFormGroup :input');
		$('#searchText').val($('#searchText').val());
		// For each value that is defined, put it in the object, the key is the name of the field
		$staticInputs.each(function () {
			// We want to read the accountDropdown value using an onChange function from ComponentsOnJS. We've set the data-fieldName on the input for the account dropdown as a helper to use the component values outside the scope of this module (dynamicFilters.js)
			if ($(this).val() !== '' && $(this).val() !== null) {
				if ($(this).attr('data-fieldName') !== undefined && $(this).attr('data-fieldName') !== 'account') {
					values[$(this).attr('data-fieldName')] = $(this).val();
				}
			}
		});
		// Select all the inputs of the div dynamic
		Object.keys(multiSelects).forEach(filter => {
			if (multiSelects[filter] &&
				multiSelects[filter].props &&
				multiSelects[filter].props.selectedValues) {
				const newValues = multiSelects[filter].props.selectedValues.map(opt => opt.value)
				values[filter] = newValues.length ? newValues : null
			}
		})
		var $dynamicInputs = $('#dynamicFiltersFormGroup :input');
		// For each value that is defined, put it in the object, the key is the name of the field
		$dynamicInputs.each(function () {
			if ($(this).val() !== undefined &&
				$(this).val() !== '' &&
				$(this).val() !== 'No Filter') {
				if ($(this).attr('data-fieldName') !== undefined) {
					values[$(this).attr('data-fieldName').toLowerCase()] = $(this).val();
				}
			}
		});
		return values;
	}

	function resetFilters() {
		// Select all input devices on the form
		clearCustomFiltersInputs();
		var $inputs = $('#staticFiltersFormGroup').find(':input');
		$('#toggleCheckboxes').prop('checked', false);
		// For each value that is defined, reset the values
		if (!accountDropdown.props.isDisabled) {
			accountDropdown.props.selectedValues = []
		} else {
			const accountsIds = accountDropdown.props.selectedValues.map(opt => opt.value)
			loadCourses(accountsIds, accountsIds.length === 0)
			console.log('jmm:II')
			loadCustomFilters(accountsIds)
		}
		$inputs.each(function () {
			$(this).val('');
		});
		$('#accountDropdownInput').val('[]')
		console.log('acaaaaa');
	}

	function getTableContainer() {
		return $('#learnersListTable');
	}
	/**
	 * Create new table
	 */
	function createTable(columns) {

		// Div selector container defined in learnerListTable.jade
		var $learnersListTableEl = getTableContainer();
		// Reset container
		$learnersListTableEl.empty();
		// Cnter the variables to the compiler
		var tableHtml = $learnerTableTemplate({ titles: columns });
		// Puts the new component inside the container div
		$learnersListTableEl.append(tableHtml);
	}

	function updateTable(learners) {
		var targetEl = getTableContainer().find('tbody');
		if (learners) {
			var rowsHtml = ''
			let haveCoachingPhoneNumber = false;
			learners.forEach((learner) => {
				if (learner.account.coachingPhoneNumber) {
					haveCoachingPhoneNumber = true;
				}
				rowsHtml += renderLearnerRow(learner);
			})
			if (!haveCoachingPhoneNumber) {
				let errorMessage = '<label>Text messaging has not been enabled for this account.</label>';
				$('#sendMessageAllBtn').attr('disabled', true);
				$('#sendMessageAlert').html(errorMessage).css({ 'color': '#C09853', 'background-color': '#FCF8E3', 'border': '1px solid #FBEED5', 'text-align': 'center', 'border-radius': '5px', 'padding': '8px' })
			} else {
				$('#sendMessageAllBtn').attr('disabled', false);
				$('#sendMessageAlert').html('<p></p>').removeAttr('style');
			}
			targetEl.html(rowsHtml);
		} else {
			var noOfCols = getTableContainer().find('th').size();
			targetEl.html(`<tr><td colspan=${noOfCols}> No learners found </td></tr>`);
		}
		updateSelectedRows();
	}

	/**
	 * Clears the list of learners table.
	 */
	function clearTable() {
		const body = getTableContainer().find('tbody');
		body.empty();
	}

	/**
	 * Applies the learner row handlebar to the supplied learner object.
	 * @param {*} learner 
	 * @returns the HTML for the learner <TR>...</TR>
	 */
	function renderLearnerRow(learner) {
		return $learnerRowTemplate(learner);
	}

	function getSortingOrder() {
		var retVal = {};
		var $myTable = getTableContainer();
		var currentSortedColEl = $myTable.find('th.sorted');
		var sortedColName = currentSortedColEl.data('col-name');
		var sortDirection;
		if (sortedColName !== undefined) {
			if (currentSortedColEl.hasClass('sorted-asc')) {
				sortDirection = 1;
			} else {
				sortDirection = -1;
			}
			retVal[sortedColName] = sortDirection;
			return retVal;
		} else {
			return null
		}
	}


	/**
	 * 
	 * @param {Function} onDone 
	 */
	function search(onDone, pageSize, currentPage, firstPage) {

		const togglePaginator = (show) => {
			const $paginatorContainer = $('.parentPaginatorContainer');
			const $paginatorPlaceholderAnimation = $('.paginatorPlaceholderAnimation');

			if (show === true) {
				$paginatorContainer.show();
				$paginatorPlaceholderAnimation.hide();
			} else {
				$paginatorContainer.empty();
				$paginatorContainer.hide();
				$paginatorPlaceholderAnimation.show();
			}
		}

		clearTable();
		togglePaginator(false); // show: false
		$('#learner-list-loader').show();
		$('#toggleCheckboxes').prop('checked', false);
		var values = getFilteredValues();
		var sorting = getSortingOrder();
		values.pageInfo = {
			pageSize: pageSize,
			currentPage: currentPage,
		};
		values.sortBy = sorting;
		$.ajax({
			url: '/dashboard/learners/search',
			method: 'post',
			data: JSON.stringify({ ...values }),
			dataType: 'json',
			contentType: 'application/json',
			success: function (response) {
				$('#learner-list-loader').hide();
				console.log(`[search] finished in ${response.executionTime} ms`);

				return onDone(null, response);
			},
			error: function (response) {
				$('#learner-list-loader').hide();
				return onDone(new Error('Unexpected error while using filters'), response);
			},
		});

		$.ajax({
			url: '/dashboard/learners/search/count',
			method: 'post',
			data: JSON.stringify({ ...values }),
			dataType: 'json',
			contentType: 'application/json',
			success: function (response) {
				if (response.pageInfo) {
					response.pageInfo.firstPage = firstPage;
				}
				togglePaginator(true); // show: true
				return onDone(null, response);
			}
		});
	}

	function loadStaticFilters() {
		var $accountEl = getAccountElement();
		console.log('loadStaticFilters');
		$.ajax({
			url: '/dashboard/learners/filters/accounts',
			method: 'post',
			data: JSON.stringify({ silent: true }),
			dataType: 'json',
			contentType: 'application/json',
			success: response => {
				console.log(`response: ${response}`)
				putStaticNewValues('account', response)
			},
			error: () => alert('Unexpected error while using filters'),
		})
		accountDropdown.onChange(selectedValues => {
			const accountsIds = selectedValues.map(opt => opt.value)
			loadCourses(accountsIds, accountsIds.length === 0)
			console.log('jmm:I')
			loadCustomFilters(accountsIds)
		}, 'selectedValues')
	
	}

	function getAccountElement() {
		console.log('getAccountElement');
		return $('#account');
	}

	async function loadCustomFilters(accounts) {
		console.log('loadCustomFilters-loadCustomFilters');
		// Helper function to fetch dynamicFilters by accountId
		const fetchAccountFilters = async accountId => {
			return $.ajax({
				url: '/dashboard/learners/filters',
				method: 'post',
				dataType: 'json',
				data: JSON.stringify({ account: accountId, silent: true }),
				contentType: 'application/json'
			})
		}
		// Check if a single account was selected
		const isSingleAccount = accounts && accounts.length === 1
		if (isSingleAccount) {
			//Load dynamic filters for a single account
			try {
				const accountFilters = await fetchAccountFilters(accounts[0])
				renderCustomFilters(accountFilters);
				// search(onSearchHandler, $gPageSize, 0, 0);
				registerEnterEvent();
			} catch (err) {
				console.log(`errrrrr ${err}`);
				alert('Unexpected error while using filters')
			}
		} else {
			console.log(`loadCustomFilters-loadCustomFilters isSingleAccount else`);
			clearCustomFiltersInputs()
			if (accounts.length > 1) {
				const $alert = Handlebars.compile($(`#template-dynamic-not-alert`).html())
				const populateAlert = $alert({ text: 'Dynamic filters for some of the accounts you selected will not show. Select only one account to access them.' })
				$('#dynamicFiltersFormGroup').append(populateAlert)
			}
			// search(onSearchHandler, $gPageSize, 0, 0)
			registerEnterEvent()
		}
	}

	function loadCourses(account, getAll = false) {
		console.log('loadCourses');
		if ((account) || getAll) {
			const data = { account: getAll ? null : account };
			$.ajax({
				url: '/dashboard/learners/filters/courses',
				method: 'post',
				data: JSON.stringify({ ...data, silent: true }),
				dataType: 'json',
				contentType: 'application/json',
				success: function (response) {
					putStaticNewValues('course', response);
				},
				error: function (response) {
					alert('Unexpected error while using filters');
				}
			});
		} else {
			putStaticNewValues('course', []);
		}
	}

	/**
	 * Create new paginator
	 */
	function createPaginator(pageInfo) {
		// Compile the template defined in learnerListTable.jade of handlebars
		let $paginator = Handlebars.compile($('#template-paginator').html());
		// Div selector container defined in paginator.jade
		let $paginatorContainer = $('.parentPaginatorContainer');
		// Delete paginator in containter 
		$paginatorContainer.empty();
		let totalItems = pageInfo.total;

		if (totalItems > 0) {
			let pagesToShow = 10;
			let firstPage = Math.ceil(pageInfo.firstPage) || 0;
			let pageSize = pageInfo.pageSize;
			let currentPage = pageInfo.currentPage;
			let totalPages = Math.ceil(totalItems / pageSize);
			let pages = [];
			let lastPage = firstPage + pagesToShow;
			let firstPageOnPaginator = firstPage || 0;
			let lastPageOnPaginator = lastPage >= totalPages ? totalPages : lastPage;
			let pageSizeSelectorItems = [
				{ value: 50, selected: $gPageSize === 50 },
				{ value: 100, selected: $gPageSize === 100 },
				{ value: 200, selected: $gPageSize === 200 },
			];
			for (let i = firstPageOnPaginator; i < lastPageOnPaginator; i++) {
				pages.push({
					number: i,
					label: i + 1,
					size: pageSize,
					current: currentPage,
					class: i === currentPage ? 'active' : '',
				});
			}
			let hasNextPageClass = lastPageOnPaginator === totalPages ? 'disabled' : '';
			let hasPreviousPageClass = currentPage === 0 ? 'disabled' : '';
			let paginatorHtml = $paginator({ pages: pages, currentPage: currentPage, pageSize: pageSize, hasNextPageClass: hasNextPageClass, hasPreviousPageClass: hasPreviousPageClass, totalRowsCount: totalItems, pageSizeSelectorItems: pageSizeSelectorItems });
			// Puts the new component inside the container div
			$paginatorContainer.append(paginatorHtml);

			$('.pageSizeSelector').change(function (e) {
				e.preventDefault();
				$gPageSize = Number($(this).val());
				search(onSearchHandler, $gPageSize, pageInfo.currentPage, firstPageOnPaginator);
			});

			$('.paginationLinkNumber').click(function (e) {
				e.preventDefault();
				let number = Number($(this).attr('data-page-number'));
				let size = Number($(this).attr('data-page-size'));
				if (number <= totalPages) {
					search(onSearchHandler, size, number, firstPageOnPaginator);
				}
				else {
					search(onSearchHandler, size, totalPages, firstPageOnPaginator);
				}
			});

			$('.paginationLinkNext').click(function (e) {
				e.preventDefault();
				let size = Number($(this).attr('data-page-size'));
				let current = Number($(this).attr('data-page-current'));
				if ((lastPageOnPaginator + 1) <= totalPages) {
					if ((current + pagesToShow) <= totalPages) {
						search(onSearchHandler, size, current + pagesToShow, lastPageOnPaginator);
					} else {
						search(onSearchHandler, size, totalPages - 1, lastPageOnPaginator);
					}
				} else {
					search(onSearchHandler, size, totalPages - 1, firstPageOnPaginator);
				}
			});

			$('.paginationLinkPrevious').click(function (e) {
				e.preventDefault();
				let size = Number($(this).attr('data-page-size'));
				let current = Number($(this).attr('data-page-current'));
				let leftPage = firstPageOnPaginator - 10;
				if (leftPage >= 0) {
					search(onSearchHandler, size, leftPage, leftPage);
				}
				else {
					leftPage = 0;
					search(onSearchHandler, size, leftPage, leftPage);
				}
			});
		}
	}
	/** *************************************************
		#    #    ##       #    #    #
		##  ##   #  #      #    ##   #
		# ## #  #    #     #    # #  #
		#    #  ######     #    #  # #
		#    #  #    #     #    #   ##
		#    #  #    #     #    #    #
	***************************************************/

	var $gPageSize = 50;
	var $learnerTableTemplate = Handlebars.compile($('#template-learners-list-table').html());
	var $learnerRowTemplate = Handlebars.compile($('#template-learners-list-row').html());
	var $sendMsgBtnEl = $('#sendMessageAllBtn');
	var $learnerCounterEl = $('#selectedLearnersCount');
	// let's create the table that will hold the learners
	var columns = ['', 'Name', 'Phone Number', 'Last Entry', 'Created At', 'Total Time', 'Current Course', 'Unread SMS'];
	createTable(columns);
	loadCourses(null, true);

	/** ********************************************************
	 * L O A D    C U S T O M   F I L T E R S
	 **********************************************************/
	loadStaticFilters();

	// handler to when user clicks on colum headers
	console.log('getTableContainer->')
	var myTable = getTableContainer();
	console.log('getTableContainer<-')
	/** **********************************************************
	 * A T T A C H   S O R T I N G   E V E N T S
	 ************************************************************/
	myTable.find('th.sortable').on('click', function (e) {
		var $this = $(this);
		var sortDirection;
		var sortedColName = $this.data('col-name');

		if ($this.hasClass('sorted-asc')) {
			sortDirection = 'desc';
		} else if ($this.hasClass('sorted-desc')) {
			sortDirection = 'asc';
		} else {
			if (sortedColName === 'createdAt' || sortedColName === 'lastActive' || sortedColName === 'lastMessage') {
				sortDirection = 'desc';
			} else {
				sortDirection = 'asc';
			}
		}
		// Reset previous sorting classes
		myTable.find('th').removeClass('sorted sorted-asc sorted-desc');
		$this.addClass('sorted sorted-' + sortDirection);
		$('#buttonSearch').click();
	});

	function registerEnterEvent() {
		console.log('registerEnterEvent');
		var $inputs = $('#staticFiltersFormGroup').find(':input');
		$inputs.each(function () {
			const idSplit = $(this)[0].id.split('-');
			if (!(`${idSplit[0]}-${idSplit[1]}` === 'search-box')) {
				$(this).keypress(function (e) {
					if (e.keyCode === 13) {
						e.preventDefault();
						search(onSearchHandler, $gPageSize, 0);
					}
				});
			};
		});
		console.log('registerEnterEvent end');
	}

	/** *****************************************************
	 * onSearch Handler
	 ******************************************************/
	function onSearchHandler(err, response) {
		console.log('onSearchHandler->');
		if (err) {
			alert(err);
		} else {
			if (response.resultSet) {
				updateTable(response.resultSet);
			}

			if (response.pageInfo) {
				createPaginator(response.pageInfo);
				if (response.pageInfo.total > 0) {
					$sendMsgBtnEl.removeClass('disabled');
				} else {
					$sendMsgBtnEl.addClass('disabled');
				}
			}
		}
		console.log('onSearchHandler<-');
	}

	/**
	 * Search button event click
	 */
	$('#buttonSearch').click(function () {
		search(onSearchHandler, $gPageSize, 0)
	});

	/**
	 * Reset button event click
	 */
	$('#buttonReset').click(function () {
		resetFilters();
		search(onSearchHandler, $gPageSize, 0)
	});

	$('#buttonClearSearchText').click(function () {
		$('#searchText').val('');
	});

	$('#toggleCheckboxes', myTable).click(function () {
		$('td:first-child input:checkbox', myTable).prop('checked', $(this).prop('checked'));
		var element = this;
		var counter = 0;
		$('input[type=checkbox]').each(function () {
			if ($(this).is(':checked')) {
				counter++;
			}
		});
		var selectedRows = counter - 1;
		if (selectedRows <= 0) selectedRows = 0;
		$learnerCounterEl.text(` Learners Selected: ${selectedRows}`);
	});

	function updateSelectedRows() {
		var selectedRows = myTable.find('td:first-child input:checkbox:checked').length;
		myTable.trigger('rowSelectionChanged', { selectedRows: selectedRows });
	}

	myTable.on('click', 'td:first-child input:checkbox', (e) => {
		updateSelectedRows();
	})

	myTable.on('rowSelectionChanged', (e, eventData) => {
		var selectedRows = eventData.selectedRows;
		if (selectedRows > 0) {
			$sendMsgBtnEl.text('Send Message to Selected Learner(s)');
			$learnerCounterEl.text(` Learners Selected: ${selectedRows}`);
		} else {
			$learnerCounterEl.text(` Learners Selected: 0`);
			$sendMsgBtnEl.text('Send Message to All Learner(s)');
		}
	})
	search(onSearchHandler, $gPageSize, 0, 0);
});
