<script>

    var socket = io();

    //game

    var ctx = document.getElementById("ctx").getContext("2d");
    var signDiv = document.getElementById('signDiv');
    var signDivUsername = document.getElementById('signDiv-username');
    var signDivSignIn = document.getElementById('signDiv-signIn');


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
   

 

    document.onkeydown = function(event){
        if(event.keyCode === 68 || event.keyCode === 39)    //d
            socket.emit('keyPress',{inputId:'right'});
        else if(event.keyCode === 83 || event.keyCode === 40)   //s
            socket.emit('keyPress',{inputId:'down'});
        else if(event.keyCode === 65 || event.keyCode === 37) //a
            socket.emit('keyPress',{inputId:'left'});
        else if(event.keyCode === 87 || event.keyCode === 38) // w
            socket.emit('keyPress',{inputId:'up'});
           
    }


   

</script>