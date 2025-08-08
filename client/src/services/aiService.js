import api from './api';

class AIService {
  // Smart Equipment Investment Suggestions
  async getInvestmentSuggestions(filters = {}) {
    try {
      const response = await api.post('/ai/investment-suggestions', filters);
      return {
        success: true,
        data: response.data.data || response.data,
        insights: response.data.insights || []
      };
    } catch (error) {
      console.error('Error fetching investment suggestions:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get investment suggestions',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Predictive Maintenance Analysis
  async getMaintenancePredictions(equipmentId = null) {
    try {
      const params = equipmentId ? { equipmentId } : {};
      const response = await api.get('/ai/maintenance-predictions', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        predictions: response.data.predictions || [],
        recommendations: response.data.recommendations || []
      };
    } catch (error) {
      console.error('Error fetching maintenance predictions:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get maintenance predictions',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Smart Inventory Optimization
  async getInventoryOptimization() {
    try {
      const response = await api.get('/ai/inventory-optimization');
      return {
        success: true,
        data: response.data.data || response.data,
        recommendations: response.data.recommendations || [],
        savings: response.data.savings || {}
      };
    } catch (error) {
      console.error('Error fetching inventory optimization:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get inventory optimization',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Workflow Optimization Suggestions
  async getWorkflowOptimization() {
    try {
      const response = await api.get('/ai/workflow-optimization');
      return {
        success: true,
        data: response.data.data || response.data,
        suggestions: response.data.suggestions || [],
        efficiencyGains: response.data.efficiencyGains || {}
      };
    } catch (error) {
      console.error('Error fetching workflow optimization:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get workflow optimization',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Smart Booking Recommendations
  async getBookingRecommendations(projectData) {
    try {
      const response = await api.post('/ai/booking-recommendations', projectData);
      return {
        success: true,
        data: response.data.data || response.data,
        recommendations: response.data.recommendations || [],
        alternatives: response.data.alternatives || []
      };
    } catch (error) {
      console.error('Error fetching booking recommendations:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get booking recommendations',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Equipment Performance Analytics
  async getEquipmentPerformance(equipmentId = null, timeRange = '30d') {
    try {
      const params = { timeRange };
      if (equipmentId) params.equipmentId = equipmentId;
      
      const response = await api.get('/ai/equipment-performance', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        metrics: response.data.metrics || {},
        trends: response.data.trends || [],
        insights: response.data.insights || []
      };
    } catch (error) {
      console.error('Error fetching equipment performance:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get equipment performance',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Smart Cost Analysis
  async getCostAnalysis(filters = {}) {
    try {
      const response = await api.post('/ai/cost-analysis', filters);
      return {
        success: true,
        data: response.data.data || response.data,
        breakdown: response.data.breakdown || {},
        savings: response.data.savings || {},
        recommendations: response.data.recommendations || []
      };
    } catch (error) {
      console.error('Error fetching cost analysis:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get cost analysis',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Predictive Demand Forecasting
  async getDemandForecast(timeRange = '90d') {
    try {
      const response = await api.get('/ai/demand-forecast', { params: { timeRange } });
      return {
        success: true,
        data: response.data.data || response.data,
        forecast: response.data.forecast || [],
        confidence: response.data.confidence || {},
        factors: response.data.factors || []
      };
    } catch (error) {
      console.error('Error fetching demand forecast:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get demand forecast',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Smart Equipment Pairing
  async getEquipmentPairing(primaryEquipmentId) {
    try {
      const response = await api.get(`/ai/equipment-pairing/${primaryEquipmentId}`);
      return {
        success: true,
        data: response.data.data || response.data,
        pairings: response.data.pairings || [],
        compatibility: response.data.compatibility || {},
        suggestions: response.data.suggestions || []
      };
    } catch (error) {
      console.error('Error fetching equipment pairing:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get equipment pairing',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // AI-Powered Search & Discovery
  async smartSearch(query, context = {}) {
    try {
      const response = await api.post('/ai/smart-search', { query, context });
      return {
        success: true,
        data: response.data.data || response.data,
        results: response.data.results || [],
        suggestions: response.data.suggestions || [],
        related: response.data.related || []
      };
    } catch (error) {
      console.error('Error performing smart search:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to perform smart search',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Automated Report Generation
  async generateReport(reportType, parameters = {}) {
    try {
      const response = await api.post('/ai/generate-report', { reportType, parameters });
      return {
        success: true,
        data: response.data.data || response.data,
        report: response.data.report || {},
        insights: response.data.insights || [],
        recommendations: response.data.recommendations || []
      };
    } catch (error) {
      console.error('Error generating report:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate report',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Smart Notification System
  async getSmartNotifications() {
    try {
      const response = await api.get('/ai/smart-notifications');
      return {
        success: true,
        data: response.data.data || response.data,
        notifications: response.data.notifications || [],
        priorities: response.data.priorities || {},
        actions: response.data.actions || []
      };
    } catch (error) {
      console.error('Error fetching smart notifications:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get smart notifications',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Equipment Health Score
  async getEquipmentHealthScore(equipmentId) {
    try {
      const response = await api.get(`/ai/equipment-health/${equipmentId}`);
      return {
        success: true,
        data: response.data.data || response.data,
        healthScore: response.data.healthScore || 0,
        factors: response.data.factors || [],
        recommendations: response.data.recommendations || []
      };
    } catch (error) {
      console.error('Error fetching equipment health score:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get equipment health score',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Smart Scheduling Optimization
  async optimizeSchedule(scheduleData) {
    try {
      const response = await api.post('/ai/optimize-schedule', scheduleData);
      return {
        success: true,
        data: response.data.data || response.data,
        optimizedSchedule: response.data.optimizedSchedule || [],
        conflicts: response.data.conflicts || [],
        suggestions: response.data.suggestions || []
      };
    } catch (error) {
      console.error('Error optimizing schedule:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to optimize schedule',
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Equipment Lifecycle Analysis
  async getLifecycleAnalysis(equipmentId = null) {
    try {
      const params = equipmentId ? { equipmentId } : {};
      const response = await api.get('/ai/lifecycle-analysis', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        lifecycle: response.data.lifecycle || {},
        recommendations: response.data.recommendations || [],
        replacement: response.data.replacement || {}
      };
    } catch (error) {
      console.error('Error fetching lifecycle analysis:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get lifecycle analysis',
        error: error.response?.data?.error || error.message
      };
    }
  }
}

export const aiService = new AIService();
