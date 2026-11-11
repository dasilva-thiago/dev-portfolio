import { useT } from "~/shared/i18n/useT";
import { SEDUC_GALLERY } from "../model/experience";

const FRAME = "relative m-0 overflow-hidden rounded-xl border border-line bg-surface";
const IMAGE = "block size-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none";

// Mosaic for the current role: the eduAssets banner across the top and the three portrait photos taken at the
// school below it, each cropped to the same 3:4 box with a short caption.
export function ExperienceGallery({ className = "" }: { className?: string }) {
  const { t } = useT();
  const { banner, photos } = SEDUC_GALLERY;

  return (
    <div className={`grid grid-cols-3 gap-2.5 max-bp480:gap-2 ${className}`}>
      <figure className={`${FRAME} group col-span-3 aspect-[16/7]`}>
        <img
          src={banner.src}
          alt={t("experience.seduc.gallery.banner")}
          width={banner.width}
          height={banner.height}
          loading="lazy"
          decoding="async"
          className={IMAGE}
        />
      </figure>
      {photos.map((photo) => (
        <figure key={photo.key} className={`${FRAME} group aspect-[3/4]`}>
          <img
            src={photo.src}
            alt={t(`experience.seduc.gallery.${photo.key}`)}
            width={photo.width}
            height={photo.height}
            loading="lazy"
            decoding="async"
            className={`${IMAGE} ${photo.position}`}
          />
          <figcaption
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.72),transparent)] px-2.5 pb-2 pt-6 text-[11.5px] font-semibold leading-tight text-white max-bp480:px-1.5 max-bp480:text-[10px] hc:bg-black"
          >
            {t(`experience.seduc.captions.${photo.key}`)}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
