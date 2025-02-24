import React, { useEffect, useState } from 'react';
import './ProblemCondition.scss';

const defaultCondition = {
    _id: null,
    num: null,
    name: null,
    themes: null,
    timelimit: null,
    memorylimit: null,
    text: null,
    input: null,
    output: null
};

const ProblemСondition = ({data, apply}) => {
    
    const [condition, setCondition] = useState(defaultCondition);
    
    useEffect(() => {
        setCondition(data ?? defaultCondition);
    }, [data]);


    return (
        <div className="problem-condition">
            <h1>{condition.name}</h1>
            <div className="problem-condition__toolbar">
                <button className="problem-condition__toolbar_button">зірка</button>
                <div className="problem-condition__toolbar_theme">
                    {condition?.themes?.name}
                </div>
            </div>
            <div className="problem-condition__limits">
                <div className="problem-condition__limit">
                    <div className="problem-condition__limit_icon"></div>
                    <span className="problem-condition__limit_title">{`Обмеження часу процесора ${condition.timelimit / 1000} секунда`}</span>
                </div>
                <div className="problem-condition__limit">
                    <div className="problem-condition__limit_icon"></div>
                    <span className="problem-condition__limit_title">{`Обмеження на використання пам'яті ${condition.memorylimit} мегабайтів`}</span>
                </div>
            </div>
            <div className="problem-condition__body">
                <p className="problem-condition__body_text">{condition.text}</p>
                <div className="problem-condition__body_title">Вхідні данні</div>
                <p className="problem-condition__body_iput">{condition.input}</p>
                <div className="problem-condition__body_title">Вихідні данні</div>
                <p className="problem-condition__body_output">{condition.output}</p>
                <div className="problem-condition__body_title">Приклади</div>
                <div className="problem-condition__example">
                    {apply.map((item, index) => (
                        <div key={index}>
                            <div className="problem-condition__example_in">
                                <div className="problem-condition__example_toolbar">
                                    <div className="problem-condition__example_toolbar_title"> Вхідні данні #{index + 1}</div>
                                    <div className="problem-condition__example_toolbar_buttons">
                                        <button className="problem-condition__example_toolbar_button">b1</button>
                                        <button className="problem-condition__example_toolbar_button">b2</button>
                                    </div>
                                </div>
                                <pre className="problem-condition__example_code">{item.input}</pre>
                            </div>
                            <div className="problem-condition__example_out">
                                <div className="problem-condition__example_toolbar">
                                    <div className="problem-condition__example_toolbar_title"> Вихідні данні #{index + 1}</div>
                                    <div className="problem-condition__example_toolbar_buttons">
                                        <button className="problem-condition__example_toolbar_button">b1</button>
                                        <button className="problem-condition__example_toolbar_button">b2</button>
                                    </div>
                                </div>                    
                                <pre className="problem-condition__example_code">{item.output}</pre>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ProblemСondition;