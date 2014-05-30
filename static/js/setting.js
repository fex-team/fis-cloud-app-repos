$(document).ready(function(){
    $('#syncBtn').click(function(event){
        var url = '/repos/sync?lastSyncTime=null&currentSyncTime=' + new Date(),
            options = {
                type: "POST",
                url: url,
                data: {
                    name : nameval,
                    auth : auth
                },
                async: false,
                error: function(request){
                    hint(request.responseText);
                },
                success: function(data){
                    hint(data.msg + "\r\n redirect to your page now");
                    setTimeout(function(){
                        location.href = data.url;
                    }, 2000);
                }
        };

        $.ajax(options);
        event.preventDefault();

    });
});
