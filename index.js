// SELECCIÓN DE CANVAS 
const cvs = document.getElementById("bird");
const ctx = cvs.getContext("2d");

// VARIABLES DE JUEGO Y CONSTANTES
let frames = 0;
const DEGREE = Math.PI/180;

// CARGA DE IMAGEN DE SPRITES
const sprite = new Image();
sprite.src = "img/sprite.png";

// CARGA DE SONIDOS
const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "audio/sfx_flap.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "audio/sfx_die.wav";

// ESTADO DEL JUEGO 
const state = {
    current : 0, // ESTADO ACTUAL, PUEDE TENER COMO OPCIONES 0,1,2, BASADAS EN LAS SIGUIENTES PROPIEDADES
    getReady : 0, // ESTADO DE INICIO DEL JUEGO
    game : 1, // ESTADO DE "JUGANDO"
    over : 2 // ESTADO DE COLISIÓN Y PÉRDIDA DEL JUEGO
}

// COORDENADAS DEL BOTÓN DONDE PUEDES REINICIAR EL JUEGO CUANDO PIERDES (REVISAR LÍNEA 63). SI SE DA CLICK EN ESE RANGO, INICIA EL JUEGO
const startBtn = {
    x : 120,
    y : 263,
    w : 83,
    h : 29
}

// CONTROL DEL JUEGO
cvs.addEventListener("click", function(evt){ // EVENTO DE CLICK SOBRE EL CANVAS. CADA CLICK QUE SE HACE, SE IDENTIFICA EN QUÉ ESTADO ESTÁ.
    switch(state.current){ 
        case state.getReady: // AL MOMENTO DE DAR CLICK SOBRE EL CANVAS, SE INICIA EL JUEGO
            state.current = state.game; // CAMBIAMOS EL ESTADO A "JUGANDO" o state.game
            SWOOSHING.play(); // EJECUTA UN SONIDO DE SWOOSH
            break;
        case state.game:
            bird.flap(); // EJECUTA LA LÓGICA DE VUELO
            FLAP.play(); // EJECUTA EL SONIDO DE VUELO
            break;
        case state.over:
            let rect = cvs.getBoundingClientRect(); // OBTIENE DE RETORNO EL TAMAÑO DEL ELEMENTO Y SU POSICIÓN AL VIEWPORT, ES DECIR EL CANVAS *
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;

            console.log(clickX)
            console.log(clickY)
            
            // SI LLEGÓ A ATINARLE AL START BUTTON...
            if(clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h){
                pipes.reset(); // EJECUTA UN RESET DE TODAS LAS PIPAS
                bird.speedReset(); // EJECUTA UN RESET DEL PÁJARO EN SU VELOCIDAD
                score.reset(); // EJECUTA UN RESET EN EL SCORE
                state.current = state.getReady; // REGRESAMOS AL ESTADO CURRENT
            }
            break;
    }
});


// FONDO
const bg = {
    sX : 0,
    sY : 0,
    w : 275,
    h : 226,
    x : 0,
    y : cvs.height - 226,
    
    draw : function(){
        // LA "S" SIGNIFICA SOURCE, RELATIVO AL img/sprite.png. sX SERÍA LA COORDENADA EN LA QUE SE ENCUENTRA DENTRO DEL SPRITE
        // context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
        // PINTA EL PRIMERO PEGADO A LA IZQUIERDA
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        // PINTA EL SEGUNDO EN DONDE TERMINA EL PRIMERO. OBSERVAR EL THIS.X + THIS.W
        //                                                              |||
        //                                                               V
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
    
}

// SEGUNDO FONDO (EL PISO)
const fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.height - 112,
    
    dx : 2,
    
    draw : function(){
        // MISMA LÓGICA 
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },
    
    update: function(){
        if(state.current == state.game){
            this.x = (this.x - this.dx)%(this.w/2);
        }
    }
}

// PÁJARO
const bird = {
    animation : [ // DEPENDIENDO DE LA POSICIÓN DEL ARRAY, VA A SER UNA COORDENADA DIFERENTE DENTRO DE LA IMAGEN DE SPRITES
        {sX: 276, sY : 112},
        {sX: 276, sY : 139},
        {sX: 276, sY : 164},
        {sX: 276, sY : 139}
    ],
    x : 50,
    y : 150,
    w : 34,
    h : 26,
    
    radius : 12,
    
    frame : 0,
    
    gravity : 0.25,
    jump : 4.6,
    speed : 0,
    rotation : 0,
    
    draw : function(){
        let bird = this.animation[this.frame]; // DEPENDIENDO DEL VALOR DE THIS.FRAME, VA A CAMBIAR LA POSICIÓN DEL PÁJARO
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h,- this.w/2, - this.h/2, this.w, this.h);
        ctx.restore();
    },
    
    flap : function(){
        this.speed = -this.jump;
    },
    
    update: function(){
        // SI EL ESTADO DEL JUEGO ESTÁ LISTO, CON ESTA CONDICIONAL ESTABLECEMOS LA VELOCIDAD DEL ALETEO DEL PÁJARO
        this.period = state.current == state.getReady ? 10 : 5;
        // INCREMENTAMOS EL FRAME POR 1 CUANDO TENGAMOS UN MÓDULUS DE CERO EN 5 O 10 FRAMES, DEPENDIENDO EL PERIOD
        this.frame += frames%this.period == 0 ? 1 : 0;
        // FRAME VA DE 0 A 4. Y LUEGO, REINICIA
        this.frame = this.frame%this.animation.length;
        // 0 % 4 = 0
        // 1 % 4 = 1
        // 2 % 4 = 2
        // 3 % 4 = 3
        // 4 % 4 = 0 => VER LÍNEA 145
        
        if(state.current == state.getReady){ // SI ESTAMOS EN EL ESTADO DE INICIO...
            this.y = 150; // COLOCAR AL PÁJARO EN 150
            this.rotation = 0 * DEGREE; // SIN ROTACIÓN
        }else{
            this.speed += this.gravity; // DE LO CONTRARIO, SI NO ESTAMOS EN ESTADO DE INICIO, APLICAR GRAVEDAD A LA VELOCIDAD
            this.y += this.speed; // AGREGAR LA VELOCIDAD A LA CAÍDA DE LA COORDENADA Y
            
            if(this.y + this.h/2 >= cvs.height - fg.h){ // SI TOCO EL SUELO...
                this.y = cvs.height - fg.h - this.h/2; // INMOVILIZAMOS AL PÁJARO RESTANDO LA ALTURA DEL CANVAS MENOS EL PISO MENOS LA ALTURA DEL PÁJARO
                if(state.current == state.game){ // 
                    state.current = state.over;
                    DIE.play();
                }
            }
            
            // SI LA VEL
            if(this.speed >= this.jump){
                this.rotation = 90 * DEGREE;
                this.frame = 1;
            }else{
                this.rotation = -25 * DEGREE;
            }
        }
        
    },
    speedReset : function(){
        this.speed = 0;
    }
}

// MENSAJE DE ESTAR LISTO
const getReady = {
    sX : 0,
    sY : 228,
    w : 173,
    h : 152,
    x : cvs.width/2 - 173/2, // AQUÍ OBTENEMOS CENTRAR EL OBJETO
    y : 80,
    
    draw: function(){
        if(state.current == state.getReady){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}

// OBTENEMOS UN GAME OVER
const gameOver = {
    sX : 175,
    sY : 228,
    w : 225,
    h : 202,
    x : cvs.width/2 - 225/2,
    y : 90,
    
    draw: function(){
        if(state.current == state.over){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);   
        }
    }
    
}

// PIPAS
const pipes = {
    position : [],
    
    top : {
        sX : 553,
        sY : 0
    },
    bottom:{
        sX : 502,
        sY : 0
    },
    
    w : 53,
    h : 400,
    gap : 85,
    maxYPos : -150,
    dx : 2,
    
    draw : function(){
        for(let i  = 0; i < this.position.length; i++){
            let p = this.position[i];
            
            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;
            
            // PIPAS DE ARRIBA
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);  
            
            // PIPAS DE ABAJO
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);  
        }
    },
    
    update: function(){
        if(state.current !== state.game) return;
        
        if(frames%100 == 0){ 
            this.position.push({ // SE EMPUJAN LAS PIPAS
                x : cvs.width,
                y : this.maxYPos * ( Math.random() + 1)
            });
        }
        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i]; // ELIGE LA PIPA ACTUAL
            
            let bottomPipeYPos = p.y + this.h + this.gap;
            
            // DETECCIÓN DE COLISIONES
            // PIPAS DE ARRIBA
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h){
                state.current = state.over;
                HIT.play();
            }
            // PIPAS DE ABAJO
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h){
                state.current = state.over;
                HIT.play();
            }
            
            // MUEVE LAS PIPAS HACIA LA IZQUIERDA
            p.x -= this.dx;
            
            // SI LAS PIPAS SALEN DEL CANVAS, SE BORRAN DEL ARRAY
            if(p.x + this.w <= 0){
                this.position.shift();
                score.value += 1;
                SCORE_S.play();
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
        }
    },
    
    reset : function(){
        this.position = [];
    }
    
}

// PUNTUACIÓN
const score= {
    best : parseInt(localStorage.getItem("best")) || 0, // USO DE LOCAL STORAGE. GUARDADO DE DATOS EN EL NAVEGADOR
    value : 0,
    
    draw : function(){
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";
        
        if(state.current == state.game){
            ctx.lineWidth = 2;
            ctx.font = "35px Teko";
            ctx.fillText(this.value, cvs.width/2, 50);
            ctx.strokeText(this.value, cvs.width/2, 50);
            
        }else if(state.current == state.over){
            // VALOR DE PUNTUACIONES
            ctx.font = "25px Teko";
            ctx.fillText(this.value, 225, 186);
            ctx.strokeText(this.value, 225, 186);
            // MEJOR SCORE
            ctx.fillText(this.best, 225, 228);
            ctx.strokeText(this.best, 225, 228);
        }
    },
    
    reset : function(){
        this.value = 0;
    }
}

// DIBUJAR TODOS LOS ELEMENTOS DENTRO DEL CANVAS
function draw(){
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

// ACTUALIZACIÓN DE LOS ELEMENTOS
function update(){
    bird.update();
    fg.update();
    pipes.update();
}

// MOTOR
function loop(){
    update();
    draw();
    frames++;
    
    requestAnimationFrame(loop);
}
loop();
