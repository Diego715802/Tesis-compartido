export type SensorValue = {
  value: number;
  unit: string;
};

export type MikrotikInterfaceTelemetry = {
  name: string;
  running: boolean;
  disabled: boolean;
  rxBytes: number;
  txBytes: number;
  rxBitsPerSecond: number;
  txBitsPerSecond: number;
};

export type MikrotikTelemetry = {
  state: "connected" | "configuration_required" | "unreachable" | "authentication_failed" | "error";
  message: string;
  capturedAt: string;
  transport: "ssh" | "rest";
  endpoint: string;
  identity: string | null;
  resource: {
    boardName: string | null;
    platform: string | null;
    version: string | null;
    uptime: string | null;
    cpuLoadPercent: number | null;
    memoryUsedPercent: number | null;
    freeMemoryBytes: number | null;
    totalMemoryBytes: number | null;
  };
  health: {
    temperature: SensorValue | null;
    cpuTemperature: SensorValue | null;
    boardTemperature: SensorValue | null;
    voltage: SensorValue | null;
    current: SensorValue | null;
    powerConsumption: SensorValue | null;
    fanSpeed: SensorValue | null;
    acousticNoise: {
      available: false;
      reason: string;
    };
  };
  traffic: {
    rxBitsPerSecond: number;
    txBitsPerSecond: number;
    interfaces: MikrotikInterfaceTelemetry[];
  };
};

export type MikrotikHistoryPoint = {
  timestamp: number;
  cpuLoadPercent: number | null;
  memoryUsedPercent: number | null;
  temperatureCelsius: number | null;
  powerWatts: number | null;
  fanRpm: number | null;
  rxMegabitsPerSecond: number;
  txMegabitsPerSecond: number;
  interfaces: Array<{ name: string; megabitsPerSecond: number }>;
};
