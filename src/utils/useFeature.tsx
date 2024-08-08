export const isNil = (val?: string | null): boolean => val === undefined || val === null;

export const getBoolVal = (val?: string | boolean | null): boolean => {
  if (typeof val === "string") {
    return val === "true";
  }

  return !!val;
};

export const getFeatureFlag = (name: string, envVar?: string, enabled = false): boolean => {
  const urlSearchParams = global.window && new URLSearchParams(global.window.location.search);
  const urlParam = urlSearchParams ? urlSearchParams.get(name) : null;

  if (!isNil(urlParam)) {
    return getBoolVal(urlParam);
  }

  if (!isNil(envVar)) {
    return getBoolVal(envVar);
  }

  return !!enabled;
};
