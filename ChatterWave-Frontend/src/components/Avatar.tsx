import { sizeList } from "../constants/avatarSize";
import { cn } from "../helper/tailwindMergeClass.helper";

interface AvatarType {
  name?: string;
  size?: sizeList;
  image?: string | null;
}

function Avatar({ name, size = sizeList.default, image }: AvatarType) {
  return (
    <div
      className={cn(
        " rounded-full uppercase p-1 bg-custom-gradient grid place-items-center justify-center text-[16px] leading-[16px] text-primary-text-color "
      )}
    >
      <div
        className={cn(
          " rounded-full uppercase  bg-secondary-bg-color grid place-items-center ",
          {
            "size-8": size === sizeList.default,
            "size-10 text-sm": size === sizeList.small,
            "size-14 text-base": size === sizeList.medium,
            "size-20 text-3xl": size === sizeList.large,
          }
        )}
      >
        {image ? (
          <img className="w-full h-full object-cover rounded-full" src={image} alt={name ?? "profile"} />
        ) : (
          <span>{name?.length ? name[0] : "-"}</span>
        )}
      </div>
    </div>
  );
}

export default Avatar;
