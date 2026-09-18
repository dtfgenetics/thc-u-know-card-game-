import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

type Props = {
  code: string;
};

export function InvitePanel({ code }: Props) {
  const inviteUrl = `${window.location.origin}${window.location.pathname}?join=${code}`;
  const discordText = `/thc-u-know-join code:${code}`;
  const [status, setStatus] = useState('');

  async function copy(value: string, label: string) {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        copied = true;
      }
    } catch {}

    if (!copied) {
      try {
        const field = document.createElement('textarea');
        field.value = value;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        field.style.pointerEvents = 'none';
        document.body.append(field);
        field.select();
        field.setSelectionRange(0, value.length);
        copied = document.execCommand?.('copy') === true;
        field.remove();
      } catch {}
    }

    setStatus(copied ? `${label} copied.` : 'Copy failed. Share the QR code or select the session code manually.');
  }

  async function shareInvite() {
    if (!navigator.share) {
      await copy(inviteUrl, 'Invite link');
      return;
    }

    try {
      await navigator.share({
        title: 'THC U Know',
        text: `Join my THC U Know Smoke Circle. Code: ${code}`,
        url: inviteUrl
      });
      setStatus('Invite shared.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setStatus('Sharing was unavailable. Use Copy Invite Link instead.');
    }
  }

  return (
    <section className="panel invite-panel">
      <h2>Invite Players</h2>
      <p className="session-code" aria-label={`Session code ${code}`}>{code}</p>
      <div className="invite-actions">
        <button type="button" onClick={shareInvite}>Share Invite</button>
        <button type="button" onClick={() => copy(inviteUrl, 'Invite link')}>Copy Invite Link</button>
        <button type="button" onClick={() => copy(code, 'Session code')}>Copy Session Code</button>
        <button type="button" onClick={() => copy(discordText, 'Discord invite command')}>Copy Discord Invite</button>
      </div>
      <p className="invite-status" role="status" aria-live="polite">{status}</p>
      <QRCodeSVG value={inviteUrl} size={136} aria-label="QR code for the THC U Know invite link" />
    </section>
  );
}
