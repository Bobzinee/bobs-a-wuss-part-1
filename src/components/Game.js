import React, {useRef, useEffect, memo} from "react";

let canvasWidth;
let canvasHeight;

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

function Game(){
    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    let animationId;
    let score;
    let char;
    let z;

    let zombies = [];


    useEffect(function(){
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;

        char = new Bob(50, canvasHeight - 30, contextRef);
        z = new Zombie(canvasWidth, canvasHeight - 30, contextRef);
        zombies.push(z);

        const context = canvas.getContext("2d");
        contextRef.current = context;
        
        animate();

    }, [animate]);
    

    function render(){
        contextRef.current.clearRect(0, 0 ,canvasWidth, canvasHeight);
        char.draw();
        zombies.forEach(function(zombie, index){
            zombie.draw();
        });
    };

    function controller(){
        window.addEventListener("keydown", function(event){
            if(event.key === " "){
                char.jump();
            }
        });
    };

    function update(){
        controller();
        char.addGravity(0.4);
        char.toggleCollider(true);
        zombies.forEach(function(zombie){
            zombie.move();
        });
        render();
    };

    function animate(){
        update();
        animationId = requestAnimationFrame(animate);
    };

    return(
        <>
            <canvas className="game" ref={canvasRef} >I'm sorry but your computer is from the stone age. Please update</canvas>
        </>
    );
}

export default memo(Game);