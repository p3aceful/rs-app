const fetch = require('node-fetch');

const getUrl = name => {
    return `http://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${name}`;
}

const skills = {
    0: 'total',
    1: 'attack',
    2: 'defence',
    3: 'strength',
    4: 'hitpoints',
    5: 'range',
    6: 'prayer',
    7: 'magic',
    8: 'cooking',
    9: 'woodcutting',
    10: 'fletching',
    11: 'fishing',
    12: 'firemaking',
    13: 'crafting',
    14: 'smithing',
    15: 'mining',
    16: 'herblore',
    17: 'agility',
    18: 'thieving',
    19: 'slayer',
    20: 'farming',
    21: 'runecrafting',
    22: 'hunter',
    23: 'construction',
};

const createPlayerObject = string => {
    const statParts = string.split('\n'); // Nice
    skillParts = statParts.slice(0, 24);

    const skillObjects = skillParts.map((part, index) => {
        const rankLevelXP = part.split(',');
        return {
            [index]: {
                rank: rankLevelXP[0],
                level: rankLevelXP[1],
                xp: rankLevelXP[2],
            }
        }
    });

    const obj = Object.assign({}, ...skillObjects);

    return skillIdToName(obj);
}

const skillIdToName = obj => {
    const skillsarr = Object.keys(obj).map(key => {
        return {
            [skills[key]]: obj[key]
        }
    });
    const derp = Object.assign({}, ...skillsarr);
    return derp;
}

const lookupPlayerAtRuneScapeAPI = name => {
    return fetch(getUrl(name))
        .then(res => {
            if (res.status === 404) return null;
            return res.text();
        });
}

const lookupPlayerStats = async name => {
    const result = await lookupPlayerAtRuneScapeAPI(name)

    if (result === null) return null;

    return createPlayerObject(result);
}

module.exports.lookup = lookupPlayerStats;