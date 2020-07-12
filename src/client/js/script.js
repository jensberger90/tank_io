var socket = io();

//HTML Objects
let ctx = document.getElementById("ctx").getContext("2d");
let signDiv = document.getElementById('signDiv');
let signDivUsername = document.getElementById('signDiv-username');
let signDivSignIn = document.getElementById('signDiv-signIn');


//SIGN IN Process ------------
signDivSignIn.onclick = function(){
    signIn();
}


signDivUsername.onkeydown = function(e){
    if(e.keyCode == 13){
        signIn();
    }
}

function signIn(){
    if(signDivUsername.value != ""){
        socket.emit('signIn',{name:signDivUsername.value});
    } else {
        alert("Gib einen Namen an!");
    }
}

socket.on('signInResponse',function(data){
    if(data.success){
        signDiv.style.display = 'none';
        gameDiv.style.display = 'flex';
    } else
        alert("Die maximale Spielerzahl auf dem Server ist erreicht.");
});
//------------------------------------






// NEW Positions
ctx.font = '8px Arial';
ctx.textAlign = "center";
ctx.textBaseline = "middle";

socket.on('newPositions',function(data){
    ctx.clearRect(0,0,500,500);
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,500,500);


    for(var i = 0 ; i < data.player.length; i++){
        ctx.fillStyle="red";
        ctx.fillRect(data.player[i].x,data.player[i].y,10,10);
        console.log(data)
    }

});



//KEY INPUT
document.onkeypress = function(event){
    if(event.keyCode === 68 || event.keyCode === 39)    //d
        socket.emit('keyPress',{hor:1,ver:null});
    else if(event.keyCode === 83 || event.keyCode === 40)   //s
        socket.emit('keyPress',{hor:null,ver:1});
    else if(event.keyCode === 65 || event.keyCode === 37) //a
        socket.emit('keyPress',{hor:-1,ver:null});
    else if(event.keyCode === 87 || event.keyCode === 38) // w
        socket.emit('keyPress',{hor:null,ver:-1});
}
