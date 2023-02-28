import React, { useEffect, useMemo, useRef } from 'react';
import './App.css';
import Papa from 'papaparse';
import { csv } from 'd3';
import { IGraphData, ILink, INode } from './interfaces';
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

// const graph: IGraphData = {
//   nodes: [
//     { id: 1, StartDate: '', EndDate: '' },
//     { id: 2, StartDate: '', EndDate: '' },
//     { id: 3, StartDate: '', EndDate: '' },
//     { id: 4, StartDate: '', EndDate: '' },
//   ],
//   links: [
//     { source: 1, target: 2 },
//     { source: 1, target: 3 },
//     { source: 1, target: 4 },
//   ]
// }

function App() {
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

  console.log(graphData);
  return (
    <div className="App">
      {graphData &&
        <Graph graphData={graphData} />
      }
    </div>
  );
}

export default App;
