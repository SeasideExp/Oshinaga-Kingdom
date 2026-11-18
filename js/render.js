/* ============================================================================
 * 3. お品書き レンダリングエンジン (window.PRESETS, LABELS, SIZES, Render)
 * ============================================================================ */
const PRESETS = [
  { id: 'x169', name: 'X 横長 16:9（1920×1080）', w: 1920, h: 1080 },
  { id: 'x43', name: '4:3（1600×1200）', w: 1600, h: 1200 },
  { id: 'sq', name: '正方形 1:1（1600×1600）', w: 1600, h: 1600 },
  { id: 'x78', name: 'X 2枚並び用 7:8（1400×1600）', w: 1400, h: 1600 },
  { id: 'x34', name: '縦長 3:4（1500×2000）', w: 1500, h: 2000 },
  { id: 'x45', name: '縦長 4:5（1600×2000）', w: 1600, h: 2000 },
  { id: 'x916', name: '縦長 9:16（1080×1920）', w: 1080, h: 1920 },
  { id: 'custom', name: '任意サイズ', w: 0, h: 0 },
];
const LABELS = {
  none: { text: '', color: '#84919e', name: 'なし' },
  new: { text: '新刊', color: '#ff4b00', name: '新刊' },
  new_set: { text: '新刊セット', color: '#990099', name: '新刊セット' },
  new_work: { text: '新作', color: '#ff4b00', name: '新作' },
  new_music: { text: '新譜', color: '#ff4b00', name: '新譜' },
  new_en: { text: 'New!', color: '#ff4b00', name: 'New!' },
  semi_new: { text: '準新刊', color: '#f6aa00', name: '準新刊' },
  old: { text: '既刊', color: '#005aff', name: '既刊' },
  reprint: { text: '再販', color: '#03af7a', name: '再販' },
  goods: { text: '新グッズ', color: '#f6aa00', name: '新グッズ' },
  goods_std: { text: 'グッズ', color: '#03af7a', name: 'グッズ' },
  limited: { text: '会場限定', color: '#804000', name: '会場限定' },
  consign: { text: '委託', color: '#990099', name: '委託' },
  free: { text: '無料配布', color: '#0072b2', name: '無料配布' },
  few: { text: '残部僅少', color: '#4d5863', name: '残部僅少' },
  custom: { text: '', color: '#ff4b00', name: '自由入力A' },
  custom_b: { text: '', color: '#005aff', name: '自由入力B' },
  custom_c: { text: '', color: '#03af7a', name: '自由入力C' },
};
const SUB_LABELS = {
  none: { text: '', color: '#84919e', name: 'なし' },
  r15: { text: 'R15', color: '#f6aa00', name: 'R15' },
  r18: { text: 'R18', color: '#ff4b00', name: 'R18' },
  r18g: { text: 'R18G', color: '#990099', name: 'R18G' },
  few: { text: '僅少', color: '#4d5863', name: '僅少' },
  custom_x: { text: '', color: '#ff4b00', name: '自由入力X' },
  custom_y: { text: '', color: '#990099', name: '自由入力Y' },
  custom_z: { text: '', color: '#03af7a', name: '自由入力Z' },
};
const SIZES = { 1: '標準', 2: '中', 3: '大1', 4: '大2', 5: '超特大' };
window.PRESETS = PRESETS;
window.LABELS = LABELS;
window.SUB_LABELS = SUB_LABELS;
window.SIZES = SIZES;

const Render = (() => {
  /* ---------- ジャンル別カラーパレット (Ver.0.15 / Ver.0.61 CUD・クラシック切替対応) ---------- */
  const GENRE_PALETTES = {
    // JFLY カラーユニバーサルデザイン推奨配色セット準拠（P型・D型・T型色覚で識別しやすい高コントラスト配色）
    cud: [
      '#ff4b00', // 朱色 (CUD Red / Vermilion)
      '#005aff', // 青 (CUD Blue)
      '#03af7a', // 青緑 (CUD Green)
      '#f6aa00', // オレンジ (CUD Orange)
      '#990099', // 紫 (CUD Purple)
      '#4dc4ff', // 空色 (CUD Sky Blue)
      '#804000', // 茶色 (CUD Brown)
      '#ff8082', // ピンク (CUD Pink)
      '#0072b2', // ディープブルー (Okabe-Ito Blue)
      '#d55e00', // ダークバーミリオン (Okabe-Ito Vermilion)
    ],
    // クラシック（旧標準パレット）
    classic: [
      '#e4007f', // マゼンタピンク
      '#0284c7', // スカイブルー
      '#059669', // エメラルドグリーン
      '#d97706', // アンバーオレンジ
      '#7c3aed', // バイオレットパープル
      '#dc2626', // ルビーレッド
      '#0d9488', // ティール
      '#4f46e5', // インディゴ
      '#ca8a04', // ゴールド
      '#db2777', // フューシャ
    ],
  };
  const GENRE_PALETTE = GENRE_PALETTES.classic;

  function getGenreColor(genreName, fallbackColor = '#e4007f', stOrColors = null) {
    if (!genreName || typeof genreName !== 'string') return fallbackColor;
    let colorMode = 'classic';
    if (stOrColors) {
      if (stOrColors.style && stOrColors.style.colorMode) {
        colorMode = stOrColors.style.colorMode;
      }
      if (stOrColors.genreColors && stOrColors.genreColors[genreName]) {
        return stOrColors.genreColors[genreName];
      }
      if (typeof stOrColors === 'object' && stOrColors[genreName]) {
        return stOrColors[genreName];
      }
    }
    if (typeof window !== 'undefined' && window.state) {
      if (window.state.style && window.state.style.colorMode) {
        colorMode = window.state.style.colorMode;
      }
      if (window.state.genreColors && window.state.genreColors[genreName]) {
        return window.state.genreColors[genreName];
      }
    }
    let hash = 0;
    for (let i = 0; i < genreName.length; i++) {
      hash = (hash * 31 + genreName.charCodeAt(i)) >>> 0;
    }
    const palette = GENRE_PALETTES[colorMode] || GENRE_PALETTES.classic;
    return palette[hash % palette.length];
  }
  function rr(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function hexA(hex, a) {
    let h = (hex || '#000000').replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h, 16) || 0;
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  const num = (v, def) => { const n = Number(v); return Number.isFinite(n) ? n : def; };

  /** 吹き出しのしっぽ向き解決 */
  function resolveTailDir(tailDir, style, textPos) {
    if (tailDir && tailDir !== 'auto') return tailDir;
    if (style === 'speech') return 'bottom';
    if (textPos === 'top') return 'bottom';
    if (textPos === 'left') return 'right';
    if (textPos === 'right') return 'left';
    return 'top'; // bottom, center, free などは上側に画像があるため上向き
  }

  /** しっぽ付き丸吹き出しパス生成（自己交差のない時計回りパス） */
  function buildSpeechBubblePath(ctx, bX, bY, bW, bH, rad, dir, posRatio) {
    ctx.beginPath();
    const clampedRatio = Math.max(0.15, Math.min(0.85, posRatio));
    const tailW = Math.max(10, Math.min(bW, bH) * 0.20);
    const tailL = Math.max(8, Math.min(bW, bH) * 0.16);

    ctx.moveTo(bX + rad, bY);

    // 1. 上辺（左から右）
    if (dir === 'top') {
      const cx = bX + bW * clampedRatio;
      const x1 = Math.max(bX + rad, cx - tailW * 0.5);
      const x2 = Math.min(bX + bW - rad, cx + tailW * 0.5);
      const tipX = cx + (clampedRatio < 0.5 ? -tailL * 0.2 : tailL * 0.2);
      ctx.lineTo(x1, bY);
      ctx.lineTo(tipX, bY - tailL);
      ctx.lineTo(x2, bY);
    }
    ctx.lineTo(bX + bW - rad, bY);
    ctx.arcTo(bX + bW, bY, bX + bW, bY + rad, rad);

    // 2. 右辺（上から下）
    if (dir === 'right') {
      const cy = bY + bH * clampedRatio;
      const y1 = Math.max(bY + rad, cy - tailW * 0.5);
      const y2 = Math.min(bY + bH - rad, cy + tailW * 0.5);
      const tipY = cy + (clampedRatio < 0.5 ? -tailL * 0.2 : tailL * 0.2);
      ctx.lineTo(bX + bW, y1);
      ctx.lineTo(bX + bW + tailL, tipY);
      ctx.lineTo(bX + bW, y2);
    }
    ctx.lineTo(bX + bW, bY + bH - rad);
    ctx.arcTo(bX + bW, bY + bH, bX + bW - rad, bY + bH, rad);

    // 3. 下辺（右から左）
    if (dir === 'bottom') {
      const cx = bX + bW * clampedRatio;
      const x1 = Math.max(bX + rad, cx - tailW * 0.5);
      const x2 = Math.min(bX + bW - rad, cx + tailW * 0.5);
      const tipX = cx + (clampedRatio < 0.5 ? -tailL * 0.2 : tailL * 0.2);
      ctx.lineTo(x2, bY + bH);
      ctx.lineTo(tipX, bY + bH + tailL);
      ctx.lineTo(x1, bY + bH);
    }
    ctx.lineTo(bX + rad, bY + bH);
    ctx.arcTo(bX, bY + bH, bX, bY + bH - rad, rad);

    // 4. 左辺（下から上）
    if (dir === 'left') {
      const cy = bY + bH * clampedRatio;
      const y1 = Math.max(bY + rad, cy - tailW * 0.5);
      const y2 = Math.min(bY + bH - rad, cy + tailW * 0.5);
      const tipY = cy + (clampedRatio < 0.5 ? -tailL * 0.2 : tailL * 0.2);
      ctx.lineTo(bX, y2);
      ctx.lineTo(bX - tailL, tipY);
      ctx.lineTo(bX, y1);
    }
    ctx.lineTo(bX, bY + rad);
    ctx.arcTo(bX, bY, bX + rad, bY, rad);

    ctx.closePath();
  }
  function formatFontFamily(fam) {
    if (!fam) return 'sans-serif';
    return String(fam).split(',').map(part => {
      const f = part.trim();
      if (!f) return '';
      if (/^(sans-serif|serif|monospace|cursive|fantasy|system-ui)$/i.test(f)) {
        return f;
      }
      if ((f.startsWith('"') && f.endsWith('"')) || (f.startsWith("'") && f.endsWith("'"))) {
        return f;
      }
      return `"${f.replace(/"/g, '\\"')}"`;
    }).filter(Boolean).join(', ');
  }
  const F = (w, size, fam) => `${w} ${Math.max(1, size).toFixed(2)}px ${formatFontFamily(fam)}`;
  const NO_START = '、。，．・：；？！ー）」』】〉》〕｝～…ぁぃぅぇぉっゃゅょァィゥェォッャュョ,.!?)]';

  function wrap(ctx, text, maxW, maxLines = 3) {
    const lines = [];
    let cur = '';
    for (const ch of String(text || '')) {
      if (ch === '\n') { lines.push(cur); cur = ''; continue; }
      const t = cur + ch;
      if (ctx.measureText(t).width > maxW && cur && !NO_START.includes(ch)) {
        lines.push(cur);
        cur = ch;
      } else {
        cur = t;
      }
    }
    if (cur) lines.push(cur);
    if (maxLines && lines.length > maxLines) {
      const out = lines.slice(0, maxLines);
      let last = out[maxLines - 1];
      while (last.length > 1 && ctx.measureText(last + '…').width > maxW) {
        last = last.slice(0, -1);
      }
      out[maxLines - 1] = last + '…';
      return out;
    }
    return lines.length ? lines : [''];
  }

  function fitSize(ctx, text, weight, fam, maxSz, maxW, minSz = 8) {
    let sz = maxSz;
    ctx.font = F(weight, sz, fam);
    const w = ctx.measureText(text || '').width;
    if (w > maxW && w > 0) {
      sz = Math.max(minSz, sz * (maxW / w));
    }
    return sz;
  }

  function drawContain(ctx, img, x, y, w, h) {
    if (!img || !img.width || !img.height) return { x, y, w, h };
    const ir = img.width / img.height;
    const br = w / h;
    let dw = w, dh = h;
    if (ir > br) dh = w / ir;
    else dw = h * ir;
    const dx = x + (w - dw) / 2;
    const dy = y + (h - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
    return { x: dx, y: dy, w: dw, h: dh };
  }

  function drawCover(ctx, img, x, y, w, h) {
    if (!img || !img.width || !img.height) return;
    const ir = img.width / img.height;
    const br = w / h;
    let dw = w, dh = h;
    if (ir > br) dw = h * ir;
    else dh = w / ir;
    const dx = x + (w - dw) / 2;
    const dy = y + (h - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function fmtPrice(p) {
    if (p === '' || p == null || isNaN(Number(p))) return '';
    const n = Number(p);
    if (n === 0) return '無料';
    return n.toLocaleString('ja-JP') + '円';
  }

  /** 配置リストとアイテムDBを結合した配列を返す */
  function entries(st) {
    const itemMap = new Map((st.items || []).map(it => [it.id, it]));
    const popMap = new Map((st.pops || []).map(pop => [pop.id, { ...pop, isPop: true, name: pop.title || '（画像POP）' }]));
    const out = [];
    for (const p of (st.placed || [])) {
      if (p.itemId && String(p.itemId).startsWith('pop_')) {
        const pop = popMap.get(p.itemId);
        if (pop) out.push({ placed: p, item: pop, isPop: true, isSpacer: false });
      } else if (p.itemId === 'spacer' || String(p.itemId || '').startsWith('spacer')) {
        out.push({
          placed: p,
          item: { id: 'spacer', name: '（空白枠）', isSpacer: true },
          isPop: false,
          isSpacer: true
        });
      } else {
        const it = itemMap.get(p.itemId);
        if (it) out.push({ placed: p, item: it, isPop: false, isSpacer: false });
      }
    }
    return out;
  }

  /** ラベル情報解決 (Ver.0.28: labelColors対応) */
  function resolveLabel(p, labelColors = null) {
    if (!p || !p.label || p.label === 'none' || !LABELS[p.label]) return null;
    const preset = LABELS[p.label];
    const text = ['custom', 'custom_b', 'custom_c'].includes(p.label) ? (p.labelText || '注目') : preset.text;
    const lColor = (labelColors && labelColors[p.label]) || preset.color || '#ff4b00';
    const color = p.labelColor || lColor;
    if (!text) return null;
    return { text, color };
  }

  /** ラベル補情報解決 (Ver.0.36: 旧r15/r18互換対応) */
  function resolveSubLabel(p, subLabelColors = null) {
    if (!p) return null;
    let key = p.subLabel;
    if ((!key || key === 'none') && (p.label === 'r15' || p.label === 'r18')) {
      key = p.label;
    }
    if (!key || key === 'none') return null;
    const preset = SUB_LABELS[key];
    if (!preset) return null;
    const text = ['custom_x', 'custom_y', 'custom_z'].includes(key) ? (p.subLabelText || '注目') : preset.text;
    const lColor = (subLabelColors && subLabelColors[key]) || preset.color || '#ff4b00';
    const color = p.subLabelColor || lColor;
    if (!text) return null;
    return { text, color };
  }

  /** 背景描画 */
  function drawBackground(ctx, st, W, H, getImg) {
    const B = st.bg || {};
    ctx.save();
    if (B.type === 'solid') {
      ctx.fillStyle = B.color1 || '#ffffff';
      ctx.fillRect(0, 0, W, H);
    } else if (B.type === 'radial') {
      const cx = W * 0.5, cy = H * 0.45, r = Math.hypot(W, H) * 0.65;
      const g = ctx.createRadialGradient(cx, cy, r * 0.05, cx, cy, r);
      g.addColorStop(0, B.color1 || '#fff600');
      g.addColorStop(1, B.color2 || '#ffb300');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    } else {
      const rad = (num(B.angle, 135) * Math.PI) / 180;
      const cx = W / 2, cy = H / 2;
      const len = (Math.abs(W * Math.cos(rad)) + Math.abs(H * Math.sin(rad))) / 2;
      const g = ctx.createLinearGradient(
        cx - Math.cos(rad) * len, cy - Math.sin(rad) * len,
        cx + Math.cos(rad) * len, cy + Math.sin(rad) * len
      );
      g.addColorStop(0, B.color1 || '#ffe3ef');
      g.addColorStop(1, B.color2 || '#fff6cf');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // 背景画像 (B.type === 'image' かつ B.imageId が設定されているとき)
    if (B.type === 'image' && B.imageId) {
      const bgIm = getImg(B.imageId);
      if (bgIm) {
        ctx.save();
        ctx.globalAlpha = num(B.imageOpacity, 1);
        if (B.imageBlur > 0) ctx.filter = `blur(${B.imageBlur}px)`;

        const iw = bgIm.naturalWidth || bgIm.width || 1;
        const ih = bgIm.naturalHeight || bgIm.height || 1;
        const ir = iw / ih;
        const br = W / H;
        const scaleMul = (Number(B.imageScale) || 100) / 100;
        const offsetX = ((Number(B.imageX) || 0) / 100) * (W * 0.5);
        const offsetY = ((Number(B.imageY) || 0) / 100) * (H * 0.5);

        if (B.imageFit === 'tile') {
          const pat = ctx.createPattern(bgIm, 'repeat');
          if (pat) {
            ctx.save();
            ctx.translate(offsetX, offsetY);
            ctx.scale(scaleMul, scaleMul);
            ctx.fillStyle = pat;
            ctx.fillRect(-offsetX / scaleMul, -offsetY / scaleMul, W / scaleMul, H / scaleMul);
            ctx.restore();
          } else {
            drawCover(ctx, bgIm, 0, 0, W, H);
          }
        } else {
          let baseW = W, baseH = H;
          if (B.imageFit === 'contain') {
            if (ir > br) { baseW = W; baseH = W / ir; }
            else { baseH = H; baseW = H * ir; }
          } else if (B.imageFit === 'fill') {
            baseW = W; baseH = H;
          } else {
            // cover (デフォルト)
            if (ir > br) { baseH = H; baseW = H * ir; }
            else { baseW = W; baseH = W / ir; }
          }
          const drawW = baseW * scaleMul;
          const drawH = baseH * scaleMul;
          const drawX = (W - drawW) / 2 + offsetX;
          const drawY = (H - drawH) / 2 + offsetY;
          ctx.drawImage(bgIm, drawX, drawY, drawW, drawH);
        }
        ctx.restore();
      }
    }

    // パターン描画
    const pat = B.pattern || 'none';
    if (pat !== 'none' && num(B.patternOpacity, 0.3) > 0) {
      ctx.save();
      ctx.fillStyle = hexA(B.patternColor || '#ffffff', num(B.patternOpacity, 0.3));
      ctx.strokeStyle = hexA(B.patternColor || '#ffffff', num(B.patternOpacity, 0.3));
      const step = Math.max(18, Math.min(W, H) * 0.014 * (Number(B.patternSize) || 3));
      if (pat === 'dots') {
        const r = step * 0.22;
        for (let y = 0, row = 0; y < H + step; y += step * 0.86, row++) {
          const ox = (row % 2) * (step * 0.5);
          for (let x = ox; x < W + step; x += step) {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (pat === 'grid') {
        ctx.lineWidth = Math.max(1, step * 0.06);
        ctx.beginPath();
        for (let x = 0; x < W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
        for (let y = 0; y < H; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
        ctx.stroke();
      } else if (pat === 'check') {
        const half = step * 0.65;
        for (let y = 0, r = 0; y < H; y += half, r++) {
          for (let x = 0, c = 0; x < W; x += half, c++) {
            if ((r + c) % 2 === 0) ctx.fillRect(x, y, half, half);
          }
        }
      } else if (pat === 'stripes') {
        ctx.lineWidth = step * 0.35;
        const diag = W + H;
        ctx.beginPath();
        for (let d = -H; d < diag; d += step) {
          ctx.moveTo(d, 0);
          ctx.lineTo(d + H, H);
        }
        ctx.stroke();
      } else if (pat === 'rays') {
        const cx = W * 0.5, cy = H * 0.45;
        const maxR = Math.hypot(W, H);
        const count = 36;
        for (let i = 0; i < count; i += 2) {
          const a1 = (i * Math.PI * 2) / count;
          const a2 = ((i + 1) * Math.PI * 2) / count;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, maxR, a1, a2);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // オーバーレイ
    if ((B.overlayOpacity || 0) > 0) {
      ctx.fillStyle = hexA(B.overlayColor || '#ffffff', B.overlayOpacity);
      ctx.fillRect(0, 0, W, H);
    }

    // 外枠フレーム
    if ((B.border || 0) > 0) {
      const bw = Math.min(W, H) * 0.008 * B.border;
      ctx.strokeStyle = B.borderColor || st.style?.accent || '#e4007f';
      ctx.lineWidth = bw;
      ctx.strokeRect(bw / 2, bw / 2, W - bw, H - bw);
    }
    ctx.restore();
  }

  /** 袋文字・視覚効果付きテキスト描画ヘルパー */
  function drawStyledText(ctx, text, x, y, effect, fill, outline, accent, fontSize) {
    ctx.save();
    if (effect === 'pop') {
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeStyle = accent;
      ctx.lineWidth = Math.max(3, fontSize * 0.22);
      ctx.strokeText(text, x + fontSize * 0.05, y + fontSize * 0.06);
      ctx.strokeStyle = outline || '#ffffff';
      ctx.lineWidth = Math.max(2.5, fontSize * 0.16);
      ctx.strokeText(text, x, y);
      ctx.fillStyle = fill;
      ctx.fillText(text, x, y);
    } else if (effect === 'shadow') {
      ctx.shadowColor = 'rgba(0,0,0,0.38)';
      ctx.shadowBlur = fontSize * 0.14;
      ctx.shadowOffsetX = fontSize * 0.05;
      ctx.shadowOffsetY = fontSize * 0.06;
      ctx.strokeStyle = outline || '#ffffff';
      ctx.lineWidth = Math.max(2, fontSize * 0.1);
      ctx.lineJoin = 'round';
      ctx.strokeText(text, x, y);
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = fill;
      ctx.fillText(text, x, y);
    } else if (effect === 'neon') {
      ctx.shadowColor = accent || '#ff007f';
      ctx.shadowBlur = fontSize * 0.35;
      ctx.strokeStyle = outline || '#ffffff';
      ctx.lineWidth = Math.max(2, fontSize * 0.12);
      ctx.lineJoin = 'round';
      ctx.strokeText(text, x, y);
      ctx.fillStyle = fill;
      ctx.fillText(text, x, y);
    } else if (effect === 'flat') {
      ctx.fillStyle = fill;
      ctx.fillText(text, x, y);
    } else {
      ctx.strokeStyle = outline || '#ffffff';
      ctx.lineWidth = Math.max(1.5, fontSize * 0.08);
      ctx.lineJoin = 'round';
      ctx.strokeText(text, x, y);
      ctx.fillStyle = fill;
      ctx.fillText(text, x, y);
    }
    ctx.restore();
  }

  /** 左上ヘッダー（「イベント場所、開催時間、イベント名」「日付、スペース」「（サークル名）お品書き」）描画 */
  function drawHeader(ctx, st, rect) {
    const M = st.meta || {};
    const L = st.layout || {};
    const S = st.style || {};
    const { x, y, w, h } = rect;
    const scale = (Number(L.headerScale) || 100) / 100;
    const hf = S.headingFont || '"M PLUS Rounded 1c", sans-serif';
    const bf = S.bodyFont || '"Noto Sans JP", sans-serif';
    const effect = L.headerEffect || 'shadow';
    const rad = Math.min(w, h) * 0.04 * num(L.headerRadius, 1.5);

    ctx.save();
    // 背景パネル
    if (L.headerPanel !== false) {
      ctx.save();
      if (S.shadow !== false) {
        ctx.shadowColor = 'rgba(0,0,0,0.16)';
        ctx.shadowBlur = Math.min(w, h) * 0.08;
        ctx.shadowOffsetY = Math.min(w, h) * 0.03;
      }
      ctx.fillStyle = hexA(S.headerPanelColor || '#ffffff', num(S.headerPanelOpacity, 0.9));
      rr(ctx, x, y, w, h, rad);
      ctx.fill();
      ctx.lineWidth = Math.max(2, Math.min(w, h) * 0.022);
      ctx.strokeStyle = S.accent || '#e4007f';
      ctx.stroke();

      if (effect === 'stamp') {
        const inPad = Math.max(4, Math.min(w, h) * 0.035);
        ctx.setLineDash([8, 5]);
        ctx.lineWidth = 1.5;
        rr(ctx, x + inPad, y + inPad, w - inPad * 2, h - inPad * 2, Math.max(2, rad - inPad));
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
    }

    const padX = w * 0.04;
    const padY = h * 0.08;
    const iw = Math.max(20, w - padX * 2);
    const ih = Math.max(20, h - padY * 2);

    // 1段目：「イベント場所、開催時間、イベント名」 (Ver.0.30: 表示ON/OFF対応)
    const line1Parts = [];
    if (L.showHeaderPlace === true && M.place) line1Parts.push(M.place);
    if (L.showHeaderTime === true && M.time) line1Parts.push(M.time);
    if (M.eventName) line1Parts.push(M.eventName);
    const line1Text = line1Parts.join(' ／ ');

    // 3段目：「（サークル名）お品書き」
    const circleTitle = `${M.circle ? M.circle + ' ' : ''}お品書き`;

    const isSpaceFocus = (L.headerLayout || 'space_focus') === 'space_focus';

    if (!isSpaceFocus) {
      // ===== 標準レイアウト（デフォルト） =====
      // 2段目：「日付、スペース」（2日連続開催対応）
      let dateSpaceText = [M.date, M.space].filter(Boolean).join('　');
      if (M.twoDays && (M.date2 || M.space2)) {
        const d2 = [M.date2, M.space2 || M.space].filter(Boolean).join(' ');
        dateSpaceText = `1日目: ${dateSpaceText} ／ 2日目: ${d2}`;
      }

      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      // 上段：イベント場所・開催時間・イベント名リボンバー
      const row1H = ih * 0.24;
      const row1Y = y + padY + row1H / 2;
      const tagH = Math.min(row1H * 0.92, ih * 0.25);

      if (line1Text) {
        if (L.showHeaderEventBg !== false) {
          ctx.save();
          ctx.fillStyle = S.accent || '#e4007f';
          rr(ctx, x + padX, row1Y - tagH / 2, iw, tagH, tagH * 0.35);
          ctx.fill();
          const sz1 = fitSize(ctx, line1Text, 700, bf, tagH * 0.62 * scale, iw - tagH * 0.8, 9);
          ctx.font = F(700, sz1, bf);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(line1Text, x + padX + tagH * 0.4, row1Y);
          ctx.restore();
        } else {
          const sz1 = fitSize(ctx, line1Text, 700, bf, tagH * 0.72 * scale, iw, 9);
          ctx.font = F(700, sz1, bf);
          drawStyledText(ctx, line1Text, x + padX, row1Y, effect, S.accent || '#e4007f', S.headerOutline || '#ffffff', '#2b1b33', sz1);
        }
      }

      // 中段：日付＋スペース強調表示
      const row2H = ih * 0.30;
      const row2Y = y + padY + ih * 0.27 + row2H / 2;
      if (dateSpaceText) {
        const sz2 = fitSize(ctx, dateSpaceText, 900, hf, row2H * 0.72 * scale, iw, 10);
        ctx.font = F(900, sz2, hf);
        drawStyledText(ctx, dateSpaceText, x + padX, row2Y, effect, S.accent || '#e4007f', S.headerOutline || '#ffffff', '#2b1b33', sz2);
      }

      // 下段：（サークル名）お品書き 大見出し
      const row3H = ih * 0.42;
      const row3Y = y + padY + ih * 0.58 + row3H / 2;
      const sz3 = fitSize(ctx, circleTitle, 900, hf, row3H * 0.82 * scale, iw, 12);
      ctx.font = F(900, sz3, hf);
      drawStyledText(ctx, circleTitle, x + padX, row3Y, effect, S.headerText || '#3b2340', S.headerOutline || '#ffffff', S.accent || '#e4007f', sz3);

    } else {
      // ===== スペース番号重視レイアウト (Ver.0.30) =====
      // ヘッダー内部を左側エリアと右側特大スペースエリアに分割
      const rightRatio = (num(L.headerSpaceWidth, 36)) / 100;
      const rightW = iw * rightRatio;
      const leftW = iw * Math.max(0.25, 0.97 - rightRatio);
      const rightX = x + padX + iw - rightW;

      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      // --- 左側エリア ---
      // 1段目（上部）：イベント情報
      const row1H = ih * 0.24;
      const row1Y = y + padY + row1H / 2;
      const tagH = Math.min(row1H * 0.92, ih * 0.25);

      if (line1Text) {
        if (L.showHeaderEventBg !== false) {
          ctx.save();
          ctx.fillStyle = S.accent || '#e4007f';
          rr(ctx, x + padX, row1Y - tagH / 2, leftW, tagH, tagH * 0.35);
          ctx.fill();
          const sz1 = fitSize(ctx, line1Text, 700, bf, tagH * 0.62 * scale, leftW - tagH * 0.8, 9);
          ctx.font = F(700, sz1, bf);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(line1Text, x + padX + tagH * 0.4, row1Y);
          ctx.restore();
        } else {
          const sz1 = fitSize(ctx, line1Text, 700, bf, tagH * 0.72 * scale, leftW, 9);
          ctx.font = F(700, sz1, bf);
          drawStyledText(ctx, line1Text, x + padX, row1Y, effect, S.accent || '#e4007f', S.headerOutline || '#ffffff', '#2b1b33', sz1);
        }
      }

      // 2段目（中段）：開催日（スペース番号は右側にあるため日付のみスッキリ表示）
      let dateOnlyText = M.date || '';
      if (M.twoDays && M.date2) {
        dateOnlyText = `1日目: ${M.date || ''} ／ 2日目: ${M.date2}`;
      }
      const row2H = ih * 0.26;
      const row2Y = y + padY + ih * 0.28 + row2H / 2;
      if (dateOnlyText) {
        const sz2 = fitSize(ctx, dateOnlyText, 900, hf, row2H * 0.72 * scale, leftW, 10);
        ctx.font = F(900, sz2, hf);
        drawStyledText(ctx, dateOnlyText, x + padX, row2Y, effect, S.accent || '#e4007f', S.headerOutline || '#ffffff', '#2b1b33', sz2);
      }

      // 3段目（下段）：（サークル名）お品書き 大見出し
      const row3H = ih * 0.44;
      const row3Y = y + padY + ih * 0.55 + row3H / 2;
      const sz3 = fitSize(ctx, circleTitle, 900, hf, row3H * 0.82 * scale, leftW, 12);
      ctx.font = F(900, sz3, hf);
      drawStyledText(ctx, circleTitle, x + padX, row3Y, effect, S.headerText || '#3b2340', S.headerOutline || '#ffffff', S.accent || '#e4007f', sz3);

      // --- 右側特大スペース番号エリア ---
      const boxH = ih * 0.96;
      const boxY = y + padY + (ih - boxH) / 2;
      const boxRad = Math.max(8, Math.min(rightW, boxH) * 0.12);

      const showBg = L.showHeaderSpaceBg === true;
      const showBorder = L.showHeaderSpaceBorder === true;
      const spScale = (Number(L.headerSpaceScale) || 100) / 100;

      ctx.save();
      if (showBg) {
        // 目立つバッジ枠プレート
        ctx.shadowColor = 'rgba(0,0,0,0.22)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;

        const spGrad = ctx.createLinearGradient(rightX, boxY, rightX, boxY + boxH);
        spGrad.addColorStop(0, hexA(S.accent || '#e4007f', 0.12));
        spGrad.addColorStop(1, hexA(S.accent || '#e4007f', 0.26));
        ctx.fillStyle = spGrad;
        rr(ctx, rightX, boxY, rightW, boxH, boxRad);
        ctx.fill();
        ctx.shadowColor = 'transparent';
      }

      if (showBorder) {
        ctx.strokeStyle = S.accent || '#e4007f';
        ctx.lineWidth = Math.max(2.5, Math.min(rightW, boxH) * 0.03);
        rr(ctx, rightX, boxY, rightW, boxH, boxRad);
        ctx.stroke();
      }

      // スペース番号文字の描画
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 地色なし（showBg === false）の時は背景と同化しないよう文字色に S.headerText、輪郭に S.headerOutline を使用
      const spFillColor = showBg ? (S.accent || '#e4007f') : (S.headerText || '#22181c');
      const spOutlineColor = S.headerOutline || '#ffffff';

      const hasDiffSpace = M.twoDays && M.space2 && M.space2 !== M.space;
      if (hasDiffSpace) {
        // 2日開催でスペースが異なる場合（2行表示）
        const sp1Text = `1日目: ${M.space || ''}`;
        const sp2Text = `2日目: ${M.space2 || ''}`;
        const spLineH = boxH * 0.44;
        const spSz = Math.min(
          fitSize(ctx, sp1Text, 900, hf, spLineH * 0.70 * scale * spScale, rightW * 0.88, 11),
          fitSize(ctx, sp2Text, 900, hf, spLineH * 0.70 * scale * spScale, rightW * 0.88, 11)
        );
        ctx.font = F(900, spSz, hf);
        drawStyledText(ctx, sp1Text, rightX + rightW / 2, boxY + boxH * 0.30, effect, spFillColor, spOutlineColor, '#1a1a1a', spSz);
        drawStyledText(ctx, sp2Text, rightX + rightW / 2, boxY + boxH * 0.72, effect, spFillColor, spOutlineColor, '#1a1a1a', spSz);
      } else {
        // 単日または同一スペース（小バッジを省き、天地中央に大きく広く特大表示）
        const spaceText = M.space || '';
        if (spaceText) {
          const spSz = fitSize(ctx, spaceText, 900, hf, boxH * 0.72 * scale * spScale, rightW * 0.92, 14);
          ctx.font = F(900, spSz, hf);
          drawStyledText(ctx, spaceText, rightX + rightW / 2, boxY + boxH * 0.5, effect, spFillColor, spOutlineColor, '#1a1a1a', spSz);
        }
      }
      ctx.restore();
    }

    ctx.restore();
  }

  /** HEXカラー簡易輝度計算 (0-255) */
  function getHexLuminance(hex) {
    let h = (hex || '#000000').replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h, 16) || 0;
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  /** ラベル（新刊・既刊・自由入力など）の描画 */
  function drawLabelBadge(ctx, lbl, style, x, y, w, h, fontFam, slot = 0, cfg = {}) {
    if (!lbl || !lbl.text) return;
    const scale = Math.max(0.4, Math.min(2.0, (Number(cfg.labelScale) || 100) / 100));
    const textScale = Math.max(0.5, Math.min(2.0, (Number(cfg.labelTextScale) || 100) / 100));
    const angleDeg = Number(cfg.labelAngle) || 0;
    const angleRad = (angleDeg * Math.PI) / 180;
    const posRaw = cfg.labelPosition || 'auto';
    const pos = (posRaw && posRaw !== 'auto') ? posRaw : (style === 'tag' ? 'tr' : 'tl');
    const isRight = pos === 'tr' || pos === 'br';
    const isBottom = pos === 'bl' || pos === 'br';
    const borderMode = cfg.labelBorder || 'auto';
    const borderScale = Math.max(0.2, Math.min(3.0, (Number(cfg.labelBorderWidth) || 100) / 100));
    const useShadow = cfg.labelShadow !== false;
    const cardRad = Number(cfg.cardRad) || 0;

    const rawBase = Math.min(w, h);
    const base = rawBase * scale;

    const hasBorder = def => borderMode === 'on' ? true : (borderMode === 'off' ? false : def);
    const applyShadow = (blur = 4, alpha = 0.22) => {
      if (useShadow) {
        ctx.shadowColor = `rgba(0,0,0,${alpha})`;
        ctx.shadowBlur = blur;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
    };
    const clearShadow = () => {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    };
    const drawTextFit = (text, tx, ty, targetSz, maxLimit, maxW, color = '#ffffff', minFont = 7) => {
      const desired = Math.min(maxLimit, targetSz * textScale);
      const sz = fitSize(ctx, text, 900, fontFam, desired, maxW, minFont);
      ctx.font = F(900, sz, fontFam);
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const measuredW = ctx.measureText(text).width;
      if (measuredW > maxW && measuredW > 0) {
        ctx.save();
        ctx.translate(tx, ty);
        ctx.scale(maxW / measuredW, 1);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      } else {
        ctx.fillText(text, tx, ty);
      }
    };

    ctx.save();
    if (style === 'ribbon') {
      const rw = Math.min(w * 0.48, Math.min(w * 0.46 * Math.max(1, scale), Math.max(base * 0.42, 64 * scale)));
      const rh = Math.max(18 * scale, base * 0.15);
      const gapY = Math.max(4, base * 0.025);
      const cx = isRight ? (x + w + base * 0.02 - rw / 2) : (x - base * 0.02 + rw / 2);
      const cy = isBottom
        ? (y + h - base * 0.04 - rh / 2 - (slot === 1 ? rh + gapY : 0))
        : (y + base * 0.04 + rh / 2 + (slot === 1 ? rh + gapY : 0));
      const hw = rw / 2, hh = rh / 2;

      ctx.translate(cx, cy);
      if (angleRad) ctx.rotate(angleRad);
      applyShadow(4, 0.22);
      ctx.fillStyle = lbl.color;
      ctx.beginPath();
      if (isRight) {
        ctx.moveTo(hw, -hh);
        ctx.lineTo(-hw, -hh);
        ctx.lineTo(-hw + rh * 0.35, 0);
        ctx.lineTo(-hw, hh);
        ctx.lineTo(hw, hh);
      } else {
        ctx.moveTo(-hw, -hh);
        ctx.lineTo(hw, -hh);
        ctx.lineTo(hw - rh * 0.35, 0);
        ctx.lineTo(hw, hh);
        ctx.lineTo(-hw, hh);
      }
      ctx.closePath();
      ctx.fill();
      clearShadow();
      if (hasBorder(false)) {
        ctx.lineWidth = Math.max(1.5, rh * 0.08) * borderScale;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }
      drawTextFit(lbl.text, isRight ? (rh * 0.1) : (-rh * 0.1), 0, rh * 0.66, rh * 0.86, rw - rh * 0.6, '#ffffff', 8);
    } else if (style === 'round_rect') {
      // round_rect: 角丸長方形バッジ
      const rw = Math.min(w * 0.48, Math.min(w * 0.44 * Math.max(1, scale), Math.max(base * 0.38, 56 * scale)));
      const rh = Math.max(18 * scale, base * 0.14);
      const margin = rawBase * 0.03;
      const gapY = Math.max(4, base * 0.025);
      const cx = isRight ? (x + w - margin - rw / 2) : (x + margin + rw / 2);
      const cy = isBottom
        ? (y + h - margin - rh / 2 - (slot === 1 ? rh + gapY : 0))
        : (y + margin + rh / 2 + (slot === 1 ? rh + gapY : 0));
      const rad = Math.min(rh * 0.35, 8 * scale);

      ctx.translate(cx, cy);
      if (angleRad) ctx.rotate(angleRad);
      applyShadow(4, 0.22);
      ctx.fillStyle = lbl.color;
      rr(ctx, -rw / 2, -rh / 2, rw, rh, rad);
      ctx.fill();
      clearShadow();
      if (hasBorder(true)) {
        ctx.lineWidth = Math.max(2, rh * 0.08) * borderScale;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }
      drawTextFit(lbl.text, 0, 0, rh * 0.62, rh * 0.86, rw - rh * 0.4, '#ffffff', 7);
    } else if (style === 'circle') {
      const r = Math.max(18 * scale, base * 0.15);
      const cx = isRight ? (x + w - r * 0.95) : (x + r * 0.95);
      const cy = isBottom
        ? (y + h - r * 0.95 - (slot === 1 ? r * 2.05 : 0))
        : (y + r * 0.95 + (slot === 1 ? r * 2.05 : 0));

      ctx.translate(cx, cy);
      if (angleRad) ctx.rotate(angleRad);
      applyShadow(5, 0.25);
      ctx.fillStyle = lbl.color;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      clearShadow();
      if (hasBorder(true)) {
        ctx.lineWidth = Math.max(2, r * 0.1) * borderScale;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }
      drawTextFit(lbl.text, 0, 0, r * 0.72, r * 0.96, r * 1.68, '#ffffff', 7);
    } else if (style === 'tag') {
      // tag: 荷札・ブックマーク風タグ
      const tw = Math.min(w * 0.43, Math.min(w * 0.38 * Math.max(1, scale), Math.max(base * 0.34, 56 * scale)));
      const th = Math.max(16 * scale, base * 0.135);
      const margin = rawBase * 0.03;
      const cx = isRight
        ? (x + w - margin - tw / 2 - (slot === 1 ? tw + 6 : 0))
        : (x + margin + tw / 2 + (slot === 1 ? tw + 6 : 0));
      const cy = isBottom ? (y + h - margin - th / 2) : (y + margin + th / 2);
      const hw = tw / 2, hh = th / 2;
      const cut = th * 0.35;
      const cr = Math.min(3, hh * 0.5);

      ctx.translate(cx, cy);
      if (angleRad) ctx.rotate(angleRad);
      applyShadow(4, 0.22);
      ctx.fillStyle = lbl.color;
      ctx.beginPath();
      if (isRight) {
        ctx.moveTo(-hw + cut, -hh);
        ctx.lineTo(hw - cr, -hh);
        ctx.arcTo(hw, -hh, hw, -hh + cr, cr);
        ctx.lineTo(hw, hh - cr);
        ctx.arcTo(hw, hh, hw - cr, hh, cr);
        ctx.lineTo(-hw + cut, hh);
        ctx.lineTo(-hw, 0);
      } else {
        ctx.moveTo(hw - cut, -hh);
        ctx.lineTo(-hw + cr, -hh);
        ctx.arcTo(-hw, -hh, -hw, -hh + cr, cr);
        ctx.lineTo(-hw, hh - cr);
        ctx.arcTo(-hw, hh, -hw + cr, hh, cr);
        ctx.lineTo(hw - cut, hh);
        ctx.lineTo(hw, 0);
      }
      ctx.closePath();
      ctx.fill();
      clearShadow();
      if (hasBorder(false)) {
        ctx.lineWidth = Math.max(1.5, th * 0.08) * borderScale;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }
      // ハトメ穴
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      const holeX = isRight ? (-hw + cut * 0.85) : (hw - cut * 0.85);
      ctx.arc(holeX, 0, Math.max(2, th * 0.12), 0, Math.PI * 2);
      ctx.fill();

      drawTextFit(lbl.text, isRight ? (cut * 0.4) : (-cut * 0.4), 0, th * 0.62, th * 0.84, tw - cut * 1.5, '#ffffff', 7);
    } else if (style === 'heart') {
      // heart: ハート型（かわいい・推し活風）
      const r = Math.max(19 * scale, base * 0.155);
      const cx = isRight ? (x + w - r * 1.0) : (x + r * 1.0);
      const cy = isBottom
        ? (y + h - r * 1.0 - (slot === 1 ? r * 2.05 : 0))
        : (y + r * 1.0 + (slot === 1 ? r * 2.05 : 0));

      ctx.translate(cx, cy);
      if (angleRad) ctx.rotate(angleRad);
      applyShadow(5, 0.25);
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.42);
      ctx.bezierCurveTo(-r * 0.50, -r * 1.05, -r * 1.18, -r * 0.58, -r * 1.08, -r * 0.04);
      ctx.bezierCurveTo(-r * 1.00,  r * 0.45, -r * 0.36,  r * 0.72,  0,        r * 0.94);
      ctx.bezierCurveTo( r * 0.36,  r * 0.72,  r * 1.00,  r * 0.45,  r * 1.08, -r * 0.04);
      ctx.bezierCurveTo( r * 1.18, -r * 0.58,  r * 0.50, -r * 1.05,  0,       -r * 0.42);
      ctx.closePath();
      ctx.fillStyle = lbl.color;
      ctx.fill();
      clearShadow();
      if (hasBorder(true)) {
        ctx.lineWidth = Math.max(2, r * 0.1) * borderScale;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }
      drawTextFit(lbl.text, 0, -r * 0.02, r * 0.62, r * 0.80, r * 1.50, '#ffffff', 7);
    } else if (style === 'corner_band') {
      // corner_band: コーナー斜め帯（角を斜めに横切る帯）
      if (cardRad > 0) {
        rr(ctx, x, y, w, h, cardRad);
      } else {
        ctx.beginPath();
        ctx.rect(x, y, w, h);
      }
      ctx.clip();

      const bandH = Math.max(15 * scale, base * 0.135);
      const baseDist = Math.max(24 * scale, base * 0.24);
      const dist = baseDist + (slot === 1 ? (bandH + Math.max(3, rawBase * 0.025)) : 0);
      const sx = isRight ? -1 : 1;
      const sy = isBottom ? -1 : 1;
      const cx = (isRight ? x + w : x) + sx * dist * Math.SQRT1_2;
      const cy = (isBottom ? y + h : y) + sy * dist * Math.SQRT1_2;
      const baseRot = (pos === 'tl' || pos === 'br') ? -Math.PI / 4 : Math.PI / 4;
      const bandLen = (dist + bandH) * 3.4;

      ctx.translate(cx, cy);
      ctx.rotate(baseRot + angleRad);
      applyShadow(4, 0.25);
      ctx.fillStyle = lbl.color;
      ctx.fillRect(-bandLen / 2, -bandH / 2, bandLen, bandH);
      clearShadow();
      if (hasBorder(true)) {
        const bw = Math.max(1.5, bandH * 0.1) * borderScale;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = bw;
        ctx.beginPath();
        ctx.moveTo(-bandLen / 2, -bandH / 2);
        ctx.lineTo(bandLen / 2, -bandH / 2);
        ctx.moveTo(-bandLen / 2, bandH / 2);
        ctx.lineTo(bandLen / 2, bandH / 2);
        ctx.stroke();
      }
      const maxW = Math.max(18, (dist - bandH * 0.5) * 1.75);
      drawTextFit(lbl.text, 0, 0, bandH * 0.64, bandH * 0.84, maxW, '#ffffff', 7);
    } else if (style === 'stamp') {
      // stamp: スタンプ・検印風（二重枠・ハンコ調）
      const r = Math.max(18 * scale, base * 0.155);
      const cx = isRight ? (x + w - r * 0.95) : (x + r * 0.95);
      const cy = isBottom
        ? (y + h - r * 0.95 - (slot === 1 ? r * 2.05 : 0))
        : (y + r * 0.95 + (slot === 1 ? r * 2.05 : 0));
      const baseRot = isRight ? 0.22 : -0.22;
      const isTooBright = getHexLuminance(lbl.color) > 165;

      ctx.translate(cx, cy);
      ctx.rotate(baseRot + angleRad);

      applyShadow(4, 0.20);
      ctx.fillStyle = isTooBright ? 'rgba(30, 32, 44, 0.90)' : 'rgba(255, 255, 255, 0.92)';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      clearShadow();

      if (hasBorder(true)) {
        ctx.strokeStyle = isTooBright ? 'rgba(255,255,255,0.4)' : '#ffffff';
        ctx.lineWidth = Math.max(2, r * 0.09) * borderScale;
        ctx.stroke();
      }

      // 外枠・内枠の二重円
      ctx.strokeStyle = lbl.color;
      ctx.lineWidth = Math.max(2, r * 0.11) * borderScale;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.90, 0, Math.PI * 2);
      ctx.stroke();

      ctx.lineWidth = Math.max(1, r * 0.045) * borderScale;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.74, 0, Math.PI * 2);
      ctx.stroke();

      // 検印風の上下区切り線
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = Math.max(1, r * 0.035) * borderScale;
      ctx.beginPath();
      ctx.moveTo(-r * 0.50, -r * 0.34);
      ctx.lineTo(r * 0.50, -r * 0.34);
      ctx.moveTo(-r * 0.50, r * 0.34);
      ctx.lineTo(r * 0.50, r * 0.34);
      ctx.stroke();
      ctx.restore();

      drawTextFit(lbl.text, 0, 0, r * 0.62, r * 0.78, r * 1.32, lbl.color, 7);
    } else {
      // star: ギザギザ爆弾POP
      const rOut = Math.max(20 * scale, base * 0.165);
      const rIn = rOut * 0.76;
      const cx = isRight ? (x + w - rOut * 0.92) : (x + rOut * 0.92);
      const cy = isBottom
        ? (y + h - rOut * 0.92 - (slot === 1 ? rOut * 2.05 : 0))
        : (y + rOut * 0.92 + (slot === 1 ? rOut * 2.05 : 0));
      const spikes = 14;

      ctx.translate(cx, cy);
      if (angleRad) ctx.rotate(angleRad);
      applyShadow(5, 0.25);
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? rOut : rIn;
        const a = (i * Math.PI) / spikes - Math.PI / 2;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = lbl.color;
      ctx.fill();
      clearShadow();
      if (hasBorder(true)) {
        ctx.lineWidth = Math.max(2, rOut * 0.09) * borderScale;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }
      ctx.rotate(-0.12);
      drawTextFit(lbl.text, 0, 0, rIn * 0.75, rIn * 0.98, rIn * 1.68, '#ffffff', 7);
    }
    ctx.restore();
  }

  /** メインラベルとサブラベル（ラベル補）をまとめて描画 */
  function drawPlacedLabels(ctx, lbl, subLbl, labelStyle, x, y, w, h, hf, cfg) {
    if (lbl && subLbl) {
      drawLabelBadge(ctx, lbl, labelStyle, x, y, w, h, hf, 0, cfg);
      drawLabelBadge(ctx, subLbl, labelStyle, x, y, w, h, hf, 1, cfg);
    } else if (lbl) {
      drawLabelBadge(ctx, lbl, labelStyle, x, y, w, h, hf, 0, cfg);
    } else if (subLbl) {
      drawLabelBadge(ctx, subLbl, labelStyle, x, y, w, h, hf, 0, cfg);
    }
  }

  /** 書影がない場合のプレースホルダー表紙描画 */
  function drawPlaceholderCover(ctx, item, x, y, w, h, accent, fontFam) {
    ctx.save();
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, hexA(accent || '#e4007f', 0.18));
    g.addColorStop(1, hexA(accent || '#e4007f', 0.06));
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = hexA(accent || '#e4007f', 0.45);
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

    ctx.fillStyle = accent || '#e4007f';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const sz = Math.max(9, Math.min(w, h) * 0.13);
    ctx.font = F(700, sz, fontFam);
    const lines = wrap(ctx, item.name || 'NO IMAGE', w * 0.84, 3);
    const lh = sz * 1.3;
    const sy = y + h / 2 - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => ctx.fillText(ln, x + w / 2, sy + i * lh));
    ctx.restore();
  }

  /** 売り文句POPカード専用描画 (Ver.0.29: 新デザイン3種・画像配置・トリミング・吹き出し対応) */
  function drawPopCard(ctx, st, card, getImgOrOpts, maybeOpts) {
    const getImg = typeof getImgOrOpts === 'function' ? getImgOrOpts : null;
    const opts = typeof getImgOrOpts === 'object' && getImgOrOpts !== null ? getImgOrOpts : (maybeOpts || {});

    const { x, y, w, h } = card;
    const pop = card.item || {};
    const placed = card.placed || {};
    const hf = st.style?.headingFont || '"M PLUS Rounded 1c", sans-serif';
    const bf = st.style?.bodyFont || '"Noto Sans JP", sans-serif';
    const S = st.style || {};

    const style = pop.style || 'burst';
    const bgColor = pop.bgColor || S.accent || '#e4007f';
    const textColor = pop.textColor || '#ffffff';
    const imageId = pop.imageId || '';
    const rawTitle = (pop.title ?? '').trim();
    const title = rawTitle ? String(pop.title) : (imageId ? '' : 'おすすめPOP！');
    const sub = (pop.sub ?? '').trim();
    const titleFit = pop.titleFit || 'condense1';

    // Ver.0.29 拡張プロパティ
    const showBg = pop.showBg !== false;
    const imgScale = Number(pop.imgScale) || 100;
    const imgX = Number(pop.imgX) || 0;
    const imgY = Number(pop.imgY) || 0;
    const textPos = pop.textPos || 'bottom';
    const textX = Number(pop.textX) || 0;
    const textY = Number(pop.textY) || 0;
    const bubble = pop.bubble || 'round';
    const tailDir = pop.tailDir || 'auto';
    const tailPos = num(pop.tailPos, 35);

    ctx.save();

    // 1. 背景・枠線の描画（showBg が true の場合）
    if (showBg) {
      if (style === 'burst') {
        // 💥 ギザギザ爆弾POP風（目玉アピール）
        const cx = x + w / 2;
        const cy = y + h / 2;
        const rx = (w / 2) * 0.94;
        const ry = (h / 2) * 0.94;
        const points = 24;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;

        ctx.beginPath();
        for (let i = 0; i < points; i++) {
          const angle = (i * 2 * Math.PI) / points - Math.PI / 2;
          const radFactor = (i % 2 === 0) ? 1.0 : 0.82;
          const px = cx + rx * radFactor * Math.cos(angle);
          const py = cy + ry * radFactor * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        ctx.fillStyle = bgColor;
        ctx.fill();
        ctx.shadowColor = 'transparent';

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(3, Math.min(w, h) * 0.022);
        ctx.stroke();

        ctx.strokeStyle = hexA(bgColor, 0.4);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

      } else if (style === 'banner') {
        // 🎗️ 強調リボンバナー風（太帯グラデーション）
        const rad = Math.max(8, Math.min(w, h) * 0.04);
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;

        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, bgColor);
        grad.addColorStop(1, hexA(bgColor, 0.82));
        ctx.fillStyle = grad;
        rr(ctx, x + 2, y + 2, w - 4, h - 4, rad);
        ctx.fill();
        ctx.shadowColor = 'transparent';

        // 上下アクセント太ライン
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2.5, Math.min(w, h) * 0.016);
        ctx.beginPath();
        ctx.moveTo(x + rad, y + 8);
        ctx.lineTo(x + w - rad, y + 8);
        ctx.moveTo(x + rad, y + h - 8);
        ctx.lineTo(x + w - rad, y + h - 8);
        ctx.stroke();

        // 斜めストライプ装飾
        ctx.save();
        rr(ctx, x + 2, y + 2, w - 4, h - 4, rad);
        ctx.clip();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 8;
        for (let sx = -h; sx < w + h; sx += 24) {
          ctx.beginPath();
          ctx.moveTo(x + sx, y);
          ctx.lineTo(x + sx + h, y + h);
          ctx.stroke();
        }
        ctx.restore();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        rr(ctx, x + 2, y + 2, w - 4, h - 4, rad);
        ctx.stroke();
        ctx.restore();

      } else if (style === 'ticket') {
        // 🎟️ レトロチケット・クーポン風 (Ver.0.29)
        const cr = Math.max(8, Math.min(w, h) * 0.085);
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;

        function drawTicketPath(c, tx, ty, tw, th, r) {
          c.beginPath();
          c.moveTo(tx + r, ty);
          c.lineTo(tx + tw - r, ty);
          c.arc(tx + tw, ty, r, Math.PI, Math.PI * 0.5, true);
          c.lineTo(tx + tw, ty + th - r);
          c.arc(tx + tw, ty + th, r, Math.PI * 1.5, Math.PI, true);
          c.lineTo(tx + r, ty + th);
          c.arc(tx, ty + th, r, 0, Math.PI * 1.5, true);
          c.lineTo(tx, ty + r);
          c.arc(tx, ty, r, Math.PI * 0.5, 0, true);
          c.closePath();
        }

        drawTicketPath(ctx, x + 2, y + 2, w - 4, h - 4, cr);
        ctx.fillStyle = bgColor;
        ctx.fill();
        ctx.shadowColor = 'transparent';

        // 白い外枠細線
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        drawTicketPath(ctx, x + 2, y + 2, w - 4, h - 4, cr);
        ctx.stroke();

        // 内側の破線ステッチ
        const pad = Math.max(5, Math.min(w, h) * 0.04);
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        drawTicketPath(ctx, x + pad, y + pad, w - pad * 2, h - pad * 2, Math.max(4, cr - pad * 0.5));
        ctx.stroke();
        ctx.restore();

        // 左右のミシン目ノッチ（丸いくり抜きアクセント）
        const notchR = Math.max(5, Math.min(w, h) * 0.04);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(x + 2, y + h / 2, notchR, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + w - 2, y + h / 2, notchR, Math.PI / 2, -Math.PI / 2);
        ctx.fill();

        ctx.restore();

      } else if (style === 'speech') {
        // 💬 コミック吹き出し・セリフ風 (Ver.0.29 / Ver.0.35)
        const rad = Math.max(10, Math.min(w, h) * 0.065);
        const tailH = Math.max(10, Math.min(w, h) * 0.08);
        const effDir = resolveTailDir(tailDir, style, textPos);
        const posRatio = (num(tailPos, 35)) / 100;

        let bX = x + 3, bY = y + 3, bW = w - 6, bH = h - 6;
        if (effDir === 'bottom') {
          bH -= tailH;
        } else if (effDir === 'top') {
          bY += tailH;
          bH -= tailH;
        } else if (effDir === 'right') {
          bW -= tailH;
        } else if (effDir === 'left') {
          bX += tailH;
          bW -= tailH;
        }

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        buildSpeechBubblePath(ctx, bX, bY, bW, bH, rad, effDir, posRatio);

        ctx.fillStyle = bgColor;
        ctx.fill();
        ctx.shadowColor = 'transparent';

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(3, Math.min(w, h) * 0.022);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();

      } else if (style === 'glass') {
        // ✨ モダン・グラスタグ風 (Ver.0.29)
        const rad = Math.max(8, Math.min(w, h) * 0.04);
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;

        // 半透明ベースプレート
        const baseGrad = ctx.createLinearGradient(x, y, x + w, y + h);
        baseGrad.addColorStop(0, 'rgba(255, 255, 255, 0.94)');
        baseGrad.addColorStop(1, 'rgba(240, 243, 248, 0.88)');
        ctx.fillStyle = baseGrad;
        rr(ctx, x + 2, y + 2, w - 4, h - 4, rad);
        ctx.fill();
        ctx.shadowColor = 'transparent';

        // 左端アクセントカラーバー
        const barW = Math.max(6, Math.min(w, h) * 0.05);
        ctx.save();
        rr(ctx, x + 2, y + 2, w - 4, h - 4, rad);
        ctx.clip();
        ctx.fillStyle = bgColor;
        ctx.fillRect(x + 2, y + 2, barW, h - 4);

        // 斜め光沢ハイライト
        const glossGrad = ctx.createLinearGradient(x, y, x + w * 0.7, y + h);
        glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        glossGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.15)');
        glossGrad.addColorStop(0.36, 'rgba(255, 255, 255, 0)');
        glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glossGrad;
        ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
        ctx.restore();

        // 外枠
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.5;
        rr(ctx, x + 2, y + 2, w - 4, h - 4, rad);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;
        rr(ctx, x + 3, y + 3, w - 6, h - 6, rad);
        ctx.stroke();

        ctx.restore();

      } else if (style === 'image_pop') {
        // 🖼️ 画像配置・キャラPOP用背景 (Ver.0.29)
        const rad = Math.max(8, Math.min(w, h) * 0.04);
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;

        const bgGrad = ctx.createLinearGradient(x, y, x, y + h);
        bgGrad.addColorStop(0, hexA(bgColor, 0.18));
        bgGrad.addColorStop(1, hexA(bgColor, 0.06));
        ctx.fillStyle = bgGrad;
        rr(ctx, x + 2, y + 2, w - 4, h - 4, rad);
        ctx.fill();
        ctx.shadowColor = 'transparent';

        ctx.strokeStyle = hexA(bgColor, 0.6);
        ctx.lineWidth = 2;
        rr(ctx, x + 2, y + 2, w - 4, h - 4, rad);
        ctx.stroke();
        ctx.restore();

      } else if (style === 'simple_white') {
        // ⬜ シンプル白地
        const rad = Math.max(6, Math.min(w, h) * 0.035);
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = bgColor || '#ffffff';
        rr(ctx, x + 2, y + 2, w - 4, h - 4, rad);
        ctx.fill();
        ctx.shadowColor = 'transparent';

        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1.5;
        rr(ctx, x + 2, y + 2, w - 4, h - 4, rad);
        ctx.stroke();
        ctx.restore();

      } else if (style === 'simple_black') {
        // ⬛ シンプル黒地
        const rad = Math.max(6, Math.min(w, h) * 0.035);
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = bgColor || '#161616';
        rr(ctx, x + 2, y + 2, w - 4, h - 4, rad);
        ctx.fill();
        ctx.shadowColor = 'transparent';

        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1.5;
        rr(ctx, x + 2, y + 2, w - 4, h - 4, rad);
        ctx.stroke();
        ctx.restore();

      } else {
        // 🪧 ネオン看板・POP枠風（二重発光フレーム）
        const rad = Math.max(8, Math.min(w, h) * 0.035);
        ctx.save();
        ctx.fillStyle = 'rgba(15, 12, 24, 0.94)';
        rr(ctx, x + 2, y + 2, w - 4, h - 4, rad);
        ctx.fill();

        // 外側ネオン発光枠
        ctx.shadowColor = bgColor;
        ctx.shadowBlur = 14;
        ctx.strokeStyle = bgColor;
        ctx.lineWidth = Math.max(3, Math.min(w, h) * 0.018);
        rr(ctx, x + 5, y + 5, w - 10, h - 10, rad * 0.85);
        ctx.stroke();

        // 内側細線
        ctx.shadowBlur = 4;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        rr(ctx, x + 9, y + 9, w - 18, h - 18, rad * 0.7);
        ctx.stroke();
        ctx.shadowColor = 'transparent';

        // コーナー飾りピン
        const dotR = Math.max(2.5, Math.min(w, h) * 0.012);
        ctx.fillStyle = '#ffffff';
        for (const [dx, dy] of [[12, 12], [w - 12, 12], [12, h - 12], [w - 12, h - 12]]) {
          ctx.beginPath();
          ctx.arc(x + dx, y + dy, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // 2. 画像の描画（imageId が存在する場合） (Ver.0.32: contain基準・直接取得)
    if (imageId) {
      const img = getImg ? getImg(imageId) : (typeof Images !== 'undefined' ? Images.get(imageId) : null);

      if (img && (img.complete || img.width)) {
        ctx.save();
        const clipRad = Math.max(6, Math.min(w, h) * 0.035);
        rr(ctx, x + 2, y + 2, w - 4, h - 4, clipRad);
        ctx.clip();

        const iw = img.naturalWidth || img.width || 1;
        const ih = img.naturalHeight || img.height || 1;
        const baseScale = Math.min(w / iw, h / ih);
        const curScale = baseScale * (imgScale / 100);
        const drawW = iw * curScale;
        const drawH = ih * curScale;

        const offsetX = (imgX / 100) * (w * 0.5);
        const offsetY = (imgY / 100) * (h * 0.5);
        const drawX = x + (w - drawW) / 2 + offsetX;
        const drawY = y + (h - drawH) / 2 + offsetY;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();
      }
    }

    // 3. テキスト＆吹き出し描画 (Ver.0.33: title または sub がある場合のみ描画)
    if (title || sub) {
      // 3. テキスト＆吹き出し描画
    // 画像がなく標準レイアウトの場合は従来のフルカードレイアウトを適用
    const isCustomTextMode = Boolean(imageId || style === 'image_pop' || textPos !== 'bottom' || textX !== 0 || textY !== 0 || bubble !== 'round');

    if (!isCustomTextMode) {
      // 従来の標準テキスト描画（完全互換）
      const availW = w * 0.84;
      const availH = h * 0.82;

      let mainCenterY, mainAvailH;

      if (sub) {
        const subH = Math.max(16, Math.min(32, availH * 0.22));
        const subSz = subH * 0.65;
        ctx.font = F(700, subSz, bf);
        const subTextW = ctx.measureText(sub).width;
        const subPlateW = Math.min(availW, subTextW + subH * 1.2);
        const subPlateX = x + (w - subPlateW) / 2;
        const subPlateY = y + h * 0.12;

        ctx.save();
        const isSimple = (style === 'simple_white' || style === 'simple_black');
        if (style === 'frame') {
          ctx.fillStyle = hexA(bgColor, 0.25);
        } else if (style === 'simple_white') {
          ctx.fillStyle = '#f3f4f6';
        } else if (style === 'simple_black') {
          ctx.fillStyle = '#262626';
        } else if (style === 'glass') {
          ctx.fillStyle = hexA(bgColor, 0.15);
        } else {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        }
        rr(ctx, subPlateX, subPlateY, subPlateW, subH, subH * 0.35);
        ctx.fill();
        if (style === 'frame') {
          ctx.strokeStyle = bgColor;
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (isSimple) {
          ctx.strokeStyle = style === 'simple_white' ? '#e5e7eb' : '#3f3f46';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (style === 'glass') {
          ctx.strokeStyle = hexA(bgColor, 0.4);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        const subColor = (style === 'glass' || style === 'simple_white')
          ? (textColor === '#ffffff' ? '#111827' : textColor)
          : textColor;
        ctx.fillStyle = subColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const maxSubTextW = Math.max(10, subPlateW - subH * 0.5);
        if (subTextW > maxSubTextW && subTextW > 0) {
          ctx.save();
          ctx.translate(x + w / 2, subPlateY + subH / 2);
          ctx.scale(maxSubTextW / subTextW, 1);
          ctx.fillText(sub, 0, 0);
          ctx.restore();
        } else {
          ctx.fillText(sub, x + w / 2, subPlateY + subH / 2);
        }
        ctx.restore();

        mainAvailH = h * 0.58;
        mainCenterY = y + h * 0.63;
      } else {
        mainAvailH = availH * 0.88;
        mainCenterY = y + h / 2;
      }

      const stdTextColor = (style === 'glass' || style === 'simple_white')
        ? (textColor === '#ffffff' ? '#111827' : textColor)
        : textColor;
      drawMainTitleLines(ctx, title, titleFit, availW, mainAvailH, x + w / 2, mainCenterY, hf, style, bgColor, stdTextColor);

    } else {
      // 🖼️ 画像配置・吹き出し・自由位置対応テキスト描画 (Ver.0.29)
      let bBoxW, bBoxH, bBoxX, bBoxY;
      if (textPos === 'top') {
        bBoxW = w * 0.90;
        bBoxH = h * (sub ? 0.44 : 0.38);
        bBoxX = x + (w - bBoxW) / 2;
        bBoxY = y + h * 0.04;
      } else if (textPos === 'left') {
        bBoxW = w * 0.52;
        bBoxH = h * 0.90;
        bBoxX = x + w * 0.04;
        bBoxY = y + (h - bBoxH) / 2;
      } else if (textPos === 'right') {
        bBoxW = w * 0.52;
        bBoxH = h * 0.90;
        bBoxX = x + w - bBoxW - w * 0.04;
        bBoxY = y + (h - bBoxH) / 2;
      } else if (textPos === 'center') {
        bBoxW = w * 0.88;
        bBoxH = h * 0.82;
        bBoxX = x + (w - bBoxW) / 2;
        bBoxY = y + (h - bBoxH) / 2;
      } else if (textPos === 'free') {
        bBoxW = w * 0.88;
        bBoxH = h * (sub ? 0.48 : 0.40);
        bBoxX = x + (w - bBoxW) / 2;
        bBoxY = y + (h - bBoxH) / 2;
      } else {
        // 'bottom' (標準)
        bBoxW = w * 0.90;
        bBoxH = h * (sub ? 0.44 : 0.38);
        bBoxX = x + (w - bBoxW) / 2;
        bBoxY = y + h - bBoxH - h * 0.04;
      }

      // 微調整オフセット
      bBoxX += (textX / 100) * (w * 0.4);
      bBoxY += (textY / 100) * (h * 0.4);

      // 吹き出し・プレートの描画（外側が既にspeech吹き出しで画像がない場合は二重吹き出しを抑止）
      const skipInnerRound = (style === 'speech' && showBg && !imageId && bubble === 'round');
      if (bubble !== 'none' && !skipInnerRound) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;

        const bubbleBg = (style === 'simple_white' || style === 'glass') ? 'rgba(255, 255, 255, 0.95)'
          : (style === 'simple_black' ? 'rgba(22, 22, 22, 0.95)'
          : hexA(bgColor, 0.94));
        const bubbleBorder = (style === 'simple_white') ? '#d1d5db'
          : (style === 'glass') ? hexA(bgColor, 0.8)
          : '#ffffff';

        if (bubble === 'round') {
          // 💬 丸吹き出し（しっぽ付き） (Ver.0.35)
          const bRad = Math.max(8, Math.min(bBoxW, bBoxH) * 0.16);
          // 外側背景自体がしっぽ付きspeechの場合は内側のしっぽを省略して二重しっぽを防止
          const effDir = (style === 'speech' && showBg) ? 'none' : resolveTailDir(tailDir, style, textPos);
          const posRatio = (num(tailPos, 35)) / 100;

          buildSpeechBubblePath(ctx, bBoxX, bBoxY, bBoxW, bBoxH, bRad, effDir, posRatio);

          ctx.fillStyle = bubbleBg;
          ctx.fill();
          ctx.shadowColor = 'transparent';

          ctx.strokeStyle = bubbleBorder;
          ctx.lineWidth = Math.max(2, Math.min(w, h) * 0.015);
          ctx.stroke();

        } else if (bubble === 'shout') {
          // 💥 ギザギザ・叫び吹き出し
          const bcx = bBoxX + bBoxW / 2;
          const bcy = bBoxY + bBoxH / 2;
          const brx = bBoxW / 2;
          const bry = bBoxH / 2;
          const pts = 18;

          ctx.beginPath();
          for (let i = 0; i < pts; i++) {
            const angle = (i * 2 * Math.PI) / pts - Math.PI / 2;
            const factor = (i % 2 === 0) ? 1.0 : 0.85;
            const px = bcx + brx * factor * Math.cos(angle);
            const py = bcy + bry * factor * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();

          ctx.fillStyle = bubbleBg;
          ctx.fill();
          ctx.shadowColor = 'transparent';

          ctx.strokeStyle = bubbleBorder;
          ctx.lineWidth = Math.max(2, Math.min(w, h) * 0.016);
          ctx.stroke();

        } else if (bubble === 'plate') {
          // 🏷️ 半透明帯・プレート
          const pRad = Math.max(6, Math.min(bBoxW, bBoxH) * 0.12);
          rr(ctx, bBoxX, bBoxY, bBoxW, bBoxH, pRad);
          ctx.fillStyle = bubbleBg;
          ctx.fill();
          ctx.shadowColor = 'transparent';

          ctx.strokeStyle = bubbleBorder;
          ctx.lineWidth = 1.5;
          rr(ctx, bBoxX, bBoxY, bBoxW, bBoxH, pRad);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 吹き出し内のテキスト描画
      const tPadX = bBoxW * 0.08;
      const tAvailW = bBoxW - tPadX * 2;
      const tAvailH = bBoxH * 0.90;
      const effectiveTextColor = (bubble !== 'none' && (style === 'simple_white' || style === 'glass'))
        ? (textColor === '#ffffff' ? '#111827' : textColor)
        : textColor;

      let mCY, mAH;
      if (sub) {
        const sH = Math.max(14, Math.min(24, tAvailH * 0.26));
        const sSz = sH * 0.65;
        ctx.font = F(700, sSz, bf);
        const sPlateY = bBoxY + bBoxH * 0.08;
        const subTextW = ctx.measureText(sub).width;
        const subPlateW = Math.min(tAvailW, subTextW + sH * 1.2);

        ctx.save();
        ctx.fillStyle = (bubble === 'none' && !showBg) ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.22)';
        rr(ctx, bBoxX + (bBoxW - subPlateW) / 2, sPlateY, subPlateW, sH, sH * 0.35);
        ctx.fill();

        const subFillColor = (bubble === 'none' && !showBg)
          ? '#ffffff'
          : effectiveTextColor;
        ctx.fillStyle = subFillColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const maxSubTextW = Math.max(10, subPlateW - sH * 0.5);
        if (subTextW > maxSubTextW && subTextW > 0) {
          ctx.save();
          ctx.translate(bBoxX + bBoxW / 2, sPlateY + sH / 2);
          ctx.scale(maxSubTextW / subTextW, 1);
          ctx.fillText(sub, 0, 0);
          ctx.restore();
        } else {
          ctx.fillText(sub, bBoxX + bBoxW / 2, sPlateY + sH / 2);
        }
        ctx.restore();

        mAH = tAvailH * 0.68;
        mCY = bBoxY + bBoxH * 0.64;
      } else {
        mAH = tAvailH * 0.88;
        mCY = bBoxY + bBoxH / 2;
      }

      drawMainTitleLines(ctx, title, titleFit, tAvailW, mAH, bBoxX + bBoxW / 2, mCY, hf, style, bgColor, effectiveTextColor, bubble === 'none');
    }
    }

    // 4. ラベルバッジ（新刊・注目など） (Ver.0.32: 正しい引数に修正, Ver.0.36: ラベル・ラベル補2系統対応)
    const lbl = resolveLabel(placed, st.labelColors);
    const subLbl = resolveSubLabel(placed, st.subLabelColors);
    const labelStyle = st.layout?.labelStyle || 'star';
    const labelCfg = { ...(st.layout || {}), cardRad: Math.max(8, Math.min(w, h) * 0.04) };
    drawPlacedLabels(ctx, lbl, subLbl, labelStyle, x, y, w, h, hf, labelCfg);

    // 5. 選択枠
    if (opts && (opts.selected || (opts.preview && opts.selectedUid && opts.selectedUid === placed.uid))) {
      ctx.save();
      ctx.strokeStyle = S.accent || '#e4007f';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      rr(ctx, x - 2, y - 2, w + 4, h + 4, Math.max(8, Math.min(w, h) * 0.04));
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  /** メイン文言テキスト描画ヘルパー (Ver.0.29) */
  function drawMainTitleLines(ctx, title, titleFit, availW, mainAvailH, centerX, centerY, hf, style, bgColor, textColor, strongOutline = false) {
    if (!title || !String(title).trim()) return;
    const rawLines = (title || 'おすすめPOP！').split('\n');
    let pLines = [];

    if (titleFit === 'condense1') {
      // 1行に収める：改行をスペースに置換して必ず1行にする
      pLines = [String(title).replace(/\r?\n+/g, ' ').trim()];
    } else if (titleFit === 'wrap') {
      const estLineCount = Math.max(1, rawLines.length);
      const estSz = Math.min(mainAvailH / (estLineCount * 1.35), availW * 0.24);
      ctx.font = F(900, Math.max(12, estSz), hf);
      for (const rl of rawLines) {
        const wrapped = wrap(ctx, rl, availW, 5);
        pLines.push(...wrapped);
      }
      if (pLines.length === 0) pLines = [''];
    } else {
      // 'condense2' など：改行を維持して各行を長体圧縮
      pLines = rawLines;
    }

    const lineCount = Math.max(1, pLines.length);
    const maxTitleSzByHeight = mainAvailH / (lineCount * 1.28);
    const maxTitleSzByWidth = availW * (lineCount === 1 ? 0.30 : (lineCount === 2 ? 0.24 : 0.18));
    const maxTitleSz = Math.min(maxTitleSzByHeight, maxTitleSzByWidth);

    let titleSz = maxTitleSz;
    const minSz = lineCount >= 4 ? 8 : (lineCount >= 3 ? 10 : 13);
    for (const ln of pLines) {
      const targetW = (titleFit === 'wrap') ? availW : availW * 1.55;
      const szForLine = fitSize(ctx, ln, 900, hf, maxTitleSz, targetW, minSz);
      if (szForLine < titleSz) titleSz = szForLine;
    }
    titleSz = Math.max(minSz, titleSz);

    const actualLineH = titleSz * 1.26;
    const totalBlockH = pLines.length * actualLineH;
    const startY = centerY - totalBlockH / 2 + actualLineH * 0.5;

    ctx.save();
    ctx.font = F(900, titleSz, hf);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    for (let li = 0; li < pLines.length; li++) {
      const ln = pLines[li];
      const lineY = startY + li * actualLineH;
      const lineW = ctx.measureText(ln).width;

      ctx.save();
      const needsCondense = lineW > availW && (titleFit === 'condense1' || titleFit === 'condense2');
      if (needsCondense) {
        const scaleX = Math.max(0.38, availW / lineW);
        ctx.translate(centerX, lineY);
        ctx.scale(scaleX, 1);
      }

      const drawX = needsCondense ? 0 : centerX;
      const drawY = needsCondense ? 0 : lineY;

      // フチ取り
      if (strongOutline) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(4, titleSz * 0.22);
        ctx.strokeText(ln, drawX, drawY);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, titleSz * 0.11);
        ctx.strokeText(ln, drawX, drawY);
      } else if (style === 'simple_white') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, titleSz * 0.10);
        ctx.strokeText(ln, drawX, drawY);
      } else if (style === 'simple_black') {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(2, titleSz * 0.10);
        ctx.strokeText(ln, drawX, drawY);
      } else if (style === 'glass') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2.5, titleSz * 0.14);
        ctx.strokeText(ln, drawX, drawY);
      } else {
        ctx.strokeStyle = style === 'frame' ? '#000000' : 'rgba(0, 0, 0, 0.45)';
        ctx.lineWidth = Math.max(3, titleSz * 0.16);
        ctx.strokeText(ln, drawX, drawY);
      }

      if (style === 'frame') {
        ctx.shadowColor = bgColor;
        ctx.shadowBlur = 10;
      }
      ctx.fillStyle = textColor || '#ffffff';
      ctx.fillText(ln, drawX, drawY);
      ctx.restore();
    }
    ctx.restore();
  }

  /** 空白枠（スペーサー）の描画 (Ver.0.52) */
  function drawSpacerCard(ctx, st, card, opts) {
    if (!opts || !opts.preview) return; // 画像出力時は完全に透明（何も描画しない）

    const { x, y, w, h, placed } = card;
    const isSelected = !!(opts.selected || (opts.selectedUid && opts.selectedUid === placed?.uid));
    const rad = Math.min(w, h) * 0.04;
    const sz = placed?.size || 1;
    const accentCol = st.style?.accent || '#ff4b00';

    ctx.save();
    // 選択時は薄いアクセント背景、非選択時は極薄の半透明背景
    ctx.fillStyle = isSelected ? hexA(accentCol, 0.08) : 'rgba(120, 130, 150, 0.04)';
    rr(ctx, x + 2, y + 2, w - 4, h - 4, rad);
    ctx.fill();

    // 枠線の描画
    if (isSelected) {
      ctx.strokeStyle = accentCol;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
    } else {
      ctx.strokeStyle = 'rgba(120, 130, 150, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
    }
    rr(ctx, x + 2, y + 2, w - 4, h - 4, rad);
    ctx.stroke();

    // 中央テキスト
    ctx.setLineDash([]);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const szText = `空白枠 (${sz}枠)`;
    const fontSize = Math.max(11, Math.min(w, h) * 0.085);
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = isSelected ? accentCol : 'rgba(140, 150, 170, 0.75)';
    ctx.fillText(szText, x + w / 2, y + h / 2);

    ctx.restore();
  }

  /** 各アイテムカードの描画（チラシ風整理レイアウト） */
  function drawCard(ctx, st, card, getImg, opts) {
    if (card.isSpacer || card.item?.isSpacer || card.entry?.isSpacer || card.placed?.itemId === 'spacer') {
      drawSpacerCard(ctx, st, card, opts);
      return;
    }
    if (card.isPop || card.item?.isPop || String(card.placed?.itemId || '').startsWith('pop_')) {
      drawPopCard(ctx, st, card, getImg, opts);
      return;
    }
    const { x, y, w, h, item, placed } = card;
    const L = st.layout || {};
    const S = st.style || {};
    const hf = S.headingFont || '"M PLUS Rounded 1c", sans-serif';
    const bf = S.bodyFont || '"Noto Sans JP", sans-serif';
    const tScale = (Number(L.textScale) || 100) / 100;
    const titleScale = (Number(L.titleScale) || 100) / 100;
    const priceTextScale = (Number(L.priceTextScale) || 100) / 100;
    const metaScale = (Number(L.metaScale) || 100) / 100;
    const specScale = (Number(L.specScale) || 100) / 100;

    // ジャンル別カラーアクセント（タブあり: genre_tab）の枠外見出しタブオフセット計算 (Ver.0.23b)
    let cardX = x, cardY = y, cardW = w, cardH = h;
    const isGenreTab = L.groupMode === 'genre_tab' && !!item.genre;
    let tabReserveTop = 0;
    if (isGenreTab) {
      tabReserveTop = Math.max(13, Math.min(h * 0.10, 20));
      cardY += tabReserveTop;
      cardH -= tabReserveTop;
    }

    const rad = Math.min(cardW, cardH) * 0.025 * num(S.radius, 1.5);

    ctx.save();
    // カード背景＆影
    if (S.shadow !== false) {
      ctx.shadowColor = 'rgba(20, 10, 30, 0.18)';
      ctx.shadowBlur = Math.min(cardW, cardH) * 0.06;
      ctx.shadowOffsetY = Math.min(cardW, cardH) * 0.022;
    }
    ctx.fillStyle = hexA(S.cardBg || '#ffffff', num(S.cardOpacity, 0.95));
    rr(ctx, cardX, cardY, cardW, cardH, rad);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // ジャンル別カラーアクセント（genre_color または genre_tab 時）
    const isGenreMode = (L.groupMode === 'genre_color' || L.groupMode === 'genre_tab');
    const isGenreAccent = isGenreMode && !!item.genre;
    const effectiveAccent = isGenreAccent
      ? getGenreColor(item.genre, S.accent, st)
      : (S.accent || '#e4007f');

    if (S.cardBorder !== false) {
      if (isGenreAccent) {
        // ジャンル別カラーアクセント：ジャンル固有色の太枠
        ctx.lineWidth = Math.max(2.5, Math.min(cardW, cardH) * 0.018);
        ctx.strokeStyle = effectiveAccent;
        ctx.stroke();
      } else {
        // 特大・大カードや新刊はアクセント枠線を付与
        const isFeatured = (placed.size || 1) >= 2 || placed.label === 'new';
        ctx.lineWidth = isFeatured ? Math.max(2.5, Math.min(cardW, cardH) * 0.016) : 1;
        ctx.strokeStyle = isFeatured ? effectiveAccent : hexA(effectiveAccent, 0.25);
        ctx.stroke();
      }
    }

    // ジャンル別カラーアクセント（タブあり: genre_tab） カード右上枠外のフォルダ見出しタブ (Ver.0.23b)
    if (isGenreTab) {
      ctx.save();
      const tabH = tabReserveTop + 2; // カード上枠と2px重なって一体化
      const tabFontSz = Math.max(9, tabH * 0.62);
      ctx.font = F(700, tabFontSz, bf);
      const gTextW = ctx.measureText(item.genre).width;
      const tabPadX = tabH * 0.55;
      const tabW = Math.min(cardW * 0.65, gTextW + tabPadX * 2);
      const tabX = cardX + cardW - tabW - Math.max(6, rad * 0.7); // 右寄せ
      const tabY = cardY - tabH + 2; // 上枠外へ突き出す

      // タブ背景（上部フォルダ見出し形状）
      rr(ctx, tabX, tabY, tabW, tabH, 4);
      ctx.fillStyle = effectiveAccent;
      ctx.fill();

      // タブ文字（白抜き太字、中央配置・長体フィット対応）
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const maxTabTextW = Math.max(8, tabW - tabPadX * 1.2);
      if (gTextW > maxTabTextW && gTextW > 0) {
        ctx.save();
        ctx.translate(tabX + tabW / 2, tabY + (tabH - 2) / 2);
        ctx.scale(maxTabTextW / gTextW, 1);
        ctx.fillText(item.genre, 0, 0);
        ctx.restore();
      } else {
        ctx.fillText(item.genre, tabX + tabW / 2, tabY + (tabH - 2) / 2);
      }
      ctx.restore();
    }

    const pad = Math.min(cardW, cardH) * 0.055;
    const ix = cardX + pad, iy = cardY + pad;
    const iw = Math.max(10, cardW - pad * 2), ih = Math.max(10, cardH - pad * 2);
    const horizontal = w / h > 1.15;

    const showTitle = L.showTitle !== false;

    const lbl = resolveLabel(placed, st.labelColors);
    const subLbl = resolveSubLabel(placed, st.subLabelColors);
    const labelStyle = L.labelStyle || 'star';

    let imgBox, txtBox;
    if (horizontal) {
      // 書名非表示の場合は書影幅を広げて大きく見せる
      const imgW = showTitle ? Math.min(iw * 0.42, ih * 0.78) : Math.min(iw * 0.52, ih * 0.88);
      imgBox = { x: ix, y: iy, w: imgW, h: ih };

      let txtY = iy;
      let txtH = ih;
      const effectiveLabelPos = (L.labelPosition && L.labelPosition !== 'auto')
        ? L.labelPosition
        : (labelStyle === 'tag' ? 'tr' : 'tl');
      // 横長カードで右上にラベルが存在する場合、テキスト上端をラベル高さ分下へオフセットして重なりを防止
      if ((lbl || subLbl) && effectiveLabelPos === 'tr') {
        const lScale = Math.max(0.4, Math.min(2.0, (Number(L.labelScale) || 100) / 100));
        const rawBase = Math.min(cardW, cardH);
        const base = rawBase * lScale;
        const lblCount = (lbl && subLbl) ? 2 : 1;
        const gapY = Math.max(4, base * 0.025);
        let reserveH = 0;
        if (labelStyle === 'tag') {
          reserveH = Math.max(16 * lScale, base * 0.135) + rawBase * 0.03 + 3;
        } else if (labelStyle === 'round_rect') {
          const rh = Math.max(18 * lScale, base * 0.14);
          reserveH = rawBase * 0.03 + rh * lblCount + (lblCount === 2 ? gapY : 0) + 3;
        } else if (labelStyle === 'ribbon') {
          const rh = Math.max(18 * lScale, base * 0.15);
          reserveH = base * 0.04 + rh * lblCount + (lblCount === 2 ? gapY : 0) + 3;
        } else if (labelStyle === 'corner_band') {
          const bandH = Math.max(15 * lScale, base * 0.135);
          const baseDist = Math.max(24 * lScale, base * 0.24);
          const dist = baseDist + (lblCount === 2 ? (bandH + Math.max(3, rawBase * 0.025)) : 0);
          reserveH = (dist + bandH * 0.5) * Math.SQRT1_2 + 2;
        } else {
          // star, circle, heart, stamp
          const r = Math.max(19 * lScale, base * 0.155);
          reserveH = r * (lblCount === 2 ? 2.5 : 1.75);
        }
        reserveH = Math.min(ih * 0.44, Math.max(0, reserveH - (iy - cardY)));
        if (reserveH > 0) {
          txtY += reserveH;
          txtH = Math.max(10, txtH - reserveH);
        }
      }
      txtBox = { x: ix + imgW + pad * 0.85, y: txtY, w: Math.max(10, iw - imgW - pad * 0.85), h: txtH };
    } else {
      const imgH = showTitle ? (ih * 0.56) : (ih * 0.64);
      imgBox = { x: ix, y: iy, w: iw, h: imgH };
      txtBox = { x: ix, y: iy + imgH + pad * 0.6, w: iw, h: Math.max(10, ih - imgH - pad * 0.6) };
    }

    // 書影描画
    const im = getImg(item.imageId);
    if (im) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.22)';
      ctx.shadowBlur = Math.min(w, h) * 0.035;
      ctx.shadowOffsetY = 2;
      const fitted = drawContain(ctx, im, imgBox.x, imgBox.y, imgBox.w, imgBox.h);
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(fitted.x, fitted.y, fitted.w, fitted.h);
      ctx.restore();
    } else {
      const pw = Math.min(imgBox.w, imgBox.h * 0.72);
      const ph = Math.min(imgBox.h, pw / 0.72);
      const px = imgBox.x + (imgBox.w - pw) / 2;
      const py = imgBox.y + (imgBox.h - ph) / 2;
      drawPlaceholderCover(ctx, item, px, py, pw, ph, S.accent, bf);
    }

    // テキスト情報領域（上：発行年月・書名・仕様、下：頒価）
    const pStr = fmtPrice(item.price);
    const pScale = (Number(L.priceScale) || 100) / 100;
    // 値札シール・頒価の高さ・太さ倍率（lPriceScale）を反映
    const priceH = pStr ? Math.min(txtBox.h * 0.48, Math.max(18, Math.min(w, h) * 0.22 * pScale)) : 0;
    // 頒価との最低限の安全マージン（絶対に被らないよう確保）
    const minPriceGap = pStr ? Math.max(5, priceH * 0.14) : 0;
    // 上部テキスト群（タグ＋書名＋仕様）が使える最大の安全高さ（Ver.0.14c衝突防止計算と連動）
    const availInfoH = Math.max(10, txtBox.h - (pStr ? (priceH + minPriceGap) : 0));

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // 表示項目の判定
    const showGenre = (L.showGenre === true && !!item.genre);
    const showDate = (L.showDate !== false && !!item.pubdate);
    const hasTagLine = showGenre || showDate;
    const showSpec = (L.showSpec === true && !!item.spec);
    const titleFit = L.titleFit || 'condense1';

    // 長体描画ヘルパー関数（横幅のみ縮小して文字切れ・意図しない改行・省略記号を排除し、全文を長体描画。カード外突き抜け防止クリップガード付）
    function drawCondenseText(text, x, y, maxW) {
      if (!text || maxW <= 0) return;
      const fullW = ctx.measureText(text).width;
      if (fullW <= maxW) {
        ctx.fillText(text, x, y);
        return;
      }
      const scaleX = Math.min(1.0, maxW / Math.max(1, fullW));
      ctx.save();
      // カード外・右隣のカード領域への物理的な文字突き抜けを100%防止するクリップガード
      ctx.beginPath();
      ctx.rect(x, y - 2, maxW + 1, txtBox.h + 10);
      ctx.clip();
      ctx.translate(x, y);
      ctx.scale(scaleX, 1);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }

    // 1. タグ行（ジャンル＆発行年月）の計算
    let tagSz = 0, tagLineH = 0, isTagWrapped = false;
    if (hasTagLine) {
      tagSz = Math.max(8, Math.min(availInfoH * 0.18, txtBox.w * 0.09) * tScale * metaScale);
      tagLineH = tagSz * 1.32;
      ctx.font = F(700, tagSz * 0.88, bf);
      const gW = showGenre ? (ctx.measureText(item.genre).width + tagSz * 0.9) : 0;
      ctx.font = F(700, tagSz, bf);
      const dW = showDate ? ctx.measureText(item.pubdate).width : 0;
      if (showGenre && showDate && (gW + dW + tagSz * 0.4 > txtBox.w)) {
        isTagWrapped = true;
      }
      // 書名表示時、タグ行が上部エリアを占有しすぎて書名が消えるのを防止
      const rawTagH = isTagWrapped ? tagLineH * 2 : tagLineH;
      const maxTagAreaH = showTitle ? availInfoH * 0.44 : availInfoH * 0.65;
      if (rawTagH > maxTagAreaH && rawTagH > 0) {
        const shrink = maxTagAreaH / rawTagH;
        tagSz = Math.max(6.5, tagSz * shrink);
        tagLineH = tagSz * 1.28;
      }
    }
    const totalTagH = hasTagLine ? (isTagWrapped ? tagLineH * 2 : tagLineH) : 0;

    // 2. 書名の計算・スケーリング・行分割＆重なり防止クランプ（書名をコメントより優先して領域確保）
    let tSz = 0, tLines = [], titleH = 0;
    if (showTitle) {
      const titleText = item.name || '無題アイテム';
      let maxTitleLines = 2;
      let tSzFactor = 0.28;

      if (titleFit === 'condense1') {
        maxTitleLines = 1;
        tSzFactor = (!showSpec && !hasTagLine) ? 0.44 : (!showSpec ? 0.36 : 0.30);
      } else if (titleFit === 'condense2') {
        maxTitleLines = 2;
        tSzFactor = (!showSpec && !hasTagLine) ? 0.38 : (!showSpec ? 0.33 : 0.28);
      } else {
        // 'wrap'
        if (!showSpec && !hasTagLine) {
          maxTitleLines = 3;
          tSzFactor = 0.38;
        } else if (!showSpec) {
          maxTitleLines = 3;
          tSzFactor = 0.32;
        } else if (!hasTagLine) {
          maxTitleLines = 2;
          tSzFactor = 0.30;
        }
      }

      tSz = Math.max(9.5, Math.min(availInfoH * tSzFactor, txtBox.w * 0.22) * tScale * titleScale);
      ctx.font = F(900, tSz, hf);

      // 行分割
      if (titleFit === 'condense1') {
        tLines = [titleText];
      } else if (titleFit === 'condense2') {
        const rawLines = String(titleText).split(/\r?\n/);
        if (rawLines.length >= 2) {
          tLines = [rawLines[0], rawLines.slice(1).join(' ')];
        } else {
          const singleW = ctx.measureText(titleText).width;
          if (singleW <= txtBox.w * 1.1) {
            tLines = [titleText];
          } else {
            // 省略記号 '…' を付けずに全文を2行に分割（各行は drawCondenseText で長体表示）
            const halfW = singleW * 0.50;
            const targetW = Math.max(halfW, txtBox.w * 1.25);
            let cur = '';
            let rest = '';
            for (let ci = 0; ci < titleText.length; ci++) {
              const ch = titleText[ci];
              const nextT = cur + ch;
              if (ctx.measureText(nextT).width > targetW && cur && !NO_START.includes(ch)) {
                rest = titleText.slice(ci);
                break;
              }
              cur = nextT;
            }
            if (rest) {
              tLines = [cur, rest];
            } else {
              const mid = Math.ceil(titleText.length / 2);
              tLines = [titleText.slice(0, mid), titleText.slice(mid)];
            }
          }
        }
      } else {
        tLines = wrap(ctx, titleText, txtBox.w, maxTitleLines);
      }

      // コメント（仕様）を表示する場合も書名用に最低限の領域を保証
      const availAfterTag = Math.max(10, availInfoH - totalTagH);
      const availTitleH = showSpec ? Math.max(Math.min(availAfterTag, 16), availAfterTag * 0.62) : availAfterTag;
      const estTitleH = tLines.length * (tSz * 1.24);
      if (estTitleH > availTitleH) {
        const clampedTsz = availTitleH / (tLines.length * 1.24);
        if (clampedTsz >= 9.5) {
          tSz = clampedTsz;
        } else if (tLines.length > 1) {
          // 複数行で文字が小さくなりすぎる場合は1行に収めて長体化
          tLines = [titleText];
          tSz = Math.max(8.5, Math.min(tSz, availTitleH / 1.24));
        } else {
          tSz = Math.max(8.5, clampedTsz);
        }
      }
      titleH = tLines.length * (tSz * 1.24);
    }

    // 3. コメント（仕様・補足等）情報の計算（書名の残余スペース内に収める）
    let sSz = 0, sLines = [], specH = 0;
    if (showSpec && item.spec) {
      const remainForSpec = Math.max(0, availInfoH - totalTagH - titleH);
      if (remainForSpec >= 11) {
        sSz = Math.max(7.5, Math.min(availInfoH * 0.16, txtBox.w * 0.082) * tScale * specScale);
        ctx.font = F(500, sSz, bf);
        const maxSpecLines = Math.max(1, Math.min(3, Math.floor((remainForSpec - 3) / (sSz * 1.22))));
        sLines = wrap(ctx, item.spec, txtBox.w, maxSpecLines);
        specH = sLines.length * (sSz * 1.22) + 4;
      }
    }

    // 4. テキスト＋価格ブロック全体の総高さ算出 & 天地中央凝縮レイアウト
    const upperH = totalTagH + titleH + specH;
    const totalBlockH = upperH + (pStr ? (minPriceGap + priceH) : 0);
    const spare = Math.max(0, txtBox.h - totalBlockH);

    // 全体をカード天地中央寄りに心地よく配置
    const blockOffsetY = spare * 0.36;
    let curY = txtBox.y + blockOffsetY;

    // 5. 描画実行：タグ行（ジャンル＆発行年月）
    if (hasTagLine) {
      let tagX = txtBox.x;

      if (showGenre) {
        ctx.font = F(700, tagSz * 0.88, bf);
        const gText = item.genre;
        const gW = ctx.measureText(gText).width;
        const padX = tagSz * 0.45;
        const badgeW = Math.min(txtBox.w, gW + padX * 2);
        const badgeH = tagSz * 1.25;

        const gBadgeColor = getGenreColor(gText, S.accent, st);
        ctx.fillStyle = hexA(gBadgeColor, 0.14);
        rr(ctx, tagX, curY - 1, badgeW, badgeH, 3);
        ctx.fill();
        ctx.strokeStyle = hexA(gBadgeColor, 0.55);
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = gBadgeColor;
        drawCondenseText(gText, tagX + padX, curY + (badgeH - tagSz * 0.88) * 0.35, Math.max(4, badgeW - padX * 2));
        tagX += badgeW + tagSz * 0.45;
      }

      if (showDate) {
        ctx.font = F(700, tagSz, bf);
        ctx.fillStyle = S.accent || '#e4007f';
        const dText = item.pubdate;
        const remainW = (txtBox.x + txtBox.w) - tagX;

        if (!isTagWrapped && remainW > 8) {
          const dLine = wrap(ctx, dText, remainW, 1)[0];
          ctx.fillText(dLine, tagX, curY);
        } else if (isTagWrapped) {
          curY += tagLineH;
          const dLine = wrap(ctx, dText, txtBox.w, 1)[0];
          ctx.fillText(dLine, txtBox.x, curY);
        }
      }
      curY += tagLineH;
    }

    // 6. 描画実行：書名（表示ON時のみ。先頭1行目は必ず描画する）
    if (showTitle && tLines.length) {
      ctx.font = F(900, tSz, hf);
      ctx.fillStyle = S.cardText || '#2b2330';
      const maxTitleEndY = txtBox.y + availInfoH;
      for (let li = 0; li < tLines.length; li++) {
        if (li > 0 && curY + tSz > maxTitleEndY + 2) break;
        drawCondenseText(tLines[li], txtBox.x, curY, txtBox.w);
        curY += tSz * 1.24;
      }
    }

    // 7. 描画実行：仕様情報
    if (showSpec && sLines.length && curY < txtBox.y + availInfoH) {
      curY += 3;
      ctx.font = F(500, sSz, bf);
      ctx.fillStyle = hexA(S.cardText || '#2b2330', 0.72);
      for (const ln of sLines) {
        if (curY + sSz > txtBox.y + availInfoH + 2) break;
        ctx.fillText(ln, txtBox.x, curY);
        curY += sSz * 1.22;
      }
    }

    // 8. 描画実行：頒価（文字と絶対に重ならない安全座標に配置）
    if (pStr) {
      // 上部テキストの最終描画位置の直下 + 安全マージン、または下端配置
      const safeMinY = curY + minPriceGap;
      const py = Math.min(txtBox.y + txtBox.h - priceH, Math.max(safeMinY, txtBox.y + txtBox.h - priceH - spare * 0.35));
      const priceBottomY = py + priceH;

      if (L.priceStyle === 'sticker') {
        ctx.save();
        ctx.fillStyle = S.priceColor || '#e60033';
        rr(ctx, txtBox.x, py + priceH * 0.08, txtBox.w, priceH * 0.88, priceH * 0.25);
        ctx.fill();
        const pSz = fitSize(ctx, pStr, 900, hf, priceH * 0.62 * tScale * priceTextScale, txtBox.w * 0.88, 10);
        ctx.font = F(900, pSz, hf);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pStr, txtBox.x + txtBox.w / 2, py + priceH * 0.52);
        ctx.restore();
      } else if (L.priceStyle === 'ribbon') {
        // ribbon: リボン・コーナー風バナー（左端にV字カット装飾） (Ver.0.27)
        ctx.save();
        const rw = txtBox.w;
        const rh = priceH * 0.88;
        const rx = txtBox.x;
        const ry = py + priceH * 0.06;
        const vCut = rh * 0.28;

        ctx.shadowColor = 'rgba(0,0,0,0.20)';
        ctx.shadowBlur = 4;
        ctx.fillStyle = S.priceColor || '#e60033';

        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + rw, ry);
        ctx.lineTo(rx + rw, ry + rh);
        ctx.lineTo(rx, ry + rh);
        ctx.lineTo(rx + vCut, ry + rh / 2);
        ctx.closePath();
        ctx.fill();
        ctx.shadowColor = 'transparent';

        // リボン上部のアクセントハイライトライン
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(rx + vCut + 3, ry + 2);
        ctx.lineTo(rx + rw - 2, ry + 2);
        ctx.stroke();

        const pSz = fitSize(ctx, pStr, 900, hf, priceH * 0.62 * tScale * priceTextScale, rw - vCut - 6, 10);
        ctx.font = F(900, pSz, hf);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pStr, rx + vCut + (rw - vCut) / 2, ry + rh / 2);
        ctx.restore();
      } else {
        // 区切り破線＋右寄せデカ文字価格
        ctx.save();
        ctx.strokeStyle = hexA(S.cardText || '#2b2330', 0.16);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(txtBox.x, py);
        ctx.lineTo(txtBox.x + txtBox.w, py);
        ctx.stroke();

        const pSz = fitSize(ctx, pStr, 900, hf, priceH * 0.78 * tScale * priceTextScale, txtBox.w, 11);
        ctx.font = F(900, pSz, hf);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, pSz * 0.12);
        ctx.strokeText(pStr, txtBox.x + txtBox.w, priceBottomY);
        ctx.fillStyle = S.priceColor || '#e60033';
        ctx.fillText(pStr, txtBox.x + txtBox.w, priceBottomY);
        ctx.restore();
      }
    }

    // ラベルバッジ（新刊など）
    const labelCfg = { ...L, cardRad: rad };
    drawPlacedLabels(ctx, lbl, subLbl, labelStyle, cardX, cardY, cardW, cardH, hf, labelCfg);

    // プレビュー選択時のハイライト枠
    if (opts && opts.preview && opts.selectedUid && opts.selectedUid === placed.uid) {
      ctx.save();
      ctx.strokeStyle = S.accent || '#e4007f';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 4]);
      rr(ctx, cardX - 2, cardY - 2, cardW + 4, cardH + 4, rad + 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * 広告チラシ風2Dグリッドパッキング計算
   * 左上ヘッダー（blockモード）と大小サイズ混在のアイテム群を最適配置する
   */
  function computeLayout(st, W, H) {
    const L = st.layout || {};
    const pad = Math.min(W, H) * 0.01 * num(L.padding, 5.5);
    const gap = Math.min(W, H) * 0.01 * num(L.gap, 1.8);
    const aspect = Number(L.cardAspect) || 1.75;
    const list = entries(st);
    const isGenreBox = L.groupMode === 'genre_box' && list.length > 0;

    // genre_boxモード用：ジャンル単位でグループ化（グループ内の配置順は維持）
    let genreGroups = [];
    let extraEntries = [];
    if (isGenreBox) {
      const groupMap = new Map();
      for (const entry of list) {
        if (entry.isSpacer || entry.isPop || !entry.item) {
          extraEntries.push(entry);
        } else {
          const g = entry.item.genre || '';
          if (!groupMap.has(g)) groupMap.set(g, []);
          groupMap.get(g).push(entry);
        }
      }
      const orderedKeys = [];
      for (const g of (st.genres || [])) {
        if (g && groupMap.has(g) && !orderedKeys.includes(g)) orderedKeys.push(g);
      }
      for (const g of groupMap.keys()) {
        if (g && !orderedKeys.includes(g)) orderedKeys.push(g);
      }
      if (groupMap.has('')) orderedKeys.push('');
      genreGroups = orderedKeys.map(g => ({ genreName: g, items: groupMap.get(g) }));
    }

    const innerX = pad, innerY = pad;
    const innerW = Math.max(100, W - pad * 2);
    const innerH = Math.max(100, H - pad * 2);

    // ヘッダー矩形計算
    let headerRect;
    const isBand = L.headerMode === 'band';
    if (isBand) {
      const hh = Math.min(innerH * 0.22, Math.max(110, Math.min(W, H) * 0.16));
      headerRect = { x: innerX, y: innerY, w: innerW, h: hh };
    } else {
      const hw = innerW * ((Number(L.headerWidth) || 40) / 100);
      const hh = Math.min(innerH * 0.34, Math.max(120, hw * 0.36));
      headerRect = { x: innerX, y: innerY, w: hw, h: hh };
    }

    if (!list.length) {
      return { cards: [], cellW: innerW, cellH: innerH, cols: 1, rows: 1, gap, bandGap: 0, header: { rect: headerRect } };
    }

    const gridTop = isBand ? (headerRect.y + headerRect.h + gap) : innerY;
    const gridH = Math.max(80, innerY + innerH - gridTop);
    const bandGap = isGenreBox ? Math.max(24, Math.min(36, Math.round(Math.min(W, H) * 0.03))) : 0;

    // 列数(cols: 1〜12)を総当たりし、全カードが収まり単一セル面積が最大になる分割を採用 (Ver.0.23b)
    let best = null;
    for (let cols = 1; cols <= 12; cols++) {
      // 多点数時に極端な扁平・細長1列になるのを防ぐフィルタガード (Ver.0.23b)
      if (list.length >= 6 && cols === 1) continue;
      if (list.length >= 12 && cols <= 2) continue;
      if (list.length >= 20 && cols <= 3) continue;

      const grid = [];
      const ensureRow = r => {
        while (grid.length <= r) grid.push(new Array(cols).fill(false));
      };

      // blockモード時は左上ヘッダーが占めるセルを事前予約
      const testCellW = (innerW - gap * (cols - 1)) / cols;
      const estCellH = testCellW / aspect;
      let hCols = 0, hRows = 0;
      if (!isBand) {
        hCols = Math.min(cols, Math.ceil((headerRect.w + gap * 0.3) / (testCellW + gap)));
        hRows = Math.max(1, Math.ceil((headerRect.h + gap * 0.3) / (estCellH + gap)));
        for (let r = 0; r < hRows; r++) {
          ensureRow(r);
          for (let c = 0; c < hCols; c++) grid[r][c] = true;
        }
      }

      const packOne = (entry, minRow = 0) => {
        const sz = Number(entry.placed.size) || 1;
        let gw = 1, gh = 1;
        if (sz === 5) {
          gw = Math.min(cols, 3);
          gh = 3;
        } else if (sz === 4) {
          gw = Math.min(cols, 3);
          gh = 2;
        } else if (sz === 3) {
          gw = Math.min(cols, 2);
          gh = 2;
        } else if (sz === 2) {
          gw = Math.min(cols, 2);
          gh = 1;
        }
        for (let r = minRow; r < 400; r++) {
          ensureRow(r + gh - 1);
          for (let c = 0; c <= cols - gw; c++) {
            let free = true;
            for (let dr = 0; dr < gh && free; dr++) {
              for (let dc = 0; dc < gw; dc++) {
                if (grid[r + dr][c + dc]) { free = false; break; }
              }
            }
            if (free) {
              for (let dr = 0; dr < gh; dr++) {
                for (let dc = 0; dc < gw; dc++) grid[r + dr][c + dc] = true;
              }
              return { entry, gx: c, gy: r, gw, gh };
            }
          }
        }
        return null;
      };

      const placements = [];
      const bandOffsets = new Map();

      if (isGenreBox) {
        let nextGroupRow = 0;
        for (const grp of genreGroups) {
          let startRow = nextGroupRow;
          let grpPlacements = [];
          for (const itemEntry of grp.items) {
            const p = packOne(itemEntry, startRow);
            if (p) grpPlacements.push(p);
          }
          // blockモード時、ヘッダー右側から下段左側へ跨いでヘッダーに重なる場合はヘッダー下から開始
          if (!isBand && startRow < hRows && grpPlacements.length > 0) {
            const hasAbove = grpPlacements.some(p => p.gy < hRows);
            const hasLeftBelow = grpPlacements.some(p => p.gy + p.gh > hRows && p.gx < hCols);
            if (hasAbove && hasLeftBelow) {
              for (const p of grpPlacements) {
                for (let dr = 0; dr < p.gh; dr++) {
                  for (let dc = 0; dc < p.gw; dc++) grid[p.gy + dr][p.gx + dc] = false;
                }
              }
              startRow = hRows;
              grpPlacements = [];
              for (const itemEntry of grp.items) {
                const p = packOne(itemEntry, startRow);
                if (p) grpPlacements.push(p);
              }
            }
          }
          if (grpPlacements.length > 0) {
            let minGy = Infinity, maxGy = -1;
            for (const p of grpPlacements) {
              minGy = Math.min(minGy, p.gy);
              maxGy = Math.max(maxGy, p.gy + p.gh - 1);
              placements.push(p);
            }
            const extraTop = (minGy === 0 && !isBand)
              ? Math.max(0, bandGap * 0.65 - pad * 0.4)
              : Math.max(0, bandGap - gap);
            if (extraTop > 0) {
              bandOffsets.set(minGy, (bandOffsets.get(minGy) || 0) + extraTop);
            }
            nextGroupRow = maxGy + 1;
          }
        }
        // POP・空白枠はジャンル枠内に混入させないようグループ枠外の後続行へ配置
        for (const ex of extraEntries) {
          const p = packOne(ex, nextGroupRow);
          if (p) placements.push(p);
        }
      } else {
        for (const entry of list) {
          const p = packOne(entry, 0);
          if (p) placements.push(p);
        }
      }

      let totalExtraY = 0;
      for (const v of bandOffsets.values()) totalExtraY += v;

      const rows = Math.max(1, grid.length);
      const maxCellW = Math.max(4, (innerW - gap * (cols - 1)) / cols);
      const effectiveGridH = Math.max(40, gridH - totalExtraY);
      const maxCellH = Math.max(4, (effectiveGridH - gap * (rows - 1)) / rows);
      if (maxCellW <= 0 || maxCellH <= 0) continue;

      // 実際のセル縦横比と目標比率(aspect)からの乖離度に基づく厳格な評価 (Ver.0.23b)
      const rawAspect = maxCellW / Math.max(1, maxCellH);
      const aspectDiff = Math.abs(Math.log(rawAspect / aspect));
      const ratioFit = Math.max(0.01, 1.0 / (1.0 + aspectDiff * 2.2));

      // 実際にカードが描画される有効面積
      const effW = Math.min(maxCellW, maxCellH * aspect * 1.25);
      const effH = Math.min(maxCellH, maxCellW / (aspect * 0.75));
      const score = effW * effH * ratioFit;

      if (!best || score > best.score) {
        best = { cols, rows, cellW: maxCellW, cellH: maxCellH, score, placements, bandOffsets };
      }
    }

    if (!best) {
      // 安全ガード: 万一全colsが不適合となった場合のフォールバック配置 (Ver.0.68)
      const fallbackCols = Math.min(12, Math.max(1, Math.ceil(Math.sqrt(list.length))));
      const fbCellW = Math.max(4, (innerW - gap * (fallbackCols - 1)) / fallbackCols);
      const fbCellH = Math.max(4, fbCellW / aspect);
      const fallbackPlacements = list.map((entry, idx) => ({
        entry,
        gx: idx % fallbackCols,
        gy: Math.floor(idx / fallbackCols),
        gw: 1,
        gh: 1,
      }));
      const fallbackRows = Math.max(1, Math.ceil(list.length / fallbackCols));
      best = { cols: fallbackCols, rows: fallbackRows, cellW: fbCellW, cellH: fbCellH, score: 0, placements: fallbackPlacements, bandOffsets: new Map() };
    }

    const { cols, rows, cellW, cellH, placements, bandOffsets } = best;
    const rowYOffset = new Array(rows + 1).fill(0);
    let accOffset = 0;
    for (let r = 0; r <= rows; r++) {
      accOffset += (bandOffsets && bandOffsets.get(r)) || 0;
      rowYOffset[r] = accOffset;
    }

    // blockモード時、ヘッダー矩形を予約されたグリッド領域に合わせて綺麗に整列
    if (!isBand) {
      const hCols = Math.min(cols, Math.ceil((headerRect.w + gap * 0.3) / (cellW + gap)));
      const estCellH = cellW / aspect;
      const hRows = Math.min(rows, Math.max(1, Math.ceil((headerRect.h + gap * 0.3) / (estCellH + gap))));
      headerRect = {
        x: innerX,
        y: innerY,
        w: hCols * cellW + (hCols - 1) * gap,
        h: Math.min(innerH * 0.42, hRows * cellH + (hRows - 1) * gap + (rowYOffset[hRows - 1] || 0)),
      };
    }

    const cards = placements.map(p => ({
      uid: p.entry.placed.uid,
      itemId: p.entry.item.id,
      item: p.entry.item,
      placed: p.entry.placed,
      entry: p.entry,
      isPop: p.entry.isPop,
      isSpacer: p.entry.isSpacer,
      gx: p.gx,
      gy: p.gy,
      gw: p.gw,
      gh: p.gh,
      x: innerX + p.gx * (cellW + gap),
      y: gridTop + p.gy * (cellH + gap) + (rowYOffset[p.gy] || 0),
      w: p.gw * cellW + (p.gw - 1) * gap,
      h: p.gh * cellH + (p.gh - 1) * gap,
    }));

    return { cards, cellW, cellH, cols, rows, gap, bandGap, header: { rect: headerRect } };
  }

  /** ジャンル別グループ枠＆見出し帯の描画 (Ver.0.15) */
  function drawGenreBoxes(ctx, st, cards, lay) {
    if (!cards.length) return;
    const groups = new Map();
    for (const card of cards) {
      if (card.isSpacer || card.item?.isSpacer || card.isPop || card.item?.isPop) continue;
      const g = card.item?.genre || 'その他・未分類';
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(card);
    }

    const bf = st.style?.bodyFont || '"Noto Sans JP", sans-serif';
    const S = st.style || {};

    for (const [genreName, groupCards] of groups.entries()) {
      const gColor = (genreName && genreName !== 'その他・未分類')
        ? getGenreColor(genreName, S.accent, st)
        : '#71717a';

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const c of groupCards) {
        minX = Math.min(minX, c.x);
        minY = Math.min(minY, c.y);
        maxX = Math.max(maxX, c.x + c.w);
        maxY = Math.max(maxY, c.y + c.h);
      }

      const maxPad = lay.gap ? Math.max(4, lay.gap * 0.42) : 12;
      const padX = Math.min(maxPad, Math.max(4, lay.cellW * 0.035));
      const padY = Math.min(maxPad, Math.max(4, lay.cellH * 0.035));
      const bx = minX - padX;
      const by = minY - padY;
      const bw = (maxX - minX) + padX * 2;
      const bh = (maxY - minY) + padY * 2;
      const rad = Math.max(8, Math.min(bw, bh) * 0.025);

      ctx.save();
      // 半透明背景フレーム
      ctx.fillStyle = hexA(gColor, 0.07);
      rr(ctx, bx, by, bw, bh, rad);
      ctx.fill();

      ctx.strokeStyle = hexA(gColor, 0.50);
      ctx.lineWidth = Math.max(1.5, Math.min(bw, bh) * 0.005);
      ctx.setLineDash([8, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 見出し帯プレート（左上）
      const titleH = Math.max(20, Math.min(32, lay.bandGap ? lay.bandGap * 0.72 : lay.cellH * 0.16));
      const fontSz = titleH * 0.58;
      ctx.font = F(900, fontSz, bf);
      const textW = ctx.measureText(genreName).width;
      const plateW = Math.min(Math.max(36, bw - 16), textW + titleH * 1.2);
      const plateX = bx + Math.min(10, Math.max(4, bw * 0.04));
      const plateY = by - titleH * 0.5;

      ctx.fillStyle = gColor;
      ctx.shadowColor = 'rgba(0,0,0,0.22)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      rr(ctx, plateX, plateY, plateW, titleH, titleH * 0.28);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const maxPlateTextW = Math.max(12, plateW - titleH * 0.5);
      if (textW > maxPlateTextW && textW > 0) {
        ctx.save();
        ctx.translate(plateX + plateW / 2, plateY + titleH / 2);
        ctx.scale(maxPlateTextW / textW, 1);
        ctx.fillText(genreName, 0, 0);
        ctx.restore();
      } else {
        ctx.fillText(genreName, plateX + plateW / 2, plateY + titleH / 2);
      }

      ctx.restore();
    }
  }

  /** メイン描画関数 */
  function draw(ctx, st, opts = {}) {
    const W = Number(st.canvas?.width) || 1920;
    const H = Number(st.canvas?.height) || 1080;
    const getImg = opts.getImg || (id => Images.get(id));

    ctx.save();
    ctx.clearRect(0, 0, W, H);

    // 1. 背景描画
    drawBackground(ctx, st, W, H, getImg);

    // 2. レイアウト計算
    const lay = computeLayout(st, W, H);

    // 3. ヘッダー描画
    drawHeader(ctx, st, lay.header.rect);

    // 3.5. ジャンル別グループ枠の描画（lGroupMode === 'genre_box'）
    if (st.layout?.groupMode === 'genre_box' && lay.cards.length > 0) {
      drawGenreBoxes(ctx, st, lay.cards, lay);
    }

    // 4. 各アイテムカード描画
    for (const card of lay.cards) {
      drawCard(ctx, st, card, getImg, opts);
    }

    // アイテムが0件のときのガイド表示（プレビュー時のみ）
    if (opts.preview && lay.cards.length === 0) {
      ctx.save();
      const bx = W * 0.15, by = H * 0.48, bw = W * 0.7, bh = H * 0.32;
      ctx.fillStyle = 'rgba(255,255,255,0.82)';
      rr(ctx, bx, by, bw, bh, 20);
      ctx.fill();
      ctx.strokeStyle = st.style?.accent || '#e4007f';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 6]);
      ctx.stroke();
      ctx.fillStyle = '#3b2340';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = F(900, Math.min(W, H) * 0.032, '"Noto Sans JP", sans-serif');
      ctx.fillText('左のアイテム一覧からドラッグ＆ドロップ、または「＋」で同人誌を並べましょう！', W / 2, by + bh / 2);
      ctx.restore();
    }

    ctx.restore();
    return lay;
  }

  return {
    rr, hexA, F, formatFontFamily, wrap, fitSize, drawContain, drawCover, fmtPrice,
    entries, resolveLabel, resolveSubLabel, draw, drawPopCard, getGenreColor, GENRE_PALETTE, GENRE_PALETTES,
    SUB_LABELS,
  };
})();
window.Render = Render;

