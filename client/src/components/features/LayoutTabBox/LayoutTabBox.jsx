import { Svg } from "../../../assets/svg";

import styles from "./layouttabbox.module.scss";

import { useLayoutTabBox } from "./useLayoutTabBox";

const LayoutTabBox = ({width = "100%", height = "100%", children, selectedTab, onTabChange}) => {

    const {titles, contents, handleClick} = useLayoutTabBox(children, onTabChange);

    return(
        <div className={styles._layout_conteiner} style={{width: width, height: height }}>
            <div className={styles.layoutboxtab}>
                <div className={styles._control}>
                    <div className={styles._control_tabs}>
                        {titles.map((title) => (
                            <div key={title.id} 
                                onClick={() => handleClick(title.id)} 
                                className={styles[`_control_item${selectedTab === title.id ? '--selected' : ''}`]} 
                            >
                                <div className={styles._control_item_icon}> 
                                    <Svg name={title.icon}  className={styles._control_item_svg} />
                                </div>
                                <div className={styles._control_item_text}>{title.title}</div>
                            </div>                    
                        ))}
                    </div>
                    <div className={styles._control_toolbar}>
                        <div className={styles._control_toolbar_full}>
                            <Svg name="FullScreen" className={styles._control_toolbar_svg} />
                        </div>
                    </div>
                </div>
                <div className={styles._content}>
                    <div className={styles._content_items}>
                        {contents.map((content) => (
                            <div key={content.id} className={`content${content.id + 1} ` + styles[`_content_item${selectedTab === content.id ? '--selected' : ''}`]}>
                                {content.content}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}


export default LayoutTabBox;