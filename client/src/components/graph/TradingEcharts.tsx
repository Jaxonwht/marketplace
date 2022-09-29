import type { EChartsReactProps } from "echarts-for-react";
import EChartsReact from "echarts-for-react";

type TradingEchartsProps = Omit<EChartsReactProps, "option"> & {
  timeSeries: string[];
  timeData: number[][];
  seriesLegends?: string[];
};

const TradingEcharts = ({
  timeSeries,
  timeData,
  seriesLegends,
  ...otherProps
}: TradingEchartsProps) => {
  const zippedData = timeSeries.map((timestamp, index) => [
    timestamp,
    ...timeData.map((data) => data[index]),
  ]);
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
    legend: {
      data: seriesLegends,
    },
    dataset: {
      source: zippedData,
      dimensions: [
        "timestamp",
        ...timeData.map((_value, index) => `dataPoint${index}`),
      ],
    },
    series: timeData.map((_value, index) => ({
      name: seriesLegends?.[index],
      type: "line",
      encode: {
        x: "timestamp",
        y: `dataPoint${index}`,
      },
    })),
  };
  return <EChartsReact option={option} {...otherProps} />;
};

export default TradingEcharts;
