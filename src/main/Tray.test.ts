import { expect, test, beforeEach, afterEach, describe, it, vi } from 'vitest'
import { nativeTheme, Tray } from 'electron';
import { GetTrayIconPath, HandleTray, CreateTrayMenu } from './Tray'
import { SettingsStore } from './Stores'

vi.mock('./Stores', () => {
  return {
    SettingsStore: {
      get: vi.fn((key) => {
        if (key === 'invertTrayColor') {
          return false;
        } else if (key === 'files') {
          return []
        }
      }),
    },
  };
});

vi.mock('electron', () => {
  return {
    nativeTheme: {
      shouldUseDarkColors: false,
      on: vi.fn()
    },
    nativeImage: {
      createFromPath: vi.fn()
    },
    app: {
      getPath: vi.fn().mockReturnValue(''),
    },
    Tray: vi.fn().mockImplementation(() => {
      return {
        setToolTip: vi.fn(),
        setContextMenu: vi.fn(),
        on: vi.fn(),
        destroy: vi.fn(),
      };
    }),
    Menu: {
      buildFromTemplate: vi.fn()
    }
  };
});

vi.mock('./index.js', () => {
  return {
    mainWindow: vi.fn(),
    HandleCreateWindow: vi.fn()
  };
});

vi.mock('path', () => {
  return {
    default: {
      join: vi.fn(),
    },
  };
});

describe('HandleTray', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Tray is called when setting is available', () => {
    vi.mocked(SettingsStore.get).mockImplementationOnce((key) => {
      if (key === 'tray') {
        return true;
      }
    });
    HandleTray()
    expect(Tray).toHaveBeenCalled();
  });
  it('Tray is not called when setting is available', () => {
    vi.mocked(SettingsStore.get).mockImplementationOnce((key) => {
      if (key === 'tray') {
        return false;
      }
    });
    HandleTray()
    expect(Tray).not.toHaveBeenCalled();
  });
});

describe('GetTrayIconPath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('On Windows in light mode, black .ico tray icon is used', () => {

    vi.stubGlobal('process', { platform: 'win32' });
    vi.mocked(nativeTheme).shouldUseDarkColors = true;
    expect(GetTrayIconPath()).toBe('/resources/trayDark.ico?asset');
  });
  it('On Windows in light mode, black .ico tray icon is used', () => {
    vi.mocked(nativeTheme).shouldUseDarkColors = false;
    vi.stubGlobal('process', { platform: 'win32' });
    expect(GetTrayIconPath()).toBe('/resources/trayLight.ico?asset');
  });
  it('On Windows in light mode, when tray icon color is inverted white .ico tray icon is used', () => {
    vi.mocked(SettingsStore.get).mockImplementationOnce((key) => {
      if (key === 'invertTrayColor') {
        return true;
      }
    });
    vi.mocked(nativeTheme).shouldUseDarkColors = false;
    vi.stubGlobal('process', { platform: 'win32' });
    expect(GetTrayIconPath()).toBe('/resources/trayDark.ico?asset');
  });
  it('On macOS in light mode, black .png tray icon is used', () => {
    vi.mocked(nativeTheme).shouldUseDarkColors = false;
    vi.stubGlobal('process', { platform: 'darwin' });
    expect(GetTrayIconPath()).toBe('/resources/trayLightTemplate.png?asset');
  });
  it('On macOS in dark mode, white .png tray icon is used', () => {
    vi.mocked(nativeTheme).shouldUseDarkColors = true;
    vi.stubGlobal('process', { platform: 'darwin' });
    expect(GetTrayIconPath()).toBe('/resources/trayDarkTemplate.png?asset');
  });
    it('On Linux in light mode, black .png tray icon is used', () => {
    vi.mocked(nativeTheme).shouldUseDarkColors = false;
    vi.stubGlobal('process', { platform: 'linux' });
    expect(GetTrayIconPath()).toBe('/resources/trayLightTemplate.png?asset');
  });
  it('On Linux in dark mode, white .png tray icon is used', () => {
    vi.mocked(nativeTheme).shouldUseDarkColors = true;
    vi.stubGlobal('process', { platform: 'linux' });
    expect(GetTrayIconPath()).toBe('/resources/trayDarkTemplate.png?asset');
  });
  it('On Linux in light mode, when tray icon color is inverted white .png tray icon is used', () => {
    vi.mocked(SettingsStore.get).mockImplementationOnce((key) => {
      if (key === 'invertTrayColor') {
        return true;
      }
    });
    vi.mocked(nativeTheme).shouldUseDarkColors = false;
    vi.stubGlobal('process', { platform: 'linux' });
    expect(GetTrayIconPath()).toBe('/resources/trayDarkTemplate.png?asset');
  });  
});