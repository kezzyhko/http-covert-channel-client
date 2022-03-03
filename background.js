
function extractCovertMessage(e) {
	console.log(e.responseHeaders)
}


chrome.webRequest.onHeadersReceived.addListener(
	extractCovertMessage,
	{ urls: ['<all_urls>'] },
	["responseHeaders"]
)
