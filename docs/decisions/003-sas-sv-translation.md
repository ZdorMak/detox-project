# ADR 003 — SAS-SV French translation strategy

**Date:** 2026-04-23
**Status:** Accepted (W2-1)

## Context

The Detox Project administers the **Smartphone Addiction Scale — Short Version
(SAS-SV)** to French-speaking secondary school students in Suisse romande. The
scale's primary publication and validation is in English (Kwon et al. 2013,
PLoS ONE — open access, CC-BY).

A peer-reviewed French adaptation exists (Lopez-Fernandez 2017, *Addictive
Behaviors* — Elsevier paywall). Using Lopez-Fernandez's translated text in a
public-facing B2B product would require a permission grant from the author /
publisher; the timeline (5 weeks to SOUK demo on 2026-05-27) does not allow for
the typical 2–4 week negotiation cycle.

## Decision

**(b) — Forward-backward translation of the open-access Kwon 2013 original.**

Rejected alternatives:
- (a) Use Lopez-Fernandez 2017 directly. Blocked on copyright timeline.
- (c) Defer to HEFP supervisor to source a translation. Adds an external
  dependency; supervisor cannot guarantee turnaround within the sprint.

## Procedure

1. **Forward translation (DONE 2026-04-23).** AI-generated FR translation from
   Kwon 2013 EN original, committed to `src/lib/survey/sas-sv.ts` with the
   English original retained inline for audit. Item 8 was lightly modernised
   ("Twitter or Facebook" → "réseaux sociaux comme Instagram, Snapchat,
   TikTok") to remain meaningful to 2026 adolescents — this is the only
   substantive deviation from a literal translation and is explicitly noted in
   the result page ("adapted").
2. **Backward translation (PENDING).** A second French speaker (ideally
   independent of Maksym, e.g. a HEFP classmate or a second LLM run from a
   blank context) translates the FR back into EN. Compare against Kwon's EN
   original item by item; any divergence in meaning triggers a revision.
3. **Pilot (PENDING).** Have 2–3 secondary-school-age French speakers read the
   FR items aloud and report any wording that feels unnatural or ambiguous.
   Record observations in `docs/research/sas-sv-pilot-notes.md`.
4. **Sign-off (PENDING).** HEFP supervisor reviews the final FR before SOUK.

Until step 2 is complete, the result page must display:
> *Adaptation française pré-validée du SAS-SV (Kwon et al., 2013).
> Validation indépendante en cours.*

## Scoring

We expose a non-stigmatising **risk band** ("low" / "moderate" / "high") rather
than the gender-specific cutoffs from Kwon (M ≥ 31, F ≥ 33), because:
- The product is anonymous — gender is not collected at intake.
- A clinical label ("addicted") on a self-completed instrument given to
  minors is ethically inappropriate; reflective wording is preferred.

Bands chosen:
- low: 10–21
- moderate: 22–30
- high: 31–60 (matches Kwon's more conservative male cutoff)

## Consequences

- Legally clean for B2B distribution: derivative work from a CC-BY source,
  with attribution to Kwon 2013 and to Lopez-Fernandez 2017 for the symptom
  mapping.
- Slight psychometric debt: factor-loading and reliability coefficients from
  Kwon / Lopez-Fernandez do not strictly transfer to our wording. Disclosed in
  the HEFP methodology report (W5-3) under "Limitations".
- Item 8 modernisation may bias responses upward in 2026 (more platforms
  named) — flag for the methodology report.
- If we later ship to Vaud schools at scale and a researcher requests strict
  comparability with international samples, we will license the
  Lopez-Fernandez version then.
