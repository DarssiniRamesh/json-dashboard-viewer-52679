# AppVote Dashboard

This is a modern, minimal React dashboard for visualizing aggregate analytics and features from the `appvote.json` static data. 

## Main Features

- **Summary Stats**: Total submissions, unique participants, apps evaluated, unique features, NPS score.
- **Vote & Submission Analytics**: Week-by-week, platform distribution, and top-voted apps (with logos and links).
- **Popular Features**: Word cloud of top feature requests.
- **Feature Sentence Cloud**: Unique sentences for feature suggestions/requested items (non-PII).
- **Outcome Summary**: Highlights per week, aggregate insights, key points from comment trends.
- **Modern Oceanic Blue/White UI**: Responsive, polished, and easy to navigate.
- **Filter Panel**: Filter data by week/platform (future: search/filter expansion).
- **No PII**: All analytics and visualizations use aggregate/anonymized data only.

## Structure

- `App.js` – global state, loading, layout, filter handling
- `Dashboard.js` – main analytic components grid
- `components/` – UI/analytics blocks: stats, charts, clouds, filter panel, etc.
- `App.css` – all dashboard styling, oceanic blue/white theme
- `appvote.json` – static input data (must be present in `src/`) 

## To Use

1. Ensure `appvote.json` is present in this src directory.
2. Run via your standard React dev server.

## Customization

- Add more charts/widgets in `Dashboard.js`.
- Styles: tweak or extend in `App.css`.

## Attribution

:rocket: Dashboard UI developed for AppVote analytics, oceanic theme.
