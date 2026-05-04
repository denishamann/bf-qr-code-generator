import QRCode from 'qrcode';

const STORAGE_KEYS = {
  CARD_NUMBER: 'bf_card_number',
  DEVICE_ID: 'bf_device_id',
  CONSTANT: 'bf_constant'
};

type ViewConfig = {
  canvasId: string;
  qrDataId?: string;
  progressBarId?: string;
};

const VIEW_NEW: ViewConfig = {
  canvasId: 'qrCanvas'
};

const VIEW_DEBUG: ViewConfig = {
  canvasId: 'qrCanvasDebug',
  qrDataId: 'qrDataDebug',
  progressBarId: 'progressBarDebug'
};

async function generateHash(cardNr: string, constant: string, iat: number, deviceId: string): Promise<string> {
  const dataToHash = cardNr + constant + iat + deviceId;
  const encoder = new TextEncoder();
  const data = encoder.encode(dataToHash);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.slice(-8).toUpperCase();
}

async function generateQRCodeData(cardNumber: string, constant: string, deviceId: string): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const hash = await generateHash(cardNumber, constant, timestamp, deviceId);
  return `GM2:${cardNumber}:${constant}:${timestamp}:${hash}`;
}

async function displayQRCode(view: ViewConfig, cardNumber: string, constant: string, deviceId: string) {
  const canvas = document.getElementById(view.canvasId) as HTMLCanvasElement | null;
  if (!canvas) return;
  const qrData = await generateQRCodeData(cardNumber, constant, deviceId);

  await QRCode.toCanvas(canvas, qrData, {
    width: 360,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  canvas.style.width = '';
  canvas.style.height = '';

  if (view.qrDataId) {
    const qrDataElement = document.getElementById(view.qrDataId);
    if (qrDataElement) qrDataElement.textContent = qrData;
  }
}

let refreshInterval: number | null = null;

function startQRRefresh(view: ViewConfig, cardNumber: string, constant: string, deviceId: string) {
  const REFRESH_INTERVAL = 5000;
  const progressBar = view.progressBarId
    ? (document.getElementById(view.progressBarId) as HTMLDivElement | null)
    : null;

  function resetAndAnimate() {
    if (!progressBar) return;
    progressBar.style.transition = 'none';
    progressBar.style.width = '100%';
    void progressBar.offsetWidth;
    progressBar.style.transition = 'width 5s linear';
    progressBar.style.width = '0%';
  }

  displayQRCode(view, cardNumber, constant, deviceId);
  resetAndAnimate();

  refreshInterval = window.setInterval(() => {
    displayQRCode(view, cardNumber, constant, deviceId);
    resetAndAnimate();
  }, REFRESH_INTERVAL);
}

function skipToNextQR(view: ViewConfig, cardNumber: string, constant: string, deviceId: string) {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    startQRRefresh(view, cardNumber, constant, deviceId);
  }
}

function stopQRRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const configSection = document.getElementById('configSection') as HTMLDivElement;
  const qrSection = document.getElementById('qrSection') as HTMLDivElement;
  const qrSectionDebug = document.getElementById('qrSectionDebug') as HTMLDivElement;

  const cardNumberInput = document.getElementById('cardNumber') as HTMLInputElement;
  const deviceIdInput = document.getElementById('deviceId') as HTMLInputElement;
  const constantInput = document.getElementById('constant') as HTMLInputElement;

  const generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;
  const debugBtn = document.getElementById('debugBtn') as HTMLButtonElement;
  const closeBtn = document.getElementById('closeBtn') as HTMLButtonElement;
  const helpBtn = document.getElementById('helpBtn') as HTMLButtonElement;
  const backBtnDebug = document.getElementById('backBtnDebug') as HTMLButtonElement;
  const skipQrBtnDebug = document.getElementById('skipQrBtnDebug') as HTMLButtonElement;

  // Checks for URL parameters first, then fall back to localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const urlCardNumber = urlParams.get('cardNumber');
  const urlDeviceId = urlParams.get('deviceId');
  const urlConstant = urlParams.get('constant');

  cardNumberInput.value = urlCardNumber || localStorage.getItem(STORAGE_KEYS.CARD_NUMBER) || '';
  deviceIdInput.value = urlDeviceId || localStorage.getItem(STORAGE_KEYS.DEVICE_ID) || '';
  constantInput.value = urlConstant || localStorage.getItem(STORAGE_KEYS.CONSTANT) || '';

  function readForm(): { cardNumber: string; deviceId: string; constant: string } | null {
    const cardNumber = cardNumberInput.value.trim();
    const deviceId = deviceIdInput.value.trim();
    const constant = constantInput.value.trim();

    if (!cardNumber || !deviceId || !constant) {
      alert('Please fill in all fields');
      return null;
    }

    localStorage.setItem(STORAGE_KEYS.CARD_NUMBER, cardNumber);
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    localStorage.setItem(STORAGE_KEYS.CONSTANT, constant);

    return { cardNumber, deviceId, constant };
  }

  function showConfig() {
    stopQRRefresh();
    qrSection.style.display = 'none';
    qrSectionDebug.style.display = 'none';
    configSection.style.display = 'block';
  }

  generateBtn.addEventListener('click', () => {
    const form = readForm();
    if (!form) return;
    configSection.style.display = 'none';
    qrSectionDebug.style.display = 'none';
    qrSection.style.display = 'flex';
    startQRRefresh(VIEW_NEW, form.cardNumber, form.constant, form.deviceId);
  });

  debugBtn.addEventListener('click', () => {
    const form = readForm();
    if (!form) return;
    configSection.style.display = 'none';
    qrSection.style.display = 'none';
    qrSectionDebug.style.display = 'flex';
    startQRRefresh(VIEW_DEBUG, form.cardNumber, form.constant, form.deviceId);
  });

  closeBtn.addEventListener('click', showConfig);
  backBtnDebug.addEventListener('click', showConfig);

  helpBtn.addEventListener('click', () => {
    // Stubbed per design — wire up a real help flow when ready.
  });

  skipQrBtnDebug.addEventListener('click', () => {
    const form = readForm();
    if (!form) return;
    skipToNextQR(VIEW_DEBUG, form.cardNumber, form.constant, form.deviceId);
  });
});
