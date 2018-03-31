const getRelevantDatapoints = (data, timePeriod, date, comparator) => {
    const millis = date.getMilliseconds();

    const relevantDatapoints = data.datapoints.filter(datapoint => {
        return comparator(datapoint.date, now - millis);
    });
    return relevantDatapoints;
}

const lt = (a, b) => {
    return a < b;
}

const gt = (a, b) => {
    return a > b;
}

const calculateProgress = function (data, timePeriod) {
    const now = new Date();

    const within = getRelevantDatapoints(data, timePeriod, now, gt);
    const outside = getRelevantDatapoints(data, timePeriod, now, lt);

    if (datapointsOutsideTimePeriod.length === 0) {
        // Calc stoof
        const first = datapointsWithinTimePeriod.shift();
        const last = datapointsWithinTimePeriod.pop();
        const diff = difference(first.skills, last.skills)
        return diff;
    }
    else {
        // Calc stoooffs
        const first = datapointsOutsideTimePeriod.pop();
        const last = datapointsWithinTimePeriod.pop();
        const diff = difference(first.skills, last.skills)
        return diff;
    }
}

const difference = (first, last) => {
    let mutable = JSON.parse(JSON.stringify(last));

    for (const key in last) {
        mutable[key].level -= first[key].level;
        mutable[key].xp -= first[key].xp;
        mutable[key].rank -= first[key].rank;
    }
    return mutable;
}

const hasDatapoints = (data) => {
    return data.datapoints.length > 1;
}

const hasDatapointsWithinPeriod = (data, period, date) => {
    const result = hasDatapointsWithinPeriod(data, period, date, gt);
    return result.length !== 0;
}

module.exports.calculateProgress = calculateProgress;
module.exports.hasDatapointsWithinPeriod = hasDatapointsWithinPeriod;
module.exports.hasDatapoints = hasDatapoints;