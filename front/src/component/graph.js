import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const Graph = (props) => {
    const {contractList,setContractList} = props.data;
    const [payoffData, setPayoffData] = React.useState([])
    const [windowWidth,setWindowWidth] = React.useState(window.screen.width);
    const [params,setParams] = React.useState({
        bp:[],
        high:'',
        low:'',
    })

    function range(start, end, step = 1) {
        return Array.from({ length: Math.ceil((end - start) / step) }, (_, i) => start + i * step);
    };

    function payoff(UV) {
        let payoff=0;
        contractList.map((ele) => {
            if(ele.PC === 'PE'){
                if(ele.bs === 'Buy'){
                    payoff = payoff + (Math.max(ele.strike - UV ,0) - ele.lp)*ele.lots*ele.lotSize;
                }
                else{
                    payoff = payoff + (ele.lp - Math.max(ele.strike - UV ,0))*ele.lots*ele.lotSize;
                }
            }
            else{
                if(ele.bs === 'Buy'){
                    payoff = payoff + (Math.max(UV - ele.strike,0) - ele.lp)*ele.lots*ele.lotSize;
                }
                else{
                    payoff = payoff + (ele.lp - Math.max(UV - ele.strike,0))*ele.lots*ele.lotSize;
                }
            }
        })
        return payoff;
    }    

    useEffect(() => {
        function handleResize() {
            setWindowWidth(window.screen.width);
        }
        setWindowWidth(window.screen.width);
        window.addEventListener('resize',handleResize);
    },[])

    useEffect(() => {
        //Calculating Payoff Data
        //Calculating min and max strikes
        let minStrike=Infinity,maxStrike=0;
        contractList.map((ele) => {
            minStrike = Math.min(minStrike,ele.strike);
            maxStrike = Math.max(maxStrike,ele.strike);
        }) 
        let Range = range(Math.ceil(minStrike - minStrike*1),Math.ceil(maxStrike + maxStrike*1),1);     
        console.log(Range.length);  
        //Calculating breakpoints
        let y_prev = null;
        let breakpoints = [];
        Range.map((x) => {
            const y = payoff(x);
            if(y_prev){
                if (y*y_prev<0) breakpoints.push(x); 
            }
            y_prev=y;
        })
        console.log(breakpoints);
        //Calculating min and max once again
        breakpoints.map((ele) => {
            minStrike = Math.min(minStrike,ele);
            maxStrike = Math.max(maxStrike,ele);            
        })
        const diff = maxStrike - minStrike+10;
        Range = range(Math.ceil(minStrike - diff*0.5),Math.ceil(maxStrike + diff*0.5),Math.ceil((maxStrike-minStrike+1)/1000));
        //Making the data alas
        const data = [];
        let high=-Infinity,low=Infinity;
        Range.map((x) => {
            const y = payoff(x);
            if(y> high) high = y;
            if(y < low) low = y;
            data.push({x:x,y:y});
        })
        console.log(payoff(Range[1]),payoff(Range[0]))
        if( payoff(Range[1])-payoff(Range[0])>0.0001) low = -Infinity;
        else if(payoff(Range[1])-payoff(Range[0])<-0.0001) high = Infinity;
        if(payoff(Range[Range.length-2])-payoff(Range[Range.length-1])>0.0001) low = -Infinity;
        else if(payoff(Range[Range.length-2])-payoff(Range[Range.length-1])<-0.0001) high = Infinity;   
        setParams({
            bp: breakpoints,
            high: high.toFixed(2),
            low: low.toFixed(2),
        })     
        setPayoffData(data);
    },[contractList])

    function handleDelete(del) {
        setContractList((old) => {
            let newData = [];
            old.map((ele) => {
                if(ele != del) newData.push(ele);
            })
            return newData;
        })
    }

    const LineChart = ({ data }) => {
        const chartRef = useRef(null);
        const myChart = useRef(null);

        useEffect(() => {
          const ctx = chartRef.current.getContext('2d');

          if (myChart.current) {
            myChart.current.destroy();
          }
          myChart.current = new Chart(ctx, {
            type: 'line',
            data: {
              datasets: [
                {
                  label: 'Line Chart Example',
                  data: data,
                  borderColor: "#000000",    
                  pointStyle: false,
                  borderWidth: 1,
                  fill: {
                    target: 'origin',
                    above: '#23d22c97',   // Area will be red above the origin
                    below: '#f91b1b81'    // And blue below the origin
                  }
                },
              ],
            },
            options: {
              scales: {
                x: {
                  type: 'linear',
                  position: 'bottom',
                },
                y: {
                },
              },
            },
          });
        return () => {
            if (myChart.current) {
                myChart.current.destroy();
            }
          };
        }
        , [data]);
      
        return <canvas ref={chartRef} width="100%"></canvas>;
    };
    

    return (
        <div>
            <div className='graph' style = {(windowWidth<500) ? {flexDirection:'column'} : {flexDirection:'row'}}>
                <div className='graphList' style={(windowWidth<500) ? {width:'100%',borderBottom: 'rgb(244, 244, 244) solid 2px'} : {display:'flex',flexDirection:'column',width:'33%',borderRight: 'rgb(244, 244, 244) solid 2px'}}>
                    <div style = {{display:'flex',marginLeft:'3%',marginBottom:'30px'}}>
                        <div style = {{justifySelf:'left'}}>
                            <h3>Positions</h3>
                        </div>
                        <div style = {{margin:'auto'}}>
                        </div>
                    </div>
                    <div>
                        {
                            contractList.map((element) => {                
                                return (
                                    <div style = {{display:'flex',fontFamily: 'Roboto,sans-serif',fontSize:'14px',marginBottom:'20px'}}>
                                        <div style = {(element.bs === 'Buy') ?{minWidth:'20px',marginRight:'20px',height:'20px',backgroundColor:'green',borderRadius:'50%'} : {minWidth:'20px',marginRight:'20px',height:'20px',backgroundColor:'red',borderRadius:'50%'}}>
                                                    
                                        </div>                              
                                            <div style = {{display:'flex', justifyContent:'space-evenly',flexFlow:'wrap'}}>
                                                    <div style = {{display: 'inline',fontWeight:'400',paddingTop:'3px'}}>
                                                        {element.stock}
                                                    </div>
                                                    <div style = {{display: 'inline',fontWeight:'400',paddingTop:'3px'}}>
                                                        &nbsp;&nbsp;&nbsp;{element.expiry}
                                                    </div>     
                                                    <div style = {{display: 'inline',fontWeight:'400',paddingTop:'3px'}}>
                                                        &nbsp;&nbsp;{element.strike}
                                                    </div>           
                                                    <div style = {{display: 'inline',fontWeight:'400',paddingTop:'3px'}}>
                                                        {element.PC}
                                                    </div>                
                                                    <div style = {{display: 'inline',fontWeight:'400',paddingTop:'3px'}}>
                                                        &nbsp;@ {element.lp}
                                                    </div>
                                                    <div style = {{display: 'inline',fontWeight:'600',paddingTop:'3px'}}>
                                                        &nbsp; {element.bs === 'Buy' ? '+' : '-'}{element.lots}x
                                                    </div>                                                                                                                                                                                                                                    
                                            </div>                                        
                                        <div className='deleteIcon' onClick = {() => {handleDelete(element)}} style = {{display: 'inline',marginLeft:'auto',paddingBottom:'3px',paddingLeft:'4px',paddingRight:'4px'}}>
                                                    <i className="material-icons" style = {{fontSize:'21px'}}>delete</i>
                                        </div>                                      
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div style = {{marginTop:'auto',textAlign:'left',marginLeft:'3%',marginRight:'5%'}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}><div style={{fontWeight:'600'}}>Breakevens:</div> <div>{params.bp.map((x,ind) =>{if(ind === params.bp.length-1) return x; else return x+" - ";})}</div></div>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}><div style={{fontWeight:'600'}}>Maximum Profit:</div> <div>{params.high}</div></div>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}><div style={{fontWeight:'600'}}>Maximum Loss:</div> <div>{(-1)*params.low}</div></div>
                    </div>
                </div>
                <div className='graphPlot' style = {(windowWidth<500) ? {width:'100%'} :    {width:'67%'}}>
                    <LineChart data = {payoffData} />
                </div>
            </div>
            <div className="top"></div>
        </div>
    )
}

export default Graph;