module.exports = (app) => {
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');


const Flights = mongoose.model('Flight');
const User = require('../models/User');
const Bookings = mongoose.model('Booking');
const Requests = mongoose.model('Request');

let login = (req, res) => res.render('login');
let index = (req, res) => res.render('index');
let register = (req, res) => res.render('register');
let addUser = (req, res) => {
  const { name, email, password, password2, airline } = req.body;
  let errors = [];
  if (!name || !email || !password || !password2 || !airline) {
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
      password2,
      airline
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
          password2,
          airline
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          airline
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

let check = (req, res) => {
  Requests.findById(req.params.requestId).then( docs => {
    Flights.findOne({airline: docs.toAirline, flightNumber:docs.flightNumber}, function (err, docs2) {
      if (docs2.totalSeats - docs2.filledSeat >= docs.seats) {
        req.flash('success_msg', 'Yes seats are available');
      }else{
        req.flash('error_msg', 'No seats are not available');
      }
      res.redirect('/requests');
    });
  }, err => console.log(err));
};

let accept = (req, res) => {
  Requests.findById(req.params.requestId).then( docs => {
      if (docs.status != 'Not Responded'){
        console.log('here')
        req.flash('error_msg', 'Status already updated');
      }
      else{
      Bookings.findOneAndUpdate({_id: docs.bookingId}, {$set: {airline: docs.toAirline, flightNumber:docs.flightNumber}},{ new: true }, err => {
          if (!err) console.log('Updated!');
        });
      Requests.update({_id: docs._id}, {status: 'accepted'}, err => {
        if (!err) console.log('Updated!');
      })
    }
    res.redirect('/requests');
  }, err => console.log(err));
};

let reject = (req, res) => {
  Requests.findById(req.params.requestId).then( docs => {
      if (docs.status != 'Not Responded'){
        console.log('here')
        req.flash('error_msg', 'Status already updated');
      }
      else{
      Requests.update({_id: docs._id}, {status: 'rejected'}, err => {
        if (!err) console.log('Updated!');
      })
    }
    res.redirect('/requests');
  }, err => console.log(err));
};


let flights = (req, res) => {
  Flights.find({airline: req.user.airline}).then( docs => {
    res.render('flight', {docs})
  }, err => console.log(err));
};

let bookings = (req, res) => {
  Bookings.find({airline: req.user.airline}).then( docs => {
    Flights.find({airline: {$ne: req.user.airline}}, 'airline flightNumber', function (err, docs2) {
      console.log(docs2)
          res.render('booking', {docs, docs2})
    });
  }, err => console.log(err));
};

let requests = (req, res) => {
  Requests.find({toAirline: req.user.airline}).then( docs => {
    res.render('request', {docs})
  }, err => console.log(err));
};

let add = (req, res) => {
  let airline = req.user.airline;
  res.render('add', {airline})
};

let addbooking = (req, res) => {
  let airline = req.user.airline;
  res.render('addbooking', {airline})
};

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

  let data = {flightNumber: req.body.flightNumber, totalSeats: req.body.totalSeats, filledSeat:  req.body.filledSeat, airline: req.user.airline};
  let flight = new Flights(data);

  flight.save().then( doc => {
    console.log('Saved', doc);
  }, err => console.log('Error saving the flight!', err) );
  // Go to the list of flights
  res.redirect('/flights');
};

let savebooking = (req, res) => {
  let data = {customerId: req.body.customerId, flightNumber: req.body.flightNumber, seats:  req.body.seats, airline: req.user.airline};
  let booking = new Bookings(data);

  booking.save().then( doc => {
    console.log('Saved', doc);
  }, err => console.log('Error saving the booking!', err) );
  // Go to the list of flights
  res.redirect('/bookings');
};

let saverequest = (req, res) => {
  let data = {fromAirline: req.body.fromAirline, toAirline: req.body.toAirline, flightNumber:  req.body.flightNumber, seats: req.body.seats, bookingId: req.body.bookingId};
  let request = new Requests(data);

  request.save().then( doc => {
    console.log('Saved', doc);
  }, err => console.log('Error requesting!', err) );
  // Go to the list of flights
  res.redirect('/bookings');
};


let update = (req, res) => {
  let data = {flightNumber: req.body.flightNumber, totalSeats: req.body.totalSeats, filledSeat:  req.body.filledSeat, airline: req.body.airline};
  let query = {_id: req.params.flightNumber};
  Flights.update(query, data, err => {
    if (!err) console.log('Updated!');
  })
  res.redirect('/flights');
};


  app.get('/users/login', login);
  app.get('/users/register', register);
  app.get('/users/logout',ensureAuthenticated,logout)
  app.get('/', forwardAuthenticated, index);
  app.get('/flights', ensureAuthenticated,flights);
  app.get('/check/:requestId', ensureAuthenticated, check);
  app.get('/accept/:requestId', ensureAuthenticated, accept);
  app.get('/reject/:requestId', ensureAuthenticated, reject);
  app.get('/bookings', ensureAuthenticated,bookings);
  app.get('/requests', ensureAuthenticated,requests);
  app.get('/add', ensureAuthenticated,add);
  app.get('/addbooking', ensureAuthenticated,addbooking);
  app.get('/edit/:flightNumber', ensureAuthenticated,edit);
  app.get('*', notFound);
  app.post('/save', ensureAuthenticated,save);
  app.post('/savebooking', ensureAuthenticated,savebooking);
  app.post('/saverequest', ensureAuthenticated,saverequest);
  app.post('/users/register',addUser);
  app.post('/users/login', loginRequest);
  app.post('/update/:flightNumber', ensureAuthenticated,update);
  app.delete('/delete/:flightNumber', ensureAuthenticated,remove);

}; // Finish exports
