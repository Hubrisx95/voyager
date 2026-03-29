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
                { date: new Date("1977-09-05T00:00:00Z").getTime(), x: 25, name: "Kalkış" },
                { date: new Date("1979-03-05T00:00:00Z").getTime(), x: 1500, name: "Jüpiter" },
                { date: new Date("1980-11-12T00:00:00Z").getTime(), x: 3000, name: "Satürn" },
                { date: new Date("1990-02-14T00:00:00Z").getTime(), x: 6500, name: "Soluk Mavi Nokta" },
                { date: new Date("2012-08-25T00:00:00Z").getTime(), x: 9000, name: "S\u0131n\u0131r" },
                { date: new Date().getTime(), x: 12750, name: "Anl\u0131k" }
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
    const bgCubeLoader = new THREE.CubeTextureLoader();
    scene.background = bgCubeLoader
        .setPath('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/cube/MilkyWay/')
        .load([ 'dark-s_px.jpg', 'dark-s_nx.jpg', 'dark-s_py.jpg', 'dark-s_ny.jpg', 'dark-s_pz.jpg', 'dark-s_nz.jpg' ]);
    const textureLoader = new THREE.TextureLoader();
    const CDN = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/';
    const SSS = 'https://upload.wikimedia.org/wikipedia/commons/';
    const texture_links = {
        sun: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/sunmap.jpg',
        mercury: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/mercurymap.jpg',
        venus: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/venusmap.jpg',
        earth: CDN + 'earth_atmos_2048.jpg',
        mars: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/marsmap1k.jpg',
        jupiter: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/jupitermap.jpg',
        saturn: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/saturnmap.jpg',
        uranus: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/uranusmap.jpg',
        neptune: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/neptunemap.jpg',
        pluto: 'https://cdn.jsdelivr.net/gh/jeromeetienne/threex.planets@master/images/plutomap1k.jpg'
    };
    const textures = {
        sun: textureLoader.load(texture_links.sun),
        mercury: textureLoader.load(texture_links.mercury),
        venus: textureLoader.load(texture_links.venus),
        earth: textureLoader.load(texture_links.earth),
        mars: textureLoader.load(texture_links.mars),
        jupiter: textureLoader.load(texture_links.jupiter),
        saturn: textureLoader.load(texture_links.saturn),
        uranus: textureLoader.load(texture_links.uranus),
        neptune: textureLoader.load(texture_links.neptune),
        pluto: textureLoader.load(texture_links.pluto)
    };

    // --- GALAXY BACKGROUND (MILKY WAY BAND) ---
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(75000 * 3);
    const starCol = new Float32Array(75000 * 3);
    const starSizes = new Float32Array(75000);

    for (let i = 0, j = 0; i < 75000; i++, j += 3) {
        let d = 10000 + Math.random() * 30000;
        let u = Math.random(), v = Math.random();
        let th = 2 * Math.PI * u;
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
    const kaptyonMat = new THREE.MeshPhysicalMaterial({ color: 0x886622, metalness: 0.3, roughness: 0.7 });

    function buildSpacecraft(type) {
        const group = new THREE.Group();
        if (type === 'voyager') {
            const bus = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1.3, 10), chromeMat);
            group.add(bus);
            const antenna = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 0.4, 1.8, 64), whiteMat);
            antenna.position.y = 1.4;
            group.add(antenna);
            const rtgBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 6), darkMat);
            rtgBoom.position.set(-3, 0, 0); rtgBoom.rotation.z = Math.PI / 2;
            group.add(rtgBoom);
            const rtg = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.5, 16), new THREE.MeshPhysicalMaterial({ color: 0x443333, metalness: 0.2, roughness: 0.8 }));
            rtg.position.set(-5.5, 0, 0); rtg.rotation.z = Math.PI / 2;
            group.add(rtg);
            const magBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 12), darkMat);
            magBoom.position.set(5, 0, 2); magBoom.rotation.z = Math.PI / 2; magBoom.rotation.y = Math.PI / 6;
            group.add(magBoom);
            const sensor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), chromeMat);
            sensor.position.set(10, 0, 3.5);
            group.add(sensor);
            const record = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.1, 32), goldMat);
            record.position.set(1.4, 0.4, 1.4); record.rotation.set(Math.PI / 4, 0, Math.PI / 4);
            group.add(record);
        } else if (type === 'pioneer') {
            const body = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.6, 6), kaptyonMat);
            group.add(body);
            const dish = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 0.3, 1.4, 64), whiteMat);
            dish.position.y = 1.0;
            group.add(dish);
            const rtg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4), darkMat);
            rtg1.position.set(-2.5, 0, 1); rtg1.rotation.z = Math.PI / 2; rtg1.rotation.y = 0.4;
            group.add(rtg1);
            const rtg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4), darkMat);
            rtg2.position.set(-2.5, 0, -1); rtg2.rotation.z = Math.PI / 2; rtg2.rotation.y = -0.4;
            group.add(rtg2);
            const rtgTip1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 12), new THREE.MeshPhysicalMaterial({ color: 0x553333, metalness: 0.3 }));
            rtgTip1.position.set(-4.5, 0, 1.8); rtgTip1.rotation.z = Math.PI / 2;
            group.add(rtgTip1);
            const rtgTip2 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 12), new THREE.MeshPhysicalMaterial({ color: 0x553333, metalness: 0.3 }));
            rtgTip2.position.set(-4.5, 0, -1.8); rtgTip2.rotation.z = Math.PI / 2;
            group.add(rtgTip2);
            const tablet = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.35), goldMat);
            tablet.position.set(1.2, 0.35, 0);
            group.add(tablet);
        } else if (type === 'newhorizons') {
            const bodyGeo = new THREE.CylinderGeometry(1.0, 2.2, 1.0, 3);
            const body = new THREE.Mesh(bodyGeo, kaptyonMat);
            body.rotation.y = Math.PI / 6;
            group.add(body);
            const dish = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 0.3, 1.2, 64), whiteMat);
            dish.position.y = 1.2;
            group.add(dish);
            const rtgBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 8), darkMat);
            rtgBoom.position.set(-4, 0, 0); rtgBoom.rotation.z = Math.PI / 2;
            group.add(rtgBoom);
            const rtgUnit = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.8, 12), new THREE.MeshPhysicalMaterial({ color: 0x443333, metalness: 0.2 }));
            rtgUnit.position.set(-7.5, 0, 0); rtgUnit.rotation.z = Math.PI / 2;
            group.add(rtgUnit);
            for (let i = 0; i < 3; i++) {
                const box = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.4), chromeMat);
                box.position.set(2.0, -0.2 + i * 0.4, (i - 1) * 0.6);
                group.add(box);
            }
        } else if (type === 'apollo') {
            const sm = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 2.5, 32), whiteMat);
            group.add(sm);
            const cm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.8, 1.2, 32), chromeMat);
            cm.position.y = 1.85;
            group.add(cm);
            const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.1, 0.8, 16), darkMat);
            eng.position.y = -1.65;
            group.add(eng);
            const lmBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 1.5), kaptyonMat);
            lmBase.position.y = 2.85;
            group.add(lmBase);
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
    let cameraShake = 0;

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
        if (isSun) {
            const corona = new THREE.Mesh(new THREE.SphereGeometry(size * 1.25, 64, 64), atmosMat(0xffaa00, 2.0, 0.5));
            g.add(corona);
            g.corona = corona;
        } else {
            const a = new THREE.Mesh(new THREE.SphereGeometry(size * 1.04, 64, 64), atmosMat(color || 0x44aaff, 5.0, 0.05));
            g.add(a);
        }
        if (ring) {
            const rGeo = new THREE.RingGeometry(size * ring.inner, size * ring.outer, 64);
            const rMat = new THREE.MeshStandardMaterial({ color: ring.color, side: THREE.DoubleSide, transparent: true, opacity: ring.opacity || 0.8, roughness: 0.8 });
            const rMesh = new THREE.Mesh(rGeo, rMat);
            rMesh.rotation.x = Math.PI / 2 + 0.3;
            g.add(rMesh);
            g.ring = rMesh;
        }
        scene.add(g);
        bodies.push({ name, x, g, mesh: m, isSun });
    };

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

    let explosions = [];
    let lastPhaseIdx = -1;

    function updateHumanExperienceUI() {
        const toast = document.getElementById('human-toast');
        if (!toast) return;
        const experiences = humanExperience[currentMissionId];
        if (!experiences) return;
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
        if (activeIdx !== lastPhaseIdx) {
            const exp = experiences[activeIdx];
            document.getElementById('toast-phase').innerHTML = `✨ İNSAN DENEYİMİ — ${exp.phase}`;
            document.getElementById('toast-title').textContent = exp.title;
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
            if (newType === 'voyager' && voyager.children.length >= 7) {
                voyager.children[6].visible = m.hasRecord;
            }
            const milestonesTitle = document.getElementById('milestones-title');
            if (milestonesTitle) milestonesTitle.innerText = `Duraklar (${m.name})`;
            const btnContainer = document.getElementById('milestones-container');
            if (btnContainer) {
                btnContainer.innerHTML = '';
                m.milestones.forEach(ms => {
                    const btn = document.createElement('button');
                    btn.className = 'nav-btn';
                    const dateStr = (ms.name === 'Anlık') ? 'now' : new Date(ms.date).toISOString().split('T')[0];
                    btn.setAttribute('onclick', `jumpTo('${dateStr}')`);
                    btn.innerText = ms.name;
                    btnContainer.appendChild(btn);
                });
            }
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
            lastPhaseIdx = -1;
            updateHumanExperienceUI();
            if (isOrbitMode) window.SimAPI.toggleOrbit();
            window.SimAPI.changeMode('CINEMATIC');
        },
        createExplosion: (pos) => {
            window.SimAPI.createCinematicCrash(pos);
        },
        createCinematicCrash: (pos) => {
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
            cameraShake = 1.0;
        }
    };

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

    let currentPlayingSrc = '';

    let triggeredAiLogs = new Set();

    function pushAiLog(msg) {
        const stream = document.getElementById('ai-log-stream');
        if (!stream) return;
        const log = document.createElement('div');
        log.className = 'telemetry-log';
        const d = new Date(simulatedCurrentDateMs);
        log.innerHTML = `<div class="log-time">[${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}]</div>${msg}`;
        stream.appendChild(log);
        stream.scrollTop = stream.scrollHeight;
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const planetDataByIndex = [
        { title: "Güneş", img: "https://upload.wikimedia.org/wikipedia/commons/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg", desc: "Sistemin merkezindeki bu devasa yıldız, tüm hayatın enerji kaynağıdır.\nOrtalama uzaklık: ~150 milyon km (Dünya'ya)\nÇap: 1.392.700 km\nSıcaklık: Yüzey ~5.500°C, Çekirdek ~15 milyon °C\nAtmosfer: Hidrojen (%73), Helyum (%25)\nÖzellik: Toplam sistem kütlesinin %99.8'ini oluşturur.", tua: "Güneş gözlemlerinde optik filtre kullanımı hayati önem taşır. Ülkemizde TÜBİTAK TUG'da güneş gözlemleri yürütülmektedir." },
        { title: "Merkür", img: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Mercury_in_true_color.jpg", desc: "Güneş'e en yakın gezegendir.\nOrtalama uzaklık: ~58 milyon km\nÇap: 4.880 km\nYerçekimi: Dünya’nın %38’i\nAtmosfer: Çok ince (ekzosfer → sodyum, oksijen, hidrojen)\nManyetik alan: Zayıf ama var\nÖzellik: Güneş’e en yakın olmasına rağmen en sıcak gezegen değildir\nNASA görevleri: MESSENGER → yüzeyi ve manyetik alanı inceledi", tua: "Merkür'ün dev demir çekirdeği gezegen kütlesinin %75'ini oluşturur. Ay araştırmalarında bu tip jeolojik yapılar kritik öneme sahiptir." },
        { title: "Venüs", img: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg", desc: "Güneş Sistemi'nin en sıcak gezegenidir.\nOrtalama uzaklık: ~108 milyon km\nÇap: 12.104 km\nYerçekimi: Dünya'nın %91'i\nAtmosfer: %96 karbondioksit, aşırı yoğun sera etkisi\nSıcaklık: Yüzey ~475°C (Kurşunu bile eritebilir)\nÖzellik: Bir günü bir yılından uzundur ve ters yönde döner.", tua: "Venüs'ün atmosferi, sera gazlarının iklim üzerindeki yıkıcı etkisini anlamamız için doğal bir laboratuvar niteliğindedir." },
        { title: "Dünya", img: "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg", desc: "Evimiz, yaşamın bilinen tek barınağı.\nÇap: 12.756 km\nAtmosfer: %78 azot, %21 oksijen\nÖzellik: Yüzeyinin %71'i sıvı su ile kaplıdır. Güçlü bir manyetik alana sahiptir.\nNASA görevleri: Apollo 17, Landsat, Hubble, ISS.", tua: "Milli Uzay Programı kapsamında Dünya gözlem uydularımız (İMECE, GÖKTÜRK) tarımsal analiz ve doğal afet izlemede aktif olarak kullanılmaktadır." },
        { title: "Mars", img: "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg", desc: "Zayıf atmosferli ve soğuk çöl dünyası.\nOrtalama uzaklık: ~228 milyon km\nÇap: 6.792 km\nYerçekimi: Dünya'nın %38'i\nÖzellik: Güneş Sistemi'nin en büyük dağı olan Olympus Mons'a ev sahipliği yapar.\nNASA görevleri: Curiosity, Perseverance, Viking 1.", tua: "Türkiye'nin Ay Görevi için geliştirilen hibrit motor teknolojileri, gelecekteki derin uzay ve Mars görevleri için kritik bir teknolojik kazanımdır." },
        { title: "Jüpiter", img: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg", desc: "Güneş Sistemi'nin en büyük dev gezegeni.\nOrtalama uzaklık: ~778 milyon km\nÇap: 142.984 km\nAtmosfer: Büyük oranda Hidrojen ve Helyum\nÖzellik: 300 yıldır devam eden Büyük Kırmızı Leke fırtınasıyla bilinir. 79 tane uydusu vardır.\nNASA görevleri: Voyager 1-2, Juno, Galileo.", tua: "Jüpiter'in uydularındaki buz altı okyanuslar, TUA'nın gelecekte dahil olabileceği uluslararası astrobiyoloji projelerinin ana odağındadır." },
        { title: "Satürn", img: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg", desc: "Göz alıcı halkalarıyla tanınan gaz devi.\nOrtalama uzaklık: ~1.4 milyar km\nÇap: 116.460 km\nYoğunluk: Sudan düşük (bir okyanusta yüzebilir)\nHalkalar: Milyarlarca buz ve kaya parçası\nÖnemli uydu: Titan (Metan gölleri vardır)\nNASA görevleri: Cassini-Huygens, Voyager 1-2.", tua: "Satürn'ün uydusu Titan, Milli Teknoloji Hamlesi vizyonuyla geliştirilen üst düzey sensör teknolojileri için ideal bir test simülasyonu alanı sunmaktadır." },
        { title: "Uranüs", img: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg", desc: "Ekseni üzerinde yan yatmış buz devi.\nOrtalama uzaklık: ~2.87 milyar km\nÇap: 51.118 km\nSıcaklık: -224°C ile en soğuk atmosfer\nÖzellik: Metan gazı ona masmavi bir renk verir.\nNASA görevleri: Voyager 2 (tek ziyaretçi).", tua: "Buz devlerinin bileşimi, yerli uydu motoru itki sistemlerinde kullanılan plazma fiziği araştırmalarına ışık tutmaktadır." },
        { title: "Neptün", img: "https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg", desc: "Sistemin en dışındaki karanlık ve rüzgarlı buz devi.\nOrtalama uzaklık: ~4.5 milyar km\nÇap: 49.528 km\nRüzgar hızı: Saatte 2.100 km (Süpersonik rüzgarlar)\nÖzellik: Güneş'ten aldığı enerjiden daha fazlasını yayar.\nNASA görevleri: Voyager 2.", tua: "Matematiksel modellerle keşfedilen ilk gezegen olması, uzay bilimlerinde teorik analizin önemini vurgulayan en büyük örneklerdendir." },
        { title: "Plüton", img: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Pluto_in_True_Color_-_High-Res.jpg", desc: "Eski 9. gezegen, şimdiki cüce gezegen.\nOrtalama uzaklık: ~5.9 milyar km\nÇap: 2.377 km (Ay'dan daha küçüktür)\nSıcaklık: ~-230°C\nÖzellik: Yüzeyindeki kalp şeklinde dev buz ovası (Tombaugh Regio) ile ünlüdür.\nNASA görevleri: New Horizons.", tua: "Cüce gezegen araştırmaları, sistem dışından gelen Kuiper Kuşağı objelerinin sistemimiz üzerindeki kütleçekimsel etkilerini anlamamıza yardımcı olmaktadır." }
    ];

    renderer.domElement.addEventListener('click', (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const allMeshes = [];
        bodies.forEach(b => { b.g.traverse(child => { if (child.isMesh) allMeshes.push(child); }); });
        const intersects = raycaster.intersectObjects(allMeshes);
        if (intersects.length > 0) {
            const hitMesh = intersects[0].object;
            const bodyIndex = bodies.findIndex(b => {
                let found = false;
                b.g.traverse(child => { if (child === hitMesh) found = true; });
                return found;
            });
            if (bodyIndex >= 0 && bodyIndex < planetDataByIndex.length) {
                const data = planetDataByIndex[bodyIndex];
                document.getElementById('info-title').innerText = data.title;
                const img = document.getElementById('info-img');
                const noise = document.getElementById('noise-overlay');
                const btn = document.getElementById('ai-restore-btn');
                img.src = data.img;
                img.classList.add('grainy');
                if (noise) noise.classList.add('active');
                if (btn) btn.innerHTML = 'AI RESTORE';
                document.getElementById('info-desc').innerText = data.desc;

                // TUA Info Update
                const tuaPanel = document.getElementById('tua-info');
                const tuaContent = document.getElementById('tua-content');
                if (data.tua && tuaPanel && tuaContent) {
                    tuaContent.innerText = data.tua;
                    tuaPanel.style.display = 'block';
                } else if (tuaPanel) {
                    tuaPanel.style.display = 'none';
                }

                document.getElementById('info').classList.add('active');
            }
        }
    });

    const clock = new THREE.Clock();
    let camSmoothPos = new THREE.Vector3(0, 50, 150);

    function animate() {
        requestAnimationFrame(animate);
        const dt = clock.getDelta();
        const t = clock.getElapsedTime();

        if (currentMode === 'TRAJECTORY' && window.TrajectorySim) window.TrajectorySim.tick(dt);
        if (currentMode === 'GRAVITY' && window.GravityLab) window.GravityLab.tick(dt);

        if (currentMode === 'CINEMATIC' || currentMode === 'CRISIS') {
            if (currentMode === 'CINEMATIC') {
                const TS = 86400000 * 45;
                if (keys['ArrowRight']) simulatedCurrentDateMs += TS * dt;
                else if (keys['ArrowLeft']) simulatedCurrentDateMs -= TS * dt;
                else simulatedCurrentDateMs += 1000 * dt;
                if (simulatedCurrentDateMs < LAUNCH_DATE) simulatedCurrentDateMs = LAUNCH_DATE;

                voyager.position.x = getXFromDate(simulatedCurrentDateMs);
                voyager.position.y = Math.sin(t * 0.4) * 1.8;
                voyager.rotation.y += 0.005;

                if (!isOrbitMode) {
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
                    orbitControls.target.copy(voyager.position);
                    orbitControls.update();
                }
            }

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

            const d = new Date(simulatedCurrentDateMs);
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

        bodies.forEach((b, i) => {
            if (b.mesh) b.mesh.rotation.y += 0.002 + (i * 0.0005);
        });

        composer.render();
    }

    function getXFromDate(ms) {
        if (ms <= milestones[0].date) return milestones[0].x;
        for (let i = 0; i < milestones.length - 1; i++) {
            if (ms >= milestones[i].date && ms <= milestones[i + 1].date) {
                const p = (ms - milestones[i].date) / (milestones[i + 1].date - milestones[i].date);
                let xPos = milestones[i].x + p * (milestones[i + 1].x - milestones[i].x);
                if (!whatIfGA && ms > milestones[1].date) xPos = milestones[1].x + (xPos - milestones[1].x) * 0.6;
                return xPos;
            }
        }
        
        // Extrapolate past the last milestone (Live Movement)
        const lastMS = milestones[milestones.length - 1];
        const prevMS = milestones[milestones.length - 2] || { date: lastMS.date - 86400000, x: lastMS.x - 1 };
        
        const timeDiff = ms - lastMS.date;
        const velocity = (lastMS.x - prevMS.x) / (lastMS.date - prevMS.date);
        
        let extX = lastMS.x + velocity * timeDiff;
        if (!whatIfGA) extX = milestones[1].x + (extX - milestones[1].x) * 0.6;
        return extX;
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