importScripts("bignumber.js", "factorial.js");



chrome.runtime.onSuspend.addListener(function() {
	chrome.storage.local.clear()
})



headersToIgnore = ['Date', 'Server', 'Vary', 'Set-Cookie']

function extractCovertMessage(e) {

	headersKeys = []
	for (const header of e.responseHeaders) {
		if (headersToIgnore.includes(header.name)) { continue }
		headersKeys.push(header.name)
	}

	headersAmount = headersKeys.length

	sortedHeadersKeys = [...headersKeys]
	sortedHeadersKeys.sort()

	remainders = []
	for (const headerKey of headersKeys) {
		headerIndex = sortedHeadersKeys.indexOf(headerKey)
		remainders.push(headerIndex)
		sortedHeadersKeys.splice(headerIndex, 1)
	}

	recievedNumber = remainders.reduceRight(
		function(result, remainder, index) {
			headersLeft = headersAmount - index
			return result * headersLeft + remainder
		},
		0
	)

	origin = new URL(e.url).origin
	chrome.storage.local.get([origin], function(result) {
		info = result[origin] || {
			number: "0",
			multiplier: "1"
		}
		maxNumber = factorial(headersAmount)
		info.multiplier = new BigNumber(info.multiplier)
		info.number = info.multiplier.multiply(recievedNumber).add(info.number).toString()
		info.multiplier = info.multiplier.multiply(maxNumber).toString()
		chrome.storage.local.set({[origin]: info})
	});

}


chrome.webRequest.onHeadersReceived.addListener(
	extractCovertMessage,
	{ urls: ['<all_urls>'] },
	["responseHeaders"]
)
