# Reporting security issues

Do not put credentials, personal data, or an unpatched vulnerability in a public
issue or pull request. Use this repository's GitHub **Security → Report a
vulnerability** feature when available. Otherwise contact the OpenInfra
Foundation at https://openinfra.org/contact/ and request a private security channel.

Public client IDs, Cloudflare account identifiers, hostnames and asset hashes are
identifiers, not credentials. Runtime credentials belong in GitHub Actions secrets
or the relevant service's secret store, never in source, fixtures or build logs.

A secret scan is not proof that no confidential information exists. Review the
content of contributions as well as automated findings. Never run untrusted PR
code in a workflow with production credentials.
