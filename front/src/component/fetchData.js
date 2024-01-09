import Api from '../ShoonyaApi-js/lib/RestApi';
const otplib = require('otplib');
let api = new Api({});



export const fetchOptionStock = async() => {
    let newres =[]
    await fetch("http://localhost:5000/optionStock",{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json()).then(res => {
        //let newres=[]
        res.map((option) => {
            if(!option.includes("NSETEST")) newres.push(option);
        })
    })    
    return newres;
} 

export const fetchPrice = async (stock,exchange,broker) => {
    let result;
    await fetch("http://localhost:5000/sreq",{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({
            Method: 'fetchPrice',
            Stock : stock,
            Exchange: exchange
        })
    }).then(res => res.json()).then(res => {
        result = res.lp;
    })  
    return result       
}

export const fetchOption = async (stock,expiry,strike,stockToken,exchange,broker) => {
    let result;
    await fetch("http://localhost:5000/sreq",{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({
            Method: 'fetchOpt',
            Stock: stock,
            Expiry: expiry,
            Strike: strike,
            Token: stockToken,
            Exchange: exchange
        })
    }).then(res => res.json()).then(res => {
        result = res.lp;
    })    
    return result     
}

export const fetchFut = async (stock,stockToken,exchange,broker) => {
    let result;
    await fetch("http://localhost:5000/sreq",{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({
            Method: 'fetchFut',
            Stock: stock,
            Token: stockToken,
            Exchange: exchange
        })
    }).then(res => res.json()).then(res => {
        result = res.lp;
    })    
    return result   
}

export const fetchContracts = async (selectedStock) => {
    let result;
    await fetch("http://localhost:5000/optionContracts",{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Symbol : selectedStock
        })
    }).then(res => res.json()).then(res => result = res)
    console.log(result)
    return result
}

export const fetchChain = async (selectedStock,expiry,count,strikePrice) => {
    let result;
    await fetch("http://localhost:5000/sreq",{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Method : 'fetchChain',
            Symbol : selectedStock,
            Expiry : expiry,
            Cnt : count,
            Strprc: strikePrice
        })
    }).then(res => res.json()).then(res => result = res)
    return result
}

export const login = async (param) => {
    let reply;
    await api.login({
        "userid":param.userid,
        "password":param.password,
        "twoFA":otplib.authenticator.generate(param.twoFA),
        "vendor_code":param.vendor_code,
        "api_secret": param.api_secret,
        "imei":param.imei,         
    }).then(res => (reply = res))
    return reply
}
