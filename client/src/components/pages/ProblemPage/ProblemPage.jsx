import { useParams } from 'react-router-dom';


import { Header, ProblemLayout, Sidebar, Spinner } from '../../../components';
import { useProblemPage } from './useProblemPage';




const ProblemPage = () => {
    const { id } = useParams();
    const { problemData, isLoading, toCollapsed ,isCollapsed} = useProblemPage(id);
    const applyProblem = [{input:"10", output: "20"}, {input:"5", output: "10"}];

    return( 
        <div className="container">       
            <Sidebar isCollapsed={isCollapsed}/>
            {/* Правая часть (верхняя панель + контент) problemData?.nameproblemData.num*/}
            <div className="main-content">
                {/* Верхняя панель */}
                <Header toCollapsed ={toCollapsed} title={isLoading ? "" : problemData?.name} numProblem={isLoading ? "" : problemData?.num}/>
                {/* Контент */}
                <div className="content">
                {isLoading ? <Spinner/>: <ProblemLayout problem={problemData} applyProblem={applyProblem}/>}
                </div>
            </div>
        </div>     
    )
}

export default ProblemPage;
