import { Solar } from 'lunar-javascript';

export interface BaziPillar {
    gan: string;
    zhi: string;
    ganGod: string;
    zhiGods: string[];
    hiddenGan: string[];
    naYin: string;
    xingYun: string;
    shenSha: string[];
    wuXing: { gan: string; zhi: string }; // New: Five Elements
}

export interface LuckCycle {
    startAge: number;
    endAge: number;
    ganZhi: string;
    ganGod: string;
    zhiGod: string;
}

export interface StrengthAnalysis {
    dayMaster: string;           // 日元 e.g. '甲'
    dayMasterElement: string;    // 日元五行 e.g. '木'
    isStrong: boolean;           // true=身強, false=身弱
    label: string;               // '身強' | '身弱'
    score: number;               // 正=強, 負=弱
    supportCount: number;        // 生助數
    drainCount: number;          // 洩耗剋數
    monthSupport: boolean;       // 月令是否生助
    favorableGods: string[];     // 喜神類型
    unfavorableGods: string[];   // 忌神類型
    isWealthFavorable: boolean;  // 偏財是否為喜神
    wealthVerdict: string;       // 偏財判定說明
}

export interface BaziResult {
    birthSolar: string;
    birthLunar: string;
    sex: string;
    solarTerms: {
        prev: { name: string; date: string };
        next: { name: string; date: string };
    };
    pillars: {
        year: BaziPillar;
        month: BaziPillar;
        day: BaziPillar;
        hour: BaziPillar;
    };
    interactions: string[];
    strength: StrengthAnalysis;
    luck: {
        startAge: number;
        cycles: LuckCycle[];
    };
}

const GAN_WUXING: { [key: string]: string } = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
    '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};
const ZHI_WUXING: { [key: string]: string } = {
    '寅': '木', '卯': '木', '巳': '火', '午': '火',
    '申': '金', '酉': '金', '亥': '水', '子': '水',
    '辰': '土', '戌': '土', '丑': '土', '未': '土'
};

const GAN_HE = [['甲', '己'], ['乙', '庚'], ['丙', '辛'], ['丁', '壬'], ['戊', '癸']];
const GAN_CHONG = [['甲', '庚'], ['乙', '辛'], ['丙', '壬'], ['丁', '癸']];
const ZHI_LIUHE = [['子', '丑'], ['寅', '亥'], ['卯', '戌'], ['辰', '酉'], ['巳', '申'], ['午', '未']];
const ZHI_CHONG = [['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥']];

// 五行相生循環: 木→火→土→金→水→木
const WUXING_CYCLE = ['木', '火', '土', '金', '水'];

// 判斷 elementB 對 dayMasterElement 的關係
const getRelation = (dayMasterElement: string, elementB: string): 'support' | 'drain' => {
    if (elementB === dayMasterElement) return 'support'; // 比劫 (same)
    const iB = WUXING_CYCLE.indexOf(elementB);
    // 生我者 = 印 (support): elementB 生 dayMaster → cycle[(iB+1)%5] === dayMaster
    if (WUXING_CYCLE[(iB + 1) % 5] === dayMasterElement) return 'support'; // 印
    // 其他都是洩耗剋 (drain): 食傷/財/官殺
    return 'drain';
};

// 藏干表 (地支藏干)
const ZHI_HIDDEN_GAN: { [key: string]: string[] } = {
    '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'],
    '卯': ['乙'], '辰': ['戊', '乙', '癸'], '巳': ['丙', '庚', '戊'],
    '午': ['丁', '己'], '未': ['己', '丁', '乙'], '申': ['庚', '壬', '戊'],
    '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲']
};

const analyzeStrength = (pillars: BaziResult['pillars']): StrengthAnalysis => {
    const dayGan = pillars.day.gan;
    const dayElement = GAN_WUXING[dayGan];
    const monthZhi = pillars.month.zhi;

    // 收集所有干支的五行 (不含日干自身)
    let supportCount = 0;
    let drainCount = 0;

    // 計算天干 (年月時, 跳過日干)
    const gans = [pillars.year.gan, pillars.month.gan, pillars.hour.gan];
    gans.forEach(g => {
        const el = GAN_WUXING[g];
        if (getRelation(dayElement, el) === 'support') supportCount++;
        else drainCount++;
    });

    // 計算地支 (含藏干, 全四柱)
    const zhis = [pillars.year.zhi, pillars.month.zhi, pillars.day.zhi, pillars.hour.zhi];
    zhis.forEach(z => {
        // 本氣 (權重 1)
        const mainEl = ZHI_WUXING[z];
        if (getRelation(dayElement, mainEl) === 'support') supportCount++;
        else drainCount++;
        // 藏干 (餘氣/中氣, 權重較低 0.3)
        const hiddenGans = ZHI_HIDDEN_GAN[z] || [];
        hiddenGans.forEach(hg => {
            const hgEl = GAN_WUXING[hg];
            if (getRelation(dayElement, hgEl) === 'support') supportCount += 0.3;
            else drainCount += 0.3;
        });
    });

    // 月令加權 (月支本氣最重要, 得令額外+3, 傳統八字月令佔四成力量)
    const monthElement = ZHI_WUXING[monthZhi];
    const monthSupport = getRelation(dayElement, monthElement) === 'support';
    if (monthSupport) supportCount += 3;
    else drainCount += 3;

    const score = supportCount - drainCount;
    const isStrong = score >= 0;

    // 喜用神判定
    const favorableGods = isStrong ? ['財', '官', '食傷'] : ['印', '比劫'];
    const unfavorableGods = isStrong ? ['印', '比劫'] : ['財', '官', '食傷'];

    // 偏財判定
    const isWealthFavorable = isStrong; // 身強→偏財是喜神, 身弱→偏財是忌神
    const wealthVerdict = isStrong
        ? `日主 ${dayGan}(${dayElement}) 身強，能擔財。偏財為喜神 ✓`
        : `日主 ${dayGan}(${dayElement}) 身弱，不能擔財。偏財為忌神 ✗`;

    return {
        dayMaster: dayGan,
        dayMasterElement: dayElement,
        isStrong,
        label: isStrong ? '身強' : '身弱',
        score: Math.round(score * 10) / 10,
        supportCount: Math.round(supportCount * 10) / 10,
        drainCount: Math.round(drainCount * 10) / 10,
        monthSupport,
        favorableGods,
        unfavorableGods,
        isWealthFavorable,
        wealthVerdict
    };
};

export const calculateBazi = (date: Date, hours: number = 12, minutes: number = 0, gender: 'male' | 'female' = 'male'): BaziResult => {
    const solar = Solar.fromYmdHms(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        hours,
        minutes,
        0
    );

    const lunar = solar.getLunar();
    const eightChar = lunar.getEightChar();
    eightChar.setSect(2);

    // Solar Terms
    const prevJieQi = lunar.getPrevJieQi(true);
    const nextJieQi = lunar.getNextJieQi(true);

    const yun = eightChar.getYun(gender === 'male' ? 1 : 0);

    const getPillarOpts = (type: 'year' | 'month' | 'day' | 'hour'): BaziPillar => {
        let gan, zhi, naYin, xingYun;

        switch (type) {
            case 'year':
                gan = eightChar.getYearGan();
                zhi = eightChar.getYearZhi();
                naYin = eightChar.getYearNaYin();
                xingYun = eightChar.getYearDiShi();
                break;
            case 'month':
                gan = eightChar.getMonthGan();
                zhi = eightChar.getMonthZhi();
                naYin = eightChar.getMonthNaYin();
                xingYun = eightChar.getMonthDiShi();
                break;
            case 'day':
                gan = eightChar.getDayGan();
                zhi = eightChar.getDayZhi();
                naYin = eightChar.getDayNaYin();
                xingYun = eightChar.getDayDiShi();
                break;
            case 'hour':
                gan = eightChar.getTimeGan();
                zhi = eightChar.getTimeZhi();
                naYin = eightChar.getTimeNaYin();
                xingYun = eightChar.getTimeDiShi();
                break;
        }

        let ganGod = '';
        switch (type) {
            case 'year': ganGod = eightChar.getYearShiShenGan(); break;
            case 'month': ganGod = eightChar.getMonthShiShenGan(); break;
            case 'day': ganGod = '日元'; break;
            case 'hour': ganGod = eightChar.getTimeShiShenGan(); break;
        }

        let hiddenGan: string[] = [];
        let zhiGods: string[] = [];

        switch (type) {
            case 'year': hiddenGan = eightChar.getYearHideGan(); zhiGods = eightChar.getYearShiShenZhi(); break;
            case 'month': hiddenGan = eightChar.getMonthHideGan(); zhiGods = eightChar.getMonthShiShenZhi(); break;
            case 'day': hiddenGan = eightChar.getDayHideGan(); zhiGods = eightChar.getDayShiShenZhi(); break;
            case 'hour': hiddenGan = eightChar.getTimeHideGan(); zhiGods = eightChar.getTimeShiShenZhi(); break;
        }

        const shenSha: string[] = [];

        return {
            gan,
            zhi,
            ganGod,
            zhiGods,
            hiddenGan,
            naYin,
            xingYun,
            shenSha,
            wuXing: { gan: GAN_WUXING[gan] || '', zhi: ZHI_WUXING[zhi] || '' }
        };
    };

    const pillars = {
        year: getPillarOpts('year'),
        month: getPillarOpts('month'),
        day: getPillarOpts('day'),
        hour: getPillarOpts('hour'),
    };

    const interactions: string[] = [];
    const checkInteraction = (p1: BaziPillar, p2: BaziPillar, name1: string, name2: string) => {
        // Gan He
        GAN_HE.forEach(([a, b]) => {
            if ((p1.gan === a && p2.gan === b) || (p1.gan === b && p2.gan === a)) {
                interactions.push(`${name1}${name2}干合 (${p1.gan}${p2.gan})`);
            }
        });
        // Gan Chong
        GAN_CHONG.forEach(([a, b]) => {
            if ((p1.gan === a && p2.gan === b) || (p1.gan === b && p2.gan === a)) {
                interactions.push(`${name1}${name2}干沖 (${p1.gan}${p2.gan})`);
            }
        });
        // Zhi LiuHe
        ZHI_LIUHE.forEach(([a, b]) => {
            if ((p1.zhi === a && p2.zhi === b) || (p1.zhi === b && p2.zhi === a)) {
                interactions.push(`${name1}${name2}支六合 (${p1.zhi}${p2.zhi})`);
            }
        });
        // Zhi Chong
        ZHI_CHONG.forEach(([a, b]) => {
            if ((p1.zhi === a && p2.zhi === b) || (p1.zhi === b && p2.zhi === a)) {
                interactions.push(`${name1}${name2}支沖 (${p1.zhi}${p2.zhi})`);
            }
        });
    };

    checkInteraction(pillars.year, pillars.month, '年', '月');
    checkInteraction(pillars.year, pillars.day, '年', '日');
    checkInteraction(pillars.year, pillars.hour, '年', '時');
    checkInteraction(pillars.month, pillars.day, '月', '日');
    checkInteraction(pillars.month, pillars.hour, '月', '時');
    checkInteraction(pillars.day, pillars.hour, '日', '時');

    const daYunArr = yun.getDaYun();
    const cycles: LuckCycle[] = [];

    for (let i = 0; i < daYunArr.length; i++) {
        const daYun = daYunArr[i];
        cycles.push({
            startAge: daYun.getStartAge(),
            endAge: daYun.getEndAge(),
            ganZhi: daYun.getGanZhi(),
            ganGod: '',
            zhiGod: ''
        });
    }

    const strength = analyzeStrength(pillars);

    return {
        birthSolar: solar.toYmdHms(),
        birthLunar: lunar.toString(),
        sex: gender === 'male' ? '乾造' : '坤造',
        solarTerms: {
            prev: {
                name: prevJieQi.getName(),
                date: prevJieQi.getSolar().toYmdHms()
            },
            next: {
                name: nextJieQi.getName(),
                date: nextJieQi.getSolar().toYmdHms()
            }
        },
        pillars,
        interactions,
        strength,
        luck: {
            startAge: daYunArr.length > 0 ? daYunArr[0].getStartAge() : 0,
            cycles
        }
    };
};

// ========== 偏財日計算 ==========

const WEALTH_MAP: { [key: string]: { stem: string; branches: string[] } } = {
    '甲': { stem: '戊', branches: ['辰', '戌'] },
    '乙': { stem: '己', branches: ['丑', '未'] },
    '丙': { stem: '庚', branches: ['申'] },
    '丁': { stem: '辛', branches: ['酉'] },
    '戊': { stem: '壬', branches: ['子'] },
    '己': { stem: '癸', branches: ['亥'] },
    '庚': { stem: '甲', branches: ['寅'] },
    '辛': { stem: '乙', branches: ['卯'] },
    '壬': { stem: '丙', branches: ['巳'] },
    '癸': { stem: '丁', branches: ['午'] }
};

// ========== 三合六合加強法 ==========

// 天干五合
const TIANGAN_WUHE: [string, string][] = [
    ['甲', '己'], ['乙', '庚'], ['丙', '辛'], ['丁', '壬'], ['戊', '癸']
];

// 地支六合
const DIZHI_LIUHE: [string, string][] = [
    ['子', '丑'], ['寅', '亥'], ['卯', '戌'], ['辰', '酉'], ['巳', '申'], ['午', '未']
];

// 地支三合
const DIZHI_SANHE: [string, string, string][] = [
    ['申', '子', '辰'], // 水局
    ['亥', '卯', '未'], // 木局
    ['寅', '午', '戌'], // 火局
    ['巳', '酉', '丑'], // 金局
];

// 檢查天干是否五合
const isTianganHe = (a: string, b: string): boolean => {
    return TIANGAN_WUHE.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
};

// 檢查地支是否六合
const isDizhiLiuhe = (a: string, b: string): boolean => {
    return DIZHI_LIUHE.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
};

// 檢查地支是否三合（兩個地支屬於同一三合局）
const isDizhiSanhe = (a: string, b: string): boolean => {
    return DIZHI_SANHE.some(group => group.includes(a) && group.includes(b));
};

export interface WealthDay {
    date: string;       // YYYY-MM-DD
    day: number;        // 日
    stem: string;       // 日干
    branch: string;     // 日支
    level: '超級吉' | '大吉' | '中吉' | '超級凶' | '大凶' | '中凶';
    score: number;
    isFavorable: boolean;
    hint: string;
    heJu: string[];     // 合局描述列表
}

export const calculateWealthDays = (
    year: number, month: number,
    birthDayStem: string, isWealthFavorable: boolean,
    birthDayBranch?: string
): WealthDay[] => {
    const wealthInfo = WEALTH_MAP[birthDayStem];
    if (!wealthInfo) return [];

    const daysInMonth = new Date(year, month, 0).getDate();
    const wealthDays: WealthDay[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
        const solar = Solar.fromYmd(year, month, day);
        const lunar = solar.getLunar();
        const eightChar = lunar.getEightChar();
        const dayStem = eightChar.getDayGan();
        const dayBranch = eightChar.getDayZhi();

        let matched: 'stem' | 'branch' | null = null;
        if (dayStem === wealthInfo.stem) matched = 'stem';
        else if (wealthInfo.branches.includes(dayBranch)) matched = 'branch';

        if (matched) {
            const isStem = matched === 'stem';

            // 檢查合局加強
            const heJu: string[] = [];

            // 天干五合：流日天干 vs 命盤日干
            if (isTianganHe(dayStem, birthDayStem)) {
                heJu.push(`天干五合（${dayStem}${birthDayStem}合）`);
            }

            // 地支六合：流日地支 vs 命盤日支
            if (birthDayBranch && isDizhiLiuhe(dayBranch, birthDayBranch)) {
                heJu.push(`地支六合（${dayBranch}${birthDayBranch}合）`);
            }

            // 地支三合：流日地支 vs 命盤日支
            if (birthDayBranch && isDizhiSanhe(dayBranch, birthDayBranch)) {
                heJu.push(`地支三合（${dayBranch}${birthDayBranch}同局）`);
            }

            const hasHeJu = heJu.length > 0;

            let level: WealthDay['level'];
            let score: number;
            let hint: string;

            if (isWealthFavorable) {
                if (hasHeJu) {
                    level = '超級吉';
                    score = 6;
                    hint = `超級偏財日！${isStem ? '天干偏財透出' : '地支偏財藏根'}＋${heJu.join('、')}`;
                } else {
                    level = isStem ? '大吉' : '中吉';
                    score = isStem ? 5 : 4;
                    hint = isStem ? '天干偏財透出，求財大利' : '地支偏財藏根，暗中有財';
                }
            } else {
                if (hasHeJu) {
                    level = '超級凶';
                    score = -6;
                    hint = `超級破財日！${isStem ? '天干偏財透出' : '地支偏財藏根'}＋${heJu.join('、')}`;
                } else {
                    level = isStem ? '大凶' : '中凶';
                    score = isStem ? -5 : -4;
                    hint = isStem ? '天干偏財透出，破財風險高' : '地支偏財藏根，暗耗錢財';
                }
            }

            wealthDays.push({
                date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                day,
                stem: dayStem,
                branch: dayBranch,
                level,
                score,
                isFavorable: isWealthFavorable,
                hint,
                heJu
            });
        }
    }

    return wealthDays;
};

// ========== 喜神吉日計算 ==========

// 每個天干對應的十神天干 (以日元為主)
// 比肩=同我, 劫財=同五行異陰陽, 印=生我
const GAN_RELATION: { [key: string]: { biJie: string[]; yin: string[] } } = {
    '甲': { biJie: ['甲', '乙'], yin: ['壬', '癸'] },
    '乙': { biJie: ['甲', '乙'], yin: ['壬', '癸'] },
    '丙': { biJie: ['丙', '丁'], yin: ['甲', '乙'] },
    '丁': { biJie: ['丙', '丁'], yin: ['甲', '乙'] },
    '戊': { biJie: ['戊', '己'], yin: ['丙', '丁'] },
    '己': { biJie: ['戊', '己'], yin: ['丙', '丁'] },
    '庚': { biJie: ['庚', '辛'], yin: ['戊', '己'] },
    '辛': { biJie: ['庚', '辛'], yin: ['戊', '己'] },
    '壬': { biJie: ['壬', '癸'], yin: ['庚', '辛'] },
    '癸': { biJie: ['壬', '癸'], yin: ['庚', '辛'] },
};

export interface LuckyDay {
    date: string;
    day: number;
    stem: string;
    branch: string;
    type: '印星' | '比劫';
    level: '大吉' | '中吉';
    hint: string;
}

export const calculateLuckyDays = (year: number, month: number, birthDayStem: string): LuckyDay[] => {
    const relations = GAN_RELATION[birthDayStem];
    if (!relations) return [];

    const dayElement = GAN_WUXING[birthDayStem];
    // 印的五行: 生我者
    const yinElement = WUXING_CYCLE[(WUXING_CYCLE.indexOf(dayElement) - 1 + 5) % 5]; // 生我的五行
    // 比劫的五行: 同我
    const biJieElement = dayElement;

    // 印的地支
    const yinBranches = Object.entries(ZHI_WUXING).filter(([_, el]) => el === yinElement).map(([z]) => z);
    // 比劫的地支
    const biJieBranches = Object.entries(ZHI_WUXING).filter(([_, el]) => el === biJieElement).map(([z]) => z);

    const daysInMonth = new Date(year, month, 0).getDate();
    const luckyDays: LuckyDay[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
        const solar = Solar.fromYmd(year, month, day);
        const lunar = solar.getLunar();
        const eightChar = lunar.getEightChar();
        const dayStem = eightChar.getDayGan();
        const dayBranch = eightChar.getDayZhi();

        // 印星天干 (大吉)
        if (relations.yin.includes(dayStem)) {
            luckyDays.push({
                date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                day, stem: dayStem, branch: dayBranch,
                type: '印星', level: '大吉',
                hint: '印星透出，貴人相助，利學習進修'
            });
        }
        // 比劫天干 (中吉) — 排除日元自身重複
        else if (relations.biJie.includes(dayStem) && dayStem !== birthDayStem) {
            luckyDays.push({
                date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                day, stem: dayStem, branch: dayBranch,
                type: '比劫', level: '中吉',
                hint: '比肩劫財助力，利合作合夥'
            });
        }
        // 印星地支 (中吉)
        else if (yinBranches.includes(dayBranch)) {
            luckyDays.push({
                date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                day, stem: dayStem, branch: dayBranch,
                type: '印星', level: '中吉',
                hint: '地支印星藏根，暗有貴人助'
            });
        }
        // 比劫地支 (中吉)
        else if (biJieBranches.includes(dayBranch)) {
            luckyDays.push({
                date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                day, stem: dayStem, branch: dayBranch,
                type: '比劫', level: '中吉',
                hint: '地支比劫藏根，同輩助力'
            });
        }
    }

    return luckyDays;
};
