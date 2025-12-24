// ⚙️ ตั้งค่า URL ของ Google Apps Script Web App
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_ZHJuFrHD3PQ-X9R4DwCScH5LPkV0rpH4D84k1vg2d4f9gyKNGCjRsVxTcXigI96o/exec';

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
    
    // แสดง Loading
    showLoading();
    
    try {
        // เรียก API เพื่อสุ่มของรางวัล
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // สำคัญสำหรับ Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'randomPrize',
                name: name
            })
        });
        
        // เนื่องจากใช้ no-cors จึงต้องใช้วิธีอื่นในการรับข้อมูล
        // สำหรับ Google Apps Script แนะนำให้ใช้ JSONP หรือ fetch แบบ GET
        
        // วิธีทางเลือก: ใช้ GET request
        const result = await fetch(
            `${SCRIPT_URL}?action=randomPrize&name=${encodeURIComponent(name)}`,
            { method: 'GET' }
        ).then(res => res.json());
        
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
        console.error('Error:', error);
        alert('❌ เกิดข้อผิดพลาดในการสุ่ม กรุณาลองใหม่อีกครั้ง');
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