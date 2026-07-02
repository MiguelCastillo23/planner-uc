import { defineConfig } from 'cypress';
import cypressMochawesomeReporterPlugin from 'cypress-mochawesome-reporter/plugin.js';

export default defineConfig({
  allowCypressEnv: false,
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    charts: true,
    reportPageTitle: 'Planner-UC Acceptance Tests Report',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  e2e: {
    baseUrl: 'http://localhost:5173',
    video: true,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      cypressMochawesomeReporterPlugin(on, config);
      return config;
    },
  },
});
