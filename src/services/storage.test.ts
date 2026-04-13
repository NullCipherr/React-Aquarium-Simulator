import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadState, saveState } from './storage';

class LocalStorageMock implements Storage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

const makeState = () => ({
  fishList: [
    {
      id: 'fish_1',
      speciesId: 'neon_tetra',
      x: 100,
      y: 80,
      dx: 1,
      dy: 0.5,
      size: 15,
      hunger: 20,
      age: 10,
      health: 90,
      target: null,
      flip: false,
      isStressed: false,
      happiness: 80,
      rotation: 0,
    },
  ],
  foodList: [],
  environment: 'freshwater' as const,
  decorations: [],
  waterQuality: {
    ph: 7.2,
    ammonia: 0,
    nitrite: 0,
    nitrate: 5,
    temperature: 25,
    targetTemperature: 25,
    oxygen: 100,
    co2: 10,
    gh: 6,
    kh: 4,
    salinity: 1,
    phosphate: 0.04,
    waterLevel: 100,
    tds: 320,
  },
  ecosystem: {
    timeOfDay: 8,
    lightOn: true,
    algaeLevel: 0,
  },
});

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new LocalStorageMock(),
    configurable: true,
  });
});

describe('storage service', () => {
  it('salva com envelope versionado', () => {
    const state = makeState();

    saveState(state);

    const raw = localStorage.getItem('aquariumState');
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw!);
    expect(parsed.version).toBe(2);
    expect(typeof parsed.savedAt).toBe('string');
    expect(parsed.data.environment).toBe('freshwater');
  });

  it('carrega estado versionado', () => {
    localStorage.setItem(
      'aquariumState',
      JSON.stringify({
        version: 2,
        savedAt: '2026-03-25T12:00:00.000Z',
        data: {
          fishList: [],
          foodList: [],
          environment: 'saltwater',
          decorations: [],
          ecosystem: { timeOfDay: 6, lightOn: false, algaeLevel: 14 },
        },
      }),
    );

    const loaded = loadState();

    expect(loaded).not.toBeNull();
    expect(loaded?.environment).toBe('saltwater');
    expect(loaded?.waterQuality.salinity).toBe(1.024);
    expect(loaded?.ecosystem.algaeLevel).toBe(14);
  });

  it('mantém compatibilidade com formato legado sem versão', () => {
    const legacy = makeState();
    localStorage.setItem('aquariumState', JSON.stringify(legacy));

    const loaded = loadState();

    expect(loaded).not.toBeNull();
    expect(loaded?.fishList.length).toBe(1);
    expect(loaded?.environment).toBe('freshwater');
  });

  it('retorna null quando payload está inválido', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    localStorage.setItem('aquariumState', '{invalid-json');

    const loaded = loadState();

    expect(loaded).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
