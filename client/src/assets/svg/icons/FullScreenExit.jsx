import * as React from "react";

const FullScreenExit = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="#5f6368"
    {...props}
  >
    <path fill="none" d="M0 0h24v24H0z" />
    <path d="M5 16h3v3h2v-5H5zm3-8H5v2h5V5H8zm6 11h2v-3h3v-2h-5zm2-11V5h-2v5h5V8z" />
  </svg>
);
export default FullScreenExit;
