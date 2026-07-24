export function summarize_text({ text, max_length = 200 }) {
    return {
        summary: text.slice(0, max_length)
    };
}
