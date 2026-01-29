# Tarefitas — Design & UX Principles

> **Practical, enforceable principles that guide UX, UI, and technical decisions.**

This document translates research and product philosophy into **actionable rules** for designers and developers. If a decision conflicts with these principles, the decision should be reconsidered.

---

## 1. Principle: Reduce Cognitive Load (Always)

**Research basis**
Kalantari et al. (2025); Genaro Motti (2019)

### What this means

Tarefitas exists to *hold structure for the user*, not ask the user to manage the system.

### UX rules

* Prefer **simple, visible structures** over hidden logic
* Break complex actions into **explicit, concrete steps**
* Avoid dense screens; whitespace is functional

### Engineering implications

* Explicit state > derived or implicit state
* Avoid side-effects and magical defaults
* Data models should mirror what users see

**Reject if:** a feature requires remembering rules, modes, or hidden behaviors.

---

## 2. Principle: Calm Over Efficiency

**Research basis**
Kalantari et al. (2025); Xu et al. (2025)

### What this means

Efficiency gains are meaningless if they increase anxiety, urgency, or shame.

### UX rules

* No red alerts, countdown pressure, or urgency language
* Neutral copy ("available", "optional", "when you want")
* Progress is informative, never evaluative

### Engineering implications

* No automatic reordering based on time or priority
* Notifications must be optional and gentle by default
* Avoid animations that imply speed or urgency

**Reject if:** the feature motivates through fear, loss, or deadlines.

---

## 3. Principle: User-Controlled Adaptation (Not Automation)

**Research basis**
Xu et al. (2025)

### What this means

The system adapts *only when the user explicitly asks for it*.

### UX rules

* Preferences are visible and reversible
* Suggestions must be explainable
* Never change user data silently

### Engineering implications

* No background learning without consent
* Store preferences locally and transparently
* AI outputs must be dismissible without penalty

**Reject if:** the system decides "what’s best" for the user.

---

## 4. Principle: Predictability Builds Safety

**Research basis**
Kalantari et al. (2025)

### What this means

Unexpected behavior increases stress and disengagement for neurodivergent users.

### UX rules

* Same action → same result, always
* No surprise UI changes
* Modes must be clearly entered and exited

### Engineering implications

* Deterministic logic preferred over heuristics
* Avoid race conditions and timing-based behavior
* Feature flags over dynamic switching

**Reject if:** behavior changes based on hidden context.

---

## 5. Principle: Everything Is Optional

**Research basis**
Genaro Motti (2019); Xu et al. (2025)

### What this means

There is no single neurodivergent profile.

### UX rules

* Features must be disable-able
* No forced onboarding flows
* Defaults should be safe but minimal

### Engineering implications

* Modular architecture
* Graceful handling of disabled features
* No hard dependencies between UX modules

**Reject if:** a feature cannot be turned off.

---

## 6. Principle: Low Sensory Load by Default

**Research basis**
Kalantari et al. (2025); Genaro Motti (2019)

### UX rules

* Soft colors, stable layouts
* Motion is optional
* Sound is always opt-in

### Engineering implications

* Respect reduced-motion and prefers-contrast
* No autoplay media
* Avoid flashing or pulsing UI elements

**Reject if:** the feature adds sensory stimulation without user consent.

---

## 7. Principle: Accessibility Is Core Functionality

**Research basis**
All referenced works

### UX rules

* Full keyboard navigation
* Screen reader parity
* Visible focus states

### Engineering implications

* Accessibility bugs = functional bugs
* ARIA is not optional polish
* Test without a mouse

---

## 8. Decision Checklist (Use This in PRs)

Before merging, confirm:

* [ ] Does this reduce cognitive load?
* [ ] Is it calm and non-judgmental?
* [ ] Can the user opt out?
* [ ] Is the behavior predictable?
* [ ] Does it avoid productivity pressure?

If any answer is **no**, the change needs revision.

---

## 9. Final Note

These principles exist to protect users **and** the team.

They allow us to move fast *without* drifting into harmful patterns common in productivity software.

When in doubt, choose the option that gives the user **more control and less pressure**.
