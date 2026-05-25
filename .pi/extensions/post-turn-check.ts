/**
 * Post-Turn Validation Extension
 *
 * Runs tsc --noEmit after every agent turn. Shows errors in a widget.
 * Injects errors back as a follow-up message so the agent can fix them.
 *
 * Configurable via command:
 *   /validate on|off           Toggle validation
 *   /validate tsc-only         Only run tsc, skip tests
 *   /validate with-tests       Run tsc + npm test
 */

import type {
  ExtensionAPI,
  ExtensionContext,
} from '@earendil-works/pi-coding-agent';
import { execSync } from 'child_process';

type Mode = 'off' | 'tsc-only' | 'with-tests';

export default function (pi: ExtensionAPI) {
  let mode: Mode = 'tsc-only';
  let running = false;

  const runCheck = async (ctx: ExtensionContext) => {
    if (running || mode === 'off') return;
    running = true;

    ctx.ui.setStatus('post-turn-check', '⏳ checking...');

    try {
      const cwd = ctx.cwd;

      // Run tsc --noEmit
      let tscOutput: string;
      try {
        tscOutput = execSync('npx tsc --noEmit 2>&1', {
          cwd,
          encoding: 'utf8',
          timeout: 30000,
          signal: ctx.signal,
        }).trim();
      } catch (e: any) {
        tscOutput = e.stdout || e.stderr || e.message;
      }

      const tscErrors = tscOutput
        ? tscOutput
            .split('\n')
            .filter((l: string) => l.includes('error TS'))
            .map((l: string) => l.replace(/^.*error TS\d+:/, '').trim())
        : [];

      // Optionally run tests
      let testOutput = '';
      if (mode === 'with-tests') {
        try {
          testOutput = execSync('npm test 2>&1', {
            cwd,
            encoding: 'utf8',
            timeout: 60000,
            signal: ctx.signal,
          }).trim();
        } catch (e: any) {
          testOutput = e.stdout || e.stderr || e.message;
        }
      }

      // Build report
      const lines: string[] = [];
      if (tscErrors.length > 0) {
        lines.push(`🔴 ${tscErrors.length} TS error(s):`);
        lines.push(...tscErrors.slice(0, 10).map((e: string) => `  ${e}`));
        if (tscErrors.length > 10)
          lines.push(`  ...and ${tscErrors.length - 10} more`);
      } else {
        lines.push('✅ TS: clean');
      }

      ctx.ui.setWidget('post-turn-check', lines);
      ctx.ui.setStatus(
        'post-turn-check',
        tscErrors.length > 0 ? '🔴 errors' : '✅ clean',
      );

      // Inject errors back so agent can fix them
      if (tscErrors.length > 0) {
        const report = lines.join('\n');
        pi.sendUserMessage(`Post-turn check found issues:\n${report}`, {
          deliverAs: 'followUp',
        });
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        ctx.ui.setStatus('post-turn-check', `⚠️ check failed: ${e.message}`);
      }
    } finally {
      running = false;
    }
  };

  pi.on('agent_end', async (_event, ctx) => {
    runCheck(ctx);
  });

  pi.registerCommand('validate', {
    description: 'Toggle post-turn validation: on, off, tsc-only, with-tests',
    handler: async (args, ctx) => {
      const arg = args.trim().toLowerCase();
      switch (arg) {
        case 'on':
        case 'tsc-only':
          mode = 'tsc-only';
          break;
        case 'with-tests':
          mode = 'with-tests';
          break;
        case 'off':
          mode = 'off';
          ctx.ui.setStatus('post-turn-check', '⏸️ disabled');
          ctx.ui.setWidget('post-turn-check', []);
          return;
        default:
          ctx.ui.notify(
            `Current: ${mode}. Usage: /validate [on|off|tsc-only|with-tests]`,
            'info',
          );
          return;
      }
      ctx.ui.notify(`Validation: ${mode}`, 'info');
    },
  });
}
