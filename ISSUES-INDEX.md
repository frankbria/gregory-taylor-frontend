# Issues Index - Frontend

> **Comprehensive issue tracker for Gregory Taylor Photography frontend**
>
> Last updated: 2025-12-29
>
> **Note:** Issues #2 and #3 already exist on GitHub. This index contains additional issues discovered during codebase review.

---

## Quick Stats

| Category | Issues | Estimated Hours | Priority Breakdown |
|----------|--------|----------------|-------------------|
| Critical Issues | 7 | 18 hours | P0: 6, P1: 1 |
| UX & UI | 7 | 15 hours | P1: 3, P2: 4 |
| Testing | 5 | 18 hours | P0: 1, P1: 2, P2: 2 |
| **Total** | **19** | **~51 hours** | **~6-7 days** |

---

## Documents Overview

### [ISSUES-CRITICAL.md](./ISSUES-CRITICAL.md)
**Critical functional and security issues that block production**

| Issue | Priority | Hours | Status |
|-------|----------|-------|--------|
| Implement contact form API endpoint | P0 | 4h | Open |
| Fix room preview templates (3 of 4 broken) | P0 | 3h | Open |
| Implement orders page (currently stub) | P0 | 6h | Open |
| Add mobile navigation menu | P0 | 3h | Open |
| Fix cart icon positioning | P1 | 1h | Open |
| Client-side price validation | P0 | - | See backend |
| reCAPTCHA validation | P1 | 1h | Open |

**Blockers:**
- Contact form appears functional but sends nothing
- Room previews broken (affects purchase decision)
- Orders page non-functional
- Mobile navigation broken

---

### [ISSUES-UX-UI.md](./ISSUES-UX-UI.md)
**User experience and interface improvements**

| Issue | Priority | Hours | Status |
|-------|----------|-------|--------|
| Add loading skeletons for image grids | P1 | 2h | Open |
| Add empty state handling | P1 | 2h | Open |
| Improve error messages with guidance | P1 | 3h | Open |
| Add keyboard navigation to slider | P2 | 1h | Open |
| Add image loading fallbacks | P2 | 2h | Open |
| Improve button styles consistency | P2 | 3h | Open |
| Add print-friendly styles | P2 | 2h | Open |

**User Impact:**
- Abrupt loading experience
- No guidance when errors occur
- Accessibility gaps

---

### [ISSUES-TESTING.md](./ISSUES-TESTING.md)
**Testing infrastructure and coverage**

| Issue | Priority | Hours | Status |
|-------|----------|-------|--------|
| Fix test dependencies (tests can't run) | P0 | 1h | Open |
| Add component tests | P1 | 4h | Open |
| Add integration tests for checkout | P1 | 5h | Open |
| Set up Playwright for E2E tests | P2 | 6h | Open |
| Add code quality tools (ESLint, Prettier) | P2 | 2h | Open |

**Critical Gap:**
- Tests currently cannot run (dependency issue)
- Component tests missing
- No E2E tests despite Playwright mentioned in docs

---

## Existing GitHub Issues

**Do not create duplicates of these:**

- **Issue #2:** Security: Update frontend to use displayUrl instead of imageUrl/publicID
- **Issue #3:** Enhancement: Use actual image dimensions for proper aspect ratio display

---

## Priority Roadmap

### Week 1: Critical Issues (P0)
**Goal: Make site functional**

| Day | Focus | Issues |
|-----|-------|--------|
| 1 | Contact & Orders | Contact form API, Orders page |
| 2 | Mobile & Room Previews | Mobile nav, Room preview fix |
| 3 | Testing Setup | Fix test dependencies, Run existing tests |

**Deliverable:** Site functional on mobile, contact/orders work, tests run

---

### Week 2: Important Improvements (P1)
**Goal: Polish UX and test coverage**

| Day | Focus | Issues |
|-----|-------|--------|
| 4 | UX Improvements | Loading states, Empty states, Error messages |
| 5 | Testing | Component tests, Integration tests |
| 6 | Testing & QA | Finish testing, Fix bugs found |

**Deliverable:** Professional UX, >60% test coverage

---

### Week 3: Nice-to-Haves (P2)
**Goal: Accessibility and polish**

| Day | Focus | Issues |
|-----|-------|--------|
| 7 | Accessibility | Keyboard nav, Image fallbacks |
| 8 | Polish | Button consistency, Print styles |
| 9 | E2E Testing | Playwright setup, Critical flows |

**Deliverable:** Accessible, polished, fully tested

---

## Dependencies

### Backend Dependencies
Several frontend issues require backend changes:

- **Contact form** → Backend `/api/contact` route needed
- **Orders page** → Backend customer order lookup API needed
- **Price validation** → Backend must recalculate prices
- **reCAPTCHA** → Backend must verify tokens

**Coordination required with backend team.**

---

## How to Use This Index

### For Developers

1. **Starting work?** Check priority roadmap above
2. **Creating issues?** Copy from individual documents, paste into GitHub
3. **Estimating?** Use hour estimates as guideline (±20% variance expected)
4. **Dependencies?** Check "Dependencies" section for blockers

### For Project Managers

1. **Sprint planning?** Use priority roadmap as template
2. **Resource allocation?** ~51 hours = 1.5 developers for 1 month
3. **Risk assessment?** P0 issues block production launch
4. **Stakeholder updates?** Use Quick Stats table

### Creating GitHub Issues

Each issue in the documents is formatted ready for GitHub:
1. Open document (e.g., `ISSUES-CRITICAL.md`)
2. Copy issue including title, labels, description
3. Paste into GitHub issue form
4. Add labels as specified
5. Set priority milestone

---

## Issue Format

All issues follow this template:

```markdown
## Issue: [Title]

**Labels:** `label1`, `label2`
**Priority:** P0/P1/P2/P3
**Estimated Effort:** X hours

### Summary
Brief description of the problem

### Current Behavior
What happens now

### Proposed Solution
How to fix it (with code examples)

### Acceptance Criteria
- [ ] Checklist of requirements

### Testing
How to verify the fix works
```

---

## Notes

1. **Existing Issues:** Issues #2 and #3 already on GitHub - don't duplicate
2. **Estimates:** Based on single developer, may vary ±20%
3. **Priorities:**
   - P0 = Critical (blocks production)
   - P1 = Important (needed soon)
   - P2 = Nice to have (polish)
   - P3 = Future enhancement
4. **Backend Coordination:** Many frontend issues depend on backend changes
5. **Testing:** Currently blocked by dependency issue - fix first

---

## Related Documentation

- **Backend Issues:** `/home/frankbria/projects/gregory-taylor-backend/ISSUES-INDEX.md`
- **Project README:** `README.md`
- **Claude Code Guide:** `CLAUDE.md`

---

## Changelog

- **2025-12-29:** Initial comprehensive review
  - 19 frontend issues identified
  - 3 priority levels assigned
  - ~51 hours of work estimated

---

For questions or clarifications, refer to individual issue documents or the related backend issues index.
