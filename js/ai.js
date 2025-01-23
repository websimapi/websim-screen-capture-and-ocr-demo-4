// AI related functions  
async function processWithAI(messages) {
  try {
    document.getElementById('ocrResult').value = 'Processing with AI...';
    const response = await fetch('/api/ai_completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        prompt: `Given these recent chat messages, provide a brief summary or response:
            
            interface Response {
              reply: string;
            }
            
            {
              "reply": "It seems the conversation is about game mechanics and strategy."
            }
            `,
        data: messages.join('\n')
      })
    });

    const data = await response.json();
    document.getElementById('ocrResult').value = data.reply;
    return data.reply;
  } catch (error) {
    console.error('Error calling AI:', error);
    document.getElementById('ocrResult').value = 'Error processing with AI';
    return null;
  }
}

// ...rest of AI functions...