# Deploy MoneyTomtam

แนะนำ deploy ด้วย Vercel เพราะรองรับ Next.js App Router, API routes และ middleware ได้ทันที

## 1. เตรียม Environment Variables

เพิ่มค่าพวกนี้ใน Vercel Project Settings > Environment Variables

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
GOLD_PRICE_API_URL=https://api.chnwt.dev/thai-gold-api/latest
APP_SESSION_SECRET=ใส่รหัสสุ่มยาวๆ-ห้ามใช้ค่าตัวอย่าง
```

`APP_SESSION_SECRET` ใช้สำหรับ session cookie เท่านั้น ส่วน user เริ่มต้นจะถูกสร้างใน Firestore อัตโนมัติ:

```text
username: tomtam
password: TomTam22
```

## 2. Deploy ผ่าน Vercel Dashboard

1. Push โปรเจกต์ขึ้น GitHub
2. เข้า Vercel แล้วกด Add New Project
3. เลือก repository นี้
4. Framework ควร detect เป็น Next.js อัตโนมัติ
5. Build Command: `pnpm build`
6. Install Command: `pnpm install`
7. เพิ่ม Environment Variables ตามข้อ 1
8. กด Deploy

## 3. Firestore Rules

แอพนี้ใช้ API routes เป็นตัวคุยกับ Firestore แต่ Firebase Web SDK ยังใช้ config ฝั่ง client/server runtime ดังนั้น Firestore rules ต้องอนุญาตการอ่าน/เขียนตามที่คุณตั้งไว้

สำหรับใช้งานส่วนตัวแบบเร็ว สามารถเปิด read/write ชั่วคราวได้ แต่ก่อนเผยแพร่จริงควรปรับ rules ให้ปลอดภัย

## 4. หลัง Deploy

เปิด URL จาก Vercel แล้ว login ด้วย user เริ่มต้น จากนั้นเข้า Firebase Console > Firestore จะเห็น collection `users` ถูกสร้างเมื่อ login ครั้งแรก

