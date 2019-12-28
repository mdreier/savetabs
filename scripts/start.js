const path = require('path');
const webExt = require('web-ext').default;

webExt.cmd.run({
    sourceDir: path.resolve("./"),
    ignoreFiles: [
        "vue/vue.min.js"
    ]
});