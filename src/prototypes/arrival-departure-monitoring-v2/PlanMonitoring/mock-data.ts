import { MonitoringDataMap, Abnormality, MonitoringBasis, MonitoringBasisMap } from './types';

// 监测依据数据
export const mockMonitoringBases: MonitoringBasis[] = [
  {
    id: "b1",
    stationId: "1",
    planType: "broadcast",
    validFrom: "08:00",
    validTo: "12:00",
    trainNumbers: ["G1001", "D2345", "C5678", "G1002", "D2346", "C5679"],
    description: "早班广播计划下发范围"
  },
  {
    id: "b2",
    stationId: "1",
    planType: "guide",
    validFrom: "08:00",
    validTo: "12:00",
    trainNumbers: ["G1001", "D2345", "C5678", "G1002"],
    description: "早班引导计划下发范围"
  },
  {
    id: "b3",
    stationId: "1",
    planType: "personnel",
    validFrom: "08:00",
    validTo: "12:00",
    trainNumbers: ["G1001", "D2345", "C5678", "G1002", "D2346"],
    description: "早班人员派班计划下发范围"
  },
  {
    id: "b4",
    stationId: "2",
    planType: "broadcast",
    validFrom: "08:00",
    validTo: "12:00",
    trainNumbers: ["G2001", "D3001", "C4001"],
    description: "早班广播计划下发范围"
  },
  {
    id: "b5",
    stationId: "2",
    planType: "guide",
    validFrom: "08:00",
    validTo: "12:00",
    trainNumbers: ["G2001", "D3001", "C4001"],
    description: "早班引导计划下发范围"
  },
  {
    id: "b6",
    stationId: "2",
    planType: "personnel",
    validFrom: "08:00",
    validTo: "12:00",
    trainNumbers: ["G2001", "D3001"],
    description: "早班人员派班计划下发范围"
  }
];

// 多站点监测数据
export const mockMonitoringData: MonitoringDataMap = {
  "1": {
    stationId: "1",
    stationName: "重庆东",
    planTypes: {
      broadcast: { total: 15, missing: 0, failed: 2 },
      guide: { total: 12, missing: 1, failed: 1 },
      personnel: { total: 18, missing: 2, failed: 0 }
    },
    totalAbnormalities: 6,
    monitoringBases: mockMonitoringBases.filter(basis => basis.stationId === "1")
  },
  "2": {
    stationId: "2",
    stationName: "巴南",
    planTypes: {
      broadcast: { total: 10, missing: 1, failed: 1 },
      guide: { total: 8, missing: 0, failed: 1 },
      personnel: { total: 10, missing: 0, failed: 0 }
    },
    totalAbnormalities: 3,
    monitoringBases: mockMonitoringBases.filter(basis => basis.stationId === "2")
  },
  "3": {
    stationId: "3",
    stationName: "南川北",
    planTypes: {
      broadcast: { total: 5, missing: 0, failed: 0 },
      guide: { total: 4, missing: 0, failed: 0 },
      personnel: { total: 6, missing: 0, failed: 0 }
    },
    totalAbnormalities: 0,
    monitoringBases: []
  },
  "4": {
    stationId: "4",
    stationName: "水江西",
    planTypes: {
      broadcast: { total: 3, missing: 0, failed: 0 },
      guide: { total: 2, missing: 0, failed: 0 },
      personnel: { total: 5, missing: 0, failed: 0 }
    },
    totalAbnormalities: 0,
    monitoringBases: []
  }
};

// 异常数据
export const mockAbnormalities: Abnormality[] = [
  {
    id: "1",
    trainNo: "G1001",
    planType: "personnel",
    status: "missing",
    reason: "客运人员派班计划缺失",
    time: "08:15",
    stationId: "1",
    monitoringBasisId: "b3"
  },
  {
    id: "2",
    trainNo: "D2345",
    planType: "broadcast",
    status: "failed",
    reason: "广播计划执行失败",
    time: "08:20",
    stationId: "1",
    monitoringBasisId: "b1"
  },
  {
    id: "3",
    trainNo: "C5678",
    planType: "guide",
    status: "missing",
    reason: "引导计划缺失",
    time: "08:25",
    stationId: "1",
    monitoringBasisId: "b2"
  },
  {
    id: "4",
    trainNo: "G1002",
    planType: "personnel",
    status: "missing",
    reason: "客运人员派班计划缺失",
    time: "09:10",
    stationId: "1",
    monitoringBasisId: "b3"
  },
  {
    id: "5",
    trainNo: "D2346",
    planType: "broadcast",
    status: "failed",
    reason: "广播计划执行失败",
    time: "09:15",
    stationId: "1",
    monitoringBasisId: "b1"
  },
  {
    id: "6",
    trainNo: "C5679",
    planType: "guide",
    status: "failed",
    reason: "引导计划执行失败",
    time: "09:20",
    stationId: "1",
    monitoringBasisId: "b2"
  },
  {
    id: "7",
    trainNo: "G2001",
    planType: "broadcast",
    status: "missing",
    reason: "广播计划缺失",
    time: "08:30",
    stationId: "2",
    monitoringBasisId: "b4"
  },
  {
    id: "8",
    trainNo: "D3001",
    planType: "broadcast",
    status: "failed",
    reason: "广播计划执行失败",
    time: "08:40",
    stationId: "2",
    monitoringBasisId: "b4"
  },
  {
    id: "9",
    trainNo: "C4001",
    planType: "guide",
    status: "failed",
    reason: "引导计划执行失败",
    time: "08:45",
    stationId: "2",
    monitoringBasisId: "b5"
  }
];

// 获取站点异常数据
export const getStationAbnormalities = (stationId: string): Abnormality[] => {
  return mockAbnormalities.filter(abnormality => abnormality.stationId === stationId);
};

// 获取站点监测依据数据
export const getStationMonitoringBases = (stationId: string): MonitoringBasis[] => {
  return mockMonitoringBases.filter(basis => basis.stationId === stationId);
};

// 根据ID获取监测依据
export const getMonitoringBasisById = (id: string): MonitoringBasis | undefined => {
  return mockMonitoringBases.find(basis => basis.id === id);
};

// 获取计划类型中文名称
export const getPlanTypeName = (planType: string): string => {
  const typeMap: Record<string, string> = {
    broadcast: '广播计划',
    guide: '引导计划',
    personnel: '人员计划'
  };
  return typeMap[planType] || planType;
};

// 获取状态中文名称
export const getStatusName = (status: string): string => {
  const statusMap: Record<string, string> = {
    missing: '计划缺失',
    failed: '执行失败'
  };
  return statusMap[status] || status;
};
