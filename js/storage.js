/* ============================================================================
 * 2. IndexedDB ストレージ＆ツール内画像フォルダ (window.DB, window.Images)
 * ============================================================================ */
const DB = (() => {
  let dbp = null;
  const memFallback = new Map();
  function open() {
    if (!dbp) {
      dbp = new Promise((res, rej) => {
        try {
          const r = indexedDB.open('oshinagaking', 1);
          r.onupgradeneeded = () => r.result.createObjectStore('kv');
          r.onsuccess = () => res(r.result);
          r.onerror = () => rej(r.error);
        } catch (e) {
          rej(e);
        }
      });
    }
    return dbp;
  }
  async function tx(mode, fn, fallbackFn) {
    try {
      const db = await open();
      return await new Promise((res, rej) => {
        const t = db.transaction('kv', mode);
        const req = fn(t.objectStore('kv'));
        t.oncomplete = () => res(req ? req.result : undefined);
        t.onerror = () => rej(t.error);
        t.onabort = () => rej(t.error || new Error('Transaction aborted'));
      });
    } catch {
      return fallbackFn();
    }
  }
  return {
    get: k => tx('readonly', s => s.get(k), () => memFallback.get(k)),
    set: (k, v) => tx('readwrite', s => s.put(v, k), () => { memFallback.set(k, v); }),
    del: k => tx('readwrite', s => s.delete(k), () => { memFallback.delete(k); }),
    keys: () => tx('readonly', s => s.getAllKeys(), () => [...memFallback.keys()]),
  };
})();
window.DB = DB;

const Images = {
  data: new Map(),   // id -> dataURL
  cache: new Map(),  // id -> HTMLImageElement
  newId() { return 'img_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); },
  isSampleImage(id) {
    return String(id || '').startsWith('sample_');
  },
  async put(dataURL, id) {
    id = id || this.newId();
    await DB.set('img:' + id, dataURL);
    this.data.set(id, dataURL);
    await this.decode(id);
    return id;
  },
  decode(id) {
    return new Promise(res => {
      const d = this.data.get(id);
      if (!d) return res(null);
      const im = new Image();
      im.onload = () => { this.cache.set(id, im); res(im); };
      im.onerror = () => res(null);
      im.src = d;
    });
  },
  get(id) {
    return id ? (this.cache.get(id) || null) : null;
  },
  /** 現在のstateから参照されている全画像IDのSetを取得 (Ver.0.32) */
  getUsedIds(state) {
    const used = new Set();
    if (!state) return used;
    if (state.items && Array.isArray(state.items)) {
      for (const it of state.items) {
        if (it.imageId) used.add(it.imageId);
      }
    }
    if (state.pops && Array.isArray(state.pops)) {
      for (const p of state.pops) {
        if (p.imageId) used.add(p.imageId);
      }
    }
    if (state.bg && state.bg.imageId) {
      used.add(state.bg.imageId);
    }
    return used;
  },
  /** 現在保持している全画像の統計リストと合計概算バイト数を算出 (Ver.0.32) */
  getStats(usedIdsSet = new Set()) {
    const list = [];
    let totalBytes = 0;
    for (const [id, dUrl] of this.data.entries()) {
      // DataURL文字列長からBase64の概算バイト数を算出 (約3/4)
      const byteSize = Math.round((dUrl.length * 3) / 4);
      totalBytes += byteSize;
      const isSample = this.isSampleImage(id);
      list.push({
        id,
        dataUrl: dUrl,
        byteSize,
        isUsed: usedIdsSet ? usedIdsSet.has(id) : false,
        isSample
      });
    }
    return { list, totalBytes };
  },
  /** 使用されていない孤立画像キャッシュを一括削除 (Ver.0.32) */
  async purgeUnused(usedIdsSet = new Set()) {
    let deletedCount = 0;
    const toDelete = [];
    for (const id of this.data.keys()) {
      if (!usedIdsSet.has(id) && !this.isSampleImage(id)) {
        toDelete.push(id);
      }
    }
    for (const id of toDelete) {
      await this.del(id);
      deletedCount++;
    }
    return deletedCount;
  },
  /** すべての画像を完全削除 (Ver.0.32) */
  async clearAll() {
    const keys = [...this.data.keys()];
    for (const id of keys) {
      await this.del(id);
    }
  },
  async del(id) {
    if (!id) return;
    this.data.delete(id);
    this.cache.delete(id);
    await DB.del('img:' + id);
  },
  async loadAll() {
    const keys = (await DB.keys()) || [];
    for (const k of keys) {
      if (typeof k === 'string' && k.startsWith('img:')) {
        const id = k.slice(4);
        const d = await DB.get(k);
        if (d) {
          this.data.set(id, d);
          await this.decode(id);
        }
      }
    }
  },
  /** 画像ファイルを無劣化でそのまま DataURL として読み込む（フォルダ読込時の再縮小防止） */
  readFile(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onerror = () => rej(new Error('File read error'));
      reader.onload = () => res(reader.result);
      reader.readAsDataURL(file);
    });
  },
  /** 画像ファイルを適切な解像度（長辺最大 maxSide px）にリサイズして DataURL 化 */
  resizeFile(file, maxSide = 900) {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onerror = () => rej(new Error('File read error'));
      reader.onload = () => {
        const im = new Image();
        im.onerror = () => rej(new Error('Image decode error'));
        im.onload = () => {
          let w = im.naturalWidth || im.width;
          let h = im.naturalHeight || im.height;
          if (w > maxSide || h > maxSide) {
            if (w >= h) { h = Math.round(h * (maxSide / w)); w = maxSide; }
            else { w = Math.round(w * (maxSide / h)); h = maxSide; }
          }
          const c = document.createElement('canvas');
          c.width = Math.max(1, w);
          c.height = Math.max(1, h);
          const ctx = c.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(im, 0, 0, w, h);
          let hasAlpha = false;
          const alphaFormats = ['image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml'];
          if (alphaFormats.includes(file.type) || !file.type) {
            try {
              const imgData = ctx.getImageData(0, 0, w, h).data;
              for (let i = 3; i < imgData.length; i += 4) {
                if (imgData[i] < 250) {
                  hasAlpha = true;
                  break;
                }
              }
            } catch (e) {
              hasAlpha = true;
            }
          }
          const outUrl = hasAlpha ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.88);
          res(outUrl);
        };
        im.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  },
};
window.Images = Images;

/* ============================================================================
 * 3. ユーザー追加フォント管理モジュール (window.CustomFonts Ver.0.38)
 * ============================================================================ */
const CustomFonts = {
  data: new Map(), // id -> { id, name, family, fileName, dataUrl, byteSize }
  newId() {
    return 'cfont_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  },
  async registerFontFace(meta) {
    if (!meta || !meta.family || !meta.dataUrl) return null;
    if (typeof FontFace === 'undefined') return null;
    try {
      const face = new FontFace(meta.family, `url(${meta.dataUrl})`);
      await face.load();
      document.fonts.add(face);
      return face;
    } catch (err) {
      console.warn('FontFace の読み込みに失敗しました:', meta.name || meta.family, err);
      return null;
    }
  },
  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('フォントファイルの読み込みに失敗しました'));
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  },
  async putFile(file, customName = '') {
    const dataUrl = await this.readFileAsDataURL(file);
    const id = this.newId();
    const fileName = file.name || 'font.ttf';
    const defaultName = fileName.replace(/\.[^/.]+$/, '').trim() || 'CustomFont';
    const name = (customName && customName.trim()) ? customName.trim() : defaultName;
    const family = 'CustomFont_' + id;
    const byteSize = file.size || Math.round((dataUrl.length * 3) / 4);
    const meta = { id, name, family, fileName, dataUrl, byteSize };

    await this.registerFontFace(meta);
    this.data.set(id, meta);
    await DB.set('font:' + id, meta);
    return meta;
  },
  async putMeta(meta) {
    if (!meta || !meta.id) return null;
    if (!meta.family) meta.family = 'CustomFont_' + meta.id;
    if (!meta.name) meta.name = meta.fileName ? meta.fileName.replace(/\.[^/.]+$/, '').trim() : 'CustomFont';
    if (!meta.byteSize && meta.dataUrl) {
      meta.byteSize = Math.round((meta.dataUrl.length * 3) / 4);
    }
    if (meta.dataUrl) {
      await this.registerFontFace(meta);
    }
    this.data.set(meta.id, meta);
    await DB.set('font:' + meta.id, meta);
    return meta;
  },
  async del(id) {
    if (!id) return;
    const meta = this.data.get(id);
    if (meta && meta.family && typeof document !== 'undefined' && document.fonts) {
      try {
        for (const face of document.fonts) {
          if (face.family === meta.family || face.family === `"${meta.family}"` || face.family === `'${meta.family}'`) {
            document.fonts.delete(face);
          }
        }
      } catch (e) {}
    }
    this.data.delete(id);
    await DB.del('font:' + id);
  },
  async clear() {
    for (const id of [...this.data.keys()]) {
      await this.del(id);
    }
  },
  async loadAll() {
    const keys = (await DB.keys()) || [];
    for (const k of keys) {
      if (typeof k === 'string' && k.startsWith('font:')) {
        const id = k.slice(5);
        const meta = await DB.get(k);
        if (meta) {
          meta.id = meta.id || id;
          if (!meta.family) meta.family = 'CustomFont_' + meta.id;
          if (meta.dataUrl) {
            await this.registerFontFace(meta);
          }
          this.data.set(meta.id, meta);
        }
      }
    }
  },
  list() {
    return [...this.data.values()];
  },
  get(id) {
    return id ? (this.data.get(id) || null) : null;
  }
};
window.CustomFonts = CustomFonts;
