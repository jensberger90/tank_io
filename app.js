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




onConnect = function(socket, name){
    var player = new Player(socket.id);
    
    player.name = name;

    var rand = getRandomInt(0, COLORS.length);
    player.color = COLORS[rand];

    //Die Farbe des Spieler wird aus dem Array gelöscht, damit sie nicht doppelt vergeben wird
    COLORS.splice(rand,1);

    player.initialize();
    updateHighscore();


    PLAYER_LIST[player.id] = player;

    socket.on('keyPress',function(data){
        if(data.inputId === 'left' & player.xplus != 1){
            player.xplus = -1;
            player.yplus = 0;
        }else if(data.inputId === 'right' & player.xplus != -1){
            player.xplus = 1;
            player.yplus = 0;        
        }
        else if(data.inputId === 'up' & player.yplus != 1){
            player.xplus = 0;
            player.yplus = -1;        
        }
        else if(data.inputId === 'down' & player.yplus != -1){
            player.xplus = 0;
            player.yplus = 1;        
        }
            
    });

    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        onDisconnect(socket);
    });
}

onDisconnect = function(socket){
    //DIe Farbe darf neu vergeben werden
    COLORS.push(PLAYER_LIST[socket.id].color);

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
        if(Object.size(PLAYER_LIST) < maxPlayer){




            onConnect(socket, data.name);

            if(Object.size(PLAYER_LIST) == 1) pq = 25
            //if(Object.size(PLAYER_LIST) == 2) pq = 25
            //if(Object.size(PLAYER_LIST) == 3) pq = 20
            //if(Object.size(PLAYER_LIST) == 4) pq = 12.5
            //if(Object.size(PLAYER_LIST) == 5) pq = 10


            socket.emit('signInResponse',{success:true,pq:pq});  
        } else {
            socket.emit('signInResponse',{success:false});
        }
        
    });

    socket.on('sendMsgToServer',function(data){
        var playerName = PLAYER_LIST[socket.id].name;
        var playerColor = PLAYER_LIST[socket.id].color;
        var str = playerName + ': ' + data

        var msg = {
            str:str,
            color:playerColor,
        }

        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit('addToChat',msg);
        }
    });
   
    socket.on('evalServer',function(data){
        if(!DEBUG)
            return;
        var res = eval(data);
        socket.emit('evalAnswer',res);     
    });
    
});


setInterval(function(){
    var data = [];
        for(var i in PLAYER_LIST){
            var player = PLAYER_LIST[i];
            player.update();
            data.push({
                snakex:player.snakex,
                snakey:player.snakey,
                xplus:player.xplus,
                yplus:player.yplus,
                score:player.score,
                color:player.color,
                name:player.name,
            });    
        }

    target.update();

    var pack = {
        player:data,
        goal:target,
        highscore:highscoredata,
    }
    

    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions',pack);
    }
}, GAME_SPEED);