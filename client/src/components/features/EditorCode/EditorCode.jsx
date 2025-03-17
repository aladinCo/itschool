
import MonacoEditor from '@monaco-editor/react';

import { _Button } from "../../../components/ui";
import { useEditorCode } from './useEditorCode';

const EditorCode = ({isLoadingSend, isLoadingRun, run = null, send= null,  toolbar = false }) => {

    const { codeText, handleDidMount, handleClickRun, handleClickSend, handleChange} = useEditorCode(run, send);

    return(
        <div className='editor'>
            { toolbar &&
                    <div className='editor__toolbar'>
                        <div className='editor__toolbar_left'>
                            <_Button icon={"Folder"} size="small" text="Завантажити"/>
                        </div>
                        <div className='editor__toolbar_right'>
                            <_Button icon={"PlayArrow"} onClick={handleClickRun} isLoading={isLoadingRun} text="Запустити"/>
                            <_Button icon={"Send"}  onClick={handleClickSend} isLoading={isLoadingSend} text="Надіслати"/>
                        </div>
                    </div>
            }
            <MonacoEditor
                height="100%"
                language="cpp"
                theme="myCustomTheme"
                value={codeText}
                onChange={handleChange}
                onMount={handleDidMount}
            />
        </div>
    )

}

export default EditorCode;