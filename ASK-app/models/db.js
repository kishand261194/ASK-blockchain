const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://kishan:blockchain@cluster0-rjmfr.mongodb.net/airlines?retryWrites=true', { useNewUrlParser: true }, (err) => {
    if (!err) { console.log('MongoDB Connection Succeeded.') }
    else { console.log('Error in DB connection : ' + err) }
});
require('./aflight');
require('./bflight');
require('./booking');
require('./arequest');
require('./brequest');
require('./aresponse');
require('./bresponse');
