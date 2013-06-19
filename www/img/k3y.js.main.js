"use strict"
Interface.main = {
	"init" : function () {
		var type      = Interface.data.type;
		var headID    = document.getElementsByTagName("head")[0];
		var cssNode   = document.createElement('link');
		cssNode.type  = 'text/css';
		cssNode.rel   = 'stylesheet';
		cssNode.href  = 'img/k3y.css.' + type + '.css';
		cssNode.media = 'screen';
		headID.appendChild(cssNode);
		
		$('.logo > img').attr('src', 'img/logo-'+type+'.png');
		var title = type.toUpperCase() + ' Remote Web Interface';
		/*var title = 'xK3y Remote Web Interface';
		if (type == 'ps3')
			title = '3Key Remote Web Interface'
		else if (type == 'wiiu')
			title = 'WiiKeU Remote Web Interface'*/
		$('title').html(title)

		//Notify Xbox users that they should change their settings
		if (navigator.userAgent == "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0; Xbox)") {
			Interface.utils.messageBox.create(Interface.data.messages["notify-xbox"]);
		}
	},
	"create" : {
		"gamepage" : function (args, xml) {
			var targs = args[1].split("&");
			var name  = targs[1];
			var id    = targs[0];

			var URL   = "covers/" + id + ".xml";

			var page = $("#game-page");
			page.find("#game-title").html("Loading " + unescape(name));
			page.find(".page-content").html("Loading info...");

			if (!xml) {
				$.ajax({
					type: "GET",
					url: URL,
					success: function(data) {
						var xml = $(data);
						Interface.main.create.gamepage(args, xml);
					},
					error: function() {
						$.ajax({
							type: "GET",
							url: "img/empty.xml",
							success: function(data) {
								var xml = $(data);
								Interface.main.create.gamepage(args, xml);
							}
						});
					}
				});
			}
			else {
				var title, summary, HTML, cover;
				title = xml.find("title").text();
				if (title == "No Title") {
					title = unescape(name);
				}

				cover   = "covers/" + id + ".jpg";
				
				summary = xml.find("summary").text();

				var infoitems = "";
				xml.find("infoitem").each(function() {
					var item   = $(this);
					var string = item.text();
					if (string.indexOf('www')==0 || string.indexOf('http')==0) {
						string = '<a href="'+string+'" target="_blank">'+string+'</a>';
					}
					infoitems += item.attr("name") + ": "+ string+'<br/>';
				});

				infoitems += "<br/>";

				HTML = '<div class="main-item gamepage-item active-game">';
				HTML += '<img class="gamepage-game" src="' + cover + '"/></div>';
				HTML += '<span class="gamepage-info">'
				HTML += infoitems;
				HTML += '</span>';
				HTML += summary;

				HTML += '<br/><br/>';
				HTML += '<div class="gamepage-buttonContainer">';
				HTML += '<a href="javascript:void(0)" onclick="Interface.utils.launch(\'' + id + '\')"><span class="prettyButton">Play</span></a>';
				HTML += '<a href="#favorites_game_manager-page?' + id + '&' + name + '"><span class="prettyButton">Manage lists</span></a>';
				HTML += '</div>';

				HTML += '<br class="clear"/>'

				page.find("#game-title").html(title);
				page.find(".page-content").html(HTML);
			}
		},
		"coverwall" : function () {
			if (!Interface.main.vars.made.coverwall) {
				var name, id, cover, activeClass;
				var HTML   = '';
				var games  = Interface.data.data.sorted;
				var active = Interface.data.data.active;

				var showTitles = Interface.data.storage.settings.get("coverwalltitle");
				
				var l      = games.length;
				for (var i = 0; i < l; i++) {
					name  = games[i].name;
					id    = games[i].id;
					cover = games[i].cover;
					
					activeClass = '';
					if (id == active) {
						activeClass = 'active-game';
					}

					HTML += '<a href="javascript:void(0);" onclick="Interface.utils.select(\'' + id + '&' + escape(name) + '\')">';
					HTML += '<div class="main-item coverwall-item '+activeClass+'">';
					if (showTitles)
						HTML += '<span class="coverwall-gametitle">' + name + '</span>';
					HTML += '<img class="coverwall-game" src="' + cover + '"/>';
					HTML += '</div></a>';
				}
				Interface.navigation.pages.setContent('coverwall-page', HTML);
				Interface.main.vars.made.coverwall = true;
			}
		},
		"gamelist" : function (force) {
			//var args = args[1];
			//console.time("gamelist");
			var args = document.getElementById('gameSortSelect').value;
			var games = [];
			var showLetters = true;

			if (args == "alphabetic") {
				games = Interface.data.data.sorted;
				showLetters = true;
				force = false;
			}
			else if (args == "mostplayed") {
				games = Interface.utils.getMostPlayed();
				showLetters = false;
			}
			else if (args == "lastplayed") {
				games = Interface.utils.getLastPlayed();
				showLetters = false;
			}

			if (args != Interface.main.vars.curList || force) {
				var name, id, cover, activeClass, letter, timesPlayed, lastPlayed, longTitle, obj;
				var HTML       = '';
				//var games      = Interface.data.data.sorted;
				var active     = Interface.data.data.active;
				var lastLetter = '';

				var l = games.length;
				for (var i = 0; i < l; i++) {
					name   = games[i].name;
					id     = games[i].id;
					cover  = games[i].cover;
					
					timesPlayed = Interface.data.storage.getTimesPlayed(id);
					lastPlayed  = Interface.data.storage.getLastPlayed(id);

					if ((timesPlayed == 0 && lastPlayed == 0) && (args == 'mostplayed' || args == 'lastplayed')) {
						continue;
					}

					if (showLetters) {
						letter = name.charAt(0).toUpperCase();
						if(Interface.utils.isNumber(letter)) {
							letter = '#';
						}
						if (HTML.indexOf('list-divider-'+letter)==-1) {
							HTML       += '<div class="main-item list-item-accent list-divider-' + letter + '"><span class="letter-item-text">';
							HTML       += letter;
							HTML       += '</span></div>';
							lastLetter = letter;
						}
					}

					if (lastPlayed == 0) {
						lastPlayed = 'never';
					} else {
						lastPlayed = new Date(lastPlayed);
						lastPlayed = lastPlayed.toLocaleDateString();
					}
					
					activeClass = false;
					if (id == active) {
						activeClass = true;
					}

					obj = {
						"onclick" : 'Interface.utils.select(\'' + id + '&' + escape(name) + '\')',
						"alt" : true,
						"active" : activeClass,
						"image" : cover,
						"title" : name,
						"sub" : 'Played ' + timesPlayed + ' times, last ' + lastPlayed
					}

					HTML += Interface.utils.html.menuItem(obj);
				}
				$('#listContent').html(HTML);
				Interface.main.vars.made.gamelist = true;
				Interface.main.vars.curList = args;
				//console.timeEnd("gamelist");
			}
		},
		"folders" : function (args) {
			if (args.length > 0 && Interface.main.vars.made.folders) {
				Interface.navigation.navigateTo(args[1]);
				return;
			}
			if (!Interface.main.vars.made.folders) {
				//console.time("folders");
				var dir, par, name, id, cover, activeClass, lastPlayed, timesPlayed, obj, htmlPar;
				var active  = Interface.data.data.active;
				var games   = Interface.data.data.games;
				var folders = Interface.data.data.folders

				var HTML = '';
				var HTMLToAppend = {};

				var l = folders.length;
				for (var i = 0; i < l; i++) {
					dir = escape(folders[i].dir);
					par = folders[i].par;
					if (!document.getElementById(dir + '-dir')) {
						Interface.navigation.pages.new(dir + '-dir', dir);
						obj = {
							"href" : '#folders-page?'+dir+'-dir',
							"id" : dir + '-item',
							"alt" : true,
							"title" : unescape(dir),
							"sub" : "Folder"
						}

						HTML = Interface.utils.html.menuItem(obj);

						if (!HTMLToAppend[par]) {
							HTMLToAppend[par] = '';
						}
						HTMLToAppend[par] += HTML;
					}
					if (!document.getElementById(dir + '-item')) {
						
					}
				}
				var l = games.length;
				for (var i = 0; i < l; i++) {
					name  = games[i].name;
					id    = games[i].id;
					cover = games[i].cover;
					par   = games[i].parent;

					timesPlayed = Interface.data.storage.getTimesPlayed(id);
					lastPlayed  = Interface.data.storage.getLastPlayed(id);
					if (lastPlayed == 0) {
						lastPlayed = 'never';
					} else {
						lastPlayed = new Date(lastPlayed);
						lastPlayed = lastPlayed.toLocaleDateString();
					}

					activeClass = false;
					if (id == active) {
						activeClass = true;
					}
					obj = {
						"onclick" : 'Interface.utils.select(\'' + id + '&' + escape(name) + '\')',
						"alt" : true,
						"active" : activeClass,
						"image" : cover,
						"title" : name,
						"sub" : 'Played ' + timesPlayed + ' times, last ' + lastPlayed
					}

					HTML = Interface.utils.html.menuItem(obj);
					/*if ($.isEmptyObject(HTMLToAppend[par])) {
						HTMLToAppend[par] = '';
					}*/
					if (!HTMLToAppend[par]) {
						HTMLToAppend[par] = '';
					}
					HTMLToAppend[par] += HTML;
				}
				for (var i in HTMLToAppend) {
					//Get the HTML
					HTML = HTMLToAppend[i];
					//If dir is HDD, put into main container
					if (Interface.utils.isHDD(i)) {
						htmlPar = 'folders-page';
					}
					//Otherwise prep html parent ID
					else {
						htmlPar = escape(i + '-dir');
					}
					//Append all HTML at once to parent container
					Interface.navigation.pages.addContent(htmlPar, HTML);
				}

				Interface.main.vars.made.folders = true;
				if (args.length > 0) {
					Interface.navigation.navigateTo(args[1]);
				}
				//console.timeEnd("folders");
				return;
			}
		},
		"favorites" : function (args) {
			if (args.length > 0 && Interface.main.vars.made.favorites) {
				Interface.navigation.navigateTo(args[1]);
				return;
			}
			else {
				var id, name, cover, href, activeClass, listName, desc, pageName, gameList, gameHTML, timesPlayed, lastPlayed, obj;
				var active   = Interface.data.data.active;
				var lists    = Interface.data.lists.getLists();
				var mainHTML = '';
				if (lists.length == 0) {
					obj = {
						"title" : 'No lists yet',
						"sub" : 'Go make some!'
					}
					mainHTML += Interface.utils.html.menuItem(obj);
				}
				else {
					var k, page;
					var l = lists.length;
					for (var i = 0; i < l; i++) {
						listName = lists[i].name;
						pageName = listName + "-listpage";
						desc     = (lists[i].desc ? lists[i].desc : "List");

						obj = {
							"href" : '#favorites-page?' + pageName,
							"alt" : true,
							"title" : unescape(listName),
							"sub" : desc
						}

						mainHTML += Interface.utils.html.menuItem(obj);

						gameList = lists[i].content;
						k = gameList.length;
						if (!Interface.navigation.pages.exists(pageName)) {
							Interface.navigation.pages.new(pageName, unescape(listName));
						}
						gameHTML = '';
						for (var j = 0; j < k; j++) {
							id    = gameList[j].id;
							name  = gameList[j].name;
							cover = 'covers/' + id + '.jpg';

							timesPlayed = Interface.data.storage.getTimesPlayed(id);
							lastPlayed  = Interface.data.storage.getLastPlayed(id);
							if (lastPlayed == 0) {
								lastPlayed = 'never';
							} else {
								lastPlayed = new Date(lastPlayed);
								lastPlayed = lastPlayed.toLocaleDateString();
							}

							activeClass = false;
							if (id == active) {
								activeClass = true;
							}

							obj = {
								"onclick" : 'Interface.utils.select(\'' + id + '&' + escape(name) + '\')',
								"alt" : true,
								"active" : activeClass,
								"image" : cover,
								"title" : name,
								"sub" : 'Played ' + timesPlayed + ' times, last ' + lastPlayed
							}

							gameHTML += Interface.utils.html.menuItem(obj);
						}

						Interface.navigation.pages.setContent(pageName, gameHTML);
					}
				}
				if (lists.length != 0) {
					obj = {
						"href" : "#favorites_list_manager-page",
						"title" : "List manager",
						"sub" : "Manage your lists",
						"active" : true
					}
					mainHTML += Interface.utils.html.menuItem(obj);
				}
				Interface.navigation.pages.setContent('favorites-page', mainHTML);
				Interface.main.vars.made.favorites = true;
				if (args.length > 0) {
					Interface.navigation.navigateTo(args[1]);
				}
			}
		},
		"favorites_game_manager" : function (args) {
			var args     = args[1].split("&");
			var id       = args[0];
			var name     = args[1];
			var lists    = Interface.data.lists.getLists(id);
			var toAdd    = lists.isAvailable;
			var toRemove = lists.isIn;

			var HTML = '';
			var l    = toAdd.length;
			if (l > 0) {
				for (var i = 0; i < l; i++) {
					HTML += '<option value="' + toAdd[i].name + '">' + unescape(toAdd[i].name) + '</option>';
				}
				$('.listsAddGameSelector').html(HTML);
				$('.listsDataAddListName').attr('value', toAdd[0].name);
				$('.gameManagerAddGame').removeClass("invis");
			}
			else {
				$('.gameManagerAddGame').addClass("invis");
			}

			HTML = '';
			var l = toRemove.length;
			if (l > 0) {
				for (var i = 0; i < l; i++) {
					HTML += '<option value="' + toRemove[i].name + '">' + unescape(toRemove[i].name) + '</option>';
				}
				$('.listsRemoveGameSelector').html(HTML);
				$('.listsDataRemoveListName').attr('value', toRemove[0].name);
				$('.gameManagerRemoveGame').removeClass("invis");
			}
			else {
				$('.gameManagerRemoveGame').addClass("invis");
			}

			$('.listsDataGameID').attr('value', id);
			$('.listsDataGameName').attr('value', name);
			$('.gameManagerGameName').html(name);
		},
		"favorites_list_manager" : function (args) {
			var lists    = Interface.data.lists.getLists();
			var HTML = '';
			var l    = lists.length;
			if (l > 0) {
				for (var i = 0; i < l; i++) {
					HTML += '<option value="' + lists[i].name + '">' + unescape(lists[i].name) + '</option>';
				}
				$('.listsManagerSelector').html(HTML);
				$('.listsManagerListName').attr('value', lists[0].name);
				$('.listManagerSelectList, .listManagerOptions').removeClass("invis");
				$('.listManagerNoLists').addClass('invis');
			}
			else {
				$('.listManagerSelectList, .listManagerOptions').addClass("invis");
				$('.listManagerNoLists').removeClass('invis');
			}
		},
		"recent" : function () {
			if (!Interface.main.vars.made.recentList) {
				Interface.main.vars.made.recentList = true;
				Interface.data.lists.updateRecent();
				return;
			}
			if (!Interface.main.vars.made.recent) {
				var list = Interface.data.lists.getLists();
				var index = Interface.data.lists.indexOf("Recently Added");
				list = list[index].content;
				var id, name, cover, href, activeClass, obj;
				var active = Interface.data.data.active;

				var HTML = '';
				var l = list.length;
				for (var i = 0; i < l; i++) {
					id    = list[i].id;
					name  = list[i].name;
					cover = 'covers/' + id + '.jpg';

					activeClass = false;
					if (id == active) {
						activeClass = true;
					}

					obj = {
						"onclick" : 'Interface.utils.select(\'' + id + '&' + escape(name) + '\')',
						"alt" : true,
						"active" : activeClass,
						"image" : cover,
						"title" : name,
						"sub" : 'Newly added'
					}

					HTML += Interface.utils.html.menuItem(obj);
				}
				Interface.navigation.pages.setContent('recent-page', HTML);

				Interface.main.vars.made.recent = true;
			}
		},
		"about" : function () {
			if (!Interface.main.vars.made.about) {
				var HTML = '';
				var temp;
				for (var i = 0; i < Interface.data.data.about.length; i++) {
					temp = Interface.data.data.about[i];
					HTML += '<div class="main-item"><span class="main-item-text item-text">';
					HTML += temp.item;
					HTML += '</span><span class="secondary-item-text item-text">';
					HTML += temp.value;
					HTML += '</span></div>';
				}
				HTML += '<div onclick="Interface.utils.easter();Interface.utils.messageBox.create(Interface.data.messages.changelog);" class="main-item"><span class="main-item-text item-text">Interface version</span><span class="secondary-item-text item-text">';
				HTML += Interface.data.version;
				HTML += '</span></div>';

				HTML += '<div class="main-item"><span class="main-item-text item-text">GUID</span><span class="secondary-item-text item-text">';
				HTML += Interface.data.data.storage.guid;
				HTML += '</span></div>';

				HTML += '<a href="http://k3yforums.com/" target="_blank"><div class="main-item"><span class="main-item-text item-text">Support</span><span class="secondary-item-text item-text">';
				HTML += 'http://k3yforums.com/';
				HTML += '</span></div></a>';

				HTML += '<a href="https://github.com/MrWaffle/K3y-Web-Interface" target="_blank"><div class="main-item"><span class="main-item-text item-text">Source on Github</span><span class="secondary-item-text item-text">';
				HTML += 'https://github.com/MrWaffle/K3y-Web-Interface';
				HTML += '</span></div></a>';

				Interface.navigation.pages.setContent('about-page', HTML);
				Interface.main.vars.made.about = true;
			}
		},
		"settings" : function () {
			if (!Interface.main.vars.made.settings) {
				var HTML = '';
				var settings = Interface.data.storage.settings.supported;
				var strings = Interface.data.storage.settings.strings;
				var l = settings.length;
				var obj;
				for (var i = 0; i < l; i ++) {
					obj = {
						"href" : "#settings-page",
						"onclick" : "javascript:Interface.data.storage.settings.handle(this)",
						"id" : "setting-" + settings[i],
						"title" : strings[settings[i]].title,
						"sub" : strings[settings[i]].desc
					}
					HTML += Interface.utils.html.menuItem(obj);
				}
				Interface.navigation.pages.setContent('settings-page', HTML);
				Interface.data.storage.settings.init();
				Interface.main.vars.made.settings = true;
			}
		}
	},
	"vars" : {
		"made" : {
			"gamelist"               : false,
			"coverwall"              : false,
			"folders"                : false,
			"favorites"              : false,
			"favorites_game_manager" : false,
			"favorites_list_manager" : false,
			"recent"                 : false,
			"recentList"			 : false,
			"about"                  : false,
			"settings"               : false,
			"index"                  : [
				"gamelist", "coverwall", "folders", "recent", "about", "settings"
			],
			"curList"				 : ""
		}
	}
}