
import { APP_DATA_KEY, INITIAL_APP_DATA } from '../constants';
import { AppData } from '../types';

export const loadData = (): AppData => {
  try {
    const json = localStorage.getItem(APP_DATA_KEY);
    if (json) {
      const data = JSON.parse(json);
      
      // Migration: Ensure all bank accounts have IDs
      if (data.bankAccounts) {
        data.bankAccounts = data.bankAccounts.map((acc: any) => ({
          ...acc,
          id: acc.id || Math.random().toString(36).substr(2, 9)
        }));
      }

      // Merge with initial in case of structure updates, but prefer saved data
      return { ...INITIAL_APP_DATA, ...data };
    }
  } catch (error) {
    console.error("Failed to load data from storage", error);
  }
  return INITIAL_APP_DATA;
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data to storage", error);
  }
};

export type ExportScope = 'all' | 'money' | 'fitness' | 'nutrition';

export const exportData = (data: AppData, type: 'clipboard' | 'file', scope: ExportScope = 'all') => {
  let exportPayload: any = {};

  if (scope === 'all') {
    exportPayload = data;
  } else if (scope === 'money') {
    exportPayload = {
      userProfile: data.userProfile,
      bankAccounts: data.bankAccounts,
      debtAccounts: data.debtAccounts,
      expenses: data.expenses,
      incomes: data.incomes,
      transfers: data.transfers,
      budgetConfig: data.budgetConfig,
      debtGoal: data.debtGoal
    };
  } else if (scope === 'fitness') {
    exportPayload = {
      fitnessGoals: data.fitnessGoals,
      whoopData: data.whoopData,
      workouts: data.workouts
    };
  } else if (scope === 'nutrition') {
    exportPayload = {
      fitnessGoals: data.fitnessGoals,
      meals: data.meals,
      nutritionQuickChips: data.nutritionQuickChips
    };
  }

  const jsonString = JSON.stringify({
    ...exportPayload,
    exportMetadata: {
      version: '1.0',
      timestamp: new Date().toISOString(),
      scope: scope
    }
  }, null, 2);

  if (type === 'clipboard') {
    navigator.clipboard.writeText(jsonString).then(() => {
        alert(`${scope.toUpperCase()} data copied to clipboard!`);
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
  } else {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `life-command-${scope}-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

export const importData = (jsonString: string): AppData | null => {
  try {
    const data = JSON.parse(jsonString);
    // Remove metadata before saving
    if ('exportMetadata' in data) {
      delete data.exportMetadata;
    }
    // Deep merge if partial import, but simplified here for now:
    // If it lacks top level keys, assume it's partial and merge with initial.
    // In a real app, complex merging logic would go here.
    return { ...INITIAL_APP_DATA, ...data } as AppData;
  } catch (error) {
    console.error("Import failed", error);
    return null;
  }
};
