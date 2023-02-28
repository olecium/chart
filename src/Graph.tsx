import { IGraphData } from "./interfaces";
import { useEffect } from 'react';
import { SimulationNodeDatum, zoom } from "d3";
import * as d3 from 'd3';

interface IGraph {
    graphData: IGraphData;
}

const Graph = ({ graphData }: IGraph): JSX.Element => {

    useEffect(() => {
        const width = 2000,
            height = 2000;

        function zoomed(event: any) {
            svg.attr("transform", event.transform)
            console.log(event)
        }
        // append the svg object to the body of the page
        const svg = d3.select("#my_dataviz")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            // .call(d3.zoom().on("zoom", function () {
            //     svg.attr("transform", d3.event.transform)
            // }))
            .append("g");

        const zoomIt = zoom().on('zoom', zoomed) as any
        svg.call(zoomIt)

        // Initialize the links
        const link = svg
            // .append('g')
            .selectAll("line")
            .data(graphData.links)

            // .enter()
            // .append('line')
            .join("line")
            .style("stroke", "#aaa")

        // Initialize the nodes
        const node = svg
            // .append('g')
            .selectAll("circle")
            .data(graphData.nodes)
            // .enter()
            // .append('circle')
            .join("circle")
            .attr("r", 20)
            .style("fill", "#69b3a2")

        // This function is run at each iteration of the force algorithm, updating the nodes position.
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

        // Let's list the force we wanna apply on the network
        const simulation = d3.forceSimulation(graphData.nodes as SimulationNodeDatum[])        // Force algorithm is applied to data.nodes
            .force("link", d3.forceLink()                               // This force provides links between nodes
                .id(function (d: any) { return d.id; })                     // This provide  the id of a node
                .links(graphData.links)                                    // and this the list of links
            )
            .force("charge", d3.forceManyBody().strength(-400))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
            .force("center", d3.forceCenter(width / 2, height / 2))     // This force attracts nodes to the center of the svg area
            .on("tick", ticked);

    }, [graphData]);

    return (
        <div id="my_dataviz"></div>
    );
}

export default Graph;