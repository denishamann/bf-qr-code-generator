import QRCode from 'qrcode';

const STORAGE_KEYS = {
  CARD_NUMBER: 'bf_card_number',
  DEVICE_ID: 'bf_device_id',
  CONSTANT: 'bf_constant'
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

async function displayQRCode(cardNumber: string, constant: string, deviceId: string) {
  const canvas = document.getElementById('qrCanvas') as HTMLCanvasElement;
  const qrDataElement = document.getElementById('qrData') as HTMLParagraphElement;
  const qrData = await generateQRCodeData(cardNumber, constant, deviceId);
  
  await QRCode.toCanvas(canvas, qrData, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
  
  qrDataElement.textContent = qrData;
}

let refreshInterval: number | null = null;

function startQRRefresh(cardNumber: string, constant: string, deviceId: string) {
  const progressBar = document.getElementById('progressBar') as HTMLDivElement;
  const REFRESH_INTERVAL = 5000;
  
  function resetAndAnimate() {
    progressBar.style.transition = 'none';
    progressBar.style.width = '100%';
    void progressBar.offsetWidth;
    progressBar.style.transition = 'width 5s linear';
    progressBar.style.width = '0%';
  }
  
  displayQRCode(cardNumber, constant, deviceId);
  resetAndAnimate();
  
  refreshInterval = window.setInterval(() => {
    displayQRCode(cardNumber, constant, deviceId);
    resetAndAnimate();
  }, REFRESH_INTERVAL);
}

function skipToNextQR(cardNumber: string, constant: string, deviceId: string) {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    startQRRefresh(cardNumber, constant, deviceId);
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
  
  const cardNumberInput = document.getElementById('cardNumber') as HTMLInputElement;
  const deviceIdInput = document.getElementById('deviceId') as HTMLInputElement;
  const constantInput = document.getElementById('constant') as HTMLInputElement;
  
  const generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;
  const backBtn = document.getElementById('backBtn') as HTMLButtonElement;
  const skipQrBtn = document.getElementById('skipQrBtn') as HTMLButtonElement;
  
  // Checks for URL parameters first, then fall back to localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const urlCardNumber = urlParams.get('cardNumber');
  const urlDeviceId = urlParams.get('deviceId');
  const urlConstant = urlParams.get('constant');
  
  cardNumberInput.value = urlCardNumber || localStorage.getItem(STORAGE_KEYS.CARD_NUMBER) || '';
  deviceIdInput.value = urlDeviceId || localStorage.getItem(STORAGE_KEYS.DEVICE_ID) || '';
  constantInput.value = urlConstant || localStorage.getItem(STORAGE_KEYS.CONSTANT) || '';
  
  generateBtn.addEventListener('click', () => {
    const cardNumber = cardNumberInput.value.trim();
    const deviceId = deviceIdInput.value.trim();
    const constant = constantInput.value.trim();
    
    if (!cardNumber || !deviceId || !constant) {
      alert('Please fill in all fields');
      return;
    }
    
    localStorage.setItem(STORAGE_KEYS.CARD_NUMBER, cardNumber);
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    localStorage.setItem(STORAGE_KEYS.CONSTANT, constant);
    
    configSection.style.display = 'none';
    qrSection.style.display = 'flex';
    
    startQRRefresh(cardNumber, constant, deviceId);
  });
  
  backBtn.addEventListener('click', () => {
    stopQRRefresh();
    qrSection.style.display = 'none';
    configSection.style.display = 'block';
  });
  
  skipQrBtn.addEventListener('click', () => {
    const cardNumber = cardNumberInput.value.trim();
    const deviceId = deviceIdInput.value.trim();
    const constant = constantInput.value.trim();
    skipToNextQR(cardNumber, constant, deviceId);
  });
});
