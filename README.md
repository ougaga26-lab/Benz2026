# Benz2026 · Mercedes-Benz 華山探索體驗

手機活動網站：品牌開場 → 活動介紹 → 六關集章 → QR 核實 → 三章兌禮。

## 開發

Node.js 22.13+。`npm ci` 安裝，複製 `.env.example` 為 `.env` 並設定兩個隨機秘密。`npm run build` 後，以 `node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_steady_bedlam.sql` 建立本機資料表，再 `npm run dev`。

## QR 實測

1. 民眾手機開首頁，選擇前三個已公布關卡之一，點「出示通關驗證碼」。
2. 工作人員手機開同一網站 `/staff`，用私下提供的 STAFF_PASSWORD 登入。
3. 點「開啟相機掃描」並允許相機，掃描民眾手機。也可使用手機內建相機，開啟辨識出的連結。
4. 核對關卡與參加者，勾選已完成體驗，按「確認通關並蓋章」。
5. 民眾畫面約兩秒內更新。重複以上步驟集滿三章，禮遇頁產生兌換 QR。
6. 工作人員掃碼確認發放，一份禮物只能核銷一次。

手機相機需要 HTTPS；手機上的 localhost 不是開發電腦。請使用已部署的 HTTPS 網址。私有 Sites 預覽需兩支手機均由網站擁有者登入平台；這不是正式民眾公開入口。不要把工作人員密碼寫进前端或 Git。

## 安全與範圍

- 後端 HMAC 簽署 QR，綁定參加者、關卡、30 秒有效期；token 放在 URL fragment，避免送入網頁存取記錄。
- 每次核實重新驗證簽章與效期；過期請重新掃描。掃描本身不寫入印章。
- 工作人員以 HttpOnly cookie 登入；民眾端無直接蓋章 API，舊六碼方式已停用。
- D1 唯一鍵防止重複蓋章；單一條件式 SQL 防止同時重複兌獎。
- 目前用隨機瀏覽器身分作實測，尚未接外部報到平台，不能阻止清除 cookie／換手機重新參加。
- 工作人員目前共用一個活動密碼；正式活動若需逐站權限與個別操作稽核，需要接入個人工作人員帳號。
- 第 4–6 關待公布；車款與禮物照片為 AI 概念示意，實際品牌素材與內容待客戶核定。
- `.env`、本機資料庫、依賴與編譯輸出不會提交。

## 架構與主機

React + Vinext，Cloudflare Workers API，D1 SQLite，qrcode 產生 QR，ZXing Browser 掃描。GitHub 放原始碼，GitHub Pages 無法單獨執行本專案後端。目前由 Sites 管理 Cloudflare 相容部署與資料庫；若要改為自己的 Cloudflare 帳號，需配置 Worker、D1、兩個 secrets 與 HTTPS 網址。

## 驗證

`node node_modules/typescript/bin/tsc --noEmit`、`npm run build`、啟動本機後 `node scripts/test-event.mjs`。整合測試使用獨立測試訪客，驗證簽章竄改、過期、權限、重複核實、三章資格與併發兌獎。
