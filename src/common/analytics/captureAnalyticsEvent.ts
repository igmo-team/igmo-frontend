import posthogClient from './posthogClient';

type AnalyticsPropertyValue = string | number | boolean | null | undefined;

export type AnalyticsProperties = Record<string, AnalyticsPropertyValue>;

type NetworkInformation = {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation;
};

export function captureAnalyticsEvent(
  eventName: string,
  properties: AnalyticsProperties = {},
) {
  try {
    posthogClient.capture(eventName, {
      environment: import.meta.env.MODE,
      current_url: window.location.href,
      ...getNetworkProperties(),
      ...removeUndefinedProperties(properties),
    });
  } catch (error) {
    console.warn('[analytics] failed to capture event', eventName, error);
  }
}

function getNetworkProperties(): AnalyticsProperties {
  const connection = (navigator as NavigatorWithConnection).connection;

  if (!connection) {
    return {};
  }

  return removeUndefinedProperties({
    network_effective_type: connection.effectiveType,
    network_downlink_mbps: connection.downlink,
    network_rtt_ms: connection.rtt,
    network_save_data: connection.saveData,
  });
}

function removeUndefinedProperties(properties: AnalyticsProperties) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  );
}
