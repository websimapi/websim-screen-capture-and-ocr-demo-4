// UI related functions
function updateQueueUI() {
  const container = document.getElementById('queueList');
  container.innerHTML = '';
  utterQueue.forEach((utterance, index) => {
    const queueItem = document.createElement('div');
    queueItem.textContent = utterance;
    container.appendChild(queueItem);
  });
}

// ...rest of UI functions...