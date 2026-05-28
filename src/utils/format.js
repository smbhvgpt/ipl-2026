export function formatDateLabel(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatDateShort(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export function pluralize(n, w) { return `${n} ${w}${n === 1 ? '' : 's'}`; }

// Build an IST timestamp for a match
export function matchDateTime(isoDate, timeStr) {
  // timeStr like "19:30 IST"
  const [hhmm] = timeStr.split(' ');
  const [h, m] = hhmm.split(':').map(Number);
  // Convert IST → UTC: subtract 5h30m
  const local = new Date(Date.UTC(
    Number(isoDate.slice(0, 4)),
    Number(isoDate.slice(5, 7)) - 1,
    Number(isoDate.slice(8, 10)),
    h - 5,
    m - 30
  ));
  return local;
}

export function diffParts(targetMs, nowMs) {
  let diff = Math.max(0, targetMs - nowMs);
  const days = Math.floor(diff / 86400000); diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
  const minutes = Math.floor(diff / 60000); diff -= minutes * 60000;
  const seconds = Math.floor(diff / 1000);
  return { days, hours, minutes, seconds, total: targetMs - nowMs };
}
