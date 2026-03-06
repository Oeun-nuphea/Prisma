import type { Request } from "express";

export type DeviceType = "mobile" | "tablet" | "desktop" | "bot" | "unknown";

export type DeviceInfo = {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: DeviceType;
  rawUserAgent: string;
};

const UNKNOWN_DEVICE: DeviceInfo = {
  browser: "Unknown",
  browserVersion: "",
  os: "Unknown",
  osVersion: "",
  deviceType: "unknown",
  rawUserAgent: "",
};

const readMatch = (userAgent: string, regex: RegExp): string =>
  userAgent.match(regex)?.[1] ?? "";

const detectBrowser = (userAgent: string): Pick<DeviceInfo, "browser" | "browserVersion"> => {
  if (/Edg\//i.test(userAgent)) {
    return { browser: "Edge", browserVersion: readMatch(userAgent, /Edg\/([\d.]+)/i) };
  }
  if (/OPR\//i.test(userAgent)) {
    return { browser: "Opera", browserVersion: readMatch(userAgent, /OPR\/([\d.]+)/i) };
  }
  if (/Chrome\//i.test(userAgent) && !/Chromium/i.test(userAgent)) {
    return { browser: "Chrome", browserVersion: readMatch(userAgent, /Chrome\/([\d.]+)/i) };
  }
  if (/Firefox\//i.test(userAgent)) {
    return { browser: "Firefox", browserVersion: readMatch(userAgent, /Firefox\/([\d.]+)/i) };
  }
  if (/Safari\//i.test(userAgent) && /Version\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) {
    return { browser: "Safari", browserVersion: readMatch(userAgent, /Version\/([\d.]+)/i) };
  }
  if (/MSIE\s|Trident\//i.test(userAgent)) {
    const version =
      readMatch(userAgent, /MSIE\s([\d.]+)/i) || readMatch(userAgent, /rv:([\d.]+)/i);
    return { browser: "Internet Explorer", browserVersion: version };
  }
  if (/curl\//i.test(userAgent)) {
    return { browser: "curl", browserVersion: readMatch(userAgent, /curl\/([\d.]+)/i) };
  }
  if (/PostmanRuntime\//i.test(userAgent)) {
    return {
      browser: "PostmanRuntime",
      browserVersion: readMatch(userAgent, /PostmanRuntime\/([\d.]+)/i),
    };
  }
  return { browser: "Unknown", browserVersion: "" };
};

const detectOS = (userAgent: string): Pick<DeviceInfo, "os" | "osVersion"> => {
  if (/Windows NT/i.test(userAgent)) {
    return { os: "Windows", osVersion: readMatch(userAgent, /Windows NT ([\d.]+)/i) };
  }
  if (/Android/i.test(userAgent)) {
    return { os: "Android", osVersion: readMatch(userAgent, /Android ([\d.]+)/i) };
  }
  if (/(iPhone|iPad|iPod)/i.test(userAgent)) {
    return {
      os: "iOS",
      osVersion: readMatch(userAgent, /OS ([\d_]+)/i).replace(/_/g, "."),
    };
  }
  if (/Mac OS X/i.test(userAgent)) {
    return {
      os: "macOS",
      osVersion: readMatch(userAgent, /Mac OS X ([\d_]+)/i).replace(/_/g, "."),
    };
  }
  if (/Linux/i.test(userAgent)) {
    return { os: "Linux", osVersion: "" };
  }
  return { os: "Unknown", osVersion: "" };
};

const detectDeviceType = (userAgent: string): DeviceType => {
  if (/bot|crawl|spider|slurp|bingpreview|headless/i.test(userAgent)) {
    return "bot";
  }
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return "tablet";
  }
  if (/mobile|iphone|ipod|android/i.test(userAgent)) {
    return "mobile";
  }
  if (userAgent.trim()) {
    return "desktop";
  }
  return "unknown";
};

export const detectDevice = (userAgent?: string | null): DeviceInfo => {
  if (!userAgent) return UNKNOWN_DEVICE;

  const browser = detectBrowser(userAgent);
  const os = detectOS(userAgent);
  const deviceType = detectDeviceType(userAgent);

  return {
    ...browser,
    ...os,
    deviceType,
    rawUserAgent: userAgent,
  };
};

export const getUserAgent = (req: Request): string => {
  const header = req.headers["user-agent"];
  if (Array.isArray(header)) return header[0] ?? "";
  return header ?? "";
};

export const detectDeviceFromRequest = (req: Request): DeviceInfo => detectDevice(getUserAgent(req));
