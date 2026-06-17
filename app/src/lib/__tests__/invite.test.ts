import { Share } from 'react-native';

import { INVITE_URL, shareInvite } from '../invite';

describe('shareInvite', () => {
  it('opens the share sheet with an invite message containing the invite link', async () => {
    const spy = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
    await shareInvite();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toEqual(
      expect.objectContaining({ message: expect.stringContaining(INVITE_URL) }),
    );
    spy.mockRestore();
  });

  it('resolves quietly when the user dismisses or sharing fails', async () => {
    const spy = jest.spyOn(Share, 'share').mockRejectedValue(new Error('dismissed'));
    await expect(shareInvite()).resolves.toBeUndefined();
    spy.mockRestore();
  });
});
