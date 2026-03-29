// modules/gravityAssistLab.js

let isActiveGrav = false;
let gravProbe = null;
let gravVel = null;
let jupBody = null;
let vectors = [];

window.GravityLab = {
    onModeChange: (mode) => {
        if (mode !== 'GRAVITY') {
            isActiveGrav = false;
            vectors.forEach(v => window.SimAPI.scene.remove(v));
            vectors = [];
            if (window.SimAPI) window.SimAPI.voyager.visible = true;
        }
    },
    
    start: () => {
        if(!window.SimAPI) return;
        isActiveGrav = true;
        window.SimAPI.voyager.visible = true;
        
        // Clear old vectors
        vectors.forEach(v => window.SimAPI.scene.remove(v));
        vectors = [];
        
        const angleDeg = parseFloat(document.getElementById('grav-angle').value);
        const distOffset = parseFloat(document.getElementById('grav-dist').value);
        
        // Jupiter position is X:1500, Z:-250
        jupBody = { pos: new THREE.Vector3(1500, 0, -250), mass: 120000000, radius: 60 };
        
        // Setup probe starting point approach from behind
        gravProbe = new THREE.Vector3(1200, 0, -250 + distOffset);
        
        // Initial velocity (coming in mostly along X, but influenced by angle)
        const angleRad = angleDeg * (Math.PI / 180);
        const initialSpeed = 150; 
        gravVel = new THREE.Vector3(Math.cos(angleRad) * initialSpeed, 0, Math.sin(angleRad) * initialSpeed);
        
        // Visualize the incoming vector BEFORE simulation
        const dirStart = gravVel.clone().normalize();
        const arrowStart = new THREE.ArrowHelper(dirStart, gravProbe, gravVel.length(), 0x00ff88);
        window.SimAPI.scene.add(arrowStart);
        vectors.push(arrowStart);
        
        document.getElementById('grav-speed-before').textContent = (gravVel.length() / 10).toFixed(1) + " km/s";
        document.getElementById('grav-speed-after').textContent = "Hesaplanıyor...";
        
        window.GravityLab.simulateFastForward();
    },
    
    simulateFastForward: () => {
        // Fast forward the physics to find the exit velocity
        const testPos = gravProbe.clone();
        const testVel = gravVel.clone();
        
        for(let i=0; i<800; i++) {
            window.Physics.step(testPos, testVel, [jupBody], 0.016);
            if(testPos.x > 1800) break; // Probe has safely passed Jupiter
            if(testPos.distanceTo(jupBody.pos) < jupBody.radius) {
                document.getElementById('grav-speed-after').textContent = "ÇARPTI!";
                document.getElementById('grav-speed-after').style.color = "var(--danger)";
                return;
            }
        }
        
        // Draw exit vector
        const dirEnd = testVel.clone().normalize();
        const arrowEnd = new THREE.ArrowHelper(dirEnd, testPos, testVel.length(), 0x44aaff);
        window.SimAPI.scene.add(arrowEnd);
        vectors.push(arrowEnd);
        
        const spdGain = testVel.length() / 10;
        document.getElementById('grav-speed-after').textContent = spdGain.toFixed(1) + " km/s";
        document.getElementById('grav-speed-after').style.color = (spdGain > 15.0) ? "var(--primary)" : "white";
    },
    
    tick: (dt) => {
        if (!isActiveGrav) return;
        if (!window.SimAPI.voyager.visible) return; // already exploded
        
        // Slowly animate the probe in real time for visuals
        window.Physics.step(gravProbe, gravVel, [jupBody], dt * 40);
        
        if (gravProbe.distanceTo(jupBody.pos) < jupBody.radius) {
            window.SimAPI.voyager.visible = false;
            window.SimAPI.createExplosion(gravProbe);
            return;
        }
        
        window.SimAPI.voyager.position.copy(gravProbe);
        window.SimAPI.voyager.rotation.y += 0.08;
        
        // Camera focuses closely on Jupiter
        const camTarget = new THREE.Vector3(1500 - 50, 100, -100);
        window.SimAPI.camera.position.lerp(camTarget, 0.05);
        window.SimAPI.camera.lookAt(jupBody.pos);
    }
};
