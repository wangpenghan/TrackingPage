export interface templateData {
  id: string;
  trainNo: string;
  trainType: 'high-speed' | 'normal';
  arrivalTime?: string;
  departureTime?: string;
  track?: string;
  platform?: string;
  gates?: string;
  exitGate?: string;
  formation?: string;
  model?: string;
  entryCheckOffset?: number;
  exitCheckOffset?: number;
  status?: string;
}

export interface planDifference {
  trainNo: string;
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  oldData?: templateData;
  newData?: templateData;
  changedFields?: changedField[];
}

export interface changedField {
  field: keyof templateData;
  oldValue: any;
  newValue: any;
  priority: 'P0' | 'P1' | 'P2';
}

export interface planLockState {
  id: string;
  trainNo: string;
  diagramNo: string;
  isLocked: boolean;
  lockedAt?: string;
  lockedBy?: string;
  lockedReason?: string;
  regeneratedAt?: string;
  regeneratedData?: templateData;
  conflictStatus?: 'none' | 'detected' | 'resolved';
}

export interface checkProgress {
  id: string;
  trainNo: string;
  diagramNo: string;
  checkStatus: 'unchecked' | 'checked' | 'questioned' | 'confirmed';
  checkedBy?: string;
  checkedAt?: string;
  notes?: string;
  questionType?: 'data_anomaly' | 'mismatch_paper' | 'need_approval';
  mentions?: string[];
}

export interface differenceSummary {
  totalCount: number;
  addedCount: number;
  removedCount: number;
  modifiedCount: number;
  unchangedCount: number;
  differences: planDifference[];
  lockedConflicts: planLockState[];
}

const SENSITIVE_FIELDS: Record<string, 'P0' | 'P1' | 'P2'> = {
  arrivalTime: 'P0',
  departureTime: 'P0',
  track: 'P0',
  platform: 'P0',
  gates: 'P1',
  exitGate: 'P1',
  formation: 'P1',
  model: 'P1',
  entryCheckOffset: 'P2',
  exitCheckOffset: 'P2',
};

export function detectFieldChanges(
  oldData: templateData,
  newData: templateData
): changedField[] {
  const changes: changedField[] = [];
  for (const [field, priority] of Object.entries(SENSITIVE_FIELDS)) {
    const oldVal = oldData[field as keyof templateData];
    const newVal = newData[field as keyof templateData];
    if (oldVal !== newVal) {
      changes.push({
        field: field as keyof templateData,
        oldValue: oldVal,
        newValue: newVal,
        priority,
      });
    }
  }
  return changes;
}

export function detectPlanDifferences(
  oldPlan: templateData[],
  newPlan: templateData[]
): planDifference[] {
  const oldMap = new Map(oldPlan.map(t => [t.trainNo, t]));
  const newMap = new Map(newPlan.map(t => [t.trainNo, t]));
  const differences: planDifference[] = [];

  for (const [trainNo, newData] of newMap) {
    const oldData = oldMap.get(trainNo);
    if (!oldData) {
      differences.push({ trainNo, type: 'added', newData });
    } else {
      const changedFields = detectFieldChanges(oldData, newData);
      if (changedFields.length > 0) {
        differences.push({
          trainNo,
          type: 'modified',
          oldData,
          newData,
          changedFields: changedFields.sort((a, b) => {
            const priorityOrder = { P0: 0, P1: 1, P2: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }),
        });
      } else {
        differences.push({ trainNo, type: 'unchanged', oldData, newData });
      }
    }
  }

  for (const [trainNo, oldData] of oldMap) {
    if (!newMap.has(trainNo)) {
      differences.push({ trainNo, type: 'removed', oldData });
    }
  }

  return differences;
}

export function detectLockedPlanRegeneration(
  currentLocks: planLockState[],
  newPlan: templateData[]
): { regenerated: planLockState[]; conflicts: planLockState[] } {
  const regenerated: planLockState[] = [];
  const conflicts: planLockState[] = [];

  for (const lock of currentLocks) {
    if (!lock.isLocked) continue;

    const newData = newPlan.find(t => t.trainNo === lock.trainNo);
    if (!newData) continue;

    const hasChanges = detectFieldChanges(lock.regeneratedData || {}, newData).length > 0;

    if (hasChanges) {
      regenerated.push({
        ...lock,
        regeneratedAt: new Date().toISOString(),
        regeneratedData: newData,
      });
      conflicts.push(lock);
    }
  }

  return { regenerated, conflicts };
}

export function getFieldLabel(field: keyof templateData): string {
  const labels: Record<string, string> = {
    arrivalTime: '到达时间',
    departureTime: '发车时间',
    track: '股道',
    platform: '站台',
    gates: '检票口',
    exitGate: '出站口',
    formation: '编组',
    model: '车型',
    entryCheckOffset: '检票开始偏移',
    exitCheckOffset: '检票结束偏移',
    status: '状态',
  };
  return labels[field] || field;
}

export function formatChangedField(diff: planDifference): string {
  if (!diff.changedFields || diff.changedFields.length === 0) return '';
  const field = diff.changedFields[0];
  return `${getFieldLabel(field.field)} ${field.oldValue || '—'} → ${field.newValue || '—'}`;
}
