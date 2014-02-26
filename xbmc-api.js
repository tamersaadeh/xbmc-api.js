/*
 * XBMC JSON-RPC API v6 (XBMC 12 and newer) wrapper
 * 
 * This wrapper was written by Tamer Saadeh <tamer@tamersaadeh.com>, 2014
 * 
 * Version: 0.2.2
 * 
 * This file is licensed under 4-clause BSD, see LICENSE file for more details
 */

(function(window) {
	"use strict"

	/**
	 * Private object for access the JSON-RPC API
	 */
	var rpc

	/**
	 * This variable allows the direct function calls to the XBMC API server. It
	 * is useful for debugging and implementing new features.
	 */
	var directAccess = false

	/**
	 * Strings:
	 * 
	 * @string ERR_NOT_INITIALIZED when XBMC is not initialized
	 * @string ERR_TYPE when the type parameter is missing
	 * @string ERR_PATH when the path parameter is missing
	 * @string ERR_MEDIA when the media parameter is missing
	 * @string ERR_DIRECTORY when the directory parameter is missing
	 * @string ERR_EPISODE_ID when episode ID as a parameter is missing
	 * @string ERR_SET_ID when the set ID parameter is missing
	 * @string ERR_MOVIE_ID when the movie ID parameter is missing
	 * @string ERR_MUSIC_VIDEO_ID when the music video ID parameter is missing
	 * @string ERR_TV_SHOW_ID when the TV show ID parameter is missing
	 * @string ERR_ALBUM_ID when the album ID parameter is missing
	 * @string ERR_ARTIST_ID when the artist ID parameter is missing
	 * @string ERR_SONG_ID when the song ID parameter is missing
	 * @string DEFAULT_LOG_TAG is the default prefix tag for logging
	 */
	var ERR_NOT_INITIALIZED = "XBMC API not initialized! Call `new XBMC(hostname, port)`!"
	var ERR_TYPE = "Type is not provided"
	var ERR_PATH = "Path is not provided"
	var ERR_MEDIA = "Media is not provided"
	var ERR_DIRECTORY = "Directory is not provided"
	var ERR_EPISODE_ID = "Episode ID is not provided"
	var ERR_SET_ID = "Set ID is not provided"
	var ERR_MOVIE_ID = "Movie ID is not provided"
	var ERR_MUSIC_VIDEO_ID = "Music Video ID is not provided"
	var ERR_TV_SHOW_ID = "TV Show ID is not provided"
	var ERR_ALBUM_ID = "Album ID is not provided"
	var ERR_ARTIST_ID = "Artist ID is not provided"
	var ERR_SONG_ID = "Song ID is not provided"
	var DEFAULT_LOG_TAG = "XBMC API: "

	/**
	 * Helper function to check if a variable x is undefined
	 */
	function isUndefined(x) {
		return ((typeof x) === "undefined")
	}

	/**
	 * Helper function to check if a variable x is not undefined
	 */
	function notUndefined(x) {
		return !(isUndefined(x))
	}

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
		var console = (isUndefined(console)) ? {
			log : function(str) {
				alert(str)
			}
		} : console
		setTimeout(function() {
			console.log(DEFAULT_LOG_TAG + JSON.stringify(e))
		}, 0)
	}

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

		rpc = new $.JsonRpcClient({
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
		if (isUndefined(rpc) || rpc == null)
			throw ERR_NOT_INITIALIZED
	}

	// VideoLibrary API core methods
	VideoLibrary.prototype = {
		Clean : function(successCB, errorCB) {
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.Clean', {}, success, error)
		},
		Export : function(options, successCB, errorCB) {
			var params = {}
			if (notUndefined(options))
				params.options = options
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.Export', params, success, error)
		},
		GetEpisodeDetails : function(episodeId, properties, successCB, errorCB) {
			if (isUndefined(episodeId))
				throw ERR_EPISODE_ID
			var params = {
				episodeid : episodeId
			}
			if (notUndefined(properties))
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetEpisodeDetails', params, success, error)
		},
		GetEpisodes : function(tvShowId, season, properties, limits, sort, filter, successCB, errorCB) {
			var params = {}
			if (notUndefined(tvShowId))
				params.tvshowid = tvShowId
			if (notUndefined(season))
				params.season = season
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(limits))
				params.limits = limits
			if (notUndefined(sort))
				params.sort = sort
			if (notUndefined(filter))
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetEpisodes', params, success, error)
		},
		GetGenres : function(type, properties, limits, sort, successCB, errorCB) {
			if (isUndefined(type))
				throw ERR_TYPE
			var params = {
				type : type
			}
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(limits))
				params.limits = limits
			if (notUndefined(sort))
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetGenres', params, success, error)
		},
		GetMovieDetails : function(movieId, properties, successCB, errorCB) {
			if (isUndefined(movieId))
				throw ERR_MOVIE_ID
			var params = {
				movieid : movieId
			}
			if (notUndefined(properties))
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetMovieDetails', params, success, error)
		},
		GetMovieSetDetails : function(setId, properties, movies, successCB, errorCB) {
			if (isUndefined(setId))
				throw ERR_SET_ID
			var params = {
				setid : setId
			}
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(movies))
				params.movies = movies
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetMovieSetDetails', params, success, error)
		},
		GetMovieSets : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(limits))
				params.limits = limits
			if (notUndefined(sort))
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetMovieSets', params, success, error)
		},
		GetMovies : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = {}
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(limits))
				params.limits = limits
			if (notUndefined(sort))
				params.sort = sort
			if (notUndefined(filter))
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetMovies', params, success, error)
		},
		GetMusicVideoDetails : function(musicVideoId, properties, successCB, errorCB) {
			if (isUndefined(musicVideoId))
				throw ERR_MUSIC_VIDEO_ID
			var params = {
				musicvideoid : musicVideoId
			}
			if (notUndefined(properties))
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetMusicVideoDetails', params, success, error)
		},
		GetMusicVideos : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = {}
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(limits))
				params.limits = limits
			if (notUndefined(sort))
				params.sort = sort
			if (notUndefined(filter))
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetMusicVideos', params, success, error)
		},
		GetRecentlyAddedEpisodes : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(limits))
				params.limits = limits
			if (notUndefined(sort))
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetRecentlyAddedEpisodes', params, success, error)
		},
		GetRecentlyAddedMovies : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(limits))
				params.limits = limits
			if (notUndefined(sort))
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetRecentlyAddedMovies', params, success, error)
		},
		GetRecentlyAddedMusicVideos : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(limits))
				params.limits = limits
			if (notUndefined(sort))
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetRecentlyAddedMusicVideos', params, success, error)
		},
		GetSeasons : function(tvShowId, properties, limits, sort, successCB, errorCB) {
			if (isUndefined(tvShowId))
				throw ERR_TV_SHOW_ID
			var params = {
				tvshowid : tvShowId
			}
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(limits))
				params.limits = limits
			if (notUndefined(sort))
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetSeasons', params, success, error)
		},
		GetTVShowDetails : function(tvShowId, properties, successCB, errorCB) {
			if (isUndefined(tvShowId))
				throw ERR_TV_SHOW_ID
			var params = {
				episodeid : episodeId
			}
			if (notUndefined(properties))
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetTVShowDetails', success, error)
		},
		GetTVShows : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = {}
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(limits))
				params.limits = limits
			if (notUndefined(sort))
				params.sort = sort
			if (notUndefined(filter))
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetTVShows', params, success, error)
		},
		RemoveEpisode : function(episodeId, successCB, errorCB) {
			if (isUndefined(episodeId))
				throw ERR_EPISODE_ID
			var params = {
				episodeid : episodeId
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.RemoveEpisode', params, success, error)
		},
		RemoveMovie : function(movieId, successCB, errorCB) {
			if (isUndefined(movieId))
				throw ERR_MOVIE_ID
			var params = {
				movieid : movieId
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.RemoveMovie', params, success, error)
		},
		RemoveMusicVideo : function(musicVideoId, successCB, errorCB) {
			if (isUndefined(musicVideoId))
				throw ERR_MUSIC_VIDEO_ID
			var params = {
				musicvideoid : musicVideoId
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.RemoveMusicVideo', params, success, error)
		},
		RemoveTVShow : function(tvShowId, successCB, errorCB) {
			if (isUndefined(tvShowId))
				throw ERR_TV_SHOW_ID
			var params = {
				tvshowid : tvShowId
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.RemoveTVShow', params, success, error)
		},
		Scan : function(directory, successCB, errorCB) {
			var params = {}
			if (notUndefined(directory))
				params.directory = directory
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.Scan', params, success, error)
		},
		SetEpisodeDetails : function(episodeId, title, playCount, runTime, director, plot, rating, votes, lastPlayed, writer, firstAired,
				productionCode, season, episode, originalTitle, thumbnail, fanart, art, successCB, errorCB) {
			if (isUndefined(episodeId))
				throw ERR_EPISODE_ID
			var params = {
				episodeid : episodeId
			}
			if (notUndefined(title))
				params.title = title
			if (notUndefined(playCount))
				params.playcount = playCount
			if (notUndefined(runTime))
				params.runtime = runTime
			if (notUndefined(director))
				params.director = director
			if (notUndefined(plot))
				params.plot = plot
			if (notUndefined(rating))
				params.rating = rating
			if (notUndefined(votes))
				params.votes = votes
			if (notUndefined(lastPlayed))
				params.lastplayed = lastPlayed
			if (notUndefined(writer))
				params.writer = writer
			if (notUndefined(firstAired))
				params.firstaired = (firstAired)
			if (notUndefined(productionCode))
				params.productioncode = productionCode
			if (notUndefined(season))
				params.season = season
			if (notUndefined(episode))
				params.episode = episode
			if (notUndefined(originalTitle))
				params.originalTitle = originalTitle
			if (notUndefined(thumbnail))
				params.thumbnail = thumbnail
			if (notUndefined(fanart))
				params.fanart = fanart
			if (notUndefined(art))
				params.art = art
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.SetEpisodeDetails', params, success, error)
		},
		SetMovieDetails : function(movieId, title, playCount, runTime, director, studio, year, plot, genre, rating, mpaa, imdbNumber, votes,
				lastPlayed, originalTitle, trailer, tagLine, plotOutline, writer, country, top250, sortTitle, set, showLink, thumbnail, fanart, tag,
				art, successCB, errorCB) {
			if (isUndefined(movieId))
				throw ERR_MOVIE_ID
			var params = {
				movieid : movieId
			}
			if (notUndefined(title))
				params.title = title
			if (notUndefined(playCount))
				params.playcount = playCount
			if (notUndefined(runTime))
				params.runtime = runTime
			if (notUndefined(director))
				params.director = director
			if (notUndefined(studio))
				params.studio = studio
			if (notUndefined(year))
				params.year = year
			if (notUndefined(plot))
				params.plot = plot
			if (notUndefined(genre))
				params.genre = genre
			if (notUndefined(rating))
				params.rating = rating
			if (notUndefined(mpaa))
				params.mpaa = mpaa
			if (notUndefined(imdbNumber))
				params.imdbnumber = imdbNumber
			if (notUndefined(votes))
				params.votes = votes
			if (notUndefined(lastPlayed))
				params.lastplayed = lastPlayed
			if (notUndefined(originalTitle))
				params.originaltitle = originalTitle
			if (notUndefined(trailer))
				params.trailer = trailer
			if (notUndefined(tagLine))
				params.tagline = tagLine
			if (notUndefined(plotOutline))
				params.plotoutline = plotOutline
			if (notUndefined(writer))
				params.writer = writer
			if (notUndefined(country))
				params.country = country
			if (notUndefined(top250))
				params.top250 = top250
			if (notUndefined(sortTitle))
				params.sorttitle = sortTitle
			if (notUndefined(set))
				params.set = set
			if (notUndefined(showLink))
				params.showlink = showLink
			if (notUndefined(thumbnail))
				params.thumbnail = thumbnail
			if (notUndefined(fanart))
				params.fanart = fanart
			if (notUndefined(tag))
				params.tag = tag
			if (notUndefined(art))
				params.art = art
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.SetMovieDetails', params, success, error)
		},
		SetMusicVideoDetails : function(musicVideoId, title, playCount, runTime, director, studio, year, plot, album, artist, genre, track,
				lastPlayed, thumbnail, fanart, tag, art, successCB, errorCB) {
			if (isUndefined(musicVideoId))
				throw ERR_MUSIC_VIDEO_ID
			var params = {
				musicvideoid : musicVideoId
			}
			if (notUndefined(title))
				params.title = title
			if (notUndefined(playCount))
				params.playcount = playCount
			if (notUndefined(runTime))
				params.runtime = runTime
			if (notUndefined(director))
				params.director = director
			if (notUndefined(studio))
				params.studio = studio
			if (notUndefined(year))
				params.year = year
			if (notUndefined(plot))
				params.plot = plot
			if (notUndefined(album))
				params.album = album
			if (notUndefined(artist))
				params.push(artist)
			if (notUndefined(genre))
				params.genre = genre
			if (notUndefined(track))
				params.track = track
			if (notUndefined(lastPlayed))
				params.lastplayed = lastPlayed
			if (notUndefined(thumbnail))
				params.thumbnail = thumbnail
			if (notUndefined(fanart))
				params.fanart = fanart
			if (notUndefined(tag))
				params.tag = tag
			if (notUndefined(art))
				params.art = art
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.SetMusicVideoDetails', params, success, error)
		},
		SetTVShowDetails : function(tvShowId, title, playCount, studio, plot, rating, mpaa, imdbNumber, premiered, votes, lastPlayed, originalTitle,
				sortTitle, episodeGuide, thumbnail, fanart, tag, art, successCB, errorCB) {
			if (isUndefined(tvShowId))
				throw ERR_TV_SHOW_ID
			var params = {
				tvshowid : tvShowId
			}
			if (notUndefined(title))
				params.title = title
			if (notUndefined(playCount))
				params.playcount = playCount
			if (notUndefined(studio))
				params.studio = studio
			if (notUndefined(plot))
				params.plot = plot
			if (notUndefined(rating))
				params.rating = rating
			if (notUndefined(mpaa))
				params.push(mpaa)
			if (notUndefined(imdbNumber))
				params.imdbnumber = imdbNumber
			if (notUndefined(premiered))
				params.premiered = premiered
			if (notUndefined(votes))
				params.votes = votes
			if (notUndefined(lastPlayed))
				params.lastplayed = lastPlayed
			if (notUndefined(originalTitle))
				params.originaltitle = originalTitle
			if (notUndefined(sortTitle))
				params.sorttitle = sortTitle
			if (notUndefined(episodeGuide))
				params.push(episodeGuide)
			if (notUndefined(thumbnail))
				params.thumbnail = thumbnail
			if (notUndefined(fanart))
				params.fanart = fanart
			if (notUndefined(tag))
				params.tag = tag
			if (notUndefined(art))
				params.art = art
			var success = successCB || successHandler
			var error = errorCB || errorHandler
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
		if (isUndefined(episodeId))
			throw ERR_EPISODE_ID
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		rpc.call('VideoLibrary.SetEpisodeDetails', params, success, error)
	}
	VideoLibrary.prototype.setMovieDetailsByObject = function(params, successCB, errorCB) {
		var movieId = movieDetails.episodeid
		if (isUndefined(movieId))
			throw ERR_MOVIE_ID
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		rpc.call('VideoLibrary.SetMovieDetails', params, success, error)
	}
	VideoLibrary.prototype.setMusicVideoDetailsByObject = function(params, successCB, errorCB) {
		var musicVideoId = musicVidioDetails.musicvideoid
		if (isUndefined(musicVideoId))
			throw ERR_MUSIC_VIDEO_ID
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		rpc.call('VideoLibrary.SetMusicVideoDetails', params, success, error)
	}
	VideoLibrary.prototype.setTVShowDetailsByObject = function(params, successCB, errorCB) {
		var tvShowId = tvShowDetails.tvshowid
		if (isUndefined(tvShowId))
			throw ERR_TV_SHOW_ID
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		rpc.call('VideoLibrary.SetTVShowDetails', params, success, error)
	}

	/**
	 * A JS library wrapper for AudioLibrary API
	 * 
	 * @see http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#AudioLibrary
	 */
	// TODO: needs testing
	var AudioLibrary = function() {
		if (isUndefined(rpc) || rpc == null)
			throw ERR_NOT_INITIALIZED
	}

	// AudioLibrary API core methods
	AudioLibrary.prototype = {
		Clean : function(successCB, errorCB) {
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.Clean', {}, success, error)
		},
		Export : function(options, successCB, errorCB) {
			var params = {}
			if (notUndefined(option))
				params.options = options
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.Export', params, success, error)
		},
		GetAlbumDetails : function(albumId, properties, successCB, errorCB) {
			if (isUndefined(albumId))
				throw ERR_ALBUM_ID
			var params = {
				albumid : albumId
			}
			if (notUndefined(properties))
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetAlbumDetails', params, success, error)
		},
		GetAlbums : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = {}
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(limits))
				params.limits = limits
			if (notUndefined(sort))
				params.sort = sort
			if (notUndefined(filter))
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetAlbums', params, success, error)
		},
		GetArtistDetails : function(artiestId, properties, successCB, errorCB) {
			if (isUndefined(artiestID))
				throw ERR_ARTIST_ID
			var params = {
				artiestid : artiestId
			}
			if (notUndefined(properties))
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetArtistDetails', params, success, error)
		},
		GetArtist : function(albumArtistsOnly, properties, limits, sort, filter, successCB, errorCB) {
			if (isUndefined(type))
				throw ERR_TYPE
			var params = {
				type : type
			}
			if (notUndefined(albumArtistsOnly))
				params.albumartistsonly = albumArtistsOnly
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(limits))
				params.limits = limits
			if (notUndefined(sort))
				params.sort = sort
			if (notUndefined(filter))
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetArtist', params, success, error)
		},
		GetGenres : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(limits))
				params.limits = limits
			if (notUndefined(sort))
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetGenres', params, success, error)
		},
		GetRecentlyAddedAlbums : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(limits))
				params.limits = limits
			if (notUndefined(sort))
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetRecentlyAddedAlbums', params, success, error)
		},
		GetRecentlyAddedSongs : function(albumLimit, properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (notUndefined(albumLimit))
				params.albumLimit = albumLimit
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(limits))
				params.limits = limits
			if (notUndefined(sort))
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetRecentlyAddedSongs', params, success, error)
		},
		GetRecentlyPlayedAlbums : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(limits))
				params.limits = limits
			if (notUndefined(sort))
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetRecentlyPlayedAlbums', params, success, error)
		},
		GetRecentlyPlayedSongs : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(limits))
				params.limits = limits
			if (notUndefined(sort))
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetRecentlyPlayedSongs', params, success, error)
		},
		GetSongDetails : function(songId, properties, successCB, errorCB) {
			if (isUndefined(songId))
				throw ERR_SONG_ID
			var params = {
				songid : songId
			}
			if (notUndefined(properties))
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetSongDetails', params, success, error)
		},
		GetSongs : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = {}
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(limits))
				params.limits = limits
			if (notUndefined(sort))
				params.sort = sort
			if (notUndefined(filter))
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetSongs', params, success, error)
		},
		Scan : function(directory, successCB, errorCB) {
			var params = {}
			if (notUndefined(directory))
				params.directory = directory
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.Scan', params, success, error)
		},
		SetAlbumDetails : function(albumId, title, artist, description, genre, theme, mood, style, type, albumLabel, rating, year, successCB, errorCB) {
			if (isUndefined(albumId))
				throw ERR_ALBUM_ID
			var params = {
				albumid : albumId
			}
			if (notUndefined(title))
				params.title = title
			if (notUndefined(artist))
				params.artist = artist
			if (notUndefined(description))
				params.description = description
			if (notUndefined(genre))
				params.genre = genre
			if (notUndefined(theme))
				params.theme = theme
			if (notUndefined(mood))
				params.mood = mood
			if (notUndefined(style))
				params.style = style
			if (notUndefined(type))
				params.type = type
			if (notUndefined(albumLabel))
				params.albumlabel = albumLabel
			if (notUndefined(rating))
				params.rating = rating
			if (notUndefined(year))
				params.year = year
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.SetAlbumDetails', params, success, error)
		},
		SetArtistDetails : function(artistId, artist, instrument, style, mood, born, formed, description, genre, died, disbanded, yearsActive,
				successCB, errorCB) {
			if (isUndefined(artistId))
				throw ERR_ARTIST_ID
			var params = {
				artistid : artistId
			}
			if (notUndefined(artist))
				params.artist = artist
			if (notUndefined(instrument))
				params.instrument = instrument
			if (notUndefined(style))
				params.style = style
			if (notUndefined(mood))
				params.mood = mood
			if (notUndefined(born))
				params.born = born
			if (notUndefined(formed))
				params.formed = formed
			if (notUndefined(description))
				params.description = description
			if (notUndefined(genre))
				params.genre = genre
			if (notUndefined(died))
				params.died = died
			if (notUndefined(disbanded))
				params.disbanded = disbanded
			if (notUndefined(yearsActive))
				params.yearsactive = yearsActive
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.SetArtistDetails', params, success, error)
		},
		SetSongDetails : function(songId, title, artist, albumArtist, genre, year, rating, album, track, disc, duration, comment, musicBrainzTrackId,
				musicBrainzArtistId, musicBrainzAlbumId, musicBrainzAlbumArtistId, successCB, errorCB) {
			if (isUndefined(songId))
				throw ERR_SONG_ID
			var params = {
				songid : songId
			}
			if (notUndefined(title))
				params.title = title
			if (notUndefined(artist))
				params.artist = artist
			if (notUndefined(albumArtist))
				params.albumartist = albumArtist
			if (notUndefined(genre))
				params.genre = genre
			if (notUndefined(year))
				params.year = year
			if (notUndefined(rating))
				params.rating = rating
			if (notUndefined(album))
				params.album = album
			if (notUndefined(track))
				params.track = track
			if (notUndefined(disc))
				params.disc = disc
			if (notUndefined(duration))
				params.duration = duration
			if (notUndefined(comment))
				params.comment = comment
			if (notUndefined(musicBrainzTrackId))
				params.musicbrainztrackid = musicBrainzTrackId
			if (notUndefined(musicBrainzArtistId))
				params.musicbrainzartistid = musicBrainzArtistId
			if (notUndefined(musicBrainzAlbumId))
				params.musicbrainzalbumid = musicBrainzAlbumId
			if (notUndefined(musicBrainzAlbumArtistId))
				params.musicbrainzalbumartistid = musicBrainzAlbumArtistId
			var success = successCB || successHandler
			var error = errorCB || errorHandler
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
		if (isUndefined(albumId))
			throw ERR_ALBUM_ID
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		rpc.call('AudioLibrary.SetAlbumDetails', params, success, error)
	}
	AudioLibrary.prototype.setArtistDetailsByObject = function(params, successCB, errorCB) {
		var artistId = artistDetails.artistid
		if (isUndefined(artistId))
			throw ERR_ARTIST_ID
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		rpc.call('AudioLibrary.SetArtistDetails', params, success, error)
	}
	AudioLibrary.prototype.setSongDetailsByObject = function(songDetails, successCB, errorCB) {
		var songId = songDetails.songid
		if (isUndefined(songId))
			throw ERR_SONG_ID
		var success = successCB || successHandler
		var error = errorCB || errorHandler
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
		if (isUndefined(rpc) || rpc == null)
			throw ERR_NOT_INITIALIZED
	}

	// Files API core methods
	Files.prototype = {
		Download : function(path, successCB, errorCB) {
			if (isUndefined(path))
				throw ERR_PATH
			var params = {
				path : path
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('Files.Download', params, success, error)
		},
		GetDirectory : function(directory, files, properties, sort, successCB, errorCB) {
			if (isUndefined(direcotry))
				throw ERR_DIRECTORY
			var params = {
				directory : directory
			}
			if (notUndefined(files))
				params.files = files
			if (notUndefined(properties))
				params.properties = properties
			if (notUndefined(sort))
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('Files.GetDirectory', params, success, error)
		},
		GetFileDetails : function(media, files, properties, successCB, errorCB) {
			if (isUndefined(media))
				throw ERR_MEDIA
			var params = {
				media : media
			}
			if (notUndefined(files))
				params.files = files
			if (notUndefined(properties))
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('Files.GetFileDetails', params, success, error)
		},
		GetSources : function(media, limits, sort, successCB, errorCB) {
			if (isUndefined(media))
				throw ERR_MEDIA
			var params = {
				media : media
			}
			if (notUndefined(limits))
				params.limits = limits
			if (notUndefined(sort))
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('Files.GetSources', params, success, error)
		},
		PrepareDownload : function(path, successCB, errorCB) {
			if (isUndefined(path))
				throw ERR_PATH
			var params = {
				path : path
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('Files.PrepareDownload', params, success, error)
		}
	}

	// Files API convenience methods
	Files.prototype.download = Files.prototype.Download
	Files.prototype.getDirectory = Files.prototype.GetDirectory
	Files.prototype.getFileDetails = Files.prototype.GetFileDetails
	Files.prototype.getSources = Files.prototype.GetSources
	Files.prototype.prepareDownload = Files.prototype.PrepareDownload

	XBMC.prototype = {
		VideoLibrary : VideoLibrary,
		AudioLibrary : AudioLibrary,
		Files : Files
	}

	// add a custom direct access to server
	if (directAccess) {
		XBMC.prototype.custom = function(call, params, successCB, errorCB) {
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call(call, params, success, error)
		}
	}

	// expose api globally
	window.XBMC = XBMC

})(window)