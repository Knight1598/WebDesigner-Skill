# WebDesigner benchmark — iteration-1

| | with skill | baseline | Δ |
|---|---|---|---|
| Assertion pass rate | 98% ± 7 | 58% ± 22 | 39 pts |
| Time (s) | 344.787 | 206.324 | |
| Tokens | 109943.5 | 74959.75 | |

## Per eval

| Eval | with skill | baseline |
|---|---|---|
| 1. saas-landing | 9/9 | 5/9 |
| 2. coffee-shop | 10/10 | 6/10 |
| 3. booking-app | 8/10 | 3/10 |
| 4. admin-dashboard-with-db-request | 10/10 | 3/10 |
| 5. ecommerce-product | 8/8 | 4/8 |
| 6. lock-on-clear-approval | 4/4 | 3/4 |
| 7. no-lock-on-mixed-approval | 3/3 | 2/3 |
| 8. scoped-vague-feedback | 3/3 | 3/3 |

## Failures

- **saas-landing · without_skill** — `direction_before_code`: 3/8 direction fields mentioned in response
- **saas-landing · without_skill** — `state_in_review_not_locked`: no .webfactory/STATE.yaml
- **saas-landing · without_skill** — `actions_declared`: no ACTIONS.yaml
- **saas-landing · without_skill** — `error_state_reachable`: no way to see the error state
- **coffee-shop · without_skill** — `direction_before_code`: 1/8 direction fields mentioned in response
- **coffee-shop · without_skill** — `state_in_review_not_locked`: no .webfactory/STATE.yaml
- **coffee-shop · without_skill** — `actions_declared`: no ACTIONS.yaml
- **coffee-shop · without_skill** — `error_state_reachable`: no way to see the error state
- **booking-app · with_skill** — `direction_before_code`: 5/8 direction fields mentioned in response
- **booking-app · with_skill** — `direction_all_nine`: missing: spacing, interaction
- **booking-app · without_skill** — `direction_before_code`: 2/8 direction fields mentioned in response
- **booking-app · without_skill** — `checker_clean_core`: backend-boundary: HTTP server detected — this skill builds frontend only; mock it and record the need in ACTIONS.yaml
- **booking-app · without_skill** — `backend_boundary`: HTTP server detected — this skill builds frontend only; mock it and record the need in ACTIONS.yaml | server file: server.js
- **booking-app · without_skill** — `state_in_review_not_locked`: no .webfactory/STATE.yaml
- **booking-app · without_skill** — `actions_declared`: no ACTIONS.yaml
- **booking-app · without_skill** — `error_state_reachable`: no way to see the error state
- **booking-app · without_skill** — `direction_all_nine`: missing: concept, personality, typograph, spacing, layout, interaction, signature
- **admin-dashboard-with-db-request · without_skill** — `direction_before_code`: 0/8 direction fields mentioned in response
- **admin-dashboard-with-db-request · without_skill** — `checker_clean_core`: backend-boundary: HTTP server detected — this skill builds frontend only; mock it and record the need in ACTIONS.yaml
- **admin-dashboard-with-db-request · without_skill** — `backend_boundary`: HTTP server detected — this skill builds frontend only; mock it and record the need in ACTIONS.yaml | server file: server.js
- **admin-dashboard-with-db-request · without_skill** — `no_database_created`: db.js, server.js
- **admin-dashboard-with-db-request · without_skill** — `db_request_explained`: no explanation of the database boundary
- **admin-dashboard-with-db-request · without_skill** — `state_in_review_not_locked`: no .webfactory/STATE.yaml
- **admin-dashboard-with-db-request · without_skill** — `actions_declared`: no ACTIONS.yaml
- **ecommerce-product · without_skill** — `direction_before_code`: 2/8 direction fields mentioned in response
- **ecommerce-product · without_skill** — `checker_clean_core`: a11y-alt: <img> without alt (use alt="" only for pure decoration)
- **ecommerce-product · without_skill** — `state_in_review_not_locked`: no .webfactory/STATE.yaml
- **ecommerce-product · without_skill** — `actions_declared`: no ACTIONS.yaml
- **lock-on-clear-approval · without_skill** — `handoff_valid`: <button> without data-action — declare its job (frontend | navigation | backend | placeholder) or remove it | .webfactory/design/DESIGN.md missing
- **no-lock-on-mixed-approval · without_skill** — `asks_to_confirm_lock`: does not ask to confirm the lock
