(function () {
  const canvas = document.getElementById("bg-motion");
  const glow = document.getElementById("mouse-glow");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const RED = "208, 18, 45";
  let lines = [];
  let parts = [];
  let frame = 0;

  function chip(c, size) {
    const s = size * 0.9;
    c.beginPath();
    c.roundRect(-s / 2, -s / 2, s, s, 4);
    c.stroke();
    c.beginPath();
    c.roundRect(-s / 4, -s / 4, s / 2, s / 2, 2);
    c.stroke();
    for (let i = 0; i < 5; i++) {
      const p = -s / 2 + (s / 6) * (i + 1);
      c.beginPath();
      c.moveTo(p, -s / 2);
      c.lineTo(p, -s / 2 - 7);
      c.moveTo(p, s / 2);
      c.lineTo(p, s / 2 + 7);
      c.moveTo(-s / 2, p);
      c.lineTo(-s / 2 - 7, p);
      c.moveTo(s / 2, p);
      c.lineTo(s / 2 + 7, p);
      c.stroke();
    }
  }

  function fan(c, size) {
    c.beginPath();
    c.arc(0, 0, size * 0.46, 0, Math.PI * 2);
    c.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(Math.cos(a) * size * 0.42, Math.sin(a) * size * 0.42);
      c.stroke();
    }
    c.beginPath();
    c.arc(0, 0, 4, 0, Math.PI * 2);
    c.fill();
  }

  function stick(c, size) {
    const w = size * 0.5;
    const h = size * 2;
    c.beginPath();
    c.roundRect(-w / 2, -h / 2, w, h, 3);
    c.stroke();
    for (let i = 0; i < 4; i++) {
      const y = -h / 2 + h * 0.18 + i * h * 0.18;
      c.beginPath();
      c.roundRect(-w / 2 + 4, y, w - 8, h * 0.1, 1);
      c.stroke();
    }
  }

  const drawPart = [chip, fan, stick];

  function layout() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gap = 320;
    const cols = Math.ceil(canvas.width / gap);
    const rows = Math.ceil(canvas.height / gap);
    lines = [];
    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        const x = col * gap;
        const y = row * gap;
        if (col < cols && Math.random() > 0.6) lines.push(makeLine(x, y, x + gap, y));
        if (row < rows && Math.random() > 0.6) lines.push(makeLine(x, y, x, y + gap));
      }
    }
  }

  function makeLine(x1, y1, x2, y2) {
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, `rgba(${RED}, 0.05)`);
    gradient.addColorStop(0.5, `rgba(${RED}, 0.16)`);
    gradient.addColorStop(1, `rgba(${RED}, 0.05)`);
    const pulses = Math.random() > 0.5
      ? [{ t: Math.random(), speed: 0.002 + Math.random() * 0.003, size: 6 + Math.random() * 10 }]
      : [];
    return { x1, y1, x2, y2, gradient, pulses };
  }

  function seedParts() {
    parts = Array.from({ length: 10 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 32 + Math.random() * 30,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.004,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      opacity: 0.16 + Math.random() * 0.12,
      type: Math.floor(Math.random() * drawPart.length),
      phase: Math.random() * Math.PI * 2,
      pulse: 0.008 + Math.random() * 0.012,
    }));
  }

  function tick() {
    frame++;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    lines.forEach((line) => {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.strokeStyle = line.gradient;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(line.x1, line.y1, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${RED}, 0.28)`;
      ctx.fill();

      line.pulses.forEach((pulse) => {
        pulse.t += pulse.speed;
        if (pulse.t > 1) pulse.t = 0;
        const x = line.x1 + (line.x2 - line.x1) * pulse.t;
        const y = line.y1 + (line.y2 - line.y1) * pulse.t;
        ctx.beginPath();
        ctx.arc(x, y, pulse.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${RED}, 0.12)`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, pulse.size * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${RED}, 0.45)`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fill();
      });

      if (frame % 240 === 0 && Math.random() > 0.7) {
        line.pulses.push({ t: 0, speed: 0.002 + Math.random() * 0.003, size: 6 + Math.random() * 10 });
      }
      if (line.pulses.length > 2) line.pulses.shift();
    });

    parts.forEach((part) => {
      part.x += part.vx;
      part.y += part.vy;
      part.rotation += part.spin;
      part.phase += part.pulse;
      if (part.x < -80) part.x = w + 80;
      if (part.x > w + 80) part.x = -80;
      if (part.y < -80) part.y = h + 80;
      if (part.y > h + 80) part.y = -80;
      const glowAmt = 0.5 + 0.5 * Math.sin(part.phase);
      const alpha = part.opacity * (0.8 + 0.2 * glowAmt);
      ctx.save();
      ctx.translate(part.x, part.y);
      ctx.rotate(part.rotation);
      ctx.strokeStyle = `rgba(${RED}, ${alpha})`;
      ctx.fillStyle = `rgba(${RED}, ${alpha * 0.18})`;
      ctx.lineWidth = 1.2;
      drawPart[part.type](ctx, part.size);
      ctx.restore();
    });

    requestAnimationFrame(tick);
  }

  layout();
  seedParts();
  window.addEventListener("resize", () => {
    layout();
    seedParts();
  });
  tick();

  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  let following = false;
  document.addEventListener("mousemove", (event) => {
    tx = event.clientX;
    ty = event.clientY;
    if (glow) glow.style.opacity = "1";
    if (!following) {
      following = true;
      requestAnimationFrame(follow);
    }
  });
  document.addEventListener("mouseleave", () => {
    if (glow) glow.style.opacity = "0";
  });
  function follow() {
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    if (glow) glow.style.transform = `translate(${cx - 210}px, ${cy - 210}px)`;
    requestAnimationFrame(follow);
  }
})();
