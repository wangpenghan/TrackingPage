export { default as TrainCardNorth } from './TrainCardNorth';
export { default as TrainCardSouth } from './TrainCardSouth';

export interface ServiceTag {
  label: string;
}

export type TrainCardStatus = 'normal' | 'track-change' | 'delayed' | 'delayed-track-change' | 'early' | 'one-hour-out' | 'departed' | 'suspended';
export type TrainType = 'sf' | 'tj' | 'zd';
