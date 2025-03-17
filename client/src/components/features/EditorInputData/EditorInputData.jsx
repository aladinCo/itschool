
import MonacoEditor from '@monaco-editor/react';
import { useEditorInputData } from './useEditorInputData';

const EditorCode = ({input, inputDataTransfer}) => {

    const { inputData, handleDidMount, handleChange} = useEditorInputData(input, inputDataTransfer);

    return(
        <div className='editor'>            
            <MonacoEditor
                height="100%"
                language="cpp"
                theme="myCustomTheme"
                value={inputData}
                onChange={handleChange}
                onMount={handleDidMount}
            />
        </div>
    )

}

export default EditorCode;