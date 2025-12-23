async function randomGift() {
  const name = document.getElementById("username").value;
  if (!name) return alert("กรุณากรอกชื่อ");

  const res = await fetch("gifts.json");
  const data = await res.json();

  let pool = [];
  data.gifts.forEach(g => {
    for (let i = 0; i < g.quantity; i++) {
      pool.push(g.name);
    }
  });

  if (pool.length === 0) {
    alert("ของหมดแล้ว");
    return;
  }

  const gift = pool[Math.floor(Math.random() * pool.length)];
  document.getElementById("result").innerText =
    `🎉 ${name} ได้รับ ${gift}`;
  
  document.getElementById("popup").classList.remove("hidden");

  // 🔽 ส่งข้อมูลไป Google Sheets
  fetch("https://docs.google.com/spreadsheets/d/1FHapph922XEzg3e5a0hUBAk2cgQAiGQTIyQW-swFJ2Y/edit?usp=sharing", {
    method: "POST",
    body: JSON.stringify({ name, gift })
  });
}

function closePopup() {
  document.getElementById("popup").classList.add("hidden");
}
