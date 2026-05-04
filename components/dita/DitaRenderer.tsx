/**
 * Recursive DITA JSON → React renderer.
 *
 * Handles standard block/inline elements and the SHRM widget annotations:
 *   widget(hero)           → styled "Competency Connection" section wrapper
 *   widget(hero_banner)    → blue competency header with subtitle + related list
 *   widget(hero_icon_list) → related competency pill list
 *   widget(hero_content)   → scenario story (image + paragraphs)
 *
 * Props on ph elements contain icon identifiers, not display text — they are skipped.
 */

type DitaChild = string | Record<string, unknown>;
type DitaElement = { children?: DitaChild[]; attributes?: Record<string, unknown> };

function widget(attrs: Record<string, unknown> | undefined): string | null {
  const props = attrs?.props as string | undefined;
  if (!props) return null;
  const m = props.match(/widget\(([^)]+)\)/);
  return m ? m[1] : null;
}

function renderChildren(children: DitaChild[]) {
  return children.map((child, i) => <DitaNode key={i} node={child} />);
}

function DitaNode({ node }: { node: DitaChild }) {
  if (typeof node === 'string') return <>{node}</>;

  const entries = Object.entries(node as Record<string, unknown>);
  if (!entries.length) return null;
  const [type, raw] = entries[0];
  if (!raw || typeof raw !== 'object') return null;

  const el = raw as DitaElement;
  const attrs = el.attributes ?? {};
  const children = el.children ?? [];
  const w = widget(attrs);

  switch (type) {
    // ── Block elements ──────────────────────────────────────────────────────
    case 'p': {
      const outputclass = attrs.outputclass as string | undefined;
      if (outputclass === 'competency_subtitle') {
        return (
          <p className="text-lg font-semibold text-[var(--brand-accent-dark)]">
            {renderChildren(children)}
          </p>
        );
      }
      return (
        <p className="text-gray-700 leading-relaxed">
          {renderChildren(children)}
        </p>
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
      return (
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {renderChildren(children)}
        </ul>
      );

    case 'li': {
      // hero_icon_list items: skip the ph (icon identifier), render the span label
      const isIconItem = children.some(
        (c) => typeof c === 'object' && 'p' in (c as object),
      );
      if (isIconItem) {
        // Each li > p > [ph, span] — render as a pill, text only
        const label = children
          .flatMap((c) => {
            if (typeof c !== 'object') return [];
            const p = (c as Record<string, unknown>).p as DitaElement | undefined;
            if (!p) return [];
            return (p.children ?? []).filter(
              (pc) => typeof pc === 'object' && 'span' in (pc as object),
            );
          })
          .map((spanNode, i) => {
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
      return <li>{renderChildren(children)}</li>;
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
      return <div className="space-y-3">{renderChildren(children)}</div>;

    case 'fig':
      return <figure className="my-4">{renderChildren(children)}</figure>;

    case 'image': {
      const src = attrs.src as string | undefined;
      const width = attrs.width as number | undefined;
      const outputclass = attrs.outputclass as string | undefined;
      if (!src) return null;
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className={`rounded max-w-full ${outputclass === 'float' ? 'float-right ml-4 mb-2' : ''}`}
          style={width ? { width } : undefined}
        />
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

    // ── Ignored elements ────────────────────────────────────────────────────
    case 'alt':
    case 'keywords':
    case 'keyword':
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
