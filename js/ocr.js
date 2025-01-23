// OCR related functions
function processImage(sourceCanvas, attempt = 1) {
  const config = {
    tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?@#$%^&*():;[]{}<>_+-=\'" ',
    preserve_interword_spaces: '1',
    tessedit_do_invert: '0',
    tessedit_ocr_engine_mode: '3',
    tessedit_pageseg_mode: PSM.SINGLE_BLOCK
  };

  Tesseract.recognize(sourceCanvas, 'eng', config)
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
        processImage(sourceCanvas, attempt + 1);
      } else {
        alert('Error during OCR: ' + err);
      }
    });
}

// ...rest of OCR functions...