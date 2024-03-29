import fs from "fs";
import { parse } from "csv-parse";
import { transform } from "stream-transform";
import { stringify } from "csv-stringify";

const [node, file, ...myArgs] = process.argv;

function usage() {
  console.log(`usage: ${node} ${file} [input.csv]`);
}

if (myArgs.length < 1) {
  usage();
  process.exit();
}
const [inputFile] = myArgs;

function convert(data) {
  const isIncome = data["Transaction type"] === "Income";
  const amount = parseFloat(data["Amount (EUR)"]);
  const flow = isIncome ? { Inflow: amount } : { Outflow: -amount };
  return {
    Date: data.Date,
    Payee: data.Payee,
    ...flow,
  };
}

function filterOutSmallExpenses(minimumPrice) {
  return (data) => {
    const amount = parseFloat(data["Amount (EUR)"]);
    const isHigh = amount < -minimumPrice;
    return isHigh ? data : null;
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
  .pipe(process.stdout);
