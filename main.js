import * as THREE from 'three';

/* ─── CURSOR ─── */
const c1 = document.getElementById('cur'), c2 = document.getElementById('cur2');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
    mx = e.clientX; 
    my = e.clientY;
    if (c1) c1.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
});

(function rc() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    if (c2) c2.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(rc);
})();

document.querySelectorAll('a, button, .pj, .exp-row, .ld').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('big-cur'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('big-cur'));
});

/* ─── LOADER ─── */
window.addEventListener('load', () => setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('out');
}, 1700));

/* ─── NAV ─── */
window.addEventListener('scroll', () => {
    const nav = document.getElementById('nav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
});

/* ─── REVEAL ─── */
const ro = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('on');
}), { threshold: 0.07 });
document.querySelectorAll('.rv').forEach(el => ro.observe(el));

/* ─── SMOOTH SCROLL ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
}));

/* ═══════════════════════════════════════════════
   🎲 INTERACTIVE 3D RUBIK-STYLE CUBE (Three.js)
   Each face shows a different skill/word.
   Click & drag to rotate!
═══════════════════════════════════════════════ */
(function () {
    const canvas = document.getElementById('cube-canvas');
    if (!canvas) return;

    const W = 420, H = 420;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
    camera.position.set(0, 0, 5.5);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, .4));
    const dl = new THREE.DirectionalLight(0xffffff, .9);
    dl.position.set(5, 8, 5); scene.add(dl);
    const pl = new THREE.PointLight(0xff3d7f, .6, 20);
    pl.position.set(-4, 4, 4); scene.add(pl);
    const pl2 = new THREE.PointLight(0x00e5ff, .3, 20);
    pl2.position.set(4, -4, -4); scene.add(pl2);

    // Create face textures with canvas
    function makeFaceTex(bg, text, textColor = '#f0ece4', sub = '') {
        const c = document.createElement('canvas');
        c.width = 256; c.height = 256;
        const ctx = c.getContext('2d');
        // Background
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 256, 256);
        // Subtle corner accent
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath(); ctx.arc(256, 0, 80, 0, Math.PI * 2); ctx.fill();
        // Border
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 3;
        ctx.strokeRect(6, 6, 244, 244);
        // Main text
        ctx.fillStyle = textColor;
        ctx.font = 'bold 36px "Space Mono",monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const words = text.split('\n');
        const lh = 44;
        const startY = sub ? 116 : 128;
        words.forEach((w, i) => ctx.fillText(w, 128, startY + (i - (words.length - 1) / 2) * lh));
        // Sub text
        if (sub) {
            ctx.font = '500 18px "Space Grotesk",sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.fillText(sub, 128, 210);
        }
        return new THREE.CanvasTexture(c);
    }

    const faces = [
        makeFaceTex('#0f0f0f', 'VRIDHI\nVAZIRANI', '#ff3d7f', 'Data Scientist'),
        makeFaceTex('#1a0a0f', 'PYTHON\nSQL · R', '#ffe566', 'Technical Skills'),
        makeFaceTex('#0a0f1a', 'WOXSEN\nUNIV.', '#00e5ff', 'Hyderabad · India'),
        makeFaceTex('#0f1a0a', 'SPAIN\n& JAPAN', '#f0ece4', 'Global Explorer'),
        makeFaceTex('#1a0f1a', 'AI &\nML', '#ff85a1', 'Machine Learning'),
        makeFaceTex('#0a1a1a', 'FOOTBALL\nCAPTAIN', '#ffe566', '⚽ 2024–Present'),
    ];

    const geo = new THREE.BoxGeometry(2.4, 2.4, 2.4);
    const mats = faces.map(t => new THREE.MeshStandardMaterial({ map: t, roughness: .35, metalness: .1 }));
    const cube = new THREE.Mesh(geo, mats);
    cube.rotation.x = .45; cube.rotation.y = .6;
    scene.add(cube);

    // Edge glow lines
    const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.42, 2.42, 2.42));
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xff3d7f, transparent: true, opacity: .25 });
    cube.add(new THREE.LineSegments(edgeGeo, edgeMat));

    // Drag rotation
    let isDrag = false, prevX = 0, prevY = 0, velX = 0, velY = 0;
    canvas.addEventListener('mousedown', e => { isDrag = true; prevX = e.clientX; prevY = e.clientY; velX = 0; velY = 0; });
    window.addEventListener('mousemove', e => {
        if (!isDrag) return;
        velX = (e.clientX - prevX) * .012;
        velY = (e.clientY - prevY) * .012;
        cube.rotation.y += velX;
        cube.rotation.x += velY;
        prevX = e.clientX; prevY = e.clientY;
    });
    window.addEventListener('mouseup', () => { isDrag = false; });

    // Touch support
    canvas.addEventListener('touchstart', e => { isDrag = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY; });
    canvas.addEventListener('touchmove', e => {
        if (!isDrag) return;
        velX = (e.touches[0].clientX - prevX) * .012;
        velY = (e.touches[0].clientY - prevY) * .012;
        cube.rotation.y += velX; cube.rotation.x += velY;
        prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
    });
    canvas.addEventListener('touchend', () => { isDrag = false; });

    (function tick() {
        requestAnimationFrame(tick);
        if (!isDrag) {
            cube.rotation.y += velX; cube.rotation.x += velY;
            velX *= 0.92; velY *= 0.92;
            cube.rotation.y += 0.004; // slow auto spin
        }
        renderer.render(scene, camera);
    })();
})();

/* ─── BACKGROUND 3D PARTICLES ─── */
(function() {
    const canvas = document.getElementById('bg-canvas');
    if(!canvas) return;

    const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const count = 300;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for(let i=0; i<count*3; i++) {
        pos[i] = (Math.random() - 0.5) * 12;
        vel[i] = (Math.random() - 0.5) * 0.005;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
        size: 0.015,
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
        requestAnimationFrame(animate);
        const positions = geo.attributes.position.array;
        for(let i=0; i<count*3; i+=3) {
            positions[i] += vel[i];
            positions[i+1] += vel[i+1];
            positions[i+2] += vel[i+2];

            if(Math.abs(positions[i]) > 6) vel[i] *= -1;
            if(Math.abs(positions[i+1]) > 6) vel[i+1] *= -1;
            if(Math.abs(positions[i+2]) > 6) vel[i+2] *= -1;
        }
        geo.attributes.position.needsUpdate = true;
        points.rotation.y += 0.0005;
        renderer.render(scene, camera);
    }
    animate();
})();
