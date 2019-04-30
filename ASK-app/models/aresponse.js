const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const aresponsesSchema = Schema({
  
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

mongoose.model('Aresponse', aresponsesSchema);
