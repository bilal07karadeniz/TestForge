import { motion } from 'framer-motion';
import { Flame, TrendingUp, TrendingDown, Award } from 'lucide-react';

export default function GasMetrics({ gasData }) {
  const {
    totalGas = 0,
    averageGas = 0,
    mostExpensive = null,
    optimizationScore = 0,
    transactions = []
  } = gasData;

  const getOptimizationColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getOptimizationLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Optimization';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Flame className="text-primary" size={24} />
        <h3 className="text-xl font-bold">Gas Metrics</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total Gas Used */}
        <div className="bg-card rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-primary" />
            <span className="text-sm text-gray-400">Total Gas Used</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {totalGas.toLocaleString()}
          </div>
        </div>

        {/* Average Gas */}
        <div className="bg-card rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={16} className="text-primary" />
            <span className="text-sm text-gray-400">Average Gas</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.round(averageGas).toLocaleString()}
          </div>
        </div>

        {/* Most Expensive */}
        {mostExpensive && (
          <div className="bg-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} className="text-warning" />
              <span className="text-sm text-gray-400">Most Expensive</span>
            </div>
            <div className="text-lg font-bold text-white truncate">
              {mostExpensive.name}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {parseInt(mostExpensive.gas).toLocaleString()} gas
            </div>
          </div>
        )}

        {/* Optimization Score */}
        <div className="bg-card rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award size={16} className={getOptimizationColor(optimizationScore)} />
            <span className="text-sm text-gray-400">Optimization</span>
          </div>
          <div className={`text-2xl font-bold ${getOptimizationColor(optimizationScore)}`}>
            {optimizationScore}/100
          </div>
          <div className={`text-sm mt-1 ${getOptimizationColor(optimizationScore)}`}>
            {getOptimizationLabel(optimizationScore)}
          </div>
        </div>
      </div>

      {/* Gas Usage Bar Chart */}
      {transactions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-400">
            Gas Usage by Function ({transactions.length} total)
          </h4>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {transactions
              .sort((a, b) => parseInt(b.gasUsed || 0) - parseInt(a.gasUsed || 0))
              .map((tx, index) => {
                const maxGas = Math.max(...transactions.map(t => parseInt(t.gasUsed || 0)));
                const gasUsed = parseInt(tx.gasUsed || 0);
                const percentage = maxGas > 0 ? (gasUsed / maxGas) * 100 : 0;

                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white flex-1 mr-2">{tx.name}</span>
                      <span className="text-gray-400 font-mono">
                        {gasUsed > 0 ? gasUsed.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    {gasUsed > 0 && (
                      <div className="w-full bg-card rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: Math.min(index * 0.05, 2) }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* No data state */}
      {transactions.length === 0 && (
        <div className="text-center py-8">
          <Flame size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No gas data available</p>
        </div>
      )}
    </motion.div>
  );
}
