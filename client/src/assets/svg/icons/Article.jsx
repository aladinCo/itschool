import * as React from "react";
const Article = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="#5f6368"
    {...props}
  >
    <path fill="none" d="M0 0h24v24H0z" />
    <path d="M19 5v14H5V5zm0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2" />
    <path d="M14 17H7v-2h7zm3-4H7v-2h10zm0-4H7V7h10z" />
  </svg>
);
export default Article;
