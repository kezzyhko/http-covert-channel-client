clearButton.addEventListener("click", async () => {
	message.innerText = ""
	chrome.storage.local.clear()
});