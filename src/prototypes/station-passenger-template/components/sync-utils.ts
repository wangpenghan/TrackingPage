import type { TemplateData } from '../types'

export const PASSENGER_SYNC_SENSITIVE_FIELDS: (keyof TemplateData)[] = [
  'arrivalTime',
  'departureTime',
  'entryCheckOffset',
  'entryStopOffset',
  'exitCheckOffset',
  'exitStopOffset',
  'track',
  'gates',
  'exitGate',
]

export const NON_PASSENGER_SYNC_SENSITIVE_FIELDS: (keyof TemplateData)[] = [
  'arrivalTime',
  'departureTime',
  'track',
  'parkingSpot',
  'hasWater',
  'hasSuction',
]

export const SYNC_SENSITIVE_FIELDS: (keyof TemplateData)[] = [
  ...PASSENGER_SYNC_SENSITIVE_FIELDS,
  ...NON_PASSENGER_SYNC_SENSITIVE_FIELDS,
]

export const FIELD_DISPLAY_NAMES: Record<keyof TemplateData, string> = {
  arrivalTime: '到达时间',
  departureTime: '发车时间',
  entryCheckOffset: '进站开检偏移',
  entryStopOffset: '进站停检偏移',
  exitCheckOffset: '出站开检偏移',
  exitStopOffset: '出站停检偏移',
  track: '股道',
  gates: '检票口',
  exitGate: '出站口',
  parkingSpot: '停车位置',
  hasWater: '上水作业',
  hasSuction: '吸污作业',
}

export function detectSyncSensitiveChanges(
  original: TemplateData,
  updated: TemplateData,
  isPassengerTrain: boolean
): Array<{ field: keyof TemplateData; oldVal: any; newVal: any }> {
  const fields = isPassengerTrain
    ? PASSENGER_SYNC_SENSITIVE_FIELDS
    : NON_PASSENGER_SYNC_SENSITIVE_FIELDS

  return fields.map((field) => {
    const oldVal = original[field]
    const newVal = updated[field]

    let areDifferent = false

    if (field === 'gates' || field === 'exitGate') {
      const normalize = (v: string) => (v || '').split(',').filter(Boolean).sort().join(',')
      areDifferent = normalize(oldVal as string) !== normalize(newVal as string)
    } else if (typeof oldVal === 'boolean' || typeof newVal === 'boolean') {
      areDifferent = oldVal !== newVal
    } else {
      const normalize = (v: any) => (v === undefined || v === null || v === '') ? '' : v
      areDifferent = normalize(oldVal) !== normalize(newVal)
    }

    if (areDifferent) {
      return { field, oldVal: original[field], newVal: updated[field] }
    }
    return null
  }).filter(Boolean) as Array<{ field: keyof TemplateData; oldVal: any; newVal: any }>
}
