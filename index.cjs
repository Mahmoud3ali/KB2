const fs = require("fs");
const readline = require("readline");

const parseScriptParams = () => {
  // <---  DEFAULT VALUES FOR SCRIPT PARAMETERS --->
  let fileName = "order_log00.csv";

  // iterate over each {key,value} for script arguments skipping initial one
  for (let i = 2; ; i += 2) {
    // if parameter isn't passed then this loop job is done
    if (process.argv[i] === undefined) break;

    const argName = process.argv[i];
    const argValue = process.argv[i + 1];

    switch (argName) {
      case "name": {
        fileName = String(argValue);
        break;
      }
    }
  }

  return { fileName };
};

function solve({ inputFileName }) {
  // read the file line by line
  const file = readline.createInterface({
    input: fs.createReadStream(inputFileName),
    output: process.stdout,
    terminal: false,
  });

  let totalCountOfLines = 0;
  const map = {};
  file.on("line", (line) => {
    totalCountOfLines++;
    const [id, area, productName, amountSold, brand] = line.split(",");

    if (map[productName] === undefined) {
      // make sure product name is in the map
      map[productName] = {
        sold: 0,
        mostPopularBrandSold: undefined,
        mostPopularBrandCount: 0,
      };
    }
    if (map[productName][brand] === undefined) {
      // make sure brand is in the map within the given product name
      map[productName][brand] = 0;
    }

    map[productName].sold += parseInt(amountSold);
    map[productName][brand] += 1;

    // update the most popular brand with the highest count after each line
    if (map[productName][brand] > map[productName].mostPopularBrandCount) {
      map[productName].mostPopularBrandCount = map[productName][brand];
      map[productName].mostPopularBrandSold = brand;
    }
  });

  file.on("close", () => {
    const average = [];
    const mostPopular = [];

    Object.entries(map).forEach(([productName, product]) => {
      average.push(`${productName},${product.sold / totalCountOfLines}`);
      mostPopular.push(`${productName},${product.mostPopularBrandSold}`);
    });

    fs.writeFile(`0_${inputFileName}`, average.join("\n"), (err) => {
      if (err) throw err;
      console.log("The file has been saved!");
    });
    fs.writeFile(`1_${inputFileName}`, mostPopular.join("\n"), (err) => {
      if (err) throw err;
      console.log("The file has been saved!");
    });
  });
}

(() => {
  const { fileName } = parseScriptParams();
  console.log("solving for file: ", fileName);
  solve({ inputFileName: fileName });
})();
