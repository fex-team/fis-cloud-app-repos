
$(document).ready(function(){
    //同步数据
    $('#syncBtn').click(function(event){
        var url = '/repos/sync?repos=localhost:3459&lastSyncTime=null&currentSyncTime=' + Date.parse(new Date()),
            options = {
                type: "GET",
                url: url,
                async: false,
                error: function(request){
//                    hint(request.responseText);
                    console.log("err" + request);
                },
                success: function(data){
//                    hint(data.msg + "\r\n redirect to your page now");
//                    setTimeout(function(){
//                        location.href = data.url;
//                    }, 2000);
                    console.log("succ" + data);
                }
            };

        $.ajax(options);
        event.preventDefault();

    });

    //更新配置 updateBtn
    $('#updateBtn').click(function(event){
        var url = '/repos/setting_set',
            options = {
                type: "POST",
                url: url,
                async: false,
                error: function(request){
//                    hint(request.responseText);
                    console.log("err" + request);
                },
                success: function(data){
//                    hint(data.msg + "\r\n redirect to your page now");
//                    setTimeout(function(){
//                        location.href = data.url;
//                    }, 2000);
                    console.log("succ" + data);
                }
            };

        $.ajax(options);
        event.preventDefault();

    });

    //删除log显示

});

function hint(msg){
    $('#hint').css("display", "blcok").text(msg).show();
};
