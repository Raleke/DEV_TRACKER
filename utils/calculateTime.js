
const msToSeconds = (ms) => Math.floor(ms / 1000);


const formatDuration = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((val) => String(val).padStart(2, "0"))
    .join(":");
};


const calculateDuration = (start, end) => {
  if (!start || !end) return 0;
  return msToSeconds(new Date(end) - new Date(start));
};

module.exports = {
  msToSeconds,
  formatDuration,
  calculateDuration,
};