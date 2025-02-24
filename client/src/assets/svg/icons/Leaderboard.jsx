import * as React from "react";
const Leaderboard = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="#5f6368"
    {...props}
  >
    <path fill="none" d="M0 0h24v24H0z" />
    <path d="M16 11V3H8v6H2v12h20V11zm-6-6h4v14h-4zm-6 6h4v8H4zm16 8h-4v-6h4z" />
  </svg>
);
export default Leaderboard;
