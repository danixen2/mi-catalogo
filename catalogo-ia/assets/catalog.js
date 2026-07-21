const state = {
  products: [],
  activeTags: new Set(),
};

async function loadProducts() {
  const res = await fetch('products.json?t=' + Date.now()); // evita cache vieja
  state.products = await res.json();
  renderFilters();
  renderGrid();
}

function renderFilters() {
  const tags = new Set();
  state.products.forEach(p => (p.tags || []).forEach(t => tags.add(t)));

  const container = document.getElementById('filters');
  container.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = 'chip' + (state.activeTags.size === 0 ? ' active' : '');
  allBtn.textContent = 'todos';
  allBtn.onclick = () => { state.activeTags.clear(); renderFilters(); renderGrid(); };
  container.appendChild(allBtn);

  [...tags].sort().forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (state.activeTags.has(tag) ? ' active' : '');
    btn.textContent = tag;
    btn.onclick = () => {
      state.activeTags.has(tag) ? state.activeTags.delete(tag) : state.activeTags.add(tag);
      renderFilters();
      renderGrid();
    };
    container.appendChild(btn);
  });
}

function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  const visible = state.products.filter(p => {
    if (state.activeTags.size === 0) return true;
    return (p.tags || []).some(t => state.activeTags.has(t));
  });

  if (visible.length === 0) {
    grid.innerHTML = '<div class="empty">No hay packs con esos filtros todavía.</div>';
    return;
  }

  visible.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'card';

    const num = String(i + 1).padStart(3, '0');

    card.innerHTML = `
      <img class="thumb" src="${escapeHtml(p.image || '')}" alt="${escapeHtml(p.name)}" loading="lazy">
      <div class="stamp">N.º ${num}</div>
      <div class="body">
        <div class="tags">
          ${(p.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
        </div>
        <h3>${escapeHtml(p.name)}</h3>
        <p class="desc">${escapeHtml(p.description || '')}</p>
        <div class="actions">
          ${p.sampleLink ? `<a class="btn ghost" href="${escapeHtml(p.sampleLink)}" target="_blank" rel="noopener">Ver muestra gratis</a>` : ''}
          ${p.purchaseLink ? `<a class="btn primary" href="${escapeHtml(p.purchaseLink)}" target="_blank" rel="noopener">Comprar</a>` : ''}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

loadProducts();
