import React from 'react';
import Toggle from 'react-toggle';
import styles from './styles.css';
import _ from 'lodash';
require('react-toggle/style.css');

const Settings = ({handleToggleRegistrant, registrants}) => {
    return (
      <div className={styles.body}>
        <div className={styles.table}>
          <div className={styles.tableHeader}>Available Registrants</div>
          {_.toPairs(registrants).map( ([address, registrant], index) => (
            <div className={styles.entry}>
              <span className={styles.name}>{registrant.name}</span>
              <div className={styles.toggle}>
                <Toggle
                  checked={registrant.access} 
                  onChange={handleToggleRegistrant(address, !registrant.access)}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
}

export default Settings;
