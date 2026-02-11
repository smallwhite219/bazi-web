# Bazi Web (八字排盤系統)

一個基於 React + TypeScript + `lunar-javascript` 開發的高級八字排盤系統。

## 功能特點

- **精密排盤**：精確計算年月日時四柱，支援分鐘級別輸入。
- **五行分析**：自動計算干支五行，並以顏色標註。
- **刑沖合害**：自動檢測地支沖合、天干合沖等關係。
- **身強弱分析**：根據月令及全局五行比例，判定日主強弱及喜用神。
- **節氣提示**：顯示當月前後節氣的精確交接時間。
- **偏財及喜神日**：
  - 自動篩選「偏財日」。
  - 根據身強弱判定偏財為「吉」或「凶」。
  - 額外提供「喜神吉日」（印星、比劫日）建議。

## 技術棧

- Vite
- React
- TypeScript
- Tailwind CSS
- Framer Motion (動畫)
- Lucide React (圖標)
- lunar-javascript (曆法核心)

## 運行與開發

1. 安裝依賴：`npm install`
2. 啟動開發服務：`npm run dev`
3. 構建項目：`npm run build`
