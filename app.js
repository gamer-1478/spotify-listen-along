var express = require('express'),
  session = require('cookie-session'),
  passport = require('passport'),
  SpotifyStrategy = require('passport-spotify').Strategy;
const
  authRouter = require('./routes/authRoute'),
  renderRouter = require('./routes/renderRoute');

require('dotenv').config();

var port = process.env.PORT || 8888;
var authCallbackPath = process.env.AUTH_CALLBACK_PATH;

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
app.set('view engine', 'ejs');

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

app.use('/', authRouter);
app.use('/', renderRouter);

app.listen(port, function () {
  console.log('App is listening on port ' + port);
});
