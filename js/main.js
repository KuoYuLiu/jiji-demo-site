/* =========================================================
   集集．慢車小鎮｜互動元件
   每一段都先檢查頁面上有沒有對應元素，沒有就跳過，
   所以所有頁面共用這一個檔案。
   1 共用：選單、頁首、回到頂端、提示訊息、分享
   2 捲動進場動畫與數字跳動
   3 集集線路線圖        4 百年時光軸
   5 震災前後對照        6 散步地圖
   7 行程分頁與行事曆    8 線上集章任務
   ========================================================= */
document.documentElement.classList.remove('no-js');
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. 共用 ---------- */
(function common() {
  const toggle = document.querySelector('.menu-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? '開啟選單' : '關閉選單');
      links.classList.toggle('open', !open);
    });
  }
  const header = document.querySelector('.site-header');
  const topBtn = document.querySelector('.back-top');
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 10);
    if (topBtn) topBtn.classList.toggle('show', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (topBtn) topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }));
})();

function toast(msg) {
  const el = document.querySelector('.toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 2600);
}

document.querySelectorAll('[data-share]').forEach(btn => btn.addEventListener('click', async () => {
  const data = { title: document.title, text: '一起搭慢車去集集！', url: location.href };
  if (navigator.share) {
    try { await navigator.share(data); } catch (e) { /* 使用者取消分享 */ }
    return;
  }
  try { await navigator.clipboard.writeText(location.href); toast('已複製網址，貼給朋友吧！'); }
  catch (e) { toast('請複製網址列的網址分享'); }
}));

/* ---------- 2. 捲動進場動畫與數字跳動 ---------- */
(function reveal() {
  const items = document.querySelectorAll('.reveal');
  const counters = document.querySelectorAll('[data-count]');
  const countUp = el => {
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0);
    if (REDUCED) { el.textContent = end.toFixed(dec); return; }
    const start = end > 1000 ? end - 120 : 0, t0 = performance.now(), dur = 1400;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = (start + (end - start) * e).toFixed(dec);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!('IntersectionObserver' in window) || REDUCED) {
    items.forEach(i => i.classList.add('in'));
    counters.forEach(countUp);
    return;
  }
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    en.target.querySelectorAll('[data-count]').forEach(countUp);
    io.unobserve(en.target);
  }), { threshold: 0.15 });
  items.forEach(i => io.observe(i));
})();

/* ---------- 3. 集集線路線圖（展區一） ---------- */
(function lineMap() {
  const btns = document.querySelectorAll('.station-btn');
  if (!btns.length) return;
  const no = document.getElementById('st-no'), name = document.getElementById('st-name');
  const tag = document.getElementById('st-tag'), text = document.getElementById('st-text');
  btns.forEach((b, i) => b.addEventListener('click', () => {
    btns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    no.textContent = i + 1;
    name.textContent = b.dataset.name;
    tag.textContent = b.dataset.tag;
    text.textContent = b.dataset.text;
  }));
})();

/* ---------- 4. 百年時光軸（展區一） ---------- */
(function timeline() {
  const list = document.getElementById('timeline-list');
  if (!list) return;
  // 要新增事件，在這裡加一行：[年份, 主題, 說明]
  const EVENTS = [
    ['1885', '書院', '明新書院於清光緒年間創建，是集集地區第一所私塾。'],
    ['1908', '書院', '明新書院遷到現址。'],
    ['1919', '產業', '南投發現不易生病的香蕉，居民視為神賜，取名「仙人蕉」。'],
    ['1922', '鐵道', '1 月 14 日集集線通車，最初用來運送日月潭水力發電工程的材料。'],
    ['1930', '鐵道', '集集站遷到現址；這時也是集集香蕉集散的高峰。'],
    ['1933', '鐵道', '檜木建造的集集車站站房完工。'],
    ['1940', '產業', '152 縣道兩旁種下上千棵樟樹，日後長成綠色隧道（民國 29 年）。'],
    ['1985', '書院', '明新書院列為三級古蹟。'],
    ['1986', '鐵道', '集集線傳出停駛提議，地方居民群起反對。'],
    ['1994', '鐵道', '集集線轉型為觀光鐵道。'],
    ['1999', '災後', '9 月 21 日凌晨 1 時 47 分，以集集為震央的大地震發生：車站重創、武昌宮倒塌、明新書院幾近震毀。'],
    ['1999', '信仰', '倒塌的武昌宮舊廟原地保留為震災遺址，居民在旁興建新廟。'],
    ['2001', '災後', '集集車站依原貌重建完成，重新啟用並登錄為歷史建築。'],
    ['2021', '災後', '8 月台 16 線旁邊坡坍方，土石擠壓鐵路隧道，集集線停駛。'],
    ['2024', '鐵道', '5 月展開鐵路隧道擴孔工程，集集站也暫停營運。'],
    ['2026', '鐵道', '1 月 5 日恢復通車至集集站；6 月 25 日二水－車埕全線復駛。']
  ];
  const TAG = { '鐵道': 'wood', '產業': '', '信仰': 'green', '書院': 'green', '災後': 'wood' };
  list.innerHTML = EVENTS.map(([y, c, t]) =>
    `<li class="tl-item" data-cat="${c}"><span class="tl-year">${y}</span><span class="tag ${TAG[c]}">${c === '災後' ? '災害與重建' : c}</span><p>${t}</p></li>`).join('');
  const chips = document.querySelectorAll('.chip[data-filter]');
  const count = document.getElementById('tl-count');
  const apply = f => {
    let n = 0;
    list.querySelectorAll('.tl-item').forEach(li => {
      const show = f === 'all' || li.dataset.cat === f;
      li.hidden = !show; if (show) n++;
    });
    count.textContent = `顯示 ${n} 則事件`;
  };
  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(x => x.setAttribute('aria-pressed', String(x === c)));
    apply(c.dataset.filter);
  }));
  apply('all');
})();

/* ---------- 5. 震災前後對照（展區三） ---------- */
(function compare() {
  const box = document.getElementById('compare');
  if (!box) return;
  const range = document.getElementById('compare-range');
  const set = v => box.style.setProperty('--pos', v + '%');
  range.addEventListener('input', () => set(range.value));
  set(range.value);
})();

/* ---------- 6. 散步地圖（展區二、行程規劃） ---------- */
document.querySelectorAll('.walk-map').forEach(map => {
  const dataEl = map.parentElement.querySelector('script[type="application/json"]');
  if (!dataEl) return;
  const POINTS = JSON.parse(dataEl.textContent);
  const detail = map.querySelector('.map-detail');
  const pins = map.querySelectorAll('.map-point');
  const btns = map.querySelectorAll('.map-list button');
  const show = i => {
    const p = POINTS[i];
    pins.forEach(g => g.classList.toggle('active', +g.dataset.i === i));
    btns.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.i === i)));
    const gmap = `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}`;
    detail.innerHTML = `<h3>${p.name}</h3><p>${p.text}</p>${p.dist ? `<p class="note">${p.dist}</p>` : ''}<a href="${gmap}" target="_blank" rel="noopener">在 Google 地圖開啟 ↗</a>`;
  };
  pins.forEach(g => {
    g.addEventListener('click', () => show(+g.dataset.i));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(+g.dataset.i); } });
  });
  btns.forEach(b => b.addEventListener('click', () => show(+b.dataset.i)));
  show(0);
});

/* ---------- 7. 行程分頁與行事曆（行程規劃） ---------- */
(function tabs() {
  const tabs = [...document.querySelectorAll('.tab')];
  if (!tabs.length) return;
  const select = t => {
    tabs.forEach(x => {
      const on = x === t;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = tabs.at((i + (e.key === 'ArrowRight' ? 1 : -1)) % tabs.length);
      select(n); n.focus();
    });
  });

  const btn = document.getElementById('add-calendar');
  const date = document.getElementById('visit-date');
  if (!btn || !date) return;
  btn.addEventListener('click', () => {
    if (!date.value) { toast('先選一個出發日期吧！'); date.focus(); return; }
    const active = tabs.find(t => t.getAttribute('aria-selected') === 'true');
    const panel = document.getElementById(active.getAttribute('aria-controls'));
    const steps = [...panel.querySelectorAll('li')].map(li => `${li.querySelector('time').textContent} ${li.querySelector('h3').textContent}`).join('\\n');
    const d = date.value.replace(/-/g, '');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//jiji-exhibition//TW', 'BEGIN:VEVENT',
      `UID:${Date.now()}@jiji-exhibition`, `DTSTART;VALUE=DATE:${d}`, `SUMMARY:集集慢遊：${active.textContent}`,
      `DESCRIPTION:${steps}\\n行程網站：${location.href}`, 'LOCATION:南投縣集集鎮民生路75號 集集車站', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'jiji-trip.ics';
    a.click();
    toast('已下載行事曆檔案，打開即可加入。');
  });
})();

/* ---------- 8. 線上集章任務（行程規劃） ---------- */
(function stamps() {
  const items = document.querySelectorAll('.stamp');
  if (!items.length) return;
  const KEY = 'jiji-stamps';
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { saved = []; }
  const bar = document.getElementById('stamp-bar'), text = document.getElementById('stamp-text');
  const render = () => {
    items.forEach(s => s.setAttribute('aria-pressed', String(saved.includes(s.dataset.stamp))));
    const n = saved.length, total = items.length;
    bar.style.width = (n / total * 100) + '%';
    text.textContent = n === 0 ? '還沒有蓋章，出發吧！'
      : n === total ? `全部 ${total} 個章都蓋齊了，你已經是集集通！`
      : `已蓋 ${n} / ${total} 個章，再接再厲！`;
  };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* 瀏覽器不允許儲存時，只在這次瀏覽有效 */ } };
  items.forEach(s => s.addEventListener('click', () => {
    const id = s.dataset.stamp;
    saved = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id];
    save(); render();
    if (saved.length === items.length) toast('恭喜集滿全部印章！');
  }));
  document.getElementById('stamp-reset').addEventListener('click', () => { saved = []; save(); render(); });
  render();
})();
