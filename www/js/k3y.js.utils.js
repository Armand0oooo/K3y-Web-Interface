"use strict";var Interface={init:function(){Interface.data.poll(true);Interface.utils.messageBox.create(Interface.data.messages["notify-init"])},navigation:{pages:{list:{"home-page":function(){return},"game-page":function(a){Interface.main.create.gamepage(a)},"coverwall-page":function(){Interface.main.create.coverwall()},"list-page":function(){Interface.main.create.gamelist()},"folders-page":function(a){Interface.main.create.folders(a)},"favorites-page":function(a){Interface.main.create.favorites(a)},"favorites_game_manager-page":function(a){Interface.main.create.favorites_game_manager(a)},"favorites_list_manager-page":function(a){Interface.main.create.favorites_list_manager(a)},"favorites_mass_add-page":function(){return},"recent-page":function(){Interface.main.create.recent()},"about-page":function(){Interface.main.create.about()},"settings-page":function(){Interface.main.create.settings()}},create:function(e,b,c){if(e.indexOf("%")==-1){e=escape(e)}var a=Interface.data.storage.settings.get("doublewidth");var d='<div id="'+e+'" class="page'+(a?" page-double":"")+'"><div class="page-title">'+unescape(b)+'</div><div class="page-content"></div></div>';$("#main").append(d);if(!c){c=function(){return}}Interface.navigation.pages.list[e]=c},remove:function(c){if(c.indexOf("%")==-1){c=escape(c)}var a=document.getElementById(c),b=$(a);b.remove();delete Interface.navigation.pages.list[c]},exists:function(b){var a;for(a in Interface.navigation.pages.list){if(Interface.navigation.pages.list.hasOwnProperty(a)){if(a==b){return true}}}return false},setContent:function(b,a){$('[id="'+b+'"]').children(".page-content").html(a)},addContent:function(c,b,a){if(!a){$('[id="'+c+'"]').children(".page-content").append(b)}else{$("#"+c).children(".page-content").prepend(b)}}},navigateTo:function(c){var b=this.pages.list,a=[];if(!c){c="home-page"}if(c.indexOf("#")==0){c=c.slice(1,c.length)}if(c.indexOf("?")!=-1){a=c.split("?",2);c=a[0];if(c=="folders-page"||c=="favorites-page"||(c=="game-page"&&this.currentStr=="game-page")){b[c](a);return}}if(c=="overlay"){history.back()}c=escape(c);if(!$.isFunction(b[c])){history.back();return}Interface.navigation.transition(c,a,b)},transition:function(c,b,a){if(Interface.utils.supportsAnimation()){$("#main").css({opacity:0});setTimeout(function(){$(".page.active").removeClass("active");$(document.getElementById(c)).addClass("active");$("#main").css({opacity:1})},250)}else{$(".page.active").removeClass("active");$(document.getElementById(c)).addClass("active")}if(c!="home-page"){var d=$(document.getElementById(c)).find("div.page-title");if(!d.hasClass("_buttons")){d.prepend('<a href="javascript:void(0)" onclick="history.back()"><img class="back-button" src="img/back.png" alt="Back"/></a>').prepend('<a class="tray-status-link" href="javascript:void(0);"><img class="tray-status-icon invis" src="img/disc.png" alt="Game loaded"/></a>').prepend('<a href="#home-page"><img class="home-button" src="img/home.png" alt="Home"/></a>');d.addClass("_buttons")}}Interface.utils.updateTrayIcon();this.previous=this.currentStr;if(this.currentStr!="game-page"){this.prevMenu=this.currentStr}this.currentStr=c;a[c](b)},previous:"",prevMenu:"",current:function(){var a=window.location.hash;a=a.slice(1,a.length);return a},currentStr:"",bareTitle:""},data:{startPoll:function(){var a=this.pollTime;this.pollTimer=setInterval(Interface.data.poll,a)},poll:function(a){Interface.utils.log("Starting poll...");if(a){this.startPoll()}$.ajax({type:"GET",url:"data.xml",dataType:"xml",success:function(b){Interface.utils.log("Poll success!");Interface.data.pollSuccess(b,a)},error:function(c,d,b){Interface.data.pollError(d,b)}})},pollSuccess:function(a,d){var c=$(a).find("GAMES").children("MOUNT").length,b=$(a).find("ACTIVE").text();if(!this.data.drives||c!=this.data.drives.length){Interface.utils.log("Starting update...");if(!d){Interface.utils.messageBox.create(Interface.data.messages["notify-dataUpdate"])}$.ajax({type:"GET",url:"store.sh",dataType:"json",success:function(e){if(e==null||e==""){e={}}Interface.data.update(a,e,d)},error:function(){Interface.data.update(a,{},d)}})}else{Interface.utils.log("No update needed...")}if(b!=this.active){this.data.active=b;Interface.utils.updateActive()}},pollError:function(d,a){var c="Error: "+d+"<br/>"+a;clearInterval(this.pollTimer);var b=Interface.data.messages["notify-pollError"];Interface.utils.messageBox.create(b)},update:function(e,D,B){var p=[],j=[],t=[],f=[],G=[],s=[],w,r,u,H,C,E,q,x,h,g,n,m,d,y,F,b,c,a,A,z,v;Interface.data.type=e.documentElement.nodeName.toLowerCase();if($.isEmptyObject(D.games)){D=Interface.data.storage.convert(D)}if(!D.guid||!D.vars||!D.vars.askedAnon){D.guid=Interface.utils.guid();if(!D.vars){D.vars={}}D.vars.askedAnon=true;Interface.utils.messageBox.create(Interface.data.messages["notify-anondata"])}g=e.documentElement.childNodes;y=g.length;for(A=0;A<y;A+=1){F=g[A];if(F.nodeType==3){A+=0}else{if(F.nodeType==1){if(F.nodeName=="ACTIVE"){d=F}else{if(F.nodeName=="GAMES"){n=F}else{if(F.nodeName=="ABOUT"){m=F}}}}}}y=n.childNodes.length;for(A=0;A<y;A+=1){q=n.childNodes[A];if(q.nodeType==3){A+=0}else{if(q.nodeType==1){p.push(q.getAttribute("NAME"));F=q.getElementsByTagName("DIR");z=F.length;for(v=0;v<z;v+=1){b=F[v];if(b.firstElementChild.nodeName=="MOUNT"){v+=0}else{w=b.getAttribute("NAME");r=b.parentNode.getAttribute("NAME");j.push({dir:w,par:r})}}F=q.getElementsByTagName("ISO");q=q.getAttribute("NAME");z=F.length;for(v=0;v<z;v+=1){c=F[v];H=c.firstElementChild.firstChild.nodeValue.replace(/\.iso/gi,"");u=c.lastElementChild.firstChild.nodeValue;r=c.parentNode.getAttribute("NAME");C="covers/"+u+".jpg";E="covers/"+u+".xml";t.push({id:u,name:H,parent:r,hdd:q,cover:C,info:E});if($.isEmptyObject(D.games[u])){D.games[u]={lastPlayed:0,timesPlayed:0,known:false}}D.games[u].hdd=q}}}}y=m.childNodes.length;for(A=0;A<y;A+=1){F=m.childNodes[A];if(F.nodeType==3){A+=0}else{H=F.getAttribute("NAME");x=F.firstChild;if(x){x=x.nodeValue}else{x="-"}if(H=="App"){Interface.data.firmware=x}f.push({item:H,value:x})}}if(d){if(d.firstChild){h=d.firstChild.nodeValue}}if(D.favLists!=undefined){G=D.favLists}if(D.settings!=undefined){$.extend(Interface.data.storage.settings.settings,D.settings);D.settings=Interface.data.storage.settings.settings}a=t.slice();a.sort(function(k,o){var l=String(k.name).toUpperCase(),i=String(o.name).toUpperCase();if(l>i){return 1}if(l<i){return -1}return 0});Interface.data.data={games:t,sorted:a,folders:j,drives:p,about:f,active:h,lists:G,storage:D};if(B){if(window.location.hash!=""){Interface.navigation.navigateTo(window.location.hash)}Interface.utils.messageBox.remove();Interface.main.init();if(Interface.data.storage.settings.get("updatecheck")){Interface.utils.checkUpdate()}}else{$.each(Interface.main.vars.made,function(i){Interface.main.vars.made[i]=false});Interface.main.vars.curList="";if(window.location.hash!=""){window.location.hash=""}}Interface.data.storage.save();if(Interface.data.storage.settings.get("prebuild")){Interface.main.create.gamelist();Interface.main.create.folders([])}if(Interface.data.storage.settings.get("cacheImages")){Interface.utils.messageBox.create(Interface.data.messages["notify-cache"]);y=t.length;for(A=0;A<y;A+=1){C=t[A].cover;s[A]=new Image();s[A].src=C}Interface.utils.messageBox.remove()}},lists:{getLists:function(a){if(a){var m=Interface.data.data.storage.favLists,f={isAvailable:[],isIn:[]},g,n,c,h=false,b=m.length,e,d;for(e=0;e<b;e+=1){g=m[e].content;c=g.length;for(d=0;d<c;d+=1){n=g[d];if(a==n.id&&(Interface.data.data.drives.indexOf(n.hdd)!=-1||n.hdd=="")){if(n.hdd==""&&!$.isEmptyObject(Interface.data.data.storage.games[a].hdd)){n.hdd=Interface.data.data.storage.games[a].hdd}f.isIn.push(m[e]);h=true;break}}if(!h){f.isAvailable.push(m[e])}h=false}return f}return Interface.data.data.storage.favLists},createList:function(d,f,c){if(!f){f=$(".listsDataGameID").val();c=$(".listsDataGameName").val();d=$(".listsNewListInput").val()}var a=this.getLists(),b,e;d=escape(d);if(Interface.data.lists.indexOf(d)!=-1){Interface.utils.messageBox.create(Interface.data.messages["notify-list-exists"]);return}b={id:f,name:c,hdd:Interface.data.data.storage.games[f].hdd};e={name:d,desc:"List",content:[b]};a.push(e);Interface.data.storage.save();if(Interface.navigation.current().indexOf("favorites")!=-1){window.onhashchange()}},addGame:function(g,e,d,f){if(!g){g=$(".listsDataGameID").val();e=$(".listsDataGameName").val();d=$(".listsDataAddListName").val()}var b={id:g,name:e,hdd:Interface.data.data.storage.games[g].hdd},a=this.getLists(),c=Interface.data.lists.indexOf(d);a[c].content.push(b);if(!f){Interface.data.storage.save()}if(Interface.navigation.current().indexOf("favorites_game")!=-1){window.onhashchange()}},removeGame:function(g,d){if(!g){g=$(".listsDataGameID").val();d=$(".listsDataRemoveListName").val()}var a=this.getLists(),c=Interface.data.lists.indexOf(d),f=a[c].content,b=f.length,e;for(e=0;e<b;e+=1){if(f[e].id==g){f.splice(e,1);Interface.data.storage.save();if(Interface.navigation.current().indexOf("favorites")!=-1){window.onhashchange()}return}}},indexOf:function(c){var a=this.getLists(),b=a.length,d;if(c.indexOf("%")==-1){c=escape(c)}for(d=0;d<b;d+=1){if(a[d].name==c){return d}}return -1},isInList:function(h,d){var a=this.getLists(),c=this.indexOf(d),g=a[c],f=g.content,b=f.length,e;for(e=0;e<b;e+=1){if(f[e].id==h){return true}}return false},updateRecent:function(){var e=Interface.data.data.sorted,f=e.length,d="Recently Added",m=(Interface.data.lists.indexOf(d)==-1?false:true),h=Interface.data.data.storage,b=false,c,a,j,k,g;for(g=0;g<f;g+=1){c=e[g].id;j=false;k=h.games[c];if(!k.known){j=true}if(j){k.known=true;a=e[g].name;if(m&&!b){Interface.data.lists.clear(d);b=true}if(m){Interface.data.lists.addGame(c,a,d)}else{Interface.data.lists.createList(d,c,a);m=true;b=true}}}Interface.data.storage.save();window.onhashchange()},clear:function(b){var a=Interface.data.lists.indexOf(b);Interface.data.data.storage.favLists[a].content=[];Interface.data.storage.save()},removeList:function(b){if(!b){b=$(".listsManagerListName").val()}var a=Interface.data.lists.indexOf(b);if(a!=-1){Interface.data.data.storage.favLists.splice(a,1)}Interface.data.storage.save();if(Interface.navigation.current().indexOf("favorites")!=-1){window.onhashchange()}},renameList:function(c,a){var d,e={},b;if(!a){if(!c){c=$(".listsManagerListName").val();d=Interface.data.messages["notify-list-rename"];e.title=d.title;e.content=d.content;e.content=d.content.replace(/%s/g,unescape(c));Interface.utils.messageBox.create(e);return}a=$(".listsRenameListInput").val();Interface.utils.messageBox.remove()}b=this.indexOf(c);Interface.data.data.storage.favLists[b].name=escape(a);Interface.data.storage.save();if(Interface.navigation.current().indexOf("favorites")!=-1){window.onhashchange()}},changeListDescription:function(b,e){var c,d={},a;if(!e){if(!b){b=$(".listsManagerListName").val();c=Interface.data.messages["notify-list-desc"];d.title=c.title;d.content=c.content;d.content=d.content.replace(/%s/g,unescape(b));Interface.utils.messageBox.create(d);return}e=$(".listsListDescInput").val();Interface.utils.messageBox.remove()}a=this.indexOf(b);Interface.data.data.storage.favLists[a].desc=escape(e);Interface.data.storage.save()},massAddToList:function(c,d){var e,a,b,k,j,f,g,h;if(!d){if(!c){c=$(".listsManagerListName").val();d=Interface.data.data.sorted;e=d.length;f="Mass adding to list: <b>"+unescape(c)+"</b><br/><br/>";for(g=0;g<e;g+=1){a=d[g].name;b=d[g].id;j=b+"&"+escape(a);f+='<input type="checkbox" value="'+j+'" '+(this.isInList(b,c)?"checked":"")+"></input>"+a+"<br/>"}f+="<br/><a onclick=\"Interface.data.lists.massAddToList('"+c+'\')"><span class="prettyButton">Go</span></a><a onclick="history.back();"><span class="prettyButton">Cancel</span></a><br/>';Interface.navigation.pages.setContent("favorites_mass_add-page",f);window.location.hash="#favorites_mass_add-page";return}h=$("#favorites_mass_add-page > .page-content > input:checked");d=[];$.each(h,function(){d.push($(this).val())});history.back()}this.clear(c);e=d.length;for(g=0;g<e;g+=1){k=d[g].split("&");a=unescape(k[1]);b=k[0];this.addGame(b,a,c,true)}Interface.data.storage.save()}},storage:{settings:{init:function(){var a=this.supported.length,c,b,d;for(c=0;c<a;c+=1){b=this.supported[c];d=this.settings[b];if(d){$("#setting-"+b).addClass("setting-enabled")}}},get:function(a){return(this.settings[a]||false)},set:function(a,b){this.settings[a]=Interface.data.data.storage.settings[a]=b;Interface.data.storage.save();return},handle:function(a){var d=a.children[0],b=d.id.split("-")[1],c;if(b=="clear"){Interface.data.storage.clear();return}c=this.settings[b];c=this.settings[b]=Interface.data.data.storage.settings[b]=!c;if(c){$(d).addClass("setting-enabled")}else{$(d).removeClass("setting-enabled")}Interface.data.storage.save();this.actions[b]()},actions:{oneclickload:function(){return},dynamicfont:function(){Interface.utils.messageBox.create(Interface.data.messages["notify-pagereload"])},coverwalltitle:function(){Interface.main.vars.made.coverwall=false;return},prebuild:function(){return},largeitems:function(){Interface.utils.messageBox.create(Interface.data.messages["notify-pagereload"])},dottext:function(){Interface.utils.messageBox.create(Interface.data.messages["notify-pagereload"])},gamenavigation:function(){return},cacheImages:function(){return},animations:function(){return},updatecheck:function(){return},anondata:function(){return},doublewidth:function(){Interface.utils.messageBox.create(Interface.data.messages["notify-pagereload"])},seperatehdd:function(){return}},settings:{oneclickload:false,dynamicfont:false,coverwalltitle:true,prebuild:false,largeitems:false,dottext:false,gamenavigation:false,cacheImages:false,animations:true,updatecheck:true,anondata:false,doublewidth:false,seperatehdd:false},supported:["oneclickload","dynamicfont","coverwalltitle","prebuild","largeitems","dottext","gamenavigation","cacheImages","animations","updatecheck","anondata","doublewidth","seperatehdd","clear"],strings:{oneclickload:{title:"One click load",desc:"Disables the game page and loads the game instantly"},dynamicfont:{title:"Dynamic font sizing",desc:"Adjusts the fontsize so the name of the game always fits"},coverwalltitle:{title:"Coverwall titles",desc:"Adds titles over the covers in Coverwall"},prebuild:{title:"Prebuild",desc:"Prebuild Folders &amp; Lists during init"},largeitems:{title:"Large list items",desc:"List items take up the entire width"},dottext:{title:"Show dots for clipped titles",desc:"Show '...' instead of cutting off titles"},gamenavigation:{title:"Game navigation",desc:"Navigate to the next or previous game in the list or folder"},cacheImages:{title:"Cache covers",desc:"Attempt to cache all the covers (serious performance impact)"},animations:{title:"Animations",desc:"Show animations during page transition"},updatecheck:{title:"Check for updates",desc:"Check for updates on every first launch of a day"},anondata:{title:"Anonymous data",desc:"Allow anonymous usage data collection with the random GUID"},doublewidth:{title:"Double page width",desc:"Double the maximum width of the page"},seperatehdd:{title:"Seperate HDDs in Folders",desc:"Seperate the HDDs instead of merging the folders"},clear:{title:"Clear data",desc:"Delete all the saved data"}}},getTimesPlayed:function(a){return Interface.data.data.storage.games[a].timesPlayed},getLastPlayed:function(a){return Interface.data.data.storage.games[a].lastPlayed},updateTimesPlayed:function(a){Interface.data.data.storage.games[a].timesPlayed+=1;return Interface.data.data.storage.games[a].timesPlayed},updateLastPlayed:function(a){Interface.data.data.storage.games[a].lastPlayed=Date.parse(new Date());return Interface.data.data.storage.games[a].lastPlayed},convert:function(g){var e={games:{},settings:{},favLists:[]},d,b,f,a,c;for(d in g){if(g.hasOwnProperty(d)){if(d.length==40){b=g[d];if($.isEmptyObject(b.lastPlayed)){b.lastPlayed=0}if($.isEmptyObject(b.timesPlayed)){b.timesPlayed=0}if($.isEmptyObject(b.known)){b.known=false}if($.isEmptyObject(b.hdd)){b.hdd=""}e.games[d]=b}}}if(!$.isEmptyObject(g.FavLists)){for(d in g.FavLists){if(g.FavLists.hasOwnProperty(d)){f=g.FavLists[d];a=f.length;b=[];for(c=0;c<a;c+=1){b.push({name:f[c].name,id:f[c].id,hdd:""})}e.favLists.push({name:escape(d),desc:"List",content:b})}}}if(!$.isEmptyObject(g.Settings)){e.settings=g.Settings}Interface.utils.messageBox.create(Interface.data.messages["notify-convert"]);return e},get:function(){return Interface.data.data.storage},save:function(){$.post("store.sh",JSON.stringify(Interface.data.data.storage))},clear:function(a){if(!a){Interface.utils.messageBox.create(Interface.data.messages["notify-clear"]);return}var c=Interface.data.data.storage,b;for(b in c.games){if(c.games.hasOwnProperty(b)){c.games[b].lastPlayed=0;c.games[b].timesPlayed=0;c.games[b].known=false}}c.favLists=[];c.settings={};this.save()}},pollTime:10000,pollTimer:0,version:"1.2",type:"xbox",firmware:"00.00",messages:{"notify-loading":{title:"Loading...",content:"Loading, please wait..."},"notify-xbox":{title:"Xbox IE Settings",content:"I see you're using your Xbox to view this interface. I'm prepared for that!<br/><br/>Can I just recommend that you tick the option \"Use my whole TV to show the webpage\" in IE's settings? Thanks!"},"notify-dataUpdate":{title:"Data updated",content:"It looks like the number of HDD's changed. This also means that the games have changed. In order to make sure that I continue to function properly, I updated myself, and reset you to the homepage to prevent any errors. <br/>Thanks for understanding!"},"notify-pollError":{title:"Data error",content:'There has been an error while retrieving data. Make sure the *K3y is turned on!<br/>Retrieving has been paused, press "Restart" to restart retrieving.<br/><br/><a onclick="Interface.data.startPoll(); Interface.utils.messageBox.remove();"><span class="prettyButton">Restart</span></a><br/>'},"notify-opentray":{title:"Loading Notification",content:"Please open your DVD tray"},"notify-gameloaded":{title:"Loading Notification",content:"Game loaded, have fun playing!"},"notify-reload":{title:"Loading Notification",content:"A game appears to be already loaded, please open your DVD tray and click 'Reload'<br/><br/>"},"notify-list-exists":{title:"List exists",content:"This list already exists, please pick another name!"},"notify-list-rename":{title:"Rename list",content:'Old name: <em>%s</em><br/>New name:<br/><input type="text" class="listsRenameListInput"></input> <a onclick="Interface.data.lists.renameList(\'%s\')"><span class="prettyButton">Go</span></a><br/>'},"notify-list-desc":{title:"Change description",content:'New description:<br/><input type="text" class="listsListDescInput"></input> <a onclick="Interface.data.lists.changeListDescription(\'%s\')"><span class="prettyButton">Go</span></a><br/>'},"notify-list-massadd":{title:"Mass Adding",content:'Mass adding for list: %s<br/><br/>%l<br/><a onclick="Interface.data.lists.massAddToList(\'%s\')"><span class="prettyButton">Go</span></a><br/>'},"notify-convert":{title:"Storage converted",content:"Your storage has been converted to the new standard. This WILL break apps that haven't updated their code to work with it. Please notify the developers of these apps and refer them to the API wiki. Thanks!"},"notify-clear":{title:"Clearing data",content:'This will clear all your data, are you sure?<br/><br/><a href="#settings-page" onclick="Interface.data.storage.clear(true); Interface.utils.messageBox.remove();"><span class="prettyButton">Yes</span></a><br/>'},"notify-anondata":{title:"Anonymous data",content:"<strong>Wait!</strong> Before you go and close this, I want to ask you something. I swear this will be the only time I'll ask you about it!<br/><br/>We made a <strong>pretty awesome</strong> page showing off some statistics among WiFi dongle users, you guys! In order to expand these statistics, I'm only asking you to allow me sending your current firmware and your game count. <strong>Nothing harmful!</strong> Whaddya say?<br/><br/><a onclick=\"Interface.data.storage.settings.set('anondata', true); Interface.utils.messageBox.remove();\"><span class=\"prettyButton\">Yes! Awesome! Allow!</span></a><a onclick=\"Interface.data.storage.settings.set('anondata', false);Interface.utils.messageBox.remove();\"><span class=\"prettyButton smallButton\">No, I'm boring!</span></a><br/><br/>It's always possible to change your opinion, just go to the Settings menu!<br/><br/><strong>You can find the statistics page in the About menu</strong><br/><br/>"},"notify-init":{title:"Loading",content:"Please wait while data is being loaded and processed..."},"notify-cache":{title:"Loading",content:"Caching all the covers..."},"notify-error":{title:"Error",content:'An error has occured. You can post this on the forums (link in "About") to get support and notify the developer about it<br/>(Error message from the console (F12) will be appreciated):<br/><br/>'},"notify-pagereload":{title:"Reload",content:"For this setting to take full effect, it's advised to reload the page."},"notify-firmware-update":{title:"Update available",content:"A new firmware is available for your device!<br/><br/>"},changelog:{title:"Changelog",content:'1.2<br/>- Update jQuery<br/>- Remove a load of old commented code<br/>- Change poll error message to be more understandable<br/>- Add tray icon that links to game<br/>- Fixed colored line disappearing in game page<br/>- Cleaned animations up a bit<br/>- UI overhaul, cleaner<br/><br/>1.1.3<br/>- Fix columns on coverwall search<br/><br/>1.1.2<br/>- Fix empty active node error<br/>- Fix game load message on 3k3y<br/>- Add HDD source to game details<br/>- Add options to seperate HDDs in Folder Structure<br/><br/>1.1.1<br/>- Double width option added<br/>- Search in coverwall<br/>- Column selection in coverwall<br/>- Properly update active game<br/>- Fix method for detecting HDD<br/><br/>1.1<br/>- Fix for empty folders<br/>- Fix for empty About nodes<br/>- Added larger item option<br/>- Added dots for clipped titles option<br/>- Added game navigation option<br/>- Fix title wrapping for large titles on small screens in game page<br/>- Added favicons and change them for each device.<br/><br/>1.0<br/>- Initial release<br/><br/><a onclick="Interface.utils.messageBox.create(Interface.data.messages.changelogdev);Interface.utils.messageBox.remove();"><span class="prettyButton smallButton">More...</span></a>'},changelogdev:{title:"Changelog",content:"Final 1<br/>- Get storage only on an update to decrease network activity<br/>- JSLint everything<br/>- Added caching option<br/>- Fixed some variable stuff<br/>- Add 3key nocover.jpg<br/><br/>Beta 12<br/>- Attempted fix for WP8 launching of games<br/>- Added video popup for YouTube links<br/>- Changed anchor CSS to cover correct area<br/>- Changed Coverwall title CSS position and font size<br/>- Custom escape function to prevent accidentally double escaping<br/>- Changed button CSS a bit to fix button breaking on small resolutions<br/>- Cleaned up HTML to be 100% valid HTML5<br/>- Fixed some (un)escaping<br/>- Fix HDD issue in parser<br/>- Enhance Coverwall CSS<br/>- Added click overlay to close popup<br/>- Overhaul the parser<br/>- Style game page infoitems some more<br/>- Clean up About screen</br>- Fix wrong default logo link<br/>- Added Statistics item in About<br/>- Slightly changed anondata message<br/>- Change firmware download button<br/><br/>Beta 11<br/>- Fixed saving of lastUpdateCheck<br/>- Updated update return message<br/>- Added poll error handling<br/><br/>Beta 10<br/>- Mass adding<br/>- Anchor title<br/>- Coverwall title overlay option<br/>- Fixed duplicate navigation buttons<br/>- Slightly changed width CSS<br/><br/>Beta 9<br/>- Links in game info is correctly colored and underlined<br/>- Changed update check submitted data<br/><br/>Beta 8<br/>- Only show animations if supported<br/>- Added version checking<br/><br/>Beta 7<br/>- Fixed Search<br/>- Fixed Recently Added<br/>- Replaced jQuery animations with CSS3<br/>- Added extra animation for secondary popup<br/>- Changed messageBox popup CSS<br/>- Slightly darkened main text<br/>- Added list manager<br/>- Added changelog"},test:{title:"Testing",content:"Let's see if this works"}},data:{}},utils:{html:{menuItem:function(g){var h="",b=Interface.data.storage.settings.get("dynamicfont"),e=(Interface.data.storage.settings.get("largeitems")&&g.supportLarge),f=Interface.data.storage.settings.get("dottext"),a="",d,c;if(!g.href){g.href="javascript:void(0);"}if(!g.onclick){g.onclick=""}if(!g.id){g.id=""}h+='<a href="'+g.href+'" onclick="'+g.onclick+'" title="'+(g.alt?g.title:"")+'">';h+="<div "+(g.id!=""?'id="'+g.id+'" ':"")+'class="main-item'+(g.active?" active-game":"")+(e?" main-item-large":"")+'">';if(g.image){h+='<img class="list-cover'+(e?" list-cover-large":"")+'" src="'+g.image+'" alt="Cover"/>'}if(b){d=g.title.width();if(d>330){c=(2/(d/330)).toFixed(2);a=' style="font-size:'+c+'em"'}}h+='<span class="main-item-text item-text'+(f?" main-item-text-dot":"")+'"'+a+">"+g.title+"</span>";h+='<span class="secondary-item-text item-text">'+g.sub+"</span>";h+="</div></a>";return h}},select:function(a){if(Interface.data.storage.settings.get("oneclickload")){this.launch(a.split("&")[0])}else{window.location.hash="#game-page?"+a}},selectNext:function(d){var b=Interface.navigation.prevMenu,a,c;if(b!=""){if(b=="coverwall-page"){a=$("[id="+b+"] a[onclick*="+d+"]").parent().next().children("a[onclick^=Interface]")}else{a=$("[id="+b+"] a[onclick*="+d+"]").nextAll("a[onclick^=Interface]").eq(0)}if(a.length<1){a=$("[id="+b+"] a[onclick^=Interface]").first()}if(a.length<1){window.location.hash="#"+b}else{a.click()}}else{window.location.hash=""}},selectPrev:function(d){var b=Interface.navigation.prevMenu,a,c;if(b!=""){if(b=="coverwall-page"){a=$("[id="+b+"] a[onclick*="+d+"]").parent().prev().children("a[onclick^=Interface]")}else{a=$("[id="+b+"] a[onclick*="+d+"]").prevAll("a[onclick^=Interface]").eq(0)}if(a.length<1){a=$("[id="+b+"] a[onclick^=Interface]").last()}if(a.length<1){window.location.hash="#"+b}else{a.click()}}else{window.location.hash=""}},launch:function(f){var a="launchgame.sh?"+f,b,e,c,d;$.ajax({type:"GET",url:"data.xml",cache:false,dataType:"xml",success:function(g){b=(Interface.data.type=="ps3key"?0:$(g).find("TRAYSTATE").text());e=$(g).find("GUISTATE").text();if(b==0&&e==1){$.get(a);Interface.utils.messageBox.create(Interface.data.messages["notify-gameloaded"]);Interface.utils.updateGameInfo(f)}else{if(b==1&&e==1){$.get(a);Interface.utils.messageBox.create(Interface.data.messages["notify-opentray"]);Interface.utils.updateGameInfo(f)}else{if(e==2){c=Interface.data.messages["notify-reload"];d={};d.title=c.title;d.content=c.content;d.content+='<a href="javascript:void(0)" onclick="Interface.utils.messageBox.remove();launchGame(\''+f+'\')"><span class="prettyButton">Reload</span></a><br/>';Interface.utils.messageBox.create(d)}}}}})},updateActive:function(){var a=Interface.data.data.active;$(".active-game").removeClass("active-game");if(a.length>0){$('a[onclick*="'+a+'"] > div').addClass("active-game")}this.updateTrayIcon()},updateTrayIcon:function(){var b=Interface.data.data.active;if(b&&b.length>0){var d=Interface.utils.getGame(b);var c="Interface.utils.select('"+d.id+"&"+escape(d.name)+"');";$(".tray-status-icon").removeClass("invis");$(".tray-status-link").attr("onclick",c);return}$(".tray-status-icon").addClass("invis")},updateGameInfo:function(d){var b=Interface.data.storage.updateTimesPlayed(d),a=Interface.data.storage.updateLastPlayed(d),c;Interface.data.data.active=d;Interface.data.storage.save();a=new Date(a);a=a.toLocaleDateString();c="Played "+b+" times, last "+a;$('a[onclick*="'+d+'"] > div > span.secondary-item-text').html(c);if(Interface.navigation.current()=="list-page"){Interface.main.create.gamelist(true)}},getMostPlayed:function(){var a=Interface.data.data.sorted.slice();a.sort(function(d,f){var e=Interface.data.storage.getTimesPlayed(d.id),c=Interface.data.storage.getTimesPlayed(f.id);return c-e});return a},getLastPlayed:function(){var a=Interface.data.data.sorted.slice();a.sort(function(d,f){var e=Interface.data.storage.getLastPlayed(d.id),c=Interface.data.storage.getLastPlayed(f.id);return c-e});return a},getGame:function(d){var c=Interface.data.data.games,a=c.length,b;for(b=0;b<a;b++){if(c[b].id==d){return c[b]}}},messageBox:{create:function(a){if(this.active==""){var b=$("#messageBox");b.find(".messageBox-title").html(a.title).append('<a href="javascript:void(0)" onclick="Interface.utils.messageBox.remove()"><img class="close-button" src="img/close.png" alt="Close"/></a>');b.find(".messageBox-content").html(a.content);this.active=a;this.show();this.scroll=window.scrollY;window.scrollTo(0,0);$(document).keydown(function(c){if(c.keyCode==27){Interface.utils.messageBox.remove();return false}})}else{this.queue.push(a)}},remove:function(){this.active="";if(this.queue.length>0){if(Interface.utils.supportsAnimation()){$("#messageBox").removeClass("notify");setTimeout(function(){$("#messageBox").addClass("notify")},10)}Interface.utils.messageBox.create(Interface.utils.messageBox.queue.shift())}else{$("#messageBox").removeClass("notify");this.hide();$(document).keydown(function(){return});window.scrollTo(0,this.scroll)}},show:function(){$(".other-container").addClass("overlap");if(Interface.utils.supportsAnimation()){$("#messageBoxContainer").addClass("fullopacity");$("#other").addClass("animate").css("opacity",1)}else{$("#messageBoxContainer").addClass("fullopacity");$("#other").css("opacity",1)}$("#overlay").css("height",$(document).height())},hide:function(a){if(Interface.utils.supportsAnimation()){$("#other").css({opacity:0});setTimeout(function(){$("#messageBoxContainer").removeClass("fullopacity");$("#other").removeClass("animate");Interface.utils.messageBox.end(a)},300)}else{$("#messageBoxContainer").removeClass("fullopacity");$("#other").css("opacity",0);Interface.utils.messageBox.end(a)}},end:function(a){$(".other-container").removeClass("overlap");$(".messageBox-content").html("");if(a){a()}},active:"",queue:[],scroll:0,t:0},overlay:{show:function(){$(".other-container").addClass("overlap");$("#messageBox").addClass("invis");if(Interface.utils.supportsAnimation()){$("#messageBoxContainer").addClass("fullopacity");$("#other").addClass("animate").css("opacity",1)}else{$("#messageBoxContainer").addClass("fullopacity");$("#other").css("opacity",1)}$("#overlay").css("height",$(document).height())},hide:function(){if(Interface.utils.supportsAnimation()){$("#other").css({opacity:0});setTimeout(function(){$("#messageBoxContainer").removeClass("fullopacity");$("#other").removeClass("animate");$("#messageBox").removeClass("invis")},300)}else{$("#messageBoxContainer").removeClass("fullopacity");$("#other").css("opacity",0);$("#messageBox").removeClass("invis")}},t:0},parseYouTubeURL:function(c){var b=/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/,a=c.match(b);if(a&&a[7].length==11){return a[7]}return""},videoPopup:function(b){var a={};a.title="Video Popup";a.content='<div class="videoWrapper"><iframe type="text/html" height="440" width="780" src="http://www.youtube.com/embed/'+b+'?autoplay=1&autohide=1&fs=1&html5=1" frameborder="0" ></iframe></div>';this.messageBox.create(a)},checkUpdate:function(){var a=Interface.data.data.storage.vars.lastUpdateCheck,j=new Date(new Date().toDateString()),l=false,b="http://xkeydownloads.com/check.php",g,c,i,h,e,f,k,n,m,d;if(!a){l=true}else{a=new Date(a);if(a<j){l=true}}if(l){g={};c=Interface.data.type;i=Interface.data.data.storage.guid;if(c=="wiikeu"){c="wkey"}if(Interface.data.storage.settings.get("anondata")){h=Interface.data.firmware;e=Interface.data.data.games.length;g={device:c,guid:i,version:h,games:e,origin:"officialweb"}}else{g={device:c,guid:i,origin:"officialweb"}}$.post(b,g,function(o){n={};try{n=JSON.parse(o)}catch(p){n.firmware="-1"}f=n.firmware;k=n.download;if(Interface.data.firmware<f){m=Interface.data.messages["notify-firmware-update"];d={};d.title=m.title;d.content=m.content;d.content+="Your version: "+Interface.data.firmware+"<br/>";d.content+="New version: "+f+"<br/><br/>";d.content+="<a href='"+k+"' target='_BLANK'><span class=\"prettyButton\">Download</span></a></a><br/>";Interface.utils.messageBox.create(d)}})}Interface.data.data.storage.vars.lastUpdateCheck=j.toDateString();Interface.data.storage.save()},easter:function(){var a=Interface.data.type;if(a=="wiikeu"){$(".logo > img").attr("src","img/logo-homemadeyo.png")}},guid:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(d){var b=Math.random()*16|0,a=d=="x"?b:(b&3|8);return a.toString(16)})},log:function(a){return},isNumber:function(a){return !isNaN(a-0)},isHDD:function(a){return(Interface.data.data.drives.indexOf(a)!=-1?true:false)},search:function(o){var h="",r=[],g=Interface.data.data.sorted,m=new RegExp(o,"i"),a,b,q,p,c,d,n,k,f=Interface.data.data.active,e=Interface.data.data.sorted.length,j;for(j=0;j<e;j+=1){if(m.test(g[j].name)){r.push(g[j])}}return r},supportsAnimation:function(){var a=document.body.style;if(a.transition==""){if(Interface.data.storage.settings.get("animations")){return true}}return false},errorHandler:function(c,b,a){var d=Interface.data.messages["notify-error"],e={};e.title=d.title;e.content=d.content;e.content+="Error: "+c+"<br/>At line: "+a+"<br/>For: "+b+"<br/>";Interface.utils.messageBox.create(e)}}};window.onhashchange=function(){Interface.navigation.navigateTo(window.location.hash)};$(document).ready(function(){Interface.init();window.onerror=Interface.utils.errorHandler});