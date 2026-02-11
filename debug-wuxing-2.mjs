import { Solar, Lunar } from 'lunar-javascript';

const date = new Date();
const solar = Solar.fromDate(date);
const lunar = solar.getLunar();
const eightChar = lunar.getEightChar();
eightChar.setSect(2);

const yearGan = eightChar.getYearGan();
console.log('Type of yearGan:', typeof yearGan);
console.log('Value of yearGan:', yearGan);

// If it's an object, print prototype
if (typeof yearGan === 'object') {
    console.log('Prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(yearGan)));
    try {
        console.log('WuXing:', yearGan.getWuXing());
    } catch (e) {
        console.log('Error getting WuXing:', e.message);
    }
}

const yearZhi = eightChar.getYearZhi();
console.log('Type of yearZhi:', typeof yearZhi);
console.log('Value of yearZhi:', yearZhi);

if (typeof yearZhi === 'object') {
    console.log('Prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(yearZhi)));
}
