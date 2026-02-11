import { Solar } from 'lunar-javascript';

const date = new Date(1986, 5, 5);
const solar = Solar.fromYmdHms(date.getFullYear(), date.getMonth() + 1, date.getDate(), 2, 0, 0);
const lunar = solar.getLunar();
const eightChar = lunar.getEightChar();
eightChar.setSect(2);
const yun = eightChar.getYun(1);

console.log('Yun keys:', Object.keys(yun));
console.log('Yun prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(yun)));

try {
    const daYunArr = yun.getDaYun();
    console.log('daYunArr length:', daYunArr.length);
    if (daYunArr.length > 0) {
        console.log('First DaYun keys:', Object.keys(daYunArr[0]));
        console.log('First DaYun prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(daYunArr[0])));
        console.log('First DaYun start age:', daYunArr[0].getStartAge());
    }
} catch (e) {
    console.log('Error getting DaYun:', e.message);
}
