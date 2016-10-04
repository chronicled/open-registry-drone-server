import React from 'react';
import ReactDOM from 'react-dom';
import SettingsContainer from './settingsContainer.jsx';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();
const App = () => (
  <SettingsContainer />
);

ReactDOM.render(<App />, document.getElementById('app'));
