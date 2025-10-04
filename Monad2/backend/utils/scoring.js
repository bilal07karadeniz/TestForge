/**
 * Calculates overall contract score based on multiple factors
 */
export function calculateScore(testResults, aiReport, deploymentInfo) {
  const weights = {
    testSuccess: 0.4,    // 40% - Test pass rate
    security: 0.35,      // 35% - Security score from AI
    gas: 0.25           // 25% - Gas optimization
  };

  // Test success score (0-100)
  const testScore = calculateTestScore(testResults);

  // Security score from AI report
  const securityScore = aiReport.securityScore || 0;

  // Gas optimization score from AI report
  const gasScore = aiReport.gasScore || 0;

  // Weighted average
  const overallScore = Math.round(
    testScore * weights.testSuccess +
    securityScore * weights.security +
    gasScore * weights.gas
  );

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    breakdown: {
      testScore,
      securityScore,
      gasScore
    }
  };
}

/**
 * Calculates test score based on pass rate and coverage
 */
function calculateTestScore(testResults) {
  if (!testResults || !testResults.results) {
    return 0;
  }

  const { total, passed, failures } = testResults.results;

  if (total === 0) {
    return 0;
  }

  // Base score from pass rate
  const passRate = passed / total;
  let score = passRate * 100;

  // Penalty for failures
  if (failures > 0) {
    score -= failures * 5; // -5 points per failure
  }

  // Bonus for comprehensive testing (more tests = better)
  if (total >= 10) {
    score += 5;
  } else if (total >= 5) {
    score += 2;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Generates severity level for issues
 */
export function getSeverityLevel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
}

/**
 * Generates gas efficiency rating
 */
export function getGasEfficiencyRating(gasScore) {
  if (gasScore >= 90) return 'Highly Optimized';
  if (gasScore >= 75) return 'Well Optimized';
  if (gasScore >= 60) return 'Moderately Optimized';
  if (gasScore >= 40) return 'Needs Optimization';
  return 'Inefficient';
}

/**
 * Formats final analysis report
 */
export function formatFinalReport(score, aiReport, testResults, deploymentInfo) {
  return {
    score: score.overallScore,
    severity: getSeverityLevel(score.overallScore),
    critical: aiReport.critical || [],
    warnings: aiReport.warnings || [],
    info: aiReport.info || [],
    analysis: aiReport.analysis || aiReport.summary || 'Analysis complete',
    breakdown: {
      testing: {
        score: score.breakdown.testScore,
        total: testResults.results.total,
        passed: testResults.results.passed,
        failed: testResults.results.failures
      },
      security: {
        score: score.breakdown.securityScore,
        critical: aiReport.critical || [],
        warnings: aiReport.warnings || []
      },
      gas: {
        score: score.breakdown.gasScore,
        rating: getGasEfficiencyRating(score.breakdown.gasScore),
        analysis: aiReport.gasAnalysis || {}
      }
    },
    deployment: {
      network: 'Monad Testnet',
      address: deploymentInfo.address,
      txHash: deploymentInfo.txHash,
      gasUsed: deploymentInfo.gasUsed,
      explorer: deploymentInfo.explorer
    },
    recommendations: aiReport.recommendations || [],
    summary: aiReport.summary || 'Analysis complete',
    timestamp: new Date().toISOString()
  };
}
