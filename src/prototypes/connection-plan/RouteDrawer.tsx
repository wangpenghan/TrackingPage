import React, { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import './style.css';

interface RouteStop {
  id: string;
  name: string;
  arrivalTime?: string;
  departureTime?: string;
  stopTime?: string;
  type: 'departure' | 'arrival' | 'intermediate';
  status?: '正序' | '已到达' | '前方到站' | '折道';
}

interface RouteDrawerProps {
  visible: boolean;
  onClose: () => void;
  train: any;
  isArrival: boolean;
  onSwitchTrain?: (train: any, isArrival: boolean) => void;
}

// 完整的车次区间数据
const fullRouteData: Record<string, { departure: string; arrival: string; stops: RouteStop[] }> = {
  'G312': {
    departure: '成都东',
    arrival: '上海虹桥',
    stops: [
      { id: 'g312-1', name: '成都东', departureTime: '08:00', type: 'departure', status: '正序' },
      { id: 'g312-2', name: '大足南', arrivalTime: '08:20', departureTime: '08:22', stopTime: '2分', type: 'intermediate' },
      { id: 'g312-3', name: '重庆东', arrivalTime: '09:00', departureTime: '09:15', stopTime: '15分', type: 'intermediate', status: '已到达' },
      { id: 'g312-4', name: '重庆北', arrivalTime: '09:30', departureTime: '09:35', stopTime: '5分', type: 'intermediate', status: '前方到站' },
      { id: 'g312-5', name: '长寿北', arrivalTime: '10:00', type: 'intermediate' },
      { id: 'g312-6', name: '涪陵北', arrivalTime: '10:20', departureTime: '10:23', stopTime: '3分', type: 'intermediate' },
      { id: 'g312-7', name: '恩施', arrivalTime: '11:20', departureTime: '11:25', stopTime: '5分', type: 'intermediate' },
      { id: 'g312-8', name: '宜昌东', arrivalTime: '12:30', departureTime: '12:36', stopTime: '6分', type: 'intermediate' },
      { id: 'g312-9', name: '荆州', arrivalTime: '13:10', departureTime: '13:13', stopTime: '3分', type: 'intermediate' },
      { id: 'g312-10', name: '汉口', arrivalTime: '14:20', departureTime: '14:25', stopTime: '5分', type: 'intermediate' },
      { id: 'g312-11', name: '武汉', arrivalTime: '14:50', departureTime: '14:54', stopTime: '4分', type: 'intermediate' },
      { id: 'g312-12', name: '合肥南', arrivalTime: '16:10', departureTime: '16:14', stopTime: '4分', type: 'intermediate' },
      { id: 'g312-13', name: '芜湖', arrivalTime: '16:55', type: 'intermediate' },
      { id: 'g312-14', name: '杭州西', arrivalTime: '18:00', departureTime: '18:03', stopTime: '3分', type: 'intermediate' },
      { id: 'g312-15', name: '上海虹桥', arrivalTime: '18:30', type: 'arrival' },
    ]
  },
  'G202': {
    departure: '上海虹桥',
    arrival: '重庆东',
    stops: [
      { id: 'g202-1', name: '上海虹桥', departureTime: '06:00', type: 'departure', status: '已到达' },
      { id: 'g202-2', name: '杭州西', arrivalTime: '06:50', departureTime: '06:53', stopTime: '3分', type: 'intermediate' },
      { id: 'g202-3', name: '芜湖', arrivalTime: '07:55', type: 'intermediate' },
      { id: 'g202-4', name: '合肥南', arrivalTime: '08:40', departureTime: '08:44', stopTime: '4分', type: 'intermediate', status: '已到达' },
      { id: 'g202-5', name: '武汉', arrivalTime: '10:00', departureTime: '10:05', stopTime: '5分', type: 'intermediate' },
      { id: 'g202-6', name: '汉口', arrivalTime: '10:30', departureTime: '10:33', stopTime: '3分', type: 'intermediate' },
      { id: 'g202-7', name: '宜昌东', arrivalTime: '12:00', departureTime: '12:06', stopTime: '6分', type: 'intermediate' },
      { id: 'g202-8', name: '恩施', arrivalTime: '13:10', departureTime: '13:14', stopTime: '4分', type: 'intermediate' },
      { id: 'g202-9', name: '石柱县', arrivalTime: '14:00', type: 'intermediate' },
      { id: 'g202-10', name: '涪陵北', arrivalTime: '14:30', departureTime: '14:33', stopTime: '3分', type: 'intermediate' },
      { id: 'g202-11', name: '长寿北', arrivalTime: '14:50', type: 'intermediate' },
      { id: 'g202-12', name: '重庆北', arrivalTime: '15:20', departureTime: '15:25', stopTime: '5分', type: 'intermediate', status: '前方到站' },
      { id: 'g202-13', name: '重庆东', arrivalTime: '15:50', type: 'arrival' },
    ]
  },
  'G1542': {
    departure: '重庆西',
    arrival: '广州南',
    stops: [
      { id: 'g1542-1', name: '重庆西', departureTime: '09:30', type: 'departure', status: '已到达' },
      { id: 'g1542-2', name: '重庆东', arrivalTime: '09:50', departureTime: '10:00', stopTime: '10分', type: 'intermediate', status: '已到达' },
      { id: 'g1542-3', name: '綦江', arrivalTime: '10:15', departureTime: '10:17', stopTime: '2分', type: 'intermediate' },
      { id: 'g1542-4', name: '遵义', arrivalTime: '11:00', departureTime: '11:03', stopTime: '3分', type: 'intermediate', status: '前方到站' },
      { id: 'g1542-5', name: '贵阳东', arrivalTime: '12:10', departureTime: '12:18', stopTime: '8分', type: 'intermediate' },
      { id: 'g1542-6', name: '贵定北', arrivalTime: '12:35', departureTime: '12:37', stopTime: '2分', type: 'intermediate' },
      { id: 'g1542-7', name: '凯里南', arrivalTime: '13:05', type: 'intermediate' },
      { id: 'g1542-8', name: '三穗', arrivalTime: '13:25', type: 'intermediate' },
      { id: 'g1542-9', name: '怀化南', arrivalTime: '14:10', departureTime: '14:15', stopTime: '5分', type: 'intermediate' },
      { id: 'g1542-10', name: '邵阳北', arrivalTime: '14:55', type: 'intermediate' },
      { id: 'g1542-11', name: '娄底南', arrivalTime: '15:15', departureTime: '15:18', stopTime: '3分', type: 'intermediate' },
      { id: 'g1542-12', name: '湘潭北', arrivalTime: '15:40', type: 'intermediate' },
      { id: 'g1542-13', name: '长沙南', arrivalTime: '15:55', departureTime: '16:01', stopTime: '6分', type: 'intermediate' },
      { id: 'g1542-14', name: '株洲西', arrivalTime: '16:10', type: 'intermediate' },
      { id: 'g1542-15', name: '衡阳东', arrivalTime: '16:40', departureTime: '16:43', stopTime: '3分', type: 'intermediate' },
      { id: 'g1542-16', name: '郴州西', arrivalTime: '17:15', type: 'intermediate' },
      { id: 'g1542-17', name: '韶关', arrivalTime: '17:50', type: 'intermediate' },
      { id: 'g1542-18', name: '广州南', arrivalTime: '18:30', type: 'arrival' },
    ]
  },
  '0G8608': {
    departure: '重庆西',
    arrival: '重庆东',
    stops: [
      { id: '0g8608-1', name: '重庆西', departureTime: '09:30', type: 'departure', status: '已到达' },
      { id: '0g8608-2', name: '重庆东', arrivalTime: '10:00', type: 'arrival' },
    ]
  },
  'G8608': {
    departure: '重庆西',
    arrival: '武汉',
    stops: [
      { id: 'g8608-1', name: '重庆西', departureTime: '10:00', type: 'departure', status: '已到达' },
      { id: 'g8608-2', name: '重庆东', arrivalTime: '10:25', departureTime: '10:37', stopTime: '12分', type: 'intermediate', status: '已到达' },
      { id: 'g8608-3', name: '重庆北', arrivalTime: '10:45', departureTime: '10:49', stopTime: '4分', type: 'intermediate', status: '前方到站' },
      { id: 'g8608-4', name: '江北机场', arrivalTime: '10:58', departureTime: '11:00', stopTime: '2分', type: 'intermediate' },
      { id: 'g8608-5', name: '垫江', arrivalTime: '11:30', type: 'intermediate' },
      { id: 'g8608-6', name: '梁平南', arrivalTime: '11:50', type: 'intermediate' },
      { id: 'g8608-7', name: '万州北', arrivalTime: '12:15', departureTime: '12:20', stopTime: '5分', type: 'intermediate' },
      { id: 'g8608-8', name: '恩施', arrivalTime: '13:15', departureTime: '13:18', stopTime: '3分', type: 'intermediate' },
      { id: 'g8608-9', name: '宜昌东', arrivalTime: '14:10', departureTime: '14:16', stopTime: '6分', type: 'intermediate' },
      { id: 'g8608-10', name: '荆州', arrivalTime: '14:50', type: 'intermediate' },
      { id: 'g8608-11', name: '汉口', arrivalTime: '15:30', departureTime: '15:35', stopTime: '5分', type: 'intermediate' },
      { id: 'g8608-12', name: '武汉', arrivalTime: '16:20', type: 'arrival' },
    ]
  },
  'G201': {
    departure: '重庆东',
    arrival: '上海虹桥',
    stops: [
      { id: 'g201-1', name: '重庆东', departureTime: '17:07', type: 'departure', status: '正序' },
      { id: 'g201-2', name: '重庆北', arrivalTime: '17:30', departureTime: '17:35', stopTime: '5分', type: 'intermediate' },
      { id: 'g201-3', name: '长寿北', arrivalTime: '18:00', type: 'intermediate' },
      { id: 'g201-4', name: '涪陵北', arrivalTime: '18:20', departureTime: '18:23', stopTime: '3分', type: 'intermediate' },
      { id: 'g201-5', name: '恩施', arrivalTime: '19:20', departureTime: '19:25', stopTime: '5分', type: 'intermediate' },
      { id: 'g201-6', name: '宜昌东', arrivalTime: '20:30', departureTime: '20:36', stopTime: '6分', type: 'intermediate' },
      { id: 'g201-7', name: '荆州', arrivalTime: '21:10', departureTime: '21:13', stopTime: '3分', type: 'intermediate' },
      { id: 'g201-8', name: '汉口', arrivalTime: '22:20', departureTime: '22:25', stopTime: '5分', type: 'intermediate' },
      { id: 'g201-9', name: '武汉', arrivalTime: '22:50', departureTime: '22:54', stopTime: '4分', type: 'intermediate' },
      { id: 'g201-10', name: '合肥南', arrivalTime: '23:55', departureTime: '23:59', stopTime: '4分', type: 'intermediate' },
      { id: 'g201-11', name: '杭州西', arrivalTime: '00:55', departureTime: '00:58', stopTime: '3分', type: 'intermediate' },
      { id: 'g201-12', name: '上海虹桥', arrivalTime: '01:30', type: 'arrival' },
    ]
  },
  'G666': {
    departure: '北京西',
    arrival: '重庆东',
    stops: [
      { id: 'g666-1', name: '北京西', departureTime: '12:00', type: 'departure', status: '已到达' },
      { id: 'g666-2', name: '石家庄', arrivalTime: '12:50', departureTime: '12:53', stopTime: '3分', type: 'intermediate' },
      { id: 'g666-3', name: '郑州东', arrivalTime: '13:50', departureTime: '13:54', stopTime: '4分', type: 'intermediate' },
      { id: 'g666-4', name: '洛阳龙门', arrivalTime: '14:30', type: 'intermediate' },
      { id: 'g666-5', name: '华山北', arrivalTime: '15:10', type: 'intermediate' },
      { id: 'g666-6', name: '西安北', arrivalTime: '15:40', departureTime: '15:45', stopTime: '5分', type: 'intermediate', status: '已到达' },
      { id: 'g666-7', name: '汉中', arrivalTime: '16:30', departureTime: '16:33', stopTime: '3分', type: 'intermediate' },
      { id: 'g666-8', name: '广元', arrivalTime: '17:00', departureTime: '17:03', stopTime: '3分', type: 'intermediate', status: '前方到站' },
      { id: 'g666-9', name: '重庆西', arrivalTime: '17:40', type: 'intermediate' },
      { id: 'g666-10', name: '重庆东', arrivalTime: '18:00', type: 'arrival' },
    ]
  },
  '0G666': {
    departure: '重庆东',
    arrival: '重庆西',
    stops: [
      { id: '0g666-1', name: '重庆东', departureTime: '18:30', type: 'departure', status: '正序' },
      { id: '0g666-2', name: '重庆西', arrivalTime: '18:50', type: 'arrival' },
    ]
  },
};



// 根据车次获取完整区间数据（不作拆分）
const getRouteData = (trainNo: string) => {
  return fullRouteData[trainNo] || null;
};

const CURRENT_STATION = '重庆东';

const statusStyles: Record<string, { bg: string; text: string; border?: string }> = {
  '正序': { bg: '#e0f2fe', text: '#0369a1', border: '1px solid #7dd3fc' },
  '已到达': { bg: '#dcfce7', text: '#166534', border: '1px solid #86efac' },
  '前方到站': { bg: '#fef9c3', text: '#854d0e', border: '1px solid #fde047' },
  '折道': { bg: '#fee2e2', text: '#991b1b', border: '1px solid #fca5a5' },
};

export const RouteDrawer: React.FC<RouteDrawerProps> = ({ visible, onClose, train, isArrival, onSwitchTrain }) => {
  const currentTrainNo = isArrival ? train?.arrivalTrainNo : train?.departureTrainNo;
  const connectedTrainNo = isArrival ? train?.departureTrainNo : train?.arrivalTrainNo;
  
  // 获取当前车次的区间数据
  const currentRoute = currentTrainNo ? getRouteData(currentTrainNo) : null;
  const connectedRoute = connectedTrainNo ? getRouteData(connectedTrainNo) : null;
  
  const [routeStops, setRouteStops] = useState<RouteStop[]>(currentRoute?.stops || []);
  const [routeInterval, setRouteInterval] = useState<{ departure: string; arrival: string } | null>(null);

  useEffect(() => {
    if (currentRoute) {
      setRouteStops(currentRoute.stops);
      setRouteInterval({ departure: currentRoute.departure, arrival: currentRoute.arrival });
    }
  }, [currentTrainNo, isArrival]);

  const isInspection = (trainNo: string) => trainNo.startsWith('0') || trainNo.startsWith('DJ');
  const isConnectedTrain = train ? train.arrivalTrainNo !== train.departureTrainNo : false;
  const isTerminationTrain = isArrival && train?.arrivalTrainNo !== train?.departureTrainNo;

  const getTrainTypeClass = (trainNo: string, isArr: boolean, arrivalNo: string, departureNo: string): string => {
    if (trainNo.startsWith('0') || trainNo.startsWith('DJ')) return 'gray';
    if (arrivalNo === departureNo) return 'purple';
    if (isArr) return 'cyan';
    return 'yellow';
  };

  const currentTrainTypeClass = getTrainTypeClass(currentTrainNo || '', isArrival, train?.arrivalTrainNo || '', train?.departureTrainNo || '');
  const connectedTrainTypeClass = getTrainTypeClass(connectedTrainNo || '', !isArrival, train?.arrivalTrainNo || '', train?.departureTrainNo || '');

  return (
    visible && (
      <div className="drawer-overlay" onClick={onClose}>
        <div className="drawer-content route-drawer" onClick={e => e.stopPropagation()}>
          <div className="drawer-header">
            <div className="drawer-header-left">
              <h3 className="drawer-title">途径站信息</h3>
            </div>
            <div className="drawer-header-right">
              {train && (
                <div className="train-info-badge-group">
                  <span className={`train-pill ${currentTrainTypeClass}`}>
                    {currentTrainNo}
                  </span>
                  {isConnectedTrain && (
                    <>
                      <span className="connection-label">
                        {isTerminationTrain ? '接续' : '折返'}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                      <span 
                        className={`train-pill-small ${connectedTrainTypeClass}`}
                        title={isInspection(connectedTrainNo || '') ? '动检车' : `点击跳转到${isArrival ? '始发车' : '终到车'}`}
                        onClick={() => onSwitchTrain && onSwitchTrain(train, !isArrival)}
                      >
                        {connectedTrainNo}
                      </span>
                    </>
                  )}
                </div>
              )}
              <button className="drawer-close-btn" onClick={onClose}>
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="route-section">
            <div className="route-section-title">运行区间</div>
            <div className="route-interval">
              <div className="route-point departure">
                <span className="route-point-label">始发</span>
                <div className="route-point-icon">
                  <MapPin size={16} />
                </div>
                <span className="route-point-name">{routeInterval?.departure || '-'}</span>
              </div>
              <div className="route-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
              <div className="route-point arrival">
                <span className="route-point-label">终到</span>
                <div className="route-point-icon">
                  <MapPin size={16} />
                </div>
                <span className="route-point-name">{routeInterval?.arrival || '-'}</span>
              </div>
            </div>
          </div>

          <div className="route-section">
            <div className="route-section-title">途径站详情</div>
            <div className="route-stops-header">
              <span className="route-header-time">到点</span>
              <span className="route-header-depart">发点</span>
              <span className="route-header-name">站名</span>
              <span className="route-header-stop">站停</span>
            </div>
            <div className="route-stops-list">
              {routeStops.map(stop => {
                const isPassThrough = stop.type === 'intermediate' && !stop.stopTime;
                const isCurrentStation = stop.name === CURRENT_STATION;
                return (
                  <div 
                    key={stop.id} 
                    className={`route-stop-item ${stop.type} ${stop.status ? `status-${stop.status}` : ''} ${isPassThrough ? 'pass-through' : ''} ${isCurrentStation ? 'current-station' : ''}`}
                    style={stop.status ? statusStyles[stop.status] : {}}
                  >
                    <span className="route-stop-time">
                      {stop.type === 'departure' ? (
                        <span className="type-badge departure">始发站</span>
                      ) : stop.type === 'arrival' ? (
                        <span className="type-badge arrival">终到站</span>
                      ) : (
                        stop.arrivalTime || '-'
                      )}
                    </span>
                    <span className="route-stop-depart">
                      {stop.type === 'departure' ? (
                        <span className="depart-time">{stop.departureTime || '-'}</span>
                      ) : stop.type === 'arrival' ? (
                        '-'
                      ) : isPassThrough ? (
                        <span className="pass-through-badge">通过</span>
                      ) : (
                        <span className="depart-time">{stop.departureTime || '-'}</span>
                      )}
                    </span>
                    <div className="route-stop-info">
                      <span className="route-stop-name">{stop.name}</span>
                      {isCurrentStation && (
                        <span className="current-station-badge">本站</span>
                      )}
                      {stop.status && stop.type !== 'departure' && stop.type !== 'arrival' && !isCurrentStation && (
                        <span className="status-badge">{stop.status}</span>
                      )}
                    </div>
                    <span className="route-stop-duration">
                      {isPassThrough ? (
                        <span className="pass-through-text">通过</span>
                      ) : (
                        stop.stopTime || '-'
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    )
  );
};