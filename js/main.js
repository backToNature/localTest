var program = {
    init: function () {
        this.getNetworkData();
    },
    sizeof: function (str, charset) {
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
    },
    getNetworkData: function () {
        var _this = this;
        chrome.devtools.network.getHAR(function (harLog) {
//            var item;
//            for (item in harLog) {
//                $('#data').append('<p>'+item+':'+ harLog.item + '</p>');
//            }
        });
        chrome.devtools.network.onRequestFinished.addListener(function(Request) {
//            Request.getContent(function (content) {
//                $('#data').append('<p>' + content  + '</p>');
//            });
        });

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
};
program.init();