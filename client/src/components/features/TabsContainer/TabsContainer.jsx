import React from "react";
import { LayoutTabBox } from "../../../components";

const TabsContainer = ({ boxId, activeTabs, onTabChange, width, height, tabs }) => (
    <LayoutTabBox
        selectedTab={activeTabs[boxId] || 0}
        onTabChange={(tabId) => onTabChange(boxId, tabId)}
        width={width}
        height={height}
    >
        {tabs}
    </LayoutTabBox>
);

export default TabsContainer;
