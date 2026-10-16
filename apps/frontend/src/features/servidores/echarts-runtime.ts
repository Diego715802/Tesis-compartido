import { init, registerLocale, use as registerComponents } from "echarts/core";
import { BarChart, HeatmapChart, LineChart } from "echarts/charts";
import { AriaComponent, DataZoomComponent, GridComponent, LegendComponent, TooltipComponent, ToolboxComponent, VisualMapComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import localeEs from "echarts/i18n/langES-obj.js";

registerComponents([LineChart, BarChart, HeatmapChart, GridComponent, TooltipComponent, LegendComponent,
  DataZoomComponent, VisualMapComponent, ToolboxComponent, AriaComponent, CanvasRenderer]);
registerLocale("ES", localeEs);

export function initNetworkChart(element: HTMLDivElement) {
  return init(element, undefined, { renderer: "canvas", locale: "ES" });
}
