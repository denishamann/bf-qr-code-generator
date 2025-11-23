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
let countdownInterval: number | null = null;

function startQRRefresh(cardNumber: string, constant: string, deviceId: string) {
  displayQRCode(cardNumber, constant, deviceId);
  
  let secondsLeft = 5;
  const countdownElement = document.getElementById('countdown') as HTMLParagraphElement;
  
  function updateCountdown() {
    countdownElement.textContent = `Refreshing in ${secondsLeft}s...`;
    secondsLeft--;
    
    if (secondsLeft < 0) {
      secondsLeft = 5;
      displayQRCode(cardNumber, constant, deviceId);
    }
  }
  
  updateCountdown();
  countdownInterval = window.setInterval(updateCountdown, 1000);
}

function stopQRRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
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
  
  cardNumberInput.value = localStorage.getItem(STORAGE_KEYS.CARD_NUMBER) || '';
  deviceIdInput.value = localStorage.getItem(STORAGE_KEYS.DEVICE_ID) || '';
  constantInput.value = localStorage.getItem(STORAGE_KEYS.CONSTANT) || '';
  
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
});
