import React, {useRef, useEffect, useState, memo} from "react";
import gameOver from "./images/game_over.svg";

let canvasWidth;
let canvasHeight;
let isPlaying = true;
let scoreId;

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
    };

    move(){
        this.position.x = this.position.x + this.velocity.x;
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

function getRandomNumber(min, max){
    return Math.random() * (max - min) + min;
};

function Game({handleGameOver}){
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [score, setScore] = useState(0);
    const [gameover, setIsGameover] = useState(false);

    let animationId;
    let char;

    let zombies = [];

    spawnEnemies();

    function spawnEnemies(){
        let timeout = getRandomNumber(800, 2800);
        setTimeout(function(){
            zombies.push(new Zombie(canvasWidth, canvasHeight - 30, contextRef));
            if(isPlaying){
                spawnEnemies();
            }   
        }, timeout);
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
        contextRef.current.clearRect(0, 0 ,canvasWidth, canvasHeight);
        char.draw();
        zombies.forEach(function(zombie, index){
            zombie.draw();
        });
    };

    function controller(){
            window.addEventListener("keydown", function(event){
                if(event.key === " " && isPlaying){
                    char.jump();
                }
            });

            window.addEventListener("touchstart", function(){
                if(isPlaying){
                    char.jump();
                }
            })
    };

    function updateScore(){
        scoreId = setTimeout(function(){
            if(isPlaying){
                setScore(score + 1);
            } else {
                clearInterval(scoreId);
            }
        }, 500);
    };
    updateScore();

    function update(){
        char.addGravity(0.4);
        char.toggleCollider(true);
        zombies.forEach(function(zombie, index){
            //Collision detection
            if(char.position.x + char.width >= zombie.position.x 
                && char.position.x <= zombie.position.x + zombie.width
                && char.position.y + char.height >= zombie.position.y
                && char.position.y <= zombie.position.y + zombie.height
                ){
                    isPlaying = false;
                    setIsGameover(true);
                    window.navigator.vibrate(300);
                    cancelAnimationFrame(animationId);
                    return;
                }
            
            if(isPlaying){
                zombie.move();
            }

            //Clean up 
            if(zombie.position.x + zombie.width < 0){
                zombies.splice(index, 1);
            }
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
            <canvas className="game" ref={canvasRef} >I'm sorry but your computer is from the stone age. Please update</canvas>
            <h2 className="scoreBoard">Score: {score}</h2>
            {gameover && <img className="gameOver" src={gameOver} alt="game over" onClick={handleGameOver}/>}
        </>
    );
}

export default memo(Game);