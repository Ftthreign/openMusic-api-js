const fs = require("fs");
const { config } = require("../../utils");

class StorageService {
  constructor(folder) {
    this._folder = folder;

    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { reqursive: true });
  }

  async writeFile(file, meta) {
    const filename = +new Date() + meta.filename;
    const path = `${this._folder}/${filename}`;
    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      file.pipe(fileStream);
      file.on("end", () => resolve(filename));
      file.on("error", (error) => reject(error));
    });
  }
}

module.exports = StorageService;
