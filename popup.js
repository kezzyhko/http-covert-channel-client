
function updateMessage(bits) {
	byteLen = 8
	bytes = []
	for (pos = bits.length - byteLen; pos > 0; pos -= byteLen) {
		byte = bits.substr(pos, byteLen)
		byte = parseInt(byte, 2)
		if (isNaN(byte)) {
			byte = 0
		}
		bytes.push(byte)
	}
	message.innerText = String.fromCharCode(...bytes) + "\n" + bits
}



chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {

	origin = new URL(tabs[0].url).origin

	chrome.storage.local.get([origin], function(result) {
		updateMessage(result[origin] || "")
	})

	chrome.storage.onChanged.addListener(function (changes, namespace) {
		if (changes[origin] === undefined) { return }
		updateMessage(changes[origin].newValue || "")
	})

	clearButton.addEventListener("click", async () => {
		message.innerText = ""
		chrome.storage.local.clear()
		chrome.cookies.remove({
			url: origin,
			name: "sessionid"
		})
	})

})
