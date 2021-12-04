const { getCurrentlyPlaying, setcurrentlyPlaying, setcurrentlyPlayingtime } = require('./spotify');
const { getFirestoreParty, setFirestorePartySongItem } = require('./firebase_firestore_utils');
//get currently playing spotify song 30 times a minute and update the database


async function startRepeater(acessToken, code) {
    var myVar = setInterval(async function () {
        var data = await getCurrentlyPlaying(acessToken, code)
        data = await data.json();
        if (typeof data != 'undefined' && data.hasOwnProperty('is_playing') && data.hasOwnProperty('item')) {
            if (data.item.hasOwnProperty('uri')) {
                if (data.is_playing) {
                    var current_post = data.progress_ms;
                    var current_song_uri = data.item.uri;
                    var song_item = {
                        song_name: data.item.name,
                        song_artist: data.item.artists[0].name,
                        song_album: data.item.album.name,
                        song_duration: data.item.duration_ms,
                        song_progress: data.progress_ms,
                        song_uri: data.item.uri,
                        song_is_playing: data.is_playing
                    }
                    await getFirestoreParty(code).then(async function (data_firestore) {
                        if (data_firestore.hasOwnProperty('members')) {
                            data_firestore.members.forEach(async function (member) {
                                var member_access_token = member.accessToken;
                                var member_email = member.emails[0].value;
                                getCurrentlyPlaying(member_access_token).then(async function (data_firestore_member) {
                                    try {
                                        data_firestore_member = await data_firestore_member.json()
                                    }
                                    catch (e) {
                                        console.log(e)
                                    }
                                    if (await data_firestore_member.hasOwnProperty('item') && await data_firestore_member.item.uri == current_song_uri) {
                                        if (between(data_firestore_member.progress_ms - current_post, -5000, 5000)) {
                                            console.log("already playing the same song  with time within 5s")
                                        }
                                        else {
                                            setcurrentlyPlaying(member_access_token, current_song_uri, current_post).then(function (data) {
                                                console.log(data.json())
                                            }).catch(function (e) {
                                                console.log(e)
                                            });
                                            console.log(data_firestore_member.progress_ms, current_post)
                                            console.log("updating time for member " + member_email)
                                        }
                                    }
                                    else {
                                        setcurrentlyPlaying(member_access_token, current_song_uri, current_post).then(async function (data) {
                                            console.log(await data.json())
                                        }).catch(async function (e) {
                                            console.log(await e)
                                        });
                                        console.log("updating song for member " + member_email)
                                    }
                                })
                            });
                        }
                    });
                    await setFirestorePartySongItem(code, song_item);


                } else {
                    console.log('not playing');
                }
            }
        }
        else {
            console.log('not playing');
        }
    }, 5000);
    console.log(function stopRepeater() {
        clearInterval(myVar);
    });
}

function between(x, min, max) {
    return x >= min && x <= max;
}


module.exports = {
    startRepeater,
    stopRepeater
}
