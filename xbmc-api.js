/*
 * XBMC JSON-RPC API v6 (XBMC 12 and newer) wrapper
 * 
 * This wrapper was written by Tamer Saadeh <tamer@tamersaadeh.com>, 2014
 * 
 * Version: 0.2.1
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
	 * Default error handler (throws error).
	 */
	var errorHandler = function(e) {
		setTimeout(function() {
			throw new Error("XBMC API: " + JSON.stringify(e))
		}, 0)
	}

	/**
	 * Default success handler (uses console.log, if available, else alert).
	 */
	var successHandler = function(e) {
		// define (or otherwise) console.log
		var console = (console == undefined) ? {
			log : function(str) {
				alert(str)
			}
		} : console
		setTimeout(function() {
			console.log("XBMC API: " + JSON.stringify(e))
		}, 0)
	}

	/**
	 * Error strings:
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
			rpc.call('JSONRPC.Ping', [], successHandler, errorHandler)
		}, speed)
	}

	/**
	 * A JS library wrapper for VideoLibrary API
	 * 
	 * @see http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#VideoLibrary
	 */
	// TODO: needs more testing
	var VideoLibrary = function() {
		if (rpc == undefined || rpc == null)
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
			if (options != undefined)
				params.options = options
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.Export', params, success, error)
		},
		GetEpisodeDetails : function(episodeId, properties, successCB, errorCB) {
			if (episodeId == undefined)
				throw ERR_EPISODE_ID
			var params = {
				episodeid : episodeId
			}
			if (properties != undefined)
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetEpisodeDetails', params, success, error)
		},
		GetEpisodes : function(tvShowId, season, properties, limits, sort, filter, successCB, errorCB) {
			var params = {}
			if (tvShowId != undefined)
				params.tvshowid = tvShowId
			if (season != undefined)
				params.season = season
			if (properties != undefined)
				params.properties = properties
			if (limits != undefined)
				params.limits = limits
			if (sort != undefined)
				params.sort = sort
			if (filter != undefined)
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetEpisodes', params, success, error)
		},
		GetGenres : function(type, properties, limits, sort, successCB, errorCB) {
			if (type == undefined)
				throw ERR_TYPE
			var params = {
				type : type
			}
			if (properties != undefined)
				params.properties = properties
			if (limits != undefined)
				params.limits = limits
			if (sort != undefined)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetGenres', params, success, error)
		},
		GetMovieDetails : function(movieId, properties, successCB, errorCB) {
			if (movieId == undefined)
				throw ERR_MOVIE_ID
			var params = {
				movieid : movieId
			}
			if (properties != undefined)
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetMovieDetails', params, success, error)
		},
		GetMovieSetDetails : function(setId, properties, movies, successCB, errorCB) {
			if (setId == undefined)
				throw ERR_SET_ID
			var params = {
				setid : setId
			}
			if (properties != undefined)
				params.properties = properties
			if (movies != undefined)
				params.movies = movies
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetMovieSetDetails', params, success, error)
		},
		GetMovieSets : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (properties != undefined)
				params.properties = properties
			if (limits != undefined)
				params.limits = limits
			if (sort != undefined)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetMovieSets', params, success, error)
		},
		GetMovies : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = {}
			if (properties != undefined)
				params.properties = properties
			if (limits != undefined)
				params.limits = limits
			if (sort != undefined)
				params.sort = sort
			if (filter != undefined)
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetMovies', params, success, error)
		},
		GetMusicVideoDetails : function(musicVideoId, properties, successCB, errorCB) {
			if (musicVideoId == undefined)
				throw ERR_MUSIC_VIDEO_ID
			var params = {
				musicvideoid : musicVideoId
			}
			if (properties != undefined)
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetMusicVideoDetails', params, success, error)
		},
		GetMusicVideos : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = {}
			if (properties != undefined)
				params.properties = properties
			if (limits != undefined)
				params.limits = limits
			if (sort != undefined)
				params.sort = sort
			if (filter != undefined)
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetMusicVideos', params, success, error)
		},
		GetRecentlyAddedEpisodes : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (properties != undefined)
				params.properties = properties
			if (limits != undefined)
				params.limits = limits
			if (sort != undefined)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetRecentlyAddedEpisodes', params, success, error)
		},
		GetRecentlyAddedMovies : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (properties != undefined)
				params.properties = properties
			if (limits != undefined)
				params.limits = limits
			if (sort != undefined)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetRecentlyAddedMovies', params, success, error)
		},
		GetRecentlyAddedMusicVideos : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (properties != undefined)
				params.properties = properties
			if (limits != undefined)
				params.limits = limits
			if (sort != undefined)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetRecentlyAddedMusicVideos', params, success, error)
		},
		GetSeasons : function(tvShowId, properties, limits, sort, successCB, errorCB) {
			if (tvShowId == undefined)
				throw ERR_TV_SHOW_ID
			var params = {
				tvshowid : tvShowId
			}
			if (properties != undefined)
				params.properties = properties
			if (limits != undefined)
				params.limits = limits
			if (sort != undefined)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetSeasons', params, success, error)
		},
		GetTVShowDetails : function(tvShowId, properties, successCB, errorCB) {
			if (tvShowId == undefined)
				throw ERR_TV_SHOW_ID
			var params = {
				episodeid : episodeId
			}
			if (properties != undefined)
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetTVShowDetails', success, error)
		},
		GetTVShows : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = {}
			if (properties != undefined)
				params.properties = properties
			if (limits != undefined)
				params.limits = limits
			if (sort != undefined)
				params.sort = sort
			if (filter != undefined)
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetTVShows', params, success, error)
		},
		RemoveEpisode : function(episodeId, successCB, errorCB) {
			if (episodeId == undefined)
				throw ERR_EPISODE_ID
			var params = {
				episodeid : episodeId
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.RemoveEpisode', params, success, error)
		},
		RemoveMovie : function(movieId, successCB, errorCB) {
			if (movieId == undefined)
				throw ERR_MOVIE_ID
			var params = {
				movieid : movieId
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.RemoveMovie', params, success, error)
		},
		RemoveMusicVideo : function(musicVideoId, successCB, errorCB) {
			if (musicVideoId == undefined)
				throw ERR_MUSIC_VIDEO_ID
			var params = {
				musicvideoid : musicVideoId
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.RemoveMusicVideo', params, success, error)
		},
		RemoveTVShow : function(tvShowId, successCB, errorCB) {
			if (tvShowId == undefined)
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
			if (directory != undefined)
				params.directory = directory
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.Scan', params, success, error)
		},
		SetEpisodeDetails : function(episodeId, title, playCount, runTime, director, plot, rating, votes, lastPlayed, writer, firstAired,
				productionCode, season, episode, originalTitle, thumbnail, fanart, art, successCB, errorCB) {
			if (episodeId == undefined)
				throw ERR_EPISODE_ID
			var params = {
				episodeid : episodeId
			}
			if (title != undefined)
				params.title = title
			if (playCount != undefined)
				params.playcount = playCount
			if (runTime != undefined)
				params.runtime = runTime
			if (director != undefined)
				params.director = director
			if (plot != undefined)
				params.plot = plot
			if (rating != undefined)
				params.rating = rating
			if (votes != undefined)
				params.votes = votes
			if (lastPlayed != undefined)
				params.lastplayed = lastPlayed
			if (writer != undefined)
				params.writer = writer
			if (firstAired != undefined)
				params.firstaired = (firstAired)
			if (productionCode != undefined)
				params.productioncode = productionCode
			if (season != undefined)
				params.season = season
			if (episode != undefined)
				params.episode = episode
			if (originalTitle != undefined)
				params.originalTitle = originalTitle
			if (thumbnail != undefined)
				params.thumbnail = thumbnail
			if (fanart != undefined)
				params.fanart = fanart
			if (art != undefined)
				params.art = art
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.SetEpisodeDetails', params, success, error)
		},
		SetMovieDetails : function(movieId, title, playCount, runTime, director, studio, year, plot, genre, rating, mpaa, imdbNumber, votes,
				lastPlayed, originalTitle, trailer, tagLine, plotOutline, writer, country, top250, sortTitle, set, showLink, thumbnail, fanart, tag,
				art, successCB, errorCB) {
			if (movieId == undefined)
				throw ERR_MOVIE_ID
			var params = {
				movieid : movieId
			}
			if (title != undefined)
				params.title = title
			if (playCount != undefined)
				params.playcount = playCount
			if (runTime != undefined)
				params.runtime = runTime
			if (director != undefined)
				params.director = director
			if (studio != undefined)
				params.studio = studio
			if (year != undefined)
				params.year = year
			if (plot != undefined)
				params.plot = plot
			if (genre != undefined)
				params.genre = genre
			if (rating != undefined)
				params.rating = rating
			if (mpaa != undefined)
				params.mpaa = mpaa
			if (imdbNumber != undefined)
				params.imdbnumber = imdbNumber
			if (votes != undefined)
				params.votes = votes
			if (lastPlayed != undefined)
				params.lastplayed = lastPlayed
			if (originalTitle != undefined)
				params.originaltitle = originalTitle
			if (trailer != undefined)
				params.trailer = trailer
			if (tagLine != undefined)
				params.tagline = tagLine
			if (plotOutline != undefined)
				params.plotoutline = plotOutline
			if (writer != undefined)
				params.writer = writer
			if (country != undefined)
				params.country = country
			if (top250 != undefined)
				params.top250 = top250
			if (sortTitle != undefined)
				params.sorttitle = sortTitle
			if (set != undefined)
				params.set = set
			if (showLink != undefined)
				params.showlink = showLink
			if (thumbnail != undefined)
				params.thumbnail = thumbnail
			if (fanart != undefined)
				params.fanart = fanart
			if (tag != undefined)
				params.tag = tag
			if (art != undefined)
				params.art = art
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.SetMovieDetails', params, success, error)
		},
		SetMusicVideoDetails : function(musicVideoId, title, playCount, runTime, director, studio, year, plot, album, artist, genre, track,
				lastPlayed, thumbnail, fanart, tag, art, successCB, errorCB) {
			if (musicVideoId == undefined)
				throw ERR_MUSIC_VIDEO_ID
			var params = {
				musicvideoid : musicVideoId
			}
			if (title != undefined)
				params.title = title
			if (playCount != undefined)
				params.playcount = playCount
			if (runTime != undefined)
				params.runtime = runTime
			if (director != undefined)
				params.director = director
			if (studio != undefined)
				params.studio = studio
			if (year != undefined)
				params.year = year
			if (plot != undefined)
				params.plot = plot
			if (album != undefined)
				params.album = album
			if (artist != undefined)
				params.push(artist)
			if (genre != undefined)
				params.genre = genre
			if (track != undefined)
				params.track = track
			if (lastPlayed != undefined)
				params.lastplayed = lastPlayed
			if (thumbnail != undefined)
				params.thumbnail = thumbnail
			if (fanart != undefined)
				params.fanart = fanart
			if (tag != undefined)
				params.tag = tag
			if (art != undefined)
				params.art = art
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.SetMusicVideoDetails', params, success, error)
		},
		SetTVShowDetails : function(tvShowId, title, playCount, studio, plot, rating, mpaa, imdbNumber, premiered, votes, lastPlayed, originalTitle,
				sortTitle, episodeGuide, thumbnail, fanart, tag, art, successCB, errorCB) {
			if (tvShowId == undefined)
				throw ERR_TV_SHOW_ID
			var params = {
				tvshowid : tvShowId
			}
			if (title != undefined)
				params.title = title
			if (playCount != undefined)
				params.playcount = playCount
			if (studio != undefined)
				params.studio = studio
			if (plot != undefined)
				params.plot = plot
			if (rating != undefined)
				params.rating = rating
			if (mpaa != undefined)
				params.push(mpaa)
			if (imdbNumber != undefined)
				params.imdbnumber = imdbNumber
			if (premiered != undefined)
				params.premiered = premiered
			if (votes != undefined)
				params.votes = votes
			if (lastPlayed != undefined)
				params.lastplayed = lastPlayed
			if (originalTitle != undefined)
				params.originaltitle = originalTitle
			if (sortTitle != undefined)
				params.sorttitle = sortTitle
			if (episodeGuide != undefined)
				params.push(episodeGuide)
			if (thumbnail != undefined)
				params.thumbnail = thumbnail
			if (fanart != undefined)
				params.fanart = fanart
			if (tag != undefined)
				params.tag = tag
			if (art != undefined)
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
		if (episodeId == undefined)
			throw ERR_EPISODE_ID
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		rpc.call('VideoLibrary.SetEpisodeDetails', params, success, error)
	}
	VideoLibrary.prototype.setMovieDetailsByObject = function(params, successCB, errorCB) {
		var movieId = movieDetails.episodeid
		if (movieId == undefined)
			throw ERR_MOVIE_ID
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		rpc.call('VideoLibrary.SetMovieDetails', params, success, error)
	}
	VideoLibrary.prototype.setMusicVideoDetailsByObject = function(params, successCB, errorCB) {
		var musicVideoId = musicVidioDetails.musicvideoid
		if (musicVideoId == undefined)
			throw ERR_MUSIC_VIDEO_ID
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		rpc.call('VideoLibrary.SetMusicVideoDetails', params, success, error)
	}
	VideoLibrary.prototype.setTVShowDetailsByObject = function(params, successCB, errorCB) {
		var tvShowId = tvShowDetails.tvshowid
		if (tvShowId == undefined)
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
		if (rpc == undefined || rpc == null)
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
			if (option != undefined)
				params.options = options
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.Export', params, success, error)
		},
		GetAlbumDetails : function(albumId, properties, successCB, errorCB) {
			if (albumId == undefined)
				throw ERR_ALBUM_ID
			var params = {
				albumid : albumId
			}
			if (properties != undefined)
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetAlbumDetails', params, success, error)
		},
		GetAlbums : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = {}
			if (properties != undefined)
				params.properties = properties
			if (limits != undefined)
				params.limits = limits
			if (sort != undefined)
				params.sort = sort
			if (filter != undefined)
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetAlbums', params, success, error)
		},
		GetArtistDetails : function(artiestId, properties, successCB, errorCB) {
			if (artiestID == undefined)
				throw ERR_ARTIST_ID
			var params = {
				artiestid : artiestId
			}
			if (properties != undefined)
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetArtistDetails', params, success, error)
		},
		GetArtist : function(albumArtistsOnly, properties, limits, sort, filter, successCB, errorCB) {
			if (type == undefined)
				throw ERR_TYPE
			var params = {
				type : type
			}
			if (albumArtistsOnly != undefined)
				params.albumartistsonly = albumArtistsOnly
			if (properties != undefined)
				params.properties = properties
			if (limits != undefined)
				params.limits = limits
			if (sort != undefined)
				params.sort = sort
			if (filter != undefined)
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetArtist', params, success, error)
		},
		GetGenres : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (properties != undefined)
				params.properties = properties
			if (limits != undefined)
				params.limits = limits
			if (sort != undefined)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetGenres', params, success, error)
		},
		GetRecentlyAddedAlbums : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (properties != undefined)
				params.properties = properties
			if (limits != undefined)
				params.limits = limits
			if (sort != undefined)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetRecentlyAddedAlbums', params, success, error)
		},
		GetRecentlyAddedSongs : function(albumLimit, properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (albumLimit != undefined)
				params.albumLimit = albumLimit
			if (properties != undefined)
				params.properties = properties
			if (limits != undefined)
				params.limits = limits
			if (sort != undefined)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetRecentlyAddedSongs', params, success, error)
		},
		GetRecentlyPlayedAlbums : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (properties != undefined)
				params.properties = properties
			if (limits != undefined)
				params.limits = limits
			if (sort != undefined)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetRecentlyPlayedAlbums', params, success, error)
		},
		GetRecentlyPlayedSongs : function(properties, limits, sort, successCB, errorCB) {
			var params = {}
			if (properties != undefined)
				params.properties = properties
			if (limits != undefined)
				params.limits = limits
			if (sort != undefined)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetRecentlyPlayedSongs', params, success, error)
		},
		GetSongDetails : function(songId, properties, successCB, errorCB) {
			if (songId == undefined)
				throw ERR_SONG_ID
			var params = {
				songid : songId
			}
			if (properties != undefined)
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetSongDetails', params, success, error)
		},
		GetSongs : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = {}
			if (properties != undefined)
				params.properties = properties
			if (limits != undefined)
				params.limits = limits
			if (sort != undefined)
				params.sort = sort
			if (filter != undefined)
				params.filter = filter
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetSongs', params, success, error)
		},
		Scan : function(directory, successCB, errorCB) {
			var params = {}
			if (directory != undefined)
				params.directory = directory
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.Scan', params, success, error)
		},
		SetAlbumDetails : function(albumId, title, artist, description, genre, theme, mood, style, type, albumLabel, rating, year, successCB, errorCB) {
			if (albumId == undefined)
				throw ERR_ALBUM_ID
			var params = {
				albumid : albumId
			}
			if (title != undefined)
				params.title = title
			if (artist != undefined)
				params.artist = artist
			if (description != undefined)
				params.description = description
			if (genre != undefined)
				params.genre = genre
			if (theme != undefined)
				params.theme = theme
			if (mood != undefined)
				params.mood = mood
			if (style != undefined)
				params.style = style
			if (type != undefined)
				params.type = type
			if (albumLabel != undefined)
				params.albumlabel = albumLabel
			if (rating != undefined)
				params.rating = rating
			if (year != undefined)
				params.year = year
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.SetAlbumDetails', params, success, error)
		},
		SetArtistDetails : function(artistId, artist, instrument, style, mood, born, formed, description, genre, died, disbanded, yearsActive,
				successCB, errorCB) {
			if (artistId == undefined)
				throw ERR_ARTIST_ID
			var params = {
				artistid : artistId
			}
			if (artist != undefined)
				params.artist = artist
			if (instrument != undefined)
				params.instrument = instrument
			if (style != undefined)
				params.style = style
			if (mood != undefined)
				params.mood = mood
			if (born != undefined)
				params.born = born
			if (formed != undefined)
				params.formed = formed
			if (description != undefined)
				params.description = description
			if (genre != undefined)
				params.genre = genre
			if (died != undefined)
				params.died = died
			if (disbanded != undefined)
				params.disbanded = disbanded
			if (yearsActive != undefined)
				params.yearsactive = yearsActive
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.SetArtistDetails', params, success, error)
		},
		SetSongDetails : function(songId, title, artist, albumArtist, genre, year, rating, album, track, disc, duration, comment, musicBrainzTrackId,
				musicBrainzArtistId, musicBrainzAlbumId, musicBrainzAlbumArtistId, successCB, errorCB) {
			if (songId == undefined)
				throw ERR_SONG_ID
			var params = {
				songid : songId
			}
			if (title != undefined)
				params.title = title
			if (artist != undefined)
				params.artist = artist
			if (albumArtist != undefined)
				params.albumartist = albumArtist
			if (genre != undefined)
				params.genre = genre
			if (year != undefined)
				params.year = year
			if (rating != undefined)
				params.rating = rating
			if (album != undefined)
				params.album = album
			if (track != undefined)
				params.track = track
			if (disc != undefined)
				params.disc = disc
			if (duration != undefined)
				params.duration = duration
			if (comment != undefined)
				params.comment = comment
			if (musicBrainzTrackId != undefined)
				params.musicbrainztrackid = musicBrainzTrackId
			if (musicBrainzArtistId != undefined)
				params.musicbrainzartistid = musicBrainzArtistId
			if (musicBrainzAlbumId != undefined)
				params.musicbrainzalbumid = musicBrainzAlbumId
			if (musicBrainzAlbumArtistId != undefined)
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
		if (albumId == undefined)
			throw ERR_ALBUM_ID
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		rpc.call('AudioLibrary.SetAlbumDetails', params, success, error)
	}
	AudioLibrary.prototype.setArtistDetailsByObject = function(params, successCB, errorCB) {
		var artistId = artistDetails.artistid
		if (artistId == undefined)
			throw ERR_ARTIST_ID
		var success = successCB || successHandler
		var error = errorCB || errorHandler
		rpc.call('AudioLibrary.SetArtistDetails', params, success, error)
	}
	AudioLibrary.prototype.setSongDetailsByObject = function(songDetails, successCB, errorCB) {
		var songId = songDetails.songid
		if (songId == undefined)
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
		if (rpc == undefined || rpc == null)
			throw ERR_NOT_INITIALIZED
	}

	// Files API core methods
	Files.prototype = {
		Download : function(path, successCB, errorCB) {
			if (path == undefined)
				throw ERR_PATH
			var params = {
				path : path
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('Files.Download', params, success, error)
		},
		GetDirectory : function(directory, files, properties, sort, successCB, errorCB) {
			if (direcotry == undefined)
				throw ERR_DIRECTORY
			var params = {
				directory : directory
			}
			if (files != undefined)
				params.files = files
			if (properties != undefined)
				params.properties = properties
			if (sort != undefined)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('Files.GetDirectory', params, success, error)
		},
		GetFileDetails : function(media, files, properties, successCB, errorCB) {
			if (media == undefined)
				throw ERR_MEDIA
			var params = {
				media : media
			}
			if (files != undefined)
				params.files = files
			if (properties != undefined)
				params.properties = properties
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('Files.GetFileDetails', params, success, error)
		},
		GetSources : function(media, limits, sort, successCB, errorCB) {
			if (media == undefined)
				throw ERR_MEDIA
			var params = {
				media : media
			}
			if (limits != undefined)
				params.limits = limits
			if (sort != undefined)
				params.sort = sort
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('Files.GetSources', params, success, error)
		},
		PrepareDownload : function(path, successCB, errorCB) {
			if (path == undefined)
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