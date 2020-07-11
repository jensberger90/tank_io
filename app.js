var express = require('express');
var app = express();
var serv = require('http').Server(app);
 
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
app.use('/favicon.ico',express.static(__dirname + '/favicon.ico'));


serv.listen(2000);
console.log("Server started.");



var PLAYER_LIST = {}; 
var SOCKET_LIST = {};


function Player (id) {
    this.x = 0;
    this.y = 0;
    this.name;
    this.id = id;
    this.angle;
    this.speed = 5;
    this.vx = 0;
    this.vy = 0;

    this.update = function () {
        this.x = this.x + this.vx * this.speed;
        this.y = this.y + this.vy * this.speed;
    }

}


function Bullet (){
    this.x;
    this.y;

    this.update = function () {

    }
}

onConnect = function(socket, name){
    var player = new Player(socket.id);
    
    player.name = name;




    PLAYER_LIST[player.id] = player;

    socket.on('keyPress',function(data){
        if(data.inputId === 'left'){
            player.vx = -1;
        }else if(data.inputId === 'right' ){
            player.vx = 1;    
        }
        else if(data.inputId === 'up' ){
            player.vy = -1;       
        }
        else if(data.inputId === 'down'){
            player.vy = 1;     
        }
            
    });

    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        onDisconnect(socket);
    });
}

onDisconnect = function(socket){
    delete PLAYER_LIST[socket.id];
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
 
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    socket.on('signIn',function(data){

            onConnect(socket, data.name);
            socket.emit('signInResponse',{success:true});  

    });


    
});


setInterval(function(){
    var data = [];
        for(var i in PLAYER_LIST){
            var player = PLAYER_LIST[i];
            player.update();
            data.push({
                x:player.x,
                y:player.y
            });    
        }

    

    var pack = {
        player:data
    }
    

    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions',pack);
    }
}, 60);