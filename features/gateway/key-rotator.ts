import { listProviderKeys, incrementProviderKeyUsage, type ProviderKey } from "../data/providers";

export function selectProviderKey(providerId: number): ProviderKey | null {
  const keys = listProviderKeys(providerId).filter((k) => k.status === "active");
  if (keys.length === 0) return null;

  const strategy = keys[0].rotation_strategy || "round_robin";

  let selected: ProviderKey;

  switch (strategy) {
    case "random":
      selected = keys[Math.floor(Math.random() * keys.length)];
      break;
    case "sequential":
      selected = keys[0];
      break;
    case "round_robin":
    default:
      selected = keys.reduce((oldest, k) => {
        if (!k.last_used_at) return k;
        if (!oldest.last_used_at) return oldest;
        return k.last_used_at < oldest.last_used_at ? k : oldest;
      }, keys[0]);
      break;
  }

  incrementProviderKeyUsage(selected.id);
  return selected;
}
