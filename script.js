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
  const searchBtn = document.querySelector("#searchBtn");
  const searchPanel = document.querySelector("#searchPanel");
  const searchInput = document.querySelector("#searchInput");
  const searchClose = document.querySelector("#searchClose");
  const searchResults = document.querySelector("#searchResults");
  burger.addEventListener("click", () => menu.classList.toggle("open"));

  // Search panel slider
  const GAMES_LIST = [
    { key: "sudoku", name: "Sudoku", hint: "Fill each row, column and 2×2 box with 1–4.", icon: "🧩", color: "#22d3ee" },
    { key: "memory", name: "Card Memory", hint: "Flip two cards at a time and match all pairs.", icon: "🃏", color: "#34d399" },
    { key: "maze", name: "Maze Runner", hint: "Reach the flag! Use arrow keys, WASD or swipe.", icon: "🌀", color: "#3b82f6" },
    { key: "wordfinder", name: "Word Finder", hint: "Find the hidden words — drag across letters.", icon: "🔤", color: "#a855f7" },
    { key: "math", name: "Math Challenge", hint: "Answer as many as you can in 45 seconds!", icon: "🧮", color: "#f59e0b" },
    { key: "hanoi", name: "Tower of Hanoi", hint: "Move all disks to the right peg. Big disks can't sit on small ones.", icon: "🗼", color: "#ef4444" },
    { key: "puzzlepets", name: "Puzzle Pets", hint: "Slide the pets to restore the picture.", icon: "🐾", color: "#f472b6" },
    { key: "block", name: "Block Puzzle", hint: "Pick a piece, place it on the grid, clear rows and columns!", icon: "🧱", color: "#f97316" },
  ];

  function openSearchPanel() {
    searchPanel.classList.add("open");
    searchPanel.setAttribute("aria-hidden", "false");
    searchInput.focus();
    renderSearchResults("");
    document.body.style.overflow = "hidden";
  }

  function closeSearchPanel() {
    searchPanel.classList.remove("open");
    searchPanel.setAttribute("aria-hidden", "true");
    searchInput.value = "";
    renderSearchResults("");
    document.body.style.overflow = "";
  }

  function renderSearchResults(query) {
    const q = query.toLowerCase().trim();
    const filtered = q
      ? GAMES_LIST.filter(g => g.name.toLowerCase().includes(q) || g.key.includes(q))
      : GAMES_LIST;
    searchResults.innerHTML = filtered.length
      ? filtered.map(g => `
        <button class="search-result-item" data-game="${g.key}" style="--icon-color: ${g.color};">
          <span class="search-result-icon" style="background: linear-gradient(135deg, ${g.color}, ${adjustColor(g.color, -30)})">
            ${g.icon}
          </span>
          <div class="search-result-info">
            <div class="search-result-name">${g.name}</div>
            <div class="search-result-hint">${g.hint}</div>
          </div>
        </button>
      `).join("")
      : '<div class="search-empty">No games found</div>';

    // Attach click handlers
    searchResults.querySelectorAll(".search-result-item").forEach(btn => {
      btn.addEventListener("click", () => {
        openGame(btn.dataset.game);
        closeSearchPanel();
      });
    });
  }

  // Helper to darken color
  function adjustColor(hex, amount) {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  searchBtn.addEventListener("click", openSearchPanel);
  searchClose.addEventListener("click", closeSearchPanel);
  searchPanel.addEventListener("click", (e) => {
    if (e.target === searchPanel) closeSearchPanel();
  });
  searchInput.addEventListener("input", (e) => renderSearchResults(e.target.value));
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSearchPanel();
  });
  searchClose.addEventListener("click", closeSearchPanel);

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

  /* ────────────────────────────────────────────────────────────────
     GAME DEMO MODALS
     ──────────────────────────────────────────────────────────────── */
  const modalEl = document.getElementById("game-modal");
  const gCanvas = document.getElementById("game-canvas");
  const gCtx = gCanvas.getContext("2d");
  const titleEl = document.getElementById("game-modal-title");
  const hintEl = document.getElementById("game-modal-hint");
  const restartBtn = document.getElementById("game-modal-restart");

  let modalOpen = false;
  let currentKey = null;
  let current = null;
  let GS = null;
  let SZ = 0;
  let lastT = performance.now();

  /* ── Drawing helpers ─────────────────────── */
  const rr = (x, y, w, h, r) => {
    const rad = Math.min(r, w / 2, h / 2);
    gCtx.beginPath();
    gCtx.moveTo(x + rad, y);
    gCtx.arcTo(x + w, y, x + w, y + h, rad);
    gCtx.arcTo(x + w, y + h, x, y + h, rad);
    gCtx.arcTo(x, y + h, x, y, rad);
    gCtx.arcTo(x, y, x + w, y, rad);
    gCtx.closePath();
  };

  const text = (s, x, y, size, color = "#e7ecf5", align = "center", weight = 600) => {
    gCtx.font = `${weight} ${size}px "Inter", -apple-system, "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    gCtx.fillStyle = color;
    gCtx.textAlign = align;
    gCtx.textBaseline = "middle";
    gCtx.fillText(s, x, y);
  };

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const gpos = (n, padScale, gapScale = 0.012) => {
    const pad = SZ * padScale;
    const gap = SZ * gapScale;
    const cell = (SZ - pad * 2 - (n - 1) * gap) / n;
    return { cell, gap, x0: pad, y0: pad, end: pad + cell * n + (n - 1) * gap };
  };

  const cellAt = (x, y, m, n) => {
    if (x < m.x0 || y < m.y0) return null;
    const r = Math.floor((y - m.y0) / (m.cell + m.gap));
    const c = Math.floor((x - m.x0) / (m.cell + m.gap));
    if (r >= n || c >= n) return null;
    return [r, c];
  };

  const drawResult = (headline, stars, sub) => {
    gCtx.fillStyle = "rgba(5,8,14,0.8)";
    rr(SZ * 0.06, SZ * 0.28, SZ * 0.88, SZ * 0.44, 18);
    gCtx.fill();
    gCtx.strokeStyle = "rgba(34,211,238,0.35)";
    gCtx.lineWidth = 1.5;
    rr(SZ * 0.06, SZ * 0.28, SZ * 0.88, SZ * 0.44, 18);
    gCtx.stroke();
    text(headline, SZ / 2, SZ * 0.38, SZ * 0.05, "#22d3ee");
    text("⭐".repeat(stars), SZ / 2, SZ * 0.48, SZ * 0.055, "#f59e0b");
    text(sub, SZ / 2, SZ * 0.57, SZ * 0.03, "#9aa7bd");
    text("Press Restart to play again", SZ / 2, SZ * 0.64, SZ * 0.024, "#5b6b85");
  };

  const drawMsg = (m, size) => {
    if (!m) return;
    m.t -= 1 / 60;
    if (m.t <= 0) return;
    text(m.s, SZ / 2, SZ * 0.2, size || SZ * 0.04, m.c || "#ef4444");
  };

  /* ────────────────────────────────────────────
     SUDOKU (4×4)
     ──────────────────────────────────────────── */
  const SU_SOL = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]];

  const suCount = (b, limit) => {
    let count = 0;
    const findEmpty = () => {
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (!b[r][c]) return [r, c];
      return null;
    };
    const valid = (r, c, v) => {
      for (let k = 0; k < 4; k++) if (b[r][k] === v || b[k][c] === v) return false;
      const br = Math.floor(r / 2) * 2, bc = Math.floor(c / 2) * 2;
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) if (b[br + i][bc + j] === v) return false;
      return true;
    };
    const rec = () => {
      if (count >= limit) return;
      const e = findEmpty();
      if (!e) { count++; return; }
      for (let d = 1; d <= 4; d++) {
        if (valid(e[0], e[1], d)) {
          b[e[0]][e[1]] = d;
          rec();
          b[e[0]][e[1]] = 0;
          if (count >= limit) return;
        }
      }
    };
    rec();
    return count;
  };

  const initSudoku = () => {
    const puzzle = SU_SOL.map((r) => r.slice());
    const cells = shuffle([...Array(16).keys()]);
    for (const i of cells) {
      const r = i >> 2, c = i & 3;
      const v = puzzle[r][c];
      puzzle[r][c] = 0;
      if (suCount(puzzle.map((x) => x.slice()), 2) !== 1) puzzle[r][c] = v;
    }
    const gs = SZ * 0.62;
    const cg = SZ * 0.01;
    const cell = (gs - cg * 3) / 4;
    const bw = SZ * 0.1, bh = SZ * 0.12, bgap = SZ * 0.025;
    const totalH = gs + SZ * 0.05 + bh;
    const x0 = (SZ - gs) / 2;
    const y0 = (SZ - totalH) / 2;
    GS = {
      sol: SU_SOL, board: puzzle.map((r) => r.slice()),
      given: puzzle.map((r) => r.map((v) => v !== 0)),
      sel: null, moves: 0, errors: 0, win: false,
      gm: { cell, gap: cg, x0, y0, end: y0 + cell * 4 + cg * 3 },
      padX: (SZ - (bw * 5 + bgap * 4)) / 2,
      padY: y0 + gs + SZ * 0.05,
      bw, bh, bgap
    };
    return {
      render: suRender,
      down: suDown
    };
  };

  const suDown = (x, y) => {
    const s = GS;
    if (s.win) return;
    const g = s.gm;
    const cell = cellAt(x, y, g, 4);
    if (cell) { s.sel = cell; return; }
    if (y >= s.padY && y <= s.padY + s.bh && x >= s.padX && x <= s.padX + s.bw * 5 + s.bgap * 4) {
      const i = clamp(Math.floor((x - s.padX) / (s.bw + s.bgap)), 0, 4);
      if (!s.sel) return;
      const [r, c] = s.sel;
      if (s.given[r][c]) return;
      const v = i < 4 ? i + 1 : 0;
      s.board[r][c] = v;
      s.moves++;
      if (v !== 0 && v !== s.sol[r][c]) s.errors++;
      let done = true;
      for (let R = 0; R < 4; R++) for (let C = 0; C < 4; C++) if (s.board[R][C] !== s.sol[R][C]) done = false;
      if (done) {
        s.win = true;
        s.stars = s.errors === 0 ? 3 : s.errors <= 3 ? 2 : 1;
      }
    }
  };

  const suRender = () => {
    if (GS.win) {
      drawGrid4(GS);
      drawResult("Puzzle Solved!", GS.stars, `Moves: ${GS.moves} · Mistakes: ${GS.errors}`);
      return;
    }
    drawGrid4(GS);
  };

  const drawGrid4 = (s) => {
    const g = s.gm;
    gCtx.fillStyle = "#0f1420";
    rr(g.x0 - 10, g.y0 - 10, g.cell * 4 + g.gap * 3 + 20, g.cell * 4 + g.gap * 3 + 20, 12);
    gCtx.fill();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const x = g.x0 + c * (g.cell + g.gap);
        const y = g.y0 + r * (g.cell + g.gap);
        const val = s.board[r][c];
        const given = s.given[r][c];
        gCtx.fillStyle = given ? "#1c2740" : "#131a29";
        rr(x, y, g.cell, g.cell, 8);
        gCtx.fill();
        if (s.sel && s.sel[0] === r && s.sel[1] === c) {
          gCtx.strokeStyle = "#22d3ee";
          gCtx.lineWidth = 3;
          rr(x, y, g.cell, g.cell, 8);
          gCtx.stroke();
        }
        if (val) {
          const wrong = !given && val !== s.sol[r][c];
          text(String(val), x + g.cell / 2, y + g.cell / 2, g.cell * 0.55, wrong ? "#ef4444" : given ? "#9aa7bd" : "#e7ecf5");
        }
      }
    }

    const labels = ["1", "2", "3", "4", "✕"];
    for (let i = 0; i < 5; i++) {
      const x = s.padX + i * (s.bw + s.bgap), y = s.padY;
      gCtx.fillStyle = "#182136";
      rr(x, y, s.bw, s.bh, 10);
      gCtx.fill();
      gCtx.strokeStyle = "rgba(255,255,255,0.09)";
      gCtx.lineWidth = 1;
      rr(x, y, s.bw, s.bh, 10);
      gCtx.stroke();
      if (s.sel && !s.given[s.sel[0]][s.sel[1]] && s.board[s.sel[0]][s.sel[1]] === (i < 4 ? i + 1 : 0)) {
        gCtx.strokeStyle = "#22d3ee";
        gCtx.lineWidth = 2;
        rr(x, y, s.bw, s.bh, 10);
        gCtx.stroke();
      }
      text(labels[i], x + s.bw / 2, y + s.bh / 2, s.bh * 0.45, "#e7ecf5");
    }
  };

  /* ────────────────────────────────────────────
     WORD FINDER
     ──────────────────────────────────────────── */
  const WF_WORDS = ["MANTU", "GAME", "PLAY", "STAR", "FUN", "PUZZLE", "BRAIN", "MIND", "QUIZ", "LEVEL", "TILE", "WILD"];
  const WF_DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];

  const wfGen = () => {
    for (let attempt = 0; attempt < 60; attempt++) {
      const board = Array.from({ length: 8 }, () => Array(8).fill(""));
      const chosen = [];
      const pool = shuffle(WF_WORDS.slice());
      for (const w of pool) {
        let placed = false;
        for (let t = 0; t < 80 && !placed; t++) {
          const d = WF_DIRS[Math.floor(Math.random() * 4)];
          const r0 = Math.floor(Math.random() * 8), c0 = Math.floor(Math.random() * 8);
          const rEnd = r0 + d[0] * (w.length - 1), cEnd = c0 + d[1] * (w.length - 1);
          if (rEnd < 0 || rEnd >= 8 || cEnd < 0 || cEnd >= 8) continue;
          let ok = true;
          for (let i = 0; i < w.length; i++) {
            const r = r0 + d[0] * i, c = c0 + d[1] * i;
            if (board[r][c] && board[r][c] !== w[i]) { ok = false; break; }
          }
          if (!ok) continue;
          for (let i = 0; i < w.length; i++) board[r0 + d[0] * i][c0 + d[1] * i] = w[i];
          placed = true;
        }
        if (placed) chosen.push(w);
        if (chosen.length === 4) break;
      }
      if (chosen.length === 4) {
        for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (!board[r][c]) board[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        return { board, words: chosen };
      }
    }
    return null;
  };

  const initWordFinder = () => {
    const gen = wfGen() || { board: Array.from({ length: 8 }, () => Array(8).fill("A")), words: ["MANTU", "GAME", "PLAY", "STAR"] };
    GS = {
      board: gen.board, words: gen.words.map((w) => ({ w, found: false })),
      start: null, cur: null, down: false, flash: null,
      t0: performance.now(), win: false, foundCount: 0,
      gm: gpos(8, 0.1)
    };
    return {
      render: wfRender,
      down: (x, y) => {
        if (GS.win) return;
        const cell = cellAt(x, y, GS.gm, 8);
        if (!cell) return;
        GS.start = cell;
        GS.cur = cell;
        GS.down = true;
      },
      move: (x, y) => {
        if (!GS.down || GS.win) return;
        GS.cur = cellAt(x, y, GS.gm, 8) || GS.cur;
      },
      up: () => {
        if (!GS.down) return;
        GS.down = false;
        const s = GS;
        const line = wfLine(s.start, s.cur);
        s.start = null;
        s.cur = null;
        if (!line) return;
        let word = line.map(([r, c]) => s.board[r][c]).join("");
        const rev = [...word].reverse().join("");
        for (const entry of s.words) {
          if (entry.found) continue;
          if (entry.w === word || entry.w === rev) {
            entry.found = true;
            entry.cells = line;
            s.foundCount++;
            s.flash = { t: 1, s: `✓ ${entry.w}`, c: "#34d399" };
            if (s.foundCount === s.words.length) {
              const secs = (performance.now() - s.t0) / 1000;
              s.win = true;
              s.stars = secs <= 30 ? 3 : secs <= 60 ? 2 : 1;
              s.sub = `Time: ${secs.toFixed(1)}s`;
            }
            return;
          }
        }
        s.flash = { t: 0.8, s: "Not a word!", c: "#ef4444" };
      }
    };
  };

  const wfLine = (a, b) => {
    if (!a || !b) return null;
    const dr = b[0] - a[0], dc = b[1] - a[1];
    const g = Math.abs(gcd(dr, dc));
    if (g === 0) return null;
    const sr = dr / g, sc = dc / g;
    if (Math.abs(sr) > 1 || Math.abs(sc) > 1) return null;
    const cells = [];
    for (let i = 0; i <= g; i++) cells.push([a[0] + sr * i, a[1] + sc * i]);
    return cells;
  };

  const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));

  const wfRender = () => {
    const s = GS;
    const m = s.gm;
    if (!m) return;
    if (s.win) {
      wfDrawGrid(s);
      drawResult("All Words Found!", s.stars, s.sub);
      return;
    }
    wfDrawGrid(s);
    const fs = SZ * 0.028;
    let cx = SZ * 0.05;
    text("FIND:", cx, SZ * 0.955, fs, "#22d3ee", "left");
    cx += gCtx.measureText("FIND:").width + SZ * 0.035;
    for (const e of s.words) {
      const str = (e.found ? "✓ " : "") + e.w;
      text(str, cx, SZ * 0.955, fs, e.found ? "#34d399" : "#9aa7bd", "left");
      cx += gCtx.measureText(str).width + SZ * 0.02;
    }
    drawMsg(s.flash);
  };

  const wfDrawGrid = (s) => {
    const m = s.gm;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const x = m.x0 + c * (m.cell + m.gap);
        const y = m.y0 + r * (m.cell + m.gap);
        let bg = "#131a29";
        for (const e of s.words) {
          if (e.found && e.cells.some(([cr, cc]) => cr === r && cc === c)) bg = "rgba(52,211,153,0.25)";
        }
        if (s.down && s.cur && s.start && wfLine(s.start, s.cur)?.some(([cr, cc]) => cr === r && cc === c)) bg = "rgba(34,211,238,0.28)";
        gCtx.fillStyle = bg;
        rr(x, y, m.cell, m.cell, 7);
        gCtx.fill();
        text(s.board[r][c], x + m.cell / 2, y + m.cell / 2, m.cell * 0.5, "#e7ecf5", "center", 700);
      }
    }
  };

  /* ────────────────────────────────────────────
     MATH CHALLENGE
     ──────────────────────────────────────────── */
  const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

  const mqGen = () => {
    const type = Math.floor(Math.random() * 4);
    let q, ans;
    if (type === 0) {
      const a = rand(2, 20), b = rand(2, 20);
      q = `${a} + ${b}`;
      ans = a + b;
    } else if (type === 1) {
      const a = rand(5, 30), b = rand(1, a - 1);
      q = `${a} − ${b}`;
      ans = a - b;
    } else if (type === 2) {
      const a = rand(2, 9), b = rand(2, 9);
      q = `${a} × ${b}`;
      ans = a * b;
    } else {
      const b = rand(2, 9), ans2 = rand(2, 9);
      q = `${b * ans2} ÷ ${b}`;
      ans = ans2;
    }
    const opts = new Set([ans]);
    while (opts.size < 4) {
      const d = ans + rand(-3, 3);
      if (d > 0) opts.add(d);
    }
    return { q, ans, opts: shuffle([...opts]) };
  };

  const initMath = () => {
    GS = {
      score: 0, time: 45, q: mqGen(), flash: null, over: false,
      shake: 0, correct: 0
    };
    return {
      tick: (dt) => {
        const s = GS;
        if (s.over) return;
        s.time -= dt;
        if (s.time <= 0) {
          s.time = 0;
          s.over = true;
          s.stars = s.score >= 150 ? 3 : s.score >= 80 ? 2 : 1;
        }
      },
      render: mqRender,
      down: mqDown
    };
  };

  const mqDown = (x, y) => {
    const s = GS;
    if (s.over) return;
    const bw = SZ * 0.4, bh = SZ * 0.1, gap = SZ * 0.04;
    const x0 = (SZ - bw) / 2, y0 = SZ * 0.52;
    for (let i = 0; i < 4; i++) {
      const bx = x0 + (i % 2) * (bw + gap);
      const by = y0 + Math.floor(i / 2) * (bh + gap);
      if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) {
        if (s.q.opts[i] === s.q.ans) {
          s.score += 10;
          s.correct++;
          s.flash = { t: 0.8, s: "+10", c: "#34d399" };
          s.q = mqGen();
        } else {
          s.shake = 0.4;
          s.flash = { t: 0.8, s: "✗", c: "#ef4444" };
        }
        return;
      }
    }
  };

  const mqRender = () => {
    const s = GS;
    if (s.over) {
      drawResult("Time's Up!", s.stars, `Score: ${s.score} · Correct: ${s.correct}`);
      return;
    }
    const tw = SZ * 0.7;
    gCtx.fillStyle = "rgba(255,255,255,0.08)";
    rr((SZ - tw) / 2, SZ * 0.05, tw, SZ * 0.022, 10);
    gCtx.fill();
    gCtx.fillStyle = s.time > 10 ? "#22d3ee" : "#ef4444";
    rr((SZ - tw) / 2, SZ * 0.05, tw * (s.time / 45), SZ * 0.022, 10);
    gCtx.fill();
    text("SCORE " + s.score, SZ / 2, SZ * 0.105, SZ * 0.032, "#9aa7bd");

    const off = s.shake > 0 ? Math.sin(s.shake * 30) * 6 : 0;
    text(s.q.q, SZ / 2 + off, SZ * 0.36, SZ * 0.09, "#e7ecf5", "center", 900);
    text("= ?", SZ / 2, SZ * 0.46, SZ * 0.055, "#22d3ee");

    const bw = SZ * 0.4, bh = SZ * 0.1, gap = SZ * 0.04;
    const x0 = (SZ - bw) / 2, y0 = SZ * 0.52;
    for (let i = 0; i < 4; i++) {
      const bx = x0 + (i % 2) * (bw + gap);
      const by = y0 + Math.floor(i / 2) * (bh + gap);
      gCtx.fillStyle = "#182136";
      rr(bx, by, bw, bh, 12);
      gCtx.fill();
      gCtx.strokeStyle = "rgba(255,255,255,0.09)";
      gCtx.lineWidth = 1;
      rr(bx, by, bw, bh, 12);
      gCtx.stroke();
      text(String(s.q.opts[i]), bx + bw / 2, by + bh / 2, SZ * 0.04, "#e7ecf5", "center", 800);
    }
    drawMsg(s.flash, SZ * 0.05);
  };

  /* ────────────────────────────────────────────
     TOWER OF HANOI
     ──────────────────────────────────────────── */
  const initHanoi = () => {
    GS = {
      pegs: [[3, 2, 1, 0], [], []],
      sel: null, moves: 0, win: false, msg: null,
      px: [SZ * 0.22, SZ * 0.5, SZ * 0.78],
      baseY: SZ * 0.72
    };
    return {
      render: hnRender,
      down: hnDown
    };
  };

  const hnDown = (x, y) => {
    const s = GS;
    if (s.win) return;
    let peg = -1;
    for (let i = 0; i < 3; i++) if (Math.abs(x - s.px[i]) < SZ * 0.1) peg = i;
    if (peg < 0) return;
    const stack = s.pegs[peg];
    if (s.sel === null) {
      if (stack.length) s.sel = peg;
      return;
    }
    if (s.sel === peg) { s.sel = null; return; }
    const from = s.pegs[s.sel];
    if (!stack.length || stack[stack.length - 1] > from[from.length - 1]) {
      stack.push(from.pop());
      s.moves++;
      s.sel = null;
      if (s.pegs[2].length === 4) {
        s.win = true;
        s.stars = s.moves <= 15 ? 3 : s.moves <= 22 ? 2 : 1;
      }
    } else {
      s.msg = { t: 1, s: "Bigger disk can't go on smaller!", c: "#ef4444" };
      s.sel = null;
    }
  };

  const hnRender = () => {
    const s = GS;
    if (s.win) {
      hnDraw(s);
      drawResult("Tower Complete!", s.stars, `Moves: ${s.moves} (minimum 15)`);
      return;
    }
    hnDraw(s);
    text("MOVES " + s.moves, SZ / 2, SZ * 0.06, SZ * 0.032, "#9aa7bd");
    drawMsg(s.msg);
  };

  const hnDraw = (s) => {
    const baseY = s.baseY;
    const dh = SZ * 0.05;
    gCtx.strokeStyle = "rgba(255,255,255,0.2)";
    gCtx.lineWidth = SZ * 0.005;
    gCtx.beginPath();
    gCtx.moveTo(SZ * 0.08, baseY);
    gCtx.lineTo(SZ * 0.92, baseY);
    gCtx.stroke();
    const colors = ["#f59e0b", "#34d399", "#22d3ee", "#a855f7"];
    for (let p = 0; p < 3; p++) {
      const x = s.px[p];
      gCtx.fillStyle = "#182136";
      rr(x - SZ * 0.011, baseY - SZ * 0.46, SZ * 0.022, SZ * 0.46, 4);
      gCtx.fill();
      if (s.sel === p) {
        gCtx.strokeStyle = "#22d3ee";
        gCtx.lineWidth = 2.5;
        rr(x - SZ * 0.02, baseY - SZ * 0.5, SZ * 0.04, SZ * 0.5, 4);
        gCtx.stroke();
      }
      const stack = s.pegs[p];
      for (let i = 0; i < stack.length; i++) {
        const d = stack[i];
        const dw = (d + 1) * SZ * 0.07;
        const dy = baseY - (i + 1) * dh;
        gCtx.fillStyle = colors[d];
        rr(x - dw / 2, dy, dw, dh * 0.92, 6);
        gCtx.fill();
      }
    }
  };

  /* ────────────────────────────────────────────
     CARD MEMORY
     ──────────────────────────────────────────── */
  const MEM_EMOJI = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];

  const initMemory = () => {
    if (GS && GS.timer) clearTimeout(GS.timer);
    const cards = shuffle([...MEM_EMOJI, ...MEM_EMOJI]);
    GS = {
      cards, up: Array(16).fill(false), matched: Array(16).fill(false),
      open: [], moves: 0, lock: false, win: false, timer: null,
      gm: gpos(4, 0.08)
    };
    return {
      render: mmRender,
      down: mmDown
    };
  };

  const mmDown = (x, y) => {
    const s = GS;
    if (s.win || s.lock) return;
    const cell = cellAt(x, y, s.gm, 4);
    if (!cell) return;
    const i = cell[0] * 4 + cell[1];
    if (s.up[i] || s.matched[i]) return;
    s.up[i] = true;
    s.open.push(i);
    if (s.open.length === 2) {
      s.moves++;
      s.lock = true;
      const [a, b] = s.open;
      if (s.cards[a] === s.cards[b]) {
        s.matched[a] = s.matched[b] = true;
        s.open = [];
        s.lock = false;
        if (s.matched.every(Boolean)) {
          s.win = true;
          s.stars = s.moves <= 10 ? 3 : s.moves <= 14 ? 2 : 1;
        }
      } else {
        s.timer = setTimeout(() => {
          if (GS !== s) return;
          s.up[a] = s.up[b] = false;
          s.open = [];
          s.lock = false;
        }, 750);
      }
    }
  };

  const mmRender = () => {
    const s = GS;
    if (s.win) {
      mmDraw(s);
      drawResult("All Matched!", s.stars, `Moves: ${s.moves}`);
      return;
    }
    mmDraw(s);
    text("MOVES " + s.moves, SZ / 2, SZ * 0.055, SZ * 0.032, "#9aa7bd");
  };

  const mmDraw = (s) => {
    const m = s.gm;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const i = r * 4 + c;
        const x = m.x0 + c * (m.cell + m.gap);
        const y = m.y0 + r * (m.cell + m.gap);
        const face = s.up[i] || s.matched[i];
        gCtx.fillStyle = face ? "#1c2740" : "#182136";
        rr(x, y, m.cell, m.cell, 10);
        gCtx.fill();
        if (s.matched[i]) {
          gCtx.strokeStyle = "#34d399";
          gCtx.lineWidth = 2;
          rr(x, y, m.cell, m.cell, 10);
          gCtx.stroke();
        }
        if (face) {
          text(s.cards[i], x + m.cell / 2, y + m.cell / 2, m.cell * 0.5);
        } else {
          text("?", x + m.cell / 2, y + m.cell / 2, m.cell * 0.42, "#4b5b78", "center", 800);
        }
      }
    }
  };

  /* ────────────────────────────────────────────
     PUZZLE PETS (3×3 sliding)
     ──────────────────────────────────────────── */
  const PETS = ["🦁", "🐯", "🐨", "🐷", "🐸", "🐵", "🐮", "🐥", ""];

  const initPuzzlePets = () => {
    const tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    let e = 8;
    for (let i = 0; i < 300; i++) {
      const r = Math.floor(e / 3), c = e % 3;
      const nb = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([rr, cc]) => rr >= 0 && rr < 3 && cc >= 0 && cc < 3);
      const [rr, cc] = nb[Math.floor(Math.random() * nb.length)];
      const idx = rr * 3 + cc;
      [tiles[e], tiles[idx]] = [tiles[idx], tiles[e]];
      e = idx;
    }
    GS = { tiles, empty: e, moves: 0, win: false, bounce: null, gm: gpos(3, 0.12) };
    return {
      render: ppRender,
      down: ppDown
    };
  };

  const ppDown = (x, y) => {
    const s = GS;
    if (s.win) return;
    const cell = cellAt(x, y, s.gm, 3);
    if (!cell) return;
    const idx = cell[0] * 3 + cell[1];
    const er = Math.floor(s.empty / 3), ec = s.empty % 3;
    if (Math.abs(cell[0] - er) + Math.abs(cell[1] - ec) !== 1) return;
    [s.tiles[s.empty], s.tiles[idx]] = [s.tiles[idx], s.tiles[s.empty]];
    s.empty = idx;
    s.moves++;
    s.bounce = { idx, t: 0.25 };
    if (s.tiles.every((v, i) => v === i)) {
      s.win = true;
      s.stars = s.moves <= 30 ? 3 : s.moves <= 50 ? 2 : 1;
    }
  };

  const ppRender = () => {
    const s = GS;
    if (s.win) {
      ppDraw(s);
      drawResult("Picture Restored!", s.stars, `Moves: ${s.moves}`);
      return;
    }
    ppDraw(s);
    text("MOVES " + s.moves, SZ / 2, SZ * 0.055, SZ * 0.032, "#9aa7bd");
  };

  const ppDraw = (s) => {
    const m = s.gm;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const i = r * 3 + c;
        const x = m.x0 + c * (m.cell + m.gap);
        const y = m.y0 + r * (m.cell + m.gap);
        if (s.tiles[i] === 8) {
          gCtx.fillStyle = "#0f1420";
          rr(x, y, m.cell, m.cell, 12);
          gCtx.fill();
          // Draw paw print in empty slot
          gCtx.fillStyle = "rgba(34, 211, 238, 0.15)";
          gCtx.beginPath();
          gCtx.arc(x + m.cell/2, y + m.cell/2, m.cell * 0.25, 0, Math.PI * 2);
          gCtx.fill();
          continue;
        }
        // Tile background with gradient
        const petType = s.tiles[i];
        const colors = [
          ["#ff6b6b", "#ee5a24"], // lion - red/orange
          ["#ffa502", "#ff6348"], // tiger - orange
          ["#7bed9f", "#2ed573"], // koala - green
          ["#ff9ff3", "#f368e0"], // pig - pink
          ["#26de81", "#20bf6b"], // frog - green
          ["#a55eea", "#8854d0"], // monkey - purple
          ["#feca57", "#ff9f43"], // cow - yellow
          ["#00d2d3", "#54a0ff"], // chick - cyan
        ][petType] || ["#70a1ff", "#4834d4"];
        
        const grad = gCtx.createLinearGradient(x, y, x + m.cell, y + m.cell);
        grad.addColorStop(0, colors[0]);
        grad.addColorStop(1, colors[1]);
        gCtx.fillStyle = grad;
        rr(x + 2, y + 2, m.cell - 4, m.cell - 4, 10);
        gCtx.fill();
        
        // Inner glow
        gCtx.strokeStyle = "rgba(255,255,255,0.3)";
        gCtx.lineWidth = 2;
        gCtx.stroke();
        
        let scale = 1;
        if (s.bounce && s.bounce.idx === i) scale = 1 + s.bounce.t * 0.6;
        // Draw pet emoji larger and centered
        text(PETS[s.tiles[i]], x + m.cell / 2, y + m.cell / 2, m.cell * 0.55 * scale);
      }
    }
    // Draw moves counter
    gCtx.fillStyle = "rgba(255,255,255,0.7)";
    gCtx.font = `600 ${SZ * 0.035}px "Inter", sans-serif`;
    gCtx.textAlign = "right";
    gCtx.fillText("Moves: " + s.moves, SZ - SZ * 0.05, SZ * 0.055);
  };

  /* ────────────────────────────────────────────
     BLOCK PUZZLE (1010-style)
     ──────────────────────────────────────────── */
  const SHAPES = [
    [[0, 0]],
    [[0, 0], [0, 1]],
    [[0, 0], [1, 0]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [0, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 0], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [2, 0], [2, 1]],
    [[0, 0], [1, 0], [2, 0], [1, 1]],
    [[0, 0], [1, 0], [1, 1], [2, 1]]
  ];
  const BLK_COLORS = ["#22d3ee", "#a855f7", "#f59e0b", "#34d399", "#f472b6", "#3b82f6", "#ef4444"];

  const blkNewTray = () => Array.from({ length: 3 }, () => ({
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    color: BLK_COLORS[Math.floor(Math.random() * BLK_COLORS.length)]
  }));

  const blkFits = (grid, shape, r, c) => {
    for (const [dr, dc] of shape) {
      const rr2 = r + dr, cc = c + dc;
      if (rr2 < 0 || rr2 >= 8 || cc < 0 || cc >= 8 || grid[rr2][cc]) return false;
    }
    return true;
  };

  const blkAnyFits = (grid, tray) => {
    for (const p of tray) {
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (blkFits(grid, p.shape, r, c)) return true;
    }
    return false;
  };

  const initBlock = () => {
    const gap = SZ * 0.008;
    const cell = (SZ * 0.78 - 7 * gap) / 8;
    const x0 = (SZ - cell * 8 - 7 * gap) / 2;
    GS = {
      grid: Array.from({ length: 8 }, () => Array(8).fill(0)),
      tray: blkNewTray(), sel: null, hover: null, round: 0,
      score: 0, lines: 0, over: false, flash: null,
      trayX: [], trayY: 0, pc: SZ * 0.045,
      gm: { cell, gap, x0, y0: SZ * 0.07, end: SZ * 0.07 + cell * 8 + 7 * gap }
    };
    return {
      render: blkRender,
      down: blkDown,
      move: (x, y) => {
        if (GS.over) return;
        GS.hover = cellAt(x, y, GS.gm, 8);
      }
    };
  };

  const blkDown = (x, y) => {
    const s = GS;
    if (s.over) return;
    const m = s.gm;
    if (y > m.end + SZ * 0.03) {
      for (let i = 0; i < 3; i++) {
        const bx = s.trayX[i], by = s.trayY;
        const piece = s.tray[i];
        const rows = Math.max(...piece.shape.map(([r]) => r)) + 1;
        const cols = Math.max(...piece.shape.map(([, c]) => c)) + 1;
        const pw = cols * s.pc, ph = rows * s.pc;
        if (x >= bx - pw / 2 - 6 && x <= bx + pw / 2 + 6 && y >= by - ph / 2 - 6 && y <= by + ph / 2 + 6) {
          s.sel = s.sel === i ? null : i;
          return;
        }
      }
      return;
    }
    const cell = cellAt(x, y, m, 8);
    if (!cell) return;
    if (s.sel === null) return;
    const piece = s.tray[s.sel];
    if (!blkFits(s.grid, piece.shape, cell[0], cell[1])) {
      s.flash = { t: 0.6, s: "Can't place there!", c: "#ef4444" };
      return;
    }
    for (const [dr, dc] of piece.shape) s.grid[cell[0] + dr][cell[1] + dc] = piece.color;
    s.tray.splice(s.sel, 1);
    s.sel = null;
    s.round++;
    let cleared = 0;
    for (let r = 0; r < 8; r++) if (s.grid[r].every(Boolean)) { for (let c = 0; c < 8; c++) s.grid[r][c] = 0; cleared++; }
    for (let c = 0; c < 8; c++) {
      let full = true;
      for (let r = 0; r < 8; r++) if (!s.grid[r][c]) full = false;
      if (full) { for (let r = 0; r < 8; r++) s.grid[r][c] = 0; cleared++; }
    }
    if (cleared) {
      s.lines += cleared;
      s.score += cleared * 10;
      s.flash = { t: 0.8, s: `+${cleared * 10} (${cleared} line${cleared > 1 ? "s" : ""})`, c: "#34d399" };
    }
    if (s.round === 3) {
      s.tray = s.tray.concat(blkNewTray());
      s.round = 0;
    }
    if (!blkAnyFits(s.grid, s.tray)) {
      s.over = true;
      s.stars = s.score >= 200 ? 3 : s.score >= 100 ? 2 : 1;
    }
  };

  const blkRender = () => {
    const s = GS;
    if (s.over) {
      blkDraw(s);
      drawResult("Game Over", s.stars, `Score: ${s.score} · Lines: ${s.lines}`);
      return;
    }
    blkDraw(s);
    text("SCORE " + s.score, SZ / 2 - SZ * 0.18, SZ * 0.045, SZ * 0.028, "#9aa7bd", "left");
    text("LINES " + s.lines, SZ / 2 + SZ * 0.18, SZ * 0.045, SZ * 0.028, "#9aa7bd", "right");
    drawMsg(s.flash);
  };

  const blkDraw = (s) => {
    const m = s.gm;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const x = m.x0 + c * (m.cell + m.gap);
        const y = m.y0 + r * (m.cell + m.gap);
        gCtx.fillStyle = s.grid[r][c] || "#131a29";
        rr(x, y, m.cell, m.cell, 5);
        gCtx.fill();
        if (s.grid[r][c]) {
          gCtx.fillStyle = "rgba(255,255,255,0.12)";
          rr(x, y, m.cell, m.cell * 0.45, 5);
          gCtx.fill();
        }
      }
    }
    if (s.sel !== null && s.hover) {
      const piece = s.tray[s.sel];
      let ok = blkFits(s.grid, piece.shape, s.hover[0], s.hover[1]);
      for (const [dr, dc] of piece.shape) {
        const r = s.hover[0] + dr, c = s.hover[1] + dc;
        if (r < 0 || r >= 8 || c < 0 || c >= 8) continue;
        const x = m.x0 + c * (m.cell + m.gap);
        const y = m.y0 + r * (m.cell + m.gap);
        gCtx.fillStyle = ok ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)";
        rr(x, y, m.cell, m.cell, 5);
        gCtx.fill();
      }
    }
    const pc = s.pc = SZ * 0.045;
    for (let i = 0; i < 3; i++) {
      const bx = s.trayX[i] = SZ * (0.18 + i * 0.32);
      const by = s.trayY = SZ * 0.93;
      const piece = s.tray[i];
      if (!piece) continue;
      const rows = Math.max(...piece.shape.map(([r]) => r)) + 1;
      const cols = Math.max(...piece.shape.map(([, c]) => c)) + 1;
      const ox = bx - (cols * pc) / 2, oy = by - (rows * pc) / 2;
      gCtx.fillStyle = "rgba(255,255,255,0.03)";
      rr(ox - 8, oy - 8, cols * pc + 16, rows * pc + 16, 10);
      gCtx.fill();
      if (s.sel === i) {
        gCtx.strokeStyle = "#22d3ee";
        gCtx.lineWidth = 2;
        rr(ox - 8, oy - 8, cols * pc + 16, rows * pc + 16, 10);
        gCtx.stroke();
      }
      for (const [dr, dc] of piece.shape) {
        gCtx.fillStyle = piece.color;
        rr(ox + dc * pc + 1, oy + dr * pc + 1, pc - 2, pc - 2, 4);
        gCtx.fill();
      }
    }
  };

  /* ────────────────────────────────────────────
     MAZE RUNNER
     ──────────────────────────────────────────── */
  const mzGen = (n) => {
    const m = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => ({ t: true, r: true, b: true, l: true, vis: false })));
    const stack = [[0, 0]];
    m[0][0].vis = true;
    const opp = { t: "b", b: "t", l: "r", r: "l" };
    while (stack.length) {
      const [r, c] = stack[stack.length - 1];
      const nb = [];
      const dirs = [["t", -1, 0], ["r", 0, 1], ["b", 1, 0], ["l", 0, -1]];
      for (const [d, dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n && !m[nr][nc].vis) nb.push([d, nr, nc]);
      }
      if (!nb.length) { stack.pop(); continue; }
      const [d, nr, nc] = nb[Math.floor(Math.random() * nb.length)];
      m[r][c][d] = false;
      m[nr][nc][opp[d]] = false;
      m[nr][nc].vis = true;
      stack.push([nr, nc]);
    }
    return m;
  };

  const initMaze = () => {
    GS = {
      maze: mzGen(9), N: 9, pr: 0, pc: 0, steps: 0, win: false,
      msg: null, anchor: null, t0: performance.now()
    };
    return {
      render: mzRender,
      down: (x, y) => {
        const s = GS;
        if (s.win) return;
        const d = mzDpad(x, y);
        if (d) { mzTryMove(d[0], d[1]); return; }
        s.anchor = { x, y };
      },
      move: (x, y) => {
        const s = GS;
        if (s.win || !s.anchor) return;
        const dx = x - s.anchor.x, dy = y - s.anchor.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) > SZ * 0.05) {
          if (Math.abs(dx) > Math.abs(dy)) mzTryMove(0, dx > 0 ? 1 : -1);
          else mzTryMove(dy > 0 ? 1 : -1, 0);
          s.anchor = { x, y };
        }
      },
      key: (k) => {
        const map = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
        const d = map[k] || map[k.toLowerCase()] || map[k.toUpperCase()];
        if (d) mzTryMove(d[0], d[1]);
      }
    };
  };

  const mzTryMove = (dr, dc) => {
    const s = GS;
    if (s.win) return;
    const wall = dr === -1 ? "t" : dr === 1 ? "b" : dc === -1 ? "l" : "r";
    if (s.maze[s.pr][s.pc][wall]) { s.msg = { t: 0.5, s: "Wall!", c: "#ef4444" }; return; }
    s.pr += dr;
    s.pc += dc;
    s.steps++;
    if (s.pr === s.N - 1 && s.pc === s.N - 1) {
      s.win = true;
      s.stars = s.steps <= 35 ? 3 : s.steps <= 70 ? 2 : 1;
      s.sub = `Steps: ${s.steps}`;
    }
  };

  const mzDpad = (x, y) => {
    const cx = SZ * 0.13, cy = SZ * 0.86, bs = SZ * 0.075, g2 = SZ * 0.02;
    const btns = [[0, -1, cx, cy - bs - g2], [0, 1, cx, cy + bs + g2], [-1, 0, cx - bs - g2, cy], [1, 0, cx + bs + g2, cy]];
    for (const [dr, dc, bx, by] of btns) {
      if (Math.abs(x - bx) < bs && Math.abs(y - by) < bs) return [dr, dc];
    }
    return null;
  };

  const mzRender = () => {
    const s = GS;
    const n = s.N;
    const gs = SZ * 0.62;
    const cell = gs / n;
    const x0 = (SZ - gs) / 2, y0 = (SZ - gs) / 2;
    if (s.win) {
      mzDraw(s, x0, y0, cell);
      drawResult("You Escaped!", s.stars, s.sub);
      return;
    }
    mzDraw(s, x0, y0, cell);
    text("STEPS " + s.steps, SZ / 2, SZ * 0.055, SZ * 0.032, "#9aa7bd");
    drawMsg(s.msg);
  };

  const mzDraw = (s, x0, y0, cell) => {
    for (let r = 0; r < s.N; r++) {
      for (let c = 0; c < s.N; c++) {
        const cx = x0 + c * cell, cy = y0 + r * cell;
        gCtx.strokeStyle = "#4b5b78";
        gCtx.lineWidth = Math.max(1.5, cell * 0.05);
        gCtx.beginPath();
        const m = s.maze[r][c];
        if (m.t) { gCtx.moveTo(cx, cy); gCtx.lineTo(cx + cell, cy); }
        if (m.r) { gCtx.moveTo(cx + cell, cy); gCtx.lineTo(cx + cell, cy + cell); }
        if (m.b) { gCtx.moveTo(cx + cell, cy + cell); gCtx.lineTo(cx, cy + cell); }
        if (m.l) { gCtx.moveTo(cx, cy + cell); gCtx.lineTo(cx, cy); }
        gCtx.stroke();
      }
    }
    text("🚩", x0 + cell * (s.N - 1) + cell / 2, y0 + cell * (s.N - 1) + cell / 2, cell * 0.6);
    text("🐹", x0 + s.pc * cell + cell / 2, y0 + s.pr * cell + cell / 2, cell * 0.72);
  };

  /* ────────────────────────────────────────────
     ANIMAL CRUSH (match-3)
     ──────────────────────────────────────────── */
  const CRUSH_ANIMALS = ["🦁", "🐼", "🐸", "🐵", "🐷", "🐰"];

  const crushMatches = (grid) => {
    const hit = new Set();
    const add = (r, c) => hit.add(r * 8 + c);
    for (let r = 0; r < 8; r++) {
      let run = 1;
      for (let c = 1; c < 8; c++) {
        if (grid[r][c] === grid[r][c - 1]) run++;
        else {
          if (run >= 3) for (let k = 0; k < run; k++) add(r, c - 1 - k);
          run = 1;
        }
      }
      if (run >= 3) for (let k = 0; k < run; k++) add(r, 7 - k);
    }
    for (let c = 0; c < 8; c++) {
      let run = 1;
      for (let r = 1; r < 8; r++) {
        if (grid[r][c] === grid[r - 1][c]) run++;
        else {
          if (run >= 3) for (let k = 0; k < run; k++) add(r - 1 - k, c);
          run = 1;
        }
      }
      if (run >= 3) for (let k = 0; k < run; k++) add(7 - k, c);
    }
    return [...hit].map((i) => [i >> 3, i & 7]);
  };

  const initAnimalCrush = () => {
    let grid;
    do {
      grid = Array.from({ length: 8 }, () =>
        Array.from({ length: 8 }, () => CRUSH_ANIMALS[Math.floor(Math.random() * 6)]));
    } while (crushMatches(grid).length);
    GS = {
      grid, sel: null, score: 0, time: 45, target: 300,
      pop: new Map(), over: false, flash: null, anchor: null, msg: null,
      gm: gpos(8, 0.09)
    };
    return {
      tick: (dt) => {
        const s = GS;
        if (s.over) return;
        s.time -= dt;
        for (const [k, v] of s.pop) {
          const nv = v - dt;
          if (nv <= 0) s.pop.delete(k);
          else s.pop.set(k, nv);
        }
        if (s.time <= 0) {
          s.time = 0;
          s.over = true;
          s.stars = s.score >= 300 ? 3 : s.score >= 200 ? 2 : 1;
        }
      },
      render: crRender,
      down: (x, y) => {
        const s = GS;
        if (s.over) return;
        const cell = cellAt(x, y, s.gm, 8);
        if (!cell) return;
        if (s.sel && Math.abs(s.sel[0] - cell[0]) + Math.abs(s.sel[1] - cell[1]) === 1) {
          crSwap(s.sel, cell);
          s.sel = null;
          return;
        }
        s.sel = cell;
        s.anchor = { x, y };
      },
      move: (x, y) => {
        const s = GS;
        if (s.over || !s.anchor) return;
        const dx = x - s.anchor.x, dy = y - s.anchor.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) > s.gm.cell * 0.55) {
          const dr = Math.abs(dx) > Math.abs(dy) ? 0 : dy > 0 ? 1 : -1;
          const dc = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : -1) : 0;
          const cur = cellAt(x, y, s.gm, 8);
          if (cur && s.sel && Math.abs(s.sel[0] - cur[0]) + Math.abs(s.sel[1] - cur[1]) === 1) {
            crSwap(s.sel, cur);
          }
          s.sel = null;
          s.anchor = null;
        }
      }
    };
  };

  const crSwap = (a, b) => {
    const s = GS;
    const [r1, c1] = a, [r2, c2] = b;
    [s.grid[r1][c1], s.grid[r2][c2]] = [s.grid[r2][c2], s.grid[r1][c1]];
    let matched = crushMatches(s.grid);
    if (!matched.length) {
      [s.grid[r1][c1], s.grid[r2][c2]] = [s.grid[r2][c2], s.grid[r1][c1]];
      s.msg = { t: 0.7, s: "No match!", c: "#ef4444" };
      return;
    }
    while (matched.length) {
      for (const [r, c] of matched) s.pop.set(r * 8 + c, 0.3);
      s.score += matched.length * 10;
      for (let c = 0; c < 8; c++) {
        const gone = new Set(matched.filter(([, cc]) => cc === c).map(([rr]) => rr));
        let write = 7;
        for (let r = 7; r >= 0; r--) {
          if (!gone.has(r)) { s.grid[write][c] = s.grid[r][c]; write--; }
        }
        for (let r = write; r >= 0; r--) s.grid[r][c] = CRUSH_ANIMALS[Math.floor(Math.random() * 6)];
      }
      matched = crushMatches(s.grid);
    }
    if (s.score >= s.target) {
      s.over = true;
      s.stars = 3;
    }
  };

  const crRender = () => {
    const s = GS;
    if (s.over) {
      crDraw(s);
      drawResult(s.score >= s.target ? "Goal Reached!" : "Time's Up!", s.stars,
        `Score: ${s.score} / ${s.target}`);
      return;
    }
    crDraw(s);
    text(`SCORE ${s.score} / ${s.target}`, SZ / 2 - SZ * 0.2, SZ * 0.05, SZ * 0.028, "#9aa7bd", "left");
    const tw = SZ * 0.34;
    gCtx.fillStyle = "rgba(255,255,255,0.08)";
    rr(SZ / 2 + SZ * 0.1, SZ * 0.036, tw, SZ * 0.022, 10);
    gCtx.fill();
    gCtx.fillStyle = s.time > 15 ? "#22d3ee" : "#ef4444";
    rr(SZ / 2 + SZ * 0.1, SZ * 0.036, tw * (s.time / 45), SZ * 0.022, 10);
    gCtx.fill();
    drawMsg(s.msg);
  };

  const crDraw = (s) => {
    const m = s.gm;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const x = m.x0 + c * (m.cell + m.gap);
        const y = m.y0 + r * (m.cell + m.gap);
        gCtx.fillStyle = "#131a29";
        rr(x, y, m.cell, m.cell, 6);
        gCtx.fill();
        const pop = s.pop.get(r * 8 + c) || 0;
        if (pop > 0) {
          gCtx.fillStyle = `rgba(34,211,238,${pop * 1.5})`;
          rr(x, y, m.cell, m.cell, 6);
          gCtx.fill();
        }
        if (s.sel && s.sel[0] === r && s.sel[1] === c) {
          gCtx.strokeStyle = "#22d3ee";
          gCtx.lineWidth = 2.5;
          rr(x, y, m.cell, m.cell, 6);
          gCtx.stroke();
        }
        text(s.grid[r][c], x + m.cell / 2, y + m.cell / 2, m.cell * 0.58 * (1 + pop * 1.6));
      }
    }
  };

  /* ────────────────────────────────────────────
     MORE ADVENTURES (coming soon)
     ──────────────────────────────────────────── */
  const initMore = () => ({
    render: () => {
      text("🚧", SZ / 2, SZ * 0.42, SZ * 0.16);
      text("Coming Soon", SZ / 2, SZ * 0.55, SZ * 0.055, "#22d3ee");
      text("New quests are in the works. Stay tuned!", SZ / 2, SZ * 0.64, SZ * 0.028, "#9aa7bd");
    }
  });

  /* ────────────────────────────────────────────
     GAME REGISTRY + MODAL WIRING
     ──────────────────────────────────────────── */
  const GAMES = {
    sudoku: { name: "Sudoku", hint: "Fill each row, column and 2×2 box with 1–4.", init: initSudoku },
    wordfinder: { name: "Word Finder", hint: "Find the hidden words — drag across letters.", init: initWordFinder },
    math: { name: "Math Challenge", hint: "Answer as many as you can in 45 seconds!", init: initMath },
    hanoi: { name: "Tower of Hanoi", hint: "Move all disks to the right peg. Big disks can't sit on small ones.", init: initHanoi },
    memory: { name: "Card Memory", hint: "Flip two cards at a time and match all pairs.", init: initMemory },
    puzzlepets: { name: "Puzzle Pets", hint: "Slide the pets to restore the picture.", init: initPuzzlePets },
    block: { name: "Block Puzzle", hint: "Pick a piece, place it on the grid, clear rows and columns!", init: initBlock },
    maze: { name: "Maze Runner", hint: "Reach the flag! Use arrow keys, WASD or swipe.", init: initMaze },
    animalcrush: { name: "Animal Crush", hint: "Swap animals to match 3+ in a row. Reach 300 points!", init: initAnimalCrush },
    more: { name: "More Adventures", hint: "New quests are in the works. Stay tuned!", init: initMore }
  };

  const sizeCanvas = () => {
    const body = modalEl.querySelector(".game-modal-body");
    const dpr = window.devicePixelRatio || 1;
    // Canvas now uses width: 100% and aspect-ratio: 1/1 via CSS
    // We just need to set the internal resolution for crisp rendering
    const rect = gCanvas.getBoundingClientRect();
    const displaySize = Math.max(240, Math.min(rect.width, rect.height));
    gCanvas.width = Math.round(displaySize * dpr);
    gCanvas.height = Math.round(displaySize * dpr);
    SZ = displaySize;
  };

  const getP = (e) => {
    const rect = gCanvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const openGame = (key) => {
    const def = GAMES[key];
    if (!def) return;
    if (GS && GS.timer) clearTimeout(GS.timer);
    currentKey = key;
    titleEl.textContent = def.name;
    hintEl.textContent = def.hint;
    restartBtn.style.display = "";
    modalEl.classList.add("open");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modalOpen = true;
    sizeCanvas();
    current = def.init();
    lastT = performance.now();
    setTimeout(sizeCanvas, 320);
  };

  const closeModal = () => {
    if (GS && GS.timer) clearTimeout(GS.timer);
    modalEl.classList.remove("open");
    modalEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    modalOpen = false;
    current = null;
    currentKey = null;
  };

  document.querySelectorAll(".game-card").forEach((card) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => openGame(card.dataset.game));
  });

  modalEl.querySelector(".game-modal-overlay").addEventListener("click", closeModal);
  modalEl.querySelector(".game-modal-close").addEventListener("click", closeModal);
  restartBtn.addEventListener("click", () => {
    if (GS && GS.timer) clearTimeout(GS.timer);
    current = GAMES[currentKey].init();
  });

  gCanvas.addEventListener("pointerdown", (e) => {
    if (!modalOpen || !current || !current.down) return;
    e.preventDefault();
    const p = getP(e);
    current.down(p.x, p.y);
  });
  gCanvas.addEventListener("pointermove", (e) => {
    if (!modalOpen || !current || !current.move) return;
    const p = getP(e);
    current.move(p.x, p.y);
  });
  const doUp = (e) => {
    if (!modalOpen || !current || !current.up) return;
    const p = getP(e);
    current.up(p.x, p.y);
  };
  gCanvas.addEventListener("pointerup", doUp);
  gCanvas.addEventListener("pointercancel", doUp);

  window.addEventListener("keydown", (e) => {
    if (!modalOpen) return;
    if (e.key === "Escape") { closeModal(); return; }
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "w", "a", "s", "d", "W", "A", "S", "D"].includes(e.key)) e.preventDefault();
    if (current && current.key) current.key(e.key);
  });

  window.addEventListener("resize", () => { if (modalOpen) sizeCanvas(); });

  const demoLoop = (t) => {
    const dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;
    if (modalOpen && current) {
      const dpr = window.devicePixelRatio || 1;
      gCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gCtx.clearRect(0, 0, SZ, SZ);
      if (current.tick) current.tick(dt);
      current.render();
    }
    requestAnimationFrame(demoLoop);
  };
  requestAnimationFrame(demoLoop);
})();
