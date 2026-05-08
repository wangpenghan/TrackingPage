import type { TemplateData } from '../types'

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

export function useTemplateValidation() {
  const validate = (template: TemplateData): ValidationResult => {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    if (template.trainType === '始发' || template.trainType === '途径') {
      if (!template.gates || template.gates.trim() === '') {
        errors.push({
          field: 'gates',
          message: '检票口不能为空',
          severity: 'error',
        })
      }
    }

    if (template.trainType === '终到' || template.trainType === '途径') {
      if (!template.exitGate || template.exitGate.trim() === '') {
        errors.push({
          field: 'exitGate',
          message: '出站口不能为空',
          severity: 'error',
        })
      }
    }

    if (!template.track || template.track.trim() === '') {
      errors.push({
        field: 'track',
        message: '股道不能为空',
        severity: 'error',
      })
    }

    if (!template.platform || template.platform.trim() === '') {
      errors.push({
        field: 'platform',
        message: '站台不能为空',
        severity: 'error',
      })
    }

    if (template.trainType === '途径') {
      const arrMinutes = timeToMinutes(template.arrivalTime)
      const depMinutes = timeToMinutes(template.departureTime)
      if (arrMinutes >= depMinutes) {
        errors.push({
          field: 'arrivalTime',
          message: '到达时间必须早于发车时间',
          severity: 'error',
        })
      }
    }

    if (template.entryCheckOffset >= template.entryStopOffset) {
      errors.push({
        field: 'entryCheckOffset',
        message: '进站开检时间必须早于停检时间',
        severity: 'error',
      })
    }

    if (!template.bureau || template.bureau.trim() === '') {
      warnings.push({
        field: 'bureau',
        message: '担当局未填写',
        severity: 'warning',
      })
    }

    if (!template.capacity || template.capacity === 0) {
      warnings.push({
        field: 'capacity',
        message: '列车定员未填写',
        severity: 'warning',
      })
    }

    if (!template.waitingRoom || template.waitingRoom.trim() === '') {
      warnings.push({
        field: 'waitingRoom',
        message: '候车室未选择',
        severity: 'warning',
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  const validateBatch = (templates: TemplateData[]): ValidationResult => {
    const allErrors: ValidationError[] = []
    const allWarnings: ValidationError[] = []
    const invalidTemplates: string[] = []

    templates.forEach((template) => {
      const result = validate(template)
      if (!result.isValid) {
        invalidTemplates.push(template.trainNo)
        allErrors.push(...result.errors.map((e) => ({
          ...e,
          message: `[${template.trainNo}] ${e.message}`,
        })))
      }
      allWarnings.push(...result.warnings.map((w) => ({
        ...w,
        message: `[${template.trainNo}] ${w.message}`,
      })))
    })

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    }
  }

  return {
    validate,
    validateBatch,
  }
}

function timeToMinutes(time: string): number {
  if (!time || !time.includes(':')) return 0
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}
