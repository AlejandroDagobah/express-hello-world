const express = require('express')
const app = express();
const { Client } = require('@notionhq/client')
const cors = require('cors')
const path = require('path')
const router = express.Router()

var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

const corsOptions ={
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
 }
 
 app.use(cors(corsOptions)) // Use this after the variable declaration

 app.use(function (req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    next()
})


const PORT = process.env.PORT || 3001;


app.use(express.static(path.join(__dirname, '/')));

router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'))
    
})

app.use('/', router)


app.listen(PORT, function name() {

    console.log("Starting proxy at: " + PORT);
    
})


app.get('/', function (req, res) {
    request(
        {url: 'https://api.chess.com/pub/player/sami181'},
        (error, response, body) => {
            if (error || response.statusCode !== 200) {
                return res.status(500).json({ type: 'error', message: err.message });
            }

            res.json(JSON.parse(body))
        }
    )
    
})

const notion = new Client({auth: "secret_Q9yioL3FNmSl7AsFL8JKwkeoUoUnoV8jsIJHfRxlZIM"});

const databaseid = "7b1833b8cd2844fe880b6c2437910d3f";


async function queryDB(gameUrl) {
    const response = await notion.databases.query({
        database_id: databaseid,
        filter: {
            or: [
                {
                    property: 'Link',
                    url: {
                        contains: gameUrl,
                    },
                }
            ],
        }
    });

    return response
}

async function postInDB(game) {

    const response = await notion.pages.create({
        parent: {database_id: databaseid},
        properties:{
            "Game":{
                title:[
                    {
                        text:{
                            content: game.gameTitle
                        }
                    }
                ]
            },
            "Winner":{
                select:{
                    
                    name: game.winnerPlayer

                }
                
            },
            "Defeated":{
                select:{
                    
                    name: game.defeatedPlayer

                }
                
            },
            "Date":{

                date:{
                    
                    start: game.date, //"2022-10-29T11:00:00.000-04:00"
                    time_zone: "America/Guayaquil"
                }
                
            },
            "Termination":{
                select:{
                    
                    name: game.termination

                }
            },
            "Link":{
                url: game.url
            },
            "White Player":{
                select:{
                    
                    name: game.whitePlayer

                }
                
            },
            "Black Player":{
                select:{
                    
                    name: game.blackPlayer

                }
                
            }
        }
    })
    
}


app.post('/', jsonParser, async function (req, res) {

    const game = req.body

    console.log(game)

    if (!game) {
        return res.status(400).send({status: 'failed'})
    }
    res.status(200).send({status: 'recived'})

    try {

        let notionQuery = queryDB(game.url)

        if((await notionQuery).results.length <= 0)
        {
            postInDB(game)
            console.log("SUCCESS")

        }else{

            console.log("UNABLE TO POST BY DUPLICATE")

        }

    } catch (error) {
        console.log(error)
    }
    
})

