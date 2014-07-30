(function($) {

    $(document).ready(function() {

		var gui = require('nw.gui'); 
		var fs  = require('fs');
		
		var win = gui.Window.get();

		$("#close").click(function() {
			win.close();
		});
		
		if(fs.exists("./files/storage.json")) {
			
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
			
			fs.appendFile("./files/storage.json", JSON.stringify(storage), function(e) {
				if(e) throw e;
				
				console.log("Created storage.json");
			});
		}
    });

})(jQuery);
