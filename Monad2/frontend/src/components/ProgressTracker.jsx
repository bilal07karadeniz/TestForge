import { motion } from 'framer-motion';
import {
  Brain,
  Code,
  Rocket,
  Coins,
  TestTube,
  FileCheck,
  CheckCircle,
  Loader2
} from 'lucide-react';

const steps = [
  { id: 'analyzing', label: 'AI analyzing contract', icon: Brain },
  { id: 'compiling', label: 'Compiling contract', icon: Code },
  { id: 'deploying', label: 'Deploying to Monad', icon: Rocket },
  { id: 'mocks', label: 'Creating test tokens', icon: Coins },
  { id: 'testing', label: 'Running tests', icon: TestTube },
  { id: 'reporting', label: 'Generating report', icon: FileCheck },
];

export default function ProgressTracker({ currentStep, testProgress }) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);
  const overallProgress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="glass rounded-2xl p-8">
        <h3 className="text-2xl font-bold mb-4 text-center gradient-text">
          Analysis in Progress
        </h3>

        {/* Overall Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Overall Progress</span>
            <span className="text-primary font-bold">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-card rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%]"
              initial={{ width: 0 }}
              animate={{
                width: `${overallProgress}%`,
                backgroundPosition: ['0% 0%', '100% 0%']
              }}
              transition={{
                width: { duration: 0.5 },
                backgroundPosition: { repeat: Infinity, duration: 2, ease: 'linear' }
              }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Step {currentIndex + 1} of {steps.length}: {steps[currentIndex]?.label}
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  isCurrent ? 'bg-primary/10 border border-primary/30' : ''
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isComplete
                      ? 'bg-success text-white'
                      : isCurrent
                      ? 'bg-primary text-white animate-pulse'
                      : 'bg-card text-gray-500'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle size={24} />
                  ) : isCurrent ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <Icon size={24} />
                  )}
                </div>

                {/* Label */}
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      isComplete
                        ? 'text-success'
                        : isCurrent
                        ? 'text-white'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </p>

                  {/* Progress for testing step */}
                  {isCurrent && step.id === 'testing' && testProgress && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          {testProgress.current} / {testProgress.total} tests
                        </span>
                        <span className="text-primary font-medium">
                          {Math.round((testProgress.current / testProgress.total) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-card rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-primary"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(testProgress.current / testProgress.total) * 100}%`,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Status indicator */}
                <div>
                  {isComplete && (
                    <span className="text-success text-sm font-medium">✓ Done</span>
                  )}
                  {isCurrent && (
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-primary"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-primary"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-primary"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
