import React from "react";
import './App.css';


export default function DiaologBox({message, handleClick}){
    return(
        <div className="dialogContainer">
            <p>{message}</p>
            <button 
            className="dialogClose"
            onClick={handleClick}
            >CLOSE</button>
        </div>
    );
}