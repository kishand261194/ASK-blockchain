module.exports = (app) => {

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

const mongoose = require('mongoose');
const Flights = mongoose.model('Flight');

const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');

let login = (req, res) => res.render('login');

let index = (req, res) => res.render('index');

let register = (req, res) => res.render('register');

let addUser = (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
};



let loginRequest = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/flights',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
};

let logout = (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
};

let flights = (req, res) => {
  Flights.find().then( docs => {
    res.render('flight', {docs})
  }, err => console.log(err));
};

let add = (req, res) => res.render('add');

let edit = (req, res) => {
  let id = req.params.flightNumber;
  Flights.findById(id).then( flight => {
    res.render('edit', {flight});
  }, err => res.status(404).send('Error!'));
};

let remove = (req, res) => {
  let id = req.params.flightNumber;
  Flights.remove({ _id: id }).then( () => {
    console.log('Removed');
  }, err => console.log('Error on removing the flight'));
  res.send('success');
};

let notFound = (req, res) => res.render('404');

// POST
let save = (req, res) => {
  let data = {flightNumber: req.body.flightNumber, totalSeats: req.body.totalSeats, filledSeat:  req.body.filledSeat};
  let flight = new Flights(data);

  flight.save().then( doc => {
    console.log('Saved', doc);
  }, err => console.log('Error saving the flight!', err) );
  // Go to the list of flights
  res.redirect('/flights');
};

let update = (req, res) => {
  let data = {flightNumber: req.body.flightNumber, totalSeats: req.body.totalSeats, filledSeat:  req.body.filledSeat};
  let query = {_id: req.params.flightNumber};
  Flights.update(query, data, err => {
    if (!err) console.log('Updated!');
  })
  res.redirect('/flights');
};


  app.get('/users/login', forwardAuthenticated, login);
  app.get('/users/register', forwardAuthenticated, register);
  app.get('/users/logout',ensureAuthenticated,logout)
  app.get('/', ensureAuthenticated, index);
  app.get('/flights', ensureAuthenticated,flights);
  app.get('/add', ensureAuthenticated,add);
  app.get('/edit/:flightNumber', ensureAuthenticated,edit);
  app.get('*', notFound);
  app.post('/save', ensureAuthenticated,save);
  app.post('/users/register', ensureAuthenticated,addUser);
  app.post('/users/login', loginRequest);
  app.post('/update/:flightNumber', ensureAuthenticated,update);
  app.delete('/delete/:flightNumber', ensureAuthenticated,remove);

}; // Finish exports
