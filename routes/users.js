const express = require("express");
const router = express.Router();

// import in the User model
const { User } = require('../models');

const { createRegistrationForm, bootstrapField, createLoginForm } = require('../forms');

// display register form
router.get('/register', (req, res) => {
    // display the registration form
    const registerForm = createRegistrationForm();
    res.render('users/register', {
        'form': registerForm.toHTML(bootstrapField)
    })
});

// process register form
router.post('/register', (req, res) => {
    const registerForm = createRegistrationForm();
    registerForm.handle(req, {
        success: async (form) => {
            const user = new User({
                'username': form.data.username,
                'password': form.data.password,
                'email': form.data.email
            });
            await user.save();
            req.flash("success_messages", "User signed up successfully!");
            res.redirect('/users/login')
        },
        error: (form) => {
            res.render('users/register', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// display login form
router.get('/login', (req, res)=> {
    const loginForm = createLoginForm();
    res.render('users/login', {
        'form': loginForm.toHTML(bootstrapField)
    })
})

// process the login form
router.post('/login', async (req, res) => {
    const loginForm = createLoginForm();
    loginForm.handle(req, {
        'success': async (form)=> {
            // process the login
            // find the user by email and password
            let user = await User.where({
                'email': form.data.email
            }).fetch({
                require: false
            });

            if (!user){
                console.log("email not found");
                req.flash("error_messages", "Sorry, the authentication details you provided does not work.");
                res.redirect('/users/login');
            } else {
                // check if the password matches
                if (user.get('password')=== form.data.password){
                    // add to the session that login succeed
                    // store the user details
                    console.log("email and password match");
                    req.session.user = {
                        id: user.get('id'),
                        username: user.get('username'),
                        email: user.get('email')
                    };
                    req.flash("success_messages", "Welcome back, " + user.get('username'));
                    res.redirect('/users/profile');
                } else {
                    console.log("email match, but password do not match");
                    req.flash("error_messages", "Sorry, the authentication details you provided does not work.");
                    res.redirect('/users/login')
                }
            }
        },
        'error': (form)=> {
            req.flash('error_messages', 'There are some problems logging you in. Please fill in the form again.');
            res.render('users/login', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// display profile page
router.get('/profile', (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash('error_messages', 'You do not have permission to view this page');
        res.redirect('/users/login');
    } else {
        res.render('users/profile', {
            'user': user
        })
    }
})

// display logout page
router.get('/logout', (req, res) => {
    req.session.user = null;
    req.flash('success_messages', 'Goodbye');
    res.redirect('/users/login');
})

module.exports = router;