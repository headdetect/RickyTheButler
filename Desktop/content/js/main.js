(function($) {



    $(document).ready(function() {

        if(typeof require !== 'undefined') {
            // Is node.js //

            var gui = require('nw.gui'); 
            var win = gui.Window.get();

            $("#close").click(function() {
                win.close();
            });
        }

        updateMedalCounts();
    });

    var oldMedals;
    var updateMedalCounts = function() {
        var apiUri = "js/example.json";
        var medals = getMedalCounts(apiUri);
        if(oldMedals) {
            var deltaGold, deltaSilver, deltaBronze;
            if(oldMedals.gold < medals.gold) {
                deltaGold = medals.gold - oldMedals.gold;
            }
            if(oldMedals.silver < medals.silver) {
                deltaSilver = medals.silver - oldMedals.silver;
            }
            if(oldMedals.bronze < medals.bronze) {
                deltaBronze = medals.bronze - oldMedals.bronze;
            }

            if(deltaGold > 0 || deltaSilver > 0 || deltaBronze > 0) {
                notifyNewMedal( deltaGold, deltaSilver, deltaBronze );
            }
        }
        oldMedals = medals;

        $("#medal-count-gold").text(medals.gold);
        $("#medal-count-silver").text(medals.silver);
        $("#medal-count-bronze").text(medals.bronze);


        window.setTimeout(updateMedalCounts,  /* Minutes */ /* Seconds */ 1000 /* Milliseconds */ )
    };

    var getMedalCounts = function(url) {
        var gold, silver, bronze;

        $.ajax({
            dataType: "json",
            url: url,
            async: false
        }).done(function(data) {
            gold = data.gold_count;
            silver = data.silver_count;
            bronze = data.bronze_count;
        });

        return {
            "gold" : gold,
            "silver" : silver,
            "bronze" : bronze
        }
    };

    var notifyNewMedal = function(gold, silver, bronze) {
        var gui = require('nw.gui'); 
        var win = gui.Window.open('notification.html', {
            id: "popup",
            position: 'center',
            height: 300,
            width: 500,
            frame: 'none'
        });
        win.alwaysOnTop(true);
        win.show();
        if(gold == 1) {
            alert("New Gold!");
        } else if(gold > 1) {
            alert(gold + " new gold medals!");
        }

        if(silver == 1) {
            alert("New Silver!");
        } else if(silver > 1) {
            alert(silver + " new silver medals!");
        }

        if(bronze == 1) {
            alert("New Bronze!");
        } else if(bronze > 1) {
            alert(bronze + " new bronze medals!");
        }
    };
})(jQuery);
