const verbose = false;

const processData = function (data, timePeriod) {
    return new Promise((resolve, reject) => {
        const now = new Date();
        const timePeriodMillis = timePeriod * 24 * 60 * 60 * 1000;

        const datapointsWithinTimePeriod = data.filter(datapoint => {
            return datapoint.date > now - timePeriodMillis;
        });

        const datapointsOutsideTimePeriod = data.filter(datapoint => {
            return datapoint.date < now - timePeriodMillis;
        });

        if (verbose) {
            datapointsWithinTimePeriod.forEach(point => {
                console.log('Within:', point.date);
            });
            datapointsOutsideTimePeriod.forEach(point => {
                console.log('Outside:', point.date);
            });
        }

        if (datapointsWithinTimePeriod.length + datapointsOutsideTimePeriod.length === 0) {
            reject('This site has literally no data on this player.');
            return;
        }
        else if (!datapointsWithinTimePeriod.length) {
            reject('No datapoints within this period found.');
            return;
        }
        else if (datapointsWithinTimePeriod.length + datapointsOutsideTimePeriod.length < 2) {
            reject('Not enough datapoints to process');
            return;
        }
        else if (datapointsOutsideTimePeriod.length === 0) {
            // Calc stoof
            const first = datapointsWithinTimePeriod.shift();
            const last = datapointsWithinTimePeriod.pop();
            const diff = difference(first.skills, last.skills)
            resolve(diff);
        }
        else {
            // Calc stoooffs
            const first = datapointsOutsideTimePeriod.pop();
            const last = datapointsWithinTimePeriod.pop();
            const diff = difference(first.skills, last.skills)
            resolve(diff);
        }
    });
}

const difference = function calculateDifferenceBetweenDatapoints(first, last) {
    let mutable = JSON.parse(JSON.stringify(last));

    for (const key in last) {
        mutable[key].level -= first[key].level;
        mutable[key].xp -= first[key].xp;
        mutable[key].rank -= first[key].rank;
    }
    return mutable;
}

module.exports.process = processData;