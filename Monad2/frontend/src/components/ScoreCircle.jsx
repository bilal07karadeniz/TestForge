import { motion } from 'framer-motion';
import { getScoreColor } from '../utils/constants';

export default function ScoreCircle({ score }) {
  const scoreData = getScoreColor(score);
  const circumference = 2 * Math.PI * 120;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-64 h-64 mx-auto">
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background circle */}
        <circle
          cx="128"
          cy="128"
          r="120"
          stroke="currentColor"
          strokeWidth="16"
          fill="none"
          className="text-card"
        />

        {/* Progress circle */}
        <motion.circle
          cx="128"
          cy="128"
          r="120"
          stroke={scoreData.color}
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 10px ${scoreData.color})` }}
        />
      </svg>

      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          <div className="text-6xl font-bold" style={{ color: scoreData.color }}>
            {score}
          </div>
          <div className="text-xl text-gray-400 mt-2">/ 100</div>
          <div className="text-sm font-medium mt-2" style={{ color: scoreData.color }}>
            {scoreData.label}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
