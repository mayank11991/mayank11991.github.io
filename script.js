(() => {
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  let stars = [];
  let shooting = null;
  let w = 0;
  let h = 0;

  const resize = () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(220, Math.floor((w * h) / 6500));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      a: Math.random() * 0.6 + 0.2,
      tw: Math.random() * 0.02 + 0.005,
      ph: Math.random() * Math.PI * 2
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.ph += s.tw;
      const alpha = s.a * (0.5 + 0.5 * Math.sin(s.ph));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    }

    if (shooting) {
      const p = shooting;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      const grad = ctx.createLinearGradient(p.x, p.y, p.x - p.tx, p.y - p.ty);
      grad.addColorStop(0, `rgba(255,255,255,${Math.max(0, p.life)})`);
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.tx, p.y - p.ty);
      ctx.stroke();
      if (p.life <= 0) shooting = null;
    }

    requestAnimationFrame(draw);
  };

  const maybeShoot = () => {
    if (shooting) return;
    if (Math.random() < 0.004) {
      shooting = {
        x: Math.random() * w * 0.8,
        y: Math.random() * h * 0.4,
        vx: (Math.random() * 4 + 6) * (Math.random() < 0.5 ? 1 : -1),
        vy: Math.random() * 3 + 4,
        tx: 130,
        ty: 130,
        life: 1
      };
    }
  };

  const loop = () => {
    maybeShoot();
    requestAnimationFrame(loop);
  };

  resize();
  draw();
  loop();
  window.addEventListener("resize", resize);

  const burger = document.querySelector(".burger");
  const menu = document.querySelector(".menu");
  burger.addEventListener("click", () => menu.classList.toggle("open"));

  const sections = [...document.querySelectorAll("section[id]")];
  const numLinks = [...document.querySelectorAll(".num")];
  const menuLinks = [...document.querySelectorAll(".menu-link")];
  const sectionIds = sections.map((s) => s.id);

  const onScroll = () => {
    const pos = window.scrollY + window.innerHeight * 0.4;
    let current = sectionIds[0];
    for (const s of sections) {
      if (pos >= s.offsetTop) current = s.id;
    }
    numLinks.forEach((l) => l.classList.toggle("active", l.dataset.sec === current));
    menuLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${current}`));
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();