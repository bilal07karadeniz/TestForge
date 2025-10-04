import { motion } from 'framer-motion';
import { CheckCircle, XCircle, TestTube, Download, FileJson, FileSpreadsheet } from 'lucide-react';
import ExplorerLink from './ExplorerLink';

export default function TestResults({ results }) {
  console.log('TestResults component - received results:', results);
  const { total, passed, failed, tests = [] } = results;
  console.log('TestResults - extracted values:', { total, passed, failed, testsCount: tests?.length });

  const exportToJSON = () => {
    const data = { total, passed, failed, tests };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ['Test Name', 'Status', 'Type', 'Gas Used', 'Result', 'Warning', 'Error', 'Note'];
    const rows = tests.map(t => [
      t.name || '',
      t.status || '',
      t.type || '',
      t.gasUsed || '',
      t.result || '',
      t.warning || '',
      t.error || '',
      t.note || ''
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get unique transaction hashes
  const transactions = tests
    .filter(t => t.gasUsed)
    .map((t, i) => ({
      name: t.name,
      gasUsed: t.gasUsed,
      hash: `tx_${i}` // In real app, backend should provide actual tx hashes
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TestTube className="text-primary" size={24} />
          <h3 className="text-xl font-bold">Test Results</h3>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToJSON}
            className="flex items-center gap-2 bg-card hover:bg-card/80 px-3 py-1.5 rounded-lg text-sm transition-colors"
            title="Export as JSON"
          >
            <FileJson size={16} />
            <span className="hidden sm:inline">JSON</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-card hover:bg-card/80 px-3 py-1.5 rounded-lg text-sm transition-colors"
            title="Export as CSV"
          >
            <FileSpreadsheet size={16} />
            <span className="hidden sm:inline">CSV</span>
          </motion.button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-white">{total}</div>
          <div className="text-sm text-gray-400 mt-1">Total Tests</div>
        </div>
        <div className="bg-card rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-success">{passed}</div>
          <div className="text-sm text-gray-400 mt-1">Passed</div>
        </div>
        <div className="bg-card rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-error">{failed}</div>
          <div className="text-sm text-gray-400 mt-1">Failed</div>
        </div>
      </div>

      {/* Test List */}
      {tests.length > 0 && (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">
            Test Details ({tests.length} total)
          </h4>
          {tests.map((test, index) => (
            <div
              key={index}
              className="bg-card/50 rounded-lg overflow-hidden hover:bg-card/70 transition-colors border border-transparent hover:border-primary/20"
            >
              <div className="flex items-start gap-3 p-4">
                {test.status === 'passed' || test.status === 'passed-with-warning' ? (
                  <CheckCircle size={18} className="text-success flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={18} className="text-error flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Function Name and Type */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white text-base">{test.functionName || test.name}</p>
                      {test.walletType && (
                        <span className="text-xs px-2 py-0.5 rounded bg-info/20 text-info border border-info/30">
                          {test.walletType}
                        </span>
                      )}
                    </div>
                    {test.type && (
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary font-mono">
                        {test.type}
                      </span>
                    )}
                  </div>

                  {/* Parameters */}
                  {test.parameters && test.parameters.length > 0 && (
                    <div className="bg-background/50 rounded p-2 border-l-2 border-primary/50">
                      <p className="text-xs font-semibold text-gray-400 mb-1">📝 Parameters:</p>
                      <div className="space-y-1">
                        {test.parameters.map((param, i) => (
                          <div key={i} className="text-xs font-mono text-gray-300">
                            <span className="text-info">{param.name || `param${i}`}</span>
                            <span className="text-gray-500"> ({param.type})</span>
                            <span className="text-gray-400">: </span>
                            <span className="text-white">{String(param.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expected vs Actual Results */}
                  <div className="grid grid-cols-2 gap-2">
                    {test.expectedResult && (
                      <div className="bg-background/30 rounded p-2">
                        <p className="text-xs font-semibold text-gray-400 mb-1">✅ Expected:</p>
                        <p className="text-xs text-gray-300">{test.expectedResult}</p>
                      </div>
                    )}
                    {test.actualResult && (
                      <div className="bg-background/30 rounded p-2">
                        <p className="text-xs font-semibold text-gray-400 mb-1">
                          {test.status === 'passed' ? '✅' : '❌'} Actual:
                        </p>
                        <p className={`text-xs ${test.status === 'failed' ? 'text-error' : 'text-success'}`}>
                          {test.actualResult}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Transaction Details */}
                  <div className="flex flex-wrap gap-3 text-xs">
                    {test.transactionHash && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">📜 Tx Hash:</span>
                        <ExplorerLink type="tx" hash={test.transactionHash}>
                          <span className="font-mono text-primary hover:text-secondary">
                            {test.transactionHash.slice(0, 10)}...{test.transactionHash.slice(-8)}
                          </span>
                        </ExplorerLink>
                      </div>
                    )}
                    {test.gasUsed && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">⛽ Gas:</span>
                        <span className="font-mono text-white font-semibold">
                          {parseInt(test.gasUsed).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {test.blockNumber && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">🔗 Block:</span>
                        <span className="font-mono text-gray-300">{test.blockNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Legacy result field for backward compatibility */}
                  {test.result && !test.actualResult && (
                    <p className="text-xs text-gray-300 bg-background/30 rounded p-2">
                      <span className="text-gray-400">Result:</span> {test.result}
                    </p>
                  )}

                  {/* Warnings and Notes */}
                  {test.note && (
                    <p className="text-xs text-blue-400 bg-blue-400/10 rounded p-2 border-l-2 border-blue-400">
                      ℹ️ {test.note}
                    </p>
                  )}
                  {test.warning && (
                    <p className="text-xs text-warning bg-warning/10 rounded p-2 border-l-2 border-warning">
                      ⚠️ {test.warning}
                    </p>
                  )}
                  {test.error && (
                    <p className="text-xs text-error bg-error/10 rounded p-2 border-l-2 border-error">
                      ❌ {test.error.substring(0, 200)}{test.error.length > 200 ? '...' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
