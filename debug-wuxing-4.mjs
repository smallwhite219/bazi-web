import { Solar, Lunar, LunarUtil } from 'lunar-javascript';

console.log('LunarUtil:', LunarUtil);
if (LunarUtil) {
    console.log('LunarUtil keys:', Object.keys(LunarUtil));
}

console.log('Solar keys:', Object.keys(Solar));
console.log('Lunar keys:', Object.keys(Lunar));

// Check if we can get WuXing from LunarUtil?
// e.g. LunarUtil.WU_XING_GAN
