const d = new Date();
const start = new Date(d.getFullYear(), d.getMonth() - 1, 1);
const end = new Date(d.getFullYear(), d.getMonth(), 0);

const fmtLocal = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

console.log(fmtLocal(start), fmtLocal(end));