function initMacShortcuts() {
    key.filter = function(){ return true } // Don't ignore input, textareas and selects
    // Copy
    key('⌘+c, ctrl+c', function(){ document.execCommand("copy") } );
    // Pasta
    key('⌘+v, ctrl+v', function(){ document.execCommand("paste") } );
    // Cut
    key('⌘+x, ctrl+x', function(){ document.execCommand("cut") } );
}

initMacShortcuts();