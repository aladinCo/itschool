import { useState, useEffect, useCallback } from 'react';
import { useHttp } from '../../../hooks/http.hook';
import {createLogger } from '../../../services/logger.services';

// Встановлюємо рівень логування
const log = createLogger("ProblemPage"); 
log.setLevel('error');

export const useProblemPage = (id) => {
    const { request, isLoading } = useHttp();
    const [problemData, setProblemData] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(true);

    const toCollapsed = () => {
        setIsCollapsed(!isCollapsed);
    };

    const fetchProblem = useCallback(async () => {
            try {
                const problem = await request(`/api/problem/${id}`);
                setProblemData(problem.result);
                log.debug("Result:", problem.result);
            } catch (e) {
                log.error("error:", e.message);
            }
        },[]);
    useEffect(() => {
        log.debug("Id:", id);       

        if (id) {
            fetchProblem();
        }
    }, [id, fetchProblem]);


    return { problemData, isLoading, toCollapsed, isCollapsed };
};