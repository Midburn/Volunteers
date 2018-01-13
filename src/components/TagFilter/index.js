import React from "react";
import "./TagFilter.scss";

function TagFilter({options, selected, onChange}) {
  return (
    <div className="tag-filter">
      {Array.from(options).map(option =>
        <label key={option}>
          <input type="checkbox" checked={selected.has(option)} onChange={event => onChange(event, option)}/>
          {option}
        </label>)}
    </div>
  );
}

export default TagFilter;