# Motadata AIOps — Policy Module Test Cases

Module: **Policy** (Metric, Flow, Log, Availability)
Format: `Title | Step Action | Step Expected Result`
Coverage: Positive, Negative, Validation, Edge, Regression, Permissions

---

## 1. Metric Policy

### 1.1 Threshold Alert — Positive

| # | Title | Step Action | Step Expected Result |
|---|---|---|---|
| MP-TA-001 | Create Threshold policy with all mandatory fields | Navigate Policy > Create > Metric > Threshold Alert; fill Policy Name, Counter, Source Filter=Everywhere, Critical threshold; Save | Policy is created and listed; toast "Policy created successfully"; policy is enabled by default |
| MP-TA-002 | Create Threshold policy with Source Filter=Monitor | Select Source Filter=Monitor; choose a specific monitor; set Warning threshold; Save | Policy created and linked to the selected monitor only |
| MP-TA-003 | Create Threshold policy with Source Filter=Group | Select Source Filter=Group; choose a group; set Major threshold; Save | Policy applied to all monitors in the group |
| MP-TA-004 | Create Threshold policy with Source Filter=Tag | Select Source Filter=Tag; pick a tag; set Critical threshold; Save | Policy applies to all tagged monitors |
| MP-TA-005 | Configure multi-severity thresholds (Critical/Major/Warning) | Provide values for all three severities (e.g. 90/75/60); Save | All three severities saved; highest breached severity applies at runtime |
| MP-TA-006 | Configure "Notify if threshold breach within" window | Set window=5m, Abnormality Occurrence=3; Save | Policy raises alert only after 3 consecutive breaches inside 5m |
| MP-TA-007 | Configure Auto Clear duration | Set Auto Clear=10m; Save | Alert auto-clears when metric remains below threshold for 10m |
| MP-TA-008 | Add Subject & Message with macros | Insert supported macro tokens in Subject and Message; Save | Macros accepted; preview resolves correctly on alert trigger |
| MP-TA-009 | Configure Notify to registered user | Add existing username in Notify; Save | Username accepted; user receives alert on trigger |
| MP-TA-010 | Configure Notify via direct email | Add valid external email; Save | Email accepted and receives alert notification |
| MP-TA-011 | Enable Play Sound per severity | Toggle Play Sound; select Critical; Save | Sound configured; audible alert plays only for Critical |
| MP-TA-012 | Enable Renotification with interval | Enable renotify every 15m; Save | Alert is re-sent every 15m while severity unchanged |
| MP-TA-013 | Enable "Do not renotify if acknowledged" | Enable option; Save; trigger and acknowledge alert | No further renotifications after acknowledgment |
| MP-TA-014 | Attach runbook via "Action to be Taken" | Select an existing runbook; Save; trigger alert | Runbook executes on trigger; execution logged |
| MP-TA-015 | Create new runbook inline | Click Create New runbook; fill runbook fields; Save policy | New runbook stored and linked to the policy |
| MP-TA-016 | Attach Integration Profile by severity | Select severity=Critical, pick integration profile; Save | Incident created through profile on Critical alert only |

### 1.2 Baseline Alert — Positive

| # | Title | Step Action | Step Expected Result |
|---|---|---|---|
| MP-BA-001 | Create Baseline policy (Absolute deviation) | Create Metric > Baseline Alert; select Counter; Absolute deviation values for severities; Save | Policy created; evaluation begins immediately |
| MP-BA-002 | Create Baseline policy (Relative deviation %) | Choose Relative; enter % deviations; Save | Policy saved with %-based thresholds |
| MP-BA-003 | Baseline with Source Filter=Everywhere | Use default Everywhere; Save | Policy applies system-wide |
| MP-BA-004 | Auto Clear for Baseline policy | Set Auto Clear=15m; Save | Baseline alert auto-clears after 15m within baseline range |

### 1.3 Metric Policy — Negative / Validation

| # | Title | Step Action | Step Expected Result |
|---|---|---|---|
| MP-V-001 | Policy Name required | Leave Policy Name empty; Save | Validation error "Policy Name is required" |
| MP-V-002 | Duplicate Policy Name | Create policy with a name already in use | Error "Policy name already exists"; not saved |
| MP-V-003 | Counter required | Leave Counter empty; Save | Validation error on Counter field |
| MP-V-004 | Source required when filter ≠ Everywhere | Select Source Filter=Monitor without picking source; Save | Validation error; save blocked |
| MP-V-005 | All severity thresholds empty | Leave Critical/Major/Warning empty; Save | Error: at least one severity threshold must be set |
| MP-V-006 | Severity threshold ordering | Set Warning > Major > Critical for "greater than" operator | Validation error on severity ordering |
| MP-V-007 | Non-numeric threshold | Enter "abc" in threshold field | Field rejects input or shows validation error |
| MP-V-008 | Abnormality Occurrence > evaluation window | Window=5m, Occurrence=10 with 1m frequency | Validation error: occurrences cannot fit in window |
| MP-V-009 | Invalid email in Notify | Enter "user@@x"; Save | Inline email validation error |
| MP-V-010 | Renotify interval < minimum | Set renotify=0 or negative | Validation error; save blocked |
| MP-V-011 | XSS in Subject/Message | Enter `<script>alert(1)</script>` in Subject | Input sanitized/escaped; no script execution |
| MP-V-012 | SQL injection in Policy Name | Enter `' OR 1=1;--` | Treated as literal text; no backend error |
| MP-V-013 | Max length Policy Name | Enter name exceeding max length | Field enforces max length or shows error |

### 1.4 Metric Policy — Edge

| # | Title | Step Action | Step Expected Result |
|---|---|---|---|
| MP-E-001 | Threshold=0 | Save policy with Critical=0 | Policy saved; alert triggers per operator semantics |
| MP-E-002 | Negative threshold | Save with Warning=-5 for signed counter | Accepted only for signed counters; validation otherwise |
| MP-E-003 | Unicode & emoji in Policy Name | Create policy with name "策略-🚨" | Accepted; renders correctly in list |
| MP-E-004 | Highest-severity escalation | Metric exceeds both Major and Critical thresholds simultaneously | Alert raised with Critical only |
| MP-E-005 | Baseline without 15d history | Apply Baseline to a newly added counter | Policy saves; no baseline until 15d data accumulates; informative state shown |

### 1.5 Metric Policy — Regression

| # | Title | Step Action | Step Expected Result |
|---|---|---|---|
| MP-R-001 | Edit existing policy | Open policy > change threshold > Save | Updated values persist after refresh |
| MP-R-002 | Disable/Enable policy | Toggle policy state | State reflected in list and evaluation engine |
| MP-R-003 | Delete policy | Delete a policy | Policy removed; associated active alerts cleared |
| MP-R-004 | Audit log entry on create/edit/delete | Perform each action | Audit log captures actor, timestamp, action |
| MP-R-005 | Filter / Search policies | Search by Name and Tag | Returns matching policies only |
| MP-R-006 | Export policies | Export to CSV/JSON | Export file contains all configured policies |

### 1.6 Metric Policy — Permissions

| # | Title | Step Action | Step Expected Result |
|---|---|---|---|
| MP-P-001 | Admin full access | Login as Admin; Create/Edit/Delete policy | All actions allowed |
| MP-P-002 | Read-only user blocked from edit | Login as viewer; try to edit | Edit/Delete controls hidden or disabled |
| MP-P-003 | Unauthorized API access | Hit policy API without token | 401/403 returned |

---

## 2. Flow Policy

### 2.1 Positive

| # | Title | Step Action | Step Expected Result |
|---|---|---|---|
| FP-001 | Create Flow policy with Counter & Aggregation | Choose Counter, Aggregation function, Operator, thresholds; Save | Policy created; visible in list |
| FP-002 | Range operator with Start/End values | Select Range operator; set Start=100 End=500; Save | Policy saves; alert triggers inside range |
| FP-003 | Source Filter = Source Host | Pick specific flow source host; Save | Policy scoped to the selected host |
| FP-004 | Source Filter = Group | Pick a group; Save | Policy applies to every host in group |
| FP-005 | Source Filter = Everywhere (default) | Keep default; Save | Applied system-wide |
| FP-006 | Result By grouping | Set Result By = Source IP; Save | Aggregation grouped by Source IP |
| FP-007 | Real Time alert type | Select Real Time; Save | Evaluation begins immediately |
| FP-008 | Scheduled – Once (past hour) | Select Scheduled > Once; set Start Date; Save | Evaluates past-hour data once at scheduled time |
| FP-009 | Scheduled – Daily | Select Daily; set Hours; Save | Evaluates 24h window at specified hour(s) |
| FP-010 | Scheduled – Weekly | Select Weekly; pick days + hours | Evaluates 7d window on chosen days |
| FP-011 | Scheduled – Monthly | Select Monthly; pick months & dates | Evaluates 30d window on chosen dates |
| FP-012 | Suppression window | Enable Suppress Action; set window=30m | Action executes once; suppressed for 30m |
| FP-013 | Default policies present | Open Policy list after fresh install | Shows High BPS (TCP/UDP), ICMP Flood, Black IP, Low/No Flow defaults |
| FP-014 | Macros in Subject/Message | Use valid macros; Save & trigger | Macros resolve in delivered notification |
| FP-015 | Attach runbook | Select existing runbook; Save | Runbook executes on trigger |

### 2.2 Negative / Validation

| # | Title | Step Action | Step Expected Result |
|---|---|---|---|
| FP-V-001 | Policy Name required | Leave empty; Save | Validation error |
| FP-V-002 | Counter required | No counter; Save | Validation error |
| FP-V-003 | Range: Start ≥ End | Start=500, End=100 | Error on range validity |
| FP-V-004 | Scheduled without Start Date | Select Scheduled; skip Start Date | Validation error on Start Date |
| FP-V-005 | Weekly with no days chosen | Weekly; no day selection | Validation error |
| FP-V-006 | Monthly with no dates | Monthly; empty dates | Validation error |
| FP-V-007 | Suppress window without toggle | Enter window while toggle off | Field disabled / ignored |
| FP-V-008 | Invalid Teams handle | Enter malformed Teams handle | Validation error |
| FP-V-009 | Duplicate policy name | Reuse existing name | Error; not saved |

### 2.3 Edge

| # | Title | Step Action | Step Expected Result |
|---|---|---|---|
| FP-E-001 | Zero-traffic scenario for "Very Low / No Flow" | Stop flow feed; wait window | Alert triggers per default low-flow policy |
| FP-E-002 | Extremely high BPS burst | Inject traffic exceeding threshold briefly | Alert raised per Abnormality settings |
| FP-E-003 | DST boundary for Scheduled Daily | Schedule crossing DST change | Evaluation runs exactly once at the intended time |
| FP-E-004 | Large number of Result-By groups | Result By producing 10k+ groups | No UI freeze; pagination/limits enforced |

### 2.4 Regression / Permissions

| # | Title | Step Action | Step Expected Result |
|---|---|---|---|
| FP-R-001 | Edit schedule from Daily to Weekly | Update type; Save | Previous day/hour config cleared; new fields required |
| FP-R-002 | Delete policy | Delete; confirm | Removed; active alerts cleared; audit log entry |
| FP-R-003 | Export flow policies | Export | File contains all fields including schedule |
| FP-R-004 | Role-based access | Viewer tries delete | Delete blocked |

---

## 3. Log Policy

### 3.1 Positive

| # | Title | Step Action | Step Expected Result |
|---|---|---|---|
| LP-001 | Create Log policy with Counter & Aggregation | Fill Counter, Aggregation, Operator, threshold; Save | Policy created |
| LP-002 | Range operator | Operator=Range; Start/End; Save | Saved; alert fires in range |
| LP-003 | Source Filter = Source Host | Pick a host; Save | Scoped to host |
| LP-004 | Source Filter = Source Type | Pick Source Type (e.g. syslog); Save | Scoped to source type |
| LP-005 | Source Filter = Group | Pick Group; Save | Applied to group |
| LP-006 | Source Filter = Everywhere | Default; Save | System-wide scope |
| LP-007 | Result By grouping | Result By = Host; Save | Aggregation grouped by host |
| LP-008 | Real Time evaluation | Select Real Time; Save | Evaluation begins immediately |
| LP-009 | Scheduled (Once / Daily / Weekly / Monthly) | Create one policy per option with correct parameters | Each policy saves with scheduler context |
| LP-010 | Root-user activity detection sample | Configure filter for "sudo\|su\|root"; threshold count > 1; Save | Alert fires when matching log count > 1 |
| LP-011 | Severity assignment (Critical/Major/Warning) | Set all 3; Save | Highest breached severity used |
| LP-012 | Suppress Action + Window | Enable toggle; window=1h | One notification then suppressed 1h |
| LP-013 | Macros in Subject/Message | Use supported macros | Resolve correctly on trigger |
| LP-014 | Notify users/emails/Teams | Add mixed recipients | All receive notification |
| LP-015 | Play Sound toggle + severity | Enable; select Major | Sound plays only for Major |
| LP-016 | Runbook on trigger | Attach runbook; trigger condition | Runbook executes |
| LP-017 | Threat-feed integration policy | Enable Malicious Activity detection | Alerts generated for matching threat-feed IPs |

### 3.2 Negative / Validation

| # | Title | Step Action | Step Expected Result |
|---|---|---|---|
| LP-V-001 | Policy Name required | Empty; Save | Validation error |
| LP-V-002 | Counter required | None; Save | Validation error |
| LP-V-003 | Operator=Range missing Start or End | Leave one empty | Validation error |
| LP-V-004 | Regex in log filter malformed | Enter unclosed `(` regex | Error: invalid pattern |
| LP-V-005 | Start Date in past for Scheduled | Date < today | Validation error |
| LP-V-006 | Weekly without days | No days selected | Validation error |
| LP-V-007 | Suppress window=0 | 0 or negative | Validation error |
| LP-V-008 | Email list with mixed invalid entry | `"a@b.com, notanemail"` | Error pinpoints bad entry |

### 3.3 Edge

| # | Title | Step Action | Step Expected Result |
|---|---|---|---|
| LP-E-001 | Very high log volume | Ingest 100k matching logs/min | Aggregation stable; alert triggers timely |
| LP-E-002 | Zero matching logs | No matching logs in window | No alert; no false positive |
| LP-E-003 | Unicode log content match | Logs contain non-ASCII chars | Pattern matches correctly |
| LP-E-004 | Policy overlap with same counter | Two policies on same counter and source | Both evaluate independently; both alerts raised |

### 3.4 Regression / Permissions

| # | Title | Step Action | Step Expected Result |
|---|---|---|---|
| LP-R-001 | Edit & persist after refresh | Edit fields > Save > refresh | Changes persisted |
| LP-R-002 | Disable policy | Toggle off | Evaluation stops; no alerts |
| LP-R-003 | Delete policy | Delete; confirm | Removed; audit log entry |
| LP-R-004 | Search/filter/export | Search by Name/Tag/Severity; export | Correct filtering & export content |
| LP-R-005 | Viewer cannot create | Login viewer; Create button | Hidden/disabled |

---

## 4. Availability Policy

### 4.1 Positive

| # | Title | Step Action | Step Expected Result |
|---|---|---|---|
| AP-001 | Create policy for single Monitor | Source=Monitor; pick monitor; Save | Policy monitors only that monitor |
| AP-002 | Create policy for Group | Source=Group; pick group; Save | Applied to all group monitors |
| AP-003 | Create policy for Tag | Source=Tag; pick tag; Save | Applied to all tagged monitors |
| AP-004 | Create policy Everywhere | Default Everywhere; Save | Applied system-wide |
| AP-005 | Time Window + Abnormality Occurrence | Window=5m, Occurrence=3 | Alert only after 3 consecutive "down" within 5m |
| AP-006 | Window reset on non-down value | Monitor goes down-up-down within window | Window resets on "up"; occurrence counter restarts |
| AP-007 | Severity selection Critical | Set Critical; Save & trigger | Alert raised as Critical |
| AP-008 | Notify registered users/emails/Teams | Configure all recipients | Notifications delivered to all |
| AP-009 | Renotify interval | Enable renotify=10m | Alert re-sent every 10m while down |
| AP-010 | Ack suppresses renotify | Enable setting; acknowledge | No further renotifications post-ack |
| AP-011 | Runbook on down + on clear | Map down-runbook & clear-runbook | Correct runbook runs per state change |
| AP-012 | De-provision duration | Set de-provision duration; trigger | Monitor de-provisioned for set duration |
| AP-013 | Integration Profile by severity | Attach profile to Critical | Incident raised through profile on Critical only |

### 4.2 Negative / Validation

| # | Title | Step Action | Step Expected Result |
|---|---|---|---|
| AP-V-001 | Policy Name required | Empty; Save | Validation error |
| AP-V-002 | Source required if not Everywhere | Select Monitor without picking one | Validation error |
| AP-V-003 | Occurrence=0 or negative | Set 0; Save | Validation error |
| AP-V-004 | Window < frequency | Window smaller than monitor poll frequency | Warning / blocked |
| AP-V-005 | Duplicate policy on same source | Create second identical policy | Warn or block per product rule; confirm behavior in docs |
| AP-V-006 | Invalid email in Notify | Bad email; Save | Validation error |
| AP-V-007 | Renotify without severity selection | Enable renotify; no severity | Validation error |

### 4.3 Edge

| # | Title | Step Action | Step Expected Result |
|---|---|---|---|
| AP-E-001 | Flapping monitor (down/up rapidly) | Many state changes within window | Window resets on each "up"; no premature alert |
| AP-E-002 | Monitor deleted while policy active | Remove monitor referenced by policy | Policy handles gracefully; no crash; audit log |
| AP-E-003 | Large group (1000+ monitors) | Apply policy to huge group | Evaluation stable; alerts correctly attributed |
| AP-E-004 | Timezone change / DST during window | Server DST shift mid-evaluation | Window math remains correct |

### 4.4 Regression / Permissions

| # | Title | Step Action | Step Expected Result |
|---|---|---|---|
| AP-R-001 | Edit and persist | Change Window & Occurrence; Save; refresh | Values retained |
| AP-R-002 | Disable/Enable | Toggle | Reflected in engine and UI |
| AP-R-003 | Delete | Delete | Removed; active alerts cleared; audit log |
| AP-R-004 | Search/Filter/Export | Exercise all three | Works as designed |
| AP-R-005 | Role-based access | Viewer tries create/edit/delete | All write actions blocked |

---

## 5. Cross-Policy Generic Test Cases

| # | Title | Step Action | Step Expected Result |
|---|---|---|---|
| GEN-001 | Policy list pagination | Create > 50 policies; paginate | Pagination works; counts correct |
| GEN-002 | Bulk enable/disable | Multi-select and toggle | All selected policies update |
| GEN-003 | Bulk delete with confirmation | Multi-select delete | Confirmation dialog; all removed |
| GEN-004 | Session timeout during edit | Idle past session timeout then Save | Redirect to login; unsaved draft handled per product |
| GEN-005 | Concurrent edit conflict | Two users edit same policy | Second save shows conflict / last-write warning |
| GEN-006 | API parity with UI | Create via API then view UI | All fields identical UI↔API |
| GEN-007 | Audit log completeness | Create/Edit/Delete any policy | Audit log captures actor, time, before/after |
| GEN-008 | Accessibility (keyboard nav) | Tab through form | All fields reachable; focus visible |
| GEN-009 | Browser matrix | Run create flow in Chrome/Edge/Firefox | Works identically |
| GEN-010 | i18n labels | Switch locale | All labels localized; no hardcoded strings |
