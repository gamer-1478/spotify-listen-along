const express = require("express"),
    RenderRouter = express.Router();

RenderRouter.set('views', __dirname + '/views');
RenderRouter.set('view engine', 'html');

RenderRouter
    .get('/', function (req, res) {
        res.render('index.html', { user: req.user });
    })
    .get('/account', ensureAuthenticated, function (req, res) {
        res.render('account.html', { user: req.user });
    })
    .get('/login', function (req, res) {
        res.render('login.html', { user: req.user });
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

module.exports = RenderRouter;