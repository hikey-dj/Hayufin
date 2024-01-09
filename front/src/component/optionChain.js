import React, { useEffect } from 'react';
import * as fetchData from './fetchData';

const MarginBox = (props) => {
    const {color,hoverColor,bgclr,content,clickedExpiry,setClickedExpiry} = props;
    const [hover,setHover] = React.useState(false);

    const style = {
        transitionDuration: '100ms',
        backgroundColor: (clickedExpiry === content) ? bgclr : 'white',
        fontWeight: (clickedExpiry === content) ? '500' : hover ? '500' : '400' , 
        border: (clickedExpiry === content) ? '3px solid '+ color : hover ? '3px solid '+ hoverColor : '3px solid '+ color,
        padding: '8px 15px 8px 15px',
        marginRight: '10px',
        minWidth: '100px',
        borderRadius: '2px',
        marginTop: '20px'
    }

    const innerStyle = {
        fontSize : '14px',
        marginTop: '0px',
        marginBottom: '0px'
    }

    function handleMouseEnter(){
        setHover(true)
    }

    function handleMouseLeave(){
        setHover(false)
    }

    function handleClick(){
        setClickedExpiry(content)
    }
    return (
        <div className = 'marginBox' style = {style} 
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}>
            <p style = {innerStyle}>{content}</p>
        </div>
    )
}

export default function OptionChain(props) {
    const {selectedStock, expiry,stockPrice,lotSize,contractList,setContractList} = props.data;
    const [expiryBoxes,setExpiryBoxes] = React.useState([]);
    const [clickedExpiry,setClickedExpiry] = React.useState('');
    const [chain,setChain] = React.useState([]);
    const [isOpen,setOpen] = React.useState(false);
    const [spot,setSpot] = React.useState(-1);

    useEffect( () => {
        setClickedExpiry('')
        setChain([])
        const Expiry = sortExpiry(expiry);
        const Boxes = []
    
        let count = 0;
        Expiry.map((expir) => {
            if(count <8){
                Boxes.push(expir)
                count++;
            }
        }) 
        setExpiryBoxes(Boxes);       
    },[expiry])

    useEffect( () => {
        if(clickedExpiry){
            fetchData.fetchChain(selectedStock,clickedExpiry,'8',stockPrice)
            .then(res => {
                res.sort((a,b) => a.strprc - b.strprc)
                let min=Infinity,minidx=-1;
                res.map((values,idx) => {
                    if(Math.abs(Number(values.strprc)-stockPrice)<min){
                        console.log("Hit");
                        minidx = idx;
                        min = Math.abs(Number(values.strprc)-stockPrice);
                    }
                })
                setSpot(minidx);
                setChain(res)
            })

        }
    },[clickedExpiry])

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
        return sortedExpiry
    }

    function handleOpen() {
        setOpen(!isOpen)
    }

    function handleSubmit(data){
        setContractList((oldData) => {
            return [
                ...oldData,
                {
                    ...data,
                    expiry:clickedExpiry,
                    stock:selectedStock,
                    lots:1,
                    lotSize:lotSize,
                }
            ]
        })
    }

    return(
        <div>
        <div className='chain'>
            <div className='chainTitle' ><div></div><div style = {{justifySelf:'center'}}>&nbsp;&nbsp;&nbsp;&nbsp;Option Chain</div><div style = {{justifySelf:'right',maxWidth: '10px',color:'#8f8f8f',paddingRight:'5px'}} onClick={handleOpen}> {isOpen ? '▲' : '▼'} </div></div>
                <div className={isOpen ? 'chainPeek' : 'chainHide'}>
                    <div className='expiry-flex'>
                        {expiryBoxes.map((expir) => {
                            return <MarginBox color = '#29d329' bgclr = '#ebffea' hoverColor = '#4fff4f' content = {expir} clickedExpiry = {clickedExpiry} setClickedExpiry = {setClickedExpiry}/>
                        })}
                    </div>                    
                    <div className='chainHeader'>
                        <div>
                            Put LTP
                        </div>
                        <div>
                            Strike Price
                        </div>
                        <div>
                            Call LTP
                        </div>                                
                    </div>
                    <div className='chainOptions'>
                        {
                            chain ? chain.map((values,idx) => {
                                return (
                                    <div>
                                        <div className='chainElements' id={values.strprc} style={(idx === spot) ? {backgroundColor:'#f1e77579'} : {backgroundColor:'white'}}>
                                            <div className='chainPut'>
                                                {values.putLp}
                                                <div className='chainBuySell'>
                                                    <div className='chainBuy' onClick = {() => {handleSubmit({bs:'Buy',PC:'PE',strike:(String(Number(values.strprc))),lp:values.putLp})}}>
                                                        B
                                                    </div>          
                                                    <div className='chainSell' onClick = {() => {handleSubmit({bs:'Sell',PC:'PE',strike:(String(Number(values.strprc))),lp:values.putLp})}}>
                                                        S
                                                    </div>                   
                                                </div>                                                                   
                                            </div>                                           
                                            <div className='chainStrike'>
                                                {values.strprc} 
                                            </div> 
                                            <div className='chainCall'>
                                                <div className='chainBuySell'>
                                                    <div className='chainSell' onClick = {() => {handleSubmit({bs:'Sell',PC:'CE',strike:(String(Number(values.strprc))),lp:values.callLp})}}>
                                                        S
                                                    </div>                                                    
                                                    <div className='chainBuy' onClick = {() => {handleSubmit({bs:'Buy',PC:'CE',strike:(String(Number(values.strprc))),lp:values.callLp})}}>
                                                        B
                                                    </div>                             
                                                </div>                                                
                                                {values.callLp}
                                            </div>
                                        </div>
                                        <hr />
                                    </div>
                                )
                            }) : ''
                        }
                    </div>
                </div>
        </div>
        </div>
    )
}