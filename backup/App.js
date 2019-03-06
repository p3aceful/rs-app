import React, { Component } from 'react';
import './App.css';
import PropTypes from 'prop-types';

class App extends Component {

    constructor(props) {
        super(props);
        this.handleFormAction('p3aceful', 7);
    }

    state = {
        playerData: {},
        playerName: '',
        period: 7,
        flags: {
            tooManyRequests: false,
            playerNotTracked: false,
            playerNotExist: false,
            untouched: true,
            invalidInput: false,
        },
        msg: 'Somebody once told me the world is gonna roll me \n I ain\'t the sharpest tool in the shed \n She was looking kind of dumb with her finger and her thumb \n' +
            '\nin the shape of an "L" on her forehead\nWell the years start coming and they don\'t stop coming\nFed to the rules and I hit the ground running' + 
            '\nDidn\'t make sense not to live for fun\nYour brain gets smart but your head gets dumb\nSo much to do, so much to see\nSo what\'s wrong with taking the back streets?\n ' +
        '\nYou\'ll never know if you don\'t go \nYou\'ll never shine if you don\'t glow\nHey now, you\'re an all-star, get your game on, go play\nHey now, you\'re a rock star, get the show on, get paid '+
        '\nAnd all that glitters is gold\nOnly shooting stars break the mold\nIt\'s a cool place and they say it gets colder\nYou\'re bundled up now, wait till you get older\nBut the meteor men beg to differ'+
        '\nJudging by the hole in the satellite picture\nThe ice we skate is getting pretty thin\nThe water\'s getting warm so you might as well swim\nMy world\'s on fire, how about yours?'+
        '\nThat\'s the way I like it and I never get bored\nHey now, you\'re an all-star, get your game on, go play\nHey now, you\'re a rock star, get the show on, get paid\nAll that glitters is gold'+
        '\nOnly shooting stars break the mo\nHey now, you\'re an all-star, get your game on, go play\nHey now, you\'re a rock star, get the show, on get paid\nAnd all that glitters is gold\nOnly shooting stars'+
        '\nSomebody once asked could I spare some change for gas?\nI need to get myself away from this place\nI said yep what a concept\nI could use a little fuel myself\nAnd we could all use a little change'+
        '\nWell, the years start coming and they don\'t stop coming\nFed to the rules and I hit the ground running\nDidn\'t make sense not to live for fun\nYour brain gets smart but your head gets dumb'+
        '\nSo much to do, so much to see\nSo what\'s wrong with taking the back streets?\nYou\'ll never know if you don\'t go (go!)\nYou\'ll never shine if you don\'t glow\nHey now, you\'re an all-star, get your game on, go play'+
        '\nHey now, you\'re a rock star, get the show on, get paid\nAnd all that glitters is gold\nOnly shooting stars break the mold\nAnd all that glitters is gold\nOnly shooting stars break the mold',
    }

    serverRequest = (name, period) => {
        return fetch(`http://localhost:5000/api/player/${name}?period=${period}`)
            .catch(err => {
                throw new Error('Server is not respondodo.');
            });
    }

    serverUpdateRequest = name => {
        return fetch(`http://localhost:5000/api/player/${name}`, {method: 'POST'})
            .catch(err => {
                throw new Error('Server is not respondodo.');
            });
    }

    handleFormAction = async (input, period) => {
        try {

            if (input.length === 0) {

                this.setState({
                    playerData: {},
                        playerName: input,
                        msg: 'Invalid name',
                        flags: {
                            tooManyRequests: false,
                            playerNotTracked: false,
                            playerNotExist: false,
                            untouched: false,
                            invalidInput: true,
                        },
                        period,
                });
                return;
            }

            const response = await this.serverRequest(input, period);

            console.log(response);
            if (response.status === 200) {

                const json = await response.json();

                this.setState(
                    {
                        playerData: json.data,
                        playerName: input,
                        msg: json.msg,
                        flags: {
                            tooManyRequests: false,
                            playerNotTracked: false,
                            playerNotExist: false,
                            untouched: false,
                            invalidInput: false,
                        },
                        period,
                    });
            } else {
                const json = await response.json();

                console.log(json);

                this.setState(
                    {
                        playerData: {},
                        playerName: input,
                        msg: json.msg,
                        flags: {
                            tooManyRequests: false,
                            playerNotTracked: true,
                            playerNotExist: false,
                            untouched: false,
                            invalidInput: false,
                        },
                        period,
                    });
            }

        } catch (error) {
            console.error(error);
            this.setState({playerData: {}, playerName: '', period, msg: error.message});
        } 
    }

    changePeriod = period => {
        this.handleFormAction(this.state.playerName, period);
    }

    doUpdateRequest = async () => {
        try {
            const result = await this.serverUpdateRequest(this.state.playerName);
            const json = await result.json();

            if (result.status === 200) {
                
                this.setState(
                    {
                        playerData: json.data,
                        msg: json.msg,
                        period: 7,
                        flags: {
                            tooManyRequests: false,
                            playerNotTracked: false,
                            playerNotExist: false,
                            untouched: false,
                            invalidInput: false,
                        },
                    });

            } else if (result.status === 429) {
                // Too many requests.
                this.setState(
                    {
                        playerData: {},
                        msg: json.msg,
                        flags: {
                            tooManyRequests: true,
                            playerNotTracked: false,
                            playerNotExist: false,
                            untouched: false,
                            invalidInput: false,
                        },
                    });
            } else if (result.status === 404) {
                
                this.setState(
                    {
                        playerData: null,
                        msg: json.msg,
                        flags: {
                            tooManyRequests: false,
                            playerNotTracked: false,
                            playerNotExist: true,
                            untouched: false,
                            invalidInput: false,
                        },
                    });
            }
        } catch (error) {
            console.error(error);
            this.setState({playerData: {}, playerName: '', period: 10, msg: error.message});
        }

    }

    render() {
        return (
            <div className="container">
                <h1>Rs-app</h1>
                <SearchBar onSubmit={this.handleFormAction}/>
                <Content appState={this.state} changePeriod={this.changePeriod} doUpdateRequest={this.doUpdateRequest} />
            </div>     
        );
    }
}

function Content(props) {

    const hasWarning = Object.keys(props.appState.flags).some(x => props.appState.flags[x]);

    if (hasWarning) {
        return <InformationDisplay appState={props.appState} changePeriod={props.changePeriod} doUpdateRequest={props.doUpdateRequest} />;
    } else {
        return <PlayerContext appState={props.appState} changePeriod={props.changePeriod} doUpdateRequest={props.doUpdateRequest} />;
    }
}

function PlayerContext(props) {

    const handleClick = n => props.changePeriod(n);

    const { playerData, period, msg } = props.appState;
 
    const data = Object.keys(playerData).length === 0 && playerData.constructor === Object ? <p>No data, try to update!</p> : <PlayerDataDisplay playerData={playerData} period={period}/>;


    return (
        <div>
            <button onClick={() => handleClick(365)}>Last year</button>
            <button onClick={() => handleClick(31)}>Last month</button>
            <button onClick={() => handleClick(7)}>Last week</button>
            <button onClick={() => handleClick(1)}>Last day</button>
            <button onClick={() => props.doUpdateRequest()}>Update!</button>
            <p>{msg}</p>
            {data}
        </div>
    );
}

function PlayerDataDisplay(props) {

    const color = number => {
        if (number > 0) return "green";
        else if (number < 0) return "red";
        else return "";
    }

    const rankColor = number => {
        if (number > 0) return "red";
        else if (number < 0) return "green";
        else return "";
    }

    const prefix = number => {
        if (number > 0) return '+' + number;
        else if (number < 0) return '-' + number;
        else return number;
    }

    const rankPrefix = number => {
        if (number > 0) return '-' + Math.abs(number);
        else if (number < 0) return '+' + Math.abs(number);
        else return Math.abs(number);
    }

    return <div>
        <p>Showing gains for last {props.period} days</p>
        <table>
            <thead>
                <tr>
                    <th>Skill</th>
                    <th>XP</th>
                    <th>Rank</th>
                    <th>Level</th>
                </tr>
            </thead>
            <tbody>
                {
                    Object.keys(props.playerData).map(key => {
                        return (
                            <tr key={key}>
                                <td>{key}</td>
                                <td className={color(props.playerData[key].xp)}>{prefix(props.playerData[key].xp)}</td>
                                <td className={rankColor(props.playerData[key].rank)}>{rankPrefix(props.playerData[key].rank)}</td>
                                <td className={color(props.playerData[key].level)}>{prefix(props.playerData[key].level)}</td>
                            </tr>
                        );
                    })
                }
            </tbody>
        </table>
    </div>;
}



function InformationDisplay(props) {
    const { flags, msg } = props.appState;

    if (flags.tooManyRequests) {
        return (
            <div>
                <p>{msg}</p>
                <p>Click <a onClick={() => props.doUpdateRequest()}>HERE</a> to try again.</p>
                <p>Click <a onClick={() => props.changePeriod(7)}>HERE</a> to go back.</p>
            </div>
        );
    }
    else if (flags.playerNotTracked) {
        return (
            <div>
                <p>{msg}</p>
                <p>Click <a onClick={() => props.doUpdateRequest()}>HERE</a> to start tracking this guy.</p>
            </div>
        );
    }
    else if (flags.playerNotExist || flags.invalidInput) {
        return (
            <div>
                <p>{msg}</p>
                <p>If you feel this is wrong please contact your nearest police department for further investigation.</p>
            </div>
        );
    }
    else if (flags.untouched) {
        const lyrics = msg.split('\n').map((line, n) => <p key={n} >{line}</p>);
        return (
            <div>
                <p>Track your progress in RuneScape!</p>
                <p>Here are the lyrics to the song "All Star" by the popular music group "Smash Mouth".</p>
                {lyrics}
            </div>
        );
    }
    return (
        <div>
            <p>{msg}</p>
        </div>
    );
}


class SearchBar extends Component {
    state = {
        input: '',
    }

    static propTypes = {
        onSubmit: PropTypes.func, 
    }
    
    handleChange = event => {
        this.setState({input: event.target.value});
    }

    handleSubmit = event => {
        event.preventDefault();
        this.props.onSubmit(this.state.input, 10);
    }

    render = () => {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Name:
                    <input placeholder="Enter a name..." type="text" value={this.state.input} onChange={this.handleChange} />

                </label>
                <input type="submit" value="Submit" />
            </form>
        );
    }
}

export default App;
