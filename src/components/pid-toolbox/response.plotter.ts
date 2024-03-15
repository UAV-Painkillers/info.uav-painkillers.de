import * as echarts from "echarts";
import type { PIDAnalyzerResult } from "@uav.painkillers/pid-analyzer-wasm";

type Axis = "roll" | "pitch" | "yaw";

export class ResponsePlotter {
  private activeAxis: Axis = "roll";
  private data: PIDAnalyzerResult | null = null;
  private noise_bounds = [
    [1, 10.1],
    [1, 100],
    [1, 100],
    [0, 4],
  ];

  private traceChart: echarts.ECharts;
  private throttleChart: echarts.ECharts;
  private strengthChart: echarts.ECharts;
  private gyroVsThrottleChart: echarts.ECharts;

  public static VIRIDIS_COLOR_PALETTE = [
    '#440154',
    '#482878',
    '#3e4a89',
    '#31688e',
    '#26828e',
    '#1f9e89',
    '#35b779',
    '#6dcd59',
    '#b4de2c',
    '#fde725'
];

  constructor(
    traceElement: HTMLElement,
    throttleElement: HTMLElement,
    strengthElement: HTMLElement,
    responseElement: HTMLElement
  ) {
    this.traceChart = echarts.init(traceElement);
    this.throttleChart = echarts.init(throttleElement);
    this.strengthChart = echarts.init(strengthElement);
    this.gyroVsThrottleChart = echarts.init(responseElement);
  }

  private mapTimeToSeconds(time: number[]) {
    return time.map((t) => Math.round(t));
  }

  private plotTrace() {
    const gyro = this.data![this.activeAxis].gyro;
    const input = this.data![this.activeAxis].input;
    const time = this.data![this.activeAxis].time;

    const traceLimit = Math.max(
      Math.max(...gyro.map(Math.abs)),
      Math.max(...input.map(Math.abs))
    );

    this.traceChart.setOption({
      legend: {},
      xAxis: {
        data: this.mapTimeToSeconds(time),
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        min: -traceLimit * 1.1,
        max: traceLimit * 1.1,
        axisTick: {
          show: false,
        },
      },
      series: [
        {
          name: `${this.activeAxis} gyro`,
          type: "line",
          data: gyro,
          smooth: true,
        },
        {
          name: `${this.activeAxis} loop input`,
          type: "line",
          data: input,
          smooth: true,
        },
      ],
    });
  }

  private plotThrottle() {
    const time = this.data![this.activeAxis].time;
    const tpaPercent = this.data!.headdict.tpa_percent;
    const throttle = this.data![this.activeAxis].throttle;

    this.throttleChart.setOption({
      xAxis: {
        data: this.mapTimeToSeconds(time),
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        min: 0,
        max: 100,
        axisTick: {
          show: false,
        },
      },
      series: [
        {
          name: "tpa",
          type: "line",
          data: Array(time.length).fill(tpaPercent),
          lineStyle: {
            color: "red",
          },
        },
        {
          type: "line",
          name: "throttle %",
          data: throttle,
          areaStyle: {},
          smooth: true,
        },
      ],
      grid: {
        show: true,
      },
      legend: {
        show: true,
      },
    });
  }

  private plotStrength() {
    const high_mask: number[] | undefined =
      this.data![this.activeAxis].high_mask;
    const highMaskSum = (high_mask ?? [0]).reduce((a, b) => a + b, 0);
    const useHighMask = highMaskSum > 0;

    const time_resp: number[] = this.data![this.activeAxis].time_resp;
    const resp_high = this.data![this.activeAxis].resp_high;
    const resp_low = this.data![this.activeAxis].resp_low;

    this.strengthChart.setOption({
      xAxis: {
        // data: this.mapTimeToSeconds(data.time),
        //min: -0.001,
        //max: 0.501,
        data: time_resp.map((t) => t.toFixed(1)),
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        min: 0,
        max: 2,
        axisTick: {
          show: false,
        },
      },
      series: [
        {
          name: "step response",
          type: "line",
          data: useHighMask ? resp_high[0] : resp_low[0],
        },
      ],
      grid: {
        show: true,
      },
    });
  }

  public setData(data: PIDAnalyzerResult) {
    this.data = data;
    this.plotAll();
  }

  public setActiveAxis(axis: Axis) {
    this.activeAxis = axis;

    this.plotAll();
  }

  private checkLimsList(): boolean {
    if (!Array.isArray(this.noise_bounds)) {
      return false;
    }

    if (this.noise_bounds.length !== 4) {
      return false;
    }

    if (
      this.noise_bounds.every((item) => {
        if (!Array.isArray(item)) {
          return false;
        }

        if (item.length !== 2) {
          return false;
        }

        return item[1] > item[0];
      })
    ) {
      return true;
    }

    return false;
  }

  private calculateMaxNoiseAndLims() {
    if (this.checkLimsList()) {
      return this.noise_bounds;
    }

    const maxNoiseGyro =
      Math.max(
        this.data.roll.noise_gyro["max"],
        this.data.pitch.noise_gyro["max"],
        this.data.yaw.noise_gyro["max"]
      ) + 1;
    const maxNoiseDebug =
      Math.max(
        this.data.roll.noise_debug["max"],
        this.data.pitch.noise_debug["max"],
        this.data.yaw.noise_debug["max"]
      ) + 1;
    const maxNoiseD =
      Math.max(
        this.data.roll.noise_d["max"],
        this.data.pitch.noise_d["max"],
        this.data.yaw.noise_d["max"]
      ) + 1;

    const meanspec = [
      this.data.roll.noise_gyro["hist2d_sm"].reduce(
        (a: number, b: number) => a + b,
        0
      ) / this.data.roll.noise_gyro["hist2d_sm"].length,
      this.data.pitch.noise_gyro["hist2d_sm"].reduce(
        (a: number, b: number) => a + b,
        0
      ) / this.data.pitch.noise_gyro["hist2d_sm"].length,
      this.data.yaw.noise_gyro["hist2d_sm"].reduce(
        (a: number, b: number) => a + b,
        0
      ) / this.data.yaw.noise_gyro["hist2d_sm"].length,
    ];

    const thresh = 100;
    const mask = this.data.roll.noise_gyro["freq_axis"].map((value: number) =>
      value >= thresh ? 1 : 0
    );
    const meanspecMax = Math.max(
      ...meanspec.map((value: number, index: number) => value * mask[index])
    );

    this.noise_bounds = [
      [1, maxNoiseGyro],
      [1, maxNoiseDebug],
      [1, maxNoiseD],
      [0, meanspecMax * 1.5],
    ];

    if (this.noise_bounds[0][1] === 1) {
      this.noise_bounds[0][1] = 100;
    }
    if (this.noise_bounds[1][1] === 1) {
      this.noise_bounds[1][1] = 100;
    }
    if (this.noise_bounds[2][1] === 1) {
      this.noise_bounds[2][1] = 100;
    }

    return this.noise_bounds;
  }

  private plotGyroVsThrottleFrequencyHeatmap() {
    const tr = this.data[this.activeAxis];

    const data: Array<[number, number, number]> = [];

    tr.noise_gyro["hist2d_sm"].forEach((row: number[], xIndex: number) => {
      return row.forEach((value: number, yIndex: number) => {
        data.push([yIndex, xIndex, value + 1]);
      });
    });

    const xAxis = Array.from({length: tr.noise_gyro['hist2d_sm'][0].length}).map((_, i) => i);
    const yAxis = Array.from({ length: tr.noise_gyro['hist2d_sm'].length }).map((_, i) => i);

    const option = {
      tooltip: {},
      xAxis: {
        type: "category",
        data: xAxis,
      },
      yAxis: {
        type: "category",
        data: yAxis,
      },
      visualMap: {
        min: this.noise_bounds[0][0],
        max: this.noise_bounds[0][1],
        calculable: true,
        realtime: false,
        inRange: {
          color: ResponsePlotter.VIRIDIS_COLOR_PALETTE,
        },
      },
      series: [
        {
          name: "Gaussian",
          type: "heatmap",
          data: data,
          emphasis: {
            itemStyle: {
              borderColor: "#333",
              borderWidth: 1,
            },
          },
          progressive: 1000,
          animation: false,
        },
      ],
    };

    this.gyroVsThrottleChart.setOption(option);
  }

  private plotAll() {
    if (!this.data) {
      throw new Error("No data to plot");
    }

    this.calculateMaxNoiseAndLims();

    this.plotTrace();
    this.plotThrottle();
    this.plotStrength();
    this.plotGyroVsThrottleFrequencyHeatmap();
  }

  public resize() {
    this.traceChart.resize();
    this.throttleChart.resize();
    this.strengthChart.resize();
    this.gyroVsThrottleChart.resize();
  }
}
