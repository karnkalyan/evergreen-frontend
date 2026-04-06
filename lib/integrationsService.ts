// integrationsService.ts
import { apiRequest } from './api';
import { IntegrationSettings, IntegrationTestResponse, IntegrationUpdateResponse } from '../types';

export const integrationsService = {
  // Get integration settings
  getIntegrationSettings: async (): Promise<IntegrationSettings | null> => {
    try {
      const response = await apiRequest('/integrations') as any;
      
      if (response.success && response.data) {
        // Ensure adminEmails is always an array
        const settings = response.data;
        if (settings.adminEmails && !Array.isArray(settings.adminEmails)) {
          settings.adminEmails = [settings.adminEmails].filter(Boolean);
        } else if (!settings.adminEmails) {
          settings.adminEmails = [];
        }
        return settings;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching integration settings:', error);
      return null;
    }
  },

  // Update integration settings
  updateIntegrationSettings: async (settingsData: Partial<IntegrationSettings>): Promise<IntegrationUpdateResponse> => {
    const response = await apiRequest('/integrations', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsData),
    }) as any;
    
    // Ensure adminEmails is always an array in response
    if (response.success && response.data) {
      if (response.data.adminEmails && !Array.isArray(response.data.adminEmails)) {
        response.data.adminEmails = [response.data.adminEmails].filter(Boolean);
      } else if (!response.data.adminEmails) {
        response.data.adminEmails = [];
      }
    }
    
    return response;
  },

  // Test SMTP connection
  testSmtpConnection: async (smtpConfig: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    smtpEncryption: string;
  }): Promise<IntegrationTestResponse> => {
    const response = await apiRequest('/integrations/test/smtp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(smtpConfig),
    }) as IntegrationTestResponse;
    
    return response;
  },

  // Test SMS gateway
  testSmsGateway: async (smsConfig: {
    smsProvider: string;
    smsAccountSid: string;
    smsAuthToken: string;
    smsFromNumber: string;
    testPhoneNumber: string;
  }): Promise<IntegrationTestResponse> => {
    const response = await apiRequest('/integrations/test/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(smsConfig),
    }) as IntegrationTestResponse;
    
    return response;
  },

  // Test payment gateway
  testPaymentGateway: async (paymentConfig: {
    paymentProvider: string;
    paymentPublicKey: string;
    paymentSecretKey: string;
  }): Promise<IntegrationTestResponse> => {
    const response = await apiRequest('/integrations/test/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentConfig),
    }) as IntegrationTestResponse;
    
    return response;
  }
};