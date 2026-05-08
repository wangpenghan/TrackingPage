export interface TemplateData {
  id: string
  // 核心身份
  trainNo: string          // 出发车次
  arrivalTrainNo?: string  // 到达车次/接续车次
  departureTrainNo?: string // 始发车次
  connectingTrain?: string  // 接续车次
  // 时间
  arrivalTime: string      // 到达时间
  departureTime: string    // 发车时间
  startTime?: string       // 始发时间
  endTime?: string         // 终到时间
  stopDuration: number     // 站停时间(分)
  // 空间
  platform: string         // 站台
  track: string            // 股道
  parkingSpot: string      // 停车位
  entryDirection: string   // 进站方向
  exitDirection: string    // 出站方向
  // 检票
  entryCheckBasis: string  // 进站开检时间基准
  entryCheckOffset: number // 进站开检时间偏移(分)
  entryStopBasis: string   // 进站停检时间基准
  entryStopOffset: number  // 进站停检时间偏移(分)
  exitCheckOffset?: number // 出站开检偏移(分)
  exitStopOffset?: number  // 出站停检偏移(分)
  exitBasis: string        // 出站基准
  // 设施
  gates: string            // 检票口
  waitingRoom: string      // 候车室
  exitGate: string         // 出站口
  // 编组
  formation: number        // 列车编组
  formationDir: string     // 编组方向(正/倒)
  model: string            // 列车车型
  carriages?: string       // 列车车厢
  // 路由
  station: string          // 车站
  fromStation: string      // 始发站
  toStation: string        // 终到站
  gateFromStation?: string // 闸机始发站名称
  gateToStation?: string   // 闸机终到站名称
  // 运行
  trainType: string        // 列车类型(始发/途径/终到)
  cycle?: number           // 运行周期
  rule?: number            // 运行规律
  alternateStartOffset?: number // 隔日开行起算基准(0=当日起,1=次日起)
  diagramNo?: string       // 基本图号
  trainNoMode?: string     // 车次模式
  trainClass?: string      // 列车等级
  // 属性
  bureau?: string          // 担当局
  capacity?: number        // 列车定员
  broadcastGroup?: string  // 广播模板分组
  landmarkColor: string    // 地标颜色
  // 作业标记
  hasWater: boolean        // 上水
  hasSuction: boolean      // 吸污
  // 有效期
  validStart: string       // 起始有效期
  validEnd: string         // 终止有效期
  isValid: boolean         // 是否有效
  // 状态
  statusFlag: string       // 状态标识
  confirmed: boolean       // 是否确认
  synced: boolean          // 是否同步
  // 审计
  operator?: string        // 操作人员
  operateTime?: string     // 操作时间
  // 距离
  fromStationDays?: number // 始发站距离到站天数
  toStationDays?: number   // 终到站距离到站天数
}

export type StatusType = 'red' | 'orange' | 'blue' | 'white'

export interface FilterOptions {
  station: string
  trainNo: string
  trainType: string
  validity: string
  status: string
  sortBy: string
}
