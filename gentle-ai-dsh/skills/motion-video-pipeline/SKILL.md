---
name: motion-video-pipeline
description: "Trigger: motion video, video pipeline, motion pipeline, animar video, video animado, motion graphics video. Orchestrate a motion-to-video pipeline: design motion sequences, render frames, and assemble them into video with correct timing. Use when the user wants animated graphics exported as a video file, an intro/outro, or a motion storyboard rendered end to end."
license: MIT
allowed-tools: Read Write Bash(ffmpeg:*) Bash(node:*)
metadata:
  trigger: ["motion video", "video pipeline", "motion pipeline", "animar video", "video animado", "motion graphics", "intro", "outro"]
  scope: [global, project]
  version: "1.0.0"
---

# Motion Video Pipeline (MCP hybrid)

Plans, renders, and assembles motion sequences into a deliverable video file with deterministic timing.

## Activation Contract

Run when the deliverable is a video (not a live UI animation): animated intros/outros, motion storyboards, kinetic typography, or exporting motion as an MP4/WebM. Live UI animation stays in `motion-framer`/`motion-gsap`.

## Hard Rules

- Lock the target canvas size, fps, and aspect ratio before any frame work; do not change mid-pipeline.
- Use a fixed seed and explicit easing/timing values so renders are reproducible.
- Never ship a video without verifying the output plays and frame counts match the plan.
- Keep source assets out of the final cut when they carry licensing restrictions.

## Decision Gates

| Situation | Action |
|---|---|
| Simple motion → video | Define timeline, render frames, encode with ffmpeg |
| Interactive/live animation requested | Redirect to `motion-framer` / `motion-gsap`; this skill is for export |
| Audio sync needed | Add an audio track with a timecode-aligned script |

## Execution Steps

1. Clarify the deliverable: format, resolution, fps, duration, and whether audio is required.
2. Write a shot list / timeline (each shot: duration, easing, transform, camera move).
3. Render each shot to frames (or generate via MCP asset tooling) using the locked settings.
4. Assemble frames into a video with the correct codec and quality target.
5. Play the output, verify timing, and iterate on any shot that feels off.
6. Export the final file and report its path, codec, and duration.

## Output Contract

- The final video file path and its specs (codec, resolution, fps, duration).
- The timeline/shot list used.
- Any assets generated or downloaded and their licenses.

## References

- [`05-frontend/motion-framer`](../motion-framer/SKILL.md) and [`05-frontend/motion-gsap`](../motion-gsap/SKILL.md) — live UI animation (not export).
- [`04-backend/mcp-integration`](../mcp-integration/SKILL.md) — MCP asset/generation tooling when used.
