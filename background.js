const websites = [
	  "*://*.adelaidenow.com.au/*",
	  "*://*.baltimoresun.com/*",
	  "*://*.barrons.com/*",
	  "*://*.chicagobusiness.com/*",
	  "*://*.chicagotribune.com/*",
	  "*://*.chip.de/*",
	  "*://*.clarin.com/*",
	  "*://*.courant.com/*",
	  "*://*.couriermail.com.au/*",
	  "*://*.cricketarchive.com/*",
	  "*://*.dailypress.com/*",
	  "*://*.dailytelegraph.com.au/*",
	  "*://*.durangoherald.com/*",
	  "*://*.economist.com/*",
	  "*://*.fd.nl/*",
	  "*://*.forbes.com/*",
	  "*://*.ft.com/*",
	  "*://*.geelongadvertiser.com.au/*",
	  "*://*.goldcoastbulletin.com.au/*",
	  "*://*.haaretz.co.il/*",
	  "*://*.haaretz.com/*",
	  "*://*.hbr.org/*",
	  "*://*.heraldsun.com.au/*",
	  "*://*.inc.com/*",
	  "*://*.independent.co.uk/*",
	  "*://*.investingdaily.com/*",
	  "*://*.irishtimes.com/*",
	  "*://*.kansas.com/*",
	  "*://*.kansascity.com/*",
	  "*://*.ladepeche.fr/*",
	  "*://*.latimes.com/*",
	  "*://*.lanacion.com.ar/*",
	  "*://*.letemps.ch/*",
	  "*://*.mcall.com/*",
	  "*://*.medscape.com/*",
	  "*://*.medium.com/*",
	  "*://*.nationalpost.com/*",
	  "*://*.newsweek.com/*",
	  "*://*.newyorker.com/*",
	  "*://*.nikkei.com/*",
	  "*://*.nrc.nl/*",
	  "*://*.nyt.com/*",
	  "*://*.nytimes.com/*",
	  "*://*.ocregister.com/*",
	  "*://*.orlandosentinel.com/*",
	  "*://*.quora.com/*",
	  "*://*.scmp.com/*",
	  "*://*.seattletimes.com/*",
	  "*://*.slashdot.org/*",
	  "*://*.smh.com.au/*",
	  "*://*.sun-sentinel.com/*",
	  "*://*.technologyreview.com/*",
	  "*://*.theage.com.au/*",
	  "*://*.theaustralian.com.au/*",
	  "*://*.thenation.com/*",
	  "*://*.thestreet.com/*",
	  "*://*.thesundaytimes.co.uk/*",
	  "*://*.thetimes.co.uk/*",
	  "*://*.washingtonpost.com/*",
	  "*://*.wsj.com/*",
	  "*://*.wsj.net/*"
]

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
	const shouldDropUA = !details.url.includes("medium.com");
	var useMobileUA = false;
	var reqHeaders = details.requestHeaders.filter(function(header) {
		// drop cookies, referer and UA
		switch(header.name) {
			case "User-Agent":
				useMobileUA = header.value.toLowerCase().includes("mobile")
				return !shouldDropUA;
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
	if (shouldDropUA) {
		reqHeaders.push({
			"name": "User-Agent",
			"value": useMobileUA ? UA_Mobile : UA_Desktop
		})
	}

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
  urls: [...websites],
  types: ["main_frame", "script"],
}, ["requestHeaders", "blocking"]);

chrome.webRequest.onHeadersReceived.addListener(blockCookies, {
  urls: [...websites],
  types: ["main_frame", "script"],
}, ["responseHeaders", "blocking"]);
