import { getBus } from 'dbus';

const sessionBus = getBus('session');

getAllDevices()
	.then(devices => {
		const device = devices[0];
		return setOn(device.serial, true);
	})
	.catch(err => console.error(err));

async function getDBusInterface(interfaceName, serial) {
	return new Promise((res, rej) => {
		sessionBus.getInterface(
			'org.razer',
			serial ? `/org/razer/device/${serial}` : '/org/razer',
			interfaceName,
			(err, data) => err ? rej(err) : res(data),
		);
	});
}

async function getDevicesSerials() {
	const dbusInterface = await getDBusInterface('razer.devices');

	return new Promise((res, rej) => {
		dbusInterface.getDevices((err, data) => err ? rej(err) : res(data));
	});
}

async function getDeviceBySerial(serial) {
	const dbusInterface = await getDBusInterface('razer.device.misc', serial);

	const namePromise = new Promise((res, rej) => {
		dbusInterface.getDeviceName((err, data) => err ? rej(err) : res(data));
	});

	const typePromise = new Promise((res, rej) => {
		dbusInterface.getDeviceType((err, data) => err ? rej(err) : res(data));
	});

	const vidPidPromise = new Promise<[string, string]>((res, rej) => {
		dbusInterface.getVidPid((err, data) => err ? rej(err) : res(data));
	});

	const [
		displayName,
		type,
		[vid, pid],
	] = await Promise.all([namePromise, typePromise, vidPidPromise]);

	return {
		type,
		vid,
		pid,
		serial,
		displayName,
	};
}

export async function getAllDevices() {
	const serials = await getDevicesSerials();
	return Promise.all(serials.map(s => getDeviceBySerial(s)));
}

export async function setBrightness(device, value) {
	const dbusInterface = await getDBusInterface('razer.device.lighting.brightness', device.serial);

	return new Promise((res, rej) => {
		dbusInterface.setBrightness(value, (err) => err ? rej(err) : res());
	});
}

export async function getBrightness(device) {
	const dbusInterface = await getDBusInterface('razer.device.lighting.brightness', device.serial);

	return new Promise((res, rej) => {
		dbusInterface.getBrightness((err, value) => err ? rej(err) : res(Number(value)));
	});
}

export async function setOn(device, value) {
	const dbusInterface = await getDBusInterface('razer.device.lighting.chroma', device.serial);

	return new Promise((res, rej) => {
		if (value) {
			dbusInterface.setStatic(137, 35, 26, (err) => err ? rej(err) : res());
		} else {
			dbusInterface.setNone((err) => err ? rej(err) : res());
		}
	});
}

export async function getOn(device) {
	const dbusInterface = await getDBusInterface('razer.device.lighting.chroma', device.serial);

	return new Promise((res, rej) => {
		dbusInterface.getEffect((err, value) => err ? rej(err) : res(value === 'static'));
	});
}


