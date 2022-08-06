const fs = require("fs");

fs.createReadStream("./example.csv").on("data", (chunk) =>
  console.log(chunk.toString())
);
