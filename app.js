var express = require('express'),
session = require('cookie-session'),
passport = require('passport'),
SpotifyStrategy = require('passport-spotify').Strategy,
consolidate = require('consolidate');

require('dotenv').config();

var port = 8888;
var authCallbackPath = '/auth/spotify/callback';

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session. Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing. However, since this example does not
//   have a database of user records, the complete spotify profile is serialized
//   and deserialized.
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

function getAuthCallBackUrl() {
  if (process.env.NODE_ENV === 'production') {
    return 'https://' + process.env.HOST + authCallbackPath;
  } else {
    return 'http://localhost:' + port + authCallbackPath;
  }
}
// Use the SpotifyStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, expires_in
//   and spotify profile), and invoke a callback with a user object.
passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: getAuthCallBackUrl(),
    },
    function (accessToken, refreshToken, expires_in, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {
        // To keep the example simple, the user's spotify profile is returned to
        // represent the logged-in user. In a typical application, you would want
        // to associate the spotify account with a user record in your database,
        // and return that user instead.
        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;
        profile.expires_in = expires_in;
        return done(null, profile);
      });
    }
  )
);

var app = express();

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 60000 * 60 * 24,
    },
    saveUninitialized: false,
    resave: false,
    name: "spotify.oauth",
  })
);
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

app.engine('html', consolidate.nunjucks);

app.get('/', function (req, res) {
  console.log(req.user.accessToken || "error occured")

  res.render('index.html', { user: req.user });
});

app.get('/account', ensureAuthenticated, function (req, res) {
  res.render('account.html', { user: req.user });
});

app.get('/login', function (req, res) {
  res.render('login.html', { user: req.user });
});

// GET /auth/spotify
//   Use passport.authenticate() as route middleware to authenticate the
//   request. The first step in spotify authentication will involve redirecting
//   the user to spotify.com. After authorization, spotify will redirect the user
//   back to this application at /auth/spotify/callback
app.get('/auth/spotify', passport.authenticate('spotify', {
  scope: ['user-read-email', 'user-read-private', "user-read-currently-playing", "user-read-playback-position", "user-modify-playback-state"]
})
);

// GET /auth/spotify/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request. If authentication fails, the user will be redirected back to the
//   login page. Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get(authCallbackPath, passport.authenticate('spotify', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/');
  }
);

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

app.listen(port, function () {
  console.log('App is listening on port ' + port);
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
