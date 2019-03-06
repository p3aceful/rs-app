import React from 'react';

const Error = ({ msg, children }) => (
    <div>
        {msg}
        {children}
    </div>
);

export const NotEnoughDatapointsError = (props) => (
	<Error {...props}>
		<div>In order to show your progress within this period you need to create another one by pressing update.</div>
		<button>Update</button>
	</Error>
);

export const NotTrackedError = (props) => (
	<Error {...props}>
		<p>If u wanna track player click track </p>
	</Error>
);
