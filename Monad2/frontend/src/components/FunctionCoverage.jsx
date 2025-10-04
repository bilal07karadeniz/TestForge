import { motion } from 'framer-motion';
import { Target, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function FunctionCoverage({ testResults, contractABI }) {
  if (!testResults || !testResults.tests) return null;

  // Extract all tested functions
  const testedFunctions = new Set(
    testResults.tests.map(t => t.functionName).filter(Boolean)
  );

  // Calculate coverage
  const totalFunctions = testedFunctions.size;
  const passedTests = testResults.passed || 0;
  const failedTests = testResults.failed || 0;
  const totalTests = testResults.total || 0;

  const coveragePercentage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  // Group tests by function
  const functionGroups = {};
  testResults.tests.forEach(test => {
    const funcName = test.functionName || test.name;
    if (!functionGroups[funcName]) {
      functionGroups[funcName] = [];
    }
    functionGroups[funcName].push(test);
  });

  const getCoverageColor = (percentage) => {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 70) return 'text-warning';
    return 'text-error';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Target className="text-primary" size={24} />
        <h3 className="text-xl font-bold">Function Coverage</h3>
      </div>

      {/* Coverage Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-lg p-4 text-center">
          <div className={`text-3xl font-bold ${getCoverageColor(coveragePercentage)}`}>
            {coveragePercentage}%
          </div>
          <div className="text-sm text-gray-400 mt-1">Test Success Rate</div>
        </div>
        <div className="bg-card rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-primary">{totalFunctions}</div>
          <div className="text-sm text-gray-400 mt-1">Functions Tested</div>
        </div>
        <div className="bg-card rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-white">{totalTests}</div>
          <div className="text-sm text-gray-400 mt-1">Total Test Cases</div>
        </div>
      </div>

      {/* Coverage Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">Overall Coverage</span>
          <span className={`font-bold ${getCoverageColor(coveragePercentage)}`}>
            {passedTests} / {totalTests} passed
          </span>
        </div>
        <div className="w-full bg-card rounded-full h-3 overflow-hidden">
          <motion.div
            className={`h-full ${
              coveragePercentage >= 90
                ? 'bg-success'
                : coveragePercentage >= 70
                ? 'bg-warning'
                : 'bg-error'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${coveragePercentage}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
      </div>

      {/* Function List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <h4 className="text-sm font-semibold text-gray-400 mb-3 sticky top-0 bg-background/90 py-2">
          Functions Tested ({Object.keys(functionGroups).length})
        </h4>
        {Object.entries(functionGroups).map(([funcName, tests], index) => {
          const allPassed = tests.every(t => t.status === 'passed' || t.status === 'passed-with-warning');
          const anyFailed = tests.some(t => t.status === 'failed');
          const testCount = tests.length;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className="flex items-center justify-between p-3 bg-card/50 rounded-lg hover:bg-card/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                {allPassed ? (
                  <CheckCircle size={16} className="text-success" />
                ) : anyFailed ? (
                  <XCircle size={16} className="text-error" />
                ) : (
                  <AlertCircle size={16} className="text-warning" />
                )}
                <div>
                  <p className="font-medium text-white text-sm">{funcName}</p>
                  <p className="text-xs text-gray-400">
                    {testCount} test case{testCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-semibold ${
                  allPassed ? 'text-success' : anyFailed ? 'text-error' : 'text-warning'
                }`}>
                  {allPassed ? 'All Passed' : anyFailed ? 'Has Failures' : 'Warning'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
