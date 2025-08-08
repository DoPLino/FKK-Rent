import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  SparklesIcon, LightBulbIcon, ChartBarIcon, CogIcon,
  CurrencyDollarIcon, UserGroupIcon, CalendarIcon,
  ArrowTrendingUpIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import AIInsightsPanel from '../../components/AI/AIInsightsPanel';
import AISmartSearch from '../../components/AI/AISmartSearch';
import AIPredictiveMaintenance from '../../components/AI/AIPredictiveMaintenance';
import { useDarkMode } from '../../contexts/DarkModeContext';

const AIDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const { isDarkMode } = useDarkMode();

  const sections = [
    {
      id: 'overview',
      label: 'KI-Übersicht',
      icon: SparklesIcon,
      description: 'Intelligente Einblicke und Empfehlungen'
    },
    {
      id: 'investment',
      label: 'Investment-Vorschläge',
      icon: CurrencyDollarIcon,
      description: 'KI-gestützte Investitionsempfehlungen'
    },
    {
      id: 'maintenance',
      label: 'Predictive Maintenance',
      icon: CogIcon,
      description: 'Vorausschauende Wartungsplanung'
    },
    {
      id: 'inventory',
      label: 'Lageroptimierung',
      icon: ChartBarIcon,
      description: 'Intelligente Bestandsverwaltung'
    },
    {
      id: 'workflow',
      label: 'Workflow-Optimierung',
      icon: UserGroupIcon,
      description: 'Prozessverbesserungen durch KI'
    },
    {
      id: 'performance',
      label: 'Performance-Analyse',
      icon: ArrowTrendingUpIcon,
      description: 'Equipment-Performance-Insights'
    }
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Hier könnte die Suche implementiert werden
    console.log('AI Search:', query);
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-8 rounded-3xl ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50' 
            : 'bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl border border-gray-200/50'
        } shadow-2xl`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-2xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30' 
                : 'bg-gradient-to-br from-blue-100 to-purple-100'
            }`}>
              <SparklesIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                KI-Dashboard
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Intelligente Einblicke für Ihr Film Equipment Management
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              24/7
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              KI-Monitoring aktiv
            </div>
          </div>
        </div>

        {/* Smart Search */}
        <div className="max-w-2xl">
          <AISmartSearch onSearch={handleSearch} />
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`p-2 rounded-2xl ${
          isDarkMode 
            ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700/50' 
            : 'bg-white/80 backdrop-blur-xl border border-gray-200/50'
        } shadow-xl`}
      >
        <div className="flex space-x-2 overflow-x-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <motion.button
                key={section.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">{section.label}</div>
                  <div className="text-xs opacity-75">{section.description}</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Content Area */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIInsightsPanel type="general" />
            <AIPredictiveMaintenance />
          </div>
        )}

        {activeSection === 'investment' && (
          <div className="space-y-6">
            <AIInsightsPanel type="investment" />
            
            {/* Investment Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl ${
                isDarkMode 
                  ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700/50' 
                  : 'bg-white/80 backdrop-blur-xl border border-gray-200/50'
              } shadow-xl`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Investment-Metriken
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    €45,000
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Potenzielle Einsparungen
                  </div>
                </div>
                <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    12
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Empfohlene Investitionen
                  </div>
                </div>
                <div className="text-center p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    87%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    ROI-Prognose
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeSection === 'maintenance' && (
          <AIPredictiveMaintenance />
        )}

        {activeSection === 'inventory' && (
          <div className="space-y-6">
            <AIInsightsPanel type="inventory" />
            
            {/* Inventory Optimization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl ${
                isDarkMode 
                  ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700/50' 
                  : 'bg-white/80 backdrop-blur-xl border border-gray-200/50'
              } shadow-xl`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <ChartBarIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Lageroptimierung
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Überbestände reduzieren
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Redundant Equipment
                      </span>
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        -15 Items
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Underutilized Assets
                      </span>
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        -8 Items
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Bestandsauffüllung
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        High-Demand Items
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        +5 Items
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Critical Spares
                      </span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        +3 Items
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeSection === 'workflow' && (
          <div className="space-y-6">
            <AIInsightsPanel type="workflow" />
            
            {/* Workflow Optimization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl ${
                isDarkMode 
                  ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700/50' 
                  : 'bg-white/80 backdrop-blur-xl border border-gray-200/50'
              } shadow-xl`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <UserGroupIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Workflow-Optimierung
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    35%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Effizienzsteigerung
                  </div>
                </div>
                <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    50%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Zeitersparnis
                  </div>
                </div>
                <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    90%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Automatisierung
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeSection === 'performance' && (
          <div className="space-y-6">
            <AIInsightsPanel type="performance" />
            
            {/* Performance Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl ${
                isDarkMode 
                  ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700/50' 
                  : 'bg-white/80 backdrop-blur-xl border border-gray-200/50'
              } shadow-xl`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <ArrowTrendingUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Performance-Analyse
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Top-Performer
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Sony FX6
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        95% Utilization
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        ARRI Alexa Mini
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        92% Utilization
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Verbesserungspotential
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Canon C300 Mark III
                      </span>
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        45% Utilization
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Blackmagic URSA
                      </span>
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        28% Utilization
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AIDashboard;
