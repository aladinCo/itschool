import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

import { useText } from "../../../hooks/useText"
import { Pagination, TaskNumber } from '../../../components/ui';
import { PageTemplate } from '../../../components';
import { useProblemsPage } from './useProblemsPage';

import style from "./problemspage.module.scss"



const ProblemsPage = () => {

    const { t, setLanguage } = useText("ProblemsPage");
    const [pageCount, setPageCount] = useState(0);

    const { isLoading, problems, totalResults, toCollapsed ,isCollapsed, handlerPagination} = useProblemsPage();

    useEffect(()=>{
        setPageCount(Math.ceil(totalResults.totalItems/totalResults.limit))
    }, [totalResults])

    

    return(
        <PageTemplate title={t("TITLE")} toolbar={{}} isLoading={isLoading}> 
            <div className={style._container}>
                <div className={style._container_toolbar}></div>
                <div className={style._container_problems_list}>
                    {problems?.map((problem, index) => {
                        return (
                            <div className={style._container_problem_item} key={index}>
                                <Link className={style._container_problem_item_link}  to={`/problems/${problem.num}`}>
                                    <TaskNumber number={problem.num} status={problem.status}/>
                                    <div className={style._container_problem_item_block}>                        
                                        <div className={style._container_problem_item_title}>{problem.name}</div>
                                        <div className={style._container_problem_item_theme}>{problem.themes.name}</div>
                                    </div>
                                    <div className={style._container_problem_item_toolbar}> 
                                        <div>зірка</div>
                                        <div>едіт</div>
                                    </div>
                                </Link>
                               
                            </div>
                        )
                    })} 
                    
                </div>
                <Pagination onChange={handlerPagination} totalPages={pageCount}/>
            </div>
        </PageTemplate>
    );
    
}

export default ProblemsPage;