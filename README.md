# MoneyTomTam

เว็บแอพบันทึกการเงินส่วนตัว สร้างด้วย Next.js App Router, TypeScript, Tailwind CSS, shadcn-style UI, Recharts และใช้ Firebase Firestore เป็นฐานข้อมูลหลัก

## ตั้งค่า Firebase

1. เปิดหรือสร้าง Firebase project ของคุณ
2. เปิดใช้งาน Firestore Database
3. คัดลอก `.env.example` เป็น `.env.local`
4. ใส่ค่า Firebase web app config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
GOLD_PRICE_API_URL=https://api.chnwt.dev/thai-gold-api/latest # ไม่บังคับ ใช้เมื่ออยากกำหนด provider เอง
```

แอพจะเก็บข้อมูลใน Firestore collections เหล่านี้: `transactions`, `wallets`, `categories`, `assets`, `debts`, และ `goals`

สำหรับการพัฒนาในเครื่อง หากยังไม่มีระบบล็อกอิน ต้องตั้งค่า Firestore Rules ให้อ่าน/เขียนได้ก่อนใช้งานจริง และควรปรับ rules ให้ปลอดภัยก่อนเผยแพร่

## ราคาทอง

ปุ่ม `อัปเดตราคาทอง` ในหน้า `ทรัพย์สิน` ใช้ API ราคาทองไทยผ่าน server route `/api/prices/gold`

1. เพิ่มทรัพย์สินประเภท `ทอง`
2. ตั้ง `แหล่งราคา` เป็น `ราคาทองไทย`
3. กด `อัปเดตราคาทอง`

ราคาที่ดึงคือราคาขายทองคำแท่ง โดยนับเป็นราคาต่อ 1 บาททองคำ แอพจะลอง API ราคาทองไทยก่อน แล้ว fallback ไป API ของสมาคมค้าทองคำถ้า provider หลักใช้ไม่ได้ หากต้องการใช้ endpoint เฉพาะให้ตั้ง `GOLD_PRICE_API_URL` ใน `.env.local`

## รันแอพ

```bash
corepack pnpm install
./node_modules/.bin/next dev
```

เปิด `http://localhost:3000`
