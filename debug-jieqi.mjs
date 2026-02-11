import { Solar } from 'lunar-javascript';

const date = new Date();
const solar = Solar.fromYmdHms(date.getFullYear(), date.getMonth() + 1, date.getDate(), 12, 0, 0);
const lunar = solar.getLunar();

console.log('Lunar keys:', Object.keys(lunar));
console.log('Lunar prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(lunar)));

try {
    const prev = lunar.getPrevJieQi();
    console.log('Prev JieQi:', prev.getName(), prev.getSolar().toYmdHms());
} catch (e) {
    console.log('Error getting Prev JieQi:', e.message);
}

try {
    const next = lunar.getNextJieQi();
    console.log('Next JieQi:', next.getName(), next.getSolar().toYmdHms());
} catch (e) {
    console.log('Error getting Next JieQi:', e.message);
}

// Check if retrieval by boolean (whole day or strictly by time) is needed?
// Usually getPrevJieQi(boolean) -> true = include today?
