---
name: motion-video-pipeline
description: "Trigger: motion video, video pipeline, motion pipeline, animar video, video animado, motion graphics video, remotion, motion canvas, manim. Orchestrate a motion-to-video pipeline across the 22-repo Open-Source Motion Studio stack (Tier A timelines, Tier B UI choreography, Tier C 3D WebGL, Tier D FFmpeg/capture/audio sync) to design sequences, render frames, and export verified video. Use when the deliverable is an exported video file, intro/outro, or rendered storyboard. Do NOT use for live browser UI animations without video export (use motion-framer or motion-gsap)."
license: MIT
compatibility: "Compatible with Gentle-AI 4.4.0+, Remotion, Motion Canvas, Manim, Three.js/R3F, Playwright, FFmpeg. Requires Node 20+ and pnpm 9+."
allowed-tools: Read Write Bash(ffmpeg:*,node:*,pnpm:*)
metadata:
  trigger: ["motion video", "video pipeline", "motion pipeline", "animar video", "video animado", "motion graphics", "intro", "outro", "remotion", "motion canvas", "manim", "motion studio"]
  scope: [global, project]
  version: "1.1.0"
  author: skillsGV
---

# Motion Video Pipeline — 22-Repo Open-Source Motion Studio (MCP Hybrid)

Plans, renders, and assembles deterministic motion sequences into verified MP4/WebM video deliverables across four composable tiers.

## Activation & Tier Selection

Exporting a video file (`MP4`/`WebM`/`GIF`) activates this skill. Live interactive web UI choreography without video export stays in [`motion-framer`](../../05-frontend/motion-framer/SKILL.md) or [`motion-gsap`](../../05-frontend/motion-gsap/SKILL.md).

| Tier | Stack Focus | When to Select | Catalog Link |
|---|---|---|---|
| **Tier A** (6 repos) | React/TS/Python code-to-video timelines (`Remotion`, `Motion Canvas`, `Manim`, `Theatre.js`) | Parametric intros, technical explainers, math/code videos | [`references/motion-studio-22.md`](references/motion-studio-22.md) |
| **Tier B** (6 repos) | Vector & UI keyframe choreography (`Motion`, `GSAP`, `Anime.js`, `Lottie`, `Rive`) | Reusable kinetic typography or vector brand stingers | [`references/motion-studio-22.md`](references/motion-studio-22.md) |
| **Tier C** (5 repos) | Real-time 3D scenes & shaders (`Three.js`, `R3F`, `drei`, `postprocessing`, `CurtainsJS`) | Product turntables, hero shaders, spatial flythroughs | [`references/motion-studio-22.md`](references/motion-studio-22.md) |
| **Tier D** (5 repos) | Capture, audio peaks & encoding (`FFmpeg`, `fluent-ffmpeg`, `Puppeteer`, `Playwright`, `audiowaveform`) | Headless frame capture, beat-sync cues, final muxing | [`references/motion-studio-22.md`](references/motion-studio-22.md) |

## Hard Rules (Floor)

- **Lock Canvas First**: Freeze resolution, `fps`, duration, color space, and fixed RNG seeds before generating frame `0`.
- **Frame-Exact Audio Sync**: Extract beat/peak timestamps (`bbc/audiowaveform`) before rendering when motion reacts to audio.
- **Deterministic Virtual Clock**: For Tier B/C web scenes captured via Tier D (`Playwright`/`Puppeteer`), step animation clocks explicitly per frame (`t = frame / fps`) rather than wall-clock `requestAnimationFrame`.
- **Mandatory Playback & Frame-Count Proof**: Never report completion without inspecting `ffprobe` stream duration/frame count and licensing compliance of source assets.

## Execution Steps

1. Lock output spec (`width x height`, `fps`, duration, codec/CRF, audio track).
2. Map each shot in a timeline spec (start/end frames, easing curves, selected Tier A–C engine, Tier D capture/mux step).
3. Render shot frames reproducibly (avoiding unbounded frame buffers in RAM; stream straight to disk or FFmpeg pipe).
4. Mux video + synced audio via `FFmpeg` / `node-fluent-ffmpeg` (`yuv420p` compatibility for web/mobile).
5. Verify actual duration, frame count, and visual keyframe integrity (`ffprobe` + spot frames).

## Output Contract & References

- Report final video path, codec, resolution, `fps`, frame count, shot timeline, and asset licenses.
- [`references/motion-studio-22.md`](references/motion-studio-22.md) — Complete 22-repository reference guide across Tiers A–D.
- [`../../05-frontend/web-animation-sources/SKILL.md`](../../05-frontend/web-animation-sources/SKILL.md) — Curated web animation inspiration index.
- [`../../04-backend/mcp-integration/SKILL.md`](../../04-backend/mcp-integration/SKILL.md) — MCP asset tooling integration.
