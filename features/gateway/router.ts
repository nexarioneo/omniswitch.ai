import { getModelByName, type ProviderModel } from "../data/models";
import { getProviderById, type Provider } from "../data/providers";

export interface RouteResult {
  provider: Provider;
  model: ProviderModel;
}

export function routeModel(modelName: string): RouteResult | null {
  const model = getModelByName(modelName);
  if (!model) return null;

  const provider = getProviderById(model.provider_id);
  if (!provider || !provider.is_active) return null;

  return { provider, model };
}
