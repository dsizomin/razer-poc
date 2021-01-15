const dbus = require('dbus');

const sessionBus = dbus.getBus('session');

new Promise((res, rej) => {
	console.log('Connecting to interface...');
	sessionBus.getInterface(
		'org.razer',
		'/org/razer',
		'razer.devices',
		(err, data) => err ? rej(err) : res(data)
	);
}).then(interface => {
	console.log('Getting device list...');
	return new Promise((res, rej) => {
		interface.getDevices((err, data) => err ? rej(err) : res(data))
	})
}).then(serials => {
	console.log('Connecting to devices interfaces...');
	const result = {};
	return Promise.all(serials.map(serial => {
		return new Promise((res, rej) => {
			sessionBus.getInterface(
				'org.razer',
				`/org/razer/device/${serial}`,
				'razer.device.misc',
				(err, data) => err ? rej(err) : res(data)
			);
		}).then(interface => result[serial] = interface);
	})).then(() => result);
}).then(deviceInterfaceMap => {
	console.log('Getting devices data...');
	const result = {};
	return Promise.all(Object.keys(deviceInterfaceMap).map(serial => {
		const interface = deviceInterfaceMap[serial];

		const typePromise = new Promise((res, rej) => {
			interface.getDeviceType((err, data) => err ? rej(err) : res(data))
		});

		const vidPidPromise = new Promise((res, rej) => {
			interface.getVidPid((err, data) => err ? rej(err) : res(data))
		});

		return Promise.all([typePromise, vidPidPromise]).then(([type, [vid, pid]]) => {
			result[serial] = { type, vid, pid };
		});

	})).then(() => result);
}).then(devices => console.log(devices));
