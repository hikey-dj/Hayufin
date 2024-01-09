import React, { useEffect } from 'react';
import Dropdown from './dropdown';
import * as fetchData from './fetchData';
import { sort } from 'mathjs';

const ColouredBox = (props) => {
    const {color,content} = props;
    const style = {
        backgroundColor: color,
        padding:'8px 15px 8px 15px',
        marginRight: '10px',
        maxWidth: 'fit-content',
        borderRadius: '2px',
        marginTop: '20px'
    }

    const innerStyle = {
        
    }
    return (
        <div style = {style}>
            <div style = {innerStyle}>{content}</div>
        </div>
    )
}

const ColouredBoxMod = (props) => {
    const {color,content1,content2} = props;
    const style = {
        backgroundColor: color,
        padding:'8px 15px 8px 15px',
        marginRight: '10px',
        maxWidth: 'fit-content',
        borderRadius: '2px',
        fontWeight: '500',
        fontSize: '16px'
    }

    const innerStyle = {
        display: 'inline',
        padding: '0px',
        color: 'red',
    }
    return (
        <div style = {style}>
            <div>{content1} <div style={innerStyle}>{content2}</div></div>
        </div>
    )
}

const Home = (props) => {
    const {broker,selectedStock, setSelectedStock,expiry,setExpiry,stockPrice,setStockPrice,lotSize,setLotSize} = props.data;
    const {contractList,setContractList} = props.data;
    const [optionStock,setOptionStock] = React.useState([]);        //List of stock
    const [futPrice,setFutPrice] = React.useState(0);               //Future
    const [allOPT, setAllOPT] = React.useState([])                  //All OPT for the stock
    const [selectedExpiry,setSelectedExpiry] = React.useState('')   //Selected expiry
    const [PC,setPC] = React.useState("PE");                        // PE or CE
    const [PEcontracts,setPEcontracts] = React.useState([])         //The PE results
    const [CEcontracts,setCEcontracts] = React.useState([])         //The CE results
    const [selectedContract,setSelectedContract] =React.useState(0) //Selected strike price
    const [contractPrice,setContractPrice] = React.useState(0)      //Temp. var to display price 
    const [selectedDate,setSelectedDate] = React.useState('')       //Selected date
    const [dte,setDTE] = React.useState(0)                          //Days to expiry

    const [BS,setBS] = React.useState('Buy')                        //Buy or Sell
    const [lots,setLots] = React.useState(1)                        //No of lots

    useEffect(() => {
        fetchData.fetchOptionStock().then(res => {
            setOptionStock(res)
            setSelectedStock('NIFTY')
        })
        .catch(error => console.log(error))
    },[])

    useEffect(() => {
        async function getPrice() {
            let price = 0;
            if(selectedStock){
                price = await fetchData.fetchPrice(selectedStock,'NSE',broker);
            }
            return price
        }
        async function getContracts() {
            let ltSize,FUTprice;
                await fetchData.fetchContracts(selectedStock).then(async (res) => {
                console.log(res)
                let token;
                res.FUT.map((option) => {
                    if(option.Symbol === selectedStock) token = option.Token;
                })
                const price = await fetchData.fetchFut(res.FUT[0].Symbol,token,'NFO',broker);
                ltSize = res.OPT[0].LotSize;
                FUTprice = price;
                let expiries = new Set();
                res.OPT.map((option) => {
                    if(option.OptionType === PC){
                        expiries.add(option.Expiry);
                    }
                })
                function sortExpiry(expiry) {
                    let sortedExpiry = [...expiry];
                    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
                    sortedExpiry.sort((a,b) => {
                        const ayear = a.slice(7);
                        const byear = b.slice(7)
                        if (ayear > byear){
                            return 1;
                        }
                        else if(ayear < byear){
                            return -1;
                        }
                        else{
                            const amonth = months.findIndex(month => a.slice(3,6) === month)
                            const bmonth  = months.findIndex(month => b.slice(3,6) === month)
                            if(amonth>bmonth) return 1;
                            else if (amonth<bmonth) return -1;
                            else{
                                if(parseInt(a.slice(0,2)) >parseInt(b.slice(0,2))){
                                    return 1
                                }
                                else if(parseInt(a.slice(0,2)) < parseInt(b.slice(0,2))){
                                    return -1
                                }           
                                else{
                                    return 1
                                }         
                            }
                        }
                    })
                    console.log(sortedExpiry)
                    return sortedExpiry
                }                
                expiries = Array.from(expiries);
                expiries = sortExpiry(expiries);
                setAllOPT(res.OPT);
                setExpiry(expiries);               
            })      
            return [ltSize,FUTprice]
        }
        const updateData = async () => {
            if(selectedStock){
                const STKprice = await getPrice();
                const [ltSize, FUTprice] = await getContracts();
                setFutPrice(FUTprice)
                setLotSize(ltSize)
                setStockPrice(STKprice)
                //temp-fix
                setContractPrice(0)
                setSelectedContract('')
                setSelectedExpiry('')
            }
        }
        updateData()
        setContractList([])
    }
    ,[selectedStock])
    
    useEffect(() => {
        if (expiry){
            setSelectedExpiry(expiry[0]);
        }
    },[expiry])

    useEffect(() => {
        if (selectedExpiry) {
            let PEchain =[],CEchain = [];
            allOPT.map((option) => {
                if (option.Expiry === selectedExpiry) {
                    if(option.OptionType === "PE") PEchain.push(option.StrikePrice)
                    else CEchain.push(option.StrikePrice)
                }
            })    
            PEchain.sort((a,b) => a-b);
            CEchain.sort((a,b) => a-b);
            setPEcontracts(PEchain)
            setCEcontracts(CEchain)
            setContractPrice(0)
            setSelectedContract('')
        }
    },[selectedExpiry])

    useEffect(() => {
        if(allOPT && PC){
            let expiries = new Set();
            allOPT.map((option) => {
                if(option.OptionType === PC){
                    expiries.add(option.Expiry);
                }
            }) 
            setExpiry(Array.from(expiries));
            //temp-fix
            setContractPrice(0)
            setSelectedContract('')
            setSelectedExpiry('')
        }
    },[PC])

    useEffect(() => {
        if(selectedContract && allOPT){
            allOPT.map(async (option) => {
                if(option.Expiry === selectedExpiry && option.OptionType === PC && option.Symbol === selectedStock && option.StrikePrice === selectedContract){
                    const result = await fetchData.fetchOption(option.Symbol,option.Expiry,option.StrikePrice,option.Token,"NFO",broker)
                    console.log(result)
                    setContractPrice(result)
                }
            })
        }
    },[selectedContract])

    function handleDateChange(event) {
        const start = new Date().getTime()
        const payOffDate = new Date(event.target.value);
        if (payOffDate - start + 1000 * 60 * 60 * 24 >0){
            setSelectedDate(event.target.value)
            if (!isNaN(payOffDate)) {
                const differenceInMilliseconds =  payOffDate - start;
                const daysDifference = parseInt(differenceInMilliseconds / (1000 * 60 * 60 * 24));          
                setDTE(daysDifference)
            }
            else {
                setDTE(0)
            }
        }
    }

    function handleBS(event) {
        setBS(event.target.value)
    }

    function handleLotMinus(){
        const value = (lots-1);
        if(value > 0){
            setLots(value)
        }
    }

    function handleLotPlus(){
        const value = lots+1;
        setLots(value)
    }    

    function handleLot(event) {
        const value = parseInt(event.target.value)
        if(!isNaN(value)){
            if(value > 0 ){
                setLots(value)
            }
        }
    }

    function handleSubmit() {
        console.log(
            {
                stock: selectedStock,
                PC: PC,
                expiry: selectedExpiry,
                strike: selectedContract,
                lotSize: lotSize,
                lots: lots,
                bs:BS,
            }
        )
        setContractList((oldData) => {
            return [
                ...oldData,
                {
                    stock: selectedStock,
                    PC: PC,
                    expiry: selectedExpiry,
                    strike: selectedContract,
                    lotSize: lotSize,
                    lots: lots,
                    bs:BS,
                    lp:contractPrice,
                }
            ]
        })
    }

    return(
        <div>
            <div className='top'>
            </div>
            <div className='selector'>
                <Dropdown options = {optionStock} selectedOption={selectedStock} setSelectedOption = {setSelectedStock} name = "Stock/Index" defaultt = 'NIFTY'/>
                <div style = {{display: 'flex',flexFlow:'wrap', marginBottom:'20px'}}>
                    <div style = {{display: 'flex',flexFlow:'wrap',marginRight: 'auto'}}>
                        <ColouredBox color = 'rgb(104, 247, 255)' content = {'Spot Price: '+ stockPrice}  />
                        <ColouredBox color = 'pink' content = {'Lot Size: ' + lotSize} />
                        <ColouredBox color = 'lightgreen' content = {'Futures Price: ' + futPrice} />
                        <ColouredBox color = '#ffe14a' content = {'DTE: ' + dte} />
                    </div>
                    <div style = {{marginTop: '20px'}}>
                        <label htmlFor="datepicker">Select a date:  </label>
                        <input 
                            type="date" 
                            id="datepicker" 
                            value={selectedDate} 
                            onChange={handleDateChange} 
                            style={{padding: '5px'}}
                        />
                    </div>
                </div>
                <hr />
                <div style = {{display: 'flex',flexFlow:'wrap',justifyContent: 'space-between',marginTop: '20px'}}>
                    <Dropdown options = {["PE","CE"]} selectedOption={PC} setSelectedOption = {setPC} name = "Option Type" defaultt = 'PE'/>
                    <Dropdown options = {expiry} selectedOption={selectedExpiry} setSelectedOption = {setSelectedExpiry} name = "expiry" defaultt = {selectedExpiry}/>
                    <Dropdown options = {(PC === "PE") ? PEcontracts : CEcontracts} selectedOption={selectedContract} setSelectedOption = {setSelectedContract} name = " a strike" />           
                </div>
                <div style = {{display: 'flex',flexFlow:'wrap',marginTop: '20px',alignItems:'center',justifyContent: 'space-between'}}>
                    <div className='radio' style = {{display: 'flex',flexFlow:'wrap'}}>
                        <label className="radio-label">
                            <input
                            type="radio"
                            value="Buy"
                            className='radio-dot'
                            checked={BS === 'Buy'}
                            onChange={handleBS}
                            />
                            <div style = {{marginLeft: '10px'}}>Buy</div>
                        </label>

                        <label className="radio-label">
                            <input
                            type="radio"
                            value="Sell"
                            className='radio-dot'
                            checked={BS === 'Sell'}
                            onChange={handleBS}
                            />
                            <div style = {{marginLeft: '10px'}}>Sell</div>
                        </label>    
                    </div>
                    <div className='counterLabel'>
                        <div className='counter'>
                            <div className='counterM' onClick={handleLotMinus}>
                                -
                            </div>
                            <input value={lots} className='counterValue' onChange={handleLot}>
                            </input>
                            <div className='counterP' onClick={handleLotPlus}>
                                +
                            </div>
                        </div>  
                        <label htmlFor="counter" className='dropdown--text'>Lot Qty:  </label>
                    </div>       
                    <ColouredBoxMod color = 'lightgrey' content1 = 'Option Price:  ' content2 = {contractPrice} />                       
                </div>
                <div style = {{display: 'flex',flexFlow:'wrap',marginTop: '0px',alignItems:'center',justifyContent: 'right'}}>
                    <div className='submitText' onClick={handleSubmit}>Add Position</div>                 
                </div>
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
        
            </div>
        </div>
    )
}

export default Home;