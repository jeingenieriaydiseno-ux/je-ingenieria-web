// Logo 3D giratorio para la cabecera.
// Sustituye la imagen plana cuando WebGL y el modelo cargan; si algo falla, queda la imagen.
(function () {
  const link = document.querySelector('.logo');
  const img = link && link.querySelector('.logo-img');
  if (!link || !img) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileMQ = matchMedia('(max-width:640px)');

  async function init() {
    const THREE = await import('three');
    const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
    const data = await (await fetch('3d/logo-full.json?v=1')).json();

    const holderEl = document.createElement('span');
    holderEl.className = 'logo3d';
    holderEl.setAttribute('aria-hidden', 'true');

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    holderEl.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
    const camera = new THREE.PerspectiveCamera(8, 1, 10, 20000);
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(-400, 600, 900);
    scene.add(key, new THREE.HemisphereLight(0xffffff, 0x8899bb, 0.5));

    function tessellate(c) {
      const pts = [], n = c.length;
      for (let i = 0; i < n; i++) {
        const [x1, y1, b] = c[i], [x2, y2] = c[(i + 1) % n];
        pts.push(new THREE.Vector2(x1, y1));
        if (Math.abs(b) > 1e-4) {
          const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy);
          const off = (d / 2) * (1 - b * b) / (2 * b);
          const cx = (x1 + x2) / 2 + (-dy / d) * off, cy = (y1 + y2) / 2 + (dx / d) * off;
          const r = Math.hypot(x1 - cx, y1 - cy), a1 = Math.atan2(y1 - cy, x1 - cx), th = 4 * Math.atan(b);
          const steps = Math.max(2, Math.ceil(Math.abs(th) / (Math.PI / 40)));
          for (let k = 1; k < steps; k++) {
            const a = a1 + th * k / steps;
            pts.push(new THREE.Vector2(cx + r * Math.cos(a), cy + r * Math.sin(a)));
          }
        }
      }
      return pts;
    }
    const inside = (pt, poly) => {
      let ins = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const a = poly[i], b = poly[j];
        if ((a.y > pt.y) !== (b.y > pt.y) && pt.x < (b.x - a.x) * (pt.y - a.y) / (b.y - a.y) + a.x) ins = !ins;
      }
      return ins;
    };
    const area = p => {
      let s = 0;
      for (let i = 0, j = p.length - 1; i < p.length; j = i++) s += p[j].x * p[i].y - p[i].x * p[j].y;
      return Math.abs(s / 2);
    };

    const matNavy = new THREE.MeshStandardMaterial({ color: 0x011c4c, metalness: 0.45, roughness: 0.32, envMapIntensity: 1.3 });
    const matOrange = new THREE.MeshStandardMaterial({ color: 0xfd4c0c, metalness: 0.25, roughness: 0.3, envMapIntensity: 1.2 });
    const matGrey = new THREE.MeshStandardMaterial({ color: 0xd5d5d5, metalness: 0.2, roughness: 0.4 });
    const logo = new THREE.Group(), holder = new THREE.Group();
    const markGroup = new THREE.Group(), wordGroup = new THREE.Group();
    holder.add(markGroup, wordGroup);
    logo.add(holder);
    scene.add(logo);

    const isOrangeX = cx => (cx > 400 && cx < 700) || (cx > 1300 && cx < 1430);
    const items = data.map(c => {
      const pts = tessellate(c);
      return { pts, area: area(pts), cx: c.reduce((s, v) => s + v[0], 0) / c.length };
    });
    items.forEach((it, i) => {
      it.depth = 0;
      items.forEach((ot, j) => { if (i !== j && ot.area > it.area && inside(it.pts[0], ot.pts)) it.depth++; });
    });
    items.filter(it => it.depth % 2 === 0).forEach(outer => {
      const shape = new THREE.Shape(outer.pts);
      items.filter(h => h.depth === outer.depth + 1 && h.area < outer.area && inside(h.pts[0], outer.pts))
           .forEach(h => shape.holes.push(new THREE.Path(h.pts)));
      const mark = outer.cx < 760;
      const geo = new THREE.ExtrudeGeometry(shape, mark
        ? { depth: 46, bevelEnabled: true, bevelThickness: 4, bevelSize: 3, bevelSegments: 3, curveSegments: 1 }
        : { depth: 26, bevelEnabled: true, bevelThickness: 1.6, bevelSize: 1.2, bevelSegments: 2, curveSegments: 1 });
      const mesh = new THREE.Mesh(geo, isOrangeX(outer.cx) ? matOrange : matNavy);
      if (mark) markGroup.add(mesh); else { mesh.position.z = 10; wordGroup.add(mesh); }
    });
    const sep = new THREE.Mesh(new THREE.BoxGeometry(3, 257, 4), matGrey);
    sep.position.set(752, 197.5, 23);
    wordGroup.add(sep);

    const BOUNDS = { full: { cx: 891, w: 1760 }, mark: { cx: 363.5, w: 700 } };
    const H = 450;               // alto del contenido
    const OVER = 1.16;           // el lienzo es un poco mayor que la imagen para no recortar al girar
    let contentW = BOUNDS.full.w;

    function layout() {
      const mark = mobileMQ.matches;
      const b = mark ? BOUNDS.mark : BOUNDS.full;
      wordGroup.visible = !mark;
      holder.position.set(-b.cx, -225.5, -23);
      contentW = b.w;
      resize();
    }
    function resize() {
      const w = holderEl.clientWidth, h = holderEl.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const dist = Math.max((H * OVER * 1.1 / 2) / t, (contentW * OVER / 2) / (t * camera.aspect));
      camera.position.set(0, 0, dist);
      camera.updateProjectionMatrix();
    }

    // monta el lienzo y oculta la imagen plana (conserva su espacio en la cabecera)
    link.appendChild(holderEl);
    layout();
    new ResizeObserver(resize).observe(img);
    mobileMQ.addEventListener('change', layout);
    link.classList.add('is3d');

    const BASE_YAW = 0.26, BASE_PITCH = 0.15, SPIN = 0.6;
    let yaw = BASE_YAW, last = performance.now();
    function frame(now) {
      const dt = Math.min(0.2, (now - last) / 1000);
      last = now;
      if (!reduceMotion) yaw += SPIN * dt;
      logo.rotation.set(BASE_PITCH, yaw, 0);
      renderer.render(scene, camera);
      if (!document.hidden) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) { last = performance.now(); requestAnimationFrame(frame); }
    });
  }

  const start = () => init().catch(() => { /* se queda la imagen plana */ });
  if (document.readyState === 'complete') start();
  else addEventListener('load', start, { once: true });
})();
