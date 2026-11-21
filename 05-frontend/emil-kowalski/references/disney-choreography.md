# Disney Choreography for UI & Motion Design (Frequency-Gated)

Adapted from *LottieFiles/motion-design-skill* and the 12 classic animation principles, harmonized strictly with `emil-kowalski`'s **Frequency Gate**.

## ⚖️ Authority Tie-Breaker (Mandatory)

- **Daily Utility Controls (`100+ times/day` — tabs, buttons, command palettes, toggles, form focus)**: `emil-kowalski` Frequency Gate **WINS** (`<= 150ms` crisp `--ease-out` or `0ms`, **ZERO** anticipation windup, **ZERO** squash & stretch, **ZERO** overshoot bounce).
- **Signature Moments, Brand Storytelling, Onboarding & Empty States (`Raro / Primera vez`)**: Apply the UI-adapted Disney choreography principles below within `DESIGN_SYSTEM.md` `Craft Budget`.

## 🎬 The 8 High-Leverage UI Principles

1. **Staging**: Direct the eye to ONE focal change at a time (`backdrop` dims `15%`, focal card enters with `scale(0.95) -> 1` + `opacity`). Never animate 5 competing hero blocks simultaneously.
2. **Anticipation (Micro-Cues Only)**: On hold-to-delete or drag-to-reorder, give `<= 60ms` subtle tension (`scale(0.98)`) before commitment; never block click latency.
3. **Follow-Through & Overlapping Action**: Stagger secondary labels/badges `30–50ms` behind the primary container (`staggerChildren: 0.04`), capped at `240ms` total cascade so content is interactive immediately.
4. **Slow In / Slow Out (Asymmetric Easing)**: Use `cubic-bezier(0.23, 1, 0.32, 1)` (`ease-out`) for entrances and responsive snaps; reserve `ease-in-out` strictly for persistent element transforms already onscreen.
5. **Arcs & Spatial Continuity**: Use shared-element FLIP or parabolic bezier trajectories for card-to-cart or thumbnail-to-lightbox moves instead of robotic straight-line teleports.
6. **Secondary Action**: Let subtle icon rotation, border luminance pulse, or micro-counter tick reinforce the primary transition without stealing contrast.
7. **Timing & Weight**: Lightweight pills/tooltips settle in `120–180ms`; heavy drawers/modals settle in `280–420ms` (`{ stiffness: 220, damping: 28, mass: 1.0 }`).
8. **Appeal & Reduced-Motion Parity**: Every animated beat must look intentional when paused at frame 0 or final frame (`@media (prefers-reduced-motion: reduce)` → `<= 100ms` crossfade).
