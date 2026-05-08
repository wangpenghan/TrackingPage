# 非客运车次配置页面简化设计方案

**版本：** v1.0  
**日期：** 2026-05-08  
**适用模块：** 客运模板 / 编辑抽屉 / 非客运车次配置

---

## 1. 背景与目标

### 1.1 问题
在客运模板中，存在部分车次（如以"0G"、"DJ"开头的车次）无需办理客运业务，属于货运、调车、检修等非客运作业。这类车次不涉及检票时间、检票口、出站口、候车室等关键字段，但当前配置页面仍显示全部字段，导致：
- 用户操作流程冗长，效率低下
- 容易误操作或填写无关信息
- 页面信息过载，不够直观

### 1.2 目标
- 自动识别非客运车次
- 动态简化配置区域，隐藏无关字段
- 提高操作效率，减少误操作
- 保持界面整洁，提升用户体验

---

## 2. 非客运车次识别规则

### 2.1 识别条件

| 车次前缀 | 车次类型 | 说明 |
| :--- | :--- | :--- |
| `0G` | 货运列车 | 以0G开头的货运车次 |
| `DJ` | 调车作业 | 以DJ开头的调车车次 |
| `0D` | 其他非客运 | 可扩展规则 |

### 2.2 判定逻辑

```ts
function isFreightTrain(trainNo: string): boolean {
  const freightPrefixes = ['0G', 'DJ', '0D']
  return freightPrefixes.some(prefix => trainNo.startsWith(prefix))
}
```

### 2.3 数据模型扩展

在 `TemplateData` 中增加字段：

```ts
isFreight?: boolean  // 是否为非客运车次（自动判定或用户选择）
```

---

## 3. 配置页面差异化设计

### 3.1 客运车次（始发/途径/终到）- 完整配置

**显示字段：**
- 基础信息：车次号、类型、始发站、终到站
- 时间信息：到达时间、发车时间
- 检票配置：进站开检偏移、进站停检偏移、出站开检偏移、出站停检偏移
- 设施配置：检票口、候车室、出站口
- 空间配置：站台、股道、停车位
- 编组信息：车型、编组、编组方向
- 运行规律：周期、规律、有效期
- 作业标记：上水、吸污
- 其他：地标颜色、担当局等

### 3.2 非客运车次（货运/调车等）- 简化配置

**显示字段：**
- 基础信息：车次号、类型、始发站、终到站
- 时间信息：到达时间、发车时间
- 空间配置：站台、股道、停车位
- 编组信息：车型、编组、编组方向
- 运行规律：周期、规律、有效期
- 作业标记：上水、吸污
- 其他：担当局等

**隐藏字段：**
- ~~进站开检偏移~~
- ~~进站停检偏移~~
- ~~出站开检偏移~~
- ~~出站停检偏移~~
- ~~检票口~~
- ~~候车室~~
- ~~出站口~~
- ~~地标颜色~~

---

## 4. UI 实现方案

### 4.1 动态字段显示控制

```tsx
const isFreightMode = isFreightTrain(formData.trainNo)

// 客运专用字段区域
{!isFreightMode && (
  <div className="bg-white rounded-lg border border-[#E5E7EB] p-2">
    <div className="text-[12px] font-bold text-[#5e6ad2] bg-[#EFF6FF] px-1.5 py-0.5 rounded mb-1">
      检票配置
    </div>
    {/* 进站开检偏移 */}
    {/* 进站停检偏移 */}
    {/* 出站开检偏移 */}
    {/* 出站停检偏移 */}
    {/* 检票口 */}
    {/* 候车室 */}
    {/* 出站口 */}
  </div>
)}

// 非客运专用字段区域
{isFreightMode && (
  <div className="bg-white rounded-lg border border-[#E5E7EB] p-2">
    <div className="text-[12px] font-bold text-[#5e6ad2] bg-[#EFF6FF] px-1.5 py-0.5 rounded mb-1">
      作业配置
    </div>
    {/* 上水作业 */}
    {/* 吸污作业 */}
  </div>
)}
```

### 4.2 页面布局对比

#### 客运车次配置页面
```
┌─────────────────────────────────────────────────────────────┐
│ 基础信息 | 时间信息 | 检票配置 | 设施配置 | 空间配置 | 编组信息 │
├─────────────────────────────────────────────────────────────┤
│ 车次号   │ 到达时间 │ 开检偏移 │ 检票口   │ 站台     │ 车型     │
│ 类型     │ 发车时间 │ 停检偏移 │ 候车室   │ 股道     │ 编组     │
│ 始发站   │          │ 出检偏移 │ 出站口   │ 停车位   │ 方向     │
│ 终到站   │          │          │          │          │          │
└─────────────────────────────────────────────────────────────┘
```

#### 非客运车次配置页面（简化）
```
┌──────────────────────────────────────────────────┐
│ 基础信息 | 时间信息 | 空间配置 | 编组信息 | 作业配置 │
├──────────────────────────────────────────────────┤
│ 车次号   │ 到达时间 │ 站台     │ 车型     │ 上水     │
│ 类型     │ 发车时间 │ 股道     │ 编组     │ 吸污     │
│ 始发站   │          │ 停车位   │ 方向     │          │
│ 终到站   │          │          │          │          │
└──────────────────────────────────────────────────┘
```

---

## 5. 交互流程

### 5.1 页面加载时自动判定

1. 用户打开编辑抽屉
2. 系统读取 `trainNo` 字段
3. 调用 `isFreightTrain()` 判定
4. 根据结果动态渲染配置区域
5. 非客运车次自动隐藏检票相关字段

### 5.2 车次号修改时动态切换

```ts
const handleTrainNoChange = (newTrainNo: string) => {
  uf('trainNo', newTrainNo)
  const isFreight = isFreightTrain(newTrainNo)
  uf('isFreight', isFreight)
  
  // 若从客运切换到非客运，清除检票相关字段
  if (isFreight && !formData.isFreight) {
    uf('entryCheckOffset', 0)
    uf('entryStopOffset', 0)
    uf('exitCheckOffset', 0)
    uf('exitStopOffset', 0)
    uf('gates', '')
    uf('exitGate', '')
    uf('waitingRoom', '')
  }
}
```

### 5.3 手动切换模式（可选）

在配置页面顶部增加"是否为货运/非客运"的切换开关，允许用户手动覆盖自动判定：

```
[●] 自动判定  [○] 手动设置为非客运
```

---

## 6. 数据验证规则

### 6.1 客运车次必填字段

- `arrivalTime`、`departureTime`
- `entryCheckOffset`、`entryStopOffset`
- `gates`、`exitGate`
- `track`、`platform`

### 6.2 非客运车次必填字段

- `arrivalTime`、`departureTime`
- `track`、`platform`
- `formation`、`model`

### 6.3 验证逻辑

```ts
function validateTemplate(data: TemplateData): string[] {
  const errors: string[] = []
  const isFreight = isFreightTrain(data.trainNo)

  // 通用必填
  if (!data.trainNo?.trim()) errors.push('车次号不能为空')
  if (!data.arrivalTime?.trim()) errors.push('到达时间不能为空')
  if (!data.departureTime?.trim()) errors.push('发车时间不能为空')
  if (!data.track?.trim()) errors.push('股道不能为空')
  if (!data.platform?.trim()) errors.push('站台不能为空')

  // 客运专用必填
  if (!isFreight) {
    if (!data.entryCheckOffset) errors.push('进站开检偏移不能为空')
    if (!data.entryStopOffset) errors.push('进站停检偏移不能为空')
    if (!data.gates?.trim()) errors.push('检票口不能为空')
    if (!data.exitGate?.trim()) errors.push('出站口不能为空')
  }

  return errors
}
```

---

## 7. 与自动重置同步的关系

根据前方案（`auto-reset-sync-on-field-change-spec.md`），非客运车次的关键字段为：

```ts
export const NON_PASSENGER_SYNC_SENSITIVE_FIELDS: (keyof TemplateData)[] = [
  'arrivalTime',
  'departureTime',
  'track',
  'parkingSpot',
  'hasWater',
  'hasSuction',
]
```

非客运车次修改这些字段后，`synced` 状态会自动重置为 `false`。

---

## 8. 测试数据示例

### 8.1 非客运车次（货运）

```json
{
  "id": "freight-001",
  "trainNo": "0G1234",
  "trainType": "货运",
  "fromStation": "重庆东",
  "toStation": "成都东",
  "arrivalTime": "08:30",
  "departureTime": "08:45",
  "track": "5",
  "platform": "3",
  "parkingSpot": "北",
  "formation": 20,
  "model": "货车-X",
  "formationDir": "正",
  "hasWater": true,
  "hasSuction": true,
  "validStart": "2026-04-17",
  "validEnd": "2027-04-17",
  "isValid": true,
  "confirmed": false,
  "synced": false,
  "isFreight": true
}
```

### 8.2 非客运车次（调车）

```json
{
  "id": "shunting-001",
  "trainNo": "DJ5678",
  "trainType": "调车",
  "fromStation": "重庆东",
  "toStation": "重庆东",
  "arrivalTime": "06:00",
  "departureTime": "06:30",
  "track": "2",
  "platform": "1",
  "parkingSpot": "南",
  "formation": 8,
  "model": "调车机",
  "formationDir": "正",
  "hasWater": false,
  "hasSuction": false,
  "validStart": "2026-04-17",
  "validEnd": "2027-04-17",
  "isValid": true,
  "confirmed": false,
  "synced": false,
  "isFreight": true
}
```

### 8.3 客运车次（对比）

```json
{
  "id": "passenger-001",
  "trainNo": "G1234",
  "trainType": "始发",
  "fromStation": "重庆东",
  "toStation": "北海",
  "arrivalTime": "09:10",
  "departureTime": "09:10",
  "track": "4",
  "platform": "4",
  "parkingSpot": "北",
  "entryCheckOffset": -25,
  "entryStopOffset": -5,
  "exitCheckOffset": 0,
  "exitStopOffset": 0,
  "gates": "4A、5A、4B、5B",
  "exitGate": "渝厦场南侧出站口",
  "waitingRoom": "候车大厅",
  "formation": 16,
  "model": "CR400AF重联",
  "formationDir": "正",
  "landmarkColor": "绿",
  "hasWater": true,
  "hasSuction": true,
  "validStart": "2026-04-17",
  "validEnd": "4000-01-31",
  "isValid": true,
  "confirmed": false,
  "synced": false,
  "isFreight": false
}
```

---

## 9. 实现优先级

| 优先级 | 功能 | 说明 |
| :--- | :--- | :--- |
| P0 | 自动识别非客运车次 | 根据车次前缀判定 |
| P0 | 动态隐藏检票相关字段 | 简化非客运配置界面 |
| P1 | 数据验证规则差异化 | 客运和非客运字段验证不同 |
| P1 | 车次号修改时动态切换 | 从客运切换到非客运时清除检票字段 |
| P2 | 手动切换模式开关 | 允许用户覆盖自动判定 |

---

*文档结束*
