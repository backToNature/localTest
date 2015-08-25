chrome.devtools.panels.create("performance", '../images/selectorInspecer_24_24_40_32.png', '../pages/performance.html',
	function(panel){
		panel.onHidden.addListener(function() {
			
		});
        var _window;

        var tabId = chrome.devtools.inspectedWindow.tabId;
        var port = chrome.runtime.connect({
            name: 'performance_' + tabId
        });
        port.onMessage.addListener(function(msg) {
            if (_window) {
                _window.afterReload(msg);
            }
        });
        panel.onShown.addListener(function tmp(panelWindow) {
            panel.onShown.removeListener(tmp);
            _window = panelWindow;
            
        });
	}
);