// src/lib/emailAutomationService.ts
import { apiRequest, handleApiError, handleApiSuccess } from './api';
import { EmailTemplate, AutomationRule } from '../types';

export const emailAutomationService = {
  // Email Templates
  getEmailTemplates: async (): Promise<EmailTemplate[]> => {
    try {
      const response = await apiRequest('/email-templates') as any;
      return response.data?.templates || [];
    } catch (error) {
      console.error('Error fetching email templates:', error);
      return [];
    }
  },

  getEmailTemplate: async (id: number): Promise<EmailTemplate | null> => {
    try {
      const response = await apiRequest(`/email-templates/${id}`) as any;
      return response.data || null;
    } catch (error) {
      console.error('Error fetching email template:', error);
      return null;
    }
  },

  createEmailTemplate: async (templateData: Partial<EmailTemplate>): Promise<any> => {
    try {
      const response = await apiRequest('/email-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateEmailTemplate: async (id: number, templateData: Partial<EmailTemplate>): Promise<any> => {
    try {
      const response = await apiRequest(`/email-templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteEmailTemplate: async (id: number): Promise<any> => {
    try {
      const response = await apiRequest(`/email-templates/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Automation Rules
  getAutomationRules: async (): Promise<AutomationRule[]> => {
    try {
      const response = await apiRequest('/automation-rules') as any;
      return response.data?.rules || [];
    } catch (error) {
      console.error('Error fetching automation rules:', error);
      return [];
    }
  },

  createAutomationRule: async (ruleData: Partial<AutomationRule>): Promise<any> => {
    try {
      const response = await apiRequest('/automation-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ruleData),
      });
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateAutomationRule: async (id: number, ruleData: Partial<AutomationRule>): Promise<any> => {
    try {
      const response = await apiRequest(`/automation-rules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ruleData),
      });
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteAutomationRule: async (id: number): Promise<any> => {
    try {
      const response = await apiRequest(`/automation-rules/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Test Automation Rule
  testAutomationRule: async (ruleId: number, variables: any): Promise<any> => {
    try {
      const response = await apiRequest(`/automation-rules/${ruleId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(variables),
      });
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  }
};