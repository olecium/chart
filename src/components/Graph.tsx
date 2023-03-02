import { IGraphData } from "../interfaces/interfaces";
import { useEffect, useRef } from 'react';
import { SimulationNodeDatum, zoom } from "d3";
import * as d3 from 'd3';

interface IGraph {
    graphData: IGraphData;
}

const Graph = ({ graphData }: IGraph): JSX.Element => {
    const effectRan = useRef<boolean>(false);

    useEffect(() => {
        if (effectRan.current === false) {
            const width = 2000,
                height = 2000;

            const zoomed = (event: any) => {
                svg.attr("transform", event.transform);
            }
            const zoomIt = zoom().on('zoom', zoomed) as any;

            const svg = d3.select("#my_dataviz")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .call(zoomIt)
                .append("g");

            const link = svg
                .append('g')
                .selectAll("line")
                .data(graphData.links)
                .join("line")
                .style("stroke", "#aaa");

            const node = svg
                .append('g')
                .selectAll("circle")
                .data(graphData.nodes)
                .join("circle")
                .attr("r", 10)
                .style("fill", "#69b3a2");

            const ticked = () => {
                link
                    .attr("x1", function (d: any) { return d.source.x; })
                    .attr("y1", function (d: any) { return d.source.y; })
                    .attr("x2", function (d: any) { return d.target.x; })
                    .attr("y2", function (d: any) { return d.target.y; });

                node
                    .attr("cx", function (d: any) { return Math.round(d.x); })
                    .attr("cy", function (d: any) { return Math.round(d.y); });
            }

            d3.forceSimulation(graphData.nodes as SimulationNodeDatum[])
                .force("link", d3.forceLink()
                    .id(function (d: any) { return d.id; })
                    .links(graphData.links)
                )
                .force("charge", d3.forceManyBody().strength(-20))
                .force("center", d3.forceCenter(width / 2, height / 2))
                .on("tick", ticked);
            return () => {
                effectRan.current = true;
            }
        }
    }, [graphData]);

    return (
        <>
            {graphData &&
                <div id="my_dataviz"></div>
            }
        </>
    );
}

export default Graph;