/* ============================================================================
 * 5. お品書キングダム メインアプリケーション (App)
 * ============================================================================ */
(async function () {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = Outputs.esc;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  /** 発行年月文字列から年・月を抽出して数値比較可能にするヘルパー (Ver.0.17) */
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

  /** 出力ファイル名用 YYYYMMDD プレフィックス生成 (Ver.0.30) */
  function getTodayPrefix() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  }

  const FONTS = [
    ['"Noto Sans JP", sans-serif', 'Noto Sans JP（ゴシック）'],
    ['"M PLUS Rounded 1c", sans-serif', 'M PLUS Rounded 1c（丸ゴシック）'],
    ['"Zen Maru Gothic", sans-serif', 'Zen Maru Gothic（やさしい丸）'],
    ['"Kosugi Maru", sans-serif', '小杉丸ゴシック'],
    ['"Dela Gothic One", sans-serif', 'Dela Gothic One（極太POP）'],
    ['"Noto Serif JP", serif', 'Noto Serif JP（明朝）'],
    ['"Yu Gothic", "Hiragino Sans", Meiryo, sans-serif', 'システム（游ゴシック等）'],
  ];

  /* 定番日本語フォント定義（PC搭載フォント自動検出・候補リスト Ver.0.39） */
  const COMMON_JP_FONTS = [
    { name: 'メイリオ', family: 'Meiryo, "メイリオ"' },
    { name: '游ゴシック', family: '"Yu Gothic", YuGothic, "游ゴシック体", "游ゴシック"' },
    { name: '游明朝', family: '"Yu Mincho", YuMincho, "游明朝体", "游明朝"' },
    { name: 'ヒラギノ角ゴ', family: '"Hiragino Kaku Gothic ProN", "Hiragino Sans", "ヒラギノ角ゴ ProN W3"' },
    { name: 'ヒラギノ明朝', family: '"Hiragino Mincho ProN", "ヒラギノ明朝 ProN W3"' },
    { name: 'ヒラギノ丸ゴ', family: '"Hiragino Maru Gothic ProN", "ヒラギノ丸ゴ ProN W4"' },
    { name: 'BIZ UDPゴシック', family: '"BIZ UDPGothic"' },
    { name: 'BIZ UDP明朝', family: '"BIZ UDPMincho"' },
    { name: 'BIZ UDゴシック', family: '"BIZ UDGothic"' },
    { name: 'BIZ UD明朝', family: '"BIZ UDMincho"' },
    { name: 'UDデジタル教科書体 N-B', family: '"UD Digi Kyokasho N-B", "UD Digi Kyokasho NK-B"' },
    { name: 'UDデジタル教科書体 N-R', family: '"UD Digi Kyokasho N-R", "UD Digi Kyokasho NK-R"' },
    { name: '源ノ角ゴシック (Source Han Sans)', family: '"Source Han Sans JP", "Noto Sans CJK JP", "Source Han Sans"' },
    { name: '源ノ明朝 (Source Han Serif)', family: '"Source Han Serif JP", "Noto Serif CJK JP", "Source Han Serif"' },
    { name: '源柔ゴシック', family: 'GenJyuuGothic, "源柔ゴシック"' },
    { name: '源暎ゴシック', family: '"GenEi Gothic", "GenEi Gothic P", "源暎ゴシック"' },
    { name: '源暎アンチック', family: '"GenEi Antique", "GenEi Antique v2", "源暎アンチック"' },
    { name: 'HG創英角ポップ体', family: 'HGSoeiKakupoptai, "HGP創英角ﾎﾟｯﾌﾟ体", "HGS創英角ﾎﾟｯﾌﾟ体", "HG創英角ポップ体"' },
    { name: 'HG丸ゴシックM-PRO', family: 'HGMaruGothicMPRO, "HGP丸ｺﾞｼｯｸM-PRO", "HGS丸ｺﾞｼｯｸM-PRO", "HG丸ゴシックM-PRO"' },
    { name: 'HGP行書体', family: 'HGGyoshotai, "HGP行書体", "HGS行書体", "HG行書体"' },
    { name: 'HG明朝E', family: 'HGMinchoE, "HGP明朝E", "HGS明朝E", "HG明朝E"' },
    { name: 'HG正楷書体-PRO', family: 'HGSeikaishotaiPRO, "HGP正規楷書体-PRO", "HGS正規楷書体-PRO"' },
    { name: 'MS Pゴシック', family: '"MS PGothic", "ＭＳ Ｐゴシック"' },
    { name: 'MS P明朝', family: '"MS PMincho", "ＭＳ Ｐ明朝"' },
    { name: 'MS ゴシック', family: '"MS Gothic", "ＭＳ ゴシック"' },
    { name: 'MS 明朝', family: '"MS Mincho", "ＭＳ 明朝"' },
    { name: '凸版文久見出しゴシック', family: '"Toppan Bunkyu Midashi Gothic", "凸版文久見出しゴシック"' },
    { name: '筑紫A丸ゴシック', family: '"Tsukushi A Round Gothic", "筑紫A丸ゴシック"' },
    { name: 'クレー (Klee One)', family: '"Klee One", Klee, "クレー"' },
    { name: 'けいふぉんと', family: 'keifont, "けいふぉんと"' },
    { name: 'ラノベPOP', family: 'LightNovelPOP, "ラノベPOP"' },
    { name: 'コーポレート・ロゴ', family: '"Corporate Logo", "コーポレート・ロゴ"' },
  ];

  /* ---------- 色調設定パレット（CUD推奨配色 ＆ クラシック配色 Ver.0.61 / デフォルト調整 Ver.0.62） ---------- */
  const COLOR_MODES = {
    classic: {
      name: 'クラシック（カラーユニバーサルデザインに対応していません・標準）',
      themes: {
        pop: { name: 'ポップピンク', bg: { type: 'gradient', color1: '#ffe3ef', color2: '#fff6cf', angle: 135, pattern: 'dots', patternColor: '#ffffff', patternOpacity: 0.6 }, style: { accent: '#e4007f', headerText: '#3b2340', headerOutline: '#ffffff', cardBg: '#ffffff', cardText: '#2b2330', priceColor: '#e60033', headerPanelColor: '#ffffff', headingFont: FONTS[1][0], bodyFont: FONTS[0][0], cardBorder: true } },
        cool: { name: 'クールブルー', bg: { type: 'gradient', color1: '#0f2742', color2: '#2c6a8f', angle: 120, pattern: 'grid', patternColor: '#ffffff', patternOpacity: 0.08 }, style: { accent: '#00b7ee', headerText: '#ffffff', headerOutline: '#0f2742', cardBg: '#ffffff', cardText: '#14213d', priceColor: '#0068b7', headerPanelColor: '#0f2742', headingFont: FONTS[0][0], bodyFont: FONTS[0][0], cardBorder: true } },
        wa: { name: '和風レトロ', bg: { type: 'solid', color1: '#f3ead7', color2: '#e6d5b0', angle: 90, pattern: 'check', patternColor: '#c9b48a', patternOpacity: 0.15 }, style: { accent: '#b7282e', headerText: '#2f1f12', headerOutline: '#fffaf0', cardBg: '#fffaf0', cardText: '#2f1f12', priceColor: '#b7282e', headerPanelColor: '#fffaf0', headingFont: FONTS[5][0], bodyFont: FONTS[5][0], cardBorder: true } },
        flyer: { name: 'チラシ風', bg: { type: 'radial', color1: '#fff600', color2: '#ffb300', angle: 0, pattern: 'rays', patternColor: '#ffffff', patternOpacity: 0.35 }, style: { accent: '#e60012', headerText: '#1a1a1a', headerOutline: '#ffffff', cardBg: '#ffffff', cardText: '#1a1a1a', priceColor: '#e60012', headerPanelColor: '#ffffff', headingFont: FONTS[4][0], bodyFont: FONTS[0][0], cardBorder: true } },
        night: { name: 'ナイトゴールド', bg: { type: 'gradient', color1: '#1b1530', color2: '#3b2a5c', angle: 160, pattern: 'dots', patternColor: '#d4af37', patternOpacity: 0.12 }, style: { accent: '#d4af37', headerText: '#ffffff', headerOutline: '#1b1530', cardBg: '#2a2140', cardText: '#f5f0ff', priceColor: '#ffd75e', headerPanelColor: '#1b1530', headingFont: FONTS[5][0], bodyFont: FONTS[0][0], cardBorder: true } },
        simple: { name: 'シンプル', bg: { type: 'solid', color1: '#ffffff', color2: '#f2f2f2', angle: 90, pattern: 'none', patternColor: '#000000', patternOpacity: 0.1 }, style: { accent: '#222222', headerText: '#222222', headerOutline: '#ffffff', cardBg: '#f6f6f6', cardText: '#222222', priceColor: '#d7000f', headerPanelColor: '#ffffff', headingFont: FONTS[0][0], bodyFont: FONTS[0][0], cardBorder: true } },
      },
      genreColors: { '架空ほげほげ': '#e4007f', '架空テスト': '#0068b7', 'オリジナル': '#059669' },
      labelColors: {
        new: '#e60033',
        new_set: '#db2777',
        new_work: '#e60033',
        new_music: '#e60033',
        new_en: '#ff0055',
        semi_new: '#c85a17',
        old: '#3a6ea5',
        reprint: '#2e9e5b',
        goods: '#f08300',
        goods_std: '#10b981',
        limited: '#c99700',
        consign: '#8e44ad',
        free: '#00a3af',
        few: '#555555',
        custom: '#e60033',
        custom_b: '#0284c7',
        custom_c: '#059669',
      },
      subLabelColors: {
        r15: '#d97706',
        r18: '#e11d48',
        r18g: '#991b1b',
        few: '#555555',
        custom_x: '#e11d48',
        custom_y: '#7c3aed',
        custom_z: '#0d9488',
      },
      covers: {
        cover_hoge: { title: '架空ほげほげ本', sub: 'HOGEHOGE WORK SERIES', c1: '#e4007f', c2: '#ff8a00', tag: '架空ほげほげ' },
        cover_test: { title: '架空テスト技術書', sub: 'TEST RECORD & TECH LOG', c1: '#0068b7', c2: '#00b7ee', tag: '架空テスト' },
        cover_orig: { title: 'オリジナル作品集', sub: 'ORIGINAL ART & NOVELS', c1: '#059669', c2: '#34d399', tag: 'オリジナル' },
        cover_none: { title: '架空合同誌＆資料', sub: 'ANTHOLOGY & EXTRA NOTE', c1: '#7c3aed', c2: '#c084fc', tag: '合同・未分類' },
        cover_goods: { title: '記念公式グッズ', sub: 'OFFICIAL SPECIAL GOODS', c1: '#ca8a04', c2: '#fde047', tag: 'GOODS', isSquare: true },
      },
      pops: [
        { id: 'pop_sample1', title: '新刊セット！', sub: 'トートバック付き', style: 'burst', bgColor: '#e4007f', textColor: '#ffffff', titleFit: 'condense1' },
        { id: 'pop_sample2', title: '全巻持ち込み！', sub: 'バックナンバーあり', style: 'banner', bgColor: '#ff8a00', textColor: '#ffffff', titleFit: 'condense1' },
        { id: 'pop_sample3', title: '開幕直後はお釣りが出ないよう御協力をお願いします\nスケブは受け付けておりません', sub: 'ご注意', style: 'simple_white', bgColor: '#ffffff', textColor: '#111111', titleFit: 'condense2' },
      ],
    },
    cud: {
      name: 'カラーユニバーサルデザイン（CUD対応）',
      themes: {
        pop: { name: 'ポップ（CUD）', bg: { type: 'gradient', color1: '#ffcabf', color2: '#ffff80', angle: 135, pattern: 'dots', patternColor: '#ffffff', patternOpacity: 0.6 }, style: { accent: '#ff4b00', headerText: '#22181c', headerOutline: '#ffffff', cardBg: '#ffffff', cardText: '#1a1a1a', priceColor: '#d55e00', headerPanelColor: '#ffffff', headingFont: FONTS[1][0], bodyFont: FONTS[0][0], cardBorder: true } },
        cool: { name: 'クールブルー（CUD）', bg: { type: 'gradient', color1: '#0a1f44', color2: '#005aff', angle: 120, pattern: 'grid', patternColor: '#ffffff', patternOpacity: 0.08 }, style: { accent: '#4dc4ff', headerText: '#ffffff', headerOutline: '#0a1f44', cardBg: '#ffffff', cardText: '#0a1f44', priceColor: '#005aff', headerPanelColor: '#0a1f44', headingFont: FONTS[0][0], bodyFont: FONTS[0][0], cardBorder: true } },
        wa: { name: '和風レトロ（CUD）', bg: { type: 'solid', color1: '#ffca80', color2: '#ffff80', angle: 90, pattern: 'check', patternColor: '#ffffff', patternOpacity: 0.22 }, style: { accent: '#804000', headerText: '#2b1800', headerOutline: '#ffffff', cardBg: '#fffdf5', cardText: '#2b1800', priceColor: '#d55e00', headerPanelColor: '#fffdf5', headingFont: FONTS[5][0], bodyFont: FONTS[5][0], cardBorder: true } },
        flyer: { name: 'チラシ風（CUD）', bg: { type: 'radial', color1: '#fff100', color2: '#f6aa00', angle: 0, pattern: 'rays', patternColor: '#ffffff', patternOpacity: 0.35 }, style: { accent: '#ff4b00', headerText: '#000000', headerOutline: '#ffffff', cardBg: '#ffffff', cardText: '#000000', priceColor: '#ff4b00', headerPanelColor: '#ffffff', headingFont: FONTS[4][0], bodyFont: FONTS[0][0], cardBorder: true } },
        night: { name: 'ナイトゴールド（CUD）', bg: { type: 'gradient', color1: '#141128', color2: '#2d1f4e', angle: 160, pattern: 'dots', patternColor: '#f6aa00', patternOpacity: 0.14 }, style: { accent: '#f6aa00', headerText: '#ffffff', headerOutline: '#141128', cardBg: '#23193d', cardText: '#ffffff', priceColor: '#fff100', headerPanelColor: '#141128', headingFont: FONTS[5][0], bodyFont: FONTS[0][0], cardBorder: true } },
        simple: { name: 'シンプル（CUD）', bg: { type: 'solid', color1: '#ffffff', color2: '#c8c8cb', angle: 90, pattern: 'none', patternColor: '#000000', patternOpacity: 0.1 }, style: { accent: '#000000', headerText: '#000000', headerOutline: '#ffffff', cardBg: '#f4f4f6', cardText: '#000000', priceColor: '#ff4b00', headerPanelColor: '#ffffff', headingFont: FONTS[0][0], bodyFont: FONTS[0][0], cardBorder: true } },
      },
      genreColors: { '架空ほげほげ': '#ff4b00', '架空テスト': '#005aff', 'オリジナル': '#03af7a' },
      labelColors: {
        new: '#ff4b00',
        new_set: '#990099',
        new_work: '#ff4b00',
        new_music: '#ff4b00',
        new_en: '#ff4b00',
        semi_new: '#f6aa00',
        old: '#005aff',
        reprint: '#03af7a',
        goods: '#f6aa00',
        goods_std: '#03af7a',
        limited: '#804000',
        consign: '#990099',
        free: '#0072b2',
        few: '#4d5863',
        custom: '#ff4b00',
        custom_b: '#005aff',
        custom_c: '#03af7a',
      },
      subLabelColors: {
        r15: '#f6aa00',
        r18: '#ff4b00',
        r18g: '#990099',
        few: '#4d5863',
        custom_x: '#ff4b00',
        custom_y: '#990099',
        custom_z: '#03af7a',
      },
      covers: {
        cover_hoge: { title: '架空ほげほげ本', sub: 'HOGEHOGE WORK SERIES', c1: '#ff4b00', c2: '#f6aa00', tag: '架空ほげほげ' },
        cover_test: { title: '架空テスト技術書', sub: 'TEST RECORD & TECH LOG', c1: '#005aff', c2: '#4dc4ff', tag: '架空テスト' },
        cover_orig: { title: 'オリジナル作品集', sub: 'ORIGINAL ART & NOVELS', c1: '#03af7a', c2: '#77d9a8', tag: 'オリジナル' },
        cover_none: { title: '架空合同誌＆資料', sub: 'ANTHOLOGY & EXTRA NOTE', c1: '#990099', c2: '#c9ace6', tag: '合同・未分類' },
        cover_goods: { title: '記念公式グッズ', sub: 'OFFICIAL SPECIAL GOODS', c1: '#804000', c2: '#f6aa00', tag: 'GOODS', isSquare: true },
      },
      pops: [
        { id: 'pop_sample1', title: '新刊セット！', sub: 'トートバック付き', style: 'burst', bgColor: '#ff4b00', textColor: '#ffffff', titleFit: 'condense1' },
        { id: 'pop_sample2', title: '全巻持ち込み！', sub: 'バックナンバーあり', style: 'banner', bgColor: '#005aff', textColor: '#ffffff', titleFit: 'condense1' },
        { id: 'pop_sample3', title: '開幕直後はお釣りが出ないよう御協力をお願いします\nスケブは受け付けておりません', sub: 'ご注意', style: 'simple_white', bgColor: '#ffffff', textColor: '#111111', titleFit: 'condense2' },
      ],
    },
  };

  function getActiveColorMode(st = state) {
    const m = st?.style?.colorMode;
    return m === 'cud' ? 'cud' : 'classic';
  }

  function getActiveThemes(st = state) {
    return COLOR_MODES[getActiveColorMode(st)].themes;
  }

  const THEMES = COLOR_MODES.classic.themes;

  const DEFAULT = {
    version: 1,
    meta: { eventName: 'なんちゃらマーケットXXX', place: '帝都国際見本市会場', time: '10:30〜16:00', date: '202X年X月XX日(日)', space: '東A-99a', circle: 'サンプルサークル', twoDays: false, date2: '202X年X月XX日(日)', space2: '東C-99b' },
    canvas: { preset: 'x169', width: 1920, height: 1080 },
    layout: { headerMode: 'block', headerLayout: 'space_focus', headerSpaceWidth: 36, headerSpaceScale: 100, showHeaderSpaceBg: false, showHeaderSpaceBorder: false, showHeaderPlace: false, showHeaderTime: false, showHeaderEventBg: true, headerWidth: 40, headerScale: 100, headerEffect: 'shadow', headerPanel: true, headerRadius: 1.5, cardAspect: 1.75, gap: 1.8, padding: 5.5, textScale: 100, priceScale: 100, titleScale: 100, priceTextScale: 100, metaScale: 100, specScale: 100, groupMode: 'free', showTitle: true, titleFit: 'condense1', showGenre: false, showDate: true, showSpec: false, priceStyle: 'text', labelStyle: 'star', labelPosition: 'auto', labelScale: 100, labelTextScale: 100, labelAngle: 0, labelBorder: 'auto', labelBorderWidth: 100, labelShadow: true },
    bg: { type: 'gradient', color1: '#0f2742', color2: '#2c6a8f', angle: 120, imageId: '', imageFit: 'cover', imageOpacity: 1, imageBlur: 0, imageScale: 100, imageX: 0, imageY: 0, pattern: 'grid', patternColor: '#ffffff', patternOpacity: 0.08, patternSize: 3, overlayColor: '#ffffff', overlayOpacity: 0, border: 0, borderColor: '#00b7ee' },
    style: { colorMode: 'classic', theme: 'cool', headingFont: FONTS[0][0], bodyFont: FONTS[0][0], accent: '#00b7ee', headerText: '#ffffff', headerOutline: '#0f2742', headerPanelColor: '#0f2742', headerPanelOpacity: 0.88, cardBg: '#ffffff', cardOpacity: 0.95, cardText: '#14213d', priceColor: '#0068b7', radius: 1.5, shadow: true, cardBorder: true },
    output: { pngMode: 'sns', pngSize: '2048', pngPrintSize: 'A4_300dpi', miniSort: 'placed', miniSize: 'A6', miniOrient: 'portrait', miniPages: 'auto', miniUnit: 500, miniEmphasis: 'invert', miniShowName: true, miniShowLabel: true, miniShowSpec: false, sheetFitOnePage: true, sheetExtraRows: 2, sheetOrient: 'portrait', sheetShowSpec: false },
    genres: ['架空ほげほげ', '架空テスト', 'オリジナル'],
    genreColors: structuredClone(COLOR_MODES.classic.genreColors),
    items: [],
    placed: [],
    labelColors: structuredClone(COLOR_MODES.classic.labelColors),
    subLabelColors: structuredClone(COLOR_MODES.classic.subLabelColors),
    pops: structuredClone(COLOR_MODES.classic.pops),
    pickedPcFonts: [],
  };
  const SETTING_SECTIONS = ['meta', 'canvas', 'layout', 'bg', 'style', 'output'];

  function merge(d, s) {
    if (Array.isArray(d)) return Array.isArray(s) ? s : structuredClone(d);
    if (d && typeof d === 'object') {
      const out = {};
      const allKeys = new Set([...Object.keys(d), ...(s && typeof s === 'object' && !Array.isArray(s) ? Object.keys(s) : [])]);
      for (const k of allKeys) {
        if (k in d) {
          out[k] = s && k in s ? merge(d[k], s[k]) : structuredClone(d[k]);
        } else if (s && k in s) {
          out[k] = s[k] !== undefined ? structuredClone(s[k]) : undefined;
        }
      }
      return out;
    }
    return s !== undefined ? s : d;
  }

  let state = structuredClone(DEFAULT);
  if (typeof window !== 'undefined') window.state = state;
  let editingItemId = null;
  let pendingImageId = '';
  let selectedPlacedUid = null;
  let lastLayout = null;
  let dragPlacedUid = null;

  /* ---------- トースト通知＆カスタム確認モーダル（alert/confirm不使用） ---------- */
  function toast(msg, type = '') {
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.textContent = msg;
    $('#toastContainer').appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 250);
    }, 3200);
  }

  let activeModalResolve = null;

  function showModal({ title, buildBody, buildFoot, onClose }) {
    $('#modalTitle').textContent = title || 'プレビュー';
    const body = $('#modalBody');
    const foot = $('#modalFoot');
    body.innerHTML = '';
    foot.innerHTML = '';
    body.style.background = '';
    if (buildBody) buildBody(body);
    if (buildFoot) buildFoot(foot);
    $('#modalBackdrop').classList.add('open');
    activeModalResolve = onClose || null;
  }

  function closeModal(result = false) {
    $('#modalBackdrop').classList.remove('open');
    if (activeModalResolve) {
      const fn = activeModalResolve;
      activeModalResolve = null;
      fn(result);
    }
  }

  $('#btnModalClose').addEventListener('click', () => closeModal(false));
  $('#modalBackdrop').addEventListener('click', e => {
    if (e.target === $('#modalBackdrop')) closeModal(false);
  });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('#modalBackdrop')?.classList.contains('open')) {
      e.stopImmediatePropagation();
      closeModal(false);
    }
  }, { capture: true });

  /** Promiseベースのカスタム確認ダイアログ（「はい」「いいえ」ボタン付き） */
  /** Promiseベースのカスタム入力モーダル */
  function promptModal(title, message, defaultValue = '') {
    return new Promise(resolve => {
      let inputEl = null;
      showModal({
        title: title || '入力',
        onClose: () => resolve(null),
        buildBody(body) {
          body.innerHTML = `
            <div style="font-size:13px;line-height:1.5;margin:8px 4px 12px;color:var(--text);white-space:pre-line;">
              ${esc(message)}
            </div>
            <input type="text" id="modalPromptInput" style="width:100%;font-size:14px;padding:8px 10px;" value="${esc(defaultValue)}">
          `;
          inputEl = body.querySelector('#modalPromptInput');
          setTimeout(() => {
            inputEl?.focus();
            inputEl?.select();
          }, 60);
          inputEl?.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
              const val = inputEl.value;
              activeModalResolve = null;
              closeModal();
              resolve(val);
            }
          });
        },
        buildFoot(foot) {
          const btnCancel = document.createElement('button');
          btnCancel.textContent = 'キャンセル';
          btnCancel.onclick = () => {
            activeModalResolve = null;
            closeModal();
            resolve(null);
          };

          const btnOk = document.createElement('button');
          btnOk.className = 'primary';
          btnOk.textContent = '決定';
          btnOk.onclick = () => {
            const val = inputEl ? inputEl.value : '';
            activeModalResolve = null;
            closeModal();
            resolve(val);
          };

          foot.append(btnCancel, btnOk);
        }
      });
    });
  }

  function confirmModal(title, message) {
    return new Promise(resolve => {
      showModal({
        title: title || '確認',
        onClose: resolve,
        buildBody(body) {
          body.innerHTML = `
            <div style="font-size:14px;line-height:1.6;margin:14px 8px;text-align:center;word-break:break-word;color:var(--text);white-space:pre-line;">
              ${esc(message)}
            </div>`;
        },
        buildFoot(foot) {
          const btnNo = document.createElement('button');
          btnNo.textContent = 'いいえ';
          btnNo.onclick = () => closeModal(false);

          const btnYes = document.createElement('button');
          btnYes.className = 'primary';
          btnYes.textContent = 'はい';
          btnYes.onclick = () => closeModal(true);

          foot.append(btnNo, btnYes);
        }
      });
    });
  }

  /** コールバック形式の確認ダイアログ */
  function confirmDialog(message, onOk) {
    confirmModal('確認', message).then(ok => {
      if (ok && onOk) onOk();
    });
  }

  /* ---------- 5種の共通書影画像の生成・集約 (Ver.0.18 / Ver.0.61 CUD・クラシック連動) ---------- */
  async function generateCommonCovers(modeOverride = null) {
    const mode = modeOverride || getActiveColorMode();
    const coversConfig = COLOR_MODES[mode]?.covers || COLOR_MODES.classic.covers;
    const coverMap = {};
    for (const [key, conf] of Object.entries(coversConfig)) {
      const c = document.createElement('canvas');
      const w = conf.isSquare ? 480 : 420;
      const h = conf.isSquare ? 480 : 594;
      c.width = w;
      c.height = h;
      const x = c.getContext('2d');
      const g = x.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, conf.c1);
      g.addColorStop(1, conf.c2);
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);

      // 装飾パターン（幾何学サークル）
      x.fillStyle = 'rgba(255,255,255,0.15)';
      x.beginPath();
      x.arc(w * 0.8, h * 0.22, w * 0.38, 0, Math.PI * 2);
      x.arc(w * 0.2, h * 0.78, w * 0.42, 0, Math.PI * 2);
      x.fill();

      // 外周枠線
      x.strokeStyle = 'rgba(255,255,255,0.75)';
      x.lineWidth = 6;
      x.strokeRect(16, 16, w - 32, h - 32);

      // 上部タグ帯
      x.fillStyle = 'rgba(0,0,0,0.42)';
      x.fillRect(16, 16, w - 32, 48);
      x.fillStyle = '#ffffff';
      x.font = '700 18px "Noto Sans JP", sans-serif';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText(conf.tag, w / 2, 40);

      // タイトル枠
      const plateW = w - 60;
      const plateH = conf.isSquare ? 180 : 210;
      const plateY = conf.isSquare ? 150 : 170;
      x.fillStyle = 'rgba(255,255,255,0.94)';
      Render.rr(x, 30, plateY, plateW, plateH, 16);
      x.fill();

      // メインタイトル
      x.fillStyle = '#1a1a1a';
      x.font = '900 30px "M PLUS Rounded 1c", "Noto Sans JP", sans-serif';
      x.fillText(conf.title, w / 2, plateY + 68);

      // サブタイトル
      x.fillStyle = conf.c1;
      x.font = '700 15px "Noto Sans JP", sans-serif';
      x.fillText(conf.sub, w / 2, plateY + 128);

      // 下部サークルロゴ風
      x.fillStyle = '#ffffff';
      x.font = '700 16px "Noto Sans JP", sans-serif';
      x.fillText(`★ ${state.meta.circle || 'サンプルサークル'} ★`, w / 2, h - 40);

      const dUrl = c.toDataURL('image/jpeg', 0.88);
      const imgId = 'sample_' + key;
      await Images.put(dUrl, imgId);
      coverMap[key] = imgId;
    }
    return coverMap;
  }

  /* ---------- サンプルプリセット定義（4パターン Ver.0.65） ---------- */
  const SAMPLE_PRESETS = {
    // 0. 極小規模：新刊+既刊3種類（計3点 Ver.0.65）
    '3': [
      { name: '架空ほげほげ本 #01', pubdate: '2026年12月新作', spec: 'B5 / 52P / オフセット', price: 1000, size: 2, label: 'new', coverKey: 'cover_hoge', genre: '架空ほげほげ' },
      { name: '架空テスト技術書 #01', pubdate: '2026年8月', spec: 'B5 / 64P / 技術解説', price: 1200, size: 2, label: 'old', coverKey: 'cover_test', genre: '架空テスト' },
      { name: 'オリジナル作品集 #01', pubdate: '2025年12月', spec: 'A4 / 36P / フルカラー画集', price: 1500, size: 2, label: 'old', coverKey: 'cover_orig', genre: 'オリジナル' },
    ],

    // 1. 小規模：新刊+既刊6種類（計6点）
    '6': [
      { name: '架空ほげほげ本 #01', pubdate: '2026年12月新作', spec: 'B5 / 52P / オフセット', price: 1000, size: 4, label: 'new', coverKey: 'cover_hoge', genre: '架空ほげほげ' },
      { name: '架空テスト技術書 #01', pubdate: '2026年8月', spec: 'B5 / 64P / 技術解説', price: 1200, size: 2, label: 'old', coverKey: 'cover_test', genre: '架空テスト' },
      { name: 'オリジナル作品集 #01', pubdate: '2025年12月', spec: 'A4 / 36P / フルカラー画集', price: 1500, size: 2, label: 'old', coverKey: 'cover_orig', genre: 'オリジナル' },
      { name: '架空ほげほげ短編集 #02', pubdate: '2025年8月', spec: 'A5 / 48P / 短編小説集', price: 600, size: 1, label: 'old', coverKey: 'cover_hoge', genre: '架空ほげほげ' },
      { name: '架空テストアクスタ #01', pubdate: '2026年新作', spec: '高さ12cm / 台座付き', price: 800, size: 1, label: 'goods', coverKey: 'cover_goods', genre: '架空テスト' },
      { name: 'お試しフリーペーパー #01', pubdate: '無料配布', spec: 'B6 / 16P / 試し読み小冊子', price: 0, size: 1, label: 'free', coverKey: 'cover_none', genre: '' },
    ],

    // 2. 標準：新刊+新刊+準新刊+既刊20種類（計20点：起動時デフォルト）
    '20': [
      { name: '架空ほげほげ本 #01', pubdate: '2026年12月新作', spec: 'B5 / 60P / オフセット', price: 1000, size: 5, label: 'new', coverKey: 'cover_hoge', genre: '架空ほげほげ' },
      { name: '架空テスト技術書 #01', pubdate: '2026年12月新作', spec: 'B5 / 72P / 徹底解説', price: 1200, size: 4, label: 'new', coverKey: 'cover_test', genre: '架空テスト' },
      { name: 'オリジナル作品集 #01', pubdate: '2026年8月', spec: 'A4 / 40P / フルカラー', price: 1500, size: 3, label: 'semi_new', coverKey: 'cover_orig', genre: 'オリジナル' },
      { name: '架空ほげほげ短編集 #02', pubdate: '2026年8月', spec: 'A5 / 48P / 小説集', price: 700, size: 1, label: 'old', coverKey: 'cover_hoge', genre: '架空ほげほげ' },
      { name: '架空テスト設定集 #02', pubdate: '2026年5月', spec: 'B5 / 36P / 設定資料', price: 800, size: 1, label: 'old', coverKey: 'cover_test', genre: '架空テスト' },
      { name: 'オリジナル小説 #02', pubdate: '2025年12月', spec: '文庫 / 180P / 長編小説', price: 900, size: 1, label: 'old', coverKey: 'cover_orig', genre: 'オリジナル' },
      { name: '架空ほげほげイラスト集 #03', pubdate: '2025年12月', spec: 'B5 / 32P / イラスト集', price: 1000, size: 1, label: 'old', coverKey: 'cover_hoge', genre: '架空ほげほげ' },
      { name: '架空テスト合同誌 #03', pubdate: '2025年8月', spec: 'B5 / 80P / ゲスト多数', price: 1200, size: 1, label: 'reprint', coverKey: 'cover_test', genre: '架空テスト' },
      { name: 'オリジナルスケッチ集 #03', pubdate: '2025年5月', spec: 'A5 / 28P / モノクロスケッチ', price: 500, size: 1, label: 'old', coverKey: 'cover_orig', genre: 'オリジナル' },
      { name: '架空ほげほげ漫画 #04', pubdate: '2024年12月', spec: 'B5 / 44P / オフセット漫画', price: 800, size: 1, label: 'old', coverKey: 'cover_hoge', genre: '架空ほげほげ' },
      { name: '架空テスト備忘録 #04', pubdate: '2024年8月', spec: 'A5 / 32P / 開発ログ本', price: 600, size: 1, label: 'few', coverKey: 'cover_test', genre: '架空テスト' },
      { name: 'オリジナルミニ画集 #04', pubdate: '2024年5月', spec: 'B6 / 24P / ミニイラスト', price: 500, size: 1, label: 'old', coverKey: 'cover_orig', genre: 'オリジナル' },
      { name: '架空ほげほげ総集編 #05', pubdate: '2023年12月', spec: 'A5 / 160P / 再録集', price: 1800, size: 2, label: 'old', coverKey: 'cover_hoge', genre: '架空ほげほげ' },
      { name: '架空合同アンソロジー #01', pubdate: '2023年8月', spec: 'A5 / 100P / 記念合同誌', price: 1400, size: 1, label: 'consign', coverKey: 'cover_none', genre: '' },
      { name: '記念アクスタ #01', pubdate: '2026年新作', spec: '高さ12cm / 台座付き', price: 800, size: 1, label: 'goods', coverKey: 'cover_goods', genre: '架空ほげほげ' },
      { name: '記念アクキー #02', pubdate: '2026年新作', spec: '70mm / ナスカン付き', price: 600, size: 1, label: 'goods', coverKey: 'cover_goods', genre: '架空テスト' },
      { name: '特製トートバッグ #03', pubdate: '2026年限定', spec: 'A4対応 / キャンバス生地', price: 1200, size: 1, label: 'limited', coverKey: 'cover_goods', genre: 'オリジナル' },
      { name: 'クリアファイルセット #04', pubdate: '2026年新作', spec: 'A4対応 / 2枚組', price: 500, size: 1, label: 'goods', coverKey: 'cover_goods', genre: '架空ほげほげ' },
      { name: 'ペーパー＆しおり #01', pubdate: '2026年12月', spec: 'A5折本＋特製しおり', price: 200, size: 1, label: 'none', coverKey: 'cover_none', genre: '' },
      { name: 'お試しフリーペーパー #02', pubdate: '無料配布', spec: 'B6 / 16P / 試し読み小冊子', price: 0, size: 1, label: 'free', coverKey: 'cover_none', genre: '' },
    ],

    // 3. 大規模：新刊+既刊30種類（計30点）
    '30': [
      { name: '架空ほげほげ本 #01', pubdate: '2026年12月新作', spec: 'B5 / 60P / オフセット', price: 1000, size: 5, label: 'new', coverKey: 'cover_hoge', genre: '架空ほげほげ' },
      { name: '架空テスト技術書 #01', pubdate: '2026年12月新作', spec: 'B5 / 72P / 徹底解説', price: 1200, size: 4, label: 'new', coverKey: 'cover_test', genre: '架空テスト' },
      { name: 'オリジナル作品集 #01', pubdate: '2026年12月新作', spec: 'A4 / 48P / フルカラー', price: 1600, size: 3, label: 'new', coverKey: 'cover_orig', genre: 'オリジナル' },
      { name: '架空ほげほげ短編集 #02', pubdate: '2026年8月', spec: 'A5 / 48P / 小説集', price: 700, size: 1, label: 'semi_new', coverKey: 'cover_hoge', genre: '架空ほげほげ' },
      { name: '架空テスト設定集 #02', pubdate: '2026年8月', spec: 'B5 / 36P / 設定資料', price: 800, size: 1, label: 'semi_new', coverKey: 'cover_test', genre: '架空テスト' },
      { name: 'オリジナル小説 #02', pubdate: '2026年5月', spec: '文庫 / 180P / 長編小説', price: 900, size: 1, label: 'old', coverKey: 'cover_orig', genre: 'オリジナル' },
      { name: '架空ほげほげイラスト集 #03', pubdate: '2025年12月', spec: 'B5 / 32P / イラスト集', price: 1000, size: 1, label: 'old', coverKey: 'cover_hoge', genre: '架空ほげほげ' },
      { name: '架空テスト合同誌 #03', pubdate: '2025年12月', spec: 'B5 / 80P / ゲスト多数', price: 1200, size: 1, label: 'reprint', coverKey: 'cover_test', genre: '架空テスト' },
      { name: 'オリジナルスケッチ集 #03', pubdate: '2025年8月', spec: 'A5 / 28P / モノクロスケッチ', price: 500, size: 1, label: 'old', coverKey: 'cover_orig', genre: 'オリジナル' },
      { name: '架空ほげほげ漫画 #04', pubdate: '2025年5月', spec: 'B5 / 44P / オフセット漫画', price: 800, size: 1, label: 'old', coverKey: 'cover_hoge', genre: '架空ほげほげ' },
      { name: '架空テスト備忘録 #04', pubdate: '2024年12月', spec: 'A5 / 32P / 開発ログ本', price: 600, size: 1, label: 'few', coverKey: 'cover_test', genre: '架空テスト' },
      { name: 'オリジナルミニ画集 #04', pubdate: '2024年12月', spec: 'B6 / 24P / ミニイラスト', price: 500, size: 1, label: 'old', coverKey: 'cover_orig', genre: 'オリジナル' },
      { name: '架空ほげほげ総集編 #05', pubdate: '2024年8月', spec: 'A5 / 160P / 再録集', price: 1800, size: 2, label: 'old', coverKey: 'cover_hoge', genre: '架空ほげほげ' },
      { name: '架空テスト研究読本 #05', pubdate: '2024年5月', spec: 'B5 / 50P / 詳細研究', price: 900, size: 1, label: 'old', coverKey: 'cover_test', genre: '架空テスト' },
      { name: 'オリジナルキャラクター図鑑 #05', pubdate: '2024年5月', spec: 'A5 / 60P / フルカラー', price: 1100, size: 1, label: 'old', coverKey: 'cover_orig', genre: 'オリジナル' },
      { name: '架空ほげほげ読切集 #06', pubdate: '2023年12月', spec: 'B5 / 36P / コピー本', price: 500, size: 1, label: 'old', coverKey: 'cover_hoge', genre: '架空ほげほげ' },
      { name: '架空テスト特別編 #06', pubdate: '2023年8月', spec: 'A5 / 40P / 特別寄稿', price: 700, size: 1, label: 'old', coverKey: 'cover_test', genre: '架空テスト' },
      { name: 'オリジナル掌編集 #06', pubdate: '2023年5月', spec: '文庫 / 120P / ショート', price: 600, size: 1, label: 'old', coverKey: 'cover_orig', genre: 'オリジナル' },
      { name: '架空ほげほげ初期短編集 #07', pubdate: '2022年12月', spec: 'A5 / 32P / 初小説', price: 400, size: 1, label: 'old', coverKey: 'cover_hoge', genre: '架空ほげほげ' },
      { name: '架空合同アンソロジー #01', pubdate: '2022年8月', spec: 'A5 / 100P / 記念合同誌', price: 1400, size: 1, label: 'consign', coverKey: 'cover_none', genre: '' },
      { name: '記念アクスタ #01', pubdate: '2026年新作', spec: '高さ12cm / 台座付き', price: 800, size: 1, label: 'goods', coverKey: 'cover_goods', genre: '架空ほげほげ' },
      { name: '記念アクキー #02', pubdate: '2026年新作', spec: '70mm / ナスカン付き', price: 600, size: 1, label: 'goods', coverKey: 'cover_goods', genre: '架空テスト' },
      { name: '特製トートバッグ #03', pubdate: '2026年限定', spec: 'A4対応 / キャンバス生地', price: 1200, size: 1, label: 'limited', coverKey: 'cover_goods', genre: 'オリジナル' },
      { name: 'クリアファイルセット #04', pubdate: '2026年新作', spec: 'A4対応 / 2枚組', price: 500, size: 1, label: 'goods', coverKey: 'cover_goods', genre: '架空ほげほげ' },
      { name: '記念ピンバッジ #05', pubdate: '2025年新作', spec: '金属製 / 30mm', price: 500, size: 1, label: 'goods', coverKey: 'cover_goods', genre: '架空テスト' },
      { name: 'オリジナル特製しおり #05', pubdate: '2025年新作', spec: '金属透かし彫り仕様', price: 400, size: 1, label: 'goods', coverKey: 'cover_goods', genre: 'オリジナル' },
      { name: '記念ミニタペストリー #06', pubdate: '2025年新作', spec: 'B3変形 / Wスエード', price: 2000, size: 1, label: 'goods', coverKey: 'cover_goods', genre: '架空ほげほげ' },
      { name: 'なんちゃらステッカー #07', pubdate: '2024年新作', spec: '耐水仕様 / 3枚組', price: 300, size: 1, label: 'goods', coverKey: 'cover_goods', genre: '架空テスト' },
      { name: 'ペーパー＆しおり #01', pubdate: '2026年12月', spec: 'A5折本＋特製しおり', price: 200, size: 1, label: 'none', coverKey: 'cover_none', genre: '' },
      { name: 'お試しフリーペーパー #02', pubdate: '無料配布', spec: 'B6 / 16P / 試し読み小冊子', price: 0, size: 1, label: 'free', coverKey: 'cover_none', genre: '' },
    ],
  };

  async function loadSamplePreset(presetType = '20') {
    const mode = getActiveColorMode();
    const modeCfg = COLOR_MODES[mode] || COLOR_MODES.classic;
    const list = SAMPLE_PRESETS[presetType] || SAMPLE_PRESETS['20'];
    const covers = await generateCommonCovers(mode);

    state.items = [];
    state.placed = [];
    state.genres = structuredClone(DEFAULT.genres);
    state.genreColors = structuredClone(modeCfg.genreColors);
    state.pops = structuredClone(modeCfg.pops);
    state.layout.headerLayout = DEFAULT.layout.headerLayout;
    state.layout.headerEffect = DEFAULT.layout.headerEffect;
    state.layout.showHeaderSpaceBg = DEFAULT.layout.showHeaderSpaceBg;
    state.layout.showHeaderSpaceBorder = DEFAULT.layout.showHeaderSpaceBorder;
    state.layout.showHeaderPlace = DEFAULT.layout.showHeaderPlace;
    state.layout.showHeaderTime = DEFAULT.layout.showHeaderTime;

    if (presetType === '3') {
      // 3種類サンプルの配置構成 (Ver.0.65)
      // 1. 3つのアイテムを順にすべて size: 2（中2枠）で配置
      for (let i = 0; i < list.length; i++) {
        const s = list[i];
        const imgId = covers[s.coverKey] || covers['cover_hoge'];
        const id = 'item_' + uid();
        state.items.push({
          id,
          name: s.name,
          pubdate: s.pubdate,
          spec: s.spec,
          price: s.price,
          imageId: imgId,
          genre: s.genre || '',
        });
        state.placed.push({
          uid: 'p_' + uid(),
          itemId: id,
          size: s.size || 2,
          label: s.label || 'none',
          labelText: '',
          labelColor: '',
        });
      }
      // 2. 直後に「空白枠（itemId: 'spacer', size: 1）」を1枠配置
      state.placed.push({
        uid: 'p_' + uid(),
        itemId: 'spacer',
        size: 1,
        label: 'none',
        labelText: '',
        labelColor: '',
      });
      // 3. 直後に POP「ご注意 開幕直後はお釣りが出ないよう〜（pop_sample3）」を配置
      const pop3 = (state.pops || []).find(p => p.id === 'pop_sample3') || state.pops[2] || state.pops[0];
      if (pop3) {
        state.placed.push({
          uid: 'p_' + uid(),
          itemId: pop3.id,
          size: 2,
          label: 'none',
          labelText: '',
          labelColor: '',
        });
      }
    } else {
      for (let i = 0; i < list.length; i++) {
        const s = list[i];
        const imgId = covers[s.coverKey] || covers['cover_hoge'];
        const id = 'item_' + uid();
        state.items.push({
          id,
          name: s.name,
          pubdate: s.pubdate,
          spec: s.spec,
          price: s.price,
          imageId: imgId,
          genre: s.genre || '',
        });
        state.placed.push({
          uid: 'p_' + uid(),
          itemId: id,
          size: s.size,
          label: s.label || 'none',
          labelText: '',
          labelColor: '',
        });

        // 1点目の直後にPOP1を配置
        if (i === 0 && state.pops[0]) {
          state.placed.push({
            uid: 'p_' + uid(),
            itemId: state.pops[0].id,
            size: 2,
            label: 'none',
            labelText: '',
            labelColor: '',
          });
        }
        // 20点・30点の場合は中盤にPOP2も配置
        if ((presetType === '20' && i === 2) || (presetType === '30' && i === 4)) {
          if (state.pops[1]) {
            state.placed.push({
              uid: 'p_' + uid(),
              itemId: state.pops[1].id,
              size: 2,
              label: 'none',
              labelText: '',
              labelColor: '',
            });
          }
        }
      }
    }

    selectedPlacedUid = state.placed[0]?.uid || null;

    await saveState();
    syncFormFromState();
    renderGenreOptions();
    renderLibrary();
    renderPopLibrary();
    renderPlacedBar();
    updateImageCacheSummary();
    redraw();
  }

  /* ---------- 状態永続化（IndexedDB）＆ Undo / Redo 履歴管理 (Ver.0.55) ---------- */
  const undoStack = [];
  const redoStack = [];
  const undoFontStack = [];
  const redoFontStack = [];
  const fontArchive = new Map();
  const MAX_HISTORY = 50;
  let lastSavedStateJson = null;
  let lastSavedFontIds = null;
  let debounceTimer = null;
  let debounceBaseJson = null;
  let debounceBaseFontIds = null;

  function getCurrentCustomFontIds() {
    if (!window.CustomFonts || !CustomFonts.data) return [];
    return [...CustomFonts.data.keys()];
  }

  function archiveCustomFonts() {
    if (!window.CustomFonts || !CustomFonts.data) return;
    for (const [id, meta] of CustomFonts.data.entries()) {
      if (meta && !fontArchive.has(id)) {
        fontArchive.set(id, structuredClone(meta));
      }
    }
  }

  async function syncCustomFontsToIds(targetIds) {
    if (!window.CustomFonts || !Array.isArray(targetIds)) return;
    archiveCustomFonts();
    const targetSet = new Set(targetIds);
    for (const id of [...CustomFonts.data.keys()]) {
      if (!targetSet.has(id)) {
        await CustomFonts.del(id);
      }
    }
    for (const id of targetIds) {
      if (!CustomFonts.data.has(id) && fontArchive.has(id)) {
        await CustomFonts.putMeta(structuredClone(fontArchive.get(id)));
      }
    }
  }

  function updateUndoRedoButtons() {
    const btnUndo = $('#btnUndo');
    const btnRedo = $('#btnRedo');
    if (btnUndo) btnUndo.disabled = undoStack.length === 0;
    if (btnRedo) btnRedo.disabled = redoStack.length === 0;
  }

  function flushDebounceHistory() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    if (debounceBaseJson !== null) {
      undoStack.push(debounceBaseJson);
      undoFontStack.push(debounceBaseFontIds || []);
      if (undoStack.length > MAX_HISTORY) {
        undoStack.shift();
        undoFontStack.shift();
      }
      redoStack.length = 0;
      redoFontStack.length = 0;
      debounceBaseJson = null;
      debounceBaseFontIds = null;
      lastSavedStateJson = JSON.stringify(state);
      lastSavedFontIds = getCurrentCustomFontIds();
      updateUndoRedoButtons();
    }
  }

  function pushStateHistory(immediate = false) {
    archiveCustomFonts();
    const currentJson = JSON.stringify(state);
    const currentFontIds = getCurrentCustomFontIds();
    const currentFontKey = JSON.stringify(currentFontIds);
    if (lastSavedStateJson === null) {
      lastSavedStateJson = currentJson;
      lastSavedFontIds = currentFontIds;
      return;
    }
    if (currentJson === lastSavedStateJson && currentFontKey === JSON.stringify(lastSavedFontIds || [])) return;

    if (immediate) {
      flushDebounceHistory();
      undoStack.push(lastSavedStateJson);
      undoFontStack.push(lastSavedFontIds || []);
      if (undoStack.length > MAX_HISTORY) {
        undoStack.shift();
        undoFontStack.shift();
      }
      redoStack.length = 0;
      redoFontStack.length = 0;
      lastSavedStateJson = currentJson;
      lastSavedFontIds = currentFontIds;
      updateUndoRedoButtons();
    } else {
      if (debounceBaseJson === null) {
        debounceBaseJson = lastSavedStateJson;
        debounceBaseFontIds = lastSavedFontIds || [];
      }
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        if (debounceBaseJson !== null) {
          undoStack.push(debounceBaseJson);
          undoFontStack.push(debounceBaseFontIds || []);
          if (undoStack.length > MAX_HISTORY) {
            undoStack.shift();
            undoFontStack.shift();
          }
          redoStack.length = 0;
          redoFontStack.length = 0;
          debounceBaseJson = null;
          debounceBaseFontIds = null;
          lastSavedStateJson = JSON.stringify(state);
          lastSavedFontIds = getCurrentCustomFontIds();
          updateUndoRedoButtons();
        }
      }, 250);
    }
  }

  async function saveState(skipHistory = false, immediate = false) {
    if (!skipHistory) {
      pushStateHistory(immediate);
    }
    await DB.set('state', state);
  }

  async function handleUndo() {
    flushDebounceHistory();
    if (undoStack.length === 0) return;
    const currentJson = JSON.stringify(state);
    const currentFontIds = getCurrentCustomFontIds();
    const prevJson = undoStack.pop();
    const prevFontIds = undoFontStack.pop() || [];
    redoStack.push(currentJson);
    redoFontStack.push(currentFontIds);
    if (redoStack.length > MAX_HISTORY) {
      redoStack.shift();
      redoFontStack.shift();
    }

    try {
      await syncCustomFontsToIds(prevFontIds);
      const restored = JSON.parse(prevJson);
      Object.keys(state).forEach(k => delete state[k]);
      Object.assign(state, restored);
      if (typeof window !== 'undefined') window.state = state;
      lastSavedStateJson = JSON.stringify(state);
      lastSavedFontIds = getCurrentCustomFontIds();

      if (selectedPlacedUid && !state.placed.some(p => p.uid === selectedPlacedUid)) {
        selectedPlacedUid = state.placed[0]?.uid || null;
      }

      savePickedPcFonts(state.pickedPcFonts);
      syncFormFromState();
      renderGenreOptions();
      renderLabelColorSettings();
      renderCustomFontList();
      renderLibrary();
      renderPopLibrary();
      renderPlacedBar();
      updateImageCacheSummary();
      redraw();
      await saveState(true);
      updateUndoRedoButtons();
      toast('操作を元に戻しました');
    } catch (err) {
      console.error('Undo failed:', err);
    }
  }

  async function handleRedo() {
    flushDebounceHistory();
    if (redoStack.length === 0) return;
    const currentJson = JSON.stringify(state);
    const currentFontIds = getCurrentCustomFontIds();
    const nextJson = redoStack.pop();
    const nextFontIds = redoFontStack.pop() || [];
    undoStack.push(currentJson);
    undoFontStack.push(currentFontIds);
    if (undoStack.length > MAX_HISTORY) {
      undoStack.shift();
      undoFontStack.shift();
    }

    try {
      await syncCustomFontsToIds(nextFontIds);
      const restored = JSON.parse(nextJson);
      Object.keys(state).forEach(k => delete state[k]);
      Object.assign(state, restored);
      if (typeof window !== 'undefined') window.state = state;
      lastSavedStateJson = JSON.stringify(state);
      lastSavedFontIds = getCurrentCustomFontIds();

      if (selectedPlacedUid && !state.placed.some(p => p.uid === selectedPlacedUid)) {
        selectedPlacedUid = state.placed[0]?.uid || null;
      }

      savePickedPcFonts(state.pickedPcFonts);
      syncFormFromState();
      renderGenreOptions();
      renderLabelColorSettings();
      renderCustomFontList();
      renderLibrary();
      renderPopLibrary();
      renderPlacedBar();
      updateImageCacheSummary();
      redraw();
      await saveState(true);
      updateUndoRedoButtons();
      toast('操作をやり直しました');
    } catch (err) {
      console.error('Redo failed:', err);
    }
  }

  /* ---------- 定番フォント存在判定 (Canvas描画幅比較方式 Ver.0.39) ---------- */
  function isLocalFontAvailable(fontName) {
    if (!fontName) return false;
    const names = fontName.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    if (names.length === 0) return false;

    const testStr = 'あいうえおアイウエオ漢字ABC0123WwMm';
    const testSize = '72px';
    const baseFonts = ['monospace', 'sans-serif', 'serif'];

    if (!window._fontCheckCanvas) {
      window._fontCheckCanvas = document.createElement('canvas');
      window._fontCheckCanvas.width = 300;
      window._fontCheckCanvas.height = 100;
    }
    const ctx = window._fontCheckCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;

    for (const name of names) {
      for (const base of baseFonts) {
        ctx.font = `${testSize} ${base}`;
        const baseWidth = ctx.measureText(testStr).width;
        ctx.font = `${testSize} "${name}", ${base}`;
        const testWidth = ctx.measureText(testStr).width;
        if (Math.abs(baseWidth - testWidth) > 0.5) {
          return true;
        }
      }
    }
    return false;
  }

  /* ---------- ピックアップ済みPCフォントの管理・永続化 (Ver.0.39) ---------- */
  function readPickedPcFontsFromStorage() {
    try {
      const raw = localStorage.getItem('oshina_picked_pc_fonts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  }

  function getPickedPcFonts() {
    return (state && Array.isArray(state.pickedPcFonts)) ? state.pickedPcFonts : [];
  }

  function savePickedPcFonts(list) {
    const safeList = Array.isArray(list) ? list : [];
    if (state) state.pickedPcFonts = safeList;
    try {
      localStorage.setItem('oshina_picked_pc_fonts', JSON.stringify(safeList));
    } catch {}
  }

  /* ---------- フォント選択肢＆カスタムフォント管理 (3階層化 Ver.0.39) ---------- */
  function renderFontSelectOptions() {
    const sHeading = $('#sHeadingFont');
    const sBody = $('#sBodyFont');
    if (!sHeading || !sBody) return;

    const curHeading = (state && state.style && state.style.headingFont) ? state.style.headingFont : sHeading.value;
    const curBody = (state && state.style && state.style.bodyFont) ? state.style.bodyFont : sBody.value;

    // 1. 標準フォント
    const defaultGroup = `<optgroup label="── 標準フォント ──">` +
      FONTS.map(([val, name]) => `<option value='${esc(val)}'>${esc(name)}</option>`).join('') +
      `</optgroup>`;

    // 2. 登録したカスタムフォントファイル（0件なら非表示）
    let customGroup = '';
    const customList = window.CustomFonts ? CustomFonts.list() : [];
    if (customList.length > 0) {
      customGroup = `<optgroup label="── 登録したカスタムフォントファイル ──">` +
        customList.map(f => `<option value='${esc(f.family)}'>${esc(f.name)}</option>`).join('') +
        `</optgroup>`;
    }

    // 3. ピックアップ済みPCフォント（0件なら非表示）
    let pickedGroup = '';
    const pickedList = getPickedPcFonts();
    if (pickedList.length > 0) {
      pickedGroup = `<optgroup label="── ピックアップ済みPCフォント ──">` +
        pickedList.map(pf => `<option value='${esc(pf.family)}'>${esc(pf.name || pf.family)}</option>`).join('') +
        `</optgroup>`;
    }

    // 既知のフォント値一覧
    const allKnownValues = new Set([
      ...FONTS.map(([v]) => v),
      ...customList.map(f => f.family),
      ...pickedList.map(pf => pf.family)
    ]);

    // 見出しフォント用（未登録フォント保持対応）
    let headingExtra = '';
    if (curHeading && !allKnownValues.has(curHeading)) {
      headingExtra = `<optgroup label="── 現在設定中のフォント ──"><option value='${esc(curHeading)}'>${esc(curHeading)} (保持中)</option></optgroup>`;
    }
    sHeading.innerHTML = defaultGroup + customGroup + pickedGroup + headingExtra;
    sHeading.value = curHeading || FONTS[0][0];
    if (!sHeading.value) {
      sHeading.value = FONTS[0][0];
      if (state && state.style) state.style.headingFont = FONTS[0][0];
    }

    // 本文フォント用（未登録フォント保持対応）
    let bodyExtra = '';
    if (curBody && !allKnownValues.has(curBody)) {
      bodyExtra = `<optgroup label="── 現在設定中のフォント ──"><option value='${esc(curBody)}'>${esc(curBody)} (保持中)</option></optgroup>`;
    }
    sBody.innerHTML = defaultGroup + customGroup + pickedGroup + bodyExtra;
    sBody.value = curBody || FONTS[0][0];
    if (!sBody.value) {
      sBody.value = FONTS[0][0];
      if (state && state.style) state.style.bodyFont = FONTS[0][0];
    }
  }

  function renderCustomFontList() {
    const listEl = $('#customFontList');
    if (!listEl) return;
    const fonts = window.CustomFonts ? CustomFonts.list() : [];
    if (fonts.length === 0) {
      listEl.innerHTML = '<div style="font-size:11px;color:var(--text-muted);text-align:center;padding:6px 0;">登録された追加フォントはありません</div>';
      return;
    }
    listEl.innerHTML = fonts.map(f => {
      const sizeKb = f.byteSize ? Math.round(f.byteSize / 1024) : 0;
      const sizeText = sizeKb > 1024 ? (sizeKb / 1024).toFixed(1) + ' MB' : (sizeKb > 0 ? sizeKb + ' KB' : 'システム');
      return `
        <div class="custom-font-item" data-id="${esc(f.id)}" style="display:flex;align-items:center;justify-content:space-between;background:var(--panel-2, rgba(0,0,0,0.2));border:1px solid var(--border, var(--line));border-radius:4px;padding:4px 8px;gap:6px;">
          <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;">
            <div style="font-size:11px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${esc(f.name)}">${esc(f.name)} <span style="font-size:10px;font-weight:400;color:var(--text-muted);">${sizeText}</span></div>
            <div style="font-family:'${esc(f.family)}', sans-serif;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text);">新刊あります！ サンプル 1234</div>
          </div>
          <button type="button" class="btn-del-cfont sm" data-id="${esc(f.id)}" title="このフォントを削除" style="padding:2px 6px;font-size:11px;background:rgba(230,0,51,0.15);border:1px solid #e60033;color:#e60033;border-radius:3px;cursor:pointer;">🗑️</button>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.btn-del-cfont').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const font = CustomFonts.get(id);
        const name = font ? font.name : 'このフォント';
        const ok = await confirmModal('フォント削除の確認', `フォント「${name}」を削除してもよろしいですか？\n（見出しや本文で選択中の場合はデフォルトフォントに戻ります）`);
        if (!ok) return;

        if (state && state.style) {
          if (font && state.style.headingFont === font.family) {
            state.style.headingFont = FONTS[0][0];
          }
          if (font && state.style.bodyFont === font.family) {
            state.style.bodyFont = FONTS[0][0];
          }
        }

        archiveCustomFonts();
        await CustomFonts.del(id);
        renderFontSelectOptions();
        renderCustomFontList();
        await saveState(false, true);
        redraw();
        toast(`フォント「${name}」を削除しました`, 'success');
      });
    });
  }

  async function handleFontFiles(fileList) {
    const validExts = ['.ttf', '.otf', '.woff', '.woff2'];
    let addedCount = 0;
    for (const file of Array.from(fileList)) {
      const lower = file.name.toLowerCase();
      const isValid = validExts.some(ext => lower.endsWith(ext));
      if (!isValid) {
        toast(`「${file.name}」は対応形式（.ttf / .otf / .woff / .woff2）ではありません`, 'warn');
        continue;
      }
      try {
        await CustomFonts.putFile(file);
        addedCount++;
      } catch (err) {
        console.error('フォント読込エラー:', file.name, err);
        toast(`フォント「${file.name}」の追加に失敗しました: ${err.message || err}`, 'error');
      }
    }
    if (addedCount > 0) {
      renderFontSelectOptions();
      renderCustomFontList();
      archiveCustomFonts();
      await saveState(false, true);
      redraw();
      toast(`${addedCount} 件のフォントを追加しました！`, 'success');
    }
  }

  function initFontDropZone() {
    const dropZone = $('#fontFileDropZone');
    const fileInput = $('#fontFileInput');
    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', async () => {
      if (fileInput.files && fileInput.files.length > 0) {
        await handleFontFiles(fileInput.files);
        fileInput.value = '';
      }
    });

    dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--pink, #e4007f)';
      dropZone.style.background = 'rgba(228, 0, 127, 0.08)';
    });

    ['dragleave', 'dragend'].forEach(type => {
      dropZone.addEventListener(type, () => {
        dropZone.style.borderColor = '';
        dropZone.style.background = '';
      });
    });

    dropZone.addEventListener('drop', async e => {
      e.preventDefault();
      dropZone.style.borderColor = '';
      dropZone.style.background = '';
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await handleFontFiles(e.dataTransfer.files);
      }
    });
  }

  function initPcFontModal() {
    const backdrop = $('#pcFontModalBackdrop');
    const btnOpen = $('#btnOpenPcFontModal');
    const btnClose = $('#btnPcFontClose');
    const btnFootClose = $('#btnPcFontFootClose');
    const btnScanCommon = $('#btnScanCommonFonts');
    const btnQueryAll = $('#btnQueryAllLocalFonts');
    const searchInput = $('#pcFontSearchInput');
    const filterPickedCheckbox = $('#pcFontFilterPicked');
    const manualInput = $('#pcFontManualInput');
    const btnAddManual = $('#btnAddManualFont');
    const statusEl = $('#pcFontStatus');
    const pickedCountEl = $('#pcFontPickedCount');
    const listEl = $('#pcFontModalList');

    if (!backdrop || !btnOpen) return;

    // フォント候補マップ: key (小文字化family) -> { name, family, isPicked, source }
    const fontCandidateMap = new Map();
    let hasAutoScanned = false;
    const GENERIC_FONT_TOKENS = new Set(['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-sans-serif', 'ui-serif', 'ui-monospace', 'ui-rounded']);
    const normalizeFontKey = str => String(str || '').toLowerCase().replace(/['"]/g, '').trim();
    const extractFontTokens = famStr => String(famStr || '').split(',').map(normalizeFontKey).filter(t => t && !GENERIC_FONT_TOKENS.has(t));
    const hasFontCandidate = famStr => {
      const key = normalizeFontKey(famStr);
      if (fontCandidateMap.has(key)) return true;
      const tokens = extractFontTokens(famStr);
      if (!tokens.length) return false;
      for (const candidate of fontCandidateMap.values()) {
        const candTokens = extractFontTokens(candidate.family);
        if (tokens.some(t => candTokens.includes(t))) return true;
      }
      return false;
    };

    // ピックアップ状態を同期
    function syncPickedState() {
      const pickedList = getPickedPcFonts();
      const pickedFamilySet = new Set(pickedList.map(p => normalizeFontKey(p.family)));

      for (const item of fontCandidateMap.values()) {
        const itemFam = normalizeFontKey(item.family);
        item.isPicked = pickedFamilySet.has(itemFam);
      }

      // ピックアップ済みだがまだ候補にないものを候補に追加
      for (const pf of pickedList) {
        const pfFam = pf.family.toLowerCase().replace(/['"]/g, '').trim();
        if (!fontCandidateMap.has(pfFam)) {
          fontCandidateMap.set(pfFam, {
            name: pf.name || pf.family,
            family: pf.family,
            isPicked: true,
            source: 'picked'
          });
        }
      }
    }

    const openModal = () => {
      backdrop.classList.add('open');
      syncPickedState();
      if (!hasAutoScanned) {
        hasAutoScanned = true;
        scanCommonFonts();
      } else {
        renderList();
      }
    };

    const closeModal = () => {
      backdrop.classList.remove('open');
    };

    btnOpen.addEventListener('click', openModal);
    btnClose?.addEventListener('click', closeModal);
    btnFootClose?.addEventListener('click', closeModal);
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) closeModal();
    });

    // 定番日本語フォント自動検出
    function scanCommonFonts() {
      if (listEl) {
        listEl.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:24px 0;font-size:12px;">定番日本語フォントを検出中...</div>';
      }
      setTimeout(() => {
        let foundCount = 0;
        for (const item of COMMON_JP_FONTS) {
          const isAvail = isLocalFontAvailable(item.family);
          if (isAvail) {
            foundCount++;
            const key = normalizeFontKey(item.family);
            if (!fontCandidateMap.has(key)) {
              fontCandidateMap.set(key, {
                name: item.name,
                family: item.family,
                isPicked: false,
                source: 'common'
              });
            }
          }
        }
        syncPickedState();
        renderList();
        toast(`定番日本語フォントから ${foundCount} 件を検出しました`, 'success');
      }, 30);
    }

    btnScanCommon?.addEventListener('click', () => {
      scanCommonFonts();
    });

    // PC内の全フォント取得 (queryLocalFonts)
    btnQueryAll?.addEventListener('click', async () => {
      if (!('queryLocalFonts' in window)) {
        toast('お使いの環境（file:// または未対応ブラウザ）では全フォント取得APIが利用できません。下のフォント名手入力欄、または「定番日本語フォントを自動検出」をご利用ください', 'warn');
        manualInput?.focus();
        return;
      }
      btnQueryAll.disabled = true;
      btnQueryAll.textContent = 'スキャン中...';
      try {
        const localFonts = await window.queryLocalFonts();
        let added = 0;
        for (const f of localFonts) {
          const family = f.family || f.fullName;
          const name = f.fullName || f.family;
          const key = normalizeFontKey(family);
          if (!hasFontCandidate(family)) {
            fontCandidateMap.set(key, {
              name,
              family,
              isPicked: false,
              source: 'local'
            });
            added++;
          }
        }
        syncPickedState();
        renderList();
        toast(`PC内フォントを取得しました（新たに ${added} 件を追加）`, 'success');
      } catch (err) {
        console.warn('queryLocalFonts エラー:', err);
        toast(`フォントアクセスが制限されているか拒否されました (${err.message || err})。手入力欄をご利用ください`, 'warn');
        manualInput?.focus();
      } finally {
        btnQueryAll.disabled = false;
        btnQueryAll.textContent = '💻 PC内の全フォントを取得';
      }
    });

    // 検索・フィルタリングによるリスト描画
    function renderList() {
      if (!listEl) return;
      syncPickedState();

      const query = (searchInput?.value || '').trim().toLowerCase();
      const onlyPicked = !!filterPickedCheckbox?.checked;

      let items = [...fontCandidateMap.values()];

      if (onlyPicked) {
        items = items.filter(it => it.isPicked);
      }
      if (query) {
        items = items.filter(it =>
          (it.name && it.name.toLowerCase().includes(query)) ||
          (it.family && it.family.toLowerCase().includes(query))
        );
      }

      // ピックアップ中件数の更新
      const totalPicked = [...fontCandidateMap.values()].filter(it => it.isPicked).length;
      if (pickedCountEl) pickedCountEl.textContent = `ピックアップ中: ${totalPicked}件`;
      if (statusEl) {
        const firstSpan = statusEl.querySelector('span:first-child');
        if (firstSpan) firstSpan.textContent = `表示中: ${items.length}件 / 総候補: ${fontCandidateMap.size}件`;
      }

      if (items.length === 0) {
        listEl.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:24px 0;font-size:12px;">一致するフォントがありません</div>';
        return;
      }

      listEl.innerHTML = items.slice(0, 150).map(it => {
        const isChecked = it.isPicked ? 'checked' : '';
        const sourceBadge = it.source === 'common' ? '<span style="font-size:9.5px;padding:1px 4px;border-radius:3px;background:rgba(0,183,238,0.2);color:#00b7ee;">定番</span>'
          : (it.source === 'local' ? '<span style="font-size:9.5px;padding:1px 4px;border-radius:3px;background:rgba(16,185,129,0.2);color:#10b981;">PC検出</span>'
          : '<span style="font-size:9.5px;padding:1px 4px;border-radius:3px;background:rgba(255,255,255,0.1);color:var(--text-muted);">手動</span>');

        return `
          <div class="row pc-font-item-row" data-key="${esc(it.family)}" style="justify-content:space-between;align-items:center;padding:7px 10px;background:var(--panel);border-radius:5px;border:1px solid ${it.isPicked ? 'var(--pink)' : 'var(--border)'};gap:10px;">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;flex:1;min-width:0;margin:0;">
              <input type="checkbox" class="chk-pick-font" data-family="${esc(it.family)}" data-name="${esc(it.name)}" ${isChecked} style="width:16px;height:16px;cursor:pointer;">
              <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="font-size:12px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(it.name)}</span>
                  ${sourceBadge}
                </div>
                <div style="font-size:10.5px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(it.family)}</div>
              </div>
            </label>
            <div style="font-family:${esc(Render.formatFontFamily(it.family))}, sans-serif;font-size:13.5px;color:var(--text);white-space:nowrap;background:rgba(0,0,0,0.15);padding:4px 10px;border-radius:4px;border:1px solid var(--border);min-width:140px;text-align:center;">
              お品書き 新刊 1,000円
            </div>
          </div>
        `;
      }).join('') + (items.length > 150 ? `<div style="text-align:center;font-size:11px;color:var(--text-muted);padding:4px 0;">他 ${items.length - 150} 件...（検索で絞り込めます）</div>` : '');

      // チェックボックスイベント
      listEl.querySelectorAll('.chk-pick-font').forEach(chk => {
        chk.addEventListener('change', async () => {
          const fam = chk.getAttribute('data-family');
          const name = chk.getAttribute('data-name');
          const isCheck = chk.checked;

          let pickedList = [...getPickedPcFonts()];
          if (isCheck) {
            if (!pickedList.some(p => p.family === fam)) {
              pickedList.push({ family: fam, name: name || fam });
            }
          } else {
            pickedList = pickedList.filter(p => p.family !== fam);
          }
          savePickedPcFonts(pickedList);
          syncPickedState();

          // 行の枠線スタイル更新
          const row = chk.closest('.pc-font-item-row');
          if (row) row.style.borderColor = isCheck ? 'var(--pink)' : 'var(--border)';

          // ピックアップ件数表示更新
          const curTotalPicked = [...fontCandidateMap.values()].filter(it => it.isPicked).length;
          if (pickedCountEl) pickedCountEl.textContent = `ピックアップ中: ${curTotalPicked}件`;

          renderFontSelectOptions();
          await saveState();
          redraw();
        });
      });
    }

    searchInput?.addEventListener('input', () => {
      renderList();
    });

    filterPickedCheckbox?.addEventListener('change', () => {
      renderList();
    });

    // 手入力フォント追加
    btnAddManual?.addEventListener('click', async () => {
      const inputVal = (manualInput?.value || '').trim();
      if (!inputVal) return;

      const isAvail = isLocalFontAvailable(inputVal);
      if (!isAvail) {
        const ok = await confirmModal(
          'フォント確認',
          `フォント「${inputVal}」はお使いのPCで検出されませんでした。\n（フォント名が正確であれば表示される場合があります）\n\nこのままピックアップ登録しますか？`
        );
        if (!ok) return;
      }

      const key = inputVal.toLowerCase().replace(/['"]/g, '').trim();
      fontCandidateMap.set(key, {
        name: inputVal,
        family: inputVal,
        isPicked: true,
        source: 'manual'
      });

      let pickedList = [...getPickedPcFonts()];
      if (!pickedList.some(p => p.family === inputVal)) {
        pickedList.push({ family: inputVal, name: inputVal });
        savePickedPcFonts(pickedList);
      }

      manualInput.value = '';
      renderList();
      renderFontSelectOptions();
      await saveState();
      redraw();
      toast(`フォント「${inputVal}」をピックアップ登録しました`, 'success');
    });

    manualInput?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnAddManual?.click();
      }
    });
  }

  /* ---------- UI 初期化 ---------- */
  function renderThemeSelectOptions() {
    const selTheme = $('#selThemeQuick');
    if (!selTheme) return;
    const themes = getActiveThemes();
    const cur = state?.style?.theme || 'cool';
    selTheme.innerHTML = Object.entries(themes).map(([k, v]) => `<option value="${k}">${esc(v.name)}</option>`).join('');
    if (themes[cur]) selTheme.value = cur;
  }

  function initSelectOptions() {
    // プリセットサイズ
    const selPreset = $('#selPreset');
    selPreset.innerHTML = PRESETS.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('');

    // テーマ
    renderThemeSelectOptions();

    // フォント (標準 + ユーザー追加フォント Ver.0.38)
    renderFontSelectOptions();

    // ラベル
    const lblOpts = Object.entries(LABELS).map(([k, v]) => `<option value="${k}">${esc(v.name)}</option>`).join('');
    $('#inspLabel').innerHTML = lblOpts;

    // ラベル補 (Ver.0.36)
    if ($('#inspSubLabel') && window.SUB_LABELS) {
      const subLblOpts = Object.entries(SUB_LABELS).map(([k, v]) => `<option value="${k}">${esc(v.name)}</option>`).join('');
      $('#inspSubLabel').innerHTML = subLblOpts;
    }
  }

  /* ---------- フォルダ（開閉アコーディオン） (Ver.0.25b) ---------- */
  function initFolders() {
    $$('.ui-folder-head').forEach(head => {
      head.addEventListener('click', e => {
        if (e.target.closest('button, input, select, a, textarea')) return;
        const folder = head.closest('.ui-folder');
        if (folder) folder.classList.toggle('open');
      });
    });
  }

  function syncFormFromState() {
    const M = state.meta, C = state.canvas, L = state.layout, B = state.bg, S = state.style, O = state.output;
    const mode = getActiveColorMode();
    if ($('#selColorMode')) $('#selColorMode').value = mode;
    renderThemeSelectOptions();
    $('#selPreset').value = C.preset || 'x169';
    $('#customSize').style.display = C.preset === 'custom' ? 'inline-flex' : 'none';
    $('#inpCanvasW').value = C.width;
    $('#inpCanvasH').value = C.height;
    $('#selThemeQuick').value = S.theme || 'cool';

    // Meta
    if ($('#mCircle').value !== (M.circle || '')) $('#mCircle').value = M.circle || '';
    if ($('#mEventName').value !== (M.eventName || '')) $('#mEventName').value = M.eventName || '';
    if ($('#mPlace').value !== (M.place || '')) $('#mPlace').value = M.place || '';
    if ($('#mTime').value !== (M.time || '')) $('#mTime').value = M.time || '';
    if ($('#mDate').value !== (M.date || '')) $('#mDate').value = M.date || '';
    if ($('#mDatePick')) $('#mDatePick').value = parseJaDateToIso(M.date);
    if ($('#mSpace').value !== (M.space || '')) $('#mSpace').value = M.space || '';
    $('#mTwoDays').checked = !!M.twoDays;
    $('#twoDaysBox').style.display = M.twoDays ? 'flex' : 'none';
    if ($('#mDate2').value !== (M.date2 || '')) $('#mDate2').value = M.date2 || '';
    if ($('#mDate2Pick')) $('#mDate2Pick').value = parseJaDateToIso(M.date2);
    if ($('#mSpace2').value !== (M.space2 || '')) $('#mSpace2').value = M.space2 || '';

    // Layout & Header
    $('#lHeaderMode').value = L.headerMode || 'block';
    if ($('#lHeaderLayout')) $('#lHeaderLayout').value = L.headerLayout || 'space_focus';
    if ($('#lHeaderSpaceWidth')) {
      const spW = L.headerSpaceWidth ?? 36;
      $('#lHeaderSpaceWidth').value = spW;
      if ($('#valHeaderSpaceWidth')) $('#valHeaderSpaceWidth').textContent = spW + '%';
    }
    if ($('#lHeaderSpaceScale')) {
      const spScale = L.headerSpaceScale ?? 100;
      $('#lHeaderSpaceScale').value = spScale;
      if ($('#valHeaderSpaceScale')) $('#valHeaderSpaceScale').textContent = spScale + '%';
    }
    if ($('#lShowHeaderSpaceBg')) $('#lShowHeaderSpaceBg').checked = L.showHeaderSpaceBg === true;
    if ($('#lShowHeaderSpaceBorder')) $('#lShowHeaderSpaceBorder').checked = L.showHeaderSpaceBorder === true;
    const isSpaceFocus = (L.headerLayout || 'space_focus') === 'space_focus';
    if ($('#rowHeaderSpaceWidth')) $('#rowHeaderSpaceWidth').style.display = isSpaceFocus ? 'flex' : 'none';
    if ($('#containerSpaceFocusOptions')) $('#containerSpaceFocusOptions').style.display = isSpaceFocus ? 'flex' : 'none';
    if ($('#lShowHeaderPlace')) $('#lShowHeaderPlace').checked = L.showHeaderPlace === true;
    if ($('#lShowHeaderTime')) $('#lShowHeaderTime').checked = L.showHeaderTime === true;
    if ($('#lShowHeaderEventBg')) $('#lShowHeaderEventBg').checked = L.showHeaderEventBg !== false;
    $('#rowHeaderWidth').style.display = L.headerMode === 'band' ? 'none' : 'flex';
    $('#lHeaderWidth').value = L.headerWidth ?? 40;
    $('#valHeaderWidth').textContent = (L.headerWidth ?? 40) + '%';
    $('#lHeaderScale').value = L.headerScale ?? 100;
    $('#valHeaderScale').textContent = (L.headerScale ?? 100) + '%';
    $('#lHeaderRadius').value = L.headerRadius ?? 1.5;
    $('#valHeaderRadius').textContent = String(L.headerRadius ?? 1.5);
    $('#lHeaderEffect').value = L.headerEffect || 'shadow';
    $('#lHeaderPanel').checked = L.headerPanel !== false;
    $('#sHeaderText').value = S.headerText || (mode === 'classic' ? '#13284c' : '#002b5c');
    $('#sHeaderOutline').value = S.headerOutline || '#ffffff';
    $('#sHeaderPanelColor').value = S.headerPanelColor || '#ffffff';

    $('#lCardAspect').value = String(L.cardAspect || 1.75);
    $('#lGroupMode').value = L.groupMode || 'free';
    $('#lGap').value = L.gap ?? 1.8;
    $('#valGap').textContent = Number(L.gap ?? 1.8).toFixed(1);
    $('#lPadding').value = L.padding ?? 5.5;
    $('#valPadding').textContent = Number(L.padding ?? 5.5).toFixed(1);
    $('#lTextScale').value = L.textScale ?? 100;
    $('#valTextScale').textContent = (L.textScale ?? 100) + '%';
    if ($('#lPriceScale')) {
      $('#lPriceScale').value = L.priceScale ?? 100;
      $('#valPriceScale').textContent = (L.priceScale ?? 100) + '%';
    }
    if ($('#lTitleScale')) {
      $('#lTitleScale').value = L.titleScale ?? 100;
      $('#valTitleScale').textContent = (L.titleScale ?? 100) + '%';
    }
    if ($('#lPriceTextScale')) {
      $('#lPriceTextScale').value = L.priceTextScale ?? 100;
      $('#valPriceTextScale').textContent = (L.priceTextScale ?? 100) + '%';
    }
    if ($('#lMetaScale')) {
      $('#lMetaScale').value = L.metaScale ?? 100;
      $('#valMetaScale').textContent = (L.metaScale ?? 100) + '%';
    }
    if ($('#lSpecScale')) {
      $('#lSpecScale').value = L.specScale ?? 100;
      $('#valSpecScale').textContent = (L.specScale ?? 100) + '%';
    }
    $('#lTitleFit').value = L.titleFit || 'condense1';
    $('#lPriceStyle').value = L.priceStyle || 'text';
    $('#lLabelStyle').value = L.labelStyle || 'star';
    if ($('#lLabelPosition')) $('#lLabelPosition').value = L.labelPosition || 'auto';
    if ($('#lLabelScale')) {
      const lsc = L.labelScale ?? 100;
      $('#lLabelScale').value = lsc;
      if ($('#valLabelScale')) $('#valLabelScale').textContent = lsc + '%';
    }
    if ($('#lLabelTextScale')) {
      const ltsc = L.labelTextScale ?? 100;
      $('#lLabelTextScale').value = ltsc;
      if ($('#valLabelTextScale')) $('#valLabelTextScale').textContent = ltsc + '%';
    }
    if ($('#lLabelAngle')) {
      const lang = L.labelAngle ?? 0;
      $('#lLabelAngle').value = lang;
      if ($('#valLabelAngle')) $('#valLabelAngle').textContent = (lang > 0 ? '+' : '') + lang + '°';
    }
    if ($('#lLabelBorder')) $('#lLabelBorder').value = L.labelBorder || 'auto';
    if ($('#lLabelBorderWidth')) {
      const lbw = L.labelBorderWidth ?? 100;
      $('#lLabelBorderWidth').value = lbw;
      if ($('#valLabelBorderWidth')) $('#valLabelBorderWidth').textContent = lbw + '%';
    }
    if ($('#lLabelShadow')) $('#lLabelShadow').checked = L.labelShadow !== false;
    $('#lShowTitle').checked = L.showTitle !== false;
    $('#lShowGenre').checked = !!L.showGenre;
    $('#lShowDate').checked = L.showDate !== false;
    $('#lShowSpec').checked = !!L.showSpec;

    // Style
    renderFontSelectOptions();
    if (S.headingFont) $('#sHeadingFont').value = S.headingFont;
    if (!$('#sHeadingFont').value) {
      $('#sHeadingFont').value = FONTS[0][0];
      S.headingFont = FONTS[0][0];
    }
    if (S.bodyFont) $('#sBodyFont').value = S.bodyFont;
    if (!$('#sBodyFont').value) {
      $('#sBodyFont').value = FONTS[0][0];
      S.bodyFont = FONTS[0][0];
    }
    $('#sAccent').value = S.accent || (mode === 'classic' ? '#e4007f' : '#ff4b00');
    $('#sPriceColor').value = S.priceColor || (mode === 'classic' ? '#e60033' : '#ff4b00');
    $('#sCardBg').value = S.cardBg || '#ffffff';
    $('#sCardText').value = S.cardText || (mode === 'classic' ? '#2b2330' : '#111827');
    $('#sCardOpacity').value = S.cardOpacity ?? 0.95;
    $('#valCardOpacity').textContent = Math.round((S.cardOpacity ?? 0.95) * 100) + '%';
    $('#sRadius').value = S.radius ?? 1.5;
    $('#valRadius').textContent = Number(S.radius ?? 1.5).toFixed(1);
    if ($('#sCardBorder')) $('#sCardBorder').checked = S.cardBorder !== false;
    $('#sShadow').checked = S.shadow !== false;
    if ($('#sHeaderPanelOpacity')) {
      const hpo = S.headerPanelOpacity ?? 0.88;
      $('#sHeaderPanelOpacity').value = hpo;
      if ($('#valHeaderPanelOpacity')) $('#valHeaderPanelOpacity').textContent = Math.round(hpo * 100) + '%';
    }

    // Background
    $('#bType').value = B.type || 'gradient';
    const hasBgImg = B.type === 'image' && !!B.imageId;
    if ($('#bgImageControls')) $('#bgImageControls').style.display = (B.type === 'image') ? 'flex' : 'none';
    if ($('#bgImgEmptyState') && $('#bgImgActiveState')) {
      if (hasBgImg) {
        $('#bgImgEmptyState').style.display = 'none';
        $('#bgImgActiveState').style.display = 'flex';
        const dUrl = (window.Images && Images.data ? Images.data.get(B.imageId) : '') || '';
        if ($('#bgImgThumb')) $('#bgImgThumb').src = dUrl;
      } else {
        $('#bgImgEmptyState').style.display = 'block';
        $('#bgImgActiveState').style.display = 'none';
        if ($('#bgImgThumb')) $('#bgImgThumb').src = '';
      }
    }
    $('#bColor1').value = B.color1 || (mode === 'classic' ? '#ffe3ef' : '#bfe4ff');
    $('#bColor2').value = B.color2 || (mode === 'classic' ? '#fff6cf' : '#f0f8ff');
    const ang = B.angle ?? 135;
    $('#bAngle').value = ang;
    if ($('#valBgAngle')) $('#valBgAngle').textContent = ang + '°';
    $('#bImageFit').value = B.imageFit || 'cover';
    if ($('#bImageScale')) {
      const sc = B.imageScale ?? 100;
      $('#bImageScale').value = sc;
      if ($('#valImageScale')) $('#valImageScale').textContent = sc + '%';
    }
    if ($('#bImageX')) {
      const ix = B.imageX ?? 0;
      $('#bImageX').value = ix;
      if ($('#valImageX')) $('#valImageX').textContent = ix + '%';
    }
    if ($('#bImageY')) {
      const iy = B.imageY ?? 0;
      $('#bImageY').value = iy;
      if ($('#valImageY')) $('#valImageY').textContent = iy + '%';
    }
    $('#bImageBlur').value = B.imageBlur ?? 0;
    if ($('#valImageBlur')) $('#valImageBlur').textContent = (B.imageBlur ?? 0) + 'px';
    $('#bImageOpacity').value = B.imageOpacity ?? 1;
    if ($('#valImageOpacity')) $('#valImageOpacity').textContent = Math.round((B.imageOpacity ?? 1) * 100) + '%';
    $('#bPattern').value = B.pattern || 'dots';
    if ($('#bPatternSize')) {
      const ps = B.patternSize ?? 3;
      $('#bPatternSize').value = ps;
      if ($('#valPatternSize')) $('#valPatternSize').textContent = ps;
    }
    $('#bPatternColor').value = B.patternColor || '#ffffff';
    const pop = B.patternOpacity ?? 0.6;
    $('#bPatternOpacity').value = pop;
    if ($('#valBgPatternOpacity')) $('#valBgPatternOpacity').textContent = Math.round(pop * 100) + '%';
    if ($('#bOverlayColor')) $('#bOverlayColor').value = B.overlayColor || '#ffffff';
    if ($('#bOverlayOpacity')) {
      const oop = B.overlayOpacity ?? 0;
      $('#bOverlayOpacity').value = oop;
      if ($('#valOverlayOpacity')) $('#valOverlayOpacity').textContent = Math.round(oop * 100) + '%';
    }
    $('#bBorderColor').value = B.borderColor || (mode === 'classic' ? '#e4007f' : '#005aff');
    const bdr = B.border ?? 0;
    $('#bBorder').value = bdr;
    if ($('#valBgBorder')) $('#valBgBorder').textContent = bdr;

    // Output
    if ($('#oPngMode')) $('#oPngMode').value = O.pngMode || 'sns';
    if ($('#oPngPrintSize')) $('#oPngPrintSize').value = O.pngPrintSize || 'A4_300dpi';
    const isPrintMode = (O.pngMode || 'sns') === 'print';
    if ($('#rowPngSizeSns')) $('#rowPngSizeSns').style.display = isPrintMode ? 'none' : 'flex';
    if ($('#rowPngSizePrint')) $('#rowPngSizePrint').style.display = isPrintMode ? 'flex' : 'none';
    $('#oPngSize').value = O.pngSize || '2048';
    if ($('#oMiniSort')) $('#oMiniSort').value = O.miniSort || 'placed';
    $('#oMiniSize').value = O.miniSize || 'A6';
    $('#oMiniOrient').value = O.miniOrient || 'portrait';
    $('#oMiniPages').value = String(O.miniPages || 'auto');
    $('#oMiniUnit').value = String(O.miniUnit ?? 500);
    $('#oMiniEmphasis').value = O.miniEmphasis || 'invert';
    $('#oMiniShowName').checked = O.miniShowName !== false;
    $('#oMiniShowLabel').checked = O.miniShowLabel !== false;
    if ($('#oMiniShowSpec')) $('#oMiniShowSpec').checked = O.miniShowSpec === true;
    $('#oSheetOrient').value = O.sheetOrient || 'portrait';
    $('#oSheetExtraRows').value = String(O.sheetExtraRows ?? 2);
    if ($('#oSheetFitOnePage')) $('#oSheetFitOnePage').checked = O.sheetFitOnePage !== false;
    if ($('#oSheetShowSpec')) $('#oSheetShowSpec').checked = O.sheetShowSpec === true;
    renderLabelColorSettings();
  }

  /* ---------- ラベル・ラベル補カラー設定 (Ver.0.28, Ver.0.36) ---------- */
  function renderLabelColorSettings() {
    const mode = getActiveColorMode();
    const modeDef = COLOR_MODES[mode] || COLOR_MODES.classic;
    const box = $('#labelColorList');
    if (box) {
      box.innerHTML = '';
      if (!state.labelColors) state.labelColors = structuredClone(modeDef.labelColors || {});

      const targetKeys = ['new', 'new_set', 'new_work', 'new_music', 'new_en', 'semi_new', 'old', 'reprint', 'goods', 'goods_std', 'limited', 'consign', 'free', 'few', 'custom', 'custom_b', 'custom_c'];
      for (const k of targetKeys) {
        const def = LABELS[k];
        if (!def) continue;
        const curColor = state.labelColors[k] || modeDef.labelColors[k] || def.color || '#ff4b00';
        const row = document.createElement('div');
        row.className = 'row';
        row.style.cssText = 'align-items:center;justify-content:space-between;gap:6px;background:rgba(255,255,255,0.04);padding:3px 6px;border-radius:4px;';
        row.innerHTML = `
          <span style="font-size:11px;font-weight:600;">${esc(def.name)}</span>
          <input type="color" data-label-key="${k}" value="${curColor}" style="width:34px;height:22px;padding:0;cursor:pointer;border:none;border-radius:3px;">
        `;
        const inp = row.querySelector('input[type="color"]');
        inp.addEventListener('input', async e => {
          state.labelColors[k] = e.target.value;
          await saveState();
          renderPlacedBar();
          redraw();
        });
        box.appendChild(row);
      }
    }

    const subBox = $('#subLabelColorList');
    if (subBox) {
      subBox.innerHTML = '';
      if (!state.subLabelColors) state.subLabelColors = structuredClone(modeDef.subLabelColors || {});

      const subKeys = ['r15', 'r18', 'r18g', 'few', 'custom_x', 'custom_y', 'custom_z'];
      for (const k of subKeys) {
        const def = (window.SUB_LABELS || {})[k];
        if (!def) continue;
        const curColor = state.subLabelColors[k] || modeDef.subLabelColors[k] || def.color || '#ff4b00';
        const row = document.createElement('div');
        row.className = 'row';
        row.style.cssText = 'align-items:center;justify-content:space-between;gap:6px;background:rgba(255,255,255,0.04);padding:3px 6px;border-radius:4px;';
        row.innerHTML = `
          <span style="font-size:11px;font-weight:600;">${esc(def.name)}</span>
          <input type="color" data-sub-label-key="${k}" value="${curColor}" style="width:34px;height:22px;padding:0;cursor:pointer;border:none;border-radius:3px;">
        `;
        const inp = row.querySelector('input[type="color"]');
        inp.addEventListener('input', async e => {
          state.subLabelColors[k] = e.target.value;
          await saveState();
          renderPlacedBar();
          redraw();
        });
        subBox.appendChild(row);
      }
    }
    updateToolbarCanvasSizeInfo();
  }

  /* ---------- ツールバー画像サイズ常時表示 (Ver.0.66) ---------- */
  function updateToolbarCanvasSizeInfo() {
    const el = $('#toolbarCanvasSizeInfo');
    if (!el) return;
    const w = Math.max(400, Math.min(4096, Number(state.canvas?.width) || 1920));
    const h = Math.max(400, Math.min(4096, Number(state.canvas?.height) || 1080));
    const presetId = state.canvas?.preset;
    const p = (window.PRESETS || []).find(x => x.id === presetId);
    let label = '任意サイズ';
    if (p && p.id !== 'custom') {
      label = p.name.replace(/（[^）]+）$/, '').trim();
    }
    el.textContent = `${label} (${w}×${h}px)`;
  }

  /* ---------- プレビュー再描画＆ステージフィット ---------- */
  function redraw() {
    const c = $('#preview');
    const W = Math.max(400, Math.min(4096, Number(state.canvas.width) || 1920));
    const H = Math.max(400, Math.min(4096, Number(state.canvas.height) || 1080));
    if (c.width !== W) c.width = W;
    if (c.height !== H) c.height = H;

    // ステージ内に収まるようCSSサイズを自動計算
    const stage = $('#canvasStage');
    const availW = Math.max(240, stage.clientWidth - 36);
    const availH = Math.max(220, stage.clientHeight - 36);
    const scale = Math.min(availW / W, availH / H, 1);
    c.style.width = Math.round(W * scale) + 'px';
    c.style.height = Math.round(H * scale) + 'px';

    const ctx = c.getContext('2d');
    lastLayout = Render.draw(ctx, state, {
      preview: true,
      selectedUid: selectedPlacedUid,
    });
    updateToolbarCanvasSizeInfo();
  }
  window.addEventListener('resize', redraw);

  /* ---------- 左カラム：アイテム登録・編集・ジャンル管理・一覧 ---------- */
  function syncGenreColorInput() {
    const fGenre = $('#fGenre');
    const fGenreColor = $('#fGenreColor');
    if (!fGenre || !fGenreColor) return;
    const defAccent = state.style?.accent || (getActiveColorMode() === 'classic' ? '#e4007f' : '#ff4b00');
    const cur = fGenre.value;
    if (cur) {
      const col = (state.genreColors && state.genreColors[cur]) || Render.getGenreColor(cur, defAccent, state);
      fGenreColor.value = col;
      fGenreColor.disabled = false;
      fGenreColor.style.opacity = '1';
      fGenreColor.title = `「${cur}」のジャンル色を変更`;
    } else {
      fGenreColor.value = defAccent;
      fGenreColor.disabled = true;
      fGenreColor.style.opacity = '0.35';
      fGenreColor.title = 'ジャンル未設定（色設定不可）';
    }
  }

  function renderGenreOptions() {
    const mode = getActiveColorMode();
    const modeDef = COLOR_MODES[mode] || COLOR_MODES.classic;
    const defAccent = state.style?.accent || (mode === 'classic' ? '#e4007f' : '#ff4b00');
    if (!state.genres || !Array.isArray(state.genres)) {
      state.genres = structuredClone(DEFAULT.genres);
    }
    if (!state.genreColors || typeof state.genreColors !== 'object') {
      state.genreColors = structuredClone(modeDef.genreColors);
    }
    // 登録フォームセレクト
    const fGenre = $('#fGenre');
    if (fGenre) {
      const cur = fGenre.value;
      fGenre.innerHTML = '<option value="">ジャンル未設定</option>' +
        state.genres.map(g => `<option value="${esc(g)}">${esc(g)}</option>`).join('');
      fGenre.value = cur;
      syncGenreColorInput();
    }
    // フィルタセレクト
    const filterGenre = $('#filterGenre');
    if (filterGenre) {
      const curF = filterGenre.value || 'all';
      filterGenre.innerHTML = '<option value="all">すべてのジャンル</option><option value="none">未分類のみ</option>' +
        state.genres.map(g => `<option value="${esc(g)}">${esc(g)}</option>`).join('');
      filterGenre.value = curF;
    }
    // 「🎨 デザイン」タブ内のジャンル別カラー設定リスト (Ver.0.23)
    const gcList = $('#genreColorList');
    if (gcList) {
      gcList.innerHTML = '';
      if (!state.genres.length) {
        gcList.innerHTML = '<span class="hint" style="font-size:11px;">登録されているジャンルがありません</span>';
      } else {
        for (const g of state.genres) {
          const curCol = (state.genreColors && state.genreColors[g]) || Render.getGenreColor(g, defAccent, state);
          const itemRow = document.createElement('div');
          itemRow.className = 'genre-color-item';
          itemRow.innerHTML = `
            <span title="${esc(g)}">${esc(g)}</span>
            <input type="color" data-genre="${esc(g)}" value="${curCol}" title="「${esc(g)}」のカラーを変更">
          `;
          const colPicker = itemRow.querySelector('input[type="color"]');
          colPicker.addEventListener('input', e => {
            if (!state.genreColors) state.genreColors = {};
            state.genreColors[g] = e.target.value;
            if ($('#fGenre')?.value === g) {
              syncGenreColorInput();
            }
            saveState();
            redraw();
            renderLibrary();
          });
          gcList.appendChild(itemRow);
        }
      }
    }
  }

  function updateSaveButtonText() {
    const btn = $('#btnItemSave');
    if (!btn) return;
    if (editingItemId) {
      btn.textContent = '✓ 更新を保存';
    } else {
      const autoPlace = $('#fAutoPlace')?.checked !== false;
      btn.textContent = autoPlace ? '＋ 登録して配置' : '＋ 登録のみ（未配置）';
    }
  }

  function openItemModal(item = null) {
    if (item) {
      loadItemToForm(item);
    } else {
      clearItemForm();
    }
    $('#itemModalBackdrop')?.classList.add('open');
    setTimeout(() => $('#fName')?.focus(), 80);
  }

  function closeItemModal() {
    $('#itemModalBackdrop')?.classList.remove('open');
    clearItemForm();
  }

  function clearItemForm() {
    editingItemId = null;
    pendingImageId = '';
    const titleEl = $('#formTitle');
    if (titleEl) titleEl.textContent = '新規アイテム登録';
    const badgeEl = $('#editModeBadge');
    if (badgeEl) badgeEl.style.display = 'none';
    if ($('#fName')) $('#fName').value = '';
    if ($('#fGenre')) $('#fGenre').value = '';
    syncGenreColorInput();
    if ($('#fDate')) $('#fDate').value = '';
    if ($('#fSpec')) $('#fSpec').value = '';
    if ($('#fPrice')) $('#fPrice').value = '';
    if ($('#fAutoPlace')) $('#fAutoPlace').checked = true;
    if ($('#formPreview')) $('#formPreview').src = '';
    $('#dropzone')?.classList.remove('has-img');
    const dt = $('#dropText');
    if (dt) dt.innerHTML = '書影画像を選択<br><small>クリックまたはドラッグ＆ドロップ</small>';
    updateSaveButtonText();
    $$('.lib-item').forEach(el => el.classList.remove('editing'));
  }

  function loadItemToForm(item) {
    editingItemId = item.id;
    pendingImageId = item.imageId || '';
    const titleEl = $('#formTitle');
    if (titleEl) titleEl.textContent = 'アイテム編集';
    const badgeEl = $('#editModeBadge');
    if (badgeEl) badgeEl.style.display = 'inline';
    updateSaveButtonText();
    if ($('#fName')) $('#fName').value = item.name || '';
    if ($('#fGenre')) $('#fGenre').value = item.genre || '';
    syncGenreColorInput();
    if ($('#fDate')) $('#fDate').value = item.pubdate || '';
    if ($('#fSpec')) $('#fSpec').value = item.spec || '';
    if ($('#fPrice')) $('#fPrice').value = item.price !== '' && item.price != null ? item.price : '';
    const dUrl = Images.data.get(item.imageId);
    if (dUrl) {
      if ($('#formPreview')) $('#formPreview').src = dUrl;
      $('#dropzone')?.classList.add('has-img');
      const dt = $('#dropText');
      if (dt) dt.innerHTML = '';
    } else {
      if ($('#formPreview')) $('#formPreview').src = '';
      $('#dropzone')?.classList.remove('has-img');
      const dt = $('#dropText');
      if (dt) dt.innerHTML = '書影画像を選択<br><small>クリックまたはドラッグ＆ドロップ</small>';
    }
    renderLibrary();
  }

  async function handleImageFiles(files) {
    const imgFiles = [...files].filter(f => f.type.startsWith('image/'));
    if (!imgFiles.length) return;

    const isModalOpen = Boolean($('#itemModalBackdrop')?.classList.contains('open'));
    if (isModalOpen && editingItemId && imgFiles.length > 1) {
      toast('編集モードでは1枚ずつ書影を選択してください', 'warn');
      return;
    }
    if (isModalOpen && imgFiles.length === 1) {
      const f = imgFiles[0];
      const dataUrl = await Images.resizeFile(f, 900);
      pendingImageId = await Images.put(dataUrl);
      $('#formPreview').src = dataUrl;
      $('#dropzone').classList.add('has-img');
      $('#dropText').innerHTML = '';
      if (!$('#fName').value.trim()) {
        $('#fName').value = f.name.replace(/\.[^.]+$/, '');
      }
      updateImageCacheSummary();
      toast('書影画像をリサイズして取り込みました');
    } else {
      // 複数ファイル一括登録（モーダル外へのD&D時は即座にお品書きへ配置）
      const selectedGenre = isModalOpen ? ($('#fGenre')?.value || '') : '';
      const autoPlace = isModalOpen ? ($('#fAutoPlace')?.checked !== false) : true;
      const bulkDate = isModalOpen ? ($('#fDate')?.value.trim() || '') : '';
      const bulkSpec = isModalOpen ? ($('#fSpec')?.value.trim() || '') : '';
      const bulkPrice = (isModalOpen && $('#fPrice')?.value !== '') ? Number($('#fPrice').value) : '';
      for (const f of imgFiles) {
        const dataUrl = await Images.resizeFile(f, 900);
        const imgId = await Images.put(dataUrl);
        const id = 'item_' + uid();
        const name = f.name.replace(/\.[^.]+$/, '');
        state.items.push({
          id,
          name,
          pubdate: bulkDate,
          spec: bulkSpec,
          price: bulkPrice,
          imageId: imgId,
          genre: selectedGenre,
        });
        if (autoPlace) {
          state.placed.push({ uid: 'p_' + uid(), itemId: id, size: 1, label: 'none', labelText: '', labelColor: '' });
        }
      }
      await saveState();
      renderLibrary();
      renderPlacedBar();
      updateImageCacheSummary();
      redraw();
      if (isModalOpen) closeItemModal();
      toast(autoPlace ? `${imgFiles.length}件のアイテムを一括登録＆配置しました` : `${imgFiles.length}件のアイテムを一括登録（未配置）しました`);
    }
  }

  // ドロップゾーンイベント
  $('#dropzone').addEventListener('click', () => $('#fileImg').click());
  $('#fileImg').addEventListener('change', e => {
    if (e.target.files?.length) handleImageFiles(e.target.files);
    e.target.value = '';
  });
  $('#dropzone').addEventListener('dragover', e => {
    e.preventDefault();
    $('#dropzone').classList.add('dragover');
  });
  $('#dropzone').addEventListener('dragleave', () => $('#dropzone').classList.remove('dragover'));
  $('#dropzone').addEventListener('drop', e => {
    e.preventDefault();
    $('#dropzone').classList.remove('dragover');
    if (e.dataTransfer?.files?.length) handleImageFiles(e.dataTransfer.files);
  });

  // アイテム保存ボタン
  $('#fAutoPlace')?.addEventListener('change', updateSaveButtonText);

  // ジャンル追加・削除UI
  $('#btnAddGenre')?.addEventListener('click', async () => {
    const name = await promptModal('ジャンルの追加', '追加する新しいジャンル名を入力してください:');
    if (!name || !name.trim()) return;
    const g = name.trim();
    if (!state.genres) state.genres = [];
    if (state.genres.includes(g)) {
      toast('そのジャンルは既に存在します', 'warn');
      $('#fGenre').value = g;
      return;
    }
    state.genres.push(g);
    if (!state.genreColors) state.genreColors = {};
    const defAccent = state.style?.accent || (getActiveColorMode() === 'classic' ? '#e4007f' : '#ff4b00');
    state.genreColors[g] = Render.getGenreColor(g, defAccent, state);
    await saveState();
    renderGenreOptions();
    $('#fGenre').value = g;
    syncGenreColorInput();
    toast(`ジャンル「${g}」を追加しました`, 'success');
  });

  $('#fGenre')?.addEventListener('change', () => {
    syncGenreColorInput();
  });

  $('#fGenreColor')?.addEventListener('input', e => {
    const cur = $('#fGenre')?.value;
    if (!cur) return;
    if (!state.genreColors) state.genreColors = {};
    state.genreColors[cur] = e.target.value;
    saveState();
    redraw();
    renderLibrary();
    renderGenreOptions();
  });

  $('#btnDelGenre')?.addEventListener('click', async () => {
    const cur = $('#fGenre')?.value;
    if (!cur) {
      toast('削除するジャンルを選択してください', 'warn');
      return;
    }
    const ok = await confirmModal('ジャンル削除', `ジャンル「${cur}」を削除しますか？\n（登録済みアイテムのジャンル設定は「未設定」になります）`);
    if (!ok) return;
    state.genres = (state.genres || []).filter(g => g !== cur);
    if (state.genreColors) delete state.genreColors[cur];
    for (const it of state.items) {
      if (it.genre === cur) it.genre = '';
    }
    await saveState();
    renderGenreOptions();
    $('#fGenre').value = '';
    syncGenreColorInput();
    renderLibrary();
    redraw();
    toast(`ジャンル「${cur}」を削除しました`);
  });

  $('#btnItemSave').addEventListener('click', async () => {
    const name = $('#fName').value.trim() || '無題の同人誌';
    const genre = $('#fGenre')?.value || '';
    const pubdate = $('#fDate').value.trim();
    const spec = $('#fSpec').value.trim();
    const priceVal = $('#fPrice').value.trim();
    const price = priceVal === '' ? '' : Number(priceVal);

    if (editingItemId) {
      const it = state.items.find(x => x.id === editingItemId);
      if (it) {
        it.name = name;
        it.genre = genre;
        it.pubdate = pubdate;
        it.spec = spec;
        it.price = price;
        it.imageId = pendingImageId;
      }
      toast(`「${name}」を更新しました`);
    } else {
      const id = 'item_' + uid();
      state.items.push({ id, name, pubdate, spec, price, imageId: pendingImageId, genre });
      const autoPlace = $('#fAutoPlace')?.checked !== false;
      if (autoPlace) {
        const pUid = 'p_' + uid();
        state.placed.push({ uid: pUid, itemId: id, size: 1, label: 'none', labelText: '', labelColor: '' });
        selectedPlacedUid = pUid;
        toast(`「${name}」を登録してお品書きに配置しました`);
      } else {
        toast(`「${name}」を登録しました（未配置）`);
      }
    }
    clearItemForm();
    closeItemModal();
    await saveState();
    renderLibrary();
    renderPlacedBar();
    updateImageCacheSummary();
    redraw();
  });

  $('#btnItemClear').addEventListener('click', clearItemForm);

  // フィルタリング＆ソート対象アイテムの取得 (Ver.0.17)
  function getFilteredItems() {
    const gVal = $('#filterGenre')?.value || 'all';
    const pVal = $('#filterPlaced')?.value || 'all';
    const sVal = $('#sortLibrary')?.value || 'default';
    const placedIds = new Set(state.placed.map(p => p.itemId));

    let items = state.items.filter(it => {
      // ジャンル判定
      if (gVal === 'none') {
        if (it.genre) return false;
      } else if (gVal !== 'all') {
        if (it.genre !== gVal) return false;
      }
      // 配置状態判定
      if (pVal === 'placed') {
        if (!placedIds.has(it.id)) return false;
      } else if (pVal === 'unplaced') {
        if (placedIds.has(it.id)) return false;
      }
      return true;
    });

    // 並び順ソート
    if (sVal === 'pubdate_desc') {
      items = [...items].sort((a, b) => {
        const va = parsePubDate(a.pubdate);
        const vb = parsePubDate(b.pubdate);
        if (va !== vb) return vb - va;
        return (a.name || '').localeCompare(b.name || '', 'ja');
      });
    } else if (sVal === 'pubdate_asc') {
      items = [...items].sort((a, b) => {
        const va = parsePubDate(a.pubdate);
        const vb = parsePubDate(b.pubdate);
        if (va !== vb) return va - vb;
        return (a.name || '').localeCompare(b.name || '', 'ja');
      });
    } else if (sVal === 'genre') {
      items = [...items].sort((a, b) => {
        const ga = a.genre || '';
        const gb = b.genre || '';
        if (ga && !gb) return -1;
        if (!ga && gb) return 1;
        if (ga !== gb) return ga.localeCompare(gb, 'ja');
        return 0;
      });
    }
    return items;
  }

  // アイテム一覧描画（ジャンルバッジ・配置状態表示・配置/解除切替）
  function renderLibrary() {
    const filtered = getFilteredItems();
    const placedIds = new Set(state.placed.map(p => p.itemId));
    $('#itemCount').textContent = `(${filtered.length} / ${state.items.length}点)`;

    const box = $('#library');
    box.innerHTML = '';
    if (!state.items.length) {
      box.innerHTML = `<p class="hint" style="text-align:center;padding:18px 6px;">まだアイテムがありません。<br>「＋ 新規アイテム登録」または「サンプル読込」から追加してください。</p>`;
      return;
    }
    if (!filtered.length) {
      box.innerHTML = `<p class="hint" style="text-align:center;padding:18px 6px;">条件に一致するアイテムがありません。</p>`;
      return;
    }

    for (const item of filtered) {
      const isPlaced = placedIds.has(item.id);
      const el = document.createElement('div');
      el.className = 'lib-item' + (editingItemId === item.id ? ' editing' : '');
      el.draggable = true;
      el.dataset.itemId = item.id;

      const dUrl = Images.data.get(item.imageId);
      const thumbHtml = dUrl ? `<img src="${dUrl}" alt="">` : `<span>書影<br>なし</span>`;
      const specInline = item.spec ? String(item.spec).replace(/\r?\n+/g, ' ／ ') : '';
      const metaStr = [item.pubdate, specInline].filter(Boolean).join(' / ') || 'コメント未入力';
      const priceStr = Render.fmtPrice(item.price) || '価格未定';

      let genreBadgeHtml = `<span class="badge unclassified-badge">未分類</span>`;
      if (item.genre) {
        const defAccent = state.style?.accent || (getActiveColorMode() === 'classic' ? '#e4007f' : '#ff4b00');
        const gc = Render.getGenreColor(item.genre, defAccent, state);
        genreBadgeHtml = `<span class="badge genre-badge" style="background:${gc}1f;color:${gc};border-color:${gc}55;" title="ジャンル: ${esc(item.genre)}">${esc(item.genre)}</span>`;
      }
      const placedBadgeHtml = isPlaced
        ? `<span class="badge placed-badge">● 配置中</span>`
        : `<span class="badge unplaced-badge">○ 未配置</span>`;

      const actionBtnHtml = isPlaced
        ? `<button class="sm btn-unplace" title="お品書きから外す">配置解除</button>`
        : `<button class="sm primary btn-place" title="お品書きに追加配置">＋配置</button>`;

      el.innerHTML = `
        <div class="lib-thumb">${thumbHtml}</div>
        <div class="lib-info">
          <div class="lib-title" title="${esc(item.name)}">${esc(item.name)}</div>
          <div class="lib-badges">
            ${genreBadgeHtml}
            ${placedBadgeHtml}
          </div>
          <div class="lib-meta" title="${esc(metaStr)}">${esc(metaStr)}</div>
          <div class="lib-price">${esc(priceStr)}</div>
        </div>
        <div class="lib-btns">
          ${actionBtnHtml}
          <div class="row" style="gap:2px;">
            <button class="sm btn-dup" style="padding:2px 5px;font-size:11px;" title="このアイテムを複製して新規作成">複製</button>
            <button class="sm btn-edit" style="padding:2px 5px;font-size:11px;" title="登録情報を編集">編集</button>
            <button class="sm danger btn-del" style="padding:2px 5px;font-size:11px;" title="データベースから削除">削除</button>
          </div>
        </div>
      `;

      el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', 'item:' + item.id);
      });

      // 配置ボタン（未配置時）
      const btnPlace = el.querySelector('.btn-place');
      if (btnPlace) {
        btnPlace.addEventListener('click', async e => {
          e.stopPropagation();
          const pUid = 'p_' + uid();
          state.placed.push({ uid: pUid, itemId: item.id, size: 1, label: 'none', labelText: '', labelColor: '' });
          selectedPlacedUid = pUid;
          await saveState();
          renderLibrary();
          renderPlacedBar();
          redraw();
          toast(`「${item.name}」をお品書きに配置しました`);
        });
      }

      // 配置解除ボタン（配置中時）
      const btnUnplace = el.querySelector('.btn-unplace');
      if (btnUnplace) {
        btnUnplace.addEventListener('click', async e => {
          e.stopPropagation();
          state.placed = state.placed.filter(p => p.itemId !== item.id);
          if (selectedPlacedUid && !state.placed.some(p => p.uid === selectedPlacedUid)) {
            selectedPlacedUid = state.placed[0]?.uid || null;
          }
          await saveState();
          renderLibrary();
          renderPlacedBar();
          redraw();
          toast(`「${item.name}」をお品書きから解除しました`);
        });
      }

      // 複製ボタン（複製後にモーダルを開く）
      el.querySelector('.btn-dup')?.addEventListener('click', async e => {
        e.stopPropagation();
        const baseName = item.name || '無題アイテム';
        const newItem = {
          id: 'item_' + uid(),
          name: baseName + ' (コピー)',
          pubdate: item.pubdate || '',
          spec: item.spec || '',
          price: item.price ?? 500,
          imageId: item.imageId || '',
          genre: item.genre || '',
        };
        const idx = state.items.findIndex(x => x.id === item.id);
        if (idx !== -1) {
          state.items.splice(idx + 1, 0, newItem);
        } else {
          state.items.push(newItem);
        }
        await saveState();
        renderLibrary();
        openItemModal(newItem);
        toast(`「${baseName}」を複製しました。タイトルや巻数を編集できます`, 'success');
      });

      // 編集ボタン（モーダルを開く）
      el.querySelector('.btn-edit')?.addEventListener('click', e => {
        e.stopPropagation();
        openItemModal(item);
      });

      // 削除ボタン（マウス移動不要のインライン2段階確認・3秒タイマー）
      const btnDel = el.querySelector('.btn-del');
      let delTimer = null;
      btnDel?.addEventListener('click', async e => {
        e.stopPropagation();
        if (btnDel.dataset.confirming !== 'true') {
          btnDel.dataset.confirming = 'true';
          btnDel.textContent = '本当に削除？';
          btnDel.classList.add('confirming');
          delTimer = setTimeout(() => {
            btnDel.dataset.confirming = 'false';
            btnDel.textContent = '削除';
            btnDel.classList.remove('confirming');
          }, 3000);
          return;
        }

        clearTimeout(delTimer);
        state.items = state.items.filter(x => x.id !== item.id);
        state.placed = state.placed.filter(p => p.itemId !== item.id);
        if (editingItemId === item.id) {
          clearItemForm();
          closeItemModal();
        }
        await saveState();
        renderLibrary();
        renderPlacedBar();
        updateImageCacheSummary();
        redraw();
        toast(`「${item.name}」を削除しました`);
      });

      box.appendChild(el);
    }
  }

  // フィルタ選択イベント
  $('#filterGenre')?.addEventListener('change', renderLibrary);
  $('#filterPlaced')?.addEventListener('change', renderLibrary);
  $('#sortLibrary')?.addEventListener('change', renderLibrary);

  // ジャンル順に整列ボタン
    // 発行年月順（新→古）整列ボタン (Ver.0.17, Ver.0.52: POP/空白枠を末尾配置)
  $('#btnSortDate')?.addEventListener('click', async () => {
    if (!state.placed.length) {
      toast('配置中のアイテムがありません', 'warn');
      return;
    }
    const itemMap = new Map(state.items.map(it => [it.id, it]));
    state.placed.sort((a, b) => {
      const isExtraA = a.itemId?.startsWith('pop_') || a.itemId === 'spacer' || a.itemId?.startsWith('spacer');
      const isExtraB = b.itemId?.startsWith('pop_') || b.itemId === 'spacer' || b.itemId?.startsWith('spacer');
      if (isExtraA && !isExtraB) return 1;
      if (!isExtraA && isExtraB) return -1;
      if (isExtraA && isExtraB) return 0;
      const itA = itemMap.get(a.itemId);
      const itB = itemMap.get(b.itemId);
      const vA = parsePubDate(itA?.pubdate);
      const vB = parsePubDate(itB?.pubdate);
      if (vA !== vB) return vB - vA; // 降順（新→古）
      return (itA?.name || '').localeCompare(itB?.name || '', 'ja');
    });
    await saveState();
    renderPlacedBar();
    redraw();
    toast('配置アイテムを発行年月の新しい順に整列しました', 'success');
  });

  // 配置中アイテムチップ表示切替チェックボックス (Ver.0.66)
  $('#chkShowPlacedChips')?.addEventListener('change', e => {
    const chipsBox = $('#placedChips');
    if (chipsBox) {
      chipsBox.style.display = e.target.checked ? 'flex' : 'none';
    }
  });

  // ジャンル順に整列ボタン (Ver.0.52: POP/空白枠を末尾配置)
  $('#btnSortGenre')?.addEventListener('click', async () => {
    if (!state.placed.length) {
      toast('配置中のアイテムがありません', 'warn');
      return;
    }
    const itemMap = new Map(state.items.map(it => [it.id, it]));
    state.placed.sort((a, b) => {
      const isExtraA = a.itemId?.startsWith('pop_') || a.itemId === 'spacer' || a.itemId?.startsWith('spacer');
      const isExtraB = b.itemId?.startsWith('pop_') || b.itemId === 'spacer' || b.itemId?.startsWith('spacer');
      if (isExtraA && !isExtraB) return 1;
      if (!isExtraA && isExtraB) return -1;
      if (isExtraA && isExtraB) return 0;
      const itA = itemMap.get(a.itemId);
      const itB = itemMap.get(b.itemId);
      const gA = itA?.genre || '';
      const gB = itB?.genre || '';
      if (gA && !gB) return -1;
      if (!gA && gB) return 1;
      if (gA !== gB) return gA.localeCompare(gB, 'ja');
      return (itA?.name || '').localeCompare(itB?.name || '', 'ja');
    });
    await saveState();
    renderPlacedBar();
    redraw();
    toast('配置アイテムをジャンル順に整列しました', 'success');
  });

  // 新刊・サイズ順に整列ボタン (Ver.0.52: POP/空白枠を末尾配置)
  $('#btnSortNew')?.addEventListener('click', async () => {
    if (!state.placed.length) {
      toast('配置中のアイテムがありません', 'warn');
      return;
    }
    state.placed.sort((a, b) => {
      const isExtraA = a.itemId?.startsWith('pop_') || a.itemId === 'spacer' || a.itemId?.startsWith('spacer');
      const isExtraB = b.itemId?.startsWith('pop_') || b.itemId === 'spacer' || b.itemId?.startsWith('spacer');
      if (isExtraA && !isExtraB) return 1;
      if (!isExtraA && isExtraB) return -1;
      if (isExtraA && isExtraB) return 0;
      const NEW_LABELS = ['new', 'new_set', 'new_work', 'new_music', 'new_en'];
      const isNewA = NEW_LABELS.includes(a.label) ? 1 : 0;
      const isNewB = NEW_LABELS.includes(b.label) ? 1 : 0;
      if (isNewA !== isNewB) return isNewB - isNewA;
      const szA = Number(a.size) || 1;
      const szB = Number(b.size) || 1;
      if (szA !== szB) return szB - szA;
      return 0;
    });
    await saveState();
    renderPlacedBar();
    redraw();
    toast('新刊・大型サイズを先頭に整列しました', 'success');
  });

  // 空白枠の追加ボタン (Ver.0.52)
  $('#btnAddSpacer')?.addEventListener('click', async () => {
    const sUid = 'p_' + uid();
    state.placed.push({
      uid: sUid,
      itemId: 'spacer',
      size: 1,
      label: 'none',
      labelText: '',
      labelColor: '',
      subLabel: 'none',
      subLabelText: '',
      subLabelColor: '',
    });
    selectedPlacedUid = sUid;
    await saveState();
    renderPlacedBar();
    redraw();
    toast('空白枠（1枠）を追加しました', 'success');
  });

  // 表示中をすべて配置ボタン
  $('#btnPlaceFiltered')?.addEventListener('click', async () => {
    const filtered = getFilteredItems();
    const placedIds = new Set(state.placed.map(p => p.itemId));
    let added = 0;
    for (const it of filtered) {
      if (!placedIds.has(it.id)) {
        state.placed.push({ uid: 'p_' + uid(), itemId: it.id, size: 1, label: 'none', labelText: '', labelColor: '' });
        added++;
      }
    }
    if (added === 0) {
      toast('表示中のアイテムは既にすべて配置されています');
      return;
    }
    await saveState();
    renderLibrary();
    renderPlacedBar();
    redraw();
    toast(`表示中の${added}点をすべてお品書きに配置しました`);
  });

  // 表示中をすべて配置解除ボタン
  $('#btnUnplaceFiltered')?.addEventListener('click', async () => {
    const filtered = getFilteredItems();
    const filteredIds = new Set(filtered.map(it => it.id));
    const beforeCount = state.placed.length;
    state.placed = state.placed.filter(p => !filteredIds.has(p.itemId));
    const removed = beforeCount - state.placed.length;
    if (removed === 0) {
      toast('表示中のアイテムはお品書きに配置されていません');
      return;
    }
    if (selectedPlacedUid && !state.placed.some(p => p.uid === selectedPlacedUid)) {
      selectedPlacedUid = state.placed[0]?.uid || null;
    }
    await saveState();
    renderLibrary();
    renderPlacedBar();
    redraw();
    toast(`表示中の${removed}点をお品書きから配置解除しました`);
  });

  /* ---------- キャンバス上のクリック選択・ドラッグ並び替え・ドロップ配置 ---------- */
  const canvasEl = $('#preview');
  const canvasWrap = $('#canvasWrap');

  function canvasPoint(e) {
    const rect = canvasEl.getBoundingClientRect();
    const sx = canvasEl.width / rect.width;
    const sy = canvasEl.height / rect.height;
    return {
      x: (e.clientX - rect.left) * sx,
      y: (e.clientY - rect.top) * sy,
    };
  }

  function hitCard(pt) {
    if (!lastLayout || !lastLayout.cards) return null;
    for (let i = lastLayout.cards.length - 1; i >= 0; i--) {
      const c = lastLayout.cards[i];
      if (pt.x >= c.x && pt.x <= c.x + c.w && pt.y >= c.y && pt.y <= c.y + c.h) {
        return c;
      }
    }
    return null;
  }

  let canvasDragMoved = false;
  let lastSwappedTargetUid = null;

  canvasEl.addEventListener('mousedown', e => {
    const pt = canvasPoint(e);
    const hit = hitCard(pt);
    if (hit) {
      selectedPlacedUid = hit.uid;
      dragPlacedUid = hit.uid;
      canvasDragMoved = false;
      lastSwappedTargetUid = null;
      renderPlacedBar();
      redraw();
    } else {
      selectedPlacedUid = null;
      renderPlacedBar();
      redraw();
    }
  });

  canvasEl.addEventListener('mousemove', e => {
    if (!dragPlacedUid) return;
    const pt = canvasPoint(e);
    const over = hitCard(pt);
    if (!over || over.uid === dragPlacedUid) {
      if (!over || over.uid !== lastSwappedTargetUid) {
        lastSwappedTargetUid = null;
      }
      return;
    }
    if (over.uid === lastSwappedTargetUid) return;

    const idxA = state.placed.findIndex(p => p.uid === dragPlacedUid);
    const idxB = state.placed.findIndex(p => p.uid === over.uid);
    if (idxA >= 0 && idxB >= 0) {
      const [moved] = state.placed.splice(idxA, 1);
      state.placed.splice(idxB, 0, moved);
      canvasDragMoved = true;
      lastSwappedTargetUid = over.uid;
      renderPlacedBar();
      redraw();
    }
  });
  window.addEventListener('mouseup', async () => {
    if (dragPlacedUid) {
      if (canvasDragMoved) {
        await saveState(false, true);
      }
      dragPlacedUid = null;
      canvasDragMoved = false;
      lastSwappedTargetUid = null;
    }
  });

  // ライブラリからキャンバスへのドラッグ＆ドロップ配置
  canvasWrap.addEventListener('dragover', e => {
    e.preventDefault();
    canvasWrap.classList.add('dragover');
  });
  canvasWrap.addEventListener('dragleave', () => canvasWrap.classList.remove('dragover'));
  canvasWrap.addEventListener('drop', async e => {
    e.preventDefault();
    canvasWrap.classList.remove('dragover');
    const data = e.dataTransfer?.getData('text/plain') || '';
    if (data.startsWith('item:')) {
      const itemId = data.slice(5);
      const item = state.items.find(x => x.id === itemId);
      const pop = (state.pops || []).find(x => x.id === itemId);
      if (item) {
        const existing = state.placed.find(p => p.itemId === item.id);
        if (existing) {
          selectedPlacedUid = existing.uid;
          renderPlacedBar();
          redraw();
          toast(`「${item.name}」は既に配置されています`, 'warn');
          return;
        }
        const pUid = 'p_' + uid();
        state.placed.push({ uid: pUid, itemId: item.id, size: 1, label: 'none', labelText: '', labelColor: '' });
        selectedPlacedUid = pUid;
        await saveState();
        renderLibrary();
        renderPlacedBar();
        redraw();
        toast(`「${item.name}」をドロップ配置しました`);
      } else if (pop) {
        const existing = state.placed.find(p => p.itemId === pop.id);
        if (existing) {
          selectedPlacedUid = existing.uid;
          renderPlacedBar();
          redraw();
          toast(`POP「${pop.title || '（画像POP）'}」は既に配置されています`, 'warn');
          return;
        }
        const pUid = 'p_' + uid();
        state.placed.push({ uid: pUid, itemId: pop.id, size: 2, label: 'none', labelText: '', labelColor: '' });
        selectedPlacedUid = pUid;
        await saveState();
        renderPopLibrary();
        renderPlacedBar();
        redraw();
        toast(`POP「${pop.title || '（画像POP）'}」をドロップ配置しました`);
      }
    } else if (e.dataTransfer?.files?.length) {
      await handleImageFiles(e.dataTransfer.files);
    }
  });


  /* ---------- 売り文句POP管理・描画 (Ver.0.29: 画像・トリミング・吹き出し対応) ---------- */
  let editingPopId = null;
  let pendingPopImageId = null;

  function updatePopImageModalPreview() {
    const emptyBox = $('#popImgEmptyState');
    const activeBox = $('#popImgActiveState');
    const thumb = $('#popImgThumb');
    const nameEl = $('#popImgName');
    if (pendingPopImageId && Images.data && Images.data.has(pendingPopImageId)) {
      const dUrl = Images.data.get(pendingPopImageId);
      if (thumb) thumb.src = dUrl;
      if (nameEl) nameEl.textContent = '画像設定中';
      if (emptyBox) emptyBox.style.display = 'none';
      if (activeBox) activeBox.style.display = 'flex';
    } else {
      if (thumb) thumb.src = '';
      if (emptyBox) emptyBox.style.display = 'block';
      if (activeBox) activeBox.style.display = 'none';
    }
  }

  /* ---------- POPモーダル リアルタイムプレビュー (Ver.0.31) ---------- */
  function updatePopLivePreview() {
    const canvas = $('#popPreviewCanvas');
    if (!canvas || !window.Render || typeof Render.drawPopCard !== 'function') return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const rawTitle = $('#popTitleInput')?.value ?? '';
    const title = rawTitle.trim() ? rawTitle : (pendingPopImageId ? '' : 'おすすめPOP！');
    const titleFit = $('#popTitleFitInput')?.value || 'condense1';
    const sub = $('#popSubInput')?.value || '';
    const style = $('#popStyleInput')?.value || 'burst';
    const defPopBg = state.style?.accent || (getActiveColorMode() === 'classic' ? '#e4007f' : '#ff4b00');
    const bgColor = $('#popBgColorInput')?.value || defPopBg;
    const textColor = $('#popTextColorInput')?.value || '#ffffff';
    const imgScale = Number.isFinite(Number($('#popImgScale')?.value)) ? Number($('#popImgScale')?.value) : 100;
    const imgX = Number.isFinite(Number($('#popImgX')?.value)) ? Number($('#popImgX')?.value) : 0;
    const imgY = Number.isFinite(Number($('#popImgY')?.value)) ? Number($('#popImgY')?.value) : 0;
    const showBg = $('#popShowBg') ? $('#popShowBg').checked : true;
    const bubble = $('#popBubble')?.value || 'round';
    const textPos = $('#popTextPos')?.value || 'bottom';
    const tailDir = $('#popTailDir')?.value || 'auto';
    const tailPos = Number.isFinite(Number($('#popTailPos')?.value)) ? Number($('#popTailPos')?.value) : 35;
    const textX = Number.isFinite(Number($('#popTextX')?.value)) ? Number($('#popTextX')?.value) : 0;
    const textY = Number.isFinite(Number($('#popTextY')?.value)) ? Number($('#popTextY')?.value) : 0;

    const dummyPop = {
      id: editingPopId || 'pop_preview',
      title,
      titleFit,
      sub,
      style,
      bgColor,
      textColor,
      imageId: pendingPopImageId || '',
      imgScale,
      imgX,
      imgY,
      showBg,
      bubble,
      textPos,
      textX,
      textY,
      tailDir,
      tailPos
    };

    const pad = 12;
    const card = {
      type: 'pop',
      x: pad,
      y: pad,
      w: W - pad * 2,
      h: H - pad * 2,
      item: dummyPop,
      placed: { size: 1 }
    };

    Render.drawPopCard(ctx, state, card, id => Images.get(id), { preview: true });
  }

  function updatePopTailVisibility() {
    const style = $('#popStyleInput')?.value || 'burst';
    const bubble = $('#popBubble')?.value || 'round';
    const textPos = $('#popTextPos')?.value || 'bottom';
    const textX = Number($('#popTextX')?.value) || 0;
    const textY = Number($('#popTextY')?.value) || 0;
    const hasImage = Boolean(pendingPopImageId);
    const isCustomText = hasImage || style === 'image_pop' || textPos !== 'bottom' || textX !== 0 || textY !== 0 || bubble !== 'round';

    // 吹き出しスタイル（speech）、またはカスタムテキストモードかつ角丸吹き出し（round）のときのみ「しっぽ」設定を表示 (Ver.0.68)
    const show = style === 'speech' || (isCustomText && bubble === 'round');
    const row = $('#rowPopTailDir')?.parentElement;
    if (row && row.classList.contains('row')) {
      row.style.display = show ? 'flex' : 'none';
    } else {
      if ($('#rowPopTailDir')) $('#rowPopTailDir').style.display = show ? '' : 'none';
      if ($('#rowPopTailPos')) $('#rowPopTailPos').style.display = show ? '' : 'none';
    }
  }

  function openPopModal(pop = null) {
    const defPopBg = state.style?.accent || (getActiveColorMode() === 'classic' ? '#e4007f' : '#ff4b00');
    if (pop) {
      editingPopId = pop.id;
      $('#popFormTitle').textContent = 'POP編集';
      $('#popEditModeBadge').style.display = 'inline';
      $('#popTitleInput').value = pop.title || '';
      $('#popTitleFitInput').value = pop.titleFit || 'condense1';
      $('#popSubInput').value = pop.sub || '';
      $('#popStyleInput').value = pop.style || 'burst';
      $('#popBgColorInput').value = pop.bgColor || defPopBg;
      $('#popTextColorInput').value = pop.textColor || '#ffffff';

      // Ver.0.29 拡張プロパティ
      pendingPopImageId = pop.imageId || null;
      if ($('#popImgScale')) {
        $('#popImgScale').value = pop.imgScale ?? 100;
        $('#popImgScaleVal').textContent = (pop.imgScale ?? 100) + '%';
      }
      if ($('#popImgX')) {
        $('#popImgX').value = pop.imgX ?? 0;
        $('#popImgXVal').textContent = (pop.imgX ?? 0) + '%';
      }
      if ($('#popImgY')) {
        $('#popImgY').value = pop.imgY ?? 0;
        $('#popImgYVal').textContent = (pop.imgY ?? 0) + '%';
      }
      if ($('#popShowBg')) {
        $('#popShowBg').checked = pop.showBg !== false;
      }
      if ($('#popBubble')) {
        $('#popBubble').value = pop.bubble || 'round';
      }
      if ($('#popTextPos')) {
        $('#popTextPos').value = pop.textPos || 'bottom';
      }
      if ($('#popTailDir')) {
        $('#popTailDir').value = pop.tailDir || 'auto';
      }
      if ($('#popTailPos')) {
        const tp = pop.tailPos ?? 35;
        $('#popTailPos').value = tp;
        if ($('#popTailPosVal')) $('#popTailPosVal').textContent = tp + '%';
      }
      if ($('#popTextX')) {
        $('#popTextX').value = pop.textX ?? 0;
        $('#popTextXVal').textContent = (pop.textX ?? 0) + '%';
      }
      if ($('#popTextY')) {
        $('#popTextY').value = pop.textY ?? 0;
        $('#popTextYVal').textContent = (pop.textY ?? 0) + '%';
      }
    } else {
      editingPopId = null;
      $('#popFormTitle').textContent = '新規POP作成';
      $('#popEditModeBadge').style.display = 'none';
      $('#popTitleInput').value = '';
      $('#popTitleFitInput').value = 'condense1';
      $('#popSubInput').value = '';
      $('#popStyleInput').value = 'burst';
      $('#popBgColorInput').value = defPopBg;
      $('#popTextColorInput').value = '#ffffff';

      // 初期値リセット
      pendingPopImageId = null;
      if ($('#popImgScale')) {
        $('#popImgScale').value = 100;
        $('#popImgScaleVal').textContent = '100%';
      }
      if ($('#popImgX')) {
        $('#popImgX').value = 0;
        $('#popImgXVal').textContent = '0%';
      }
      if ($('#popImgY')) {
        $('#popImgY').value = 0;
        $('#popImgYVal').textContent = '0%';
      }
      if ($('#popShowBg')) {
        $('#popShowBg').checked = true;
      }
      if ($('#popBubble')) {
        $('#popBubble').value = 'round';
      }
      if ($('#popTextPos')) {
        $('#popTextPos').value = 'bottom';
      }
      if ($('#popTailDir')) {
        $('#popTailDir').value = 'auto';
      }
      if ($('#popTailPos')) {
        $('#popTailPos').value = 35;
        if ($('#popTailPosVal')) $('#popTailPosVal').textContent = '35%';
      }
      if ($('#popTextX')) {
        $('#popTextX').value = 0;
        $('#popTextXVal').textContent = '0%';
      }
      if ($('#popTextY')) {
        $('#popTextY').value = 0;
        $('#popTextYVal').textContent = '0%';
      }
    }
    updatePopImageModalPreview();
    updatePopTailVisibility();
    updatePopLivePreview();
    $('#popModalBackdrop')?.classList.add('open');
    setTimeout(() => $('#popTitleInput')?.focus(), 80);
  }

  function closePopModal() {
    $('#popModalBackdrop')?.classList.remove('open');
  }

  function renderPopLibrary() {
    if (!state.pops) state.pops = [];
    const box = $('#popLibrary');
    if (!box) return;
    box.innerHTML = '';
    $('#popCount').textContent = `(${state.pops.length}点)`;

    const placedPopIds = new Set(state.placed.map(p => p.itemId).filter(id => id && id.startsWith('pop_')));

    for (const pop of state.pops) {
      const isPlaced = placedPopIds.has(pop.id);
      const el = document.createElement('div');
      el.className = 'pop-item' + (isPlaced ? ' placed' : '');
      el.draggable = true;

      const styleIcon = pop.style === 'burst' ? '💥'
        : pop.style === 'banner' ? '🎗️'
        : pop.style === 'ticket' ? '🎟️'
        : pop.style === 'speech' ? '💬'
        : pop.style === 'glass' ? '✨'
        : pop.style === 'image_pop' ? '🖼️'
        : pop.style === 'frame' ? '🪧'
        : pop.style === 'simple_white' ? '⬜'
        : pop.style === 'simple_black' ? '⬛'
        : '💬';
      const actionBtnHtml = isPlaced
        ? '<button class="sm btn-unplace-pop" style="padding:2px 6px;font-size:11px;" title="お品書きから解除">解除</button>'
        : '<button class="sm primary btn-place-pop" style="padding:2px 6px;font-size:11px;" title="お品書きに配置">＋配置</button>';

      const defPopBg = state.style?.accent || (getActiveColorMode() === 'classic' ? '#e4007f' : '#ff4b00');
      el.innerHTML = `
        <div class="pop-thumb ${esc(pop.style || 'burst')}" style="background:${esc(pop.bgColor || defPopBg)};color:${esc(pop.textColor || '#ffffff')};">
          <span>${styleIcon}</span>
        </div>
        <div class="pop-info">
          <div class="pop-title" title="${esc(pop.title || '（画像POP）')}">${esc(pop.title || '（画像POP）')}</div>
          <div class="pop-sub" title="${esc(pop.sub || '')}">${esc(pop.sub || '')}</div>
        </div>
        <div class="pop-btns">
          ${actionBtnHtml}
          <div class="row" style="gap:2px;">
            <button class="sm btn-dup-pop" style="padding:2px 5px;font-size:11px;" title="このPOPを複製して新規作成">複製</button>
            <button class="sm btn-edit-pop" style="padding:2px 5px;font-size:11px;" title="POP内容を編集">編集</button>
            <button class="sm danger btn-del-pop" style="padding:2px 5px;font-size:11px;" title="POPを削除">削除</button>
          </div>
        </div>
      `;

      // 画像が設定されている場合はサムネイル背景に反映
      const thumbEl = el.querySelector('.pop-thumb');
      if (thumbEl && pop.imageId && Images.data && Images.data.has(pop.imageId)) {
        thumbEl.style.backgroundImage = `url("${Images.data.get(pop.imageId)}")`;
        thumbEl.style.backgroundSize = 'cover';
        thumbEl.style.backgroundPosition = 'center';
      }

      el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', 'item:' + pop.id);
      });

      // 配置ボタン
      el.querySelector('.btn-place-pop')?.addEventListener('click', async e => {
        e.stopPropagation();
        const pUid = 'p_' + uid();
        state.placed.push({ uid: pUid, itemId: pop.id, size: 2, label: 'none', labelText: '', labelColor: '' });
        selectedPlacedUid = pUid;
        await saveState();
        renderPopLibrary();
        renderPlacedBar();
        redraw();
        toast(`POP「${pop.title || '（画像POP）'}」をお品書きに配置しました`);
      });

      // 解除ボタン
      el.querySelector('.btn-unplace-pop')?.addEventListener('click', async e => {
        e.stopPropagation();
        state.placed = state.placed.filter(p => p.itemId !== pop.id);
        if (selectedPlacedUid && !state.placed.some(p => p.uid === selectedPlacedUid)) {
          selectedPlacedUid = state.placed[0]?.uid || null;
        }
        await saveState();
        renderPopLibrary();
        renderPlacedBar();
        redraw();
        toast(`POP「${pop.title || '（画像POP）'}」をお品書きから解除しました`);
      });

      // 複製ボタン (Ver.0.55)
      el.querySelector('.btn-dup-pop')?.addEventListener('click', async e => {
        e.stopPropagation();
        const newPop = {
          id: 'pop_' + uid(),
          title: pop.title ? `${pop.title} (コピー)` : '',
          sub: pop.sub || '',
          style: pop.style || 'burst',
          bgColor: pop.bgColor || defPopBg,
          textColor: pop.textColor || '#ffffff',
          titleFit: pop.titleFit || 'condense1',
          imageId: pop.imageId || '',
          imgScale: pop.imgScale ?? 100,
          imgX: pop.imgX ?? 0,
          imgY: pop.imgY ?? 0,
          showBg: pop.showBg !== false,
          bubble: pop.bubble || 'round',
          textPos: pop.textPos || 'bottom',
          textX: pop.textX ?? 0,
          textY: pop.textY ?? 0,
          tailDir: pop.tailDir || 'auto',
          tailPos: pop.tailPos ?? 35,
        };
        const idx = (state.pops || []).indexOf(pop);
        if (idx >= 0) {
          state.pops.splice(idx + 1, 0, newPop);
        } else {
          state.pops.push(newPop);
        }
        await saveState();
        renderPopLibrary();
        openPopModal(newPop);
        toast(`POP「${newPop.title || '（画像POP）'}」を複製しました`);
      });

      // 編集ボタン
      el.querySelector('.btn-edit-pop')?.addEventListener('click', e => {
        e.stopPropagation();
        openPopModal(pop);
      });

      // 削除ボタン（インライン2段階確認）
      const btnDel = el.querySelector('.btn-del-pop');
      let delTimer = null;
      btnDel?.addEventListener('click', async e => {
        e.stopPropagation();
        if (btnDel.dataset.confirming !== 'true') {
          btnDel.dataset.confirming = 'true';
          btnDel.textContent = '本当に削除？';
          btnDel.classList.add('confirming');
          delTimer = setTimeout(() => {
            btnDel.dataset.confirming = 'false';
            btnDel.textContent = '削除';
            btnDel.classList.remove('confirming');
          }, 3000);
          return;
        }

        clearTimeout(delTimer);
        state.pops = (state.pops || []).filter(x => x.id !== pop.id);
        state.placed = state.placed.filter(p => p.itemId !== pop.id);
        if (editingPopId === pop.id) closePopModal();
        await saveState();
        renderPopLibrary();
        renderPlacedBar();
        updateImageCacheSummary();
        redraw();
        toast(`POP「${pop.title || '（画像POP）'}」を削除しました`);
      });

      box.appendChild(el);
    }
  }


  /* ---------- ブラウザ内画像キャッシュ管理 (Ver.0.32) ---------- */
  function updateImageCacheSummary() {
    const el = $('#imageCacheSummary');
    if (!el || !window.Images || typeof Images.getStats !== 'function') return;
    const usedIds = Images.getUsedIds(state);
    const { list, totalBytes } = Images.getStats(usedIds);
    const unusedCount = list.filter(x => !x.isUsed && !x.isSample).length;
    const mbSize = (totalBytes / (1024 * 1024)).toFixed(1);
    const kbSize = Math.round(totalBytes / 1024);
    const sizeStr = totalBytes >= 1024 * 1024 ? `${mbSize} MB` : `${kbSize} KB`;
    el.textContent = `保存画像: ${list.length}枚（うち未使用: ${unusedCount}枚） / 約 ${sizeStr}`;
  }

  function openImageManagerModal() {
    renderImageManagerModal();
    $('#imageManagerModalBackdrop')?.classList.add('open');
  }

  function closeImageManagerModal() {
    $('#imageManagerModalBackdrop')?.classList.remove('open');
  }

  function renderImageManagerModal() {
    const grid = $('#imageGridList');
    const statsEl = $('#modalImageStats');
    if (!grid || !window.Images || typeof Images.getStats !== 'function') return;

    const usedIds = Images.getUsedIds(state);
    const { list, totalBytes } = Images.getStats(usedIds);
    const unusedCount = list.filter(x => !x.isUsed && !x.isSample).length;
    const mbSize = (totalBytes / (1024 * 1024)).toFixed(1);
    const kbSize = Math.round(totalBytes / 1024);
    const sizeStr = totalBytes >= 1024 * 1024 ? `${mbSize} MB` : `${kbSize} KB`;

    if (statsEl) {
      statsEl.textContent = `保存画像: ${list.length}枚（うち未使用: ${unusedCount}枚） / 約 ${sizeStr}`;
    }

    grid.innerHTML = '';
    if (list.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--text-sub);">保存されている画像はありません</div>';
      return;
    }

    // 使用先マップ
    const itemMap = new Map();
    (state.items || []).forEach(it => { if (it.imageId) itemMap.set(it.imageId, it.name); });
    const popMap = new Map();
    (state.pops || []).forEach(p => { if (p.imageId) popMap.set(p.imageId, p.title || '（画像POP）'); });

    for (const item of list) {
      const card = document.createElement('div');
      card.className = 'img-cache-card';
      card.style.cssText = 'background:var(--panel-2);border:1px solid var(--border);border-radius:6px;padding:8px;display:flex;flex-direction:column;gap:6px;font-size:11px;position:relative;cursor:pointer;user-select:none;transition:border-color 0.15s;';

      // 上部：チェックボックスとサイズ表示
      const topRow = document.createElement('div');
      topRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';

      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.className = 'img-cache-check';
      chk.dataset.imgId = item.id;
      chk.dataset.used = item.isUsed ? 'true' : 'false';
      chk.dataset.sample = item.isSample ? 'true' : 'false';
      chk.checked = !item.isUsed && !item.isSample; // 未使用かつ非サンプル画像のみ初期選択
      chk.style.cssText = 'cursor:pointer;width:16px;height:16px;';
      chk.addEventListener('click', e => e.stopPropagation());

      const sizeKb = Math.round(item.byteSize / 1024);
      const sizeSpan = document.createElement('span');
      sizeSpan.style.cssText = 'color:var(--text-sub);font-size:10px;font-weight:700;';
      sizeSpan.textContent = `${sizeKb} KB`;

      topRow.appendChild(chk);
      topRow.appendChild(sizeSpan);
      card.appendChild(topRow);

      // サムネイル画像
      const imgWrap = document.createElement('div');
      imgWrap.style.cssText = 'width:100%;height:90px;background:#141720;border-radius:4px;overflow:hidden;display:flex;align-items:center;justify-content:center;';
      const img = document.createElement('img');
      img.src = item.dataUrl;
      img.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;';
      imgWrap.appendChild(img);
      card.appendChild(imgWrap);

      // ID
      const meta = document.createElement('div');
      meta.style.cssText = 'color:var(--text-sub);font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:monospace;';
      meta.title = item.id;
      meta.textContent = item.id;
      card.appendChild(meta);

      // 使用状況
      const status = document.createElement('div');
      let statusText = item.isSample ? '📌 サンプル画像（保護）' : '⚪ 未使用';
      let statusStyle = item.isSample ? 'color:#a78bfa;font-weight:700;' : 'color:var(--text-sub);';
      if (item.isUsed) {
        if (itemMap.has(item.id)) {
          statusText = `📗 ${itemMap.get(item.id)}`;
          statusStyle = 'color:#34d399;font-weight:700;';
        } else if (popMap.has(item.id)) {
          statusText = `💬 ${popMap.get(item.id)}`;
          statusStyle = 'color:#38bdf8;font-weight:700;';
        } else if (state.bg && state.bg.imageId === item.id) {
          statusText = '🖼️ 背景で使用中';
          statusStyle = 'color:#f59e0b;font-weight:700;';
        } else {
          statusText = '✅ 使用中';
          statusStyle = 'color:#34d399;font-weight:700;';
        }
      }
      status.style.cssText = `white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:10px;${statusStyle}`;
      status.title = statusText;
      status.textContent = statusText;
      card.appendChild(status);

      // 個別削除ボタン
      const btnDel = document.createElement('button');
      btnDel.type = 'button';
      btnDel.className = 'sm danger';
      btnDel.style.cssText = 'padding:2px 6px;font-size:10px;margin-top:auto;cursor:pointer;';
      btnDel.innerHTML = '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg> 削除';
      btnDel.addEventListener('click', async e => {
        e.stopPropagation();
        if (item.isUsed) {
          const ok = await confirmModal('使用中画像の削除確認', `この画像は現在「${statusText}」で使用されています。\n削除するとプレビューや表示が消えますが、本当に削除しますか？`);
          if (!ok) return;
        }
        await Images.del(item.id);
        updateImageCacheSummary();
        renderImageManagerModal();
        redraw();
        renderLibrary();
        renderPopLibrary();
        toast('画像を削除しました');
      });
      card.appendChild(btnDel);

      // カードクリックでチェック切替
      card.addEventListener('click', () => {
        chk.checked = !chk.checked;
      });

      grid.appendChild(card);
    }
  }

  function initImageManager() {
    $('#btnManageImages')?.addEventListener('click', openImageManagerModal);
    $('#btnImageManagerClose')?.addEventListener('click', closeImageManagerModal);
    $('#btnImageManagerFootClose')?.addEventListener('click', closeImageManagerModal);
    $('#imageManagerModalBackdrop')?.addEventListener('click', e => {
      if (e.target === $('#imageManagerModalBackdrop')) closeImageManagerModal();
    });

    // 未使用を一括選択（サンプル保護画像は除外）
    $('#btnSelectUnusedImages')?.addEventListener('click', () => {
      const cbs = $$('.img-cache-check');
      cbs.forEach(cb => {
        cb.checked = (cb.dataset.used === 'false' && cb.dataset.sample !== 'true');
      });
    });

    // 全選択/解除
    $('#btnSelectAllImages')?.addEventListener('click', () => {
      const cbs = $$('.img-cache-check');
      const allChecked = cbs.length > 0 && cbs.every(cb => cb.checked);
      cbs.forEach(cb => { cb.checked = !allChecked; });
    });

    // 選択した画像を削除
    $('#btnDeleteSelectedImages')?.addEventListener('click', async () => {
      const checkedBoxes = $$('.img-cache-check').filter(cb => cb.checked);
      if (checkedBoxes.length === 0) {
        toast('削除する画像が選択されていません');
        return;
      }
      const hasUsed = checkedBoxes.some(cb => cb.dataset.used === 'true');
      if (hasUsed) {
        const ok = await confirmModal('使用中画像の削除確認', '選択された画像の中に使用中の画像が含まれています。\n削除するとプレビューや表示が消えますが、本当に削除しますか？');
        if (!ok) return;
      }
      for (const cb of checkedBoxes) {
        const id = cb.dataset.imgId;
        if (id) await Images.del(id);
      }
      updateImageCacheSummary();
      renderImageManagerModal();
      redraw();
      renderLibrary();
      renderPopLibrary();
      toast(`${checkedBoxes.length}件の画像を削除しました`, 'success');
    });

    // 未使用画像を削除（確認ダイアログ付き＋サンプル保護＋Undo履歴保護）
    $('#btnPurgeUnusedImages')?.addEventListener('click', async () => {
      const usedIdSet = new Set(Images.getUsedIds(state));
      [...undoStack, ...redoStack].forEach(json => {
        try {
          const s = JSON.parse(json);
          Images.getUsedIds(s).forEach(id => usedIdSet.add(id));
        } catch (e) {}
      });
      const usedIds = Array.from(usedIdSet);
      const { list } = Images.getStats(usedIds);
      const targetUnusedCount = list.filter(x => !x.isUsed && !x.isSample).length;
      if (targetUnusedCount === 0) {
        toast('削除対象の未使用画像はありません');
        return;
      }
      const ok = await confirmModal('未使用画像の削除', '現在使用されていないキャッシュ画像を削除しますか？\n（デフォルトのサンプル用画像は削除対象外です）');
      if (!ok) return;

      const count = await Images.purgeUnused(usedIds);
      updateImageCacheSummary();
      renderImageManagerModal();
      if (count > 0) {
        toast(`${count}件の未使用画像を削除しました`, 'success');
      } else {
        toast('削除対象の未使用画像はありません');
      }
    });
  }

  function initPopHandlers() {
    let lastColoredPopBg = '';
    let lastColoredPopText = '';

    $('#popStyleInput')?.addEventListener('change', e => {
      const val = e.target.value;
      const bgInp = $('#popBgColorInput');
      const txtInp = $('#popTextColorInput');
      const defPopBg = state.style?.accent || (getActiveColorMode() === 'classic' ? '#e4007f' : '#ff4b00');
      const curBg = (bgInp?.value || '').toLowerCase();
      const curTxt = (txtInp?.value || '').toLowerCase();

      if (curBg && curBg !== '#ffffff' && curBg !== '#161616') {
        lastColoredPopBg = curBg;
      }
      if (curTxt && curTxt !== '#111111' && curTxt !== '#111827') {
        lastColoredPopText = curTxt;
      }

      if (val === 'simple_white') {
        if (bgInp) bgInp.value = '#ffffff';
        if (txtInp) txtInp.value = '#111111';
      } else if (val === 'simple_black') {
        if (bgInp) bgInp.value = '#161616';
        if (txtInp) txtInp.value = '#ffffff';
      } else if (val === 'glass') {
        if (bgInp && (curBg === '#ffffff' || curBg === '#161616')) {
          bgInp.value = lastColoredPopBg || defPopBg;
        }
        if (txtInp) txtInp.value = '#111827';
      } else {
        if (bgInp && (curBg === '#ffffff' || curBg === '#161616')) {
          bgInp.value = lastColoredPopBg || defPopBg;
        }
        if (txtInp && (curTxt === '#111111' || curTxt === '#111827')) {
          txtInp.value = lastColoredPopText || '#ffffff';
        }
      }
      updatePopTailVisibility();
      updatePopLivePreview();
    });

    $('#popBubble')?.addEventListener('change', () => {
      updatePopTailVisibility();
      updatePopLivePreview();
    });

    $('#popTextPos')?.addEventListener('change', () => {
      updatePopTailVisibility();
      updatePopLivePreview();
    });

    $('#btnOpenNewPop')?.addEventListener('click', () => openPopModal(null));
    $('#btnPopModalClose')?.addEventListener('click', closePopModal);
    $('#btnPopModalCancel')?.addEventListener('click', closePopModal);

    $('#btnPopClear')?.addEventListener('click', () => {
      $('#popTitleInput').value = '';
      $('#popTitleFitInput').value = 'condense1';
      $('#popSubInput').value = '';
      pendingPopImageId = null;
      if ($('#popImgScale')) { $('#popImgScale').value = 100; $('#popImgScaleVal').textContent = '100%'; }
      if ($('#popImgX')) { $('#popImgX').value = 0; $('#popImgXVal').textContent = '0%'; }
      if ($('#popImgY')) { $('#popImgY').value = 0; $('#popImgYVal').textContent = '0%'; }
      if ($('#popShowBg')) { $('#popShowBg').checked = true; }
      if ($('#popBubble')) { $('#popBubble').value = 'round'; }
      if ($('#popTextPos')) { $('#popTextPos').value = 'bottom'; }
      if ($('#popTailDir')) { $('#popTailDir').value = 'auto'; }
      if ($('#popTailPos')) { $('#popTailPos').value = 35; if ($('#popTailPosVal')) $('#popTailPosVal').textContent = '35%'; }
      if ($('#popTextX')) { $('#popTextX').value = 0; $('#popTextXVal').textContent = '0%'; }
      if ($('#popTextY')) { $('#popTextY').value = 0; $('#popTextYVal').textContent = '0%'; }
      updatePopImageModalPreview();
      updatePopTailVisibility();
      updatePopLivePreview();
    });

    $('#popModalBackdrop')?.addEventListener('click', e => {
      if (e.target === $('#popModalBackdrop')) closePopModal();
    });

    // スライダー値表示リアルタイム連動
    $('#popImgScale')?.addEventListener('input', e => {
      if ($('#popImgScaleVal')) $('#popImgScaleVal').textContent = e.target.value + '%';
    });
    $('#popImgX')?.addEventListener('input', e => {
      if ($('#popImgXVal')) $('#popImgXVal').textContent = e.target.value + '%';
    });
    $('#popImgY')?.addEventListener('input', e => {
      if ($('#popImgYVal')) $('#popImgYVal').textContent = e.target.value + '%';
    });
    $('#popTextX')?.addEventListener('input', e => {
      if ($('#popTextXVal')) $('#popTextXVal').textContent = e.target.value + '%';
      updatePopTailVisibility();
    });
    $('#popTextY')?.addEventListener('input', e => {
      if ($('#popTextYVal')) $('#popTextYVal').textContent = e.target.value + '%';
      updatePopTailVisibility();
    });
    $('#popTailPos')?.addEventListener('input', e => {
      if ($('#popTailPosVal')) $('#popTailPosVal').textContent = e.target.value + '%';
    });

    // 画像選択＆ドラッグ＆ドロップ (Ver.0.29)
    const popFileInput = $('#popImgFile');
    const selectFile = () => popFileInput?.click();
    $('#btnPopImgSelect')?.addEventListener('click', selectFile);
    $('#btnPopImgChange')?.addEventListener('click', selectFile);

    $('#btnPopImgClear')?.addEventListener('click', () => {
      pendingPopImageId = null;
      if (popFileInput) popFileInput.value = '';
      updatePopImageModalPreview();
      updatePopTailVisibility();
      updatePopLivePreview();
    });

    async function handlePopImageFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      try {
        const dUrl = await Images.resizeFile(file, 1600);
        const imgId = await Images.put(dUrl);
        pendingPopImageId = imgId;
        updatePopImageModalPreview();
        updatePopTailVisibility();
        updatePopLivePreview();
        updateImageCacheSummary();
        toast('POP画像を読み込みました', 'success');
      } catch (err) {
        console.error('handlePopImageFile error:', err);
        toast('画像の読み込みに失敗しました');
      }
    }

    popFileInput?.addEventListener('change', async e => {
      const file = e.target.files?.[0];
      if (file) await handlePopImageFile(file);
    });

    const dropZone = $('#popImgDropZone');
    if (dropZone) {
      dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
      dropZone.addEventListener('drop', async e => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files?.[0];
        if (file) await handlePopImageFile(file);
      });
    }

    // カラープリセット
    $('#popBgPresetSelect')?.addEventListener('change', e => {
      if (e.target.value) {
        $('#popBgColorInput').value = e.target.value;
        e.target.value = '';
        updatePopLivePreview();
      }
    });
    $('#popTextPresetSelect')?.addEventListener('change', e => {
      if (e.target.value) {
        $('#popTextColorInput').value = e.target.value;
        e.target.value = '';
        updatePopLivePreview();
      }
    });

    // 全POP入力コントロールのリアルタイムプレビュー連動 (Ver.0.31)
    const popInputSelectors = [
      '#popTitleInput', '#popTitleFitInput', '#popSubInput', '#popStyleInput',
      '#popBgColorInput', '#popTextColorInput', '#popImgScale', '#popImgX',
      '#popImgY', '#popShowBg', '#popBubble', '#popTextPos', '#popTextX', '#popTextY', '#popTailDir', '#popTailPos'
    ];
    popInputSelectors.forEach(sel => {
      const el = $(sel);
      if (!el) return;
      el.addEventListener('input', updatePopLivePreview);
      el.addEventListener('change', updatePopLivePreview);
    });

    // POPプレビューCanvas ドラッグ位置調整 (Ver.0.31)
    const previewCanvas = $('#popPreviewCanvas');
    if (previewCanvas) {
      let isDragging = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let startValX = 0;
      let startValY = 0;
      let dragTarget = 'image';

      previewCanvas.addEventListener('mousedown', e => {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        const isShift = e.shiftKey;
        if (pendingPopImageId && !isShift) {
          dragTarget = 'image';
          startValX = Number($('#popImgX')?.value) || 0;
          startValY = Number($('#popImgY')?.value) || 0;
        } else {
          dragTarget = 'text';
          startValX = Number($('#popTextX')?.value) || 0;
          startValY = Number($('#popTextY')?.value) || 0;
        }
        e.preventDefault();
      });

      window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const rect = previewCanvas.getBoundingClientRect();
        const scaleX = previewCanvas.width / (rect.width || 1);
        const scaleY = previewCanvas.height / (rect.height || 1);
        const dx = (e.clientX - dragStartX) * scaleX;
        const dy = (e.clientY - dragStartY) * scaleY;

        // プレビューCanvasのパディング（pad = 12）を除いた実カード幅・高さを基準に移動率を計算 (Ver.0.69)
        const cardW = Math.max(10, previewCanvas.width - 24);
        const cardH = Math.max(10, previewCanvas.height - 24);
        // render.js での画像オフセット係数は 0.5、テキストオフセット係数は 0.4
        const factor = dragTarget === 'image' ? 0.5 : 0.4;
        const pctDx = Math.round((dx / (cardW * factor)) * 100);
        const pctDy = Math.round((dy / (cardH * factor)) * 100);

        const nextX = Math.max(-100, Math.min(100, startValX + pctDx));
        const nextY = Math.max(-100, Math.min(100, startValY + pctDy));

        if (dragTarget === 'image') {
          const xInput = $('#popImgX');
          const yInput = $('#popImgY');
          if (xInput) { xInput.value = nextX; $('#popImgXVal').textContent = nextX + '%'; }
          if (yInput) { yInput.value = nextY; $('#popImgYVal').textContent = nextY + '%'; }
        } else {
          const xInput = $('#popTextX');
          const yInput = $('#popTextY');
          if (xInput) { xInput.value = nextX; $('#popTextXVal').textContent = nextX + '%'; }
          if (yInput) { yInput.value = nextY; $('#popTextYVal').textContent = nextY + '%'; }
          updatePopTailVisibility();
        }

        updatePopLivePreview();
      });

      const stopDrag = () => { isDragging = false; };
      window.addEventListener('mouseup', stopDrag);

      // マウスホイールでの拡大・縮小 (Ver.0.32)
      previewCanvas.addEventListener('wheel', e => {
        e.preventDefault();
        const scaleInput = $('#popImgScale');
        if (!scaleInput) return;
        const current = Number(scaleInput.value) || 100;
        const delta = e.deltaY < 0 ? 5 : -5;
        const next = Math.max(20, Math.min(400, current + delta));
        scaleInput.value = next;
        const valLabel = $('#popImgScaleVal');
        if (valLabel) valLabel.textContent = next + '%';
        updatePopLivePreview();
      }, { passive: false });
    }

    // 保存ボタン
    $('#btnPopSave')?.addEventListener('click', async () => {
      const defPopBg = state.style?.accent || (getActiveColorMode() === 'classic' ? '#e4007f' : '#ff4b00');
      const rawTitle = $('#popTitleInput')?.value.trim() || '';
      const title = rawTitle || (pendingPopImageId ? '' : 'おすすめPOP！');
      const titleFit = $('#popTitleFitInput')?.value || 'condense1';
      const sub = $('#popSubInput')?.value.trim() || '';
      const style = $('#popStyleInput')?.value || 'burst';
      const bgColor = $('#popBgColorInput')?.value || defPopBg;
      const textColor = $('#popTextColorInput')?.value || '#ffffff';
      const autoPlace = $('#popAutoPlace')?.checked !== false;

      // Ver.0.29 拡張プロパティ
      const imageId = pendingPopImageId || '';
      const imgScale = Number.isFinite(Number($('#popImgScale')?.value)) ? Number($('#popImgScale')?.value) : 100;
      const imgX = Number.isFinite(Number($('#popImgX')?.value)) ? Number($('#popImgX')?.value) : 0;
      const imgY = Number.isFinite(Number($('#popImgY')?.value)) ? Number($('#popImgY')?.value) : 0;
      const showBg = $('#popShowBg')?.checked !== false;
      const bubble = $('#popBubble')?.value || 'round';
      const textPos = $('#popTextPos')?.value || 'bottom';
      const tailDir = $('#popTailDir')?.value || 'auto';
      const tailPos = Number.isFinite(Number($('#popTailPos')?.value)) ? Number($('#popTailPos')?.value) : 35;
      const textX = Number.isFinite(Number($('#popTextX')?.value)) ? Number($('#popTextX')?.value) : 0;
      const textY = Number.isFinite(Number($('#popTextY')?.value)) ? Number($('#popTextY')?.value) : 0;

      if (!state.pops) state.pops = [];

      if (editingPopId) {
        const p = state.pops.find(x => x.id === editingPopId);
        if (p) {
          p.title = title;
          p.titleFit = titleFit;
          p.sub = sub;
          p.style = style;
          p.bgColor = bgColor;
          p.textColor = textColor;
          p.imageId = imageId;
          p.imgScale = imgScale;
          p.imgX = imgX;
          p.imgY = imgY;
          p.showBg = showBg;
          p.bubble = bubble;
          p.textPos = textPos;
          p.textX = textX;
          p.textY = textY;
          p.tailDir = tailDir;
          p.tailPos = tailPos;
        }
        toast(`POP「${(title || '（画像POP）').split('\n')[0]}」を更新しました`);
      } else {
        const id = 'pop_' + uid();
        state.pops.push({
          id, title, sub, style, bgColor, textColor, titleFit,
          imageId, imgScale, imgX, imgY, showBg, bubble, textPos, textX, textY, tailDir, tailPos
        });
        if (autoPlace) {
          const pUid = 'p_' + uid();
          state.placed.push({ uid: pUid, itemId: id, size: 2, label: 'none', labelText: '', labelColor: '' });
          selectedPlacedUid = pUid;
          toast(`POP「${(title || '（画像POP）').split('\n')[0]}」を作成してお品書きに配置しました`);
        } else {
          toast(`POP「${(title || '（画像POP）').split('\n')[0]}」を作成しました（未配置）`);
        }
      }

      closePopModal();
      await saveState();
      renderPopLibrary();
      renderPlacedBar();
      updateImageCacheSummary();
      redraw();
    });
  }

  /* ---------- 下部：配置中アイテムインスペクタバー ---------- */
  function renderPlacedBar() {
    const entries = Render.entries(state);
    $('#placedCount').textContent = `(${entries.length}枠)`;
    const chipsBox = $('#placedChips');
    const isShowChips = Boolean($('#chkShowPlacedChips')?.checked);
    chipsBox.style.display = isShowChips ? 'flex' : 'none';
    chipsBox.innerHTML = '';

    if (selectedPlacedUid && !entries.some(e => e.placed.uid === selectedPlacedUid)) {
      selectedPlacedUid = entries[0]?.placed.uid || null;
    }

    for (const { placed, item, isSpacer } of entries) {
      const chip = document.createElement('div');
      chip.className = 'placed-chip' + (placed.uid === selectedPlacedUid ? ' active' : '');
      const lbl = Render.resolveLabel(placed, state.labelColors);
      const subLbl = Render.resolveSubLabel ? Render.resolveSubLabel(placed, state.subLabelColors) : null;
      const sizeName = SIZES[placed.size || 1] || '標準';
      let badgeTxt = esc(sizeName);
      if (lbl && !isSpacer) badgeTxt += '・' + esc(lbl.text);
      if (subLbl && !isSpacer) badgeTxt += '・' + esc(subLbl.text);
      chip.innerHTML = `
        <span>${esc(item.name)}</span>
        <span class="badge">${badgeTxt}</span>
      `;
      chip.addEventListener('click', () => {
        selectedPlacedUid = placed.uid;
        renderPlacedBar();
        redraw();
      });
      chipsBox.appendChild(chip);
    }

    const bar = $('#inspectorBar');
    const cur = entries.find(e => e.placed.uid === selectedPlacedUid);
    if (!cur) {
      bar.style.display = 'none';
      return;
    }
    bar.style.display = 'flex';
    $('#inspItemName').textContent = cur.item.name;
    $('#inspSize').value = String(cur.placed.size || 1);

    const isSpacer = cur.isSpacer || cur.placed.itemId === 'spacer' || String(cur.placed.itemId).startsWith('spacer');
    const isPop = cur.isPop || String(cur.placed.itemId).startsWith('pop_');
    const showLabels = !isSpacer && !isPop;

    if ($('#inspLabelGrp')) $('#inspLabelGrp').style.display = showLabels ? 'inline-flex' : 'none';
    if ($('#inspLabelColor')) $('#inspLabelColor').style.display = showLabels ? 'inline-block' : 'none';
    if ($('#inspSubLabelGrp')) $('#inspSubLabelGrp').style.display = showLabels ? 'inline-flex' : 'none';
    if ($('#inspSubLabelColor')) $('#inspSubLabelColor').style.display = showLabels ? 'inline-block' : 'none';

    if (showLabels) {
      const modeDef = COLOR_MODES[getActiveColorMode()] || COLOR_MODES.classic;
      $('#inspLabel').value = cur.placed.label || 'none';
      $('#inspLabelText').style.display = ['custom', 'custom_b', 'custom_c'].includes(cur.placed.label) ? 'inline-block' : 'none';
      $('#inspLabelText').value = cur.placed.labelText || '';
      const presetColor = state.labelColors?.[cur.placed.label] || modeDef.labelColors?.[cur.placed.label] || (LABELS[cur.placed.label] || LABELS.new).color;
      $('#inspLabelColor').value = cur.placed.labelColor || presetColor || '#ff4b00';

      if ($('#inspSubLabel')) {
        let curSub = cur.placed.subLabel;
        if ((!curSub || curSub === 'none') && (cur.placed.label === 'r15' || cur.placed.label === 'r18')) {
          curSub = cur.placed.label;
        }
        curSub = curSub || 'none';
        $('#inspSubLabel').value = curSub;
        $('#inspSubLabelText').style.display = ['custom_x', 'custom_y', 'custom_z'].includes(curSub) ? 'inline-block' : 'none';
        $('#inspSubLabelText').value = cur.placed.subLabelText || '';
        const subDef = (window.SUB_LABELS || {})[curSub];
        const subPresetColor = state.subLabelColors?.[curSub] || modeDef.subLabelColors?.[curSub] || (subDef ? subDef.color : '#ff4b00');
        $('#inspSubLabelColor').value = cur.placed.subLabelColor || subPresetColor || '#ff4b00';
      }
    } else {
      $('#inspLabelText').style.display = 'none';
      if ($('#inspSubLabelText')) $('#inspSubLabelText').style.display = 'none';
    }
  }

  $('#inspSize').addEventListener('change', async e => {
    const p = state.placed.find(x => x.uid === selectedPlacedUid);
    if (!p) return;
    p.size = Number(e.target.value) || 1;
    await saveState();
    renderPlacedBar();
    redraw();
  });

  $('#inspLabel').addEventListener('change', async e => {
    const p = state.placed.find(x => x.uid === selectedPlacedUid);
    if (!p) return;
    p.label = e.target.value;
    p.labelColor = '';
    await saveState();
    renderPlacedBar();
    redraw();
  });

  $('#inspLabelText').addEventListener('input', async e => {
    const p = state.placed.find(x => x.uid === selectedPlacedUid);
    if (!p) return;
    p.labelText = e.target.value;
    await saveState();
    renderPlacedBar();
    redraw();
  });

  $('#inspLabelColor').addEventListener('input', async e => {
    const p = state.placed.find(x => x.uid === selectedPlacedUid);
    if (!p) return;
    p.labelColor = e.target.value;
    await saveState();
    redraw();
  });

  $('#inspSubLabel')?.addEventListener('change', async e => {
    const p = state.placed.find(x => x.uid === selectedPlacedUid);
    if (!p) return;
    p.subLabel = e.target.value;
    p.subLabelColor = '';
    await saveState();
    renderPlacedBar();
    redraw();
  });

  $('#inspSubLabelText')?.addEventListener('input', async e => {
    const p = state.placed.find(x => x.uid === selectedPlacedUid);
    if (!p) return;
    p.subLabelText = e.target.value;
    await saveState();
    renderPlacedBar();
    redraw();
  });

  $('#inspSubLabelColor')?.addEventListener('input', async e => {
    const p = state.placed.find(x => x.uid === selectedPlacedUid);
    if (!p) return;
    p.subLabelColor = e.target.value;
    await saveState();
    redraw();
  });

  $('#btnMovePrev').addEventListener('click', async () => {
    const idx = state.placed.findIndex(x => x.uid === selectedPlacedUid);
    if (idx > 0) {
      const [sp] = state.placed.splice(idx, 1);
      state.placed.splice(idx - 1, 0, sp);
      await saveState();
      renderPlacedBar();
      redraw();
    }
  });

  $('#btnMoveNext').addEventListener('click', async () => {
    const idx = state.placed.findIndex(x => x.uid === selectedPlacedUid);
    if (idx >= 0 && idx < state.placed.length - 1) {
      const [sp] = state.placed.splice(idx, 1);
      state.placed.splice(idx + 1, 0, sp);
      await saveState();
      renderPlacedBar();
      redraw();
    }
  });

  $('#btnRemovePlaced').addEventListener('click', async () => {
    if (!selectedPlacedUid) return;
    state.placed = state.placed.filter(x => x.uid !== selectedPlacedUid);
    selectedPlacedUid = state.placed[0]?.uid || null;

    await saveState();
    renderLibrary();
    renderPopLibrary();
    renderPlacedBar();
    redraw();
  });

  /* ---------- 右カラム：タブ切替＆各設定バインディング ---------- */
  $$('.rtab').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.rtab').forEach(b => b.classList.remove('active'));
      $$('.rtab-body').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      $('#' + btn.dataset.tab).classList.add('active');
    });
  });

  // プリセット＆任意サイズ
  $('#selPreset').addEventListener('change', async e => {
    const id = e.target.value;
    state.canvas.preset = id;
    const p = PRESETS.find(x => x.id === id);
    if (p && p.w && p.h) {
      state.canvas.width = p.w;
      state.canvas.height = p.h;
    }
    syncFormFromState();
    await saveState();
    redraw();
  });

  const onCustomSizeChange = async () => {
    state.canvas.preset = 'custom';
    state.canvas.width = Math.max(400, Math.min(4096, Number($('#inpCanvasW').value) || 1920));
    state.canvas.height = Math.max(400, Math.min(4096, Number($('#inpCanvasH').value) || 1080));
    syncFormFromState();
    await saveState();
    redraw();
  };
  $('#inpCanvasW').addEventListener('change', onCustomSizeChange);
  $('#inpCanvasH').addEventListener('change', onCustomSizeChange);

  // 色調設定（CUD / クラシック）一括切替 (Ver.0.61)
  async function applyColorMode(mode) {
    const targetMode = mode === 'classic' ? 'classic' : 'cud';
    const prevMode = targetMode === 'classic' ? 'cud' : 'classic';
    const modeDef = COLOR_MODES[targetMode];
    const prevDef = COLOR_MODES[prevMode];
    if (!modeDef) return;

    state.style.colorMode = targetMode;
    const themeKey = state.style.theme || 'cool';
    const t = modeDef.themes[themeKey] || modeDef.themes.cool;
    if (t) {
      state.style.theme = themeKey;
      const keepImgId = state.bg.imageId;
      const keepType = state.bg.type === 'image' ? 'image' : t.bg.type;
      Object.assign(state.bg, structuredClone(t.bg));
      state.bg.borderColor = t.bg.borderColor || t.style.accent || state.bg.borderColor;
      if (keepImgId) {
        state.bg.imageId = keepImgId;
        state.bg.type = keepType;
      }
      const keepHFont = state.style.headingFont;
      const keepBFont = state.style.bodyFont;
      Object.assign(state.style, structuredClone(t.style));
      if (keepHFont) state.style.headingFont = keepHFont;
      if (keepBFont) state.style.bodyFont = keepBFont;
      state.style.colorMode = targetMode;
    }

    // ラベル・サブLカラーの切替
    state.labelColors = structuredClone(modeDef.labelColors);
    state.subLabelColors = structuredClone(modeDef.subLabelColors);

    // ジャンルカラーの切替
    if (!state.genreColors) state.genreColors = {};
    for (const [g, col] of Object.entries(modeDef.genreColors)) {
      state.genreColors[g] = col;
    }
    if (Array.isArray(state.genres)) {
      for (const g of state.genres) {
        if (!modeDef.genreColors[g]) {
          state.genreColors[g] = Render.getGenreColor(g, state.style.accent, { style: { colorMode: targetMode } });
        }
      }
    }

    // サンプルPOPの色も未変更なら切替
    if (Array.isArray(state.pops)) {
      for (const pop of state.pops) {
        const targetSamplePop = modeDef.pops.find(sp => sp.id === pop.id);
        const prevSamplePop = prevDef.pops.find(sp => sp.id === pop.id);
        if (targetSamplePop && (!prevSamplePop || pop.bgColor === prevSamplePop.bgColor)) {
          pop.bgColor = targetSamplePop.bgColor;
          pop.textColor = targetSamplePop.textColor;
        }
      }
    }

    // サンプル書影の再生成
    await generateCommonCovers(targetMode);

    syncFormFromState();
    renderGenreOptions();
    renderLabelColorSettings();
    renderLibrary();
    renderPopLibrary();
    renderPlacedBar();
    await saveState();
    redraw();
    const labelText = targetMode === 'classic'
      ? 'クラシック（CUD非対応）'
      : 'カラーユニバーサルデザイン（CUD対応）';
    toast(`色調設定を「${labelText}」に切り替えました`, 'success');
  }

  $('#selColorMode')?.addEventListener('change', async e => {
    await applyColorMode(e.target.value);
  });

  // テーマ一括適用
  $('#selThemeQuick').addEventListener('change', async e => {
    const k = e.target.value;
    const curMode = getActiveColorMode();
    const themes = getActiveThemes();
    const t = themes[k];
    if (!t) return;
    state.style.theme = k;
    Object.assign(state.bg, structuredClone(t.bg));
    state.bg.borderColor = t.bg.borderColor || t.style.accent || state.bg.borderColor;
    state.bg.imageId = '';
    Object.assign(state.style, structuredClone(t.style));
    state.style.colorMode = curMode;
    syncFormFromState();
    await saveState();
    updateImageCacheSummary();
    redraw();
    toast(`テーマ「${t.name}」を適用しました`);
  });

  // デザインタブの各セクション「デフォルトに戻す」ボタン (Ver.0.27)
  $('#btnResetFontSettings')?.addEventListener('click', async () => {
    const ok = await confirmModal('設定のリセット', '「フォント設定」の設定を初期値（デフォルト）に戻しますか？');
    if (!ok) return;
    state.style.headingFont = DEFAULT.style.headingFont;
    state.style.bodyFont = DEFAULT.style.bodyFont;
    syncFormFromState();
    await saveState();
    redraw();
    toast('「フォント設定」を初期値に戻しました', 'success');
  });

  function resetLabelCustomizeParams() {
    state.layout.labelPosition = DEFAULT.layout.labelPosition;
    state.layout.labelScale = DEFAULT.layout.labelScale;
    state.layout.labelTextScale = DEFAULT.layout.labelTextScale;
    state.layout.labelAngle = DEFAULT.layout.labelAngle;
    state.layout.labelBorder = DEFAULT.layout.labelBorder;
    state.layout.labelBorderWidth = DEFAULT.layout.labelBorderWidth;
    state.layout.labelShadow = DEFAULT.layout.labelShadow;
  }

  $('#btnResetLabelCustomize')?.addEventListener('click', async () => {
    resetLabelCustomizeParams();
    syncFormFromState();
    await saveState();
    redraw();
    toast('ラベル形状のカスタマイズ設定を標準に戻しました', 'success');
  });

  $('#btnResetItemSettings')?.addEventListener('click', async () => {
    const ok = await confirmModal('設定のリセット', '「書名・頒価・項目設定」の設定をすべて初期値（デフォルト）に戻しますか？');
    if (!ok) return;
    const modeDef = COLOR_MODES[getActiveColorMode()] || COLOR_MODES.classic;
    state.layout.textScale = DEFAULT.layout.textScale;
    state.layout.labelStyle = DEFAULT.layout.labelStyle;
    resetLabelCustomizeParams();
    state.layout.showTitle = DEFAULT.layout.showTitle;
    state.layout.titleFit = DEFAULT.layout.titleFit;
    state.layout.titleScale = DEFAULT.layout.titleScale;
    state.layout.priceStyle = DEFAULT.layout.priceStyle;
    state.layout.priceTextScale = DEFAULT.layout.priceTextScale;
    state.layout.priceScale = DEFAULT.layout.priceScale;
    state.layout.showGenre = DEFAULT.layout.showGenre;
    state.layout.showDate = DEFAULT.layout.showDate;
    state.layout.metaScale = DEFAULT.layout.metaScale;
    state.layout.showSpec = DEFAULT.layout.showSpec;
    state.layout.specScale = DEFAULT.layout.specScale;
    state.labelColors = structuredClone(modeDef.labelColors);
    state.subLabelColors = structuredClone(modeDef.subLabelColors);
    syncFormFromState();
    renderLabelColorSettings();
    await saveState();
    redraw();
    toast('「書名・頒価・項目設定」を初期値に戻しました', 'success');
  });

  $('#btnResetCardStyle')?.addEventListener('click', async () => {
    const ok = await confirmModal('設定のリセット', '「カード配色・影」の設定をすべて初期値（デフォルト）に戻しますか？');
    if (!ok) return;
    const themes = getActiveThemes();
    const curTheme = themes[state.style.theme] || themes.cool;
    state.style.accent = curTheme.style.accent;
    state.style.priceColor = curTheme.style.priceColor;
    state.style.cardBg = curTheme.style.cardBg;
    state.style.cardText = curTheme.style.cardText;
    state.style.cardOpacity = curTheme.style.cardOpacity;
    state.style.radius = curTheme.style.radius;
    state.style.shadow = curTheme.style.shadow;
    state.style.cardBorder = curTheme.style.cardBorder;
    syncFormFromState();
    await saveState();
    redraw();
    toast('「カード配色・影」を初期値に戻しました', 'success');
  });

  $('#btnResetBgSettings')?.addEventListener('click', async () => {
    const ok = await confirmModal('設定のリセット', '「全体背景設定」の設定をすべて初期値（デフォルト）に戻しますか？');
    if (!ok) return;
    const themes = getActiveThemes();
    const curTheme = themes[state.style.theme] || themes.cool;
    state.bg = Object.assign(structuredClone(DEFAULT.bg), structuredClone(curTheme.bg));
    state.bg.borderColor = curTheme.bg.borderColor || curTheme.style.accent || state.bg.borderColor;
    syncFormFromState();
    await saveState();
    updateImageCacheSummary();
    redraw();
    toast('「全体背景設定」を初期値に戻しました', 'success');
  });

  $('#btnResetLayoutSettings')?.addEventListener('click', async () => {
    const ok = await confirmModal('設定のリセット', 'チラシ全体レイアウト（カード縦横比・グループ・余白・パディング）の設定をデフォルトに戻しますか？');
    if (!ok) return;
    state.layout.cardAspect = DEFAULT.layout.cardAspect;
    state.layout.groupMode = DEFAULT.layout.groupMode;
    state.layout.gap = DEFAULT.layout.gap;
    state.layout.padding = DEFAULT.layout.padding;
    syncFormFromState();
    await saveState();
    redraw();
    toast('「チラシ全体レイアウト」を初期値に戻しました', 'success');
  });

  $('#btnResetHeaderSettings')?.addEventListener('click', async () => {
    const ok = await confirmModal('設定のリセット', '「ヘッダーデザイン・配色」の設定をすべて初期値（デフォルト）に戻しますか？');
    if (!ok) return;
    const themes = getActiveThemes();
    const curTheme = themes[state.style.theme] || themes.cool;
    state.layout.headerMode = DEFAULT.layout.headerMode;
    state.layout.headerLayout = DEFAULT.layout.headerLayout;
    state.layout.headerSpaceWidth = DEFAULT.layout.headerSpaceWidth;
    state.layout.headerSpaceScale = DEFAULT.layout.headerSpaceScale;
    state.layout.showHeaderSpaceBg = DEFAULT.layout.showHeaderSpaceBg;
    state.layout.showHeaderSpaceBorder = DEFAULT.layout.showHeaderSpaceBorder;
    state.layout.showHeaderPlace = DEFAULT.layout.showHeaderPlace;
    state.layout.showHeaderTime = DEFAULT.layout.showHeaderTime;
    state.layout.showHeaderEventBg = DEFAULT.layout.showHeaderEventBg;
    state.layout.headerWidth = DEFAULT.layout.headerWidth;
    state.layout.headerScale = DEFAULT.layout.headerScale;
    state.layout.headerEffect = DEFAULT.layout.headerEffect;
    state.layout.headerPanel = DEFAULT.layout.headerPanel;
    state.layout.headerRadius = DEFAULT.layout.headerRadius;
    state.style.headerText = curTheme.style.headerText;
    state.style.headerOutline = curTheme.style.headerOutline;
    state.style.headerPanelColor = curTheme.style.headerPanelColor;
    state.style.headerPanelOpacity = DEFAULT.style.headerPanelOpacity;
    syncFormFromState();
    await saveState();
    redraw();
    toast('「ヘッダーデザイン」を初期値に戻しました', 'success');
  });

  // 双方向バインディングヘルパー
  function bindInput(sel, section, key, transform = v => v) {
    const el = $(sel);
    if (!el) return;
    const evt = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, async () => {
      const raw = el.type === 'checkbox' ? el.checked : el.value;
      state[section][key] = transform(raw);
      syncFormFromState();
      await saveState();
      redraw();
    });
  }

  // Meta bindings
  bindInput('#mCircle', 'meta', 'circle');
  bindInput('#mEventName', 'meta', 'eventName');
  bindInput('#mPlace', 'meta', 'place');
  bindInput('#mTime', 'meta', 'time');
  bindInput('#mDate', 'meta', 'date');
  bindInput('#mSpace', 'meta', 'space');
  bindInput('#mTwoDays', 'meta', 'twoDays', Boolean);
  bindInput('#mDate2', 'meta', 'date2');
  bindInput('#mSpace2', 'meta', 'space2');


  function parseJaDateToIso(str) {
    if (!str) return '';
    const m = String(str).match(/(\d{4})[年/\-.](\d{1,2})[月/\-.](\d{1,2})/);
    if (!m) return '';
    const y = m[1];
    const mo = String(Number(m[2])).padStart(2, '0');
    const d = String(Number(m[3])).padStart(2, '0');
    return `${y}-${mo}-${d}`;
  }

  function formatDateToJaWithDay(val) {
    if (!val) return '';
    const d = new Date(val + 'T00:00:00');
    if (isNaN(d.getTime())) return val;
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const w = days[d.getDay()];
    return `${y}年${m}月${day}日(${w})`;
  }

  $('#mDatePick')?.addEventListener('click', e => {
    try { e.currentTarget.showPicker?.(); } catch (err) {}
  });
  $('#mDate2Pick')?.addEventListener('click', e => {
    try { e.currentTarget.showPicker?.(); } catch (err) {}
  });

  $('#btnClearDate')?.addEventListener('click', async () => {
    state.meta.date = '';
    if ($('#mDate')) $('#mDate').value = '';
    if ($('#mDatePick')) $('#mDatePick').value = '';
    await saveState();
    redraw();
  });

  $('#btnClearDate2')?.addEventListener('click', async () => {
    state.meta.date2 = '';
    if ($('#mDate2')) $('#mDate2').value = '';
    if ($('#mDate2Pick')) $('#mDate2Pick').value = '';
    await saveState();
    redraw();
  });

  $('#mDatePick')?.addEventListener('change', async e => {
    if (!e.target.value) return;
    const ja = formatDateToJaWithDay(e.target.value);
    state.meta.date = ja;
    if ($('#mDate')) $('#mDate').value = ja;
    await saveState();
    redraw();
  });
  $('#mDate2Pick')?.addEventListener('change', async e => {
    if (!e.target.value) return;
    const ja = formatDateToJaWithDay(e.target.value);
    state.meta.date2 = ja;
    if ($('#mDate2')) $('#mDate2').value = ja;
    await saveState();
    redraw();
  });
  // Layout & Header bindings
  bindInput('#lHeaderMode', 'layout', 'headerMode');
  $('#lHeaderLayout')?.addEventListener('change', async e => {
    const val = e.target.value;
    state.layout.headerLayout = val;
    const isSf = val === 'space_focus';
    if ($('#rowHeaderSpaceWidth')) $('#rowHeaderSpaceWidth').style.display = isSf ? 'flex' : 'none';
    if ($('#containerSpaceFocusOptions')) $('#containerSpaceFocusOptions').style.display = isSf ? 'flex' : 'none';
    syncFormFromState();
    await saveState();
    redraw();
  });
  bindInput('#lHeaderSpaceWidth', 'layout', 'headerSpaceWidth', Number);
  $('#lHeaderSpaceWidth')?.addEventListener('input', e => {
    if ($('#valHeaderSpaceWidth')) $('#valHeaderSpaceWidth').textContent = e.target.value + '%';
  });
  bindInput('#lHeaderSpaceScale', 'layout', 'headerSpaceScale', Number);
  $('#lHeaderSpaceScale')?.addEventListener('input', e => {
    if ($('#valHeaderSpaceScale')) $('#valHeaderSpaceScale').textContent = e.target.value + '%';
  });
  bindInput('#lShowHeaderSpaceBg', 'layout', 'showHeaderSpaceBg', Boolean);
  bindInput('#lShowHeaderSpaceBorder', 'layout', 'showHeaderSpaceBorder', Boolean);
  bindInput('#lShowHeaderPlace', 'layout', 'showHeaderPlace', Boolean);
  bindInput('#lShowHeaderTime', 'layout', 'showHeaderTime', Boolean);
  bindInput('#lShowHeaderEventBg', 'layout', 'showHeaderEventBg', Boolean);
  bindInput('#lHeaderRadius', 'layout', 'headerRadius', Number);
  $('#lHeaderRadius')?.addEventListener('input', e => {
    $('#valHeaderRadius').textContent = e.target.value;
  });
  bindInput('#lHeaderWidth', 'layout', 'headerWidth', Number);
  bindInput('#lHeaderScale', 'layout', 'headerScale', Number);
  bindInput('#lHeaderEffect', 'layout', 'headerEffect');
  bindInput('#lHeaderPanel', 'layout', 'headerPanel', Boolean);
  bindInput('#sHeaderText', 'style', 'headerText');
  bindInput('#sHeaderOutline', 'style', 'headerOutline');
  bindInput('#sHeaderPanelColor', 'style', 'headerPanelColor');

  bindInput('#lCardAspect', 'layout', 'cardAspect', Number);
  bindInput('#lGroupMode', 'layout', 'groupMode');
  bindInput('#lGap', 'layout', 'gap', Number);
  bindInput('#lPadding', 'layout', 'padding', Number);
  bindInput('#lTextScale', 'layout', 'textScale', Number);
  bindInput('#lPriceScale', 'layout', 'priceScale', Number);
  bindInput('#lTitleScale', 'layout', 'titleScale', Number);
  bindInput('#lPriceTextScale', 'layout', 'priceTextScale', Number);
  bindInput('#lMetaScale', 'layout', 'metaScale', Number);
  bindInput('#lSpecScale', 'layout', 'specScale', Number);
  bindInput('#lTitleFit', 'layout', 'titleFit');
  bindInput('#lShowTitle', 'layout', 'showTitle', Boolean);
  bindInput('#lPriceStyle', 'layout', 'priceStyle');
  bindInput('#lLabelStyle', 'layout', 'labelStyle');
  bindInput('#lLabelPosition', 'layout', 'labelPosition');
  bindInput('#lLabelScale', 'layout', 'labelScale', Number);
  bindInput('#lLabelTextScale', 'layout', 'labelTextScale', Number);
  bindInput('#lLabelAngle', 'layout', 'labelAngle', Number);
  bindInput('#lLabelBorder', 'layout', 'labelBorder');
  bindInput('#lLabelBorderWidth', 'layout', 'labelBorderWidth', Number);
  bindInput('#lLabelShadow', 'layout', 'labelShadow', Boolean);
  bindInput('#lShowGenre', 'layout', 'showGenre', Boolean);
  bindInput('#lShowDate', 'layout', 'showDate', Boolean);
  bindInput('#lShowSpec', 'layout', 'showSpec', Boolean);
  bindInput('#sShadow', 'style', 'shadow', Boolean);

  // Style bindings
  bindInput('#sHeadingFont', 'style', 'headingFont');
  bindInput('#sBodyFont', 'style', 'bodyFont');
  bindInput('#sAccent', 'style', 'accent');
  bindInput('#sPriceColor', 'style', 'priceColor');
  bindInput('#sCardBg', 'style', 'cardBg');
  bindInput('#sCardText', 'style', 'cardText');
  bindInput('#sCardOpacity', 'style', 'cardOpacity', Number);
  bindInput('#sRadius', 'style', 'radius', Number);
  bindInput('#sCardBorder', 'style', 'cardBorder', Boolean);
  bindInput('#sHeaderPanelOpacity', 'style', 'headerPanelOpacity', Number);
  $('#sHeaderPanelOpacity')?.addEventListener('input', e => {
    if ($('#valHeaderPanelOpacity')) $('#valHeaderPanelOpacity').textContent = Math.round(Number(e.target.value) * 100) + '%';
  });

  // Background bindings
  $('#bType')?.addEventListener('change', async e => {
    const val = e.target.value;
    state.bg.type = val;
    if (val !== 'image' && state.bg.imageId) {
      state.bg.imageId = '';
    }
    syncFormFromState();
    await saveState();
    updateImageCacheSummary();
    redraw();
  });
  bindInput('#bColor1', 'bg', 'color1');
  bindInput('#bColor2', 'bg', 'color2');
  bindInput('#bAngle', 'bg', 'angle', Number);
  $('#bAngle')?.addEventListener('input', e => {
    if ($('#valBgAngle')) $('#valBgAngle').textContent = e.target.value + '°';
  });
  bindInput('#bImageFit', 'bg', 'imageFit');
  bindInput('#bImageScale', 'bg', 'imageScale', Number);
  $('#bImageScale')?.addEventListener('input', e => {
    if ($('#valImageScale')) $('#valImageScale').textContent = e.target.value + '%';
  });
  bindInput('#bImageX', 'bg', 'imageX', Number);
  $('#bImageX')?.addEventListener('input', e => {
    if ($('#valImageX')) $('#valImageX').textContent = e.target.value + '%';
  });
  bindInput('#bImageY', 'bg', 'imageY', Number);
  $('#bImageY')?.addEventListener('input', e => {
    if ($('#valImageY')) $('#valImageY').textContent = e.target.value + '%';
  });
  bindInput('#bImageBlur', 'bg', 'imageBlur', Number);
  $('#bImageBlur')?.addEventListener('input', e => {
    if ($('#valImageBlur')) $('#valImageBlur').textContent = e.target.value + 'px';
  });
  bindInput('#bImageOpacity', 'bg', 'imageOpacity', Number);
  $('#bImageOpacity')?.addEventListener('input', e => {
    if ($('#valImageOpacity')) $('#valImageOpacity').textContent = Math.round(Number(e.target.value) * 100) + '%';
  });
  bindInput('#bPattern', 'bg', 'pattern');
  bindInput('#bPatternSize', 'bg', 'patternSize', Number);
  $('#bPatternSize')?.addEventListener('input', e => {
    if ($('#valPatternSize')) $('#valPatternSize').textContent = e.target.value;
  });
  bindInput('#bPatternColor', 'bg', 'patternColor');
  bindInput('#bPatternOpacity', 'bg', 'patternOpacity', Number);
  $('#bPatternOpacity')?.addEventListener('input', e => {
    if ($('#valBgPatternOpacity')) $('#valBgPatternOpacity').textContent = Math.round(Number(e.target.value) * 100) + '%';
  });
  bindInput('#bOverlayColor', 'bg', 'overlayColor');
  bindInput('#bOverlayOpacity', 'bg', 'overlayOpacity', Number);
  $('#bOverlayOpacity')?.addEventListener('input', e => {
    if ($('#valOverlayOpacity')) $('#valOverlayOpacity').textContent = Math.round(Number(e.target.value) * 100) + '%';
  });
  bindInput('#bBorderColor', 'bg', 'borderColor');
  bindInput('#bBorder', 'bg', 'border', Number);
  $('#bBorder')?.addEventListener('input', e => {
    if ($('#valBgBorder')) $('#valBgBorder').textContent = e.target.value;
  });

  // 背景画像アップロード＆ドラッグ＆ドロップ処理 (Ver.0.53)
  async function handleBgImageFile(f) {
    if (!f || !f.type.startsWith('image/')) {
      toast('画像ファイルを選択してください', 'warn');
      return;
    }
    const dUrl = await Images.resizeFile(f, 2560);
    state.bg.imageId = await Images.put(dUrl);
    state.bg.type = 'image';
    syncFormFromState();
    await saveState();
    updateImageCacheSummary();
    redraw();
    toast('背景画像を設定しました', 'success');
  }

  $('#fileBgImg')?.addEventListener('change', async e => {
    const f = e.target.files?.[0];
    if (f) await handleBgImageFile(f);
    e.target.value = '';
  });
  $('#btnSelectBgImg')?.addEventListener('click', e => {
    e.stopPropagation();
    $('#fileBgImg')?.click();
  });
  $('#btnChangeBgImg')?.addEventListener('click', e => {
    e.stopPropagation();
    $('#fileBgImg')?.click();
  });

  const bgDropZone = $('#bgImgDropZone');
  if (bgDropZone) {
    bgDropZone.addEventListener('click', () => {
      $('#fileBgImg')?.click();
    });
    bgDropZone.addEventListener('dragover', e => {
      e.preventDefault();
      bgDropZone.style.borderColor = 'var(--pink)';
      bgDropZone.style.background = 'rgba(228, 0, 127, 0.12)';
    });
    bgDropZone.addEventListener('dragleave', () => {
      bgDropZone.style.borderColor = 'var(--line)';
      bgDropZone.style.background = 'rgba(0,0,0,0.12)';
    });
    bgDropZone.addEventListener('drop', async e => {
      e.preventDefault();
      bgDropZone.style.borderColor = 'var(--line)';
      bgDropZone.style.background = 'rgba(0,0,0,0.12)';
      const f = e.dataTransfer?.files?.[0];
      if (f) await handleBgImageFile(f);
    });
  }

  $('#btnClearBgImg')?.addEventListener('click', async e => {
    e.stopPropagation();
    state.bg.imageId = '';
    state.bg.type = 'gradient';
    syncFormFromState();
    await saveState();
    updateImageCacheSummary();
    redraw();
    toast('背景画像を解除しました');
  });

  // Output bindings
  bindInput('#oPngMode', 'output', 'pngMode');
  $('#oPngMode')?.addEventListener('change', e => {
    const isPrint = e.target.value === 'print';
    if ($('#rowPngSizeSns')) $('#rowPngSizeSns').style.display = isPrint ? 'none' : 'flex';
    if ($('#rowPngSizePrint')) $('#rowPngSizePrint').style.display = isPrint ? 'flex' : 'none';
  });
  bindInput('#oPngSize', 'output', 'pngSize');
  bindInput('#oPngPrintSize', 'output', 'pngPrintSize');
  bindInput('#oMiniSort', 'output', 'miniSort');
  bindInput('#oMiniSize', 'output', 'miniSize');
  bindInput('#oMiniOrient', 'output', 'miniOrient');
  bindInput('#oMiniPages', 'output', 'miniPages');
  bindInput('#oMiniUnit', 'output', 'miniUnit', Number);
  bindInput('#oMiniEmphasis', 'output', 'miniEmphasis');
  bindInput('#oMiniShowName', 'output', 'miniShowName', Boolean);
  bindInput('#oMiniShowLabel', 'output', 'miniShowLabel', Boolean);
  bindInput('#oMiniShowSpec', 'output', 'miniShowSpec', Boolean);
  bindInput('#oSheetOrient', 'output', 'sheetOrient');
  bindInput('#oSheetExtraRows', 'output', 'sheetExtraRows', Number);
  bindInput('#oSheetFitOnePage', 'output', 'sheetFitOnePage', Boolean);
  bindInput('#oSheetShowSpec', 'output', 'sheetShowSpec', Boolean);

  /* ---------- 出力機能 1：お品書き画像プレビュー・出力 (Ver.0.57) ---------- */
  function getOshinagakiOutCanvas(targetMode, targetSize) {
    const W = Number(state.canvas.width) || 1920;
    const H = Number(state.canvas.height) || 1080;
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = W;
    srcCanvas.height = H;
    Render.draw(srcCanvas.getContext('2d'), state, { preview: false });

    const mode = targetMode || state.output.pngMode || 'sns';
    let maxLong = null;

    if (mode === 'print') {
      const pSize = targetSize || state.output.pngPrintSize || 'A4_300dpi';
      if (pSize === 'A4_300dpi') maxLong = 3508;
      else if (pSize === 'B4_300dpi') maxLong = 4299;
      else if (pSize === 'B5_300dpi') maxLong = 3035;
      else if (pSize === 'orig') maxLong = null;
    } else {
      const sSize = targetSize || state.output.pngSize || '2048';
      if (sSize !== 'orig') {
        maxLong = Number(sSize) || 2048;
      }
    }

    if (!maxLong) return srcCanvas;

    const curLong = Math.max(W, H);
    if (curLong === maxLong) return srcCanvas;

    const ratio = maxLong / curLong;
    const nw = Math.round(W * ratio);
    const nh = Math.round(H * ratio);
    const outCanvas = document.createElement('canvas');
    outCanvas.width = nw;
    outCanvas.height = nh;
    const octx = outCanvas.getContext('2d');
    octx.imageSmoothingEnabled = true;
    octx.imageSmoothingQuality = 'high';
    octx.drawImage(srcCanvas, 0, 0, nw, nh);
    return outCanvas;
  }

  function downloadCanvasAsPng(cv, label = '') {
    const a = document.createElement('a');
    a.href = cv.toDataURL('image/png');
    const circle = (state.meta.circle || 'oshinagaki').replace(/[\\/:*?"<>|]/g, '_');
    const suffix = label ? `_${label}` : '';
    a.download = `${getTodayPrefix()}_${circle}_お品書き${suffix}_${cv.width}x${cv.height}.png`;
    a.click();
    toast(`お品書きPNG (${cv.width}×${cv.height}px) を保存しました`);
  }

  /** お品書き画像（メイン）をPDFファイルとして保存 (Ver.0.62) */
  function downloadOshinagakiAsPdf(targetMode, targetSize) {
    const mode = targetMode || state.output.pngMode || 'sns';
    const sizeKey = targetSize || (mode === 'print' ? (state.output.pngPrintSize || 'A4_300dpi') : (state.output.pngSize || '2048'));
    const cv = getOshinagakiOutCanvas(mode, sizeKey);

    // 印刷サイズに応じた物理用紙寸法(mm)を計算（比率を維持しつつ指定用紙の長辺に合わせる）
    let longMm = 297; // デフォルトA4長辺
    let sizeLabel = 'A4';
    if (mode === 'print') {
      if (sizeKey === 'B4_300dpi') { longMm = 364; sizeLabel = 'B4'; }
      else if (sizeKey === 'B5_300dpi') { longMm = 257; sizeLabel = 'B5'; }
      else if (sizeKey === 'A4_300dpi') { longMm = 297; sizeLabel = 'A4'; }
      else { longMm = (Math.max(cv.width, cv.height) / 300) * 25.4; sizeLabel = `${cv.width}x${cv.height}`; }
    } else {
      // SNS用モードでもA4長辺(297mm)基準の物理サイズでPDF化
      longMm = 297;
      sizeLabel = mode;
    }

    const isLandscape = cv.width >= cv.height;
    const wMm = isLandscape ? longMm : longMm * (cv.width / cv.height);
    const hMm = isLandscape ? longMm * (cv.height / cv.width) : longMm;

    const blob = Outputs.canvasesToPdfBlob([cv], { wMm, hMm }, 0.95);
    if (!blob) {
      toast('PDFの生成に失敗しました', 'error');
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const circle = (state.meta.circle || 'oshinagaki').replace(/[\\/:*?"<>|]/g, '_');
    a.href = url;
    a.download = `${getTodayPrefix()}_${circle}_お品書き_${sizeLabel}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast(`お品書きPDF (${sizeLabel}) を保存しました`, 'success');
  }

  /** 簡易お品書き（A6/B6 卓上用）をPDFファイルとして保存 (Ver.0.62) */
  function downloadMiniAsPdf(existingRes = null) {
    const res = existingRes || Outputs.renderMini(state, id => Images.get(id));
    if (!res || !res.pages || !res.pages.length) {
      toast('出力対象のページがありません', 'warn');
      return;
    }
    const dims = { A6: [105, 148], B6: [128, 182] };
    let [wMm, hMm] = dims[res.size] || dims.A6;
    if (res.orient === 'landscape') [wMm, hMm] = [hMm, wMm];

    const blob = Outputs.canvasesToPdfBlob(res.pages, { wMm, hMm }, 0.95);
    if (!blob) {
      toast('PDFの生成に失敗しました', 'error');
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const circle = (state.meta.circle || 'oshinagaki').replace(/[\\/:*?"<>|]/g, '_');
    a.href = url;
    a.download = `${getTodayPrefix()}_${circle}_簡易お品書き_${res.size}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast(`簡易お品書きPDF（${res.size}・全${res.pages.length}ページ）を保存しました`, 'success');
  }

  function openOshinagakiPreview() {
    let currentMode = state.output.pngMode || 'sns';
    let currentSize = currentMode === 'print' ? (state.output.pngPrintSize || 'A4_300dpi') : (state.output.pngSize || '2048');
    let cachedOutCanvas = null;

    showModal({
      title: 'お品書き画像 プレビュー（SNS掲載用 / 印刷用）',
      buildBody(body) {
        body.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px;max-height:78vh;overflow-y:auto;';

        // 上部設定バー
        const topBar = document.createElement('div');
        topBar.style.cssText = 'display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:var(--panel-2);padding:8px 14px;border-radius:8px;border:1px solid var(--border);width:100%;max-width:680px;justify-content:space-between;';

        topBar.innerHTML = `
          <div style="display:flex;gap:8px;align-items:center;font-size:12px;">
            <span style="font-weight:700;color:var(--text);">出力用途:</span>
            <select id="modalPngMode" style="padding:4px 8px;font-size:12px;">
              <option value="sns"${currentMode === 'sns' ? ' selected' : ''}>SNS掲載用（Web・X向け）</option>
              <option value="print"${currentMode === 'print' ? ' selected' : ''}>印刷用（高解像度）</option>
            </select>
          </div>
          <div style="display:flex;gap:8px;align-items:center;font-size:12px;">
            <span style="font-weight:700;color:var(--text);">解像度:</span>
            <select id="modalPngSizeSns" style="padding:4px 8px;font-size:12px;display:${currentMode === 'sns' ? 'inline-block' : 'none'};">
              <option value="orig"${currentSize === 'orig' ? ' selected' : ''}>キャンバス原寸</option>
              <option value="2048"${currentSize === '2048' ? ' selected' : ''}>長辺 2048px (X推奨)</option>
              <option value="1920"${currentSize === '1920' ? ' selected' : ''}>長辺 1920px (フルHD)</option>
              <option value="1600"${currentSize === '1600' ? ' selected' : ''}>長辺 1600px</option>
              <option value="1200"${currentSize === '1200' ? ' selected' : ''}>長辺 1200px</option>
            </select>
            <select id="modalPngSizePrint" style="padding:4px 8px;font-size:12px;display:${currentMode === 'print' ? 'inline-block' : 'none'};">
              <option value="A4_300dpi"${currentSize === 'A4_300dpi' ? ' selected' : ''}>A4印刷 (300dpi・長辺3508px)</option>
              <option value="B4_300dpi"${currentSize === 'B4_300dpi' ? ' selected' : ''}>B4印刷 (300dpi・長辺4299px)</option>
              <option value="B5_300dpi"${currentSize === 'B5_300dpi' ? ' selected' : ''}>B5印刷 (300dpi・長辺3035px)</option>
              <option value="orig"${currentSize === 'orig' ? ' selected' : ''}>キャンバス原寸</option>
            </select>
          </div>
        `;
        body.appendChild(topBar);

        // 画像プレビューコンテナ
        const previewWrap = document.createElement('div');
        previewWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;';
        const imgEl = document.createElement('img');
        imgEl.style.cssText = 'max-width:100%;max-height:56vh;object-fit:contain;border-radius:6px;box-shadow:0 4px 18px rgba(0,0,0,0.35);border:1px solid var(--border);background:#fff;';
        
        const infoEl = document.createElement('div');
        infoEl.style.cssText = 'font-size:11.5px;color:var(--text-muted);font-weight:600;margin-top:2px;';

        previewWrap.append(imgEl, infoEl);
        body.appendChild(previewWrap);

        function updatePreview() {
          cachedOutCanvas = getOshinagakiOutCanvas(currentMode, currentSize);
          imgEl.src = cachedOutCanvas.toDataURL('image/png');
          const modeLabel = currentMode === 'print' ? '印刷用高解像度' : 'SNS掲載用';
          infoEl.textContent = `出力解像度: ${cachedOutCanvas.width} × ${cachedOutCanvas.height} px (${modeLabel})`;
        }

        const selMode = topBar.querySelector('#modalPngMode');
        const selSns = topBar.querySelector('#modalPngSizeSns');
        const selPrint = topBar.querySelector('#modalPngSizePrint');

        selMode?.addEventListener('change', async e => {
          currentMode = e.target.value;
          state.output.pngMode = currentMode;
          selSns.style.display = currentMode === 'sns' ? 'inline-block' : 'none';
          selPrint.style.display = currentMode === 'print' ? 'inline-block' : 'none';
          currentSize = currentMode === 'print' ? selPrint.value : selSns.value;
          if (currentMode === 'print') state.output.pngPrintSize = currentSize;
          else state.output.pngSize = currentSize;
          syncFormFromState();
          await saveState();
          updatePreview();
        });

        selSns?.addEventListener('change', async e => {
          currentSize = e.target.value;
          state.output.pngSize = currentSize;
          syncFormFromState();
          await saveState();
          updatePreview();
        });

        selPrint?.addEventListener('change', async e => {
          currentSize = e.target.value;
          state.output.pngPrintSize = currentSize;
          syncFormFromState();
          await saveState();
          updatePreview();
        });

        updatePreview();
      },
      buildFoot(foot) {
        const btnPrint = document.createElement('button');
        btnPrint.innerHTML = '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M19 8h-1V3H6v5H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zM8 5h8v3H8V5zm8 14H8v-4h8v4zm2-6.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg> 🖨️ 印刷用画面を開く';
        btnPrint.onclick = () => {
          const cv = cachedOutCanvas || getOshinagakiOutCanvas(currentMode, currentSize);
          const dataUrl = cv.toDataURL('image/png');
          const isLandscape = cv.width >= cv.height;
          const orient = isLandscape ? 'landscape' : 'portrait';
          const w = window.open('', '_blank');
          if (w) {
            w.document.write(`<!DOCTYPE html><html><head><title>お品書き印刷</title><style>@page{size:A4 ${orient};margin:6mm;}* {box-sizing:border-box;}body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#fff;}img{max-width:100%;max-height:100%;object-fit:contain;}</style></head><body><img src="${dataUrl}"><script>window.onload=()=>{setTimeout(()=>window.print(),150);};<\/script></body></html>`);
            w.document.close();
          } else {
            toast('ポップアップがブロックされました。PNG保存またはPDF出力をご利用ください');
          }
        };

        const btnPdf = document.createElement('button');
        btnPdf.innerHTML = '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg> 📄 PDFとして保存';
        btnPdf.onclick = () => {
          downloadOshinagakiAsPdf(currentMode, currentSize);
        };

        const btnDl = document.createElement('button');
        btnDl.className = 'primary';
        btnDl.innerHTML = '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg> 💾 PNG画像として保存';
        btnDl.onclick = () => {
          const cv = cachedOutCanvas || getOshinagakiOutCanvas(currentMode, currentSize);
          downloadCanvasAsPng(cv, currentMode);
        };

        const btnClose = document.createElement('button');
        btnClose.textContent = '閉じる';
        btnClose.onclick = () => closeModal(false);

        foot.append(btnClose, btnPrint, btnPdf, btnDl);
      }
    });
  }
  $('#btnOutPng').addEventListener('click', openOshinagakiPreview);
  $('#btnQuickPng').addEventListener('click', openOshinagakiPreview);
  $('#btnOutPngPdf')?.addEventListener('click', () => downloadOshinagakiAsPdf());

  /* ---------- 出力機能 2：簡易お品書き（A6/B6 卓上簡易版） (Ver.0.30) ---------- */
  function openMiniPreview() {
    const res = Outputs.renderMini(state, id => Images.get(id));
    showModal({
      title: `簡易お品書きプレビュー（${res.size}・${res.pages.length}枚・端数強調機能付き）`,
      buildBody(body) {
        res.pages.forEach((cv, idx) => {
          const wrap = document.createElement('div');
          wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;max-width:420px;';
          const cap = document.createElement('div');
          cap.style.cssText = 'font-weight:700;font-size:12px;color:var(--text);';
          cap.textContent = `${res.size} 簡易お品書き (${idx + 1} / ${res.pages.length}枚目)`;
          cv.style.maxHeight = '62vh';
          cv.style.width = 'auto';
          wrap.append(cap, cv);
          body.appendChild(wrap);
        });
      },
      buildFoot(foot) {
        const btnDl = document.createElement('button');
        btnDl.className = 'primary';
        btnDl.innerHTML = '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg> PNG画像として保存';
        btnDl.onclick = () => {
          const circle = (state.meta.circle || 'サークル').replace(/[\\/:*?"<>|]/g, '_');
          res.pages.forEach((cv, i) => {
            const a = document.createElement('a');
            a.href = cv.toDataURL('image/png');
            a.download = `${getTodayPrefix()}_${circle}_簡易お品書き_${res.size}_${i + 1}.png`;
            a.click();
          });
          toast('簡易お品書きPNGを保存しました');
        };

        const btnPdf = document.createElement('button');
        btnPdf.innerHTML = '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg> 📄 PDFとして保存';
        btnPdf.onclick = () => {
          downloadMiniAsPdf(res);
        };

        const btnPrint = document.createElement('button');
        btnPrint.innerHTML = '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M19 8h-1V3H6v5H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zM8 5h8v3H8V5zm8 14H8v-4h8v4zm2-6.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg> 印刷用画面を開く';
        btnPrint.onclick = () => {
          const imgs = res.pages.map((cv, idx) => {
            const brk = idx < res.pages.length - 1 ? 'page-break-after:always;break-after:page;' : '';
            return `<div style="text-align:center;${brk}"><img src="${cv.toDataURL('image/png')}" style="max-width:100%;max-height:96vh;height:auto;border:1px solid #ccc;"></div>`;
          }).join('');
          const w = window.open('', '_blank');
          if (w) {
            w.document.write(`<!DOCTYPE html><html><head><title>簡易お品書き印刷</title><style>@page{margin:8mm;}body{margin:0;background:#fff;}</style></head><body>${imgs}<script>window.onload=()=>window.print();<\/script></body></html>`);
            w.document.close();
          } else {
            toast('ポップアップがブロックされました。PNG保存またはPDF出力をご利用ください');
          }
        };

        const btnClose = document.createElement('button');
        btnClose.textContent = '閉じる';
        btnClose.onclick = () => closeModal(false);

        foot.append(btnClose, btnPrint, btnPdf, btnDl);
      }
    });
  }
  $('#btnOutMini').addEventListener('click', openMiniPreview);
  $('#btnQuickMini').addEventListener('click', openMiniPreview);
  $('#btnOutMiniPdf')?.addEventListener('click', () => downloadMiniAsPdf());

  /* ---------- 出力機能 3：当日頒布物帳票（A4白黒・1日/2日対応） ---------- */
  function openSheetPreview() {
    const html = Outputs.stockSheetHtml(state);
    showModal({
      title: `当日頒布物帳票 プレビュー（A4・${state.meta.twoDays ? '2日連続開催モード' : '1日開催モード'}）`,
      buildBody(body) {
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'width:100%;height:68vh;border:none;background:#fff;box-shadow:0 4px 16px rgba(0,0,0,0.2);';
        body.appendChild(iframe);
        iframe.contentDocument.open();
        iframe.contentDocument.write(html);
        iframe.contentDocument.close();
        body._sheetIframe = iframe;
      },
      buildFoot(foot) {
        const btnToggle2Day = document.createElement('button');
        btnToggle2Day.textContent = state.meta.twoDays ? '🔄 1日開催用に切替' : '🔄 2日連続開催用に切替';
        btnToggle2Day.onclick = async () => {
          state.meta.twoDays = !state.meta.twoDays;
          syncFormFromState();
          await saveState();
          redraw();
          openSheetPreview();
        };

        const btnDlHtml = document.createElement('button');
        btnDlHtml.innerHTML = '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg> 帳票HTMLを保存';
        btnDlHtml.onclick = () => {
          const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const circle = (state.meta.circle || 'circle').replace(/[\\/:*?"<>|]/g, '_');
          a.href = url;
          a.download = `${getTodayPrefix()}_${circle}_当日頒布物帳票.html`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 5000);
          toast('当日頒布物帳票HTMLを保存しました');
        };

        const btnPrint = document.createElement('button');
        btnPrint.className = 'primary';
        btnPrint.innerHTML = '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M19 8h-1V3H6v5H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zM8 5h8v3H8V5zm8 14H8v-4h8v4zm2-6.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg> A4帳票を印刷 / PDF出力';
        btnPrint.onclick = () => {
          const ifr = $('#modalBody')._sheetIframe;
          if (ifr && ifr.contentWindow) {
            ifr.contentWindow.focus();
            ifr.contentWindow.print();
          }
        };

        const btnClose = document.createElement('button');
        btnClose.textContent = '閉じる';
        btnClose.onclick = () => closeModal(false);

        foot.append(btnClose, btnToggle2Day, btnDlHtml, btnPrint);
      }
    });
  }
  $('#btnOutSheet').addEventListener('click', openSheetPreview);
  $('#btnQuickSheet').addEventListener('click', openSheetPreview);

  /* ---------- 保存・呼び出し機能（CSV形式 ＆ フォルダ形式） ---------- */
  function buildCsvRows(embedImages = true) {
    const rows = [['section', 'key', 'val1', 'val2', 'val3', 'val4', 'val5', 'val6', 'val7', 'val8']];
    for (const sec of SETTING_SECTIONS) {
      for (const [k, v] of Object.entries(state[sec] || {})) {
        rows.push([sec, k, JSON.stringify(v), '', '', '', '', '']);
      }
    }
    for (const g of (state.genres || [])) {
      const color = state.genreColors?.[g] || '';
      rows.push(['genre', g, color, '', '', '', '', '']);
    }
    for (const [k, c] of Object.entries(state.labelColors || {})) {
      rows.push(['label_color', k, c, '', '', '', '', '']);
    }
    for (const [k, c] of Object.entries(state.subLabelColors || {})) {
      rows.push(['sub_label_color', k, c, '', '', '', '', '']);
    }
    for (const it of state.items) {
      rows.push(['item', it.id, it.name || '', it.pubdate || '', it.spec || '', String(it.price ?? ''), it.imageId || '', it.genre || '']);
    }
    for (const pop of (state.pops || [])) {
      const extra = {
        imageId: pop.imageId || '',
        imgScale: pop.imgScale ?? 100,
        imgX: pop.imgX ?? 0,
        imgY: pop.imgY ?? 0,
        showBg: pop.showBg !== false,
        textPos: pop.textPos || 'bottom',
        textX: pop.textX ?? 0,
        textY: pop.textY ?? 0,
        bubble: pop.bubble || 'round',
        tailDir: pop.tailDir || 'auto',
        tailPos: pop.tailPos ?? 35
      };
      rows.push(['pop', pop.id, pop.title || '', pop.sub || '', pop.style || 'burst', pop.bgColor || '#ff4b00', pop.textColor || '#ffffff', pop.titleFit || 'condense1', JSON.stringify(extra)]);
    }
    for (const p of state.placed) {
      rows.push(['placed', p.uid, p.itemId, String(p.size || 1), p.label || 'none', p.labelText || '', p.labelColor || '', p.subLabel || 'none', p.subLabelText || '', p.subLabelColor || '']);
    }
    if (window.CustomFonts) {
      for (const meta of CustomFonts.list()) {
        const dUrl = embedImages ? (meta.dataUrl || '') : '';
        rows.push(['custom_font', meta.id, meta.name || '', meta.family || '', meta.fileName || '', String(meta.byteSize || 0), dUrl]);
      }
    }
    for (const pf of (state.pickedPcFonts || [])) {
      rows.push(['picked_pc_font', pf.family, pf.name || pf.family, '', '', '', '', '']);
    }
    if (embedImages) {
      const usedIds = new Set(state.items.map(i => i.imageId).filter(Boolean));
      if (state.bg.type === 'image' && state.bg.imageId) usedIds.add(state.bg.imageId);
      for (const p of (state.pops || [])) {
        if (p.imageId) usedIds.add(p.imageId);
      }
      for (const id of usedIds) {
        const dUrl = Images.data.get(id);
        if (dUrl) rows.push(['image', id, dUrl, '', '', '', '', '']);
      }
    }
    return rows.map(r => {
      while (r.length < 10) r.push('');
      return r;
    });
  }

  async function clearAllCustomFonts() {
    if (!window.CustomFonts) return;
    archiveCustomFonts();
    if (typeof CustomFonts.clear === 'function') {
      await CustomFonts.clear();
    } else if (CustomFonts.data) {
      for (const id of [...CustomFonts.data.keys()]) {
        await CustomFonts.del(id);
      }
    }
  }

  async function applyCsvRows(rows, externalImagesMap = null, externalFontsMap = null) {
    if (!rows.length) return;

    // 既存カスタムフォントをクリアしてCSV／フォルダ内のフォントと同期 (Ver.0.68)
    await clearAllCustomFonts();

    const next = structuredClone(DEFAULT);
    next.items = [];
    next.placed = [];
    next.pops = [];
    next.genres = [];
    next.genreColors = {};
    let csvHasGenres = false;
    let csvHasPops = false;

    const startIdx = rows[0][0] === 'section' ? 1 : 0;
    for (let i = startIdx; i < rows.length; i++) {
      const [sec, k, v1, v2, v3, v4, v5] = rows[i];
      if (SETTING_SECTIONS.includes(sec) && k in next[sec]) {
        try { next[sec][k] = JSON.parse(v1); } catch { next[sec][k] = v1; }
      } else if (sec === 'genre') {
        if (!csvHasGenres) {
          next.genres = [];
          next.genreColors = {};
          csvHasGenres = true;
        }
        if (k && !next.genres.includes(k)) next.genres.push(k);
        if (k) {
          next.genreColors[k] = v1 || Render.getGenreColor(k, next.style?.accent || '#ff4b00', next);
        }
      } else if (sec === 'label_color' && k && v1) {
        if (!next.labelColors) next.labelColors = {};
        next.labelColors[k] = v1;
      } else if (sec === 'sub_label_color' && k && v1) {
        if (!next.subLabelColors) next.subLabelColors = {};
        next.subLabelColors[k] = v1;
      } else if (sec === 'item') {
        const [sec, k, v1, v2, v3, v4, v5, v6] = rows[i];
        next.items.push({
          id: k || ('item_' + uid()),
          name: v1 || '',
          pubdate: v2 || '',
          spec: v3 || '',
          price: v4 === '' ? '' : Number(v4),
          imageId: v5 || '',
          genre: v6 || '',
        });
      } else if (sec === 'pop') {
        if (!csvHasPops) {
          next.pops = [];
          csvHasPops = true;
        }
        const [sec, k, v1, v2, v3, v4, v5, v6, v7] = rows[i];
        let extra = {};
        if (v7) {
          try { extra = JSON.parse(v7); } catch {}
        }
        next.pops.push({
          id: k || ('pop_' + uid()),
          title: v1 || '',
          sub: v2 || '',
          style: v3 || 'burst',
          bgColor: v4 || (next.style?.colorMode === 'classic' ? '#e4007f' : '#ff4b00'),
          textColor: v5 || '#ffffff',
          titleFit: v6 || 'condense1',
          imageId: extra.imageId || '',
          imgScale: Number.isFinite(Number(extra.imgScale)) ? Number(extra.imgScale) : 100,
          imgX: Number.isFinite(Number(extra.imgX)) ? Number(extra.imgX) : 0,
          imgY: Number.isFinite(Number(extra.imgY)) ? Number(extra.imgY) : 0,
          showBg: extra.showBg !== false,
          textPos: extra.textPos || 'bottom',
          textX: Number.isFinite(Number(extra.textX)) ? Number(extra.textX) : 0,
          textY: Number.isFinite(Number(extra.textY)) ? Number(extra.textY) : 0,
          bubble: extra.bubble || 'round',
          tailDir: extra.tailDir || 'auto',
          tailPos: Number.isFinite(Number(extra.tailPos)) ? Number(extra.tailPos) : 35
        });
      } else if (sec === 'placed') {
        const [sec, k, v1, v2, v3, v4, v5, v6, v7, v8] = rows[i];
        let lbl = v3 || 'none';
        let subLbl = v6 || 'none';
        if ((!subLbl || subLbl === 'none') && (lbl === 'r15' || lbl === 'r18')) {
          subLbl = lbl;
          lbl = 'none';
        }
        next.placed.push({
          uid: k || ('p_' + uid()),
          itemId: v1 || '',
          size: Number(v2) || 1,
          label: lbl,
          labelText: v4 || '',
          labelColor: v5 || '',
          subLabel: subLbl,
          subLabelText: v7 || '',
          subLabelColor: v8 || '',
        });
      } else if (sec === 'image' && k && v1) {
        await Images.put(v1, k);
      } else if (sec === 'custom_font' && k && window.CustomFonts) {
        const [sec, id, name, family, fileName, byteSizeStr, dataUrl] = rows[i];
        let effectiveDataUrl = dataUrl || '';
        let fontObj = null;
        if (!effectiveDataUrl && externalFontsMap) {
          const prefixedName = `${id}_${fileName}`;
          if (externalFontsMap.has(prefixedName)) {
            fontObj = externalFontsMap.get(prefixedName);
            externalFontsMap.delete(prefixedName);
          } else if (fileName && externalFontsMap.has(fileName)) {
            fontObj = externalFontsMap.get(fileName);
            externalFontsMap.delete(fileName);
          } else {
            // 前方一致（id_で始まるファイル名）フォールバック (Ver.0.68)
            for (const [key, val] of externalFontsMap.entries()) {
              if (key.startsWith(id + '_') || key === id) {
                fontObj = val;
                externalFontsMap.delete(key);
                break;
              }
            }
          }
          if (fontObj) {
            effectiveDataUrl = (fontObj && fontObj.dataUrl) ? fontObj.dataUrl : fontObj;
          }
        }
        if (effectiveDataUrl) {
          await CustomFonts.putMeta({
            id,
            name: name || '',
            family: family || ('CustomFont_' + id),
            fileName: fileName || '',
            byteSize: Number(byteSizeStr) || (fontObj?.file?.size) || 0,
            dataUrl: effectiveDataUrl
          });
        }
      } else if (sec === 'picked_pc_font') {
        if (!next.pickedPcFonts) next.pickedPcFonts = [];
        const [sec, family, name] = rows[i];
        if (family && !next.pickedPcFonts.some(f => f.family === family)) {
          next.pickedPcFonts.push({ family, name: name || family });
        }
      }
    }

    if (externalImagesMap) {
      for (const [id, dUrl] of externalImagesMap.entries()) {
        await Images.put(dUrl, id);
      }
    }

    // CSV内に custom_font 行が存在しなかったフォントファイルのみ新規登録 (Ver.0.60b / Ver.0.68)
    if (externalFontsMap && window.CustomFonts) {
      for (const [fName, fObj] of externalFontsMap.entries()) {
        const file = (fObj && fObj.file) ? fObj.file : fObj;
        if (file instanceof File || file instanceof Blob) {
          let cleanName = fName;
          const match = fName.match(/^cfont_[a-z0-9]+_(.+)$/i);
          if (match) cleanName = match[1];
          await CustomFonts.putFile(file, cleanName.replace(/\.[^/.]+$/, '').trim());
        }
      }
    }

    for (const it of next.items) {
      if (it.genre && !next.genres.includes(it.genre)) {
        next.genres.push(it.genre);
        next.genreColors[it.genre] = Render.getGenreColor(it.genre, next.style?.accent || '#ff4b00', next);
      }
    }
    const finalGenreColors = structuredClone(next.genreColors);
    state = merge(DEFAULT, next);
    state.genreColors = finalGenreColors;
    savePickedPcFonts(state.pickedPcFonts);
    if (typeof window !== 'undefined') window.state = state;
    selectedPlacedUid = state.placed[0]?.uid || null;

    archiveCustomFonts();
    await saveState(false, true);
    syncFormFromState();
    renderGenreOptions();
    renderLibrary();
    renderPopLibrary();
    renderPlacedBar();
    updateImageCacheSummary();
    renderFontSelectOptions();
    renderCustomFontList();
    redraw();
  }

  /* ---------- ヘッダー・デザイン設定のみのCSV出力／読込 (Ver.0.28) ---------- */
  function buildDesignCsvRows() {
    const rows = [['section', 'key', 'val1', 'val2', 'val3', 'val4', 'val5', 'val6', 'val7', 'val8']];
    const designSections = ['canvas', 'layout', 'bg', 'style'];
    for (const sec of designSections) {
      for (const [k, v] of Object.entries(state[sec] || {})) {
        rows.push([sec, k, JSON.stringify(v), '', '', '', '', '']);
      }
    }
    for (const [k, c] of Object.entries(state.labelColors || {})) {
      rows.push(['label_color', k, c, '', '', '', '', '']);
    }
    for (const [k, c] of Object.entries(state.subLabelColors || {})) {
      rows.push(['sub_label_color', k, c, '', '', '', '', '']);
    }
    for (const g of (state.genres || [])) {
      const color = state.genreColors?.[g] || '';
      rows.push(['genre', g, color, '', '', '', '', '']);
    }
    if (state.bg.type === 'image' && state.bg.imageId) {
      const dUrl = Images.data.get(state.bg.imageId);
      if (dUrl) rows.push(['image', state.bg.imageId, dUrl, '', '', '', '', '']);
    }
    if (window.CustomFonts) {
      for (const meta of CustomFonts.list()) {
        rows.push(['custom_font', meta.id, meta.name || '', meta.family || '', meta.fileName || '', String(meta.byteSize || 0), meta.dataUrl || '']);
      }
    }
    for (const pf of (state.pickedPcFonts || [])) {
      rows.push(['picked_pc_font', pf.family, pf.name || pf.family, '', '', '', '', '']);
    }
    return rows.map(r => {
      while (r.length < 10) r.push('');
      return r;
    });
  }

  $('#btnExportDesignCsv')?.addEventListener('click', () => {
    const circle = (state.meta.circle || 'サークル').replace(/[\\/:*?"<>|]/g, '_');
    const filename = `${circle}_デザイン設定.csv`;
    const csvText = CSV.encode(buildDesignCsvRows());
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    toast(`デザイン設定を「${filename}」に出力しました`, 'success');
  });

  $('#fileDesignCsv')?.addEventListener('change', async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const rows = CSV.parse(text);
      if (!rows || !rows.length) throw new Error('CSVが空です');
      await clearAllCustomFonts();
      state.pickedPcFonts = [];
      const startIdx = rows[0][0] === 'section' ? 1 : 0;
      const designSections = ['canvas', 'layout', 'bg', 'style'];
      for (let i = startIdx; i < rows.length; i++) {
        const [sec, k, v1] = rows[i];
        if (designSections.includes(sec) && state[sec] && k in state[sec]) {
          try { state[sec][k] = JSON.parse(v1); } catch { state[sec][k] = v1; }
        } else if (sec === 'label_color' && k && v1) {
          if (!state.labelColors) state.labelColors = {};
          state.labelColors[k] = v1;
        } else if (sec === 'sub_label_color' && k && v1) {
          if (!state.subLabelColors) state.subLabelColors = {};
          state.subLabelColors[k] = v1;
        } else if (sec === 'genre' && k) {
          if (!Array.isArray(state.genres)) state.genres = [];
          const hasGenre = state.genres.includes(k) || (state.items || []).some(it => it.genre === k);
          if (hasGenre) {
            if (!state.genres.includes(k)) state.genres.push(k);
            if (!state.genreColors) state.genreColors = {};
            state.genreColors[k] = v1 || Render.getGenreColor(k, state.style?.accent || '#ff4b00', state);
          }
        } else if (sec === 'image' && k && v1) {
          await Images.put(v1, k);
        } else if (sec === 'custom_font' && k && window.CustomFonts) {
          const [sec, id, name, family, fileName, byteSizeStr, dataUrl] = rows[i];
          if (dataUrl) {
            await CustomFonts.putMeta({
              id,
              name: name || '',
              family: family || ('CustomFont_' + id),
              fileName: fileName || '',
              byteSize: Number(byteSizeStr) || 0,
              dataUrl
            });
          }
        } else if (sec === 'picked_pc_font') {
          if (!state.pickedPcFonts) state.pickedPcFonts = [];
          const [sec, family, name] = rows[i];
          if (family && !state.pickedPcFonts.some(f => f.family === family)) {
            state.pickedPcFonts.push({ family, name: name || family });
          }
        }
      }
      savePickedPcFonts(state.pickedPcFonts);
      syncFormFromState();
      renderGenreOptions();
      renderLabelColorSettings();
      renderLibrary();
      updateImageCacheSummary();
      renderFontSelectOptions();
      renderCustomFontList();
      archiveCustomFonts();
      await saveState(false, true);
      redraw();
      toast('デザイン設定を読み込みました', 'success');
    } catch (err) {
      toast('デザイン設定CSVの読込に失敗しました: ' + err.message, 'error');
    } finally {
      e.target.value = '';
    }
  });

  // 単一CSVファイル保存
  $('#btnSaveCsv').addEventListener('click', () => {
    const csvText = CSV.encode(buildCsvRows(true));
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const circle = (state.meta.circle || 'oshinaga_kingdom').replace(/[\\/:*?"<>|]/g, '_');
    a.download = `${circle}_お品書き設定.csv`;
    a.click();
    toast('設定と書影をCSVファイルに保存しました');
  });

  // 単一CSVファイル読込
  $('#fileCsv').addEventListener('change', async e => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      const rows = CSV.parse(text);
      if (!rows || !rows.length) throw new Error('CSVが空です');
      const knownSections = new Set([...SETTING_SECTIONS, 'genre', 'label_color', 'sub_label_color', 'item', 'pop', 'placed', 'image', 'custom_font', 'picked_pc_font']);
      const startIdx = rows[0][0] === 'section' ? 1 : 0;
      const hasValidRow = rows.slice(startIdx).some(r => knownSections.has(r[0]));
      if (!hasValidRow) throw new Error('有効なお品書きCSVデータが見つかりません');
      await applyCsvRows(rows);
      toast('CSVファイルから設定・アイテムを復元しました', 'success');
    } catch (err) {
      toast('CSVファイルの読込に失敗しました: ' + (err?.message || err), 'error');
    } finally {
      e.target.value = '';
    }
  });

  // フォルダ保存（data/ フォルダ内に CSV + images/ + fonts/ を収容 Ver.0.30 / Ver.0.38）
  $('#btnSaveFolder').addEventListener('click', async () => {
    if (!window.showDirectoryPicker) {
      toast('お使いのブラウザ環境ではフォルダ直接保存が制限されています。「💾 CSV保存」をご利用ください');
      return;
    }
    try {
      const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
      const dataDir = dir.name.toLowerCase() === 'data' ? dir : await dir.getDirectoryHandle('data', { create: true });
      const csvFile = await dataDir.getFileHandle('oshinagaki.csv', { create: true });
      const w = await csvFile.createWritable();
      await w.write(CSV.encode(buildCsvRows(false)));
      await w.close();

      const imgDir = await dataDir.getDirectoryHandle('images', { create: true });
      const usedIds = new Set(state.items.map(i => i.imageId).filter(Boolean));
      if (state.bg.type === 'image' && state.bg.imageId) usedIds.add(state.bg.imageId);
      for (const p of (state.pops || [])) {
        if (p.imageId) usedIds.add(p.imageId);
      }
      for (const id of usedIds) {
        const dUrl = Images.data.get(id);
        if (!dUrl) continue;
        const res = await fetch(dUrl);
        const blob = await res.blob();
        const ext = dUrl.startsWith('data:image/png') ? '.png' : '.jpg';
        const fh = await imgDir.getFileHandle(id + ext, { create: true });
        const fw = await fh.createWritable();
        await fw.write(blob);
        await fw.close();
      }

      // フォントファイルの書き出し (Ver.0.38 / Ver.0.68 同名ファイル衝突防止)
      if (window.CustomFonts && CustomFonts.data.size > 0) {
        const fontDir = await dataDir.getDirectoryHandle('fonts', { create: true });
        for (const meta of CustomFonts.list()) {
          if (!meta.dataUrl) continue;
          try {
            const res = await fetch(meta.dataUrl);
            const blob = await res.blob();
            const rawName = meta.fileName || (meta.name + '.ttf');
            const saveFileName = rawName.startsWith(meta.id + '_') ? rawName : `${meta.id}_${rawName}`;
            const fh = await fontDir.getFileHandle(saveFileName, { create: true });
            const fw = await fh.createWritable();
            await fw.write(blob);
            await fw.close();
          } catch (fErr) {
            console.warn('フォント書き出しエラー:', meta.name, fErr);
          }
        }
      }

      toast('data フォルダ内に oshinagaki.csv と images/・fonts/ を保存しました');
    } catch (err) {
      if (err.name !== 'AbortError') toast('フォルダ保存に失敗しました。「💾 CSV保存」をご利用ください');
    }
  });

  // フォルダ読込（data/ 優先・旧直下フォルダ互換フォールバック Ver.0.30 / Ver.0.38）
  $('#btnLoadFolder').addEventListener('click', async () => {
    if (!window.showDirectoryPicker) {
      toast('お使いのブラウザ環境ではフォルダ読込が制限されています。「📂 CSV読込」をご利用ください');
      return;
    }
    try {
      const dir = await window.showDirectoryPicker({ mode: 'read' });
      let targetDir = dir;
      if (dir.name.toLowerCase() !== 'data') {
        try {
          const dDir = await dir.getDirectoryHandle('data', { create: false });
          if (dDir) targetDir = dDir;
        } catch {}
      }

      let csvFile = null;
      try {
        csvFile = await targetDir.getFileHandle('oshinagaki.csv');
      } catch {
        if (targetDir !== dir) {
          try {
            csvFile = await dir.getFileHandle('oshinagaki.csv');
          } catch {}
        }
      }
      if (!csvFile) throw new Error('oshinagaki.csv が見つかりません');
      const text = await (await csvFile.getFile()).text();

      const extMap = new Map();
      async function loadImagesFrom(dHandle) {
        if (!dHandle) return;
        try {
          const imgDir = await dHandle.getDirectoryHandle('images', { create: false });
          for await (const [name, handle] of imgDir.entries()) {
            if (handle.kind === 'file') {
              const id = name.replace(/\.[^.]+$/, '');
              if (!extMap.has(id)) {
                const file = await handle.getFile();
                const dUrl = await Images.readFile(file);
                extMap.set(id, dUrl);
              }
            }
          }
        } catch {}
      }
      await loadImagesFrom(targetDir);
      if (targetDir !== dir) await loadImagesFrom(dir);

      const extFontsMap = new Map();
      // fonts/ フォルダからフォントファイルを読み込む (Ver.0.38 / Ver.0.60b)
      async function loadFontsFrom(dHandle) {
        if (!dHandle || !window.CustomFonts) return;
        try {
          const fontDir = await dHandle.getDirectoryHandle('fonts', { create: false });
          for await (const [name, handle] of fontDir.entries()) {
            if (handle.kind === 'file') {
              const lower = name.toLowerCase();
              if (['.ttf', '.otf', '.woff', '.woff2'].some(ext => lower.endsWith(ext))) {
                if (!extFontsMap.has(name)) {
                  const file = await handle.getFile();
                  const dataUrl = await CustomFonts.readFileAsDataURL(file);
                  extFontsMap.set(name, { file, dataUrl });
                }
              }
            }
          }
        } catch {}
      }
      await loadFontsFrom(targetDir);
      if (targetDir !== dir) await loadFontsFrom(dir);

      await applyCsvRows(CSV.parse(text), extMap, extFontsMap);
      renderFontSelectOptions();
      renderCustomFontList();
      toast('フォルダから全データ（画像・フォント含む）を読み込みました');
    } catch (err) {
      if (err.name !== 'AbortError') toast('フォルダ読込に失敗しました: ' + (err.message || ''));
    }
  });

  // サンプル読込＆新規ボタン (3パターン対応 Ver.0.18 / Ver.0.36)
  $('#btnSample')?.addEventListener('click', async () => {
    const ok = await confirmModal('サンプルデータの読込', '選択したサンプルデータを読み込みますか？\n（現在登録されているアイテム・POP・配置データは上書きされます）');
    if (!ok) return;

    const sel = $('#samplePresetSelect');
    const val = sel ? sel.value : '20';
    await loadSamplePreset(val);
    const count = state.items.length;
    toast(`サンプルデータ（計${count}点）を読み込みました！`);
  });

  // このツールについて モーダル (Ver.0.19)
  function openAboutModal() {
    $('#aboutModalBackdrop')?.classList.add('open');
  }
  function closeAboutModal() {
    $('#aboutModalBackdrop')?.classList.remove('open');
  }
  $('#btnAbout')?.addEventListener('click', openAboutModal);
  $('#btnAboutModalClose')?.addEventListener('click', closeAboutModal);
  $('#aboutModalBackdrop')?.addEventListener('click', e => {
    if (e.target === $('#aboutModalBackdrop')) closeAboutModal();
  });

  // ヘルプ モーダル (Ver.0.19 / Ver.0.59)
  function openHelpModal() {
    const backdrop = $('#helpModalBackdrop');
    if (backdrop) {
      backdrop.classList.add('open');
      const body = $('#helpModalBody');
      if (body) body.scrollTop = 0;
    }
  }
  function closeHelpModal() {
    $('#helpModalBackdrop')?.classList.remove('open');
  }
  $('#btnHelp')?.addEventListener('click', openHelpModal);
  $('#btnHelpModalClose')?.addEventListener('click', closeHelpModal);
  $('#helpModalBackdrop')?.addEventListener('click', e => {
    if (e.target === $('#helpModalBackdrop')) closeHelpModal();
  });

  // ヘルプ目次クイックジャンプ (Ver.0.59)
  document.querySelectorAll('.help-toc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      if (!targetId) return;
      const targetElem = document.getElementById(targetId);
      if (targetElem) {
        targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Escキーで開いているモーダルを閉じる
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if ($('#modalBackdrop')?.classList.contains('open')) return;
      if ($('#itemModalBackdrop')?.classList.contains('open')) closeItemModal();
      if ($('#popModalBackdrop')?.classList.contains('open')) closePopModal();
      if ($('#imageManagerModalBackdrop')?.classList.contains('open')) closeImageManagerModal();
      if ($('#aboutModalBackdrop')?.classList.contains('open')) closeAboutModal();
      if ($('#helpModalBackdrop')?.classList.contains('open')) closeHelpModal();
      if ($('#pcFontModalBackdrop')?.classList.contains('open')) $('#pcFontModalBackdrop').classList.remove('open');
    }
  });

  $('#btnNew').addEventListener('click', () => {
    confirmDialog('現在の入力・配置をすべて初期化して新規作成しますか？', async () => {
      state = structuredClone(DEFAULT);
      if (typeof window !== 'undefined') window.state = state;
      savePickedPcFonts([]);
      selectedPlacedUid = null;
      clearItemForm();
      if (window.Images && typeof Images.purgeUnused === 'function') {
        await Images.purgeUnused(Images.getUsedIds(state));
      }
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      debounceBaseJson = null;
      debounceBaseFontIds = null;
      undoStack.length = 0;
      redoStack.length = 0;
      undoFontStack.length = 0;
      redoFontStack.length = 0;
      updateUndoRedoButtons();
      lastSavedStateJson = JSON.stringify(state);
      lastSavedFontIds = getCurrentCustomFontIds();
      await saveState(true);
      syncFormFromState();
      renderGenreOptions();
      renderLibrary();
      renderPopLibrary();
      renderPlacedBar();
      updateImageCacheSummary();
      redraw();
      toast('新規状態に初期化しました');
    });
  });

  
  /* ---------- 左右ペイン折り畳み機能 ---------- */
  function toggleLeftPane(force) {
    const app = $('.app');
    const willCollapse = typeof force === 'boolean' ? !force : !app.classList.contains('left-collapsed');
    app.classList.toggle('left-collapsed', willCollapse);
    updatePaneButtons();
    try { localStorage.setItem('oshina_left_collapsed', willCollapse ? '1' : '0'); } catch (e) {}
    setTimeout(redraw, 240);
  }

  function toggleRightPane(force) {
    const app = $('.app');
    const willCollapse = typeof force === 'boolean' ? !force : !app.classList.contains('right-collapsed');
    app.classList.toggle('right-collapsed', willCollapse);
    updatePaneButtons();
    try { localStorage.setItem('oshina_right_collapsed', willCollapse ? '1' : '0'); } catch (e) {}
    setTimeout(redraw, 240);
  }

  function updatePaneButtons() {
    const app = $('.app');
    const isLeftCol = app.classList.contains('left-collapsed');
    const isRightCol = app.classList.contains('right-collapsed');

    const btnL = $('#btnToggleLeft');
    if (btnL) {
      btnL.innerHTML = isLeftCol ? '▶ アイテム一覧' : '◀ アイテム一覧';
      btnL.classList.toggle('active', !isLeftCol);
      btnL.title = isLeftCol ? 'アイテム一覧ペインを展開 (Ctrl+B)' : 'アイテム一覧ペインを折り畳む (Ctrl+B)';
    }
    const btnR = $('#btnToggleRight');
    if (btnR) {
      btnR.innerHTML = isRightCol ? '設定パネル ◀' : '設定パネル ▶';
      btnR.classList.toggle('active', !isRightCol);
      btnR.title = isRightCol ? '設定パネルを展開 (Ctrl+Shift+B)' : '設定パネルを折り畳む (Ctrl+Shift+B)';
    }
  }

  function initPaneToggles() {
    $('#btnToggleLeft')?.addEventListener('click', () => toggleLeftPane());
    $('#btnToggleRight')?.addEventListener('click', () => toggleRightPane());

    // キーボードショートカット (Ctrl+S で CSV保存、Ctrl+B でペイン開閉)
    window.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        $('#btnSaveCsv')?.click();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (e.shiftKey) {
          toggleRightPane();
        } else {
          toggleLeftPane();
        }
      }
    });

    // 保存状態復元
    try {
      if (localStorage.getItem('oshina_left_collapsed') === '1') {
        $('.app').classList.add('left-collapsed');
      }
      if (localStorage.getItem('oshina_right_collapsed') === '1') {
        $('.app').classList.add('right-collapsed');
      }
      updatePaneButtons();
    } catch (e) {}
  }

  /* ---------- Undo / Redo 初期化 (Ver.0.55) ---------- */
  function initUndoRedo() {
    $('#btnUndo')?.addEventListener('click', () => handleUndo());
    $('#btnRedo')?.addEventListener('click', () => handleRedo());

    // キーボードショートカット (Ctrl+Z で Undo、Ctrl+Y / Ctrl+Shift+Z で Redo)
    window.addEventListener('keydown', e => {
      // input, textarea, select 等の入力中はブラウザ標準のテキスト編集Undoを優先
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT' ||
        activeEl.isContentEditable
      )) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          if (e.shiftKey) {
            e.preventDefault();
            handleRedo();
          } else {
            e.preventDefault();
            handleUndo();
          }
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          handleRedo();
        }
      }
    });

    updateUndoRedoButtons();
  }

  /* ---------- UI設定（カラーテーマ・アクセント・ダークモード） ---------- */
  function adjustBrightness(hex, percent) {
    if (!hex || hex.length < 7) return hex;
    const num = parseInt(hex.slice(1), 16);
    let r = (num >> 16) + Math.round(255 * (percent / 100));
    let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
    let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function isLightHexColor(hex) {
    if (!hex || !hex.startsWith('#') || (hex.length !== 7 && hex.length !== 4)) return false;
    let h = hex.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 140;
  }

  const UI_CUSTOM_VARS = [
    '--bg', '--stage-bg', '--panel', '--panel-2', '--panel-alt', '--panel-nested',
    '--toolbar-bg', '--placed-bg', '--modal-bg', '--modal-head-bg', '--modal-foot-bg',
    '--card-bg-sample', '--chip-bg', '--chip-active-bg',
    '--text', '--text-muted', '--text-sub', '--muted',
    '--pink', '--pink2', '--pink-soft',
    '--btn-bg', '--btn-hover-bg', '--btn-hover-text', '--btn-border',
    '--input-bg', '--input-border',
    '--line', '--border', '--line-strong', '--scrollbar-thumb',
    '--dropzone-bg', '--dropzone-border'
  ];

  function clearCustomUiInline() {
    for (const p of UI_CUSTOM_VARS) {
      document.body.style.removeProperty(p);
      document.documentElement.style.removeProperty(p);
    }
  }

  function applyCustomUiColors(colors, save = true) {
    if (!colors) {
      clearCustomUiInline();
      try { localStorage.removeItem('oshina_ui_custom'); } catch (e) {}
      syncCustomUiPickers();
      return;
    }
    const targets = [document.body.style, document.documentElement.style];
    const lightPanel = colors.panel ? isLightHexColor(colors.panel) : false;
    for (const st of targets) {
      if (colors.bg) {
        st.setProperty('--bg', colors.bg);
        st.setProperty('--stage-bg', adjustBrightness(colors.bg, isLightHexColor(colors.bg) ? -5 : -3));
      }
      if (colors.panel) {
        const panelAlt = adjustBrightness(colors.panel, lightPanel ? -4 : 6);
        const btnBg = adjustBrightness(colors.panel, lightPanel ? -2 : 8);
        const lineCol = adjustBrightness(colors.panel, lightPanel ? -14 : 12);
        const borderStrong = adjustBrightness(colors.panel, lightPanel ? -22 : 20);
        const borderSub = adjustBrightness(colors.panel, lightPanel ? -20 : 16);
        const nestedBg = adjustBrightness(colors.panel, lightPanel ? -6 : -4);
        st.setProperty('--panel', colors.panel);
        st.setProperty('--panel-2', panelAlt);
        st.setProperty('--panel-alt', panelAlt);
        st.setProperty('--toolbar-bg', colors.panel);
        st.setProperty('--placed-bg', colors.panel);
        st.setProperty('--modal-bg', colors.panel);
        st.setProperty('--modal-foot-bg', nestedBg);
        st.setProperty('--modal-head-bg', adjustBrightness(colors.panel, lightPanel ? -6 : 10));
        st.setProperty('--panel-nested', nestedBg);
        st.setProperty('--dropzone-bg', nestedBg);
        st.setProperty('--btn-bg', btnBg);
        st.setProperty('--chip-bg', btnBg);
        st.setProperty('--card-bg-sample', btnBg);
        st.setProperty('--btn-hover-bg', adjustBrightness(colors.panel, lightPanel ? -8 : 14));
        st.setProperty('--btn-hover-text', lightPanel ? (colors.accent || colors.text || '#1a2332') : '#ffffff');
        st.setProperty('--input-bg', adjustBrightness(colors.panel, lightPanel ? -2 : -4));
        st.setProperty('--line', lineCol);
        st.setProperty('--border', lineCol);
        st.setProperty('--line-strong', borderStrong);
        st.setProperty('--scrollbar-thumb', borderStrong);
        st.setProperty('--btn-border', borderSub);
        st.setProperty('--input-border', borderSub);
        st.setProperty('--dropzone-border', borderSub);
      }
      if (colors.text) {
        const muted = Render.hexA(colors.text, 0.72);
        st.setProperty('--text', colors.text);
        st.setProperty('--text-muted', muted);
        st.setProperty('--text-sub', muted);
        st.setProperty('--muted', Render.hexA(colors.text, 0.56));
      }
      if (colors.accent) {
        st.setProperty('--pink', colors.accent);
        st.setProperty('--pink2', adjustBrightness(colors.accent, 15));
        st.setProperty('--pink-soft', Render.hexA(colors.accent, 0.16));
        st.setProperty('--chip-active-bg', colors.accent);
      }
    }
    if (save) {
      try { localStorage.setItem('oshina_ui_custom', JSON.stringify(colors)); } catch (e) {}
    }
    syncCustomUiPickers(colors);
  }

  function syncCustomUiPickers(colors) {
    const cs = getComputedStyle(document.body);
    const bg = colors?.bg || cs.getPropertyValue('--bg').trim() || '#070b14';
    const panel = colors?.panel || cs.getPropertyValue('--panel').trim() || '#0d1322';
    const text = colors?.text || cs.getPropertyValue('--text').trim() || '#e2e8f5';
    const accent = colors?.accent || cs.getPropertyValue('--pink').trim() || '#3b82f6';
    if ($('#uiCustBg') && bg.startsWith('#')) $('#uiCustBg').value = bg;
    if ($('#uiCustPanel') && panel.startsWith('#')) $('#uiCustPanel').value = panel;
    if ($('#uiCustText') && text.startsWith('#')) $('#uiCustText').value = text;
    if ($('#uiCustAccent') && accent.startsWith('#')) $('#uiCustAccent').value = accent;
  }

  function applyUiTheme(theme) {
    const validThemes = ['dark', 'classic', 'slate', 'light', 'custom'];
    const t = validThemes.includes(theme) ? theme : 'dark';
    document.body.setAttribute('data-ui-theme', t);
    const sel = $('#uiThemeSelect');
    if (sel && sel.value !== t) sel.value = t;
    try { localStorage.setItem('oshina_ui_theme', t); } catch (e) {}

    if (t === 'custom') {
      try {
        const custom = localStorage.getItem('oshina_ui_custom');
        if (custom) {
          applyCustomUiColors(JSON.parse(custom), false);
        } else {
          const colors = {
            bg: $('#uiCustBg')?.value || '#070b14',
            panel: $('#uiCustPanel')?.value || '#0d1322',
            text: $('#uiCustText')?.value || '#e2e8f5',
            accent: $('#uiCustAccent')?.value || '#3b82f6'
          };
          applyCustomUiColors(colors, true);
        }
      } catch (e) {}
    } else {
      // 標準テーマ選択時はインラインのカスタム上書きを解除し、テーマ色を表示
      clearCustomUiInline();
      syncCustomUiPickers();
    }
  }

  function applyUiFontSize(sz) {
    const s = Number(sz) || 13;
    document.body.style.fontSize = s + 'px';
    const sel = $('#uiFontSizeSelect');
    if (sel) sel.value = String(s);
    try { localStorage.setItem('oshina_ui_fontsize', String(s)); } catch (e) {}
  }

  function applyStageBg(bg) {
    const b = bg || 'stage-dark';
    document.body.setAttribute('data-stage-bg', b);
    const sel = $('#uiStageBgSelect');
    if (sel) sel.value = b;
    try { localStorage.setItem('oshina_ui_stagebg', b); } catch (e) {}
  }

  /* ---------- 配置バー位置設定（上側/下側 Ver.0.66） ---------- */
  function applyPlacedBarPos(pos) {
    const p = (pos === 'bottom') ? 'bottom' : 'top';
    document.body.setAttribute('data-placed-bar-pos', p);
    const sel = $('#uiPlacedBarPosSelect');
    if (sel) sel.value = p;

    const center = $('.center');
    const placedBar = $('#placedBar') || $('.placed-bar');
    const canvasStage = $('#canvasStage');
    if (center && placedBar && canvasStage) {
      if (p === 'bottom') {
        center.appendChild(placedBar);
      } else {
        center.insertBefore(placedBar, canvasStage);
      }
    }
    try { localStorage.setItem('oshina_ui_placedbar_pos', p); } catch (e) {}
  }

  function initUiSettings() {
    $('#uiThemeSelect')?.addEventListener('change', e => {
      applyUiTheme(e.target.value);
      toast(`UIテーマを「${e.target.selectedOptions[0].text}」に変更しました`, 'success');
    });

    function updateCustomColorFromInputs() {
      const colors = {
        bg: $('#uiCustBg')?.value,
        panel: $('#uiCustPanel')?.value,
        text: $('#uiCustText')?.value,
        accent: $('#uiCustAccent')?.value
      };
      // ピッカー操作時は自動的にカスタム色調テーマに切り替え
      const sel = $('#uiThemeSelect');
      if (sel && sel.value !== 'custom') {
        sel.value = 'custom';
        document.body.setAttribute('data-ui-theme', 'custom');
        try { localStorage.setItem('oshina_ui_theme', 'custom'); } catch (e) {}
      }
      applyCustomUiColors(colors, true);
    }

    $('#uiCustBg')?.addEventListener('input', updateCustomColorFromInputs);
    $('#uiCustPanel')?.addEventListener('input', updateCustomColorFromInputs);
    $('#uiCustText')?.addEventListener('input', updateCustomColorFromInputs);
    $('#uiCustAccent')?.addEventListener('input', updateCustomColorFromInputs);

    $('#btnResetUiCust')?.addEventListener('click', () => {
      applyCustomUiColors(null);
      applyUiTheme('dark');
      toast('色調をダークモード（標準）に戻しました');
    });

    $('#uiFontSizeSelect')?.addEventListener('change', e => {
      applyUiFontSize(e.target.value);
    });

    $('#uiStageBgSelect')?.addEventListener('change', e => {
      applyStageBg(e.target.value);
      toast(`ステージ背景を「${e.target.selectedOptions[0].text}」に変更しました`);
    });

    $('#uiPlacedBarPosSelect')?.addEventListener('change', e => {
      applyPlacedBarPos(e.target.value);
      toast(`配置バーの表示位置を「${e.target.selectedOptions[0].text}」に変更しました`);
    });

    $('#btnResetUiSettings')?.addEventListener('click', async () => {
      const ok = await confirmModal('UI設定のリセット', 'UIテーマ、フォントサイズ、作業背景などを初期状態（ダークモード）に戻しますか？');
      if (!ok) return;
      applyCustomUiColors(null);
      applyUiTheme('dark');
      applyUiFontSize(13);
      applyStageBg('stage-dark');
      applyPlacedBarPos('top');
      document.documentElement.style.setProperty('--pop-panel-height', '220px');
      try { localStorage.removeItem('oshina_pop_panel_height'); } catch (e) {}
      toggleLeftPane(true);
      toggleRightPane(true);
      toast('UI設定をダークモード（標準）にリセットしました', 'success');
    });

    // 保存状態復元（初期値: ダークモード）
    try {
      const savedTheme = localStorage.getItem('oshina_ui_theme') || 'dark';
      applyUiTheme(savedTheme);

      const savedCustom = localStorage.getItem('oshina_ui_custom');
      if (savedTheme === 'custom' && savedCustom) {
        applyCustomUiColors(JSON.parse(savedCustom), false);
      } else {
        syncCustomUiPickers();
      }

      const savedFontSize = localStorage.getItem('oshina_ui_fontsize');
      if (savedFontSize) applyUiFontSize(savedFontSize);

      const savedStageBg = localStorage.getItem('oshina_ui_stagebg');
      if (savedStageBg) applyStageBg(savedStageBg);

      const savedBarPos = localStorage.getItem('oshina_ui_placedbar_pos') || 'top';
      applyPlacedBarPos(savedBarPos);
    } catch (e) {
      applyUiTheme('dark');
      applyPlacedBarPos('top');
    }
  }

  /* ---------- スプリッター（左右ペイン幅ドラッグ調整） ---------- */
  function initResizers() {
    const app = $('.app');
    const resizerL = $('#resizerLeft');
    const resizerR = $('#resizerRight');
    const resizerLH = $('#resizerLeftH');

    let savedL = null, savedR = null, savedPopH = null;
    try {
      savedL = localStorage.getItem('oshina_left_width');
      savedR = localStorage.getItem('oshina_right_width');
      savedPopH = localStorage.getItem('oshina_pop_panel_height');
    } catch (e) {}
    if (savedL) {
      document.documentElement.style.setProperty('--left-width', `${savedL}px`);
    }
    if (savedR) {
      document.documentElement.style.setProperty('--right-width', `${savedR}px`);
    }
    if (savedPopH) {
      document.documentElement.style.setProperty('--pop-panel-height', `${savedPopH}px`);
    }

    function setupDrag(handle, onMove, onEnd) {
      if (!handle) return;
      handle.addEventListener('pointerdown', e => {
        e.preventDefault();
        handle.setPointerCapture(e.pointerId);
        handle.classList.add('dragging');
        app?.classList.add('resizing');

        const moveHandler = ev => onMove(ev);
        const upHandler = ev => {
          try { handle.releasePointerCapture(ev.pointerId); } catch {}
          handle.classList.remove('dragging');
          app?.classList.remove('resizing');
          window.removeEventListener('pointermove', moveHandler);
          window.removeEventListener('pointerup', upHandler);
          if (onEnd) onEnd();
          redraw();
        };

        window.addEventListener('pointermove', moveHandler);
        window.addEventListener('pointerup', upHandler);
      });
    }

    setupDrag(resizerL, e => {
      const w = Math.max(240, Math.min(600, e.clientX));
      document.documentElement.style.setProperty('--left-width', `${w}px`);
      redraw();
    }, () => {
      const current = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--left-width')) || 320;
      try { localStorage.setItem('oshina_left_width', current); } catch (e) {}
    });

    setupDrag(resizerR, e => {
      const w = Math.max(260, Math.min(520, window.innerWidth - e.clientX));
      document.documentElement.style.setProperty('--right-width', `${w}px`);
      redraw();
    }, () => {
      const current = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--right-width')) || 340;
      try { localStorage.setItem('oshina_right_width', current); } catch (e) {}
    });

    const leftPane = $('.left');
    setupDrag(resizerLH, e => {
      if (!leftPane) return;
      const leftRect = leftPane.getBoundingClientRect();
      const rawH = leftRect.bottom - e.clientY;
      const maxH = Math.max(160, leftRect.height * 0.70);
      const minH = 90;
      const h = Math.round(Math.max(minH, Math.min(maxH, rawH)));
      document.documentElement.style.setProperty('--pop-panel-height', `${h}px`);
    }, () => {
      const current = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--pop-panel-height')) || 220;
      try { localStorage.setItem('oshina_pop_panel_height', current); } catch (e) {}
    });
  }

  /* ---------- アイテム登録モーダル＆クイック画像ドロップ (Ver.0.16) ---------- */
  function initItemModal() {
    // 新規登録ボタン
    $('#btnOpenNewItem')?.addEventListener('click', () => openItemModal(null));
    $('#btnItemModalClose')?.addEventListener('click', closeItemModal);
    $('#btnItemModalCancel')?.addEventListener('click', closeItemModal);
    $('#itemModalBackdrop')?.addEventListener('click', e => {
      if (e.target === $('#itemModalBackdrop')) closeItemModal();
    });

    // 左ペイン全体への画像ファイルドロップ対応（アイテムD&Dと共存）
    const libPanel = $('#libPanel');
    if (libPanel) {
      libPanel.addEventListener('dragover', e => {
        if (e.dataTransfer?.types?.includes('Files')) {
          e.preventDefault();
          libPanel.classList.add('dragover');
        }
      });
      libPanel.addEventListener('dragleave', e => {
        if (!libPanel.contains(e.relatedTarget)) {
          libPanel.classList.remove('dragover');
        }
      });
      libPanel.addEventListener('drop', e => {
        libPanel.classList.remove('dragover');
        if (e.dataTransfer?.files?.length) {
          e.preventDefault();
          handleImageFiles(e.dataTransfer.files);
        }
      });
    }
  }

  /* ---------- 起動時処理 ---------- */
  /* ---------- アイテム一覧の1列/2列切替 (Ver.0.20) ---------- */
  function initLibCols() {
    const libEl = $('#library');
    const btnLibCols = $('#btnToggleLibCols');
    if (!libEl || !btnLibCols) return;

    try {
      const saved = localStorage.getItem('oshina_lib_cols');
      if (saved === '2') {
        libEl.classList.add('grid-2col');
        btnLibCols.textContent = '☰ 1列';
        btnLibCols.title = 'アイテム一覧を1列で表示';
      }
    } catch (e) {}

    btnLibCols.addEventListener('click', () => {
      const is2Col = libEl.classList.toggle('grid-2col');
      btnLibCols.textContent = is2Col ? '☰ 1列' : '⊞ 2列';
      btnLibCols.title = is2Col ? 'アイテム一覧を1列で表示' : 'アイテム一覧を2列で表示';
      try {
        localStorage.setItem('oshina_lib_cols', is2Col ? '2' : '1');
      } catch (e) {}
    });
  }

  initSelectOptions();
  initLibCols();
  renderGenreOptions();
  initPaneToggles();
  initUndoRedo();
  initResizers();
  initItemModal();
  initPopHandlers();
  initImageManager();
  initFolders();
  initUiSettings();
  await Images.loadAll();
  if (window.CustomFonts) {
    await CustomFonts.loadAll();
  }
  const initialPicked = readPickedPcFontsFromStorage();
  if (initialPicked.length > 0) {
    state.pickedPcFonts = initialPicked;
  }
  initFontDropZone();
  initPcFontModal();
  renderFontSelectOptions();
  renderCustomFontList();
  updateImageCacheSummary();

  const saved = await DB.get('state');
  if (saved && typeof saved === 'object') {
    const hasSavedGenres = Array.isArray(saved.genres);
    state = merge(DEFAULT, saved);
    if (typeof window !== 'undefined') window.state = state;
    if (!hasSavedGenres) {
      state.genres = structuredClone(DEFAULT.genres);
    } else if (saved.genreColors && typeof saved.genreColors === 'object') {
      state.genreColors = structuredClone(saved.genreColors);
    }
    if (!state.pops) state.pops = structuredClone(DEFAULT.pops);
    if (!Array.isArray(saved.pickedPcFonts)) {
      const storedPicked = readPickedPcFontsFromStorage();
      if (storedPicked.length > 0) savePickedPcFonts(storedPicked);
    } else {
      savePickedPcFonts(state.pickedPcFonts);
    }
    selectedPlacedUid = state.placed[0]?.uid || null;
    syncFormFromState();
    renderGenreOptions();
    renderLibrary();
    renderPopLibrary();
    renderPlacedBar();
    updateImageCacheSummary();
    redraw();
  } else {
    // 初回起動時は新規作成と同じ初期状態（アイテム0件・配置0枠・デフォルトPOP3件未配置）で起動 (Ver.0.65)
    state = structuredClone(DEFAULT);
    if (typeof window !== 'undefined') window.state = state;
    const storedPicked = readPickedPcFontsFromStorage();
    if (storedPicked.length > 0) state.pickedPcFonts = storedPicked;
    selectedPlacedUid = null;
    clearItemForm();
    await saveState(true);
    syncFormFromState();
    renderGenreOptions();
    renderLibrary();
    renderPopLibrary();
    renderPlacedBar();
    updateImageCacheSummary();
    redraw();
  }

  // 起動時の初期状態をスナップショット記録してUndo/Redoボタン状態を更新 (Ver.0.55)
  archiveCustomFonts();
  lastSavedStateJson = JSON.stringify(state);
  lastSavedFontIds = getCurrentCustomFontIds();
  updateUndoRedoButtons();

  // Webフォント読み込み完了時のキャンバス再描画
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => redraw());
  }
})();
