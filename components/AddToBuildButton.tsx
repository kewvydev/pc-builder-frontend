'use client';

import { BuildItemInput, BuildSlot, useAddToBuild } from '@/lib/buildStore';

type Props = {
  item: BuildItemInput;
  defaultSlot: BuildSlot;
  className?: string;
};

export default function AddToBuildButton({ item, defaultSlot, className }: Props) {
  const { addToBuild } = useAddToBuild(defaultSlot);

  return (
    <button
      onClick={() => addToBuild(item)}
      type="button"
      className={`px-4 py-2 rounded-lg font-semibold border-2 border-[#302F2C] text-[#302F2C] hover:bg-[#302F2C]/5 transition ${className || ''}`}
    >
      Add to build
    </button>
  );
}

