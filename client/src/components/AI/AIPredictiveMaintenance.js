import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CogIcon, ExclamationTriangleIcon, CheckCircleIcon, 
  ClockIcon, WrenchScrewdriverIcon, ChartBarIcon,
  ArrowTrendingUpIcon, ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { aiService } from '../../services/aiService';
import { useDarkMode } from '../../contexts/DarkModeContext';

const AIPredictiveMaintenance = ({ equipmentId = null }) => {
  const [maintenanceData, setMaintenanceData] = useState(null);
  const [healthScores, setHealthScores] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    loadMaintenanceData();
  }, [equipmentId]);

  const loadMaintenanceData = async () => {
    setLoading(true);
    try {
      const [predictionsRes, healthRes] = await Promise.all([
        aiService.getMaintenancePredictions(equipmentId),
        equipmentId ? aiService.getEquipmentHealthScore(equipmentId) : null
      ]);

      if (predictionsRes.success) {
        setPredictions(predictionsRes.predictions || []);
        setMaintenanceData(predictionsRes.data);
      }

      if (healthRes?.success) {
        setHealthScores([healthRes.data]);
      }
    } catch (error) {
      console.error('Error loading maintenance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getHealthBgColor = (score) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600 dark:text-red-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      low: 'text-green-600 dark:text-green-400'
    };
    return colors[priority] || colors.low;
  };

  const getPriorityBgColor = (priority) => {
    const colors = {
      high: 'bg-red-100 dark:bg-red-900/20',
      medium: 'bg-yellow-100 dark:bg-yellow-900/20',
      low: 'bg-green-100 dark:bg-green-900/20'
    };
    return colors[priority] || colors.low;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl ${
          isDarkMode 
            ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700/50' 
            : 'bg-white/80 backdrop-blur-xl border border-gray-200/50'
        } shadow-xl`}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-3 rounded-xl ${
            isDarkMode 
              ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20' 
              : 'bg-gradient-to-br from-blue-50 to-purple-50'
          }`}>
            <CogIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Predictive Maintenance
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              KI-gestützte Wartungsvorhersage und Equipment-Gesundheit
            </p>
          </div>
        </div>

        {/* Health Score Overview */}
        {healthScores.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {healthScores.map((health, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl ${getHealthBgColor(health.healthScore)} ${
                  isDarkMode ? 'bg-opacity-20' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Equipment Health
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {health.equipment?.name || 'Unbekanntes Equipment'}
                    </p>
                  </div>
                  <div className={`text-2xl font-bold ${getHealthColor(health.healthScore)}`}>
                    {health.healthScore}%
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${health.healthScore}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-2 rounded-full ${
                        health.healthScore >= 80 ? 'bg-green-500' :
                        health.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Maintenance Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`p-6 rounded-2xl ${
          isDarkMode 
            ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700/50' 
            : 'bg-white/80 backdrop-blur-xl border border-gray-200/50'
        } shadow-xl`}
      >
        <div className="flex items-center space-x-3 mb-6">
          <WrenchScrewdriverIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Wartungsvorhersagen
          </h3>
        </div>

        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border-l-4 ${
                isDarkMode ? 'bg-gray-800/30' : 'bg-white/50'
              } backdrop-blur-sm ${
                prediction.priority === 'high' ? 'border-l-red-500' :
                prediction.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {prediction.equipment?.name || 'Equipment'}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBgColor(prediction.priority)} ${getPriorityColor(prediction.priority)}`}>
                      {prediction.priority === 'high' ? 'Hoch' :
                       prediction.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {prediction.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>In {prediction.daysUntilMaintenance} Tagen</span>
                    </div>
                    {prediction.confidence && (
                      <div className="flex items-center space-x-1">
                        <ChartBarIcon className="w-4 h-4" />
                        <span>{Math.round(prediction.confidence * 100)}% Konfidenz</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {prediction.trend === 'increasing' ? (
                    <ArrowTrendingUpIcon className="w-5 h-5 text-red-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>

              {/* Recommendations */}
              {prediction.recommendations && prediction.recommendations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Empfehlungen:
                  </h5>
                  <ul className="space-y-1">
                    {prediction.recommendations.slice(0, 2).map((rec, recIndex) => (
                      <li key={recIndex} className="text-sm text-gray-600 dark:text-gray-400 flex items-start space-x-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {predictions.length === 0 && (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              Keine dringenden Wartungsarbeiten erforderlich
            </p>
          </div>
        )}
      </motion.div>

      {/* Maintenance Schedule */}
      {maintenanceData?.schedule && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-6 rounded-2xl ${
            isDarkMode 
              ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700/50' 
              : 'bg-white/80 backdrop-blur-xl border border-gray-200/50'
          } shadow-xl`}
        >
          <div className="flex items-center space-x-3 mb-6">
            <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Optimierter Wartungsplan
            </h3>
          </div>

          <div className="space-y-3">
            {maintenanceData.schedule.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {item.equipment?.name || 'Equipment'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.maintenanceType} - {item.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.duration}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.technician || 'Automatisch zugewiesen'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AIPredictiveMaintenance;
