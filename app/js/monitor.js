const path = require("path");
const osu = require("node-os-utils");
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

let cpuOverload = 10;
let alertFrequency = 1;

setInterval(async () => {
    const info = await cpu.usage();
    document.getElementById('cpu-usage').innerText = `${info.toFixed(2)}%`;
    document.getElementById('cpu-progress').style.width = info + '%';

    if (info >= cpuOverload) {
        document.getElementById('cpu-progress').style.background = 'red';
    } else {
        document.getElementById('cpu-progress').style.background = '#30c88b';
    }

    if (info >= cpuOverload && runNotify(alertFrequency)) {
        notifyUser({
            title: 'CPU Overload',
            body: `CPU is over ${cpuOverload}%`,
            icon: path.join(__dirname, 'img', 'icon.png')
        });

        localStorage.setItem('lastNotify', +new Date());
    }

    const free = await cpu.free();
    document.getElementById('cpu-free').innerText = `${free.toFixed(2)}%`;
    document.getElementById('system-uptime').innerText = secondsToDhms(os.uptime());
}, 1000);

document.getElementById('cpu-model').innerText = cpu.model();
document.getElementById('comp-name').innerText = os.hostname();
document.getElementById('os').innerText = `${os.type()} ${os.arch()}`;

(async function () {
    const info = await mem.info();
    console.log(info);
    document.getElementById('memory-total').innerText = info.totalMemMb;
})();

function secondsToDhms(sec) {
    sec = +sec;
    const d = Math.floor(sec / (3600 * 24));
    const h = Math.floor((sec % (3600 * 24)) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);

    return `${d}d, ${h}h, ${m}m, ${s}s`;
}

function notifyUser(options) {
    new Notification(options.title, options);
}

function runNotify(frequency) {
    if (localStorage.getItem('lastNotify') === null) {
        localStorage.setItem('lastNotify', +new Date());
        return true;
    }
    const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')));
    const now = new Date();
    const diffTime = Math.abs(now - notifyTime);
    const minutesPassed = Math.ceil(diffTime / (1000 * 60));
    return minutesPassed > frequency;
}