'use strict';

const express = require('express');
const morgan = require('morgan');

const { users } = require('./data/users');

const PORT = process.env.PORT || 8000;

let currentUser = null;

const handleHome = (req, res) => {
    if (!currentUser) { res.redirect('/signin'); return; }
    res.send('Homepage!');
}

const handleSignin = (req, res) => {
    if (currentUser) { res.redirect('/'); return; }
    res.render('pages/signinPage', {
        title: "Welcome to FriendFace! Please Sign In."
    });
}

const handleUser = (req, res) => {
    if (!currentUser) { res.redirect('/signin'); return; }
    const id = req.params.id;
    res.send(`user id is ${req.params.id}`);
}

const handleName = (req, res) => {
    const firstName = req.query.firstName;
    const currentUser = users.find(user => user.name === firstName);
    res.redirect(`${currentUser}` ? '/' : '/signin');
}


// server endpoints
express()
    .use(morgan('dev'))
    .use(express.static('public'))
    .use(express.urlencoded({extended: false}))
    .set('view engine', 'ejs')

    // endpoints
    .get('/signin', handleSignin)
    .get('/', handleHome)
    .get('/user', handleUser)
    .get('/name', handleName)

    .get('*', (req, res) => {
        res.status(404);
        res.render('pages/fourOhFour', {
            title: 'I got nothing',
            path: req.originalUrl
        });
    })

    .listen(PORT, () => console.log(`Listening on port ${PORT}`));