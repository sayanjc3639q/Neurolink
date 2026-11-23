import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import { getAllIndexedTopics } from '../../lib/searchIndex';
import { titleToSlug } from '../../lib/slug';

export const WikiLinkSuggestionPluginKey = new PluginKey('wikiLinkSuggestion');

export const WikiLinkSuggestionExtension = Extension.create({
  name: 'wikiLinkSuggestion',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        pluginKey: WikiLinkSuggestionPluginKey,
        char: '[[',
        items: ({ query }) => {
          const allTopics = getAllIndexedTopics();
          const cleanQuery = query.toLowerCase().trim();

          const matches = allTopics
            .filter((t) => t.title.toLowerCase().includes(cleanQuery))
            .slice(0, 5);

          if (cleanQuery && !allTopics.some((t) => t.title.toLowerCase() === cleanQuery)) {
            matches.push({
              slug: titleToSlug(query.trim()),
              title: query.trim(),
              isCreate: true,
            } as any);
          }

          return matches;
        },
        render: () => {
          let popup: HTMLDivElement | null = null;

          return {
            onStart: (props: any) => {
              popup = document.createElement('div');
              popup.style.position = 'absolute';
              popup.style.zIndex = '9999';
              document.body.appendChild(popup);
              updatePopupPosition(props.clientRect, popup);
            },
            onUpdate: (props: any) => {
              if (popup) {
                updatePopupPosition(props.clientRect, popup);
              }
            },
            onKeyDown: (props: any) => {
              if (props.event.key === 'Escape') {
                if (popup) popup.remove();
                return true;
              }
              return false;
            },
            onExit: () => {
              if (popup) {
                popup.remove();
                popup = null;
              }
            },
          };
        },
        command: ({ editor, range, props }: any) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setWikiLink({
              slug: props.slug,
              label: props.title,
            })
            .run();
        },
      }),
    ];
  },
});

function updatePopupPosition(clientRect: any, popup: HTMLElement) {
  if (!clientRect || !popup) return;
  const rect = clientRect();
  if (!rect) return;
  popup.style.left = `${rect.left + window.scrollX}px`;
  popup.style.top = `${rect.bottom + window.scrollY + 4}px`;
}
