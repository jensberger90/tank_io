let express = require('express');
let app = express();
let serv = require('http').Server(app);
 
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/src/client/index.html');
});
app.use('/src/client',express.static(__dirname + '/src/client'));



serv.listen(2000);
console.log("Server started.");


let PLAYER_LIST = {}; 
let SOCKET_LIST = {};


//Player Class
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

        this.vx = 0;
        this.vy = 0;

        console.log(this.vx)
    }

}

//Bullet Class
function Bullet (){
    this.x;
    this.y;

    this.update = function () {

    }
}


//Client connects
onConnect = function(socket, name){
    var player = new Player(socket.id);
    
    player.name = name;

    PLAYER_LIST[player.id] = player;

    //Message Commands --------------------------

    //Keypress Command
    socket.on('keyPress',function(data){


        switch(data.direction) {
            case "right":
                player.vx = 1;
                break;
            case "down":
                player.vy = 1;
                break;
            case "left":
                player.vx = -1;
                break;
            case "up":
                player.vy = -1;
                break;
        }

        
    });

    //Disconnect Command
    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        onDisconnect(socket);
    });
}

//Client disconnects
onDisconnect = function(socket){
    delete PLAYER_LIST[socket.id];
}



//Client Connection
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    socket.on('signIn',function(data){
            onConnect(socket, data.name);
            socket.emit('signInResponse',{success:true});  

    });

});



//MAIN LOOP
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


//Other Stuff
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}