export type MikrotikConnectionState =
  | 'connected'
  | 'configuration_required'
  | 'unreachable'
  | 'authentication_failed'
  | 'error';

export type MikrotikSensorValue = {
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
  state: MikrotikConnectionState;
  message: string;
  capturedAt: string;
  transport: 'ssh' | 'rest';
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
    temperature: MikrotikSensorValue | null;
    cpuTemperature: MikrotikSensorValue | null;
    boardTemperature: MikrotikSensorValue | null;
    voltage: MikrotikSensorValue | null;
    current: MikrotikSensorValue | null;
    powerConsumption: MikrotikSensorValue | null;
    fanSpeed: MikrotikSensorValue | null;
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
