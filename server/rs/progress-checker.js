module.exports.calculateProgress = (datapoints) => {

    const first = datapoints[0].skills;
    const last = datapoints[datapoints.length - 1].skills;

    for (const key in last) {
        last[key].level -= first[key].level;
        last[key].xp -= first[key].xp;
        last[key].rank = (last[key].rank - first[key].rank) * -1;
    }
    return { skills: last };
}

module.exports.hasDatapointsWithinPeriod = (data, period) => {
    const now = new Date();
    const then = now - daysToMilliseconds(period);

    return data.some(datapoint => {
        return datapoint.time >= then;
    });
}


module.exports.getDatapointsWithinPeriod = (datapoints, period) => {
    const now = new Date();
    const predicate = datapoint => datapoint.time > (now - daysToMilliseconds(period));
    return datapoints.filter(predicate);
}

const daysToMilliseconds = days => {
    return days * 24 * 60 * 60 * 1000;
}