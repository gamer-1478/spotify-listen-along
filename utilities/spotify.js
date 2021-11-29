const fetch = require('node-fetch')

//get spotify currently playing
async function getCurrentlyPlaying(accessToken) {
    return await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    })
}

//spotify set currently playing time
async function setcurrentlyPlayingtime(accessToken, time) {
    return await fetch('https://api.spotify.com/v1/me/player/seek', {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "position_ms": time
        })
    })
}

//spotify set currently playing song
async function setcurrentlyPlaying(accessToken, uri, time) {
    return await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "uris": [uri],
            "position_ms": time
        })
    })
}

const spotify = {
    getCurrentlyPlaying,
    setcurrentlyPlayingtime,
    setcurrentlyPlaying
}

module.exports = spotify;