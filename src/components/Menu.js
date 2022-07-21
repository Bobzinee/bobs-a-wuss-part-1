import React, {useState} from "react";
import gsap from 'gsap';
import '../App.css';

import title from "./images/logo.png"
import play from "./images/play_btn.svg";
import computer from "./images/computer_btn.svg";
import settings from "./images/settings_btn.svg";

import Settings from "./Settings";
import Computer from "./Computer";
import Dialog from "./Dialog";
import Game from "./Game";


export default function Menu(){
    const [toggleBtn, setToggleBtn] = useState({
        playBtn: false,
        computerBtn: false,
        settingsBtn: false,
        showFullScreen: false,
    });

    return(
        <>
            {toggleBtn.playBtn ? <Game /> : 
                <div className={ toggleBtn.settingsBtn ? "menuContainer blur" : "menuContainer"}>
                    <img id="menuTitle" src={title} alt="Bob's a wuss" />
                    <img id="playBtn" src={play} alt="Play" onClick={handleOnPlayClick}/>
                    <div className="menuBottomPanel">
                        <img id="computerBtn" src={computer} alt="Zombiepedia" onClick={handleOnComputerClick} />
                        <img id="settingsBtn" src={settings} alt="Settings"  onClick={handleOnSettingsClick} />
                    </div>
                </div>
            }
            { toggleBtn.settingsBtn && <Settings handleBackPress={handleSettingsBackPress}/>}
            { toggleBtn.computerBtn && <Computer handleBackPress={handleComputerClose}/>}
            { toggleBtn.showFullScreen === false && <Dialog message={"Hold on while I turn on full screen so that you have a better gaming experience"} buttonText={"Okay"} handleClick={handleFullScreen} handleClose={handleDialogClose}/>}
        </>
    );

    function handleFullScreen(){
        document.getElementById("root").requestFullscreen();
        setToggleBtn({showFullScreen: true});
    }

    function handleDialogClose(){
        setToggleBtn({showFullScreen: true});
    }

    function handleSettingsBackPress(settingsRef){
        gsap.to(settingsRef.current, {
            scale: 0,
            duration: 0.3,
            ease: "power2.out",
        });

        setTimeout(function(){
            setToggleBtn({...toggleBtn, settingsBtn: false});
        }, 300);
    }

    function handleOnPlayClick(){
        setToggleBtn({playBtn: true});
    };

    function handleOnComputerClick(){
        setToggleBtn({computerBtn: true});
    };

    function handleOnSettingsClick(){
        setToggleBtn({settingsBtn: true});
    };

    function handleComputerClose(){
        setToggleBtn({settingsBtn: false});
    };
};
