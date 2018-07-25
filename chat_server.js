const express = require('express');
const http = require('http');
const sio = require('socket.io');
const app=express();
const server = http.createServer(app);
app.use(express.static(__dirname));

//load the main page
app.get('/',function(req,res){
    res.sendFile(__dirname+'/chat.html');
})
const io = sio.listen(server);
//save chatter numbers and names
var count = 0;
var users = {};
//check if user name has been used with ajax
app.get('/check',function(req,res){
    var info = req.query.name;
    if(users.hasOwnProperty(info)) {
        res.send(true);
    }else{
        res.send(false);
    }
})
//console.log(users);
//monitoring section with web socket
io.on('connection',function(socket){
    console.log('user connect');
    socket.on('login',function(data){
        //add users to the 2 variables
        count++;
        users[data]=data;
        //save user name as socket attribute, 
        socket.user = data;
        //broadcast to other members who comes in
        socket.broadcast.emit('signin',data);
        //update status information to all the numbers
        socket.broadcast.emit('signin_info',{count:count,users:users});
        socket.emit('signin_info',{count:count,users:users});

    })
    //post message section
    socket.on('publish',function(data){
        //send message and socket.user to self and other members's browser
        socket.emit('chat',{msg:data,user:socket.user});
        socket.broadcast.emit('chat',{msg:data,user:socket.user});

    })
    //when a user leaves, register the disconnect event
    socket.on('disconnect',function(){
        console.log('user left');
        //delete members
        count--;
        var user = socket.user;
        delete users[user];
        //send user left message to other members
        socket.broadcast.emit('logout',user);
        //update status information
        socket.broadcast.emit('signin_info',{count:count,users:users});
    })
})
server.listen(3000,function(){
    console.log('listen to 3000');
})