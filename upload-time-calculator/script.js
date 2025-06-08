function convertSizeToBytes(size, unit) {
    const units = {
        KB: 1024,
        MB: 1024 * 1024,
        GB: 1024 * 1024 * 1024
    };
    return size * (units[unit] || 1);
}

function convertSpeedToBps(speed, unit) {
    const units = {
        Kbps: 1000 / 8, // kilobits per second -> bytes per second
        Mbps: 1000 * 1000 / 8,
        MBps: 1000 * 1000
    };
    return speed * (units[unit] || 1);
}

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
}

const form = document.getElementById('upload-form');
const resultDiv = document.getElementById('result');
form.addEventListener('submit', function(event) {
    event.preventDefault();
    const size = parseFloat(document.getElementById('size').value);
    const sizeUnit = document.getElementById('size-unit').value;
    const speed = parseFloat(document.getElementById('speed').value);
    const speedUnit = document.getElementById('speed-unit').value;

    if (size <= 0 || speed <= 0) {
        resultDiv.textContent = 'Please enter positive values.';
        return;
    }

    const bytes = convertSizeToBytes(size, sizeUnit);
    const bps = convertSpeedToBps(speed, speedUnit);
    const timeSeconds = bytes / bps;
    resultDiv.textContent = 'Estimated upload time: ' + formatTime(timeSeconds);
});
