import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Player from './Player';
import Home from './Home';
export default () => (
	<Router>
		<>
			<Route exact path="/" component={Home} />
			<Route path="/404" component={PlayerNotFoundComponent} />
			<Route path="/track/:player/:period" component={Player} />
		</>
	</Router>
);


const PlayerNotFoundComponent = () => (
	<>
		<p>Congratulations, this player either doesn't exist or has too low rank to be tracked</p>
		<Link to="/"><p>Go back?</p></Link>
	</>

)

