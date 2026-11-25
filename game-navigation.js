function installGameNavigation(doc, mode) {
  const start = doc.getElementById('startScreen');
  if (!start || start.querySelector('.edition-navigation')) return;
  for (const link of start.querySelectorAll('a[href]')) {
    if (link.matches('.mode-link') || /생존판|디펜스판|생존 모드|디펜스 플레이/.test(link.textContent)) link.remove();
  }
  const nav = doc.createElement('nav');
  nav.className = 'edition-navigation';
  nav.setAttribute('aria-label','게임 선택');
  for (const [id, label, url] of [['survival','생존판','./'],['defense','디펜스판','./defense.html']]) {
    const item = doc.createElement(id === mode ? 'span' : 'a');
    item.textContent = label;
    if (id === mode) item.setAttribute('aria-current','page');
    else {item.href = url; item.target = '_top';}
    nav.append(item);
  }
  const home = doc.createElement('a');
  home.className = 'return-to-portal';
  home.href = 'https://skyiu2017-ux.github.io/history-class/#red-eyes';
  home.target = '_top';
  home.textContent = '← 역사포털';
  nav.append(home);
  start.prepend(nav);
  const styles = doc.createElement('style');
  styles.textContent = `.edition-navigation{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin:0 0 16px;padding-bottom:12px;border-bottom:1px solid var(--line,#393531)}
  .edition-navigation>*{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:44px;padding:4px 14px;border:1px solid var(--line,#393531);border-radius:6px;background:var(--panel2,#202327);color:var(--text,#e1dfd8);font:inherit;text-decoration:none}
  .edition-navigation>[aria-current]{font-weight:bold;color:var(--accent,#d9a85a);border-color:currentColor}
  .edition-navigation>.return-to-portal{margin-inline-start:auto;border-color:transparent;background:transparent;padding-inline:6px;color:var(--text,#e1dfd8)}
  .edition-navigation>a:hover,.edition-navigation>a:focus-visible{outline:2px solid var(--accent,#d9a85a);outline-offset:1px}`;
  doc.head.append(styles);
}