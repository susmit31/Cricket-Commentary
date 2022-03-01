const pup = require('puppeteer');
const cp = require('child_process');

const NO_GAME = "Sorry, no games today";

const getnews = async()=>{
    const browser = await pup.launch();
    const pg = await browser.newPage();
    await pg.goto('https://www.espncricinfo.com');

    outputs = await pg.evaluate(()=>{
        let matches = document.querySelectorAll('div.match-info');
        // let teams = document.querySelectorAll('div.team');
        let bd_matches = Array.from(matches).filter(team=>team.innerText.search("BAN")!=-1);
        return bd_matches.map(game =>{
            let teams = Array.from(game.querySelectorAll('.team')).map(team=>team.innerText);
            teams = teams.map(team=>team.split('\n')).map(team=>team.filter(x=>x!="").join(" "));
            let scores = Array.from(game.querySelectorAll('.score')).map(score=>score.innerText);
            let result = game.querySelector('.status-text').innerText;
            return {teams:teams, scores:scores, result:result};
        })
    })
    outputs.forEach(output=>{
        output.teams.forEach(team=>{
            console.log(team);
        });
        console.log(output.result);
        cp.exec(`espeak -p 80 -s 140 "${output.result}"`);
    });
    if (outputs.length==0) cp.exec(`exec ${NO_GAME}`);
    process.exit();
}

getnews();