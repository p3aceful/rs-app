import React, { Component } from 'react';
import './App.css';


class App extends Component {

    constructor() {
        super()
        this.state = {
            name: null,
            request: {
                initiated: false,
                resolved: false,
                success: false,
                data: null,
                errMsg: null,
            }
        }
    }

    handleFormChange(name) {
        console.log('Now we got a handleFormChange with arg', name);

        this.setState({ name: name, request: { initiated: true, resolved: false, success: false, data: null, errMsg: null } });
        this.sendServerRequest(name);
    }

    sendServerRequest(name) {
        console.log('Sending server request with', name);
        fetch('http://localhost:5000/api/test/' + name + '?period=7')
            .then(response => {
                if (response.status === 200) {

                    console.log('Got a response and status was ok');

                    response.json().then(json => {
                        this.setState({ name, request: { initiated: false, resolved: true, success: true, data: json, errMsg: null } })
                    });
                }
                else {

                    console.log('Got a response and status was NOT ok');

                    response.text().then(text => this.setState({ name, request: { initiated: false, resolved: true, success: false, errMsg: text, data: null } }));
                }
            });
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">
                        Welcome
                    </h1>
                </header>
                <SearchForm passAlong={(name) => this.handleFormChange(name)} />
                <Player request={this.state.request} />
            </div>
        );
    }
}

class SearchForm extends Component {
    constructor(props) {
        super(props);
        this.state = { value: '' };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.passAlong(this.state.value);
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <input type="text" value={this.state.value} onChange={this.handleChange} placeholder={'Give me a name'} />
                <input type="submit" value="Submit"></input>
            </form>
        );
    }
}

class Player extends Component {

    render() {

        if (!this.props.request.resolved) {
            if (!this.props.request.initiated) {
                return (<p className="status-msg">Waiting for a searcherino</p>);
            }
            else {
                return (<p className="status-msg">Please hang on...</p>);
            }
        }
        else {
            if (this.props.request.success) {
                return (<SkillTable skills={this.props.request.data} />);
            }
            else {
                return (<p className="status-msg">Ooopsie: {this.props.request.errMsg}</p>);
            }
        }
    }
}

class SkillTable extends Component {

    getColorClass(number) {
        if (number < 0) {
            return 'green';
        }
        else if (number > 0) {
            return 'red';
        }
        else {
            return 'normal';
        }
    }

    render() {
        let skills = this.props.skills;

        const data = Object.keys(skills).map(key => {
            const capitalized = key.charAt(0).toUpperCase() + key.slice(1);

            return (
                <tr key={key}>
                    <td>{capitalized}</td>
                    <td className={this.getColorClass(-(skills[key].level))}>{skills[key].level}</td>
                    <td className={this.getColorClass(-(skills[key].xp))}>{skills[key].xp}</td>
                    <td className={this.getColorClass(skills[key].rank)}>{(skills[key].rank > 0 ? "+" : "") + skills[key].rank}</td>
                </tr>
            );
        });
        return (
            <div>
                <table className="App-table">
                    <tbody>
                        <tr>
                            <th>Skill</th>
                            <th>Level</th>
                            <th>XP</th>
                            <th>Rank</th>
                        </tr>
                        {data}
                    </tbody>
                </table>
                <p className="status-msg">Showing gains for last 7 days</p>
            </div>
        );
    }
}
export default App;
