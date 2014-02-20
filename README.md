xbmc-api.js
===========

A wrapper of a JSON-RPC API for XBMC based on v6 (XBMC 12) in JavaScript for browsers.

Currently only Files and VideoLibrary are fully implemented, but I'm working slowly on the rest.

All files in this repository are licensed under 4-clause BSD, see LICENSE file for more details. Except all files under dependencies, those follow different ones.

Dependencies
-------------
1. jQuery JsonRpcClient Plugin
	a. jQuery
	b. jQuery JSON plugin


Sample Usage
-------------

```
var api = new XBMC()
var vl = new api.VideoLibrary()
var al = new api.AudioLibrary()
var f = new api.Files()
```

Then access to the methods as specified on the [api description page](http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6).

For example:
```
vl.getMovies([ "thumbnail", "year", "tagline" ], null, null, null, function(data) {
	console.log(data)
}, function(error) {
	console.log("ERROR:" + JSON.stringify(error))
})
```
