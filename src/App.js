import React, {useState, useEffect}from 'react';
import './App.css';

import Game from './components/Game';
import Loading from './components/Loading';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDialogBox, setShowDialogBox] = useState(false);

  useEffect(function(){
    setTimeout(function(){
      setIsLoaded(true);
    }, 4000);
  }, []);

  return (
    <div className="App">
      {isLoaded ? <Game /> : <Loading />}
    </div>
  );
}

export default App;
