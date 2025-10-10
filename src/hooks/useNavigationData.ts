import { useState, useEffect } from "react";
import { View, ViewGroup, UserNavigationSettings } from "../types";
import {
  getUserNavigationData,
  initializeUserNavigationData,
} from "../data/testData";

interface UseNavigationDataOptions {
  userId: string;
}

export function useNavigationData({ userId }: UseNavigationDataOptions) {
  // Initialize views from storage or defaults
  const [views, setViews] = useState<View[]>(() => {
    const savedViews = sessionStorage.getItem(`navigationViews_${userId}`);
    if (savedViews) {
      return JSON.parse(savedViews);
    }
    const defaultData = getUserNavigationData(userId);
    if (defaultData) {
      sessionStorage.setItem(
        `navigationViews_${userId}`,
        JSON.stringify(defaultData.views)
      );
      return defaultData.views;
    }
    const newUserData = initializeUserNavigationData(userId);
    sessionStorage.setItem(
      `navigationViews_${userId}`,
      JSON.stringify(newUserData.views)
    );
    return newUserData.views;
  });

  // Initialize view groups from storage or defaults
  const [viewGroups, setViewGroups] = useState<ViewGroup[]>(() => {
    const savedGroups = sessionStorage.getItem(`navigationViewGroups_${userId}`);
    if (savedGroups) {
      return JSON.parse(savedGroups);
    }
    const defaultData = getUserNavigationData(userId);
    if (defaultData) {
      sessionStorage.setItem(
        `navigationViewGroups_${userId}`,
        JSON.stringify(defaultData.viewGroups)
      );
      return defaultData.viewGroups;
    }
    const newUserData = initializeUserNavigationData(userId);
    sessionStorage.setItem(
      `navigationViewGroups_${userId}`,
      JSON.stringify(newUserData.viewGroups)
    );
    return newUserData.viewGroups;
  });

  // Initialize navigation settings from storage or defaults
  const [navSettings, setNavSettings] = useState<UserNavigationSettings>(() => {
    const savedSettings = sessionStorage.getItem(`navigationSettings_${userId}`);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    const defaultData = getUserNavigationData(userId);
    if (defaultData) {
      sessionStorage.setItem(
        `navigationSettings_${userId}`,
        JSON.stringify(defaultData.navigationSettings)
      );
      return defaultData.navigationSettings;
    }
    const newUserData = initializeUserNavigationData(userId);
    sessionStorage.setItem(
      `navigationSettings_${userId}`,
      JSON.stringify(newUserData.navigationSettings)
    );
    return newUserData.navigationSettings;
  });

  // Persist views to storage when they change
  useEffect(() => {
    sessionStorage.setItem(`navigationViews_${userId}`, JSON.stringify(views));
  }, [views, userId]);

  // Persist view groups to storage when they change
  useEffect(() => {
    sessionStorage.setItem(
      `navigationViewGroups_${userId}`,
      JSON.stringify(viewGroups)
    );
  }, [viewGroups, userId]);

  // Persist navigation settings to storage when they change
  useEffect(() => {
    sessionStorage.setItem(
      `navigationSettings_${userId}`,
      JSON.stringify(navSettings)
    );
  }, [navSettings, userId]);

  return {
    views,
    viewGroups,
    navSettings,
    setViews,
    setViewGroups,
    setNavSettings,
  };
}
