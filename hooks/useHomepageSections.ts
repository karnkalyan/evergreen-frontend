// src/hooks/useHomepageSections.ts
import { useState, useEffect } from 'react';
import { HomepageSection } from '../types';
import { homepageService } from '../lib/homeService';

export const useHomepageSections = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sections on mount
  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await homepageService.getHomepageSections();
      setSections(data);
    } catch (err) {
      console.error('Failed to load homepage sections:', err);
      setError('Failed to load homepage sections');
    } finally {
      setLoading(false);
    }
  };

  const updateSections = async (newSections: HomepageSection[]) => {
    try {
      // Transform sections to API format and update
      const apiSections = newSections.map(section => 
        homepageService.transformSectionToApiFormat(section)
      );
      
      // Update order and structure
      const reorderData = apiSections.map((section, index) => ({
        id: section.id,
        orderIndex: index,
        parentId: section.parentId || null
      }));

      await homepageService.bulkUpdateHomepageSections(
        apiSections.map(section => ({
          id: section.id,
          data: section
        }))
      );
      
      await homepageService.reorderHomepageSections(reorderData);
      
      setSections(newSections);
    } catch (err) {
      console.error('Failed to update homepage sections:', err);
      throw err;
    }
  };

  const addSection = async (sectionData: any) => {
    try {
      const newSection = await homepageService.createHomepageSection(sectionData);
      const transformedSection = homepageService.transformApiToSectionFormat(newSection);
      setSections(prev => [...prev, transformedSection]);
      return transformedSection;
    } catch (err) {
      console.error('Failed to add homepage section:', err);
      throw err;
    }
  };

  const deleteSection = async (id: string) => {
    try {
      await homepageService.deleteHomepageSection(id);
      setSections(prev => prev.filter(section => section.id !== id));
    } catch (err) {
      console.error('Failed to delete homepage section:', err);
      throw err;
    }
  };

  return {
    sections,
    loading,
    error,
    updateSections,
    addSection,
    deleteSection,
    refresh: loadSections
  };
};