const fs = require("fs");
const dirs = ["uploads", "temp"];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log(`${dir} folder created`);
  }
});