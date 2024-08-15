import { getCollection } from "astro:content";
import { OGImageRoute } from "astro-og-canvas";

const collectionEntries = await getCollection("docs");
const pages = Object.fromEntries(
  collectionEntries.map(({ slug, data }) => [slug, data])
);

export const { getStaticPaths, GET } = OGImageRoute({
  param: "route",
  pages,
  getImageOptions: (_, page) => ({
    title: page.title,
    description: page.description,
    logo: {
      path: "./src/assets/images/exite-og.png",
    },
  }),
});
