function updateSuggestion(text) {
  text = text ? text.trim() : '';
  let isRegExp = /^re:/.test(text),
    isFile = /^file:/.test(text),
    isPlainText = text.length && !isRegExp && !isFile,

    types = [[isPlainText, 'plaintext-search'], [isRegExp, 're:regexp-search'], [isFile, 'file:filename-search']];


  let typesStr = types.map((it) => it[0] ? `<match>${it[1]}</match>` : it[1]).join('<dim> | </dim>');

  let desc = `<match><url>${text.replace(/^(re:|file:)/, '')}</url></match><dim> [ </dim>${typesStr}<dim> ] </dim>`;

  chrome.omnibox.setDefaultSuggestion({
    description: desc
  });
}


chrome.omnibox.onInputCancelled.addListener(() => updateSuggestion());
chrome.omnibox.onInputStarted.addListener(() => updateSuggestion());


chrome.omnibox.onInputEntered.addListener((text) => {
  console.log(text);
});

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  updateSuggestion(text);
  //suggest([
  //  {content: text + ' one', description: 'the first one'},
  //  {content: text + ' number two', description: 'the second entry'}
  //]);
});