module.exports = (app) => {

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

const mongoose = require('mongoose');
const Flights = mongoose.model('Flight');

let index = (req, res) => res.render('index');

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

  app.get('/', index);
  app.get('/flights', flights);
  app.get('/add', add);
  app.get('/edit/:flightNumber', edit);
  app.get('*', notFound);
  app.post('/save', save);
  app.post('/update/:flightNumber', update);
  app.delete('/delete/:flightNumber', remove);

}; // Finish exports
