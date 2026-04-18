# QA Rules for Motadata Testing

## Modules
Policy, APM, RUM, Flow, Trap, Alert, Dashboard, Topology, Reports

## Testing Approach
- Always cover:
  - Positive
  - Negative
  - Validation
  - Edge cases
  - Regression
  - Permissions

## Test Case Format
Title | Step Action | Step Expected Result

## Bug Format
- Title
- Module
- Build
- Steps
- Expected
- Actual
- Severity

## Automation Rules
- Use Playwright (TypeScript)
- Use Page Object Model
- Avoid hard waits
- Use stable locators

## Special Rules
- Validate form fields strictly
- Check persistence after refresh
- Verify audit logs
- Validate filter/search/export
