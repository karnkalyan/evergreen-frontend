// src/lib/homepageService.dev.ts
import { HomepageSection, HomepageSectionType } from '../types';
import { MOCK_HOMEPAGE_LAYOUT } from '../data/mockData';

// Development-only service that uses mock data with local persistence
class HomepageServiceDev {
  private sections: HomepageSection[] = [...MOCK_HOMEPAGE_LAYOUT];

  async getHomepageSections(): Promise<HomepageSection[]> {
    console.log('🔧 Using development mock data');
    // Try to load from localStorage first
    try {
      const saved = localStorage.getItem('homepage-sections');
      if (saved) {
        this.sections = JSON.parse(saved);
        console.log('📁 Loaded sections from localStorage:', this.sections.length);
      }
    } catch (e) {
      console.warn('Could not load from localStorage, using default');
    }
    return this.sections;
  }

  async createHomepageSection(data: any): Promise<HomepageSection> {
    const newSection: HomepageSection = {
      id: `dev-${Date.now()}`,
      type: data.type,
      title: data.title || 'New Section',
      enabled: true,
      orderIndex: 0,
      parentId: data.parentId,
      ...data.config
    };
    this.sections.push(newSection);
    this.saveToLocalStorage();
    return newSection;
  }

  async updateHomepageSections(sections: HomepageSection[]): Promise<void> {
    this.sections = sections;
    this.saveToLocalStorage();
    console.log('📝 Development mode - sections updated and saved locally');
  }

  async deleteHomepageSection(id: string): Promise<void> {
    this.sections = this.sections.filter(s => s.id !== id);
    this.saveToLocalStorage();
    console.log('🗑️ Development mode - section deleted locally');
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('homepage-sections', JSON.stringify(this.sections));
    } catch (e) {
      console.warn('Could not save to localStorage');
    }
  }

  // Add other methods as stubs
  async getHomepageSectionById(id: string): Promise<HomepageSection> {
    const section = this.sections.find(s => s.id === id);
    if (!section) throw new Error('Section not found');
    return section;
  }

  async updateHomepageSection(id: string, data: any): Promise<HomepageSection> {
    const section = this.sections.find(s => s.id === id);
    if (!section) throw new Error('Section not found');
    Object.assign(section, data);
    this.saveToLocalStorage();
    return section;
  }

  async reorderHomepageSections(sections: any[]): Promise<void> {
    console.log('🔀 Development mode - reorder simulated');
  }

  async bulkUpdateHomepageSections(sections: any[]): Promise<void> {
    console.log('📦 Development mode - bulk update simulated');
  }
}

export const homepageService = new HomepageServiceDev();