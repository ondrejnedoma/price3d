import { mdiChevronDown } from "@mdi/js";
import Icon from "@mdi/react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

export default function Menu({ children, value, onChange, options }) {
  const [opened, setOpened] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpened(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div ref={menuRef} className="relative w-full">
      <button
        onClick={() => setOpened(!opened)}
        className={clsx(
          "flex w-full cursor-pointer flex-row items-center justify-between rounded-lg px-3 py-2 transition-all duration-300",
          opened ? "ring-2 ring-blue-500" : "ring ring-neutral-400",
        )}
      >
        {value}
        <div
          className={clsx(
            "transition-all duration-300",
            opened ? "rotate-180" : "rotate-0",
          )}
        >
          <Icon path={mdiChevronDown} size={1} />
        </div>
      </button>
      <label
        className={clsx(
          "absolute -top-2 left-2.5 origin-left transform cursor-text bg-neutral-50 px-1 text-xs transition-all dark:bg-neutral-900",
          opened ? "text-blue-500" : "text-neutral-400",
        )}
      >
        {children}
      </label>
      {opened ? (
        <ul
          layout
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          className="no-scrollbar absolute z-10 mt-1.5 w-full overflow-auto rounded-lg border border-neutral-400 bg-neutral-50 focus:outline-none dark:bg-neutral-900"
        >
          {options.map((option) => (
            <li
              key={option}
              onClick={() => {
                setOpened(false);
                onChange(option);
              }}
              className="w-full cursor-pointer items-center rounded-md p-3 transition-all duration-300 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              {option}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
