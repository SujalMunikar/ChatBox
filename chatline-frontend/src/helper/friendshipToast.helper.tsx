import toast from "react-hot-toast";

// Shared styling so toast variants stay consistent with one another.
const baseToastClass =
  "pointer-events-auto w-80 cursor-pointer rounded-md border bg-white/95 p-4 text-sm shadow-lg transition-all duration-200";

// Renders a 6s toast highlighting who removed the current user.
export const showFriendRemovedToast = (
  byName: string,
  byEmail: string
) => {
  toast.custom(
    (t) => (
      <div
        className={`${baseToastClass} border-rose-400 ${
          t.visible ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
        }`}
        onClick={() => toast.dismiss(t.id)}
      >
        <p className="mb-1 font-semibold text-rose-600">Friendship update</p>
        <p className="font-medium text-slate-900">{byName} unfollowed you</p>
        <p className="mt-1 text-xs text-slate-600">
          Contact: <span className="font-semibold">{byEmail}</span>
        </p>
      </div>
    ),
    {
      duration: 6000,
      position: "bottom-right",
    }
  );
};

// Toast when your outgoing request is accepted, triggered both live and on next login.
export const showFriendAcceptedToast = (
  friendName: string,
  friendEmail: string
) => {
  toast.custom(
    (t) => (
      <div
        className={`${baseToastClass} border-emerald-400 ${
          t.visible ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
        }`}
        onClick={() => toast.dismiss(t.id)}
      >
        <p className="mb-1 font-semibold text-emerald-600">Friend added</p>
        <p className="font-medium text-slate-900">
          You and {friendName} are now friends.
        </p>
        <p className="mt-1 text-xs text-slate-600">
          Contact: <span className="font-semibold">{friendEmail}</span>
        </p>
      </div>
    ),
    {
      duration: 6000,
      position: "bottom-right",
    }
  );
};
