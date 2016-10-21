

/**
 * tmw.youtube.players.js
 * @version: v1.0.0
 * @author: Augusto TMW
 *
 * Created by Augusto TMW on 2016-10-20. Please report any bug at augustotmw@gmail.com
 *
 * Copyright (c) 2016 Augusto TMW augustotmw@gmail.com
 *
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 * 
 * 
 * Objective:
 * 
 * This algoritm has as objective get/generate the instances from youtube's players on page and easy work with them.
 * 
 * 
 * To-do next:
 *  - Play routines
 *  - Stop routines
 * 
**/


'use strict';


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

    var aux_iframes = document.querySelectorAll ? document.querySelectorAll('iframe') : document.getElementsByTagName('IFRAME');
    var $iframes = new Array();

    for(var i=0; i<aux_iframes.length; i++) {
        if(aux_iframes[i].src.indexOf('youtube') != -1) {
            $iframes.push(aux_iframes[i]);
        }
    }

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
                for(var i=0; i < $iframes.length; i++) {
                    $iframes[i].id = $iframes[i].id != "" ? $iframes[i].id : "ytPlayerVideo"+i;
                    list.push({
                        "id": $iframes[i].id, 
                        "inst": new YT.Player($iframes[i].id+"", {
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
            console.warn ? console.warn("TMW's Youtube Player Controller warns: Limit to try load Youtube API reached. ("+opts.secsToWaitYoutubeLoadAPI+" times)") : false;
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
            nowPlaying = false;
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

var YTMWOnLoadBody = function() {
    window.ytplayers = new YTMWPlayerCtrl();
}

if(document.body.onload) {
    var _oldOnLoadBody = document.body.onload;
    document.body.onload = function (e) {
        //console.log('document.body.onload')
        YTMWOnLoadBody();
        _oldOnLoadBody(e);
    }
} else {
    document.body.onload = YTMWOnLoadBody;
}

if(onYouTubeIframeAPIReady) {
    var oldYTReady = onYouTubeIframeAPIReady;
    onYouTubeIframeAPIReady = function(){
        //console.log('onYouTubeIframeAPIReady');
        window.ytAPILoaded = true;
        oldYTReady(arguments);
    }
} else {
    var onYouTubeIframeAPIReady = function(a,b){
        //console.log('onYouTubeIframeAPIReady');
        window.ytAPILoaded = true;
    }
}

