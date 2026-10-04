# Floating AI Coach

## What will change
- Add a compact AI Coach button to the signed-in app shell so it appears on Today, Nutrition, Workouts, Library, Reports, and Coach.
- Let the user drag the button to a preferred screen edge; keep it within the visible window and remember its position on that device.
- Open a small chat panel from the button with the same personalized Coach capabilities and a link to the full Coach page.
- Support closing, sending, loading, and error states without covering the bottom navigation on mobile.

## Technical details
- Extract the existing Coach transport/chat setup into a reusable floating coach component.
- Mount it once in the authenticated layout so navigation does not duplicate it.
- Store only the button position locally; conversations remain temporary as they are now.
- Verify desktop and mobile placement, dragging, chat submission, and current page navigation.
