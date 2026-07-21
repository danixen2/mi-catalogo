const CFG_KEY = 'catalogo_ia_gh_config';

let cfg = null;
let products = [];
let currentSha = null;

function loadCfg() {
  const raw = localStorage.getItem(CFG_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveCfg(c) {
  localStorage.setItem(CFG_KEY, JSON.stringify(c));
}

function ghHeaders() {
  return {
    'Authorization': `token ${cfg.token}`,
    'Accept': 'application/vnd.github+json',
  };
}

function apiUrl() {
  return `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${cfg.path}`;
}

function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function fromBase64(str) {
  return decodeURIComponent(escape(atob(str.replace(/\n/g, ''))));
}

function setStatus(msg, type) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = 'status ' + (type || 'info');
  el.classList.remove('hidden');
}

function clearStatus() {
  document.getElementById('status').classList.add('hidden');
}

// ---------- Config ----------

function initConfigForm() {
  const existing = loadCfg();
  if (existing) {
    document.getElementById('cfg-owner').value = existing.owner;
    document.getElementById('cfg-repo').value = existing.repo;
    document.getElementById('cfg-branch').value = existing.branch;
    document.getElementById('cfg-path').value = existing.path;
    document.getElementById('cfg-token').value = existing.token;
  }
}

document.getElementById('cfg-form').addEventListener('submit', (e) => {
  e.preventDefault();
  cfg = {
    owner: document.getElementById('cfg-owner').value.trim(),
    repo: document.getElementById('cfg-repo').value.trim(),
    branch: document.getElementById('cfg-branch').value.trim() || 'main',
    path: document.getElementById('cfg-path').value.trim() || 'products.json',
    token: document.getElementById('cfg-token').value.trim(),
  };
  saveCfg(cfg);
  document.getElementById('editor-panel').classList.remove('hidden');
  fetchProducts();
});

document.getElementById('cfg-forget').addEventListener('click', () => {
  localStorage.removeItem(CFG_KEY);
  location.reload();
});

// ---------- Fetch / Save ----------

async function fetchProducts() {
  clearStatus();
  setStatus('Cargando catálogo desde GitHub…', 'info');
  try {
    const res = await fetch(apiUrl() + `?ref=${cfg.branch}`, { headers: ghHeaders() });
    if (res.status === 404) {
      products = [];
      currentSha = null;
      setStatus('No se encontró products.json todavía — al guardar se creará.', 'info');
      renderList();
      return;
    }
    if (!res.ok) throw new Error(`GitHub respondió ${res.status}`);
    const data = await res.json();
    currentSha = data.sha;
    products = JSON.parse(fromBase64(data.content));
    clearStatus();
    renderList();
  } catch (err) {
    setStatus('Error al cargar: ' + err.message, 'err');
  }
}

async function saveProducts() {
  setStatus('Guardando en GitHub…', 'info');
  try {
    const body = {
      message: 'Actualiza catálogo (' + new Date().toISOString() + ')',
      content: toBase64(JSON.stringify(products, null, 2)),
      branch: cfg.branch,
    };
    if (currentSha) body.sha = currentSha;

    const res = await fetch(apiUrl(), {
      method: 'PUT',
      headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `GitHub respondió ${res.status}`);
    }

    const data = await res.json();
    currentSha = data.content.sha;
    setStatus('Guardado. El catálogo público se va a actualizar en 1-2 minutos.', 'ok');
  } catch (err) {
    setStatus('Error al guardar: ' + err.message + ' — si dice "sha mismatch", tocá "Recargar" y volvé a intentar.', 'err');
  }
}

// ---------- Render list ----------

function renderList() {
  const container = document.getElementById('product-list');
  container.innerHTML = '';

  if (products.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:0.88rem;">Todavía no agregaste ningún pack.</p>';
    return;
  }

  products.forEach((p, i) => {
    const item = document.createElement('div');
    item.className = 'product-item';
    item.innerHTML = `
      <div class="top">
        <strong>${escapeHtml(p.name || '(sin nombre)')}</strong>
        <button class="btn-danger" data-action="delete" data-i="${i}">Eliminar</button>
      </div>
      <div class="field"><label>Nombre</label><input data-field="name" data-i="${i}" value="${escapeAttr(p.name)}"></div>
      <div class="field"><label>Descripción</label><textarea data-field="description" data-i="${i}">${escapeHtml(p.description || '')}</textarea></div>
      <div class="field"><label>Tags (separados por coma)</label><input data-field="tags" data-i="${i}" value="${escapeAttr((p.tags || []).join(', '))}"></div>
      <div class="field"><label>URL de imagen</label><input data-field="image" data-i="${i}" value="${escapeAttr(p.image)}"></div>
      <div class="row2">
        <div class="field"><label>Link de compra</label><input data-field="purchaseLink" data-i="${i}" value="${escapeAttr(p.purchaseLink)}"></div>
        <div class="field"><label>Link de muestra gratis</label><input data-field="sampleLink" data-i="${i}" value="${escapeAttr(p.sampleLink)}"></div>
      </div>
    `;
    container.appendChild(item);
  });

  container.querySelectorAll('[data-field]').forEach(el => {
    el.addEventListener('input', (e) => {
      const i = parseInt(e.target.dataset.i, 10);
      const field = e.target.dataset.field;
      if (field === 'tags') {
        products[i][field] = e.target.value.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      } else {
        products[i][field] = e.target.value;
      }
    });
  });

  container.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const i = parseInt(e.target.dataset.i, 10);
      if (confirm('¿Eliminar "' + (products[i].name || 'este pack') + '"?')) {
        products.splice(i, 1);
        renderList();
      }
    });
  });
}

document.getElementById('add-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = 'pack-' + Date.now();
  products.push({
    id,
    name: document.getElementById('new-name').value.trim(),
    description: document.getElementById('new-desc').value.trim(),
    tags: document.getElementById('new-tags').value.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
    image: document.getElementById('new-image').value.trim(),
    purchaseLink: document.getElementById('new-purchase').value.trim(),
    sampleLink: document.getElementById('new-sample').value.trim(),
  });
  e.target.reset();
  renderList();
});

document.getElementById('reload-btn').addEventListener('click', fetchProducts);
document.getElementById('save-btn').addEventListener('click', saveProducts);

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;');
}

// ---------- Init ----------

initConfigForm();
const savedCfg = loadCfg();
if (savedCfg) {
  cfg = savedCfg;
  document.getElementById('editor-panel').classList.remove('hidden');
  fetchProducts();
}
