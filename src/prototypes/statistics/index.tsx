/**
 * @name 统计信息
 * @mode axure
 *
 * 参考资料：
 * - /skills/axure-export-workflow/SKILL.md
 * - /rules/axure-api-guide.md
 */

import './style.css';
import React, { useState, useCallback, useImperativeHandle, forwardRef, useEffect, useRef } from 'react';
import * as echarts from 'echarts';

import type {
    KeyDesc,
    DataDesc,
    ConfigItem,
    Action,
    EventItem,
    AxureProps,
    AxureHandle
} from '../../common/axure-types';

const EVENT_LIST: EventItem[] = [
    { name: 'onPageLoad', desc: '页面加载完成时触发' }
];

const ACTION_LIST: Action[] = [];

const VAR_LIST: KeyDesc[] = [
    { name: 'current_page', desc: '当前页面路径' }
];

const CONFIG_LIST: ConfigItem[] = [];

const DATA_LIST: DataDesc[] = [];

const APT_DATA = [
    {
        name: '北京局',
        data: [
            { value: 3, name: '韩国 "黑暗旅店"' },
            { value: 1, name: '朝鲜 "拉撒路"' },
            { value: 3, name: 'APT-绿斑、APT-C-01（毒云藤）' }
        ]
    },
    {
        name: '成都局',
        data: [
            { value: 1, name: '韩国 "黑暗旅店"' }
        ]
    },
    {
        name: '昆明局',
        data: [
            { value: 2, name: 'Darkhotel' },
            { value: 2, name: 'ATP-Lazarus Group' },
            { value: 2, name: 'APT-fakedoc' },
            { value: 2, name: 'APT-APT-C-23' }
        ]
    },
    {
        name: '南昌局',
        data: [
            { value: 2, name: '韩国 "黑暗旅店"' }
        ]
    },
    {
        name: '青藏',
        data: [
            { value: 2, name: '朝鲜 "拉撒路"' }
        ]
    },
    {
        name: '乌鲁木齐局',
        data: [
            { value: 2, name: 'Transparent Tribe' },
            { value: 1, name: 'Leviatan' }
        ]
    },
    {
        name: '郑州局',
        data: [
            { value: 2, name: 'APT-海莲花组织' }
        ]
    }
];

const INDUSTRY_DATA = [
    { name: '政府', value: 28 },
    { name: '国防军工', value: 12 },
    { name: '信息技术', value: 11 },
    { name: '金融', value: 9 },
    { name: '制造', value: 7 },
    { name: '科研', value: 7 },
    { name: '交通运输', value: 5 },
    { name: '教育', value: 5 },
    { name: '能源', value: 4 },
    { name: '文娱传媒', value: 4 },
    { name: '其他行业', value: 8 }
];

const COLORS = [
    '#9c27b0', '#3f51b5', '#f44336', '#607d8b',
    '#4caf50', '#03a9f4', '#ff9800', '#795548',
    '#673ab7', '#e91e63', '#2196f3', '#00bcd4'
];

const STANDARD_LEGEND_ORDER = [
    '韩国 "黑暗旅店"', '朝鲜 "拉撒路"', 'Transparent Tribe',
    'Leviatan', 'Darkhotel', 'APT-绿斑、APT-C-01（毒云藤）',
    'APT-海莲花组织', 'APT-projectm', 'APT-Takeover',
    'ATP-Lazarus Group', 'APT-fakedoc', 'APT-APT-C-23'
];

const Component = forwardRef<AxureHandle, AxureProps>(function StatisticsPage(innerProps, ref) {
    const dataSource = innerProps && innerProps.data ? innerProps.data : {};
    const configSource = innerProps && innerProps.config ? innerProps.config : {};
    const onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };

    const aptChartRef = useRef<HTMLDivElement>(null);
    const industryChartRef = useRef<HTMLDivElement>(null);
    const aptChartInstance = useRef<echarts.ECharts | null>(null);
    const industryChartInstance = useRef<echarts.ECharts | null>(null);

    const [aptScale, setAptScale] = useState<number>(100);
    const [industryScale, setIndustryScale] = useState<number>(100);
    const [pageWidth, setPageWidth] = useState<number>(100);

    const initAptChart = useCallback(() => {
        if (aptChartRef.current) {
            aptChartInstance.current = echarts.init(aptChartRef.current);

            const seriesData = STANDARD_LEGEND_ORDER.map((attackType, index) => {
                const unitData = APT_DATA.map(unit => {
                    const attackData = unit.data.find(item => item.name === attackType);
                    return attackData ? attackData.value : 0;
                });

                return {
                    name: attackType,
                    type: 'bar',
                    stack: 'total',
                    emphasis: { focus: 'series' },
                    data: unitData,
                    itemStyle: { color: COLORS[index], opacity: 0.9 },
                    label: {
                        show: true,
                        position: 'inside',
                        formatter: function (params: any) {
                            return params.value > 0 ? params.value : '';
                        },
                        fontSize: 9,
                        color: '#fff',
                        fontWeight: 'bold'
                    }
                };
            });

            const option = {
                title: {
                    text: '各单位APT组织攻击类型一览表',
                    left: 'center',
                    textStyle: { fontSize: 16, fontWeight: 'bold' }
                },
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                legend: {
                    data: STANDARD_LEGEND_ORDER,
                    orient: 'vertical',
                    right: 40,
                    top: 'center',
                    itemHeight: 14,
                    itemGap: 8,
                    textStyle: { fontSize: 12 }
                },
                grid: {
                    left: 60, right: 280, bottom: 60, top: 120,
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: APT_DATA.map(item => item.name),
                    axisLabel: { interval: 0, fontSize: 12 }
                },
                yAxis: {
                    type: 'value',
                    name: '攻击次数',
                    axisLabel: { fontSize: 12 }
                },
                series: seriesData
            };

            aptChartInstance.current.setOption(option);
        }
    }, []);

    const initIndustryChart = useCallback(() => {
        if (industryChartRef.current) {
            industryChartInstance.current = echarts.init(industryChartRef.current);

            const industryColors = [
                '#4a6fa5', '#5d8a82', '#6a7fdb', '#e8a87c',
                '#c38d9e', '#92a8d1', '#e3e0cc', '#b5e7a0',
                '#c94c4c', '#e6a2a2', '#999999'
            ];

            const option = {
                title: {
                    text: '行业分布',
                    left: 'center',
                    textStyle: { fontSize: 16, fontWeight: 'bold' }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c}% ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    right: '10%',
                    top: 'center',
                    itemHeight: 14,
                    itemGap: 8,
                    formatter: function (name: string) {
                        const item = INDUSTRY_DATA.find(item => item.name === name);
                        return `${name} ${item?.value}%`;
                    },
                    textStyle: { fontSize: 12 }
                },
                series: [
                    {
                        name: '行业分布',
                        type: 'pie',
                        radius: ['35%', '65%'],
                        center: ['45%', '50%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 10,
                            borderColor: '#fff',
                            borderWidth: 2
                        },
                        label: {
                            show: true,
                            position: 'outside',
                            formatter: '{b}: {c}%',
                            fontSize: 12,
                            color: '#333'
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: 14,
                                fontWeight: 'bold'
                            }
                        },
                        labelLine: {
                            show: true,
                            length: 20,
                            length2: 30,
                            lineStyle: { color: '#999', width: 1 }
                        },
                        data: INDUSTRY_DATA,
                        color: industryColors
                    }
                ]
            };

            industryChartInstance.current.setOption(option);
        }
    }, []);

    useEffect(() => {
        initAptChart();
        initIndustryChart();

        const handleResize = () => {
            aptChartInstance.current?.resize();
            industryChartInstance.current?.resize();
        };

        window.addEventListener('resize', handleResize);
        onEventHandler('onPageLoad');

        return () => {
            window.removeEventListener('resize', handleResize);
            aptChartInstance.current?.dispose();
            industryChartInstance.current?.dispose();
        };
    }, [initAptChart, initIndustryChart, onEventHandler]);

    const emitEvent = useCallback(function (eventName: string, payload?: any) {
        try {
            onEventHandler(eventName, payload);
        } catch (error) {
            console.warn('事件触发失败:', error);
        }
    }, [onEventHandler]);

    const fireActionHandler = useCallback(function (name: string, params?: any) {
        switch (name) {
            default:
                console.warn('未知的动作:', name);
        }
    }, []);

    const handleAptScaleChange = useCallback((value: number) => {
        setAptScale(value);
        if (aptChartRef.current) {
            aptChartRef.current.style.height = `${600 * (value / 100)}px`;
            if (aptChartInstance.current) {
                aptChartInstance.current.resize();
            }
        }
    }, []);

    const handleIndustryScaleChange = useCallback((value: number) => {
        setIndustryScale(value);
        if (industryChartRef.current) {
            industryChartRef.current.style.height = `${500 * (value / 100)}px`;
            industryChartRef.current.style.width = `${800 * (value / 100)}px`;
            if (industryChartInstance.current) {
                industryChartInstance.current.resize();
            }
        }
    }, []);

    const handlePageWidthChange = useCallback((value: number) => {
        setPageWidth(value);
        const pageElement = document.querySelector('.statistics-page');
        if (pageElement) {
            (pageElement as HTMLElement).style.width = `${value}%`;
        }
    }, []);

    useImperativeHandle(ref, function () {
        return {
            getVar: function (name: string) {
                const vars: Record<string, any> = {
                    current_page: window.location.pathname
                };
                return vars[name];
            },
            fireAction: fireActionHandler,
            eventList: EVENT_LIST,
            actionList: ACTION_LIST,
            varList: VAR_LIST,
            configList: CONFIG_LIST,
            dataList: DATA_LIST
        };
    }, [fireActionHandler]);

    return (
        <div className="statistics-page">
            <div className="page-header">
                <h1>统计信息</h1>
                <div className="control-panel">
                    <div className="page-width-control">
                        <span className="width-label">页面宽度: {pageWidth}%</span>
                        <input
                            type="range"
                            min="60"
                            max="100"
                            value={pageWidth}
                            onChange={(e) => handlePageWidthChange(Number(e.target.value))}
                            className="width-slider"
                        />
                    </div>
                    <div className="chart-scale-controls">
                        <div className="scale-control-item">
                            <span className="scale-label">APT图表: {aptScale}%</span>
                            <input
                                type="range"
                                min="50"
                                max="150"
                                value={aptScale}
                                onChange={(e) => handleAptScaleChange(Number(e.target.value))}
                                className="scale-slider"
                            />
                        </div>
                        <div className="scale-control-item">
                            <span className="scale-label">行业图表: {industryScale}%</span>
                            <input
                                type="range"
                                min="50"
                                max="150"
                                value={industryScale}
                                onChange={(e) => handleIndustryScaleChange(Number(e.target.value))}
                                className="scale-slider"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="chart-container">
                <div className="chart-item">
                    <div className="chart-wrapper apt-chart" ref={aptChartRef}></div>
                    <div className="chart-title">图 2-2-1 各单位APT组织攻击类型分布图</div>
                </div>

                <div className="chart-item">
                    <div className="chart-wrapper industry-chart" ref={industryChartRef}></div>
                    <div className="chart-title">行业分布</div>
                </div>
            </div>
        </div>
    );
});

export default Component;