const fs = require("fs");
const { parse } = require("csv-parse");

fs.createReadStream("./example.csv")
  .pipe(parse({ delimiter: ",", columns: true }))
  .on("data", (data) => console.log(data));
