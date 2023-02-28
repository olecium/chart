export interface ILink {
    source: number;
    target: number;
}

export interface INode {
    id: number;
    StartDate: string;
    EndDate: string;
}

export interface IGraphData {
    nodes: INode[];
    links: ILink[];
}