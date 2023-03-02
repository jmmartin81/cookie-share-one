(function () {
	$(function () {
		$('ul.pagination li:not(.active, .disabled) a').each(function () {
			var $this = $(this),
				qs = '';

			$this.on('click', function () {
				if (location.search.length > 0) {
					var hash;
					var hashes = location.search.slice(location.search.indexOf('?') + 1).split('&');

					for (var i = 0; i < hashes.length; i++) {
						hash = hashes[i].split('=');
						if (hash[0] != 'page') {
							qs += hash[0] + '=' + hash[1] + '&';
						}
					}
				}
				
				location.search = qs + 'page=' + $this.data('page');
			});
		});
	});
})();
