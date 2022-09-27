import type { EChartsReactProps } from "echarts-for-react";
import EChartsReact from "echarts-for-react";

type TradingEchartsProps = Omit<EChartsReactProps, "option"> & {
  timeSeries: string[];
  timeData: number[];
};

const TradingEcharts = ({
  timeSeries,
  timeData,
  ...otherProps
}: TradingEchartsProps) => {
  const zippedData = timeData.map(
    (value, index) => [timeSeries[index], value] as [string, number]
  );
  const option = {
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "time",
    },
    yAxis: {
      type: "value",
    },
    dataset: {
      source: zippedData,
      dimensions: ["timestamp", "dataPoint"],
    },
    series: [
      {
        type: "line",
        encode: {
          x: "timestamp",
          y: "dataPoint",
        },
      },
    ],
  };
  return <EChartsReact option={option} {...otherProps} />;
};

export default TradingEcharts;
