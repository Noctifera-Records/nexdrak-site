export const resetPasswordTemplate = (url: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background-color:#080808;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#080808;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background-color:#0e0e0e;border:1px solid #222;border-radius:2px;overflow:hidden;">
          <tr><td style="height:3px;background:linear-gradient(90deg,#fff 0%,#888 50%,transparent 100%);"></td></tr>
          <tr>
            <td style="padding:44px 52px 36px;border-bottom:1px solid #1e1e1e;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td><img src="https://nexdrak.com/img/logo_copy.png" alt="NexDrak" style="height:36px;width:auto;display:block;filter:brightness(0) invert(1);" /></td>
                  <td align="right" style="vertical-align:middle;"><span style="color:#333;font-size:10px;letter-spacing:4px;text-transform:uppercase;font-family:'Courier New',monospace;">SECURITY</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:52px 52px 0;">
              <p style="margin:0 0 4px;color:#1e1e1e;font-size:88px;font-weight:700;line-height:1;letter-spacing:-4px;font-family:'Georgia',serif;user-select:none;">PWD</p>
              <p style="margin:0;color:#fff;font-size:28px;font-weight:400;letter-spacing:-0.5px;font-family:'Georgia',serif;font-style:italic;">Reset Request</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 52px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #222;width:40px;"></td>
                  <td style="padding:0 14px;white-space:nowrap;"><span style="color:#444;font-size:10px;letter-spacing:3px;font-family:'Courier New',monospace;">01 / RESET</span></td>
                  <td style="border-top:1px solid #222;"></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 52px 36px;">
              <p style="margin:0 0 12px;color:#999;font-size:14px;line-height:1.8;font-family:'Courier New',monospace;">A password reset was requested for your account. Use the link below to set a new password.</p>
              <p style="margin:0;color:#555;font-size:13px;font-family:'Courier New',monospace;">Expires in <span style="color:#fff;border-bottom:1px solid #444;padding-bottom:1px;">60 minutes</span>.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 52px 48px;">
              <a href="\${url}" style="display:inline-block;background:#fff;color:#000;text-decoration:none;font-size:11px;font-weight:700;padding:16px 40px;letter-spacing:4px;text-transform:uppercase;font-family:'Courier New',monospace;">RESET PASSWORD →</a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 52px;border-top:1px solid #1a1a1a;background:#090909;">
              <p style="margin:0 0 6px;color:#333;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:'Courier New',monospace;">Direct link</p>
              <p style="margin:0;word-break:break-all;"><a href="\${url}" style="color:#555;font-size:11px;text-decoration:none;font-family:'Courier New',monospace;">\${url}</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 52px;border-top:1px solid #1a1a1a;"><p style="margin:0;color:#3a3a3a;font-size:11px;line-height:1.7;font-family:'Courier New',monospace;">— If you did not request this, disregard this message. Your password remains unchanged.</p></td>
          </tr>
          <tr>
            <td style="padding:32px 52px 40px;border-top:1px solid #1a1a1a;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td><img src="https://nexdrak.com/img/favicon.ico" alt="" style="width:28px;height:28px;display:block;opacity:0.25;filter:brightness(0) invert(1);" /></td>
                  <td align="right" style="vertical-align:middle;"><span style="color:#2a2a2a;font-size:10px;letter-spacing:3px;font-family:'Courier New',monospace;">© \${new Date().getFullYear()} NEXDRAK</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:2px;background:linear-gradient(90deg,transparent 0%,#333 50%,transparent 100%);"></td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const verifyEmailTemplate = (url: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background-color:#080808;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#080808;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background-color:#0e0e0e;border:1px solid #222;border-radius:2px;overflow:hidden;">
          <tr><td style="height:3px;background:linear-gradient(90deg,#fff 0%,#888 50%,transparent 100%);"></td></tr>
          <tr>
            <td style="padding:44px 52px 36px;border-bottom:1px solid #1e1e1e;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td><img src="https://nexdrak.com/img/logo_copy.png" alt="NexDrak" style="height:36px;width:auto;display:block;filter:brightness(0) invert(1);" /></td>
                  <td align="right" style="vertical-align:middle;"><span style="color:#333;font-size:10px;letter-spacing:4px;text-transform:uppercase;font-family:'Courier New',monospace;">WELCOME</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:52px 52px 0;">
              <p style="margin:0 0 4px;color:#1e1e1e;font-size:88px;font-weight:700;line-height:1;letter-spacing:-4px;font-family:'Georgia',serif;user-select:none;">NEW</p>
              <p style="margin:0;color:#fff;font-size:28px;font-weight:400;letter-spacing:-0.5px;font-family:'Georgia',serif;font-style:italic;">Verify your access</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 52px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #222;width:40px;"></td>
                  <td style="padding:0 14px;white-space:nowrap;"><span style="color:#444;font-size:10px;letter-spacing:3px;font-family:'Courier New',monospace;">01 / VERIFY</span></td>
                  <td style="border-top:1px solid #222;"></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 52px 36px;">
              <p style="margin:0 0 12px;color:#999;font-size:14px;line-height:1.8;font-family:'Courier New',monospace;">You're one step away. Confirm your email address to unlock full access to your NexDrak account.</p>
              <p style="margin:0;color:#555;font-size:13px;font-family:'Courier New',monospace;">Link valid for <span style="color:#fff;border-bottom:1px solid #444;padding-bottom:1px;">24 hours</span>.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 52px 48px;">
              <a href="\${url}" style="display:inline-block;background:#fff;color:#000;text-decoration:none;font-size:11px;font-weight:700;padding:16px 40px;letter-spacing:4px;text-transform:uppercase;font-family:'Courier New',monospace;">VERIFY EMAIL →</a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 52px;border-top:1px solid #1a1a1a;background:#090909;">
              <p style="margin:0 0 6px;color:#333;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:'Courier New',monospace;">Direct link</p>
              <p style="margin:0;word-break:break-all;"><a href="\${url}" style="color:#555;font-size:11px;text-decoration:none;font-family:'Courier New',monospace;">\${url}</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 52px;border-top:1px solid #1a1a1a;"><p style="margin:0;color:#3a3a3a;font-size:11px;line-height:1.7;font-family:'Courier New',monospace;">— If you did not create this account, no action is needed.</p></td>
          </tr>
          <tr>
            <td style="padding:32px 52px 40px;border-top:1px solid #1a1a1a;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td><img src="https://nexdrak.com/img/favicon.ico" alt="" style="width:28px;height:28px;display:block;opacity:0.25;filter:brightness(0) invert(1);" /></td>
                  <td align="right" style="vertical-align:middle;"><span style="color:#2a2a2a;font-size:10px;letter-spacing:3px;font-family:'Courier New',monospace;">© \${new Date().getFullYear()} NEXDRAK</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:2px;background:linear-gradient(90deg,transparent 0%,#333 50%,transparent 100%);"></td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
