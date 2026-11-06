/* Mapas de puntos animados (Legacy Minds Limited)
   Datos de tierra: Natural Earth 110m vía world-atlas, rasterizados a 150x64.
   Uso: <canvas data-map="hero|mission|vision"> */
(function () {
  var ROWS = ["0000006013e7ffffe000400000000700000000","0000000817c01fffe00000003001ffc0000000","000001f6f3800fffc00000004087ffff860000","00f0003f1bfc0fff4000070001bffffffffc00","83fffff22d8e07fe00003fe43efffffffffffc","f2fffffffe0f87f04800ffbffffffffffffffc","00fffffffd8f07c03001f7fffffffffffffff8","03fffffff03803800007cffffffffffffffff0","05e8fffff01c00000007e9ffffffffffffe300","00401ffff01f80000000c7fffffffffff80e00","01800ffffe1fc00000428ffffffffffff00c00","000007ffffbff0000123fffffffffffffe0c00","000003ffffffe000003ffffffffffffffe0800","000002fffffe1800003ffffffffffffffa0000","000001ffffff0800003ffffffffffffffa0000","000001fffffe8000003f7e7efffffffff00000","000001fffffc000001f1be0e7fffffffe60000","000001fffff8000001e259ff3fffffff840000","000000fffff0000001e00bfe7ffffff1040000","000000ffffe00000008e09bffffffff88c0000","0000007fffe0000000fe003ffffffff8300000","0000003fff80000001ff983ffffffffc400000","0000000ffd80000001fffffffffffffc000000","00000017e080000003fffffefffffff8000000","0000000fe040000007ffffbf3ffffff8000000","00000003c00000000fffffdfe1fffff4000000","00000001c02000000fffffdff0ff7fc0000000","00000001e60400000fffffcfe07e3e80000000","000000007c0000000fffffe7c03c3f04000000","000000000f0000000ffffff700300f04000000","00000000010000000ffffffc00300f86000000","00000000010c000007fffff900100300000000","0000000000ffc00007ffffff00180801000000","00000000001fe00003ffffff00080000000000","00000000001ff8000105fffe00001410000000","00000000003ffc000001fffc00000c70000000","00000000003ffc000001fff800000cf6800000","00000000007fff000001fff000000674200000","00000000007fffe00000fff0000002047e0000","00000000007ffff00000ffe000000100075000","00000000003ffff00000ffe0000000600e8400","00000000003ffff000007ff000000002004000","00000000001fffe000007ff100000000320000","00000000001fffe00000fff100000001720000","000000000007ffe00000fff700000003fb0004","000000000003ffc00000ffc600000003ff0000","000000000003ffc000007fc60000000fff8000","000000000003ffc000007fc60000003fffc000","000000000003fe0000007f840000003fffe000","000000000007fe0000007f800000003fffe000","000000000007fc0000003f000000001fffe000","000000000007fc0000001e000000001fffe000","000000000007f80000001c000000001e1fc000","000000000007e000000000000000000007c010","00000000000fe0000000000000000000038008","00000000000f80000000000000000000000008","00000000000f00000000000000000000008030","00000000000700000000000000000000000040","00000000000e00000000000000000000000040","00000000000e00000000000000000000000000","00000000000c00000000000000000000000000","00000000000c00000000000000000000000000","00000000000700000000000000000000000000","00000000000000000000000000000000000000"];
  var GW = 150, GH = 64, LAT0 = 78, LATSPAN = 136;
  var LAND = [];
  ROWS.forEach(function (h, j) {
    for (var k = 0; k < h.length; k++) {
      var v = parseInt(h[k], 16);
      for (var b = 0; b < 4; b++) { var i = k * 4 + b; if (i < GW && (v >> (3 - b)) & 1) LAND.push([i, j]); }
    }
  });
  var P = {
    hk: [114.17, 22.3], md: [-75.57, 6.25], sh: [121.47, 31.23], sg: [103.82, 1.35], la: [-118.24, 34.05],
    pa: [-79.52, 8.98], rt: [4.48, 51.92], mi: [-80.19, 25.76], bo: [-74.07, 4.71], mx: [-99.13, 19.43],
    li: [-77.04, -12.05], sc: [-70.67, -33.45], sp: [-46.63, -23.55], ba: [-58.38, -34.6], gy: [-79.9, -2.19], sj: [-66.1, 18.47]
  };
  var CFG = {
    hero: { mode: 'hero', main: ['hk', 'md'], minor: ['sh', 'sg', 'la', 'pa', 'rt', 'mi'],
      routes: [['hk', 'md', 1], ['sh', 'la', 0], ['hk', 'rt', 0], ['sg', 'hk', 0], ['la', 'pa', 0], ['rt', 'mi', 0], ['pa', 'md', 0]], dot: 'rgba(141,176,255,0.26)' },
    mission: { box: [-125, 150, 62, -42], main: ['hk', 'md'], minor: ['sh', 'sg', 'la', 'pa', 'rt', 'mi'],
      routes: [['hk', 'md', 1], ['sh', 'la', 0], ['sg', 'rt', 0], ['hk', 'pa', 0], ['rt', 'mi', 0], ['la', 'md', 0]], dot: 'rgba(141,176,255,0.34)' },
    vision: { box: [-112, -32, 30, -56], main: ['md'], minor: ['bo', 'mx', 'pa', 'li', 'sc', 'sp', 'ba', 'gy', 'mi', 'sj'],
      routes: [['md', 'mx', 0], ['md', 'pa', 0], ['md', 'li', 0], ['md', 'sp', 0], ['md', 'ba', 0], ['md', 'sc', 0], ['md', 'mi', 0], ['md', 'gy', 0]], dot: 'rgba(141,176,255,0.34)', star: 1 }
  };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init(canvas) {
    var cfg = CFG[canvas.getAttribute('data-map')]; if (!cfg || !canvas.getContext) return;
    var ctx = canvas.getContext('2d'), dots = document.createElement('canvas');
    var W, H, dpr, cell, ox, oy;
    function proj(lon, lat) { return [ox + (lon + 180) / 360 * GW * cell, oy + (LAT0 - lat) / LATSPAN * GH * cell]; }
    function layout() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2); W = r.width; H = r.height;
      if (!W || !H) return false;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      if (cfg.mode === 'hero') {
        var narrow = W < 900;
        cell = Math.max(narrow ? W * 1.9 : W * 1.05, H * 1.7) / GW;
        ox = narrow ? (W - GW * cell) * 0.62 : (W - GW * cell) / 2 + W * 0.04;
        oy = (H - GH * cell) / 2 + H * 0.02;
      } else {
        var b = cfg.box, bw = (b[1] - b[0]) / 360 * GW, bh = (b[2] - b[3]) / LATSPAN * GH;
        cell = Math.min(W / bw, H / bh) * 1.04;
        ox = W / 2 - ((b[0] + b[1]) / 2 + 180) / 360 * GW * cell;
        oy = H / 2 - (LAT0 - (b[2] + b[3]) / 2) / LATSPAN * GH * cell;
      }
      dots.width = canvas.width; dots.height = canvas.height;
      var d = dots.getContext('2d'); d.setTransform(dpr, 0, 0, dpr, 0, 0); d.clearRect(0, 0, W, H);
      var rad = Math.max(1, cell * 0.2); d.fillStyle = cfg.dot;
      LAND.forEach(function (p) {
        var x = ox + (p[0] + 0.5) * cell, y = oy + (p[1] + 0.5) * cell;
        if (x < -4 || x > W + 4 || y < -4 || y > H + 4) return;
        d.beginPath(); d.arc(x, y, rad, 0, 6.2832); d.fill();
      });
      return true;
    }
    function arc(a, b) {
      var p = proj(P[a][0], P[a][1]), q = proj(P[b][0], P[b][1]);
      var dist = Math.hypot(q[0] - p[0], q[1] - p[1]);
      return [p, [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2 - dist * (cfg.star ? 0.22 : 0.32)], q];
    }
    function pt(c, t) { var u = 1 - t; return [u * u * c[0][0] + 2 * u * t * c[1][0] + t * t * c[2][0], u * u * c[0][1] + 2 * u * t * c[1][1] + t * t * c[2][1]]; }
    function draw(time) {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(dots, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var s = time / 1000;
      cfg.routes.forEach(function (r, idx) {
        var c = arc(r[0], r[1]), main = r[2];
        ctx.beginPath(); ctx.moveTo(c[0][0], c[0][1]); ctx.quadraticCurveTo(c[1][0], c[1][1], c[2][0], c[2][1]);
        ctx.strokeStyle = main ? 'rgba(255,122,61,0.5)' : (cfg.star ? 'rgba(255,150,100,0.32)' : 'rgba(141,176,255,0.28)');
        ctx.lineWidth = main ? 1.8 : (cfg.star ? 1.3 : 1.1); ctx.setLineDash(main || cfg.star ? [] : [3, 5]); ctx.stroke(); ctx.setLineDash([]);
        if (reduce) return;
        var period = main ? 5 : (cfg.star ? 4 + (idx % 3) : 7 + idx);
        var t = ((s + idx * (cfg.star ? 0.6 : 1.3)) % period) / period;
        var e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        var warm = main || cfg.star;
        for (var k = 0; k < 7; k++) {
          var tt = e - k * 0.018; if (tt < 0) break;
          var p = pt(c, tt), a = (1 - k / 7) * (warm ? 0.95 : 0.6);
          ctx.fillStyle = warm ? 'rgba(255,140,80,' + a + ')' : 'rgba(170,198,255,' + a + ')';
          ctx.beginPath(); ctx.arc(p[0], p[1], (warm ? 2.8 : 2) * (1 - k / 10), 0, 6.2832); ctx.fill();
        }
      });
      cfg.main.concat(cfg.minor).forEach(function (k, idx) {
        var p = proj(P[k][0], P[k][1]), main = cfg.main.indexOf(k) > -1;
        if (!reduce && (main || cfg.star)) {
          var per = main ? 2.5 : 3.2, ph = ((s + idx * 0.45) % per) / per;
          ctx.beginPath(); ctx.arc(p[0], p[1], (main ? 4 : 2.5) + ph * (main ? 18 : 10), 0, 6.2832);
          ctx.strokeStyle = (main ? 'rgba(255,122,61,' : 'rgba(170,198,255,') + (0.55 * (1 - ph)) + ')'; ctx.lineWidth = 1.4; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(p[0], p[1], main ? 4.5 : 2.6, 0, 6.2832);
        ctx.fillStyle = main ? '#FF7A3D' : 'rgba(190,210,255,0.9)'; ctx.fill();
      });
    }
    var running = false, visible = true, raf;
    function loop(t) { draw(t); if (running) raf = requestAnimationFrame(loop); }
    function start() { if (running || reduce || !visible || document.hidden) return; running = true; raf = requestAnimationFrame(loop); }
    function stop() { running = false; cancelAnimationFrame(raf); }
    if (layout()) draw(0);
    start();
    var to; window.addEventListener('resize', function () { clearTimeout(to); to = setTimeout(function () { if (layout()) draw(performance.now()); }, 120); });
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) { if (!W) layout(); start(); } else stop(); }).observe(canvas);
  }
  document.querySelectorAll('canvas[data-map]').forEach(init);
})();
