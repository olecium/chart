import React, { useEffect, useMemo } from 'react';
import './App.css';
import Papa from 'papaparse';
import { csv } from 'd3';
import { IGraphData, ILink, INode } from './interfaces';
import Graph from './Graph';

const getNodesData = async (): Promise<INode[]> => {
  const data = await csv('data/FSDnodeProperties.csv').then(data => {
    let newData = [] as INode[];
    if (data) {
      // newData = data.map(x => {
      //   let obj = {} as INode;
      //   if (x.NodeId && x.StartDate && x.EndDate) {
      //     obj = {
      //       id: +x.NodeId,
      //       StartDate: x.StartDate,
      //       EndDate: x.EndDate
      //     };
      //   }
      //   return obj;
      // });
      data.forEach(x => {
        // let obj = {} as INode;
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
  const [nodes, setNodes] = React.useState<INode[]>([]);
  const [matrix, setMatrix] = React.useState<string[]>([]);
  const [graphData, setGraphData] = React.useState<IGraphData>({ nodes: [], links: [] });

  const start = useMemo(() => async () => {
    setNodes(await getNodesData());
    setMatrix(await getMatrixData());
  }, []);

  useEffect(() => {
    start();
  }, [start]);

  useEffect(() => {
    console.log(nodes);

    let links = [] as ILink[];
    if (matrix && matrix.length > 0) {
      for (let i = 0; i < Number(matrix[0].length); i++) {
        const linkedNode = matrix[i].indexOf('1');

        if (linkedNode !== -1) {
          // find NodeId equal to i and add LinkedNode property to INode object which is equal to linkednode 
          // linked node is the index of matrix column
          links.push({ source: i + 1, target: linkedNode });
        }
      }
    }
    setGraphData({ nodes, links });
    // console.log('newNodes', newNodes);
    // console.log('links', links);
  }, [matrix, nodes]);


  return (
    <div className="App">
      <Graph graphData={graphData} />
    </div>
  );
}

export default App;
