import React from "react"
import Home from "./component/home"
import './App.css';
import { BrowserRouter,Routes, Route } from 'react-router-dom' 

function App() {
  const [user, setUser] = React.useState('');
  const [userName,setUserName] = React.useState('');
  const [broker,setBroker] = React.useState('Shoonya');

  const data = {
    user : user,
    userName : userName,
    broker : broker,
    setUser : setUser,
    setUserName : setUserName,
    setBroker : setBroker
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path = "/" element = {<Home data = {data}/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
