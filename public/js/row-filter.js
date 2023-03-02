function bindRowFilter (url, $selects, $inputs, onBeforeSend) {
	var vars = {}, qs = '?', hash;

	(function decodeQS () {
		var hashes = window.location.href.replace('#', '').slice(window.location.href.indexOf('?') + 1).split('&');
		for (var i = 0; i < hashes.length; i++) {
			hash = hashes[i].split('=');
			vars[hash[0]] = hash[1];
		}
	})();

	function serializeFields () {
		var auxQs = '';
		for (var i = 0; i < $selects.length; i++) {
			if (vars[$selects[i]] && !_.isEmpty(vars[$selects[i]])) {
				auxQs += $selects[i] + '=' + vars[$selects[i]] + '&';
			}
		}

		for (var j = 0; j < $inputs.length; j++) {
			if (vars[$inputs[j]] && !_.isEmpty(vars[$inputs[j]])) {
				auxQs += $inputs[j] + '=' + vars[$inputs[j]] + '&';
			}
		}
		return auxQs;
	}

	function buildQueryString () {
		qs = '?' + serializeFields();

		if (qs != '?') {
			qs = qs.substring(0, qs.length - 1);
		}

		if (vars.page) {
			if (qs != '?') {
				qs += '&';
			}
			qs += 'page=' + vars.page;
		}

		qs = qs == '?' ? '' : qs;
		return qs;
	}

	function encodeQS () {
		if (_.isFunction(onBeforeSend))
			{ onBeforeSend(); }

		buildQueryString();
		window.location.href = url + qs;
	}

	// PROCESS DROPDOWNS
	for (var j = 0; j < $selects.length; j++) {
		var $select = $('#' + $selects[j]);

		if (vars[$selects[j]]) {
			$select.val(vars[$selects[j]]);
		} else {
			$select.val('');
		}

		$select.change(function () {
			vars[$(this).attr('id')] = $(this).find('option:selected').val();
			vars.page = 1;
			encodeQS();
		});
	}

	// PROCESS INPUTS
	for (var k = 0; k < $inputs.length; k++) {
		var $input = $('#' + $inputs[k]);

		// 'remove filter' handler
		$input.siblings('span').click(function () {
			var element = $(this).siblings('input');
			if (element.val() != '') {
				element.val('');
				delete vars[element.attr('id')];
				encodeQS();
			}
			return false;
		});

		// Autocompletes
		if ($input.hasClass('autocomplete')) {
			$input.autocomplete({
				deferRequestBy: 100,
				serviceUrl: '/api/' + $inputs[k] + 's/find',
				onSelect: function (suggestion) {
					vars[$(this).attr('id')] = suggestion.data;
					encodeQS();
				},
				transformResult: function (response) {
					return {
						suggestions: $.map($.parseJSON(response), function (suggestion) {
							return { value: suggestion.name, data: suggestion.id };
						}),
					};
				},
			}).keyup(function (e) {
				if (e.which === 13 && $(this).val() == '') {
					delete vars[$(this).attr('id')];
					encodeQS();
				}
			});
		} else {
			if (vars[$inputs[k]]) {
				$input.val(vars[$inputs[k]]);
			} else {
				$input.val('');
			}

			$input.keyup(function (e) {
				if (e.which === 13 && $(this).val() != '') {
					vars[$(this).attr('id')] = $(this).val();
					vars.page = 1;
					encodeQS();
				}
			});
		}
	}

	return {
		getQueryString: buildQueryString,
		serializeFields: serializeFields,
	}
}
