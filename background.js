const cookies = ([
//	theaustralian.com.au
	'open_token=anonymous',
	'sr=true',
	'n_regis=123456789'
]).join('; ').trim()

function evadePaywalls(details) {
	var reqHeaders = details.requestHeaders.filter(function(header) {
		// drop cookies, referer and UA
		if (header.name === "Cookie" || header.name === "Referer" || header.name === "User-Agent") {
			return false;
		} 

		return true;
	})

	// Add the spoofed ones back
	reqHeaders.push({
		"name": "Referer",
		"value": "https://www.google.com/"
	})
	reqHeaders.push({
		"name": "User-Agent",
		"value": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
	})

	reqHeaders.push({
		"name": "Cookie",
		"value": cookies
	})

	// This seems to do the trick just fine for WSJ
	reqHeaders.push({
		"name": "X-Forwarded-For",
		"value": "66.249.66.1"
	})

	return {requestHeaders: reqHeaders};
}

function blockCookies(details) {
	var responseHeaders = details.responseHeaders.filter(function(header) {
		if (header.name === "Cookie") {
			return false;
		} 

		return true;
	})

	return {responseHeaders: responseHeaders};
}

chrome.webRequest.onBeforeSendHeaders.addListener(evadePaywalls, {
  urls: ["<all_urls>"],
  types: ["main_frame"],
}, ["requestHeaders", "blocking"]);

chrome.webRequest.onHeadersReceived.addListener(blockCookies, {
  urls: ["<all_urls>"],
  types: ["main_frame"],
}, ["responseHeaders", "blocking"]);
