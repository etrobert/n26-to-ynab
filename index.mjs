import fs from "fs";
import { parse } from "csv-parse";

fs.createReadStream("./example.csv")
  .pipe(parse({ delimiter: ",", columns: true }))
  .on("data", (data) => console.log(data));
