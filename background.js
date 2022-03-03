
hiddenBitsAmountCache = [0];

// equivalent to Math.trunc(Math.log2(factorial(headersAmount))), but does not overflow due to factorial when there are many headers
function getHiddenBitsAmount(headersAmount) {
	c = 0
	for (i = headersAmount; i >= 0; i--) {
		if (hiddenBitsAmountCache[i] !== undefined) {
			c += hiddenBitsAmountCache[i]
			break
		}
		c += Math.log2(i)
	}
	hiddenBitsAmountCache[headersAmount] = c
	return Math.trunc(c)
}



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

	bitsAmount = getHiddenBitsAmount(headersAmount)
	recievedBits = recievedNumber.toString(2).padStart(bitsAmount, 0)

	origin = new URL(e.url).origin
	chrome.storage.local.get([origin], function(result) {
		info = result[origin] || ""
		info = recievedBits + info
		chrome.storage.local.set({[origin]: info})
	});

}


chrome.webRequest.onHeadersReceived.addListener(
	extractCovertMessage,
	{ urls: ['<all_urls>'] },
	["responseHeaders"]
)
