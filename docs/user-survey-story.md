# User survey story — exploratory aggregate analysis

Route: `/user-survey-story/`. Added 2026-09-28 for a Foundation demonstration.
Public release of this page, its aggregate JSON and calculation code was approved
by JP Maxwell on 2026-11-10 for inclusion in the Apache-2.0 website repository.
It remains exploratory historical analysis, not an official annual survey report.
This approval does not authorize publishing respondent-level records or the
private source database. The public page retains its exploratory-analysis label.

## Sources and boundaries

The extractor reads the private, read-only SQLite preservation copy of the supplied
SilverStripe database: `workspace/survey-api/private/legacy-survey-full-archive.sqlite3`.
That copy was made from isolated local MySQL by the Survey repository's
`scripts/snapshot-survey-history.py`. Its manifest inventories 56 preserved tables.
The generated aggregate file records the archive SHA-256 and preservation date;
neither is a claim that the snapshot reflects today's production database.

Relationships used: Survey → SurveyStep → SurveyAnswer → SurveyQuestionTemplate →
SurveyStepTemplate/edition; historical choice dictionaries decode stored choice IDs.
EntitySurvey links each deployment record to its parent response. AI and core-size
answers are paired within the same deployment, never by a guessed organization.

No Member table, raw free-text answers, names, email addresses, organization names,
response identifiers or deployment identifiers are exported. Only aggregate JSON and
public questionnaire metadata enter the website repository. The archive stays local.
The page makes no API/database calls; normal builds use the committed JSON.

Public editorial context comes from the migrated SilverStripe science page,
`src/lib/content/pages/use-cases-science.json`, including its CERN case-study title
and its link to *The Crossroads of Cloud and HPC*. These published examples are
separate from survey respondents; we do not infer identities or consent from them.

## Population and calculation

- Twelve edition waves, 2015–2025. Keep 2017 H1 and H2 separate; exclude their
  overlapping combined template. Exclude unfinished 2026. Pre-2015 schemas and
  answer logs are inventoried but are not pooled into this series.
- Exclude test responses, deployments with missing/test parents, and ambiguous
  duplicate personal responses for the same nonzero creator and edition.
- Check the answer's actual step template against its question definition.
  Collapse identical answer rows. Exclude conflicting values or unknown choice IDs.
- Include valid answered questions from unfinished responses, matching the agreed
  historical-review population. Trend tables report the number marked COMPLETE.
  Early editions have very different completion coverage, including zero COMPLETE
  records for some optional 2015 questions. Do not present these as a comparable
  submitted-only series or official report totals.
- Denominators are valid answers to that particular question. Multi-select values
  count each choice once per response. Business drivers count inclusion anywhere
  in the ranking, not first preference.
- Large means >=10,000 processor cores using the three historical choice bands.
  Do not sum bands into estimated total cores.
- AI/ML appears as an explicit workload option only in 2024, 2025 and 2026 in the
  preserved dictionary. Earlier editions are missing, not zero.
- Binary results require n>=30 and both selected/unselected counts >=10. Category
  bars require both count and complement >=10. These are disclosure precautions,
  not proof of statistical significance or a substitute for consent review.
- NPS = 100 × (9–10 ratings minus 0–6 ratings) / valid 0–10 ratings.
- Edition points are equally spaced categorical waves, not elapsed-time intervals.
  Samples are self-selected and change between waves. Copying and repeat respondents
  prevent inference of independent observations or worldwide adoption growth.

## Findings in this snapshot

| Measure | Earlier edition | 2025 |
|---|---:|---:|
| Production use, deployment answers | 2015: 222/380 (58.4%) | 264/322 (82.0%) |
| >=10,000 cores | 2015: 14/227 (6.2%) | 57/243 (23.5%) |
| Kubernetes in platform question | 2015: 32/88 (36.4%) | 133/166 (80.1%) |
| AI/ML workload | 2024: 52/225 (23.1%) | 86/290 (29.7%) |
| Avoid lock-in, included in ranking | 2015: 696/951 (73.2%) | 271/359 (75.5%) |
| Reconstructed NPS | 2015: +25.9, n=967 | +39.6, n=351 |

Within 2025 records answering both workload and core-size questions, AI/ML appears
in 39/173 (22.5%) below 10,000 cores and 31/55 (56.4%) at or above 10,000 cores.
This association is not a causal result or a worldwide market estimate.
2024 production share (85.3%) exceeds 2025; the narrative does not hide that decline.

Extractor audit: 11 identical selected-question answer rows collapsed across the
archive; 15 ambiguous personal records excluded across selected editions. The audit
is descriptive and not a complete census of unrelated archive anomalies.

## Refresh explicitly

From the Astro checkout, with the private archive on the authorized local machine:

```sh
python3 scripts/survey-story/extract.py \
  --archive /absolute/private/path/legacy-survey-full-archive.sqlite3 \
  --output src/lib/survey-story/aggregates.json
python3 -m unittest discover -s scripts/survey-story -p 'test_*.py'
npm run check
```

Review aggregate diffs, methodology, suppression and editorial prose together.
Some narrative comparison sentences deliberately describe the reviewed snapshot;
update them after any refresh. Nothing fetches new data during deployment.

## Verification and remaining approval

Synthetic SQLite tests cover question dictionaries, denominators, same-deployment
pairing, NPS, duplicates/conflicts, missing/test parents, wrong steps, invalid choices,
small-group suppression, identity exclusion and unchanged source-file hash.
Independent aggregate SQL agrees with 2025 production (264/322) and AI (86/290).
Chrome checks cover three trend buttons, year switching, desktop layout and mobile
horizontal chart scrolling without page overflow. Exact-count tables accompany
SVG plots; bars include visible numerators and denominators.

Before public marketing publication: obtain a fresh export, reconcile selected
figures against approved annual reports, review completion/copying biases and
question wording, and have Foundation staff approve disclosure and narrative.
Keep the existing Cloudflare Access and noindex protection during review.
