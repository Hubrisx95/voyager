// modules/crisisMode.js

let isActiveCrisis = false;
let missionState = {
    fuel: 100,
    health: 100,
    speed: 17.0
};

const events = [
    {
        title: "Güneş Patlaması (Solar Flare)",
        description: "Yüksek enerjili radyasyon dalgası yaklaşıyor. Elektronik sistemler tehlikede.",
        choices: [
            { text: "Kalkanları Güçlendir (15% Yakıt Harcar)", result: "Sistemler korundu.", cost: { fuel: -15, health: 0, speed: 0 } },
            { text: "Tüm Gücü Kapatarak Bekle (Yakıt Tasarrufu)", result: "Biraz radyasyon sızıntısı oldu.", cost: { fuel: 0, health: -10, speed: 0 } }
        ]
    },
    {
        title: "Mikrometeorit Çarpması",
        description: "Gövdede küçük delinmeler tespit edildi. Veri kaybı riski yüksek.",
        choices: [
            { text: "Otomatik Onarım Başlat (20% Yakıt)", result: "Delikler başarıyla kapatıldı.", cost: { fuel: -20, health: 0, speed: 0 } },
            { text: "Görmezden Gel ve Hızlan", result: "Hız arttı ama gövde hasar aldı.", cost: { fuel: -5, health: -25, speed: 1.5 } }
        ]
    },
    {
        title: "Kritik Manevra İhtiyacı",
        description: "Bilinmeyen bir çekim anomalisi rotadan saptırıyor.",
        choices: [
            { text: "Ana İticileri Ateşle (30% Yakıt, Hız Artışı)", result: "Tehlike atlatıldı ve ivme kazanıldı.", cost: { fuel: -30, health: 0, speed: 2.0 } },
            { text: "RCS İticileri İle Minimal Düzeltme", result: "Rotaya dönüldü ancak zaman kaybedildi.", cost: { fuel: -10, health: 0, speed: -1.5 } }
        ]
    }
];

window.CrisisMode = {
    onModeChange: (mode) => {
        if (mode !== 'CRISIS') {
            isActiveCrisis = false;
            document.getElementById('crisis-status').style.display = 'none';
            document.getElementById('crisis-start-btn').style.display = 'block';
        }
    },
    
    start: () => {
        if(!window.SimAPI) return;
        isActiveCrisis = true;
        
        // Reset state
        missionState = { fuel: 100, health: 100, speed: 17.0 };
        document.getElementById('crisis-start-btn').style.display = 'none';
        document.getElementById('crisis-status').style.display = 'block';
        
        window.CrisisMode.triggerEvent();
    },
    
    updateUI: () => {
        document.getElementById('crisis-fuel').textContent = missionState.fuel;
        document.getElementById('crisis-health').textContent = missionState.health;
        document.getElementById('crisis-speed').textContent = missionState.speed.toFixed(1);
    },
    
    triggerEvent: () => {
        window.CrisisMode.updateUI();
        
        if (missionState.fuel <= 0 || missionState.health <= 0) {
            document.getElementById('crisis-event').innerHTML = "<span style='color:red;'>GÖREV SONLANDI.</span> Üstesinden gelinemeyen hasar veya yakıt tüketimi.";
            document.getElementById('crisis-choices').innerHTML = "";
            return;
        }

        const ev = events[Math.floor(Math.random() * events.length)];
        document.getElementById('crisis-event').innerHTML = `<strong>${ev.title}</strong><br/>${ev.description}`;
        
        const choicesDiv = document.getElementById('crisis-choices');
        choicesDiv.innerHTML = "";
        
        ev.choices.forEach(c => {
            const btn = document.createElement('button');
            btn.className = "nav-btn";
            btn.style.textAlign = 'left';
            btn.textContent = c.text;
            btn.onclick = () => window.CrisisMode.handleChoice(c);
            choicesDiv.appendChild(btn);
        });
    },
    
    handleChoice: (choice) => {
        missionState.fuel += choice.cost.fuel;
        missionState.health += choice.cost.health;
        missionState.speed += choice.cost.speed;
        
        document.getElementById('crisis-event').innerHTML = `<span style="color:var(--secondary)">Karar Uygulandı.</span> ${choice.result}`;
        document.getElementById('crisis-choices').innerHTML = "";
        
        window.CrisisMode.updateUI();
        
        // Wait a bit, then trigger next or end
        setTimeout(() => {
            if (Math.random() > 0.4) {
                window.CrisisMode.triggerEvent();
            } else {
                document.getElementById('crisis-event').innerHTML = "Bölge güvenli, sistemler normale döndü.";
            }
        }, 3000);
    },
    
    tick: (dt) => {
        if (!isActiveCrisis) return;
        
        // Render a dramatic closeup view of Voyager
        window.SimAPI.voyager.rotation.y += 0.01;
        window.SimAPI.voyager.rotation.z = Math.sin(Date.now() * 0.001) * 0.1; // slight wobble
        
        const vPos = window.SimAPI.voyager.position;
        const camTarget = new THREE.Vector3(vPos.x - 10, vPos.y + 5, vPos.z + 15);
        window.SimAPI.camera.position.lerp(camTarget, 0.05);
        window.SimAPI.camera.lookAt(vPos);
    }
};
