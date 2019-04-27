require('./models/db');

const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const flightController = require('./controllers/flightController');
const bodyparser = require('body-parser');

var app = express();
app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(bodyparser.json());
app.set('views', path.join(__dirname, '/views/'));
app.engine('hbs', exphbs({ extname: 'hbs', defaultLayout: 'mainLayout', layoutsDir: __dirname + '/views/layouts/' }));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, '../ASK-blockchain/build/contracts')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => {
    console.log('Express server started at port : 3000');
});
app.use('/flight', flightController);

app.get('/', (req, res) => {
    res.redirect("index");
});
