import { sizeList } from "../constants/avatarSize";
import { cn } from "../helper/tailwindMergeClass.helper";

interface AvatarType {
  name?: string;
  size?: sizeList;
}

function Avatar({ name, size = sizeList.default }: AvatarType) {
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
            "size-20 text-3xl": size === sizeList.large,
          }
        )}
      >
        {name?.length ? name[0] : "-"}
      </div>
    </div>
  );
}

export default Avatar;
