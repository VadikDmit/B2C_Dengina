import React from 'react';
import ResultPageDesign from './ResultPageDesign';

interface ResultPageProps {
    data: any;
    client?: any;
    onRestart: () => void;
    onRecalculate?: (payload: any) => void;
    onAddGoal?: (goal: any) => void;
    onDeleteGoal?: (goalId: number) => void;
    isCalculating?: boolean;
}

const ResultPage: React.FC<ResultPageProps> = ({ data, client, onRestart, onRecalculate, isCalculating }) => {
    return (
        <ResultPageDesign
            calculationData={data}
            client={client}
            onRestart={onRestart}
            onRecalculate={onRecalculate}
            isCalculating={isCalculating}
        />
    );
};

export default ResultPage;
