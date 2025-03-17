import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ProblemСondition, Splitter, LayoutBlock, EditorInputData, EditorCode, ResultPanel, TabsContainer } from "../../../components";

import useSocketTests from "../../../hooks/socketTests.hook";
import useLayoutState from "../../../hooks/layoutState.hook";
import useLayoutHandle from "../../../hooks/layoutHandle.hook";

import {createLogger } from '../../../services/logger.services';

// Встановлюємо рівень логування
const log = createLogger("ProblemLayout"); 
log.setLevel('error');

const ExecutionResults = ({ results }) => {
    if (!results) {
      return <div>Запустіть програму, щоб побачити результати</div>;
    }  
    return (
      <div>
        {results}
      </div>
    );
  };

const ProblemLayout = ({problem, applyProblem}) => {
    const [ executionResults, setExecutionResults ] = useState(null);
    // Состояние для данных из EditorInputData
    const [inputDataTransfer, setInputDataTransfer] = useState("");

    //const socketTests = useMemo(() => useSocketTests(), []);
    //const { isLoading, tests, update, status, error, sendTests, runTests } = socketTests;
    const { isLoading, tests, update, status, error, sendTests, runTests } = useSocketTests(setExecutionResults);
    
    const { sizes, handleResizeV, handleResizeH } = useLayoutState();
    const { activeTabs, handleTabChange } = useLayoutHandle();
    


    useEffect(() => {
        // Залежить від зміни applyProblem  
        setInputDataTransfer(applyProblem[0]?.input);  
    }, [applyProblem]);


    useEffect(() => {
        // Залежить від зміни inputDataTransfer  
        setInputDataTransfer(inputDataTransfer);
      
    }, [inputDataTransfer]); 

    const handleRun = useCallback((num, code) => {
        handleTabChange("c2", 1);
        log.debug("handleRun -> {num, iput, code}:", {num, inputDataTransfer, code});
        runTests(num, inputDataTransfer, code);
    }, [handleTabChange, runTests, inputDataTransfer]);

    const handleSend = useCallback((num, code) => {
        log.debug("handleSend -> {num, code}:", {num, code});
        handleTabChange("c2", 2);
        sendTests(num, code);
    }, [handleTabChange, sendTests]);

    
    
    const createTab = (id, path, icon, title, content, selected = false) => ({
        id, path, icon, title, content, selected
    });

    

    const tabsData = useMemo(() => ({
        c0: [
            createTab(0, "ts0", "Article", "Умова", <ProblemСondition data={problem} apply={applyProblem}/>, true),
            createTab(1, "ts1", "ChatBubble", "Обговорення", "Тут буде обговорення"),
            createTab(2, "ts2", "Layers", "Спроби", "Тут будуть спроби"),
        ],
        c1: [
            createTab(0, "ts0", "Code", "Редактор", <EditorCode isLoadingSend={isLoading} run={handleRun} send={handleSend} toolbar={true}/>, true),
        ],//
        c2: [
            createTab(0, "ts0", "Terminal", "Вхідні дані", <EditorInputData input={inputDataTransfer} inputDataTransfer={setInputDataTransfer}/>, true),
            createTab(1, "ts1", "PlayArrow", "Виконання", <ExecutionResults results={executionResults} />),
            createTab(2, "ts2", "Leaderboard", "Тестування", <ResultPanel isLoading={isLoading} error={error} status={status} tests={tests} data={update} />),
        ],
    }), [problem, applyProblem, isLoading, error, status, tests, update, inputDataTransfer, executionResults, handleRun, handleSend]);

    return (
        <div className="layout">
            <LayoutBlock type="row">
                <TabsContainer boxId="c0" tabs={tabsData.c0} activeTabs={activeTabs} onTabChange={handleTabChange} width={sizes.leftWidth}  />
                <Splitter onMove={handleResizeH} type="horz" />
                <LayoutBlock width={sizes.rightWidth} type="col">
                    <TabsContainer boxId="c1" tabs={tabsData.c1} activeTabs={activeTabs} onTabChange={handleTabChange} height={sizes.topWidth}  />
                    <Splitter onMove={handleResizeV} type="vert" />
                    <TabsContainer boxId="c2" tabs={tabsData.c2} activeTabs={activeTabs} onTabChange={handleTabChange} height={sizes.bottomWidth}  />
                </LayoutBlock>
            </LayoutBlock>
        </div>
    );
};

export default ProblemLayout;
