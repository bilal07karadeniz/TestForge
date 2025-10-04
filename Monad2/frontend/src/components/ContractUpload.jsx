import { useState } from 'react';
import { Upload, FileCode, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ContractUpload({ onAnalyze, isAnalyzing }) {
  const [file, setFile] = useState(null);
  const [code, setCode] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState('file'); // 'file' or 'paste'

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile.name.endsWith('.sol')) {
      toast.error('Please upload a .sol file');
      return;
    }

    if (selectedFile.size > 1024 * 1024) {
      toast.error('File size must be less than 1MB');
      return;
    }

    setFile(selectedFile);
    toast.success(`Loaded: ${selectedFile.name}`);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleAnalyze = () => {
    if (mode === 'file' && !file) {
      toast.error('Please upload a contract file');
      return;
    }

    if (mode === 'paste' && !code.trim()) {
      toast.error('Please paste contract code');
      return;
    }

    onAnalyze(mode === 'file' ? file : code);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="glass rounded-2xl p-8 space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setMode('file')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              mode === 'file'
                ? 'bg-gradient-primary text-white'
                : 'bg-card text-gray-400 hover:text-white'
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => setMode('paste')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              mode === 'paste'
                ? 'bg-gradient-primary text-white'
                : 'bg-card text-gray-400 hover:text-white'
            }`}
          >
            Paste Code
          </button>
        </div>

        {/* File Upload Mode */}
        {mode === 'file' && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-primary bg-primary/10'
                : 'border-gray-600 hover:border-primary/50'
            }`}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".sol"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="space-y-4">
              <div className="flex justify-center">
                {file ? (
                  <FileCode size={64} className="text-success" />
                ) : (
                  <Upload size={64} className="text-gray-400" />
                )}
              </div>

              {file ? (
                <div>
                  <p className="text-xl font-medium text-success">{file.name}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xl font-medium">Drop your .sol file here</p>
                  <p className="text-sm text-gray-400 mt-2">
                    or click to browse (max 1MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Code Paste Mode */}
        {mode === 'paste' && (
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// SPDX-License-Identifier: MIT&#10;pragma solidity ^0.8.0;&#10;&#10;contract YourContract {&#10;    // Your code here...&#10;}"
            className="w-full h-96 bg-card border border-gray-600 rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        )}

        {/* Analyze Button */}
        <motion.button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          whileHover={{ scale: isAnalyzing ? 1 : 1.02 }}
          whileTap={{ scale: isAnalyzing ? 1 : 0.98 }}
          className="w-full bg-gradient-primary text-white font-bold py-4 px-8 rounded-xl
                     hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50
                     disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              Analyzing Contract...
            </>
          ) : (
            <>
              <FileCode size={24} />
              Analyze Contract
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
