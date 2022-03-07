const express = require('express');
const morgan = require('morgan');
const routes = require('./router');

const app = express();

app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/', routes);

module.exports = app;


// '2020-11-02T14:00:00Z'