import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faVectorSquare } from '@fortawesome/free-solid-svg-icons';
import './rightPanel.css';

function RightPanel({onChat,onProperties}) {


    return (
        <div className="rightPanelContainer">
            <div className="properties" onClick={onProperties}>
                <FontAwesomeIcon icon={faVectorSquare} />
            </div>
            <div className="chat" onClick={onChat}>
                <FontAwesomeIcon icon={faMessage} />
            </div>
        </div>
    );
}

export default RightPanel;
