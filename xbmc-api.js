/*
 * XBMC JSON-RPC API v6 (XBMC 12 and newer) wrapper
 * 
 * This wrapper was written by Tamer Saadeh <tamer@tamersaadeh.com>, 2014
 * 
 * Version: 0.1.1
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
	 * Default error handler (throws error).
	 */
	var errorHandler = function(e) {
		setTimeout(function() {
			throw new Error("XBMC API:" + JSON.stringify(e))
		}, 0)
	}

	/**
	 * Default success handler (uses console.log, if available, else alert).
	 */
	var successHandler = function(e) {
		// define (or otherwise) console.log
		console = console == undefined ? {
			log : function(str) {
				alert(str)
			}
		} : console
		setTimeout(function() {
			console.log("XBMC API:" + JSON.stringify(e))
		}, 0)
	}

	/**
	 * Error strings:
	 * 
	 * @param ERR_NOT_INITIALIZED
	 *            when XBMC is not initialized
	 * @param ERR_TYPE
	 *            when the type parameter is missing
	 * @param ERR_PATH
	 *            when the path parameter is missing
	 * @param ERR_MEDIA
	 *            when the media parameter is missing
	 * @param ERR_DIRECTORY
	 *            when the directory parameter is missing
	 * @param ERR_EPISODE_ID
	 *            when episode ID as a parameter is missing
	 * @param ERR_SET_ID
	 *            when the set ID parameter is missing
	 * @param ERR_MOVIE_ID
	 *            when the movie ID parameter is missing
	 * @param ERR_MUSIC_VIDEO_ID
	 *            when the music video ID parameter is missing
	 * @param ERR_TV_SHOW_ID
	 *            when the TV show ID parameter is missing
	 * @param ERR_ALBUM_ID
	 *            when the album ID parameter is missing
	 * @param ERR_ARTIST_ID
	 *            when the artist ID parameter is missing
	 * @param ERR_SONG_ID
	 *            when the song ID parameter is missing
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
	 */
	var XBMC = function(hostname, port) {
		var h = hostname || window.location.hostname
		// TODO: I need to some how figure this port
		var p = port || 9090

		rpc = new $.JsonRpcClient({
			ajaxUrl : '/jsonrpc',
			socketUrl : 'ws://' + h + ':' + p + '/'
		})

		// To ensure the connection stays open, we ping it every 500ms
		window.setInterval(function() {
			rpc.call('JSONRPC.Ping', [], successHandler, errorHandler)
		}, 500)
	}

	/**
	 * A JS library wrapper for VideoLibrary API
	 * 
	 * @see http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#VideoLibrary
	 */
	// TODO: needs more testing
	var VideoLibrary = function() {
		if (rpc == undefined || rpc == null) {
			throw ERR_NOT_INITIALIZED
		}
	}

	// VideoLibrary API core methods
	VideoLibrary.prototype = {
		Clean : function(successCB, errorCB) {
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.Clean', [], success, error)
		},
		Export : function(options, successCB, errorCB) {
			var params = []
			if (option != undefined) {
				params.push(options)
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.Export', params, success, error)
		},
		GetEpisodeDetails : function(episodeId, properties, successCB, errorCB) {
			if (episodeId == undefined) {
				throw ERR_EPISODE_ID
			}
			var params = [ episodeId ]
			if (properties != undefined) {
				params.push(properties)
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetEpisodeDetails', params, success, error)
		},
		GetEpisodes : function(tvShowId, season, properties, limits, sort, filter, successCB, errorCB) {
			var params = []
			if (tvShowId != undefined) {
				params.push(tvShowId)
				if (season != undefined) {
					params.push(season)
					if (properties != undefined) {
						params.push(properties)
						if (limits != undefined) {
							params.push(limits)
							if (sort != undefined) {
								params.push(sort)
								if (filter != undefined) {
									params.push(filter)
								}
							}
						}
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetEpisodes', params, success, error)
		},
		GetGenres : function(type, properties, limits, sort, successCB, errorCB) {
			if (type == undefined) {
				throw ERR_TYPE
			}
			var params = [ type ]
			if (properties != undefined) {
				params.push(properties)
				if (limits != undefined) {
					params.push(limits)
					if (sort != undefined) {
						params.push(sort)
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetGenres', params, success, error)
		},
		GetMovieDetails : function(movieId, properties, successCB, errorCB) {
			if (movieId == undefined) {
				throw ERR_MOVIE_ID
			}
			var params = [ movieId ]
			if (properties != undefined) {
				params.push(properties)
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetMovieDetails', params, success, error)
		},
		GetMovieSetDetails : function(setId, properties, movies, successCB, errorCB) {
			if (setId == undefined) {
				throw ERR_SET_ID
			}
			var params = [ setId ]
			if (properties != undefined) {
				params.push(properties)
				if (movies != undefined) {
					params.push(movies)
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetMovieSetDetails', params, success, error)
		},
		GetMovieSets : function(properties, limits, sort, successCB, errorCB) {
			var params = []
			if (properties != undefined) {
				params.push(properties)
				if (limits != undefined) {
					params.push(limits)
					if (sort != undefined) {
						params.push(sort)
					}
				}
			}
			var success = successCB || successHandler
			rpc.call('VideoLibrary.GetMovieSets', params, success, error)
		},
		GetMovies : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = []
			if (properties != undefined) {
				params.push(properties)
				if (limits != undefined) {
					params.push(limits)
					if (sort != undefined) {
						params.push(sort)
						if (filter != undefined) {
							params.push(filter)
						}
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetMovies', params, success, error)
		},
		GetMusicVideoDetails : function(musicVideoId, properties, successCB, errorCB) {
			if (musicVideoId == undefined) {
				throw ERR_MUSIC_VIDEO_ID
			}
			var params = [ musicVideoId ]
			if (properties != undefined) {
				params.push(properties)
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetMusicVideoDetails', params, success, error)
		},
		GetMusicVideos : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = []
			if (properties != undefined) {
				params.push(properties)
				if (limits != undefined) {
					params.push(limits)
					if (sort != undefined) {
						params.push(sort)
						if (filter != undefined) {
							params.push(filter)
						}
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetMusicVideos', params, success, error)
		},
		GetRecentlyAddedEpisodes : function(properties, limits, sort, successCB, errorCB) {
			var params = []
			if (properties != undefined) {
				params.push(properties)
				if (limits != undefined) {
					params.push(limits)
					if (sort != undefined) {
						params.push(sort)
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetRecentlyAddedEpisodes', params, success, error)
		},
		GetRecentlyAddedMovies : function(properties, limits, sort, successCB, errorCB) {
			var params = []
			if (properties != undefined) {
				params.push(properties)
				if (limits != undefined) {
					params.push(limits)
					if (sort != undefined) {
						params.push(sort)
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetRecentlyAddedMovies', params, success, error)
		},
		GetRecentlyAddedMusicVideos : function(properties, limits, sort, successCB, errorCB) {
			var params = []
			if (properties != undefined) {
				params.push(properties)
				if (limits != undefined) {
					params.push(limits)
					if (sort != undefined) {
						params.push(sort)
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetRecentlyAddedMusicVideos', params, success, error)
		},
		GetSeasons : function(tvShowId, properties, limits, sort, successCB, errorCB) {
			if (tvShowId == undefined) {
				throw ERR_TV_SHOW_ID
			}
			var params = [ tvShowId ]
			if (properties != undefined) {
				params.push(properties)
				if (limits != undefined) {
					params.push(limits)
					if (sort != undefined) {
						params.push(sort)
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetSeasons', params, success, error)
		},
		GetTVShowDetails : function(tvShowId, properties, successCB, errorCB) {
			if (tvShowId == undefined) {
				throw ERR_TV_SHOW_ID
			}
			var params = [ episodeId ]
			if (properties != undefined) {
				params.push(properties)
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetTVShowDetails', success, error)
		},
		GetTVShows : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = []
			if (properties != undefined) {
				params.push(properties)
				if (limits != undefined) {
					params.push(limits)
					if (sort != undefined) {
						params.push(sort)
						if (filter != undefined) {
							params.push(filter)
						}
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.GetTVShows', params, success, error)
		},
		RemoveEpisode : function(episodeId, successCB, errorCB) {
			if (tvShowId == undefined) {
				throw ERR_EPISODE_ID
			}
			var params = [ tvShowId ]
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.RemoveEpisode', params, success, error)
		},
		RemoveMovie : function(movieId, successCB, errorCB) {
			if (movieId == undefined) {
				throw ERR_MOVIE_ID
			}
			var params = [ movieId ]
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.RemoveMovie', params, success, error)
		},
		RemoveMusicVideo : function(musicVideoId, successCB, errorCB) {
			if (musicVideoId == undefined) {
				throw ERR_MUSIC_VIDEO_ID
			}
			var params = [ musicVideoId ]
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.RemoveMusicVideo', params, success, error)
		},
		RemoveTVShow : function(tvShowId, successCB, errorCB) {
			if (tvShowId == undefined) {
				throw ERR_TV_SHOW_ID
			}
			var params = [ tvShowId ]
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.RemoveTVShow', params, success, error)
		},
		Scan : function(directory, successCB, errorCB) {
			var params = []
			if (directory != undefined) {
				params.push(directory)
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.Scan', params, success, error)
		},
		SetEpisodeDetails : function(episodeId, title, playCount, runTime, director, plot, rating, votes, lastPlayed, writer, firstAired,
				productionCode, season, episode, originalTitle, thumbnail, fanart, art, successCB, errorCB) {
			if (episodeId == undefined) {
				throw ERR_EPISODE_ID
			}
			var params = [ episodeId ]
			if (title != undefined) {
				params.push(title)
				if (playCount != undefined) {
					params.push(playCount)
					if (runTime != undefined) {
						params.push(runTime)
						if (director != undefined) {
							params.push(director)
							if (plot != undefined) {
								params.push(plot)
								if (rating != undefined) {
									params.push(rating)
									if (votes != undefined) {
										params.push(votes)
										if (lastPlayed != undefined) {
											params.push(lastPlayed)
											if (writer != undefined) {
												params.push(writer)
												if (firstAired != undefined) {
													params.push(firstAired)
													if (productionCode != undefined) {
														params.push(productionCode)
														if (season != undefined) {
															params.push(season)
															if (episode != undefined) {
																params.push(episode)
																if (originalTitle != undefined) {
																	params.push(originalTitle)
																	if (thumbnail != undefined) {
																		params.push(thumbnail)
																		if (fanart != undefined) {
																			params.push(fanart)
																			if (art != undefined) {
																				params.push(art)
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.SetEpisodeDetails', params, success, error)
		},
		SetMovieDetails : function(movieId, title, playCount, runTime, director, studio, year, plot, genre, rating, mpaa, imdbNumber, votes,
				lastPlayed, originalTitle, trailer, tagLine, plotOutline, writer, country, top250, sortTitle, set, showLink, thumbnail, fanart, tag,
				art, successCB, errorCB) {
			if (movieId == undefined) {
				throw ERR_MOVIE_ID
			}
			var params = [ movieId ]
			if (title != undefined) {
				params.push(title)
				if (playCount != undefined) {
					params.push(playCount)
					if (runTime != undefined) {
						params.push(runTime)
						if (director != undefined) {
							params.push(director)
							if (studio != undefined) {
								params.push(studio)
								if (year != undefined) {
									params.push(year)
									if (plot != undefined) {
										params.push(plot)
										if (genre != undefined) {
											params.push(genre)
											if (rating != undefined) {
												params.push(rating)
												if (mpaa != undefined) {
													params.push(mpaa)
													if (imdbNumber != undefined) {
														params.push(imdbNumber)
														if (votes != undefined) {
															params.push(votes)
															if (lastPlayed != undefined) {
																params.push(lastPlayed)
																if (originalTitle != undefined) {
																	params.push(originalTitle)
																	if (trailer != undefined) {
																		params.push(trailer)
																		if (tagLine != undefined) {
																			params.push(tagLine)
																			if (plotOutline != undefined) {
																				params.push(plotOutline)
																				if (writer != undefined) {
																					params.push(writer)
																					if (country != undefined) {
																						params.push(country)
																						if (top250 != undefined) {
																							params.push(top250)
																							if (sortTitle != undefined) {
																								params.push(sortTitle)
																								if (set != undefined) {
																									params.push(set)
																									if (showLink != undefined) {
																										params.push(showLink)
																										if (thumbnail != undefined) {
																											params.push(thumbnail)
																											if (fanart != undefined) {
																												params.push(fanart)
																												if (tag != undefined) {
																													params.push(tag)
																													if (art != undefined) {
																														params.push(art)
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.SetMovieDetails', params, success, error)
		},
		SetMusicVideoDetails : function(musicVideoId, title, playCount, runTime, director, studio, year, plot, album, artist, genre, track,
				lastPlayed, thumbnail, fanart, tag, art, successCB, errorCB) {
			if (musicVideoId == undefined) {
				throw ERR_MUSIC_VIDEO_ID
			}
			var params = [ musicVideoId ]
			if (title != undefined) {
				params.push(title)
				if (playCount != undefined) {
					params.push(playCount)
					if (runTime != undefined) {
						params.push(runTime)
						if (director != undefined) {
							params.push(director)
							if (studio != undefined) {
								params.push(studio)
								if (year != undefined) {
									params.push(year)
									if (plot != undefined) {
										params.push(plot)
										if (album != undefined) {
											params.push(album)
											if (artist != undefined) {
												params.push(artist)
												if (genre != undefined) {
													params.push(genre)
													if (track != undefined) {
														params.push(track)
														if (lastPlayed != undefined) {
															params.push(lastPlayed)
															if (thumbnail != undefined) {
																params.push(thumbnail)
																if (fanart != undefined) {
																	params.push(fanart)
																	if (tag != undefined) {
																		params.push(tag)
																		if (art != undefined) {
																			params.push(art)
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('VideoLibrary.SetMusicVideoDetails', params, success, error)
		},
		SetTVShowDetails : function(tvShowId, title, playCount, studio, plot, rating, mpaa, imdbNumber, premiered, votes, lastPlayed, originalTitle,
				sortTitle, episodeGuide, thumbnail, fanart, tag, art, successCB, errorCB) {
			if (tvShowId == undefined) {
				throw ERR_TV_SHOW_ID
			}
			var params = [ tvShowId ]
			if (title != undefined) {
				params.push(title)
				if (playCount != undefined) {
					params.push(playCount)
					if (studio != undefined) {
						params.push(studio)
						if (plot != undefined) {
							params.push(plot)
							if (rating != undefined) {
								params.push(rating)
								if (mpaa != undefined) {
									params.push(mpaa)
									if (imdbNumber != undefined) {
										params.push(imdbNumber)
										if (premiered != undefined) {
											params.push(premiered)
											if (votes != undefined) {
												params.push(votes)
												if (lastPlayed != undefined) {
													params.push(lastPlayed)
													if (originalTitle != undefined) {
														params.push(originalTitle)
														if (sortTitle != undefined) {
															params.push(sortTitle)
															if (episodeGuide != undefined) {
																params.push(episodeGuide)
																if (thumbnail != undefined) {
																	params.push(thumbnail)
																	if (fanart != undefined) {
																		params.push(fanart)
																		if (tag != undefined) {
																			params.push(tag)
																			if (art != undefined) {
																				params.push(art)
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
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
	VideoLibrary.prototype.getMovieSet = VideoLibrary.prototype.GetMovieSets
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
	VideoLibrary.prototype.setEpisodeDetails = VideoLibrary.prototype.SetEpisodeDetails, VideoLibrary.prototype.setEpisodeDetailsByObject = function(
			episodeDetails, successCB, errorCB) {
		var episodeId = episodeDetails.episodeid
		if (episodeId == undefined) {
			throw ERR_EPISODE_ID
		}
		var title = episodeDetails.title
		var playCount = episodeDetails.playcount
		var runTime = episodeDetails.runTime
		var director = episodeDetails.director
		var plot = episodeDetails.plot
		var rating = episodeDetails.rating
		var votes = episodeDetails.votes
		var lastPlayed = episodeDetails.lastplayed
		var writer = episodeDetails.writer
		var firstAired = episodeDetails.firstaired
		var productionCode = episodeDetails.productioncode
		var season = episodeDetails.season
		var episode = episodeDetails.episode
		var originalTitle = episodeDetails.originaltitle
		var thumbnail = episodeDetails.thumbnail
		var fanart = episodeDetails.fanart
		var art = episodeDetails.art
		VideoLibrary.prototype.SetEpisodeDetails(episodeId, title, playCount, runTime, director, plot, rating, votes, lastPlayed, writer, firstAired,
				productionCode, season, episode, originalTitle, thumbnail, fanart, art, successCB, errorCB)
	}
	VideoLibrary.prototype.setMovieDetails = VideoLibrary.prototype.SetMovieDetails, VideoLibrary.prototype.setMovieDetailsByObject = function(
			movieDetails, successCB, errorCB) {
		var movieId = movieDetails.episodeid
		if (movieId == undefined) {
			throw ERR_MOVIE_ID
		}
		var title = movieDetails.title
		var playCount = movieDetails.playcount
		var runTime = movieDetails.runtime
		var director = movieDetails.director
		var studio = movieDetails.studio
		var year = movieDetails.year
		var plot = movieDetails.plot
		var genre = movieDetails.genre
		var rating = movieDetails.rating
		var mpaa = movieDetails.mpaa
		var imdbNumber = movieDetails.imdbnumber
		var votes = movieDetails.votes
		var lastPlayed = movieDetails.lastplayed
		var originalTitle = movieDetails.originaltitle
		var trailer = movieDetails.trailer
		var tagLine = movieDetails.tagline
		var plotOutline = movieDetails.plotoutline
		var writer = movieDetails.writer
		var country = movieDetails.country
		var top250 = movieDetails.top250
		var sortTitle = movieDetails.sorttitle
		var set = movieDetails.set
		var showLink = movieDetails.showlink
		var thumbnail = movieDetails.thumbnail
		var fanart = movieDetails.fanart
		var tag = movieDetails.tag
		var art = movieDetails.art
		VideoLibrary.prototype.SetMovieDetails(movieId, title, playCount, runTime, director, studio, year, plot, genre, rating, mpaa, imdbNumber,
				votes, lastPlayed, originalTitle, trailer, tagLine, plotOutline, writer, country, top250, sortTitle, set, showLink, thumbnail,
				fanart, tag, art, successCB, errorCB)
	}
	VideoLibrary.prototype.setMusicVideoDetails = VideoLibrary.prototype.SetMusicVideoDetails,
			VideoLibrary.prototype.setMusicVideoDetailsByObject = function(musicVidioDetails, successCB, errorCB) {
				var musicVideoId = musicVidioDetails.musicvideoid
				if (musicVideoId == undefined) {
					throw ERR_MUSIC_VIDEO_ID
				}
				var title = musicVidioDetails.title
				var playCount = musicVidioDetails.playcount
				var runTime = musicVidioDetails.runtime
				var director = musicVidioDetails.director
				var studio = musicVidioDetails.studio
				var year = musicVidioDetails.year
				var plot = musicVidioDetails.plot
				var album = musicVidioDetails.album
				var artist = musicVidioDetails.artist
				var genre = musicVidioDetails.genre
				var track = movieDetails.track
				var lastPlayed = movieDetails.lastplayed
				var thumbnail = movieDetails.thumbnail
				var fanart = movieDetails.fanart
				var tag = movieDetails.tag
				var art = movieDetails.art
				VideoLibrary.prototype.SetMusicVideoDetails(musicVideoId, title, playCount, runTime, director, studio, year, plot, album, artist,
						genre, track, lastPlayed, thumbnail, fanart, tag, art, successCB, errorCB)
			}
	VideoLibrary.prototype.setTVShowDetails = VideoLibrary.prototype.SetTVShowDetails
	VideoLibrary.prototype.setTVShowDetailsByObject = function(tvShowDetails, successCB, errorCB) {
		var tvShowId = tvShowDetails.tvshowid
		if (tvShowId == undefined) {
			throw ERR_TV_SHOW_ID
		}
		var title = tvShowDetails.title
		var playCount = tvShowDetails.playcount
		var studio = tvShowDetails.studio
		var plot = tvShowDetails.plot
		var rating = tvShowDetails.rating
		var mpaa = tvShowDetails.mpaa
		var imdbNumber = tvShowDetails.imdbnumber
		var premiered = tvShowDetails.premiered
		var votes = tvShowDetails.votes
		var lastPlayed = tvShowDetails.lastplayed
		var originalTitle = tvShowDetails.originaltitle
		var sortTitle = tvShowDetails.sorttitle
		var thumbnail = tvShowDetails.thumbnail
		var fanart = tvShowDetails.fanart
		var tag = tvShowDetails.tag
		var art = tvShowDetails.art
		VideoLibrary.prototype.SetTVShowDetails(tvShowId, title, playCount, studio, plot, rating, mpaa, imdbNumber, premiered, votes, lastPlayed,
				originalTitle, sortTitle, episodeGuide, thumbnail, fanart, tag, art, successCB, errorCB)
	}

	/**
	 * A JS library wrapper for AudioLibrary API
	 * 
	 * @see http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#AudioLibrary
	 */
	// TODO: needs testing
	var AudioLibrary = function() {
		if (rpc == undefined || rpc == null) {
			throw ERR_NOT_INITIALIZED
		}
	}

	// AudioLibrary API core methods
	AudioLibrary.prototype = {
		Clean : function(successCB, errorCB) {
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.Clean', [], success, error)
		},
		Export : function(options, successCB, errorCB) {
			var params = []
			if (option != undefined) {
				params.push(options)
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.Export', params, success, error)
		},
		GetAlbumDetails : function(albumId, properties, successCB, errorCB) {
			if (albumId == undefined) {
				throw ERR_ALBUM_ID
			}
			var params = [ albumId ]
			if (properties != undefined) {
				params.push(properties)
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetAlbumDetails', params, success, error)
		},
		GetAlbums : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = []
			if (properties != undefined) {
				params.push(properties)
				if (limits != undefined) {
					params.push(limits)
					if (sort != undefined) {
						params.push(sort)
						if (filter != undefined) {
							params.push(filter)
						}
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetAlbums', params, success, error)
		},
		GetArtistDetails : function(artiestID, properties, successCB, errorCB) {
			if (artiestID == undefined) {
				throw ERR_ARTIST_ID
			}
			var params = [ artiestID ]
			if (properties != undefined) {
				params.push(properties)
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetArtistDetails', params, success, error)
		},
		GetArtist : function(albumArtistsOnly, properties, limits, sort, filter, successCB, errorCB) {
			if (type == undefined) {
				throw ERR_TYPE
			}
			var params = [ type ]
			if (albumArtistsOnly != undefined) {
				params.push(albumArtistsOnly)
				if (properties != undefined) {
					params.push(properties)
					if (limits != undefined) {
						params.push(limits)
						if (sort != undefined) {
							params.push(sort)
							if (filter != undefined) {
								params.push(filter)
							}
						}
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetArtist', params, success, error)
		},
		GetGenres : function(properties, limits, sort, successCB, errorCB) {
			var params = []
			if (properties != undefined) {
				params.push(properties)
				if (limits != undefined) {
					params.push(limits)
					if (sort != undefined) {
						params.push(sort)
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetGenres', params, success, error)
		},
		GetRecentlyAddedAlbums : function(properties, limits, sort, successCB, errorCB) {
			var params = []
			if (properties != undefined) {
				params.push(properties)
				if (limits != undefined) {
					params.push(limits)
					if (sort != undefined) {
						params.push(sort)
					}
				}
			}
			var success = successCB || successHandler
			rpc.call('AudioLibrary.GetRecentlyAddedAlbums', params, success, error)
		},
		GetRecentlyAddedSongs : function(albumLimit, properties, limits, sort, successCB, errorCB) {
			var params = []
			if (albumLimit != undefined) {
				params.push(albumLimit)
				if (properties != undefined) {
					params.push(properties)
					if (limits != undefined) {
						params.push(limits)
						if (sort != undefined) {
							params.push(sort)
						}
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetRecentlyAddedSongs', params, success, error)
		},
		GetRecentlyPlayedAlbums : function(properties, limits, sort, successCB, errorCB) {
			var params = []
			if (properties != undefined) {
				params.push(properties)
				if (limits != undefined) {
					params.push(limits)
					if (sort != undefined) {
						params.push(sort)
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetRecentlyPlayedAlbums', params, success, error)
		},
		GetRecentlyPlayedSongs : function(properties, limits, sort, successCB, errorCB) {
			var params = []
			if (properties != undefined) {
				params.push(properties)
				if (limits != undefined) {
					params.push(limits)
					if (sort != undefined) {
						params.push(sort)
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetRecentlyPlayedSongs', params, success, error)
		},
		GetSongDetails : function(songId, properties, successCB, errorCB) {
			if (songId == undefined) {
				throw ERR_SONG_ID
			}
			var params = [ songId ]
			if (properties != undefined) {
				params.push(properties)
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetSongDetails', params, success, error)
		},
		GetSongs : function(properties, limits, sort, filter, successCB, errorCB) {
			var params = []
			if (properties != undefined) {
				params.push(properties)
				if (limits != undefined) {
					params.push(limits)
					if (sort != undefined) {
						params.push(sort)
						if (filter != undefined) {
							params.push(filter)
						}
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.GetSongs', params, success, error)
		},
		Scan : function(directory, successCB, errorCB) {
			var params = []
			if (directory != undefined) {
				params.push(directory)
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.Scan', params, success, error)
		},
		SetAlbumDetails : function(albumId, title, artist, description, genre, theme, mood, style, type, albumLabel, rating, year, successCB, errorCB) {
			if (albumId == undefined) {
				throw ERR_ALBUM_ID
			}
			var params = [ albumId ]
			if (title != undefined) {
				params.push(title)
				if (artist != undefined) {
					params.push(artist)
					if (description != undefined) {
						params.push(description)
						if (genre != undefined) {
							params.push(genre)
							if (theme != undefined) {
								params.push(theme)
								if (mood != undefined) {
									params.push(mood)
									if (style != undefined) {
										params.push(style)
										if (type != undefined) {
											params.push(type)
											if (albumLabel != undefined) {
												params.push(albumLabel)
												if (rating != undefined) {
													params.push(rating)
													if (year != undefined) {
														params.push(year)
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.SetAlbumDetails', params, success, error)
		},
		SetArtistDetails : function(artistId, artist, instrument, style, mood, born, formed, description, genre, died, disbanded, yearsActive,
				successCB, errorCB) {
			if (artistId == undefined) {
				throw ERR_ARTIST_ID
			}
			var params = [ artistId ]
			if (artist != undefined) {
				params.push(artist)
				if (instrument != undefined) {
					params.push(instrument)
					if (style != undefined) {
						params.push(style)
						if (mood != undefined) {
							params.push(mood)
							if (born != undefined) {
								params.push(born)
								if (formed != undefined) {
									params.push(formed)
									if (description != undefined) {
										params.push(description)
										if (genre != undefined) {
											params.push(genre)
											if (died != undefined) {
												params.push(died)
												if (disbanded != undefined) {
													params.push(disbanded)
													if (yearsActive != undefined) {
														params.push(yearsActive)
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('AudioLibrary.SetArtistDetails', params, success, error)
		},
		SetSongDetails : function(songId, title, artist, albumArtist, genre, year, rating, album, track, disc, duration, comment, musicBrainzTrackId,
				musicBrainzArtistId, musicBrainzAlbumId, musicBrainzAlbumArtistId, successCB, errorCB) {
			if (songId == undefined) {
				throw ERR_SONG_ID
			}
			var params = [ songId ]
			if (title != undefined) {
				params.push(title)
				if (artist != undefined) {
					params.push(artist)
					if (albumArtist != undefined) {
						params.push(albumArtist)
						if (genre != undefined) {
							params.push(genre)
							if (year != undefined) {
								params.push(year)
								if (rating != undefined) {
									params.push(rating)
									if (album != undefined) {
										params.push(album)
										if (track != undefined) {
											params.push(track)
											if (disc != undefined) {
												params.push(disc)
												if (duration != undefined) {
													params.push(duration)
													if (comment != undefined) {
														params.push(comment)
														if (musicBrainzTrackId != undefined) {
															params.push(musicBrainzTrackId)
															if (musicBrainzArtistId != undefined) {
																params.push(musicBrainzArtistId)
																if (musicBrainzAlbumId != undefined) {
																	params.push(musicBrainzAlbumId)
																	if (musicBrainzAlbumArtistId != undefined) {
																		params.push(musicBrainzAlbumArtistId)
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
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
	AudioLibrary.prototype.setAlbumDetailsByObject = function(albumDetails, successCB, errorCB) {
		var albumId = albumDetails.albumid
		if (albumId == undefined) {
			throw ERR_ALBUM_ID
		}
		var title = albumDetails.title
		var artist = albumDetails.artist
		var description = albumDetails.description
		var genre = albumDetails.genre
		var theme = albumDetails.theme
		var mood = albumDetails.mood
		var style = albumDetails.style
		var type = albumDetails.type
		var albumLabel = albumDetails.albumlabel
		var rating = albumDetails.rating
		var year = albumDetails.year
		AudioLibrary.prototype.SetAlbumDetails(albumId, title, artist, description, genre, theme, mood, style, type, albumLabel, rating, year,
				successCB, errorCB)
	}
	AudioLibrary.prototype.setArtistDetailsByObject = function(artistDetails, successCB, errorCB) {
		var artistId = artistDetails.artistid
		if (artistId == undefined) {
			throw ERR_ARTIST_ID
		}
		var artist = artistDetails.artist
		var instrument = artistDetails.instrument
		var style = artistDetails.style
		var mood = artistDetails.mood
		var born = artistDetails.born
		var formed = artistDetails.formed
		var description = artistDetails.description
		var genre = artistDetails.genre
		var died = artistDetails.died
		var disbanded = artistDetails.disbanded
		var yearsActive = artistDetails.yearsactive
		AudioLibrary.prototype.SetArtistDetails(artistId, artist, instrument, style, mood, born, formed, description, genre, died, disbanded,
				yearsActive, successCB, errorCB)
	}
	AudioLibrary.prototype.setSongDetailsByObject = function(songDetails, successCB, errorCB) {
		var songId = songDetails.songid
		if (songId == undefined) {
			throw ERR_SONG_ID
		}
		var title = songDetails.title
		var artist = songDetails.artist
		var albumArtist = songDetails.albumartist
		var genre = songDetails.genre
		var year = songDetails.year
		var rating = songDetails.rating
		var album = songDetails.album
		var track = songDetails.track
		var disc = songDetails.disc
		var duration = songDetails.duration
		var comment = songDetails.comment
		var musicBrainzTrackId = songDetails.musicbrainztrackid
		var musicBrainzArtistId = songDetails.musicbrainzartistid
		var musicBrainzAlbumId = songDetails.musicbrainzalbumid
		var musicBrainzAlbumArtistId = songDetails.musicbrainzalbumartistid
		AudioLibrary.prototype.SetSongDetails(songId, title, artist, albumArtist, genre, year, rating, album, track, disc, duration, comment,
				musicBrainzTrackId, musicBrainzArtistId, musicBrainzAlbumId, musicBrainzAlbumArtistId, successCB, errorCB)
	}

	/**
	 * A JS library wrapper for Files API
	 * 
	 * @see http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#Files
	 */
	// TODO: needs more testing
	var Files = function() {
		if (rpc == undefined || rpc == null) {
			throw ERR_NOT_INITIALIZED
		}
	}

	// Files API core methods
	Files.prototype = {
		Download : function(path, successCB, errorCB) {
			if (path == undefined) {
				throw ERR_PATH
			}
			var params = [ path ]
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('Files.Download', params, success, error)
		},
		GetDirectory : function(directory, files, properties, sort, successCB, errorCB) {
			if (direcotry == undefined) {
				throw ERR_DIRECTORY
			}
			var params = [ direcotry ]
			if (files != undefined) {
				params.push(files)
				if (properties != undefined) {
					params.push(properties)
					if (sort != undefined) {
						params.push(sort)
					}
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('Files.GetDirectory', params, success, error)
		},
		GetFileDetails : function(media, files, properties, successCB, errorCB) {
			if (media == undefined) {
				throw ERR_MEDIA
			}
			var params = [ media ]
			if (files != undefined) {
				params.push(files)
				if (properties != undefined) {
					params.push(properties)
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('Files.GetFileDetails', params, success, error)
		},
		GetSources : function(media, limits, sort, successCB, errorCB) {
			if (media == undefined) {
				throw ERR_MEDIA
			}
			var params = [ media ]
			if (limits != undefined) {
				params.push(limits)
				if (sort != undefined) {
					params.push(sort)
				}
			}
			var success = successCB || successHandler
			var error = errorCB || errorHandler
			rpc.call('Files.GetSources', params, success, error)
		},
		PrepareDownload : function(path, successCB, errorCB) {
			if (path == undefined) {
				throw ERR_PATH
			}
			var params = [ path ]
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

	// expose api globally
	window.XBMC = XBMC

})(window)