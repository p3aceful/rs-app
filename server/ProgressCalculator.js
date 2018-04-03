const debug = false;

const getRelevantDatapoints = (data, timePeriod, date, comparator) => {

    if (debug) {
        console.log('Inside getRelevantDatapoints');
    }

    const millis = daysToMilliseconds(timePeriod);

    const relevantDatapoints = data.datapoints.filter(datapoint => {
        return comparator(datapoint.date, date - millis);
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
    if (debug) {
        console.log('Inside calculateProgress');
    }
    const now = new Date();

    const within = getRelevantDatapoints(data, timePeriod, now, gt);
    const outside = getRelevantDatapoints(data, timePeriod, now, lt);

    if (outside.length === 0) {
        // Calc stoof
        const first = within.shift();
        const last = within.pop();
        const diff = difference(first.skills, last.skills)
        return diff;
    }
    else {
        // Calc stoooffs
        const first = outside.pop();
        const last = inside.pop();
        const diff = difference(first.skills, last.skills)
        return diff;
    }
}

const difference = (first, last) => {

    if (debug) {
        console.log('inside difference');
    }
    let mutable = JSON.parse(JSON.stringify(last));

    for (const key in last) {
        mutable[key].level -= first[key].level;
        mutable[key].xp -= first[key].xp;
        mutable[key].rank -= first[key].rank;
    }
    return mutable;
}

const hasDatapoints = (data) => {
    if (debug) {
        console.log('inside hasDatapoints');
    }
    return data.datapoints.length > 1;
}

const hasDatapointsWithinPeriod = (data, period, date) => {
    if (debug) {
        console.log('inside hasDatapointsWithinPeriod');
    }
    const result = getRelevantDatapoints(data, period, date, gt);
    return result.length !== 0;
}

const daysToMilliseconds = days => {
    return days * 24 * 60 * 60 * 1000;
}
module.exports.calculateProgress = calculateProgress;
module.exports.hasDatapointsWithinPeriod = hasDatapointsWithinPeriod;
module.exports.hasDatapoints = hasDatapoints;