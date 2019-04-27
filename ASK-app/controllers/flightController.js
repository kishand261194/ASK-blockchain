const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Flight = mongoose.model('Flight');

router.get('/', (req, res) => {
    res.render("flight/addOrEdit", {
        viewTitle: "Insert Flight"
    });
});

router.post('/', (req, res) => {
    if (req.body._id == '')
        insertRecord(req, res);
        else
        updateRecord(req, res);
});

function insertRecord(req, res) {
    var flight = new Flight();
    flight.flightNumber = req.body.flightNumber;
    flight.totalSeats = req.body.totalSeats;
    flight.filledSeat = req.body.filledSeat;
    flight.save((err, doc) => {
        if (!err)
            res.redirect('flight/list');
        else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("flight/addOrEdit", {
                    viewTitle: "Insert Flight",
                    flight: req.body
                });
            }
            else
                console.log('Error during record insertion : ' + err);
        }
    });
}

function updateRecord(req, res) {
    Flight.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, doc) => {
        if (!err) { res.redirect('flight/list'); }
        else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("flight/addOrEdit", {
                    viewTitle: 'Update Flight',
                    flight: req.body
                });
            }
            else
                console.log('Error during record update : ' + err);
        }
    });
}


router.get('/list', (req, res) => {
    Flight.find((err, docs) => {
        if (!err) {
            res.render("flight/list", {
                list: docs
            });
        }
        else {
            console.log('Error in retrieving flight list :' + err);
        }
    });
});


function handleValidationError(err, body) {
    for (field in err.errors) {
        switch (err.errors[field].path) {
            case 'totalSeats':
                body['totalSeatsError'] = err.errors[field].message;
                break;
            case 'filledSeat':
                body['filledSeatError'] = err.errors[field].message;
                break;
            default:
                break;
        }
    }
}

router.get('/:id', (req, res) => {
    Flight.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.render("flight/addOrEdit", {
                viewTitle: "Update Flight",
                flight: doc
            });
        }
    });
});

router.get('/delete/:id', (req, res) => {
    Flight.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/flight/list');
        }
        else { console.log('Error in flight delete :' + err); }
    });
});

module.exports = router;
