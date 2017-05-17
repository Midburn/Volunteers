import React from 'react'


function ComingSoon({err}) {
  return (
    <div className="comingSoon">
      <pre>{err && JSON.stringify(err)}
      </pre>
      <img src="coming-soon.jpg"/>
    </div>
  );
}

export default ComingSoon;