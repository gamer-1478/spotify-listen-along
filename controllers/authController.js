const passport = require('passport');
require('dotenv').config();

function logout(req, res) {
    req.logout();
    res.redirect('/');
}

async function authCallBack(req, res, next) {
    await passport.authenticate('spotify', {
        failureRedirect: '/login'
    })(req, res, function () {
        res.redirect('/')
    })
}

function authSpotify(req, res, next) {
    passport.authenticate('spotify', {
        scope: ['user-read-email', 'user-read-private', "user-read-currently-playing", "user-read-playback-position", "user-modify-playback-state"],
        showDialog: true
    })(req, res, next)
}

const AuthController = {
    logout,
    authCallBack,
    authSpotify
};

module.exports = AuthController