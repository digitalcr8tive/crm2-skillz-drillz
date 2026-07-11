# CRM2 Skillz & Drillz Design System

## Overview

The site takes the existing Lovable reference as its visual source: high-contrast gym-poster typography, black and warm white surfaces, and basketball orange used decisively. Public pages feel like a training poster brought to life. Portal pages keep the same identity with quieter composition and stronger task hierarchy.

## Color Palette

- Court Black: `oklch(0.16 0.01 45)` for hero and footer surfaces.
- Gym White: `oklch(0.97 0.008 80)` for the main background.
- Basketball Orange: `oklch(0.70 0.19 45)` for calls to action and status emphasis.
- Ink: `oklch(0.19 0.01 45)` for text on light surfaces.
- Concrete: `oklch(0.52 0.01 55)` for secondary text.
- Success: `oklch(0.58 0.14 145)` and Warning: `oklch(0.70 0.15 75)` for portal statuses.

## Typography

- Display: Bebas Neue, tall and condensed, used for short headings and buttons.
- Body: Barlow, readable and athletic without feeling technical.
- Headlines use tight but safe spacing and a maximum of 96px.
- Body copy stays under 70 characters per line.

## Components

- Buttons are square-cornered or lightly rounded, high-contrast, and use action labels.
- Form controls use 48px minimum height, clear labels, and orange focus rings.
- Policy callouts use a full orange-tinted surface and strong hierarchy, never fine-print styling.
- Booking slots behave like selectable tickets with date, time, and capacity.
- Status chips are compact and use both color and text.

## Layout

- Public pages use full-width sections, strong rules, asymmetric photo placement, and generous vertical rhythm.
- Portal pages use a constrained 1180px workspace with a task-first two-column layout on desktop and one column on mobile.
- Mobile CTAs remain prominent without hiding page content.

## Motion

- One restrained entrance sequence in the hero and quick hover feedback on interactive elements.
- All animation is disabled or reduced when `prefers-reduced-motion` is enabled.
