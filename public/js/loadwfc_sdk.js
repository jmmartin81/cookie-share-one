const loadWfcSdk = (callback) => {
	const existingScript = document.getElementById('wfcSDK');
	if (!existingScript) {
		const script = document.createElement('script');
		script.src = './js/wfc_sdk.js';
		script.id = 'wfcSDK';
		script.type = 'text/javascript';
		document.getElementsByTagName('head')[0].appendChild(script);
		console.log('appended');
		script.onload = () => { 
			console.log('loading');
			if (callback) {
				console.log(window.wfc_sdk);
				callback();
			}
		};
	}
	if (existingScript && callback) callback();
};

export default loadWfcSdk;
