# Tarefitas — Product Context & Scope

> **A neurodivergent-first planner focused on calm, clarity, and self‑regulation — not productivity pressure.**

---

## 1. Purpose of This Document

This document exists to provide **shared context** for everyone working on the Tarefitas monorepo — developers, designers, contributors, and future maintainers.

Before discussing *features*, *architecture*, or *implementation*, this document defines:

* What **Tarefitas is**
* What **Tarefitas is not**
* The **design and UX principles** that guide every technical decision
* Clear **scope boundaries** to prevent feature creep and harm

This context is **non-negotiable** and should be treated as foundational.

---

## 2. What Is Tarefitas?

**Tarefitas** is a non‑clinical, non‑prescriptive planning tool designed for **neurodivergent people**, especially individuals with:

* ADHD / TDAH
* Autism (ASD)
* Other executive‑function and sensory‑processing differences

Tarefitas exists to support:

* **Cognitive offloading** (externalizing memory and planning)
* **Self‑regulation** (not behavior correction)
* **Reduced sensory and emotional overload**

It is intentionally designed to be **calm, predictable, and user‑controlled**.

Tarefitas does **not** attempt to optimize productivity, enforce habits, or “fix” users.

---

## 3. What Tarefitas Is NOT

To avoid harm and misalignment, Tarefitas explicitly rejects the following categories:

### ❌ Not a productivity maximizer

* No productivity scores
* No performance metrics
* No comparison between users

### ❌ Not a clinical or therapeutic tool

* No diagnosis
* No treatment claims
* No behavioral compliance systems

### ❌ Not a coercive or motivational system

* No streak pressure
* No guilt‑based reminders
* No urgency framing ("overdue", "late", red alerts)

### ❌ Not an opaque AI system

* No silent behavior tracking
* No automatic reprioritization without consent
* No hidden decision‑making

If a feature relies on **pressure, urgency, or optimization**, it is **out of scope**.

---

## 4. Core Design Pillars

### 4.1 Cognitive Offloading Over Optimization

**Goal:** reduce working memory load, not increase output.

Tarefitas helps users:

* Externalize tasks and plans
* Break work into concrete steps
* Visually understand progress *without judgment*

Design implications:

* Simple data models
* Explicit task structure
* Optional progress visualization

---

### 4.2 Low‑Arousal, Low‑Pressure Interaction

**Goal:** minimize anxiety and sensory overload.

Principles:

* Neutral, non‑judgmental language
* Predictable system behavior
* No forced notifications

Design implications:

* Soft visual hierarchy
* Gentle animations (or none)
* Silence is a valid state

---

### 4.3 User‑Controlled Adaptation

**Goal:** give control, not take it away.

All adaptations must be:

* Explicitly chosen by the user
* Reversible
* Understandable

Design implications:

* Preferences over “smart defaults”
* Feature toggles
* No hidden state changes

Future AI features must be:

* Suggestive, not authoritative
* Explainable
* Easy to dismiss

---

### 4.4 Support Heterogeneity, Not a Single ND Profile

There is **no single neurodivergent experience**.

Principles:

* Modular features
* Everything optional
* No fixed “ADHD mode” or “Autism mode”

Design implications:

* Composable UI
* Per‑user preferences stored locally
* Safe defaults with high customizability

---

## 5. Scope Guardrails (For Developers)

Before implementing any feature, ask:

1. Does this **reduce cognitive load**?
2. Can the user **opt out completely**?
3. Does this introduce **pressure, urgency, or judgment**?
4. Is the behavior **predictable and transparent**?
5. Does this assume a "correct" way to be productive?

If the answer to **4 or 5 is NO**, the feature is likely **out of scope**.

---

## 6. UX Principles That Affect Code

These principles directly impact technical decisions:

* **Offline‑first** → local persistence is not optional
* **Predictability** → avoid side effects and magic state
* **Performance calmness** → avoid jank, avoid flashing UI
* **Accessibility first** → keyboard, screen readers, reduced motion

Developers are expected to:

* Prefer explicit state over implicit behavior
* Avoid clever abstractions that hide logic
* Optimize for readability and maintainability

---

## 7. Philosophy for Future Features (Including AI)

Any future intelligent or assistive system must:

* Respect user autonomy
* Avoid normative assumptions
* Never punish disengagement

**Example (allowed):**

> “You often break tasks into smaller steps. Want help doing that now?”

**Example (not allowed):**

> “You are behind schedule. Let’s fix that.”

---

## 8. Open Source & Contributor Expectations

Tarefitas is built **with and for neurodivergent people**.

Contributors should:

* Respect lived experience
* Avoid productivity‑culture language
* Treat accessibility as core functionality

Any contribution that violates the principles in this document may be rejected — regardless of technical quality.

---

## 9. Summary

Tarefitas is:

* Calm
* Respectful
* User-controlled
* Non-judgmental
* Evidence-aligned

It exists to support people **as they are**, not to optimize them into something else.

This document is the foundation. All code builds on it.

---

## 10. Research Foundations & References

The scope and principles in this document are grounded in peer‑reviewed research from Human–Computer Interaction (HCI), accessibility, and neurodiversity studies. These works inform our emphasis on low‑pressure interaction, user‑controlled adaptation, participatory design, and cognitive offloading.

**Primary references used:**

1. **Kalantari, N., Bagale, A., & Genaro Motti, V. (2025).** *Designing assistive technologies for and with neurodivergent users: considerations from research practice.* Interacting with Computers.
   — Evidence for participatory design, adaptive (but transparent) methods, low‑pressure interaction, and the importance of predictability and sensory regulation when designing with autistic and ADHD users.

2. **Xu, Z., Liu, F., Xia, G., Duan, Y., & Yu, L. (2025).** *A scoping review of inclusive and adaptive human–AI interaction design for neurodivergent users.* Disability and Rehabilitation: Assistive Technology.
   — Distinguishes inclusive vs. adaptive design, highlights risks of opaque AI, stresses user control, ethical AI, and heterogeneity across neurodivergent populations.

3. **Genaro Motti, V. (2019).** *Designing Emerging Technologies for and with Neurodiverse Users.* Proceedings of SIGDOC ’19 (ACM).
   — Provides concrete UX recommendations: multimodal feedback, reduced cognitive load, calm environments, short interactions, customization, and rejection of productivity‑centric metrics.

These references should be considered **contextual authority** for all product, UX, and technical decisions. When trade‑offs arise, default to interpretations that minimize cognitive load, sensory stress, and loss of user autonomy.
