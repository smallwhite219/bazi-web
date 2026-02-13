/**
 * 生命靈數演算法 — 從 life-path-app 擷取
 */

export const reduceNumber = (num: number, keepMaster: boolean = true): number => {
    if (keepMaster && (num === 11 || num === 22 || num === 33)) return num;
    if (num < 10) return num;
    const sum = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    return reduceNumber(sum, keepMaster);
};

export const calculateLifePath = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const sumY = reduceNumber(year, false);
    const sumM = reduceNumber(month, false);
    const sumD = reduceNumber(day, false);

    let finalSum = sumY + sumM + sumD;

    if (finalSum === 11 || finalSum === 22 || finalSum === 33) return finalSum.toString();
    return reduceNumber(finalSum, true).toString();
};

export const calculateFortune = (birthDate: Date, targetDate: Date) => {
    const birthMonth = birthDate.getMonth() + 1;
    const birthDay = birthDate.getDate();
    const targetYear = targetDate.getFullYear();

    // 流年：目標年份 + 生日月 + 生日日
    const yearEnergy = reduceNumber(targetYear + birthMonth + birthDay, true);
    // 流月：流年 + 當前月份
    const monthEnergy = reduceNumber(yearEnergy + (targetDate.getMonth() + 1), true);
    // 流日：流月 + 當前日期
    const dayEnergy = reduceNumber(monthEnergy + targetDate.getDate(), true);

    return { yearEnergy, monthEnergy, dayEnergy };
};

export const generateLuckyNumbers = (lp: string, date: Date): number[] => {
    const seed = parseInt(lp) + date.getDate() + date.getMonth() + date.getFullYear();
    const luckySet = new Set<number>();

    let i = 0;
    while (luckySet.size < 5) {
        const num = ((seed * (i + 13) * 7) % 39) + 1;
        luckySet.add(num);
        i++;
        if (i > 30) {
            luckySet.add(((seed + i) % 39) + 1);
        }
    }

    return Array.from(luckySet).sort((a, b) => a - b);
};
