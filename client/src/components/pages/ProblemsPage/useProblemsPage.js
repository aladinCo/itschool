import { useState, useEffect, useCallback } from 'react';
import { useLocation } from "react-router-dom";
import { useHttp } from '../../../hooks/http.hook';
import {createLogger } from '../../../services/logger.services';

// Встановлюємо рівень логування
const log = createLogger("ProblemsPage"); 
log.setLevel('debug');

export const useProblemsPage = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const page = searchParams.get("page") || "1";

    const { request, isLoading } = useHttp();
    const [problems, setProblems] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
    const [isCollapsed, setIsCollapsed] = useState(true);

    const toCollapsed = () => {
        setIsCollapsed(prev => !prev);
    };

    const fetchProblem = useCallback(async (page = null) => {
        try {
            const _problems = await request(`/api/problems/${page? "?page=" + page : ""}`);
            setProblems(_problems.result.problems);
            setTotalResults(_problems.result.totalResults);
            log.debug("Result:", _problems.result);
        } catch (e) {
            log.error("Fetch error:", e?.message || "Unknown error");
        }
    }, [request]);

    useEffect(() => {
        fetchProblem(page);
        
        //fetchProblem();
    }, [fetchProblem]);

    const handlerPagination = (page) => {
        fetchProblem(page)
    }

    return { isLoading, problems, totalResults, toCollapsed, isCollapsed, handlerPagination};
};