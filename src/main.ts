import './styles.css';

type FormStatus = 'idle' | 'success' | 'error';

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
        <a href="#sample" role="listitem">See a sample</a>
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
              One letter, Sunday morning, by email. $18&thinsp;/&thinsp;month — no free tier, no trial.
            </p>
            <div class="masthead-ctas">
              <a class="btn btn--primary btn--lg" href="#sample">See a real sample →</a>
              <a class="btn btn--ghost btn--lg" href="#pricing">Or subscribe ($18/mo)</a>
            </div>
            <p class="form-hint masthead-hint">
              The sample is the same pipeline as a paid Sunday letter.
              One sample per email. No list, no marketing follow-up.
            </p>
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
            <div class="sources-title">
              <span class="cn sources-cn">四柱命理</span>
              <span class="sources-py">Bazi (Four Pillars)</span>
            </div>
            <div class="sources-date">Identity</div>
          </div>
          <div class="sources-row">
            <div class="sources-title">
              <span class="cn sources-cn">奇門遁甲</span>
              <span class="sources-py">Qi Men Dun Jia</span>
            </div>
            <div class="sources-date">Forecasting</div>
          </div>
          <div class="sources-row">
            <div class="sources-title">
              <span class="cn sources-cn">節氣</span>
              <span class="sources-py">24 Solar Terms</span>
            </div>
            <div class="sources-date">Season</div>
          </div>
          <div class="sources-row">
            <div class="sources-title">
              <span class="cn sources-cn">擇日學</span>
              <span class="sources-py">Date Selection</span>
            </div>
            <div class="sources-date">Timing</div>
          </div>
        </div>
        <p class="sub-headline" style="margin-top:24px;font-size:13px;color:var(--muted)">
          Want to learn the systems? See the <a href="/blog">blog</a> for plain-English explainers.
        </p>
      </div>
    </section>

    <section class="section section--tinted" id="sample">
      <div class="inner">
        <span class="eyebrow">See a real sample</span>
        <h2 class="headline headline--md">A real letter, written for your chart, in 10 seconds.</h2>
        <p class="sub-headline">
          Same pipeline, same model, same length as a Sunday letter to a paying reader.
          We use your inputs to cast your four pillars and generate the week's letter live.
          One sample per email. No marketing emails, no list.
        </p>

        <form class="sample-card" id="sample-form">
          <div class="form-grid">
            <div class="full">
              <label class="input-label" for="s-name">your name</label>
              <input class="input" id="s-name" name="name" type="text" placeholder="Jessica" autocomplete="given-name" required />
            </div>
            <div>
              <label class="input-label" for="s-dob">date of birth</label>
              <input class="input" id="s-dob" name="dob" type="date" required />
            </div>
            <div>
              <label class="input-label" for="s-tob">time of birth</label>
              <input class="input" id="s-tob" name="tob" type="time" required />
              <label class="micro-check">
                <input type="checkbox" id="s-tob-unknown" name="tobUnknown" />
                I don't know — use noon
              </label>
            </div>
            <div class="full">
              <label class="input-label" for="s-pob">place of birth</label>
              <input class="input" id="s-pob" name="pob" type="text" placeholder="Kuala Lumpur, Malaysia" required />
            </div>
            <div>
              <label class="input-label" for="s-country">current country</label>
              <select class="input" id="s-country" name="currentCountry" required>
                <option value="">Select…</option>
                <option value="SG">Singapore</option>
                <option value="MY">Malaysia</option>
                <option value="HK">Hong Kong</option>
                <option value="TW">Taiwan</option>
                <option value="CN">China</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="CA">Canada</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="JP">Japan</option>
                <option value="KR">South Korea</option>
                <option value="IN">India</option>
                <option value="ID">Indonesia</option>
                <option value="TH">Thailand</option>
                <option value="VN">Vietnam</option>
                <option value="PH">Philippines</option>
                <option value="AE">UAE</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label class="input-label" for="s-gender">gender</label>
              <select class="input" id="s-gender" name="gender" required>
                <option value="">Select…</option>
                <option value="f">Female</option>
                <option value="m">Male</option>
                <option value="nb">Non-binary</option>
                <option value="unspecified">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div class="pulse-block">
            <div class="pulse-eyebrow">Three quick questions — the week's pulse</div>
            <div class="pulse-q">
              <div class="pulse-q-label">1. How is your energy this week?</div>
              <div class="pulse-q-opts">
                <label class="pulse-opt"><input type="radio" name="energy" value="low" required /><span>Running low</span></label>
                <label class="pulse-opt"><input type="radio" name="energy" value="steady" /><span>Steady</span></label>
                <label class="pulse-opt"><input type="radio" name="energy" value="high" /><span>High</span></label>
              </div>
            </div>
            <div class="pulse-q">
              <div class="pulse-q-label">2. Where is your attention pointing?</div>
              <div class="pulse-q-opts">
                <label class="pulse-opt"><input type="radio" name="focus" value="work" required /><span>Work</span></label>
                <label class="pulse-opt"><input type="radio" name="focus" value="relationships" /><span>Relationships</span></label>
                <label class="pulse-opt"><input type="radio" name="focus" value="health" /><span>Health</span></label>
                <label class="pulse-opt"><input type="radio" name="focus" value="creativity" /><span>Creativity</span></label>
                <label class="pulse-opt"><input type="radio" name="focus" value="rest" /><span>Rest</span></label>
              </div>
            </div>
            <div class="pulse-q">
              <div class="pulse-q-label">3. What feels heavy right now?</div>
              <div class="pulse-q-opts">
                <label class="pulse-opt"><input type="radio" name="weight" value="decisions" required /><span>Decisions</span></label>
                <label class="pulse-opt"><input type="radio" name="weight" value="people" /><span>People</span></label>
                <label class="pulse-opt"><input type="radio" name="weight" value="uncertainty" /><span>Uncertainty</span></label>
                <label class="pulse-opt"><input type="radio" name="weight" value="nothing" /><span>Nothing in particular</span></label>
              </div>
            </div>
          </div>

          <div class="form-grid">
            <div class="full">
              <label class="input-label" for="s-email">email</label>
              <input class="input" id="s-email" name="email" type="email" placeholder="you@somewhere.com" autocomplete="email" required />
              <div class="micro-note">Used only to dedupe samples. We won't add you to any list.</div>
            </div>
          </div>

          <button class="btn btn--primary btn--lg btn--block sample-cta" type="submit">
            Write my sample letter →
          </button>
          <p class="form-hint">Takes ~10 seconds. One sample per email.</p>
          <p class="form-status" id="sample-status" role="status" aria-live="polite"></p>
        </form>

        <div class="sample-output" id="sample-output" hidden>
          <div class="nl-preview">
            <div class="nl-header">
              <div class="nl-header-left">
                <div class="nl-issue" id="sample-issue">Taiyi · Your sample</div>
                <div class="nl-title" id="sample-title">—</div>
              </div>
              <span class="stamp" aria-hidden="true">太</span>
            </div>
            <pre class="nl-body" id="sample-body">—</pre>
          </div>
          <div class="sample-cta-after">
            <h3 class="headline headline--md" style="margin-bottom:8px">Want one of these every Sunday?</h3>
            <p class="sub-headline" style="margin:0 0 16px">
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

    <section class="section" id="format">
      <div class="inner">
        <span class="eyebrow">What a letter looks like</span>
        <h2 class="headline headline--md">Four sections, ~400 words, every Sunday.</h2>
        <div class="nl-preview" style="margin-top:18px">
          <div class="nl-header">
            <div class="nl-header-left">
              <div class="nl-issue">Taiyi · Week of 15 Jun</div>
              <div class="nl-title">Steady hands in a hot week.</div>
            </div>
            <span class="stamp" aria-hidden="true">太</span>
          </div>
          <div class="nl-personalization">
            For a <span class="cn">甲</span> yang-wood day master · Singapore · solar term <span class="cn">芒種</span> Grain in Ear
          </div>

          <div class="nl-section">
            <div class="nl-section-h">This week's energy</div>
            <p class="nl-prose">
              For a <span class="cn">甲</span> wood day master, this week feels warm, active, and a little drying under <span class="cn">芒種</span>,
              the Grain in Ear season. With so much fire around the chart, movement comes easily — but your pulse says energy is low,
              so the task is not to push harder. It is to keep your root in place while the outer pace stays busy.
            </p>
          </div>

          <div class="nl-section">
            <div class="nl-section-h">What to focus on</div>
            <p class="nl-prose">
              Since work is where your attention is going, keep decisions close to the current situation rather than trying to solve
              the whole season at once. In qimen terms, good forecasting starts with three parts: who is asking, what is happening now,
              and what outcome actually matters. Stay with those three and the choices simplify.
            </p>
          </div>

          <div class="nl-section">
            <div class="nl-section-h">What to watch for</div>
            <p class="nl-prose">
              The main risk is execution pressure: turning one problem into a larger crisis because too many threads are carried at once.
              Fire energy makes urgency feel more important than accuracy. If a choice feels heavy, that is usually a sign to separate
              the immediate task from the bigger story you are telling about it.
            </p>
          </div>

          <div class="nl-section">
            <div class="nl-section-h">A small practice</div>
            <p class="nl-prose">
              Pick one work decision and write three short lines: current situation, next useful move, likely result if kept simple.
              Stop there for the day. Clarity comes from sequence, not force.
            </p>
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
          <div class="pricing-top">
            <div class="pricing-amount">
              $18<span class="pricing-period">/ month</span>
            </div>
            <span class="stamp stamp--lg" aria-hidden="true">月</span>
          </div>
          <ul class="pricing-features">
            <li>One weekly letter, Sunday morning</li>
            <li>Four-section structure tuned to your chart and pulse</li>
            <li>Grounded in an indexed library of bazi + qimen + date selection teachings</li>
            <li>Mid-week pulse — three one-tap questions, no login</li>
            <li>One-click cancel, 7-day data deletion</li>
          </ul>
          <button class="btn btn--primary btn--lg btn--block" type="button" id="checkout-button">Subscribe — $18 / month</button>
          <p class="form-status" id="checkout-status" role="status" aria-live="polite"></p>
        </div>
        <p class="form-hint" style="text-align:center;margin-top:16px">
          Curious before paying? <a href="#sample">Generate a free sample</a> with your actual chart.
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
              <p>The sample is the free tier — a real letter, written for your real chart, by the same pipeline that writes paid Sunday letters. After the sample, every letter costs us LLM credits and engineering time. We'd rather keep the writing dense and the operation small than chase free users.</p>
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
`;

// Stripe success redirect handling
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

// In-page anchors smooth-scroll
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

// TOB unknown toggle
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

// Sample form
const sampleForm = document.querySelector<HTMLFormElement>('#sample-form');
sampleForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const fd = new FormData(form);

  const payload = {
    name:            fd.get('name')?.toString().trim(),
    email:           fd.get('email')?.toString().trim(),
    dob:             fd.get('dob')?.toString().trim(),
    tob:             fd.get('tob')?.toString().trim(),
    tobUnknown:      fd.get('tobUnknown') === 'on',
    pob:             fd.get('pob')?.toString().trim(),
    currentCountry:  fd.get('currentCountry')?.toString().trim(),
    gender:          fd.get('gender')?.toString().trim(),
    energy:          fd.get('energy')?.toString().trim(),
    focus:           fd.get('focus')?.toString().trim(),
    weight:          fd.get('weight')?.toString().trim(),
  };

  if (btn) { btn.disabled = true; btn.textContent = 'Writing your letter… (~10s)'; }
  setStatus('sample-status', 'idle', '');

  try {
    const res = await fetch('/api/sample', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json() as { ok?: boolean; error?: string; subject?: string; body?: string; cached?: boolean };
    if (res.ok && data.body) {
      const titleEl = document.querySelector<HTMLDivElement>('#sample-title');
      const bodyEl  = document.querySelector<HTMLPreElement>('#sample-body');
      const issueEl = document.querySelector<HTMLDivElement>('#sample-issue');
      if (titleEl) titleEl.textContent = data.subject?.replace(/^Taiyi\s*·\s*/, '') ?? '—';
      if (bodyEl)  bodyEl.textContent  = data.body;
      if (issueEl) issueEl.textContent = data.cached
        ? 'Taiyi · Your sample (saved from last time)'
        : 'Taiyi · Your sample';
      document.querySelector<HTMLDivElement>('#sample-output')?.removeAttribute('hidden');
      document.querySelector('#sample-output')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      form.reset();
    } else {
      setStatus('sample-status', 'error', data.error ?? 'Something went wrong. Try again.');
    }
  } catch {
    setStatus('sample-status', 'error', 'Network error. Try again.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Write my sample letter →'; }
  }
});

// Checkout (two buttons, same flow)
async function startCheckout(btn: HTMLButtonElement, statusEl: string) {
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Loading…';
  try {
    const res = await fetch('/api/checkout', { method: 'POST' });
    const data = await res.json() as { url?: string; error?: string };
    if (res.ok && data.url) {
      window.location.href = data.url;
      return;
    }
    setStatus(statusEl, 'error', data.error ?? 'Checkout unavailable. Try again shortly.');
  } catch {
    setStatus(statusEl, 'error', 'Network error. Try again.');
  }
  btn.disabled = false;
  btn.textContent = originalText;
}

document.querySelector<HTMLButtonElement>('#checkout-button')?.addEventListener('click', e =>
  startCheckout(e.currentTarget as HTMLButtonElement, 'checkout-status'));
document.querySelector<HTMLButtonElement>('#checkout-after-sample')?.addEventListener('click', e =>
  startCheckout(e.currentTarget as HTMLButtonElement, 'checkout-status-after'));
