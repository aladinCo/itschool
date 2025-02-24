

export const useLayoutTabBox = (children, onTabChange) => {
    const extractTitlesAndContents = (layautData) => {
        const titles = [];
        const contents = [];
    
        layautData.forEach((child) => {
            const {id, path, icon, title, content, selected} = child;
            titles.push({id, path, icon, title, ...(selected !== undefined && { selected }) });
            contents.push({id, path, content, ...(selected !== undefined && { selected }) });         
        });
    
        return { titles, contents };
    };
    const { titles, contents } = extractTitlesAndContents(children);

    const handleClick = (tabId) => {
        if (onTabChange) {
            onTabChange(tabId);
        } 
    };

    return { titles, contents, handleClick };
}