import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { calculateBazi, BaziResult, calculateWealthDays, calculateLuckyDays } from '../BaziEngine';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const BaziChart = () => {
    const [date, setDate] = useState<Date>(new Date('1987-06-05'));
    const [time, setTime] = useState<number>(1); // Hour 0-23
    const [minute, setMinute] = useState<number>(20); // Minute 0-59
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [result, setResult] = useState<BaziResult | null>(null);
    const [wealthYear, setWealthYear] = useState<number>(new Date().getFullYear());
    const [wealthMonth, setWealthMonth] = useState<number>(new Date().getMonth() + 1);

    const handleCalculate = () => {
        const res = calculateBazi(date, time, minute, gender);
        setResult(res);
    };

    // Auto-calculate wealth days when result or month changes
    const wealthDays = useMemo(() => {
        if (!result) return [];
        return calculateWealthDays(wealthYear, wealthMonth, result.pillars.day.gan, result.strength.isWealthFavorable);
    }, [result, wealthYear, wealthMonth]);

    // Auto-calculate lucky days (印星/比劫) for 身弱
    const luckyDays = useMemo(() => {
        if (!result) return [];
        return calculateLuckyDays(wealthYear, wealthMonth, result.pillars.day.gan);
    }, [result, wealthYear, wealthMonth]);

    const getWuXingColor = (wx: string) => {
        switch (wx) {
            case '木': return 'text-green-500';
            case '火': return 'text-red-500';
            case '土': return 'text-amber-700';
            case '金': return 'text-yellow-500';
            case '水': return 'text-blue-500';
            default: return 'text-white';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12">
            {/* Control Panel */}
            <div className="glass-card p-10 flex flex-col md:flex-row gap-8 items-end justify-center">
                <div className="space-y-2">
                    <label className="text-gray-400 font-bold uppercase text-xs tracking-widest">出生日期</label>
                    <DatePicker
                        selected={date}
                        onChange={(d: Date | null) => d && setDate(d)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold w-48 text-center outline-none focus:border-amber-400/50 transition-colors"
                        dateFormat="yyyy/MM/dd"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-gray-400 font-bold uppercase text-xs tracking-widest">出生時間</label>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <input
                                type="number"
                                min={0} max={23}
                                value={time}
                                onChange={(e) => setTime(Number(e.target.value))}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold w-20 text-center outline-none focus:border-amber-400/50 transition-colors"
                                placeholder="時"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">時</span>
                        </div>
                        <span className="text-gray-500 font-bold">:</span>
                        <div className="relative">
                            <input
                                type="number"
                                min={0} max={59}
                                value={minute}
                                onChange={(e) => setMinute(Number(e.target.value))}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold w-20 text-center outline-none focus:border-amber-400/50 transition-colors"
                                placeholder="分"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">分</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-gray-400 font-bold uppercase text-xs tracking-widest">性別</label>
                    <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                        <button
                            onClick={() => setGender('male')}
                            className={`px-6 py-2 rounded-lg font-bold transition-all ${gender === 'male' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            乾造 (男)
                        </button>
                        <button
                            onClick={() => setGender('female')}
                            className={`px-6 py-2 rounded-lg font-bold transition-all ${gender === 'female' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            坤造 (女)
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleCalculate}
                    className="btn-primary py-3 px-8 text-lg hover:shadow-amber-500/20"
                >
                    開始排盤
                </button>
            </div>

            {/* Main Chart */}
            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    {/* Header Info */}
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-black text-amber-500">{result.birthLunar}</h2>
                        <p className="text-gray-400 font-medium tracking-widest">
                            {result.sex} • 起運：{result.luck.startAge} 歲
                        </p>
                        <div className="flex justify-center gap-6 text-sm text-gray-400 mt-2 font-mono">
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                <span className="text-amber-500 text-xs">上節</span>
                                <span>{result.solarTerms.prev.name}</span>
                                <span className="text-gray-500 text-xs">{result.solarTerms.prev.date.slice(5, 16)}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                <span className="text-amber-500 text-xs">下節</span>
                                <span>{result.solarTerms.next.name}</span>
                                <span className="text-gray-500 text-xs">{result.solarTerms.next.date.slice(5, 16)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Four Pillars */}
                    <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
                        {['year', 'month', 'day', 'hour'].map((pillarKey, index) => {
                            const p = result.pillars[pillarKey as keyof typeof result.pillars];
                            const titles = ['年柱', '月柱', '日柱', '時柱'];

                            return (
                                <div key={pillarKey} className="flex flex-col gap-4">
                                    <div className="text-center text-gray-400 font-bold text-sm tracking-[0.2em] mb-2">{titles[index]}</div>

                                    {/* Main Pillar Card */}
                                    <div className="glass-card p-0 overflow-hidden border-amber-500/20 group hover:border-amber-500/50 transition-colors">
                                        {/* Ten God (Head) */}
                                        <div className="h-12 flex items-center justify-center bg-white/5 text-xs text-gray-400 font-medium">
                                            {p.ganGod || '-'}
                                        </div>

                                        {/* Gan (Heavenly Stem) */}
                                        <div className={`h-24 flex items-center justify-center text-5xl font-black relative border-b border-white/5 ${getWuXingColor(p.wuXing.gan)}`}>
                                            {p.gan}
                                            <div className="absolute top-2 right-2 flex flex-col items-end">
                                                <span className="text-[10px] text-gray-600 font-medium">{p.wuXing.gan}</span>
                                            </div>
                                        </div>

                                        {/* Zhi (Earthly Branch) */}
                                        <div className={`h-24 flex items-center justify-center text-5xl font-black relative bg-gradient-to-b from-transparent to-white/5 ${getWuXingColor(p.wuXing.zhi)}`}>
                                            {p.zhi}
                                            <div className="absolute bottom-2 right-2 flex flex-col items-end">
                                                <span className="text-[10px] text-gray-600 font-medium">{p.wuXing.zhi}</span>
                                            </div>
                                        </div>

                                        {/* Hidden Stems (Cang Gan) */}
                                        <div className="p-4 space-y-2 bg-white/5 min-h-[120px]">
                                            {p.hiddenGan.map((hg, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <span className="text-white/60 font-medium">{hg}</span>
                                                    <span className="text-xs text-gray-500 scale-90 origin-right">{p.zhiGods[idx]}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Na Yin & Shen Sha */}
                                        <div className="p-3 bg-black/20 text-center space-y-1">
                                            <div className="text-xs text-amber-400/80 font-bold">{p.naYin}</div>
                                            <div className="text-[10px] text-gray-500">{p.xingYun}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Interactions */}
                    {result.interactions && result.interactions.length > 0 && (
                        <div className="glass-card p-6 border-red-500/20 max-w-4xl mx-auto">
                            <h3 className="text-sm font-bold text-red-400 mb-4 tracking-widest uppercase">刑沖合害 CHECK</h3>
                            <div className="flex flex-wrap gap-3">
                                {result.interactions.map((interaction, i) => (
                                    <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-300 text-sm font-medium">
                                        {interaction}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Luck Cycles (Da Yun) */}
                    <div className="glass-card p-8 overflow-x-auto">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-300">
                            <span className="w-1 h-6 bg-amber-500 rounded-full" /> 大運排盤
                        </h3>
                        <div className="flex gap-4 min-w-max pb-4">
                            {result.luck.cycles.map((cycle, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 min-w-[80px]">
                                    <span className="text-xs text-gray-500 font-mono mb-1">{cycle.startAge}-{cycle.endAge}</span>
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold border border-white/10 ${i < 2 ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-gray-300'}`}>
                                        {cycle.ganZhi}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 身強弱分析 Strength Analysis */}
                    <div className={`glass-card p-6 max-w-4xl mx-auto border ${result.strength.isStrong ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
                        <h3 className="text-sm font-bold mb-4 tracking-widest uppercase flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${result.strength.isStrong ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className={result.strength.isStrong ? 'text-emerald-400' : 'text-red-400'}>
                                日主強弱分析
                            </span>
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-white/5 rounded-xl p-3 text-center">
                                <div className="text-xs text-gray-500 mb-1">日元</div>
                                <div className="text-2xl font-black text-white">{result.strength.dayMaster}</div>
                                <div className="text-xs text-gray-400">{result.strength.dayMasterElement}</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 text-center">
                                <div className="text-xs text-gray-500 mb-1">判定</div>
                                <div className={`text-2xl font-black ${result.strength.isStrong ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {result.strength.label}
                                </div>
                                <div className="text-xs text-gray-400">分數: {result.strength.score}</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 text-center">
                                <div className="text-xs text-gray-500 mb-1">生助 / 洩剋</div>
                                <div className="text-lg font-bold">
                                    <span className="text-emerald-400">{result.strength.supportCount}</span>
                                    <span className="text-gray-600 mx-1">/</span>
                                    <span className="text-red-400">{result.strength.drainCount}</span>
                                </div>
                                <div className="text-xs text-gray-400">
                                    月令{result.strength.monthSupport ? '✓ 得令' : '✗ 失令'}
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 text-center">
                                <div className="text-xs text-gray-500 mb-1">偏財判定</div>
                                <div className={`text-lg font-bold ${result.strength.isWealthFavorable ? 'text-amber-400' : 'text-red-400'}`}>
                                    {result.strength.isWealthFavorable ? '喜神 ✓' : '忌神 ✗'}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {result.strength.isWealthFavorable ? '能擔財' : '不能擔財'}
                                </div>
                            </div>
                        </div>

                        <div className={`rounded-lg px-4 py-2 text-sm font-medium ${result.strength.isStrong ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                            {result.strength.wealthVerdict}
                        </div>

                        <div className="flex gap-4 mt-3 text-xs">
                            <div>
                                <span className="text-gray-500">喜神: </span>
                                {result.strength.favorableGods.map(g => (
                                    <span key={g} className="text-emerald-400 mr-1 bg-emerald-500/10 px-1.5 py-0.5 rounded">{g}</span>
                                ))}
                            </div>
                            <div>
                                <span className="text-gray-500">忌神: </span>
                                {result.strength.unfavorableGods.map(g => (
                                    <span key={g} className="text-red-400 mr-1 bg-red-500/10 px-1.5 py-0.5 rounded">{g}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Luck Cycles (Da Yun) */}
                    <div className="glass-card p-8 overflow-x-auto">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-300">
                            <span className="w-1 h-6 bg-amber-500 rounded-full" /> 大運排盤
                        </h3>
                        <div className="flex gap-4 min-w-max pb-4">
                            {result.luck.cycles.map((cycle, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 min-w-[80px]">
                                    <span className="text-xs text-gray-500 font-mono mb-1">{cycle.startAge}-{cycle.endAge}</span>
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold border border-white/10 ${i < 2 ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-gray-300'}`}>
                                        {cycle.ganZhi}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 偏財日 Wealth Days */}
                    <div className="glass-card p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-3 text-gray-300">
                                <span className={`w-1 h-6 rounded-full ${result.strength.isWealthFavorable ? 'bg-green-500' : 'bg-red-500'}`} />
                                {result.strength.isWealthFavorable ? '偏財吉日' : '偏財凶日（避開）'}
                                <span className="text-sm font-normal text-gray-500">（日元：{result.pillars.day.gan}）</span>
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        if (wealthMonth === 1) { setWealthMonth(12); setWealthYear(y => y - 1); }
                                        else setWealthMonth(m => m - 1);
                                    }}
                                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    ◀
                                </button>
                                <span className="text-lg font-bold text-white min-w-[120px] text-center">
                                    {wealthYear} / {String(wealthMonth).padStart(2, '0')}
                                </span>
                                <button
                                    onClick={() => {
                                        if (wealthMonth === 12) { setWealthMonth(1); setWealthYear(y => y + 1); }
                                        else setWealthMonth(m => m + 1);
                                    }}
                                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    ▶
                                </button>
                            </div>
                        </div>

                        {!result.strength.isWealthFavorable && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 text-sm text-red-300 mb-4">
                                ⚠️ 日主身弱，偏財為忌神。以下日期容易破財、被騙，應避開重大財務決策。
                            </div>
                        )}

                        {wealthDays.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">本月無偏財日</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {wealthDays.map((wd, i) => {
                                    const isGood = wd.isFavorable;
                                    const isBig = wd.level === '大吉' || wd.level === '大凶';
                                    return (
                                        <div
                                            key={i}
                                            className={`rounded-xl p-4 border transition-all hover:scale-105 ${isGood
                                                ? (isBig
                                                    ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-amber-500/40'
                                                    : 'bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/30')
                                                : (isBig
                                                    ? 'bg-gradient-to-br from-red-500/20 to-red-900/10 border-red-500/40'
                                                    : 'bg-gradient-to-br from-purple-500/10 to-red-500/5 border-purple-500/30')
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-2xl font-black text-white">{wd.day}</span>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isGood
                                                    ? (isBig ? 'bg-amber-500/30 text-amber-300' : 'bg-green-500/30 text-green-300')
                                                    : (isBig ? 'bg-red-500/30 text-red-300' : 'bg-purple-500/30 text-purple-300')
                                                    }`}>
                                                    {wd.level}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-400 font-mono">
                                                {wd.stem}{wd.branch}日
                                            </div>
                                            <div className="text-[10px] text-gray-500 mt-1">
                                                {wd.hint}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 喜神吉日 Lucky Days */}
                    <div className="glass-card p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-3 text-gray-300">
                                <span className="w-1 h-6 bg-emerald-500 rounded-full" /> 喜神吉日
                                <span className="text-sm font-normal text-gray-500">（印星·比劫 → 生助日主）</span>
                            </h3>
                        </div>

                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2 text-sm text-emerald-300 mb-4">
                            ✨ 以下日期日主得助，適合重要決策、求財、簽約、學習。
                        </div>

                        {luckyDays.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">本月無喜神吉日</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {luckyDays.map((ld, i) => (
                                    <div
                                        key={i}
                                        className={`rounded-xl p-4 border transition-all hover:scale-105 ${ld.level === '大吉'
                                                ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-500/40'
                                                : 'bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-cyan-500/30'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-2xl font-black text-white">{ld.day}</span>
                                            <div className="flex items-center gap-1">
                                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${ld.type === '印星' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
                                                    }`}>
                                                    {ld.type}
                                                </span>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ld.level === '大吉' ? 'bg-emerald-500/30 text-emerald-300' : 'bg-cyan-500/30 text-cyan-300'
                                                    }`}>
                                                    {ld.level}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-400 font-mono">
                                            {ld.stem}{ld.branch}日
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-1">
                                            {ld.hint}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default BaziChart;
