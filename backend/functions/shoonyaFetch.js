const {durai} = require('./cred.js').authParam
const Api = require('../dependencies/ShoonyaApi-js/lib/RestApi');
const otplib = require('otplib');
const axios = require('axios');
let api = new Api({});
let sUserToken = '';



/* From NSE website */

// Urls for fetching Data
const url_oc = 'https://www.nseindia.com/option-chain';
const url_bnf = '/api/option-chain-indices?symbol=BANKNIFTY';
const url_nf = '/api/option-chain-indices?symbol=NIFTY';
const url_indices = '/api/allIndices';

// Headers
const headers = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
  'accept-language': 'en,gu;q=0.9,hi;q=0.8',
  'accept-encoding': 'gzip, deflate, br',
};

let cookies = {};

setCookie()
setInterval(() => {setCookie()},100000)

// Local methods
async function setCookie() {
  const response = await axios.get(url_oc, { headers, timeout: 5000 });
  cookies = response.headers['set-cookie'];
}

async function getData (url) {
  //await setCookie();

  try {
    const response = await axios.get(url, {
      headers: {
        ...headers,
        Cookie: cookies,
      },
      timeout: 5000,
    });

    if (response.status === 401) {
      //await setCookie();
      const updatedResponse = await axios.get('https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY', {
        headers: {
          ...headers,
          Cookie: cookies,
        },
        timeout: 5000,
      });

      if (updatedResponse.status === 200) {
        return updatedResponse.data;
      }
    } else if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error(error.message);
    return '';
  }
};


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

//Redundant functions making the same fetch [TO BE FIXED]

const fetchPrice = async (stock,exchange) => {
    let priceResult;
    if(stock === 'NIFTY' || stock === 'FINNIFTY' || stock === 'MINCPNIFTY' || stock === 'BANKNIFTY'){
        const res = await getData('https://www.nseindia.com/api/quote-derivative?symbol=' + stock);
        const stocks = res.stocks;

        priceResult = {lp: res.underlyingValue}
    }
    else{
        const res = await getData('https://www.nseindia.com/api/quote-derivative?symbol=' + stock);
        priceResult = {lp: res.underlyingValue}
    }
    return priceResult
}

const fetchFut = async (stock,stockToken,exchange) => {
    let priceResult = {lp:0};
    if(stock === 'NIFTY' || stock === 'FINNIFTY' || stock === 'MINCPNIFTY' || stock === 'BANKNIFTY'){
        const res = await getData('https://www.nseindia.com/api/quote-derivative?symbol=' + stock);
        res.stocks.map((ele) => {
            if(ele.metadata.instrumentType === "Index Futures") priceResult = {lp: ele.metadata.lastPrice}
        })
    }
    else{
        const res = await getData('https://www.nseindia.com/api/quote-derivative?symbol=' + stock);
        res.stocks.map((ele) => {
            if(ele.metadata.instrumentType === "Stock Futures") priceResult = {lp: ele.metadata.lastPrice}
        })
    }
    console.log(priceResult)
    return priceResult    
}

const fetchOpt = async (stock,expiry,strike,stockToken,exchange) => {
    const priceResult = await api.get_quotes(exchange,stockToken)
    let result;
    if(priceResult) result = priceResult.lp
    else result = 0
    return priceResult
    /*console.log(stock,strike,expiry)
    let priceResult = {lp:0};
    if(stock === 'NIFTY' || stock === 'FINNIFTY' || stock === 'MINCPNIFTY' || stock === 'BANKNIFTY'){
        const res = await getData('https://www.nseindia.com/api/quote-derivative?symbol=' + stock);
        res.stocks.map((ele) => {
            if(ele.metadata.instrumentType === "Index Options" && (ele.metadata.expiryDate).toUpperCase() === expiry && String(ele.metadata.strikePrice) === strike) {
                priceResult = {lp: ele.metadata.lastPrice}
            }
        })
    }
    else{
        const res = await getData('https://www.nseindia.com/api/quote-derivative?symbol=' + stock);
        res.stocks.map((ele) => {
            console.log((ele.metadata.expiryDate).toUpperCase())
            if(ele.metadata.instrumentType === "Stock Options" && (ele.metadata.expiryDate).toUpperCase() === expiry && ele.metadata.strikePrice === strike)  {
                priceResult = {lp: ele.metadata.lastPrice}
            }
        })
    }
    console.log(priceResult)
    return priceResult    */
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