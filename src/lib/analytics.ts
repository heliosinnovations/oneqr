import { posthog } from './posthog';

/**
 * Analytics event tracking utilities for PostHog
 */

export const trackEvent = {
  // QR Generation Events
  qrGenerated: (type: 'simple' | 'advanced' | 'bulk') => {
    posthog.capture('qr_generated', { type });
  },

  qrDownloaded: (format: 'png' | 'svg', type: 'simple' | 'advanced' | 'bulk') => {
    posthog.capture('qr_downloaded', { format, type });
  },

  qrPrinted: (type: 'simple' | 'advanced' | 'bulk') => {
    posthog.capture('qr_printed', { type });
  },

  qrCopied: (type: 'simple' | 'advanced' | 'bulk') => {
    posthog.capture('qr_copied', { type });
  },

  // QR Save Events
  qrSaved: (type: 'simple' | 'advanced') => {
    posthog.capture('qr_code_saved', { type });
  },

  // Dashboard Events
  dashboardViewed: () => {
    posthog.capture('dashboard_viewed');
  },

  // Share Events
  shareLinkCopied: (qrId?: string) => {
    posthog.capture('share_link_copied', { qr_id: qrId });
  },

  // User Interaction Events
  moreButtonClicked: (section: string) => {
    posthog.capture('more_button_clicked', { section });
  },

  featureExpanded: (feature: string) => {
    posthog.capture('feature_expanded', { feature });
  },

  // Navigation Events
  advancedGeneratorOpened: () => {
    posthog.capture('advanced_generator_opened');
  },

  bulkGeneratorOpened: () => {
    posthog.capture('bulk_generator_opened');
  },

  // Customization Events
  colorChanged: (element: 'foreground' | 'background' | 'corner' | 'dot') => {
    posthog.capture('qr_color_changed', { element });
  },

  patternChanged: (pattern: string) => {
    posthog.capture('qr_pattern_changed', { pattern });
  },

  logoUploaded: () => {
    posthog.capture('qr_logo_uploaded');
  },

  // Bulk Generation Events
  bulkFileUploaded: (fileType: 'csv' | 'xlsx', rowCount: number) => {
    posthog.capture('bulk_file_uploaded', { fileType, rowCount });
  },

  bulkQRsGenerated: (count: number) => {
    posthog.capture('bulk_qrs_generated', { count });
  },

  bulkDownloaded: (format: 'zip' | 'pdf', count: number) => {
    posthog.capture('bulk_downloaded', { format, count });
  },

  // Comparison Section Events
  comparisonViewed: () => {
    posthog.capture('comparison_viewed');
  },

  // Error Events
  error: (errorType: string, errorMessage: string) => {
    posthog.capture('error', { errorType, errorMessage });
  },

  // User Events
  identifyUser: (userId: string, traits?: Record<string, any>) => {
    posthog.identify(userId, traits);
  },

  resetUser: () => {
    posthog.reset();
  },
};
