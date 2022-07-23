import React, {useRef, useEffect, useState, memo} from "react";
import gsap from "gsap";

import gameOver from "./images/game_over.png";
import cloud_1 from "./images/cloud_1.svg";
import cloud_2 from "./images/cloud_2.svg";
import zombieImg from './images/zombie.png';

let canvasWidth;
let canvasHeight;
let isPlaying = true;
let ghostMode = false;
let taps = 0;
let speed = 1;
let scoreId;
let cloudId;
const MAX_SNOW = 40;
const MAX_FLY = 10;
const MAX_CLOUDS = 3;
const CLOUD = [cloud_1, cloud_2];


class Character {
    constructor(x, y, context){
        this.position = {
            x,
            y
        };
        this.velocity = {
            x: 0,
            y: -2,
        }
        this.width = 30;
        this.height = 30;
        this.context = context;
        this.showCollider = false;
        this.colliderColor = null;
    };

    draw(){
        if(this.showCollider === true){
            if(this.colliderColor){
                this.context.current.strokeStyle = this.colliderColor;
            } else {
                this.context.current.strokeStyle = "yellow";
            }
            this.context.current.strokeRect(this.position.x, this.position.y, this.width, this.height);
        };

        this.context.current.fillStyle = "red";
        this.context.current.fillRect(this.position.x, this.position.y, this.width, this.height);
    };

    toggleCollider(value){
        this.showCollider = value;
    };

    /**
     * 
     * @param {boolean} value - True or False value to show or hide collider box for debugging.
     * @param {string} color - (Optional) Color of the collider box
     */
    toggleCollider(value, color){
        this.showCollider = value;
        this.colliderColor = color;
    };
};

class Bob extends Character {
    constructor(x, y, context){
        super(x, y, context);
        this.grounded = false;
    };

    addGravity(weight){
        this.position.y = this.position.y - this.velocity.y;

        if(this.grounded === false){
            this.velocity.y = this.velocity.y - weight;
        };
        
        //Stop falling when ground is reached
        if(this.position.y + this.height >= canvasHeight){
            this.velocity.y = 0;
            this.grounded = true;
        };
    };

    jump(){
        if(this.grounded === true){
            this.velocity.y = 12;
            this.grounded = false;
        };
    };
};

class Zombie extends Character {
    constructor(x, y, context){
        super(x, y, context);

        this.velocity = {
            x: -2,
            y: 0,
        };
        this.width = 70;
        this.height = 70;
        this.img = new Image();
        this.img.src = zombieImg;
    };

    draw(){
        this.context.current.drawImage(this.img, this.position.x, this.position.y - 70);
    }

    move(){
        this.position.x = this.position.x + this.velocity.x * speed;
    };
};

class Projectile {
    constructor(x ,y){
        this.position = {
            x,
            y,
        };
        this.velocity = {
            x : 0,
            y : 0,
        };
    };
};

class Cloud {
    constructor(context){
        this.context = context;
        this.position = {
            x: canvasWidth,
            y: getRandomNumber(50, (canvasHeight / 2) - 30),
        };
       
        this.velocity = {
            x: -0.1,
            y: 0,
        };
        this.img = new Image();
        this.img.src = CLOUD[Math.round(Math.random())];
    };

    move(){
        this.position.x = this.position.x + this.velocity.x * speed;
    };

    draw(){
        this.context.current.drawImage(this.img, this.position.x, this.position.y);
    };
};


class SnowFlake {
    constructor(context) {
        this.SNOW_XSPEED_RANGE = [-0.8, 0.8];
        this.SNOW_YSPEED_RANGE = [0.3, 0.5];
        this.SNOW_SIZE_RANGE = [1, 3];
        this.SNOW_LIFESPAN_RANGE = [75, 150];
        
        this.context = context;
        this.x = getRandomNumber(0, canvasWidth);
        this.y = getRandomNumber(0, canvasHeight);
        this.xSpeed = getRandomNumber(this.SNOW_XSPEED_RANGE[0], this.SNOW_XSPEED_RANGE[1]);
        this.ySpeed = getRandomNumber(this.SNOW_YSPEED_RANGE[0], this.SNOW_YSPEED_RANGE[1]);
        this.size = getRandomNumber(this.SNOW_SIZE_RANGE[0], this.SNOW_SIZE_RANGE[1]);
        this.lifeSpan = getRandomNumber(this.SNOW_LIFESPAN_RANGE[0], this.SNOW_LIFESPAN_RANGE[1]);
        this.age = 0;
        this.color = {
            red: 255,
            green: 255,
            blue: 255,
            alpha: 0,
        };
    };

    moveSnow(){
        this.x = this.x + this.xSpeed;
        this.y = this.y + this.ySpeed;
        this.age = this.age + 1;

        if(this.age < this.lifeSpan / 2){
            this.color.alpha += 1 / (this.lifeSpan / 2);

            if(this.color.alpha > 1){
                this.color.alpha = 1;
            }; 
        } else {
            this.color.alpha -= 1 / (this.lifeSpan / 2);

            if(this.color.alpha < 0){
                this.color.alpha = 0;
            };
        };
    };

    draw() {
        this.context.current.beginPath();
        this.context.current.fillStyle = 'rgba(' + this.color.red + ', ' + this.color.green + ', ' + this.color.blue + ', ' + this.color.alpha + ')';
        this.context.current.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        this.context.current.fill();
    };

};

class Firefly {
    constructor(context) {
        this.FLY_XSPEED_RANGE = [-0.3, 0.3];
        this.FLY_YSPEED_RANGE = [-0.3, 0.1];
        this.FLY_SIZE_RANGE = [0.4, 1.5];
        this.FLY_LIFESPAN_RANGE = [140, 440];
        
        this.context = context;
        this.x = getRandomNumber(0, canvasWidth);
        this.y = getRandomNumber(canvasHeight / 2, canvasHeight);
        this.xSpeed = getRandomNumber(this.FLY_XSPEED_RANGE[0], this.FLY_XSPEED_RANGE[1]);
        this.ySpeed = getRandomNumber(this.FLY_YSPEED_RANGE[0], this.FLY_YSPEED_RANGE[1]);
        this.size = getRandomNumber(this.FLY_SIZE_RANGE[0], this.FLY_SIZE_RANGE[1]);
        this.lifeSpan = getRandomNumber(this.FLY_LIFESPAN_RANGE[0], this.FLY_LIFESPAN_RANGE[1]);
        this.age = 0;
        this.color = {
            hue: 290,
            saturation: 100,
            lightness: 50,
        };
    };

    move(){
        this.x = this.x + this.xSpeed;
        this.y = this.y + this.ySpeed;
        this.age = this.age + 1;
    };

    draw() {
        this.context.current.beginPath();
        this.context.current.fillStyle = `hsl(${this.color.hue}, ${this.color.saturation}%, ${this.color.lightness}%)`;
        this.context.current.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        this.context.current.fill();
    };

};


function getRandomNumber(min, max){
    return Math.random() * (max - min) + min;
};

function Game({handleGameOver}){
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const scoreBarRef = useRef(null);
    const [score, setScore] = useState(1);
    const [gameover, setIsGameover] = useState(false);

    let animationId;
    let char;

    let zombies = [];
    let snowFlakes = [];
    let fireflies = [];
    let clouds = [];

    spawnEnemies();

    function createSnow(){
        if(snowFlakes.length < MAX_SNOW){
            snowFlakes.push(new SnowFlake(contextRef));
        };
    };

    function createFlies(){
        if(fireflies.length < MAX_FLY){
            fireflies.push(new Firefly(contextRef));
        };
    };

    function spawnEnemies(){
        let timeout = getRandomNumber(500, 2800);
        setTimeout(function(){
            zombies.push(new Zombie(canvasWidth, canvasHeight - 30, contextRef));
            if(isPlaying){
                spawnEnemies();
            }   
        }, timeout);
    };

    function createClouds(){
        if(clouds.length < MAX_CLOUDS){
            clouds.push(new Cloud(contextRef));
        };
    };

    cloudId = setInterval(function(){
        createClouds();
    }, getRandomNumber(3000, 6500));

    createClouds();
    
    function removeClouds(){
        clouds.forEach(function(cld, index){
            if(cld.position.x + 280 < 0){
                clouds.splice(index, 1);
            };
        });
    };

    function removeSnow(){
        let i = snowFlakes.length;

        while(i--){
            let snow = snowFlakes[i];

            if(snow.age >= snow.lifeSpan){
                snowFlakes.splice(i, 1);
            };
        };
    };

    function removeFlies(){
        let i = fireflies.length;

        while(i--){
            let fly = fireflies[i];

            if(fly.age >= fly.lifeSpan){
                fireflies.splice(i, 1);
            };
        };
    };

    function increaseSpeed(increasedSpeed){
        speed = speed + increasedSpeed;
    };

    useEffect(function(){
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;

        char = new Bob(50, canvasHeight - 30, contextRef);
        isPlaying = true;
      
        const context = canvas.getContext("2d");
        contextRef.current = context;
    
        animate();
    }, []);
    
    function render(){
        contextRef.current.fillStyle = '#3E3E3E';
        contextRef.current.fillRect(0, 0, canvasWidth, canvasHeight);

        //Draw moon
        contextRef.current.fillStyle = '#FCFF9B';
        contextRef.current.arc(canvasWidth - 30, 60, 180, 0, Math.PI * 2, false);
        contextRef.current.fill();

        zombies.forEach(function(zombie, index){
            zombie.draw();
        });

        snowFlakes.forEach(function(snow, index){
            snow.draw();
        });

        fireflies.forEach(function(fly, index){
            fly.draw();
        });

        clouds.forEach(function(cld, index){
            cld.draw();
        });

        char.draw();
    };

    function controller(){
            window.addEventListener("keydown", function(event){
                if(event.key === " " && isPlaying){
                    char.jump();
                }
            });

            window.addEventListener("touchstart", function(event){
                if(isPlaying){
                    char.jump();
                }
            });
    };

    //Definitely nothing suspicious going on over here...
    function handleScoreClick() {
        if(taps < 5){
            taps++;
        } else {
            ghostMode = true;
            taps = 0;

            gsap.to(scoreBarRef.current, {
                backgroundColor: 'red',
                width: 0,
                ease: "linear",
                duration: 6,
            });

            setTimeout(function(){
                ghostMode = false;
                gsap.to(scoreBarRef.current, {
                    backgroundColor: "#00F3D2",
                    width: "50%",
                    ease: "linear",
                    duration: 0.1,
                });
            }, 6000);
        }
    }

    function updateScore(){
        scoreId = setTimeout(function(){
            if(isPlaying){
                    setScore(score + 1); 
                    if(score % 10 === 0){
                        increaseSpeed(0.05);
                    };
            } else {
                clearInterval(scoreId);
            };
        }, 500);
    };
    updateScore();

    function update(){
        char.addGravity(0.4);
        char.toggleCollider(true);
        zombies.forEach(function(zombie, index){
            //Collision detection
            if(!ghostMode){
                if(char.position.x + char.width >= zombie.position.x 
                    && char.position.x <= zombie.position.x + zombie.width
                    && char.position.y + char.height >= zombie.position.y
                    && char.position.y <= zombie.position.y + zombie.height
                    ){
                        isPlaying = false;
                        setIsGameover(true);
                        taps = 0;
                        speed = 1;
                        window.navigator.vibrate(300);
                        clearInterval(cloudId);
                        cancelAnimationFrame(animationId);
                        return;
                    }
            }
            
            if(isPlaying){
                zombie.move();
            }

            //Clean up 
            if(zombie.position.x + zombie.width < 0){
                zombies.splice(index, 1);
            }
        });

        createSnow();
        removeSnow();

        createFlies();
        removeFlies();

        removeClouds();

        snowFlakes.forEach(function(snow, index){
            snow.moveSnow();
        });

        fireflies.forEach(function(fly, index){
            fly.move();
        });

        clouds.forEach(function(cld, index){
            cld.move();
        });
       
        controller();
        render();
    };

    function animate(){
        if(isPlaying){
            update();
            animationId = requestAnimationFrame(animate);
        }
    };

    return(
        <>
            <h2 onClick={handleScoreClick} className="scoreBoard">Score: {score}</h2>
            <div style={{opacity: ghostMode ? 1 : 0 }} ref={scoreBarRef} className="ghostModeBar"></div>
            <canvas className="game" ref={canvasRef} >I'm sorry but your computer is from the stone age. Please update</canvas>
            {gameover && <img className="gameOver" src={gameOver} alt="game over" onClick={handleGameOver}/>}
        </>
    );

}

export default memo(Game);