const mongoose = require('mongoose');

var flightSchema = new mongoose.Schema({
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
    }

});


mongoose.model('Flight', flightSchema);
