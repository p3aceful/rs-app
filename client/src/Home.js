import React from 'react';
import './Home.css';

export default class Start extends React.Component {
    state = {
        input: 'p3aceful',
    }

    handleChange = event => {
        this.setState({ input: event.target.value });
    }

    render = () => {

        const styles = {
            header: {
                background: 'rebeccapurple',
                color: 'white',
                display: 'grid',
                gridTemplateRows: '3fr 1fr',
                gridTemplateColumns: '1fr 1fr 1fr',
                alignContent: 'end',
            },
            h1: {
                fontSize: '5em',
                gridColumn: ' 1 / 4',
                gridRow: '1 / 2',
                justifySelf: 'center',
                alignSelf: 'end',
            },
            p: {
                gridColumn: '2 / 3',
                gridRow: '2 / 3',
                justifySelf: 'center',
            },
            main: {
                display: 'grid',
                justifyContent: 'center',
                alignContent: 'center',
            }
        }
        return (
            <div className="grid-container">
                <header style={styles.header}>
                    <h1 style={styles.h1}>RS_app</h1>
                    <p style={styles.p}>
                        This app allows you to track your stat-progress over time.
                        Just enter your name in the input below and begin tracking!
                    </p>
                </header>
                <main style={styles.main}>
                    <Input onSubmit={(name) => this.props.history.push(`/track/${name}/7`)} />
                </main>
            </div>
        );
    }
}

class Input extends React.Component {
    state = { input: '' };

    handleChange(event) {
        this.setState({ input: event.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.onSubmit(this.state.input);
        this.setState({ input: '' });
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit.bind(this)}>
                <input
                    placeholder="Enter a name..."
                    type="text" value={this.state.input}
                    onChange={this.handleChange.bind(this)}
                />
                <input type="submit" value="Submit" />
            </form>
        )
    }
}