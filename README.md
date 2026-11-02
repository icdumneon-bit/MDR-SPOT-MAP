# MDR Spot Map Surveillance (ระบบเฝ้าระวังเชื้อดื้อยาในโรงพยาบาล)

ระบบตาราง Spot Map เฝ้าระวังเชื้อดื้อยาแบบเรียลไทม์ (ปีงบประมาณ 2569: ตุลาคม 2568 - กันยายน 2569)  
รองรับการดูภาพรวมทุกตึกผู้ป่วย (22 หน่วยงาน), แยกดูเฉพาะหน่วยงาน, เพิ่ม/แก้ไขเคส, แยกกล่องชื่อเชื้อและสิ่งส่งตรวจ, คัดลอกและวางเชื้อข้ามวัน และมีระบบบันทึกข้อมูลร่วมกัน (Real-time Collaborative Database)

---

## 🚀 ขั้นตอนการนำโปรเจกต์ขึ้น GitHub (Step-by-Step)

### 1. ติดตั้ง Git และเตรียม Repository บน GitHub
1. เข้าไปที่ [GitHub.com](https://github.com) แล้วสร้าง Repository ใหม่ (New Repository) ตั้งชื่อ เช่น `mdr-spot-map` (เลือกเป็น Public หรือ Private ตามต้องการ)
2. อย่าเพิ่งติ๊ก Add README หรือ .gitignore (เพราะเรามีไฟล์ในเครื่องแล้ว)
3. คัดลอก URL ของ Repository เช่น `https://github.com/<your-username>/mdr-spot-map.git`

### 2. อัปโหลดโค้ดจากเครื่องขึ้น GitHub
เปิด Terminal / Command Prompt ในโฟลเดอร์โปรเจกต์นี้ แล้วรันคำสั่ง:

```bash
# 1. กำหนดชื่อและอีเมลผู้ commit (หากยังไม่เคยตั้งค่า)
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# 2. เริ่มต้น git และบันทึกไฟล์ทั้งหมด
git init
git add .
git commit -m "feat: initial commit MDR Spot Map system"

# 3. ตั้ง branch หลักเป็น main
git branch -M main

# 4. เชื่อมต่อกับ GitHub repository ของคุณ (แทนที่ URL ด้วยของคุณ)
git remote add origin https://github.com/<your-username>/mdr-spot-map.git

# 5. Push ขึ้น GitHub
git push -u origin main
```

---

## 💻 3 วิธีนำไปรันใช้งานจริงหลังขึ้น GitHub

### 🌟 วิธีที่ 1: รันบนคอมพิวเตอร์ / เซิร์ฟเวอร์ในเครือข่ายโรงพยาบาล (Intranet / Local Server)
> **เหมาะที่สุดสำหรับ:** งานเฝ้าระวังเชื้อในโรงพยาบาล ใช้งานในวงแลน (LAN/Wi-Fi) รวดเร็ว ปลอดภัย ข้อมูลไม่หลุดออกนอก รพ.

1. ไปที่เครื่องคอมพิวเตอร์ที่ต้องการรัน (เครื่องไอที, เครื่องประจำห้อง ICN หรือเครื่องส่วนตัว)
2. Clone โค้ดจาก GitHub:
   ```bash
   git clone https://github.com/<your-username>/mdr-spot-map.git
   cd mdr-spot-map
   ```
3. ติดตั้ง Dependencies (ต้องการ Node.js เวอร์ชั่น 20 ขึ้นไป):
   ```bash
   npm install
   ```
4. เริ่มรันโปรแกรม:
   ```bash
   # สำหรับโหมดพัฒนา
   npm run dev

   # หรือสำหรับโหมดใช้งานจริง (Production)
   npm run build
   npm start
   ```
5. **การเปิดใช้งาน:**
   - ใช้งานบนเครื่องตัวเอง: เปิดเว็บเบราว์เซอร์ไปที่ `http://localhost:3000`
   - **เปิดให้ทุกคนในตึก/โรงพยาบาลเข้าใช้งานร่วมกัน:**  
     หา IP เครื่องที่รัน (เปิด CMD พิมพ์ `ipconfig` ดู IPv4 Address เช่น `192.168.1.120`)  
     เจ้าหน้าที่ท่านอื่นสามารถพิมพ์เข้าผ่าน Browser ได้ทันที: `http://192.168.1.120:3000`  
     *(ข้อมูลจะบันทึกลงในไฟล์ `data/spot_map_shared_db.json` บนเครื่องเซิร์ฟเวอร์โดยอัตโนมัติ ทุกคนเห็นข้อมูลตรงกันทันที)*

---

### 🌐 วิธีที่ 2: รันออนไลน์ฟรีผ่าน Cloud อัตโนมัติจาก GitHub (เช่น Render.com หรือ Railway.app)
> **เหมาะสำหรับ:** ต้องการลิงก์เว็บแบบ `https://...` ให้คุณหมอ พยาบาล หรือทีมงานเปิดจากมือถือ แท็บเล็ต หรือคอมพิวเตอร์ที่บ้านได้ตลอด 24 ชม. โดยไม่ต้องเปิดคอมพิวเตอร์ทิ้งไว้

#### ตัวอย่างการใช้งานบน Render.com (ฟรี):
1. สมัครสมาชิกที่ [Render.com](https://render.com) แล้วกด **New +** -> **Web Service**
2. เลือก **Build and deploy from a Git repository** แล้วกดเลือก Repository GitHub ที่เพิ่ง Push ขึ้นไป
3. ตั้งค่าระบบดังนี้:
   - **Name:** `mdr-spot-map` (หรือชื่อ รพ. ของคุณ)
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. กด **Deploy Web Service**
5. เมื่อ Build เสร็จ จะได้ URL เช่น `https://mdr-spot-map.onrender.com` สามารถแชร์ให้ทีมงานทุกคนเปิดแก้ไขข้อมูลร่วมกันได้ทันที

---

### 🐳 วิธีที่ 3: รันด้วย Docker / Docker Compose (สำหรับฝ่ายไอที)
ในโปรเจกต์มี `Dockerfile` และ `docker-compose.yml` เตรียมไว้ให้พร้อมแล้ว:

```bash
docker compose up -d
```
ระบบจะสร้าง Container และเปิดพอร์ต `3000` พร้อมผูก Volume โฟลเดอร์ `data/` เพื่อเก็บข้อมูลไม่ให้สูญหายเมื่อรีสตาร์ท

---

### ⚠️ วิธีแก้ปัญหา "จอขาว" เมื่อรันบน GitHub Pages (เกิดจากอะไร + วิธีแก้)

อาการ **จอขาว (Blank White Screen)** บน GitHub Pages มักเกิดจาก **2 สาเหตุหลัก** ดังนี้:

#### สาเหตุที่ 1: พาธของไฟล์ Assets ชี้ไปที่ Root (`/assets/...`) แทนที่จะเป็น Relative (`./assets/...`)
- บน GitHub Pages เว็บจะอยู่ใต้ URL ซับโฟลเดอร์ เช่น `https://<username>.github.io/<repo-name>/`
- หากไม่ได้ตั้งค่า Base Path บราวเซอร์จะวิ่งไปหาไฟล์ JS/CSS ที่ `https://<username>.github.io/assets/...` (ทำให้เกิด Error 404 หาไฟล์สคริปต์ไม่เจอ หน้าเว็บจึงแสดงจอขาว)
- **วิธีแก้:** เราได้ทำการเพิ่ม `base: './'` ลงใน `vite.config.ts` เรียบร้อยแล้ว ทำให้สามารถรันบน GitHub Pages ได้ทุกชื่อ Repo

#### สาเหตุที่ 2: ตั้งค่า GitHub Pages ให้เปิดจากโฟลเดอร์ต้นฉบับ (Root) แทนที่จะ Build ก่อน
- โปรเจกต์นี้เขียนด้วย **React + TypeScript** (`.tsx`) บราวเซอร์ทั่วไปไม่สามารถอ่านโค้ด TypeScript ตรงๆ ได้ ต้องผ่านขั้นตอน Build เป็น HTML/JS/CSS (`dist/`) เสียก่อน
- **วิธีแก้ที่ง่ายที่สุด (ผ่าน GitHub Actions อัตโนมัติ):**
  1. เราได้สร้างไฟล์ `.github/workflows/deploy.yml` ไว้ให้เรียบร้อยแล้ว
  2. ให้ Push โค้ดขึ้น GitHub ตามปกติ
  3. ไปที่ GitHub Repository ของคุณ -> เมนู **Settings** ด้านบน
  4. เมนูด้านซ้ายเลือก **Pages**
  5. ตรงหัวข้อ **Build and deployment** > **Source** ให้เปลี่ยนจาก "Deploy from a branch" เป็น **"GitHub Actions"**
  6. GitHub จะทำการ Build โค้ดและ Deploy ขึ้นเว็บให้อัตโนมัติใน 1-2 นาที จอขาวจะหายไปทันที!

---

## 📁 โครงสร้างโปรเจกต์
- `server.ts` : เซิร์ฟเวอร์ Node.js / Express สำหรับ Sync ข้อมูลร่วมกันแบบ Real-time
- `data/spot_map_shared_db.json` : ไฟล์ฐานข้อมูล JSON กลางที่เก็บข้อมูลเคสทั้งหมด (มีระบบสำรองอัตโนมัติ)
- `src/` : หน้าตาโปรแกรม React + Tailwind CSS
  - `components/WardSpotMapTable.tsx` : ตาราง Spot Map แยกรายหน่วยงาน
  - `components/FullSpotMapTable.tsx` : ตารางรวม 22 หน่วยงาน
  - `components/ShareModal.tsx` : หน้าต่างแชร์ลิงก์และ QR Code
  - `components/CaseModal.tsx` : หน้าต่างเพิ่ม/แก้ไขเคส (แยกชื่อเชื้อและสิ่งส่งตรวจ)
- `Dockerfile` & `docker-compose.yml` : ไฟล์สำหรับรันด้วย Docker
