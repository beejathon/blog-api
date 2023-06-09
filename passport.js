require('dotenv').config()
const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs"); 
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const User = require("./models/user");

// passportJS authorize user login
passport.use(
  new LocalStrategy(async(username, password, done) => {
    try {
      const user = await User.findOne({ userName: username });
      if (!user) {
        return done(null, false, { message: "User not found." });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // passwords match! log user in
          const userObj = {
            _id: user._id,
            userName: user.userName,
            admin: user.admin
          }
          return done(null, userObj)
        } else {
          // passwords do not match!
          return done(null, false, { message: "Incorrect password" })
        }
      })
    } catch(err) {
      return done(err);
    }
  })
);

//JWT strategy to authroize requests via token
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey : process.env.SECRET_KEY
    },
    async (token, done) => {
      try {
        return done(null, token.user)
      } catch(error){
        return done(error)
        }
      }
    
  )
);
