import React, { useEffect, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import { csv } from 'd3';
import { IGraphData, ILink, INode } from '../interfaces/interfaces';
import Graph from './Graph';

const getNodesData = async (): Promise<INode[]> => {
    const data = await csv('data/FSDnodeProperties.csv').then(data => {
        let newData = [] as INode[];
        if (data) {
            data.forEach(x => {
                if (x.NodeId && x.StartDate && x.EndDate) {
                    newData.push({
                        id: +x.NodeId,
                        StartDate: x.StartDate,
                        EndDate: x.EndDate
                    });
                }
            })
        }
        return newData;
    });
    return data;
}

const getMatrixData = async (): Promise<string[]> => {
    const data = fetch('data/adjNEW.csv')
        .then(response => response.text())
        .then(responseText => {
            let data = Papa.parse(responseText);

            return data.data as string[];
        });

    return data;
}

function GraphApp() {
    const effectRan = useRef<boolean>(false);
    const [nodes, setNodes] = React.useState<INode[] | undefined>(undefined);
    const [matrix, setMatrix] = React.useState<string[] | undefined>(undefined);
    const [graphData, setGraphData] = React.useState<IGraphData | undefined>();

    const start = useMemo(() => async () => {
        setNodes(await getNodesData());
        setMatrix(await getMatrixData());
    }, []);

    useEffect(() => {
        start();
    }, [start]);

    useEffect(() => {
        if (effectRan.current === true) {
            if (matrix && nodes) {
                let links = [] as ILink[];
                if (matrix && matrix.length > 0) {
                    for (let i = 0; i < Number(matrix[0].length); i++) {
                        const linkedNode = matrix[i].indexOf('1');

                        if (linkedNode !== -1) {
                            links.push({ source: i + 1, target: linkedNode });
                        }
                    }
                }
                setGraphData({ nodes, links });
            }
        }
        return () => {
            effectRan.current = true;
        }
    }, [matrix, nodes]);

    return (
        <div>
            {graphData &&
                <Graph graphData={graphData} />
            }
        </div>
    );
}

export default GraphApp;
