const dbus = require('dbus');
const util = require('util')

const sessionBus = dbus.getBus('session');

util.promisify(sessionBus.getInterface)('org.razer', '/org/razer', 'razer.devices')
	.then(interface => {
		console.log(interface);
	});