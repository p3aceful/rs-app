import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { NotEnoughDatapointsError, NotTrackedError } from './errors';
import API from './backend';
import './Player.css';

export default class Player extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isFetching: true,
            hasError: false,
            messageToUser: '',
        }
        this.handleTrackClick = this.handleTrackClick.bind(this);
        this.handleResponse = this.handleResponse.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
    }

    componentDidMount() {
        this.fetchProgress();
    }

    fetchProgress() {
        const { player, period } = this.props.match.params;
        this.setState({
            isFetching: true,
            hasError: false,
            messageToUser: '',
        });

        API.getProgress(player, period)
            .then(this.handleResponse);
    }

    handleTrackClick() {
        API.sendTrackRequest(this.props.match.params.player)
            .then(this.handleResponse);
    }

    handleResponse({ code, msg, ...rest }) {
        switch (code) {
            case 1:
            case 5:
                // Success
                const { skills } = rest.data;
                this.setState({ isFetching: false, progress: skills, msg });
                break;
            case 2:
                // Player no exist
                this.setState({ hasError: true, isFetching: false, messageToUser: msg, code });
                break;
            case 3:
                this.props.history.push('/404');
                break;
            case 6:
                // No datapoints within the period asked for.
                this.setState({ hasError: true, isFetching: false, messageToUser: msg, code });

                break;
            case 7:
                console.log('great job now you have to refresh page');
                break;
            default:
                console.log({ code, msg, rest })
                throw new Error('Unhandled error code case.');
        }
        // - code 2 - The player is not tracked
        // - code 3 - The player does not exist on RuneScape highscores
        // - code 4 - The player is tracked, but has no data (WTF?)
        // - code 5 - The player has only 1 datapoint
        // - code 6 - The player has no datapoints within the period asked for.
    }

    handleUpdate() {
        API.sendTrackRequest(this.props.match.params.player)
            .then(res => {
                window.location.reload();
            });
    }

    render() {
        const getErrorComponent = (code) => {
            switch (code) {
                case 2: return <NotTrackedError msg={this.state.messageToUser} />;
                case 5: return <NotEnoughDatapointsError msg={this.state.messageToUser} />;

                default:
                    throw new Error('Unhandled Error case');
            }
        }

        const stats = (isLoading) => isLoading ? <p>Loading...</p> : <Stats {...this.state} />

        return (
            <main className="statPageContainer">

                <PlayerPane
                    callback={this.handleUpdate}
                    handlePeriodUpdate={() => this.fetchProgress.call(this)}
                    name={this.props.match.params.player}
                    {...this.props}
                >
                </PlayerPane>
                <div className="content" style={{
                    overflow: 'auto',
                }}>
                    {this.state.hasError
                        ? getErrorComponent(this.state.code)
                        : stats(this.state.isFetching)
                    }
                </div>
            </main>
        );
    }
}

const PlayerPane = ({ callback, name, ...rest }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateRows: '1fr 2em',
            background: 'rebeccapurple',
            color: 'white',
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                justifyItems: 'center',
                alignItems: 'baseline',
            }}>
                <h1>{name}</h1>
                <div

                >
                    <button
                        href="/"
                        onClick={callback}
                        style={{

                        }}
                    >
                        Update
                    </button>
                </div>
            </div>
            <PeriodSelectMenu name={name} {...rest} />
        </div>
    );
}

const PeriodSelectItem = ({ to, label, exact, handlePeriodUpdate }) => (
    <Route
        path={to}
        exact={exact}
        children={({ match }) => {
            return (
                <Link
                    to={to}
                    className={match ? 'active' : ''}
                    exact={exact}
                    onClick={handlePeriodUpdate}
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        textDecoration: 'none',
                    }}
                >
                    {label}
                </Link>
            )
        }}
    />
);

const PeriodSelectMenu = ({ name, ...rest }) => {

    return (
        <div style={{
            display: 'grid',
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
            }}>
                <PeriodSelectItem to={`/track/${name}/1`} label="Day" {...rest} />
                <PeriodSelectItem to={`/track/${name}/7`} label="Week" {...rest} />
                <PeriodSelectItem to={`/track/${name}/30`} label="Month" {...rest} />
                <PeriodSelectItem to={`/track/${name}/365`} label="Year" {...rest} />

            </div>
        </div>
    )
}
const Stats = ({ msg, ...rest }) => (
    <>
        <Table {...rest} />
        <p>{msg}</p>
    </>
)

function Table({ progress }) {
    const gridTemplateColumns = '0.5fr 2fr 1fr 1fr 1fr';
    const es = Object.keys(progress).map((key, index) => {
        const { rank, level, xp } = progress[key];

        return (
            <div
                key={key}
                style={{
                    display: 'grid',
                    gridTemplateColumns,
                }}
                className={index % 2 === 0 ? 'fade' : 'non-fade'}
            >
                <img
                    src={require(`./img/${key}.gif`)}
                    alt="skill-icon"
                >
                </img>
                <div>{key[0].toUpperCase() + key.slice(1)}</div>
                <div
                    className={xp < 0 ? 'red' : xp === 0 ? '' : 'green'}>
                    {xp > 0 ? '+' + xp : '' + xp}
                </div>
                <div
                    className={rank < 0 ? 'red' : rank === 0 ? '' : 'green'}>
                    {rank > 0 ? '+' + rank : '' + rank}
                </div>
                <div
                    className={level < 0 ? 'red' : level === 0 ? '' : 'green'}>
                    {level > 0 ? '+' + level : '' + level}
                </div>
            </div>
        )
    })

    return (
        <div style={{
            display: 'grid',
            gridTemplateRows: 'repeat(24, 1fr)',
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns,
                fontWeight: 'bold',
            }}>
                <div></div>
                <div>Skill</div>
                <div>XP</div>
                <div>Rank</div>
                <div>Level</div>
            </div>
            {es}
        </div>
    );
}