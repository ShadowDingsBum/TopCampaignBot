//Formatting functions to transform score (ms) to readable time (min,sec,ms)

export function formatTime(milliseconds) {
  const ms = milliseconds % 1000;
  let seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;

  const formattedMs = ms.toString().padStart(3, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');
  const formattedMinutes = minutes > 0 ? `${minutes}:` : '';

  return `${formattedMinutes}${formattedSeconds}.${formattedMs}`;
}

export function formatTimeDifference(newTime, oldTime) {
  const difference = newTime - oldTime;
  const sign = difference < 0 ? '-' : '+';
  const absoluteDifference = Math.abs(difference);
  const ms = absoluteDifference % 1000;
  let seconds = Math.floor(absoluteDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;

  const formattedMs = ms.toString().padStart(3, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');
  const formattedMinutes = minutes > 0 ? `${minutes}:` : '';

  return `${sign}${formattedMinutes}${formattedSeconds}.${formattedMs}s`;
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
