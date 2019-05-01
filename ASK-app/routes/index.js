module.exports = (app) => {
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');


const Aflights = mongoose.model('Aflight');
const Bflights = mongoose.model('Bflight');
const User = require('../models/User');
const Bookings = mongoose.model('Booking');
const Arequests = mongoose.model('Arequest');
const Brequests = mongoose.model('Brequest');
const Aresponse = mongoose.model('Aresponse');
const Bresponse = mongoose.model('Bresponse');

let login = (req, res) => res.render('login');

let register = (req, res) => res.render('register');
let registercust = (req, res) => res.render('registercust');
let admin = (req, res) => res.render('admin');
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


let addCust = (req, res) => {
  const { name, email, password, password2, airline, isAirline } = req.body;
  console.log(req.body)
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
    res.render('registercust', {
      errors,
      name,
      email,
      password,
      password2,
      airline,
      isAirline
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('registercust', {
          errors,
          name,
          email,
          password,
          password2,
          airline,
          isAirline
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          airline,
          isAirline
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
  User.findOne({email: req.body.email}).then(docs => {
    if(docs.airline == 'user'){
      passport.authenticate('local', {
        successRedirect: '/bookings',
        failureRedirect: '/users/login',
        failureFlash: true
      })(req, res, next);
    }
   else{

     if(docs.airline == 'admin'){
       passport.authenticate('local', {
         successRedirect: '/admin',
         failureRedirect: '/users/login',
         failureFlash: true
       })(req, res, next);
     }else{
       passport.authenticate('local', {
         successRedirect: '/requests',
         failureRedirect: '/users/login',
         failureFlash: true
       })(req, res, next);

     }
    }
  });
  }
let logout = (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
};

let check = (req, res) => {
  if (req.user.airline == 'JetBlue'){
      Arequests.findById(req.params.requestId).then( docs => {
        Aflights.findOne({airline: docs.toAirline, flightNumber:docs.flightNumber}, function (err, docs2) {
          if (docs2.totalSeats - docs2.filledSeat >= docs.seats) {
            req.flash('success_msg', 'Yes seats are available');
          }else{
            req.flash('error_msg', 'No seats are not available');
          }
          res.redirect('/requests');
        });
      }, err => console.log(err));
    }else{
      Brequests.findById(req.params.requestId).then( docs => {
        Bflights.findOne({airline: docs.toAirline, flightNumber:docs.flightNumber}, function (err, docs2) {
          if (docs2.totalSeats - docs2.filledSeat >= docs.seats) {
            req.flash('success_msg', 'Yes seats are available');
          }else{
            req.flash('error_msg', 'No seats are not available');
          }
          res.redirect('/requests');
        });
      }, err => console.log(err));

    }
};

let accept = (req, res) => {
  if(req.user.airline == 'JetBlue'){
      Arequests.findById(req.params.requestId).then( docs => {
          if (docs.status != 'Not Responded'){
            console.log('here')
            req.flash('error_msg', 'Status already updated');
          }
          else{
          Bookings.findOneAndUpdate({_id: docs.bookingId}, {$set: {airline: docs.toAirline, flightNumber:docs.flightNumber}},{ new: true }, err => {
              if (!err) console.log('Updated!');
            });
          Arequests.update({_id: docs._id}, {status: 'accepted'}, err => {
            if (!err) console.log('Updated!');
          });
          Aflights.findOneAndUpdate({airline: docs.toAirline, flightNumber:docs.flightNumber}, {inc: {filledSeat: docs.seats}},{ new: true }, err => {
            if (!err) console.log('Updated flight!');
          });
          let response = {status: 'accept', bookingId: docs.bookingId};
          res.render('saveresponse', {response})
        }
      }, err => console.log(err));
    }
    else{
      Brequests.findById(req.params.requestId).then( docs => {
          if (docs.status != 'Not Responded'){
            console.log('here')
            req.flash('error_msg', 'Status already updated');
          }
          else{
          Bookings.findOneAndUpdate({_id: docs.bookingId}, {$set: {airline: docs.toAirline, flightNumber:docs.flightNumber}},{ new: true }, err => {
              if (!err) console.log('Updated booking!');
            });
          Brequests.update({_id: docs._id}, {status: 'accepted'}, err => {
            if (!err) console.log('Updated request!');
          });
          Bflights.findOneAndUpdate({airline: docs.toAirline, flightNumber:docs.flightNumber}, {$inc: {filledSeat: docs.seats}},{ new: true }, err => {
            if (!err) console.log('Updated flight!');
          });
          let response = {status: 'accept', bookingId: docs.bookingId};
          res.render('saveresponse', {response})
        }
    //    res.redirect('/requests');
      }, err => console.log(err));

    }
};
let reject = (req, res) => {
  if(req.user.airline == 'JetBlue'){
    Arequests.findById(req.params.requestId).then( docs => {
        if (docs.status != 'Not Responded'){
          console.log('here')
          req.flash('error_msg', 'Status already updated');
        }
        else{
        Arequests.update({_id: docs._id}, {status: 'rejected'}, err => {
          if (!err) console.log('Updated!');
        });
        let response = {status: 'rejected', bookingId: docs.bookingId};
        res.render('saveresponse', {response})
      }
    }, err => console.log(err));
  }
  else{
    Brequests.findById(req.params.requestId).then( docs => {
        if (docs.status != 'Not Responded'){
          console.log('here')
          req.flash('error_msg', 'Status already updated');
        }
        else{
        Brequests.update({_id: docs._id}, {status: 'rejected'}, err => {
          if (!err) console.log('Updated!');
        });
        let response = {status: 'rejected', bookingId: docs.bookingId};
        res.render('saveresponse', {response})
      }
    }, err => console.log(err));

  }
};



let approve = (req, res) => {
  if(req.user.airline == 'JetBlue'){
        Brequests.update({_id: req.params.requestId}, {isReviewed: 'approved'}, err => {
          if (!err) console.log('Updated!');
        });
    }
  else{
    Arequests.update({_id: req.params.requestId}, {isReviewed: 'approved'}, err => {
      if (!err) console.log('Updated!');
    });
    }
 res.redirect('/review');
};

let disapprove = (req, res) => {
  if(req.user.airline == 'JetBlue'){
        Brequests.update({_id: req.params.requestId}, {isReviewed: 'rejected'}, err => {
          if (!err) console.log('Updated!');
        });
    }
  else{
    Arequests.update({_id: req.params.requestId}, {isReviewed: 'rejected'}, err => {
      if (!err) console.log('Updated!');
    });
    }
  res.redirect('/review');
};


let flights = (req, res) => {
  if(req.user.airline == 'JetBlue'){
    Aflights.find().then( docs => {
      res.render('flight', {docs})
  }, err => console.log(err));
}else{
    Bflights.find().then( docs => {
      res.render('flight', {docs})
}, err => console.log(err));}

};

// let bookings = (req, res) => {
//   Bookings.find({airline: req.user.airline}).then( docs => {
//     Flights.find({airline: {$ne: req.user.airline}}, 'airline flightNumber', function (err, docs2) {
//       console.log(docs2)
//           res.render('booking', {docs, docs2})
//     });
//   }, err => console.log(err));
// };

let bookings = (req, res) => {
  Bookings.find({customerEmail: req.user.email}).then( docs => {
    if(docs.length == 0){
      res.render('booking', {docs})
    }
      Bflights.find().then(docs2 => {
        Aflights.find().then(docs3 => {
                res.render('booking', {docs, docs2, docs3})
          });
        });
      }, err => console.log(err));
};


let requests = (req, res) => {
  if(req.user.airline == 'JetBlue'){
    Arequests.find({isReviewed: 'approved'}).then( docs => {
      res.render('request', {docs})
    }, err => console.log(err));
  }else{
    Brequests.find({isReviewed: 'approved'}).then( docs => {
      res.render('request', {docs})
    }, err => console.log(err));
  }
};

let review = (req, res) => {
  if(req.user.airline == 'JetBlue'){
    Brequests.find({isReviewed: {$in: ['Not Reviewed', 'rejected']}}).then( docs => {
      console.log(docs);
      res.render('review', {docs})
    }, err => console.log(err));
  }else{
    Arequests.find({isReviewed: {$in: ['Not Reviewed', 'rejected']}}).then( docs => {
      console.log(docs);
      res.render('review', {docs})
    }, err => console.log(err));
  }
};

let responses = (req, res) => {
  console.log(req.body, req.user.airline)

  if(req.user.airline == 'JetBlue'){
    Aresponse.find().then( docs => {
      console.log(docs)
      res.render('response', {docs})
    }, err => console.log(err));
  }else{
    Bresponse.find().then( docs => {
      res.render('response', {docs})
    }, err => console.log(err));
  }
};

let add = (req, res) => {
  let airline = req.user.airline;
  res.render('add', {airline})
};

let addbooking = (req, res) => {
  Aflights.find().then( aflight => {
    Bflights.find().then( bflight => {
      let airline = req.user.airline;
      res.render('addbooking', {airline, aflight, bflight})

    })
  })
};

let edit = (req, res) => {
  let id = req.params.flightNumber;
  if(req.user.airline == 'JetBlue')
  {
    Aflights.findById(id).then( flight => {
      res.render('edit', {flight});
    }, err => res.status(404).send('Error!'));
  }
  else{
    Bflights.findById(id).then( flight => {
      res.render('edit', {flight});
    }, err => res.status(404).send('Error!'));
  }
};

let remove = (req, res) => {
  let id = req.params.flightNumber;
  if(req.user.airline == 'JetBlue')
  {
    Aflights.remove({ _id: id }).then( () => {
      console.log('Removed');
    }, err => console.log('Error on removing the flight'));
    res.send('success');
  }
  else{
    Bflights.remove({ _id: id }).then( () => {
      console.log('Removed');
    }, err => console.log('Error on removing the flight'));
    res.send('success');

  }
};

let notFound = (req, res) => res.render('404');

// POST
let save = (req, res) => {

  let data = {flightNumber: req.body.flightNumber, totalSeats: req.body.totalSeats, filledSeat:  req.body.filledSeat, airline: req.user.airline};
  if(req.user.airline == 'JetBlue'){
    let flight = new Aflights(data);
    flight.save().then( doc => {
      console.log('Saved', doc);
    }, err => console.log('Error saving the flight!', err) );
    // Go to the list of flights
    res.redirect('/flights');
  }
  else{
    let flight = new Bflights(data);
    flight.save().then( doc => {
      console.log('Saved', doc);
    }, err => console.log('Error saving the flight!', err) );
    // Go to the list of flights
    res.redirect('/flights');
  }
};

let savebooking = (req, res) => {
  let data = {customerEmail: req.user.email, flightNumber: req.body.flightNumber, seats:  req.body.seats, airline: req.body.airline};
  let booking = new Bookings(data);

  booking.save().then( doc => {
    console.log('Saved', doc);
  }, err => console.log('Error saving the booking!', err) );
  // Go to the list of flights
  res.redirect('/bookings');
};

let saverequest = (req, res) => {
  let data = {fromAirline: req.body.fromAirline, toAirline: req.body.toAirline, flightNumber:  req.body.flightNumber, seats: req.body.seats, bookingId: req.body.bookingId};
  if (req.body.toAirline == 'JetBlue'){
      let request = new Arequests(data);
      request.save().then( doc => {
        console.log('Saved', doc);
      }, err => console.log('Error requesting!', err) );
      res.redirect('/bookings');
    }
  else{
    let request = new Brequests(data);
    request.save().then( doc => {
      console.log('Saved', doc);
    }, err => console.log('Error requesting!', err) );
    res.redirect('/bookings');

  }
};

let saveresponse = (req, res) => {
  console.log('hereeee', req.body)
  let data = {status:req.body.status, bookingId: req.body.bookingId};
  if (req.user.airline == 'JetBlue'){
      let response = new Bresponse(data);
      response.save().then( doc => {
        console.log('Saved', doc);
      }, err => console.log('Error requesting!', err) );
      res.redirect('/requests');
    }
  else{
    let response = new Aresponse(data);
    response.save().then( doc => {
      console.log('Saved', doc);
    }, err => console.log('Error requesting!', err) );
    res.redirect('/requests');

  }

}


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
  app.get('/users/registercust', registercust);
  app.get('/users/logout',ensureAuthenticated,logout)
  app.get('/', forwardAuthenticated, login);
  app.get('/flights', ensureAuthenticated,flights);
  app.get('/check/:requestId', ensureAuthenticated, check);
  app.get('/accept/:requestId', ensureAuthenticated, accept);
  app.get('/reject/:requestId', ensureAuthenticated, reject);
  app.get('/approve/:requestId', ensureAuthenticated, approve);
  app.get('/disapprove/:requestId', ensureAuthenticated, disapprove);
  app.get('/bookings', ensureAuthenticated,bookings);
  app.get('/requests', ensureAuthenticated,requests);
  app.get('/review', ensureAuthenticated,review);
  app.get('/responses', ensureAuthenticated,responses);
  app.get('/add', ensureAuthenticated,add);
  app.get('/admin',ensureAuthenticated,admin);
  app.get('/addbooking', ensureAuthenticated,addbooking);
  app.get('/edit/:flightNumber', ensureAuthenticated,edit);
  app.get('*', notFound);
  app.post('/save', ensureAuthenticated,save);
  app.post('/savebooking', ensureAuthenticated,savebooking);
  app.post('/saverequest', ensureAuthenticated,saverequest);
  app.post('/saveresponse', ensureAuthenticated,saveresponse);
  app.post('/users/register',addUser);
  app.post('/users/registercust',addCust);
  app.post('/users/login', loginRequest);
  app.post('/update/:flightNumber', ensureAuthenticated,update);
  app.delete('/delete/:flightNumber', ensureAuthenticated,remove);

}; // Finish exports
