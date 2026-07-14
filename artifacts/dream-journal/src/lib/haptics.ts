let isHapticEnabled = true;

export function setHapticEnabled(enabled: boolean) {
  isHapticEnabled = enabled;
}

export function haptic(type: 'tap' | 'success' | 'error' | 'heavy') {
  if (!isHapticEnabled || typeof navigator === 'undefined' || !navigator.vibrate) {
    return;
  }
  
  switch (type) {
    case 'tap':
      navigator.vibrate(10);
      break;
    case 'success':
      navigator.vibrate([15, 8, 25]);
      break;
    case 'error':
      navigator.vibrate([80, 20, 80]);
      break;
    case 'heavy':
      navigator.vibrate(60);
      break;
  }
}
