import type { Request } from "express";

export type DeviceInfo = {
  browser: string;
  os: string;
};

const UNKNOWN_DEVICE: DeviceInfo = {
  browser: "Unknown",
  os: "Unknown",
};

const detectBrowser = (userAgent: string): string => {
  if (/Edg\//i.test(userAgent)) return "Edge";
  if (/OPR\//i.test(userAgent)) return "Opera";
  if (/Chrome\//i.test(userAgent) && !/Chromium/i.test(userAgent)) {
    return "Chrome";
  }
  if (/Firefox\//i.test(userAgent)) return "Firefox";
  if (/Safari\//i.test(userAgent) && /Version\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) {
    return "Safari";
  }
  if (/MSIE\s|Trident\//i.test(userAgent)) return "Internet Explorer";
  if (/curl\//i.test(userAgent)) return "curl";
  if (/PostmanRuntime\//i.test(userAgent)) return "PostmanRuntime";
  return "Unknown";
};

const detectOS = (userAgent: string): string => {
  if (/Windows NT/i.test(userAgent)) return "Windows";
  if (/Android/i.test(userAgent)) return "Android";
  if (/(iPhone|iPad|iPod)/i.test(userAgent)) return "iOS";
  if (/Mac OS X/i.test(userAgent)) return "macOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  return "Unknown";
};

export const detectDevice = (userAgent?: string | null): DeviceInfo => {
  if (!userAgent) return UNKNOWN_DEVICE;

  return {
    browser: detectBrowser(userAgent),
    os: detectOS(userAgent),
  };
};

export const getUserAgent = (req: Request): string => {
  const header = req.headers["user-agent"];
  if (Array.isArray(header)) return header[0] ?? "";
  return header ?? "";
};

export const detectDeviceFromRequest = (req: Request): DeviceInfo => detectDevice(getUserAgent(req));
