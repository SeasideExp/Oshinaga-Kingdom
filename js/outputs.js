/* ============================================================================
 * 4. 出力モジュール：簡易お品書き＆当日頒布物帳票 (window.Outputs)
 * ============================================================================ */
const Outputs = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** 500円単位などでない端数価格か判定 */
  function isOddPrice(price, unit) {
    if (price === '' || price == null) return false;
    const n = Number(price);
    const u = Number(unit);
    if (!u || u <= 0) return false;
    return n > 0 && n % u !== 0;
  }

  /** 発行年月文字列から年・月を抽出して数値比較可能にするヘルパー (Ver.0.57) */
  function parsePubDate(str) {
    if (!str || typeof str !== 'string') return -Infinity;
    const s = str.trim();
    const yMatch = s.match(/(?:20|19)\d{2}/);
    if (!yMatch) return -Infinity;
    const year = parseInt(yMatch[0], 10);
    let month = 0;
    const afterYear = s.slice(s.indexOf(yMatch[0]) + 4);
    const mMatch = afterYear.match(/(\d{1,2})(?:月|\/|\.|$)/);
    if (mMatch) {
      const m = parseInt(mMatch[1], 10);
      if (m >= 1 && m <= 12) month = m;
    } else {
      if (afterYear.includes('冬')) month = 12;
      else if (afterYear.includes('秋')) month = 10;
      else if (afterYear.includes('夏')) month = 8;
      else if (afterYear.includes('春')) month = 4;
    }
    return year * 100 + month;
  }

  /* ---------- 簡易お品書き（300dpi の canvas 配列を返す） ---------- */
  function renderMini(st, getImg) {
    getImg = getImg || (id => Images.get(id));
    const O = st.output || {}, M = st.meta || {};
    const showSpec = O.miniShowSpec === true;
    const { F, wrap, fitSize, drawContain, rr, fmtPrice, resolveLabel, resolveSubLabel } = Render;
    const dims = { A6: [105, 148], B6: [128, 182] };
    let [mw, mh] = dims[O.miniSize] || dims.A6;
    if (O.miniOrient === 'landscape') [mw, mh] = [mh, mw];
    const k = 300 / 25.4; // 300dpi px/mm
    const W = Math.round(mw * k), H = Math.round(mh * k);

    // 売り文句POPおよび空白枠は頒布物（在庫・金銭収受対象）ではないため簡易お品書きから除外 (Ver.0.17, Ver.0.52, Ver.0.69)
    let list = Render.entries(st).filter(e => !e.isPop && !e.item?.isPop && !String(e.placed?.itemId || '').startsWith('pop_') && !e.isSpacer && !e.item?.isSpacer && e.placed?.itemId !== 'spacer');

    // 簡易お品書き独自の掲載順ソート (Ver.0.57: お品書き本体の配置順は維持したまま独立ソート)
    const sortMode = O.miniSort || 'placed';
    if (sortMode !== 'placed' && list.length > 1) {
      list = [...list].sort((a, b) => {
        const itemA = a.item || {};
        const itemB = b.item || {};
        if (sortMode === 'pubdate_desc') {
          const vA = parsePubDate(itemA.pubdate);
          const vB = parsePubDate(itemB.pubdate);
          if (vA !== vB) return vB - vA;
          return 0;
        } else if (sortMode === 'pubdate_asc') {
          const vA = parsePubDate(itemA.pubdate);
          const vB = parsePubDate(itemB.pubdate);
          if (vA !== vB) return vA - vB;
          return 0;
        } else if (sortMode === 'genre') {
          const gA = itemA.genre || '';
          const gB = itemB.genre || '';
          if (gA !== gB) {
            if (!gA) return 1;
            if (!gB) return -1;
            const genres = st.genres || [];
            const idxA = genres.indexOf(gA);
            const idxB = genres.indexOf(gB);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return gA.localeCompare(gB, 'ja');
          }
          // 同ジャンル内は発行年月が新しい順
          const vA = parsePubDate(itemA.pubdate);
          const vB = parsePubDate(itemB.pubdate);
          return vB - vA;
        }
        return 0;
      });
    }

    const unit = Number(O.miniUnit) || 0;
    const emphOn = O.miniEmphasis !== 'none' && unit > 0;
    const anyOdd = emphOn && list.some(e => isOddPrice(e.item.price, unit));

    const m = 4.5 * k, headH = 14 * k, thH = 5.5 * k;
    const footH = 0; // 下部注意書きバー削除により余白不要化 (Ver.0.20)
    const tableH = H - m * 2 - headH - thH;

    // 20点対応：多点数時は1ページあたり最大7〜8件で美しく改ページ（最大4ページ）
    let pages = O.miniPages === 'auto'
      ? Math.max(1, Math.ceil((list.length || 1) / 7))
      : Number(O.miniPages) || 1;
    pages = Math.max(1, Math.min(4, Math.min(pages, list.length || 1)));

    const per = Math.ceil((list.length || 1) / pages) || 1;
    pages = Math.max(1, Math.ceil((list.length || 1) / per));
    const rowH = Math.min(30 * k, tableH / per);
    const hf = '"Noto Sans JP", "Yu Gothic", Meiryo, sans-serif';
    const out = [];

    for (let pg = 0; pg < pages; pg++) {
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const x = c.getContext('2d');
      x.fillStyle = '#ffffff';
      x.fillRect(0, 0, W, H);
      const iw = W - m * 2;

      // 見出し
      x.fillStyle = '#000000';
      x.textBaseline = 'top';
      x.textAlign = 'left';
      const pageSuffix = pages > 1 ? ` (${pg + 1}/${pages})` : '';
      const title = `${M.circle || ''} お品書き（卓上簡易版）${pageSuffix}`.trim();
      const ts = fitSize(x, title, 900, hf, 5.8 * k, iw);
      x.font = F(900, ts, hf);
      x.fillText(title, m, m);

      const sub = [M.eventName, M.twoDays && M.date2 ? `${M.date} / ${M.date2}` : M.date, M.space].filter(Boolean).join('　');
      if (sub) {
        const ss = fitSize(x, sub, 500, hf, 3.0 * k, iw);
        x.font = F(500, ss, hf);
        x.fillText(sub, m, m + 7.6 * k);
      }
      x.fillRect(m, m + headH - 1.5 * k, iw, 0.55 * k);

      // 列幅（書影 / 発行年月・書名・仕様 / 頒価）
      const col1W = Math.min(iw * 0.22, rowH * 0.85);
      const col3W = iw * 0.30;
      const col2W = iw - col1W - col3W;
      const c1X = m, c2X = m + col1W, c3X = m + col1W + col2W;
      const ty = m + headH;

      // テーブルヘッダー
      x.fillStyle = '#222222';
      x.fillRect(m, ty, iw, thH);
      x.fillStyle = '#ffffff';
      x.font = F(700, 2.9 * k, hf);
      x.textBaseline = 'middle';
      x.textAlign = 'center';
      x.fillText('書影', c1X + col1W / 2, ty + thH / 2);
      const headerCol2 = showSpec
        ? (O.miniShowName !== false ? '発行年月 ／ アイテム名・コメント' : '発行年月 ／ コメント')
        : (O.miniShowName !== false ? '発行年月 ／ アイテム名' : '発行年月');
      x.fillText(headerCol2, c2X + col2W / 2, ty + thH / 2);
      x.fillText('頒価', c3X + col3W / 2, ty + thH / 2);

      // 各行描画
      const slice = list.slice(pg * per, (pg + 1) * per);
      slice.forEach((entry, idx) => {
        const { item, placed } = entry;
        const ry = ty + thH + idx * rowH;
        const odd = emphOn && isOddPrice(item.price, unit);

        // 偶数行の薄い背景
        if (idx % 2 === 1) {
          x.fillStyle = '#f6f6f6';
          x.fillRect(m, ry, iw, rowH);
        }

        // 1. 書影セル
        const padImg = 1.2 * k;
        const im = getImg(item.imageId);
        if (im) {
          drawContain(x, im, c1X + padImg, ry + padImg, col1W - padImg * 2, rowH - padImg * 2);
        } else {
          x.strokeStyle = '#bbbbbb';
          x.lineWidth = 1;
          x.strokeRect(c1X + padImg * 1.5, ry + padImg, col1W - padImg * 3, rowH - padImg * 2);
          x.fillStyle = '#777777';
          x.font = F(700, 2.2 * k, hf);
          x.textAlign = 'center';
          x.textBaseline = 'middle';
          x.fillText('NO IMG', c1X + col1W / 2, ry + rowH / 2);
        }

        // 2. 発行年月・書名・ラベルセル
        const padTxt = 2.0 * k;
        let curY = ry + padTxt * 0.8;
        x.textAlign = 'left';
        x.textBaseline = 'top';

        // ラベル＋発行年月（＋ジャンル常時表示） (Ver.0.36: ラベル・ラベル補2系統対応)
        const lbl = O.miniShowLabel !== false ? resolveLabel(placed, st.labelColors) : null;
        const subLbl = O.miniShowLabel !== false && resolveSubLabel ? resolveSubLabel(placed, st.subLabelColors) : null;
        let dateLine = item.pubdate || '';
        let badgeTxt = '';
        if (lbl && lbl.text) badgeTxt += `【${lbl.text}】`;
        if (subLbl && subLbl.text) badgeTxt += `【${subLbl.text}】`;
        if (badgeTxt) {
          dateLine = dateLine ? `${badgeTxt} ${dateLine}` : badgeTxt;
        }
        if (item.genre) {
          dateLine = dateLine ? `[${item.genre}] ${dateLine}` : `[${item.genre}]`;
        }
        if (dateLine) {
          const dSz = Math.min(3.2 * k, rowH * 0.22);
          x.font = F(700, dSz, hf);
          x.fillStyle = '#111111';
          const dWrapped = wrap(x, dateLine, col2W - padTxt * 2, 1)[0];
          x.fillText(dWrapped, c2X + padTxt, curY);
          curY += dSz * 1.3;
        }

        // 書名
        if (O.miniShowName !== false && item.name) {
          const nSz = Math.min(3.5 * k, rowH * 0.25);
          x.font = F(900, nSz, hf);
          x.fillStyle = '#000000';
          const nLines = wrap(x, item.name, col2W - padTxt * 2, 2);
          for (const ln of nLines) {
            if (curY + nSz > ry + rowH - padTxt * 0.5) break;
            x.fillText(ln, c2X + padTxt, curY);
            curY += nSz * 1.2;
          }
        }

        // コメント（仕様・補足等）複数行描画 (Ver.0.54: miniShowSpec === true の時のみ表示)
        if (showSpec && item.spec && curY + 2.0 * k < ry + rowH) {
          const sSz = Math.min(2.4 * k, rowH * 0.16);
          x.font = F(400, sSz, hf);
          x.fillStyle = '#444444';
          const sLines = wrap(x, item.spec, col2W - padTxt * 2, 2);
          for (const sLine of sLines) {
            if (curY + sSz > ry + rowH - padTxt * 0.4) break;
            x.fillText(sLine, c2X + padTxt, curY);
            curY += sSz * 1.2;
          }
        }

        // 3. 頒価セル（シンプル＆デカ文字強調・注意書きテキスト削除 Ver.0.20）
        const pStr = fmtPrice(item.price) || '-';
        if (odd && O.miniEmphasis === 'invert') {
          x.fillStyle = '#111111';
          x.fillRect(c3X + 0.8 * k, ry + 0.8 * k, col3W - 1.6 * k, rowH - 1.6 * k);
          const pSz = fitSize(x, pStr, 900, hf, Math.min(5.8 * k, rowH * 0.50), col3W - 4 * k, 11);
          x.font = F(900, pSz, hf);
          x.fillStyle = '#ffffff';
          x.textAlign = 'center';
          x.textBaseline = 'middle';
          x.fillText(pStr, c3X + col3W / 2, ry + rowH / 2);
        } else if (odd && O.miniEmphasis === 'box') {
          x.fillStyle = '#ffff80';
          x.fillRect(c3X + 0.8 * k, ry + 0.8 * k, col3W - 1.6 * k, rowH - 1.6 * k);
          x.strokeStyle = '#ff4b00';
          x.lineWidth = 0.8 * k;
          x.strokeRect(c3X + 1.2 * k, ry + 1.2 * k, col3W - 2.4 * k, rowH - 2.4 * k);
          const pSz = fitSize(x, pStr, 900, hf, Math.min(5.6 * k, rowH * 0.48), col3W - 4 * k, 11);
          x.font = F(900, pSz, hf);
          x.fillStyle = '#000000';
          x.textAlign = 'center';
          x.textBaseline = 'middle';
          x.fillText(pStr, c3X + col3W / 2, ry + rowH / 2);
        } else {
          const pSz = fitSize(x, pStr, 900, hf, Math.min(5.4 * k, rowH * 0.46), col3W - 3 * k, 11);
          x.font = F(900, pSz, hf);
          x.fillStyle = '#000000';
          x.textAlign = 'center';
          x.textBaseline = 'middle';
          x.fillText(pStr, c3X + col3W / 2, ry + rowH / 2);
        }

        // 罫線
        x.strokeStyle = '#222222';
        x.lineWidth = 0.25 * k;
        x.strokeRect(m, ry, iw, rowH);
        x.beginPath();
        x.moveTo(c2X, ry); x.lineTo(c2X, ry + rowH);
        x.moveTo(c3X, ry); x.lineTo(c3X, ry + rowH);
        x.stroke();
      });

      if (!list.length) {
        x.fillStyle = '#888888';
        x.font = F(700, 3.8 * k, hf);
        x.textAlign = 'center';
        x.textBaseline = 'middle';
        x.fillText('配置中のアイテムがありません', W / 2, ty + thH + (H - ty - thH - m) / 2);
      }

      out.push(c);
    }

    return { pages: out, size: O.miniSize || 'A6', orient: O.miniOrient || 'portrait', anyOdd };
  }

  /* ---------- 当日頒布物帳票（A4白黒・1日/2日連続開催対応 HTML生成） ---------- */
  function stockSheetHtml(st) {
    const M = st.meta || {}, O = st.output || {};
    const showSpec = O.sheetShowSpec === true;
    const twoDays = !!M.twoDays;
    const orient = O.sheetOrient === 'landscape' ? 'landscape' : 'portrait';
    const extraRows = Math.max(0, Number.isFinite(Number(O.sheetExtraRows)) ? Number(O.sheetExtraRows) : 2);

    // 売り文句POPおよび空白枠は頒布物（在庫管理・会計対象）ではないため帳票テーブルから除外 (Ver.0.17, Ver.0.52, Ver.0.69)
    let list = Render.entries(st).filter(e => !e.isPop && !e.item?.isPop && !String(e.placed?.itemId || '').startsWith('pop_') && !e.isSpacer && !e.item?.isSpacer && e.placed?.itemId !== 'spacer');

    const totalRows = list.length + extraRows;
    const fitOnePage = O.sheetFitOnePage !== false;

    // A4用紙1枚に収めるための動的レイアウト計算 (Ver.0.57)
    let pageMargin = 12;
    let bodyPadding = 8;
    let trHeight = 11.5;
    let cellPadY = 5;
    let cellPadX = 6;
    let fontSize = 10.5;
    let thFontSize = 9;
    let sumRowHeight = 10;
    let memoMinHeight = 26;
    let titleCellSubFontSize = 8;

    if (fitOnePage) {
      if (orient === 'portrait') {
        // A4縦 (高さ297mm)
        if (totalRows <= 12) {
          pageMargin = 10;
          bodyPadding = 5;
          trHeight = 11.0;
          cellPadY = 4;
          fontSize = 10;
          thFontSize = 9;
          sumRowHeight = 9.5;
          memoMinHeight = 22;
        } else if (totalRows <= 18) {
          pageMargin = 8;
          bodyPadding = 3;
          trHeight = Math.max(7.8, Math.min(10.0, 160 / totalRows));
          cellPadY = 2.5;
          fontSize = 9;
          thFontSize = 8.5;
          sumRowHeight = 8;
          memoMinHeight = 15;
          titleCellSubFontSize = 7.5;
        } else if (totalRows <= 28) {
          pageMargin = 6;
          bodyPadding = 2;
          trHeight = Math.max(5.5, Math.min(7.6, 170 / totalRows));
          cellPadY = 1.5;
          fontSize = 8.2;
          thFontSize = 8;
          sumRowHeight = 7;
          memoMinHeight = 11;
          titleCellSubFontSize = 7;
        } else {
          pageMargin = 5;
          bodyPadding = 1;
          trHeight = Math.max(4.6, 175 / totalRows);
          cellPadY = 1.0;
          fontSize = 7.5;
          thFontSize = 7.5;
          sumRowHeight = 6.5;
          memoMinHeight = 8;
          titleCellSubFontSize = 6.5;
        }
      } else {
        // A4横 (高さ210mm)
        if (totalRows <= 10) {
          pageMargin = 8;
          bodyPadding = 4;
          trHeight = 9.5;
          cellPadY = 3;
          fontSize = 9.5;
          thFontSize = 8.5;
          sumRowHeight = 8.5;
          memoMinHeight = 16;
        } else if (totalRows <= 18) {
          pageMargin = 6;
          bodyPadding = 2;
          trHeight = Math.max(5.8, Math.min(8.8, 115 / totalRows));
          cellPadY = 1.8;
          fontSize = 8.2;
          thFontSize = 8;
          sumRowHeight = 7;
          memoMinHeight = 11;
          titleCellSubFontSize = 7;
        } else {
          pageMargin = 5;
          bodyPadding = 1;
          trHeight = Math.max(4.4, 110 / totalRows);
          cellPadY = 1.0;
          fontSize = 7.5;
          thFontSize = 7.5;
          sumRowHeight = 6.0;
          memoMinHeight = 7;
          titleCellSubFontSize = 6.5;
        }
      }
    }

    const rowsHtml = [];
    for (let i = 0; i < totalRows; i++) {
      const entry = list[i];
      const it = entry ? entry.item : null;
      const lbl = entry ? Render.resolveLabel(entry.placed, st.labelColors) : null;
      const subLbl = (entry && Render.resolveSubLabel) ? Render.resolveSubLabel(entry.placed, st.subLabelColors) : null;
      let labelText = '';
      if (lbl && lbl.text && subLbl && subLbl.text) {
        labelText = `${lbl.text} / ${subLbl.text}`;
      } else if (lbl && lbl.text) {
        labelText = lbl.text;
      } else if (subLbl && subLbl.text) {
        labelText = subLbl.text;
      }
      const priceStr = it && it.price !== '' && it.price != null ? Render.fmtPrice(it.price) : '';
      let specHtml = '';
      if (it) {
        const parts = [];
        if (it.pubdate) parts.push(esc(it.pubdate));
        if (showSpec && it.spec) {
          parts.push(esc(it.spec).replace(/\r?\n/g, '<br>'));
        }
        specHtml = parts.join(' ／ ');
      }
      let genreBadge = '';
      if (it && it.genre) {
        genreBadge = `<span class="badge-genre">${esc(it.genre)}</span>`;
      }

      if (twoDays) {
        rowsHtml.push(`
          <tr>
            <td class="c num">${i + 1}</td>
            <td class="c">${esc(labelText)}</td>
            <td class="title-cell">
              <div class="b"><span class="title-inner">${genreBadge}${esc(it ? it.name : '')}</span></div>
              ${specHtml ? `<div class="sub">${specHtml}</div>` : ''}
            </td>
            <td class="r b">${esc(priceStr)}</td>
            <td class="write"></td>
            <td class="write"></td>
            <td class="write"></td>
            <td class="write"></td>
            <td class="write"></td>
            <td class="write"></td>
            <td class="write"></td>
            <td class="write"></td>
          </tr>
        `);
      } else {
        rowsHtml.push(`
          <tr>
            <td class="c num">${i + 1}</td>
            <td class="c">${esc(labelText)}</td>
            <td class="title-cell">
              <div class="b"><span class="title-inner">${genreBadge}${esc(it ? it.name : '')}</span></div>
              ${specHtml ? `<div class="sub">${specHtml}</div>` : ''}
            </td>
            <td class="r b">${esc(priceStr)}</td>
            <td class="write"></td>
            <td class="write"></td>
            <td class="write"></td>
            <td class="write"></td>
            <td class="write"></td>
          </tr>
        `);
      }
    }

    if (totalRows === 0) {
      const colspan = twoDays ? 12 : 9;
      rowsHtml.push(`<tr><td colspan="${colspan}" class="c" style="padding:24px;color:#888;">配置中のアイテムがありません</td></tr>`);
    }

    const colTitleHead = showSpec ? '書名 / ジャンル・コメント' : '書名 / ジャンル';
    const headCols = twoDays
      ? `
        <th style="width:3%;">No</th>
        <th style="width:6%;">区分</th>
        <th style="width:24%;">${colTitleHead}</th>
        <th style="width:7%;">頒価</th>
        <th style="width:7%;">持込数<br><small>(1日目)</small></th>
        <th style="width:7.5%;">当日残った数<br><small>(1日目残)</small></th>
        <th style="width:7.5%;">当日出た数<br><small>(1日目頒布)</small></th>
        <th style="width:6.5%;">2日目<br><small>追加持込</small></th>
        <th style="width:7.5%;">2日目に残った数</th>
        <th style="width:7.5%;">2日目に出た数</th>
        <th style="width:7%;">2日間<br><small>合計出た数</small></th>
        <th style="width:9.5%;">頒布金額計 / 備考</th>
      `
      : `
        <th style="width:3.5%;">No</th>
        <th style="width:7%;">区分</th>
        <th style="width:33.5%;">${colTitleHead}</th>
        <th style="width:8%;">頒価</th>
        <th style="width:8.5%;">持込数</th>
        <th style="width:9%;">当日残った数</th>
        <th style="width:9%;">当日出た数</th>
        <th style="width:10.5%;">頒布金額(計)</th>
        <th style="width:11%;">備考・メモ</th>
      `;

    const sumRow = twoDays
      ? `<tr class="sum-row"><td colspan="4" class="r b">合計</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`
      : `<tr class="sum-row"><td colspan="4" class="r b">合計</td><td></td><td></td><td></td><td></td><td></td></tr>`;

    const dateDisp = twoDays && M.date2
      ? `1日目: ${esc(M.date || '')} (${esc(M.space || '')}) ／ 2日目: ${esc(M.date2)} (${esc(M.space2 || M.space || '')})`
      : `${esc(M.date || '')}　スペース: ${esc(M.space || '')}`;

    const placeTime = [M.place, M.time].filter(Boolean).join(' ');
    const eventSub = placeTime ? `（${esc(placeTime)}）` : '';
    const printWidthMm = (orient === 'landscape' ? 297 : 210) - pageMargin * 2;
    const effCellPadX = twoDays ? Math.min(cellPadX, 3) : cellPadX;

    return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>当日頒布物帳票 - ${esc(M.circle || '')}</title>
<style>
  @page { size: A4 ${orient}; margin: ${pageMargin}mm; }
  * { box-sizing: border-box; }
  html {
    padding: ${bodyPadding}mm;
    background: #fff;
  }
  body {
    font-family: "Noto Sans JP", "Yu Gothic", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;
    color: #000;
    background: #fff;
    width: ${printWidthMm}mm;
    margin: 0 auto;
    padding: 0;
    font-size: ${fontSize}pt;
  }
  .sheet-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-bottom: 2px solid #000;
    padding-bottom: ${fitOnePage && totalRows > 18 ? '3px' : '6px'};
    margin-bottom: ${fitOnePage && totalRows > 18 ? '5px' : '10px'};
  }
  .sheet-title {
    font-size: ${fitOnePage && totalRows > 18 ? '13pt' : '16pt'};
    font-weight: 900;
    letter-spacing: 0.04em;
  }
  .sheet-meta {
    font-size: ${fitOnePage && totalRows > 18 ? '8.5pt' : '9.5pt'};
    line-height: 1.4;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  th, td {
    border: 1.2px solid #000;
    padding: ${cellPadY}px ${effCellPadX}px;
    vertical-align: middle;
    word-break: break-word;
  }
  thead th {
    background: #efefef;
    font-weight: 700;
    font-size: ${thFontSize}pt;
    text-align: center;
    line-height: 1.2;
  }
  tbody tr { height: ${trHeight}mm; }
  .c { text-align: center; }
  .r { text-align: right; }
  .b { font-weight: 700; }
  .num { font-weight: 700; }
  .title-cell {
    max-width: 0;
    overflow: hidden;
  }
  .title-cell .b {
    display: block;
    white-space: nowrap;
    overflow: hidden;
  }
  .title-cell .title-inner {
    display: inline-block;
    white-space: nowrap;
    transform-origin: left center;
  }
  .title-cell .sub { font-size: ${titleCellSubFontSize}pt; color: #333; margin-top: 1px; }
  .badge-genre {
    display: inline-block;
    font-size: 7pt;
    padding: 0 3px;
    border: 1px solid #666;
    border-radius: 3px;
    margin-right: 4px;
    vertical-align: 1px;
    font-weight: 700;
    color: #222;
    background: #f0f0f0;
  }
  .write { background: #fff; }
  .sum-row { height: ${sumRowHeight}mm; background: #f8f8f8; }
  .memo-box {
    border: 1.2px solid #000;
    padding: ${fitOnePage && totalRows > 18 ? '4px 8px' : '8px 10px'};
    font-size: ${fontSize * 0.9}pt;
    min-height: ${memoMinHeight}mm;
    margin-top: ${fitOnePage && totalRows > 18 ? '5px' : '10px'};
  }
  .memo-box b { display: block; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 3px; }
  @media print {
    html { padding: 0 !important; }
    body { width: 100%; margin: 0; padding: 0 !important; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
  <div class="sheet-head">
    <div>
      <div class="sheet-title">当日頒布物 在庫・頒布管理帳票${twoDays ? '（2日連続開催用）' : ''}</div>
      <div class="sheet-meta">
        <b>イベント名：</b>${esc(M.eventName || '')}${eventSub}<br>
        <b>開催日・配置：</b>${dateDisp}
      </div>
    </div>
    <div class="sheet-meta" style="text-align:right;">
      <b>サークル名：${esc(M.circle || '')}</b><br>
      天候：[ 晴 / 曇 / 雨 ]　担当者記入：＿＿＿＿＿＿
    </div>
  </div>

  <table>
    <thead>
      <tr>${headCols}</tr>
    </thead>
    <tbody>
      ${rowsHtml.join('')}
      ${sumRow}
    </tbody>
  </table>

  <div class="memo-box">
    <b>メモ</b>
  </div>

  <script>
    function fitTitles() {
      document.querySelectorAll('.title-cell .b').forEach(function(bEl) {
        var inner = bEl.querySelector('.title-inner') || bEl;
        inner.style.fontSize = '';
        inner.style.transform = '';
        var maxW = bEl.clientWidth - 4; // セル内表示可能幅
        if (maxW <= 0) return;
        var fs = ${fontSize}; // 初期フォントサイズ (pt)
        while (inner.scrollWidth > maxW && fs > 6.5) {
          fs -= 0.5;
          inner.style.fontSize = fs + 'pt';
        }
        if (inner.scrollWidth > maxW) {
          var scale = maxW / inner.scrollWidth;
          inner.style.transform = 'scaleX(' + scale + ')';
        }
      });
    }

    function fitSheetToOnePage() {
      if (!${fitOnePage}) return;
      document.body.style.zoom = '';
      document.body.style.transform = '';
      document.body.style.transformOrigin = '';
      document.body.style.width = '';
      var isLand = ${orient === 'landscape'};
      var pageH_mm = isLand ? 210 : 297;
      var margin_mm = ${pageMargin} * 2;
      // 1mm = 3.779527px (96dpi換算)
      var maxAllowedPx = (pageH_mm - margin_mm - 4) * 3.779527;
      var curH = document.body.scrollHeight;
      if (curH > maxAllowedPx && maxAllowedPx > 200) {
        var ratio = Math.max(0.40, Math.min(0.99, maxAllowedPx / curH));
        // transformではなくzoomを使用することで、印刷時の改ページ判定（pagination）が縮小後のレイアウトに連動する
        document.body.style.zoom = ratio;
      }
    }

    function fitAll() {
      document.body.style.zoom = '';
      fitTitles();
      fitSheetToOnePage();
    }

    window.addEventListener('DOMContentLoaded', fitAll);
    window.addEventListener('resize', fitAll);
    window.addEventListener('beforeprint', fitAll);
    setTimeout(fitAll, 100);
  </script>
</body>
</html>`;
  }

  /* ---------- Canvas配列から実寸（mm指定）の単一・複数ページPDFバイナリ（Blob）を直接生成 (Ver.0.62) ---------- */
  function canvasesToPdfBlob(canvases, pageSizeMm = null, quality = 0.94) {
    const pages = [];
    for (let i = 0; i < canvases.length; i++) {
      const cv = canvases[i];
      if (!cv || !cv.width || !cv.height) continue;

      // JPEG変換用に白背景のキャンバスへ合成（透過部分の黒化防止）
      const tmp = document.createElement('canvas');
      tmp.width = cv.width;
      tmp.height = cv.height;
      const tctx = tmp.getContext('2d');
      tctx.fillStyle = '#ffffff';
      tctx.fillRect(0, 0, tmp.width, tmp.height);
      tctx.drawImage(cv, 0, 0);

      const dataUrl = tmp.toDataURL('image/jpeg', quality);
      const base64 = dataUrl.split(',')[1] || '';
      const binStr = atob(base64);
      const bytes = new Uint8Array(binStr.length);
      for (let j = 0; j < binStr.length; j++) {
        bytes[j] = binStr.charCodeAt(j);
      }

      // ページ物理サイズ（pt単位: 1 inch = 72 pt, 1 inch = 25.4 mm）
      let wPt, hPt;
      if (pageSizeMm && pageSizeMm.wMm > 0 && pageSizeMm.hMm > 0) {
        wPt = (pageSizeMm.wMm * 72) / 25.4;
        hPt = (pageSizeMm.hMm * 72) / 25.4;
      } else {
        // 300dpi基準でpt換算（最大辺がA4長辺相当を超えない場合は150〜300dpiスケールで適度な物理サイズに）
        wPt = (cv.width * 72) / 300;
        hPt = (cv.height * 72) / 300;
      }

      pages.push({
        widthPx: cv.width,
        heightPx: cv.height,
        wPt: Number(wPt.toFixed(2)),
        hPt: Number(hPt.toFixed(2)),
        jpegBytes: bytes,
      });
    }

    if (!pages.length) return null;

    // PDFオブジェクト構成:
    // 1: Catalog
    // 2: Pages
    // ページ i (0-indexed) ごとに:
    //   objId = 3 + i * 3     : Page
    //   objId = 3 + i * 3 + 1 : Content Stream
    //   objId = 3 + i * 3 + 2 : Image XObject
    const totalObjects = 2 + pages.length * 3;
    const chunks = [];
    const offsets = new Array(totalObjects + 1).fill(0);
    let currentOffset = 0;
    const enc = new TextEncoder();

    function pushStr(str) {
      const b = enc.encode(str);
      chunks.push(b);
      currentOffset += b.byteLength;
    }

    function pushBytes(b) {
      chunks.push(b);
      currentOffset += b.byteLength;
    }

    // PDF Header (バイナリコメント付き)
    pushBytes(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

    // 1: Catalog
    offsets[1] = currentOffset;
    pushStr(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

    // 2: Pages
    const kidsRefs = pages.map((_, i) => `${3 + i * 3} 0 R`).join(' ');
    offsets[2] = currentOffset;
    pushStr(`2 0 obj\n<< /Type /Pages /Kids [ ${kidsRefs} ] /Count ${pages.length} >>\nendobj\n`);

    // 各ページの Page / Content / Image XObject
    pages.forEach((p, i) => {
      const pageObjId = 3 + i * 3;
      const contentObjId = pageObjId + 1;
      const imgObjId = pageObjId + 2;
      const imgName = `/Im${i + 1}`;

      // Page Object
      offsets[pageObjId] = currentOffset;
      pushStr(
        `${pageObjId} 0 obj\n` +
        `<< /Type /Page /Parent 2 0 R /MediaBox [ 0 0 ${p.wPt} ${p.hPt} ] ` +
        `/Resources << /XObject << ${imgName} ${imgObjId} 0 R >> >> ` +
        `/Contents ${contentObjId} 0 R >>\n` +
        `endobj\n`
      );

      // Content Stream (ページ全面にXObject画像を描画)
      const contentStr = `q\n${p.wPt} 0 0 ${p.hPt} 0 0 cm\n${imgName} Do\nQ\n`;
      const contentBytes = enc.encode(contentStr);
      offsets[contentObjId] = currentOffset;
      pushStr(`${contentObjId} 0 obj\n<< /Length ${contentBytes.byteLength} >>\nstream\n`);
      pushBytes(contentBytes);
      pushStr(`\nendstream\nendobj\n`);

      // Image XObject (DCTDecode = JPEG)
      offsets[imgObjId] = currentOffset;
      pushStr(
        `${imgObjId} 0 obj\n` +
        `<< /Type /XObject /Subtype /Image /Width ${p.widthPx} /Height ${p.heightPx} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpegBytes.byteLength} >>\n` +
        `stream\n`
      );
      pushBytes(p.jpegBytes);
      pushStr(`\nendstream\nendobj\n`);
    });

    // Cross-Reference Table (xref)
    const xrefOffset = currentOffset;
    pushStr(`xref\n0 ${totalObjects + 1}\n`);
    pushStr(`0000000000 65535 f \n`);
    for (let id = 1; id <= totalObjects; id++) {
      const offStr = String(offsets[id]).padStart(10, '0');
      pushStr(`${offStr} 00000 n \n`);
    }

    // Trailer
    pushStr(
      `trailer\n` +
      `<< /Size ${totalObjects + 1} /Root 1 0 R >>\n` +
      `startxref\n` +
      `${xrefOffset}\n` +
      `%%EOF\n`
    );

    return new Blob(chunks, { type: 'application/pdf' });
  }

  return { esc, isOddPrice, renderMini, stockSheetHtml, canvasesToPdfBlob };
})();
window.Outputs = Outputs;

