export type OperationType = 
  | 'broadcast'
  | 'guide'
  | 'gate'
  | 'checkIn'
  | 'platform'
  | 'exit'
  | 'water'
  | 'sewage'
  | 'parcel'
  | 'meal'
  | 'joint'
  | null;

export interface OperationDrawerProps {
  visible: boolean;
  onClose: () => void;
  trainId: string | null;
  operationType: OperationType;
}
