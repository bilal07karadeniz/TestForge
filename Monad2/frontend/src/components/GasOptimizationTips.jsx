import { motion } from 'framer-motion';
import { Lightbulb, Zap, TrendingDown, CheckCircle } from 'lucide-react';

export default function GasOptimizationTips({ gasData, findings }) {
  const { averageGas = 0, optimizationScore = 0, transactions = [] } = gasData;

  // Generate smart recommendations based on actual data
  const generateRecommendations = () => {
    const recommendations = [];

    // Check for high gas usage functions
    const highGasFunctions = transactions.filter(t => parseInt(t.gasUsed || 0) > 100000);
    if (highGasFunctions.length > 0) {
      recommendations.push({
        icon: <TrendingDown size={20} className="text-warning" />,
        title: 'High Gas Usage Detected',
        description: `${highGasFunctions.length} function(s) consume over 100k gas. Consider optimizing: ${highGasFunctions.slice(0, 3).map(f => f.name).join(', ')}`,
        impact: 'High',
        effort: 'Medium'
      });
    }

    // Storage optimization
    if (averageGas > 50000) {
      recommendations.push({
        icon: <Zap size={20} className="text-primary" />,
        title: 'Optimize Storage Layout',
        description: 'Pack variables efficiently by grouping similar types. Use uint256 for counters instead of smaller types to save gas on arithmetic.',
        impact: 'High',
        effort: 'Medium'
      });
    }

    // Loop optimization
    const potentialLoops = transactions.filter(t =>
      t.name && (t.name.includes('multiple') || t.name.includes('batch') || t.name.includes('array'))
    );
    if (potentialLoops.length > 0) {
      recommendations.push({
        icon: <Lightbulb size={20} className="text-success" />,
        title: 'Optimize Loops',
        description: 'Cache array length in loops, use unchecked blocks for safe arithmetic, and consider using calldata instead of memory for read-only arrays.',
        impact: 'Medium',
        effort: 'Low'
      });
    }

    // Function visibility
    recommendations.push({
      icon: <CheckCircle size={20} className="text-info" />,
      title: 'Use Proper Function Visibility',
      description: 'Mark functions as external when only called from outside. Use private/internal when possible to save deployment gas.',
      impact: 'Low',
      effort: 'Low'
    });

    // Constants and immutables
    recommendations.push({
      icon: <Zap size={20} className="text-primary" />,
      title: 'Use Constants & Immutables',
      description: 'Replace storage variables that never change with constant or immutable to save significant gas.',
      impact: 'High',
      effort: 'Low'
    });

    // Events optimization
    recommendations.push({
      icon: <Lightbulb size={20} className="text-success" />,
      title: 'Optimize Event Emissions',
      description: 'Use indexed parameters wisely (max 3). Emit events for important state changes to help with off-chain tracking.',
      impact: 'Low',
      effort: 'Low'
    });

    return recommendations;
  };

  const recommendations = generateRecommendations();

  const getImpactColor = (impact) => {
    switch(impact) {
      case 'High': return 'text-error';
      case 'Medium': return 'text-warning';
      case 'Low': return 'text-info';
      default: return 'text-gray-400';
    }
  };

  const getEffortColor = (effort) => {
    switch(effort) {
      case 'High': return 'bg-error/20 text-error';
      case 'Medium': return 'bg-warning/20 text-warning';
      case 'Low': return 'bg-success/20 text-success';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="text-primary" size={24} />
        <h3 className="text-xl font-bold">Gas Optimization Tips</h3>
      </div>

      {/* Optimization Score Summary */}
      <div className="bg-card/50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Current Optimization Score</p>
            <p className="text-3xl font-bold text-primary">{optimizationScore}/100</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Potential Savings</p>
            <p className="text-2xl font-bold text-success">
              {Math.max(0, 95 - optimizationScore)}%
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-400 mb-3">
          Recommended Optimizations ({recommendations.length})
        </h4>
        {recommendations.map((rec, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-card/50 rounded-lg p-4 hover:bg-card/70 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">{rec.icon}</div>
              <div className="flex-1">
                <h5 className="font-semibold text-white mb-1">{rec.title}</h5>
                <p className="text-sm text-gray-300 mb-3">{rec.description}</p>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">Impact:</span>
                    <span className={`font-semibold ${getImpactColor(rec.impact)}`}>
                      {rec.impact}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">Effort:</span>
                    <span className={`px-2 py-0.5 rounded ${getEffortColor(rec.effort)}`}>
                      {rec.effort}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* General Best Practices */}
      <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
        <h5 className="font-semibold text-primary mb-2 flex items-center gap-2">
          <Zap size={16} />
          Pro Tips
        </h5>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Use ++i instead of i++ in loops (saves 5 gas per iteration)</li>
          <li>• Batch operations when possible to amortize fixed costs</li>
          <li>• Consider using bytes32 instead of string for fixed-length data</li>
          <li>• Use error codes instead of revert strings to save deployment gas</li>
        </ul>
      </div>
    </motion.div>
  );
}
