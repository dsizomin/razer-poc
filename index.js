const dbus = require('dbus');

const sessionBus = dbus.getBus('session');

const interface = sessionBus.getInterface('org.razer', '/org/razer', 'razer.devices', function(err, data) {
	console.log(err || data);
});
