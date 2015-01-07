var gui     = require('nw.gui'),
    fs      = require('fs'),
    mkdirp  = require('mkdirp'),
    ip      = require('ip'),
    http    = require('http'),
    sys     = require('sys'),
    exec    = require('child_process').exec;



var win = gui.Window.get();

var settingsLocation = "./files/settings.json",
    commandsLocation = "./files/commands.json";

var settings,
    commands;

if(fs.existsSync(settingsLocation)) 
    console.log("settings.json was found");
else {
    // Is first run //

    settings = {
        bind      : "0.0.0.0",
        port      : 8080,
        logOutput : true
    };

    mkdirp("./files/"); // Create the folders //
    saveSettings();
}

if(fs.existsSync(commandsLocation)) 
    console.log("commands.json was found");
else {
    commands = [{
        name : "Lock Computer",
        command : "echo hi",
        url : "/lockcomputer"
    }];
    saveCommands();
}

function saveSettings(onComplete) {
    fs.writeFile(settingsLocation, JSON.stringify(settings), function(e) {
        if(e) throw e;

        console.log("Wrote to -> settings.json");
        if( onComplete !== null && typeof onComplete == "function" )
            onComplete();
    });
}
function saveCommands(onComplete) {
    fs.writeFile(commandsLocation, JSON.stringify(commands), function(e) {
        if(e) throw e;

        console.log("Wrote to -> commands.json");
        if( onComplete !== null && typeof onComplete == "function" )
            onComplete();
    });
}

function readSettings(onComplete) {
    fs.readFile(settingsLocation, function(err, data) {
        if(err) throw err;

        settings = JSON.parse(data);

        if (onComplete !== null)
            onComplete();
    })
}

function readCommands(onComplete) {
    fs.readFile(commandsLocation, function(err, data) {
        if(err) throw err;

        commands = JSON.parse(data);

        if (onComplete !== null)
            onComplete();
    })
}

function reloadCommandList() {
    readCommands(function() {
        // Fill list //

        var lstCommands = $("#lstCommands");
            lstCommands.html('');

        for (var i = 0; i < commands.length; i++) {
            var command = commands[i];

            var wrapper = $("<a href='javascript:void(0)' data-id='" + i + "' onclick='loadCommandView(" + i + ")' class='list-group-item'><b>" + command.name + "</b><p class='list-group-item-text text-muted'>" + command.url + "</p></a>");
            lstCommands.prepend(wrapper);
        }

    });
}

var tries = 0;
var server;
function startServer() {
    readCommands(function() {
        readSettings(function() {
            server = http.createServer(function(request, result) {
                for(var i = 0; i < commands.length; i++) {
                    var command = commands[i];

                    if(command.url.toLowerCase() === request.url.toLowerCase()) {
                        executeCommand(command.command);
                        if (request)
                            request.socket.end();
                        return;
                    }
                }
                if (request)
                    request.socket.end();
            });
            server.listen(settings.port, settings.bind);
        });
    });

    win.on("close", function() {
        try {
            if (server) 
                server.close();
        } catch(err) {
            console.log(err);
        }
        this.close(true);
    })
}

function executeCommand(cmd) {
    function puts(error, stdout, stderror) {
        if (settings.logOutput) {
            if (stdout)
                console.log(stdout);
            if (stderror)
                console.error(stderror);
        }
        sys.puts(stdout);
    }

    exec(cmd, puts);
}

function loadCommandView(index) {
    $('.container .list-group-item').removeClass("active");
    if( index == -1 ) {
        commands.push({
            name: "New Command",
            command: "",
            url: ""
        });
        index = commands.length - 1;
        $("#btnDeleteCommand").hide();
        $('#btnAddCommand.list-group-item').addClass("active");
    } else {
        $("#btnDeleteCommand").show();
        $('#lstCommands .list-group-item[data-id=' + index + ']').addClass("active");
    }

    
    
    
    var command = commands[index];
    var commandArea = $("#command-area");


    // Fill Command Area //
    $("#txtCommandTitle").data("id", index);
    $("#btnSaveCommand").data("id", index);
    $("#btnDeleteCommand").data("id", index);
    $("#txtCommandTitle").val(command.name);
    $("#txtCommand").val(command.command);
    $("#txtUrl").val(command.url);

    commandArea.show();
};



(function($) {
    $("[title]").tooltip();

    $("#close-menu-item").click(function() {
        win.close();
    });


    $("#settings-menu-item").click(function() {
        var $settings = $(".settings");
        if ($settings.css("left") == '0px'){
            $settings.animate({ left: '-250px'}, 300);
            $("#settings-menu-item").removeClass("active");
        } else {
            $settings.animate({ left: '0'}, 300);
            $("#settings-menu-item").addClass("active");
        }
    });

    $("#info-menu-item").click(function() {
        var info = $(".info");
        if (info.css("bottom") == '0px'){
            info.animate({ bottom: '-31px'}, 300);
            $("#info-menu-item").removeClass("active");
        } else {
            info.animate({ bottom: '0'}, 300);
            $("#info-menu-item").addClass("active");
        }
    })

    $("#minimize-menu-item").click(function() {

        var win = gui.Window.get();
        var tray;

        // Get the minimize event
        win.on('minimize', function() {
          // Hide window
          this.hide();

          // Show tray
          tray = new gui.Tray({ icon: 'img/icon-xs.png' });

          // Show window and remove tray when clicked
          tray.on('click', function() {
            win.show();
            this.remove();
            tray = null;
          });
        });

        win.minimize();

    });

    $("#btnSaveSettings").click(function() {
        settings.bind = $("#txtIPAddress").val();
        settings.port = $("#txtPort").val();
        settings.logOutput = $("#chkCommandOutput").is(":checked");
        saveSettings(function() {
            // Close settings pane //
            swal("Sweet!", "Successfully saved settings!", "success");
            $(".settings").animate({ left: '-250px' }, 300);
            
        });
    });

    $("#txtCommandTitled").click(function() {
        var commandID = $(this).data("id");
        bootbox.prompt("Rename this command to?", function(result) {
            if (result !== null) {
                commands[commandID].name = result;
                loadCommandView(commandID);
            }
        });
    });

    $("#btnDeleteCommand").click(function() {
        var commandID = $(this).data("id");
        bootbox.confirm("Are you sure you want to delete the command?", function(result) {
          if (result) {
            commands.splice(commandID, 1);
            saveCommands(function(){
                reloadCommandList();
            });
          }
        });
    });

    $("#btnAddCommand").click(function() {
        loadCommandView(-1);
    });

    $("#btnSaveCommand").click(function() {
        var index = $(this).data("id");
        var command = commands[index];
        var $this = $(this);
        $this.button('loading')

        // Fill Command Area //
        command.name = $("#txtCommandTitle").val();
        command.command = $("#txtCommand").val();
        command.url = $("#txtUrl").val();


        saveCommands(function () {
            swal("Sweet!", "Successfully saved command!", "success");
            reloadCommandList();
            $this.button('reset');
        });
    });

    $("#btnDebugWindow").click(function() {
        win.showDevTools();
    });


    readSettings(function() {
        $('#lblLocalIP').html( ip.address() + ":<span class='text-muted'>" + settings.port + "</span>");

        $("#txtIPAddress").val(settings.bind);
        $("#txtPort").val(settings.port);
        $('#chkCommandOutput').prop('checked', settings.logOutput);
    });

    reloadCommandList();
    startServer();

})(jQuery);