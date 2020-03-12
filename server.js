'use strict';

const express = require('express');
const morgan = require('morgan');

const { users } = require('./data/users');

const PORT = process.env.PORT || 8000;

let currentUser = null;
// you can visit exactly one friend at a time. Keep them as a separate variable:
let friendBeingVisited = null;
// Lets you keep track of who your friends are...
let userFriends = [];
// Keep a separate list of people who are not (yet) your friends:
let unFriended = [];

// Friend Filter: To make it so your friends don't show up
// On the right-hand sidebar for new friends:
// Takes a list of your friends and compares it to the
// users list and returns the difference:
const filterFriends = () => {
    unFriended = [];
    users.forEach(user => {
        if (!(currentUser.friends.includes(user.id)) && user !== currentUser) unFriended.push(user);
    })
};

// Add A Friend: Lets you click on someone's face on the sidebar and add them
// as a friend.

const handleAddFriend = (req, res) => {
    let newFriend = users.find(user => user.name === req.params.name);
    console.log("something", req.params.name, newFriend);
    currentUser.friends.push(newFriend.id);
    userFriends.push(newFriend);
    filterFriends();
    res.redirect("/");
};

const handleHome = (req, res) => {
    if (!currentUser) { res.redirect('/signin'); return; }
    res.render('pages/main', {
        title: ` ${currentUser.name}\'s FriendFace Page!`,
        name: currentUser.name,
        id: currentUser.id,
        pic: currentUser.avatarUrl,
        friends: userFriends,
        potentials: unFriended,
        minipic: currentUser.avatarUrl
    });
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
    currentUser = users.find(user => user.name === firstName);
    // Wipes clean the friends list so you don't clone anyone:
    userFriends = [];
    res.redirect(`${currentUser}` ? '/' : '/signin');
    currentUser.friends.forEach(friendID => {
        userFriends.push(users.find(user => user.id === `${friendID}`));
    });
    users.forEach(user => {
        if (!(currentUser.friends.includes(user.id)) && user !== currentUser) unFriended.push(user);
    });
}
// Friend's page:
const handleVisit = (req, res) => {
    friendBeingVisited = users.find(user => user.name === req.params.name);
    let friendsOfFriends = [];
    console.log("logs", currentUser, friendBeingVisited)
    friendBeingVisited.friends.forEach(friendID => {
        friendsOfFriends.push(users.find(user => user.id === `${friendID}`))
    });
    res.render('pages/friend', {
        title: `${friendBeingVisited.name}'s page!`,
        name: friendBeingVisited.name,
        id: friendBeingVisited.id,
        pic: friendBeingVisited.avatarUrl,
        friends: friendsOfFriends,
        minipic: currentUser.avatarUrl
    });
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
    .get('/friend/:name', handleVisit)
    .get('/addfriend/:name', handleAddFriend)

    .get('*', (req, res) => {
        res.status(404);
        res.render('pages/fourOhFour', {
            title: 'I got nothing',
            path: req.originalUrl
        });
    })

    .listen(PORT, () => console.log(`Listening on port ${PORT}`));