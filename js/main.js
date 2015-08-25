


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
    function getEntries() {
        var entries;
        if(chrome && chrome.devtools) {
            var devTools = chrome.devtools;
            var inspectedWindow = devTools.inspectedWindow;
            var evalStr = '(function () {var entries = window.performance.getEntries(), key, temp = {}, newArr = [];entries.forEach(function (item) {for (key in item) {temp[key] = item[key];}newArr.push(temp);});return newArr;}());';
            inspectedWindow.eval(evalStr, function(result, e) {
                if(e) {
                    document.body.innerHTML = 'Eval code error : ' + e;
                } else {
//                    for (var item in result[0]) {
//                        alert(item);
//                    }
                    alert(result[0].name);
                }
            });
        } else {
            entries = window.performance.getEntries();
        }
    }

//    var data = [];
//    chrome.devtools.network.onRequestFinished.addListener(
//        function(request) {
//            var item = {
//                url: def,
//                fileType: def,
//                size: def,
//                startTime: def,
//                endTime: def,
//                status: def
//            };
//            item.url = request.request.url;
//
//    });
//    var timer;
//    w.afterReload = function (msg) {
//        if(msg === 'reloadcomplete') {
//            clearTimeout(timer);
//            timer = setTimeout(function() {
//                getEntries();
//            }, 2000);
//        }
//    };
    getEntries();

}(window));

