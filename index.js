const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

// for sessions and flash messages
const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);

// create instance of express app
let app = express();

// set view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
    express.urlencoded({
        extended: false
    })
);

// custom middleware goes here
app.use(function (req, res, next) {
    res.locals.date = new Date();
    next();
})

// set up sessions
app.use(session({
    // store: new FileStore(),
    // secret: 'keyboard cat',
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true
}));

app.use(flash());
// Register Flash middleware
app.use(function (req, res, next) {
    console.log(req.session);
    res.locals.success_messages = req.flash("success_messages");
    res.locals.error_messages = req.flash("error_messages");
    next();
});

// import in routes
const landingRoutes = require('./routes/landing');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');

async function main() {
    app.use('/', landingRoutes);
    app.use('/products', productRoutes);
    app.use('/users', userRoutes);
}

main();

app.listen(3000, () => {
    console.log("Server has started");
})