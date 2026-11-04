const fs = require('fs');
const path = require('path');

const webStatus = process.argv[2] || 'unknown';
const androidStatus = process.argv[3] || 'unknown';
const overallStatus = process.argv[4] || 'completed';

const runNumber = process.env.GITHUB_RUN_NUMBER || '1';
const runId = process.env.GITHUB_RUN_ID || '';
const repo = process.env.GITHUB_REPOSITORY || 'farhan-1798/hybrid-automation-framework';
const branch = process.env.GITHUB_REF_NAME || 'main';
const commitSha = (process.env.GITHUB_SHA || '').substring(0, 7);
const triggerEvent = process.env.GITHUB_EVENT_NAME || 'push';

const reportUrl = 'https://farhan-1798.github.io/hybrid-automation-framework/index.html';
const actionRunUrl = `https://github.com/${repo}/actions/runs/${runId}`;

function getBadge(status) {
  const s = status.toLowerCase();
  if (s === 'success') {
    return '<span style="background-color: #2da44e; color: #ffffff; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 13px;">PASSED</span>';
  } else if (s === 'failure') {
    return '<span style="background-color: #cf222e; color: #ffffff; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 13px;">FAILED</span>';
  } else if (s === 'skipped') {
    return '<span style="background-color: #6e7781; color: #ffffff; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 13px;">SKIPPED</span>';
  }
  return `<span style="background-color: #0969da; color: #ffffff; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 13px;">${status.toUpperCase()}</span>`;
}

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CI/CD Automation Execution Report</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f8fa; margin: 0; padding: 24px; color: #24292f;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #d0d7de; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <!-- Header -->
    <tr>
      <td style="background-color: #24292f; padding: 24px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 0.5px;">🚀 Hybrid Automation Test Report</h2>
        <p style="color: #8c959f; margin: 6px 0 0 0; font-size: 14px;">Build Run #${runNumber} &bull; ${overallStatus.toUpperCase()}</p>
      </td>
    </tr>

    <!-- Summary Card -->
    <tr>
      <td style="padding: 24px;">
        <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
          Hello <strong>Farhan</strong>,<br>
          The automated cross-platform test suite has finished execution on GitHub Actions. The consolidated Allure report has been generated and deployed to GitHub Pages.
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="${reportUrl}" target="_blank" rel="noopener noreferrer" style="background-color: #2da44e; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            📊 View Live Allure Report &rarr;
          </a>
          <p style="margin-top: 10px; font-size: 13px; color: #57606a;">
            Direct Link: <a href="${reportUrl}" target="_blank" rel="noopener noreferrer" style="color: #0969da;">${reportUrl}</a>
          </p>
        </div>

        <!-- Platform Breakdown Table -->
        <table width="100%" style="border-collapse: collapse; margin-top: 20px; border: 1px solid #d0d7de;">
          <tr style="background-color: #f6f8fa;">
            <th style="padding: 10px 14px; text-align: left; font-size: 13px; color: #57606a; border-bottom: 1px solid #d0d7de;">Platform</th>
            <th style="padding: 10px 14px; text-align: left; font-size: 13px; color: #57606a; border-bottom: 1px solid #d0d7de;">Engine</th>
            <th style="padding: 10px 14px; text-align: right; font-size: 13px; color: #57606a; border-bottom: 1px solid #d0d7de;">Status</th>
          </tr>
          <tr>
            <td style="padding: 12px 14px; border-bottom: 1px solid #d0d7de; font-weight: 600;">🌐 Web Desktop</td>
            <td style="padding: 12px 14px; border-bottom: 1px solid #d0d7de; color: #57606a; font-size: 13px;">Playwright (Chromium)</td>
            <td style="padding: 12px 14px; border-bottom: 1px solid #d0d7de; text-align: right;">${getBadge(webStatus)}</td>
          </tr>
          <tr>
            <td style="padding: 12px 14px; font-weight: 600;">📱 Android Mobile</td>
            <td style="padding: 12px 14px; color: #57606a; font-size: 13px;">Appium 2 + UiAutomator2</td>
            <td style="padding: 12px 14px; text-align: right;">${getBadge(androidStatus)}</td>
          </tr>
        </table>

        <!-- Metadata Section -->
        <div style="background-color: #f6f8fa; border: 1px solid #d0d7de; border-radius: 6px; padding: 14px; margin-top: 24px; font-size: 13px; line-height: 1.8;">
          <div><strong>Repository:</strong> <a href="https://github.com/${repo}" style="color: #0969da; text-decoration: none;">${repo}</a></div>
          <div><strong>Branch:</strong> <code>${branch}</code></div>
          <div><strong>Commit:</strong> <code>${commitSha}</code></div>
          <div><strong>Trigger:</strong> ${triggerEvent}</div>
          <div><strong>CI Run Details:</strong> <a href="${actionRunUrl}" style="color: #0969da; text-decoration: none;">View GitHub Actions Workflow #${runNumber}</a></div>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f6f8fa; border-top: 1px solid #d0d7de; padding: 16px; text-align: center; font-size: 12px; color: #8c959f;">
        Automated Notification sent to <strong>farhan.naser71@gmail.com</strong> &bull; Hybrid Automation Framework
      </td>
    </tr>

  </table>
</body>
</html>
`;

const outputPath = path.resolve(__dirname, '../allure-results/email-body.html');
fs.writeFileSync(outputPath, html.trim(), 'utf-8');
console.log(`[CI] Rendered email body template to: ${outputPath}`);

