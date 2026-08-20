(function () {
  'use strict';
  const C = window.Chart, T = window.Tools, $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  function el(n, a, t) { const e = document.createElementNS(NS, n); for (const k in a) if (a[k] != null) e.setAttribute(k, a[k]); if (t != null) e.textContent = t; return e; }
  const fmt = n => {
    if (!isFinite(n)) return '—';
    if (Math.abs(n) >= 1000) return Math.round(n).toLocaleString('ja-JP');
    return (Math.round(n * 1000) / 1000).toString();
  };

  /* ---------- STEP1 単位変換ドリル ---------- */
  let dAns = 0, dScore = 0, dTotal = 0;
  function newDrill() {
    const kinds = [
      () => { const v = [1, 2, 5, 10, 20, 50, 60, 100, 200, 400][Math.floor(Math.random() * 10)];
        dAns = v * 8; return v + ' MB は何 Mbit か。'; },
      () => { const v = [8, 16, 40, 80, 160, 480, 800][Math.floor(Math.random() * 7)];
        dAns = v / 8; return v + ' Mbit は何 MB か。'; },
      () => { const v = [1, 2, 5, 10][Math.floor(Math.random() * 4)];
        dAns = v * 1000; return v + ' MB は何 kB か。'; },
      () => { const v = [2, 4, 8, 10][Math.floor(Math.random() * 4)];
        dAns = v * 8 * 1000000; return v + ' MB は何 bit か。（数字だけ）'; },
      () => { const v = [1, 2, 4, 8][Math.floor(Math.random() * 4)];
        dAns = v * 1000; return v + ' Gbps は何 Mbps か。'; }
    ];
    $('dText').textContent = kinds[Math.floor(Math.random() * kinds.length)]();
    $('dIn').value = '';
    $('dFb').hidden = true;
  }
  function checkDrill() {
    const v = parseFloat(($('dIn').value || '').replace(/[,\s]/g, ''));
    dTotal++;
    const ok = Math.abs(v - dAns) < Math.max(1e-6, Math.abs(dAns) * 1e-6);
    if (ok) dScore++;
    $('dScore').textContent = dScore; $('dTotal').textContent = dTotal;
    const fb = $('dFb'); fb.hidden = false;
    fb.className = 'note ' + (ok ? 'ok' : 'ng');
    fb.innerHTML = ok ? '正解です。' : '正解は <strong>' + fmt(dAns) + '</strong>。' +
      'バイトからビットは<strong>8倍</strong>、ビットからバイトは<strong>8で割る</strong>。M・k はそのまま残して構いません。';
  }

  /* ---------- STEP2 三角図 ---------- */
  function drawTri() {
    const W = 340, H = 220;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', role: 'img', 'aria-label': '関係の三角図' });
    svg.appendChild(el('path', { d: 'M170 16 L322 200 L18 200 Z', class: 'tri' }));
    svg.appendChild(el('line', { x1: 60, y1: 122, x2: 280, y2: 122, class: 'tsep' }));
    svg.appendChild(el('line', { x1: 170, y1: 122, x2: 170, y2: 200, class: 'tsep' }));
    svg.appendChild(el('text', { x: 170, y: 78, class: 'ttext' }, 'データ量（bit）'));
    svg.appendChild(el('text', { x: 110, y: 162, class: 'ttext' }, '速度×効率'));
    svg.appendChild(el('text', { x: 235, y: 162, class: 'ttext' }, '時間'));
    svg.appendChild(el('text', { x: 170, y: 214, class: 'tsmall' }, '上を下で割る／下どうしはかけ算'));
    const box = $('triBox'); box.innerHTML = ''; box.appendChild(svg);
  }

  /* ---------- STEP3 計算 ---------- */
  function calc() {
    const t = $('target').value;
    const sizeB = (parseFloat($('cSize').value) || 0) * (+$('cSizeU').value);
    const speed = (parseFloat($('cSpeed').value) || 0) * (+$('cSpeedU').value);
    const time = parseFloat($('cTime').value) || 0;
    const eff = (parseFloat($('cEff').value) || 0) / 100;
    const bits = sizeB * 8;
    const uS = $('cSizeU').selectedOptions[0].text, uP = $('cSpeedU').selectedOptions[0].text;
    let ans = '', work = '';
    if (t === 'time') {
      const v = bits / (speed * eff);
      ans = fmt(v) + ' 秒';
      work = 'データ量をビットに直す：<span class="hl">' + fmt(sizeB / (+$('cSizeU').value)) + ' ' + uS + ' × 8 ＝ ' +
        fmt(bits / 1000000) + ' Mbit</span><br>' +
        '実際に使える速度：' + fmt(speed / 1000000) + ' Mbps × ' + fmt(eff * 100) + '％ ＝ <span class="hl">' +
        fmt(speed * eff / 1000000) + ' Mbps</span><br>' +
        '時間 ＝ ' + fmt(bits / 1000000) + ' ÷ ' + fmt(speed * eff / 1000000) + ' ＝ <span class="hl">' + fmt(v) + ' 秒</span>';
    } else if (t === 'speed') {
      const v = bits / (time * eff);
      ans = fmt(v / 1000000) + ' Mbps';
      work = 'データ量をビットに直す：<span class="hl">' + fmt(bits / 1000000) + ' Mbit</span><br>' +
        '実効速度 ＝ ' + fmt(bits / 1000000) + ' ÷ ' + fmt(time) + ' ＝ <span class="hl">' + fmt(bits / time / 1000000) + ' Mbps</span><br>' +
        '効率で割って理論値へ ＝ ' + fmt(bits / time / 1000000) + ' ÷ ' + fmt(eff) + ' ＝ <span class="hl">' + fmt(v / 1000000) + ' Mbps</span>';
    } else if (t === 'eff') {
      const v = bits / (speed * time);
      ans = fmt(v * 100) + ' ％';
      work = 'データ量をビットに直す：<span class="hl">' + fmt(bits / 1000000) + ' Mbit</span><br>' +
        '実効速度 ＝ ' + fmt(bits / 1000000) + ' ÷ ' + fmt(time) + ' ＝ <span class="hl">' + fmt(bits / time / 1000000) + ' Mbps</span><br>' +
        '効率 ＝ ' + fmt(bits / time / 1000000) + ' ÷ ' + fmt(speed / 1000000) + ' ＝ <span class="hl">' + fmt(v * 100) + '％</span>';
    } else {
      const v = speed * eff * time;
      ans = fmt(v / 8 / 1000000) + ' MB';
      work = '送れるビット数 ＝ ' + fmt(speed / 1000000) + ' Mbps × ' + fmt(eff * 100) + '％ × ' + fmt(time) +
        ' 秒 ＝ <span class="hl">' + fmt(v / 1000000) + ' Mbit</span><br>' +
        'バイトに直す ＝ ' + fmt(v / 1000000) + ' ÷ 8 ＝ <span class="hl">' + fmt(v / 8 / 1000000) + ' MB</span>';
    }
    $('ansOut').textContent = ans;
    $('workOut').innerHTML = work;
    ['cSize', 'cSpeed', 'cTime', 'cEff'].forEach(id => $(id).style.opacity = '1');
    ({ time: 'cTime', speed: 'cSpeed', eff: 'cEff', size: 'cSize' })[t] &&
      ($(({ time: 'cTime', speed: 'cSpeed', eff: 'cEff', size: 'cSize' })[t]).style.opacity = '.4');
  }

  /* ---------- STEP4 演習 ---------- */
  const BOOKQ = [
    { t: '30Mbpsの通信速度で、60MBの画像ファイルを転送するのにかかる時間はいくらか。転送効率は100％とする。',
      a: '16秒', choices: ['16秒', '15秒', '17秒', '18秒'],
      why: '60MB ＝ 60 × 8 ＝ 480Mbit。480 ÷ 30 ＝ <strong>16秒</strong>。8倍を忘れると2秒になってしまいます。' },
    { t: 'ファイル容量200MB、かかった時間20秒、転送効率80％のときの転送速度はいくらか。',
      a: '100Mbps', choices: ['100Mbps', '80Mbps', '10Mbps', '12.5Mbps'],
      why: '200MB ＝ 1600Mbit。実効速度 ＝ 1600 ÷ 20 ＝ 80Mbps。これは<strong>効率80％での実効値</strong>なので、理論値は 80 ÷ 0.8 ＝ <strong>100Mbps</strong>。「80Mbps」で止まらないこと。' },
    { t: '1枚400MBの画像4枚を20秒でアップロードした。通信速度が800Mbpsのとき、転送効率はいくらか。',
      a: '80%', choices: ['80%', '60%', '70%', '90%'],
      why: '400 × 4 ＝ 1600MB ＝ 12800Mbit。実効速度 ＝ 12800 ÷ 20 ＝ 640Mbps。効率 ＝ 640 ÷ 800 ＝ <strong>80％</strong>。' }
  ];
  let qList = [], qi = 0, qScore = 0;
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function makeQ() {
    const kind = Math.floor(Math.random() * 3);
    const sz = [20, 40, 50, 60, 80, 100, 120, 200, 250, 400][Math.floor(Math.random() * 10)];
    const sp = [10, 20, 25, 30, 40, 50, 80, 100, 200][Math.floor(Math.random() * 9)];
    const ef = [50, 60, 70, 80, 90, 100][Math.floor(Math.random() * 6)];
    const bits = sz * 8;
    if (kind === 0) {
      const tv = bits / (sp * ef / 100);
      return { t: sp + 'Mbps の回線で ' + sz + 'MB のファイルを転送する。転送効率が' + ef + '％のとき、かかる時間はおよそ何秒か。',
        a: fmt(Math.round(tv * 10) / 10) + '秒',
        choices: [fmt(Math.round(tv * 10) / 10) + '秒', fmt(Math.round(tv / 8 * 10) / 10) + '秒',
                  fmt(Math.round(bits / sp * 10) / 10) + '秒', fmt(Math.round(tv * 2 * 10) / 10) + '秒'],
        why: sz + 'MB ＝ ' + bits + 'Mbit。使える速度は ' + sp + ' × ' + (ef / 100) + ' ＝ ' + fmt(sp * ef / 100) +
          'Mbps。' + bits + ' ÷ ' + fmt(sp * ef / 100) + ' ＝ <strong>' + fmt(Math.round(tv * 10) / 10) + '秒</strong>。' };
    } else if (kind === 1) {
      const tv = 20;
      const eff2 = ef;
      const spd = bits / tv / (eff2 / 100);
      return { t: sz + 'MB のファイルを ' + tv + ' 秒で転送した。転送効率が' + eff2 + '％のとき、通信速度はいくらか。',
        a: fmt(Math.round(spd * 10) / 10) + 'Mbps',
        choices: [fmt(Math.round(spd * 10) / 10) + 'Mbps', fmt(Math.round(bits / tv * 10) / 10) + 'Mbps',
                  fmt(Math.round(sz / tv * 10) / 10) + 'Mbps', fmt(Math.round(spd / 8 * 10) / 10) + 'Mbps'],
        why: sz + 'MB ＝ ' + bits + 'Mbit。実効速度 ＝ ' + bits + ' ÷ ' + tv + ' ＝ ' + fmt(bits / tv) +
          'Mbps。効率で割って ' + fmt(bits / tv) + ' ÷ ' + (eff2 / 100) + ' ＝ <strong>' + fmt(Math.round(spd * 10) / 10) + 'Mbps</strong>。' };
    }
    const tv = 20;
    const e = bits / (sp * tv) * 100;
    return { t: sp + 'Mbps の回線で ' + sz + 'MB のファイルを ' + tv + ' 秒かけて転送した。転送効率はいくらか。',
      a: fmt(Math.round(e * 10) / 10) + '%',
      choices: [fmt(Math.round(e * 10) / 10) + '%', fmt(Math.round(e / 8 * 10) / 10) + '%',
                fmt(Math.round(e * 2 * 10) / 10) + '%', fmt(Math.round(100 - e) * 10 / 10) + '%'],
      why: sz + 'MB ＝ ' + bits + 'Mbit。実効速度 ＝ ' + bits + ' ÷ ' + tv + ' ＝ ' + fmt(bits / tv) +
        'Mbps。効率 ＝ ' + fmt(bits / tv) + ' ÷ ' + sp + ' ＝ <strong>' + fmt(Math.round(e * 10) / 10) + '％</strong>。' };
  }
  function startQuiz(extra) { qList = shuffle(BOOKQ).concat(extra ? [makeQ(), makeQ()] : []); qi = 0; qScore = 0; renderQ(); }
  function renderQ() {
    if (qi >= qList.length) {
      $('qText').textContent = qScore + ' / ' + qList.length + ' 問正解。「似た問題を作る」で続けられます。';
      $('qChoices').innerHTML = ''; $('qFb').hidden = true; $('qNext').disabled = true;
      $('qProgress').textContent = qList.length + ' / ' + qList.length; return;
    }
    const it = qList[qi];
    $('qProgress').textContent = (qi + 1) + ' / ' + qList.length;
    $('qScore').textContent = qScore;
    $('qText').textContent = it.t;
    const box = $('qChoices'); box.className = 'choice4'; box.innerHTML = '';
    shuffle([...new Set(it.choices)]).forEach(c => {
      const b = document.createElement('button');
      b.className = 'btn'; b.textContent = c; b.dataset.c = c; b.style.textAlign = 'center';
      b.addEventListener('click', () => answerQ(c));
      box.appendChild(b);
    });
    $('qFb').hidden = true; $('qNext').disabled = true;
    $('qNext').textContent = (qi === qList.length - 1) ? '結果を見る' : '次の問題';
  }
  function answerQ(c) {
    const it = qList[qi], ok = c === it.a, box = $('qChoices');
    box.classList.add('locked');
    [...box.children].forEach(b => {
      if (b.dataset.c === it.a) b.classList.add('correct');
      else if (b.dataset.c === c) b.classList.add('wrong');
    });
    if (ok) qScore++;
    const fb = $('qFb');
    fb.className = 'note ' + (ok ? 'ok' : 'ng');
    fb.innerHTML = (ok ? '正解。' : '正解は「<strong>' + it.a + '</strong>」。') + it.why;
    fb.hidden = false;
    $('qScore').textContent = qScore; $('qNext').disabled = false;
  }

  /* ---------- STEP5 身近な例 ---------- */
  const FILES = [
    { n: '写真1枚（スマートフォン）', mb: 4 },
    { n: '音楽1曲（MP3）', mb: 5 },
    { n: '授業のスライド', mb: 20 },
    { n: '動画5分（高画質）', mb: 500 },
    { n: '映画1本（HD）', mb: 4000 },
    { n: 'ゲーム1本', mb: 50000 }
  ];
  function drawLife() {
    const sp = +$('lineSpeed').value, ef = +$('lineEff').value / 100;
    $('lineSpeedV').textContent = sp; $('lineEffV').textContent = Math.round(ef * 100);
    const times = FILES.map(f => f.mb * 8 / (sp * ef));
    $('lifeTable').innerHTML = '<thead><tr><th>ファイル</th><th>データ量</th><th>ビット数</th><th>かかる時間</th></tr></thead><tbody>' +
      FILES.map((f, i) => '<tr><td>' + f.n + '</td><td class="mono">' + f.mb.toLocaleString() + ' MB</td>' +
        '<td class="mono">' + (f.mb * 8).toLocaleString() + ' Mbit</td><td class="mono">' + human(times[i]) + '</td></tr>').join('') + '</tbody>';
    C.bar($('lifeChart'), { W: 720, H: 280, labels: FILES.map(f => f.n), values: times.map(t => +t.toFixed(1)),
      unit: '秒', rotate: true, showValue: false });
    const n = $('lifeNote');
    n.className = 'note info';
    n.innerHTML = '実際に使える速度は ' + sp + ' × ' + Math.round(ef * 100) + '％ ＝ <strong>' + fmt(sp * ef) +
      ' Mbps</strong>。1秒あたり <strong>' + fmt(sp * ef / 8) + ' MB</strong> 送れる計算です。' +
      '<br>効率を下げると、同じ回線でも時間が伸びることを確かめてみましょう。';
    $('lifeTools').innerHTML = '';
    $('lifeTools').appendChild(T.saveButton(() => $('lifeChart').querySelector('svg'), '転送時間'));
  }
  function human(sec) {
    if (sec < 60) return fmt(Math.round(sec * 10) / 10) + ' 秒';
    if (sec < 3600) return fmt(Math.round(sec / 60 * 10) / 10) + ' 分';
    return fmt(Math.round(sec / 3600 * 10) / 10) + ' 時間';
  }

  function init() {
    $('dCheck').addEventListener('click', checkDrill);
    $('dNext').addEventListener('click', newDrill);
    $('dIn').addEventListener('keydown', e => { if (e.key === 'Enter') checkDrill(); });
    ['target', 'cSize', 'cSizeU', 'cSpeed', 'cSpeedU', 'cTime', 'cEff'].forEach(i => $(i).addEventListener('input', calc));
    $('target').addEventListener('change', calc);
    $('qNext').addEventListener('click', () => { qi++; renderQ(); });
    $('qReset').addEventListener('click', () => startQuiz(false));
    $('qMake').addEventListener('click', () => { qList = [makeQ(), makeQ(), makeQ()]; qi = 0; qScore = 0; renderQ(); });
    ['lineSpeed', 'lineEff'].forEach(i => $(i).addEventListener('input', drawLife));
    window.Terms.glossary($('glossBox'), ['ビット毎秒', '転送効率', 'パケット', 'LAN', 'プロトコル']);
    newDrill(); drawTri(); calc(); startQuiz(false); drawLife();
    window.Terms.attach();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
