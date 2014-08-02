

var gui     = require('nw.gui'),
    fs      = require('fs'),
    mkdirp  = require('mkdirp');

    var win = gui.Window.get();

var storageLocation = "./files/storage.json";

if(fs.existsSync(storageLocation)) {

    console.log("Storage.json was found");

} else {
    // Is first run //

    var commands = [];
    var options = {
        server : "localhost",
        port   : 80
    };

    var storage = {
        "commands" : commands,
        "options"  : options
    };

    mkdirp("./files/"); // Create the folders //
    fs.appendFile(storageLocation, JSON.stringify(storage), function(e) {
        if(e) throw e;

        console.log("Created storage.json");
    });
}

var storage;

fs.readFile("./files/storage.json", function(err, data) {
    if(err) throw err;

    storage = JSON.parse(data);

    // Fill list //

    var lstCommands = $("#lstCommands");

    for (var i = 0; i < storage.commands.length; i++) {
        var command = storage.commands[i];

        var wrapper = $("<a href='javascript:void(0)' onclick='loadCommandView(" + i + ")' class='list-group-item'>" + command.name + "</a>");
        lstCommands.prepend(wrapper);
    }
});



 var loadCommandView = function(index) {
    console.log(storage.commands[index].command);
};

(function($) {

    $("#close").click(function() {
        win.close();
    });
    
})(jQuery);