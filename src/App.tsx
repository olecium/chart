import React from 'react';
import './App.css';
import GanttApp from './components/ganttChart/GanttApp';
import GraphApp from './components/GraphApp';

function App() {
  return (
    <div className="wrapper">
      <GanttApp />
      {/* <GraphApp /> */}
    </div>
  );
}

export default App;
