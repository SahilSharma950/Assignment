import { registerSW } from 'virtual:pwa-register';

export const setupPWA = (
  onNeedRefresh?: () => void,
  onOfflineReady?: () => void
) => {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (onNeedRefresh) onNeedRefresh();
    },
    onOfflineReady() {
      if (onOfflineReady) onOfflineReady();
    },
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  return updateSW;
};
