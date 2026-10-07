(() => {
  const canvas = document.querySelector("#osmos-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const massLabel = document.querySelector("#hud-mass");
  const statusLabel = document.querySelector("#hud-status");
  const resetButton = document.querySelector("#reset-game");
  const ru = document.documentElement.lang === "ru";
  const W = canvas.width, H = canvas.height;
  const pointer = { x: W / 2, y: H / 2 };
  const player = { x: W / 2, y: H / 2, vx: 0, vy: 0, mass: 10, hue: 192 };
  let particles = [], gameOver = false, last = performance.now();
  const radius = mass => Math.sqrt(mass) * 3.2;
  const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));

  function reset() {
    Object.assign(player, { x: W / 2, y: H / 2, vx: 0, vy: 0, mass: 10 });
    Object.assign(pointer, { x: W / 2, y: H / 2 });
    gameOver = false;
    particles = [];
    for (let i = 0; i < 28; i++) {
      const mass = 2 + Math.random() * 17;
      let x, y;
      do { x = 16 + Math.random() * (W - 32); y = 16 + Math.random() * (H - 32); }
      while (Math.hypot(x - player.x, y - player.y) < 95);
      particles.push({ x, y, vx: (Math.random() - .5) * .06, vy: (Math.random() - .5) * .06, mass, hue: 140 + Math.random() * 120 });
    }
    updateHud();
  }
  function updateHud() {
    massLabel.textContent = ru ? `Масса: ${player.mass.toFixed(1).replace(".", ",")}` : `Mass: ${player.mass.toFixed(1)}`;
    statusLabel.textContent = gameOver ? (ru ? "Вселенная схлопнулась" : "Universe collapsed") : (ru ? "Орбита стабильна" : "Stable orbit");
  }
  function update(dt) {
    // Our imaginary rocket uses pointer gravity. NASA may call this cheating.
    player.vx = (player.vx + (pointer.x - player.x) * .000004 * dt) * .993;
    player.vy = (player.vy + (pointer.y - player.y) * .000004 * dt) * .993;
    player.x = clamp(player.x + player.vx * dt, radius(player.mass), W - radius(player.mass));
    player.y = clamp(player.y + player.vy * dt, radius(player.mass), H - radius(player.mass));
    for (const p of particles) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      const r = radius(p.mass);
      if (p.x < r || p.x > W - r) p.vx *= -1;
      if (p.y < r || p.y > H - r) p.vy *= -1;
      p.x = clamp(p.x, r, W-r); p.y = clamp(p.y, r, H-r);
    }
    particles = particles.filter(p => {
      if (Math.hypot(p.x-player.x,p.y-player.y) >= radius(p.mass)+radius(player.mass)) return true;
      if (player.mass >= p.mass * 1.05) { player.mass += p.mass * .24; return false; }
      if (p.mass > player.mass * 1.15) gameOver = true;
      return true;
    });
    if (particles.length < 8) {
      // Respawn by replaying the whole level: a tiny universe, not an endless tax form.
      const score = player.mass;
      reset();
      player.mass = score;
    }
    updateHud();
  }
  function drawOrb(p, glow = false) {
    const r = radius(p.mass);
    const gradient = ctx.createRadialGradient(p.x-r*.3,p.y-r*.3,1,p.x,p.y,r+2);
    gradient.addColorStop(0,`hsla(${p.hue},95%,78%,.98)`);
    gradient.addColorStop(1,`hsla(${p.hue},88%,42%,.55)`);
    ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.fill();
    if (glow) { ctx.strokeStyle = "rgba(122,225,255,.8)"; ctx.lineWidth = 1.5; ctx.stroke(); }
  }
  function draw() {
    ctx.clearRect(0,0,W,H);
    for (const p of particles) drawOrb(p);
    drawOrb(player,true);
    if (gameOver) {
      ctx.fillStyle = "rgba(0,0,0,.7)"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle = "#fff"; ctx.textAlign = "center";
      ctx.font = "700 28px PlexMono, monospace";
      ctx.fillText(ru ? "Симуляция завершена" : "Simulation collapsed",W/2,H/2-8);
      ctx.font = "16px PlexMono, monospace";
      ctx.fillText(ru ? "Нажмите R или кнопку перезапуска" : "Press R or restart",W/2,H/2+26);
    }
  }
  function loop(now) {
    const dt = Math.min(now-last,32); last = now;
    if (!document.hidden) {
      if (!gameOver) update(dt);
      draw();
    }
    requestAnimationFrame(loop);
  }
  function setPointer(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = clamp((event.clientX-rect.left)/rect.width*W,0,W);
    pointer.y = clamp((event.clientY-rect.top)/rect.height*H,0,H);
  }
  function eject() {
    if (gameOver || player.mass < 4) return;
    const a = Math.atan2(pointer.y-player.y,pointer.x-player.x);
    player.mass -= 1.1;
    player.vx -= Math.cos(a)*.12; player.vy -= Math.sin(a)*.12;
    particles.push({ x:player.x+Math.cos(a)*(radius(player.mass)+8),y:player.y+Math.sin(a)*(radius(player.mass)+8),vx:Math.cos(a)*.3,vy:Math.sin(a)*.3,mass:1.1,hue:200 });
  }
  canvas.addEventListener("pointermove",setPointer,{passive:true});
  canvas.addEventListener("pointerdown",event=>{setPointer(event);eject();});
  resetButton.addEventListener("click",reset);
  document.addEventListener("keydown",event=>{if(event.key.toLowerCase()==="r" && !/input|textarea/i.test(document.activeElement?.tagName||""))reset();});
  // The universe is a little less dramatic when you can reset it.
  reset(); requestAnimationFrame(loop);
})();

