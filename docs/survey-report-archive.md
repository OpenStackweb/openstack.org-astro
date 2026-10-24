# User Survey publication archive

October 24, 2026: `/user-survey/reports/` replaces the introduction's isolated
2022/2018 links with 13 dated publications spanning 2014–2025. This is an editorial
index of existing public publications, not a release of the Survey service's
private historical answers or its 13 saved analytics configurations. No missing
year is synthesized and an annual-report summary is not labeled as a full survey report.

Content lives in `src/lib/content/survey-reports.json`, owned by Tina's
**User Survey — reports archive** collection. Headings, explanation, publication
list, dates, descriptions, formats and destinations are editable. Its dedicated
island supports previews; schema lock is regenerated. Local Tina GraphQL trial
verified add/edit/reorder/remove, filesystem save, readback and exact restoration.
Schema coverage includes both survey introduction and archive to prevent field loss.

Source verification:
- Production survey landing page still advertises 2022 as latest and links 2018,
  April2017, October/April2016, October/May2015 and November2014. All distinct
  publications are retained; the two May2015 demographics/business-driver links
  were the same article and are represented once.
- https://openinfra.org/annual-report/2025/ explicitly reports the latest User Survey
  findings; labeled annual report summary.
- https://openinfra.org/annual-report/2023/ describes that year's survey findings;
  labeled annual report summary. This avoids introducing a legacy blog dependency.
- https://openinfra.org/user-survey/ is the2021 report (verified from its contents).
- https://governance.openstack.org/tc/user_survey/analysis-2019.html is explicitly
  limited to the TC questions; labeled technical analysis.
- Existing2018/2022 Astro pages remain the destinations. April2016 PDF is already
  in the reviewed R2 registry. Other PDFs use existing VEXXHOST static storage;
  all four source PDFs returned200, application/pdf and a PDF signature.
- Superuser links use their modern openinfra.org domain. Public web reads verified
  all three article titles/dates. OpenInfra/Superuser deny bare urllib clients403;
  this is not reported as a successful HTTP probe. Safari verified2021 opens normally.

No new runtime SilverStripe dependency, report API, publication policy, DNS,
Survey database or permission changes. External publications remain independently
hosted. This archive does not assert a full report exists for every year.

Local validation: Astro check0errors/0warnings (four existing hints),240Node tests,
full build, Safari desktop review, Chromium1440/375px13unique destinations and no
horizontal overflow, keyboard focus, both local report pages render200. Mobile
screenshot visually inspected. Hosted deployment and live review recorded below.
