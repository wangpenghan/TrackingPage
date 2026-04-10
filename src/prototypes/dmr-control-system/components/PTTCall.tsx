import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Clock, AlertCircle, VolumeX, Settings, Check, Radio } from 'lucide-react';
import { CallGroup, CallStatus } from '../types/dmr';

interface PTTCallProps {
  group: CallGroup;
}

const SILENCE_WARNING_TIME = 30;
const AUTO_CLOSE_TIME = 30;

interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
}

export default function PTTCall({ group }: PTTCallProps) {
  const [status, setStatus] = useState<CallStatus>('idle');
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSilenceWarning, setShowSilenceWarning] = useState(false);
  const [autoCloseCountdown, setAutoCloseCountdown] = useState(0);

  const [autoRecordEnabled, setAutoRecordEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('');

  const [dmrStatus, setDmrStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [dmrLastUpdate, setDmrLastUpdate] = useState<Date>(new Date());
  const [isClient, setIsClient] = useState(false);
  
  // 模拟模式状态 - 当没有麦克风时使用
  const [isSimulatedMode, setIsSimulatedMode] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSoundTimeRef = useRef<number>(0);
  const simulatedTimerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFullTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    const secs = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${mins}:${secs}`;
  };

  const getAudioDevices = useCallback(async () => {
    try {
      // 先尝试获取设备列表（不需要权限）
      let devices = await navigator.mediaDevices.enumerateDevices();
      
      // 如果设备标签为空，尝试请求权限
      const hasLabels = devices.some(d => d.label && d.label !== '');
      if (!hasLabels) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          // 重新获取设备列表
          devices = await navigator.mediaDevices.enumerateDevices();
        } catch (permErr) {
          console.warn('无法获取麦克风权限，使用默认设备:', permErr);
        }
      }

      const audioDevices: AudioDevice[] = devices
        .filter(d => d.kind === 'audioinput' || d.kind === 'audiooutput')
        .map(d => ({
          deviceId: d.deviceId,
          label: d.label || `${d.kind === 'audioinput' ? '麦克风' : '扬声器'} ${d.deviceId.slice(0, 8)}`,
          kind: d.kind as 'audioinput' | 'audiooutput',
        }));

      // 如果没有找到任何设备，添加默认设备选项
      if (audioDevices.length === 0) {
        audioDevices.push(
          { deviceId: 'default', label: '默认麦克风', kind: 'audioinput' },
          { deviceId: 'default', label: '默认扬声器', kind: 'audiooutput' }
        );
      }

      setAudioDevices(audioDevices);

      const defaultMic = audioDevices.find(d => d.kind === 'audioinput');
      const defaultSpeaker = audioDevices.find(d => d.kind === 'audiooutput');

      if (defaultMic) setSelectedMicrophone(defaultMic.deviceId);
      if (defaultSpeaker) setSelectedSpeaker(defaultSpeaker.deviceId);
    } catch (err) {
      console.error('获取音频设备失败:', err);
      // 使用默认设备，不显示错误
      const defaultDevices: AudioDevice[] = [
        { deviceId: 'default', label: '默认麦克风', kind: 'audioinput' },
        { deviceId: 'default', label: '默认扬声器', kind: 'audiooutput' }
      ];
      setAudioDevices(defaultDevices);
      setSelectedMicrophone('default');
      setSelectedSpeaker('default');
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const isConnected = Math.random() > 0.2;
      setDmrStatus(isConnected ? 'connected' : 'disconnected');
      setDmrLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsClient(true);
    setDmrLastUpdate(new Date());
  }, []);

  useEffect(() => {
    getAudioDevices();
  }, [getAudioDevices]);

  const startRecording = useCallback(async () => {
    let stream: MediaStream | null = null;
    
    try {
      // 第一次尝试：使用基本约束（不指定设备）
      const basicConstraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      };
      
      stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
      console.log('成功获取默认音频设备');
      setIsSimulatedMode(false);
    } catch (err) {
      console.warn('无法获取默认音频设备:', err);
      
      // 第二次尝试：使用最简约束
      try {
        const simpleConstraints: MediaStreamConstraints = { audio: true };
        stream = await navigator.mediaDevices.getUserMedia(simpleConstraints);
        console.log('使用最简约束成功获取音频设备');
        setIsSimulatedMode(false);
      } catch (err2) {
        console.warn('所有音频获取方式都失败，切换到模拟模式:', err2);
        
        // 进入模拟模式 - 允许用户演示功能而不需要真实麦克风
        setIsSimulatedMode(true);
        startSimulatedRecording();
        return;
      }
    }

    if (!stream) {
      setError('无法获取音频流');
      setStatus('idle');
      return;
    }

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
      lastSoundTimeRef.current = Date.now();
      setDuration(0);
      setError(null);

      startSilenceDetection();
    } catch (recorderErr) {
      console.error('创建 MediaRecorder 失败:', recorderErr);
      // 进入模拟模式
      setIsSimulatedMode(true);
      startSimulatedRecording();
    }
  }, []);

  // 模拟录音模式 - 不需要真实麦克风
  const startSimulatedRecording = useCallback(() => {
    console.log('启动模拟录音模式');
    setIsRecording(true);
    startTimeRef.current = Date.now();
    lastSoundTimeRef.current = Date.now();
    setDuration(0);
    setError(null);
    
    // 模拟静音检测
    simulatedTimerRef.current = setInterval(() => {
      const hasSound = Math.random() > 0.3;
      
      if (hasSound) {
        lastSoundTimeRef.current = Date.now();
      } else {
        const silenceDuration = (Date.now() - lastSoundTimeRef.current) / 1000;
        if (silenceDuration >= SILENCE_WARNING_TIME && !showSilenceWarning) {
          setShowSilenceWarning(true);
          startAutoCloseCountdown();
        }
      }
    }, 1000);
  }, [showSilenceWarning]);

  const stopRecording = useCallback(async () => {
    // 处理模拟模式
    if (isSimulatedMode) {
      console.log('模拟录音结束');
      
      // 停止模拟定时器
      if (simulatedTimerRef.current) {
        clearInterval(simulatedTimerRef.current);
        simulatedTimerRef.current = null;
      }
      
      // 模拟保存录音
      if (autoRecordEnabled) {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = `${now.getHours().toString().padStart(2, '0')}-${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;
        
        // 生成模拟的录音数据
        const simulatedBlob = new Blob(['模拟录音数据'], { type: 'audio/webm' });
        console.log('模拟录音已保存:', `${group.name}_${date}_${time}.webm`, simulatedBlob.size);
      }
      
      setIsRecording(false);
      stopSilenceDetection();
      return;
    }
    
    // 正常模式
    if (!mediaRecorderRef.current) return;

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

          if (autoRecordEnabled) {
            const now = new Date();
            const date = now.toISOString().split('T')[0];
            const time = `${now.getHours().toString().padStart(2, '0')}-${now
              .getMinutes()
              .toString()
              .padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

            console.log('录音已保存:', `${group.name}_${date}_${time}.webm`, audioBlob.size);
          } else {
            console.log('自动录音已禁用，录音未保存');
          }
        } catch (err) {
          console.error('录音处理失败:', err);
          setError('录音处理失败');
        } finally {
          setIsRecording(false);
          stopSilenceDetection();
          resolve();
        }
      };

      mediaRecorderRef.current!.stop();
    });
  }, [autoRecordEnabled, group, isSimulatedMode]);

  const startSilenceDetection = useCallback(() => {
    silenceTimerRef.current = setInterval(() => {
      const hasSound = Math.random() > 0.3;

      if (hasSound) {
        lastSoundTimeRef.current = Date.now();
      } else {
        const silenceDuration = (Date.now() - lastSoundTimeRef.current) / 1000;
        if (silenceDuration >= SILENCE_WARNING_TIME && !showSilenceWarning) {
          setShowSilenceWarning(true);
          startAutoCloseCountdown();
        }
      }
    }, 1000);
  }, [showSilenceWarning]);

  const stopSilenceDetection = useCallback(() => {
    if (silenceTimerRef.current) {
      clearInterval(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setShowSilenceWarning(false);
    if (autoCloseTimerRef.current) {
      clearInterval(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    setAutoCloseCountdown(0);
  }, []);

  const startAutoCloseCountdown = useCallback(() => {
    let countdown = AUTO_CLOSE_TIME;
    setAutoCloseCountdown(countdown);

    autoCloseTimerRef.current = setInterval(() => {
      countdown--;
      setAutoCloseCountdown(countdown);

      if (countdown <= 0) {
        handleAutoClose();
      }
    }, 1000);
  }, []);

  const resetSilenceWarning = useCallback(() => {
    if (showSilenceWarning) {
      lastSoundTimeRef.current = Date.now();
      setShowSilenceWarning(false);
      if (autoCloseTimerRef.current) {
        clearInterval(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
      setAutoCloseCountdown(0);
    }
  }, [showSilenceWarning]);

  const handleAutoClose = useCallback(async () => {
    setStatus('auto-release');
    await stopRecording();
    setStatus('idle');
    setDuration(0);
    setError('长时间无声音，自动关闭频道');
  }, [stopRecording]);

  const handlePressDown = useCallback(async () => {
    if (status === 'recording') return;
    setStatus('pressed');
    setDuration(0);
    startTimeRef.current = Date.now();
    await startRecording();
    setStatus('recording');
  }, [status, startRecording]);

  const handlePressUp = useCallback(async () => {
    if (status !== 'recording' && status !== 'auto-release') return;
    await stopRecording();
    setStatus('idle');
    setDuration(0);
  }, [status, stopRecording]);

  useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(() => {
        if (startTimeRef.current > 0) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setDuration(elapsed);
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
      if (autoCloseTimerRef.current) clearInterval(autoCloseTimerRef.current);
      if (simulatedTimerRef.current) clearInterval(simulatedTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && status === 'idle') {
        e.preventDefault();
        handlePressDown();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (status === 'recording' || status === 'auto-release')) {
        e.preventDefault();
        handlePressUp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [status, handlePressDown, handlePressUp]);

  const getStatusInfo = () => {
    switch (status) {
      case 'idle':
        return { text: '空闲', color: 'text-gray-600', bgColor: 'bg-gray-100' };
      case 'pressed':
        return { text: '正在连接...', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      case 'recording':
        return { text: '通话中', color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'auto-release':
        return { text: '自动关闭', color: 'text-red-600', bgColor: 'bg-red-100' };
      default:
        return { text: '未知', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  const statusInfo = getStatusInfo();
  const microphoneDevices = audioDevices.filter(d => d.kind === 'audioinput');
  const speakerDevices = audioDevices.filter(d => d.kind === 'audiooutput');

  return (
    <div className="relative flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 顶部状态栏 */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
        {/* 左侧：DMR 状态 */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
          dmrStatus === 'connected'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="relative">
            <Radio className={`w-5 h-5 ${
              dmrStatus === 'connected' ? 'text-green-600' : 'text-red-600'
            }`} />
            <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
              dmrStatus === 'connected'
                ? 'bg-green-500 animate-pulse'
                : 'bg-red-500'
            }`} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">DMR</span>
            <span className={`text-xs font-medium ${
              dmrStatus === 'connected' ? 'text-green-600' : 'text-red-600'
            }`}>
              {dmrStatus === 'connected' ? '已连接' : '未连接'}
            </span>
          </div>
          {isClient && (
            <span className="text-xs text-gray-400 font-mono">
              {formatFullTime(dmrLastUpdate)}
            </span>
          )}
        </div>

        {/* 中间：当前分组 */}
        <div className="flex items-center gap-3">
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl ${statusInfo.bgColor} shadow-sm`}>
            <span className={`w-3 h-3 rounded-full shadow-sm ${
              status === 'recording' ? 'bg-green-500 animate-pulse' :
              status === 'idle' ? 'bg-gray-400' :
              'bg-yellow-500'
            }`} />
            <span className={`text-lg font-bold ${statusInfo.color}`}>{statusInfo.text}</span>
          </div>
          <div className="h-8 w-px bg-gray-300" />
          <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
          {isSimulatedMode && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full border border-yellow-300">
              演示模式
            </span>
          )}
        </div>

        {/* 右侧：设置按钮 */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Settings className="w-4 h-4" />
          设置
        </button>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="absolute top-20 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">通话设置</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* 自动录音开关 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col">
                <span className="text-base font-semibold text-gray-900">自动录音</span>
                <span className="text-sm text-gray-500 mt-1">通话结束后自动保存录音</span>
              </div>
              <button
                onClick={() => setAutoRecordEnabled(!autoRecordEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  autoRecordEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  autoRecordEnabled ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            {/* 音频设备选择 */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-gray-900">音频设备</h4>

              {/* 麦克风选择 */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">麦克风</label>
                <select
                  value={selectedMicrophone}
                  onChange={(e) => setSelectedMicrophone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {microphoneDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 扬声器选择 */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">扬声器</label>
                <select
                  value={selectedSpeaker}
                  onChange={(e) => setSelectedSpeaker(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {speakerDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主界面区域 */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative min-h-0 overflow-auto">
        {/* 错误提示 */}
        {error && (
          <div className="w-full max-w-2xl mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 shadow-sm flex-shrink-0">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* 静音警告 */}
        {showSilenceWarning && (
          <div className="w-full max-w-2xl mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg flex items-center gap-3 text-yellow-800 shadow-lg animate-pulse flex-shrink-0">
            <VolumeX className="w-6 h-6 flex-shrink-0" />
            <span className="text-base font-semibold">
              检测到长时间无声音，{autoCloseCountdown} 秒后将自动关闭
            </span>
          </div>
        )}

        {/* 通话时长 */}
        <div className="mb-8">
          <div className="text-6xl font-bold font-mono text-gray-900 tracking-wider tabular-nums">
            {formatTime(duration)}
          </div>
          <div className="text-sm text-gray-500 mt-2 text-center">
            通话时长（秒）
          </div>
        </div>

        {/* PTT 按钮 */}
        <button
          onMouseDown={handlePressDown}
          onMouseUp={handlePressUp}
          onMouseLeave={handlePressUp}
          onTouchStart={handlePressDown}
          onTouchEnd={handlePressUp}
          disabled={status === 'recording' || status === 'auto-release'}
          className={`
            relative w-72 h-72 rounded-full flex flex-col items-center justify-center
            transition-all duration-300 shadow-2xl border-4
            ${
              status === 'recording' || status === 'auto-release'
                ? 'bg-gradient-to-br from-red-500 to-red-600 scale-95 cursor-not-allowed border-red-400 shadow-red-300'
                : 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 hover:scale-105 active:scale-95 cursor-pointer border-blue-400 shadow-blue-400'
            }
          `}
        >
          {/* 外圈光环效果 */}
          {status === 'idle' && (
            <div className="absolute inset-0 rounded-full border-2 border-blue-300 opacity-50 animate-pulse" />
          )}

          {/* 内部背景光晕 */}
          <div className={`absolute inset-4 rounded-full ${
            status === 'recording' || status === 'auto-release'
              ? 'bg-white opacity-10'
              : 'bg-white opacity-5'
          }`} />

          {/* 录音状态下的脉冲效果 */}
          <div className={`absolute inset-0 rounded-full ${
            status === 'recording' ? 'animate-ping opacity-30 bg-red-400' : ''
          }`} />

          {status === 'recording' || status === 'auto-release' ? (
            <MicOff className="w-24 h-24 text-white mb-6 relative z-10" />
          ) : (
            <Mic className="w-24 h-24 text-white mb-6 relative z-10" />
          )}
          <span className="text-white text-2xl font-bold relative z-10">
            {status === 'recording' || status === 'auto-release' ? '松开结束' : '按住说话'}
          </span>
          {status === 'idle' && (
            <span className="text-white text-base mt-3 opacity-80 relative z-10">或按空格键</span>
          )}
        </button>

        {/* 提示信息 */}
        <div className="mt-10 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            {autoRecordEnabled ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">
                <Check className="w-4 h-4" />
                自动录音已启用
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium border border-yellow-200">
                <AlertCircle className="w-4 h-4" />
                自动录音已禁用
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            录音按 {group.name}_日期_时间.webm 格式存储
          </p>
          {isSimulatedMode && (
            <p className="text-sm text-orange-600 font-medium">
              当前为演示模式，未使用真实麦克风
            </p>
          )}
          {status === 'recording' && !showSilenceWarning && (
            <p className="text-sm text-yellow-600 font-medium">
              {SILENCE_WARNING_TIME} 秒无声音将提醒自动关闭
            </p>
          )}
        </div>

        {/* 静音检测状态 */}
        {status === 'recording' && (
          <div className="w-96 mt-8 flex items-center gap-3 bg-white rounded-full px-4 py-3 shadow-md border border-gray-200">
            <VolumeX className={`w-5 h-5 transition-colors ${showSilenceWarning ? 'text-yellow-600' : 'text-gray-400'}`} />
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  showSilenceWarning ? 'bg-yellow-500' : 'bg-green-600'
                }`}
                style={{
                  width: `${Math.min(100, ((Date.now() - lastSoundTimeRef.current) / 1000 / SILENCE_WARNING_TIME) * 100)}%`
                }}
              />
            </div>
            <span className="text-xs font-mono text-gray-600 w-16 text-right">
              {Math.min(SILENCE_WARNING_TIME, Math.floor((Date.now() - lastSoundTimeRef.current) / 1000))}s
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
