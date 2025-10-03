import { View, ViewGroup, UserNavigationSettings } from "../types";
import { storageService } from "./storageService";

export const navigationService = {
  getViews: (userId: string): View[] => {
    return storageService.get<View[]>("navigationViews", userId) || [];
  },

  saveViews: (userId: string, views: View[]): void => {
    const sortedViews = [...views].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
    storageService.set("navigationViews", sortedViews, userId);
  },

  getViewGroups: (userId: string): ViewGroup[] => {
    return storageService.get<ViewGroup[]>("navigationViewGroups", userId) || [];
  },

  saveViewGroups: (userId: string, viewGroups: ViewGroup[]): void => {
    const sortedGroups = [...viewGroups].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
    storageService.set("navigationViewGroups", sortedGroups, userId);
  },

  getNavSettings: (userId: string): UserNavigationSettings | null => {
    return storageService.get<UserNavigationSettings>(
      "navigationSettings",
      userId
    );
  },

  saveNavSettings: (
    userId: string,
    settings: UserNavigationSettings
  ): void => {
    storageService.set("navigationSettings", settings, userId);
  },

  addView: (userId: string, view: View): void => {
    const views = navigationService.getViews(userId);
    navigationService.saveViews(userId, [...views, view]);
  },

  updateView: (userId: string, updatedView: View): void => {
    const views = navigationService.getViews(userId);
    const updatedViews = views.map((v) =>
      v.id === updatedView.id ? updatedView : v
    );
    navigationService.saveViews(userId, updatedViews);
  },

  deleteView: (userId: string, viewId: string): void => {
    const views = navigationService.getViews(userId);
    const filteredViews = views.filter((v) => v.id !== viewId);
    navigationService.saveViews(userId, filteredViews);
  },

  addViewGroup: (userId: string, viewGroup: ViewGroup): void => {
    const viewGroups = navigationService.getViewGroups(userId);
    navigationService.saveViewGroups(userId, [...viewGroups, viewGroup]);
  },

  updateViewGroup: (userId: string, updatedViewGroup: ViewGroup): void => {
    const viewGroups = navigationService.getViewGroups(userId);
    const updatedViewGroups = viewGroups.map((vg) =>
      vg.id === updatedViewGroup.id ? updatedViewGroup : vg
    );
    navigationService.saveViewGroups(userId, updatedViewGroups);
  },

  deleteViewGroup: (userId: string, viewGroupId: string): void => {
    const viewGroups = navigationService.getViewGroups(userId);
    const filteredViewGroups = viewGroups.filter((vg) => vg.id !== viewGroupId);
    navigationService.saveViewGroups(userId, filteredViewGroups);
  },
};
