import React, { useState, useEffect } from 'react';
import { X, Eye, RotateCcw, RefreshCw, Edit3, Play, Square, Scan, Repeat } from 'lucide-react';
import './style.css';

interface GuideItem {
  id: string;
  name: string;
  area: 'entrance' | 'waiting' | 'platform' | 'exit';
  ocrStatus: '正常' | '异常' | '不支持';
  openTime: string;
  closeTime: string;
  status: '正在执行' | '未执行' | '停止执行';
  mode: 'auto' | 'manual';
}

interface GuideDrawerProps {
  visible: boolean;
  onClose: () => void;
  train: any;
  onSwitchTrain?: (train: any, isArrival: boolean) => void;
  isArrival: boolean;
}

const departureGuideData: GuideItem[] = [
  {
    id: 'd1',
    name: '进站口大屏',
    area: 'entrance',
    ocrStatus: '正常',
    openTime: '03/20 03:18',
    closeTime: '03/20 11:23',
    status: '正在执行',
    mode: 'auto'
  },
  {
    id: 'd2',
    name: '候车室综合屏',
    area: 'waiting',
    ocrStatus: '正常',
    openTime: '03/20 03:23',
    closeTime: '03/20 11:28',
    status: '正在执行',
    mode: 'manual'
  },
  {
    id: 'd3',
    name: '检票口引导屏',
    area: 'waiting',
    ocrStatus: '正常',
    openTime: '03/20 03:18',
    closeTime: '03/20 11:23',
    status: '正在执行',
    mode: 'auto'
  },
  {
    id: 'd4',
    name: '1号候车屏',
    area: 'waiting',
    ocrStatus: '异常',
    openTime: '03/20 03:18',
    closeTime: '03/20 11:23',
    status: '未执行',
    mode: 'auto'
  },
  {
    id: 'd5',
    name: '站台引导屏',
    area: 'platform',
    ocrStatus: '不支持',
    openTime: '03/20 03:18',
    closeTime: '03/20 11:23',
    status: '正在执行',
    mode: 'auto'
  }
];

const arrivalGuideData: GuideItem[] = [
  {
    id: 'a1',
    name: '站台引导屏',
    area: 'platform',
    ocrStatus: '正常',
    openTime: '03/20 03:18',
    closeTime: '03/20 11:23',
    status: '正在执行',
    mode: 'auto'
  },
  {
    id: 'a2',
    name: '出站口引导屏',
    area: 'exit',
    ocrStatus: '正常',
    openTime: '03/20 03:18',
    closeTime: '03/20 11:23',
    status: '正在执行',
    mode: 'auto'
  },
  {
    id: 'a3',
    name: '出站口大屏',
    area: 'exit',
    ocrStatus: '异常',
    openTime: '03/20 03:18',
    closeTime: '03/20 11:23',
    status: '停止执行',
    mode: 'manual'
  },
  {
    id: 'a4',
    name: '换乘引导屏',
    area: 'platform',
    ocrStatus: '正常',
    openTime: '03/20 03:18',
    closeTime: '03/20 11:23',
    status: '正在执行',
    mode: 'auto'
  },
  {
    id: 'a5',
    name: '出站通道屏',
    area: 'exit',
    ocrStatus: '不支持',
    openTime: '03/20 03:18',
    closeTime: '03/20 11:23',
    status: '正在执行',
    mode: 'auto'
  }
];

const ocrStatusColors: Record<string, { bg: string; text: string }> = {
  '正常': { bg: '#dcfce7', text: '#16a34a' },
  '异常': { bg: '#fee2e2', text: '#dc2626' },
  '不支持': { bg: '#f3f4f6', text: '#6b7280' }
};

const statusColors: Record<string, string> = {
  '正在执行': '#16a34a',
  '未执行': '#6b7280',
  '停止执行': '#dc2626'
};

const areaLabels: Record<string, string> = {
  'all': '全部',
  'entrance': '进站口',
  'waiting': '候车室',
  'platform': '站台',
  'exit': '出站口'
};

export const GuideDrawer: React.FC<GuideDrawerProps> = ({ 
  visible, 
  onClose, 
  train,
  onSwitchTrain,
  isArrival
}) => {
  const [activeArea, setActiveArea] = useState<'all' | 'entrance' | 'waiting' | 'platform' | 'exit'>('all');
  const [guideData, setGuideData] = useState<GuideItem[]>(isArrival ? arrivalGuideData : departureGuideData);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [readbackModalVisible, setReadbackModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<GuideItem | null>(null);

  useEffect(() => {
    setGuideData(isArrival ? arrivalGuideData : departureGuideData);
    setActiveArea('all');
  }, [isArrival]);

  const areaStats = {
    all: guideData.length,
    entrance: guideData.filter(item => item.area === 'entrance').length,
    waiting: guideData.filter(item => item.area === 'waiting').length,
    platform: guideData.filter(item => item.area === 'platform').length,
    exit: guideData.filter(item => item.area === 'exit').length
  };

  const handleToggleMode = (id: string) => {
    setGuideData(prev => prev.map(item => 
      item.id === id 
        ? { ...item, mode: item.mode === 'auto' ? 'manual' : 'auto' }
        : item
    ));
  };

  const handleToggleStatus = (id: string) => {
    setGuideData(prev => prev.map(item => 
      item.id === id 
        ? { ...item, status: item.status === '正在执行' ? '停止执行' : '正在执行' }
        : item
    ));
  };

  const isInspection = (trainNo: string) => trainNo.startsWith('0') || trainNo.startsWith('DJ');
  const isConnectedTrain = train ? (!isInspection(train.arrivalTrainNo) && !isInspection(train.departureTrainNo) && train.arrivalTrainNo !== train.departureTrainNo) : false;
  const isTerminationTrain = isArrival && train?.arrivalTrainNo !== train?.departureTrainNo && !isInspection(train?.arrivalTrainNo || '');
  const connectedTrainNo = train ? (isArrival ? train.departureTrainNo : train.arrivalTrainNo) : '';
  
  const getTrainTypeClass = (trainNo: string, isArr: boolean, arrivalNo: string, departureNo: string): string => {
    if (trainNo.startsWith('0') || trainNo.startsWith('DJ')) {
      return 'gray';
    }
    if (arrivalNo === departureNo) {
      return 'purple';
    }
    if (isArr) {
      return 'cyan';
    }
    return 'yellow';
  };
  
  const currentTrainNo = isArrival ? train?.arrivalTrainNo : train?.departureTrainNo;
  const currentTrainTypeClass = train ? getTrainTypeClass(currentTrainNo || '', isArrival, train.arrivalTrainNo, train.departureTrainNo) : '';
  const connectedTrainTypeClass = train ? getTrainTypeClass(connectedTrainNo, !isArrival, train.arrivalTrainNo, train.departureTrainNo) : '';

  if (!visible) return null;

  const filteredData = activeArea === 'all' 
    ? guideData 
    : guideData.filter(item => item.area === activeArea);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content guide-drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-header-left">
            <h3 className="drawer-title">引导计划</h3>
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
                      className={`train-pill-small ${connectedTrainTypeClass} clickable`}
                      title={`点击跳转到${isArrival ? '始发车' : '终到车'}`}
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

        <div className="guide-area-tabs">
          {(['all', 'entrance', 'waiting', 'platform', 'exit'] as const).map(area => (
            <button 
              key={area}
              className={`guide-area-tab ${activeArea === area ? 'active' : ''}`}
              onClick={() => setActiveArea(area)}
            >
              {areaLabels[area]} ({areaStats[area]})
            </button>
          ))}
        </div>

        <div className="drawer-body">
          <div className="guide-list">
            {filteredData.map(item => (
              <div key={item.id} className="guide-card">
                <div className="guide-card-header">
                  <div className="guide-card-title">
                    <span className="guide-icon">🖥️</span>
                    <span>{item.name}</span>
                  </div>
                  <span 
                    className="ocr-status"
                    style={{ 
                      background: ocrStatusColors[item.ocrStatus].bg,
                      color: ocrStatusColors[item.ocrStatus].text
                    }}
                  >
                    <Scan size={12} />
                    OCR{item.ocrStatus}
                  </span>
                </div>
                
                <div className="guide-card-time">
                  <div className="guide-card-time-left">
                    <div className="time-item">
                      <span className="time-label open-label">开</span>
                      <span className="time-value green">{item.openTime}</span>
                    </div>
                    <span className="time-arrow">→</span>
                    <div className="time-item">
                      <span className="time-label close-label">关</span>
                      <span className="time-value gray">{item.closeTime}</span>
                    </div>
                  </div>
                  <span className="guide-status" style={{ color: statusColors[item.status] }}>
                    {item.status}
                  </span>
                </div>

                <div className="guide-card-actions">
                  <button 
                    className={`mode-toggle ${item.mode === 'auto' ? 'auto' : 'manual'}`}
                    onClick={() => handleToggleMode(item.id)}
                  >
                    {item.mode === 'auto' ? '自动' : '手动'}
                  </button>
                  <span className="actions-divider">|</span>
                  <button 
                    className="guide-action-btn" 
                    title="预览"
                    onClick={() => {
                      setCurrentItem(item);
                      setPreviewModalVisible(true);
                    }}
                  >
                    <Eye size={14} />
                  </button>
                  <button 
                    className={`guide-action-btn ${item.ocrStatus === '不支持' ? 'disabled' : ''}`} 
                    title="回读"
                    disabled={item.ocrStatus === '不支持'}
                    onClick={() => {
                      if (item.ocrStatus !== '不支持') {
                        setCurrentItem(item);
                        setReadbackModalVisible(true);
                      }
                    }}
                  >
                    <Repeat size={14} />
                  </button>
                  <button className="guide-action-btn" title="刷新">
                    <RefreshCw size={14} />
                  </button>
                  <button 
                    className={`guide-action-btn plan-intervention ${item.status === '正在执行' ? 'stop' : 'start'}`}
                    onClick={() => handleToggleStatus(item.id)}
                    title={item.status === '正在执行' ? '停止执行' : '开始执行'}
                  >
                    {item.status === '正在执行' ? <Square size={14} /> : <Play size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {previewModalVisible && (
          <div className="guide-modal-overlay" onClick={() => setPreviewModalVisible(false)}>
            <div className="guide-modal" onClick={e => e.stopPropagation()}>
              <div className="guide-modal-header">
                <span>{currentItem?.name} - 实际显示效果</span>
                <button className="guide-modal-close" onClick={() => setPreviewModalVisible(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="guide-modal-content">
                <div className="guide-screen-preview">
                  <div className="train-number">G1234</div>
                  <div className="train-info">
                    <span className="car-number">3车</span>
                    <span className="route">北京西-郑州东</span>
                    <span className="departure-time">10:30开</span>
                  </div>
                  <div className="guide-message">请在黄色地标排队等候</div>
                  <div className="guide-message">请在黄色地标排队等候</div>
                </div>
              </div>
              <div className="guide-modal-footer">
                <button className="guide-modal-close-btn" onClick={() => setPreviewModalVisible(false)}>关闭</button>
              </div>
            </div>
          </div>
        )}

        {readbackModalVisible && (
          <div className="guide-modal-overlay" onClick={() => setReadbackModalVisible(false)}>
            <div className="guide-modal" onClick={e => e.stopPropagation()}>
              <div className="guide-modal-header">
                <span>{currentItem?.name} - 实际显示效果</span>
                <button className="guide-modal-close" onClick={() => setReadbackModalVisible(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="guide-modal-content">
                <div className="guide-screen-preview">
                  <div className="train-number">G1234</div>
                  <div className="train-info">
                    <span className="car-number">3车</span>
                    <span className="route">北京西-郑州东</span>
                    <span className="departure-time">10:30开</span>
                  </div>
                  <div className="guide-message">请在黄色地标排队等候</div>
                  <div className="guide-message">请在黄色地标排队等候</div>
                </div>
              </div>
              <div className="guide-modal-footer">
                <button className="guide-modal-close-btn" onClick={() => setReadbackModalVisible(false)}>关闭</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};