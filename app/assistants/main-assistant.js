function MainAssistant() {
    // subtitle random list
    this.randomSub = 
	[
	 {weight: 30, text: $L('X Windows Extravaganza')},
	 {weight: 6, text: $L("<a href=\"https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=HLSTYY3RCKVY2\">Donated</a> To WebOS Internals Lately?")},
	 {weight:  2, text: $L('Random Taglines Are Awesome')},
	 {weight:  2, text: $L('Now With More Cowbell')}
	 ];

    // setup list model
    this.mainModel = {items:[]};

    // setup menu
    this.menuModel =
    {
	visible: true,
	items:
	[
    {
	label: $L("Preferences"),
	command: 'do-prefs'
    },
    {
	label: $L("Help"),
	command: 'do-help'
    }
	 ]
    };

    this.supportedApps =
	[
	 'org.webosinternals.xserver',
	 'org.webosinternals.xterm',
	 'org.webosinternals.ubuntu-natty-chroot',
	 'org.webosinternals.debian-squeeze-chroot'
	 ];
}

MainAssistant.prototype.setup = function() {
	
    // set theme because this can be the first scene pushed
    var deviceTheme = '';
    if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Pixi' ||
	Mojo.Environment.DeviceInfo.modelNameAscii == 'Veer')
	deviceTheme += ' small-device';
    if (Mojo.Environment.DeviceInfo.modelNameAscii == 'TouchPad' ||
	Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator')
	deviceTheme += ' no-gesture';
    this.controller.document.body.className = prefs.get().theme + deviceTheme;
	
    this.controller.get('main-title').innerHTML = $L('Xecutah');
    this.controller.get('version').innerHTML = $L('v0.0.0');
    this.controller.get('subTitle').innerHTML = $L('X Windows Extravaganza');	

    // get elements
    this.versionElement =  this.controller.get('version');
    this.subTitleElement = this.controller.get('subTitle');
    this.listElement =     this.controller.get('mainList');

    // handlers
    this.listTapHandler =		this.listTap.bindAsEventListener(this);
	
    this.versionElement.innerHTML = "v" + Mojo.Controller.appInfo.version;
    this.subTitleElement.innerHTML = this.getRandomSubTitle();

    // setup menu
    this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
    // setup widget
    this.controller.setupWidget('mainList', { itemTemplate: "main/rowTemplate", swipeToDelete: false, reorderable: false }, this.mainModel);
    this.controller.listen(this.listElement, Mojo.Event.listTap, this.listTapHandler);

    appDB.initApps(this.populateButtons.bind(this));
};

MainAssistant.prototype.populateButtons = function(final)
{
    this.mainModel.items = [];

    this.supportedApps.forEach(function(appId) {
	    if (appDB.apps[appId]) {
		this.mainModel.items.push({
			name:     $L('Start')+' '+$L(appDB.apps[appId].title),
			    app:    appId,
			    });
	    }
	}, this);

    if (Mojo.Environment.DeviceInfo.modelNameAscii == 'TouchPad' ||
	Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
	this.mainModel.items.push({
		name:     $L('Tips: Use the Tweaks application to enable/disable or change the space reserved for the virtual keyboard. Hold down the bottom right key on the virtual keyboard to change the keyboard size. Hold down the t key on the virtual keyboard and select the right-most option to simulate the Ctrl key. Simulate the Ctrl key and then select the [ key on the virtual keyboard to simulate the Esc key.'),
		    app: false,
		    });
    }
    else {
	this.mainModel.items.push({
		name:     $L('Tips: Place a finger on the gesture area to simulate the Ctrl key. Unfortunately, there is no known way to get an Esc character at this time.'),
		    app: false,
		    });
    }

    this.listElement.mojo.noticeUpdatedItems(0, this.mainModel.items);
}

MainAssistant.prototype.listTap = function(event)
{
    if (event.item.app === false || event.item.style == 'disabled') {
	// no scene or its disabled, so we won't do anything
    }
    else {
	this.subscription = XecutahService.execute(this.execStatus.bindAsEventListener(this), event.item.app);
    }
};

MainAssistant.prototype.execStatus = function(payload)
{
    if (payload.returnValue == false) {
	this.errorMessage('<b>Service Error (execute):</b><br>' +
			  payload.errorText + "<br><br>" +
			  payload.stdErr.join("<br>"));
	return;
    }
}

MainAssistant.prototype.getRandomSubTitle = function()
{
	// loop to get total weight value
	var weight = 0;
	for (var r = 0; r < this.randomSub.length; r++)
	{
		weight += this.randomSub[r].weight;
	}
	
	// random weighted value
	var rand = Math.floor(Math.random() * weight);
	//alert('rand: ' + rand + ' of ' + weight);
	
	// loop through to find the random title
	for (var r = 0; r < this.randomSub.length; r++)
	{
		if (rand <= this.randomSub[r].weight)
		{
			return this.randomSub[r].text;
		}
		else
		{
			rand -= this.randomSub[r].weight;
		}
	}
	
	// if no random title was found (for whatever reason, wtf?) return first and best subtitle
	return this.randomSub[0].text;
}

MainAssistant.prototype.errorMessage = function(msg)
{
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			preventCancel:		true,
			title:				'Xecutah',
			message:			msg,
			choices:			[{label:$L("Ok"), value:'ok'}],
			onChoose:			function(e){}
		});
};

MainAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command)
	{
		switch (event.command)
		{
			case 'do-prefs':
				this.controller.stageController.pushScene('preferences');
				break;
	
			case 'do-help':
				this.controller.stageController.pushScene('help');
				break;
		}
	}
}

MainAssistant.prototype.activate = function(event) {};
MainAssistant.prototype.deactivate = function(event) {};

MainAssistant.prototype.cleanup = function(event) {
    /* this function should do any cleanup needed before the scene is destroyed as 
       a result of being popped off the scene stack */
    this.controller.stopListening(this.listElement, Mojo.Event.listTap, this.listTapHandler);
};
