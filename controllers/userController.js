const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { body, validationResult } = require('express-validator')

exports.register = [
  body("username")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Username must not be empty.")
    .isLength({ max: 10 })
    .withMessage("Username too long (max 10 characters)")
    .custom(async(username) => {
      try {
        const userExists = await User.findOne({userName: username});
        if (userExists){
          throw new Error('This username is already taken.');
        }
      } catch (err){
        throw new Error('wtf');
      }
    }),
  body("password")
    .trim()
    .isStrongPassword(
      {
        minLength: 8, 
        minLowercase: 1, 
        minUppercase: 1, 
        minSymbols: 1
      })
    .withMessage("Password is too weak. Must be min. 6 characters, 1 lowercase, 1 uppercase, and 1 symbol"),
  body("confirm_password")
    .custom(async(value, {req}) => {
      if (value !== req.body.password) {
        // throw error if passwords do not match
        throw new Error("Passwords don't match");
      } else {
        return value;
      }
    }),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(403).json({
        errors: errors.array(),
      });
    } else {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          return res.status(400).json(err);
        } 

        const user = new User({
          userName: req.body.username,
          password: hashedPassword,
          admin: false,
        });

        try {
          await user.save();
          res.status(200).json({message:'user created'})
        } catch (err) {
          return res.status(400).json(err);
        }        
      })
    }
  },
];

exports.login = (req, res, next) => {
  try {
    passport.authenticate('local', {session: false}, (err, user) => {
      if (err || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user : user
        });
      }

      jwt.sign(
        { user },
        process.env.SECRET_KEY,
        { expiresIn: '10h' },
        (err, token) => {
          if (err) return res.status(400).json({err: 'web token error'});
          res.status(200).json({
            token,
            user
          })
        }
      )
    }) (req, res);
  } catch (err) {
    res.status(400).json(err)
  }
}

exports.logout = (req, res, next) => {
  res.send('logout')
}