
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



let localStorageBlock = {}

function updateLocalStorage(origin, position, recievedBits) {
	if (localStorageBlock[origin]) {
		setTimeout(updateLocalStorage, 10, origin, position, recievedBits)
		return;
	}
	localStorageBlock[origin] = true
	chrome.storage.local.get([origin], function(result) {
		let oldInfo = result[origin] || ""
		let newInfo = oldInfo.substring(0, oldInfo.length - (position + recievedBits.length)) + recievedBits + oldInfo.substring(oldInfo.length - position).padStart(position, 'X')
		chrome.storage.local.set({[origin]: newInfo}, function() {
			localStorageBlock[origin] = false
		})
	})
}



headersToIgnore = ['Date', 'Server', 'Vary', 'Set-Cookie']

function extractCovertMessage(e) {

	headersKeys = []
	position = NaN
	for (const header of e.responseHeaders) {
		if (headersToIgnore.includes(header.name)) { continue }
		if (header.name == "Age") {
			position = parseInt(header.value)
		}
		headersKeys.push(header.name)
	}

	if (isNaN(position)) {
		return
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
	updateLocalStorage(origin, position, recievedBits)

}


chrome.webRequest.onHeadersReceived.addListener(
	extractCovertMessage,
	{ urls: ['<all_urls>'] },
	["responseHeaders"]
)
