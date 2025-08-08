import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon, LightBulbIcon, ChartBarIcon, ClockIcon,
  ExclamationTriangleIcon, CheckCircleIcon, ArrowTrendingUpIcon,
  CogIcon, UserGroupIcon, CalendarIcon, CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { aiService } from '../../services/aiService';
import { useDarkMode } from '../../contexts/DarkModeContext';

const AIInsightsPanel = ({ type = 'general', equipmentId = null }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    loadInsights();
  }, [type, equipmentId]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      let response;
      
      switch (type) {
        case 'investment':
          response = await aiService.getInvestmentSuggestions();
          break;
        case 'maintenance':
          response = await aiService.getMaintenancePredictions(equipmentId);
          break;
        case 'inventory':
          response = await aiService.getInventoryOptimization();
          break;
        case 'workflow':
          response = await aiService.getWorkflowOptimization();
          break;
        case 'performance':
          response = await aiService.getEquipmentPerformance(equipmentId);
          break;
        default:
          response = await aiService.getSmartNotifications();
      }

      if (response.success) {
        setInsights(response.data || []);
      }
    } catch (error) {
      console.error('Error loading AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (category) => {
    const icons = {
      investment: CurrencyDollarIcon,
      maintenance: CogIcon,
      performance: ChartBarIcon,
      workflow: UserGroupIcon,
      schedule: CalendarIcon,
      cost: CurrencyDollarIcon,
      trend: ArrowTrendingUpIcon,
      warning: ExclamationTriangleIcon,
      success: CheckCircleIcon,
      default: LightBulbIcon
    };
    return icons[category] || icons.default;
  };

  const getInsightColor = (priority) => {
    const colors = {
      high: 'border-l-red-500 bg-red-50 dark:bg-red-900/20',
      medium: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
      low: 'border-l-green-500 bg-green-50 dark:bg-green-900/20',
      info: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
    };
    return colors[priority] || colors.info;
  };

  const tabs = [
    { id: 'overview', label: 'Übersicht', icon: SparklesIcon },
    { id: 'recommendations', label: 'Empfehlungen', icon: LightBulbIcon },
    { id: 'trends', label: 'Trends', icon: ArrowTrendingUpIcon },
    { id: 'actions', label: 'Aktionen', icon: CheckCircleIcon }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl ${
        isDarkMode 
          ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700/50' 
          : 'bg-white/80 backdrop-blur-xl border border-gray-200/50'
      } shadow-xl`}
    >
      {/* Liquid Glass Header */}
      <div className={`relative p-6 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-800/80 to-gray-700/80' 
          : 'bg-gradient-to-r from-white/90 to-gray-50/90'
      } border-b border-gray-200/50 dark:border-gray-700/50`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20' 
                : 'bg-gradient-to-br from-blue-50 to-purple-50'
            }`}>
              <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                KI-Insights
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Intelligente Empfehlungen für Ihr Equipment
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadInsights}
            className={`p-2 rounded-xl ${
              isDarkMode 
                ? 'bg-gray-700/50 hover:bg-gray-600/50' 
                : 'bg-gray-100/50 hover:bg-gray-200/50'
            } transition-colors`}
          >
            <CogIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200/50 dark:border-gray-700/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.slice(0, 4).map((insight, index) => {
                    const Icon = getInsightIcon(insight.category);
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border-l-4 ${getInsightColor(insight.priority)} ${
                          isDarkMode ? 'bg-gray-800/30' : 'bg-white/50'
                        } backdrop-blur-sm`}
                      >
                        <div className="flex items-start space-x-3">
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {insight.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {insight.description}
                            </p>
                            {insight.value && (
                              <div className="mt-2 text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {insight.value}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div className="space-y-4">
                  {insights.filter(i => i.type === 'recommendation').map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl ${
                        isDarkMode ? 'bg-gray-800/30' : 'bg-white/50'
                      } backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
                        }`}>
                          <LightBulbIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {insight.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {insight.description}
                          </p>
                          {insight.impact && (
                            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                              Potenzieller Impact: {insight.impact}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'trends' && (
                <div className="space-y-4">
                  {insights.filter(i => i.type === 'trend').map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl ${
                        isDarkMode ? 'bg-gray-800/30' : 'bg-white/50'
                      } backdrop-blur-sm`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {insight.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                            {insight.trend}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {insight.period}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'actions' && (
                <div className="space-y-4">
                  {insights.filter(i => i.type === 'action').map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl ${
                        isDarkMode ? 'bg-gray-800/30' : 'bg-white/50'
                      } backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {insight.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Ausführen
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default AIInsightsPanel;
