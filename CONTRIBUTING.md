# Contributing

Use Node 24. Run `npm ci`, then `npm run dev`. Without TinaCloud credentials the
build intentionally omits the hosted editor; credentials are not needed to
contribute ordinary code. Never point local write tests at production services.

Before submitting changes, run:

```sh
npm run format:check
npm run check
node --test scripts/tests/*.test.mjs
python3 -m unittest discover -s scripts/survey-story -p 'test_*.py'
npm run build
```

Open a pull request with the problem, change, and validation. Code contributions
are under Apache 2.0. Preserve existing third-party notices; do not assume website
images or trademarks are Apache-licensed (see THIRD_PARTY_NOTICES.md).

Branches, pull requests, comments, and Actions logs in a public repository are
public, including unpublished Tina drafts. Keep embargoed copy, survey responses,
member information and credentials outside this repository. The survey-story
JSON contains aggregate analysis, not respondent-level answers.

Deployment is restricted to trusted main-branch pushes and maintainer-dispatched
workflows. Do not run unreviewed contributor code through editorial preview or
other workflows that receive credentials. Editorial preview branches are trusted
same-repository branches, not a safe sandbox for external PR code.
