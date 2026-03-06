import Cookies from 'js-cookie';

const SKIN_KEY = 'bird_skin';

export const SKINS = [
  { id: 'default', name: 'Classic', tint: 0xffffff, unlockAt: 0 },
  { id: 'blue', name: 'Sky', tint: 0x64b5f6, unlockAt: 10 },
  { id: 'red', name: 'Fire', tint: 0xef5350, unlockAt: 20 },
  { id: 'gold', name: 'Gold', tint: 0xffd700, unlockAt: 30 },
  { id: 'purple', name: 'Royal', tint: 0xce93d8, unlockAt: 50 },
];

export function getUnlockedSkins() {
  const best = parseInt(localStorage.getItem('record') || '0', 10);
  return SKINS.filter(s => best >= s.unlockAt);
}

export function getSelectedSkin() {
  const id = Cookies.get(SKIN_KEY) || 'default';
  const unlocked = getUnlockedSkins();
  return unlocked.find(s => s.id === id) || SKINS[0];
}

export function selectSkin(id) {
  Cookies.set(SKIN_KEY, id, { expires: 365 });
}
