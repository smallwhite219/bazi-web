import { Solar, Lunar, Gan, Zhi } from 'lunar-javascript';

const date = new Date();
const solar = Solar.fromDate(date);
const lunar = solar.getLunar();
const eightChar = lunar.getEightChar();
eightChar.setSect(2);

const yearGanStr = eightChar.getYearGan();
const yearZhiStr = eightChar.getYearZhi();

console.log('Year Gan Str:', yearGanStr);
const gan = Gan.fromName(yearGanStr);
console.log('Gan WuXing:', gan.getWuXing()); // WuXing object? or string?
console.log('Gan WuXing Name:', gan.getWuXing().getName());

console.log('Year Zhi Str:', yearZhiStr);
const zhi = Zhi.fromName(yearZhiStr);
console.log('Zhi WuXing:', zhi.getWuXing().getName());

// Check interactions
console.log('Gan Prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(gan)));
console.log('Zhi Prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(zhi)));

// Try to find if there are interaction methods
// e.g. gan.getHe(), gan.getChong()
