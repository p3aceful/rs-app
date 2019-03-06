export default (function () {

    const extractJSON = res => res.json();
    const logError = error => console.error(error);

    return {
        getProgress: (name, period) => {
            return fetch(`http://192.168.38.116:5000/api/${name}/${period}`)
                .then(extractJSON)
                .catch(logError);
        },
        sendTrackRequest: (name) => {
            return fetch(`http://192.168.38.116:5000/api/${name}`, { method: 'post' })
                .then(extractJSON)
                .catch(logError);
        },
    };
})();