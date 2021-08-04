import {platform} from 'node:process';
import {promisify} from 'node:util';
import {exec} from 'node:child_process';
import {parse} from 'simple-plist';
import objType from 'obj-type';
import lowercaseFirstKeys from 'lowercase-first-keys';

const run = promisify(exec);

export default platform === 'darwin'
	? async () => {
		const {stdout} = await run('ioreg -n AppleSmartBattery -r -a');
		const batteries = parse(stdout);

		if (!batteries || batteries.length === 0) {
			throw new Error('This computer doesn\'t have a battery');
		}

		const battery = lowercaseFirstKeys(batteries[0]);
		const result = {};

		for (const key of Object.keys(battery)) {
			const value = battery[key];
			result[key] = objType(value) === 'object' ? lowercaseFirstKeys(value) : value;
		}

		return result;
	}
	: () => Promise.reject(new Error('Only OS X systems are supported'));
