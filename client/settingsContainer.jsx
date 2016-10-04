import React from 'react';
import axios from 'axios'
import Config from '../config.json';
import Settings from './settings.jsx';

axios.interceptors.request.use((config) => {
  config.headers['Authorization'] = `Bearer ${Config['token']}`
  return config;
});

export default class SettingsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      registrants: {}
    }
  }
  componentWillMount() {
    return axios.get('/registrants')
    .then(resp => resp.data)
    .then(registrants => this.setState({registrants}));
  }

  handleToggleRegistrant(registrantAddress, access) {
    return () => {
      return axios.post('/registrants', {registrantAddress, access})
      .then(resp => resp.data)
      .then(registrants => this.setState({registrants}))
      .catch(err => console.log(err));
    }
  }

  render() {
    return (
        <Settings registrants={this.state.registrants}
                  handleToggleRegistrant={this.handleToggleRegistrant.bind(this)} />
    );
  }
}
