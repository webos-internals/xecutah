function PreferencesAssistant()
{
    // setup default preferences in the preferenceCookie.js model
    this.cookie = new preferenceCookie();
    this.prefs = this.cookie.get();
	
    // for secret group
    this.secretString = '';
    this.secretAnswer = 'iknowwhatimdoing';
	
    // setup menu
    this.menuModel =
	{
	    visible: true,
	    items:
	    [
    {
	label: $L("Help"),
	command: 'do-help'
    }
	     ]
	}
	
};

PreferencesAssistant.prototype.setup = function()
{
    this.controller.get('preferences-title').innerHTML = $L('Preferences');
    this.controller.get('preferences-global').innerHTML = $L('Global');
    this.controller.get('secret-stuff').innerHTML = $L('Secret Stuff');
    this.controller.get('secret-options').innerHTML = $L('This version has no secret options.');

    // setup back tap
    this.backElement =			this.controller.get('icon');
    this.backTapHandler = this.backTap.bindAsEventListener(this);
    this.controller.listen(this.backElement, Mojo.Event.tap, this.backTapHandler);

    try {
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
	// set this scene's default transition
	this.controller.setDefaultTransition(Mojo.Transition.zoomFade);
		
	// Global Group
	this.controller.setupWidget
	    (
	     'theme',
	     {
		 label: $L('Theme'),
		     choices:
		 [
		  {label:$L('Palm Default'),	value:'palm-default'},
		  {label:$L('Palm Dark'),		value:'palm-dark'}
		  ],
		     modelProperty: 'theme'
		     },
	     this.prefs
	     );
		
	this.controller.listen('theme', Mojo.Event.propertyChange, this.themeChanged.bindAsEventListener(this));
		
	// Secret Group
	this.keyPressHandler = this.keyPress.bindAsEventListener(this);
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keypress, this.keyPressHandler);
		
	// hide secret group
	this.controller.get('secretPreferences').style.display = 'none';
		
    }
    catch (e) {
	Mojo.Log.logException(e, 'preferences#setup');
    }

};

PreferencesAssistant.prototype.themeChanged = function(event)
{
    // set the theme right away with the body class
    var deviceTheme = '';
    if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Pixi' ||
	Mojo.Environment.DeviceInfo.modelNameAscii == 'Veer')
	deviceTheme += ' small-device';
    if (Mojo.Environment.DeviceInfo.modelNameAscii == 'TouchPad' ||
	Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator')
	deviceTheme += ' no-gesture';
    this.controller.document.body.className = event.value + deviceTheme;
    this.cookie.put(this.prefs);
};

PreferencesAssistant.prototype.backTap = function(event)
{
    this.controller.stageController.popScene();
};

PreferencesAssistant.prototype.handleCommand = function(event)
{
    if (event.type == Mojo.Event.command) {
	switch (event.command) {
	case 'do-help':
	this.controller.stageController.pushScene('help');
	break;
	}
    }
};

PreferencesAssistant.prototype.keyPress = function(event)
{
    this.secretString += String.fromCharCode(event.originalEvent.charCode);
	
    if (event.originalEvent.charCode == 8) {
	this.secretString = '';
    }
	
    if (this.secretString.length == this.secretAnswer.length) {
	if (this.secretString === this.secretAnswer) {
	    this.controller.get('secretPreferences').style.display = '';
	    this.controller.getSceneScroller().mojo.revealElement(this.controller.get('secretPreferences'));
	    this.secretString = '';
	}
    }
    else if (this.secretString.length > this.secretAnswer.length) {
	this.secretString = '';
    }
};

PreferencesAssistant.prototype.activate = function(event) {};

PreferencesAssistant.prototype.deactivate = function(event)
{
    // reload global storage of preferences when we get rid of this stage
    var tmp = prefs.get(true);
};

PreferencesAssistant.prototype.cleanup = function(event) {
    this.controller.stopListening(this.backElement, Mojo.Event.tap, this.backTapHandler);
};
