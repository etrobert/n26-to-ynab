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

interface N26Data {
  Date: string;
  Payee: string;
  "Account number": string;
  "Transaction type": string;
  "Payment reference": string;
  "Amount (EUR)": string;
  "Amount (Foreign Currency)": string;
  "Type Foreign Currency": string;
  "Exchange Rate": string;
};

interface YnabData {
  Date: string,
  Payee: string,
  Memo?: string
  Inflow?: number,
  Outflow?: number,
}

function convert(data: N26Data): YnabData {
  const isIncome = data["Transaction type"] === "Income";
  const amount = parseFloat(data["Amount (EUR)"]);
  const flow = isIncome ? { Inflow: amount } : { Outflow: -amount };
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
  .pipe(process.stdout);
