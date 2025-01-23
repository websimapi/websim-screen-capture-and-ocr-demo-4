// OCR related functions
function processImage(sourceCanvas, attempt = 1) {
  const config = {
    tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?@#$%^&*():;[]{}<>_+-=\'" ',
    preserve_interword_spaces: '1',
    tessedit_do_invert: '0',
    tessedit_ocr_engine_mode: '3',
    tessedit_pageseg_mode: PSM.SINGLE_BLOCK
  };

  return Tesseract.recognize(sourceCanvas, 'eng', config)
    .then(result => {
      let text = result.data.text;
      text = text.replace(/[^\x20-\x7E]/g, '')
        .replace(/[^\S\r\n]+/g, ' ')
        .replace(/^\s+|\s+$/gm, '')
        .replace(/[\r\n]{3,}/g, '\n\n')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([:.!?])([a-zA-Z])/g, '$1 $2');
      
      document.getElementById('ocrResult').value = text;
    })
    .catch(err => {
      console.error('OCR Error, attempt ' + attempt + ':', err);
      if (attempt < maxRetries) {
        return processImage(sourceCanvas, attempt + 1);
      } else {
        alert('Error during OCR: ' + err);
      }
    });
}

function performOCRAndTTS() {
  if (!selectionRect || selectionRect.w <= 0 || selectionRect.h <= 0) {
    return;
  }
  
  const videoElement = document.getElementById('video');
  if (!videoElement.srcObject) {
    return;
  }

  const canvas = document.getElementById('canvas');
  const overlayCanvas = document.getElementById('overlayCanvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.filter = 'contrast(1.2) saturate(0) brightness(1.1)';
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  ctx.filter = 'none';

  const scaleX = canvas.width / overlayCanvas.width;
  const scaleY = canvas.height / overlayCanvas.height;
  
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = selectionRect.w;
  cropCanvas.height = selectionRect.h;
  
  const cropCtx = cropCanvas.getContext('2d');
  cropCtx.filter = 'contrast(1.2) saturate(0) brightness(1.1)';
  cropCtx.drawImage(canvas, 
    selectionRect.x * scaleX, selectionRect.y * scaleY, 
    selectionRect.w * scaleX, selectionRect.h * scaleY,
    0, 0, selectionRect.w, selectionRect.h);
  cropCtx.filter = 'none';

  // Update preview 
  const previewCanvas = document.getElementById('cropPreviewCanvas');
  previewCanvas.width = cropCanvas.width;
  previewCanvas.height = cropCanvas.height;
  const previewCtx = previewCanvas.getContext('2d');
  previewCtx.drawImage(cropCanvas, 0, 0);

  processImage(cropCanvas).then(() => {
    speakOCRText();
  });
}

// ...rest of OCR functions...