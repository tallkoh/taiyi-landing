import './styles.css';

type FormStatus = 'idle' | 'success' | 'error';

interface SampleFull {
  subject: string;
  sections: { energy: string; focus: string; watch: string; practice: string };
  pillars: { year: string; month: string; day: string; hour: string };
  dayMasterStem: string;
  solarTerm: string;
  solarTermDescription: string;
  topRetrieved: { source: string; content: string } | null;
  name: string;
  persona?: string;
  formattedPillars: Array<{ pillar: string; stem: string; branch: string; label: string }>;
  dayMasterInfo: {
    stem: string; pinyin: string; english: string; element: string;
    polarity: 'yang' | 'yin'; image: string; callout: string;
  } | null;
}

interface SampleResponse {
  ok: true;
  cached: boolean;
  preview: { subject: string; firstSectionTitle: string; firstSectionText: string };
  full: SampleFull;
}

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('App mount node #app is missing.');
}

app.innerHTML = `
  <nav class="site-nav" id="top">
    <div class="nav-inner">
      <a href="#top" class="nav-logo" aria-label="Taiyi home">
        <span class="stamp" aria-hidden="true">太</span>
        Taiyi
      </a>
      <div class="nav-links" role="list">
        <a href="#how" role="listitem">How it works</a>
        <a href="#why" role="listitem">Why Taiyi</a>
        <a href="#about" role="listitem">About</a>
        <a href="/blog" role="listitem">Blog</a>
        <a href="#pricing" role="listitem">Pricing</a>
      </div>
    </div>
  </nav>

  <main>
    <section class="section section--masthead" id="hero">
      <div class="inner">
        <div class="masthead-header">
          <div class="masthead-vertical masthead-vertical--left" aria-hidden="true">太乙</div>
          <div class="masthead-center">
            <div class="masthead-eyebrow">丙午年 · 芒種 · <span class="masthead-week">A WEEKLY LETTER</span></div>
            <h1 class="headline headline--lg masthead-headline">A weekly letter, written for your chart.</h1>
            <p class="sub-headline masthead-sub">
              Four pillars + qimen + the solar calendar, read against the week ahead.
              One letter, Sunday morning, by email. $9 first month, then $18&thinsp;/&thinsp;month.
            </p>
            <button class="btn btn--primary btn--xl masthead-primary-cta" type="button" id="hero-subscribe">
              Subscribe — $9 first month
            </button>
            <a class="masthead-sample-link" href="#sample">
              View a sample <span class="masthead-sample-sub">— what you'll get weekly</span>
            </a>
          </div>
          <div class="masthead-vertical masthead-vertical--right" aria-hidden="true">壬寅日</div>
        </div>
      </div>
    </section>

    <section class="section" id="how">
      <div class="inner">
        <span class="eyebrow">How it works</span>
        <h2 class="headline headline--md">Four inputs, one weekly letter.</h2>
        <ol class="how-list">
          <li class="how-item">
            <div class="how-num" aria-hidden="true">1</div>
            <div class="how-body">
              <div class="how-title">Your bazi <span class="cn">四柱</span></div>
              <div class="how-desc">Four pillars cast from DOB + time + place. Once, forever yours.</div>
            </div>
          </li>
          <li class="how-item">
            <div class="how-num" aria-hidden="true">2</div>
            <div class="how-body">
              <div class="how-title">Where you live <span class="cn">地理</span></div>
              <div class="how-desc">Latitude shifts which palace Jupiter sits in. KL ≠ London.</div>
            </div>
          </li>
          <li class="how-item">
            <div class="how-num" aria-hidden="true">3</div>
            <div class="how-body">
              <div class="how-title">The week ahead <span class="cn">節氣</span></div>
              <div class="how-desc">The 24 solar terms set the weather behind the week.</div>
            </div>
          </li>
          <li class="how-item">
            <div class="how-num" aria-hidden="true">4</div>
            <div class="how-body">
              <div class="how-title">Your pulse <span class="cn">奇門</span></div>
              <div class="how-desc">Three one-tap questions mid-week tune Sunday's writing.</div>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section class="section" id="why">
      <div class="inner">
        <span class="eyebrow">Why Taiyi</span>
        <h2 class="headline headline--md">Classical sources, not vibes.</h2>
        <p class="sub-headline">
          Every reading is grounded in an indexed library of Chinese metaphysics teachings — bazi,
          qimen dunjia, the solar calendar, date selection, and the I Ching — cross-referenced to
          your chart. We don't ship horoscopes; we write letters.
        </p>
        <div class="sources-table">
          <div class="sources-row sources-row--header">
            <div class="sources-title">Discipline</div>
            <div class="sources-date">Use</div>
          </div>
          <div class="sources-row">
            <div class="sources-title"><span class="cn sources-cn">四柱命理</span><span class="sources-py">Bazi (Four Pillars)</span></div>
            <div class="sources-date">Identity</div>
          </div>
          <div class="sources-row">
            <div class="sources-title"><span class="cn sources-cn">奇門遁甲</span><span class="sources-py">Qi Men Dun Jia</span></div>
            <div class="sources-date">Forecasting</div>
          </div>
          <div class="sources-row">
            <div class="sources-title"><span class="cn sources-cn">節氣</span><span class="sources-py">24 Solar Terms</span></div>
            <div class="sources-date">Season</div>
          </div>
          <div class="sources-row">
            <div class="sources-title"><span class="cn sources-cn">擇日學</span><span class="sources-py">Date Selection</span></div>
            <div class="sources-date">Timing</div>
          </div>
        </div>
        <p class="sub-headline" style="margin-top:24px;font-size:13px;color:var(--muted)">
          Want to learn the systems? See the <a href="/blog">blog</a> for plain-English explainers.
        </p>
      </div>
    </section>

    <section class="section" id="about">
      <div class="inner">
        <span class="eyebrow">About Taiyi</span>
        <h2 class="headline headline--md">Trained qimen masters, not a horoscope app.</h2>
        <p class="sub-headline">
          Taiyi is built and supervised by practitioners trained in bazi and qi men dun jia — the same classical
          systems used in professional consultations, not a generic "your sign today" feed. Every letter is
          grounded against an indexed library of primary texts before it ever reaches your inbox.
        </p>
        <ul class="about-points">
          <li>Trained in bazi (四柱命理) and qi men dun jia (奇門遁甲) — years of study, not a quiz result.</li>
          <li>Based and grounded: every reading is checked against classical sources, not freestyled.</li>
          <li>Reply to any letter, or write to <a href="mailto:taiyi.contact@gmail.com">taiyi.contact@gmail.com</a> — a real person reads it.</li>
        </ul>
      </div>
    </section>

    <section class="section section--sample" id="sample">
      <div class="inner">
        <span class="sample-badge">★ Free sample · no signup, no payment</span>
        <span class="eyebrow">View a sample</span>
        <h2 class="headline headline--lg">What you'll get every Sunday.</h2>
        <p class="sub-headline">
          Five fixed samples, one per day-master element. Pick whichever persona is closest to where you're at —
          read the opening on the page, then save the full letter as a PDF.
        </p>

        <p class="element-cta">↓ Tap an element below to read your sample</p>

        <div class="element-grid" id="element-grid">
          <button class="element-card" type="button" data-element="wood">
            <span class="element-char">甲</span>
            <span class="element-name">Wood</span>
            <span class="element-persona">for someone leading a fundraise, pushing hard for the next stage</span>
          </button>
          <button class="element-card" type="button" data-element="fire">
            <span class="element-char">丙</span>
            <span class="element-name">Fire</span>
            <span class="element-persona">for someone newly visible at work after a promotion</span>
          </button>
          <button class="element-card" type="button" data-element="earth">
            <span class="element-char">戊</span>
            <span class="element-name">Earth</span>
            <span class="element-persona">for someone steady in a long relationship, feeling taken for granted</span>
          </button>
          <button class="element-card" type="button" data-element="metal">
            <span class="element-char">庚</span>
            <span class="element-name">Metal</span>
            <span class="element-persona">for someone deciding whether to leave a stable job for something riskier</span>
          </button>
          <button class="element-card" type="button" data-element="water">
            <span class="element-char">壬</span>
            <span class="element-name">Water</span>
            <span class="element-persona">for someone in a slow, low-momentum creative season</span>
          </button>
        </div>

        <div class="sample-output" id="sample-output" hidden>
          <div class="nl-preview">
            <div class="nl-header">
              <div class="nl-header-left">
                <div class="nl-issue" id="sample-issue">Taiyi · Your sample</div>
                <div class="nl-title" id="sample-title">—</div>
              </div>
              <span class="stamp" aria-hidden="true">太</span>
            </div>
            <div class="nl-personalization" id="sample-personalization">—</div>
            <div class="nl-section">
              <div class="nl-section-h" id="sample-first-h">This week's energy</div>
              <p class="nl-prose" id="sample-first-text">—</p>
            </div>
            <div class="nl-fade">
              <p class="nl-fade-label">The rest is in the full letter.</p>
            </div>
          </div>

          <div class="sample-cta-after">
            <button class="btn btn--primary btn--lg btn--block" type="button" id="download-pdf">
              ↓ Save full letter as PDF
            </button>
            <p class="form-hint" style="margin-top:8px">Opens the print dialog — choose "Save as PDF" as the destination. ~2 pages.</p>

            <div class="sample-cta-divider"><span>or</span></div>

            <h3 class="headline headline--sm" style="margin-bottom:6px">Get one of these every Sunday.</h3>
            <p class="sub-headline" style="margin:0 0 14px;font-size:14px">
              No free tier, no trial. $18/month. Cancel one-click from any letter.
            </p>
            <button class="btn btn--primary btn--lg btn--block" type="button" id="checkout-after-sample">
              Subscribe — $18 / month
            </button>
            <p class="form-status" id="checkout-status-after" role="status" aria-live="polite"></p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="pricing">
      <div class="inner">
        <span class="eyebrow">Pricing</span>
        <h2 class="headline headline--md">$18/month. No free tier.</h2>
        <p class="sub-headline">
          One letter, Sunday morning. Mid-week, three one-tap questions to tune the writing.
          Cancel anytime — one click from any letter. Your data is deleted within 7 days of cancellation.
        </p>
        <div class="pricing-card">
          <span class="pricing-badge">First month 50% off</span>
          <div class="pricing-top">
            <div class="pricing-amount"><span class="pricing-was">$18</span> $9<span class="pricing-period">first month, then $18 / month</span></div>
            <span class="stamp stamp--lg" aria-hidden="true">月</span>
          </div>
          <ul class="pricing-features">
            <li>One weekly letter, Sunday morning</li>
            <li>Four-section structure tuned to your chart and pulse</li>
            <li>Grounded in an indexed library of bazi + qimen + date selection teachings</li>
            <li>Mid-week pulse — three one-tap questions, no login</li>
            <li>One-click cancel, 7-day data deletion</li>
          </ul>
          <button class="btn btn--primary btn--lg btn--block" type="button" id="checkout-button">Subscribe — $9 first month</button>
          <p class="form-status" id="checkout-status" role="status" aria-live="polite"></p>
        </div>
        <p class="form-hint" style="text-align:center;margin-top:16px">
          Curious before paying? <a href="#sample">View a free sample</a> first.
        </p>
      </div>
    </section>

    <section class="section" id="faq">
      <div class="inner">
        <span class="eyebrow">FAQ</span>
        <div class="faq-list">
          <details class="faq-item">
            <summary class="faq-question">Why no free tier or trial?</summary>
            <div class="faq-answer">
              <p>The sample is the free tier — a real letter, written for your real chart, by the same pipeline that writes paid Sunday letters. After the sample, every letter costs us LLM credits and editorial time. We'd rather keep the writing dense and the operation small than chase free users.</p>
            </div>
          </details>
          <details class="faq-item">
            <summary class="faq-question">Isn't this just astrology?</summary>
            <div class="faq-answer">
              <p>Astrology (western) maps planets to a fixed zodiac. Bazi (<span class="cn">四柱命理</span>) is a Chinese calendrical system that reads the five-element composition at your birth date and time. Qimen (<span class="cn">奇門遁甲</span>) is a tactical forecasting calendar, not a personality read. The practical difference: we tell you how to hold this Wednesday, not what your rising sign says about your relationships.</p>
            </div>
          </details>
          <details class="faq-item">
            <summary class="faq-question">Is every letter actually different per subscriber?</summary>
            <div class="faq-answer">
              <p>Yes. The letter is composed from your four pillars, the current solar term, your current country, and your mid-week pulse answers — and grounded in a retrieval over our indexed library of classical sources keyed to your day master and the week's themes. Two subscribers born the same day in different cities receive different letters; two in the same city with different pulses receive different letters.</p>
            </div>
          </details>
          <details class="faq-item">
            <summary class="faq-question">What happens to my date-of-birth data? (PDPA / PDPL)</summary>
            <div class="faq-answer">
              <p>Your date of birth and birth time are used only to calculate your four pillars. You can request deletion at any time; your data is purged within 7 days. We comply with Singapore PDPA 2012 and Malaysia PDPA 2010.</p>
            </div>
          </details>
          <details class="faq-item">
            <summary class="faq-question">Can I cancel?</summary>
            <div class="faq-answer">
              <p>One click from the link at the bottom of any letter. No form, no retention email. Subscription stops immediately. We send only the Sunday letter plus a brief mid-week pulse email. No upsells, no notifications, no ads.</p>
            </div>
          </details>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <span class="footer-brand">Taiyi · <span class="cn" style="font-size:13px">太乙</span> · SG / MY · 2026</span>
      <div class="footer-links">
        <a href="/blog">blog</a>
        <a href="/privacy">privacy</a>
        <a href="/delete">delete my data</a>
        <a href="/contact">contact</a>
      </div>
    </div>
  </footer>

  <!-- Hidden source rendered to PDF on download -->
  <div class="pdf-source" id="pdf-source" aria-hidden="true"></div>
`;

// ── Stripe success
if (new URLSearchParams(window.location.search).get('checkout') === 'success') {
  window.history.replaceState({}, '', '/');
  const statusEl = document.querySelector<HTMLParagraphElement>('#checkout-status');
  if (statusEl) {
    statusEl.textContent = 'Subscribed! Check your inbox for confirmation.';
    statusEl.dataset.status = 'success';
  }
  document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });
}

const setStatus = (elementId: string, status: FormStatus, message: string) => {
  const statusNode = document.querySelector<HTMLParagraphElement>(`#${elementId}`);
  if (!statusNode) return;
  statusNode.textContent = message;
  statusNode.dataset.status = status;
};

// ── Smooth scroll
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const targetSelector = link.getAttribute('href');
    if (!targetSelector) return;
    const target = document.querySelector(targetSelector);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ── TOB unknown
const tobInput = document.querySelector<HTMLInputElement>('#s-tob');
const tobUnknown = document.querySelector<HTMLInputElement>('#s-tob-unknown');
tobUnknown?.addEventListener('change', () => {
  if (!tobInput) return;
  if (tobUnknown.checked) {
    tobInput.value = '12:00';
    tobInput.disabled = true;
  } else {
    tobInput.disabled = false;
  }
});

// ── Held in module scope so the Download button can read the most recent letter
let lastSample: SampleFull | null = null;

function renderPreview(resp: SampleResponse) {
  const titleEl = document.querySelector<HTMLDivElement>('#sample-title');
  const issueEl = document.querySelector<HTMLDivElement>('#sample-issue');
  const personEl = document.querySelector<HTMLDivElement>('#sample-personalization');
  const firstHEl = document.querySelector<HTMLDivElement>('#sample-first-h');
  const firstTextEl = document.querySelector<HTMLParagraphElement>('#sample-first-text');

  if (titleEl) titleEl.textContent = resp.preview.subject;
  if (issueEl) issueEl.textContent = resp.full.persona
    ? `Taiyi · Sample — ${resp.full.dayMasterInfo?.element ?? ''} day master`.trim()
    : resp.cached
      ? 'Taiyi · Your sample (saved from earlier)'
      : `Taiyi · A sample for ${resp.full.name}`;
  if (firstHEl) firstHEl.textContent = resp.preview.firstSectionTitle;
  if (firstTextEl) firstTextEl.textContent = resp.preview.firstSectionText;

  if (personEl) {
    const dm = resp.full.dayMasterInfo;
    const stem = resp.full.dayMasterStem;
    const dmLabel = dm ? `${dm.english.toLowerCase()} day master` : 'day master';
    const term = resp.full.solarTerm;
    const personaLine = resp.full.persona
      ? `This is a sample for someone who is <strong>${escapeHtml(resp.full.persona)}</strong>.<br>`
      : '';
    personEl.innerHTML = `${personaLine}For a <span class="cn">${stem}</span> ${dmLabel} · solar term <span class="cn">${term}</span>`;
  }

  document.querySelector<HTMLDivElement>('#sample-output')?.removeAttribute('hidden');
  document.querySelector('#sample-output')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buildPdfHtml(d: SampleFull): string {
  const pillarsRow = d.formattedPillars.map(p => `
    <td class="pdf-pillar-cell">
      <div class="pdf-pillar-label">${p.label}</div>
      <div class="pdf-pillar-stem">${p.stem}</div>
      <div class="pdf-pillar-branch">${p.branch}</div>
    </td>
  `).join('');

  const dm = d.dayMasterInfo;
  const dmBlock = dm ? `
    <div class="pdf-callout">
      <div class="pdf-callout-eyebrow">Your day master</div>
      <div class="pdf-callout-title">
        <span class="pdf-cn">${dm.stem}</span>
        ${dm.english} <span class="pdf-callout-pinyin">(${dm.pinyin})</span>
      </div>
      <div class="pdf-callout-image">Like ${dm.image}.</div>
      <p class="pdf-callout-body">${dm.callout}</p>
    </div>
  ` : '';

  const classical = d.topRetrieved ? `
    <div class="pdf-classical">
      <div class="pdf-classical-eyebrow">A reference from the source library</div>
      <p class="pdf-classical-body">${escapeHtml(d.topRetrieved.content)}</p>
      <div class="pdf-classical-source">— ${escapeHtml(d.topRetrieved.source.replace(/^content\//, ''))}</div>
    </div>
  ` : '';

  return `
    <div class="pdf-page">
      <header class="pdf-header">
        <div class="pdf-stamp">太</div>
        <div class="pdf-header-text">
          <div class="pdf-brand">Taiyi · <span class="pdf-cn">太乙</span></div>
          <div class="pdf-eyebrow">A sample weekly letter</div>
        </div>
      </header>

      <div class="pdf-title-block">
        <div class="pdf-recipient">${d.persona ? `Sample &middot; for someone who is ${escapeHtml(d.persona)}` : `Written for ${escapeHtml(d.name)}`}</div>
        <h1 class="pdf-title">${escapeHtml(d.subject)}</h1>
        <div class="pdf-solar">
          <span class="pdf-cn">${escapeHtml(d.solarTerm)}</span> · ${escapeHtml(d.solarTermDescription)}
        </div>
      </div>

      <table class="pdf-pillars">
        <tr>${pillarsRow}</tr>
      </table>

      ${dmBlock}

      <section class="pdf-section">
        <div class="pdf-section-h">This week's energy</div>
        <p class="pdf-prose">${escapeHtml(d.sections.energy)}</p>
      </section>
      <section class="pdf-section">
        <div class="pdf-section-h">What to focus on</div>
        <p class="pdf-prose">${escapeHtml(d.sections.focus)}</p>
      </section>
      <section class="pdf-section">
        <div class="pdf-section-h">What to watch for</div>
        <p class="pdf-prose">${escapeHtml(d.sections.watch)}</p>
      </section>
      <section class="pdf-section">
        <div class="pdf-section-h">A small practice</div>
        <p class="pdf-prose">${escapeHtml(d.sections.practice)}</p>
      </section>

      ${classical}

      <footer class="pdf-footer">
        <div class="pdf-sig">— Taiyi <span class="pdf-cn">太乙</span> · Singapore</div>
        <div class="pdf-foot-note">
          Subscribers receive one of these every Sunday morning, tuned by a mid-week pulse.
          $18 / month, cancel one-click. <strong>taiyi.guru</strong>
        </div>
      </footer>
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function downloadPdf() {
  if (!lastSample) return;
  const source = document.querySelector<HTMLDivElement>('#pdf-source');
  if (!source) return;
  source.innerHTML = buildPdfHtml(lastSample);

  // Wait for the brand fonts to be ready so the print render uses the real
  // metrics for Newsreader / Noto Serif SC, not fallback-font layout.
  if (document.fonts?.ready) {
    try { await document.fonts.ready; } catch { /* ignore — best effort */ }
  }
  // Force a layout pass on the freshly-set innerHTML before printing.
  await new Promise(resolve => requestAnimationFrame(() => resolve(null)));

  const previousTitle = document.title;
  document.title = `taiyi-sample-${lastSample.name.replace(/\s+/g, '-').toLowerCase() || 'reader'}`;

  const restore = () => {
    document.body.classList.remove('is-printing-pdf');
    document.title = previousTitle;
    window.removeEventListener('afterprint', restore);
  };
  window.addEventListener('afterprint', restore);

  document.body.classList.add('is-printing-pdf');
  window.print();
  // Safari doesn't always fire `afterprint` reliably — restore as a fallback.
  setTimeout(restore, 2000);
}

// ── Fixed samples, one per day-master element. Static copy — no LLM call,
// no API cost, no email required. Picking a card just renders + lets you
// save the matching letter as a PDF.
function splitPillars(pillars: SampleFull['pillars']): SampleFull['formattedPillars'] {
  const labels: Array<[keyof SampleFull['pillars'], string]> = [
    ['year', 'Year'], ['month', 'Month'], ['day', 'Day'], ['hour', 'Hour'],
  ];
  return labels.map(([key, label]) => {
    const combined = pillars[key];
    return { pillar: key, label, stem: combined.charAt(0), branch: combined.charAt(1) ?? '' };
  });
}

interface DayMasterInfo {
  stem: string; pinyin: string; english: string; element: string;
  polarity: 'yang' | 'yin'; image: string; callout: string;
}

const DAY_MASTERS: Record<string, DayMasterInfo> = {
  '甲': {
    stem: '甲', pinyin: 'jiǎ', english: 'Yang Wood', element: 'Wood', polarity: 'yang',
    image: 'a tall tree',
    callout: 'Structural and upward-moving. Yang wood holds shape under pressure but needs roots in steady ground.',
  },
  '丙': {
    stem: '丙', pinyin: 'bǐng', english: 'Yang Fire', element: 'Fire', polarity: 'yang',
    image: 'the sun',
    callout: 'Visible and outward. Yang fire warms everyone in the room but burns through itself quickly.',
  },
  '戊': {
    stem: '戊', pinyin: 'wù', english: 'Yang Earth', element: 'Earth', polarity: 'yang',
    image: 'a mountain',
    callout: 'Stable and slow to move. Yang earth holds ground for everyone around it and resists being rushed.',
  },
  '庚': {
    stem: '庚', pinyin: 'gēng', english: 'Yang Metal', element: 'Metal', polarity: 'yang',
    image: 'unworked iron',
    callout: 'Sharp and direct. Yang metal cuts cleanly but resists being shaped.',
  },
  '壬': {
    stem: '壬', pinyin: 'rén', english: 'Yang Water', element: 'Water', polarity: 'yang',
    image: 'a river or ocean',
    callout: 'Wide-ranging and absorptive. Yang water connects far-apart things and reads people quickly.',
  },
};

function buildStatic(input: {
  stem: string; persona: string; subject: string; pillars: SampleFull['pillars'];
  solarTerm: string; solarTermDescription: string;
  sections: SampleFull['sections']; topRetrieved: { source: string; content: string };
}): SampleFull {
  return {
    subject: input.subject,
    sections: input.sections,
    pillars: input.pillars,
    dayMasterStem: input.stem,
    solarTerm: input.solarTerm,
    solarTermDescription: input.solarTermDescription,
    topRetrieved: input.topRetrieved,
    name: '',
    persona: input.persona,
    formattedPillars: splitPillars(input.pillars),
    dayMasterInfo: DAY_MASTERS[input.stem] ?? null,
  };
}

const STATIC_SAMPLES: Record<string, SampleFull> = {
  wood: buildStatic({
    stem: '甲',
    persona: 'leading a fundraise, pushing hard for the next stage of growth',
    subject: 'Push the one conversation that unlocks the rest.',
    pillars: { year: '庚午', month: '丁卯', day: '甲子', hour: '壬申' },
    solarTerm: '驚蟄',
    solarTermDescription: 'Insects Awaken — sudden movement, the world wakes loudly.',
    sections: {
      energy: 'Wood wants to grow in rings, not all at once, and this week\'s chart asks for staged movement instead of a single sprint. A fundraise pulls you toward doing everything in parallel — pitching, hiring, closing, shipping — but a wood day master holds its shape best when each stage finishes before the next one starts. The pressure to look busy on every front this week is real; resist spending energy on motion that doesn\'t change the outcome.',
      focus: 'One conversation this round is load-bearing — it unlocks two or three others once it closes. Find it before scheduling everything else. In qimen terms, good timing starts with naming who is actually deciding, what is true about the situation right now, and which outcome you actually need, not which one sounds best in the room. Put that conversation first on the calendar this week, even if it feels premature.',
      watch: 'The risk is overcommitting on timelines to sound confident under pressure — wood that is forced grows brittle and splits under its own promises. Watch for the moment you start agreeing to dates you haven\'t actually checked, just to keep momentum visible to others. A pause to verify costs you a day; an overpromise costs you the quarter.',
      practice: 'Write down the single most load-bearing task for the week, and protect two uninterrupted hours for it before anything else gets added to the list. Everything else can wait a day. This one can\'t.',
    },
    topRetrieved: {
      source: '渊海子平 (Yuanhai Ziping)',
      content: 'A wood day master rooted in spring grows tall without forcing; rushed in any season, it splits before it can bear weight.',
    },
  }),
  fire: buildStatic({
    stem: '丙',
    persona: 'newly visible at work after a promotion, used to being the quiet one',
    subject: 'Being seen is the work now, not a side effect of it.',
    pillars: { year: '乙丑', month: '戊辰', day: '丙午', hour: '辛酉' },
    solarTerm: '夏至',
    solarTermDescription: 'Summer Solstice — peak yang, the year\'s longest day.',
    sections: {
      energy: 'Yang fire at its peak this week means visibility isn\'t optional anymore — what you say in a meeting now carries differently than it did a month ago, whether you intended that or not. For someone used to doing good work quietly and letting it speak for itself, this is an adjustment, not a flaw in you. The light is just brighter on you than it used to be.',
      focus: 'Spend deliberate attention on how you\'re being read, not just on what you\'re producing. A promotion changes the room\'s expectations of your voice before it changes anything about your actual judgment. Practice saying the short version of your opinion early in a meeting, before the discussion settles around someone else\'s framing.',
      watch: 'Burn rate is the risk with fire this strong — performing visibility for a full week straight will drain you faster than the work itself does. Watch for skipping recovery because being seen feels like it has to be constant now. It doesn\'t.',
      practice: 'Pick one meeting this week and speak first, briefly, before anyone else frames the topic. Then let the rest of the week run at normal pace. One deliberate appearance is enough — you don\'t need to prove the promotion every day.',
    },
    topRetrieved: {
      source: '滴天髓 (Ditian Sui)',
      content: 'Fire that reaches its height illuminates without needing to spread; restraint after brightness is what sustains the flame.',
    },
  }),
  earth: buildStatic({
    stem: '戊',
    persona: 'steady in a long relationship, feeling taken for granted',
    subject: 'Ground doesn\'t ask to be noticed. Ask anyway.',
    pillars: { year: '癸亥', month: '己卯', day: '戊申', hour: '甲辰' },
    solarTerm: '大暑',
    solarTermDescription: 'Great Heat — the year\'s warmest stretch, slow days, careful pacing.',
    sections: {
      energy: 'Yang earth holds things up for everyone around it, which is exactly the problem this week — the people relying on your steadiness rarely think to ask if it\'s costing you anything. Great Heat slows the pace outwardly, but the load you\'re carrying hasn\'t gotten lighter, just quieter. The chart isn\'t telling you to carry less; it\'s telling you to say something about what you\'re already carrying.',
      focus: 'A long relationship that runs smoothly can quietly stop being renegotiated — both people assume the current arrangement still fits because nothing\'s broken. This week, focus on naming one thing that\'s shifted for you that the other person hasn\'t been told about. Earth doesn\'t erode loudly; it erodes by going unmentioned.',
      watch: 'The risk is mistaking your own patience for an actual absence of need. Mountains don\'t ask for attention, but they do erode without it. Watch for the moment you decide something isn\'t worth bringing up because you\'ve already absorbed worse without complaint.',
      practice: 'Say one true, small, specific thing out loud this week about what you need — not a complaint, just a fact. "I\'d like to be asked, not just relied on" is a complete sentence.',
    },
    topRetrieved: {
      source: '三命通会 (Sanming Tonghui)',
      content: 'Earth that holds without being asked still requires renewal; what bears weight in silence is not weightless.',
    },
  }),
  metal: buildStatic({
    stem: '庚',
    persona: 'deciding whether to leave a stable job for something riskier',
    subject: 'A clean cut reads clearer than a slow leak.',
    pillars: { year: '甲寅', month: '丙午', day: '庚申', hour: '丁亥' },
    solarTerm: '寒露',
    solarTermDescription: 'Cold Dew — dryness sharpens, attention narrows.',
    sections: {
      energy: 'Yang metal under Cold Dew sharpens rather than softens — this is a week built for a decision, not more research. You already have most of the information you\'re going to get about the job change; what\'s missing isn\'t data, it\'s the willingness to commit to a direction. Unworked metal doesn\'t get safer by waiting — it just sits there.',
      focus: 'Put the actual decision in front of you this week, not the fifth pro-con list. Metal cuts cleanest in one motion — write down what would have to be true for you to regret staying, and what would have to be true for you to regret leaving. Whichever list is shorter and more specific is probably the real answer.',
      watch: 'The risk with metal this strong is mistaking decisiveness for recklessness and second-guessing yourself out of clarity you already reached. Watch for re-opening a decision you\'ve already made just because it\'s uncomfortable to sit with, not because anything new has actually changed.',
      practice: 'Set a date this week — a real one, on a calendar — by which you\'ll tell someone your decision out loud. Speaking it ends the deliberation faster than thinking ever will.',
    },
    topRetrieved: {
      source: '神峰通考 (Shenfeng Tongkao)',
      content: 'Metal unworked is only potential; the cut, once made, is what gives it shape and use.',
    },
  }),
  water: buildStatic({
    stem: '壬',
    persona: 'in a slow, low-momentum creative season',
    subject: 'Slow water still reaches the sea.',
    pillars: { year: '辛未', month: '庚子', day: '壬辰', hour: '乙巳' },
    solarTerm: '冬至',
    solarTermDescription: 'Winter Solstice — peak yin, the seed of the next year forms.',
    sections: {
      energy: 'Yang water at the Winter Solstice is doing more than it looks like from the outside — this is the deepest point of yin, when the next year\'s growth is forming underground, invisibly, before anything shows above the surface. A slow creative season isn\'t a stalled one. It\'s a forming one. The chart says the lack of visible output this week is not the same as a lack of progress.',
      focus: 'Rather than forcing a finished piece, focus on the underground work — notes, fragments, the unglamorous accumulation that doesn\'t look like progress yet. Water doesn\'t take the direct route; it finds the lowest path and keeps moving, even slowly, even unseen. Trust the route more than the pace.',
      watch: 'The risk is comparing this season\'s visible output to a faster one you\'ve had before, and concluding something is wrong. Watch for treating a quiet stretch as proof you\'ve lost the thing you\'re worried about losing. Wide water moves the most when it looks the calmest.',
      practice: 'Collect three small fragments this week — sentences, sketches, half-ideas — without trying to finish any of them. Water accumulates before it flows. This week is accumulation.',
    },
    topRetrieved: {
      source: '命理探原 (Mingli Tanyuan)',
      content: 'Water seeks the lowest path, not the fastest; what reaches the sea does so by yielding, not by force.',
    },
  }),
};

document.querySelectorAll<HTMLButtonElement>('.element-card').forEach(card => {
  card.addEventListener('click', () => {
    const key = card.dataset.element ?? '';
    const sample = STATIC_SAMPLES[key];
    if (!sample) return;

    document.querySelectorAll<HTMLButtonElement>('.element-card').forEach(c => c.classList.remove('is-active'));
    card.classList.add('is-active');

    lastSample = sample;
    renderPreview({
      ok: true,
      cached: false,
      preview: {
        subject: sample.subject,
        firstSectionTitle: "This week's energy",
        firstSectionText: sample.sections.energy,
      },
      full: sample,
    });
  });
});

document.querySelector<HTMLButtonElement>('#download-pdf')?.addEventListener('click', async event => {
  const btn = event.currentTarget as HTMLButtonElement;
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Preparing…';
  try {
    await downloadPdf();
    btn.textContent = original;
    btn.disabled = false;
  } catch (err) {
    console.error(err);
    btn.textContent = 'Try again';
    btn.disabled = false;
  }
});

// ── Checkout (three places: hero, pricing card, post-sample)
async function startCheckout(btn: HTMLButtonElement, statusElId: string) {
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Loading…';
  try {
    const res = await fetch('/api/checkout', { method: 'POST' });
    const data = await res.json() as { url?: string; error?: string };
    if (res.ok && data.url) { window.location.href = data.url; return; }
    setStatus(statusElId, 'error', data.error ?? 'Checkout unavailable. Try again shortly.');
  } catch {
    setStatus(statusElId, 'error', 'Network error. Try again.');
  }
  btn.disabled = false;
  btn.textContent = originalText;
}

document.querySelector<HTMLButtonElement>('#hero-subscribe')?.addEventListener('click', e =>
  startCheckout(e.currentTarget as HTMLButtonElement, 'checkout-status'));
document.querySelector<HTMLButtonElement>('#checkout-button')?.addEventListener('click', e =>
  startCheckout(e.currentTarget as HTMLButtonElement, 'checkout-status'));
document.querySelector<HTMLButtonElement>('#checkout-after-sample')?.addEventListener('click', e =>
  startCheckout(e.currentTarget as HTMLButtonElement, 'checkout-status-after'));
