const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const flightsSchema = Schema({
    flightNumber: {
        type: String,
        required: 'This field is required.',
        unique: true
    },
    totalSeats: {
        type: Number,
        required: 'This field is required.'
    },
    filledSeat: {
        type: Number,
        required: 'This field is required.',
        default: 0
    },
    airline: {
        type: String,
        required: 'This field is required.',
    }

});


mongoose.model('Flight', flightsSchema);
