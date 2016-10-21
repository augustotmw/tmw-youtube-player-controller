

var YTMWPlayerCtrl = function (opts) {
    var context = this;
    var list = new Array();
    var tryload = 0;
    var nowPlaying = null;

    //var $iframes = $(".ytplayer").length ? $(".ytplayer") : $("iframe[src*='youtube']");

    if(opts && typeof opts == "object") {
        opts.secsToWaitYoutubeLoadAPI = opts.secsToWaitYoutubeLoadAPI ? opts.secsToWaitYoutubeLoadAPI : 10;
    } else {
        opts = {
            secsToWaitYoutubeLoadAPI: 10
        };
    }

    var $iframes = document.querySelectorAll ? document.querySelectorAll('iframe') : document.getElementsByTagName('IFRAME');

    var evStateChange = function(s){
        //console.log(s);
        if(s.data == 1) {
            nowPlaying ? context.pause(nowPlaying) : false;
            nowPlaying = s.target.a.id;
        }
    }


    var feedList = function() {
        if(ytAPILoaded) {
            //console.log('ytapi loaded');
            if($iframes.length) {
                for(var i=0; i< $iframes.length; i++) {
                    this.id = "ytPlayerVideo"+i;
                    list.push({
                        "id": "ytPlayerVideo"+i, 
                        "inst": new YT.Player(this.id+"", {
                            events : {
                                "onStateChange" : evStateChange
                            }
                        })
                    });
                }

            } else {
                context.error = 404;
                context.errorStatus = 'No youtube video found on page.';
                console.warn ? console.warn("TMW's Youtube Player Controller warns: No youtube video found on page.") : false;
            }
        } else if(tryload < opts.secsToWaitYoutubeLoadAPI) {
            window.setTimeout(function(){
                tryload++;
                feedList();
            }, 1000);
        } else {
            context.error = 404;
            context.errorStatus = 'No youtube video found on page.';
            console.warn ? console.warn("TMW's Youtube Player Controller warns: No youtube video found on page.") : false;
            context.error = 'Too many tries to load Youtube API.';
        }
    }
    
    context.get = function(id) {

        if(id == "all") {
            return list;
        } else {
            for(var i = 0; i < list.length; i++) {
                if(id == list[i].id) {
                    return list[i];
                }
            }
        }

    }

    context.pause = function(id) {
        if(id == 'all') {
            for(var i = 0; i < list.length; i++) {
                list[i].inst.pauseVideo();
            }
        } else if(id == 'playing'){
            nowPlaying ? context.pause(nowPlaying) : false;
        } else {
            for(var i = 0; i < list.length; i++) {
                if(id == list[i].id) {
                    list[i].inst.pauseVideo();
                }
            }
        }
    }


    var init = function () {
        //console.log('init');
        feedList();

        return context;
    }

    init();
}

window.ytAPILoaded = false;

if(onYouTubeIframeAPIReady) {
    var oldReady = onYouTubeIframeAPIReady;
    onYouTubeIframeAPIReady = function(){
        //console.log('onYouTubeIframeAPIReady');
        window.ytAPILoaded = true;

        window.tmwYTPlayer = new YTMWPlayerCtrl();

        oldReady(arguments);
    }

} else {
    var onYouTubeIframeAPIReady = function(a,b){
        //console.log('onYouTubeIframeAPIReady');
        window.ytAPILoaded = true;

        window.tmwYTPlayer = new YTMWPlayerCtrl();

    }
}

