const express = require("express"),
    AuthController = require("../controllers/authController"),
    authRouter = express.Router();

require('dotenv').config();

var authCallbackPath = process.env.AUTH_CALLBACK_PATH;

// GET /auth/spotify
//   Use passport.authenticate() as route middleware to authenticate the
//   request. The first step in spotify authentication will involve redirecting
//   the user to spotify.com. After authorization, spotify will redirect the user
//   back to this application at /auth/spotify/callback
authRouter.get("/auth/spotify", AuthController.authSpotify)

// GET /auth/spotify/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request. If authentication fails, the user will be redirected back to the
//   login page. Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
authRouter.get(authCallbackPath, AuthController.authCallBack)

authRouter.get('/logout', AuthController.logout)

module.exports = authRouter;