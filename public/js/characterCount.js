(function () {
	$(function () {
		var $maxChars = 160;
		var $maxLength = 1600;
		$(document).ready(function () {
			$('textarea').attr('maxlength', $maxLength);
			$('textarea.gsm').each(function () {
				var $this = $(this);
				$this.after("<div class='characterCount small help-block text-right'></div>");
				$this.next('.characterCount').text(`Characters used: 0 | SMS count: 1 (${$maxChars} characters per SMS)`);
			});
		});
		
		/**
		 * This function will count the number of characters used to inform the number of SMSs that will be send.
		 */
		$(document).on('keyup paste', 'textarea.gsm', function (event) {
			$('textarea').attr('maxlength', $maxLength);
			var $this = $(this);
			var $charactersCount = $($this.next('.characterCount'));
			var $charsUsed = ($this.val().length);

			if (!/^[ a-z0-9\n@£$¥ÇØΔ_ΦΓΛΩΠΨΣΘΞ^{}\[~\]|€Ææß!\"#¤%&'()*+,-./:;<=>?¡§¿]*$/i.test($this.val())) {
				$maxChars = 70;
				$charactersCount.text(`Characters used: ${$charsUsed} | SMS count: ${Math.ceil($charsUsed / $maxChars)} (${$maxChars} characters per SMS)`);
			}
			else {
				$maxChars = 160;
				$charactersCount.text(`Characters used: ${$charsUsed} | SMS count: ${Math.ceil($charsUsed / $maxChars)} (${$maxChars} characters per SMS)`);
			}
		});
	});
})();
