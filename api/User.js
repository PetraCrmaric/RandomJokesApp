/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */
const express = require('express');

const router = express.Router();

/* router.get('/app', function(req, res){
    res.send("Hello world");
}); */

// mongodb user model

// email handler
const nodemailer = require('nodemailer');

// password handler
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.get('/:name/send', async (req, res) => {
  // grab the joke from the API
  const response = await fetch('https://api.chucknorris.io/jokes/random');
  const joke = await response.json();
  res.send(joke.value);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'petra.crmaric.pc@gmail.com',
      pass: 'ulxdkhgspusslhsb',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const MailOptions = {
    from: 'petra.crmaric.pc@gmail.com',
    to: 'petra.crmaric.pc@gmail.com',
    subject: 'Chuck Norris Joke',
    text: joke.value,
  };

  transporter.sendMail(MailOptions, (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('email sent');
    }
  });
});

// signup
router.post('/signup', (req, res) => {
  let {
    name, surname, email, password,
  } = req.body;
  name = name.trim();
  surname = surname.trim();
  email = email.trim();
  password = password.trim();

  if (name == '' || surname == '' || email == '' || password == '') {
    res.json({
      status: 'FAILED',
      message: 'Empty input fields',
    });
  } else if (!/^[a-zA-Z ]*$/.test(name)) {
    res.json({
      status: 'FAILED',
      message: 'Invalid name entered',
    });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.json({
      status: 'FAILED',
      message: 'Invalid email entered',
    });
  } else if (password.length < 5) {
    res.json({
      status: 'FAILED',
      message: 'Password is too short!',
    });
  } else {
    User.find({ email }).then((result) => {
      if (result.length) {
        res.json({
          status: 'FAILED',
          message: 'User with that email already exists ',
        });
      } else {
        // try to create new user

        // password handling
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds).then((hashedPassword) => {
          const newUser = new User({
            name,
            surname,
            email,
            password: hashedPassword,
            loggedIn: false,
          });

          newUser.save().then((result) => {
            res.json({
              status: 'SUCCESS',
              message: 'Signup successful',
              data: result,
            });
          })
            .catch((err) => {
              res.json({
                status: 'FAILED',
                message: 'An error occured while saving account ',
              });
            });
        })
          .catch((err) => {
            res.json({
              status: 'FAILED',
              message: 'An error occured while hashing password ',
            });
          });
      }
    }).catch((err) => {
      console.log(err);
      res.json({
        status: 'FAILED',
        message: 'An error occured while checking for existing user ',
      });
    });
  }
});

// signin
router.post('/signin', (req, res) => {
  let { email, password } = req.body;
  email = email.trim();
  password = password.trim();

  if (email == '' || password == '') {
    res.json({
      status: 'FAILED',
      message: 'Empty credentials',
    });
  } else {
    // check if user exists
    User.find({ email })
      .then((data) => {
        if (data) {
          // user exists
          const hashedPassword = data[0].password;
          bcrypt.compare(password, hashedPassword).then(
            (result) => {
              if (result) {
                // password match
                res.json({
                  status: 'SUCCESS',
                  message: 'Signin successful',
                  data,
                });
                User.loggedIn = true;
              } else {
                res.json({
                  status: 'FAILED',
                  message: 'Invalid password entered',
                });
              }
            },
          )
            .catch((err) => {
              res.json({
                status: 'FAILED',
                message: 'An error occured while comparing passwords ',
              });
            });
        } else {
          res.json({
            status: 'FAILED',
            message: 'Invalid credentials ',
          });
        }
      })
      .catch((err) => {
        res.json({
          status: 'FAILED',
          message: 'An error occurred while checking for existing user ',
        });
      });
  }
});

module.exports = router;
