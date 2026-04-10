import { TrainSchedule, AbnormalInfo } from '../mock-data';

/**
 * 异常类型描述映射
 */
const ABNORMAL_TYPE_DESCRIPTIONS: Record<string, string> = {
  'checkIn': '检票口未开放',
  'platform': '站台未到岗',
  'exit': '出站口未开放',
  'water': '上水作业未完成',
  'sewage': '吸污作业未完成',
  'parcel': '行包作业未完成',
  'meal': '送餐作业未完成',
};

/**
 * 检测列车作业异常
 * @param train 列车数据
 * @returns 异常信息列表
 */
export const detectAbnormalOperations = (train: TrainSchedule): AbnormalInfo[] => {
  const abnormalities: AbnormalInfo[] = [];

  // 检测检票口异常
  if (train.operations.checkIn.status === 'alarm') {
    abnormalities.push({
      type: 'checkIn',
      typeName: '检票口',
      description: ABNORMAL_TYPE_DESCRIPTIONS['checkIn'],
      status: 'overdue',
      plannedTime: train.arrival.time,
    });
  }

  // 检测站台异常
  if (train.operations.platform.status === 'alarm') {
    abnormalities.push({
      type: 'platform',
      typeName: '站台',
      description: ABNORMAL_TYPE_DESCRIPTIONS['platform'],
      status: 'overdue',
      plannedTime: train.arrival.time,
    });
  }

  // 检测出站口异常
  if (train.operations.exit.status === 'alarm') {
    abnormalities.push({
      type: 'exit',
      typeName: '出站口',
      description: ABNORMAL_TYPE_DESCRIPTIONS['exit'],
      status: 'overdue',
      plannedTime: train.departure.time,
    });
  }

  return abnormalities;
};

/**
 * 从所有列车中筛选出异常列车
 * @param trains 列车列表
 * @returns 包含异常信息的列车列表
 */
export const getAbnormalTrains = (trains: TrainSchedule[]): Array<{
  train: TrainSchedule;
  abnormalities: AbnormalInfo[];
}> => {
  return trains
    .map(train => ({
      train,
      abnormalities: detectAbnormalOperations(train),
    }))
    .filter(item => item.abnormalities.length > 0);
};

/**
 * 获取异常统计信息
 * @param trains 列车列表
 */
export const getAbnormalStats = (trains: TrainSchedule[]) => {
  const abnormalTrains = getAbnormalTrains(trains);
  
  return {
    totalAbnormalTrains: abnormalTrains.length,
    totalAbnormalities: abnormalTrains.reduce((sum, item) => sum + item.abnormalities.length, 0),
    byType: {
      checkIn: abnormalTrains.filter(item => 
        item.abnormalities.some(a => a.type === 'checkIn')
      ).length,
      platform: abnormalTrains.filter(item => 
        item.abnormalities.some(a => a.type === 'platform')
      ).length,
      exit: abnormalTrains.filter(item => 
        item.abnormalities.some(a => a.type === 'exit')
      ).length,
    },
  };
};
