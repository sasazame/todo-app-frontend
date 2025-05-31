# CI E2E Test Issue Template

Copy this content to create a new GitHub issue:

---

## Title: Re-enable E2E tests in CI environment

### Description

E2E tests are currently disabled in CI due to environment-specific issues. They need to be re-enabled to ensure automated testing coverage.

### Current Status

- E2E tests work correctly in local development environment
- CI environment fails to properly start Next.js application for E2E tests
- Temporary workaround: Manual E2E test execution required before PR merge

### Technical Details

**Problems identified:**
1. Next.js production server startup timing issues in CI
2. Playwright webServer configuration conflicts between CI/local environments
3. Port availability and health check reliability

**Attempted solutions:**
1. Manual application startup with health checks
2. Artifact download and restoration
3. Various timeout and retry configurations

### Acceptance Criteria

- [ ] Smoke tests pass in CI environment
- [ ] No manual E2E test requirement for PR merge
- [ ] CI pipeline includes automated E2E test results
- [ ] Clear documentation for CI E2E test configuration

### Priority

Medium (not blocking development, but important for automation)

### References

- PR #23: Initial E2E test fixes
- CI workflow: `.github/workflows/ci.yml`
- Temporary documentation: `docs/PR_REQUIREMENTS.md`

---