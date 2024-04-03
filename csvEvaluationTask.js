const readline = require('readline');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const openingMessage = `
###########################
### CSV EVALUATION TEST ###
###########################

Please enter the name of the file you
would like to evaluate.
`;

console.log(openingMessage);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const letterValues = {};

const processRow = (row, rowCount) => {
  const rowValues = [];

  for (const [key, value] of Object.entries(row)) {
    if (rowCount === 1) {
      letterValues[String.fromCharCode(65 + Number(key))] = Number(value);
      rowValues.push(value);
    } else {
      let newValue = value;
      const matches = value.match(/[A-Z]/g);

      for (const match of matches) {
        newValue = newValue.replace(match, letterValues[match]);
      }
      rowValues.push(eval(newValue));
    }
  }

  return rowValues.join(',') + '\n';
};

rl.question('File name: ', (fileName) => {
  const filePath = path.join(__dirname, fileName);

  if (!fileName.endsWith('.csv') && !fileName.endsWith('.tsv')) {
    console.log(`
This program only supports .csv and .tsv.
Please try again with a supported format.
    `);

    rl.close();
    return;
  }

  const writeFileStream = fs.createWriteStream('output.csv');
  let rowCount = 0;

  fs.createReadStream(filePath)
    .pipe(csv({ headers: false, separator: fileName.endsWith('.tsv') ? '\t' : ',' }))
    .on('data', (row) => {
      rowCount++;
      writeFileStream.write(processRow(row, rowCount));
    })
    .on('end', () => {
      writeFileStream.end();

      console.log(`
CSV file successfully processed.
The output has been written to output.csv.
Exiting the program.
  `);
    });

  writeFileStream.on('finish', () => {
    rl.close();
  });
});

rl.on('close', () => {
  process.exit(0);
});
