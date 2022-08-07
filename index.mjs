import fs, { createWriteStream } from "fs";
import { parse } from "csv-parse";
import { transform } from "stream-transform";
import { stringify } from "csv-stringify";

function usage() {
  const node = process.argv[0];
  const file = process.argv[1];
  console.log(`usage: ${node} ${file} [input.csv]`);
}

const myArgs = process.argv.slice(2);
if (myArgs.length < 1) {
  usage();
  process.exit();
}
const [inputFile] = myArgs;

function convert(data) {
  const isIncome = data["Transaction type"] === "Income";
  const amount = data["Amount (EUR)"];
  const flow = isIncome
    ? { Inflow: amount }
    : { Outflow: (-parseFloat(amount)).toString() };
  return {
    Date: data.Date,
    Payee: data.Payee,
    ...flow,
  };
}

fs.createReadStream(inputFile)
  .pipe(parse({ delimiter: ",", columns: true }))
  .pipe(transform(convert))
  .pipe(
    stringify({
      header: true,
      columns: {
        Date: "Date",
        Payee: "Payee",
        Memo: "Memo",
        Outflow: "Outflow",
        Inflow: "Inflow",
      },
    })
  )
  .pipe(createWriteStream("./output.csv"));
