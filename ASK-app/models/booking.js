const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookingsSchema = Schema({
  customerEmail: {
    type: String,
    required: true
  },
  flightNumber: {
    type: String,
    required: true
  },
  seats: {
    type: Number,
    required: true
  },
  airline: {
    type: String,
    required: true
  },
});


mongoose.model('Booking', bookingsSchema);
