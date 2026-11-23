import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Firestore security rules configuration', () => {
  it('contains expected collection rules and owner restrictions', () => {
    const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
    const content = fs.readFileSync(rulesPath, 'utf-8');

    expect(content).toContain("service cloud.firestore");
    expect(content).toContain("match /topics/{slug}");
    expect(content).toContain("allow read: if true;");
    expect(content).toContain("isOwner()");
    expect(content).toContain("request.resource.data.title.size() <= 150");
    expect(content).toContain("request.resource.data.summary.size() <= 280");
    expect(content).toContain("request.resource.data.tags.size() <= 20");
    expect(content).toContain("match /meta/{doc}");
  });
});
