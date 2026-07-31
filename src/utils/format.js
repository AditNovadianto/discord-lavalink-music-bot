function formatTime(milliseconds = 0) {
  const totalSeconds = Math.floor(Number(milliseconds) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function safeMessage(error, max = 450) {
  const raw = error instanceof Error ? error.message : String(error || 'Tidak diketahui');
  const compact = raw.replace(/\s+/g, ' ').trim();
  return compact.length > max ? `${compact.slice(0, max - 3)}...` : compact;
}

module.exports = { formatTime, safeMessage };
