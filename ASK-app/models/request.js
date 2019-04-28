const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const requestsSchema = Schema({
    fromAirline: {
        type: String,
        required: 'This field is required.',
    },
    toAirline: {
        type: String,
        required: 'This field is required.'
    },
    flightNumber: {
        type: String,
        required: 'This field is required.',
    },
    seats: {
        type: Number,
        required: 'This field is required.',
    },
    status: {
        type: String,
        default: 'Not Responded',
        required: 'This field is required.'
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        required: 'This field is required.'
    }
});

mongoose.model('Request', requestsSchema);