# AlertFlow 🚨

[![npm version](https://img.shields.io/npm/v/alertflow.svg)](https://www.npmjs.com/package/alertflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js Version](https://img.shields.io/node/v/alertflow.svg)](https://nodejs.org/)
[![Downloads](https://img.shields.io/npm/dm/alertflow.svg)](https://www.npmjs.com/package/alertflow)
[![Build Status](https://img.shields.io/github/actions/workflow/status/alertflow/alertflow/ci.yml)](https://github.com/alertflow/alertflow/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> A lightweight, extensible alert management system for Node.js applications. Send alerts across multiple channels with severity-based routing and flexible handlers.

---

## Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Usage Examples](#-usage-examples)
  - [Basic Usage](#basic-usage)
  - [Multiple Handlers](#multiple-handlers)
  - [Email Channel](#email-channel)
  - [Slack Integration](#slack-integration)
  - [SMS Notifications](#sms-notifications)
  - [Muting Alerts](#muting-alerts)
  - [Filtering by Severity](#filtering-by-severity)
  - [Error Handling](#error-handling)
- [API Reference](#-api-reference)
  - [AlertFlow Class](#alertflow-class)
  - [Severity Levels](#severity-levels)
  - [AlertHandler Type](#alerthandler-type)
- [Advanced Configuration](#-advanced-configuration)
- [Best Practices](#-best-practices)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Features

- **🔔 Multi-Channel Support** - Send alerts via Email, Slack, SMS, Webhooks, and more
- **🚨 Severity Levels** - Categorize alerts as `info`, `warning`, or `critical`
- **🔕 Alert Muting** - Temporarily silence alerts during maintenance windows
- **🧩 Extensible Architecture** - Add custom handlers for any notification channel
- **📦 Lightweight** - Zero dependencies, under 2KB gzipped
- **⚡ TypeScript First** - Full TypeScript support with type definitions
- **🌐 ES Modules** - Native ESM support for modern JavaScript
- **🔄 Async Handlers** - Built-in support for async notification handlers
- **📊 Structured Logging** - Consistent alert format across all channels
- **🎛️ Filtering** - Route alerts based on severity level

---

## 📦 Installation

```bash
# Using npm
npm install alertflow

# Using yarn
yarn add alertflow

# Using pnpm
pnpm add alertflow
```

### Requirements

- Node.js 18.0.0 or higher
- TypeScript 5.0+ (optional, but recommended)

---

## ⚡ Quick Start

```typescript
import { AlertFlow } from 'alertflow';

// Initialize AlertFlow
const alerts = new AlertFlow();

// Add a console handler
alerts.addHandler((alert) => {
  console.log(`[${alert.severity.toUpperCase()}] ${alert.message}`);
});

// Send alerts
alerts.alert('info', 'Application started successfully');
alerts.alert('warning', 'High memory usage detected: 85%');
alerts.alert('critical', 'Database connection failed!');
```

**Output:**
```
[INFO] Application started successfully
[WARNING] High memory usage detected: 85%
[CRITICAL] Database connection failed!
```

---

## 📖 Usage Examples

### Basic Usage

The simplest way to use AlertFlow is to create an instance and add handlers:

```typescript
import { AlertFlow } from 'alertflow';

const alertFlow = new AlertFlow();

// Add a simple console logger
alertFlow.addHandler((alert) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${alert.severity.toUpperCase()}] ${alert.message}`);
});

// Fire some alerts
alertFlow.alert('info', 'Server started on port 3000');
alertFlow.alert('warning', 'Disk space running low: 10% remaining');
alertFlow.alert('critical', 'Payment service unavailable');
```

### Multiple Handlers

AlertFlow supports multiple handlers, allowing you to send the same alert to different channels:

```typescript
import { AlertFlow } from 'alertflow';

const alertFlow = new AlertFlow();

// Console handler
alertFlow.addHandler((alert) => {
  console.log(`[${alert.severity}] ${alert.message}`);
});

// File handler (example)
alertFlow.addHandler(async (alert) => {
  const fs = await import('fs/promises');
  const logEntry = `${new Date().toISOString()} [${alert.severity}] ${alert.message}\n`;
  await fs.appendFile('alerts.log', logEntry);
});

// Email handler (example)
alertFlow.addHandler(async (alert) => {
  if (alert.severity === 'critical') {
    await sendEmail({
      to: 'ops-team@company.com',
      subject: `Critical Alert: ${alert.message}`,
      body: alert.message
    });
  }
});

// Slack handler (example)
alertFlow.addHandler(async (alert) => {
  if (alert.severity === 'critical' || alert.severity === 'warning') {
    await postToSlack({
      channel: '#alerts',
      message: `*[${alert.severity.toUpperCase()}]* ${alert.message}`
    });
  }
});

// Send an alert to all handlers
alertFlow.alert('critical', 'Production database is down!');
```

### Email Channel

Send alerts via email using your preferred email service:

```typescript
import { AlertFlow } from 'alertflow';
import nodemailer from 'nodemailer';

const alertFlow = new AlertFlow();

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email handler
alertFlow.addHandler(async (alert) => {
  const severityColors = {
    info: '#3498db',
    warning: '#f39c12',
    critical: '#e74c3c'
  };

  await transporter.sendMail({
    from: '"AlertFlow" <alerts@company.com>',
    to: 'team@company.com',
    subject: `[${alert.severity.toUpperCase()}] Alert Notification`,
    html: `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: ${severityColors[alert.severity as keyof typeof severityColors]}">
          ${alert.severity.toUpperCase()} Alert
        </h2>
        <p style="font-size: 16px;">${alert.message}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">
          Sent by AlertFlow at ${new Date().toISOString()}
        </p>
      </div>
    `
  });
});

alertFlow.alert('warning', 'SSL certificate expires in 7 days');
```

### Slack Integration

Send alerts directly to Slack channels:

```typescript
import { AlertFlow } from 'alertflow';

const alertFlow = new AlertFlow();

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

interface SlackMessage {
  text: string;
  attachments?: Array<{
    color: string;
    fields: Array<{ title: string; value: string; short: boolean }>;
    footer: string;
  }>;
}

const severityEmoji = {
  info: 'ℹ️',
  warning: '⚠️',
  critical: '🚨'
};

const severityColors = {
  info: '#36a64f',
  warning: '#ff9800',
  critical: '#dc3545'
};

alertFlow.addHandler(async (alert) => {
  const message: SlackMessage = {
    text: `${severityEmoji[alert.severity]} *${alert.severity.toUpperCase()}*`,
    attachments: [
      {
        color: severityColors[alert.severity],
        fields: [
          { title: 'Message', value: alert.message, short: false },
          { title: 'Time', value: new Date().toISOString(), short: true },
          { title: 'Environment', value: process.env.NODE_ENV || 'development', short: true }
        ],
        footer: 'AlertFlow'
      }
    ]
  };

  await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
});

alertFlow.alert('critical', 'API response time exceeded 5s threshold');
```

### SMS Notifications

Send SMS alerts for critical issues:

```typescript
import { AlertFlow } from 'alertflow';
import twilio from 'twilio';

const alertFlow = new AlertFlow();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const CRITICAL_PHONE_NUMBERS = [
  '+1234567890',  // On-call engineer
  '+0987654321'   // Engineering manager
];

alertFlow.addHandler(async (alert) => {
  // Only send SMS for critical alerts
  if (alert.severity !== 'critical') return;

  const message = `[AlertFlow] CRITICAL: ${alert.message}`;

  await Promise.all(
    CRITICAL_PHONE_NUMBERS.map(phone =>
      client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      })
    )
  );
});

alertFlow.alert('critical', 'All database replicas are unreachable');
```

### Muting Alerts

Temporarily silence alerts during maintenance windows:

```typescript
import { AlertFlow } from 'alertflow';

const alertFlow = new AlertFlow();

alertFlow.addHandler((alert) => {
  console.log(`[${alert.severity}] ${alert.message}`);
});

// Simulate maintenance window
console.log('Starting maintenance...');

// Mute all alerts
alertFlow.mute();

alertFlow.alert('warning', 'This should be muted');
alertFlow.alert('critical', 'This should also be muted'); // Won't be processed

// Unmute after maintenance
setTimeout(() => {
  alertFlow.unmute();
  console.log('Maintenance complete. Resuming alerts...');
  
  alertFlow.alert('info', 'System back online');
  // This will be processed
}, 5000);
```

You can also mute specific severity levels:

```typescript
// Only mute critical alerts
alertFlow.mute('critical');

// Later, unmute critical alerts
alertFlow.unmute('critical');
```

### Filtering by Severity

Filter handlers to only respond to specific severity levels:

```typescript
import { AlertFlow } from 'alertflow';

const alertFlow = new AlertFlow();

// Only process critical alerts
const criticalHandler: AlertHandler = (alert) => {
  if (alert.severity !== 'critical') return;
  sendPushNotification('CRITICAL ALERT: ' + alert.message);
};

// Only process warnings and critical
const urgentHandler: AlertHandler = (alert) => {
  if (alert.severity === 'info') return;
  sendToPagerDuty(alert);
};

// Process all alerts
const allHandler: AlertHandler = (alert) => {
  logToFile(alert);
};

alertFlow.addHandler(criticalHandler);
alertFlow.addHandler(urgentHandler);
alertFlow.addHandler(allHandler);
```

### Error Handling

Handle errors in your handlers gracefully:

```typescript
import { AlertFlow } from 'alertflow';

const alertFlow = new AlertFlow();

// Handler with error handling
alertFlow.addHandler(async (alert) => {
  try {
    await sendToExternalService(alert);
  } catch (error) {
    // Log the error but don't crash the application
    console.error(`Failed to send alert: ${error}`);
    
    // Optionally retry or queue for later
    await queueAlertForRetry(alert);
  }
});

// Handler for handler failures
alertFlow.onError((error, alert) => {
  console.error(`Handler error for alert "${alert.message}":`, error);
  
  // Send alert about the handler failure
  notifyDevOps(`Alert delivery failed: ${error.message}`);
});

// Safe alert sending - won't throw even if handlers fail
alertFlow.alert('warning', 'Cache miss rate increased');
```

---

## 📚 API Reference

### AlertFlow Class

#### Constructor

```typescript
new AlertFlow(options?: AlertFlowOptions)
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `muted` | `boolean` | `false` | Start with alerts muted |
| `defaultSeverity` | `Severity` | `'info'` | Default severity level |
| `handlers` | `AlertHandler[]` | `[]` | Initial handlers to register |

**Example:**
```typescript
const alertFlow = new AlertFlow({
  muted: false,
  defaultSeverity: 'info',
  handlers: [(alert) => console.log(alert)]
});
```

#### Methods

##### `addHandler(handler: AlertHandler): void`

Adds a new handler to process alerts.

```typescript
alertFlow.addHandler((alert) => {
  console.log(`[${alert.severity}] ${alert.message}`);
});
```

##### `alert(severity: Severity, message: string): void`

Sends an alert to all registered handlers.

```typescript
alertFlow.alert('critical', 'Database connection lost');
alertFlow.alert('warning', 'Memory usage above 80%');
alertFlow.alert('info', 'Scheduled backup completed');
```

##### `mute(severity?: Severity): void`

Mutes all alerts or alerts of a specific severity.

```typescript
// Mute all alerts
alertFlow.mute();

// Mute only critical alerts
alertFlow.mute('critical');
```

##### `unmute(severity?: Severity): void`

Unmutes all alerts or alerts of a specific severity.

```typescript
// Unmute all alerts
alertFlow.unmute();

// Unmute only critical alerts
alertFlow.unmute('critical');
```

##### `isMuted(): boolean`

Returns whether alerts are currently muted.

```typescript
if (alertFlow.isMuted()) {
  console.log('Alerts are muted');
}
```

##### `removeHandler(handler: AlertHandler): void`

Removes a specific handler.

```typescript
const handler = (alert) => sendEmail(alert);
alertFlow.addHandler(handler);

// Later...
alertFlow.removeHandler(handler);
```

##### `clearHandlers(): void`

Removes all registered handlers.

```typescript
alertFlow.clearHandlers();
```

##### `onError(callback: ErrorCallback): void`

Registers an error handler for handler failures.

```typescript
alertFlow.onError((error, alert) => {
  console.error('Handler failed:', error);
  metrics.increment('alert.delivery.failed');
});
```

### Severity Levels

AlertFlow supports three severity levels:

| Level | Value | Use Case |
|-------|-------|----------|
| `info` | `'info'` | Informational messages, routine operations |
| `warning` | `'warning'` | Attention needed, potential issues |
| `critical` | `'critical'` | Immediate action required, system failures |

**Example:**
```typescript
type Severity = 'info' | 'warning' | 'critical';
```

### AlertHandler Type

```typescript
type AlertHandler = (alert: Alert) => void | Promise<void>;
```

#### Alert Object

```typescript
interface Alert {
  severity: Severity;
  message: string;
  timestamp?: Date;
  metadata?: Record<string, unknown>;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `severity` | `Severity` | Alert severity level |
| `message` | `string` | Alert message content |
| `timestamp` | `Date` | When the alert was created |
| `metadata` | `Record<string, unknown>` | Additional custom data |

---

## 🔧 Advanced Configuration

### Custom Alert Metadata

Attach additional metadata to alerts:

```typescript
import { AlertFlow } from 'alertflow';

const alertFlow = new AlertFlow({
  handlers: [(alert) => {
    console.log({
      ...alert,
      environment: process.env.NODE_ENV,
      service: 'payment-api',
      version: process.env.APP_VERSION
    });
  }]
});

alertFlow.alert('warning', 'Payment processing slow', {
  transactionId: 'txn_12345',
  processingTime: 5000,
  userId: 'usr_67890'
});
```

### Multiple Instances

Create separate AlertFlow instances for different services:

```typescript
import { AlertFlow } from 'alertflow';

// Database alerts
const dbAlerts = new AlertFlow();
dbAlerts.addHandler((alert) => postToSlack('#db-alerts', alert));

// Auth service alerts
const authAlerts = new AlertFlow();
authAlerts.addHandler((alert) => postToSlack('#auth-alerts', alert));

// API alerts
const apiAlerts = new AlertFlow();
apiAlerts.addHandler((alert) => postToSlack('#api-alerts', alert));

// Usage
dbAlerts.alert('critical', 'PostgreSQL replication lag > 30s');
authAlerts.alert('warning', 'Failed login attempts spike');
apiAlerts.alert('info', 'API latency p99: 150ms');
```

### Integration with Monitoring Systems

#### Prometheus Alertmanager

```typescript
alertFlow.addHandler(async (alert) => {
  const payload = {
    alerts: [{
      status: alert.severity === 'critical' ? 'firing' : 'resolved',
      labels: {
        alertname: 'AlertFlow',
        severity: alert.severity,
        service: 'my-service'
      },
      annotations: {
        summary: alert.message,
        description: `${alert.message} at ${new Date().toISOString()}`
      }
    }]
  };

  await fetch(process.env.ALERTMANAGER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
});
```

#### PagerDuty

```typescript
import { AlertFlow } from 'alertflow';

const alertFlow = new AlertFlow();

alertFlow.addHandler(async (alert) => {
  if (alert.severity !== 'critical') return;

  await fetch('https://events.pagerduty.com/v2/enqueue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      routing_key: process.env.PAGERDUTY_ROUTING_KEY,
      event_action: 'trigger',
      payload: {
        summary: alert.message,
        severity: alert.severity,
        source: 'AlertFlow',
        timestamp: new Date().toISOString()
      }
    })
  });
});
```

---

## 💡 Best Practices

### 1. Environment-Based Configuration

```typescript
const alertFlow = new AlertFlow({
  handlers: [
    ...(process.env.NODE_ENV === 'production' 
      ? [slackHandler, emailHandler, pagerDutyHandler] 
      : [consoleHandler]
    )
  ]
});
```

### 2. Rate Limiting

Implement rate limiting to prevent alert fatigue:

```typescript
const rateLimiter = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_ALERTS_PER_WINDOW = 5;

alertFlow.addHandler((alert) => {
  const key = `${alert.severity}:${alert.message}`;
  const now = Date.now();
  
  const lastAlert = rateLimiter.get(key) || 0;
  const count = (rateLimiter.get(`${key}:count`) || 0) + 1;
  
  if (now - lastAlert < RATE_LIMIT_WINDOW && count > MAX_ALERTS_PER_WINDOW) {
    return; // Skip alert due to rate limiting
  }
  
  rateLimiter.set(key, now);
  rateLimiter.set(`${key}:count`, count);
  
  sendAlert(alert);
});
```

### 3. Structured Logging

Use structured logging for better observability:

```typescript
alertFlow.addHandler((alert) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: alert.severity,
    message: alert.message,
    service: 'my-service',
    version: process.env.APP_VERSION,
    environment: process.env.NODE_ENV,
    metadata: alert.metadata
  };
  
  console.log(JSON.stringify(logEntry));
});
```

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Related Projects

- [AlertManager](https://prometheus.io/docs/alerting/latest/alertmanager/) - Prometheus Alert Manager
- [PagerDuty](https://www.pagerduty.com/) - Incident Management
- [Opsgenie](https://www.atlassian.com/software/opsgenie) - Alerting & On-Call

---

<div align="center">
  <strong>Built with ❤️ for the developer community</strong>
  <br>
  <a href="https://github.com/alertflow/alertflow">GitHub</a> •
  <a href="https://www.npmjs.com/package/alertflow">npm</a> •
  <a href="https://twitter.com/alertflow">Twitter</a>
</div>
