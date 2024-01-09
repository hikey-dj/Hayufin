const {durai} = require('./cred.js').authParam
const Api = require('../dependencies/ShoonyaApi-js/lib/RestApi');
const otplib = require('otplib');
const axios = require('axios');
let api = new Api({});
let sUserToken = '';

async function getUnique(client) {
    let uniqueSymbols;
    const db = client.db('Hayufin'); 
    const collection = db.collection('masterData'); 
    uniqueSymbols = await collection.distinct('Symbol');
    return uniqueSymbols
}

async function login() {
    let reply;
    await api.login({
        "userid":durai.userid,
        "password":durai.password,
        "twoFA":otplib.authenticator.generate(durai.twoFA),
        "vendor_code":durai.vendor_code,
        "api_secret": durai.api_secret,
        "imei":durai.imei,         
    }).then(res => {
        reply = res;
        sUserToken = reply.susertoken;
    })
}

//Redundant functions making the same fetch

const fetchPrice = async (stock,exchange) => {
    if(stock === "NIFTY") stock = "NIFTY INDEX";
    else if(stock === "MIDCPNIFTY") stock = "NIFTY MID SELECT"
    const result = await api.searchscrip(exchange, encodeURIComponent(stock));
    let minIndex=0;
    if(result.values.length > 1){
        result.values.map((options,index) => {
            if(options.tsym.length < result.values[minIndex].tsym.length){
                minIndex = index;
            }
        })
    }
    const priceResult = await api.get_quotes(exchange,result.values[minIndex].token)

    return priceResult
}

const fetchFut = async (stock,stockToken,exchange) => { 
    const priceResult = await api.get_quotes(exchange,stockToken)
    let result;
    if(priceResult) result = priceResult.lp
    else result = 0
    return priceResult
}

const fetchOpt = async (stock,expiry,strike,stockToken,exchange) => { 
    const priceResult = await api.get_quotes(exchange,stockToken)
    let result;
    if(priceResult) result = priceResult.lp
    else result = 0
    return priceResult
}

const fetchChain = async (stockSymbol,exchange,strikeprice,count) => {
    const start = new Date().getTime();
    const result = await api.get_option_chain(exchange, stockSymbol, strikeprice, count);
    const tokenArray = result.values;
    
    const lpResults = tokenArray.map((element, index) => {
      return api.get_quotes('NFO', element.token);
    });
    
    let quoteResult = [];
    
    try {
      await Promise.all(lpResults)
      .then(res => {return res.map((re) =>{
            if(re.optt === 'PE'){
                const idx = res.findIndex((ele,index) => {
                    return (re.strprc === ele.strprc && ele.optt === 'CE')
                })
                quoteResult.push( {
                    strprc: re.strprc,
                    opt: re.optt,
                    putLp: re.lp,
                    callLp: res[idx].lp
                })
            }
        }
        )
      });
      console.log('Data Assigned');
    } catch (error) {
      console.error(error);
    }
    
    const end = new Date().getTime();
    console.log((end - start) / 1000);
    return quoteResult;
    
}




module.exports = {
    getUnique: getUnique,
    login: login,
    fetchPrice: fetchPrice,
    fetchFut: fetchFut,
    fetchChain: fetchChain,
    fetchOpt: fetchOpt,
}