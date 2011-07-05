XecutahService.identifier = 'palm://org.webosinternals.xecutah';

function XecutahService() {
}

XecutahService.version = function(callback) {
    var request = new Mojo.Service.Request(XecutahService.identifier, {
	    method: 'version',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

XecutahService.execute = function(callback, id) {
    var request = new Mojo.Service.Request(XecutahService.identifier, {
	    method: 'execute',
	    parameters: {
		"id":id,
	    },
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

// returns list of apps installed on the device
XecutahService.listApps = function(callback) {
    var request = new Mojo.Service.Request(XecutahService.identifier, {
	    method: 'listApps',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
}
