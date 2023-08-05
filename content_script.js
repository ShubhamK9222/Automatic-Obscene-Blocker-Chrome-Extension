async function fetchBlockedWords() {
    const response = await fetch(chrome.runtime.getURL('bad-words.csv'));
    const text = await response.text();
    return text.trim().split('\n');
  }
  
  async function replaceObsceneWords(text) {
    const blockedWords = await fetchBlockedWords();
    for (const word of blockedWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      text = text.replace(regex, '*'.repeat(word.length));
    }
    return text;
  }
  
  function walkTextNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return replaceObsceneWords(node.textContent).then(replacedText => {
        node.textContent = replacedText;
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const promises = [];
      for (const childNode of node.childNodes) {
        promises.push(walkTextNodes(childNode));
      }
      return Promise.all(promises);
    }
  }
  
  walkTextNodes(document.body).then(() => {
    // Content replacement is complete
  });
  