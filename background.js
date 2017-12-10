const cookies = ([
//	theaustralian.com.au
	'open_token=anonymous',
	'sr=true',
	'FreedomCookie=true',
	'n_regis=123456789'
]).join('; ').trim()

// from https://support.google.com/webmasters/answer/1061943
const UA_Desktop = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
const UA_Mobile = "Chrome/41.0.2272.96 Mobile Safari/537.36 (compatible ; Googlebot/2.1 ; +http://www.google.com/bot.html)"

function evadePaywalls(details) {
	var useMobileUA = false;
	var reqHeaders = details.requestHeaders.filter(function(header) {
		// drop cookies, referer and UA
		switch(header.name) {
			case "User-Agent":
				useMobileUA = header.value.toLowerCase().includes("mobile")
			case "Cookie":
			case "Referer":
				return false;
				break;
			default:
				return true;
		} 
	})

	// Add the spoofed ones back
	reqHeaders.push({
		"name": "Referer",
		"value": "https://www.google.com/"
	})
	reqHeaders.push({
		"name": "User-Agent",
		"value": useMobileUA ? UA_Mobile : UA_Desktop
	})

	reqHeaders.push({
		"name": "Cookie",
		"value": cookies
	})

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
  types: ["main_frame", "script"],
}, ["requestHeaders", "blocking"]);

chrome.webRequest.onHeadersReceived.addListener(blockCookies, {
  urls: ["<all_urls>"],
  types: ["main_frame", "script"],
}, ["responseHeaders", "blocking"]);
