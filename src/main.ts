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
        <a href="#about" role="listitem">About</a>
        <a href="#pricing" role="listitem">Pricing</a>
        <a href="#faq" role="listitem">FAQ</a>
      </div>
    </div>
  </nav>

  <main>
    <section class="section section--masthead" id="hero">
      <div class="inner">
        <div class="masthead-header">
          <div class="masthead-vertical masthead-vertical--left" aria-hidden="true">太乙</div>
          <div class="masthead-center">
            <div class="masthead-eyebrow">丙午年 · 立夏 · <span class="masthead-week">WEEK OF MAY 17</span></div>
            <h1 class="headline headline--lg masthead-headline">Your week, read through the four pillars.</h1>
            <p class="sub-headline masthead-sub">
              A weekly letter combining your bazi with where you live and the qimen calendar.
              Sundays, by email. $18&thinsp;/&thinsp;month.
            </p>
          </div>
          <div class="masthead-vertical masthead-vertical--right" aria-hidden="true">壬寅日</div>
        </div>

        <div class="scribble"></div>

        <div class="data-strip masthead-strip">
          <div class="data-cell">
            <div class="data-cell-label"><span class="cn" style="margin-right:3px">宜</span>TODAY</div>
            <div class="data-cell-value">sign contracts</div>
            <div class="data-cell-sub">before noon</div>
          </div>
          <div class="data-cell">
            <div class="data-cell-label"><span class="cn" style="font-weight:600;margin-right:3px">忌</span>TODAY</div>
            <div class="data-cell-value">west meetings</div>
            <div class="data-cell-sub">after 3 pm</div>
          </div>
          <div class="data-cell">
            <div class="data-cell-label" style="font-family:var(--mono)">QIMEN №427</div>
            <div class="data-cell-value">天輔星</div>
            <div class="data-cell-sub">of 1,080 plates</div>
          </div>
        </div>

        <form class="email-capture" id="subscribe-form">
          <div class="row-form">
            <input
              type="email"
              class="input input--lg"
              name="email"
              placeholder="your email — free Sunday preview first"
              aria-label="Email address"
              autocomplete="email"
              required
            />
            <button class="btn btn--primary btn--lg" type="submit">Subscribe</button>
          </div>
          <p class="form-hint">free preview first · cancel anytime · $18/mo to keep reading</p>
          <p class="form-status" id="subscribe-status" role="status" aria-live="polite"></p>
        </form>
      </div>
    </section>

    <section class="section" id="snapshot">
      <div class="inner">
        <span class="eyebrow">Or try the free snapshot first</span>
        <form class="snapshot-card" id="snapshot-form">
          <span class="eyebrow" style="font-size:9px;margin-bottom:10px">Your free bazi snapshot</span>
          <div class="form-grid">
            <div>
              <label class="input-label" for="dob">date of birth</label>
              <input class="input" id="dob" name="dob" type="text" placeholder="1983 / 11 / 04" autocomplete="bday" required />
            </div>
            <div>
              <label class="input-label" for="tob">time of birth</label>
              <input class="input" id="tob" name="tob" type="text" placeholder="07:42 am" required />
            </div>
            <div class="full">
              <label class="input-label" for="pob">place of birth</label>
              <input class="input" id="pob" name="pob" type="text" placeholder="Kuala Lumpur, Malaysia" autocomplete="country-name" required />
            </div>
            <div class="full">
              <label class="input-label" for="email-snap">email (so we can send the weekly)</label>
              <input class="input" id="email-snap" name="email" type="email" placeholder="you@somewhere.com" autocomplete="email" required />
            </div>
          </div>
          <button class="btn btn--primary btn--lg btn--block snapshot-cta" type="submit">
            Cast my pillars →
          </button>
          <p class="form-hint">free · 30 seconds · no card required</p>
          <p class="form-status" id="snapshot-status" role="status" aria-live="polite"></p>
        </form>
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
              <div class="how-title">Weather + season <span class="cn">節氣</span></div>
              <div class="how-desc">Local conditions mapped to the 24 solar terms.</div>
            </div>
          </li>
          <li class="how-item">
            <div class="how-num" aria-hidden="true">4</div>
            <div class="how-body">
              <div class="how-title">Qimen calendar <span class="cn">奇門</span></div>
              <div class="how-desc">1,080 plates a year. Our indexed library is the moat.</div>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section class="section" id="why">
      <div class="inner">
        <span class="eyebrow">Why Taiyi</span>
        <h2 class="headline headline--md">Public-domain classics, not vibes.</h2>
        <p class="sub-headline">
          Every reading is sourced. We index six classical qimen texts — all pre-1929, all public domain — verse by verse, cross-referenced to your chart.
        </p>
        <div class="sources-table">
          <div class="sources-row sources-row--header">
            <div class="sources-title">Text</div>
            <div class="sources-date">Date</div>
          </div>
          <div class="sources-row">
            <div class="sources-title">
              <span class="cn sources-cn">奇門遁甲統宗</span>
              <span class="sources-py">Qímén Dùnjiǎ Tǒngzōng</span>
            </div>
            <div class="sources-date">1641</div>
          </div>
          <div class="sources-row">
            <div class="sources-title">
              <span class="cn sources-cn">烟波釣叟賦</span>
              <span class="sources-py">Yān Bō Diào Sǒu Fù</span>
            </div>
            <div class="sources-date">Tang dyn.</div>
          </div>
          <div class="sources-row">
            <div class="sources-title">
              <span class="cn sources-cn">紫白訣</span>
              <span class="sources-py">Zǐbái Jué</span>
            </div>
            <div class="sources-date">Song dyn.</div>
          </div>
          <div class="sources-row">
            <div class="sources-title">
              <span class="sources-cn" style="font-size:14px;color:var(--muted)">+ 3 sister texts</span>
              <span class="sources-py">indexed</span>
            </div>
            <div class="sources-date">—</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="about">
      <div class="inner">
        <span class="eyebrow">Who we are</span>
        <h2 class="headline headline--md">A Singapore project, classically sourced.</h2>
        <p class="sub-headline">
          Taiyi is built in Singapore by a small team of qimen practitioners and the indexed source library
          they spent years assembling. We grew up watching aunties and mothers pay reasonable money for
          unreasonable readings — generic horoscopes dressed in Chinese characters — and we wanted something
          that actually consulted the texts.
        </p>
        <p class="sub-headline">
          The depth of the moat is the library. <span class="cn">奇門遁甲統宗</span> (1641),
          <span class="cn">烟波釣叟賦</span> (Tang), <span class="cn">紫白訣</span> (Song) and three sister
          classics — indexed verse by verse, cross-referenced to your chart. Every Sunday's letter is reviewed
          against a working practitioner's chart-reading before it ships. We don't sign with master titles;
          the texts do.
        </p>
        <p class="sub-headline">
          Write to us — we read every reply. Sundays, after the letter goes out.
        </p>
        <div class="about-signature">
          <span class="stamp" aria-hidden="true">太</span>
          <div class="about-sig-text">
            <div class="about-sig-name">The Taiyi readers</div>
            <div class="about-sig-where"><span class="cn">新加坡</span> · Singapore</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--tinted" id="sample">
      <div class="inner">
        <span class="eyebrow">Last Sunday's letter</span>
        <h2 class="headline headline--md">This is what lands in your inbox.</h2>

        <div class="nl-preview" aria-label="Sample newsletter issue 47">
          <div class="nl-header">
            <div class="nl-header-left">
              <div class="nl-issue">Taiyi · Issue 47 · May 17</div>
              <div class="nl-title">The week the <span class="cn">天輔</span> opens.</div>
            </div>
            <span class="stamp" aria-hidden="true">太</span>
          </div>

          <div class="nl-personalization">
            For Jessica · Yang Fire day master · KL · 3.1°N
          </div>

          <p class="nl-prose">
            Dear Jessica — the week opens with <span class="cn">天輔</span>, the scholarly star, landing in your career palace.
            For a yang-fire day master this is unambiguous: the heavens are handing you contracts, exams, applications.
            Sign the lease, send the proposal, file the application. Take it Monday before noon — the plate weakens after.
          </p>
          <p class="nl-prose">
            Wednesday is to read, not ship. The <span class="cn">戊辰</span> hour pulls your output palace into shadow;
            whatever you publish that morning will read flatter than you mean it to. Move it to Friday when <span class="cn">丙寅</span>
            brings <span class="cn">文昌</span> into view. Same draft, twice the reception.
          </p>
          <p class="nl-prose">
            Travel south and southeast on Thursday — Hong Kong, Manila, Singapore. Avoid the north for moving money this week;
            <span class="cn">太歲</span> sits there and the friction compounds. If you must send funds north, wait until the 23rd.
          </p>

          <div class="nl-data-strip">
            <div class="nl-data-cell">
              <div class="nl-data-label">SOLAR TERM</div>
              <div class="nl-data-main cn" style="font-weight:600;font-size:18px;line-height:1">立夏</div>
              <div class="nl-data-sub">Lìxià</div>
            </div>
            <div class="nl-data-cell">
              <div class="nl-data-label">QIMEN</div>
              <div class="nl-data-main" style="font-family:var(--mono);font-size:15px">№427</div>
              <div class="nl-data-sub">of 1080</div>
            </div>
            <div class="nl-data-cell">
              <div class="nl-data-label">KL TODAY</div>
              <div class="nl-data-main" style="font-size:13px">27° monsoon</div>
              <div class="nl-data-sub">east clear</div>
            </div>
          </div>

          <div class="nl-days" role="table" aria-label="Weekly almanac">
            <div class="nl-day" role="row">
              <div class="nl-day-date" role="cell"><span class="nl-day-name">Mon</span><span class="nl-day-num">18</span></div>
              <div class="nl-day-good" role="cell"><span class="cn nl-yj">宜</span>sign contracts before noon</div>
              <div class="nl-day-bad" role="cell"><span class="cn nl-yj">忌</span>west mtgs after 3pm</div>
            </div>
            <div class="nl-day" role="row">
              <div class="nl-day-date" role="cell"><span class="nl-day-name">Tue</span><span class="nl-day-num">19</span></div>
              <div class="nl-day-good" role="cell"><span class="cn nl-yj">宜</span>ask the hard question</div>
              <div class="nl-day-bad" role="cell"><span class="cn nl-yj">忌</span>moving money north</div>
            </div>
            <div class="nl-day" role="row">
              <div class="nl-day-date" role="cell"><span class="nl-day-name">Wed</span><span class="nl-day-num">20</span></div>
              <div class="nl-day-good" role="cell"><span class="cn nl-yj">宜</span>edit, don't ship</div>
              <div class="nl-day-bad" role="cell"><span class="cn nl-yj">忌</span>first dates</div>
            </div>
            <div class="nl-day" role="row">
              <div class="nl-day-date" role="cell"><span class="nl-day-name">Thu</span><span class="nl-day-num">21</span></div>
              <div class="nl-day-good" role="cell"><span class="cn nl-yj">宜</span>travel south + southeast</div>
              <div class="nl-day-bad" role="cell"><span class="cn nl-yj">忌</span>dentist if you can</div>
            </div>
            <div class="nl-day" role="row">
              <div class="nl-day-date" role="cell"><span class="nl-day-name">Fri</span><span class="nl-day-num">22</span></div>
              <div class="nl-day-good" role="cell"><span class="cn nl-yj">宜</span>public-facing day</div>
              <div class="nl-day-bad" role="cell"><span class="cn nl-yj">忌</span>—</div>
            </div>
          </div>

          <blockquote class="nl-quote">
            天輔之星，主文書、文章、考試、求名、出行、見貴。
          </blockquote>
          <div class="nl-source">
            — 烟波釣叟賦
            <span class="nl-source-note">(Yān Bō Diào Sǒu Fù, Tang dynasty, public domain)</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="pricing">
      <div class="inner">
        <span class="eyebrow">Pricing</span>
        <div class="pricing-card">
          <div class="pricing-top">
            <div class="pricing-amount">
              $18<span class="pricing-period">/ month</span>
            </div>
            <span class="stamp stamp--lg" aria-hidden="true">月</span>
          </div>
          <p class="pricing-desc">
            One letter, Sunday morning local. Your snapshot stays free.
            Cancel anytime — your data is deleted within 7 days.
          </p>
          <ul class="pricing-features">
            <li>Weekly localized fengshui letter</li>
            <li>Day-by-day <span class="cn">宜</span> / <span class="cn">忌</span> (do&thinsp;/&thinsp;don't)</li>
            <li>Source-cited classical quotes</li>
            <li>Annual luck-pillar update (Lunar New Year)</li>
          </ul>
          <button class="btn btn--primary btn--lg btn--block" type="button" id="checkout-button">Start — $18 / month</button>
          <p class="form-status" id="checkout-status" role="status" aria-live="polite"></p>
        </div>
      </div>
    </section>

    <section class="section" id="faq">
      <div class="inner">
        <span class="eyebrow">Skeptics first · FAQ</span>
        <div class="faq-list">
          <details class="faq-item">
            <summary class="faq-question">Isn't this just astrology? How is it different?</summary>
            <div class="faq-answer">
              <p>Astrology (western) maps planets to a fixed zodiac. Bazi (四柱命理) is a Chinese calendrical system that maps the specific five-element composition at your birth date and time to heavenly stems and earthly branches — a different calculus entirely. Qimen (奇門遁甲) is a tactical calendar, not a personality read. The practical difference: we tell you which direction to avoid for an important meeting this Thursday, not what your rising sign says about your relationship style.</p>
            </div>
          </details>

          <details class="faq-item">
            <summary class="faq-question">How is this different from a generic weekly horoscope?</summary>
            <div class="faq-answer">
              <p>A generic horoscope reads the same week for everyone born in your month. Taiyi reads <em>your</em> week — calculated from your specific date, time, and place of birth, cross-referenced against the qimen calendar plate active that week, and adjusted for the latitude you actually live at. KL ≠ London. Yang fire ≠ yang water. We don't ship one letter to twelve audiences; we ship one letter to one reader.</p>
            </div>
          </details>

          <details class="faq-item">
            <summary class="faq-question">Is the same letter sent to everyone?</summary>
            <div class="faq-answer">
              <p>No. Every Sunday's letter is written for a single subscriber from four inputs: your four pillars (bazi), your latitude and longitude, the current solar term, and the qimen plate active that week. Two subscribers born the same day in different cities receive different letters; two subscribers in the same city with different birth times receive different letters. The framing, citation, and day-by-day <span class="cn">宜</span> / <span class="cn">忌</span> are all yours alone.</p>
            </div>
          </details>

          <details class="faq-item">
            <summary class="faq-question">What happens to my date-of-birth data? (PDPA / PDPL)</summary>
            <div class="faq-answer">
              <p>Your date of birth and birth time are used only to calculate your four pillars — they are stored encrypted and never shared or sold. You can request deletion at any time; your data is purged within 7 days. We comply with Singapore PDPA 2012 and Malaysia PDPA 2010.</p>
            </div>
          </details>

          <details class="faq-item">
            <summary class="faq-question">Can I cancel? Will you keep emailing me?</summary>
            <div class="faq-answer">
              <p>Cancel any time — one click from the link at the bottom of any letter, no form, no retention email. The subscription stops immediately. We send only what you signed up for: one letter per Sunday and, if you opt in, a Lunar New Year luck-pillar update. No upsells, no notifications, no ads.</p>
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
        <a href="/privacy">privacy</a>
        <a href="/delete">delete my data</a>
        <a href="/contact">contact</a>
      </div>
    </div>
  </footer>
`;

// Handle Stripe post-checkout redirect: /?checkout=success
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

const getStringValue = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
};

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

document.querySelector<HTMLFormElement>('#subscribe-form')?.addEventListener('submit', async event => {
  event.preventDefault();

  const form = event.currentTarget as HTMLFormElement;
  const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const email = getStringValue(new FormData(form), 'email');

  if (!email) {
    setStatus('subscribe-status', 'error', 'Enter an email address to get the Sunday preview.');
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json() as { ok?: boolean; error?: string };
    if (res.ok) {
      setStatus('subscribe-status', 'success', `Check your inbox — confirmation on its way to ${email}.`);
      form.reset();
    } else {
      setStatus('subscribe-status', 'error', data.error ?? 'Something went wrong. Try again.');
    }
  } catch {
    setStatus('subscribe-status', 'error', 'Network error. Check your connection and try again.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Subscribe'; }
  }
});

document.querySelector<HTMLFormElement>('#snapshot-form')?.addEventListener('submit', async event => {
  event.preventDefault();

  const form = event.currentTarget as HTMLFormElement;
  const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const formData = new FormData(form);
  const email = getStringValue(formData, 'email');
  const dob   = getStringValue(formData, 'dob');
  const tob   = getStringValue(formData, 'tob');
  const pob   = getStringValue(formData, 'pob');

  if (!email || !dob || !tob || !pob) {
    setStatus('snapshot-status', 'error', 'Complete all four fields to cast the snapshot.');
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Casting…'; }

  try {
    const res = await fetch('/api/snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, dob, tob, pob }),
    });
    const data = await res.json() as { ok?: boolean; error?: string };
    if (res.ok) {
      setStatus('snapshot-status', 'success', `Snapshot queued for ${email} — you'll hear from us soon.`);
      form.reset();
    } else {
      setStatus('snapshot-status', 'error', data.error ?? 'Something went wrong. Try again.');
    }
  } catch {
    setStatus('snapshot-status', 'error', 'Network error. Check your connection and try again.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Cast my pillars →'; }
  }
});

document.querySelector<HTMLButtonElement>('#checkout-button')?.addEventListener('click', async event => {
  const btn = event.currentTarget as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = 'Loading…';

  try {
    const res = await fetch('/api/checkout', { method: 'POST' });
    const data = await res.json() as { url?: string; error?: string };
    if (res.ok && data.url) {
      window.location.href = data.url;
      return;
    }
    setStatus('checkout-status', 'error', data.error ?? 'Checkout unavailable. Try again shortly.');
  } catch {
    setStatus('checkout-status', 'error', 'Network error. Try again.');
  }

  btn.disabled = false;
  btn.textContent = 'Start — $18 / month';
});
