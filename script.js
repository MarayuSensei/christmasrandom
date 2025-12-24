// ⚙️ ตั้งค่า URL ของ Google Apps Script Web App
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_bW7A1yOZjeCVGATNq_g9g_eXwbilk7m6kcexQ3xDGzKK7hBznF9W_V7jt9tYqGg0/exec';

// Elements
const nameInput = document.getElementById('nameInput');
const randomBtn = document.getElementById('randomBtn');
const popup = document.getElementById('popup');
const popupName = document.getElementById('popupName');
const popupPrize = document.getElementById('popupPrize');
const closeBtn = document.getElementById('closeBtn');
const loading = document.getElementById('loading');

// Event Listeners
randomBtn.addEventListener('click', handleRandom);
closeBtn.addEventListener('click', closePopup);

// กด Enter เพื่อสุ่ม
nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleRandom();
    }
});

// ฟังก์ชันสุ่มของรางวัล
async function handleRandom() {
    const name = nameInput.value.trim();
    
    // ตรวจสอบว่ากรอกชื่อหรือยัง
    if (!name) {
        alert('⚠️ กรุณากรอกชื่อก่อนสุ่ม');
        nameInput.focus();
        return;
    }
    
    // ตรวจสอบว่าตั้งค่า SCRIPT_URL หรือยัง
    if (!SCRIPT_URL || SCRIPT_URL === 'ใส่ URL ของ Web App ที่ได้จาก Google Apps Script ที่นี่') {
        alert('❌ กรุณาตั้งค่า SCRIPT_URL ในไฟล์ script.js ก่อน');
        return;
    }
    
    // แสดง Loading
    showLoading();
    
    try {
        // ใช้ GET request เพราะทำงานได้ดีกับ Google Apps Script
        const url = `${SCRIPT_URL}?action=randomPrize&name=${encodeURIComponent(name)}`;
        
        console.log('กำลังส่งคำขอไปที่:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow'
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('ผลลัพธ์:', result);
        
        hideLoading();
        
        if (result.success) {
            // แสดงป๊อปอัพผลการสุ่ม
            showPopup(result.userName, result.prize);
            // ล้างข้อมูลในช่องกรอกชื่อ
            nameInput.value = '';
        } else {
            alert('❌ ' + (result.error || 'เกิดข้อผิดพลาด'));
        }
        
    } catch (error) {
        hideLoading();
        console.error('Error details:', error);
        alert('❌ เกิดข้อผิดพลาดในการสุ่ม\n\nกรุณาตรวจสอบ:\n1. SCRIPT_URL ถูกต้องหรือไม่\n2. Deploy Web App แล้วหรือยัง\n3. ตั้งค่า "Who has access" เป็น "Anyone"\n\nดูรายละเอียดใน Console (F12)');
    }
}

// แสดงป๊อปอัพ
function showPopup(name, prize) {
    popupName.textContent = name;
    popupPrize.textContent = prize;
    popup.classList.add('show');
    
    // เล่นเสียง (ถ้ามี)
    playSound();
    
    // เอฟเฟกต์ Confetti เพิ่มเติม
    createConfetti();
}

// ปิดป๊อปอัพ
function closePopup() {
    popup.classList.remove('show');
}

// แสดง Loading
function showLoading() {
    loading.classList.add('show');
}

// ซ่อน Loading
function hideLoading() {
    loading.classList.remove('show');
}

// สร้าง Confetti Effect
function createConfetti() {
    const confettiCount = 50;
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa07a', '#98d8c8'];
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            confetti.style.transition = 'all 3s ease-out';
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.style.top = window.innerHeight + 'px';
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                confetti.style.opacity = '0';
            }, 10);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 30);
    }
}

// เล่นเสียง (ถ้าต้องการ)
function playSound() {
    // สามารถเพิ่มไฟล์เสียงได้
    // const audio = new Audio('sounds/success.mp3');
    // audio.play();
}

// ตรวจสอบการเชื่อมต่อกับ Google Sheets (เมื่อโหลดหน้าเว็บ)
window.addEventListener('load', async () => {
    try {
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();
        
        if (data.success && data.inventory) {
            console.log('✅ เชื่อมต่อกับ Google Sheets สำเร็จ');
            console.log('สินค้าที่มีอยู่:', data.inventory);
        }
    } catch (error) {
        console.warn('⚠️ ไม่สามารถตรวจสอบการเชื่อมต่อได้ อาจยังไม่ได้ตั้งค่า SCRIPT_URL');
    }
});