function StartupAssistant(changelog)
{
    this.justChangelog = changelog;

    // on first start, this message is displayed, along with the current version message from below
    this.firstMessage = $L('Here are some tips for first-timers:<ul><li>Always start XServer first.</li><li>On phones, the orientation of the window is set to portrait mode to allow use of the physical keyboard for input.</li><li>On the TouchPad, the orientation of the window is set when you start XServer.</li><li>The XServer requires the <a href="https://developer.palm.com/content/resources/develop/webos_3_0_developer_beta.html">webOS 3.0 Developer Beta</a> firmware for correct operation on the TouchPad.</li></ul>');
	
    this.secondMessage = $L('We hope you enjoy being able to execute X Window System applications.<br>Please consider making a <a href=\"https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=HLSTYY3RCKVY2\">donation</a> if you wish to show your appreciation.');
	
    // on new version start
    this.newMessages =
	[
	 // Don't forget the comma on all but the last entry
	 { version: '0.8.1', log: [ 'Removed the 3.0.2 warning text, and the request acknowledged button' ] },
	 { version: '0.8.0', log: [ 'Added support for running a Ubuntu session (if installed)' ] },
	 { version: '0.7.2', log: [ 'New upstart-based execution architecture to support legacy webOS versions' ] },
	 { version: '0.6.7', log: [ 'Made the Developer Beta firmware requirement even more explicit' ] },
	 { version: '0.6.6', log: [ 'First testing release' ] }
	 ];
	
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
	
    // setup command menu
    this.cmdMenuModel =
	{
	    visible: false, 
	    items:
	    [
    {},
    {
	label: $L("Ok, I've read this. Let's continue ..."),
	command: 'do-continue'
    },
    {}
	     ]
	};
};

StartupAssistant.prototype.setup = function()
{
    // set theme because this can be the first scene pushed
    var deviceTheme = '';
    if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Pixi' ||
	Mojo.Environment.DeviceInfo.modelNameAscii == 'Veer')
	deviceTheme += ' small-device';
    if (Mojo.Environment.DeviceInfo.modelNameAscii == 'TouchPad' ||
	Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator')
	deviceTheme += ' no-gesture';
    this.controller.document.body.className = prefs.get().theme + deviceTheme;
	
    // get elements
    this.titleContainer = this.controller.get('title');
    this.dataContainer =  this.controller.get('data');

    if (Mojo.Environment.DeviceInfo.modelNameAscii == 'TouchPad' ||
	Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator')
	this.backElement = this.controller.get('back');
    else
	this.backElement = this.controller.get('header');
	
    // set title
    if (this.justChangelog) {
	this.titleContainer.innerHTML = $L('Changelog');
	// setup back tap
	this.backTapHandler = this.backTap.bindAsEventListener(this);
	this.controller.listen(this.backElement, Mojo.Event.tap, this.backTapHandler);
    }
    else {
	this.controller.get('back').hide();
	if (vers.isFirst) {
	    this.titleContainer.innerHTML = $L('Welcome To Xecutah');
	}
	else if (vers.isNew) {
	    this.titleContainer.innerHTML = $L('Xecutah Changelog');
	}
    }
	
	
    // build data
    var html = '';
    if (this.justChangelog) {
	for (var m = 0; m < this.newMessages.length; m++) {
	    html += Mojo.View.render({object: {title: 'v' + this.newMessages[m].version}, template: 'startup/changeLog'});
	    html += '<ul>';
	    for (var l = 0; l < this.newMessages[m].log.length; l++) {
		html += '<li>' + this.newMessages[m].log[l] + '</li>';
	    }
	    html += '</ul>';
	}
    }
    else {
	if (vers.isFirst) {
	    html += '<div class="text">' + this.firstMessage + '</div>';
	}
	if (vers.isNew) {
	    html += '<div class="text">' + this.secondMessage + '</div>';
	    for (var m = 0; m < this.newMessages.length; m++) {
		html += Mojo.View.render({object: {title: 'v' + this.newMessages[m].version}, template: 'startup/changeLog'});
		html += '<ul>';
		for (var l = 0; l < this.newMessages[m].log.length; l++) {
		    html += '<li>' + this.newMessages[m].log[l] + '</li>';
		}
		html += '</ul>';
	    }
	}
    }
    
    // set data
    this.dataContainer.innerHTML = html;
	
	
    // setup menu
    this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
    // set command menu
    if (!this.justChangelog) {
	this.controller.setupWidget(Mojo.Menu.commandMenu, { menuClass: 'no-fade' }, this.cmdMenuModel);
    }
	
    // set this scene's default transition
    this.controller.setDefaultTransition(Mojo.Transition.zoomFade);
};

StartupAssistant.prototype.activate = function(event)
{
    if (!this.justChangelog) {
	// start continue button timer
	this.timer = this.controller.window.setTimeout(this.showContinue.bind(this), 5 * 1000);
    }
};

StartupAssistant.prototype.showContinue = function()
{
    // show the command menu
    this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
};

StartupAssistant.prototype.backTap = function(event)
{
    if (this.justChangelog) {
	this.controller.stageController.popScene();
    }
};

StartupAssistant.prototype.handleCommand = function(event)
{
    if (event.type == Mojo.Event.command) {
	switch (event.command) {
	case 'do-continue':
	this.controller.stageController.swapScene({name: 'main', transition: Mojo.Transition.crossFade});
	break;
			
	case 'do-prefs':
	this.controller.stageController.pushScene('preferences');
	break;
			
	case 'do-help':
	this.controller.stageController.pushScene('help');
	break;
	}
    }
}

StartupAssistant.prototype.cleanup = function(event)
{
    if (this.justChangelog)
	this.controller.stopListening(this.backElement,  Mojo.Event.tap, this.backTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
