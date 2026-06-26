function initSortTable(tableId) {
  let sortCol = -1;
  let sortAsc = true;

  document.querySelectorAll(`#${tableId} th.sortable`).forEach(th => {
    th.addEventListener('click', () => {
      const col = Number(th.dataset.col);
      if (sortCol === col) {
        sortAsc = !sortAsc;
      } else {
        sortCol = col;
        sortAsc = true;
      }

      document.querySelectorAll(`#${tableId} th.sortable`).forEach(h => h.classList.remove('asc', 'desc'));
      th.classList.add(sortAsc ? 'asc' : 'desc');

      const tbody = document.querySelector(`#${tableId} tbody`);
      const rows = Array.from(tbody.querySelectorAll('tr'));

      rows.sort((a, b) => {
        const cellA = a.cells[col];
        const cellB = b.cells[col];
        const valA = cellA.dataset.val !== undefined ? Number(cellA.dataset.val) : cellA.textContent.trim().toLowerCase();
        const valB = cellB.dataset.val !== undefined ? Number(cellB.dataset.val) : cellB.textContent.trim().toLowerCase();

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });

      rows.forEach(r => tbody.appendChild(r));
    });
  });
}