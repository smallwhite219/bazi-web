import BaziChart from './bazi/components/BaziChart';
import { ScrollText } from 'lucide-react';

function App() {
    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-16">
                <div className="inline-block p-3 rounded-2xl bg-white/5 mb-6 border border-white/10">
                    <ScrollText className="text-amber-400 w-8 h-8" />
                </div>
                <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tight">
                    <span className="text-gradient">八字</span> 命盤
                </h1>
                <p className="text-gray-400 text-xl max-w-2xl mx-auto font-medium">
                    探索天干地支的奧秘，解讀命中註定的格局
                </p>
            </header>

            <main>
                <BaziChart />
            </main>

            <footer className="mt-20 text-center text-gray-500 text-sm tracking-widest uppercase pb-12">
                Destiny Oracle • Powered by Lunar-Javascript
            </footer>
        </div>
    );
}

export default App;
