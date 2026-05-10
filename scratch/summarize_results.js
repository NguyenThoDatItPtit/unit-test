const fs = require('fs');
const results = JSON.parse(fs.readFileSync('test_results.json', 'utf8'));

const summary = results.testResults.map(tr => {
  const service = tr.name.split(/[\\/]/).pop().replace('.test.ts', '');
  const total = tr.assertionResults.length;
  const passed = tr.assertionResults.filter(ar => ar.status === 'passed').length;
  const failed = tr.assertionResults.filter(ar => ar.status === 'failed').length;
  return { service, total, passed, failed };
});

console.log('Service,Total,Pass,Fail,PassRate');
summary.forEach(s => {
  const rate = ((s.passed / s.total) * 100).toFixed(1) + '%';
  console.log(`${s.service},${s.total},${s.passed},${s.failed},${rate}`);
});

const totalSum = summary.reduce((acc, s) => ({
  total: acc.total + s.total,
  passed: acc.passed + s.passed,
  failed: acc.failed + s.failed
}), { total: 0, passed: 0, failed: 0 });

const totalRate = ((totalSum.passed / totalSum.total) * 100).toFixed(1) + '%';
console.log(`TOTAL,${totalSum.total},${totalSum.passed},${totalSum.failed},${totalRate}`);
