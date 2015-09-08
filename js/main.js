


(function (w) {
    var def = undefined;

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
                url = item.name.substring(0, item.name.indexOf('?'));

            apiHtml += '<tr>' +
                '<td>'+url+'</td>' +
                '<td>'+item.req.response.status+'</td>' +
                '<td>'+item.duration.toFixed(2)+'ms</td>' +
                '<td>'+(gzip / 1024).toFixed(2)+'kb</td>' +
                '<td>'+(total / 1024).toFixed(2)+'kb</td>' +
                '</tr>';
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
            '<td>总计</td>' +
            '<td>'+type+'</td>' +
            '<td>'+totalTime+'ms</td>' +
            '<td>'+totalSizeGzip+'kb</td>' +
            '<td>'+totalSize+'kb(首次加载有效)</td>' +
            '<td>'+totolApiTime+'ms</td>' +
            '</tr>';


        $table.append(html);

        $apiTable.html(apiHtml);
//        $('#data').append('<p>'+ JSON.stringify(kinds.image) +'</p>')
    }

    // 执行url过滤操作
    function execUrlRules(data, urlArr) {
        var newData = [], kinds;
        data.forEach(function (item) {
            urlArr.forEach(function (val) {
                if (item.name.indexOf(val) >= 0) {
                    newData.push(item);
                }
            });
        });
        kinds = kindData(newData);
        renderGeneralData(newData, kinds);

        kinds = kindData(newData);
        renderGeneralData(newData, kinds, '过滤结果');
    }



    // 对数据进行分组
    function kindData(data) {
        var js = [], css = [], image = [], api = [], other = [], kinds;
        data.forEach(function (item) {
            var mimeType = item.req.response.content.mimeType;
            if (mimeType.indexOf('javascript') >= 0 && _.find(item.req.request.queryString, function (item) {if(item.name == 'callback'){return item;}})) {
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

    // 获取请求响应数据
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
                    _.filter(entries, function (entries_item) {
                        var temp = entries_item;
                        netData.forEach(function (netData_item) {
                            if (netData_item.request.url == temp.name) {
                                temp.req = netData_item;
                            }
                        });
                        return temp;
                    });
                    renderGeneralData(entries, kindData(entries), '刷新结果');
                    eventUtil(entries);
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
            data2.push({request: request.request, response: request.response});
    });

    w.afterReload = function (msg) {
        getEntries(data2);
    };

    var eventUtil = function (data) {
        var $execRules = $('#execRules');
        $execRules.off();
        $execRules.on('click', function () {
            var $inputs = $('.url_fliter_input');
            var rules = [];
            $inputs.each(function () {
                if ($(this).val()) {
                    rules.push($(this).val());
                }
            });
            execUrlRules(data, rules);
        });
    };


}(window));