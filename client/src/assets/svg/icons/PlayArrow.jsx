import * as React from "react";
const PlayArrow = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="#5f6368"
    {...props}
  >
    <path fill="none" d="M0 0h24v24H0z" />
    <path d="M10 8.64 15.27 12 10 15.36zM8 5v14l11-7z" />
  </svg>
);
export default PlayArrow;
