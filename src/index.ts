type AlertHandler = (alert: { severity: string; message: string }) => void;
export class AlertFlow {
  private handlers: AlertHandler[] = [];
  addHandler(fn: AlertHandler) { this.handlers.push(fn); }
  alert(severity: 'info' | 'warning' | 'critical', message: string) {
    this.handlers.forEach(h => h({ severity, message }));
  }
}
export default AlertFlow;
