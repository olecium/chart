export interface ILink {
    source: number;
    target: number;
}

export interface INode {
    id: number;
    StartDate: string;
    EndDate: string;
}

export interface IChartData {
    id: number;
    start: Date;
    end: Date;
    dependencies: number[];
    title: string;
    completed: number;
}

export interface IGraphData {
    nodes: INode[];
    links: ILink[];
}

export interface IData {
    nodes: any[],
    matrix: any[]
}