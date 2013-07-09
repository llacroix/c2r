CommonJS to RequireJS instrumenter
=========================================


This is an instrumenter that will output Javascript code in a 
different directory. The process is quite simple. The script will require
all files in a project. Get the dependencies and output them in a instrumented
file.

For exemple:

    var path = require('path');
    var fs = require('fs');

    // code


Will get instrumented to:

    define(['path', 'fs'], function(path, fs) {
        var exports = {};

        var path = require('path');
        var fs = require('fs');

        // code

        return exports;
    });

In some ways, the parameters to the function can be avoided. The only necessary part is the 
dependencies declaration. Since requirejs allows the use of "require". 

The instrumented file will return exports. It means that almost any project written with commonjs
can be converted flawlessly to requirejs without much pain.

Warning 
========================================

This is a alpha project. It's not supposed to be ready for production. It kind of worked last time I tried. 
But I don't remember that it handled well relative paths for require. It should convert relative path
to absolute path to the file because nodejs is unable to do it properly...
