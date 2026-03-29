// modules/trajectorySim.js

let trajLine = null;
let simPos = null;
let simVel = null;
let isActiveTraj = false;
let bodies = [];

window.TrajectorySim = {
    onModeChange: (mode) => {
        if (mode !== 'TRAJECTORY') {
            isActiveTraj = false;
            if (trajLine && window.SimAPI) window.SimAPI.scene.remove(trajLine);
            const res = document.getElementById('traj-result');
            if (res) res.style.display = 'none';
            if (window.SimAPI) window.SimAPI.voyager.visible = true;
        }
    },
    
    start: () => {
        if(!window.SimAPI) return;
        isActiveTraj = true;
        window.SimAPI.voyager.visible = true;
        
        // Retrieve UI settings
        const angleDeg = parseFloat(document.getElementById('traj-angle').value);
        const speed = parseFloat(document.getElementById('traj-speed').value);
        const angleRad = angleDeg * (Math.PI / 180);
        
        // Starting coordinates (Earth roughly)
        simPos = new THREE.Vector3(25, 0, -250);
        
        // Velocity vector mapping. Base speed mapped to Sim coordinates
        // Angle 0 = straight to Jupiter (+X).
        // Angle > 0 curves it away towards +Z.
        const speedScale = speed * 12; 
        simVel = new THREE.Vector3(Math.cos(angleRad) * speedScale, 0, Math.sin(angleRad) * speedScale);
        
        // Setup Planet Masses for this specific simulation
        bodies = [
            { pos: new THREE.Vector3(1500, 0, -250), mass: 65000000, radius: 60 }, // Jupiter
            { pos: new THREE.Vector3(3000, 0, -250), mass: 35000000, radius: 50 }  // Saturn
        ];
        
        window.TrajectorySim.calculatePath();
        
        document.getElementById('traj-result').style.display = 'block';
        document.getElementById('traj-result').innerHTML = "Yörünge hesaplandı!";
    },
    
    calculatePath: () => {
        if (trajLine) window.SimAPI.scene.remove(trajLine);
        
        const points = [];
        const testPos = simPos.clone();
        const testVel = simVel.clone();
        
        let minJupDist = Infinity;
        let crashed = false;
        
        for(let i=0; i<4000; i++) {
            points.push(testPos.clone());
            window.Physics.step(testPos, testVel, bodies, 0.016);
            
            let distToJup = testPos.distanceTo(bodies[0].pos);
            if(distToJup < minJupDist) minJupDist = distToJup;
            
            // Crash detection
            if(distToJup < bodies[0].radius) { crashed = true; break; }
            if(testPos.x > 3500) break; // Reached outer system
            if(testPos.x < 0 || Math.abs(testPos.z) > 4000) break; // Lost in space
        }
        
        const lineMat = new THREE.LineBasicMaterial({ color: 0xffd700, linewidth: 2 });
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        trajLine = new THREE.Line(lineGeo, lineMat);
        window.SimAPI.scene.add(trajLine);
        
        // Analyze outcome
        let resultMsg = "";
        if (crashed) {
            resultMsg = "<span style='color: var(--danger)'>GÖREV BAŞARISIZ. Jüpiter'e çakıldınız.</span>";
        } else if (minJupDist < 200) {
            resultMsg = "<span style='color: var(--secondary)'>KUSURSUZ SAPAN MANEVRASI!</span> Hız inanılmaz ölçüde arttı.";
        } else if (minJupDist < 600) {
            resultMsg = "<span style='color: var(--primary)'>KISMİ BAŞARI.</span> Jüpiter'in uzağından geçildi, hız artışı kısıtlı.";
        } else {
            resultMsg = "<span style='color: gray'>GÖREV BAŞARISIZ.</span> Yörünge gezegenleri ıskaladı, boşluğa doğru sürükleniyor.";
        }
        
        document.getElementById('traj-result').innerHTML = `<strong>Görev Analizi:</strong><br/>${resultMsg}`;
    },
    
    tick: (dt) => {
        if (!isActiveTraj) return;
        if (!window.SimAPI.voyager.visible) return; // already exploded
        
        // Update animated probe
        window.Physics.step(simPos, simVel, bodies, dt * 80);
        
        // Crash detection during live animation
        if (simPos.distanceTo(bodies[0].pos) < bodies[0].radius) {
            window.SimAPI.voyager.visible = false;
            window.SimAPI.createExplosion(simPos);
            const resElem = document.getElementById('traj-result');
            resElem.innerHTML += "<br/><span style='color:red; font-size:1.1rem; font-weight:bold;'>💥 BUM! PARÇALANDI!</span>";
            return;
        }
        
        window.SimAPI.voyager.position.copy(simPos);
        window.SimAPI.voyager.rotation.y += 0.03;
        
        // Camera floats above the solar system looking down
        const camTarget = new THREE.Vector3(1500, 2000, 500);
        window.SimAPI.camera.position.lerp(camTarget, 0.03);
        window.SimAPI.camera.lookAt(1500, 0, -250);
    }
};
