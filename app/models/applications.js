function Applications(){
    // all applications installed on device
    this.apps = [];
	
    // we'll need this for the subscription based services
    this.subscription = false;
}

// shortcut
var Apps = Applications.prototype;

Apps.initApps = function( callback ) {
    // all applications installed on device
    this.apps = [];
	
    // load up the installed applications
    if (this.subscription) this.subscription.cancel();
    this.subscription = XecutahService.listApps( this.loadApps.bindAsEventListener(this, callback) );
}

// handles returned apps from the server
Apps.loadApps = function( data, callback ) {
	
    if (data.apps) {
	var apps = data.apps;
	for (var i = 0; i < apps.length; i++) {
	    var app = apps[i];
	    if (!this.apps[app.id]) this.apps[app.id] = app;
	}
    }

    // Update the relevant screen
    if (callback) callback(true);
};
