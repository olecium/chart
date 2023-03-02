import Chart from "./Chart";


interface IGanttChart {
    data: any;
}

const GanttChart = ({ data }: IGanttChart): JSX.Element => {
    const parentElt = <div id="gantt-chart"></div> as unknown as HTMLElement;
    if (parentElt) {
        // const chart = Chart({ parentElt, projects: data });
        //chart();
        // console.log('chart', chart);
    }
    //     chart.render();

    return (
        <>
            <div className="gantt-chart-container">
                <div id="controls">
                    <button id="zoom-out">-</button>
                    <button id="zoom-in">+</button>
                </div>
                <div id="gantt-chart"></div>
            </div>
        </>
    );
}

export default GanttChart;