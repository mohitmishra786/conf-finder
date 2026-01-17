# Contributing to ConfScout

Thank you for your interest in contributing to ConfScout. This project relies on community contributions to keep conference data accurate and the platform improving.

## Reporting Issues

If you find a bug or have a feature request, please open an issue on GitHub.
- Check existing issues to avoid duplicates.
- Described the issue clearly.
- Include steps to reproduce for bugs.

## Adding Configurations

The easiest way to contribute is by adding missing conferences.

1.  **For individual conferences**: You can submit an issue using the "Conference Submission" template.
2.  **For bulk data**: Open a Pull Request adding a new source script or updating existing data.

## Development Setup

To run ConfScout locally:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/mohitmishra786/conf-finder.git
    cd conf-finder
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```
    Open http://localhost:3000 in your browser.

4.  **Run the Aggregator** (Optional)
    To fetch fresh data locally:
    ```bash
    pip install -r requirements.txt
    python3 scripts/aggregate_data.py
    ```

## Adding a New Data Source

The scraper engine is modular. To add a new source:

1.  Create a new Python file in `scripts/sources/`.
2.  Implement a `fetch()` function that returns a list of dictionaries matching the conference schema.
3.  Import and add your source to `scripts/aggregate_data.py` in the `sources` list.

## Pull Request Process

1.  Fork the repository and create your branch from `main`.
2.  Make your changes.
3.  Test your changes locally.
4.  Ensure the build passes: `npm run build`.
5.  Open a Pull Request.

## Code Style

-   **TypeScript**: We use ESLint and Next.js defaults.
-   **Python**: Follow PEP 8 guidelines.
-   **General**: Keep code clean and readable. Avoid emojis in code comments and commit messages.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
