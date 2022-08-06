import fs from "fs";
import { parse } from "csv-parse";

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

fs.createReadStream("./example.csv")
  .pipe(parse({ delimiter: ",", columns: true }))
  .on("data", (data) => console.log(convert(data)));
