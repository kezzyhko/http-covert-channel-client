
headersToIgnore = ['Date', 'Server', 'Vary', 'Set-Cookie']

function extractCovertMessage(e) {

	headersKeys = []
	for (const header of e.responseHeaders) {
		if (headersToIgnore.includes(header.name)) { continue }
		headersKeys.push(header.name)
	}

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
			headersLeft = remainders.length - index
			return result * headersLeft + remainder
		},
		0
	)

	console.log(recievedNumber)

}


chrome.webRequest.onHeadersReceived.addListener(
	extractCovertMessage,
	{ urls: ['<all_urls>'] },
	["responseHeaders"]
)
