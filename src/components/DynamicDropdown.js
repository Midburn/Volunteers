import {observer} from "mobx-react";
import {DropdownButton, MenuItem} from "react-bootstrap"
import React from 'react';

const DynamicDropdown = observer(({label, model, collectionName, current, placeholder = "All", onSelect, title=""}) => (
    <div>
    <DropdownButton title={label} id={`select_${collectionName}`} onSelect={k => { model[current] = k; if (onSelect) onSelect(); }}>
        {[{id: 0, name: placeholder}, ...(model[collectionName] || [])].map(
            entry => <MenuItem active={model[current] === entry.id} key={entry.id} eventKey={entry.id}>{entry.name}</MenuItem>
        )}
    </DropdownButton>   
    <span>{model[current] ? model[title] : ''}</span>         
    </div>
))

export default DynamicDropdown;