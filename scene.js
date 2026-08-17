/* ============================================================
   CLASP & CO — hero medallion (Three.js)
   A rotating brass/bronze medallion: laurel ring + sunburst rays
   + a faceted bag-silhouette centerpiece — "mythic fashion crest"
   rather than a literal product render. Draggable, auto-rotates
   gently, falls back to nothing if Three.js fails to load.
   ============================================================ */
window.ClaspScene = (() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasThree = typeof THREE !== "undefined";
  let renderer, scene, camera, group, raf;

  function init(){
    if(!hasThree) return;
    const canvas = document.getElementById("hero-3d");
    if(!canvas) return;
    const container = canvas.parentElement;
    let w = container.clientWidth || 380, h = container.clientHeight || 380;

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    scene.add(new THREE.AmbientLight(0x3a2f22, 1.3));
    const warmLight = new THREE.PointLight(0xffcf8a, 2.2, 22);
    warmLight.position.set(4, 4, 5);
    scene.add(warmLight);
    const coolLight = new THREE.PointLight(0x8fae7a, 1.4, 22);
    coolLight.position.set(-4, -3, 4);
    scene.add(coolLight);

    group = new THREE.Group();

    const brassMat = new THREE.MeshStandardMaterial({ color: 0xc1552c, metalness: 0.85, roughness: 0.3, emissive: 0x3a190c, emissiveIntensity: 0.3 });
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x8c3d1d, metalness: 0.7, roughness: 0.4 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xe07a45, metalness: 0.9, roughness: 0.2, emissive: 0x3a190c, emissiveIntensity: 0.4 });

    // outer laurel-ring
    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.1, 20, 100), brassMat);
    group.add(outerRing);

    // inner ring
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.045, 16, 100), bronzeMat);
    group.add(innerRing);

    // sunburst rays around the ring
    const rayCount = 16;
    for(let i = 0; i < rayCount; i++){
      const angle = (i / rayCount) * Math.PI * 2;
      const ray = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.4, 6), goldMat);
      ray.position.set(Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, 0);
      ray.lookAt(0, 0, 0);
      ray.rotateX(Math.PI / 2);
      group.add(ray);
    }

    // faceted bag-silhouette centerpiece (stylized, not literal)
    const bagBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.15, 0.5), goldMat);
    bagBody.geometry = new THREE.IcosahedronGeometry(0.9, 0); // faceted "mythic" gem-cut instead of a flat box
    bagBody.material = new THREE.MeshStandardMaterial({ color: 0xe07a45, metalness: 0.4, roughness: 0.15, emissive: 0x8c3d1d, emissiveIntensity: 0.45, flatShading: true });
    group.add(bagBody);

    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.045, 12, 40, Math.PI), bronzeMat);
    handle.position.y = 0.75;
    group.add(handle);

    scene.add(group);

    function resize(){
      w = container.clientWidth; h = container.clientHeight;
      if(!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    resize();
    let ro = null;
    if("ResizeObserver" in window){ ro = new ResizeObserver(resize); ro.observe(container); }
    else window.addEventListener("resize", resize);

    let targetRotY = 0, targetRotX = 0, dragging = false, lastX = 0, lastY = 0;
    function onMove(clientX, clientY){
      const rect = container.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 1.0;
      targetRotX = -y * 0.5;
    }
    container.style.cursor = "grab";
    container.addEventListener("pointermove", (e) => {
      onMove(e.clientX, e.clientY);
      if(dragging){
        targetRotY += (e.clientX - lastX) * 0.01;
        targetRotX -= (e.clientY - lastY) * 0.01;
        lastX = e.clientX; lastY = e.clientY;
      }
    });
    container.addEventListener("pointerdown", (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; container.style.cursor = "grabbing"; });
    window.addEventListener("pointerup", () => { dragging = false; container.style.cursor = "grab"; });

    let clock = 0;
    function tick(){
      clock += 0.01;
      group.rotation.y += (targetRotY - group.rotation.y) * 0.045 + (dragging ? 0 : 0.0032);
      group.rotation.x += (targetRotX - group.rotation.x) * 0.045;
      bagBody.rotation.y += 0.008;
      group.position.y = Math.sin(clock * 0.6) * 0.05;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }
    if(reduceMotion) renderer.render(scene, camera);
    else tick();
  }

  function dispose(){
    if(raf) cancelAnimationFrame(raf);
    if(renderer) renderer.dispose();
    renderer = scene = camera = group = null;
  }

  return { init, dispose };
})();
