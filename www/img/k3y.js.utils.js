﻿"use strict"
//Some initting
window.onhashchange = function () {
	Interface.navigation.navigateTo(window.location.hash);
}

$(document).ready(function() {
	Interface.init();
	window.onerror = Interface.utils.errorHandler;
});

var Interface = {
	/**
		Init
	*/
	"init" : function () {
		Interface.data.poll(true);
		Interface.utils.messageBox.create(Interface.data.messages["notify-init"]);
	},
	/**
		Navigation
	*/
	"navigation" : {
		"pages" : {
			"list" : {
				"home-page"                   : function(){},
				"game-page"                   : function(args){Interface.main.create.gamepage(args)},
				"coverwall-page"              : function(){Interface.main.create.coverwall()},
				"list-page"                   : function(){Interface.main.create.gamelist()},
				"folders-page"                : function(args){Interface.main.create.folders(args)},
				"favorites-page"              : function(args){Interface.main.create.favorites(args)},
				"favorites_game_manager-page" : function(args){Interface.main.create.favorites_game_manager(args)},
				"favorites_list_manager-page" : function(args){Interface.main.create.favorites_list_manager(args)},
				"recent-page"                 : function(){Interface.main.create.recent()},
				"about-page"                  : function(){Interface.main.create.about()},
				"settings-page"               : function(){Interface.main.create.settings()}
			},
			"new" : function (id, name, func) {
				if (id.indexOf('%') == -1) {
					id = escape(id);
				}
				var page = '<div id="'+ id +'" class="page"><div class="page-title">'+unescape(name)+'</div><div class="page-content"></div></div>';
				//#main is the main container, append page to there
				$('#main').append(page);
				if (!func) {
					func = function(){};
				}
				//Register page
				Interface.navigation.pages.list[id] = func;
			},
			"remove" : function (id) {
				if (id.indexOf('%') == -1) {
					id = escape(id);
				}
				var selector = document.getElementById(id);
				var page = $(selector);
				//Clean up HTML
				page.remove();
				//Unregister page
				delete Interface.navigation.pages.list[id];
			},
			"exists" : function (id) {
				for (var page in Interface.navigation.pages.list) {
					if (page == id) {
						return true;
					}
				}
				return false;
			},
			"setContent" : function (id, HTML) {
				//$('#' + id).children('.page-content').html(HTML);
				$('[id="' + id +'"]').children('.page-content').html(HTML);
			},
			"addContent" : function (id, HTML, prepend) {
				//$('#' + id + ' > .page-content').html(HTML);
				//$(document.getElementById(id)).children('.page-content').html(HTML);
				//$('#' + id).children('.page-content').html(HTML);
				if (!prepend)
					$('[id="' + id +'"]').children('.page-content').append(HTML);
					//$('#' + id).children('.page-content').append(HTML);
				else 
					$('#' + id).children('.page-content').prepend(HTML);
			}
		},
		"navigateTo" : function (page) {
			//console.log(page);
			//console.time("navigate");
			var allPages = this.pages.list;
			var args = [];
			if (!page) {
				page = 'home-page';
			}
			//Do we have a "#" in the page string? cut it off
			if (page.indexOf('#') == 0) {
				page = page.slice(1,page.length);
			}
			//Parse arguments
			if (page.indexOf('?') != -1) {
				args = page.split('?',2);
				page = args[0];

				if (page == "folders-page" || page == "favorites-page"){
					/*console.log(args);
					page = args[1];*/
					allPages[page](args);
					return;
				}
			}
			//If hash is an overlay, go back
			if (page == 'overlay') {
				history.back();
			}
			//No "%"? Escape the page string to make sure we get it right
			if (page.indexOf('%') == -1) {
				page = escape(page);
			}

			if (Interface.data.storage.settings.get("animations")) {
				$('.page.active').fadeOut(200, function() {
					Interface.navigation.postTransition(page, args, allPages);
				});
			} else {
				Interface.navigation.postTransition(page, args, allPages);
			}
			//console.timeEnd("navigate");
		},
		"postTransition" : function (page, args, allPages) {
			$('.page.active').removeClass('active').hide();
			//Show requested page
			//$(document.getElementById(page)).addClass('active');
			if (Interface.data.storage.settings.get("animations")) {
				$(document.getElementById(page)).fadeIn(200).addClass('active');
				//$('[id="' + page +'"]').fadeIn(200).addClass('active');
				//Sometimes animation is a bitch, so we force opacity
				document.getElementById(page).style.opacity = 1;
			} else {
				$(document.getElementById(page)).addClass('active');
				//$('[id="' + page +'"]').addClass('active');
			}
			
			if (page != 'home-page') {
				$(document.getElementById(page)).find('div.page-title')
				//$('[id="' + page +'"]').find('div.page-title')
					.prepend('<a href="javascript:void(0)" onclick="history.back()"><img class="back-button" src="img/back.png"/></a>')
					.prepend('<a href="#home-page"><img class="home-button" src="img/home.png"/></a>');
			}
			
			if (!$.isFunction(allPages[page])) {
				//PANIC
				//A non-registered page has been requested
				//This function handles hashchanges
				//So it will loop until we get a safe page
				history.back();
				//Prevent calling page related functions
				return;
			}
			
			//Call function related to page
			allPages[page](args);
		},
		"current" : function () {
			var page = window.location.hash;
			page = page.slice(1,page.length);
			return page;
		}
	},
	/**
		Data
	*/
	"data" : {
		"startPoll" : function () {
			var pollTime   = this.pollTime;
			this.pollTimer = setInterval('Interface.data.poll()', pollTime);
		},
		"poll" : function (init) {
			Interface.utils.log("Starting poll...");
			if (init) {
				this.startPoll();
			}
			$.ajax({
				type: "GET",
				url: "data.xml",
				dataType: "xml",
				success: function(xml) {
					Interface.utils.log("Poll success!");
					$.ajax({
						type: "GET",
						url: "store.sh",
						dataType: "json",
						success: function(storage) {
							if (storage == null || storage == "")
								storage = {};
							Interface.data.pollSuccess(xml, storage, init);
						},
						error: function() {
							Interface.data.pollSuccess(xml, {}, init);
						}
					});
				},
				error : function(jqXHR, textStatus, error) {
					Interface.utils.log("Poll error!");
					Interface.utils.log("textStatus: "+textStatus);
					Interface.utils.log("error: "+error);
					Interface.data.pollError();
				}
			});
		},
		"pollSuccess" : function (xml, storage, init) {
			var HDDcount = $(xml).find('MOUNT').length;
			var ACTIVE   = $(xml).find('ACTIVE').text();
			
			//Check for change in HDD's
			if (!this.data.drives || HDDcount != this.data.drives.length) {
				Interface.utils.log("Starting update...");
				if (!init) {
					Interface.utils.messageBox.create(Interface.data.messages["notify-dataUpdate"])
				}
				this.update(xml, storage, init);
			}
			else {
				Interface.utils.log("No update needed...");
			}
			//Check for change in active game
			if (ACTIVE != this.active) {
				this.data.active = ACTIVE;
			}
		},
		"pollError" : function () {
			
		},
		"update" : function (xml, storage, init) {
			xml        = $(xml);
			var drives = [], dirs = [], isos = [], about = [], lists = [];
			var dir, par, id, name, cover, info, hdd;
			Interface.data.type = xml.get(0).documentElement.nodeName.toLowerCase();

			//DEBUG
			//storage = tempStorage;
			//DEBUG
			if ($.isEmptyObject(storage.games)) {
				storage = Interface.data.storage.convert(storage);
			}
			if (!storage.guid)
				storage.guid = Interface.utils.guid();

			xml.find('MOUNT').each(function() {
				hdd = $(this).attr('NAME');
				drives.push(hdd);

				$(this).find('DIR').each(function() {
					dir = $(this).attr('NAME');
					par = $(this.parentNode).attr('NAME');
					dirs.push({"dir" : dir, "par" : par});
				});

				$(this).find('ISO').each(function() {
					id    = $(this).find('ID').text();
					name  = $(this).find('TITLE').text().replace(/\.iso/gi,"");
					par   = $(this.parentNode).attr('NAME');
					cover = "covers/"+id+".jpg";
					info  = "covers/"+id+".xml";
					isos.push({ 
						"id"     : id,
						"name"   : name,
						"parent" : par,
						"hdd"    : hdd,
						"cover"  : cover,
						"info"   : info
					});
					if ($.isEmptyObject(storage.games[id])) {
						storage.games[id] = {
							"lastPlayed" : 0,
							"timesPlayed" : 0,
							"known" : false,
						};
					}
					storage.games[id].hdd = hdd;
				});
			});

			xml.find('ABOUT').find('ITEM').each(function() {
				about.push({item: $(this).attr('NAME'), value: $(this).text()});
			});

			//Active game
			var active = xml.find('ACTIVE').text();
			//Lists
			if (storage.favLists != undefined) {
				lists = storage.favLists;
			}
			if (storage.settings != undefined) {
				$.extend(Interface.data.storage.settings.settings, storage.settings);
			}
			
			//Sort games
			var sorted = isos.slice();
			sorted.sort(function(x,y) {
				var a = String(x.name).toUpperCase();
				var b = String(y.name).toUpperCase();
				if (a > b)
					return 1
				if (a < b)
					return -1
				return 0;
			});

			Interface.data.data = {
				"games"   : isos,
				"sorted"  : sorted,
				"folders" : dirs,
				"drives"  : drives,
				"about"   : about,
				"active"  : active,
				"lists"   : lists,
				"storage" : storage
			};

			$.each(Interface.main.vars.made, function(key){
				if (key != "index") {
					Interface.main.vars.made[key] = false;
				}
			});

			if (init) {
				if (window.location.hash != '') {
					Interface.navigation.navigateTo(window.location.hash);
				}
				Interface.main.init();
			}
			else if (!init) {
				if (window.location.hash != '') {
					Interface.navigation.navigateTo('');
				}
			}
			Interface.data.storage.save();
			if (Interface.data.storage.settings.get("prebuild")) {
				Interface.main.create.gamelist();
				Interface.main.create.folders([]);
			}
			Interface.utils.messageBox.remove();
		},
		"lists" : {
			"getLists" : function (id) {
				if (id) {
					var lists        = Interface.data.data.lists;
					var returnObject = {"isAvailable":[], "isIn":[]};

					var content, game, k;
					var flag = false;
					var l    = lists.length;

					for (var i = 0; i < l; i++) {
						content = lists[i].content;
						k       = content.length;
						for (var j = 0; j < k; j++) {
							game = content[j];
							if (id == game.id && (Interface.data.data.drives.indexOf(game.hdd) != -1 || game.hdd == "")) {
								if (game.hdd == "" && !$.isEmptyObject(Interface.data.data.storage.games[id].hdd)) {
									game.hdd = Interface.data.data.storage.games[id].hdd;
								}
								returnObject.isIn.push(lists[i]);
								flag = true;
								break;
							}
						}
						if (!flag) {
							returnObject.isAvailable.push(lists[i]);
						}
						flag = false;
					}
					return returnObject;
				}
				else {
					return Interface.data.data.lists;
				}
			},
			"createList" : function (listName, id, name) {
				if (!id) {
					id       = $('.listsDataGameID').val();
					name     = $('.listsDataGameName').val();
					listName = $('.listsNewListInput').val();
				}
				var lists = Interface.data.data.lists;
				listName = escape(listName);

				if (Interface.data.lists.indexOf(listName) != -1) {
					Interface.utils.messageBox.create(Interface.data.messages["notify-list-exists"]);
					return;
				}
				var game  = {
					"id"   : id,
					"name" : name,
					"hdd"  : Interface.data.data.storage.games[id].hdd
				}
				var list  = {
					"name"    : listName,
					"content" : [
						game
					]
				}
				lists.push(list);
				Interface.data.storage.save();
				if (Interface.navigation.current().indexOf('favorites') != -1) {
					window.onhashchange();
				}
			},
			"addGame" : function (id, name, listName) {
				if (!id) {
					id       = $('.listsDataGameID').val();
					name     = $('.listsDataGameName').val();
					listName = $('.listsDataAddListName').val();
				}
				var game = {
					"id"   : id,
					"name" : name,
					"hdd"  : Interface.data.data.storage.games[id].hdd
				}
				var lists = Interface.data.data.lists;

				var index = Interface.data.lists.indexOf(listName);
				lists[index].content.push(game);
				Interface.data.storage.save();
				if (Interface.navigation.current().indexOf('favorites') != -1) {
					window.onhashchange();
				}
			},
			"removeGame" : function (id, listName) {
				if (!id) {
					id       = $('.listsDataGameID').val();
					listName = $('.listsDataRemoveListName').val();
				}
				var lists = Interface.data.data.lists;
				var index   = Interface.data.lists.indexOf(listName);
				var content = lists[index].content;
				var l       = content.length;
				for (var i = 0; i < l; i++) {
					if (content[i].id == id) {
						content.splice(i, 1);
						Interface.data.storage.save();
						if (Interface.navigation.current().indexOf('favorites') != -1) {
							window.onhashchange();
						}
						return;
					}
				}
			},
			"indexOf" : function (listName) {
				var lists = Interface.data.data.lists;
				if (listName.indexOf('%') == -1) {
					listName = escape(listName);
				}
				var l = lists.length;
				for (var i = 0; i < l; i++) {
					if (lists[i].name == listName) {
						return i;
					}
				}
				return -1;
			},
			"updateRecent" : function () {
				var games = Interface.data.data.sorted;
				var l = games.length;
				var listName = "Recently Added";
				var lists = Interface.data.lists.getLists();
				var listExists = (Interface.data.lists.indexOf(listName) == -1 ? false : true);
				var storage = Interface.data.data.storage;

				var cleared = false;
				var id, name, flag, store;
				for (var i = 0; i < l; i++) {
					id = games[i].id;
					flag = false;
					store = storage.games[id];
					if (!store.known) {
						flag = true;
					}
					if (flag) {
						store.known = true;
						name = games[i].name;
						if (listExists && !cleared) {
							Interface.data.lists.clear(listName);
							cleared = true;
						}
						if (listExists) {
							Interface.data.lists.addGame(id, name, listName);
						}
						else {
							Interface.data.lists.createList(listName, id, name);
							listExists = true;
							cleared = true;
						}
					}
				}
				Interface.data.storage.save();
				window.onhashchange();
			},
			"clear" : function (listName) {
				var index = Interface.data.lists.indexOf(listName);
				Interface.data.data.lists[index].content = [];
				Interface.data.storage.save();
			},
			"removeList" : function (listName) {
				var index = Interface.data.lists.indexOf(listName);
				if (index != -1) {
					Interface.data.data.lists.splice(index, 1);
				}
				Interface.data.storage.save();
			}
		},
		"storage" : {
			"settings" : {
				"init" : function () {
					var l = this.supported.length;
					for (var i = 0; i < l; i++) {
						var key = this.supported[i];
						var setting = this.settings[key];
						if (setting) {
							$('#setting-' + key).addClass("setting-enabled");
						}
					}
				},
				"get" : function (setting) {
					return this.settings[setting];
				},
				"handle" : function (element) {
					var div = element.children[0];
					var setting = div.id.split("-")[1];
					if (setting == "clear") {
						Interface.data.storage.clear();
						return;
					}
					var entry = this.settings[setting];
					entry = this.settings[setting] = Interface.data.data.storage.settings[setting] = !entry;
					if (entry)
						$(div).addClass("setting-enabled");
					else 
						$(div).removeClass("setting-enabled");

					Interface.data.storage.save();

					this.actions[setting]();
				},
				"actions" : {
					"oneclickload" : function () {
						return;
					},
					"dynamicfont" : function () {
						Interface.utils.messageBox.create(Interface.data.messages["notify-pagereload"]);
					},
					"prebuild" : function () {
						return;
					},
					"animations" : function () {
						return;
					}
				},
				"settings" : {
					"oneclickload" : false,
					"dynamicfont"  : false,
					"prebuild"     : false,
					"animations"   : true
				},
				"supported" : [
					"oneclickload",
					"dynamicfont",
					"prebuild",
					"animations",
					"clear"
				],
				"strings" : {
					"oneclickload" : {
						"title" : "One click load",
						"desc"  : "Disables the game page and loads the game instantly"
					},
					"dynamicfont" : {
						"title" : "Dynamic font sizing",
						"desc"  : "Adjusts the fontsize so the name of the game always fits"
					},
					"prebuild" : {
						"title" : "Prebuild",
						"desc"  : "Prebuild Folders &amp; Lists during init"
					},
					"animations" : {
						"title" : "Animations",
						"desc"  : "Show animations during page transition"
					},
					"clear" : {
						"title" : "Clear data",
						"desc"  : "Delete all the saved data"
					}
					/*"" : {
						"title" : "",
						"desc"  : ""
					}*/
				}
			},
			"getTimesPlayed" : function (id) {
				return Interface.data.data.storage.games[id].timesPlayed;
			},
			"getLastPlayed" : function (id) {
				return Interface.data.data.storage.games[id].lastPlayed;
			},
			"updateTimesPlayed" : function (id) {
				return (Interface.data.data.storage.games[id].timesPlayed++ + 1);
			},
			"updateLastPlayed" : function (id) {
				return Interface.data.data.storage.games[id].lastPlayed = Date.parse(new Date);
			},
			"convert" : function (storage) {
				//Convert old storage to new storage
				var newStorage = {
					"games" : {},
					"settings" : {},
					"favLists" : []
				}
				for (var key in storage) {
					if (key.length == 40) {
						//If the key length is 40, its probably a game ID
						var temp = storage[key];
						if ($.isEmptyObject(temp.lastPlayed))
							temp.lastPlayed = 0;
						if ($.isEmptyObject(temp.timesPlayed))
							temp.timesPlayed = 0;
						if ($.isEmptyObject(temp.known))
							temp.known = false;
						if ($.isEmptyObject(temp.hdd))
							temp.hdd = "";
						newStorage.games[key] = temp;
					}
				}
				if (!$.isEmptyObject(storage.FavLists)) {
					var temp, list, hdd, l;
					for (var key in storage.FavLists) {
						list = storage.FavLists[key];
						l = list.length;
						temp = [];
						for (var i = 0; i < l; i++) {
							temp.push({
								"name" : list[i].name,
								"id"   : list[i].id,
								"hdd"  : ""
							})
						}
						newStorage.favLists.push({
							"name" : escape(key),
							"content" : temp
						});
					}
				}
				if (!$.isEmptyObject(storage.Settings))
					newStorage.settings = storage.Settings;
				Interface.utils.messageBox.create(Interface.data.messages['notify-convert']);
				return newStorage;
			},
			"get" : function () {
				return Interface.data.data.storage;
			},
			"save" : function () {
				$.post('store.sh', JSON.stringify(Interface.data.data.storage));
			},
			"clear" : function (confirm) {
				if (!confirm) {
					Interface.utils.messageBox.create(Interface.data.messages["notify-clear"]);
					return;
				}
				var storage = Interface.data.data.storage;
				for (var i in storage.games) {
					storage.games[i].lastPlayed = 0;
					storage.games[i].timesPlayed = 0;
					storage.games[i].known = false;
				}
				storage.favLists = [];
				storage.settings = {};
				this.save();
			}
		},
		"pollTime"  : 10000,
		"pollTimer" : 0,
		"version"   : "beta 6",
		"type"      : "xbox",
		"messages"  : {
			"notify-xbox" : {
				"title"   : "Xbox IE Settings",
				"content" : "I see you're using your Xbox to view this interface. I'm prepared for that! <br/><br/> Can I just recommend that you tick the option \"Use my whole TV to show the webpage\" in IE's settings? Thanks!"
			},
			"notify-dataUpdate" : {
				"title"   : "Data updated",
				"content" : "It looks like the number of HDD's changed. This also means that the games have changed. In order to make sure that I continue to function properly, I updated myself, and reset you to the homepage to prevent any errors. <br/>Thanks for understanding!"
			},
			"notify-opentray" : {
				"title"   : "Loading Notification",
				"content" : "Please open your DVD tray"
			},
			"notify-gameloaded" : {
				"title"   : "Loading Notification",
				"content" : "Game loaded, have fun playing!"
			},
			"notify-reload" : {
				"title"   : "Loading Notification",
				"content" : "A game appears to be already loaded, please open your DVD tray and click 'Reload'<br/><br/>"
			},
			"notify-list-exists" : {
				"title"   : "List exists",
				"content" : "This list already exists, please pick another name!"
			},
			"notify-convert" : {
				"title"   : "Storage converted",
				"content" : "Your storage has been converted to the new standard. This WILL break apps that haven't updated their code to work with it. Please notify the developers of these apps and refer them to the API wiki. Thanks!"
			},
			"notify-clear" : {
				"title"   : "Clearing data",
				"content" : "This will clear all your data, are you sure?<br/><br/><a href=\"#settings-page\" onclick=\"Interface.data.storage.clear(true); Interface.utils.messageBox.remove();\"><span class=\"prettyButton\">Yes</span></a><br/><br/>"
			},
			"notify-init" : {
				"title"   : "Loading",
				"content" : "Please wait while data is being loaded and processed..."
			},
			"notify-error" : {
				"title"   : "Error",
				"content" : "An error has occured. You can post this on the forums (link in \"About\") to get support and notify the developer about it<br/>(Error message from the console (F12) will be appreciated):<br/><br/>"
			},
			"notify-pagereload" : {
				"title"   : "Reload",
				"content" : "For this setting to take full effect, it's advised to reload the page."
			},
			"test" : {
				"title"   : "Testing",
				"content" : "Let's see if this works"
			}
		},
		"data" : {}
	},
	"utils" : {
		"html" : {
			"menuItem" : function (obj) {
				/*
				{
					"href" : "",
					"onclick" : "",
					"id" : "",
					"active" : false,
					"image" : "",
					"title" : "",
					"sub" : ""
				}
				*/
				var HTML = '';
				var fixTitle = false;
				if (Interface.data.storage.settings.get("dynamicfont"))
					fixTitle = true;

				if (!obj.href)
					obj.href = "javascript:void(0);";
				if (!obj.onclick)
					obj.onclick = "";
				if (!obj.id)
					obj.id = "";

				HTML += '<a href="' + obj.href + '" onclick="' + obj.onclick + '">';
				HTML += '<div id="' + obj.id + '" class="main-item ' + (obj.active ? 'active-game' : '') +'">';
				if (obj.image)
					HTML += '<img class="list-cover" src="' + obj.image + '"/>';

				var longTitle = '';
				if (fixTitle) {
					var width = obj.title.width();
					if (width > 330) {
						var size = (2 / (width / 330)).toFixed(2);
						longTitle = ' style="font-size:'+size+'em"'
					}
				}
				HTML += '<span class="main-item-text item-text"' + longTitle + '>' + obj.title + '</span>';
				HTML += '<span class="secondary-item-text item-text">' + obj.sub + '</span>';
				HTML += '</div></a>';
				return HTML;
			}
		},
		"select" : function (args) {
			if (Interface.data.storage.settings.get("oneclickload")) {
				this.launch(args.split("&")[0]);
			} else {
				//Interface.navigation.navigateTo("#game-page?"+args)
				window.location.hash = "#game-page?" + args;
			}
		},
		"launch" : function (id) {
			var url = "launchgame.sh?"+id;
			$.ajax({
				type: "GET",
				url: "data.xml",
				dataType: "xml",
				success: function(xml) {
					var tray = $(xml).find('TRAYSTATE').text();
					var guistate = $(xml).find("GUISTATE").text();
					if (tray == 0) {
						$.get(url);
						Interface.utils.messageBox.create(Interface.data.messages["notify-gameloaded"]);
						Interface.utils.updateGameInfo(id);
		            }
					else if (tray == 1 && guistate == 1) {
						$.get(url);
						Interface.utils.messageBox.create(Interface.data.messages["notify-opentray"]);
						Interface.utils.updateGameInfo(id);
					}
					else if (tray == 1 && guistate == 2) {
						var message = Interface.data.messages["notify-reload"];
						message.content += '<a href="javascript:void(0)" onclick="Interface.utils.messageBox.remove();launchGame(\''+id+'\')"><span class="prettyButton">Reload</span></a><br/>';
						Interface.utils.messageBox.create(message);
					}
				}
			});
		},
		"updateGameInfo" : function (id) {
			var timesPlayed = Interface.data.storage.updateTimesPlayed(id);
			var lastPlayed  = Interface.data.storage.updateLastPlayed(id);
			Interface.data.data.active = id;
			Interface.data.storage.save();

			lastPlayed = new Date(lastPlayed);
			lastPlayed = lastPlayed.toLocaleDateString();

			var HTML = 'Played ' + timesPlayed + ' times, last ' + lastPlayed;

			$('a[onclick*="'+id+'"] > div > span.secondary-item-text').html(HTML);

			if (Interface.navigation.current() == 'list-page') {
				Interface.main.create.gamelist(true);
			}
		},
		"getMostPlayed" : function () {
			var games = Interface.data.data.sorted.slice();
			games.sort(function(x,y) {
				var a = Interface.data.storage.getTimesPlayed(x.id);
				var b = Interface.data.storage.getTimesPlayed(y.id);
				return b - a;
			});
			return games;
		},
		"getLastPlayed" : function () {
			var games = Interface.data.data.sorted.slice();
			games.sort(function(x,y) {
				var a = Interface.data.storage.getLastPlayed(x.id);
				var b = Interface.data.storage.getLastPlayed(y.id);
				return b - a;
			});
			return games;
		},
		"messageBox" : {
			"create" : function(message){
				if (this.active == "") {
					var messageBox = $('#messageBox');

					messageBox.find('.messageBox-title').html(message.title)
						.append('<a href="javascript:void(0)" onclick="Interface.utils.messageBox.remove()"><img class="close-button" src="img/close.png"/></a>');
					messageBox.find('.messageBox-content').html(message.content);
					this.active = message;

					Interface.utils.overlay.show();
					this.show();
					this.scroll = window.scrollY;
					window.scrollTo(0, 0);
					$(document).keydown(function(e){
						if (e.keyCode == 27) {
							Interface.utils.messageBox.remove();
							return false;
						}
					});
				} else {
					this.queue.push(message);
				}
			},
			"remove" : function(){
				this.active = "";
				if (this.queue.length > 0) {
					this.hide(function() {
						Interface.utils.messageBox.create(Interface.utils.messageBox.queue.shift());
					});
				}
				else {
					this.hide();
					Interface.utils.overlay.hide();
					$(document).keydown(function(){});
					window.scrollTo(0, this.scroll);
				}
			},
			"show" : function () {
				$('.other-container').addClass("overlap");
				if (Interface.data.storage.settings.get("animations"))
					$('#messageBox').fadeIn(200).css("display", "inline-block").removeClass("invis");
				else 
					$('#messageBox').css("display", "inline-block").removeClass("invis");
			},
			"hide" : function (callback) {
				if (Interface.data.storage.settings.get("animations")) {
					$('#messageBox').fadeOut(200, function(){
						Interface.utils.messageBox.end(callback);
					});
				} else {
					$('#messageBox').hide();
					Interface.utils.messageBox.end(callback);
				}
			},
			"end" : function (callback) {
				$('#messageBox').addClass("invis");
				$('.other-container').removeClass("overlap");
				if (callback) {
					callback();
				}
			},
			"active" : "",
			"queue" : [],
			"scroll" : 0
		},
		"overlay" : {
			"show" : function() {
				if (Interface.data.storage.settings.get("animations")) {
					$('#overlay').fadeIn(200).removeClass("invis");
				} else {
					$('#overlay').show().removeClass("invis");
				}
			},
			"hide" : function() {
				if (Interface.data.storage.settings.get("animations")) {
					$('#overlay').fadeOut(200, function(){
						$(this).addClass("invis");
					});
				} else {
					$('#overlay').hide().addClass("invis");
				}
			}
		},
		"easter" : function () {
			var type = Interface.data.type;
			if (type == "wiikeu")
				$('.logo > img').attr('src', 'img/logo-homemadeyo.png');
		},
		"guid" : function () {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			    return v.toString(16);
			});
		},
		"log" : function (message) {
			var log = $('#debug');
			//log.append(message+"</br>");
		},
		"isNumber" : function (o) {
			return ! isNaN (o-0); 
		},
		"isHDD" : function (dir) {
			return (Interface.data.data.drives.toString().indexOf(dir)!=-1);
		},
		"search" : function (input) {
			var HTML = '';
			if (input.length == 0) {
				$('#searchResults').hide();
			}
			else {
				var games   = Interface.data.data.sorted;
				var pattern = new RegExp(input,"i");
				var name, id, cover
				var lastLetter ='';;
				var l       = Interface.data.data.sorted.length;
				for (var i = 0; i < l; i++) {
					if (pattern.test(games[i].name)) {
						name  = games[i].name;
						id    = games[i].id;
						cover = games[i].cover;

						timesPlayed = Interface.data.storage.getTimesPlayed(id);
						lastPlayed  = Interface.data.storage.getLastPlayed(id);
						if (lastPlayed == 0) {
							lastPlayed = 'never';
						} else {
							lastPlayed = new Date(lastPlayed);
							lastPlayed = lastPlayed.toLocaleDateString();
						}
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

						HTML  += '<a href="javascript:void(0);" onclick="Interface.utils.select(\'' + id + '&' + escape(name) + '\')">';
						HTML  += '<div class="main-item"><img class="list-cover" src="' + cover + '"/><span class="main-item-text item-text">';
						HTML  += name;
						HTML  += '</span><span class="secondary-item-text item-text">';
						HTML  += 'Played ' + timesPlayed + ' times, last ' + lastPlayed;
						HTML  += '</span></div></a>';
					}
				}
			}
			if (HTML == '') {
				$('#searchResults').hide();
				$('#listContent').show();
			} else {
				document.getElementById('searchResults').innerHTML = HTML;
				$('#listContent').hide();
				$('#searchResults').show();
			}
		},
		"errorHandler" : function (msg, url, line) {
			var message = Interface.data.messages["notify-error"];
			message.content += "Error: " + msg + "<br/>At line: " + line + "<br/>For: " + url + "<br/>";
			Interface.utils.messageBox.create(message)
		}
	}
}
