export interface Area {
  id: string;
  name: string;
  controlMode: 'auto' | 'manual';
  switchMode: 'full-on' | 'full-off' | 'half-on-a' | 'half-on-b' | 'quarter-on' | 'custom';
  autoRecovery: boolean;
  countdown?: string;
  illuminance: string;
  lightingDetails: LightingHour[];
  customCircuits?: number[];
}

export interface LightingHour {
  hour: string;
  period: 'night' | 'day';
  controlMode: 'plan' | 'illuminance' | 'none';
  triggers?: Array<{
    time: string;
    type: 'train' | 'lux';
    value: string;
  }>;
  hasTimerTask?: boolean;
}

export interface Circuit {
  id: number;
  name: string;
  status: 'on' | 'off';
  selected: boolean;
}

export interface SwitchModeConfig {
  name: string;
  defaultCircuits: number[];
  editable: boolean;
}

const createLightingDetails = (baseIlluminance: number) => {
  return [
    { hour: '0:00~1:00', period: 'night' as const, controlMode: 'none' as const, triggers: [
      { time: '0:26', type: 'train' as const, value: 'G798' },
      { time: '0:32', type: 'train' as const, value: 'G685' },
    ], hasTimerTask: true },
    { hour: '1:00~2:00', period: 'night' as const, controlMode: 'none' as const, hasTimerTask: true },
    { hour: '2:00~3:00', period: 'night' as const, controlMode: 'none' as const, hasTimerTask: true },
    { hour: '3:00~4:00', period: 'night' as const, controlMode: 'none' as const, hasTimerTask: true },
    { hour: '4:00~5:00', period: 'night' as const, controlMode: 'none' as const, hasTimerTask: true },
    { hour: '5:00~6:00', period: 'night' as const, controlMode: 'none' as const, hasTimerTask: true },
    { hour: '6:00~7:00', period: 'night' as const, controlMode: 'plan' as const, hasTimerTask: true },
    { hour: '7:00~8:00', period: 'day' as const, controlMode: 'illuminance' as const, triggers: [
      { time: '7:05', type: 'lux' as const, value: `${baseIlluminance * 0.125}LUX` },
    ]},
    { hour: '8:00~9:00', period: 'day' as const, controlMode: 'illuminance' as const },
    { hour: '9:00~10:00', period: 'day' as const, controlMode: 'illuminance' as const, triggers: [
      { time: '9:10', type: 'lux' as const, value: `${baseIlluminance * 0.5}LUX` },
    ]},
    { hour: '10:00~11:00', period: 'day' as const, controlMode: 'illuminance' as const, triggers: [
      { time: '10:30', type: 'lux' as const, value: `${baseIlluminance}LUX` },
    ]},
    { hour: '11:00~12:00', period: 'day' as const, controlMode: 'illuminance' as const },
    { hour: '12:00~13:00', period: 'day' as const, controlMode: 'illuminance' as const },
    { hour: '13:00~14:00', period: 'day' as const, controlMode: 'illuminance' as const },
    { hour: '14:00~15:00', period: 'day' as const, controlMode: 'illuminance' as const },
    { hour: '15:00~16:00', period: 'night' as const, controlMode: 'none' as const },
    { hour: '16:00~17:00', period: 'night' as const, controlMode: 'none' as const },
    { hour: '17:00~18:00', period: 'night' as const, controlMode: 'none' as const },
    { hour: '18:00~19:00', period: 'night' as const, controlMode: 'none' as const },
    { hour: '19:00~20:00', period: 'night' as const, controlMode: 'none' as const },
    { hour: '20:00~21:00', period: 'night' as const, controlMode: 'none' as const },
    { hour: '21:00~22:00', period: 'night' as const, controlMode: 'none' as const },
    { hour: '22:00~23:00', period: 'night' as const, controlMode: 'none' as const },
    { hour: '23:00~24:00', period: 'night' as const, controlMode: 'none' as const },
  ];
};

export const mockAreas: Area[] = [
  { 
    id: '1', 
    name: '1站台', 
    controlMode: 'auto', 
    switchMode: 'full-on', 
    autoRecovery: true, 
    countdown: '29:58',
    illuminance: '800LUX',
    lightingDetails: createLightingDetails(800)
  },
  { 
    id: '2', 
    name: '2站台', 
    controlMode: 'manual', 
    switchMode: 'full-on', 
    autoRecovery: true, 
    countdown: '29:58',
    illuminance: '600LUX',
    lightingDetails: createLightingDetails(600)
  },
  { 
    id: '3', 
    name: '3站台', 
    controlMode: 'manual', 
    switchMode: 'full-on', 
    autoRecovery: true, 
    countdown: '29:58',
    illuminance: '900LUX',
    lightingDetails: createLightingDetails(900)
  },
  { 
    id: '4', 
    name: '4站台', 
    controlMode: 'auto', 
    switchMode: 'half-on-a', 
    autoRecovery: false,
    illuminance: '400LUX',
    lightingDetails: createLightingDetails(400)
  },
  { 
    id: '5', 
    name: '1候车室', 
    controlMode: 'manual', 
    switchMode: 'half-on-b', 
    autoRecovery: true, 
    countdown: '29:58',
    illuminance: '700LUX',
    lightingDetails: createLightingDetails(700)
  },
  { 
    id: '6', 
    name: '2候车室', 
    controlMode: 'auto', 
    switchMode: 'quarter-on', 
    autoRecovery: true, 
    countdown: '29:58',
    illuminance: '200LUX',
    lightingDetails: createLightingDetails(200)
  },
  { 
    id: '7', 
    name: '出站口', 
    controlMode: 'auto', 
    switchMode: 'full-off', 
    autoRecovery: false,
    illuminance: '100LUX',
    lightingDetails: createLightingDetails(100)
  },
];

export const areaCategories = ['全站', '站台', '候车室', '出站口', '贵宾室', '售票厅'];

export const mockCircuits: Circuit[] = [
  { id: 1, name: '回路1', status: 'on', selected: true },
  { id: 2, name: '回路2', status: 'on', selected: true },
  { id: 3, name: '回路3', status: 'on', selected: true },
  { id: 4, name: '回路4', status: 'on', selected: true },
  { id: 5, name: '回路5', status: 'on', selected: true },
  { id: 6, name: '回路6', status: 'off', selected: false },
  { id: 7, name: '回路7', status: 'off', selected: false },
  { id: 8, name: '回路8', status: 'off', selected: false },
  { id: 9, name: '回路9', status: 'off', selected: false },
  { id: 10, name: '回路10', status: 'off', selected: false },
];

export const switchModeConfigs: Record<string, SwitchModeConfig> = {
  'full-on': { name: '全开', defaultCircuits: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], editable: false },
  'full-off': { name: '全关', defaultCircuits: [], editable: false },
  'half-on-a': { name: '1/2开-A', defaultCircuits: [1, 3, 5, 7, 9], editable: false },
  'half-on-b': { name: '1/2开-B', defaultCircuits: [2, 4, 6, 8, 10], editable: false },
  'quarter-on': { name: '1/4开', defaultCircuits: [1, 5, 9], editable: false },
  'custom': { name: '自定义', defaultCircuits: [1, 2, 3], editable: true },
};

// 全局自定义回路配置（只有一个）
export let globalCustomCircuits: number[] = [1, 2, 3];

export const setGlobalCustomCircuits = (circuits: number[]) => {
  globalCustomCircuits = circuits;
};
