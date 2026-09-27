type NavigatorWithWakeLock = Navigator & {
  wakeLock?: {
    request(type: 'screen'): Promise<WakeLockSentinelLike>;
  };
};

type WakeLockSentinelLike = {
  released?: boolean;
  release(): Promise<void>;
  addEventListener?(type: 'release', listener: () => void): void;
};

export type ShareInviteResult = 'shared' | 'copied' | 'cancelled' | 'manual';

export async function copyText(value: string): Promise<boolean> {
  const text = String(value || '');
  if (!text) return false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}

  try {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    field.style.pointerEvents = 'none';
    document.body.append(field);
    field.select();
    field.setSelectionRange(0, text.length);
    const copied = document.execCommand?.('copy') === true;
    field.remove();
    return copied;
  } catch {
    return false;
  }
}

export async function shareInvite({
  title,
  text,
  url
}: {
  title: string;
  text: string;
  url: string;
}): Promise<ShareInviteResult> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (error) {
      if ((error as { name?: string })?.name === 'AbortError') return 'cancelled';
    }
  }

  return (await copyText(url)) ? 'copied' : 'manual';
}

export function createScreenWakeLockController() {
  const navigatorObject = navigator as NavigatorWithWakeLock;
  let sentinel: WakeLockSentinelLike | null = null;
  let desired = false;
  let attached = false;

  async function acquire() {
    desired = true;
    if (!navigatorObject.wakeLock?.request || document.visibilityState === 'hidden') return false;
    if (sentinel && !sentinel.released) return true;
    try {
      sentinel = await navigatorObject.wakeLock.request('screen');
      sentinel.addEventListener?.('release', () => {
        sentinel = null;
      });
      return true;
    } catch {
      sentinel = null;
      return false;
    }
  }

  async function release() {
    desired = false;
    const current = sentinel;
    sentinel = null;
    if (!current) return true;
    try {
      await current.release();
      return true;
    } catch {
      return false;
    }
  }

  async function handleVisibilityChange() {
    if (desired && document.visibilityState === 'visible') await acquire();
  }

  function attach() {
    if (attached) return;
    document.addEventListener('visibilitychange', handleVisibilityChange);
    attached = true;
  }

  function detach() {
    if (!attached) return;
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    attached = false;
  }

  return { acquire, release, attach, detach };
}
