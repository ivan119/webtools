import Image from "next/image";
import { getBySlug } from "../../../controllers/gallery";

type Params = { params: { slug: string } };

export default async function WorkDetail({ params }: Params) {
  const item = await getBySlug(params.slug);
  if (!item) return <div className="p-8">Not found</div>;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl sm:text-4xl font-semibold mb-6">{item.alt}</h1>
      <div className="rounded-lg overflow-hidden border border-white/10">
        <Image
          src={item.src}
          alt={item.alt}
          width={item.width}
          height={item.height}
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
        />
      </div>
    </div>
  );
}
