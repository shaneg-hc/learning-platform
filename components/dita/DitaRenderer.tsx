/**
 * Recursive DITA JSON → React renderer.
 *
 * Handles standard block/inline elements and the SHRM widget annotations:
 *   widget(hero)               → styled "Competency Connection" section wrapper
 *   widget(hero_banner)        → blue competency header with subtitle + related list
 *   widget(hero_icon_list)     → related competency pill list
 *   widget(hero_content)       → scenario story (image + paragraphs)
 *   widget(verticalAccordion)  → collapsible accordion panels
 *   widget(horizontalAccordion)→ tabbed accordion panels (rendered same as vertical)
 *
 * Props on ph elements contain icon identifiers, not display text — they are skipped.
 */

type DitaChild = string | Record<string, unknown>;
type DitaElement = { children?: DitaChild[]; attributes?: Record<string, unknown> };

const SKIP_ELEMENTS = new Set(['prolog', 'draft-comment', 'indexterm', 'alt', 'keywords', 'keyword']);

function widget(attrs: Record<string, unknown> | undefined): string | null {
  const props = attrs?.props as string | undefined;
  if (!props) return null;
  const m = props.match(/widget\(([^)]+)\)/);
  return m ? m[1] : null;
}

function renderChildren(children: DitaChild[]) {
  return children.map((child, i) => <DitaNode key={i} node={child} />);
}

function extractText(node: DitaChild): string {
  if (typeof node === 'string') return node;
  const entries = Object.entries(node as Record<string, unknown>);
  if (!entries.length) return '';
  const [, raw] = entries[0];
  if (!raw || typeof raw !== 'object') return '';
  const el = raw as DitaElement;
  return (el.children ?? []).map(extractText).join('');
}

// Extracts accordion panes from a verticalAccordion/horizontalAccordion div's children.
// Each child `p` has children[0] as title node and children[1] as content node.
function extractAccordionPanes(children: DitaChild[]): Array<{ id: string; title: DitaChild; content: DitaChild }> {
  const panes: Array<{ id: string; title: DitaChild; content: DitaChild }> = [];
  let paneIdx = 0;

  for (const child of children) {
    if (typeof child === 'string') continue;
    const entries = Object.entries(child as Record<string, unknown>);
    if (!entries.length) continue;
    const [key, raw] = entries[0];
    if (key !== 'p' || !raw || typeof raw !== 'object') continue;
    const el = raw as DitaElement;
    const kids = el.children ?? [];
    const id = (el.attributes?.id as string | undefined) ?? `pane-${paneIdx++}`;
    if (kids.length >= 2) {
      panes.push({ id, title: kids[0], content: kids[1] });
    }
  }
  return panes;
}

// Renders a DITA `table` element: table → tgroup → thead/tbody → row → entry
function DitaTable({ el }: { el: DitaElement }) {
  const children = el.children ?? [];
  const titleNode = children.find(
    (c) => typeof c === 'object' && 'title' in (c as object),
  );
  const tgroupNode = children.find(
    (c) => typeof c === 'object' && 'tgroup' in (c as object),
  );

  const renderTgroup = (tgroupEl: DitaElement) => {
    const rows = tgroupEl.children ?? [];
    const thead = rows.find((c) => typeof c === 'object' && 'thead' in (c as object));
    const tbody = rows.find((c) => typeof c === 'object' && 'tbody' in (c as object));

    const renderRows = (sectionEl: DitaElement, isHead: boolean) => {
      const rowNodes = sectionEl.children ?? [];
      return rowNodes.map((rowNode, ri) => {
        if (typeof rowNode === 'string') return null;
        const rowRaw = (rowNode as Record<string, unknown>).row as DitaElement | undefined;
        if (!rowRaw) return null;
        const entries = rowRaw.children ?? [];
        return (
          <tr key={ri}>
            {entries.map((entry, ei) => {
              if (typeof entry === 'string') return null;
              const entryRaw = (entry as Record<string, unknown>).entry as DitaElement | undefined;
              if (!entryRaw) return null;
              const Cell = isHead ? 'th' : 'td';
              return (
                <Cell key={ei} className={isHead ? 'bg-[var(--brand-accent-light)] px-3 py-2 text-left text-sm font-semibold text-[var(--brand-accent-dark)] border border-gray-200' : 'px-3 py-2 text-sm text-gray-700 border border-gray-200 align-top'}>
                  {renderChildren(entryRaw.children ?? [])}
                </Cell>
              );
            })}
          </tr>
        );
      });
    };

    return (
      <table className="w-full border-collapse text-sm my-2">
        {thead && (
          <thead>
            {renderRows((thead as Record<string, unknown>).thead as DitaElement, true)}
          </thead>
        )}
        {tbody && (
          <tbody>
            {renderRows((tbody as Record<string, unknown>).tbody as DitaElement, false)}
          </tbody>
        )}
      </table>
    );
  };

  return (
    <figure className="my-6 overflow-x-auto">
      {titleNode && (
        <figcaption className="text-sm font-semibold text-gray-600 mb-2">
          {extractText(titleNode)}
        </figcaption>
      )}
      {tgroupNode && renderTgroup((tgroupNode as Record<string, unknown>).tgroup as DitaElement)}
    </figure>
  );
}

const NOTE_STYLES: Record<string, { border: string; bg: string; icon: string; label: string }> = {
  warning: { border: 'border-red-400', bg: 'bg-red-50', icon: '⚠️', label: 'Warning' },
  caution: { border: 'border-amber-400', bg: 'bg-amber-50', icon: '⚠️', label: 'Caution' },
  danger:  { border: 'border-red-600', bg: 'bg-red-100', icon: '🚫', label: 'Danger' },
  important: { border: 'border-blue-400', bg: 'bg-blue-50', icon: 'ℹ️', label: 'Important' },
  tip:     { border: 'border-green-400', bg: 'bg-green-50', icon: '💡', label: 'Tip' },
  note:    { border: 'border-[var(--brand-accent)]', bg: 'bg-[var(--brand-accent-light)]', icon: 'ℹ️', label: 'Note' },
};

function DitaNode({ node }: { node: DitaChild }) {
  if (typeof node === 'string') return <>{node}</>;

  const entries = Object.entries(node as Record<string, unknown>);
  if (!entries.length) return null;
  const [type, raw] = entries[0];

  if (SKIP_ELEMENTS.has(type)) return null;
  if (!raw || typeof raw !== 'object') return null;

  const el = raw as DitaElement;
  const attrs = el.attributes ?? {};
  const children = el.children ?? [];
  const w = widget(attrs);
  const outputclass = attrs.outputclass as string | undefined;

  switch (type) {
    // ── Block elements ──────────────────────────────────────────────────────
    case 'p': {
      if (outputclass === 'competency_subtitle') {
        return (
          <p className="text-lg font-semibold text-[var(--brand-accent-dark)]">
            {renderChildren(children)}
          </p>
        );
      }
      if (outputclass === 'sectiondiv') {
        return (
          <h4 className="text-base font-semibold text-[var(--brand-accent-dark)] mt-4 mb-1">
            {renderChildren(children)}
          </h4>
        );
      }
      if (outputclass === 'aside_title') {
        return (
          <h4 className="text-sm font-bold uppercase tracking-wide text-[var(--brand-accent)] mt-2 mb-1">
            {renderChildren(children)}
          </h4>
        );
      }
      return (
        <p className="text-gray-700 leading-relaxed">
          {renderChildren(children)}
        </p>
      );
    }

    case 'sectiondiv':
      return <div className="space-y-2">{renderChildren(children)}</div>;

    case 'shortdesc':
      return (
        <p className="text-base text-gray-600 leading-relaxed italic border-l-4 border-[var(--brand-accent)] pl-4 my-3">
          {renderChildren(children)}
        </p>
      );

    case 'note': {
      const noteType = (attrs.type as string | undefined) ?? 'note';
      const style = NOTE_STYLES[noteType] ?? NOTE_STYLES.note;
      return (
        <div className={`my-4 rounded-lg border-l-4 ${style.border} ${style.bg} px-4 py-3`}>
          <p className="text-xs font-bold uppercase tracking-wide mb-1 opacity-70">
            {style.icon} {style.label}
          </p>
          <div className="text-sm text-gray-700 space-y-1">{renderChildren(children)}</div>
        </div>
      );
    }

    case 'ul':
      if (w === 'hero_icon_list') {
        return (
          <ul className="flex flex-wrap gap-2 mt-2">
            {children.map((child, i) => <DitaNode key={i} node={child} />)}
          </ul>
        );
      }
      if (outputclass === 'HCBullet' || outputclass === 'HCBulletStyle2') {
        return (
          <ul className="space-y-2 my-2">
            {children.map((child, i) => {
              if (typeof child === 'object' && 'li' in (child as object)) {
                const liEl = (child as Record<string, unknown>).li as DitaElement;
                return (
                  <li key={i} className="flex gap-2 items-start text-gray-700">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-accent)]" />
                    <span>{renderChildren(liEl.children ?? [])}</span>
                  </li>
                );
              }
              return <DitaNode key={i} node={child} />;
            })}
          </ul>
        );
      }
      return (
        <ul className="list-disc list-outside ml-5 space-y-1 text-gray-700">
          {renderChildren(children)}
        </ul>
      );

    case 'ol':
      return (
        <ol className="list-decimal list-outside ml-5 space-y-1 text-gray-700">
          {renderChildren(children)}
        </ol>
      );

    case 'li': {
      // hero_icon_list items have li → p → [ph (icon id), span (label)]
      // Regular list items also have li → p → text, so check for the ph inside
      const isIconItem = children.some((c) => {
        if (typeof c !== 'object' || !('p' in (c as object))) return false;
        const p = (c as Record<string, unknown>).p as DitaElement | undefined;
        return (p?.children ?? []).some(
          (pc) => typeof pc === 'object' && 'ph' in (pc as object),
        );
      });
      if (isIconItem) {
        const label = children
          .flatMap((c) => {
            if (typeof c !== 'object') return [];
            const p = (c as Record<string, unknown>).p as DitaElement | undefined;
            if (!p) return [];
            return (p.children ?? []).filter(
              (pc) => typeof pc === 'object' && 'span' in (pc as object),
            );
          })
          .map((spanNode) => {
            const span = (spanNode as Record<string, unknown>).span;
            if (typeof span === 'string') return span;
            const el = span as DitaElement;
            return (el.children ?? []).filter((c) => typeof c === 'string').join('');
          })
          .join('');
        return (
          <li className="list-none rounded-full bg-[var(--brand-accent-light)] px-3 py-1 text-sm text-[var(--brand-accent)]">
            {label}
          </li>
        );
      }
      return <li className="text-gray-700">{renderChildren(children)}</li>;
    }

    case 'title':
      return (
        <h3 className="font-semibold text-[var(--brand-accent-dark)] text-base">
          {renderChildren(children)}
        </h3>
      );

    case 'section':
      if (w === 'hero') {
        return (
          <div className="mt-6 rounded-xl border border-[var(--brand-accent-light)] overflow-hidden">
            {renderChildren(children)}
          </div>
        );
      }
      return <section className="space-y-3">{renderChildren(children)}</section>;

    case 'div':
      if (w === 'hero_banner') {
        return (
          <div className="bg-[var(--brand-accent-light)] px-6 py-5 space-y-3">
            {renderChildren(children)}
          </div>
        );
      }
      if (w === 'hero_content') {
        return (
          <div className="px-6 py-5 space-y-4 bg-white">
            {renderChildren(children)}
          </div>
        );
      }
      if (w === 'verticalAccordion' || w === 'horizontalAccordion') {
        const panes = extractAccordionPanes(children);
        return (
          <div className="my-4 divide-y divide-gray-200 rounded-lg border border-gray-200 overflow-hidden">
            {panes.map(({ id, title, content }) => (
              <details key={id} className="group">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 font-medium text-[var(--brand-accent-dark)] hover:bg-[var(--brand-accent-light)] transition-colors list-none">
                  <span>{extractText(title)}</span>
                  <span className="ml-2 text-[var(--brand-accent)] transition-transform group-open:rotate-180">▾</span>
                </summary>
                <div className="px-4 py-4 space-y-3 text-gray-700 bg-white">
                  <DitaNode node={content} />
                </div>
              </details>
            ))}
          </div>
        );
      }
      return <div className="space-y-3">{renderChildren(children)}</div>;

    case 'table':
      return <DitaTable el={el} />;

    // tgroup/thead/tbody/row/entry/colspec — handled by DitaTable, skip if encountered standalone
    case 'tgroup':
    case 'thead':
    case 'tbody':
    case 'row':
    case 'entry':
    case 'colspec':
      return <>{renderChildren(children)}</>;

    case 'fig':
      return <figure className="my-4">{renderChildren(children)}</figure>;

    case 'image': {
      const src = attrs.src as string | undefined;
      const width = attrs.width as number | undefined;
      if (!src) return null;
      const base = process.env.NEXT_PUBLIC_CDN_BASE_URL?.replace(/\/$/, '') ?? '';
      const fullSrc = src.startsWith('http') ? src : `${base}/${src}`;
      const altEl = children.find((c) => typeof c === 'object' && 'alt' in (c as object));
      const altText = altEl ? extractText(altEl) : '';
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fullSrc}
          alt={altText}
          className={`rounded max-w-full ${outputclass === 'float' ? 'float-right ml-4 mb-2' : 'my-2'}`}
          style={width ? { width } : undefined}
        />
      );
    }

    case 'xref': {
      const href = (attrs.href as string | undefined) ?? '#';
      const isExternal = href.startsWith('http');
      const linkContent = children.length > 0 ? renderChildren(children) : href;
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-[var(--brand-accent)] underline hover:opacity-80"
        >
          {linkContent}
          {isExternal && <span className="ml-0.5 text-xs">↗</span>}
        </a>
      );
    }

    case 'object': {
      const data = attrs.data as string | undefined;
      if (!data) return null;
      const file = data.split('/').pop() ?? '';
      return (
        <video
          controls
          preload="auto"
          className="my-4 max-w-full rounded"
          style={{ maxWidth: '80%' }}
        >
          <source src={data} type="video/mp4" />
          {file}
        </video>
      );
    }

    // ── Inline elements ─────────────────────────────────────────────────────
    case 'span':
      if (typeof raw === 'string') return <>{raw}</>;
      return <span>{renderChildren(children)}</span>;

    case 'i':
      return <em>{renderChildren(children)}</em>;

    case 'b':
      return <strong>{renderChildren(children)}</strong>;

    case 'ph':
      // ph children are icon identifier strings — not display text, skip
      return null;

    default:
      return <>{renderChildren(children)}</>;
  }
}

export default function DitaRenderer({ body }: { body: Record<string, unknown> }) {
  const children = (body.children as DitaChild[]) ?? [];
  return (
    <div className="space-y-4">
      {children.map((child, i) => (
        <DitaNode key={i} node={child} />
      ))}
    </div>
  );
}
