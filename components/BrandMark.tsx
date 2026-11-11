import Image from "next/image";

// official logo from blueprintsforpangaea.org, cropped. it has a white background, so it sits on a white strip
export function BrandLogo() {
  return (
    <div className="bg-white px-5 pb-3 pt-4">
      <Image src="/brand/b4p-logo.png" alt="Blueprints for Pangaea" width={520} height={308} priority className="h-auto w-[150px]" />
    </div>
  );
}
