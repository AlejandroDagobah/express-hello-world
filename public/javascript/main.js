const baseUrl = 'https://chess-to-notion.onrender.com'

const inputDate = document.getElementById('input-date')

const currentMonthBtn = document.getElementById('currentMonth')
const customMonthBtn = document.getElementById('customMonth')
const userBtn = document.getElementById('userButton')

const usernames = ['sami181', 'LDGZCH', 'JMGZCH', 'wilkachimbo', 'Zeratul2022', 'jfyoyu777', 'Luligamer1', 'Samueljanu']
const currentDate = new Date();

         
currentMonthBtn.addEventListener('click', function(e) {
    e.preventDefault()

    for (let i = 0; i < usernames.length; i++) {
        const user = usernames[i];
        
        //url to ask https://api.chess.com/pub/player/{username}/games/{YYYY}/{MM}

        userAction(usernames, 'https://api.chess.com/pub/player/' + user.toLowerCase() + '/games/' + currentDate.getFullYear() + '/' + ("0" + (currentDate.getMonth() + 1)).slice(-2))
        
    }

 })

 customMonthBtn.addEventListener('click', function(e) {
    e.preventDefault()

    let dateArray = inputDate.value.split("-")

    for (let i = 0; i < usernames.length; i++) {
        const user = usernames[i];

        userAction(usernames, 'https://api.chess.com/pub/player/' + user.toLowerCase() + '/games/' + dateArray[0] + '/' + dateArray[1]) //url to ask https://api.chess.com/pub/player/{username}/games/{YYYY}/{MM}
               
    }

 })

function subtractHours(date, hours){

    date.setHours(date.getHours() - hours);

    return date;
}

async function userAction(usernames, url) {

    console.log(url)
    const response = await fetch(url)
    const jsonResponse = await response.json();

    let chessGames = jsonResponse.games;

    for (let i = 0; i < chessGames.length; i++) {
        const currentGame = chessGames[i];

        const black = currentGame.black
        const white = currentGame.white

        let pgnArray = currentGame.pgn.split('\n') 

        let id = currentGame.url.substring(32, currentGame.url.length) 
        let date = pgnArray[2].substring(7, pgnArray[2].length - 2)
        let time = pgnArray[19].substring(10, pgnArray[19].length - 2)
        
        var termination = pgnArray[16].substring(14, pgnArray[16].length - 2)
        let terminationNoUser = termination.split(" ");
        let userOfTermination = terminationNoUser.shift()

        const uppercaseWords = str => str.replace(/^(.)|\s+(.)/g, c => c.toUpperCase());

        termination = uppercaseWords(terminationNoUser.join(" ").toString())

        
        var gmt5Date = subtractHours(new Date(date + ' ' + time + ' GMT-5'), 10)
        
        const gameJson = {
            gameId: id,
            gameTitle: '🏆',
            winnerPlayer:'',
            defeatedPlayer: '',
            date: gmt5Date.toISOString(), //no sobreescribir en notion las que ya estan hechas
            termination: termination, // eliminar la primera palabra de la razón de la victoria ej: 'won by checkmate'
            url: currentGame.url,
            whitePlayer: '',
            blackPlayer: ''

        }


        //#region Winner & Defeated conditions

            if(usernames.indexOf(white.username) != -1){
                if(usernames.indexOf(black.username) != -1){

                    if (white.result == 'win') {
                        gameJson.winnerPlayer = "♞ " + white.username
                        gameJson.defeatedPlayer = "♞ " + black.username

                        gameJson.whitePlayer = "♞ " + white.username
                        gameJson.blackPlayer = "♞ " + black.username

                    
                    }else if (black.result == 'win') {
                        gameJson.winnerPlayer = "♞ " + black.username
                        gameJson.defeatedPlayer = "♞ " + white.username
                        
                        gameJson.blackPlayer = "♞ " + black.username
                        gameJson.whitePlayer = "♞ " + white.username
        
                    }else if(white.result == 'stalemate' || black.result == 'stalemate' || white.result == 'insufficient' || black.result == 'insufficient' || white.result == 'agreed' || black.result == 'agreed'){
                        gameJson.winnerPlayer = '❌';
                        gameJson.defeatedPlayer = '❌'

                        gameJson.blackPlayer = "♞ " + black.username
                        gameJson.whitePlayer = "♞ " + white.username
        
                    }
                    
                    //#region Insert on table
    
                        const table = document.getElementById('tabla-registro');
                        
                        table.innerHTML += '<tr><td>'+ gameJson.gameTitle +'</td><td>'+ gameJson.winnerPlayer +'</td><td>'+ gameJson.defeatedPlayer +'</td><td>'+ gameJson.date +'</td><td>'+ gameJson.termination +'</td><td><a href="' + gameJson.url + '">' + gameJson.url + '</a></td><td>'+ gameJson.whitePlayer +'</td><td>'+ gameJson.blackPlayer +'</td></tr>'
    
                        postOnNotion(gameJson)
    
                        
                    //#endregion
    

                }
            }



        //#endregion



    }
    
}

async function getFromChess(){
    const res = await fetch('',
    {
        method: 'GET'
    })
    console.log(res)

}


async function postOnNotion(json) {

    if(json == null){return}

    const res = await fetch(baseUrl, {

        method: 'POST',
        headers:{
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(json)
        
    })
    
}