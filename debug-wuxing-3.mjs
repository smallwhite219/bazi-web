import { Gan, Zhi } from 'lunar-javascript';

try {
    const gan = Gan.fromName('甲');
    console.log('Gan created:', gan.getName());
    console.log('Gan WuXing:', gan.getWuXing().getName());

    // Check prototype for interaction methods
    const ganProto = Object.getPrototypeOf(gan);
    console.log('Gan Prototype Methods:', Object.getOwnPropertyNames(ganProto));

    const zhi = Zhi.fromName('子');
    console.log('Zhi created:', zhi.getName());
    console.log('Zhi WuXing:', zhi.getWuXing().getName());

    const zhiProto = Object.getPrototypeOf(zhi);
    console.log('Zhi Prototype Methods:', Object.getOwnPropertyNames(zhiProto));

} catch (e) {
    console.log('Error:', e.message);
}
