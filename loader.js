String.prototype.startsWith = function(prefix) {
        return this.indexOf(prefix) === 0;
}

String.prototype.endsWith = function(suffix) {
        return this.match(suffix+"$") == suffix;
};




var path = require("path");
var fs = require('fs');
var ncp = require("ncp").ncp;

function instrument (file, cb) {
    fs.readFile(file, 'utf8', function (err, old) {
        var d = 'module.exports = function (require) {\n' + old +
                '\n};';
        fs.writeFile(file, d, 'utf8', function (err, data) {
            cb(file, old);
        });
    });
}

function loadDeps(file, orig) {
    var loaded = {};
    var mod = require('./' + file);    

    var dirname = path.dirname(file);

    mod(function (pathName) {
        loaded[pathName] = true;
        
        if (pathName.startsWith(".")) {
            pathName = dirname + "/" + pathName;
        }

        return require(pathName);
    });

    var files = [];

    for (key in loaded) {
        files.push(key);
    }

    var inst = 'define(' + JSON.stringify(files) + ', function () {\n' +
               orig + '\n' +
               '});\n';

    fs.writeFile(file, inst, 'utf8', function(err, data) {
        console.log(file + ' instrumented');
    });
}


function batch(file) {
    instrument(file, loadDeps);
}

//["fun.js", "test.js"].map(batch);

function instrumentProject(source, callback) {
    ncp(source, source + '-i', function (err) {
        callback(source + '-i');
    });
}

// http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};


instrumentProject('src', function (basePath) {
    console.log('Ready to instrument: ' + basePath + '/');
    walk('./' + basePath, function (err, result) {
        result.map(batch);
    });
});
