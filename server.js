var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('lodash');

var users = [];

io.on('connection', function(socket) {
    // login
    socket.on('login', function(id) {
        // send a failed login message(if this uid is already connected)
        if (_.findIndex(users, {
                socket: socket.id
            }) !== -1) {
            socket.emit('login_error', 'You are already connected.');
        }

        // send a failed login message(if this uid is already registered)
        if (_.findIndex(users, {
                id: id
            }) !== -1) {
            socket.emit('login_error', 'This name already exists.');
            return;
        }

        users.push({
            id: id,
            'socket': socket.id
        });

        socket.emit('login_successful', _.map(users, 'id'));
        socket.broadcast.emit('online', id);
        console.log('id:' + id + ' logged in');
    });

    socket.on('sendMessage', function(id, message) {
        console.log('sendMessage(start):' + id);
        console.log(message);
        var currentUser = _.find(users, {
            socket: socket.id
        });
        if (!currentUser) {
            return;
        }

        var contact = _.find(users, {
            id: id
        });
        if (!contact) {
            return;
        }

        console.log('sendMessage( end ):' + id);
        console.log(message);
        io.to(contact.socket).emit('messageReceived', currentUser.id, message);
    });

    socket.on('disconnect', function() {
        var index = _.findIndex(users, {
            socket: socket.id
        });
        if (index !== -1) {
            socket.broadcast.emit('offline', users[index].name);
            console.log(users[index].name + ' disconnected');
            users.splice(index, 1);
        }
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});