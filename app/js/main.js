var gui     = require('nw.gui'),
    fs      = require('fs'),
    mkdirp  = require('mkdirp'),
    ip      = require('ip'),
    http    = require('http'),
    sys     = require('sys'),
    exec    = require('child_process').exec;



var win = gui.Window.get();

var storageLocation = "./files/storage.json";

var storage;

if(fs.existsSync(storageLocation)) {

    console.log("Storage.json was found");

} else {
    // Is first run //

    var commands = [{
            name : "Lock Computer",
            command : "echo hi",
            url : "/lockcomputer"
    }];

    var options = {
        bind      : "0.0.0.0",
        port      : 8080,
        logOutput : true
    };

    storage = {
        "commands" : commands,
        "options"  : options
    };

    mkdirp("./files/"); // Create the folders //
    saveStorage();
}

function saveStorage(onComplete) {
    fs.writeFile(storageLocation, JSON.stringify(storage), function(e) {
        if(e) throw e;

        console.log("Wrote to -> storage.json");
        if( onComplete !== null && typeof onComplete == "function" )
            onComplete();
    });
}

function readStorage(onComplete) {
    fs.readFile("./files/storage.json", function(err, data) {
        if(err) throw err;

        storage = JSON.parse(data);

        if (onComplete !== null)
            onComplete();
    })
}

function reloadCommandList() {

    readStorage(function() {
        // Fill list //

        var lstCommands = $("#lstCommands");
            lstCommands.html('');

        for (var i = 0; i < storage.commands.length; i++) {
            var command = storage.commands[i];

            var wrapper = $("<a href='javascript:void(0)' data-id='" + i + "' onclick='loadCommandView(" + i + ")' class='list-group-item'><b>" + command.name + "</b><p class='list-group-item-text text-muted'>" + command.url + "</p></a>");
            lstCommands.prepend(wrapper);
        }

    });
}

function startServer() {
    readStorage(function() {
        http.createServer(function(request, result) {
            for(var i = 0; i < storage.commands.length; i++) {
                var command = storage.commands[i];

                if(command.url.toLowerCase() === request.url.toLowerCase()) {
                    executeCommand(command.command);
                    if (request != null)
                        request.socket.end();
                    return;
                }
            }
            if (request != null)
                request.socket.end();
        }).listen(storage.options.port, storage.options.bind);
    });
}

function executeCommand(cmd) {
    function puts(error, stdout, stderror) {
        if(storage.options.logOutput) {
            if(stdout != "")
                console.log(stdout);
            if(stderror != "")
                console.error(stderror);
        }
        sys.puts(stdout);
    }

    exec(cmd, puts);
}

function loadCommandView(index) {
    if( index == -1 ) {
        storage.commands.push({
            name: "New Command",
            command: "",
            url: ""
        });
        index = storage.commands.length - 1;
        $("#btnDeleteCommand").hide();
    } else {
        $("#btnDeleteCommand").show();
    }

    $('#lstCommands .list-group-item').removeClass("active");
    $('#lstCommands .list-group-item[data-id=' + index + ']').addClass("active");
    
    
    var command = storage.commands[index];
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

    $("#close").click(function() {
        win.close();
    });


    $("#settings").click(function() {
        var settings = $(".settings");
        if (settings.css("left") == '0px'){
            settings.animate({ left: '-250px'}, 300);
        } else {
            settings.animate({ left: '0'}, 300);
        }
    })

    $("#minimize").click(function() {

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
        storage.options.bind = $("#txtIPAddress").val();
        storage.options.port = $("#txtPort").val();
        storage.options.logOutput = $("#chkCommandOutput").is(":checked");
        saveStorage(function() {
            // Close settings pane //
            swal("Sweet!", "Successfully saved settings!", "success");
            $(".settings").animate({ left: '-250px' }, 300);
            
        });
    });

    $("#txtCommandTitled").click(function() {
        var commandID = $(this).data("id");
        bootbox.prompt("Rename this command to?", function(result) {
            if (result !== null) {
                storage.commands[commandID].name = result;
                loadCommandView(commandID);
            }
        });
    });

    $("#btnDeleteCommand").click(function() {
        var commandID = $(this).data("id");
        bootbox.confirm("Are you sure you want to delete the command?", function(result) {
          if (result) {
            storage.commands.splice(commandID, 1);
            saveStorage(function(){
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
        var command = storage.commands[index];
        var $this = $(this);
        $this.button('loading')

        // Fill Command Area //
        command.name = $("#txtCommandTitle").val();
        command.command = $("#txtCommand").val();
        command.url = $("#txtUrl").val();


        saveStorage(function () {
            swal("Sweet!", "Successfully saved command!", "success");
            reloadCommandList();
            $this.button('reset');
        });
    });

    $("#btnDebugWindow").click(function() {
        win.showDevTools();
    });


    readStorage(function() {
        $('#lblLocalIP').html( ip.address() + ":<span class='text-muted'>" + storage.options.port + "</span>");

        $("#txtIPAddress").val(storage.options.bind);
        $("#txtPort").val(storage.options.port);
        $('#chkCommandOutput').prop('checked', storage.options.logOutput);
    });

    reloadCommandList();
    startServer();

})(jQuery);