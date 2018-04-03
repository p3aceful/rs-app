import React, { Component } from 'react';
import './App.css';


class App extends Component {

    constructor() {
        super();
        this.state = {
            status: {
                start: true,
                pending: false,
                success: false,
                data: null,
                msg: 'Welcome to chili\'s',
                name: undefined,
                days: undefined,
            }
        }
    }

    sendUpdateRequest() {

        this.setState({
            status: {
                start: false,
                pending: true,
                success: false,
                data: null,
                msg: 'Welcome to chili\'s',
                name: this.state.status.name,
                days: -1,
            }
        });

        fetch(`http://localhost:5000/api/player/${this.state.status.name}`, {method: 'POST'})
            .then(res => res.json())
            .then(json => {
                this.changeDay(7);
            })
    }
    
    changeDay(number) {

        if (number === 0) {
            this.sendUpdateRequest();
            return;
        }

        if (number === this.state.status.days) {
            console.log('already showing days:', number);
            return;
        }
        
        this.setState({
            status: {
                start: false,
                pending: true,
                success: false,
                data: null,
                msg: 'Fetchign data',
                name: this.state.status.name,
                days: number,
            }
        })

        console.log('Someone wants to change the day??');
        console.log('Fetching', this.state.status);
        fetch(`http://localhost:5000/api/player/${this.state.status.name}?period=${number}`)
            .then(response => {
                response.json()
                    .then(json => {
                        this.setState({
                            status: {
                                start: false,
                                pending: false,
                                success:true,
                                data: json.data,
                                msg: json.msg,
                                name: this.state.status.name,
                                days: this.state.status.days,
                            }
                        })
                    })
            })
        
    }

    handleFormSubmit(name) {
        this.setState({
            status: {
                start: false,
                pending: true,
                success: false,
                data: null,
                msg: '',
                name: name,
                days: undefined,
            }
        });

        this.sendServerRequest(name);
    }

    sendServerRequest(name) {

        fetch('http://localhost:5000/api/player/' + name + '?period=7')
            .then(response => {


                if (response.status === 400 || response.status === 404) {
                    console.log('The response status was 400');
                    response.json()
                        .then(json => {
                            this.setState({
                                status: {
                                    start: false,
                                    pending: false,
                                    success: false,
                                    data: null,
                                    msg: json.msg,
                                    name: undefined,
                                    days: undefined,
                                }
                            });
                        })

                } else if (response.status === 500) {
                    console.log('The response status was 500');
                    response.json()
                        .then(json => {
                            this.setState({
                                status: {
                                    start: false,
                                    pending: false,
                                    success: false,
                                    data: null,
                                    msg: json.msg,
                                    name: undefined,
                                    days: undefined,
                                },
                            });
                        })
                } else {
                    console.log(response.status);

                    response.json()
                        .then(json => {
                            // FAKE DELAY
                            return new Promise(resolve => {
                                setTimeout(resolve, 2000, json);
                            });
                        })
                        .then(json => {

                            this.setState({
                                status: {
                                    start: false,
                                    pending: false,
                                    success: true,
                                    data: json.data,
                                    msg: json.msg,
                                    name: this.state.status.name,
                                    days: 7,
                                }
                            });
                        });
                }
            })
            .catch(err => {
                console.log('Could not connect to the server');
            });
    }

    render() {
        return (
            <div className="container">
                <Header formSubmitFn={name => { this.handleFormSubmit(name) }} />
                <Main changeDay={number => { this.changeDay(number) }} status={this.state.status} />
            </div>
        );
    }
}

class Header extends Component {

    render() {
        return (
            <header className="row">
                <h1 className="column">flying-donkey</h1>
                <SearchForm formSubmitFn={this.props.formSubmitFn} />
            </header>
        );
    }
}

class SearchForm extends Component {
    constructor() {
        super();
        this.state = { value: '' };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.formSubmitFn(this.state.value);
        this.setState({ value: '' });
    }

    render() {
        return (
            <div className="column">
                <form onSubmit={this.handleSubmit} className="container">
                    <fieldset className="row">
                        <input className="column" type="text" value={this.state.value} onChange={this.handleChange} placeholder={'Name...'} />

                        <input className="column button-primary" type="submit" value="Search"></input>
                    </fieldset>
                </form>
            </div>
        );
    }
}

class Main extends Component {

    render() {
        return (
            <main className="row">
                <Content status={this.props.status} />
                <ControlPanel changeDay={this.props.changeDay} status={this.props.status} />
            </main>
        );
    }
}


class Content extends Component {

    render() {
        console.log(this.props.status);

        if (this.props.status.start) {
            return (<p className="column">Try a search</p>);
        }
        else if (this.props.status.pending) {
            return (<p className="column">Please wait...</p>)
        }
        else if (this.props.status.success) {
            return <Tabl data={this.props.status.data} />
        }
        else {
            return (<p className="column">{this.props.status.msg}</p>)
        }

    }
}


class ControlPanel extends Component {

    render() {
        if (!this.props.status.success) {
            return (<p className="column"> :) </p>);

        } else {
            return (
                <PeriodOptions changeDay={this.props.changeDay} />
            );
        }
    }
}

class PeriodOptions extends Component {

    handleClick(number) {
        this.props.changeDay(number);
    }

    render() {
        return (
            <div className="column">
                <div className="container">
                    <div className="row">
                        <button onClick={() => this.handleClick(1)} className="button button-clear">Last day</button>
                    </div>
                    <div className="row">
                        <button onClick={() => this.handleClick(7)} className="button button-clear" >Last week</button>
                    </div>
                    <div className="row">
                        <button onClick={() => this.handleClick(31)} className="button button-clear" >Last month</button>
                    </div>
                    <div className="row">
                        <button onClick={() => this.handleClick(365)} className="button button-clear" >Last year</button>
                    </div>
                    <div className="row">
                        <button onClick={() => this.handleClick(0)} className="button button-outline" >Update!</button>
                    </div>
                </div>
            </div>
        );
    }
}

class Tabl extends Component {
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
        let skills = this.props.data;

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
            <div className="column">
                <table>
                    <thead>
                        <tr>
                            <th>Skill</th>
                            <th>Level</th>
                            <th>XP</th>
                            <th>Rank</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data}
                    </tbody>
                </table>
                <p className="status-msg">Showing gains?</p>
            </div>
        );
    }
}

export default App;
