# xbmc-api.js

A wrapper of a JSON-RPC API for XBMC based on v6 (XBMC 12) in JavaScript for browsers.

XBMC 13 should have more or less the same api, except for minor changes, so I will probably add support for it soon.

Currently only Files, VideoLibrary, AudioLibrary, Application, XBMC (also available under the main api), Addons, and GUI are fully implemented, but I'm working slowly on the rest.

All files in this repository are licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (CC-BY-NC-SA), see LICENSE file for full text. I am willing to relicense the code under different terms, please contact me at [tamer@tamersaadeh.com](mailto://tamer@tamersaadeh.com) to disscuss this.

## TODO
* add missing API
* add tests to the code (or at least test all functionalities)
* add more verbose and better examples

### Missing API (to be implemented)
* JSONRPC
* Player
* Playlist

## Sample Usage

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
