import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { calculateBazi, BaziResult, calculateWealthDays, calculateLuckyDays, WealthDay } from '../BaziEngine';
import type { LuckyDay } from '../BaziEngine';
import { calculateLifePath, calculateFortune, generateLuckyNumbers } from '../LifePathCalc';
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
    const [selectedDay, setSelectedDay] = useState<{ day: number; wd: WealthDay | null; ld: LuckyDay | null } | null>(null);

    const handleCalculate = () => {
        const res = calculateBazi(date, time, minute, gender);
        setResult(res);
    };

    // Auto-calculate wealth days when result or month changes
    const wealthDays = useMemo(() => {
        if (!result) return [];
        return calculateWealthDays(wealthYear, wealthMonth, result.pillars.day.gan, result.strength.isWealthFavorable, result.pillars.day.zhi);
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
        <>
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

                        {/* 財運月曆 - Unified Calendar */}
                        <div className="glass-card p-6 md:p-8">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                                <h3 className="text-xl font-bold flex items-center gap-3 text-gray-300">
                                    <span className="w-1 h-6 bg-amber-500 rounded-full" /> 財運月曆
                                    <span className="text-sm font-normal text-gray-500">（日元：{result.pillars.day.gan}）</span>
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => { if (wealthMonth === 1) { setWealthMonth(12); setWealthYear(y => y - 1); } else setWealthMonth(m => m - 1); }}
                                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">◀</button>
                                    <span className="text-lg font-bold text-white min-w-[120px] text-center">{wealthYear} / {String(wealthMonth).padStart(2, '0')}</span>
                                    <button onClick={() => { if (wealthMonth === 12) { setWealthMonth(1); setWealthYear(y => y + 1); } else setWealthMonth(m => m + 1); }}
                                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">▶</button>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap gap-3 mb-4 text-[11px] text-gray-400">
                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500/60" /> 偏財吉日</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/40 border border-red-500/60" /> 偏財凶日</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500/60" /> 喜神吉日</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-fuchsia-500/40 border border-fuchsia-500/60" /> 超級日</span>
                            </div>

                            {(() => {
                                const daysInMonth = new Date(wealthYear, wealthMonth, 0).getDate();
                                const firstDow = new Date(wealthYear, wealthMonth - 1, 1).getDay();
                                const wMap = new Map(wealthDays.map(w => [w.day, w]));
                                const lMap = new Map(luckyDays.map(l => [l.day, l]));
                                const cells: JSX.Element[] = [];
                                for (let i = 0; i < firstDow; i++) cells.push(<div key={`e${i}`} className="min-h-[80px]" />);
                                for (let d = 1; d <= daysInMonth; d++) {
                                    const wd = wMap.get(d); const ld = lMap.get(d);
                                    const hw = !!wd; const hl = !!ld;
                                    const sup = wd && (wd.level === '超級吉' || wd.level === '超級凶');
                                    const wg = wd?.isFavorable;
                                    let bc = 'border-white/5', bg = 'bg-white/[0.02]';
                                    if (sup) { bc = wg ? 'border-fuchsia-400/60 ring-1 ring-fuchsia-400/30' : 'border-red-400/60 ring-1 ring-red-400/20'; bg = wg ? 'bg-gradient-to-br from-fuchsia-500/25 to-violet-500/10' : 'bg-gradient-to-br from-red-600/20 to-red-900/5'; }
                                    else if (hw && hl) { bc = 'border-amber-500/40'; bg = 'bg-gradient-to-br from-amber-500/10 to-emerald-500/5'; }
                                    else if (hw) { bc = wg ? 'border-amber-500/40' : 'border-red-500/40'; bg = wg ? 'bg-amber-500/5' : 'bg-red-500/5'; }
                                    else if (hl) { bc = 'border-emerald-500/40'; bg = 'bg-emerald-500/5'; }
                                    cells.push(
                                        <div key={d} onClick={() => setSelectedDay({ day: d, wd: wd || null, ld: ld || null })} className={`min-h-[80px] rounded-lg border p-1.5 transition-all hover:scale-[1.02] relative overflow-hidden cursor-pointer ${bc} ${bg}`}>
                                            {sup && <div className="absolute top-0 right-0 text-[7px] px-1 py-0.5 rounded-bl font-bold" style={{ background: wg ? 'linear-gradient(135deg,#d946ef,#a855f7)' : 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff' }}>{wg ? '⭐' : '💥'}</div>}
                                            <div className="flex items-start justify-between">
                                                <span className={`text-base font-black ${hw || hl ? 'text-white' : 'text-gray-600'}`}>{d}</span>
                                                <div className="flex flex-col items-end gap-0.5">
                                                    {hw && <span className={`text-[8px] font-bold px-1 py-0 rounded-full ${sup ? (wg ? 'bg-fuchsia-500/40 text-fuchsia-200' : 'bg-red-600/40 text-red-200') : wg ? 'bg-amber-500/30 text-amber-300' : 'bg-red-500/30 text-red-300'}`}>{wd!.level}</span>}
                                                    {hl && <span className={`text-[8px] font-bold px-1 py-0 rounded-full ${ld!.type === '印星' ? 'bg-emerald-500/30 text-emerald-300' : 'bg-cyan-500/30 text-cyan-300'}`}>{ld!.type}</span>}
                                                </div>
                                            </div>
                                            {(hw || hl) && <div className="text-[9px] text-gray-500 font-mono">{(wd || ld)!.stem}{(wd || ld)!.branch}</div>}
                                            {wd && wd.shenSha.length > 0 && <div className="flex flex-wrap gap-0.5 mt-0.5">{wd.shenSha.map((ss, j) => <span key={j} className={`text-[7px] px-1 rounded ${ss.type === 'good' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`} title={ss.description}>{ss.name}</span>)}</div>}
                                            {wd && wd.heJu.length > 0 && <div className="flex flex-wrap gap-0.5 mt-0.5">{wd.heJu.map((h, j) => <span key={j} className="text-[7px] px-1 rounded bg-yellow-500/15 text-yellow-400">{h.replace(/（.*?）/, '')}</span>)}</div>}
                                            {hl && !hw && <div className="text-[7px] text-emerald-400/70 mt-0.5 leading-tight">{ld!.hint.substring(0, 10)}</div>}
                                        </div>
                                    );
                                }
                                return (<>
                                    <div className="grid grid-cols-7 gap-1 mb-1">{['日', '一', '二', '三', '四', '五', '六'].map(x => <div key={x} className="text-center text-xs text-gray-500 font-medium py-1">{x}</div>)}</div>
                                    <div className="grid grid-cols-7 gap-1">{cells}</div>
                                </>);
                            })()}

                            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/5 text-sm">
                                <span className="text-gray-500">偏財日 <span className={result.strength.isWealthFavorable ? 'text-amber-400' : 'text-red-400'}>{wealthDays.length}</span> 天</span>
                                <span className="text-gray-500">喜神日 <span className="text-emerald-400">{luckyDays.length}</span> 天</span>
                                {wealthDays.filter(w => w.level === '超級吉' || w.level === '超級凶').length > 0 && <span className="text-gray-500">超級日 <span className="text-yellow-400">{wealthDays.filter(w => w.level === '超級吉' || w.level === '超級凶').length}</span> 天</span>}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
            {/* Day Detail Modal */}
            {(() => {
                const sd = selectedDay;
                if (!sd) return null;
                return (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedDay(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="bg-gray-900 border border-white/10 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">
                                    {wealthYear}/{String(wealthMonth).padStart(2, '0')}/{String(sd.day).padStart(2, '0')}
                                    {(sd.wd || sd.ld) && (
                                        <span className="text-gray-400 font-mono ml-2">
                                            {(sd.wd || sd.ld)!.stem}{(sd.wd || sd.ld)!.branch}日
                                        </span>
                                    )}
                                </h3>
                                <button onClick={() => setSelectedDay(null)} className="text-gray-500 hover:text-white text-xl">✕</button>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {sd.wd && (
                                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${sd.wd.level.includes('吉') ? (sd.wd.level === '超級吉' ? 'bg-fuchsia-500/30 text-fuchsia-200' : 'bg-amber-500/30 text-amber-300')
                                        : (sd.wd.level === '超級凶' ? 'bg-red-600/30 text-red-200' : 'bg-red-500/30 text-red-300')
                                        }`}>
                                        偏財 {sd.wd.level}
                                    </span>
                                )}
                                {sd.ld && (
                                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${sd.ld.type === '印星' ? 'bg-emerald-500/30 text-emerald-300' : 'bg-cyan-500/30 text-cyan-300'
                                        }`}>
                                        喜神 {sd.ld.type} {sd.ld.level}
                                    </span>
                                )}
                            </div>
                            {sd.wd && sd.wd.shenSha.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {sd.wd.shenSha.map((ss, j) => (
                                        <span key={j} className={`text-xs px-2 py-1 rounded-lg font-medium ${ss.type === 'good' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                            }`}>
                                            {ss.type === 'good' ? '✦ ' : '✧ '}{ss.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="space-y-1.5">
                                {generateAdvice(sd.wd, sd.ld).map((line, i) => (
                                    <p key={i} className={`text-sm leading-relaxed ${line === '' ? 'h-2'
                                        : line.startsWith('🟢') || line.startsWith('🔴') || line.startsWith('🔗') ? 'text-gray-300 font-medium mt-2'
                                            : line.startsWith('  ·') ? 'text-gray-400 pl-2'
                                                : 'text-gray-300'
                                        }`}>
                                        {line}
                                    </p>
                                ))}
                            </div>

                            {/* 今日幸運解碼 — from life-path-app */}
                            {(() => {
                                const birthDate = new Date(1987, 5, 5); // 1987/06/05
                                const targetDate = new Date(wealthYear, wealthMonth - 1, sd.day);
                                const lp = calculateLifePath(birthDate);
                                const fortune = calculateFortune(birthDate, targetDate);
                                const lucky = generateLuckyNumbers(lp, targetDate);
                                return (
                                    <div className="mt-6 pt-5 border-t border-white/10">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-bold flex items-center gap-2 text-amber-400">
                                                ✨ 今日幸運解碼
                                            </h4>
                                            <span className="text-[10px] px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 font-bold tracking-wider uppercase">主命數 {lp}</span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 mb-5">
                                            {[
                                                { label: '流年', value: fortune.yearEnergy, color: 'from-violet-500/20 to-indigo-500/10 border-violet-500/30' },
                                                { label: '流月', value: fortune.monthEnergy, color: 'from-fuchsia-500/20 to-rose-500/10 border-fuchsia-500/30' },
                                                { label: '流日', value: fortune.dayEnergy, color: 'from-sky-500/20 to-emerald-500/10 border-sky-500/30' }
                                            ].map(f => (
                                                <div key={f.label} className={`text-center p-3 rounded-xl bg-gradient-to-br border ${f.color}`}>
                                                    <div className="text-[10px] text-gray-400 font-bold tracking-widest mb-1">{f.label}</div>
                                                    <div className="text-2xl font-black text-white">{f.value}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <p className="text-xs text-gray-500 mb-3">根據主命數 {lp} 與宇宙波頻生成的專屬號碼 (範圍 1-39)</p>
                                        <div className="flex flex-wrap justify-center gap-3">
                                            {lucky.map((n, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ scale: 0, rotate: -10 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
                                                    className="w-12 h-12 flex items-center justify-center bg-gradient-to-b from-gray-800 to-black border border-amber-500/30 rounded-full text-lg font-black text-amber-400 shadow-lg hover:border-amber-400/60 hover:scale-110 transition-all"
                                                >
                                                    {n}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </motion.div>
                    </div>
                );
            })()}
        </>
    );
};

// 生成白話文建議
const generateAdvice = (wd: WealthDay | null, ld: LuckyDay | null): string[] => {
    const lines: string[] = [];
    if (!wd && !ld) return ['這天沒有特別的財運或喜神能量，是平淡的一天。可以安心處理日常事務。'];

    if (wd) {
        const isFav = wd.isFavorable;
        if (wd.level === '超級吉') {
            lines.push('🌟 這天是超級偏財吉日！天時地利都站在你這邊，非常適合處理跟錢有關的事情。');
            lines.push('💰 建議：可以大膽談生意、投資理財、買彩票、簽重要合約。把握機會，今天的財運非常旺！');
        } else if (wd.level === '大吉') {
            lines.push('✅ 今天偏財星透出，財運不錯。');
            lines.push('💰 建議：適合處理財務相關事項，例如談薪水、收帳款、開會討論投資方案。');
        } else if (wd.level === '中吉') {
            lines.push('📗 今天有偏財的跡象，但力道不算特別強。');
            lines.push('💰 建議：小額投資或日常理財可以進行，但不建議做太大的財務決策。');
        } else if (wd.level === '超級凶') {
            lines.push('🚨 這天是超級破財日！多重凶煞同時發動，財務風險極高。');
            lines.push('⛔ 建議：千萬不要衝動消費、借錢給別人、或做任何大額投資。能不花錢就不花錢。');
        } else if (wd.level === '大凶') {
            lines.push('⚠️ 今天偏財星透出，但你的八字扛不住這個財，容易破財。');
            lines.push('⛔ 建議：避免重大財務決策、不要借錢給朋友、小心被騙或衝動購物。');
        } else if (wd.level === '中凶') {
            lines.push('📙 今天暗中有些破財的跡象，但影響不算太大。');
            lines.push('⛔ 建議：注意小額支出，不要亂刷卡。日常消費沒問題，但避免大額交易。');
        }

        const goodSha = wd.shenSha.filter(s => s.type === 'good');
        const badSha = wd.shenSha.filter(s => s.type === 'bad');
        if (goodSha.length > 0) {
            lines.push('');
            lines.push('🟢 吉神加持：');
            goodSha.forEach(s => {
                if (s.name === '天財') lines.push('  · 天財星現身 — 偏財能量很強，有意外之財的機會。');
                if (s.name === '驛馬') lines.push('  · 驛馬星動 — 出門走動反而容易遇到好機會，適合外出辦事、見客戶。');
                if (s.name === '祿神') lines.push('  · 祿神照命 — 正財穩定，今天工作上容易有好的收穫或加薪機會。');
            });
        }
        if (badSha.length > 0) {
            lines.push('');
            lines.push('🔴 凶煞提醒：');
            badSha.forEach(s => {
                if (s.name === '羊刃') lines.push('  · 羊刃發動 — 容易衝動行事、跟人起衝突。花錢前請三思。');
                if (s.name === '劫財') lines.push('  · 劫財出現 — 小心身邊有人惦記你的錢，不要輕易借錢或合夥。');
                if (s.name === '空亡') lines.push('  · 空亡落入 — 今天做的財務決定容易「白忙一場」，建議觀望就好。');
            });
        }

        if (wd.heJu.length > 0) {
            lines.push('');
            lines.push('🔗 合局加強：');
            wd.heJu.forEach(h => {
                lines.push(`  · ${h}`);
            });
            lines.push(isFav ? '  → 合局讓財運能量更集中，好上加好！' : '  → 合局加重了破財的力道，更要小心！');
        }
    }

    if (ld) {
        lines.push('');
        if (ld.type === '印星') {
            lines.push('📚 印星加持 — 今天特別適合學習、進修、考試。如果要做重要決定，多聽長輩或專家的建議會很有幫助。');
        } else {
            lines.push('🤝 比劫相助 — 今天適合跟朋友合作、團隊作業。有貴人運，遇到困難可以找人幫忙。');
        }
        if (wd) {
            lines.push('💡 提醒：今天同時有偏財和喜神的能量，建議「有策略地」處理財務，不要盲目行動。');
        }
    }

    return lines;
};

export default BaziChart;

