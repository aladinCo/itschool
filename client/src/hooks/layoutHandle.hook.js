import { useState } from "react";

const useLayoutHandle = () => {
    
    const [activeTabs, setActiveTabs] = useState({});

    // Обработчик изменения активной вкладки
    const handleTabChange = (boxId, tabId) => {
        setActiveTabs((prev) => ({ ...prev, [boxId]: tabId }));
    };

    return { activeTabs, handleTabChange };
}

export default useLayoutHandle;