const Equipment = require('../models/Equipment');
const Booking = require('../models/Booking');

class PredictionEngine {
  constructor() {
    this.patterns = {
      // Equipment usage patterns based on historical data
      seasonalTrends: {
        'camera': { summer: 1.3, winter: 0.8, spring: 1.1, fall: 1.0 },
        'lighting': { summer: 1.2, winter: 1.4, spring: 1.0, fall: 1.1 },
        'audio': { summer: 1.1, winter: 0.9, spring: 1.0, fall: 1.0 },
        'tripod': { summer: 1.0, winter: 0.8, spring: 1.2, fall: 1.1 }
      },
      
      // Day of week patterns
      dayOfWeek: {
        monday: 1.2,
        tuesday: 1.1,
        wednesday: 1.0,
        thursday: 1.1,
        friday: 1.3,
        saturday: 0.8,
        sunday: 0.5
      },
      
      // Equipment combinations (what's often rented together)
      combinations: {
        'camera': ['lens', 'tripod', 'monitor'],
        'lens': ['camera', 'tripod'],
        'lighting': ['grip', 'cable'],
        'audio': ['cable', 'monitor'],
        'tripod': ['camera', 'lens']
      }
    };
  }

  /**
   * Predict equipment availability for a given date range
   */
  async predictAvailability(equipmentId, startDate, endDate) {
    try {
      const equipment = await Equipment.findById(equipmentId);
      if (!equipment) {
        throw new Error('Equipment not found');
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      // Get historical booking data for this equipment
      const historicalBookings = await Booking.find({
        equipment: equipmentId,
        status: { $in: ['completed', 'active'] },
        startDate: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } // Last year
      });

      // Calculate base availability probability
      let baseProbability = 0.8; // 80% base availability

      // Adjust based on historical usage
      if (historicalBookings.length > 0) {
        const totalDays = historicalBookings.reduce((sum, booking) => {
          return sum + booking.duration;
        }, 0);
        
        const usageRate = totalDays / 365;
        baseProbability = Math.max(0.1, 1 - usageRate);
      }

      // Apply seasonal adjustments
      const season = this.getSeason(start);
      const seasonalMultiplier = this.patterns.seasonalTrends[equipment.category]?.[season] || 1.0;
      
      // Apply day of week adjustments
      const dayOfWeek = start.toLocaleDateString('en-US', { weekday: 'lowercase' });
      const dayMultiplier = this.patterns.dayOfWeek[dayOfWeek] || 1.0;

      // Calculate final probability
      const finalProbability = baseProbability * seasonalMultiplier * dayMultiplier;

      return {
        equipmentId,
        equipmentName: equipment.name,
        startDate,
        endDate,
        days,
        availabilityProbability: Math.min(1.0, Math.max(0.0, finalProbability)),
        confidence: this.calculateConfidence(historicalBookings.length),
        factors: {
          baseProbability,
          seasonalMultiplier,
          dayMultiplier,
          historicalBookings: historicalBookings.length
        }
      };
    } catch (error) {
      console.error('Error predicting availability:', error);
      throw error;
    }
  }

  /**
   * Get smart suggestions for equipment combinations
   */
  async getSmartSuggestions(equipmentId, userId) {
    try {
      const equipment = await Equipment.findById(equipmentId);
      if (!equipment) {
        throw new Error('Equipment not found');
      }

      // Get user's booking history
      const userBookings = await Booking.find({
        user: userId,
        status: { $in: ['completed', 'active'] }
      }).populate('equipment');

      // Get commonly rented together equipment
      const suggestions = [];

      // Based on equipment category combinations
      const categorySuggestions = this.patterns.combinations[equipment.category] || [];
      
      for (const category of categorySuggestions) {
        const availableEquipment = await Equipment.find({
          category,
          status: 'available',
          isActive: true
        }).limit(3);

        suggestions.push({
          type: 'category',
          category,
          equipment: availableEquipment,
          reason: `Often rented with ${equipment.category}`
        });
      }

      // Based on user's booking history
      if (userBookings.length > 0) {
        const userCategories = [...new Set(userBookings.map(b => b.equipment.category))];
        
        for (const category of userCategories) {
          if (category !== equipment.category) {
            const availableEquipment = await Equipment.find({
              category,
              status: 'available',
              isActive: true
            }).limit(2);

            if (availableEquipment.length > 0) {
              suggestions.push({
                type: 'user_history',
                category,
                equipment: availableEquipment,
                reason: 'Based on your booking history'
              });
            }
          }
        }
      }

      return {
        primaryEquipment: equipment,
        suggestions: suggestions.slice(0, 5) // Limit to 5 suggestions
      };
    } catch (error) {
      console.error('Error getting smart suggestions:', error);
      throw error;
    }
  }

  /**
   * Detect anomalies in equipment usage
   */
  async detectAnomalies() {
    try {
      const anomalies = [];

      // Check for overdue equipment
      const overdueBookings = await Booking.find({
        status: 'active',
        endDate: { $lt: new Date() }
      }).populate(['equipment', 'user']);

      for (const booking of overdueBookings) {
        const daysOverdue = Math.ceil((new Date() - booking.endDate) / (1000 * 60 * 60 * 24));
        
        anomalies.push({
          type: 'overdue',
          severity: daysOverdue > 7 ? 'high' : daysOverdue > 3 ? 'medium' : 'low',
          booking,
          daysOverdue,
          description: `Equipment overdue by ${daysOverdue} days`
        });
      }

      // Check for unusual booking patterns
      const recentBookings = await Booking.find({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last week
      });

      const bookingCounts = {};
      recentBookings.forEach(booking => {
        const userId = booking.user.toString();
        bookingCounts[userId] = (bookingCounts[userId] || 0) + 1;
      });

      // Flag users with unusually high booking activity
      Object.entries(bookingCounts).forEach(([userId, count]) => {
        if (count > 5) { // More than 5 bookings in a week
          anomalies.push({
            type: 'high_activity',
            severity: 'medium',
            userId,
            bookingCount: count,
            description: `User has ${count} bookings in the last week`
          });
        }
      });

      return anomalies;
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      throw error;
    }
  }

  /**
   * Generate equipment usage report
   */
  async generateUsageReport(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const bookings = await Booking.find({
        startDate: { $gte: start },
        endDate: { $lte: end },
        status: { $in: ['completed', 'active'] }
      }).populate('equipment');

      const report = {
        period: { startDate, endDate },
        totalBookings: bookings.length,
        totalRevenue: bookings.reduce((sum, b) => sum + b.totalCost, 0),
        equipmentUsage: {},
        categoryUsage: {},
        popularEquipment: [],
        revenueByCategory: {}
      };

      // Analyze equipment usage
      const equipmentStats = {};
      const categoryStats = {};

      bookings.forEach(booking => {
        const equipmentId = booking.equipment._id.toString();
        const category = booking.equipment.category;

        // Equipment stats
        if (!equipmentStats[equipmentId]) {
          equipmentStats[equipmentId] = {
            equipment: booking.equipment,
            bookings: 0,
            totalDays: 0,
            revenue: 0
          };
        }
        equipmentStats[equipmentId].bookings++;
        equipmentStats[equipmentId].totalDays += booking.duration;
        equipmentStats[equipmentId].revenue += booking.totalCost;

        // Category stats
        if (!categoryStats[category]) {
          categoryStats[category] = {
            bookings: 0,
            totalDays: 0,
            revenue: 0
          };
        }
        categoryStats[category].bookings++;
        categoryStats[category].totalDays += booking.duration;
        categoryStats[category].revenue += booking.totalCost;
      });

      report.equipmentUsage = equipmentStats;
      report.categoryUsage = categoryStats;

      // Get popular equipment (most bookings)
      report.popularEquipment = Object.values(equipmentStats)
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 10);

      // Revenue by category
      report.revenueByCategory = categoryStats;

      return report;
    } catch (error) {
      console.error('Error generating usage report:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  getSeason(date) {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  calculateConfidence(dataPoints) {
    if (dataPoints === 0) return 0.3;
    if (dataPoints < 5) return 0.5;
    if (dataPoints < 20) return 0.7;
    return 0.9;
  }
}

module.exports = new PredictionEngine();
