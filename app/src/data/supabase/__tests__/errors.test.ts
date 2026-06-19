import { mapPostgrestError } from '../errors';

describe('mapPostgrestError', () => {
  it('maps RLS / permission denied to unauthorized', () => {
    expect(mapPostgrestError({ code: '42501', message: 'permission denied' }).code).toBe(
      'unauthorized',
    );
  });

  it('maps an HTTP 401/403 to unauthorized', () => {
    expect(mapPostgrestError({ status: 401, message: 'no' }).code).toBe('unauthorized');
  });

  it('maps PGRST116 (no rows) to not_found', () => {
    expect(mapPostgrestError({ code: 'PGRST116', message: 'no rows' }).code).toBe('not_found');
  });

  it('maps a network/fetch failure to network', () => {
    expect(mapPostgrestError({ message: 'Network request failed' }).code).toBe('network');
  });

  it('falls back to unknown, preserving the message', () => {
    const e = mapPostgrestError({ message: 'something odd' });
    expect(e.code).toBe('unknown');
    expect(e.message).toBe('something odd');
  });

  it('handles a null/undefined error', () => {
    expect(mapPostgrestError(null).code).toBe('unknown');
  });
});
