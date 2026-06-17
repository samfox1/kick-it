import { useState } from 'react';

import { useHangsStore } from '@/store/hangsStore';

/**
 * Shared "delete a hang" flow: tracks which hang is pending deletion and produces
 * the props for a <ConfirmModal>. Used by every screen that can delete a hang so
 * the confirmation copy and wiring live in one place.
 *
 *   const { requestDelete, confirmProps } = useHangDelete();
 *   <HangCard onDelete={() => requestDelete(h.id, h.title)} />
 *   <ConfirmModal {...confirmProps} />
 */
export function useHangDelete() {
  const deleteHang = useHangsStore((s) => s.deleteHang);
  const [pending, setPending] = useState<{ id: string; title: string } | null>(null);

  return {
    requestDelete: (id: string, title: string) => setPending({ id, title }),
    confirmProps: {
      visible: pending !== null,
      title: 'Delete hang?',
      message: pending ? `“${pending.title}” will be removed.` : undefined,
      onConfirm: () => {
        if (pending) deleteHang(pending.id);
        setPending(null);
      },
      onCancel: () => setPending(null),
    },
  };
}
