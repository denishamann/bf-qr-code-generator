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
}

let refreshInterval: number | null = null;

function startQRRefresh(cardNumber: string, constant: string, deviceId: string) {
  const REFRESH_INTERVAL = 5000;

  displayQRCode(cardNumber, constant, deviceId);

  refreshInterval = window.setInterval(() => {
    displayQRCode(cardNumber, constant, deviceId);
  }, REFRESH_INTERVAL);
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
  const closeBtn = document.getElementById('closeBtn') as HTMLButtonElement;
  const helpBtn = document.getElementById('helpBtn') as HTMLButtonElement;
  
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
  
  closeBtn.addEventListener('click', () => {
    stopQRRefresh();
    qrSection.style.display = 'none';
    configSection.style.display = 'block';
  });

  helpBtn.addEventListener('click', () => {
    // Stubbed per design — wire up a real help flow when ready.
  });
});
