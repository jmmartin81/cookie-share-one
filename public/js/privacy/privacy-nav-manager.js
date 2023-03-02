'use strict';

/**
* Privacy access navigation menu item.
*/
$(document).ready(function () {

	const $navContainer = $('#navbar-privacy-container');
	let _prevHasAccess = null;

	const registerPrivacyListener = () => {
		$('#navbar-privacy-link').click(() => {
			const $modal = $('#popup-privacy');
			$modal.modal({
				backdrop: 'static'
			});
		});
	};

	const unregisterPrivacyListener = () => {
		$('#navbar-privacy-link').off();
	};

	const renderAccessAllowedNavIcon = () => {
		if (_prevHasAccess === true) return; // previously had access, still do

		$navContainer.empty();

		let item = `<a id="navbar-privacy-link" data-toggle="dropdown" class="dropdown-toggle">`;
		item += `<i style="color:#f6f6f6;" class="fa fa-lg fa-unlock dropdown-toggle" />`
		item += `</a>`;
		$navContainer.append(item);
	}

	const renderAccessDeniedNavIcon = () => {
		if (_prevHasAccess === false) return; // previously did not have access, still don't

		$navContainer.empty();

		let item = `<a id="navbar-privacy-link" style="background-color:#DD9334; cursor: pointer;" data-toggle="dropdown" class="dropdown-toggle">`;
		item += `<i style="color:#f6f6f6;" class="fa fa-lg fa-lock dropdown-toggle" />`
		item += `</a>`;
		$navContainer.append(item);
	}

	const verifyPrivacyRoutine = () => {
		//console.log(`verifyPrivacyRoutine: ${verifyPrivacyRoutine}`)
		$.ajax({
			url: '/dashboard/privacy/verify',
			method: 'POST',
			dataType: 'json',
			contentType: 'application/json',

			// do not audit this call since it runs on a timer routine, 
			// otherwise it will mark this user as "active" every time
			// it runs!
			data: JSON.stringify({ silent: true }), 
			success: function (result) {
				console.log(`result ${result}`);
				const hasAccess = result === true;

				if (!hasAccess && _prevHasAccess) {
					return window.location.reload(true);
				}
				console.log(`hasAccess result ${hasAccess}`);
				if (hasAccess) {
					renderAccessAllowedNavIcon();
					unregisterPrivacyListener();
				} else {
					renderAccessDeniedNavIcon();
					registerPrivacyListener();
				}

				_prevHasAccess = hasAccess;
			}
		}).always(() => {
			if (_prevHasAccess !== false) {
				// if we have reported valid access, continously poll to verify status.
				setTimeout(verifyPrivacyRoutine, 5 * 60 * 1000); // verify every 5 minutes; or 5 * 60 * 1000 (ms)
			}
		});
	}

	verifyPrivacyRoutine();

});
