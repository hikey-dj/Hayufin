const express=require("express");
const app = express();
const path = require('path');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const fetchMaster = require('./functions/masterData.js');
const fetchData = require('./functions/fetchData.js');

const uri = "mongodb+srv://hikey:nothing@clusterf.lhzk7xk.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: false,
    }
});

client.connect();

app.use(cors());
app.use(bodyParser.json())


// Execute all operations -- masterData.js
let uniqueSymbols;
//fetchMaster(client).then(() =>{
    fetchData.getUnique(client).then(res => {
        uniqueSymbols = res
    });
//});
fetchData.login().then( () => {
});


app.post('/sreq' , async (req,res) => {
    let result;
    switch (req.body.Method) {
        case 'fetchPrice':
            result = await fetchData.fetchPrice(req.body.Stock,req.body.Exchange)
            break;
        case 'fetchFut':
            result = await fetchData.fetchFut(req.body.Stock,req.body.Token,req.body.Exchange)
            break; 
        case 'fetchOpt':
            result = await fetchData.fetchOpt(req.body.Stock,req.body.Expiry,req.body.Strike,req.body.Token,req.body.Exchange)
            break;             
        case 'fetchChain':
            const db = client.db('Hayufin'); 
            const collection = db.collection('masterData');
            const resultOPT = await collection.find({$or : [{Symbol : req.body.Symbol, Expiry : req.body.Expiry, Instrument: 'OPTSTK'},{Symbol : req.body.Symbol, Expiry : req.body.Expiry, Instrument: 'OPTIDX'}]}).toArray();            
            const tsym = resultOPT[0].TradingSymbol
            console.log(tsym)
            result = await fetchData.fetchChain(tsym,'NFO',req.body.Strprc,req.body.Cnt);
            break;
        default:
            break;
    }
    console.log(result)
    res.json(result)
})
app.post('/optionStock' , (req,res) => {
    res.json(uniqueSymbols)
})

app.post('/optionContracts' , (req,res) => {
    async function findit() {
        const db = client.db('Hayufin'); 
        const collection = db.collection('masterData');

        const resultOPT = await collection.find({$or : [{Symbol : req.body.Symbol, Instrument: 'OPTSTK'},{Symbol : req.body.Symbol, Instrument: 'OPTIDX'}]}).toArray();
        const resultFUT = await collection.find({$or : [{Symbol : req.body.Symbol, Instrument: 'FUTSTK'},{Symbol : req.body.Symbol, Instrument: 'FUTIDX'}]}).toArray();
        const result = {
            OPT : resultOPT,
            FUT : resultFUT
        }
        res.json(result)
    }
    findit()
})

PORT=5000;

app.use(express.static(path.join(__dirname, 'data')));
app.use(express.json());


let UserData =null;

app.post('/UserData', (req,res) => {
    res.json(UserData);
})


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`); 
  });
  