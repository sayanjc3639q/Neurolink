export interface GeneratedTopicResponse {
  title: string;
  summary: string;
  tags: string[];
  topicType: 'note' | 'comparison' | 'review' | 'blog';
  contentHtml: string;
}

const DEEPSEEK_API_KEY =
  import.meta.env.VITE_DEEPSEEK_API_KEY || 'sk-a361f96efdf64d7f997eb6cacbb22732';

export async function generateTopicWithDeepSeek(
  promptOrConcept: string,
  type: 'note' | 'comparison' | 'review' | 'blog' = 'note'
): Promise<GeneratedTopicResponse> {
  const systemPrompt = `You are an expert technical writer and computer science educator for "Neurolink", a Wikipedia-style technical knowledge base.
Write a comprehensive study-note topic for the user's requested concept in clean, semantic HTML format suitable for ProseMirror/Tiptap.

CRITICAL FORMAT RULES:
1. Return ONLY a valid JSON object with these exact keys:
   - "title": (string) Clear concise title
   - "summary": (string) 1-2 sentence high-density overview, MAX 280 characters.
   - "tags": (array of strings) 2 to 5 lowercase tags, e.g. ["algorithms", "searching"]
   - "topicType": "${type}"
   - "contentHtml": (string) The full HTML content body.

2. INSIDE "contentHtml":
   - Use <h2> for major sections (which populate the Table of Contents).
   - Use <h3> for subsections.
   - Use [[Topic Name]] syntax inline for any computer science concepts, related technologies, or data structures so they become wiki-links (e.g. "built on [[Arrays]]", "evaluated under [[Big-O Notation]]").
   - Include at least one <pre><code class="language-mermaid">...mermaid diagram code...</code></pre> block (flowchart, sequence, or architecture).
   - Include a <table> comparison or complexity breakdown with <thead> and <tbody>.
   - Use <mark>key takeaways</mark> for crucial invariant rules.
   - Use <pre><code>...code...</code></pre> for programming snippets.
   - Do NOT use markdown asterisks inside HTML; use <strong>, <em>, <ul>, <ol>, <li>.
   - Tone: Calm, studious, textbook manual style. No emojis, no exclamation marks.`;

  const userPrompt = `Generate a ${type} topic about: "${promptOrConcept}". Return strictly the JSON object.`;

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error('DeepSeek returned an empty response.');
  }

  const parsed = JSON.parse(rawContent) as GeneratedTopicResponse;
  return parsed;
}
