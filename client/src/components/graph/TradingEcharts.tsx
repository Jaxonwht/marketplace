import type { EChartsReactProps } from "echarts-for-react";
import EChartsReact from "echarts-for-react";

type TradingEchartsProps = Omit<EChartsReactProps, "option"> & {
  timeSeries: string[];
  timeData: number[][];
  seriesLegends?: string[];
  moreDetails?: boolean;
};

const TradingEcharts = ({
  timeSeries,
  timeData,
  seriesLegends,
  moreDetails,
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
      name: moreDetails ? "Timestamp in Your Local Timezone" : undefined,
      nameLocation: "center",
      nameGap: 30,
      minorTick: {
        show: moreDetails,
      },
    },
    yAxis: {
      type: "value",
      minorTick: {
        show: moreDetails,
      },
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
