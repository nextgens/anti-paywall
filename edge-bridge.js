class EdgeBridgeDebugLog {
    constructor() {
        this.CatchOnException = true;
        this.VerboseLogging = true;
        this.FailedCalls = {};
        this.SuccededCalls = {};
        this.DeprecatedCalls = {};
        this.BridgedCalls = {};
        this.UnavailableApis = {};
        this.EdgeIssues = {};
    }
    log(message) {
        try {
            if (this.VerboseLogging) {
                console.log(message);
            }
        } catch (e) {}
    }
    info(message) {
        try {
            if (this.VerboseLogging) {
                console.info(message);
            }
        } catch (e) {}
    }
    warn(message) {
        try {
            if (this.VerboseLogging) {
                console.warn(message);
            }
        } catch (e) {}
    }
    error(message) {
        try {
            if (this.VerboseLogging) {
                console.error(message);
            }
        } catch (e) {}
    }
    DoActionAndLog(action, name, deprecatedTo, bridgedTo) {
        var result;
        try {
            result = action();
            this.AddToCalledDictionary(this.SuccededCalls, name);
            if (typeof deprecatedTo !== "undefined") {
                this.warn("API Call Deprecated - Name: " + name + ", Please use " + deprecatedTo + " instead!");
                this.AddToCalledDictionary(this.DeprecatedCalls, name);
            }
            if (typeof bridgedTo !== "undefined") {
                this.info("API Call '" + name + "' has been bridged to another Edge API: " + bridgedTo);
                this.AddToCalledDictionary(this.BridgedCalls, name);
            }
            this.info("API Call: '" + name + "'");
            return result;
        } catch (ex) {
            this.AddToCalledDictionary(this.FailedCalls, name);
            if (this.CatchOnException)
                this.error("API Call Failed: " + name + " - " + ex);
            else
                throw ex;
        }
    }
    LogEdgeIssue(name, message) {
        this.warn(message);
        this.AddToCalledDictionary(this.EdgeIssues, name);
    }
    LogUnavailbleApi(name, deprecatedTo) {
        this.warn("API Call '" + name + "' is not supported in Edge");
        this.AddToCalledDictionary(this.UnavailableApis, name);
        if (typeof deprecatedTo !== "undefined") {
            this.warn("API Call Deprecated - Name: " + name + ", Please use " + deprecatedTo + " instead!");
            this.AddToCalledDictionary(this.DeprecatedCalls, name);
        }
    }
    AddToCalledDictionary(dictionary, name) {
        if (typeof dictionary[name] !== "undefined") {
            dictionary[name]++;
        } else {
            dictionary[name] = 1;
        }
    }
}
var bridgeLog = new EdgeBridgeDebugLog();
class EdgeWebRequestBridge {
    get MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES() { return bridgeLog.DoActionAndLog(() => { return myBrowser.webRequest.MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES; }, "webNavigation.MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES"); }
    get onAuthRequired() { return bridgeLog.DoActionAndLog(() => { return myBrowser.webRequest.onAuthRequired; }, "webRequest.onAuthRequired"); }
    get onBeforeRedirect() { return bridgeLog.DoActionAndLog(() => { return myBrowser.webRequest.onBeforeRedirect; }, "webRequest.onBeforeRedirect"); }
    get onBeforeRequest() { return bridgeLog.DoActionAndLog(() => { return myBrowser.webRequest.onBeforeRequest; }, "webRequest.onBeforeRequest"); }
    get onBeforeSendHeaders() { return bridgeLog.DoActionAndLog(() => { return myBrowser.webRequest.onBeforeSendHeaders; }, "webRequest.onBeforeSendHeaders"); }
    get onCompleted() { return bridgeLog.DoActionAndLog(() => { return myBrowser.webRequest.onCompleted; }, "webRequest.onCompleted"); }
    get onErrorOccurred() { return bridgeLog.DoActionAndLog(() => { return myBrowser.webRequest.onErrorOccurred; }, "webRequest.onErrorOccurred"); }
    get onHeadersReceived() { return bridgeLog.DoActionAndLog(() => { return myBrowser.webRequest.onHeadersReceived; }, "webRequest.onHeadersReceived"); }
    get onResponseStarted() { return bridgeLog.DoActionAndLog(() => { return myBrowser.webRequest.onResponseStarted; }, "webRequest.onResponseStarted"); }
    get onSendHeaders() { return bridgeLog.DoActionAndLog(() => { return myBrowser.webRequest.onSendHeaders; }, "webRequest.onSendHeaders"); }
    handlerBehaviorChanged(callback) {
        bridgeLog.DoActionAndLog(() => {
            myBrowser.webRequest.handlerBehaviorChanged.apply(null, arguments);
        }, "webRequest.handlerBehaviorChanged");
    }
}
class EdgeBackgroundBridge {
    constructor() {
        this.webRequest = typeof browser.webRequest !== "undefined" ? new EdgeWebRequestBridge() : undefined;
    }
}
var myBrowser = browser;
var chrome = new EdgeBackgroundBridge();
