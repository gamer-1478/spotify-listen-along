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

function getAuthCallBackUrl() {
    var port = process.env.PORT || 8888;
    var authCallbackPath = process.env.AUTH_CALLBACK_PATH;
    if (process.env.NODE_ENV === 'production') {
        return 'https://' + process.env.HOST + authCallbackPath;
    } else {
        return 'http://localhost:' + port + authCallbackPath;
    }
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

const reusable = {
    ensureAuthenticated,
    getAuthCallBackUrl,
    makeid
}

module.exports = reusable