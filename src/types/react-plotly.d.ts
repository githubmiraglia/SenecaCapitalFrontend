declare module "react-plotly.js" {
  import Plotly from "plotly.js";
  import * as React from "react";

  export interface PlotParams {
    data: Partial<Plotly.PlotData>[];
    layout?: Partial<Plotly.Layout>;
    config?: Partial<Plotly.Config>;
    frames?: Partial<Plotly.Frame>[];
    useResizeHandler?: boolean;
    style?: React.CSSProperties;
    className?: string;
    onInitialized?: (figure: Plotly.Figure, graphDiv: HTMLDivElement) => void;
    onUpdate?: (figure: Plotly.Figure, graphDiv: HTMLDivElement) => void;
    onPurge?: (graphDiv: HTMLDivElement) => void;
    onClick?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
    onHover?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
    onUnhover?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
    onSelected?: (event: Readonly<Plotly.PlotSelectionEvent>) => void;
    onRelayout?: (event: Partial<Plotly.Layout>) => void;
    divId?: string;
  }

  export default class Plot extends React.Component<PlotParams> {}
}
