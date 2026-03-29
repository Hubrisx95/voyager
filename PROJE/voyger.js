window.onload = () => {
    // --- UI ELEMENTS ---
    const container = document.getElementById('canvas-container');
    const loadingText = document.getElementById('loading');
    const dateInput = document.getElementById('date-input');
    const distEarthElem = document.getElementById('dist-earth');
    const instrumentListElem = document.getElementById('instrument-list');
    const modeBadge = document.getElementById('mode-badge');
    const impactAnalysis = document.getElementById('impact-analysis');

    // --- DATE CONTROL & STATE ---
    let LAUNCH_DATE = new Date("1977-09-05T00:00:00Z").getTime();
    let simulatedCurrentDateMs = LAUNCH_DATE;
    const TIME_MULTIPLIER = 100 * 24 * 60 * 60 * 1000;

    let isSpeedUp = false;
    let speedKmS = 17.03;
    let keys = {};
    let currentMode = 'CINEMATIC';
    let whatIfGA = true;
    let whatIfSaturn = 'titan';

    let milestones = [
        { date: new Date("1977-09-05T00:00:00Z").getTime(), x: 25, name: "Dünya" },
        { date: new Date("1979-03-05T00:00:00Z").getTime(), x: 1500, name: "Jüpiter" },
        { date: new Date("1980-11-12T00:00:00Z").getTime(), x: 3000, name: "Satürn" }
    ];

    // --- MISSION PROFILES ---
    const missionProfiles = {
        voyager1: {
            name: "Voyager 1", speed: 17.03, launchSpeed: 15.0, launchDate: "1977-09-05T00:00:00Z", hasRecord: true,
            milestones: [
                { date: new Date("1977-09-05T00:00:00Z").getTime(), x: 25, name: "Kalk\u0131\u015f" },
                { date: new Date("1979-03-05T00:00:00Z").getTime(), x: 1500, name: "J\u00fcpiter" },
                { date: new Date("1980-11-12T00:00:00Z").getTime(), x: 3000, name: "Sat\u00fcrn" },
                { date: new Date("1990-02-14T00:00:00Z").getTime(), x: 6500, name: "Soluk Mavi Nokta" },
                { date: new Date("2012-08-25T00:00:00Z").getTime(), x: 9000, name: "S\u0131n\u0131r" }

            ]
        },
        voyager2: {
            name: "Voyager 2", speed: 15.3, launchSpeed: 14.0, launchDate: "1977-08-20T00:00:00Z", hasRecord: true,
            milestones: [
                { date: new Date("1977-08-20T00:00:00Z").getTime(), x: 25, name: "Kalkış" },
                { date: new Date("1979-07-09T00:00:00Z").getTime(), x: 1500, name: "Jüpiter" },
                { date: new Date("1981-08-26T00:00:00Z").getTime(), x: 3000, name: "Satürn" },
                { date: new Date("1986-01-24T00:00:00Z").getTime(), x: 4500, name: "Uranüs" },
                { date: new Date("1989-08-25T00:00:00Z").getTime(), x: 6000, name: "Neptün" }
            ]
        },
        pioneer10: {
            name: "Pioneer 10", speed: 12.0, launchSpeed: 14.3, launchDate: "1972-03-02T00:00:00Z", hasRecord: false,
            milestones: [
                { date: new Date("1972-03-02T00:00:00Z").getTime(), x: 25, name: "Kalkış" },
                { date: new Date("1973-12-04T00:00:00Z").getTime(), x: 1500, name: "Jüpiter" },
                { date: new Date("1983-06-13T00:00:00Z").getTime(), x: 6000, name: "Neptün Sınırı" }
            ]
        },
        newhorizons: {
            name: "New Horizons", speed: 16.2, launchSpeed: 16.2, launchDate: "2006-01-19T00:00:00Z", hasRecord: false,
            milestones: [
                { date: new Date("2006-01-19T00:00:00Z").getTime(), x: 25, name: "Kalkış" },
                { date: new Date("2007-02-28T00:00:00Z").getTime(), x: 1500, name: "Jüpiter" },
                { date: new Date("2015-07-14T00:00:00Z").getTime(), x: 7500, name: "Plüton" },
                { date: new Date("2019-01-01T00:00:00Z").getTime(), x: 8000, name: "Arrokoth" }
            ]
        },
        apollo13: {
            name: "Apollo 13", speed: 5.5, launchSpeed: 10.4, launchDate: "1970-04-11T13:13:00Z", hasRecord: false,
            milestones: [
                { date: new Date("1970-04-11T13:13:00Z").getTime(), x: 25, name: "Kalkış (Saturn V)" },
                { date: new Date("1970-04-14T03:07:00Z").getTime(), x: 200, name: "Oksijen Tankı Patlaması" },
                { date: new Date("1970-04-15T00:00:00Z").getTime(), x: 384, name: "Ay Etrafında Dönüş" },
                { date: new Date("1970-04-17T18:07:00Z").getTime(), x: 25, name: "Dünya'ya Dönüş" }
            ]
        }
    };

    const instrumentsData = [
        { id: "crs", name: "Kozmik Işın (CRS)", offDate: new Date("2025-02-25T00:00:00Z").getTime() },
        { id: "lecp", name: "Parçacık Ölçer (LECP)", offDate: Infinity },
        { id: "mag", name: "Manyetometre (MAG)", offDate: Infinity },
        { id: "pls", name: "Plazma Bilimi (PLS)", offDate: new Date("2007-02-01T00:00:00Z").getTime() },
        { id: "iss", name: "Görüntüleme Kamera (ISS)", offDate: new Date("1990-02-14T00:00:00Z").getTime() }
    ];

    window.jumpTo = (dateStr) => {
        simulatedCurrentDateMs = (dateStr === 'now') ? new Date().getTime() : new Date(dateStr).getTime();
    };

    window.setWhatIf = (type, val) => {
        if (type === 'ga') {
            whatIfGA = val;
            document.getElementById('ga-on').classList.toggle('active', val);
            document.getElementById('ga-off').classList.toggle('active', !val);
        } else if (type === 'sat') {
            whatIfSaturn = val;
            document.getElementById('sat-titan').classList.toggle('active', val === 'titan');
            document.getElementById('sat-miss').classList.toggle('active', val === 'miss');
        }
        updateImpact();
    };

    function updateImpact() {
        let msg = "<strong>Görev Analizi:</strong>";
        if (whatIfGA && whatIfSaturn === 'titan') {
            msg += " Orijinal görev akışı. Jüpiter sapanı hızı artırdı, Titan yan geçişi yapıldı.";
            modeBadge.textContent = "ORİJİNAL GÖREV";
            modeBadge.style.background = "var(--secondary)";
            speedKmS = 17.03;
        } else {
            modeBadge.textContent = "ALTERNATİF GÖREV";
            modeBadge.style.background = "var(--danger)";
            if (!whatIfGA) {
                msg += " Jüpiter sapanı olmadan hız 13 km/s'ye düştü. Yıldızlararası sınıra ulaşmak 50 yıl daha sürecek!";
                speedKmS = 13.0;
            }
            if (whatIfSaturn === 'miss') {
                msg += " Titan yan geçişi yapılmadı. Satürn'ün uydusu hakkında kritik veriler (metan yağmurları vb.) asla elde edilemedi.";
            }
        }
        impactAnalysis.innerHTML = msg;
    }

    // --- THREE.JS SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02050a, 0.0003);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 80000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // --- POST PROCESSING ---
    const renderScene = new THREE.RenderPass(scene, camera);
    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.4, 0.9);
    bloomPass.threshold = 0.2;
    bloomPass.strength = 0.6;
    bloomPass.radius = 0.5;
    const composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // --- LIGHTS ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const sunLight = new THREE.PointLight(0xffffff, 3.5, 60000);
    sunLight.position.set(-2000, 1000, -2000);
    scene.add(sunLight);

    // --- TEXTURES ---
    const textureLoader = new THREE.TextureLoader();
    scene.background = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/cube/MilkyWay/dark-s_pz.jpg');
    const CDN = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/';
    const SSS = 'https://upload.wikimedia.org/wikipedia/commons/';
    const textures = {
        sun: textureLoader.load(SSS + 'b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg'),
        mercury: textureLoader.load(SSS + 'd/d3/Mercury_in_color_-_Prockter07-edit1.jpg'),
        venus: textureLoader.load(SSS + 'e/e5/Venus-real_color.jpg'),
        earth: textureLoader.load(CDN + 'earth_atmos_2048.jpg'),
        mars: textureLoader.load(SSS + '0/02/OSIRIS_Mars_true_color.jpg'),
        jupiter: textureLoader.load(SSS + 'e/e2/Jupiter.jpg'),
        saturn: textureLoader.load(SSS + 'c/c7/Saturn_during_Equinox.jpg'),
        uranus: textureLoader.load(SSS + '3/3d/Uranus2.jpg'),
        neptune: textureLoader.load(SSS + '5/56/Neptune_Full.jpg'),
        pluto: textureLoader.load(SSS + 'e/ef/Pluto_in_True_Color_-_High-Res.jpg')
    };

    // --- GALAXY BACKGROUND (MILKY WAY BAND) ---
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(75000 * 3);
    const starCol = new Float32Array(75000 * 3);
    const starSizes = new Float32Array(75000);

    for (let i = 0, j = 0; i < 75000; i++, j += 3) {
        // Create a central milky way band logic
        let d = 10000 + Math.random() * 30000;
        let u = Math.random(), v = Math.random();

        // Concentrate stars along the galactic plane (Y ~ 0)
        let th = 2 * Math.PI * u;
        // Bias phi towards PI/2 for a disk-like distribution
        let phiBias = (Math.random() - Math.random()) * (Math.random() < 0.6 ? 0.3 : 1.5);
        let ph = Math.PI / 2 + phiBias;

        starPos[j] = d * Math.sin(ph) * Math.cos(th);
        starPos[j + 1] = (d * Math.cos(ph)) * 0.4; // flatten Y
        starPos[j + 2] = d * Math.sin(ph) * Math.sin(th);

        const c = new THREE.Color().setHSL(Math.random() * 0.15 + 0.55, 0.4, Math.random() < 0.2 ? 0.9 : 0.6); // Blueish/White
        starCol[j] = c.r; starCol[j + 1] = c.g; starCol[j + 2] = c.b;
        starSizes[i] = Math.random() < 0.05 ? 15.0 : (Math.random() * 4.0 + 1.0);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    // Custom shader for stars to handle individual sizes
    const starMat = new THREE.PointsMaterial({
        size: 8,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // --- SPACECRAFT BUILDER ---
    const chromeMat = new THREE.MeshPhysicalMaterial({ color: 0xcccccc, metalness: 1.0, roughness: 0.1, clearcoat: 1.0 });
    const darkMat = new THREE.MeshPhysicalMaterial({ color: 0x444444, metalness: 0.6, roughness: 0.4 });
    const goldMat = new THREE.MeshPhysicalMaterial({ color: 0xffd700, metalness: 1.0, roughness: 0.1 });
    const whiteMat = new THREE.MeshPhysicalMaterial({ color: 0xeeeeee, roughness: 0.6 });
    const kaptyonMat = new THREE.MeshPhysicalMaterial({ color: 0x886622, metalness: 0.3, roughness: 0.7 }); // kapton foil

    function buildSpacecraft(type) {
        const group = new THREE.Group();

        if (type === 'voyager') {
            // Bus (ana gövde)
            const bus = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1.3, 10), chromeMat);
            group.add(bus);
            // Parabolik anten
            const antenna = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 0.4, 1.8, 64), whiteMat);
            antenna.position.y = 1.4;
            group.add(antenna);
            // RTG çubuğu
            const rtgBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 6), darkMat);
            rtgBoom.position.set(-3, 0, 0); rtgBoom.rotation.z = Math.PI / 2;
            group.add(rtgBoom);
            // RTG ünitesi
            const rtg = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.5, 16), new THREE.MeshPhysicalMaterial({ color: 0x443333, metalness: 0.2, roughness: 0.8 }));
            rtg.position.set(-5.5, 0, 0); rtg.rotation.z = Math.PI / 2;
            group.add(rtg);
            // Bilim çubuğu (MAG boom)
            const magBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 12), darkMat);
            magBoom.position.set(5, 0, 2); magBoom.rotation.z = Math.PI / 2; magBoom.rotation.y = Math.PI / 6;
            group.add(magBoom);
            // Sensör kutusu
            const sensor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), chromeMat);
            sensor.position.set(10, 0, 3.5);
            group.add(sensor);
            // Altın Plak (Golden Record)
            const record = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.1, 32), goldMat);
            record.position.set(1.4, 0.4, 1.4); record.rotation.set(Math.PI / 4, 0, Math.PI / 4);
            group.add(record);

        } else if (type === 'pioneer') {
            // Ana gövde — altıgen platform (daha yassı)
            const body = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.6, 6), kaptyonMat);
            group.add(body);
            // Büyük parabolik anten (daha geniş)
            const dish = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 0.3, 1.4, 64), whiteMat);
            dish.position.y = 1.0;
            group.add(dish);
            // RTG çubukları (iki adet, V şeklinde)
            const rtg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4), darkMat);
            rtg1.position.set(-2.5, 0, 1); rtg1.rotation.z = Math.PI / 2; rtg1.rotation.y = 0.4;
            group.add(rtg1);
            const rtg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4), darkMat);
            rtg2.position.set(-2.5, 0, -1); rtg2.rotation.z = Math.PI / 2; rtg2.rotation.y = -0.4;
            group.add(rtg2);
            // RTG üniteleri
            const rtgTip1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 12), new THREE.MeshPhysicalMaterial({ color: 0x553333, metalness: 0.3 }));
            rtgTip1.position.set(-4.5, 0, 1.8); rtgTip1.rotation.z = Math.PI / 2;
            group.add(rtgTip1);
            const rtgTip2 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 12), new THREE.MeshPhysicalMaterial({ color: 0x553333, metalness: 0.3 }));
            rtgTip2.position.set(-4.5, 0, -1.8); rtgTip2.rotation.z = Math.PI / 2;
            group.add(rtgTip2);
            // Altın tablet (plak değil, dikdörtgen plaka)
            const tablet = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.35), goldMat);
            tablet.position.set(1.2, 0.35, 0);
            group.add(tablet);

        } else if (type === 'newhorizons') {
            // Ana gövde — üçgen/trapez (piano şekli)
            const bodyGeo = new THREE.CylinderGeometry(1.0, 2.2, 1.0, 3);
            const body = new THREE.Mesh(bodyGeo, kaptyonMat);
            body.rotation.y = Math.PI / 6;
            group.add(body);
            // Yuvarlak parabolik anten (üstte, daha küçük)
            const dish = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 0.3, 1.2, 64), whiteMat);
            dish.position.y = 1.2;
            group.add(dish);
            // RTG çubuğu (arkaya doğru, uzun)
            const rtgBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 8), darkMat);
            rtgBoom.position.set(-4, 0, 0); rtgBoom.rotation.z = Math.PI / 2;
            group.add(rtgBoom);
            // RTG ünitesi
            const rtgUnit = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.8, 12), new THREE.MeshPhysicalMaterial({ color: 0x443333, metalness: 0.2 }));
            rtgUnit.position.set(-7.5, 0, 0); rtgUnit.rotation.z = Math.PI / 2;
            group.add(rtgUnit);
            // Bilimsel alet kutuları (ön yüzde)
            for (let i = 0; i < 3; i++) {
                const box = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.4), chromeMat);
                box.position.set(2.0, -0.2 + i * 0.4, (i - 1) * 0.6);
                group.add(box);
            }
        } else if (type === 'apollo') {
            // Service Module (Cylinder)
            const sm = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 2.5, 32), whiteMat);
            group.add(sm);
            // Command Module (Cone)
            const cm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.8, 1.2, 32), chromeMat);
            cm.position.y = 1.85;
            group.add(cm);
            // Engine nozzle (Cone)
            const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.1, 0.8, 16), darkMat);
            eng.position.y = -1.65;
            group.add(eng);
            // LM Descent stage
            const lmBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 1.5), kaptyonMat);
            lmBase.position.y = 2.85;
            group.add(lmBase);
            // LM Ascent stage
            const lmTop = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.8, 8), whiteMat);
            lmTop.position.y = 3.65;
            group.add(lmTop);

            group.rotation.x = Math.PI / 2;
        }

        return group;
    }

    let currentSpacecraftType = 'voyager';
    let voyager = buildSpacecraft('voyager');
    scene.add(voyager);

    // --- ORBIT CONTROLS ---
    const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.08;
    orbitControls.minDistance = 8;
    orbitControls.maxDistance = 200;
    orbitControls.enabled = false;
    let isOrbitMode = false;
    let cameraShake = 0; // çarpışma sarsıntısı

    // --- HUMAN EXPERIENCE DATA ---
    const humanExperience = {
        voyager1: [
            { phase: "KALKIŞ", milestone: 0, title: "🚀 Fırlatma: Titan IIIE Roketi (5G Kuvveti)", body: "Motor ateşleniyor! Göğsünüze 400 kg basınç biniyor. Nefes almak zorlaşıyor, görüşünüz tünel gibi daralmış. 8.5 dakika içinde yörüngeye çıkıyorsunuz. Motor kesilince aniden ağırlıksızlık — miden bulanıyor, her şey süzülüyor.", stats: ["5G İvme", "25°C Kabin", "11.2 km/s"] },
            { phase: "TRANSİT", milestone: 0.3, title: "🌌 Boşlukta Sürüklenme (0G Ağırlıksızlık)", body: "Motorlar kapandı. Sonsuz sessizlik. Kalp atışınızı duyuyorsunuz. Pencereden Dünya küçülüyor... Bir maviden bir noktaya dönüşüyor. Yemek yiyemiyorsunuz, her şey hav. Su damlaları havada asılı kalıyor.", stats: ["0G", "-150°C Dış", "17 km/s"] },
            { phase: "JÜPİTER GEÇİŞİ", milestone: 1, title: "🌀 Radyasyon Cehennemi (1000x Ölümcül Doz)", body: "Jüpiter’in radyasyon kuşağına girdiniz. Korumalı bile olsanız vücudunuz ışıma altında. Elektronik cihazlar çıldırıyor, ekranlar titriyor. Dev Kırmızı Leke pencereden Dünya’dan büyük görünüyor. Korku ve hayret bir arada.", stats: ["1000 rem/sa", "0G", "Sapan: +10 km/s"] },
            { phase: "SATÜRN GEÇİŞİ", milestone: 2, title: "💍 Halkaların Arasındaki Buz Parçacıkları", body: "Satürn’ün halkaları pencereden sürünüyor. Milyarlarca buz parçasının arasından geçiyorsunuz. Küçük parçalar gövdeye çarpıyor — tak tak sesleri. Titan’ın turuncu atmosferi pencerenin içini dolduruyorken tüy metan kokusu alıyorsunuz.", stats: ["-180°C", "0G", "Titan: Metan Yağmuru"] },
            { phase: "SOLUK MAVİ NOKTA", milestone: 3, title: "🌍 Soluk Mavi Nokta (Carl Sagan)", body: "Bakın o noktaya. Oraya, evimize, bize... Sevdiğiniz herkes, tanıdığınız herkes orada yaşadı. Voyager bu toz zerresini 6 milyar km'den görüntüledi. İnsanlığın her türlü sevinci ve ıstırabı bu gümüşsel ışık hüzmesi içindeki küçücük mavi noktada asılı kaldı.", img: "https://www.nasa.gov/wp-content/uploads/2020/02/02_pale_blue_dot_revisited.jpg", stats: ["6 Milyar KM", "00:00", "Evimiz: 0.12 Piksel"] },
            { phase: "YİLDİZLARARASİ", milestone: 4, title: "✨ Sonsuz Karanlık (Yalnızlık)", body: "Güneş artık sadece parlak bir yıldız. Bütün insanlık 0.002 milimetrelik bir noktada. Tamamen yalnızsınız. Radyo sinyali Dünya’ya ulaşması 22 saat sürüyor. Hiçbir ses, hiçbir hareket. Sadece siz ve sonsuzluk.", stats: ["-270°C", "0G", "22 saat sinyal gecikmesi"] }
        ],
        voyager2: [
            { phase: "KALKIŞ", milestone: 0, title: "🚀 Titan IIIE (Kardeş Görev)", body: "Voyager 1'den 16 gün önce fırlatıldınız ama daha yavaş bir yörüngede ilerliyorsunuz. Aynı göğüs ezici 5G kuvveti. Roket titreşimleri kemiklerinize kadar işliyor.", stats: ["5G İvme", "25°C", "14 km/s"] },
            { phase: "JÜPİTER", milestone: 1, title: "🌀 Dev Kasırgalar", body: "Jüpiter'in bulutlarının hemen üzerinden geçiyorsunuz. Dev fırtınaları, bulutların karmaşık yapısını görüyorsunuz. Manyetik alan o kadar güçlü ki pusulalarınız delirmiş durumda.", stats: ["R2", "0G", "45.000 km/s"] },
            { phase: "SATÜRN", milestone: 2, title: "💍 Halkaların Senfonisi", body: "Satürn'ün halkaları bir piyano tuşu gibi önünüzde. Milyonlarca buz parçası ışık altında elmas gibi parlıyor. Bir halkadan diğerine süzülüyorsunuz.", stats: ["-170°C", "0G", "Yüzüklerin Efendisi"] },
            { phase: "URANÜS", milestone: 3, title: "🥶 Buz Devi", body: "Uranüs'ün soluk mavi, hareketsiz atmosferi sizi karşılıyor. Bilinen en soğuk yerlerden biri. Bir buz banyosu gibi, her şey dondurucu ve sessiz.", stats: ["-214°C", "0G", "Buz Devi"] },
            { phase: "NEPTÜN", milestone: 4, title: "💨 Büyük Karanlık Leke", body: "Mavi dev Neptün. Saatte 2000 km hızla esen rüzgarlar Triton uydusunun üzerinden geçerken sizi savuruyor. Güneş sisteminin sınırındasınız.", stats: ["-200°C", "00:00", "Büyük Leke"] },
            { phase: "YILDIZLARARASI", milestone: 5, title: "🌌 Karanlığa Yolculuk", body: "Kardeşiniz Voyager 1'in izinden gidiyorsunuz. Artık Güneş rüzgarları bitti, yıldızlararası rüzgarlar sizi karşılıyor. Hoşçakal Güneş Sistemi.", stats: ["Sınırsız", "21 saat gecikme", "Veda"] }
        ],
        apollo13: [
            { phase: "KALKIŞ", milestone: 0.1, title: "🚀 Houston, Kalkıyoruz", body: "Saturn V fırlatıldı! 3500 tonluk canavar saniyede metrelerce yakıt tüketiyor. Etrafınız şiddetle sarsılıyor.", stats: ["4G İvme", "Saturn V", "27.000 km/s"] },
            { phase: "KRİZ", milestone: 1.2, title: "💥 'Houston, We've Had a Problem'", body: "Oksijen tankı 2 patladı! Servis Modülü'nden uzaya gaz fışkırdığını görüyorsunuz. Elektrik seviyesi çok düşük, modül donuyor.", stats: ["3 Amper", "Aşırı Soğuk", "O2 Kritik"] },
            { phase: "AY SAPANI", milestone: 2, title: "🌑 Ay'ın Karanlık Yüzü", body: "Aya varmak değil, güvenli dönebilmek için Ay sapanına giriyorsunuz. Dünya gözden kayboldu. Kapsüldeki nefesiniz camda buza dönüşüyor. Tam bir sessizlik.", stats: ["0G", "-15°C", "LM'de 3 Kişi"] },
            { phase: "DÖNÜŞ", milestone: 3, title: "🔥 Atmosfere Giriş", body: "Geri dönüyorsunuz! Kurtarma kapsülündesiniz. Dışarıdaki plazma sıcaklığı 2760 santigrat derece. Pencereler kızıla büründü. Telsiz 3 dakikalığına karanlıkta.", stats: ["-2760°C", "5G Fading", "Pasifik İnişi"] }
        ]
    };
    let currentMissionId = 'voyager1';

    // --- ATMOSPHERE SHADER ---
    const atmosMat = (color, pVal = 4.5, cVal = 0.1) => new THREE.ShaderMaterial({
        uniforms: {
            c: { value: cVal }, p: { value: pVal },
            glowColor: { value: new THREE.Color(color) },
            viewVector: { value: camera.position }
        },
        vertexShader: `
            varying float intensity;
            void main() {
                vec3 vNormal = normalize( normalMatrix * normal );
                intensity = pow( 0.7 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 4.0 );
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }`,
        fragmentShader: `
            uniform vec3 glowColor;
            varying float intensity;
            void main() { gl_FragColor = vec4( glowColor, intensity ); }`,
        side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true
    });

    // --- PLANETS ---
    const bodies = [];
    const addBody = (name, x, size, texture, color, isSun = false, ring = null) => {
        const g = new THREE.Group(); g.position.set(x, 0, -250);

        let matArgs = texture ? { map: texture, roughness: 0.6, metalness: 0.1 } : { color: color, roughness: 0.7, metalness: 0.2 };
        if (isSun) matArgs = { color: color };

        const m = new THREE.Mesh(new THREE.SphereGeometry(size, 64, 64),
            isSun ? new THREE.MeshBasicMaterial(matArgs) : new THREE.MeshStandardMaterial(matArgs)
        );
        g.add(m);

        // Güneş Cisimlerine Özel Corona ve Gezegen Atmosferi
        if (isSun) {
            const corona = new THREE.Mesh(new THREE.SphereGeometry(size * 1.25, 64, 64), atmosMat(0xffaa00, 2.0, 0.5));
            g.add(corona);
            g.corona = corona;
        } else {
            const a = new THREE.Mesh(new THREE.SphereGeometry(size * 1.04, 64, 64), atmosMat(color || 0x44aaff, 5.0, 0.05));
            g.add(a);
        }

        // Halka (Satürn/Uranüs)
        if (ring) {
            const rGeo = new THREE.RingGeometry(size * ring.inner, size * ring.outer, 64);
            const rMat = new THREE.MeshStandardMaterial({ color: ring.color, side: THREE.DoubleSide, transparent: true, opacity: ring.opacity || 0.8, roughness: 0.8 });
            const rMesh = new THREE.Mesh(rGeo, rMat);
            rMesh.rotation.x = Math.PI / 2 + 0.3; // Eğim
            g.add(rMesh);
            g.ring = rMesh;
        }

        scene.add(g);
        bodies.push({ name, x, g, mesh: m, isSun });
    };

    // Tüm Güneş Sistemi - Gerçekçi texture'larla
    addBody("Güneş", -1500, 300, textures.sun, 0xffaa00, true);
    addBody("Merkür", -600, 8, textures.mercury, 0x999999);
    addBody("Venüs", -300, 18, textures.venus, 0xffd085);
    addBody("Dünya", 25, 20, textures.earth, 0x44aaff);
    addBody("Mars", 400, 12, textures.mars, 0xcc5533);
    addBody("Jüpiter", 1500, 60, textures.jupiter, 0xcca677);
    addBody("Satürn", 3000, 52, textures.saturn, 0xf4d47a, false, { inner: 1.2, outer: 2.2, color: 0xd8c89d });
    addBody("Uranüs", 4500, 25, textures.uranus, 0x66ccff, false, { inner: 1.5, outer: 1.6, color: 0xffffff, opacity: 0.3 });
    addBody("Neptün", 6000, 24, textures.neptune, 0x3366ff);
    addBody("Plüton", 7500, 5, textures.pluto, 0xbbaadd);

    // --- INSTRUMENT UI ---
    instrumentListElem.innerHTML = instrumentsData.map(inst => `
        <div class="instrument-item">
            <div class="instrument-top">
                <div class="instrument-name">${inst.name}</div>
                <div class="status-badge" id="badge-${inst.id}">
                    <span class="status-dot"></span> <span id="text-${inst.id}">...</span>
                </div>
            </div>
        </div>
    `).join('');

    // --- EXPERIMENTAL API EXPORT ---
    let explosions = [];

    let lastPhaseIdx = -1;

    function updateHumanExperienceUI() {
        const toast = document.getElementById('human-toast');
        if (!toast) return;

        const experiences = humanExperience[currentMissionId];
        if (!experiences) return;

        // Hangi aşamadayız? Zaman bazlı hesapla
        let activeIdx = 0;
        const msArr = milestones;
        if (msArr.length > 0) {
            const totalTime = msArr[msArr.length - 1].date - msArr[0].date;
            const elapsed = simulatedCurrentDateMs - msArr[0].date;
            const progress = Math.max(0, elapsed / (totalTime || 1));

            for (let i = experiences.length - 1; i >= 0; i--) {
                const threshold = experiences[i].milestone / (msArr.length > 1 ? msArr.length - 1 : 1);
                if (progress >= threshold - 0.01) { activeIdx = i; break; }
            }
        }

        // Eğer aşama değiştiyse toast'u göster
        if (activeIdx !== lastPhaseIdx) {
            const exp = experiences[activeIdx];
            document.getElementById('toast-phase').innerHTML = `\u2728 \u0130NSAN DENEY\u0130M\u0130 \u2014 ${exp.phase}`;
            document.getElementById('toast-title').textContent = exp.title;

            // Görsel varsa ekle (Pale Blue Dot vb.)
            if (exp.img) {
                document.getElementById('toast-body').innerHTML = `
                    <div style="margin-bottom: 15px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border);">
                        <img src="${exp.img}" style="width: 100%; display: block; filter: brightness(1.2);" alt="${exp.title}">
                    </div>
                    ${exp.body}
                `;
            } else {
                document.getElementById('toast-body').textContent = exp.body;
            }

            document.getElementById('toast-stats').innerHTML = exp.stats.map(s => `<span class="stat-chip">${s}</span>`).join('');

            toast.classList.add('visible');
            lastPhaseIdx = activeIdx;
        }
    }



    window.SimAPI = {
        changeMode: (mode) => {
            currentMode = mode;
            if (window.TrajectorySim) window.TrajectorySim.onModeChange(mode);
            if (window.GravityLab) window.GravityLab.onModeChange(mode);
            if (window.CrisisMode) window.CrisisMode.onModeChange(mode);
        },
        scene: scene,
        camera: camera,
        voyager: voyager,
        planets: bodies,
        milestones: milestones,
        startTrajectorySim: () => { if (window.TrajectorySim) window.TrajectorySim.start(); },
        startGravityAssist: () => { if (window.GravityLab) window.GravityLab.start(); },
        startCrisis: () => { if (window.CrisisMode) window.CrisisMode.start(); },

        toggleOrbit: () => {
            isOrbitMode = !isOrbitMode;
            orbitControls.enabled = isOrbitMode;
            const btn = document.getElementById('orbit-toggle-btn');
            if (btn) btn.classList.toggle('active', isOrbitMode);

            if (isOrbitMode) {
                // Kamerayı araca yakınlaştır
                orbitControls.target.copy(voyager.position);
                camera.position.set(voyager.position.x - 15, voyager.position.y + 10, voyager.position.z + 20);
                orbitControls.update();
            }
        },

        setMission: (id) => {
            const m = missionProfiles[id];
            if (!m) return;

            currentMissionId = id;
            milestones = [...m.milestones];
            speedKmS = m.speed;
            LAUNCH_DATE = new Date(m.launchDate).getTime();
            simulatedCurrentDateMs = LAUNCH_DATE;

            // Uzay aracı modelini değiştir
            const newType = (id === 'pioneer10') ? 'pioneer' : (id === 'newhorizons') ? 'newhorizons' : (id === 'apollo13') ? 'apollo' : 'voyager';
            if (newType !== currentSpacecraftType) {
                const oldPos = voyager.position.clone();
                scene.remove(voyager);
                voyager = buildSpacecraft(newType);
                voyager.position.copy(oldPos);
                scene.add(voyager);
                currentSpacecraftType = newType;
                window.SimAPI.voyager = voyager;
            }

            // Hidden golden record for non-Voyager
            if (newType === 'voyager' && voyager.children.length >= 7) {
                voyager.children[6].visible = m.hasRecord; // Altın plak 7. child
            }

            // Duraklar başlığını güncelle
            const milestonesTitle = document.getElementById('milestones-title');
            if (milestonesTitle) milestonesTitle.innerText = `Duraklar (${m.name})`;

            const btnContainer = document.getElementById('milestones-container');
            if (btnContainer) {
                btnContainer.innerHTML = '';
                m.milestones.forEach(ms => {
                    const btn = document.createElement('button');
                    btn.className = 'nav-btn';
                    const dateStr = new Date(ms.date).toISOString().split('T')[0];
                    btn.setAttribute('onclick', `jumpTo('${dateStr}')`);
                    btn.innerText = ms.name;
                    btnContainer.appendChild(btn);
                });
            }

            // Voyager 1 ise ses kontrolünü göster, değilse gizle ve sesi durdur
            const soundContainer = document.getElementById('sound-control-container');
            if (soundContainer) {
                if (id === 'voyager1') {
                    soundContainer.style.display = 'block';
                } else {
                    soundContainer.style.display = 'none';
                    const audio = document.getElementById('ambient-audio');
                    if (audio) {
                        audio.pause();
                        const btn = document.getElementById('ambient-toggle');
                        if (btn) btn.classList.remove('active');
                    }
                }
            }

            // İnsan deneyimi panelini sıfırla ve güncelle
            lastPhaseIdx = -1;
            updateHumanExperienceUI();

            // Orbit moddan çık
            if (isOrbitMode) window.SimAPI.toggleOrbit();

            window.SimAPI.changeMode('CINEMATIC');
        },


        createExplosion: (pos) => {
            window.SimAPI.createCinematicCrash(pos);
        },

        createCinematicCrash: (pos) => {
            // === KATMAN 1: Beyaz parlak çekirdek (hızlı, küçük) ===
            const coreCount = 150;
            const coreGeo = new THREE.BufferGeometry();
            const corePos = new Float32Array(coreCount * 3);
            const coreVels = [];
            for (let i = 0; i < coreCount; i++) {
                corePos[i * 3] = pos.x; corePos[i * 3 + 1] = pos.y; corePos[i * 3 + 2] = pos.z;
                const r = 5 + Math.random() * 15;
                const th = Math.random() * Math.PI * 2;
                const ph = Math.acos(2 * Math.random() - 1);
                coreVels.push({ x: r * Math.sin(ph) * Math.cos(th), y: r * Math.sin(ph) * Math.sin(th), z: r * Math.cos(ph) });
            }
            coreGeo.setAttribute('position', new THREE.BufferAttribute(corePos, 3));
            const coreMat = new THREE.PointsMaterial({ color: 0xffffff, size: 4, transparent: true, opacity: 1, blending: THREE.AdditiveBlending });
            const coreParticles = new THREE.Points(coreGeo, coreMat);
            scene.add(coreParticles);
            explosions.push({ mesh: coreParticles, velocities: coreVels, life: 0.6 });

            // === KATMAN 2: Turuncu/kırmızı ana patlama ===
            const mainCount = 500;
            const mainGeo = new THREE.BufferGeometry();
            const mainPos = new Float32Array(mainCount * 3);
            const mainVels = [];
            for (let i = 0; i < mainCount; i++) {
                mainPos[i * 3] = pos.x; mainPos[i * 3 + 1] = pos.y; mainPos[i * 3 + 2] = pos.z;
                const r = 2 + Math.random() * 10;
                const th = Math.random() * Math.PI * 2;
                const ph = Math.acos(2 * Math.random() - 1);
                mainVels.push({ x: r * Math.sin(ph) * Math.cos(th), y: r * Math.sin(ph) * Math.sin(th), z: r * Math.cos(ph) });
            }
            mainGeo.setAttribute('position', new THREE.BufferAttribute(mainPos, 3));
            const mainMat = new THREE.PointsMaterial({ color: 0xff5500, size: 6, transparent: true, opacity: 1, blending: THREE.AdditiveBlending });
            const mainParticles = new THREE.Points(mainGeo, mainMat);
            scene.add(mainParticles);
            explosions.push({ mesh: mainParticles, velocities: mainVels, life: 1.2 });

            // === KATMAN 3: Gri duman/enkaz (yavaş, uzun süreli) ===
            const debrisCount = 200;
            const debrisGeo = new THREE.BufferGeometry();
            const debrisPos = new Float32Array(debrisCount * 3);
            const debrisVels = [];
            for (let i = 0; i < debrisCount; i++) {
                debrisPos[i * 3] = pos.x + (Math.random() - 0.5) * 3;
                debrisPos[i * 3 + 1] = pos.y + (Math.random() - 0.5) * 3;
                debrisPos[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 3;
                const r = 0.5 + Math.random() * 3;
                const th = Math.random() * Math.PI * 2;
                const ph = Math.acos(2 * Math.random() - 1);
                debrisVels.push({ x: r * Math.sin(ph) * Math.cos(th), y: r * Math.sin(ph) * Math.sin(th), z: r * Math.cos(ph) });
            }
            debrisGeo.setAttribute('position', new THREE.BufferAttribute(debrisPos, 3));
            const debrisMat = new THREE.PointsMaterial({ color: 0x888888, size: 8, transparent: true, opacity: 0.7 });
            const debrisParticles = new THREE.Points(debrisGeo, debrisMat);
            scene.add(debrisParticles);
            explosions.push({ mesh: debrisParticles, velocities: debrisVels, life: 2.5 });

            // === KAMERA SARSINTISI ===
            cameraShake = 1.0;
        }
    };

    // --- AI TELEMETRY MESSAGES ---
    const aiTelemetryData = {
        voyager1: [
            { x: 1000, msg: "UYARI: Voyager 1 ana asteroid ku\u015fa\u011f\u0131na girdi. Par\u00e7ac\u0131k dedekt\u00f6rleri mikrometeorit yo\u011funlu\u011funda art\u0131\u015f bildiriyor." },
            { x: 1550, msg: "ANAL\u0130Z: J\u00fcpiter manyetosferi saptand\u0131. Radyasyon seviyeleri g\u00fcvenli s\u0131n\u0131rlar\u0131n 100 kat \u00fczerine \u00e7\u0131kt\u0131. RTG g\u00fc\u00e7 \u00e7\u0131k\u0131\u015f\u0131 stabil." },
            { x: 3050, msg: "B\u0130LG\u0130: Sat\u00fcrn halkalar\u0131ndan gelen radyo emisyonlar\u0131 dinleniyor. Titan ge\u00e7i\u015fi i\u00e7in y\u00f6r\u00fcnge d\u00fczeltme manevras\u0131 tamamland\u0131." },
            { x: 6500, msg: "FOTO\u011eRAF: 'Soluk Mavi Nokta' i\u00e7in kamera platformu d\u00f6nd\u00fcr\u00fcl\u00fcyOR. D\u00fcnya 6 milyar km'den g\u00f6r\u00fcnt\u00fcleniyor." },
            { x: 9005, msg: "KR\u0130T\u0130K: Voyager 1 Helyopoz s\u0131n\u0131r\u0131n\u0131 ge\u00e7ti. Y\u0131ld\u0131zlararas\u0131 plazma yo\u011funlu\u011funda %20 art\u0131\u015f saptand\u0131. Art\u0131k y\u0131ld\u0131zlararas\u0131ndas\u0131n\u0131z." }
        ],
        voyager2: [
            { x: 4500, msg: "ANAL\u0130Z: Uran\u00fcs'e yakla\u015f\u0131l\u0131yor. Gezegenin eksen e\u011fikli\u011fi manyetik alanda anomalilere yol a\u00e7\u0131yor." },
            { x: 6005, msg: "B\u0130LG\u0130: Nept\u00fcn/Triton ge\u00e7i\u015fi ba\u015flad\u0131. 'B\u00fcy\u00fck Karanl\u0131k Leke' r\u00fczgar h\u0131zlar\u0131 analiz ediliyor." }
        ]
    };
    let triggeredAiLogs = new Set();

    function pushAiLog(msg) {
        const stream = document.getElementById('ai-log-stream');
        if (!stream) return;
        const log = document.createElement('div');
        log.className = 'telemetry-log';
        const d = new Date(simulatedCurrentDateMs);
        log.innerHTML = `<div class="log-time">[${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}]</div>${msg}`;
        stream.prepend(log); // En yeni log en \u00fcstte
    }

    // --- INTERACTION (RAYCASTER) ---

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const planetData = {
        "Güneş": { img: "https://upload.wikimedia.org/wikipedia/commons/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg", desc: "Sistemimizin motoru. Güneş rüzgarlarının etkisi Yıldızlararası Uzay sınırında (Helyopoz) kırılana kadar Voyager'ı takip etmiştir." },
        "Merkür": { img: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Mercury_in_color_-_Prockter07-edit1.jpg", desc: "Güneşe en yakın gezegen. Voyager programının hedef listesinde değildi, ancak Mariner 10 tarafından daha önce araştırıldı." },
        "Venüs": { img: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg", desc: "Asit yağmurları ve kalın atmosferi sebebiyle cehennem gibi bir dünya. Voyager burayı ziyaret etmedi." },
        "Dünya": { img: "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg", desc: "Voyager 1'in 5 Eylül 1977'deki çıkış noktası. İnsanlığın mesajı olan Altın Plak'ı (Golden Record) taşıyan elçimiz." },
        "Mars": { img: "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg", desc: "Kızıl gezegen. Voyager programı dış gezegenlere odaklandığı için Mars'ı es geçti." },
        "Jüpiter": { img: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg", desc: "Voyager 1'in 1979'da devasa Kırmızı Leke'sini çektiği gezegen. İo, Europa ve Ganymede gibi uyduları ilk kez net fotoğraflandı." },
        "Satürn": { img: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg", desc: "1980 geçişinde Voyager 1, sıvı metan denizi olduğu düşünülen Titan uydusuna yakından bakmak için rotasını saptırdı." },
        "Uranüs": { img: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg", desc: "Buz devi Uranüs'ü 1986'da ziyaret edebilen tek araç Voyager 2 oldu. Voyager 1 o sırada Güneş Sistemi düzleminden yukarı çoktan ayrılmıştı." },
        "Neptün": { img: "https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg", desc: "Triton uydusundaki buz volkanları ve kara fırtınalarıyla Voyager 2'nin son nefes kesici gezegen durağı." },
        "Plüton": { img: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Pluto_in_True_Color_-_High-Res.jpg", desc: "2015 yılında Yeni Ufuklar (New Horizons) aracına kadar gizemini korudu. Üzerindeki kalp şekliyle dikkat çekti." }
    };

    window.addEventListener('pointerdown', (event) => {
        // Yalnızca canvas üzerine tıklandığında algıla (UI hiyerarşisi karışmasın)
        if (event.target.tagName !== 'CANVAS') return;

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        // Cisimlerin asıl Mesh'lerine (atmosfer, halo değil) tıklandığını bul
        const targetMeshes = bodies.map(b => b.mesh);
        const intersects = raycaster.intersectObjects(targetMeshes);

        if (intersects.length > 0) {
            const hitMesh = intersects[0].object;
            const body = bodies.find(b => b.mesh === hitMesh);
            if (body && planetData[body.name]) {
                const data = planetData[body.name];
                document.getElementById('info-title').innerText = body.name;

                const img = document.getElementById('info-img');
                const noise = document.getElementById('noise-overlay');
                const status = document.getElementById('ai-restore-status');
                const btn = document.getElementById('ai-restore-btn');

                // AI Restore Reset (Her a\u00e7\u0131ld\u0131\u011f\u0131nda ham/grenli ba\u015fla)
                img.src = data.img;
                img.classList.add('grainy');
                noise.classList.add('active');
                status.style.display = 'none';
                btn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    AI RESTORE
                `;
                btn.style.background = 'linear-gradient(90deg, #00d2ff, #3a7bd5)';

                document.getElementById('info-desc').innerText = data.desc;
                document.getElementById('info').classList.add('active');
            }

        }
    });

    // --- MAIN LOOP ---
    const clock = new THREE.Clock();
    let camSmoothPos = new THREE.Vector3(0, 50, 150);

    function animate() {
        requestAnimationFrame(animate);
        const dt = clock.getDelta();
        const t = clock.getElapsedTime();

        // Let modules handle logic when active
        if (currentMode === 'TRAJECTORY' && window.TrajectorySim) window.TrajectorySim.tick(dt);
        if (currentMode === 'GRAVITY' && window.GravityLab) window.GravityLab.tick(dt);

        if (currentMode === 'CINEMATIC' || currentMode === 'CRISIS') {
            // Time Flow
            if (currentMode === 'CINEMATIC') {
                const TS = 86400000 * 45;
                if (keys['ArrowRight']) simulatedCurrentDateMs += TS * dt;
                else if (keys['ArrowLeft']) simulatedCurrentDateMs -= TS * dt;
                else simulatedCurrentDateMs += 1000 * dt;
                if (simulatedCurrentDateMs < LAUNCH_DATE) simulatedCurrentDateMs = LAUNCH_DATE;

                // Voyager konumu + animasyon
                voyager.position.x = getXFromDate(simulatedCurrentDateMs);
                voyager.position.y = Math.sin(t * 0.4) * 1.8;
                voyager.rotation.y += 0.005;

                if (!isOrbitMode) {
                    // Cinematic camera tracks Voyager
                    const targetCamX = voyager.position.x - 70;
                    const targetCamY = 25;
                    const targetCamZ = 130;

                    if (t < 5 && simulatedCurrentDateMs < (milestones[1] ? milestones[1].date : Infinity)) {
                        camSmoothPos.lerp(new THREE.Vector3(-10, 8, 45), 0.02);
                    } else {
                        camSmoothPos.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.05);
                    }

                    camera.position.copy(camSmoothPos);
                    camera.lookAt(voyager.position.x + 10, 0, -25);
                } else {
                    // Orbit mode: OrbitControls takip eder
                    orbitControls.target.copy(voyager.position);
                    orbitControls.update();
                }

                // Kamera sarsıntısı (çarpışmadan sonra)
                if (cameraShake > 0) {
                    camera.position.x += (Math.random() - 0.5) * cameraShake * 5;
                    camera.position.y += (Math.random() - 0.5) * cameraShake * 5;
                    camera.position.z += (Math.random() - 0.5) * cameraShake * 3;
                    cameraShake -= dt * 2;
                    if (cameraShake < 0) cameraShake = 0;
                }
            }

            // AI Telemetry Check
            const missionLogs = aiTelemetryData[currentMissionId];
            if (missionLogs) {
                missionLogs.forEach((log, idx) => {
                    const key = `${currentMissionId}_${idx}`;
                    if (voyager.position.x >= log.x && !triggeredAiLogs.has(key)) {
                        pushAiLog(log.msg);
                        triggeredAiLogs.add(key);
                    }
                });
            }

            // Update UI

            const d = new Date(simulatedCurrentDateMs);

            const daysSinceLaunch = Math.floor((simulatedCurrentDateMs - LAUNCH_DATE) / (1000 * 60 * 60 * 24));

            if (dateInput && document.activeElement !== dateInput) {
                dateInput.value = d.toISOString().split('T')[0];
            }
            const distKm = Math.max(0, ((simulatedCurrentDateMs - LAUNCH_DATE) / 1000) * speedKmS);
            distEarthElem.textContent = Math.floor(distKm).toLocaleString('tr-TR');

            instrumentsData.forEach(inst => {
                const isOff = simulatedCurrentDateMs >= inst.offDate;
                const b = document.getElementById(`badge-${inst.id}`);
                const tx = document.getElementById(`text-${inst.id}`);
                if (b) b.className = 'status-badge ' + (isOff ? 'status-off' : 'status-on');
                if (tx) tx.textContent = (isOff ? 'Kapalı' : 'Aktif');
            });
        }

        // Gezegenleri kendi ekseni etrafında döndürerek canlı simülasyon hissi ver
        bodies.forEach((b, i) => {
            if (b.mesh) b.mesh.rotation.y += 0.002 + (i * 0.0005);
            // Güneş tacı (corona) dalgalanma efekti
            if (b.isSun && b.g.corona) {
                b.g.corona.scale.setScalar(1.0 + Math.sin(t * 2.0) * 0.02);
            }
        });

        // Update explosions
        for (let i = explosions.length - 1; i >= 0; i--) {
            const exp = explosions[i];
            exp.life -= dt * 1.5;
            if (exp.life <= 0) {
                scene.remove(exp.mesh);
                exp.mesh.geometry.dispose();
                exp.mesh.material.dispose();
                explosions.splice(i, 1);
                continue;
            }

            exp.mesh.material.opacity = Math.min(1, exp.life);
            const positions = exp.mesh.geometry.attributes.position.array;
            for (let j = 0; j < exp.velocities.length; j++) {
                positions[j * 3] += exp.velocities[j].x * dt * 45;
                positions[j * 3 + 1] += exp.velocities[j].y * dt * 45;
                positions[j * 3 + 2] += exp.velocities[j].z * dt * 45;
            }
            exp.mesh.geometry.attributes.position.needsUpdate = true;
        }

        // İnsan Deneyimi kartlarını her 2 saniyede güncelle
        if (Math.floor(t * 10) % 20 === 0) {
            updateHumanExperienceUI();
        }

        composer.render();
    }

    function getXFromDate(ms) {
        if (ms <= milestones[0].date) return milestones[0].x;
        for (let i = 0; i < milestones.length - 1; i++) {
            if (ms >= milestones[i].date && ms <= milestones[i + 1].date) {
                const p = (ms - milestones[i].date) / (milestones[i + 1].date - milestones[i].date);
                let xPos = milestones[i].x + p * (milestones[i + 1].x - milestones[i].x);
                // If GA is off, Voyager moves slower visually
                if (!whatIfGA && ms > milestones[1].date) xPos = milestones[1].x + (xPos - milestones[1].x) * 0.6;
                return xPos;
            }
        }
        let endX = milestones[milestones.length - 1].x;
        if (!whatIfGA) endX = milestones[1].x + (endX - milestones[1].x) * 0.6;
        return endX;
    }

    window.addEventListener('keydown', e => keys[e.code] = true);
    window.addEventListener('keyup', e => keys[e.code] = false);
    dateInput.addEventListener('change', e => simulatedCurrentDateMs = new Date(e.target.value).getTime());
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight); composer.setSize(window.innerWidth, window.innerHeight);
    });

    loadingText.style.opacity = '0';
    setTimeout(() => { loadingText.remove(); updateImpact(); updateHumanExperienceUI(); }, 1500);
    animate();
};