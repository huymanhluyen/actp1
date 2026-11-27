/**
 * Reporter in kết quả từng Test Case ra Terminal theo mẫu:
 * thông tin TC → PRE_CONDITION → MAIN TEST → EXPECTED RESULT → POST_CONDITION → tổng kết.
 * Các bước lấy từ runFlow() trong tests/actp1/flow.ts. Test chưa dùng runFlow chỉ in dòng tóm tắt (kèm lỗi nếu fail).
 */
import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult, TestStep } from '@playwright/test/reporter';
import path from 'node:path';

const COLOR = !process.env.NO_COLOR;
const c = (code: string) => (s: string) => (COLOR ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c('32'), red = c('31'), yellow = c('33'), cyan = c('36'), dim = c('2'), bold = c('1');
const W = 84;

interface Rec { sec: 'PRE' | 'MAIN' | 'ER' | 'POST'; i: number; n: number; name: string; ms: number; skipped: boolean; error?: string }
const SECTION: Record<Rec['sec'], string> = {
  PRE: 'PRE_CONDITION (API)', MAIN: 'MAIN TEST (E2E Playwright)', ER: 'EXPECTED RESULT', POST: 'POST_CONDITION (API)',
};
const fmt = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`);
const strip = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '');
const pad = (left: string, right: string, width = W) => left + ' '.repeat(Math.max(1, width - strip(left).length - strip(right).length)) + right;
const short = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

export default class TerminalReporter implements Reporter {
  private steps = new Map<string, Rec[]>();
  private counts = { passed: 0, failed: 0, skipped: 0, flaky: 0 };
  private stepOk = 0; private stepAll = 0;
  private failed: string[] = [];
  private root = process.cwd();

  onBegin(_config: FullConfig, suite: Suite) { console.log(bold(cyan(`\n▶ Bắt đầu chạy ${suite.allTests().length} test case\n`))); }

  onStepEnd(test: TestCase, result: TestResult, step: TestStep) {
    if (step.category !== 'test.step') return;
    const m = /^(PRE|MAIN|ER|POST)\|(\d+)\/(\d+)\|(.*)$/s.exec(step.title);
    if (!m) return;
    const skipped = m[4].endsWith('[SKIPPED]');
    const key = `${test.id}#${result.retry}`;
    const list = this.steps.get(key) ?? [];
    list.push({ sec: m[1] as Rec['sec'], i: +m[2], n: +m[3], name: m[4].replace(/\s*\[SKIPPED\]$/, ''), ms: step.duration, skipped,
      error: step.error ? strip(step.error.message ?? String(step.error)) : undefined });
    this.steps.set(key, list);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const st = result.status === 'passed' ? 'PASSED' : result.status === 'skipped' ? 'SKIPPED' : 'FAILED';
    const colorFn = st === 'PASSED' ? green : st === 'SKIPPED' ? yellow : red;
    const icon = st === 'PASSED' ? '✔' : st === 'SKIPPED' ? '○' : '✘';
    if (st === 'PASSED') this.counts.passed++; else if (st === 'SKIPPED') this.counts.skipped++; else { this.counts.failed++; }
    const file = path.relative(this.root, test.location.file).replace(/\\/g, '/');
    const loc = `${file}:${test.location.line}`;
    if (st === 'FAILED') this.failed.push(`${test.title}  (${loc})`);
    const recs = (this.steps.get(`${test.id}#${result.retry}`) ?? []).sort((a, b) => 'PRE MAIN ER POST'.indexOf(a.sec) - 'PRE MAIN ER POST'.indexOf(b.sec) || a.i - b.i);
    const out: string[] = [];
    out.push(bold('═'.repeat(W)));
    out.push(' ' + colorFn(bold(`${icon} ${st}`)) + '  ' + bold(test.title));
    out.push(pad(' ' + dim(`📄 ${loc}`), dim(`⏱ ${fmt(result.duration)}`) + ' '));
    out.push(dim('─'.repeat(W)));
    if (!recs.length) {
      out.push(dim(' (test chưa viết theo khung PRE / MAIN / ER / POST – chỉ hiển thị kết quả tổng)'));
      if (st !== 'SKIPPED') { this.stepAll++; if (st === 'PASSED') this.stepOk++; }
    } else {
      for (const sec of ['PRE', 'MAIN', 'ER', 'POST'] as const) {
        const rs = recs.filter((r) => r.sec === sec);
        if (!rs.length) { out.push(' ' + bold(SECTION[sec]) + dim('   — không có dữ liệu / thao tác cần thực hiện')); continue; }
        const ok = rs.filter((r) => !r.error && !r.skipped).length;
        const bad = rs.some((r) => r.error), sk = rs.every((r) => r.skipped);
        const mark = bad ? red('✘') : sk ? yellow('○') : green('✔');
        out.push(pad(' ' + bold(SECTION[sec]), `${ok}/${rs.length} ${mark} `));
        for (const r of rs) {
          const label = sec === 'ER' ? `ER-${r.i}` : `${r.i}/${r.n}`;
          const ic = r.error ? red('✘ FAIL') : r.skipped ? yellow('○ SKIP') : green('✔ PASS');
          out.push(pad(`   ${ic}  ${dim(label)}  ${short(r.name, W - 36)}`, dim(r.skipped ? '—' : fmt(r.ms)) + ' '));
          this.stepAll++; if (!r.error && !r.skipped) this.stepOk++;
        }
      }
    }
    out.push(dim('─'.repeat(W)));
    const done = recs.length ? recs.filter((r) => !r.error && !r.skipped).length : (st === 'PASSED' ? 1 : 0);
    const total = recs.length || 1;
    out.push(st === 'SKIPPED' ? ' ' + yellow('Tổng: test bị bỏ qua, không chạy bước nào') : pad(' ' + `Tổng: ${colorFn(bold(`${done}/${total}`))} bước thành công`, dim(`thời gian ${fmt(result.duration)}`) + ' '));
    if (st === 'FAILED') {
      const bads = recs.filter((r) => r.error);
      const lines = (m: string, n: number) => strip(m).split('\n').filter((l) => l.trim()).slice(0, n);
      if (bads.length) {
        for (const r of bads) {
          const where = `${r.sec} ${r.sec === 'ER' ? 'ER-' + r.i : r.i + '/' + r.n} "${short(r.name, 60)}"`;
          out.push(red(bold(` ✘ BƯỚC THẤT BẠI: ${where}`)));
          for (const l of lines(r.error!, 5)) out.push(red('   │ ') + short(l, W - 6));
        }
      } else {
        out.push(red(bold(' ✘ LỖI TEST')));
        for (const l of lines(result.error?.message ?? 'Không rõ lỗi', 8)) out.push(red('   │ ') + short(l, W - 6));
      }
      const frame = result.error?.location ? `${path.relative(this.root, result.error.location.file)}:${result.error.location.line}` : loc;
      out.push(red('   └ ') + dim(`vị trí lỗi: ${frame}`));
    }
    console.log(out.join('\n') + '\n');
  }

  onEnd(result: FullResult) {
    const { passed, failed, skipped } = this.counts;
    const total = passed + failed + skipped;
    const line = '═'.repeat(W);
    console.log(bold(cyan(line)));
    console.log(bold(' TỔNG KẾT'));
    console.log(` ${green(bold(`✔ PASSED ${passed}`))}   ${red(bold(`✘ FAILED ${failed}`))}   ${yellow(bold(`○ SKIPPED ${skipped}`))}   / ${total} test case`);
    console.log(` Bước thành công: ${bold(`${this.stepOk}/${this.stepAll}`)}   ·   Tổng thời gian: ${bold(fmt(result.duration))}`);
    if (this.failed.length) { console.log(red(bold('\n Các test FAILED:'))); for (const f of this.failed) console.log(red('   ✘ ') + f); }
    console.log(bold(cyan(line)) + '\n');
  }

  printsToStdio() { return true; }
}
