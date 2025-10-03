import { useState, useCallback } from "react";
import { View, ViewGroup, UserNavigationSettings } from "../types";
import {
  getUserNavigationData,
  initializeUserNavigationData,
} from "../data/testData";

export const useViews = (userId: string) => {
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

  const [viewGroups, setViewGroups] = useState<ViewGroup[]>(() => {
    const savedGroups = sessionStorage.getItem(
      `navigationViewGroups_${userId}`
    );
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

  const [navSettings, setNavSettings] = useState<UserNavigationSettings>(() => {
    const savedSettings = sessionStorage.getItem(
      `navigationSettings_${userId}`
    );
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

  const updateViews = useCallback(
    (updatedViews: View[]) => {
      const sortedViews = [...updatedViews].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );
      setViews(sortedViews);
      sessionStorage.setItem(
        `navigationViews_${userId}`,
        JSON.stringify(sortedViews)
      );
    },
    [userId]
  );

  const updateViewGroups = useCallback(
    (updatedViewGroups: ViewGroup[]) => {
      const sortedGroups = [...updatedViewGroups].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );
      setViewGroups(sortedGroups);
      sessionStorage.setItem(
        `navigationViewGroups_${userId}`,
        JSON.stringify(sortedGroups)
      );
    },
    [userId]
  );

  const updateNavSettings = useCallback(
    (settings: UserNavigationSettings) => {
      setNavSettings(settings);
      sessionStorage.setItem(
        `navigationSettings_${userId}`,
        JSON.stringify(settings)
      );
    },
    [userId]
  );

  return {
    views,
    viewGroups,
    navSettings,
    updateViews,
    updateViewGroups,
    updateNavSettings,
  };
};
