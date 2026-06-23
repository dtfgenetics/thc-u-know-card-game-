import { QRCodeSVG } from 'qrcode.react';

type Props = {
  code: string;
};

export function InvitePanel({ code }: Props) {
  const inviteUrl = `${window.location.origin}${window.location.pathname}?join=${code}`;
  const discordText = `/thc-u-know join code:${code}`;

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
  }

  return (
    <section className="panel invite-panel">
      <h2>Invite Players</h2>
      <p className="session-code">{code}</p>
      <div className="invite-actions">
        <button type="button" onClick={() => copy(inviteUrl)}>Copy Invite Link</button>
        <button type="button" onClick={() => copy(code)}>Copy Session Code</button>
        <button type="button" onClick={() => copy(discordText)}>Copy Discord Invite</button>
      </div>
      <QRCodeSVG value={inviteUrl} size={136} />
    </section>
  );
}
