/*
 * XBMC JSON-RPC API v6 (XBMC 12 and newer) wrapper
 * 
 * This wrapper was written by Tamer Saadeh <tamer@tamersaadeh.com>, 2014
 * 
 * Version: 0.4.1
 * 
 * This file is licensed under 4-clause BSD, see LICENSE file for more details
 */

// TODO: replace the dependency on jQuery/Json/JsonRpcClient
(function(window) {
	"use strict"

	/**
	 * This variable allows the direct function calls to the XBMC API server. It
	 * is useful for debugging and implementing new features.
	 */
	var directAccess = false

	/**
	 * Strings:
	 * 
	 * @string ERR_NOT_INITIALIZED when XBMC is not initialized
	 * @string DEFAULT_LOG_TAG is the default prefix tag for logging
	 */
	var ERR_NOT_INITIALIZED = "XBMC API not initialized! Call `new XBMC(hostname, port)`!"
	var DEFAULT_LOG_TAG = "XBMC API: "
	var ERR_AJAX_URL = "AJAX is not available"

	/**
	 * Helper function, just minimizes repetitions
	 */
	var MISSING_ERROR = function(e) {
		return e + " is not provided"
	}
	var ERR_TYPE = MISSING_ERROR("Type")
	var ERR_PATH = MISSING_ERROR("Path")
	var ERR_MEDIA = MISSING_ERROR("Media")
	var ERR_DIRECTORY = MISSING_ERROR("Directory")
	var ERR_EPISODE_ID = MISSING_ERROR("Episode ID")
	var ERR_SET_ID = MISSING_ERROR("Set ID")
	var ERR_MOVIE_ID = MISSING_ERROR("Movie ID")
	var ERR_MUSIC_VIDEO_ID = MISSING_ERROR("Music Video ID")
	var ERR_TV_SHOW_ID = MISSING_ERROR("TV Show ID")
	var ERR_ALBUM_ID = MISSING_ERROR("Album ID")
	var ERR_ARTIST_ID = MISSING_ERROR("Artist ID")
	var ERR_SONG_ID = MISSING_ERROR("Song ID")
	var ERR_VOLUME = MISSING_ERROR("Volume")
	var ERR_MUTE_TOGGLE = MISSING_ERROR("Mute Toggle")
	var ERR_BOOLEANS = MISSING_ERROR("Booleans array")
	var ERR_LABELS = MISSING_ERROR("Labels array")
	var ERR_ADDON_ID = MISSING_ERROR("Addon ID")
	var ERR_ENABLED = MISSING_ERROR("Enabled boolean")
	var ERR_WINDOW = MISSING_ERROR("Window")
	var ERR_FULLSCREEN = MISSING_ERROR("Fullscreen Toggle")
	var ERR_PROPERTIES = MISSING_ERROR("Properties")
	var ERR_MESSAGE = MISSING_ERROR("Message")
	var ERR_TITLE = MISSING_ERROR("Title")

	/**
	 * Create an undefined string
	 */
	var undef = "undefined"

	/**
	 * Create a function string
	 */
	var func = "function"

	/**
	 * Create a WebSocket string
	 */
	var WEBSOCKET = "WebSocket"

	/**
	 * Create a AJAX string
	 */
	var AJAX = "XMLHttpRequest"

	/**
	 * Default error handler (throws error).
	 */
	var errorHandler = function(e) {
		setTimeout(function() {
			throw new Error(DEFAULT_LOG_TAG + JSON.stringify(e))
		}, 0)
	}

	/**
	 * Default success handler (uses console.log, if available, else alert).
	 */
	var successHandler = function(e) {
		// define (or otherwise) console.log
		var console = (typeof console === undef) ? {
			log : function(str) {
				alert(str)
			}
		} : console
		setTimeout(function() {
			console.log(DEFAULT_LOG_TAG + JSON.stringify(e))
		}, 0)
	}

	/**
	 * RpcClient is a simple JSON-RPC 2.0 API to our uses only, but more
	 * simplified than used several dependencies
	 */
	var RpcClient = function(ajaxUrl, socketUrl) {
		if (typeof ajaxUrl === undef || !(AJAX in window))
			throw ERR_AJAX
		this.ajaxUrl = ajaxUrl
		this.ajax = new XMLHttpRequest(ajaxUrl)

		if (typeof socketUrl !== undef && WEBSOCKET in window) {
			this.socketUrl = socketUrl
			this.websocket = new WebSocet(socketUrl)
		}

		// used to keep track of the JSON RPC ID
		this.id = 0
	}

	RpcClient.prototype.callAJAX = function(method, params, successCB, errorCB) {
		// make sure they are actually functions
		successCB = typeof successCB === func ? successCB : successHandler
		errorCB = typeof errorCB === func ? errorCB : errorHandler
		var request = {
			jsonrpc : '2.0',
			method : method,
			params : params,
			id : this.id++
		}
		this.ajax.onreadystatechange = function() {
			if (this.ajax.readyState == 4 && this.ajax.status == 200)
				successCB(this.ajax.responseText)
			else
				errorCB(JSON.stringify(this.ajax))
		}
		xmlhttp.open("GET", this.ajaxUrl, true)
		xmlhttp.send(request)
	}

	RpcClient.prototype.call = function(method, params, successCB, errorCB) {
		// make sure they are actually functions
		successCB = typeof successCB === func ? successCB : successHandler
		errorCB = typeof errorCB === func ? errorCB : errorHandler
		var request = {
			jsonrpc : '2.0',
			method : method,
			params : params,
			id : this.id++
		}
		if (this.websocket) {
			this.websocket.onmessage = successCB
			this.websocket.onerror = errorCB
			this.websocket.send(request)
		} else {
			this.ajax.onreadystatechange = function() {
				if (this.ajax.readyState == 4 && this.ajax.status == 200)
					successCB(this.ajax.responseText)
				else
					errorCB(JSON.stringify(this.ajax))
			}
			xmlhttp.open("GET", this.ajaxUrl, true)
			xmlhttp.send(request)
		}
	}

	/**
	 * Private object for access the JSON-RPC API
	 */
	var rpc

	/**
	 * Global object used to initialize and access the XBMC API
	 * 
	 * @param hostname
	 *            used to specify the hostname of the XBMC JSON-RPC, optional
	 * @param port
	 *            used to specify the port of the XBMC JSON-RPC, optional
	 * @param ping
	 *            used to specify the number of milliseconds between each ping
	 *            to the server
	 * @param direct
	 *            used to specify if a direct access to the server should be
	 *            allowed by enabling the custom function
	 * @param debug
	 *            used to specify the successHandler's behavior; if true the
	 *            default successHandler is printing the result, otherwise
	 *            nothing happens on success; defaults to `debug = false`
	 */
	var XBMC = function(hostname, port, ping, direct, debug) {
		var h = hostname || window.location.hostname
		// TODO: I need to some how figure this port or ask for it
		var p = port || 9090
		var speed = ping || 1000
		directAccess = direct || directAccess

		rpc = new RpcClient({
			ajaxUrl : '/jsonrpc',
			socketUrl : 'ws://' + h + ':' + p + '/'
		})

		// if debug we print on success, otherwise we just eat it up
		if (!debug) {
			successHandler = function() {
			}
		}

		// To ensure the connection stays open, we ping it
		window.setInterval(function() {
			rpc.call('JSONRPC.Ping', {}, successHandler, errorHandler)
		}, speed)
	}

	/**
	 * A JS library wrapper for VideoLibrary API
	 * 
	 * @see http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#VideoLibrary
	 */
	// TODO: needs more testing
	var VideoLibrary = function() {
		if (typeof rpc === undef || rpc == null)
			throw ERR_NOT_INITIALIZED
	}

	// VideoLibrary API core methods
	VideoLibrary.prototype = {
		Clean : function(successCB, errorCB) {
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.Clean', {}, success, error)
		},
		Export : function(options, successCB, errorCB) {
			var params = {}
			if (typeof options !== undef)
				params.options = options
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.Export', params, success, error)
		},
		GetEpisodeDetails : function(episodeId, properties, successCB, errorCB) {
			if (typeof episodeId === undef)
				throw ERR_EPISODE_ID
			var params = {
				episodeid : episodeId
			}
			if (typeof properties !== undef)
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.GetEpisodeDetails', params, success, error)
		},
		GetEpisodes : function(tvShowId, season, properties, limits, sort, filter, successCB, errorCB) {
			var params = {}
			if (typeof tvShowId !== undef)
				params.tvshowid = tvShowId
			if (typeof season !== undef)
				params.season = season
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof limits !== undef)
				params.limits = limits
			if (typeof sort !== undef)
				params.sort = sort
			if (typeof filter !== undef)
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.GetEpisodes', params, success, error)
		},
		GetGenres : function(type, properties, limits, sort, successCB, errorCB) {
			if (typeof type === undef)
				throw ERR_TYPE
			var params = {
				type : type
			}
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof limits !== undef)
				params.limits = limits
			if (typeof sort !== undef)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.GetGenres', params, success, error)
		},
		GetMovieDetails : function(movieId, properties, successCB, errorCB) {
			if (typeof movieId === undef)
				throw ERR_MOVIE_ID
			var params = {
				movieid : movieId
			}
			if (typeof properties !== undef)
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.GetMovieDetails', params, success, error)
		},
		GetMovieSetDetails : function(setId, properties, movies, successCB, errorCB) {
			if (typeof setId === undef)
				throw ERR_SET_ID
			var params = {
				setid : setId
			}
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof movies !== undef)
				params.movies = movies
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.GetMovieSetDetails', params, success, error)
		},
		GetMovieSets : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof limits !== undef)
				params.limits = limits
			if (typeof sort !== undef)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.GetMovieSets', params, success, error)
		},
		GetMovies : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = {}
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof limits !== undef)
				params.limits = limits
			if (typeof sort !== undef)
				params.sort = sort
			if (typeof filter !== undef)
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.GetMovies', params, success, error)
		},
		GetMusicVideoDetails : function(musicVideoId, properties, successCB, errorCB) {
			if (typeof musicVideoId === undef)
				throw ERR_MUSIC_VIDEO_ID
			var params = {
				musicvideoid : musicVideoId
			}
			if (typeof properties !== undef)
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.GetMusicVideoDetails', params, success, error)
		},
		GetMusicVideos : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = {}
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof limits !== undef)
				params.limits = limits
			if (typeof sort !== undef)
				params.sort = sort
			if (typeof filter !== undef)
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.GetMusicVideos', params, success, error)
		},
		GetRecentlyAddedEpisodes : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof limits !== undef)
				params.limits = limits
			if (typeof sort !== undef)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.GetRecentlyAddedEpisodes', params, success, error)
		},
		GetRecentlyAddedMovies : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof limits !== undef)
				params.limits = limits
			if (typeof sort !== undef)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.GetRecentlyAddedMovies', params, success, error)
		},
		GetRecentlyAddedMusicVideos : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof limits !== undef)
				params.limits = limits
			if (typeof sort !== undef)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.GetRecentlyAddedMusicVideos', params, success, error)
		},
		GetSeasons : function(tvShowId, properties, limits, sort, successCB, errorCB) {
			if (typeof tvShowId === undef)
				throw ERR_TV_SHOW_ID
			var params = {
				tvshowid : tvShowId
			}
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof limits !== undef)
				params.limits = limits
			if (typeof sort !== undef)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.GetSeasons', params, success, error)
		},
		GetTVShowDetails : function(tvShowId, properties, successCB, errorCB) {
			if (typeof tvShowId === undef)
				throw ERR_TV_SHOW_ID
			var params = {
				episodeid : episodeId
			}
			if (typeof properties !== undef)
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.GetTVShowDetails', success, error)
		},
		GetTVShows : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = {}
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof limits !== undef)
				params.limits = limits
			if (typeof sort !== undef)
				params.sort = sort
			if (typeof filter !== undef)
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.GetTVShows', params, success, error)
		},
		RemoveEpisode : function(episodeId, successCB, errorCB) {
			if (typeof episodeId === undef)
				throw ERR_EPISODE_ID
			var params = {
				episodeid : episodeId
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.RemoveEpisode', params, success, error)
		},
		RemoveMovie : function(movieId, successCB, errorCB) {
			if (typeof movieId === undef)
				throw ERR_MOVIE_ID
			var params = {
				movieid : movieId
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.RemoveMovie', params, success, error)
		},
		RemoveMusicVideo : function(musicVideoId, successCB, errorCB) {
			if (typeof musicVideoId === undef)
				throw ERR_MUSIC_VIDEO_ID
			var params = {
				musicvideoid : musicVideoId
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.RemoveMusicVideo', params, success, error)
		},
		RemoveTVShow : function(tvShowId, successCB, errorCB) {
			if (typeof tvShowId === undef)
				throw ERR_TV_SHOW_ID
			var params = {
				tvshowid : tvShowId
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.RemoveTVShow', params, success, error)
		},
		Scan : function(directory, successCB, errorCB) {
			var params = {}
			if (typeof directory !== undef)
				params.directory = directory
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.Scan', params, success, error)
		},
		SetEpisodeDetails : function(episodeId, title, playCount, runTime, director, plot, rating, votes, lastPlayed, writer, firstAired,
				productionCode, season, episode, originalTitle, thumbnail, fanart, art, successCB, errorCB) {
			if (typeof episodeId === undef)
				throw ERR_EPISODE_ID
			var params = {
				episodeid : episodeId
			}
			if (typeof title !== undef)
				params.title = title
			if (typeof playCount !== undef)
				params.playcount = playCount
			if (typeof runTime !== undef)
				params.runtime = runTime
			if (typeof director !== undef)
				params.director = director
			if (typeof plot !== undef)
				params.plot = plot
			if (typeof rating !== undef)
				params.rating = rating
			if (typeof votes !== undef)
				params.votes = votes
			if (typeof lastPlayed !== undef)
				params.lastplayed = lastPlayed
			if (typeof writer !== undef)
				params.writer = writer
			if (typeof firstAired !== undef)
				params.firstaired = (firstAired)
			if (typeof productionCode !== undef)
				params.productioncode = productionCode
			if (typeof season !== undef)
				params.season = season
			if (typeof episode !== undef)
				params.episode = episode
			if (typeof originalTitle !== undef)
				params.originalTitle = originalTitle
			if (typeof thumbnail !== undef)
				params.thumbnail = thumbnail
			if (typeof fanart !== undef)
				params.fanart = fanart
			if (typeof art !== undef)
				params.art = art
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.SetEpisodeDetails', params, success, error)
		},
		SetMovieDetails : function(movieId, title, playCount, runTime, director, studio, year, plot, genre, rating, mpaa, imdbNumber, votes,
				lastPlayed, originalTitle, trailer, tagLine, plotOutline, writer, country, top250, sortTitle, set, showLink, thumbnail, fanart, tag,
				art, successCB, errorCB) {
			if (typeof movieId === undef)
				throw ERR_MOVIE_ID
			var params = {
				movieid : movieId
			}
			if (typeof title !== undef)
				params.title = title
			if (typeof playCount !== undef)
				params.playcount = playCount
			if (typeof runTime !== undef)
				params.runtime = runTime
			if (typeof director !== undef)
				params.director = director
			if (typeof studio !== undef)
				params.studio = studio
			if (typeof year !== undef)
				params.year = year
			if (typeof plot !== undef)
				params.plot = plot
			if (typeof genre !== undef)
				params.genre = genre
			if (typeof rating !== undef)
				params.rating = rating
			if (typeof mpaa !== undef)
				params.mpaa = mpaa
			if (typeof imdbNumber !== undef)
				params.imdbnumber = imdbNumber
			if (typeof votes !== undef)
				params.votes = votes
			if (typeof lastPlayed !== undef)
				params.lastplayed = lastPlayed
			if (typeof originalTitle !== undef)
				params.originaltitle = originalTitle
			if (typeof trailer !== undef)
				params.trailer = trailer
			if (typeof tagLine !== undef)
				params.tagline = tagLine
			if (typeof plotOutline !== undef)
				params.plotoutline = plotOutline
			if (typeof writer !== undef)
				params.writer = writer
			if (typeof country !== undef)
				params.country = country
			if (typeof top250 !== undef)
				params.top250 = top250
			if (typeof sortTitle !== undef)
				params.sorttitle = sortTitle
			if (typeof set !== undef)
				params.set = set
			if (typeof showLink !== undef)
				params.showlink = showLink
			if (typeof thumbnail !== undef)
				params.thumbnail = thumbnail
			if (typeof fanart !== undef)
				params.fanart = fanart
			if (typeof tag !== undef)
				params.tag = tag
			if (typeof art !== undef)
				params.art = art
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.SetMovieDetails', params, success, error)
		},
		SetMusicVideoDetails : function(musicVideoId, title, playCount, runTime, director, studio, year, plot, album, artist, genre, track,
				lastPlayed, thumbnail, fanart, tag, art, successCB, errorCB) {
			if (typeof musicVideoId === undef)
				throw ERR_MUSIC_VIDEO_ID
			var params = {
				musicvideoid : musicVideoId
			}
			if (typeof title !== undef)
				params.title = title
			if (typeof playCount !== undef)
				params.playcount = playCount
			if (typeof runTime !== undef)
				params.runtime = runTime
			if (typeof director !== undef)
				params.director = director
			if (typeof studio !== undef)
				params.studio = studio
			if (typeof year !== undef)
				params.year = year
			if (typeof plot !== undef)
				params.plot = plot
			if (typeof album !== undef)
				params.album = album
			if (typeof artist !== undef)
				params.push(artist)
			if (typeof genre !== undef)
				params.genre = genre
			if (typeof track !== undef)
				params.track = track
			if (typeof lastPlayed !== undef)
				params.lastplayed = lastPlayed
			if (typeof thumbnail !== undef)
				params.thumbnail = thumbnail
			if (typeof fanart !== undef)
				params.fanart = fanart
			if (typeof tag !== undef)
				params.tag = tag
			if (typeof art !== undef)
				params.art = art
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.SetMusicVideoDetails', params, success, error)
		},
		SetTVShowDetails : function(tvShowId, title, playCount, studio, plot, rating, mpaa, imdbNumber, premiered, votes, lastPlayed, originalTitle,
				sortTitle, episodeGuide, thumbnail, fanart, tag, art, successCB, errorCB) {
			if (typeof tvShowId === undef)
				throw ERR_TV_SHOW_ID
			var params = {
				tvshowid : tvShowId
			}
			if (typeof title !== undef)
				params.title = title
			if (typeof playCount !== undef)
				params.playcount = playCount
			if (typeof studio !== undef)
				params.studio = studio
			if (typeof plot !== undef)
				params.plot = plot
			if (typeof rating !== undef)
				params.rating = rating
			if (typeof mpaa !== undef)
				params.push(mpaa)
			if (typeof imdbNumber !== undef)
				params.imdbnumber = imdbNumber
			if (typeof premiered !== undef)
				params.premiered = premiered
			if (typeof votes !== undef)
				params.votes = votes
			if (typeof lastPlayed !== undef)
				params.lastplayed = lastPlayed
			if (typeof originalTitle !== undef)
				params.originaltitle = originalTitle
			if (typeof sortTitle !== undef)
				params.sorttitle = sortTitle
			if (typeof episodeGuide !== undef)
				params.push(episodeGuide)
			if (typeof thumbnail !== undef)
				params.thumbnail = thumbnail
			if (typeof fanart !== undef)
				params.fanart = fanart
			if (typeof tag !== undef)
				params.tag = tag
			if (typeof art !== undef)
				params.art = art
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('VideoLibrary.SetTVShowDetails', params, success, error)
		}
	}

	// VideoLibrary API convenience methods
	VideoLibrary.prototype.clean = VideoLibrary.prototype.Clean
	VideoLibrary.prototype.getEpisodeDetails = VideoLibrary.prototype.GetEpisodeDetails
	VideoLibrary.prototype.getEpisodes = VideoLibrary.prototype.GetEpisodes
	VideoLibrary.prototype.getGenres = VideoLibrary.prototype.GetGenres
	VideoLibrary.prototype.getMovieDetails = VideoLibrary.prototype.GetMovieDetails
	VideoLibrary.prototype.getMovieSetDetails = VideoLibrary.prototype.GetMovieSetDetails
	VideoLibrary.prototype.getMovieSets = VideoLibrary.prototype.GetMovieSets
	VideoLibrary.prototype.getMovies = VideoLibrary.prototype.GetMovies
	VideoLibrary.prototype.getMusicVideoDetails = VideoLibrary.prototype.GetMusicVideoDetails
	VideoLibrary.prototype.getMusicVideos = VideoLibrary.prototype.GetMusicVideos
	VideoLibrary.prototype.getRecentlyAddedEpisodes = VideoLibrary.prototype.GetRecentlyAddedEpisodes
	VideoLibrary.prototype.getRecentlyAddedMovies = VideoLibrary.prototype.GetRecentlyAddedMovies
	VideoLibrary.prototype.getRecentlyAddedMusicVideos = VideoLibrary.prototype.GetRecentlyAddedMusicVideos
	VideoLibrary.prototype.getSeasons = VideoLibrary.prototype.GetSeasons
	VideoLibrary.prototype.getTVShowDetails = VideoLibrary.prototype.GetTVShowDetails
	VideoLibrary.prototype.getTVShows = VideoLibrary.prototype.GetTVShows
	VideoLibrary.prototype.removeEpisode = VideoLibrary.prototype.RemoveEpisode
	VideoLibrary.prototype.removeMovie = VideoLibrary.prototype.RemoveMovie
	VideoLibrary.prototype.removeMusicVideo = VideoLibrary.prototype.RemoveMusicVideo
	VideoLibrary.prototype.removeTVShow = VideoLibrary.prototype.RemoveTVShow
	VideoLibrary.prototype.scan = VideoLibrary.prototype.Scan
	VideoLibrary.prototype.setEpisodeDetails = VideoLibrary.prototype.SetEpisodeDetails
	VideoLibrary.prototype.setMovieDetails = VideoLibrary.prototype.SetMovieDetails
	VideoLibrary.prototype.setMusicVideoDetails = VideoLibrary.prototype.SetMusicVideoDetails
	VideoLibrary.prototype.setTVShowDetails = VideoLibrary.prototype.SetTVShowDetails
	VideoLibrary.prototype.setEpisodeDetailsByObject = function(params, successCB, errorCB) {
		var episodeId = episodeDetails.episodeid
		if (typeof episodeId === undef)
			throw ERR_EPISODE_ID
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		success = typeof success === func ? success : successHandler
		error = typeof error === func ? error : errorHandler
		rpc.call('VideoLibrary.SetEpisodeDetails', params, success, error)
	}
	VideoLibrary.prototype.setMovieDetailsByObject = function(params, successCB, errorCB) {
		var movieId = movieDetails.episodeid
		if (typeof movieId === undef)
			throw ERR_MOVIE_ID
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		success = typeof success === func ? success : successHandler
		error = typeof error === func ? error : errorHandler
		rpc.call('VideoLibrary.SetMovieDetails', params, success, error)
	}
	VideoLibrary.prototype.setMusicVideoDetailsByObject = function(params, successCB, errorCB) {
		var musicVideoId = musicVidioDetails.musicvideoid
		if (typeof musicVideoId === undef)
			throw ERR_MUSIC_VIDEO_ID
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		success = typeof success === func ? success : successHandler
		error = typeof error === func ? error : errorHandler
		rpc.call('VideoLibrary.SetMusicVideoDetails', params, success, error)
	}
	VideoLibrary.prototype.setTVShowDetailsByObject = function(params, successCB, errorCB) {
		var tvShowId = tvShowDetails.tvshowid
		if (typeof tvShowId === undef)
			throw ERR_TV_SHOW_ID
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		success = typeof success === func ? success : successHandler
		error = typeof error === func ? error : errorHandler
		rpc.call('VideoLibrary.SetTVShowDetails', params, success, error)
	}

	/**
	 * A JS library wrapper for AudioLibrary API
	 * 
	 * @see http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#AudioLibrary
	 */
	// TODO: needs testing
	var AudioLibrary = function() {
		if (typeof rpc === undef || rpc == null)
			throw ERR_NOT_INITIALIZED
	}

	// AudioLibrary API core methods
	AudioLibrary.prototype = {
		Clean : function(successCB, errorCB) {
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('AudioLibrary.Clean', {}, success, error)
		},
		Export : function(options, successCB, errorCB) {
			var params = {}
			if (typeof option !== undef)
				params.options = options
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('AudioLibrary.Export', params, success, error)
		},
		GetAlbumDetails : function(albumId, properties, successCB, errorCB) {
			if (typeof albumId === undef)
				throw ERR_ALBUM_ID
			var params = {
				albumid : albumId
			}
			if (typeof properties !== undef)
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('AudioLibrary.GetAlbumDetails', params, success, error)
		},
		GetAlbums : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = {}
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof limits !== undef)
				params.limits = limits
			if (typeof sort !== undef)
				params.sort = sort
			if (typeof filter !== undef)
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('AudioLibrary.GetAlbums', params, success, error)
		},
		GetArtistDetails : function(artiestId, properties, successCB, errorCB) {
			if (typeof artiestID === undef)
				throw ERR_ARTIST_ID
			var params = {
				artiestid : artiestId
			}
			if (typeof properties !== undef)
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('AudioLibrary.GetArtistDetails', params, success, error)
		},
		GetArtist : function(albumArtistsOnly, properties, limits, sort, filter, successCB, errorCB) {
			if (typeof type === undef)
				throw ERR_TYPE
			var params = {
				type : type
			}
			if (typeof albumArtistsOnly !== undef)
				params.albumartistsonly = albumArtistsOnly
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof limits !== undef)
				params.limits = limits
			if (typeof sort !== undef)
				params.sort = sort
			if (typeof filter !== undef)
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('AudioLibrary.GetArtist', params, success, error)
		},
		GetGenres : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof limits !== undef)
				params.limits = limits
			if (typeof sort !== undef)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('AudioLibrary.GetGenres', params, success, error)
		},
		GetRecentlyAddedAlbums : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof limits !== undef)
				params.limits = limits
			if (typeof sort !== undef)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('AudioLibrary.GetRecentlyAddedAlbums', params, success, error)
		},
		GetRecentlyAddedSongs : function(albumLimit, properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (typeof albumLimit !== undef)
				params.albumLimit = albumLimit
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof limits !== undef)
				params.limits = limits
			if (typeof sort !== undef)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('AudioLibrary.GetRecentlyAddedSongs', params, success, error)
		},
		GetRecentlyPlayedAlbums : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof limits !== undef)
				params.limits = limits
			if (typeof sort !== undef)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('AudioLibrary.GetRecentlyPlayedAlbums', params, success, error)
		},
		GetRecentlyPlayedSongs : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof limits !== undef)
				params.limits = limits
			if (typeof sort !== undef)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('AudioLibrary.GetRecentlyPlayedSongs', params, success, error)
		},
		GetSongDetails : function(songId, properties, successCB, errorCB) {
			if (typeof songId === undef)
				throw ERR_SONG_ID
			var params = {
				songid : songId
			}
			if (typeof properties !== undef)
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('AudioLibrary.GetSongDetails', params, success, error)
		},
		GetSongs : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = {}
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof limits !== undef)
				params.limits = limits
			if (typeof sort !== undef)
				params.sort = sort
			if (typeof filter !== undef)
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('AudioLibrary.GetSongs', params, success, error)
		},
		Scan : function(directory, successCB, errorCB) {
			var params = {}
			if (typeof directory !== undef)
				params.directory = directory
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('AudioLibrary.Scan', params, success, error)
		},
		SetAlbumDetails : function(albumId, title, artist, description, genre, theme, mood, style, type, albumLabel, rating, year, successCB, errorCB) {
			if (typeof albumId === undef)
				throw ERR_ALBUM_ID
			var params = {
				albumid : albumId
			}
			if (typeof title !== undef)
				params.title = title
			if (typeof artist !== undef)
				params.artist = artist
			if (typeof description !== undef)
				params.description = description
			if (typeof genre !== undef)
				params.genre = genre
			if (typeof theme !== undef)
				params.theme = theme
			if (typeof mood !== undef)
				params.mood = mood
			if (typeof style !== undef)
				params.style = style
			if (typeof type !== undef)
				params.type = type
			if (typeof albumLabel !== undef)
				params.albumlabel = albumLabel
			if (typeof rating !== undef)
				params.rating = rating
			if (typeof year !== undef)
				params.year = year
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('AudioLibrary.SetAlbumDetails', params, success, error)
		},
		SetArtistDetails : function(artistId, artist, instrument, style, mood, born, formed, description, genre, died, disbanded, yearsActive,
				successCB, errorCB) {
			if (typeof artistId === undef)
				throw ERR_ARTIST_ID
			var params = {
				artistid : artistId
			}
			if (typeof artist !== undef)
				params.artist = artist
			if (typeof instrument !== undef)
				params.instrument = instrument
			if (typeof style !== undef)
				params.style = style
			if (typeof mood !== undef)
				params.mood = mood
			if (typeof born !== undef)
				params.born = born
			if (typeof formed !== undef)
				params.formed = formed
			if (typeof description !== undef)
				params.description = description
			if (typeof genre !== undef)
				params.genre = genre
			if (typeof died !== undef)
				params.died = died
			if (typeof disbanded !== undef)
				params.disbanded = disbanded
			if (typeof yearsActive !== undef)
				params.yearsactive = yearsActive
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('AudioLibrary.SetArtistDetails', params, success, error)
		},
		SetSongDetails : function(songId, title, artist, albumArtist, genre, year, rating, album, track, disc, duration, comment, musicBrainzTrackId,
				musicBrainzArtistId, musicBrainzAlbumId, musicBrainzAlbumArtistId, successCB, errorCB) {
			if (typeof songId === undef)
				throw ERR_SONG_ID
			var params = {
				songid : songId
			}
			if (typeof title !== undef)
				params.title = title
			if (typeof artist !== undef)
				params.artist = artist
			if (typeof albumArtist !== undef)
				params.albumartist = albumArtist
			if (typeof genre !== undef)
				params.genre = genre
			if (typeof year !== undef)
				params.year = year
			if (typeof rating !== undef)
				params.rating = rating
			if (typeof album !== undef)
				params.album = album
			if (typeof track !== undef)
				params.track = track
			if (typeof disc !== undef)
				params.disc = disc
			if (typeof duration !== undef)
				params.duration = duration
			if (typeof comment !== undef)
				params.comment = comment
			if (typeof musicBrainzTrackId !== undef)
				params.musicbrainztrackid = musicBrainzTrackId
			if (typeof musicBrainzArtistId !== undef)
				params.musicbrainzartistid = musicBrainzArtistId
			if (typeof musicBrainzAlbumId !== undef)
				params.musicbrainzalbumid = musicBrainzAlbumId
			if (typeof musicBrainzAlbumArtistId !== undef)
				params.musicbrainzalbumartistid = musicBrainzAlbumArtistId
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('AudioLibrary.SetSongDetails', params, success, error)
		}
	}

	// AudioLibrary API convenience methods
	AudioLibrary.prototype.clean = AudioLibrary.prototype.Clean
	AudioLibrary.prototype.getAlbumDetails = AudioLibrary.prototype.GetAlbumDetails
	AudioLibrary.prototype.getAlbums = AudioLibrary.prototype.GetAlbums
	AudioLibrary.prototype.getArtistDetails = AudioLibrary.prototype.GetArtistDetails
	AudioLibrary.prototype.getArtist = AudioLibrary.prototype.GetArtist
	AudioLibrary.prototype.getGenres = AudioLibrary.prototype.GetGenres
	AudioLibrary.prototype.getRecentlyAddedAlbums = AudioLibrary.prototype.GetRecentlyAddedAlbums
	AudioLibrary.prototype.getRecentlyAddedSongs = AudioLibrary.prototype.GetRecentlyAddedSongs
	AudioLibrary.prototype.getRecentlyPlayedAlbums = AudioLibrary.prototype.GetRecentlyPlayedAlbums
	AudioLibrary.prototype.getRecentlyPlayedSongs = AudioLibrary.prototype.GetRecentlyPlayedSongs
	AudioLibrary.prototype.getSongDetails = AudioLibrary.prototype.GetSongDetails
	AudioLibrary.prototype.getSongs = AudioLibrary.prototype.GetSongs
	AudioLibrary.prototype.scan = AudioLibrary.prototype.Scan
	AudioLibrary.prototype.setAlbumDetails = AudioLibrary.prototype.SetAlbumDetails
	AudioLibrary.prototype.setArtistDetails = AudioLibrary.prototype.SetArtistDetails
	AudioLibrary.prototype.setSongDetails = AudioLibrary.prototype.SetSongDetails
	AudioLibrary.prototype.setAlbumDetailsByObject = function(params, successCB, errorCB) {
		var albumId = albumDetails.albumid
		if (typeof albumId === undef)
			throw ERR_ALBUM_ID
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		success = typeof success === func ? success : successHandler
		error = typeof error === func ? error : errorHandler
		rpc.call('AudioLibrary.SetAlbumDetails', params, success, error)
	}
	AudioLibrary.prototype.setArtistDetailsByObject = function(params, successCB, errorCB) {
		var artistId = artistDetails.artistid
		if (typeof artistId === undef)
			throw ERR_ARTIST_ID
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		success = typeof success === func ? success : successHandler
		error = typeof error === func ? error : errorHandler
		rpc.call('AudioLibrary.SetArtistDetails', params, success, error)
	}
	AudioLibrary.prototype.setSongDetailsByObject = function(songDetails, successCB, errorCB) {
		var songId = songDetails.songid
		if (typeof songId === undef)
			throw ERR_SONG_ID
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		success = typeof success === func ? success : successHandler
		error = typeof error === func ? error : errorHandler
		rpc.call('AudioLibrary.SetSongDetails', params, success, error)
	}

	/**
	 * A JS library wrapper for Files API
	 * 
	 * @see http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#Files
	 */
	// TODO: needs more testing
	// FIXME: Both PrepareDownload and Download in this implementation are
	// currently broken as they only work over HTTP request not WebSockets
	var Files = function() {
		if (typeof rpc === undef || rpc == null)
			throw ERR_NOT_INITIALIZED
	}

	// Files API core methods
	Files.prototype = {
		Download : function(path, successCB, errorCB) {
			if (typeof path === undef)
				throw ERR_PATH
			var params = {
				path : path
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.callAJAX('Files.Download', params, success, error)
		},
		GetDirectory : function(directory, files, properties, sort, successCB, errorCB) {
			if (typeof direcotry === undef)
				throw ERR_DIRECTORY
			var params = {
				directory : directory
			}
			if (typeof files !== undef)
				params.files = files
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof sort !== undef)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('Files.GetDirectory', params, success, error)
		},
		GetFileDetails : function(media, files, properties, successCB, errorCB) {
			if (typeof media === undef)
				throw ERR_MEDIA
			var params = {
				media : media
			}
			if (typeof files !== undef)
				params.files = files
			if (typeof properties !== undef)
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('Files.GetFileDetails', params, success, error)
		},
		GetSources : function(media, limits, sort, successCB, errorCB) {
			if (typeof media === undef)
				throw ERR_MEDIA
			var params = {
				media : media
			}
			if (typeof limits !== undef)
				params.limits = limits
			if (typeof sort !== undef)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('Files.GetSources', params, success, error)
		},
		PrepareDownload : function(path, successCB, errorCB) {
			if (typeof path === undef)
				throw ERR_PATH
			var params = {
				path : path
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.callAJAX('Files.PrepareDownload', params, success, error)
		}
	}

	// Files API convenience methods
	Files.prototype.download = Files.prototype.Download
	Files.prototype.getDirectory = Files.prototype.GetDirectory
	Files.prototype.getFileDetails = Files.prototype.GetFileDetails
	Files.prototype.getSources = Files.prototype.GetSources
	Files.prototype.prepareDownload = Files.prototype.PrepareDownload

	/**
	 * A JS library wrapper for Application API
	 * 
	 * @see http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#Application
	 */
	// TODO: needs testing
	var Application = function() {
		if (typeof rpc === undef || rpc == null)
			throw ERR_NOT_INITIALIZED
	}

	// Application API core methods
	Application.prototype = {
		GetProperties : function(propertyNames, successCB, errorCB) {
			var params = {}
			if (typeof propertyNames !== undef)
				params.properties = propertyNames
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('Application.GetProperties', params, success, error)
		},
		Quit : function(successCB, errorCB) {
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('Application.Quit', {}, success, error)
		},
		SetMute : function(muteToggle, successCB, errorCB) {
			if (typeof muteToggle === undef)
				throw ERR_MUTE_TOGGLE
			var params = {
				mute : muteToggle
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('Application.SetMute', params, success, error)
		},
		SetVolume : function(volume, successCB, errorCB) {
			if (typeof volume === undef)
				throw ERR_VOLUME
			var params = {
				volume : volume
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('Application.SetVolume', params, success, error)
		}
	}

	// Application API convenience methods
	Application.prototype.getProperties = Application.prototype.GetProperties
	Application.prototype.quit = Application.prototype.Quit
	Application.prototype.setMute = Application.prototype.SetMute
	Application.prototype.setVolume = Application.prototype.SetVolume

	// For added convenience there is no need to have new XBMC.XBMC() as this
	// just looks ugly
	XBMC.prototype.GetInfoBooleans = function(booleans, successCB, errorCB) {
		if (typeof booleans === undef)
			throw ERR_BOOLEANS
		var params = {
			booleans : booleans
		}
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		success = typeof success === func ? success : successHandler
		error = typeof error === func ? error : errorHandler
		rpc.call('XBMC.GetInfoBooleans', params, success, error)
	}
	XBMC.prototype.GetInfoLabels = function(labels, successCB, errorCB) {
		if (typeof labels === undef)
			throw ERR_LABELS
		var params = {
			labels : labels
		}
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		success = typeof success === func ? success : successHandler
		error = typeof error === func ? error : errorHandler
		rpc.call('XBMC.GetInfoLabels', params, success, error)
	}
	XBMC.prototype.getInfoBooleans = XBMC.prototype.GetInfoBooleans
	XBMC.prototype.getInfoLabels = XBMC.prototype.GetInfoLabels

	/**
	 * A JS library wrapper for XBMC API
	 * 
	 * @see http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#XBMC
	 */
	// TODO: needs testing
	var _XBMC = function() {
		if (typeof rpc === undef || rpc == null)
			throw ERR_NOT_INITIALIZED
	}

	// XBMC API methods
	_XBMC.prototype = {
		GetInfoBooleans : XBMC.prototype.GetInfoBooleans,
		getInfoBooleans : XBMC.prototype.GetInfoBooleans,
		GetInfoLabels : XBMC.prototype.GetInfoLabels,
		getInfoLabels : XBMC.prototype.GetInfoLabels
	}

	/**
	 * A JS library wrapper for Addons API
	 * 
	 * @see http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#Addons
	 */
	// TODO: needs testing
	var Addons = function() {
		if (typeof rpc === undef || rpc == null)
			throw ERR_NOT_INITIALIZED
	}

	// Addons API core methods
	Addons.prototype = {
		ExecuteAddon : function(addonId, parameters, wait, successCB, errorCB) {
			if (typeof addonId === undef)
				throw ERR_ADDON_ID
			var params = {
				addonid : addonId
			}
			if (typeof parameters !== undef)
				params.params = parameters
			if (typeof wait !== undef)
				params.wait = wait
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('Addons.ExecuteAddon', params, success, error)
		},
		GetAddonDetails : function(addonId, properties, successCB, errorCB) {
			if (typeof addonId === undef)
				throw ERR_ADDON_ID
			var params = {
				addonid : addonId
			}
			if (typeof properties !== undef)
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('Addons.GetAddonDetails', params, success, error)
		},
		GetAddons : function(type, content, enabled, properties, limits, successCB, errorCB) {
			var params = {}
			if (typeof type !== undef)
				params.type = type
			if (typeof content !== undef)
				params.content = content
			if (typeof enabled !== undef)
				params.enabled = enabled
			if (typeof properties !== undef)
				params.properties = properties
			if (typeof limits !== undef)
				params.limits = limits
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('Addons.GetAddons', params, success, error)
		},
		SetAddonEnabled : function(addonId, enabled, successCB, errorCB) {
			if (typeof addonId === undef)
				throw ERR_ADDON_ID
			if (typeof enabled === undef)
				throw ERR_ENABLED
			var params = {
				addonid : addonId,
				enabled : enabled
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('Addons.SetAddonEnabled', params, success, error)
		}
	}

	// Addons API convenience methods
	Addons.prototype.executeAddon = Addons.prototype.ExecuteAddon
	Addons.prototype.getAddonDetails = Addons.prototype.GetAddonDetails
	Addons.prototype.getAddons = Addons.prototype.GetAddons
	Addons.prototype.setAddonEnabled = Addons.prototype.SetAddonEnabled

	/**
	 * A JS library wrapper for GUI API
	 * 
	 * @see http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#GUI
	 */
	// TODO: needs testing
	var GUI = function() {
		if (typeof rpc === undef || rpc == null)
			throw ERR_NOT_INITIALIZED
	}

	// GUI API core methods
	GUI.prototype = {
		ActivateWindow : function(window, properties, successCB, errorCB) {
			if (typeof window === undef)
				throw ERR_WINDOW
			var params = {
				window : window
			}
			if (typeof properties !== undef)
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('GUI.ActivateWindow', params, success, error)
		},
		GetProperties : function(properties, successCB, errorCB) {
			if (typeof properties === undef)
				throw ERR_PROPERTIES
			var params = {
				properties : properties
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('GUI.GetProperties', params, success, error)
		},
		SetFullscreen : function(fullscreen, successCB, errorCB) {
			if (typeof fullscreen === undef)
				throw ERR_FULLSCREEN
			var params = {
				fullscreen : fullscreen
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('GUI.SetFullscreen', params, success, error)
		},
		ShowNotification : function(title, message, image, displayTime, successCB, errorCB) {
			if (typeof title === undef)
				throw ERR_TITLE
			if (typeof message === undef)
				throw ERR_MESSAGE
			var params = {
				title : title,
				message : message
			}
			if (typeof image !== undef)
				params.image = image
			if (typeof displayTime !== undef)
				params.displaytime = displayTime
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call('GUI.ShowNotification', params, success, error)
		}
	}

	// GUI API convenience methods
	GUI.prototype.activateWindow = GUI.prototype.ActivateWindow
	GUI.prototype.getProperties = GUI.prototype.GetProperties
	GUI.prototype.setFullscreen = GUI.prototype.SetFullscreen
	GUI.prototype.showNotification = GUI.prototype.ShowNotification

	XBMC.prototype = {
		Application : Application,
		VideoLibrary : VideoLibrary,
		AudioLibrary : AudioLibrary,
		Files : Files,
		XBMC : _XBMC,
		Addons : Addons,
		GUI : GUI
	}

	// add a custom direct access to server
	if (directAccess) {
		XBMC.prototype.custom = function(call, params, successCB, errorCB) {
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			success = typeof success === func ? success : successHandler
			error = typeof error === func ? error : errorHandler
			rpc.call(call, params, success, error)
		}
	}

	// expose api globally
	window.XBMC = XBMC

})(window)