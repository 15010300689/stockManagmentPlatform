export interface TransportItem {
    id: number;
    label: string;
    code: string;
    changeRate: string;
    relatedCode: string;
    desc: string;
}

export const transportConfig: TransportItem[] = [
    {
        id: 1,
        label: '公路运输',
        code: 'ROAD',
        changeRate: '1.2',
        relatedCode: '',
        desc: '公路运输是指通过公路将货物从一个地点运输到另一个地点的运输方式。它是最常用的运输方式之一，也是成本较高的运输方式。',
    },
    {
        id: 2,
        label: '铁路运输',
        code: 'RAIL',
        changeRate: '0.8',
        relatedCode: '',
        desc: '铁路运输是指通过铁路将货物从一个地点运输到另一个地点的运输方式。它是成本较低的运输方式，但是由于受线路限制，因此时效较慢。',
    },
    {
        id: 3,
        label: '水路运输',
        code: 'SEA',
        changeRate: '1.5',
        relatedCode: '',
        desc: '水路运输是指通过水路将货物从一个地点运输到另一个地点的运输方式。它是成本较低的运输方式，但是由于受线路限制，因此时效较慢。',
    },
    {
        id: 4,
        label: '航空运输',
        code: 'AIR',
        changeRate: '2.0',
        relatedCode: '',
        desc: '航空运输是指通过航空将货物从一个地点运输到另一个地点的运输方式。它是速度快的运输方式，但是由于运费较高，因此成本较高。',
    },
    {
        id: 5,
        label: '管道运输',
        code: 'PIPE',
        changeRate: '1.0',
        relatedCode: '',
        desc: '管道运输是指通过管道将货物从一个地点运输到另一个地点的运输方式。它是安全稳定的运输方式，但是由于成本较高，因此只适用于运输液体/气体。',
    },
    {
        id: 6,
        label: '多式联运',
        code: 'MULTI',
        changeRate: '1.0',
        relatedCode: '',
        desc: '多式联运是指通过多种运输方式将货物从一个地点运输到另一个地点的运输方式。它是效率高的运输方式，但是需要协调多方合作。',
    },
];
