import React, { useEffect } from 'react';
import Selector from './selector'
import OptionChain from './optionChain';
import Graph from './graph';


const Home = (props) => {
    const {broker} = props.data;
    const [isSticky,setSticky] = React.useState(false);
    const [selectedStock, setSelectedStock] = React.useState('');   //Selected in it
    const [expiry,setExpiry] = React.useState([])                   //List of expiries
    const [stockPrice,setStockPrice] = React.useState(0);           //The price
    const [lotSize,setLotSize] = React.useState(0);                 //Lot size

    const [contractList, setContractList] = React.useState([])      //List of added contracts

    const data = {
        broker: broker,
        selectedStock: selectedStock,
        expiry: expiry,
        stockPrice: stockPrice,
        lotSize: lotSize,
        contractList: contractList,

        setSelectedStock:setSelectedStock,
        setExpiry:setExpiry,
        setStockPrice: setStockPrice,
        setLotSize: setLotSize,
        setContractList: setContractList,
    }

    const handleScroll = () => {
        if(!isSticky && window.scrollY > 0){
            setSticky(window.scrollY > 0);
        }
        else if(isSticky && window.scrollY === 0){
            setSticky(window.scrollY > 0);
        }
    }

    window.addEventListener('scroll', handleScroll);

    return(
        <div className='home'>
            <nav className={isSticky ? 'sticky-navbar' : 'navbar'}>
                <h2 className='bold nav1'>Dashboard</h2>
            </nav>
            <Selector data = {data}/>
            <OptionChain data = {data} />
            <Graph data = {data}/>
        </div>
    )
}

export default Home;