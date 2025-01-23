// capture.js - Handles screen capture and selection functionality
const PSM = {
  SINGLE_BLOCK: 6
};

const CROP_REGION_KEY = 'saved_crop_region';

let videoStream = null;
let isCropMode = false;
let isSelecting = false;
let startX = 0, startY = 0;
let endX = 0, endY = 0;
let selectionRect = null;

// Resizing variables
let resizing = false;
let currentHandle = null;
let initialMouse = {
  x: 0,
  y: 0
};
let initialRect = null;

async function startCapture() {
  try {
    videoStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { max: 3840 },
        height: { max: 2160 },
        frameRate: { max: 60 }
      },
      audio: false
    });
    
    const videoElement = document.getElementById('video');
    videoElement.srcObject = videoStream;
    videoElement.addEventListener('loadedmetadata', () => {
      videoElement.play();
      setupOverlay();
      document.getElementById('overlayCanvas').style.display = 'block';
    });
  } catch (err) {
    alert('Error starting screen capture: ' + err);
  }
}

function setupOverlay() {
  const videoElement = document.getElementById('video');
  const overlayCanvas = document.getElementById('overlayCanvas');

  const updateCanvasDimensions = () => {
    overlayCanvas.width = videoElement.videoWidth || videoElement.clientWidth;
    overlayCanvas.height = videoElement.videoHeight || videoElement.clientHeight;
    overlayCanvas.style.width = `${videoElement.clientWidth}px`;
    overlayCanvas.style.height = `${videoElement.clientHeight}px`;

    const savedRegion = localStorage.getItem(CROP_REGION_KEY);
    if (savedRegion) {
      selectionRect = JSON.parse(savedRegion);
      drawOverlayRect();
    }

    const previewCanvas = document.getElementById('cropPreviewCanvas');
    previewCanvas.width = 640;
    previewCanvas.height = 360;
  };

  updateCanvasDimensions();
  overlayCanvas.style.display = 'block';

  overlayCanvas.addEventListener('mousedown', startSelection);
  overlayCanvas.addEventListener('mousemove', drawSelection);
  overlayCanvas.addEventListener('mouseup', endSelection);

  videoElement.addEventListener('loadedmetadata', updateCanvasDimensions);

  const resizeObserver = new ResizeObserver(updateCanvasDimensions);
  resizeObserver.observe(videoElement);
}

function drawOverlayRect() {
  const overlayCanvas = document.getElementById('overlayCanvas');
  const ctx = overlayCanvas.getContext('2d');
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.rect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
  ctx.stroke();
}

function toggleCropMode() {
  isCropMode = !isCropMode;
}

function startSelection(e) {
  if (!isCropMode) return;
  isSelecting = true;
  startX = e.offsetX;
  startY = e.offsetY;
}

function drawSelection(e) {
  if (!isSelecting) return;
  const overlayCanvas = document.getElementById('overlayCanvas');
  const ctx = overlayCanvas.getContext('2d');
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.rect(startX, startY, e.offsetX - startX, e.offsetY - startY);
  ctx.stroke();
}

function endSelection(e) {
  if (!isSelecting) return;
  isSelecting = false;
  endX = e.offsetX;
  endY = e.offsetY;
  selectionRect = {
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY)
  };
  localStorage.setItem(CROP_REGION_KEY, JSON.stringify(selectionRect));
  drawOverlayRect();
}

function updatePreviewCanvas() {
  const previewCanvas = document.getElementById('cropPreviewCanvas');
  const ctx = previewCanvas.getContext('2d');
  const videoElement = document.getElementById('video');
  ctx.drawImage(videoElement, selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height, 0, 0, previewCanvas.width, previewCanvas.height);
}

function clearSelection() {
  selectionRect = null;
  localStorage.removeItem(CROP_REGION_KEY);
  const overlayCanvas = document.getElementById('overlayCanvas');
  const ctx = overlayCanvas.getContext('2d');
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
}

function initPreviewResizer() {
  const previewCanvas = document.getElementById('cropPreviewCanvas');
  previewCanvas.addEventListener('mousedown', (e) => {
    resizing = true;
    initialMouse = {
      x: e.clientX,
      y: e.clientY
    };
    initialRect = {
      width: previewCanvas.width,
      height: previewCanvas.height
    };
  });
  document.addEventListener('mousemove', (e) => {
    if (resizing) {
      const deltaX = e.clientX - initialMouse.x;
      const deltaY = e.clientY - initialMouse.y;
      previewCanvas.width = initialRect.width + deltaX;
      previewCanvas.height = initialRect.height + deltaY;
    }
  });
  document.addEventListener('mouseup', () => {
    resizing = false;
  });
}

function nearCorner(x, y, cornerX, cornerY, size) {
  return Math.abs(x - cornerX) < size && Math.abs(y - cornerY) < size;
}

function resizeSelection(deltaX, deltaY) {
  selectionRect.width += deltaX;
  selectionRect.height += deltaY;
  drawOverlayRect();
}