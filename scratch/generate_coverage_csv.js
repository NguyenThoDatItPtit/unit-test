const fs = require('fs');
const summary = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));

let csvContent = 'File,Statements %,Branches %,Functions %,Lines %\n';

Object.keys(summary).forEach(file => {
  const data = summary[file];
  const fileName = file === 'total' ? 'TOTAL' : file.split(/[\\/]/).pop();
  csvContent += `${fileName},${data.statements.pct}%,${data.branches.pct}%,${data.functions.pct}%,${data.lines.pct}%\n`;
});

fs.writeFileSync('Code_Coverage_Report.csv', csvContent);
console.log('Code_Coverage_Report.csv has been created.');
