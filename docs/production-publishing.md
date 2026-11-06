# Production publishing

Merges to main trigger Publish OpenStack production site. The workflow checks out
the triggering commit, validates it, builds the production origin and hosted Tina
editor, verifies the build fingerprint, then deploys openstack-org-production.
It retains the two established public routes, daily video refresh, production
Marketplace binding and existing service-only survey origin. Worker secrets stay
on the existing production Worker. DNS is never changed by this workflow.

Astro review publishing remains separate and protected. Tina edits remain in a
branch until merged. A successful preview deployment is not production acceptance;
check the production workflow and live page. Failed checks/builds stop deployment.
Production deployments serialize without cancelling an active release.

To roll back, redeploy a previously verified production commit through a reviewed
revert on main, or use Cloudflare Worker version rollback for an immediate incident.
A website rollback does not undo API/database writes.
