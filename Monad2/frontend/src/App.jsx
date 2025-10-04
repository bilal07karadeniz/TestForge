import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import ContractUpload from './components/ContractUpload';
import ProgressTracker from './components/ProgressTracker';
import ResultsDashboard from './components/ResultsDashboard';
import { analyzeContract, analyzeContractCode } from './services/api';
import { API_URL } from './utils/constants';

// Initialize socket connection
const socket = io(API_URL);

function App() {
  const [stage, setStage] = useState('upload'); // 'upload' | 'analyzing' | 'results'
  const [currentStep, setCurrentStep] = useState('analyzing');
  const [testProgress, setTestProgress] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    // Listen for progress updates
    socket.on('progress', (data) => {
      console.log('Progress update:', data);
      setCurrentStep(data.step);

      if (data.step === 'testing' && data.testProgress) {
        setTestProgress(data.testProgress);
      }
    });

    // Listen for completion
    socket.on('complete', (data) => {
      console.log('Analysis complete:', data);
      console.log('Deployment data:', data?.deployment);
      console.log('Test results:', data?.testResults);
      console.log('Test results structure:', {
        total: data?.testResults?.total,
        passed: data?.testResults?.passed,
        failed: data?.testResults?.failed,
        tests: data?.testResults?.tests
      });
      console.log('Gas metrics:', data?.gasMetrics);
      setResults(data);
      setStage('results');
      toast.success('Analysis complete!');
    });

    // Listen for errors
    socket.on('error', (error) => {
      console.error('Analysis error:', error);
      toast.error(error.message || 'Analysis failed');
      setStage('upload');
    });

    return () => {
      socket.off('progress');
      socket.off('complete');
      socket.off('error');
    };
  }, []);

  const handleAnalyze = async (contractInput) => {
    setStage('analyzing');
    setCurrentStep('analyzing');
    setTestProgress(null);

    try {
      let response;

      if (contractInput instanceof File) {
        // File upload
        toast.loading('Uploading contract...', { id: 'upload' });
        response = await analyzeContract(contractInput);
        toast.dismiss('upload');
      } else {
        // Code paste
        toast.loading('Analyzing contract...', { id: 'upload' });
        response = await analyzeContractCode(contractInput);
        toast.dismiss('upload');
      }

      // Response will be handled by socket events
      // The HTTP response is just an acknowledgment, real data comes via socket
      console.log('HTTP response received:', response);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.message || 'Failed to analyze contract');
      setStage('upload');
    }
  };

  const handleReset = () => {
    setStage('upload');
    setResults(null);
    setCurrentStep('analyzing');
    setTestProgress(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1E293B',
            color: '#fff',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">TestForge</h1>
                <p className="text-xs text-gray-400">AI-Powered Smart Contract Testing</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
              <span className="text-gray-400">Monad Testnet</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {stage === 'upload' && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-4xl font-bold mb-4">
                Deploy & Test Smart Contracts with{' '}
                <span className="gradient-text">AI</span>
              </h2>
              <p className="text-gray-400 text-lg">
                Upload your Solidity contract and let AI analyze, deploy, and test it on
                Monad Testnet with comprehensive security analysis.
              </p>
            </div>
            <ContractUpload onAnalyze={handleAnalyze} isAnalyzing={false} />
          </div>
        )}

        {stage === 'analyzing' && (
          <ProgressTracker currentStep={currentStep} testProgress={testProgress} />
        )}

        {stage === 'results' && results && (
          <ResultsDashboard results={results} onReset={handleReset} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400 text-sm">
            <p className="mb-2">
              Built for{' '}
              <a
                href="https://monad.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-secondary transition-colors"
              >
                Monad Hackathon
              </a>
            </p>
            <p>Powered by Claude AI & Monad Testnet</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
