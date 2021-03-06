


(function (w) {
    var def = undefined, globalData;

    function getNetworkData () {
        chrome.devtools.inspectedWindow.getResources(function (arr) {
            var html = '',i = 0;
            arr.forEach(function (item) {
                html +='<tr>' +
                    '<th scope="row">'+(++i)+'</th>' +
                    '<td>'+item.url+'</td>' +
                    '<td>'+item.type+'</td>' +
                    '<td>1233</td>' +
                    '</tr>';
            });
            $('#list').html(html);
        });
    }

    function getApiListTemplate(arr) {
        var body = '';
        _.each(arr, function (item) {
            body += '<td>'+item+'</td>';
        });
        var apiHtml = '<tr>' +body+'</tr>';
        return apiHtml;
    }

    // 渲染总体请求
    function renderGeneralData(data, kinds, type) {
        //  请求总共耗时    请求总大小压缩后     请求总大小       api请求时间
        var totalTime = 0, totalSizeGzip = 0, totalSize = 0,  totolApiTime = 0 ,html,
            $table = $('#generalData'), $apiTable = $('#apiList'), apiHtml = '';

        data.forEach(function (item) {
            var response = item.req.response;
            totalTime += item.duration;
            totalSizeGzip += response._transferSize;
            totalSize += response.content.size + response.headersSize;
        });

        kinds.api.forEach(function (item) {
            var gzip = item.req.response._transferSize, total = item.req.response.content.size,
                url = item.name.indexOf('?') >= 0? item.name.substring(0, item.name.indexOf('?')) : item.name;
            var tplData = [
                    url, 
                    item.req.response.status, 
                    item.duration.toFixed(2)+'ms', 
                    (gzip / 1024).toFixed(2)+'kb',
                    (total / 1024).toFixed(2)+'kb'
                ];
            var apiTpl = getApiListTemplate(tplData);
            apiHtml += apiTpl;
            totolApiTime += item.duration;
        });

        totalSizeGzip = totalSizeGzip / 1024;
        totalSize = totalSize/ 1024;
        totalTime = totalTime.toFixed(2);
        totalSizeGzip = totalSizeGzip.toFixed(2);
        totalSize = totalSize.toFixed(2);
        totolApiTime = totolApiTime.toFixed(2);

        if (type == '刷新结果') {
            $table.html('');
        }
        html = '<tr>' +
            '<td>'+type+'</td>' +
            '<td>'+totalTime+'ms</td>' +
            '<td>'+totalSizeGzip+'kb</td>' +
            '<td>'+totalSize+'kb(首次加载有效)</td>' +
            '<td>'+totolApiTime+'ms</td>' +
            '</tr>';


        $table.append(html);

        $apiTable.html(apiHtml);
    }

    // 执行url过滤操作
    function execUrlRules(data, urlReg) {
        var newData = [], kinds;
        data.forEach(function (item) {
            if(urlReg.test(item.name)) {
                newData.push(item);
            }
        });
        kinds = kindData(newData);
        renderGeneralData(newData, kinds, '过滤结果');
    }



    // 对数据进行分组
    function kindData(data) {
        var js = [], css = [], image = [], api = [], other = [], kinds;
        data.forEach(function (item) {
            var mimeType = item.req.response.content.mimeType;
            if (mimeType.indexOf('json') >=0 || (mimeType.indexOf('javascript') >= 0 && _.find(item.req.request.queryString, function (item) {if(item.name == 'callback'){return item;}}))) {
                api.push(item);
            } else if(mimeType.indexOf('css') >= 0) {
                css.push(item);
            } else if (mimeType.indexOf('javascript') >= 0) {
                js.push(item);
            } else if (mimeType.indexOf('image') >= 0) {
                image.push(item);
            } else {
                other.push(item);
            }
        });
        kinds = {
            js: js,
            css: css,
            image: image,
            api: api,
            other: other
        };
        return kinds;
    }

    // 合并entries数据与请求数据
    function merge_entries_and_netData(entries, netData) {

        var merge =  _.filter(entries, function (entries_item) {
            var temp = entries_item;
            netData.forEach(function (netData_item) {
                if (netData_item.request.url == temp.name) {
                    temp.req = netData_item;
                }
            });
            return temp;
        });
        return merge;
    }

    // 获取请求响应数据并执行回调
    function getEntries(fn) {
        if(chrome && chrome.devtools) {
            var devTools = chrome.devtools;
            var inspectedWindow = devTools.inspectedWindow;
            var evalStr = '(function(){var entries=window.performance.getEntries(),key,newArr=[];function copy(obj){var temp={},key;for(key in obj){temp[key]=obj[key]}return temp}entries.forEach(function(item){newArr.push(copy(item))});return newArr}());';
            inspectedWindow.eval(evalStr, function(result, e) {
                if(e) {
                    document.body.innerHTML = 'Eval code error : ' + e;
                } else {
                    if (_.isFunction(fn)) {
                        fn(result);
                    }
                }
            });
        } else {
            entries = window.performance.getEntries();
        }
    }
    var netData = [];
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
            netData.push({request: request.request, response: request.response});
    });
    

    

    // 初始化
    function init() {
        $('#apiStatus').html();
        getEntries(function (entries) {
            // 合并后的数据
            var merge = merge_entries_and_netData(entries, netData);
            globalData = merge;
            renderGeneralData(merge, kindData(merge), '刷新结果');
            eventUtil(merge);
        });
    }

    // 网络监控
    var monitor = {
        init: function () {
            $('#apiStatus').html();
            var self = this;
            chrome.devtools.network.onRequestFinished.addListener(
                function(request) {
                    self.apiMonitor(request);
            });
        },
        // 监控api请求
        apiMonitor: function (request) {
            var mimeType = request.response.content.mimeType;
            // 判断是否是api
            if (mimeType.indexOf('json') >=0 || (mimeType.indexOf('javascript') >= 0 && _.find(request.request.queryString, function (item) {if(item.name == 'callback'){return item;}}))) {
                getEntries(function (entries) {
                    var reverseEntries = entries.reverse(), temp;
                    _.find(reverseEntries, function (item) {
                        if (item.name == request.request.url) {
                            temp = item;
                            temp.req = request;
                            globalData.push(temp);
                            var gzip = request.response._transferSize, total = request.response.content.size,
                            url = item.name.indexOf('?') >= 0? item.name.substring(0, item.name.indexOf('?')) : item.name;
                            var tplData = [
                                    url, 
                                    request.response.status, 
                                    item.duration.toFixed(2)+'ms', 
                                    (gzip / 1024).toFixed(2)+'kb',
                                    (total / 1024).toFixed(2)+'kb'
                                ];
                            var apiTpl = getApiListTemplate(tplData);
                            $('#apiList').append(apiTpl);
                        }
                    });
                    eventUtil(globalData);
                });
            }
        }
    };
    w.berforeReload = function () {
        alert(1);
    };
    w.afterReload = function (msg) {
        init();
        // 开启监控
        window.setTimeout(function () {
            monitor.init();
        }, 1500);
    };

    var eventUtil = function (data) {
        var $execRules = $('#execRules');
        $execRules.off();
        $execRules.on('click', function () {
            var $inputs = $('#url_fliter_input'),
                reg = $inputs.val();
            reg = new RegExp(reg);
            execUrlRules(data, reg);
        });
    };


}(window));