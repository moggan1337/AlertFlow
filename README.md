# AlertFlow 🚨

**Alert Management** - Multiple channels, severity levels.

## Features

- **📢 Channels** - Email, Slack, SMS
- **🚨 Severity** - Info, warning, critical
- **🔕 Mute** - Temporarily silence

## Installation

```bash
npm install alertflow
```

## Usage

```typescript
import { AlertFlow } from 'alertflow';

const alerts = new AlertFlow();

// Add handler
alerts.addHandler((alert) => {
  console.log(`[${alert.severity}] ${alert.message}`);
});

// Send alerts
alerts.alert('info', 'Server started');
alerts.alert('warning', 'High memory usage');
alerts.alert('critical', 'Server down!');
```

## Severity Levels

| Level | Description |
|-------|-------------|
| `info` | Informational |
| `warning` | Warning |
| `critical` | Critical |

## License

MIT
