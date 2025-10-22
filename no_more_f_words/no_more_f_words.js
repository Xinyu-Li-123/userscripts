// ==UserScript==
// @name         No More F Words
// @namespace    http://tampermonkey.net/
// @version      1.7.1
// @description  No more F words, cuz I fucking hate rudeness.
// @author       Xinyu Li
// @match        https://ysyx.oscc.cc/*
// @match        https://nju-projectn.github.io/ics-pa-gitbook/ics*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  console.log(`[NMFW Info] The "No More F Words" (NMFW) userscript is running on this webpage. It will replace any specified F words with a neutral term, such as RTFM -> RTM.`);

  // Dictionary of words to replace
  const replacements = {
    "RTFM": "RTM",
    "STFW": "STW",
    "RTFSC": "RTSC"
  };

  function replaceTextInNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent;
      let modified = false;

      for (const [word, replacement] of Object.entries(replacements)) {
        const regex = new RegExp(`\\b${word}\\b`, 'g'); // Match whole words only
        if (regex.test(text)) {
          text = text.replace(regex, replacement);
          console.log(`[NMFW Info] Keyword detected. Changing "${word}" to "${replacement}"`);
          modified = true;
        }
      }

      if (modified) node.textContent = text; // Update only if there's a change
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Skip modifying script, style, and meta elements
      if (['SCRIPT', 'STYLE', 'META', 'NOSCRIPT'].includes(node.tagName)) return;

      // Skip replacements inside input fields, textareas, and buttons, so that nothing unexpected will happen.
      if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(node.tagName)) return;

      // Special handling for <a> tags to replace only visible text, not href
      if (node.tagName === 'A') {
        for (const child of node.childNodes) {
          if (child.nodeType === Node.TEXT_NODE) {
            replaceTextInNode(child);
          }
        }
        return;
      }

      // Process other elements recursively
      for (const child of node.childNodes) {
        replaceTextInNode(child);
      }
    }
  }

  function applyReplacements() {
    replaceTextInNode(document.body);
  }

  // Run replacements on initial load
  applyReplacements();

  // Enhanced MutationObserver to detect not only new elements but also text content changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Process newly added elements
        mutation.addedNodes.forEach((node) => {
          replaceTextInNode(node);
        });
      } else if (mutation.type === 'characterData') {
        // Reapply replacements on modified text nodes
        replaceTextInNode(mutation.target);
      }
    });
  });

  observer.observe(document.body, {
    childList: true,        // Detect new elements
    subtree: true,          // Watch entire document
    characterData: true     // Detect text content modifications
  });

})();
