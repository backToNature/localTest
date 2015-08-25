


(function (w) {
    var def = undefined;
    function sizeof(str, charset) {
        var total = 0,
            charCode,
            i,
            len;
        charset = charset ? charset.toLowerCase() : '';
        if(charset === 'utf-16' || charset === 'utf16'){
            for(i = 0, len = str.length; i < len; i++){
                charCode = str.charCodeAt(i);
                if(charCode <= 0xffff){
                    total += 2;
                }else{
                    total += 4;
                }
            }
        }else{
            for(i = 0, len = str.length; i < len; i++){
                charCode = str.charCodeAt(i);
                if(charCode <= 0x007f) {
                    total += 1;
                }else if(charCode <= 0x07ff){
                    total += 2;
                }else if(charCode <= 0xffff){
                    total += 3;
                }else{
                    total += 4;
                }
            }
        }
        return total;
    }

    function getNetworkData () {
        chrome.devtools.inspectedWindow.getResources(function (arr) {
            var html = '',i = 0;
            arr.forEach(function (item) {
                html +='<tr>' +
                    '<th scope="row">'+(++i)+'</th>' +
                    '<td>'+item.url+'</td>' +
                    '<td>'+item.type+'</td>' +
                    '<td>1233</td>' +
                    '</tr>'
            });
            $('#list').html(html);

        });
    }
    function renderData(data) {

    }
    function getEntries(netData) {
        var entries;
        if(chrome && chrome.devtools) {
            var devTools = chrome.devtools;
            var inspectedWindow = devTools.inspectedWindow;
            var evalStr = '(function(){var entries=window.performance.getEntries(),key,newArr=[];function copy(obj){var temp={},key;for(key in obj){temp[key]=obj[key]}return temp}entries.forEach(function(item){newArr.push(copy(item))});return newArr}());';
            inspectedWindow.eval(evalStr, function(result, e) {
                if(e) {
                    document.body.innerHTML = 'Eval code error : ' + e;
                } else {
                    // window.performance.getEntries()不会获取html文件
                    entries = result;
                    var a = [], b = [];

                    netData.forEach(function (item) {
                        a.push(item.request.url);
                    });
                    entries.forEach(function (item) {
                        b.push(item.name);
                    });

                    var c = _.difference(a, b);
                    // alert(JSON.stringify(aa));

                }
            });
        } else {
            entries = window.performance.getEntries();
        }
    }

    var data2 = [];
    chrome.devtools.network.onRequestFinished.addListener(
        function(request) {
            var item = {
                url: def,
                fileType: def,
                size: def,
                startTime: def,
                endTime: def,
                status: def
            };
            var PerformanceResourceTiming;
            data2.push({request: request.request, response: request.response});
    });
    w.afterReload = function (msg) {
        getEntries(data2);
    };


}(window));