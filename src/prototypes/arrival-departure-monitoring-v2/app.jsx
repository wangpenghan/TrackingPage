/**
 * 到发盯控系统 - 独立应用
 * 双击 app.html 即可在浏览器中打开
 */

const { useState, useEffect, useMemo, useCallback } = React;
const { 
  Button, Modal, Drawer, Switch, Tooltip, Badge, Tag, 
  Select, Input, Checkbox, Radio, Tabs, Table, Form,
  message, Popover, Divider
} = antd;
const {
  Search, Filter, Settings, Bell, Moon, Sun, Maximize2, Minimize2,
  Train, Clock, AlertCircle, CheckCircle2, XCircle, AlertTriangle,
  ChevronDown, ChevronUp, MoreHorizontal, Eye, EyeOff, Volume2, VolumeX,
  MapPin, Users, Activity, Zap, RefreshCw, Menu, X, ArrowRight,
  Droplets, Wind, Trash2, FileText, Radio as RadioIcon, Speaker,
  LayoutGrid, List, Columns3, BarChart3, TrendingUp, AlertOctagon,
  Shield, ShieldAlert, ShieldCheck, ShieldX, Siren, Megaphone,
  Headphones, Mic, MicOff, Phone, PhoneOff, Video, VideoOff,
  Monitor, MonitorOff, Cast, Airplay, Wifi, WifiOff, Bluetooth,
  Battery, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium,
  Power, PowerOff, LogOut, LogIn, User, UserPlus, UserMinus,
  Users as UsersIcon, UserCheck, UserX, Lock, Unlock, Key,
  Mail, MessageSquare, MessageCircle, Send, Share2, Link,
  Paperclip, Image, File, Folder, FolderOpen, Archive,
  Trash, Delete, Edit, Copy, Clipboard, ClipboardCheck,
  Scissors, Plus, Minus, Divide, Multiply, Equal, Percent,
  Calculator, Calendar, Clock as ClockIcon, Timer, Hourglass,
  Watch, AlarmClock, History, RotateCcw, RotateCw, Undo, Redo,
  Save, Download, Upload, Cloud, CloudOff, CloudRain, CloudSnow,
  CloudLightning, Sun as SunIcon, Moon as MoonIcon, Star,
  Heart, ThumbsUp, ThumbsDown, Smile, Frown, Meh, Laugh,
  HelpCircle, Info, AlertCircle as AlertCircleIcon, XOctagon,
  CheckSquare, Square, Circle, CheckCircle, XCircle as XCircleIcon,
  Play, Pause, Stop, SkipBack, SkipForward, Rewind, FastForward,
  Repeat, Shuffle, ListMusic, Mic2, Headphones as HeadphonesIcon,
  Volume, Volume1, Volume2, VolumeX as VolumeXIcon, Music, Film,
  Tv, Monitor as MonitorIcon, Smartphone, Tablet, Laptop, Desktop,
  Printer, Scanner, Mouse, Keyboard, Gamepad, Joystick, Disc,
  Database, Server, HardDrive, Cpu, CircuitBoard, Wifi as WifiIcon,
  Bluetooth as BluetoothIcon, Usb, Hdmi, Battery as BatteryIcon,
  Plug, Zap as ZapIcon, Flame, Thermometer, Droplet, Wind as WindIcon,
  Cloud as CloudIcon, SunDim, Cloudy, CloudRainWind, CloudSnow as CloudSnowIcon,
  CloudLightning as CloudLightningIcon, Tornado, Hurricane, Earthquake,
  Waves, Tsunami, Volcano, Mountain, TreePine, TreeDeciduous, Flower,
  Leaf, Sprout, Recycle, Trash as TrashIcon, Oil, Fuel, Gauge,
  GaugeCircle, GaugeSquare, Activity as ActivityIcon, Pulse, HeartPulse,
  Brain, Bone, Stethoscope, Syringe, Pill, Capsule, Tablets, Flask,
  Microscope, Dna, Atom, Orbit, Rocket, Satellite, Telescope,
  Binoculars, Compass, Map as MapIcon, Navigation, Locate, LocateFixed,
  MapPin as MapPinIcon, Navigation2, NavigationOff, Anchor, Ship,
  Sailboat, Anchor as AnchorIcon, LifeBuoy, Fish, Bird, Cat, Dog,
  Rabbit, Turtle, Bug, Butterfly, Bee, Ant, Spider, Snail, Worm,
  Shell, FishSymbol, Bird as BirdIcon, Egg, Feather, Bone as BoneIcon,
  Skull, Ghost, Alien, Rocket as RocketIcon, Planet, Moon as MoonIcon2,
  Sun as SunIcon2, Star as StarIcon, Sparkles, Zap as ZapIcon2,
  Flame as FlameIcon, Snowflake, Thermometer as ThermometerIcon,
  Droplets as DropletsIcon, Umbrella, CloudRain as CloudRainIcon,
  CloudSnow as CloudSnowIcon2, CloudLightning as CloudLightningIcon2,
  Tornado as TornadoIcon, Wind as WindIcon2, Waves as WavesIcon,
  Sunset, Sunrise, Moonrise, Moonset, Eclipse, Rainbow, CloudHail,
  CloudFog, CloudSun, CloudMoon, CloudLightning as CloudLightningIcon3,
  Snowflake as SnowflakeIcon, ThermometerSnowflake, ThermometerSun,
  Droplet as DropletIcon, Droplets as DropletsIcon2, Paintbrush,
  PaintBucket, Palette, PenTool, Pencil, Eraser, Scissors as ScissorsIcon,
  Ruler, Compass as CompassIcon, Square as SquareIcon, Circle as CircleIcon,
  Triangle, Pentagon, Hexagon, Octagon, Star as StarIcon2, Heart as HeartIcon,
  Diamond, Gem, Crown, Trophy, Medal, Award, Certificate, Badge as BadgeIcon,
  Bookmark, Flag, FlagTriangle, FlagOff, Pin, PinOff, Paperclip as PaperclipIcon,
  Link as LinkIcon, Unlink, ExternalLink, Share as ShareIcon, Share2 as Share2Icon,
  Send as SendIcon, Mail as MailIcon, Inbox, Archive as ArchiveIcon,
  Trash2 as Trash2Icon, Delete as DeleteIcon, Edit as EditIcon, Copy as CopyIcon,
  Clipboard as ClipboardIcon, ClipboardCheck as ClipboardCheckIcon,
  ClipboardList, ClipboardX, ClipboardType, ClipboardPaste, Cut,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, AlignStart,
  AlignEnd, AlignHorizontalDistributeCenter, AlignHorizontalDistributeStart,
  AlignHorizontalDistributeEnd, AlignVerticalDistributeCenter,
  AlignVerticalDistributeStart, AlignVerticalDistributeEnd, Grid,
  Grid3X3, Grid2X2, Layout, LayoutTemplate, LayoutGrid as LayoutGridIcon,
  LayoutList, LayoutDashboard, LayoutPanelLeft, LayoutPanelTop,
  Columns, Columns2, Columns3 as Columns3Icon, Columns4, Rows2, Rows3, Rows4,
  Table as TableIcon, Table2, TableProperties, Frame, Framer, Figma,
  Sketch, PenTool as PenToolIcon, Vector, Polygon, Line, CurlyBraces,
  Brackets, Parentheses, Code, Code2, Terminal, Command, Keyboard as KeyboardIcon,
  Mouse as MouseIcon, Joystick as JoystickIcon, Gamepad as GamepadIcon,
  Headphones as HeadphonesIcon2, Speaker as SpeakerIcon, SpeakerOff,
  Volume as VolumeIcon, Volume1 as Volume1Icon, Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon2, Mic as MicIcon, MicOff as MicOffIcon,
  Phone as PhoneIcon, PhoneOff as PhoneOffIcon, Video as VideoIcon,
  VideoOff as VideoOffIcon, Monitor as MonitorIcon2, MonitorOff as MonitorOffIcon,
  Cast as CastIcon, Airplay as AirplayIcon, Wifi as WifiIcon2, WifiOff as WifiOffIcon,
  Bluetooth as BluetoothIcon2, BluetoothOff, BluetoothConnected,
  BluetoothSearching, BluetoothOff as BluetoothOffIcon, Usb as UsbIcon,
  Hdmi as HdmiIcon, Battery as BatteryIcon2, BatteryCharging as BatteryChargingIcon,
  BatteryFull as BatteryFullIcon, BatteryLow as BatteryLowIcon,
  BatteryMedium as BatteryMediumIcon, BatteryWarning, Power as PowerIcon,
  PowerOff as PowerOffIcon, LogOut as LogOutIcon, LogIn as LogInIcon,
  User as UserIcon, UserPlus as UserPlusIcon, UserMinus as UserMinusIcon,
  Users as UsersIcon2, UserCheck as UserCheckIcon, UserX as UserXIcon,
  Lock as LockIcon, Unlock as UnlockIcon, Key as KeyIcon, Shield as ShieldIcon,
  ShieldAlert as ShieldAlertIcon, ShieldCheck as ShieldCheckIcon,
  ShieldX as ShieldXIcon, ShieldOff, Siren as SirenIcon, Megaphone as MegaphoneIcon,
  Bell as BellIcon, BellOff, BellPlus, BellMinus, BellRing, BellDot,
  Search as SearchIcon, Filter as FilterIcon, Settings as SettingsIcon,
  Cog, Wrench, Hammer, Screwdriver, Wrench as WrenchIcon, Tool, Toolbox,
  Ruler as RulerIcon, Compass as CompassIcon2, Square as SquareIcon2,
  Circle as CircleIcon2, Triangle as TriangleIcon, Pentagon as PentagonIcon,
  Hexagon as HexagonIcon, Octagon as OctagonIcon, Star as StarIcon3,
  Heart as HeartIcon2, Diamond as DiamondIcon, Gem as GemIcon, Crown as CrownIcon,
  Trophy as TrophyIcon, Medal as MedalIcon, Award as AwardIcon,
  Certificate as CertificateIcon, Badge as BadgeIcon2, Bookmark as BookmarkIcon,
  Flag as FlagIcon, FlagTriangle as FlagTriangleIcon, FlagOff as FlagOffIcon,
  Pin as PinIcon, PinOff as PinOffIcon, Paperclip as PaperclipIcon2,
  Link as LinkIcon2, Unlink as UnlinkIcon, ExternalLink as ExternalLinkIcon,
  Share as ShareIcon2, Share2 as Share2Icon2, Send as SendIcon2,
  Mail as MailIcon2, Inbox as InboxIcon, Archive as ArchiveIcon2,
  Trash2 as Trash2Icon2, Delete as DeleteIcon2, Edit as EditIcon2,
  Copy as CopyIcon2, Clipboard as ClipboardIcon2, ClipboardCheck as ClipboardCheckIcon2,
  ClipboardList as ClipboardListIcon, ClipboardX as ClipboardXIcon,
  ClipboardType as ClipboardTypeIcon, ClipboardPaste as ClipboardPasteIcon,
  Cut as CutIcon, AlignLeft as AlignLeftIcon, AlignCenter as AlignCenterIcon,
  AlignRight as AlignRightIcon, AlignJustify as AlignJustifyIcon,
  AlignStart as AlignStartIcon, AlignEnd as AlignEndIcon,
  AlignHorizontalDistributeCenter as AlignHorizontalDistributeCenterIcon,
  AlignHorizontalDistributeStart as AlignHorizontalDistributeStartIcon,
  AlignHorizontalDistributeEnd as AlignHorizontalDistributeEndIcon,
  AlignVerticalDistributeCenter as AlignVerticalDistributeCenterIcon,
  AlignVerticalDistributeStart as AlignVerticalDistributeStartIcon,
  AlignVerticalDistributeEnd as AlignVerticalDistributeEndIcon,
  Grid as GridIcon, Grid3X3 as Grid3X3Icon, Grid2X2 as Grid2X2Icon,
  Layout as LayoutIcon, LayoutTemplate as LayoutTemplateIcon,
  LayoutGrid as LayoutGridIcon2, LayoutList as LayoutListIcon,
  LayoutDashboard as LayoutDashboardIcon, LayoutPanelLeft as LayoutPanelLeftIcon,
  LayoutPanelTop as LayoutPanelTopIcon, Columns as ColumnsIcon,
  Columns2 as Columns2Icon, Columns3 as Columns3Icon2, Columns4 as Columns4Icon,
  Rows2 as Rows2Icon, Rows3 as Rows3Icon, Rows4 as Rows4Icon,
  Table as TableIcon2, Table2 as Table2Icon, TableProperties as TablePropertiesIcon,
  Frame as FrameIcon, Framer as FramerIcon, Figma as FigmaIcon,
  Sketch as SketchIcon, PenTool as PenToolIcon2, Vector as VectorIcon,
  Polygon as PolygonIcon, Line as LineIcon, CurlyBraces as CurlyBracesIcon,
  Brackets as BracketsIcon, Parentheses as ParenthesesIcon,
  Code as CodeIcon, Code2 as Code2Icon, Terminal as TerminalIcon,
  Command as CommandIcon, Keyboard as KeyboardIcon2, Mouse as MouseIcon2,
  Joystick as JoystickIcon2, Gamepad as GamepadIcon2, Headphones as HeadphonesIcon3,
  Speaker as SpeakerIcon2, SpeakerOff as SpeakerOffIcon, Volume as VolumeIcon2,
  Volume1 as Volume1Icon2, Volume2 as Volume2Icon2, VolumeX as VolumeXIcon3,
  Mic as MicIcon2, MicOff as MicOffIcon2, Phone as PhoneIcon2,
  PhoneOff as PhoneOffIcon2, Video as VideoIcon2, VideoOff as VideoOffIcon2,
  Monitor as MonitorIcon3, MonitorOff as MonitorOffIcon2, Cast as CastIcon2,
  Airplay as AirplayIcon2, Wifi as WifiIcon3, WifiOff as WifiOffIcon2,
  Bluetooth as BluetoothIcon3, BluetoothOff as BluetoothOffIcon2,
  BluetoothConnected as BluetoothConnectedIcon, BluetoothSearching as BluetoothSearchingIcon,
  Usb as UsbIcon2, Hdmi as HdmiIcon2, Battery as BatteryIcon3,
  BatteryCharging as BatteryChargingIcon2, BatteryFull as BatteryFullIcon2,
  BatteryLow as BatteryLowIcon2, BatteryMedium as BatteryMediumIcon2,
  BatteryWarning as BatteryWarningIcon, Power as PowerIcon2,
  PowerOff as PowerOffIcon2, LogOut as LogOutIcon2, LogIn as LogInIcon2,
  User as UserIcon2, UserPlus as UserPlusIcon2, UserMinus as UserMinusIcon2,
  Users as UsersIcon3, UserCheck as UserCheckIcon2, UserX as UserXIcon2,
  Lock as LockIcon2, Unlock as UnlockIcon2, Key as KeyIcon2,
  Shield as ShieldIcon2, ShieldAlert as ShieldAlertIcon2,
  ShieldCheck as ShieldCheckIcon2, ShieldX as ShieldXIcon2,
  ShieldOff as ShieldOffIcon, Siren as SirenIcon2, Megaphone as MegaphoneIcon2,
  Bell as BellIcon2, BellOff as BellOffIcon, BellPlus as BellPlusIcon,
  BellMinus as BellMinusIcon, BellRing as BellRingIcon, BellDot as BellDotIcon
} = lucide;

// ============================================
// Mock Data
// ============================================
const mockTrainSchedules = [
  { id: '1', trainNo: 'G1234', trainType: 'highSpeed', status: 'normal', platform: '5', track: '5', arrivalTime: '10:30', departureTime: '10:35', origin: '北京南', destination: '上海虹桥', carriageCount: 16, passengerCount: 1200, isAbnormal: false, tags: { water: true, sewage: true } },
  { id: '2', trainNo: 'D5678', trainType: 'normalSpeed', status: 'delayed', platform: '3', track: '3', arrivalTime: '10:45', departureTime: '10:50', origin: '成都东', destination: '重庆北', carriageCount: 8, passengerCount: 800, isAbnormal: true, delayMinutes: 15, tags: { water: false, sewage: true } },
  { id: '3', trainNo: 'G9012', trainType: 'highSpeed', status: 'normal', platform: '7', track: '7', arrivalTime: '11:00', departureTime: '11:05', origin: '广州南', destination: '深圳北', carriageCount: 8, passengerCount: 600, isAbnormal: false, tags: { water: true, sewage: false } },
  { id: '4', trainNo: 'C3456', trainType: 'normalSpeed', status: 'warning', platform: '2', track: '2', arrivalTime: '11:15', departureTime: '11:20', origin: '重庆西', destination: '万州北', carriageCount: 8, passengerCount: 500, isAbnormal: true, tags: { water: false, sewage: false } },
  { id: '5', trainNo: 'G7890', trainType: 'highSpeed', status: 'normal', platform: '6', track: '6', arrivalTime: '11:30', departureTime: '11:35', origin: '西安北', destination: '成都东', carriageCount: 16, passengerCount: 1100, isAbnormal: false, tags: { water: true, sewage: true } },
  { id: '6', trainNo: 'D1234', trainType: 'normalSpeed', status: 'normal', platform: '4', track: '4', arrivalTime: '11:45', departureTime: '11:50', origin: '贵阳北', destination: '重庆西', carriageCount: 8, passengerCount: 700, isAbnormal: false, tags: { water: true, sewage: false } },
  { id: '7', trainNo: 'G5678', trainType: 'highSpeed', status: 'delayed', platform: '8', track: '8', arrivalTime: '12:00', departureTime: '12:05', origin: '武汉', destination: '重庆北', carriageCount: 16, passengerCount: 1300, isAbnormal: true, delayMinutes: 25, tags: { water: true, sewage: true } },
  { id: '8', trainNo: 'C9012', trainType: 'normalSpeed', status: 'normal', platform: '1', track: '1', arrivalTime: '12:15', departureTime: '12:20', origin: '重庆北', destination: '涪陵北', carriageCount: 8, passengerCount: 400, isAbnormal: false, tags: { water: false, sewage: false } },
  { id: '9', trainNo: 'G3456', trainType: 'highSpeed', status: 'normal', platform: '9', track: '9', arrivalTime: '12:30', departureTime: '12:35', origin: '郑州东', destination: '重庆西', carriageCount: 16, passengerCount: 1000, isAbnormal: false, tags: { water: true, sewage: true } },
  { id: '10', trainNo: 'D7890', trainType: 'normalSpeed', status: 'warning', platform: '3', track: '3', arrivalTime: '12:45', departureTime: '12:50', origin: '重庆西', destination: '遵义', carriageCount: 8, passengerCount: 600, isAbnormal: true, tags: { water: false, sewage: true } },
  { id: '11', trainNo: 'G1235', trainType: 'highSpeed', status: 'normal', platform: '10', track: '10', arrivalTime: '13:00', departureTime: '13:05', origin: '南京南', destination: '重庆北', carriageCount: 16, passengerCount: 1150, isAbnormal: false, tags: { water: true, sewage: true } },
  { id: '12', trainNo: 'C5679', trainType: 'normalSpeed', status: 'normal', platform: '2', track: '2', arrivalTime: '13:15', departureTime: '13:20', origin: '重庆东', destination: '长寿北', carriageCount: 8, passengerCount: 350, isAbnormal: false, tags: { water: false, sewage: false } },
  { id: '13', trainNo: 'G9013', trainType: 'highSpeed', status: 'delayed', platform: '11', track: '11', arrivalTime: '13:30', departureTime: '13:35', origin: '杭州东', destination: '重庆西', carriageCount: 16, passengerCount: 1250, isAbnormal: true, delayMinutes: 10, tags: { water: true, sewage: true } },
  { id: '14', trainNo: 'D3457', trainType: 'normalSpeed', status: 'normal', platform: '5', track: '5', arrivalTime: '13:45', departureTime: '13:50', origin: '重庆北', destination: '达州', carriageCount: 8, passengerCount: 550, isAbnormal: false, tags: { water: true, sewage: false } },
  { id: '15', trainNo: 'G7891', trainType: 'highSpeed', status: 'normal', platform: '12', track: '12', arrivalTime: '14:00', departureTime: '14:05', origin: '长沙南', destination: '重庆东', carriageCount: 16, passengerCount: 1050, isAbnormal: false, tags: { water: true, sewage: true } },
  { id: '16', trainNo: 'C1234', trainType: 'normalSpeed', status: 'warning', platform: '1', track: '1', arrivalTime: '14:15', departureTime: '14:20', origin: '重庆西', destination: '江津北', carriageCount: 8, passengerCount: 300, isAbnormal: true, tags: { water: false, sewage: false } },
];

// ============================================
// Icons Component
// ============================================
const SewageIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const WaterIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
  </svg>
);

// ============================================
// WaterSewageConfigDrawer Component
// ============================================
const WaterSewageConfigDrawer = ({ visible, onClose, trainId, darkMode = false }) => {
  const [activeService, setActiveService] = useState('water');
  const [waterCarriages, setWaterCarriages] = useState([]);
  const [sewageCarriages, setSewageCarriages] = useState([]);

  const train = mockTrainSchedules.find(t => t.id === trainId);
  const carriageCount = train?.carriageCount || 16;
  
  const carriages = useMemo(() => {
    return Array.from({ length: carriageCount }, (_, i) => ({
      number: i + 1,
      position: i
    }));
  }, [carriageCount]);

  useEffect(() => {
    if (visible && train) {
      setWaterCarriages(train.tags?.water ? [1, 2, 3, 4, 5, 6, 7, 8] : []);
      setSewageCarriages(train.tags?.sewage ? [1, 2, 3, 4, 5, 6, 7, 8] : []);
    }
  }, [visible, train]);

  const hasService = (carriageNum, service) => {
    return service === 'water' 
      ? waterCarriages.includes(carriageNum)
      : sewageCarriages.includes(carriageNum);
  };

  const handleCarriageClick = (carriageNum) => {
    if (activeService === 'water') {
      setWaterCarriages(prev => 
        prev.includes(carriageNum)
          ? prev.filter(n => n !== carriageNum)
          : [...prev, carriageNum].sort((a, b) => a - b)
      );
    } else {
      setSewageCarriages(prev => 
        prev.includes(carriageNum)
          ? prev.filter(n => n !== carriageNum)
          : [...prev, carriageNum].sort((a, b) => a - b)
      );
    }
  };

  const handleTypeChange = (type) => {
    const carriageNumbers = carriages.map(c => c.number);
    let selected = [];
    
    switch (type) {
      case 'all':
        selected = [...carriageNumbers];
        break;
      case 'odd':
        selected = carriageNumbers.filter(n => n % 2 === 1);
        break;
      case 'even':
        selected = carriageNumbers.filter(n => n % 2 === 0);
        break;
      case 'none':
        selected = [];
        break;
      default:
        return;
    }
    
    if (activeService === 'water') {
      setWaterCarriages(selected);
    } else {
      setSewageCarriages(selected);
    }
  };

  const handleSave = () => {
    message.success('配置已保存');
    onClose();
  };

  if (!visible) return null;

  const trackNumber = train?.track || '5';
  const currentConfig = activeService === 'water' ? waterCarriages : sewageCarriages;

  return (
    <>
      <div className="ws-drawer-overlay" onClick={onClose} />
      <div className={`water-sewage-drawer ${darkMode ? '' : 'light'}`} data-theme={darkMode ? 'dark' : 'light'}>
        <div className="ws-drawer-header">
          <div className="ws-header-left">
            <div className="ws-title">上水吸污配置</div>
            <div className="ws-train-info">
              <span className="ws-train-no">{train?.trainNo || 'C6402'}</span>
              <span className="ws-train-model">{carriageCount}编组</span>
              <span className="ws-track-tag">{trackNumber}道</span>
            </div>
          </div>
          <div className="ws-header-right">
            <Button type="text" icon={<X size={16} />} onClick={onClose} className="ws-close-btn" />
          </div>
        </div>

        <div className="ws-drawer-body">
          <div className="ws-formation-section">
            <div className="ws-formation-visualization">
              <div className="ws-carriages-wrapper">
                <div className="ws-carriages-column">
                  {carriages.map((carriage) => (
                    <Tooltip key={carriage.number} title={`${carriage.number}车`} placement="right">
                      <div className="ws-carriage-wrapper">
                        <div className="ws-service-column water-column">
                          {hasService(carriage.number, 'water') && (
                            <div className="ws-service-marker water" title="上水">
                              <Droplets size={12} />
                            </div>
                          )}
                        </div>
                        <div
                          className={`ws-carriage-node ${hasService(carriage.number, activeService) ? 'selected' : ''}`}
                          onClick={() => handleCarriageClick(carriage.number)}
                        >
                          <span className="ws-carriage-number">{carriage.number}</span>
                        </div>
                        <div className="ws-service-column sewage-column">
                          {hasService(carriage.number, 'sewage') && (
                            <div className="ws-service-marker sewage" title="吸污">
                              <SewageIcon size={12} />
                            </div>
                          )}
                        </div>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>

              <div className="ws-legend">
                <div className="ws-legend-item">
                  <div className="ws-legend-icon water"><Droplets size={14} /></div>
                  <span>上水</span>
                </div>
                <div className="ws-legend-item">
                  <div className="ws-legend-icon sewage"><SewageIcon size={14} /></div>
                  <span>吸污</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ws-config-section">
            <div className="ws-service-tabs">
              <button
                className={`ws-service-tab ${activeService === 'water' ? 'active' : ''}`}
                onClick={() => setActiveService('water')}
              >
                <Droplets size={16} />
                <span>上水配置</span>
                {waterCarriages.length > 0 && <span className="ws-count-badge">{waterCarriages.length}</span>}
              </button>
              <button
                className={`ws-service-tab ${activeService === 'sewage' ? 'active' : ''}`}
                onClick={() => setActiveService('sewage')}
              >
                <SewageIcon size={16} />
                <span>吸污配置</span>
                {sewageCarriages.length > 0 && <span className="ws-count-badge">{sewageCarriages.length}</span>}
              </button>
            </div>

            <div className="ws-config-card">
              <div className="ws-config-title">选择范围</div>
              <div className="ws-config-types">
                {['none', 'all', 'odd', 'even'].map(type => (
                  <button
                    key={type}
                    className="ws-config-type-btn"
                    onClick={() => handleTypeChange(type)}
                  >
                    {type === 'none' ? '无' : type === 'all' ? '整列' : type === 'odd' ? '单数' : '双数'}
                  </button>
                ))}
              </div>
            </div>

            <div className="ws-config-card">
              <div className="ws-config-title">
                已选车厢
                <span className="ws-config-count">{currentConfig.length} 节</span>
              </div>
              <div className="ws-selected-carriages">
                {currentConfig.length > 0 ? (
                  currentConfig.map(num => <span key={num} className="ws-carriage-tag">{num}车</span>)
                ) : (
                  <span className="ws-empty-text">未选择车厢</span>
                )}
              </div>
            </div>

            <div className="ws-hint-card">
              <div className="ws-hint-title">操作提示</div>
              <ul className="ws-hint-list">
                <li>点击车厢可直接选择/取消</li>
                <li>整列：所有车厢都进行服务</li>
                <li>单数：仅单数编号车厢</li>
                <li>双数：仅双数编号车厢</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="ws-drawer-footer">
          <button className="ws-footer-btn reset" onClick={() => { setWaterCarriages([]); setSewageCarriages([]); }}>
            <RefreshCw size={14} />
            <span>重置</span>
          </button>
          <div className="ws-footer-actions">
            <button className="ws-footer-btn cancel" onClick={onClose}>取消</button>
            <button className="ws-footer-btn confirm" onClick={handleSave}>
              <CheckCircle2 size={14} />
              <span>确定</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================
// Main App Component
// ============================================
const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTrainId, setSelectedTrainId] = useState(null);
  const [waterSewageDrawerVisible, setWaterSewageDrawerVisible] = useState(false);
  const [waterSewageTrainId, setWaterSewageTrainId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('normal');

  const filteredTrains = useMemo(() => {
    return mockTrainSchedules.filter(train => 
      train.trainNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      train.origin.includes(searchTerm) ||
      train.destination.includes(searchTerm)
    );
  }, [searchTerm]);

  const handleWaterSewageClick = (trainId) => {
    setWaterSewageTrainId(trainId);
    setWaterSewageDrawerVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return '#52c41a';
      case 'delayed': return '#faad14';
      case 'warning': return '#f5222d';
      default: return '#999';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'normal': return '正点';
      case 'delayed': return '晚点';
      case 'warning': return '告警';
      default: return '未知';
    }
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`} style={{ background: darkMode ? '#0f172a' : '#f5f5f5' }}>
      {/* Header */}
      <div className="app-header" style={{ background: darkMode ? '#1e293b' : '#fff', borderBottom: darkMode ? '1px solid #334155' : '1px solid #e5e5e5' }}>
        <div className="header-left">
          <h1 style={{ color: darkMode ? '#fff' : '#333', fontSize: '18px', fontWeight: 600 }}>到发盯控系统</h1>
          <span style={{ color: darkMode ? '#94a3b8' : '#666', fontSize: '12px', marginLeft: '16px' }}>首页 / 综合指挥 / 到发盯控</span>
        </div>
        <div className="header-right" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Input
            prefix={<Search size={16} />}
            placeholder="搜索车次..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 200 }}
          />
          <Button 
            icon={darkMode ? <Sun size={16} /> : <Moon size={16} />}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '浅色' : '深色'}
          </Button>
          <Button icon={<Settings size={16} />}>设置</Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar" style={{ 
        background: darkMode ? '#1e293b' : '#fff', 
        borderBottom: darkMode ? '1px solid #334155' : '1px solid #e5e5e5',
        padding: '12px 24px',
        display: 'flex',
        gap: '24px'
      }}>
        <div className="stat-item">
          <span style={{ color: darkMode ? '#94a3b8' : '#666', fontSize: '12px' }}>总车次</span>
          <span style={{ color: darkMode ? '#fff' : '#333', fontSize: '20px', fontWeight: 600, marginLeft: '8px' }}>{mockTrainSchedules.length}</span>
        </div>
        <div className="stat-item">
          <span style={{ color: darkMode ? '#94a3b8' : '#666', fontSize: '12px' }}>正点</span>
          <span style={{ color: '#52c41a', fontSize: '20px', fontWeight: 600, marginLeft: '8px' }}>
            {mockTrainSchedules.filter(t => t.status === 'normal').length}
          </span>
        </div>
        <div className="stat-item">
          <span style={{ color: darkMode ? '#94a3b8' : '#666', fontSize: '12px' }}>晚点</span>
          <span style={{ color: '#faad14', fontSize: '20px', fontWeight: 600, marginLeft: '8px' }}>
            {mockTrainSchedules.filter(t => t.status === 'delayed').length}
          </span>
        </div>
        <div className="stat-item">
          <span style={{ color: darkMode ? '#94a3b8' : '#666', fontSize: '12px' }}>告警</span>
          <span style={{ color: '#f5222d', fontSize: '20px', fontWeight: 600, marginLeft: '8px' }}>
            {mockTrainSchedules.filter(t => t.status === 'warning').length}
          </span>
        </div>
      </div>

      {/* Train Table */}
      <div className="train-table-container" style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <div className="train-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {filteredTrains.map(train => (
            <div
              key={train.id}
              className={`train-card ${selectedTrainId === train.id ? 'selected' : ''}`}
              style={{
                background: darkMode ? '#1e293b' : '#fff',
                border: `1px solid ${selectedTrainId === train.id ? '#1890ff' : darkMode ? '#334155' : '#e5e5e5'}`,
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectedTrainId === train.id ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : 'none'
              }}
              onClick={() => setSelectedTrainId(train.id)}
            >
              <div className="train-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Train size={20} color={getStatusColor(train.status)} />
                  <span style={{ fontSize: '18px', fontWeight: 600, color: darkMode ? '#fff' : '#333' }}>{train.trainNo}</span>
                  <Tag color={train.trainType === 'highSpeed' ? 'blue' : 'green'}>
                    {train.trainType === 'highSpeed' ? '高铁' : '动车'}
                  </Tag>
                </div>
                <Badge 
                  status={train.status === 'normal' ? 'success' : train.status === 'delayed' ? 'warning' : 'error'} 
                  text={getStatusText(train.status)}
                />
              </div>

              <div className="train-info" style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: darkMode ? '#94a3b8' : '#666', fontSize: '12px' }}>始发/终到</span>
                  <span style={{ color: darkMode ? '#fff' : '#333', fontSize: '13px' }}>{train.origin} → {train.destination}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: darkMode ? '#94a3b8' : '#666', fontSize: '12px' }}>到/发时间</span>
                  <span style={{ color: darkMode ? '#fff' : '#333', fontSize: '13px' }}>{train.arrivalTime} / {train.departureTime}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: darkMode ? '#94a3b8' : '#666', fontSize: '12px' }}>股道/站台</span>
                  <span style={{ color: darkMode ? '#fff' : '#333', fontSize: '13px' }}>{train.track}道 / {train.platform}台</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: darkMode ? '#94a3b8' : '#666', fontSize: '12px' }}>编组/客流</span>
                  <span style={{ color: darkMode ? '#fff' : '#333', fontSize: '13px' }}>{train.carriageCount}节 / {train.passengerCount}人</span>
                </div>
              </div>

              <div className="train-tags" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {train.tags?.water && (
                  <Tag color="cyan" icon={<Droplets size={12} />}>上水</Tag>
                )}
                {train.tags?.sewage && (
                  <Tag color="orange" icon={<SewageIcon size={12} />}>吸污</Tag>
                )}
                {train.isAbnormal && (
                  <Tag color="red">异常</Tag>
                )}
              </div>

              <div className="train-actions" style={{ display: 'flex', gap: '8px' }}>
                <Button 
                  size="small" 
                  icon={<Droplets size={14} />}
                  onClick={(e) => { e.stopPropagation(); handleWaterSewageClick(train.id); }}
                >
                  上水吸污
                </Button>
                <Button size="small" icon={<Activity size={14} />}>作业</Button>
                <Button size="small" icon={<Users size={14} />}>客流</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WaterSewageConfigDrawer */}
      <WaterSewageConfigDrawer
        visible={waterSewageDrawerVisible}
        onClose={() => setWaterSewageDrawerVisible(false)}
        trainId={waterSewageTrainId}
        darkMode={darkMode}
      />
    </div>
  );
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
