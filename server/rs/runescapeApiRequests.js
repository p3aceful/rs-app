const request = require('request-promise');
const skills = require('./skills.json');

const getURLWithName = name => {
    return `http://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${name}`;
}

const createPlayerObject = csv => {

    // slice only relevant skills on lines 0 to 24 
    const lines = csv.split('\n').slice(0, 24);

    const _skills = lines.map((line, index) => {
        const [rank, level, xp] = line.split(',');
        return {
            [skills[index]]: { rank, level, xp, }
        }
    });

    return Object.assign({}, ..._skills);
}

module.exports.getPlayerStats = async (name) => {
    try {
        const csv = await request(getURLWithName(name));
        return createPlayerObject(csv);
    } catch (error) {
        console.log( `Unable to find ${name} on OldSchool RuneScape hiscores.`);
        return null;
    }
}