import React from 'react';

import {
    FullScreen, 
    FullScreenExit, 
    Article, 
    ChatBubble, 
    Layers, 
    Code, 
    Leaderboard, 
    PlayArrow,
    Terminal, 
    Send, 
    Folder, 
    Sync}  from './icons';

const Svg = ({name, ...props }) => {

    const components = {
        FullScreen,
        FullScreenExit,
        Article,
        ChatBubble,
        Layers,
        Code,
        Leaderboard,
        PlayArrow,
        Terminal,
        Send,
        Folder,
        Sync
    }; 
  
    const Component = components[name];
  
    return Component ? <Component {...props}/> : null;
  };
  
  export default Svg;