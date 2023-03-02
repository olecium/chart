import React, { useEffect, useRef } from 'react';
import { IData } from '../../interfaces/interfaces';
import Uploader from './../uploader/Uploader';
import { IChartData } from './../../interfaces/interfaces';
import Chart from './Chart';

import {
    startOfDay,
    addDays as addDuration
} from "date-fns";


const data = [
    {
        id: 1,
        title: "milestone 1",
        start: addDuration(startOfDay(new Date()), 1),
        end: addDuration(startOfDay(new Date()), 2),
        dependencies: [2],
        completed: 0.6,
    },

    {
        id: 2,
        title: "milestone 2",
        start: addDuration(startOfDay(new Date()), -1),
        end: addDuration(startOfDay(new Date()), 1),
        dependencies: [3, 4],
        completed: 0,
    },

    {
        id: 3,
        title: "milestone 3",
        start: addDuration(startOfDay(new Date()), 4),
        end: addDuration(startOfDay(new Date()), 5),
        dependencies: [],
        completed: 0.75,
    },

    {
        id: 4,
        title: "milestone 4",
        start: addDuration(startOfDay(new Date()), 3),
        end: addDuration(startOfDay(new Date()), 6),
        dependencies: [],
        completed: 0.2,
    },

    {
        id: 5,
        title: "milestone 5",
        start: addDuration(startOfDay(new Date()), 3),
        end: addDuration(startOfDay(new Date()), 6),
        dependencies: [],
        completed: 0.2,
    },

    {
        id: 6,
        title: "milestone 6",
        start: addDuration(startOfDay(new Date()), 3),
        end: addDuration(startOfDay(new Date()), 6),
        dependencies: [],
        completed: 0.2,
    },
];

function GanttApp() {
    const effectRan = useRef<boolean>(false);
    const [submited, setSubmited] = React.useState<boolean>(false);
    const [chartData, setChartData] = React.useState<IChartData[] | undefined>(undefined);

    useEffect(() => {
        if (effectRan.current === true) {

        }
        return () => {
            effectRan.current = true;
        }
    }, []);

    const handleData = (data: IData) => {
        if (data.nodes && data.matrix) {
            setSubmited(true);

            const newNodes: IChartData[] = data.nodes.map((x, i) => ({
                id: +x[0],
                start: x[1],
                end: x[2],
                completed: 0,
                dependencies: [],
                title: `Project ${x[0]}`
            }));
            newNodes.shift();

            if (data.matrix) {
                for (let i = 0; i < Number(data.matrix[0].length); i++) {
                    const linkedNode = data.matrix[i].indexOf('1');

                    if (linkedNode !== -1) {
                        let node = newNodes.findIndex((n: IChartData) => n.id === i + 1);

                        if (node) {
                            newNodes[node].dependencies.push(linkedNode);
                        }
                    }
                }
            }

            setChartData(newNodes);
        }
    };


    return (
        <div>
            {!submited &&
                <Uploader
                    handleData={handleData}
                />
            }
            {submited && chartData &&
                <Chart data={chartData} />

            }
            <Chart data={data} />
        </div>
    );
}

export default GanttApp;
