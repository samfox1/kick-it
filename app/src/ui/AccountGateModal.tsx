import { useRouter } from 'expo-router';

import { useAuthGateStore } from '@/store/authGateStore';
import { ConfirmModal } from '@/ui/ConfirmModal';

/**
 * Branded prompt shown when a signed-out guest tries to contribute. Mounted once at the root;
 * driven by useAuthGateStore (which useRequireAccount triggers). Replaces the native Alert.
 */
export function AccountGateModal() {
  const router = useRouter();
  const visible = useAuthGateStore((s) => s.visible);
  const reason = useAuthGateStore((s) => s.reason);
  const hide = useAuthGateStore((s) => s.hide);

  return (
    <ConfirmModal
      visible={visible}
      title="Create an account"
      message={reason}
      cancelLabel="Not now"
      confirmLabel="Sign in"
      destructive={false}
      onCancel={hide}
      onConfirm={() => {
        hide();
        router.push('/auth');
      }}
    />
  );
}
