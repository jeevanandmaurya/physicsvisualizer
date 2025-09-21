import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus,faUpload,faCubes} from '@fortawesome/free-solid-svg-icons';
import './leftPanel.css';

function LeftPanel({onSceneExamples,onCreateScene,onUploadScene}) {


    return (
        <div className="leftPanelContainer">
            <div className="scene-examples" onClick={onSceneExamples}>
                <FontAwesomeIcon icon={faCubes} />
            </div>
            <div className="create-scene" onClick={onCreateScene}>
                <FontAwesomeIcon icon={faCirclePlus} />
            </div>
            <div className="upload-scene" onClick={onUploadScene}>
                <FontAwesomeIcon icon={faUpload} />
            </div>
        </div>
    );
}

export default LeftPanel;
