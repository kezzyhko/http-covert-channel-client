
clearButton.addEventListener("click", async () => {
	message.innerText = ""
	chrome.storage.local.clear()
})



function updateMessage(bits) {
	message.innerText = bits
}



chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {

	origin = new URL(tabs[0].url).origin

	chrome.storage.local.get([origin], function(result) {
		updateMessage(result[origin] || "")
	});

	chrome.storage.onChanged.addListener(function (changes, namespace) {
		if (changes[origin] !== undefined) { return }
		updateMessage(changes[origin].newValue)
	});


})
