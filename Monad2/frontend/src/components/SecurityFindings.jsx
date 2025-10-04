import { motion } from 'framer-motion';
import { Shield, AlertTriangle, AlertCircle, ChevronDown, ChevronUp, Info, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export default function SecurityFindings({ findings }) {
  const { critical = [], warnings = [], info = [] } = findings;
  const [expandedSections, setExpandedSections] = useState({
    critical: true,
    warnings: true,
    info: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      critical: 'bg-error/20 text-error border border-error/30',
      warning: 'bg-warning/20 text-warning border border-warning/30',
      info: 'bg-info/20 text-info border border-info/30'
    };
    return badges[severity] || badges.info;
  };

  const FindingsList = ({ items, severity }) => {
    const icons = {
      critical: <AlertCircle size={16} className="text-error flex-shrink-0 mt-0.5" />,
      warning: <AlertTriangle size={16} className="text-warning flex-shrink-0 mt-0.5" />,
      info: <Shield size={16} className="text-info flex-shrink-0 mt-0.5" />
    };

    const [expandedItems, setExpandedItems] = useState({});

    const toggleItem = (index) => {
      setExpandedItems(prev => ({
        ...prev,
        [index]: !prev[index]
      }));
    };

    return (
      <div className="space-y-2">
        {items.map((finding, index) => {
          const isExpanded = expandedItems[index];
          const hasDetails = finding.description || finding.location || finding.remediation;

          return (
            <div
              key={index}
              className="bg-card/50 rounded-lg overflow-hidden hover:bg-card/70 transition-colors"
            >
              <div className="flex items-start gap-3 p-3">
                {icons[severity]}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white font-medium flex-1">{finding.title || finding}</p>
                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-semibold ${getSeverityBadge(severity)}`}>
                      {severity}
                    </span>
                  </div>

                  {finding.description && (
                    <p className="text-gray-300 text-sm mb-2">{finding.description}</p>
                  )}

                  {finding.location && (
                    <p className="text-gray-500 text-xs font-mono bg-background/50 px-2 py-1 rounded mb-2">
                      📍 {finding.location}
                    </p>
                  )}

                  {hasDetails && (
                    <button
                      onClick={() => toggleItem(index)}
                      className="text-xs text-primary hover:text-secondary transition-colors flex items-center gap-1 mt-2"
                    >
                      <Info size={12} />
                      {isExpanded ? 'Hide Details' : 'Show Details'}
                    </button>
                  )}

                  {isExpanded && finding.remediation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-3 bg-background/50 rounded border-l-2 border-primary"
                    >
                      <p className="text-xs font-semibold text-primary mb-1">💡 Recommended Fix:</p>
                      <p className="text-sm text-gray-300">{finding.remediation}</p>
                    </motion.div>
                  )}

                  {isExpanded && finding.references && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {finding.references.map((ref, i) => (
                        <a
                          key={i}
                          href={ref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-info hover:text-info/80 flex items-center gap-1"
                        >
                          <ExternalLink size={10} />
                          Learn More
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-primary" size={24} />
        <h3 className="text-xl font-bold">Security Analysis</h3>
      </div>

      <div className="space-y-4">
        {/* Critical Issues */}
        {critical.length > 0 && (
          <div className="border border-error/30 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('critical')}
              className="w-full flex items-center justify-between p-4 bg-error/10 hover:bg-error/15 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-error text-white px-3 py-1 rounded-full text-sm font-bold">
                  {critical.length}
                </div>
                <span className="font-semibold text-error">Critical Issues</span>
              </div>
              {expandedSections.critical ? (
                <ChevronUp size={20} className="text-error" />
              ) : (
                <ChevronDown size={20} className="text-error" />
              )}
            </button>
            {expandedSections.critical && (
              <div className="p-4 bg-card/20">
                <FindingsList items={critical} severity="critical" />
              </div>
            )}
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="border border-warning/30 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('warnings')}
              className="w-full flex items-center justify-between p-4 bg-warning/10 hover:bg-warning/15 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-warning text-background px-3 py-1 rounded-full text-sm font-bold">
                  {warnings.length}
                </div>
                <span className="font-semibold text-warning">Warnings</span>
              </div>
              {expandedSections.warnings ? (
                <ChevronUp size={20} className="text-warning" />
              ) : (
                <ChevronDown size={20} className="text-warning" />
              )}
            </button>
            {expandedSections.warnings && (
              <div className="p-4 bg-card/20">
                <FindingsList items={warnings} severity="warning" />
              </div>
            )}
          </div>
        )}

        {/* Info / Good Practices */}
        {info.length > 0 && (
          <div className="border border-info/30 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('info')}
              className="w-full flex items-center justify-between p-4 bg-info/10 hover:bg-info/15 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-info text-background px-3 py-1 rounded-full text-sm font-bold">
                  {info.length}
                </div>
                <span className="font-semibold text-info">Good Practices</span>
              </div>
              {expandedSections.info ? (
                <ChevronUp size={20} className="text-info" />
              ) : (
                <ChevronDown size={20} className="text-info" />
              )}
            </button>
            {expandedSections.info && (
              <div className="p-4 bg-card/20">
                <FindingsList items={info} severity="info" />
              </div>
            )}
          </div>
        )}

        {/* No issues found */}
        {critical.length === 0 && warnings.length === 0 && info.length === 0 && (
          <div className="text-center py-8">
            <Shield size={48} className="text-success mx-auto mb-4" />
            <p className="text-success font-semibold">No security issues detected</p>
            <p className="text-sm text-gray-400 mt-2">
              Contract appears to follow security best practices
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
