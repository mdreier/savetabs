const path = require('path');
const webExt = require('web-ext').default;

webExt.cmd.lint({
    sourceDir: path.resolve("./"),
}).then(webExt.cmd.build({
    sourceDir: path.resolve("./"),
    artifactsDir: path.resolve("./web-ext-artifacts"),
    overwriteDest: true
}));