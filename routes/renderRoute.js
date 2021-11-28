const express = require("express"),
    renderRouter = express.Router(),
    { createFirestoreParty, deleteFirestoreParty, joinFirestoreParty } = require("../utilities/firebase_firestore_utils"),
    { makeid } = require("../utilities/reusable");

renderRouter
    .get('/', function (req, res) {
        res.render('index', { user: req.user });
    })
    .get('/account', ensureAuthenticated, function (req, res) {
        res.render('account', { user: req.user });
    })
    .get('/login', function (req, res) {
        res.render('login', { user: req.user });
    })
    .get('/startParty', ensureAuthenticated, async function (req, res) {
        var code = makeid(8).toUpperCase();
        createFirestoreParty(req.user, code).then((result) => {
            if (result == true) {
                res.render('startParty', { user: req.user, code: code, host: "localhost:8888" });
            } else {
                res.redirect('/startParty');
            }
        });
    })
    .get('/stopParty/:id', ensureAuthenticated, async function (req, res) {
        var code = req.params.id.toUpperCase();
        deleteFirestoreParty(code, req.user.emails[0].value).then((result) => {
            if (result == true) {
                res.redirect('/');
            } else {
                res.send(result);
            }
        });
    })
    .get('/joinParty/:id', ensureAuthenticated, async function (req, res) {
        var code = req.params.id.toUpperCase();
        joinFirestoreParty(code, req.user).then((result) => {
            if (result == true) {
                res.render('joinParty', { user: req.user, code: code });
            } else {
                res.send(result);
            }
        })
    });

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed. Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = renderRouter;