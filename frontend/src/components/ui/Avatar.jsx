import { getInitials, getAvatarColor } from "../../lib/utils";

export default function Avatar({ user, size = 'md' }) {
  const sizeMap = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' }
  return (
    <div
      title={user?.fullName}
      className={`${sizeMap[size]} ${getAvatarColor(user?.id)} rounded-full flex items-center justify-center
                  font-semibold text-white flex-shrink-0 select-none`}
    >
      {getInitials(user?.fullName)}
    </div>
  )
}