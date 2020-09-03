const mergeFiles = require('merge-files');

const base = __dirname + '/src/photoswipe'
const outputPath = `${base}/index.js`;

const inputPathList = [
    `${base}/head.js`,
    `${base}/framework-bridge.js`,
    `${base}/core.js`,
    `${base}/gestures.js`,
    `${base}/show-hide-transition.js`,
    `${base}/items-controller.js`,
    `${base}/tap.js`,
    `${base}/desktop-zoom.js`,
    `${base}/history.js`,
    `${base}/tail.js`
];

const Main = async() => {
    try {
        const status = await mergeFiles(inputPathList, outputPath);
        if (status) {
            console.log('DONE!')
        }
    } catch (error) {
        console.error(error)
    }
}

Main()
