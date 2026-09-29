import { getImage } from 'astro:assets';
import portrait from '../../assets/portrait-1.jpg';
import { site } from '../site';
import { absolute } from './url';

export type Thing = Record<string, unknown>;

export const ids = {
  person: absolute('/#person'),
  website: absolute('/#website'),
};

const person = { '@id': ids.person };

export async function base(): Promise<Thing[]> {
  const image = await getImage({ src: portrait, width: 800, format: 'jpg' });
  return [
    {
      '@type': 'WebSite',
      '@id': ids.website,
      url: absolute('/'),
      name: site.name,
      description: site.description,
      inLanguage: 'en',
      author: person,
      publisher: person,
    },
    {
      '@type': 'Person',
      '@id': ids.person,
      name: site.name,
      givenName: 'Arjun',
      familyName: 'Krishna',
      alternateName: site.handle,
      url: absolute('/'),
      image: new URL(image.src, absolute('/')).href,
      email: `mailto:${site.email}`,
      description: site.summary,
      jobTitle: site.jobTitle,
      hasOccupation: {
        '@type': 'Occupation',
        name: 'Software Engineer',
        occupationLocation: { '@type': 'State', name: 'Kerala' },
        skills: site.topics.join(', '),
      },
      worksFor: { '@type': 'Organization', ...site.employer },
      affiliation: { '@type': 'Organization', ...site.community },
      alumniOf: { '@type': 'CollegeOrUniversity', name: site.college },
      homeLocation: {
        '@type': 'Place',
        address: { '@type': 'PostalAddress', addressRegion: 'Kerala', addressCountry: 'IN' },
      },
      knowsAbout: site.topics,
      nationality: { '@type': 'Country', name: 'India' },
      knowsLanguage: 'en',
      sameAs: [...site.profiles, ...site.elsewhere].map((profile) => profile.url),
    },
  ];
}

export const page = (type: string, path: string, name: string, description: string, extra: Thing = {}): Thing => ({
  '@type': type,
  '@id': absolute(path),
  url: absolute(path),
  name,
  description,
  inLanguage: 'en',
  isPartOf: { '@id': ids.website },
  about: person,
  ...extra,
});

export const breadcrumbs = (path: string, name: string): Thing => ({
  '@type': 'BreadcrumbList',
  '@id': absolute(`${path}#breadcrumbs`),
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: absolute('/') },
    { '@type': 'ListItem', position: 2, name, item: absolute(path) },
  ],
});

export const itemList = (items: Thing[]): Thing => ({
  '@type': 'ItemList',
  numberOfItems: items.length,
  itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, item })),
});

export const author = person;
