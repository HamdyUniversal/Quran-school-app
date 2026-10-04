import { create } from "zustand";

import type { AppLocale } from "@/core/i18n/messages";

type UiPreferences = {
	locale: AppLocale;
	setLocale: (locale: AppLocale) => void;
};

export const useUiPreferences = create<UiPreferences>((set) => ({
	locale: "ar",
	setLocale: (locale) => set({ locale }),
}));
