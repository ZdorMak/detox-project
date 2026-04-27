import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getOrCreateSession } from "@/lib/session";
import { deriveResult, getSurveyState } from "@/lib/survey/state";
import { SAS_SV_ITEMS } from "@/lib/survey/sas-sv";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  ResultsScoreNumber,
  ResultsFingerprint,
  ResultsMeter,
} from "@/components/results/ResultsClient";
import { retakeAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "results" });

  const session = await getOrCreateSession();
  const state = await getSurveyState(session.id);

  const localePrefix = locale === "fr" ? "" : `/${locale}`;
  if (!state.isComplete) {
    redirect(`${localePrefix}/survey`);
  }

  const result = deriveResult(state.answers);
  // Map our 3-band system to Claude Design's low/mid/high cat names.
  const cat: "low" | "mid" | "high" =
    result.band === "low" ? "low" : result.band === "moderate" ? "mid" : "high";
  const pct = (result.totalScore / 60) * 100;
  const fingerprint = SAS_SV_ITEMS.map((it) => state.answers[it.id] ?? 0);

  // Headline + body per category, leaning on existing i18n.
  const h1 = t(`bands.${result.band}.heading` as const);
  const body = t(`bands.${result.band}.body` as const);

  return (
    <>
      <SiteHeader locale={locale} next={`${localePrefix}/results`} />
      <main id="main" className="results">
        <div className="results-inner">
          <div className="results-head">
            <span className="cd-mono cd-dim">{t("eyebrowResults")}</span>
            <span className={`results-cat-tag cat-${cat}`}>
              <span className="cat-dot" />
              {t(`categoryTag.${cat}` as const)}
            </span>
          </div>

          <h1 className="results-h1">{h1}</h1>

          <div className="results-grid">
            {/* LEFT: Score card */}
            <section className="results-score-card">
              <div className="rs-bg" />
              <div className="rs-label cd-mono">{t("scoreLabel")}</div>
              <div className="rs-num-row">
                <ResultsScoreNumber score={result.totalScore} cat={cat} />
                <div className="rs-out">
                  <span className="cd-mono cd-dim">{t("outOf")}</span>
                </div>
              </div>

              <div className="rs-meter">
                <div className="rs-meter-track">
                  <ResultsMeter pct={pct} cat={cat} />
                  <div className="rs-meter-mark" style={{ left: "40%" }} />
                  <div className="rs-meter-mark" style={{ left: "58%" }} />
                </div>
                <div className="rs-meter-labels">
                  <span>10</span>
                  <span>24</span>
                  <span>35</span>
                  <span>60</span>
                </div>
                <div className="rs-meter-bands">
                  <span>{t("categoryTag.low")}</span>
                  <span>{t("categoryTag.mid")}</span>
                  <span>{t("categoryTag.high")}</span>
                </div>
              </div>

              <div className="rs-fingerprint">
                <div className="rs-fp-label cd-mono">{t("fingerprintLabel")}</div>
                <ResultsFingerprint fingerprint={fingerprint} cat={cat} />
                <div className="rs-fp-axis">
                  <span>Q1</span>
                  <span>Q10</span>
                </div>
              </div>
            </section>

            {/* RIGHT: Text + actions */}
            <section className="results-text">
              <div className="rt-label cd-mono">{t("whatLabel")}</div>
              <p className="rt-p">{body}</p>

              <div className="rt-label cd-mono" style={{ marginTop: 36 }}>
                {t("resourcesLabel")}
              </div>
              <ul className="rt-list">
                <li>
                  <span className="rt-arrow">→</span>
                  <a
                    href="https://www.projuventute.ch/fr/conseils/aide-en-ligne-147"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Pro Juventute · 147 — {t("resourceProJuventute")}
                  </a>
                </li>
                <li>
                  <span className="rt-arrow">→</span>
                  <a
                    href="https://www.addictionsuisse.ch/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Addiction Suisse — {t("resourceAddiction")}
                  </a>
                </li>
                <li>
                  <span className="rt-arrow">→</span>
                  <a
                    href="https://www.ciao.ch/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ciao.ch — {t("resourceCiao")}
                  </a>
                </li>
              </ul>

              <div className="results-cta" style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
                <Link href="/jeu" className="cd-btn cd-btn-primary">
                  {t("ctaNext")} <span aria-hidden="true">→</span>
                </Link>
                <form action={retakeAction}>
                  <input type="hidden" name="localePrefix" value={localePrefix} />
                  <button type="submit" className="cd-btn cd-btn-ghost">
                    {t("ctaAgain")}
                  </button>
                </form>
              </div>

              <div className="cd-mono cd-dim" style={{ marginTop: 28, fontSize: 11 }}>
                {t("shareNote")}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
