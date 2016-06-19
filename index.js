'use strict';

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var path = require('path');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(http);
var socket = io.listen(server);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(path.normalize(__dirname + '/'), 'client')));
app.get('/*', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});


var connectedSockets={};
var allUsers=[{nickname:"",color:"#000"}];
io.on('connection',function(socket){


    socket.on('addUser',function(data){ 
        if(connectedSockets[data.nickname]){
          socket.emit('userAddingResult',{result:false});
        }else{
            socket.emit('userAddingResult',{result:true});
            socket.nickname=data.nickname;
            connectedSockets[socket.nickname]=socket;
            allUsers.push(data);
            socket.broadcast.emit('userAdded',data);
            socket.emit('allUser',allUsers);
        }

    });

    socket.on('addMessage',function(data){ 
        if(data.to){
            connectedSockets[data.to].emit('messageAdded',data);
        }else{
            socket.broadcast.emit('messageAdded',data);
        }

    });



    socket.on('disconnect', function () {  
            socket.broadcast.emit('userRemoved', {  
                nickname: socket.nickname
            });
            for(var i=0;i<allUsers.length;i++){
                if(allUsers[i].nickname==socket.nickname){
                    allUsers.splice(i,1);
                }
            }
            delete connectedSockets[socket.nickname]; 

        }
    );
});


var PORT = process.env.PORT || 3000;

server.listen(PORT, function() {
   console.log('Express server listening on %d, in %s mode', 3000);
});

exports = module.exports = app;
