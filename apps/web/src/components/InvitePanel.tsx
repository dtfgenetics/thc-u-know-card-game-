import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { copyText, shareInvite as shareInviteWithFallback } from '../browserExperience';

type Props = {
  code: string;
};

export function InvitePanel({ code }: Props) {
  const inviteUrl = `${window.location.origin}${window.location.pathname}?join=${code}`;
  const discordText = `/thc-u-know-join code:${code}`;
  const [status, setStatus] = useState('');

  async function copy(value: string, label: string) {
    const copied = await copyText(value);
    setStatus(copied ? `${label} copied.` : 'Copy failed. Share the QR code or select the session code manually.');
  }

  async function shareInvite() {
    const result = await shareInviteWithFallback({
      title: 'THC U Know',
      text: `Join my THC U Know Smoke Circle. Code: ${code}`,
      url: inviteUrl
    });

    if (result === 'shared') {
      setStatus('Invite shared.');
      return;
    }
    if (result === 'copied') {
      setStatus('Sharing was unavailable, so the invite link was copied instead.');
      return;
    }
    if (result === 'manual') {
      setStatus('Sharing and copy are unavailable. Use the QR code or select the session code manually.');
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
