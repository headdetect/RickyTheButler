var gui     = require('nw.gui'),
    fs      = require('fs'),
    mkdirp  = require('mkdirp');

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
    
    var server = {
        bind : "localhost",
        port   : 80
    };

    storage = {
        "commands" : commands,
        "options"  : server
    };

    mkdirp("./files/"); // Create the folders //
    saveStorage();
}

function saveStorage(onComplete) {
    fs.writeFile(storageLocation, JSON.stringify(storage), function(e) {
        if(e) throw e;

        console.log("Wrote to -> storage.json");
        if( onComplete !== null) 
            onComplete();
    });
}

function reloadCommandList() {
    fs.readFile("./files/storage.json", function(err, data) {
        if(err) throw err;

        storage = JSON.parse(data);

        // Fill list //

        var lstCommands = $("#lstCommands");
            lstCommands.html('');

        for (var i = 0; i < storage.commands.length; i++) {
            var command = storage.commands[i];

            var wrapper = $("<a href='javascript:void(0)' onclick='loadCommandView(" + i + ")' class='list-group-item'><b>" + command.name + "</b><p class='list-group-item-text text-muted'>" + command.url + "</p></a>");
            lstCommands.prepend(wrapper);
        }
    });
}


function loadCommandView(index) {
    if( index == -1 ) {
        storage.commands.push({
            name: "New Command",
            command: "",
            url: ""
        });
        index = storage.commands.length - 1;
    }
    
    var command = storage.commands[index];
    var commandArea = $("#command-area");

    
    // Fill Command Area //
    $("#txtCommandTitle").data("id", index);
    $("#btnSaveCommand").data("id", index);
    $("#txtCommandTitle").text(command.name);
    $("#txtCommand").val(command.command);
    $("#txtUrl").val(command.url);
    
    commandArea.show();
};



(function($) {
    reloadCommandList();

    $("#close").click(function() {
        win.close();
    }); 
    
    $("#txtCommandTitle").click(function() {
        var commandID = $(this).data("id");
        bootbox.prompt("Rename this command to?", function(result) {                
            if (result !== null) {                                             
                 storage.commands[commandID].name = result;    
                loadCommandView(commandID);
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
        command.name = $("#txtCommandTitle").text();
        command.command = $("#txtCommand").val();
        command.url = $("#txtUrl").val();
        
        saveStorage(function(){
            reloadCommandList();
            $this.button('reset');
        });
    });
    
    
})(jQuery);