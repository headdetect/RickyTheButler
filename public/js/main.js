function saveStorage(t){fs.writeFile(storageLocation,JSON.stringify(storage),function(e){if(e)throw e;console.log("Wrote to -> storage.json"),null!==t&&"function"==typeof t&&t()})}function readStorage(t){fs.readFile("./files/storage.json",function(e,o){if(e)throw e;storage=JSON.parse(o),null!==t&&t()})}function reloadCommandList(){readStorage(function(){var t=$("#lstCommands");t.html("");for(var e=0;e<storage.commands.length;e++){var o=storage.commands[e],n=$("<a href='javascript:void(0)' data-id='"+e+"' onclick='loadCommandView("+e+")' class='list-group-item'><b>"+o.name+"</b><p class='list-group-item-text text-muted'>"+o.url+"</p></a>");t.prepend(n)}})}function startServer(){readStorage(function(){server=http.createServer(function(t){for(var e=0;e<storage.commands.length;e++){var o=storage.commands[e];if(o.url.toLowerCase()===t.url.toLowerCase())return executeCommand(o.command),void(t&&t.socket.end())}t&&t.socket.end()})}),win.on("close",function(){server&&server.close(),this.close(!0)})}function executeCommand(t){function e(t,e,o){storage.options.logOutput&&(e&&console.log(e),o&&console.error(o)),sys.puts(e)}exec(t,e)}function loadCommandView(t){$(".container .list-group-item").removeClass("active"),-1==t?(storage.commands.push({name:"New Command",command:"",url:""}),t=storage.commands.length-1,$("#btnDeleteCommand").hide(),$("#btnAddCommand.list-group-item").addClass("active")):($("#btnDeleteCommand").show(),$("#lstCommands .list-group-item[data-id="+t+"]").addClass("active"));var e=storage.commands[t],o=$("#command-area");$("#txtCommandTitle").data("id",t),$("#btnSaveCommand").data("id",t),$("#btnDeleteCommand").data("id",t),$("#txtCommandTitle").val(e.name),$("#txtCommand").val(e.command),$("#txtUrl").val(e.url),o.show()}var gui=require("nw.gui"),fs=require("fs"),mkdirp=require("mkdirp"),ip=require("ip"),http=require("http"),sys=require("sys"),exec=require("child_process").exec,win=gui.Window.get(),storageLocation="./files/storage.json",storage;if(fs.existsSync(storageLocation))console.log("Storage.json was found");else{var commands=[{name:"Lock Computer",command:"echo hi",url:"/lockcomputer"}],options={bind:"0.0.0.0",port:8080,logOutput:!0};storage={commands:commands,options:options},mkdirp("./files/"),saveStorage()}var tries=0,server;!function(t){t("[title]").tooltip(),t("#close-menu-item").click(function(){win.close()}),t("#settings-menu-item").click(function(){var e=t(".settings");"0px"==e.css("left")?(e.animate({left:"-250px"},300),t("#settings-menu-item").removeClass("active")):(e.animate({left:"0"},300),t("#settings-menu-item").addClass("active"))}),t("#info-menu-item").click(function(){var e=t(".info");"0px"==e.css("bottom")?(e.animate({bottom:"-31px"},300),t("#info-menu-item").removeClass("active")):(e.animate({bottom:"0"},300),t("#info-menu-item").addClass("active"))}),t("#minimize-menu-item").click(function(){var t,e=gui.Window.get();e.on("minimize",function(){this.hide(),t=new gui.Tray({icon:"img/icon-xs.png"}),t.on("click",function(){e.show(),this.remove(),t=null})}),e.minimize()}),t("#btnSaveSettings").click(function(){storage.options.bind=t("#txtIPAddress").val(),storage.options.port=t("#txtPort").val(),storage.options.logOutput=t("#chkCommandOutput").is(":checked"),saveStorage(function(){swal("Sweet!","Successfully saved settings!","success"),t(".settings").animate({left:"-250px"},300)})}),t("#txtCommandTitled").click(function(){var e=t(this).data("id");bootbox.prompt("Rename this command to?",function(t){null!==t&&(storage.commands[e].name=t,loadCommandView(e))})}),t("#btnDeleteCommand").click(function(){var e=t(this).data("id");bootbox.confirm("Are you sure you want to delete the command?",function(t){t&&(storage.commands.splice(e,1),saveStorage(function(){reloadCommandList()}))})}),t("#btnAddCommand").click(function(){loadCommandView(-1)}),t("#btnSaveCommand").click(function(){var e=t(this).data("id"),o=storage.commands[e],n=t(this);n.button("loading"),o.name=t("#txtCommandTitle").val(),o.command=t("#txtCommand").val(),o.url=t("#txtUrl").val(),saveStorage(function(){swal("Sweet!","Successfully saved command!","success"),reloadCommandList(),n.button("reset")})}),t("#btnDebugWindow").click(function(){win.showDevTools()}),readStorage(function(){t("#lblLocalIP").html(ip.address()+":<span class='text-muted'>"+storage.options.port+"</span>"),t("#txtIPAddress").val(storage.options.bind),t("#txtPort").val(storage.options.port),t("#chkCommandOutput").prop("checked",storage.options.logOutput)}),reloadCommandList(),startServer()}(jQuery);