var program = {
	init: function () {
		this.getNetworkData();
	},
	getNetworkData: function () {
		chrome.devtools.network.onRequestFinished.addListener(
		    function(request) {
		      chrome.experimental.devtools.console.addMessage(
		          chrome.experimental.devtools.console.Severity.Warning,
		          "Large image: " + request.request.url);
		      console.log(request.request.url);
		});
	}
};
program.init();