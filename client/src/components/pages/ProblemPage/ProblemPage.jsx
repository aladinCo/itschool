import { useParams } from 'react-router-dom';

import { TaskNumber } from '../../../components/ui';
import { ProblemLayout, PageTemplate } from '../../../components';
import { useProblemPage } from './useProblemPage';




const ProblemPage = () => {
    const { id } = useParams();
    const { problemData, isLoading, toCollapsed ,isCollapsed} = useProblemPage(id);


    const applyProblem = [{input:"10", output: "20"}, {input:"5", output: "10"}];//

    return( 
        <PageTemplate 
                title={isLoading ? "" : problemData?.name} 
                toolbar={{
                        left:[
                            <TaskNumber 
                                number={isLoading ? "" : problemData?.num} 
                                status={isLoading ? null : problemData?.status}
                        />]
                    }
                } 
                isLoading={isLoading}>
            <ProblemLayout problem={problemData} applyProblem={applyProblem}/>
        </PageTemplate>
             
    )
}

export default ProblemPage;
// {/* <div className="container">       
//             <Sidebar isCollapsed={isCollapsed}/>
//             {/* Правая часть (верхняя панель + контент) problemData?.nameproblemData.num*/}
//             <div className="main-content">
//                 {/* Верхняя панель */}
//                 <Header toCollapsed ={toCollapsed} title={isLoading ? "" : problemData?.name} numProblem={isLoading ? "" : } statusProblem={problemData?.status}/>
//                 {/* Контент */}
//                 <div className="content">
//                 {isLoading ? <Spinner/>: }
//                 </div>
//             </div>
//         </div> */}