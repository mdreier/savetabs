const fs = require('fs');
const path = require('path');

const VUE_PATH = path.resolve("./vue");

if (!fs.existsSync(VUE_PATH))
{
    fs.mkdirSync(VUE_PATH);
}

fs.copyFileSync("./node_modules/vue/LICENSE", path.resolve(VUE_PATH, "LICENSE"));
fs.copyFileSync("./node_modules/vue/dist/vue.min.js", path.resolve(VUE_PATH, "vue.min.js"));