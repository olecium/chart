import {
    addMilliseconds,
    getDayOfYear,
    startOfDay,
    format as formatDate,
    min as minDate,
    max as maxDate,
    addDays as addDuration
} from "date-fns";

import { useEffect, useRef, useState } from "react";

import * as d3 from 'd3';

import { IChartData } from "../../interfaces/interfaces";

import {
    SCALE_FACTOR,
    DEFAULT_ROW_HEIGHT,
    DEFAULT_WIDTH,
    DEFAULT_FONT_SIZE,
    DEFAULT_ROW_PADDING,
    DEFAULT_RADIUS,
    SLIDER_WIDTH,
    HEADER_BORDER_WIDTH,
    TODAY_MARKER_WIDTH,
    CONNECTION_OFFSET,
    CONNECTION_ARROW_WIDTH,
    CONNECTION_ARROW_HEIGHT,
    CONNECTION_LINE_WIDTH,
    MIN_COLUMN_WIDTH,
    COLORS,
    FONTS,
    HEADER_HEIGHT,
    RIGHT_SLIDER,
    LEFT_SLIDER,
    EVENT_TYPE
} from './config';

import { roundRect } from './roundRect';

interface IChart {
    data: IChartData[];
}

interface IMousePosition {
    x: number;
    y: number;
}

interface IBar {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    dependencies: number[];
    isSelected?: boolean;
    leftSliderSelected?: boolean;
    rightSliderSelected?: boolean;
    completed: number;
    isEven?: boolean;
    isDragging: boolean;
    title: string;
}

const Chart = ({ data }: IChart) => {

    console.log(data);
    const effectRan = useRef<boolean>(false);
    const [milestones] = useState<Map<number, IChartData>>(new Map(data.map(milestone => [milestone.id, milestone])));
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>();
    const [overallDuration, setOverallDuration] = useState<number>();
    const [canvasWidth, setCanvasWidth] = useState<number>(DEFAULT_WIDTH);
    const [canvasHeight, setCanvasHeight] = useState<number>();
    const [columnWidth, setColumnWidth] = useState<number>(MIN_COLUMN_WIDTH);
    const [columnDuration, setColumnDuration] = useState<number>();
    const [overallColumns, setOverallColumns] = useState<number>();
    const [selectedBar, setSelectedBar] = useState<IBar | null>(null);
    const [selectedSlider, setSelectedSlider] = useState(null);
    const [minStart, setMinStart] = useState<Date>();
    const [bars, setBars] = useState<IBar[]>();
    const [isMouseDragging, setIsMouseDragging] = useState<boolean>(false);
    // const [initialMousePosition, setInitialMousePosition] = useState<IMousePosition>();
    // const [initialBar, setInitialBar] = useState(null);

    const initializeCanvas = () => {
        //   const canvas = document.createElement("canvas");
        //   parentElt.appendChild(canvas);


        //   const canvasWidth = canvas.outerWidth || DEFAULT_WIDTH;
        const canvasWidth1 = DEFAULT_WIDTH;
        const canvasHeight1 = HEADER_HEIGHT + (milestones.size * (DEFAULT_ROW_HEIGHT + (DEFAULT_ROW_PADDING * 2)));
        setCanvasWidth(canvasWidth1);
        setCanvasHeight(canvasHeight1);

        let canvas = d3.select('#gantt-chart')
            .append('canvas')
            .attr('width', canvasWidth1)
            .attr('height', canvasHeight1);
        //   var context = canvas.node().getContext('2d');

        //   canvas.style.width = `${canvasWidth / SCALE_FACTOR}px`;
        //   canvas.style.height = `${canvasHeight / SCALE_FACTOR}px`;

        const newCtx = canvas.node()?.getContext("2d");
        setCtx(newCtx);
    }

    const initializeScale = () => {
        // create header / scale
        // find the shortest and the longest milestones

        const dates = Array.from(milestones.values()).flatMap(({ start, end }) => {
            const startD = new Date(start).getTime();
            const endD = new Date(end).getTime();
            if (!Number.isNaN(startD) && !Number.isNaN(endD)) {
                return [startD, startD]
            } else return [];
        });

        //const minStart = minDate(...dates); // changed from dates to ...dates
        //const maxEnd = maxDate(...dates); // changed from dates to ...dates

        const minStart = new Date(Math.min(...dates));
        const maxEnd = new Date(Math.max(...dates));
        setMinStart(minStart);

        const overallDuration = maxEnd.getTime() - minStart.getTime();
        setOverallDuration(overallDuration);
    }

    const initializeColumns = (overallDuration: number, canvasWidth: number) => {
        const columnDuration = 24 * 60 * 60 * 1000;
        setColumnDuration(columnDuration);

        const overallColumns = Math.ceil(overallDuration / columnDuration);
        setOverallColumns(overallColumns);

        const columnWidth = Math.ceil(canvasWidth / overallColumns);
        setColumnWidth(columnWidth);
    }

    const initializeBars = () => {
        const bars = [];

        let currentRow = 0;

        for (let { title, start, end, id, ...rest } of milestones.values()) {
            const x = scaleX(new Date(start));
            const y = HEADER_HEIGHT + currentRow++ * (DEFAULT_ROW_HEIGHT + DEFAULT_ROW_PADDING * 2) + DEFAULT_ROW_PADDING;

            const ends = scaleX(new Date(end));
            if (ends && x) {
                const width = ends - x;
                const height = DEFAULT_ROW_HEIGHT;

                const bar = { x, y, width, height, title, id, isDragging: false, ...rest };
                bars.push(bar);
            }
        }

        setBars(bars);
    }

    // const initializeEventHandlers = () => {
    //     setSelectedBar(null);
    //     setSelectedSlider(null);
    //     setIsMouseDragging(false);
    //     setInitialMousePosition({ x: 0, y: 0 });
    //     setInitialBar(null);
    // }

    // /**
    //  * Zooms in or out, depending on {@param factor}.
    //  *
    //  * @param {number} factor zooming factor
    //  */
    // const zoom = (factor: number) => {
    //   if (factor < 1 && columnWidth <= MIN_COLUMN_WIDTH) {
    //     console.error("Can not zoom out further");
    //     return;
    //   }

    //   const originalDuration = overallDuration;

    //     if(columnWidth && canvasWidth && columnDuration && originalDuration && minStart){
    //         const newColumnWidth = Math.floor(columnWidth * factor);
    //         setColumnWidth(newColumnWidth);


    //         const overallColumns = Math.ceil(canvasWidth / newColumnWidth);
    //         const overallDuration = columnDuration * overallColumns;

    //         const durationDiff = overallDuration - originalDuration;

    //         const newMinStart = addMilliseconds(minStart, durationDiff / -2);
    //         setMinStart(newMinStart);
    //         const NewMaxEnd = addMilliseconds(minStart, durationDiff / 2);
    //         setMaxEnd(NewMaxEnd);

    //         initializeBars();

    //         render();
    //     }
    // }

    // const barToEventDetail = ({ x, width, id }) => {
    //   return {
    //     ...milestones.get(id),
    //     start: new Date(scaleDate(x)),
    //     end: new Date(scaleDate(x + width)),
    //   };
    // }

    const drawColumn = (index: number) => {

        if (columnWidth && canvasHeight && columnDuration && minStart && ctx) {
            const columnDate = addMilliseconds(startOfDay(minStart), index * columnDuration);

            if (getDayOfYear(columnDate) % 2 === 0) {
                ctx.fillStyle = COLORS.scale.bar.even;
            } else {
                ctx.fillStyle = COLORS.scale.bar.odd;
            }

            const x = scaleX(columnDate);
            const width = columnWidth;
            if (x) {

                ctx.fillRect(x, 0, columnWidth, canvasHeight);

                ctx.fillStyle = COLORS.scale.header.background;
                ctx.fillRect(x, 0, columnWidth, HEADER_HEIGHT);

                ctx.lineWidth = HEADER_BORDER_WIDTH;
                ctx.strokeStyle = COLORS.scale.header.border;

                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, HEADER_HEIGHT);
                ctx.closePath();
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(x, HEADER_HEIGHT);
                ctx.lineTo(x + width, HEADER_HEIGHT);
                ctx.closePath();
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(x + width, HEADER_HEIGHT);
                ctx.lineTo(x + width, 0);
                ctx.closePath();
                ctx.stroke();

                ctx.fillStyle = FONTS.scale.column.title.color;
                ctx.font = `${FONTS.scale.column.title.size}px ${FONTS.scale.column.title.font}`;

                const columnLabel = columnDate.toLocaleDateString("en-GB");//formatDate(columnDate, "dd/MM/yy");

                const labelWidth = ctx.measureText(columnLabel).width;

                ctx.fillText(columnLabel, x + ((columnWidth - labelWidth) / 2), DEFAULT_FONT_SIZE);

            }
        }
    }


    const drawSlider = ({ x, y, height, isEven, isDragging }: IBar) => {
        if (ctx) {
            if (isDragging) {
                if (isEven) {
                    ctx.fillStyle = COLORS.milestone.bar.even.draggingSlider;
                } else {
                    ctx.fillStyle = COLORS.milestone.bar.odd.draggingSlider;
                }
            } else {
                if (isEven) {
                    ctx.fillStyle = COLORS.milestone.bar.even.highlightedSlider;
                } else {
                    ctx.fillStyle = COLORS.milestone.bar.odd.highlightedSlider;
                }
            }

            roundRect(
                ctx,
                x - SLIDER_WIDTH / 2,
                y - SLIDER_WIDTH / 5,
                SLIDER_WIDTH,
                height + (SLIDER_WIDTH / 5) * 2,
                DEFAULT_RADIUS,
                true,
                false
            );

            ctx.lineWidth = 1;
            ctx.strokeStyle = COLORS.milestone.slider.symbol;
            ctx.beginPath();
            ctx.moveTo(x, y + SLIDER_WIDTH);
            ctx.lineTo(x, y + height - SLIDER_WIDTH);
            ctx.closePath();
            ctx.stroke();
        }
    }

    const drawMilestoneBar = ({ x, y, width, height, title, completed, isSelected, isEven, isDragging }: IBar) => {
        console.log('drawMilestoneBar');
        if (ctx) {
            if (isDragging) {
                ctx.fillStyle = isEven
                    ? COLORS.milestone.bar.even.dragging
                    : COLORS.milestone.bar.odd.dragging;

                ctx.strokeStyle = isEven
                    ? COLORS.milestone.bar.even.draggingBorder
                    : COLORS.milestone.bar.odd.draggingBorder;
            } else {
                if (isEven) {
                    ctx.fillStyle = isSelected
                        ? COLORS.milestone.bar.even.highlighted
                        : COLORS.milestone.bar.even.default;
                } else {
                    ctx.fillStyle = isSelected
                        ? COLORS.milestone.bar.odd.highlighted
                        : COLORS.milestone.bar.odd.default;
                }

                ctx.strokeStyle = '';
            }

            // milestone itself
            roundRect(ctx, x, y, width, height, DEFAULT_RADIUS, true, isDragging);

            // milestone progress
            if (completed > 0) {
                ctx.fillStyle = isEven
                    ? COLORS.milestone.bar.even.progress
                    : COLORS.milestone.bar.odd.progress;

                roundRect(ctx, x, y, width * completed, height, DEFAULT_RADIUS, true, isDragging);
            }

            ctx.fillStyle = FONTS.milestone.label.color;
            ctx.font = `${FONTS.milestone.label.size}px ${FONTS.milestone.label.font}`;

            const labelWidth = ctx.measureText(title).width;
            ctx.fillText(title, (x + width / 2) - (labelWidth / 2), y + DEFAULT_FONT_SIZE / 2 + height / 2);
        }
    }

    const drawEndToStartConnection = (bar: IBar, dependency: any) => {
        if (ctx) {
            ctx.strokeStyle = COLORS.milestone.connection.endToStart.line;
            ctx.fillStyle = COLORS.milestone.connection.endToStart.line;
            ctx.lineWidth = CONNECTION_LINE_WIDTH;

            const p0 = [bar.x + bar.width, bar.y + bar.height / 2];

            const dx = Math.abs(bar.x + bar.width - dependency.x);
            const dy = Math.abs(bar.y + (bar.height / 2) - (dependency.y + (dependency.height / 2)));

            const pa = [bar.x + bar.width + (dx / 2), bar.y + (bar.height / 2) + (dy / 3)];
            const pb = [dependency.x - (dx / 2), dependency.y + (dependency.height / 2) - (dy / 3)];

            const p1 = [dependency.x - CONNECTION_ARROW_WIDTH, dependency.y + dependency.height / 2];

            const p2 = [dependency.x, dependency.y + dependency.height / 2];

            ctx.beginPath();
            ctx.moveTo(p0[0], p0[1]);
            ctx.bezierCurveTo(pa[0], pa[1], pb[0], pb[1], p1[0], p1[1]);
            ctx.lineTo(p1[0], p1[1]);
            ctx.stroke();

            // arrow
            ctx.beginPath();
            ctx.moveTo(p2[0], p2[1]);
            ctx.lineTo(p2[0] - CONNECTION_ARROW_WIDTH, p2[1] - CONNECTION_ARROW_HEIGHT);
            ctx.lineTo(p2[0] - CONNECTION_ARROW_WIDTH, p2[1] + CONNECTION_ARROW_HEIGHT);
            ctx.closePath();
            ctx.fill();
        }
    }

    const drawDependencyConnections = (bar: IBar) => {
        if (bars) {
            for (let id of bar.dependencies) {
                const dependency = bars.find(other => other.id === id);

                if (!dependency) {
                    // dependency does not exist
                    continue;
                }

                drawEndToStartConnection(bar, dependency);
            }
        }
    }

    const drawMilestone = (bar: IBar, isEven: boolean) => {
        const {
            x,
            width,
            isSelected,
            leftSliderSelected,
            rightSliderSelected
        } = bar;

        drawDependencyConnections(bar);

        if (!isMouseDragging || selectedBar !== bar) {
            drawMilestoneBar({ ...bar, isSelected: isSelected || leftSliderSelected || rightSliderSelected, isEven, isDragging: false });

            if (leftSliderSelected) {
                drawSlider({ ...bar, isEven, isDragging: false });
            } else if (rightSliderSelected) {
                drawSlider({ ...bar, x: x + width, isEven, isDragging: false });
            }
        } else if (isMouseDragging && selectedBar === bar) {

            drawMilestoneBar({ ...bar, isEven, isDragging: true });

            if (!selectedSlider) {
                drawMilestoneBar({ ...bar, isEven, isDragging: true });
            } else if (selectedSlider === LEFT_SLIDER) {
                drawSlider({ ...bar, isEven, isDragging: true });
            } else if (selectedSlider === RIGHT_SLIDER) {
                drawSlider({ ...bar, x: x + width, isEven, isDragging: true });
            }
        }
    }

    const drawTodayMarker = () => {
        const x = scaleX(new Date());

        const headerHeight = FONTS.scale.column.title.size * 1.5;

        if (ctx && canvasHeight && x) {
            ctx.strokeStyle = COLORS.scale.marker.today;
            ctx.lineWidth = TODAY_MARKER_WIDTH;

            ctx.beginPath();
            ctx.moveTo(x, headerHeight);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
        }
    }

    /**
     * Converts a date to a point on a chart
     *
     * @param {Date} date date to convert
     * @returns {number} point (horizontal axis, x) on a chart on a scale
     *
     * linear interpolation of a point (x, y) between two known points (x0, y0) and (x1, y1):
     *
     * y = y0 + (x - x0) * ((y1 - y0) / (x1 - x0))
     *
     * in our case, x0 would be the minStart and x1 would be the maxEnd
     * whilst y0 would be 0 and y1 would be canvasWidth
     *
     * and for any given point `date` (x) we are looking for corresponding x coordinate on canvas (y)
     *
     * so the equation is
     *
     * result = 0 + (date - minStart) * ((canvasWidth - 0) / (maxEnd - minStart))
     *
     * and since we know the (maxEnd - minStart) as overallDuration,
     *
     * result = (date - minStart) * (canvasWidth / overallDuration)
     */
    const scaleX = (date: Date) => {
        if (minStart && overallDuration) {
            return Math.ceil((date.getTime() - minStart.getTime()) * (canvasWidth / overallDuration));
        }
    }

    useEffect(() => {
        console.log('render');
        initializeCanvas();
        initializeScale();

        if (overallDuration && canvasWidth) {
            initializeColumns(overallDuration, canvasWidth);
            if (canvasHeight && overallColumns) {
                initializeBars();
                // ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            }
        }
    }, [overallDuration, canvasWidth, canvasHeight, overallColumns]);

    useEffect(() => {
        if (overallColumns) {
            for (let i = 0; i < overallColumns + 1; i++) {
                drawColumn(i);
            }
        }

    }, [overallColumns]);

    useEffect(() => {
        // draw background columns
        drawTodayMarker();

        if (bars) {
            for (let i = 0; i < bars.length; i++) {
                const bar = bars[i];

                drawMilestone(bar, i % 2 === 0);
            }
        }
    }, [bars]);

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

    /**
     * Converts a position on a chart to a Date (timestamp, in fact).
     *
     * @param {number} x the point on a chart
     * @returns {number} time, in millis, the corresponding date on a scale
     *
     * inverse to {@link scaleX} linear interpolation
     *
     * y = y0 + (x - x0) * ((y1 - y0) / (x1 - x0))
     *
     * x0 = 0
     * y0 = minStart
     *
     * x1 = canvasWidth
     * y1 = maxEnd
     *
     * y = minStart + (x - 0) * ((maxEnd - minStart) / (canvasWidth - 0))
     *
     * y = minStart + (x * (overallDuration / canvasWidth))
     *
     */

    // const scaleDate = (x: number) => {
    //     if(minStart && overallDuration) {
    //         return Math.ceil(minStart.getTime() + (x * (overallDuration / canvasWidth)));
    //     }
    // }
}

export default Chart;
