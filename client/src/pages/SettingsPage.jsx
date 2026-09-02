import React, { useState, useEffect } from 'react';
import { Settings, Save, Building, FileText, Monitor, Sun, Moon } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: '',
    companyLogo: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    orderPrefix: 'ORD-',
    defaultUOM: 'PCS',
    defaultOrderStatus: 'Draft'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { theme, setTheme } = useTheme();
  const toast = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.success && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load system settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/settings', settings);
      if (res.success) {
        toast.success('System and company settings updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const uomOptions = ['PCS', 'Pairs', 'KG', 'Grams', 'Boxes', 'Cartons', 'Sets', 'Dozens', 'Meters', 'Custom'];

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" /> System & Branding Settings
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Configure company header branding for PDFs, order number sequences & appearance themes.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: COMPANY INFORMATION */}
        <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Building className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base text-foreground">COMPANY INFORMATION</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Company Name</label>
              <input
                type="text"
                value={settings.companyName || ''}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-muted/40 border border-border focus:border-primary rounded-xl text-sm outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Company Logo URL (Optional)</label>
              <input
                type="text"
                value={settings.companyLogo || ''}
                onChange={(e) => setSettings({ ...settings, companyLogo: e.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-muted-foreground mb-1">Business Address (Printed on PDFs)</label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Phone Number</label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Billing Email</label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: ORDER SETTINGS */}
        <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base text-foreground">ORDER DEFAULTS & SEQUENCING</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Order Number Prefix</label>
              <input
                type="text"
                value={settings.orderPrefix || ''}
                onChange={(e) => setSettings({ ...settings, orderPrefix: e.target.value })}
                placeholder="e.g. ORD-"
                className="w-full px-3.5 py-2.5 bg-muted/40 border border-border focus:border-primary rounded-xl text-sm font-mono outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Default UOM</label>
              <select
                value={settings.defaultUOM || 'PCS'}
                onChange={(e) => setSettings({ ...settings, defaultUOM: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs outline-none"
              >
                {uomOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Default Order Status</label>
              <select
                value={settings.defaultOrderStatus || 'Draft'}
                onChange={(e) => setSettings({ ...settings, defaultOrderStatus: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-muted/40 border border-border focus:border-primary rounded-xl text-xs outline-none"
              >
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: APPEARANCE */}
        <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Monitor className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base text-foreground">APPEARANCE MODE</h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                theme === 'light'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow'
                  : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sun className="w-6 h-6 text-amber-500" />
              <span className="text-xs">Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow'
                  : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Moon className="w-6 h-6 text-indigo-400" />
              <span className="text-xs">Dark Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                theme === 'system'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow'
                  : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Monitor className="w-6 h-6" />
              <span className="text-xs">System Default</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
