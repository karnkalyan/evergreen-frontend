import { apiRequest } from './api';
import { ApiResponse } from '../types';

export interface SalesReport {
  summary: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
    newVsReturning: {
      new: number;
      returning: number;
    };
  };
  charts: {
    monthlySales: Array<{
      month: string;
      sales: number;
    }>;
    topProducts: Array<{
      id: number;
      name: string;
      category: string;
      quantity: number;
      revenue: number;
    }>;
    salesByCategory: Array<{
      category: string;
      revenue: number;
    }>;
  };
  period: {
    type: string;
    startDate: string;
    endDate: string;
    year: number;
  };
}

export const reportService = {
  /**
   * Get sales reports data
   */
  getSalesReports: async (period?: string, year?: number): Promise<SalesReport> => {
    try {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      if (year) params.append('year', year.toString());

      const queryString = params.toString();
      const url = `/orders/reports/sales${queryString ? `?${queryString}` : ''}`;

      const response = await apiRequest(url) as ApiResponse;

      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to fetch sales reports');
    } catch (error) {
      console.error('Error fetching sales reports:', error);
      throw error;
    }
  }
};