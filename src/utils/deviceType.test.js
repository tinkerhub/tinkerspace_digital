import { classifyDevice } from './deviceType';

describe('classifyDevice', () => {
  it('detects smart TV platforms from the user agent', () => {
    expect(classifyDevice({ userAgent: 'Mozilla/5.0 (SMART-TV; Tizen 6.0)', width: 3840 })).toBe('tv');
  });

  it('detects mobile/tablet from the user agent', () => {
    expect(classifyDevice({ userAgent: 'Mozilla/5.0 (Linux; Android 13)', width: 1080 })).toBe('mobile');
  });

  it('guesses laptop for a HiDPI display', () => {
    expect(classifyDevice({ userAgent: 'Mozilla/5.0 (Macintosh)', width: 1512, devicePixelRatio: 2 })).toBe('laptop');
  });

  it('guesses desktop for a large 1x display', () => {
    expect(classifyDevice({ userAgent: 'Mozilla/5.0 (Windows NT 10.0)', width: 2560, devicePixelRatio: 1 })).toBe(
      'desktop'
    );
  });

  it('returns unknown with no width', () => {
    expect(classifyDevice({ userAgent: 'Mozilla/5.0 (Windows NT 10.0)' })).toBe('unknown');
  });
});
