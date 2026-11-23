import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data';

type SidebarEntry = StarlightRouteData['sidebar'][number];

function makeMobileSpaceLink(label: string, href: string): SidebarEntry {
  return {
    type: 'link',
    label,
    href,
    isCurrent: false,
    badge: undefined,
    attrs: { class: 'cimbology-mobile-space-link' },
  };
}

export const onRequest = defineRouteMiddleware(async (context, next) => {
  await next();

  const { starlightRoute } = context.locals;
  const id = starlightRoute.id ?? '';

  const isBlog = id === 'blog' || id.startsWith('blog/');
  const isCim = id === 'cim' || id.startsWith('cim/');

  if (isBlog) {
    // Keep starlight-blog's own focused sidebar; add mobile-only switchers to other spaces.
    starlightRoute.sidebar.unshift(
      makeMobileSpaceLink('Research', '/research/cimbology-kg/'),
      makeMobileSpaceLink('CIM100 Explorer', '/cim/'),
      makeMobileSpaceLink('About', '/about/'),
    );
    return;
  }

  const researchGroup = starlightRoute.sidebar.find(
    (entry) => entry.type === 'group' && entry.label === 'Research',
  );
  const cimGroup = starlightRoute.sidebar.find(
    (entry) => entry.type === 'group' && entry.label === 'CIM100 & Ontology Explorer',
  );

  if (isCim) {
    // Standalone CIM100 & Ontology Explorer space: show only the CIM reference tree.
    const cimEntries: SidebarEntry[] =
      cimGroup && cimGroup.type === 'group' ? [...cimGroup.entries] : [];

    starlightRoute.sidebar = [
      makeMobileSpaceLink('Research', '/research/cimbology-kg/'),
      makeMobileSpaceLink('Blog', '/blog/'),
      makeMobileSpaceLink('About', '/about/'),
      ...cimEntries,
    ];

    // Prevent prev/next pagination from crossing out of /cim/ into /research/ or /about/.
    if (starlightRoute.pagination.prev && !starlightRoute.pagination.prev.href.startsWith('/cim/')) {
      starlightRoute.pagination.prev = undefined;
    }
    if (starlightRoute.pagination.next && !starlightRoute.pagination.next.href.startsWith('/cim/')) {
      starlightRoute.pagination.next = undefined;
    }
  } else {
    // Research & About space: show only Research pages (no 77-package CIM tree clutter).
    const researchEntries: SidebarEntry[] =
      researchGroup && researchGroup.type === 'group' ? [researchGroup] : [];

    starlightRoute.sidebar = [
      makeMobileSpaceLink('Blog', '/blog/'),
      makeMobileSpaceLink('CIM100 Explorer', '/cim/'),
      ...researchEntries,
    ];

    // Prevent prev/next pagination from crossing into /cim/.
    if (starlightRoute.pagination.prev && starlightRoute.pagination.prev.href.startsWith('/cim/')) {
      starlightRoute.pagination.prev = undefined;
    }
    if (starlightRoute.pagination.next && starlightRoute.pagination.next.href.startsWith('/cim/')) {
      starlightRoute.pagination.next = undefined;
    }
  }
});
