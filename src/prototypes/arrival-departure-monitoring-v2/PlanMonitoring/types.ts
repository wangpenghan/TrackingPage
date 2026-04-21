// 监测依据
export interface MonitoringBasis {
  id: string;
  stationId: string;
  planType: 'broadcast' | 'guide' | 'personnel';
  validFrom: string;
  validTo: string;
  trainNumbers: string[];
  description: string;
}

// 站点监测数据
export interface StationMonitoringData {
  stationId: string;
  stationName: string;
  planTypes: {
    broadcast: {
      total: number;
      missing: number;
      failed: number;
    };
    guide: {
      total: number;
      missing: number;
      failed: number;
    };
    personnel: {
      total: number;
      missing: number;
      failed: number;
    };
  };
  totalAbnormalities: number;
  monitoringBases: MonitoringBasis[];
}

// 异常详情
export interface Abnormality {
  id: string;
  trainNo: string;
  planType: 'broadcast' | 'guide' | 'personnel';
  status: 'missing' | 'failed';
  reason: string;
  time: string;
  stationId: string;
  monitoringBasisId?: string;
}

// 计划类型
export type PlanType = 'broadcast' | 'guide' | 'personnel';

// 异常状态
export type AbnormalityStatus = 'missing' | 'failed';

// 监测数据映射
export interface MonitoringDataMap {
  [stationId: string]: StationMonitoringData;
}

// 监测依据映射
export interface MonitoringBasisMap {
  [stationId: string]: MonitoringBasis[];
}
